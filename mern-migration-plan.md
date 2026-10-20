# MERN Stack Migration Plan — KIET LMS (Moodle Clone)

## Top-Level Overview

Migrate the existing fully-static HTML/CSS/JS Moodle clone into a full-stack MERN application.

- **`/frontend`** — React 18 app (Vite), React Router v6, Context API for auth, Tailwind CSS
- **`/backend`** — Express 4 API server, MongoDB via Mongoose, JWT authentication
- **Port layout** — backend: `5000`, frontend: `3000`
- **Data** — All existing mock data (12 courses, 22+ categories, 3 users) seeded into MongoDB
- **Feature parity** — All 12 pages migrated; no new features added

The existing static HTML files at the root will be **removed** once the React app is complete (Sub-Task 13).
MongoDB Atlas (cloud) is used instead of a local MongoDB instance — a connection string will be provided via `.env`.

---

## Architecture Diagram (described)

```
Browser (port 3000)
  └── React App (Vite + React Router v6)
        ├── AuthContext (JWT stored in localStorage)
        ├── Pages: Home, Login, Dashboard, Courses, Category,
        │         Course, Profile, Calendar, Grades, Search,
        │         ForgotPassword, EBook
        └── fetch/axios → Express API (port 5000)

Express API (port 5000)
  ├── POST   /api/auth/login
  ├── POST   /api/auth/logout
  ├── GET    /api/users/me          (protected)
  ├── PUT    /api/users/me          (protected)
  ├── GET    /api/categories
  ├── GET    /api/categories/:id
  ├── GET    /api/courses
  ├── GET    /api/courses/:id
  ├── GET    /api/courses/search?q=
  ├── GET    /api/grades/me         (protected)
  ├── GET    /api/calendar
  └── GET    /api/ebooks

MongoDB (Mongoose)
  ├── users       (username, passwordHash, role, profile fields)
  ├── categories  (name, parent, children refs)
  ├── courses     (title, category, topics, enrolledUsers)
  ├── grades      (user ref, course ref, score)
  ├── events      (title, date, course ref, type)
  └── ebooks      (title, author, category, url)
```

---

## Sub-Tasks

---

### Sub-Task 1 — Backend: Project Scaffold & Configuration

**Status:** `[ ] pending`

**Intent**
Create the `/backend` folder with Express, Mongoose, JWT dependencies, folder structure, and environment config. This is the foundation every other backend sub-task builds on.

**Expected Outcomes**
- `backend/package.json` with all required dependencies
- `backend/server.js` entry point starts without error
- `backend/.env.example` documents required environment variables
- Folder structure: `models/`, `routes/`, `middleware/`, `seed/`

**Todo List**
1. Create `backend/` folder
2. Create `backend/package.json` with dependencies: `express`, `mongoose`, `bcryptjs`, `jsonwebtoken`, `dotenv`, `cors`; devDependencies: `nodemon`
3. Create `backend/.env.example` with `PORT=5000`, `MONGO_URI=`, `JWT_SECRET=`
4. Create `backend/.env` (local, gitignored) with working values
5. Create `backend/server.js` — imports express, mongoose, cors, dotenv; mounts routes; listens on PORT
6. Create empty placeholder files: `models/User.js`, `models/Category.js`, `models/Course.js`, `models/Grade.js`, `models/Event.js`, `models/EBook.js`
7. Create empty route files: `routes/auth.js`, `routes/users.js`, `routes/categories.js`, `routes/courses.js`, `routes/grades.js`, `routes/calendar.js`, `routes/ebooks.js`
8. Create `middleware/auth.js` — JWT verification middleware
9. Create `backend/.gitignore` ignoring `node_modules`, `.env`

**Relevant Context**
- Source of all data to be used: `js/data.js` (mock users, categories, courses)
- Demo credentials: student/kiet123, faculty/kiet123, admin/kiet123
- JWT secret stored in `.env`

---

### Sub-Task 2 — Backend: Mongoose Models

**Status:** `[ ] pending`

**Intent**
Define all six Mongoose schemas that map the existing mock data structures into MongoDB documents.

**Expected Outcomes**
- All 6 model files export a compiled Mongoose model
- Schema fields mirror the shape of data in `js/data.js`
- `User` model stores hashed passwords

