
import "dotenv/config";
import express from "express";
import cors from "cors";
import { pool } from "./db.js";

const app = express();
const PORT = Number(process.env.PORT || 5001);

// ==================================================
// MIDDLEWARE
// ==================================================

app.use(cors());
app.use(express.json({ limit: "20kb" }));

app.use((req, res, next) => {
  console.log(`${req.method} ${req.originalUrl}`);
  next();
});

// ==================================================
// ENROLLMENT FIELD CONFIGURATION
// Frontend camelCase fields -> PostgreSQL columns
// ==================================================

const FIELDS = {
  name: {
    column: "name",
    required: true,
    max: 100,
  },
  email: {
    column: "email",
    required: true,
    max: 150,
    email: true,
  },
  phone: {
    column: "phone",
    required: true,
    max: 20,
  },
  qualification: {
    column: "qualification",
    required: true,
    max: 100,
  },
  college: {
    column: "college",
    required: false,
    max: 150,
  },
  course: {
    column: "course",
    required: true,
    max: 100,
  },
  trainingMode: {
    column: "training_mode",
    required: true,
    max: 30,
  },
  preferredBatch: {
    column: "preferred_batch",
    required: true,
    max: 80,
  },
  experienceLevel: {
    column: "experience_level",
    required: true,
    max: 80,
  },
  message: {
    column: "message",
    required: false,
    max: 1000,
  },
};

const FIELD_KEYS = Object.keys(FIELDS);

// ==================================================
// VALIDATION HELPERS
// ==================================================

function normalizeField(key, value) {
  const config = FIELDS[key];

  if (value === undefined || value === null) {
    if (config.required) {
      return { error: `${key} is required.` };
    }

    return { value: null };
  }

  if (typeof value !== "string") {
    return { error: `${key} must be a string.` };
  }

  let normalized = value.trim();

  if (!normalized) {
    if (config.required) {
      return { error: `${key} is required.` };
    }

    return { value: null };
  }

  if (normalized.length > config.max) {
    return {
      error: `${key} must be ${config.max} characters or fewer.`,
    };
  }

  if (config.email) {
    normalized = normalized.toLowerCase();

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized)) {
      return { error: "Please enter a valid email address." };
    }
  }

  return { value: normalized };
}

// POST and PUT require the complete set of editable fields.
function validateFullEnrollment(body) {
  if (
    !body ||
    typeof body !== "object" ||
    Array.isArray(body)
  ) {
    return { error: "A valid JSON object is required." };
  }

  for (const key of Object.keys(body)) {
    if (!Object.hasOwn(FIELDS, key)) {
      return { error: `Unknown field: ${key}` };
    }
  }

  const values = {};

  for (const key of FIELD_KEYS) {
    const result = normalizeField(key, body[key]);

    if (result.error) {
      return { error: result.error };
    }

    values[key] = result.value;
  }

  return { values };
}

// PATCH validates only the fields actually supplied.
function validatePartialEnrollment(body) {
  if (
    !body ||
    typeof body !== "object" ||
    Array.isArray(body)
  ) {
    return { error: "A valid JSON object is required." };
  }

  const keys = Object.keys(body);

  if (keys.length === 0) {
    return { error: "Provide at least one field to update." };
  }

  const values = {};

  for (const key of keys) {
    if (!Object.hasOwn(FIELDS, key)) {
      return { error: `Unknown field: ${key}` };
    }

    const result = normalizeField(key, body[key]);

    if (result.error) {
      return { error: result.error };
    }

    values[key] = result.value;
  }

  return { values };
}

// Validate IDs used by GET, PUT, PATCH and DELETE.
function validateStudentId(req, res, next) {
  const id = Number(req.params.id);

  if (!Number.isSafeInteger(id) || id < 1) {
    return res.status(400).json({
      message: "Invalid student ID.",
    });
  }

  req.studentId = id;
  next();
}

// Shared database error handler.
function handleDatabaseError(error, res, operation) {
  console.error(`${operation}:`, error.message);

  if (error.code === "23505") {
    return res.status(409).json({
      message: "A student with this email already exists.",
    });
  }

  if (error.code === "23502" || error.code === "23514") {
    return res.status(400).json({
      message: "Some enrollment information is invalid or missing.",
    });
  }

  return res.status(500).json({
    message: `${operation}. Please try again.`,
  });
}

// ==================================================
// HEALTH CHECKS
// ==================================================

// GET /health
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "running",
    message: "Oktacon Academy API is working.",
  });
});

// GET /health/db
app.get("/health/db", async (req, res) => {
  try {
    await pool.query("SELECT 1");

    res.status(200).json({
      status: "connected",
      message: "PostgreSQL connection successful.",
    });
  } catch (error) {
    console.error("Database health check:", error.message);

    res.status(500).json({
      message: "PostgreSQL connection failed.",
    });
  }
});

// ==================================================
// 1. GET ALL STUDENTS
// GET /api/students
// ==================================================

app.get("/api/students", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM students ORDER BY id DESC"
    );

    return res.status(200).json(result.rows);
  } catch (error) {
    console.error("GET all students:", error.message);

    return res.status(500).json({
      message: "Could not fetch enrollment records.",
    });
  }
});

