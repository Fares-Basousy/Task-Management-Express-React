# Task Manager — Frontend

React + React Router boilerplate for the task management assignment. Built with Vite and Tailwind CSS.

## What's included

- **Routing**: `react-router-dom` v6 with a `ProtectedRoute` that redirects to `/login` when there's no valid session.
- **Auth/session**: `AuthContext` stores the JWT + user in `sessionStorage`, attaches the token to every request via an axios interceptor, and clears the session automatically on a `401` response.
- **Pages**: `Login`, `Register`, `Tasks` (the protected dashboard).
- **Task table**: search, status/priority filters, pagination, and inline row editing — clicking **Edit** turns the row's fields into inputs and swaps the **Edit / Remove** buttons for **Save / Cancel**.
- **Create task modal**: opens from the "+ New task" button, validates title and due date client-side.
- **API layer**: `src/api/*Service.js` files are thin wrappers around axios — swap the URLs/payloads to match your actual Express routes.

## Setup

```bash
npm install
cp .env.example .env   # point VITE_API_BASE_URL at your backend, or leave it to use the dev proxy
npm run dev
```

The Vite dev server proxies `/api/*` to `http://localhost:4000` by default (see `vite.config.js`), so if your Express server runs on port 4000 you don't need to set `VITE_API_BASE_URL` at all in development.

## Backend contract this frontend expects

Adjust `src/api/authService.js` and `src/api/taskService.js` if your actual routes differ.

**Auth**
- `POST /api/auth/register` `{ name, email, password }` → `{ user, token }`
- `POST /api/auth/login` `{ email, password }` → `{ user, token }`
- `POST /api/auth/logout` (optional, best-effort)

**Tasks** (all require `Authorization: Bearer <token>`)
- `GET /api/tasks?search=&status=&priority=&page=&limit=` → `{ items, total, page, totalPages }`
- `POST /api/tasks` `{ title, description, status, priority, dueDate }` → task
- `PATCH /api/tasks/:id` `{ ...fields }` → task
- `DELETE /api/tasks/:id` → `{ success: true }`

**Task shape**
```json
{
  "_id": "…",
  "title": "Write proposal",
  "description": "Draft the Q3 proposal",
  "status": "To Do | In Progress | Done",
  "priority": "Low | Medium | High",
  "dueDate": "2026-08-01T00:00:00.000Z"
}
```

## Where to plug in server actions / real endpoints

Everything network-related is isolated to `src/api/`:
- `axiosClient.js` — base client, JWT header injection, 401 handling.
- `authService.js` — register/login/logout calls.
- `taskService.js` — task CRUD + list with search/filter/pagination.

Nothing in the pages/components talks to axios directly, so once your Express endpoints exist, this is the only place you should need to touch.

## Suggested next steps for the full assignment

- Build the Express + MongoDB backend implementing the contract above (bcrypt password hashing, JWT issuing/verification middleware, per-user task scoping, Mongoose validation).
- Add a `.env.example` on the backend for `PORT`, `MONGODB_URI`, `JWT_SECRET`, `JWT_EXPIRES_IN`.
- Wire up empty/loading/error states further drag-and-drop status changes.
