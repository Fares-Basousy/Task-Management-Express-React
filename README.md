# Task Management App

A full-stack task manager built for the MERN Stack Developer technical assessment. Users can register, log in, and manage their own tasks — with search, filtering, pagination, and a drag-and-drop Kanban board — through a TypeScript/Express/MongoDB API and a TypeScript/React client.

This README covers the project as a whole. For implementation details specific to each half of the stack, see:

- [`server/README.md`](./server/README.md) — API design, data models, endpoint reference
- [`client/README.md`](./client/README.md) — component structure, state management, UI behavior

## Tech stack

| Layer | Technology |
|---|---|
| Frontend | React 18, TypeScript, Vite, React Router, Tailwind CSS |
| Backend | Node.js, Express 4, TypeScript |
| Database | MongoDB (Mongoose) |
| Auth | JWT, bcrypt |
| Validation | Zod (backend) |
| Testing | Vitest, Testing Library, Supertest |

## Project structure

```
.
├── client/          # React + TypeScript SPA (Vite)
│   ├── src/
│   │   ├── api/         # fetch wrappers per resource (auth, tasks)
│   │   ├── components/  # presentational + interactive UI pieces
│   │   ├── context/      # AuthContext (session state)
│   │   ├── pages/        # route-level screens (Login, Register, Tasks)
│   │   ├── routes/       # ProtectedRoute guard
│   │   ├── types/        # shared TS types
│   │   └── utils/        # constants, date helpers
│   └── tests/            # Vitest + Testing Library specs
│
└── server/          # Express + TypeScript API
    └── src/
        ├── controllers/   # request/response glue
        ├── services/      # business logic (auth, tasks)
        ├── models/        # Mongoose schemas (User, Task)
        ├── routes/        # Express routers
        ├── middleware/    # JWT auth guard
        ├── validators/    # Zod schemas
        └── utils/         # response helper
```

Frontend and backend are separate npm workspaces with their own `package.json`, `.env.example`, and test suite, tied together by a root `package.json` that runs both concurrently.

## Getting started

### Prerequisites

- Node.js 18+
- A MongoDB connection string (local instance or Atlas)
- pnpm or npm (lockfiles are provided for both)

### Setup

```bash
git clone https://github.com/Fares-Basousy/Task-Management-Express-React.git
cd Task-Management-Express-React
npm run install          # installs server + client dependencies

cp server/.env.example server/.env   # fill in MongodbURI and JWT_SECRET
cp client/.env.example client/.env   # optional — see client README

npm run dev               # runs server (port 4000) and client (port 3000) together
```

The client dev server proxies `/api/*` requests to `http://localhost:4000`, so no CORS setup is needed in development.

### Environment variables

**`server/.env`**

| Variable | Description |
|---|---|
| `PORT` | Port the Express server listens on (e.g. `4000`) |
| `SERVER_URL` | Public URL of the API, if deployed |
| `CLIENT_ORIGIN` | Origin of the deployed frontend, for CORS in production |
| `MongodbURI` | MongoDB connection string |
| `JWT_SECRET` | Secret used to sign and verify JWTs |

**`client/.env`**

| Variable | Description |
|---|---|
| `VITE_PORT` | The Port which the application run on. |
| `VITE_server` | Base URL of the API. Leave unset in development to use the Vite proxy at `/api`. |


Full details, including defaults and dev-only fields, are in each package's own README.

### Running tests

```bash
npm test        # runs server tests then client tests
```

Or per package: `npm test --prefix server` / `npm test --prefix client`.

## Completed features

### Core requirements

- [x] User registration and login
- [x] JWT-based authentication and protected API endpoints
- [x] Each user can only access their own tasks (all task queries are scoped by `userId`)
- [x] Create, update, and delete tasks
- [x] Tasks include title, description, status, priority, and due date
- [x] Statuses: To Do, In Progress, Done
- [x] Priorities: Low, Medium, High
- [x] Search tasks by title
- [x] Filter tasks by status and priority
- [x] Responsive interface (desktop and mobile)
- [x] Loading, error, empty-state, and validation feedback throughout

### Bonus features implemented

- [x] **TypeScript** — used across both client and server
- [x] **Drag and drop between task statuses** — native HTML5 drag-and-drop on the Kanban board view, with an optimistic status update and inline error handling if the move fails
- [x] **Frontend and API tests** — Vitest/Testing Library specs on the client (components, API layer, auth context) and Vitest specs on the server (controllers, services, middleware, validators)
- [x] **Pagination** — server-side, 10 tasks per page, applied consistently across the default list, search, and filter endpoints

### Bonus features not implemented

- [ ] Deployed live version
- [ ] Docker support
- [ ] Task attachments

## Known issues / incomplete items

- **No deployed version.** The app currently runs locally only.
- **No Docker support.**
- **No task attachments.**

## AI tool usage disclosure

AI tools were used throughout development, per the assessment's stated policy allowing disclosed use of libraries, references, and AI tools:

- **Claude and ChatGPT** were used for the main part of the project — planning, scaffolding, and implementation of features.
- **Claude Code** was used toward the end of development for bug fixing, data normalization, and writing tests.

All code was reviewed and understood before being committed.
