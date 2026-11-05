# User Management CRUD (JavaScript)

A basic User Management CRUD application built with Next.js App Router, plain JavaScript, Drizzle ORM and PostgreSQL.

## Features

- Add a user
- View all users
- View one user through the API
- Edit a user
- Delete a user
- Search by name, email or phone
- Input validation and duplicate-email protection
- No login, registration, JWT or role management

## Requirements

- Node.js 20.9 or newer
- PostgreSQL
- npm

## 1. Install dependencies

```bash
npm install
```

## 2. Create the PostgreSQL database

Run this in psql or your PostgreSQL GUI:

```sql
CREATE DATABASE user_management_db;
```

## 3. Configure the database connection

Copy `.env.example` to `.env` and update the PostgreSQL username and password:

```env
DATABASE_URL=postgresql://postgres:your_password@localhost:5432/user_management_db
DATABASE_SSL=false
```

Do not commit `.env` to Git.

## 4. Generate and run migrations

```bash
npm run db:generate
npm run db:migrate
```

To inspect the database with Drizzle Studio:

```bash
npm run db:studio
```

## 5. Start the app

```bash
npm run dev
```

Open <http://localhost:3000>.

## REST API

Base URL: `/api/users`

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/users` | List users; optional `?search=term` |
| POST | `/api/users` | Create a user |
| GET | `/api/users/:id` | Get one user |
| PUT | `/api/users/:id` | Replace all editable fields |
| PATCH | `/api/users/:id` | Update supplied fields |
| DELETE | `/api/users/:id` | Delete a user |

Example POST body:

```json
{
  "name": "Rahul Sharma",
  "email": "rahul@example.com",
  "phone": "9876543210",
  "age": 28
}
```

`phone` and `age` are optional. Use `null` to clear either field.

## Project structure

```text
src/
├── app/
│   ├── api/
│   │   └── users/
│   │       ├── route.js
│   │       └── [id]/route.js
│   ├── globals.css
│   ├── layout.js
│   └── page.js
├── components/
│   ├── UserForm.js
│   └── UserTable.js
├── db/
│   ├── index.js
│   └── schema.js
└── lib/
    └── validations/user.js
```

## Important security note

This project intentionally has no authentication. Its read and write APIs are accessible to anyone who can reach the deployed application. Keep it local or restrict access before using real or sensitive user data.