**Todo List**
1. `models/User.js` — fields: `username` (unique), `passwordHash`, `role` (student/faculty/admin), `name`, `department`, `studentId`, `avatar`, `enrolledCourses` (array of Course refs)
2. `models/Category.js` — fields: `name`, `slug`, `parent` (self-ref ObjectId, nullable), `children` (array of self-refs), `courseCount`
3. `models/Course.js` — fields: `title`, `code`, `category` (Category ref), `instructor`, `description`, `thumbnail`, `color` (gradient string), `topics` (array: `{title, activities: [{type, title, url}]}`), `enrolledUsers` (array of User refs)
4. `models/Grade.js` — fields: `user` (User ref), `course` (Course ref), `score`, `grade` (letter), `semester`
5. `models/Event.js` — fields: `title`, `date`, `course` (Course ref, nullable), `type` (assignment/quiz/lecture/exam), `description`
6. `models/EBook.js` — fields: `title`, `author`, `category`, `isbn`, `url`, `thumbnail`

**Relevant Context**
- Course topics structure visible in `js/data.js` → `courses` array → `topics` property
- Category tree nesting in `js/data.js` → `categories` array
- Enrollment data: `js/data.js` → `users[].enrolledCourses`

---

### Sub-Task 3 — Backend: Seed Script

**Status:** `[ ] pending`

**Intent**
Create a one-time seed script that populates MongoDB with all mock data from `js/data.js` so the application is immediately runnable without manual data entry.

**Expected Outcomes**
- Running `node backend/seed/seed.js` populates all collections
- 3 user accounts (student, faculty, admin) with bcrypt-hashed passwords
- 22+ categories in correct parent/child hierarchy
- 12 courses linked to correct categories and enrolled users
- Sample grades, events, and ebooks seeded

**Todo List**
1. Create `backend/seed/seed.js` — connects to MongoDB, clears all collections, then inserts in order: Categories → Courses → Users (with hashed passwords) → Grades → Events → EBooks
2. Translate all category data from `js/data.js` into seed array (preserve parent/child nesting via two-pass: insert parents first, then set children refs)
3. Translate all 12 courses from `js/data.js` into seed array — map category by slug
4. Create 3 users: hash password `kiet123` with bcryptjs for each; set enrolledCourses from mock data
5. Create sample grade records (one per enrolled course per student)
6. Create sample calendar events (5–10 upcoming events matching the calendar.html data)
7. Create 6–8 ebook records matching ebook.html catalog
8. Add `"seed": "node seed/seed.js"` script to `backend/package.json`

**Relevant Context**
- Mock data source: `js/data.js`
- Category hierarchy: nested under `KIET Deemed University` root
- Password hashing: `bcryptjs.hashSync('kiet123', 10)`

---

### Sub-Task 4 — Backend: Auth & User Routes

**Status:** `[ ] pending`

**Intent**
Implement authentication (login/logout) and user profile endpoints. These are required before any protected frontend page can work.

**Expected Outcomes**
- `POST /api/auth/login` returns a signed JWT + user object on valid credentials
- `POST /api/auth/logout` is a no-op (JWT is stateless; response clears client hint)
- `GET /api/users/me` returns current user data (protected)
- `PUT /api/users/me` updates profile fields (protected)
- `middleware/auth.js` verifies Bearer token and attaches `req.user`

**Todo List**
1. Implement `middleware/auth.js` — extracts Bearer token from `Authorization` header, verifies with `jwt.verify`, attaches decoded user to `req.user`, calls `next()` or returns 401
2. Implement `routes/auth.js`:
   - `POST /login` — find user by username, compare password with bcrypt, sign JWT (payload: userId, role), return `{token, user}`
   - `POST /logout` — return 200 (client deletes token)
3. Implement `routes/users.js`:
   - `GET /me` (protected) — return populated user doc (exclude passwordHash)
   - `PUT /me` (protected) — update allowed profile fields
4. Mount routes in `server.js`: `/api/auth` → auth router, `/api/users` → users router

**Relevant Context**
- JWT_SECRET from `.env`
- Token expiry: `7d`
- Fields to populate on `/me`: `enrolledCourses` (title, code, color, thumbnail)

---