// ==================================================
// 2. GET ONE STUDENT
// GET /api/students/:id
// Required by the frontend when editing a record.
// ==================================================

app.get(
  "/api/students/:id",
  validateStudentId,
  async (req, res) => {
    try {
      const result = await pool.query(
        "SELECT * FROM students WHERE id = $1",
        [req.studentId]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          message: "Student not found.",
        });
      }

      return res.status(200).json(result.rows[0]);
    } catch (error) {
      console.error("GET student by ID:", error.message);

      return res.status(500).json({
        message: "Could not fetch student details.",
      });
    }
  }
);

// ==================================================
// 3. POST - CREATE ENROLLMENT
// POST /api/students
// ==================================================

app.post("/api/students", async (req, res) => {
  const validation = validateFullEnrollment(req.body);

  if (validation.error) {
    return res.status(400).json({
      message: validation.error,
    });
  }

  const values = validation.values;

  try {
    const columns = FIELD_KEYS.map(
      (key) => FIELDS[key].column
    );

    const placeholders = FIELD_KEYS.map(
      (_, index) => `$${index + 1}`
    );

    const parameters = FIELD_KEYS.map(
      (key) => values[key]
    );

    const query = `
      INSERT INTO students (${columns.join(", ")})
      VALUES (${placeholders.join(", ")})
      RETURNING *
    `;

    const result = await pool.query(query, parameters);

    return res.status(201).json(result.rows[0]);
  } catch (error) {
    return handleDatabaseError(
      error,
      res,
      "Could not create enrollment"
    );
  }
});

// ==================================================
// 4. PUT - REPLACE ALL EDITABLE FIELDS
// PUT /api/students/:id
// ==================================================

app.put(
  "/api/students/:id",
  validateStudentId,
  async (req, res) => {
    const validation = validateFullEnrollment(req.body);

    if (validation.error) {
      return res.status(400).json({
        message: validation.error,
      });
    }

    const values = validation.values;

    try {
      const assignments = FIELD_KEYS.map(
        (key, index) =>
          `${FIELDS[key].column} = $${index + 1}`
      );

      const parameters = [
        ...FIELD_KEYS.map((key) => values[key]),
        req.studentId,
      ];

      const query = `
        UPDATE students
        SET ${assignments.join(", ")}
        WHERE id = $${parameters.length}
        RETURNING *
      `;

      const result = await pool.query(query, parameters);

      if (result.rows.length === 0) {
        return res.status(404).json({
          message: "Student not found.",
        });
      }

      return res.status(200).json(result.rows[0]);
    } catch (error) {
      return handleDatabaseError(
        error,
        res,
        "Could not replace enrollment"
      );
    }
  }
);

// ==================================================
// 5. PATCH - UPDATE ONLY PROVIDED FIELDS
// PATCH /api/students/:id
// ==================================================

app.patch(
  "/api/students/:id",
  validateStudentId,
  async (req, res) => {
    const validation = validatePartialEnrollment(req.body);

    if (validation.error) {
      return res.status(400).json({
        message: validation.error,
      });
    }

    const values = validation.values;
    const keys = Object.keys(values);

    try {
      const assignments = keys.map(
        (key, index) =>
          `${FIELDS[key].column} = $${index + 1}`
      );

      const parameters = [
        ...keys.map((key) => values[key]),
        req.studentId,
      ];

      const query = `
        UPDATE students
        SET ${assignments.join(", ")}
        WHERE id = $${parameters.length}
        RETURNING *
      `;

      const result = await pool.query(query, parameters);

      if (result.rows.length === 0) {
        return res.status(404).json({
          message: "Student not found.",
        });
      }

      return res.status(200).json(result.rows[0]);
    } catch (error) {
      return handleDatabaseError(
        error,
        res,
        "Could not update enrollment"
      );
    }
  }
);

// ==================================================
// 6. DELETE - REMOVE ENROLLMENT
// DELETE /api/students/:id
// ==================================================

app.delete(
  "/api/students/:id",
  validateStudentId,
  async (req, res) => {
    try {
      const result = await pool.query(
        "DELETE FROM students WHERE id = $1 RETURNING id",
        [req.studentId]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          message: "Student not found.",
        });
      }

      return res.status(200).json({
        message: "Enrollment deleted successfully.",
        id: result.rows[0].id,
      });
    } catch (error) {
      console.error("DELETE student:", error.message);

      return res.status(500).json({
        message: "Could not delete enrollment.",
      });
    }
  }
);

// ==================================================
// 404 HANDLER - MUST ALWAYS BE LAST
// ==================================================

app.use((req, res) => {
  res.status(404).json({
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
});

// ==================================================
// START SERVER
// ==================================================

const server = app.listen(PORT, () => {
  console.log(`Backend running at http://localhost:${PORT}`);
});

server.on("error", (error) => {
  console.error("Backend startup error:", error.message);

  if (error.code === "EADDRINUSE") {
    console.error(`Port ${PORT} is already in use.`);
  }
});
