import { useEffect, useState } from "react";
import "./App.css";

const API_URL = "http://localhost:5001/api/students";

const initialForm = {
  name: "",
  email: "",
  phone: "",
  qualification: "",
  college: "",
  course: "",
  trainingMode: "",
  preferredBatch: "",
  experienceLevel: "",
  message: "",
};

// Convert a PostgreSQL row into the form's field names.
function studentToForm(student) {
  return {
    name: student.name ?? "",
    email: student.email ?? "",
    phone: student.phone ?? "",
    qualification: student.qualification ?? "",
    college: student.college ?? "",
    course: student.course ?? "",
    trainingMode: student.training_mode ?? "",
    preferredBatch: student.preferred_batch ?? "",
    experienceLevel: student.experience_level ?? "",
    message: student.message ?? "",
  };
}

// Read JSON responses safely, including backend error responses.
async function readApiResponse(response) {
  const text = await response.text();
  let data = {};

  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    data = {};
  }

  if (!response.ok) {
    throw new Error(
      data.message || `Request failed with status ${response.status}`
    );
  }

  return data;
}

function App() {
  const [students, setStudents] = useState([]);
  const [form, setForm] = useState(initialForm);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [loadingEditId, setLoadingEditId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const [editingId, setEditingId] = useState(null);
  const [editMethod, setEditMethod] = useState("PUT");
  const [originalForm, setOriginalForm] = useState(null);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // GET: Load all enrollment records.
  async function loadStudents() {
    setLoading(true);

    try {
      const response = await fetch(API_URL);
      const data = await readApiResponse(response);

      if (!Array.isArray(data)) {
        throw new Error("The API did not return a student list.");
      }

      setStudents(data);
      setError("");
    } catch (err) {
      setError(
        err.message === "Failed to fetch"
          ? "Cannot connect to the backend. Check that the server is running on port 5001."
          : err.message
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadStudents();
  }, []);

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));

    setError("");
    setSuccess("");
  }

  function cancelEdit() {
    setEditingId(null);
    setEditMethod("PUT");
    setOriginalForm(null);
    setForm(initialForm);
    setError("");
    setSuccess("");
  }

  // GET by ID: fetch the latest record before editing.
  async function handleEdit(student, method) {
    setError("");
    setSuccess("");
    setLoadingEditId(student.id);

    try {
      const response = await fetch(`${API_URL}/${student.id}`);
      const latestStudent = await readApiResponse(response);

      const values = studentToForm(latestStudent);

      setForm(values);
      setOriginalForm({ ...values });
      setEditingId(latestStudent.id);
      setEditMethod(method);

      document.getElementById("enrollment-form")?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    } catch (err) {
      setError(
        err.message === "Failed to fetch"
          ? "Cannot connect to the backend."
          : err.message
      );
    } finally {
      setLoadingEditId(null);
    }
  }

  // POST creates a record.
  // PUT replaces all editable fields.
  // PATCH sends only the fields changed since editing began.
  async function handleSubmit(event) {
    event.preventDefault();

    setSaving(true);
    setError("");
    setSuccess("");

    const isEditing = editingId !== null;
    const method = isEditing ? editMethod : "POST";

    let payload = { ...form };

    if (method === "PATCH") {
      payload = Object.fromEntries(
        Object.entries(form).filter(
          ([key, value]) => value !== originalForm?.[key]
        )
      );

      if (Object.keys(payload).length === 0) {
        setError("No changes detected. Edit at least one field.");
        setSaving(false);
        return;
      }
    }

    const endpoint = isEditing
      ? `${API_URL}/${editingId}`
      : API_URL;

    try {
      const response = await fetch(endpoint, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const savedStudent = await readApiResponse(response);

      if (method === "POST") {
        setStudents((previous) => [
          savedStudent,
          ...previous.filter(
            (student) => student.id !== savedStudent.id
          ),
        ]);

        setSuccess("Enrollment submitted successfully.");
      } else {
        setStudents((previous) =>
          previous.map((student) =>
            student.id === savedStudent.id
              ? savedStudent
              : student
          )
        );

        setSuccess(
          method === "PUT"
            ? "Enrollment completely updated using PUT."
            : "Selected fields updated successfully using PATCH."
        );
      }

      setForm(initialForm);
      setEditingId(null);
      setEditMethod("PUT");
      setOriginalForm(null);
    } catch (err) {
      setError(
        err.message === "Failed to fetch"
          ? "Cannot connect to the backend. Check your API server."
          : err.message
      );
    } finally {
      setSaving(false);
    }
  }

  // DELETE: remove the enrollment from PostgreSQL.
  async function handleDelete(student) {
    const confirmed = window.confirm(
      `Delete the enrollment for ${student.name}? This action cannot be undone.`
    );

    if (!confirmed) return;

    setDeletingId(student.id);
    setError("");
    setSuccess("");

    try {
      const response = await fetch(`${API_URL}/${student.id}`, {
        method: "DELETE",
      });

      await readApiResponse(response);

      setStudents((previous) =>
        previous.filter((item) => item.id !== student.id)
      );

      if (editingId === student.id) {
        cancelEdit();
      }

      setSuccess(`${student.name}'s enrollment was deleted.`);
    } catch (err) {
      setError(
        err.message === "Failed to fetch"
          ? "Cannot connect to the backend."
          : err.message
      );
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <main className="enrollment-page">
      <div className="page-container">
        <header className="topbar">
          <a href="#home" className="brand">
            <span className="brand-mark">OA</span>

            <span className="brand-copy">
              <strong>Oktacon Academy</strong>
              <small>INDUSTRY IT TRAINING</small>
            </span>
          </a>

          <span className="admission-badge">
            <span className="status-dot" />
            Enrollment Open
          </span>
        </header>

        <section className="hero" id="home">
          <div className="hero-copy">
            <p className="eyebrow">
              <span className="eyebrow-line" />
              CAREER-FOCUSED TRAINING
            </p>

            <h1>
              Build skills.
              <br />
              Build projects.
              <br />
              <span>Build your future.</span>
            </h1>

            <p className="hero-description">
              Develop practical skills with structured training,
              real-world projects and career preparation.
            </p>

            <div className="hero-benefits">
              <span>
                <span className="benefit-check">✓</span>
                Practical projects
              </span>

              <span>
                <span className="benefit-check">✓</span>
                Industry-focused learning
              </span>

              <span>
                <span className="benefit-check">✓</span>
                Career preparation
              </span>
            </div>
          </div>

          <div className="hero-panel">
            <div className="panel-icon">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.7"
                aria-hidden="true"
              >
                <rect x="3" y="4" width="18" height="14" rx="2" />
                <path d="M8 22h8M12 18v4M8 10l2 2-2 2M13 14h3" />
              </svg>
            </div>

            <p className="panel-label">YOUR NEXT STEP</p>
            <h2>Full Stack Development</h2>

            <p className="panel-description">
              Learn to build frontend applications, backend APIs and
              database-powered software.
            </p>

            <div className="learning-path">
              <div className="path-item">
                <span className="path-number">01</span>
                <div>
                  <strong>Frontend</strong>
                  <small>React, JavaScript and UI</small>
                </div>
              </div>

              <div className="path-item">
                <span className="path-number">02</span>
                <div>
                  <strong>Backend</strong>
                  <small>APIs and server-side logic</small>
                </div>
              </div>

              <div className="path-item">
                <span className="path-number">03</span>
                <div>
                  <strong>Database</strong>
                  <small>SQL and PostgreSQL</small>
                </div>
              </div>
            </div>

            <div className="panel-footer">
              Learn. Intern. Get Hired.
            </div>
          </div>
        </section>

        <section className="enrollment-layout">
          <div className="form-card" id="enrollment-form">
            <div className="section-heading">
              <div>
                <p className="section-label">
                  {editingId !== null
                    ? `EDIT ENROLLMENT · ${editMethod}`
                    : "STUDENT ENROLLMENT"}
                </p>

                <h2>
                  {editingId !== null
                    ? "Update student details"
                    : "Let's get to know you"}
                </h2>

                <p className="section-description">
                  {editingId !== null
                    ? editMethod === "PUT"
                      ? "PUT replaces all editable enrollment fields."
                      : "PATCH submits only the fields you have changed."
                    : "Complete the form to register your training interest."}
                </p>
              </div>

              <span className="form-icon" aria-hidden="true">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.7"
                >
                  <circle cx="9" cy="8" r="4" />
                  <path d="M2.5 21v-2a6.5 6.5 0 0 1 13 0v2M19 8v6M16 11h6" />
                </svg>
              </span>
            </div>

            <div className="form-progress">
              <span className="progress-fill" />
            </div>

            <p className="form-hint">
              Required fields are marked *
            </p>

            {error && (
              <div className="notice notice-error" role="alert">
                <span className="notice-icon">!</span>
                <p>{error}</p>
              </div>
            )}

            {success && (
              <div className="notice notice-success" role="status">
                <span className="notice-icon">✓</span>
                <p>{success}</p>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="form-section-title">
                <span>01</span>
                <h3>Personal information</h3>
              </div>

              <div className="field-grid">
                <div className="field">
                  <label htmlFor="name">
                    Full name <span>*</span>
                  </label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    autoComplete="name"
                    maxLength={100}
                    placeholder="Enter your full name"
                    value={form.name}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="field">
                  <label htmlFor="phone">
                    Mobile number <span>*</span>
                  </label>
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    autoComplete="tel"
                    maxLength={20}
                    placeholder="Enter mobile number"
                    value={form.phone}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="field field-full">
                  <label htmlFor="email">
                    Email address <span>*</span>
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    maxLength={150}
                    placeholder="you@example.com"
                    value={form.email}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="field">
                  <label htmlFor="qualification">
                    Highest qualification <span>*</span>
                  </label>
                  <select
                    id="qualification"
                    name="qualification"
                    value={form.qualification}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select qualification</option>
                    <option value="12th">12th / HSC</option>
                    <option value="Diploma">Diploma</option>
                    <option value="Undergraduate">Undergraduate</option>
                    <option value="Graduate">Graduate</option>
                    <option value="Postgraduate">Postgraduate</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className="field">
                  <label htmlFor="college">College / Institute</label>
                  <input
                    id="college"
                    name="college"
                    type="text"
                    maxLength={150}
                    placeholder="College name (optional)"
                    value={form.college}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="form-divider" />

              <div className="form-section-title">
                <span>02</span>
                <h3>Training preferences</h3>
              </div>

              <div className="field-grid">
                <div className="field field-full">
                  <label htmlFor="course">
                    Training program <span>*</span>
                  </label>
                  <select
                    id="course"
                    name="course"
                    value={form.course}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Choose a training program</option>
                    <option value="Full Stack Development (Java + React)">
                      Full Stack Development — Java + React
                    </option>
                    <option value="MERN Stack Development">
                      Full Stack Development — MERN
                    </option>
                    <option value="Frontend Development (React)">
                      Frontend Development — React
                    </option>
                    <option value="Backend Development">
                      Backend Development
                    </option>
                    <option value="SQL and PostgreSQL">
                      SQL and PostgreSQL
                    </option>
                  </select>
                </div>

                <div className="field">
                  <label htmlFor="trainingMode">
                    Learning mode <span>*</span>
                  </label>
                  <select
                    id="trainingMode"
                    name="trainingMode"
                    value={form.trainingMode}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select mode</option>
                    <option value="Classroom">Classroom</option>
                    <option value="Online">Online</option>
                    <option value="Hybrid">Hybrid</option>
                  </select>
                </div>

                <div className="field">
                  <label htmlFor="preferredBatch">
                    Preferred batch <span>*</span>
                  </label>
                  <select
                    id="preferredBatch"
                    name="preferredBatch"
                    value={form.preferredBatch}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select batch</option>
                    <option value="Weekday Morning">Weekday — Morning</option>
                    <option value="Weekday Evening">Weekday — Evening</option>
                    <option value="Weekend">Weekend</option>
                    <option value="Flexible">Flexible / To be discussed</option>
                  </select>
                </div>

                <div className="field field-full">
                  <label htmlFor="experienceLevel">
                    Current programming level <span>*</span>
                  </label>
                  <select
                    id="experienceLevel"
                    name="experienceLevel"
                    value={form.experienceLevel}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select current level</option>
                    <option value="Beginner">Beginner</option>
                    <option value="Basic HTML CSS JavaScript">
                      Basic HTML, CSS and JavaScript
                    </option>
                    <option value="Built Projects">
                      Have built projects
                    </option>
                    <option value="Working Professional">
                      Working professional
                    </option>
                  </select>
                </div>

                <div className="field field-full">
                  <label htmlFor="message">Your learning goals</label>
                  <textarea
                    id="message"
                    name="message"
                    rows="4"
                    maxLength={1000}
                    placeholder="What would you like to learn?"
                    value={form.message}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="submit-area">
                <button
                  className="submit-button"
                  type="submit"
                  disabled={saving}
                >
                  {saving ? (
                    <>
                      <span className="button-spinner" />
                      Processing...
                    </>
                  ) : editingId !== null ? (
                    <>
                      {editMethod === "PUT"
                        ? "Save Full Update (PUT)"
                        : "Save Partial Update (PATCH)"}
                      <span>→</span>
                    </>
                  ) : (
                    <>
                      Submit Enrollment
                      <span>→</span>
                    </>
                  )}
                </button>

                {editingId !== null && (
                  <button
                    type="button"
                    className="cancel-edit-button"
                    onClick={cancelEdit}
                    disabled={saving}
                  >
                    Cancel Editing
                  </button>
                )}

                <p className="privacy-note">
                  Your details are saved through the backend to PostgreSQL.
                  Submission does not guarantee admission or employment.
                </p>
              </div>
            </form>
          </div>

          <aside className="info-column">
            <div className="info-card">
              <p className="section-label">YOUR LEARNING JOURNEY</p>
              <h2>Learn by building</h2>

              <p className="info-intro">
                Focus on concepts and apply them to practical development work.
              </p>

              <div className="journey-item">
                <span className="journey-icon">01</span>
                <div>
                  <h3>Learn the fundamentals</h3>
                  <p>Build a clear understanding of development concepts.</p>
                </div>
              </div>

              <div className="journey-item">
                <span className="journey-icon">02</span>
                <div>
                  <h3>Build practical projects</h3>
                  <p>Practice frontend, backend and database integration.</p>
                </div>
              </div>

              <div className="journey-item">
                <span className="journey-icon">03</span>
                <div>
                  <h3>Prepare for opportunities</h3>
                  <p>Develop your portfolio and prepare for interviews.</p>
                </div>
              </div>
            </div>

            <div className="next-steps-card">
              <div className="next-steps-icon">✦</div>
              <h3>What happens next?</h3>

              <ol>
                <li>Submit your enrollment form.</li>
                <li>Your details are saved for review.</li>
                <li>Discuss the schedule and next steps.</li>
              </ol>

              <div className="tagline">Learn. Intern. Get Hired.</div>
            </div>
          </aside>
        </section>

        <section className="registered-section">
          <div className="registered-heading">
            <div>
              <p className="section-label">DATABASE MANAGEMENT</p>
              <h2>Student registrations</h2>
              <p className="section-description">
                Manage enrollment records using GET, PUT, PATCH and DELETE.
              </p>
            </div>

            <div className="student-count">
              <strong>{students.length}</strong>
              <span>Records</span>
            </div>
          </div>

          {loading ? (
            <div className="empty-state">
              <span className="loading-spinner" />
              <p>Loading enrollment records...</p>
            </div>
          ) : students.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">＋</div>
              <h3>No registrations yet</h3>
              <p>Submit the form to add your first enrollment record.</p>
            </div>
          ) : (
            <div className="registered-grid">
              {students.map((student) => (
                <article className="registered-card" key={student.id}>
                  <div className="registered-card-top">
                    <div className="avatar">
                      {(student.name || "S")
                        .trim()
                        .charAt(0)
                        .toUpperCase()}
                    </div>

                    <div className="registered-person">
                      <h3>{student.name}</h3>
                      <p>{student.email}</p>
                    </div>
                  </div>

                  <div className="record-details">
                    <div>
                      <span>PROGRAM</span>
                      <strong>{student.course || "Not specified"}</strong>
                    </div>

                    <div>
                      <span>MOBILE</span>
                      <strong>{student.phone || "Not provided"}</strong>
                    </div>

                    <div>
                      <span>QUALIFICATION</span>
                      <strong>
                        {student.qualification || "Not provided"}
                      </strong>
                    </div>

                    <div>
                      <span>LEARNING MODE</span>
                      <strong>
                        {student.training_mode || "Not specified"}
                      </strong>
                    </div>

                    <div>
                      <span>PREFERRED BATCH</span>
                      <strong>
                        {student.preferred_batch || "Not specified"}
                      </strong>
                    </div>
                  </div>

                  <div className="record-footer">
                    <span>Enrollment #{student.id}</span>

                    <span className="record-status">
                      <span className="status-dot" />
                      Saved
                    </span>
                  </div>

                  <div className="record-actions">
                    <button
                      type="button"
                      className="record-action-btn record-action-edit"
                      onClick={() => handleEdit(student, "PUT")}
                      disabled={
                        loadingEditId !== null ||
                        deletingId === student.id
                      }
                    >
                      {loadingEditId === student.id
                        ? "Loading..."
                        : "Edit (PUT)"}
                    </button>

                    <button
                      type="button"
                      className="record-action-btn record-action-patch"
                      onClick={() => handleEdit(student, "PATCH")}
                      disabled={
                        loadingEditId !== null ||
                        deletingId === student.id
                      }
                    >
                      Partial Edit (PATCH)
                    </button>

                    <button
                      type="button"
                      className="record-action-btn record-action-delete"
                      onClick={() => handleDelete(student)}
                      disabled={
                        deletingId !== null ||
                        loadingEditId === student.id
                      }
                    >
                      {deletingId === student.id
                        ? "Deleting..."
                        : "Delete"}
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        <footer className="page-footer">
          <span>© {new Date().getFullYear()} Oktacon Academy</span>
          <span>Learn. Intern. Get Hired.</span>
        </footer>
      </div>
    </main>
  );
}

export default App;