### Sub-Task 5 — Backend: Courses, Categories, Grades, Calendar & EBook Routes

**Status:** `[ ] pending`

**Intent**
Implement all remaining read-only API endpoints for courses, categories, grades, calendar, and ebooks.

**Expected Outcomes**
- `GET /api/categories` returns full category tree
- `GET /api/categories/:id` returns single category with its courses
- `GET /api/courses` returns all courses (paginated, 12 per page)
- `GET /api/courses/:id` returns full course with topics
- `GET /api/courses/search?q=` returns filtered courses
- `GET /api/grades/me` returns current user's grade records (protected)
- `GET /api/calendar` returns upcoming events
- `GET /api/ebooks` returns ebook list

**Todo List**
1. Implement `routes/categories.js` — GET `/` (tree), GET `/:id` (with courses)
2. Implement `routes/courses.js` — GET `/` (list + pagination), GET `/search` (text query on title/description), GET `/:id` (full detail with topics)
3. Implement `routes/grades.js` — GET `/me` (protected, returns user's grades populated with course titles)
4. Implement `routes/calendar.js` — GET `/` returns all events sorted by date
5. Implement `routes/ebooks.js` — GET `/` returns all ebooks
6. Mount all new routes in `server.js`

**Relevant Context**
- Category tree is hierarchical — GET `/api/categories` should return populated nested structure
- Course search should be case-insensitive regex match on `title` and `description`
- Grades show: course title, score, letter grade, semester

---

### Sub-Task 6 — Frontend: Project Scaffold & Configuration

**Status:** `[ ] pending`

**Intent**
Create the `/frontend` folder as a Vite + React 18 app with Tailwind CSS, React Router v6, and the shared design tokens from the existing site.

**Expected Outcomes**
- `frontend/` folder with working Vite + React dev server on port 3000
- Tailwind CSS configured with custom colors/fonts matching existing design
- Axios configured with base URL pointing to backend port 5000
- Folder structure: `src/pages/`, `src/components/`, `src/context/`, `src/api/`
- `frontend/package.json` with all dependencies

**Todo List**
1. Create `frontend/` folder
2. Create `frontend/package.json` with dependencies: `react`, `react-dom`, `react-router-dom`, `axios`; devDependencies: `vite`, `@vitejs/plugin-react`, `tailwindcss`, `postcss`, `autoprefixer`
3. Create `frontend/vite.config.js` — React plugin, server port 3000, proxy `/api` → `http://localhost:5000`
4. Create `frontend/tailwind.config.js` — extend theme: colors `{ primary: '#ff6600', secondary: '#88b77b', accent: '#1e4f8a', dark: '#2f2f2f' }`, fontFamily `{ sans: ['Century Gothic', 'AppleGothic', 'Arial'] }`
5. Create `frontend/postcss.config.js`
6. Create `frontend/index.html` (Vite entry)
7. Create `frontend/src/main.jsx` — mounts App with BrowserRouter
8. Create `frontend/src/App.jsx` — sets up all routes
9. Create `frontend/src/api/axios.js` — axios instance with `baseURL: '/api'` and request interceptor for JWT header
10. Create `frontend/src/context/AuthContext.jsx` — provides `user`, `token`, `login()`, `logout()` via Context API; persists token to localStorage
11. Create empty page files for all 12 pages in `src/pages/`
12. Create empty shared component files: `Topbar`, `Header`, `Footer`, `Drawer`, `CourseCard`, `CategoryTree`, `Breadcrumb`

**Relevant Context**
- Design tokens from existing `css/style.css`: primary `#ff6600`, secondary `#88b77b`, accent `#1e4f8a`, dark `#2f2f2f`
- Font: Century Gothic → map to Tailwind `font-sans`
- Logo: `assets/logo.svg` — will be copied to `frontend/public/`
- The Vite proxy removes need for CORS on dev; production will need CORS on backend

---

### Sub-Task 7 — Frontend: Shared Layout Components

**Status:** `[ ] pending`

**Intent**
Build the reusable layout shell (Topbar, Header with nav/dropdown, Footer, mobile Drawer) used by every page — matching the existing HTML design.

**Expected Outcomes**
- `Header` renders KIET branding, main navigation, dropdown "Courses" menu, login/logout button
- `Topbar` renders contact bar and login status
- `Footer` renders 3-column layout + copyright bar
- `Drawer` renders mobile sidebar with hamburger toggle
- `Breadcrumb` renders path trail used on inner pages
- All components use Tailwind utility classes matching the existing color/spacing

**Todo List**
1. Implement `src/components/Topbar.jsx` — phone/email left, login status right; reads `user` from AuthContext
2. Implement `src/components/Header.jsx` — logo, nav links, Courses dropdown, hamburger button (mobile)
3. Implement `src/components/Footer.jsx` — 3-column info + social links + copybar
4. Implement `src/components/Drawer.jsx` — fixed sidebar, slide-in on mobile hamburger click
5. Implement `src/components/Breadcrumb.jsx` — accepts `links` prop array `[{label, href}]`
6. Implement `src/components/Layout.jsx` — wraps Topbar + Header + `<main>` + Footer; used by all pages
7. Implement `src/components/CourseCard.jsx` — card with color gradient, title, instructor, link to course page
8. Implement `src/components/CategoryTree.jsx` — recursive expandable tree; fetches from `/api/categories`

**Relevant Context**
- Existing HTML structure in `index.html`, `dashboard.html` for header/footer markup
- Mobile breakpoint: 900px → hide main nav, show hamburger
- Dropdown hover behavior from `js/app.js` → replicate with React state (`useState`)
- AuthContext provides `user` and `logout()` for header login state

---

### Sub-Task 8 — Frontend: Auth Pages (Login, Forgot Password)

**Status:** `[ ] pending`

**Intent**
Build the Login and Forgot Password pages with form validation, API calls, and redirect-on-success behavior.

**Expected Outcomes**
- Login page POSTs to `/api/auth/login`, stores JWT via AuthContext, redirects to `/dashboard`
- Displays error message on wrong credentials
- Already-logged-in users are redirected to `/dashboard` on mount
- Forgot Password page renders the stub form (no backend needed)

**Todo List**
1. Implement `src/pages/Login.jsx` — replicates login.html layout: KIET branding left, form right; calls `AuthContext.login()` which POSTs to `/api/auth/login`
2. Add a `ProtectedRoute` component in `src/components/ProtectedRoute.jsx` — redirects to `/login` if no token
3. Implement `src/pages/ForgotPassword.jsx` — static form page matching forgot.html
4. Add login/forgot routes to `App.jsx`

**Relevant Context**
- Login form fields: username, password, remember username checkbox
- Demo credentials side panel (student/faculty/admin + kiet123)
- `AuthContext.login(username, password)` should: POST, store token+user in state+localStorage, return
- Redirect logic: use `useNavigate` from react-router-dom

---

### Sub-Task 9 — Frontend: Home & Courses Browse Pages

**Status:** `[ ] pending`

**Intent**
Build the Home (index) page with carousel and category tree, and the Courses browse page — both using live data from the API.

**Expected Outcomes**
- Home page renders carousel (3 static hero slides), announcements section, search bar, expandable category tree
- Courses page renders category tree with course counts
- Search bar navigates to `/search?q=` on submit
- Category links navigate to `/category/:id`

**Todo List**
1. Implement `src/pages/Home.jsx` — carousel with 3 slides (auto-advance 5s), announcements static section, search form, CategoryTree component
2. Implement `src/pages/Courses.jsx` — breadcrumb, search form, CategoryTree with expand-all toggle
3. Wire up carousel auto-advance with `useEffect` / `setInterval`; prev/next buttons
4. Connect search form to `useNavigate('/search?q=...')`

**Relevant Context**
- Carousel uses Unsplash external image URLs (keep same URLs)
- CategoryTree fetches `/api/categories` — renders nested accordion
- Announcements section is static content (no API)

---

### Sub-Task 10 — Frontend: Category & Course Detail Pages

**Status:** `[ ] pending`

**Intent**
Build the Category detail page (subcategories + paginated course listing) and the Course detail page (topics/activities list).

**Expected Outcomes**
- `/category/:id` fetches `/api/categories/:id`, renders subcategories and course cards with pagination
- `/course/:id` fetches `/api/courses/:id`, renders all topics and their activities with emoji icons
- Both pages include breadcrumb

**Todo List**
1. Implement `src/pages/Category.jsx` — fetch category by id, render subcategory cards + course cards grid, add prev/next pagination (4 per page)
2. Implement `src/pages/Course.jsx` — fetch course by id, render topic accordion with activity list items (emoji icons per type)
3. Add activity type → emoji mapping: forum→💬, page→📄, file→📎, quiz→❓, video→🎥, assignment→📝

**Relevant Context**
- Activity type icons from existing `course.html`
- Pagination: 4 courses per page in category view (matches category.html)
- Topics are collapsible accordions (default open)

---

### Sub-Task 11 — Frontend: Dashboard, Profile & Grades Pages

**Status:** `[ ] pending`

**Intent**
Build the authenticated user pages: Dashboard (course overview + timeline), Profile, and Grades — all protected by ProtectedRoute.

**Expected Outcomes**
- `/dashboard` renders enrolled courses grid, timeline of upcoming events, user details block, calendar link
- `/profile` renders user info with editable fields; PUT to `/api/users/me` on save
- `/grades` renders grade table per course
- All three redirect to `/login` if not authenticated

**Todo List**
1. Implement `src/pages/Dashboard.jsx` — fetch `/api/users/me` (enrolled courses), fetch `/api/calendar` (timeline events); render 2-column grid layout
2. Implement `src/pages/Profile.jsx` — display user info, optional edit mode, PUT to `/api/users/me`
3. Implement `src/pages/Grades.jsx` — fetch `/api/grades/me`, render table: course | score | grade | semester
4. Wrap all three in `ProtectedRoute` in `App.jsx`

**Relevant Context**
- Dashboard layout: 2fr/1fr column grid (left: courses + timeline; right: user block + calendar + private files)
- User details block uses `user` from AuthContext (avoid extra fetch if already populated)
- Role-based course display: student → enrolled only; faculty/admin → all courses

---

### Sub-Task 12 — Frontend: Search, Calendar & EBook Pages

**Status:** `[ ] pending`

**Intent**
Build the remaining three pages: Search results, Calendar view, and E-Book Bank.

**Expected Outcomes**
- `/search?q=` fetches `/api/courses/search?q=` and renders matching course cards
- `/calendar` fetches `/api/calendar` and renders the monthly calendar grid + event list
- `/ebook` fetches `/api/ebooks` and renders book catalog cards

**Todo List**
1. Implement `src/pages/Search.jsx` — read `q` from URL params, fetch `/api/courses/search?q=`, render CourseCard grid or "no results" message
2. Implement `src/pages/Calendar.jsx` — fetch events, render month grid (October 2026 default), highlight event dates, list upcoming events
3. Implement `src/pages/EBook.jsx` — fetch `/api/ebooks`, render catalog cards (title, author, category, link)
4. Add all three routes to `App.jsx`

**Relevant Context**
- Calendar month view: static October 2026 grid matching calendar.html
- Search results page matches search.html layout: breadcrumb + results count + card grid
- EBook catalog from ebook.html: 6–8 books listed

---

### Sub-Task 13 — Integration & README

**Status:** `[ ] pending`

**Intent**
Wire frontend and backend together end-to-end, verify all pages load with real data, and write a README documenting how to run the project.

**Expected Outcomes**
- `frontend` dev server proxies API calls to backend successfully
- All 12 pages render without errors using seeded MongoDB data
- `README.md` at project root documents: prerequisites, setup steps, seed command, how to run both servers

**Todo List**
1. Verify all API routes are mounted correctly in `backend/server.js`
2. Verify all React routes are declared in `frontend/src/App.jsx`
3. Test login flow end-to-end: POST → JWT → AuthContext → ProtectedRoute
4. Write `README.md` at `c:\Users\siddh\projects\moodle\README.md`:
   - Prerequisites: Node 18+, MongoDB running locally
   - Backend setup: `cd backend && npm install && cp .env.example .env && npm run seed && npm run dev`
   - Frontend setup: `cd frontend && npm install && npm run dev`
   - Access: frontend at http://localhost:3000, API at http://localhost:5000

**Relevant Context**
- Vite proxy config (`/api` → `http://localhost:5000`) handles CORS in dev
- All seeded credentials: student/kiet123, faculty/kiet123, admin/kiet123
