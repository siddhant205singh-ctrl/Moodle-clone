# KIET LMS — MERN Stack

A full-stack Learning Management System for KIET Group of Institutions, built with the MERN stack (MongoDB Atlas, Express, React, Node.js). Inspired by Moodle.

---

## Project Structure

```
moodle/
├── backend/          Express API server (port 5000)
│   ├── models/       Mongoose schemas
│   ├── routes/       API route handlers
│   ├── middleware/   JWT auth middleware
│   ├── seed/         Database seed script
│   └── server.js     Entry point
└── frontend/         Vite + React app (port 3000)
    ├── public/       Static assets (logo.svg)
    └── src/
        ├── api/      Axios instance
        ├── components/ Shared UI components
        ├── context/  AuthContext (JWT)
        └── pages/    All 12 pages
```

---

## Prerequisites

- **Node.js** 18 or later
- **MongoDB Atlas** account with a cluster (free tier works)

---

## Setup

### 1. Clone / open the project

```bash
cd moodle
```

### 2. Configure the backend

```bash
cd backend
cp .env.example .env
```

Edit `backend/.env` and fill in your values:

```
PORT=5000
MONGO_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/kiet-lms?retryWrites=true&w=majority
JWT_SECRET=any_long_random_string
```

> **MongoDB Atlas quick-start:**
> 1. Create a free cluster at https://cloud.mongodb.com
> 2. Add a database user under **Database Access**
> 3. Whitelist your IP under **Network Access** (or use `0.0.0.0/0` for dev)
> 4. Click **Connect → Drivers** and copy the connection string into `MONGO_URI`

### 3. Seed the database

```bash
# still inside backend/
npm run seed
```

This populates:
- 3 user accounts (see credentials below)
- 28 categories (full KIET department tree)
- 12 courses with topics and activities
- Grade records, calendar events, ebooks

### 4. Start the backend

```bash
npm run dev
```

Server starts at **http://localhost:5000**

### 5. Start the frontend

Open a new terminal:

```bash
cd frontend
npm run dev
```

App opens at **http://localhost:3000**

---

## Demo Accounts

| Username | Password | Role    |
|----------|----------|---------|
| student  | kiet123  | Student |
| faculty  | kiet123  | Faculty |
| admin    | kiet123  | Admin   |

---

## API Endpoints

| Method | Endpoint                    | Auth | Description                  |
|--------|-----------------------------|------|------------------------------|
| POST   | /api/auth/login             | No   | Login, returns JWT           |
| POST   | /api/auth/logout            | No   | Logout (stateless)           |
| GET    | /api/users/me               | Yes  | Current user profile         |
| PUT    | /api/users/me               | Yes  | Update profile               |
| GET    | /api/categories             | No   | Full category tree           |
| GET    | /api/categories/:id         | No   | Category + children + courses|
| GET    | /api/courses                | No   | Paginated course list        |
| GET    | /api/courses/:id            | No   | Course detail (slug or id)   |
| GET    | /api/courses/search?q=      | No   | Search courses               |
| GET    | /api/grades/me              | Yes  | Current user's grades        |
| GET    | /api/calendar               | No   | All calendar events          |
| GET    | /api/ebooks                 | No   | Ebook catalog                |

---

## Pages

| Route              | Page               | Auth |
|--------------------|--------------------|------|
| /                  | Home               | No   |
| /login             | Login              | No   |
| /forgot            | Forgot Password    | No   |
| /courses           | Browse Categories  | No   |
| /category/:id      | Category Detail    | No   |
| /course/:id        | Course Detail      | No   |
| /search?q=         | Search Results     | No   |
| /calendar          | Calendar           | No   |
| /ebook             | e-Book Bank        | No   |
| /dashboard         | Dashboard          | Yes  |
| /profile           | User Profile       | Yes  |
| /grades            | Grades             | Yes  |

---

## Tech Stack

| Layer     | Technology                              |
|-----------|-----------------------------------------|
| Frontend  | React 18 + Vite + React Router v6       |
| Styling   | Tailwind CSS                            |
| Auth state| Context API + JWT (localStorage)        |
| HTTP      | Axios (proxied to backend in dev)       |
| Backend   | Express 4                               |
| Database  | MongoDB Atlas via Mongoose              |
| Auth      | bcryptjs + jsonwebtoken                 |
