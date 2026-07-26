# Task Management API (Server)

Express + TypeScript backend for the task management assessment. Handles user authentication and per-user CRUD, search, filtering, and pagination for tasks, backed by MongoDB.

## Tech stack

- **Express 4** on **Node.js**, written in **TypeScript**
- **MongoDB** via **Mongoose**
- **JWT** (`jsonwebtoken`) for authentication
- **bcrypt** for password hashing
- **Zod** for request validation
- **Vitest** for tests

## Prerequisites

- Node.js 18+
- A running MongoDB instance (local or Atlas connection string)

## Setup

```bash
cd server
npm install
cp .env.example .env   # fill in the values below
npm run dev             # starts the API with nodemon on $PORT
```

Other scripts:

| Script | Purpose |
|---|---|
| `npm run dev` | Run the API in watch mode via `nodemon` |
| `npm run build` | Compile TypeScript to `dist/` (with path aliases resolved) |
| `npm start` | Run the compiled build (`dist/index.js`) |
| `npm test` | Run the Vitest suite |
| `npm run test:coverage` | Run tests with coverage |
| `npm run lint` | Lint `src/` |
| `npm run format` | Format `src/` with Prettier |

## Environment variables

`.env.example`:

```env
# Server
PORT=4000
SERVER_URL=
CLIENT_ORIGIN=

# Database
MongodbURI=

# JWT
JWT_SECRET=
```

| Variable | Required | Description |
|---|---|---|
| `PORT` | Yes | Port the Express server listens on |
| `SERVER_URL` | No | Public URL of the deployed API (informational / for future use) |
| `CLIENT_ORIGIN` | No | Origin of the deployed frontend — reserved for CORS config once the app is deployed cross-origin |
| `MongodbURI` | Yes | MongoDB connection string; the app fails to start if this can't connect |
| `JWT_SECRET` | Yes | Secret used to sign and verify auth tokens |

## Project structure

```
src/
├── app.ts                  # Express app: middleware + route mounting
├── index.ts                 # entry point — connects to MongoDB, starts the server
├── controllers/              # parse req, call services, hand result to sendResult()
│   ├── auth.controller.ts
│   └── task.controller.ts
├── services/                 # business logic, DB access, validation calls
│   ├── auth.service.ts
│   └── task.service.ts
├── models/                   # Mongoose schemas
│   ├── user.model.ts
│   └── task.model.ts
├── routes/                   # Express routers
│   ├── auth.routes.ts        # mounted at /api/auth
│   └── task.routes.ts        # mounted at /api/tasks (behind requireAuth)
├── middleware/
│   └── authMiddleware.ts     # verifies the Bearer JWT, attaches req.user
├── validators/                # Zod schemas for signup/login/task payloads
└── utils/
    └── sendResult.ts          # turns a { status, message?, data? } service result into an HTTP response
```

**Request flow:** route → controller (reads `req`, calls the service, passes the result to `sendResult`) → service (validates with Zod, talks to Mongoose, returns `{ status, message?, data? }`). Every response body is a plain `{ message?, data? }` JSON object with the HTTP status set to match.

## Authentication

- Passwords are hashed with `bcrypt` (cost factor 10) before being stored — never stored or logged in plaintext.
- On login, a JWT containing `{ userId }` is signed with `JWT_SECRET` and expires after 24 hours.
- Protected routes go through `requireAuth` middleware, which reads the `Authorization: Bearer <token>` header, verifies the token, and attaches the decoded payload to `req.user`. Missing or invalid tokens return `401`.
- Every task query and mutation is scoped to `req.user.userId`, so one user can never read, edit, or delete another user's tasks — this is enforced at the database-query level (e.g. `Task.findOne({ _id: id, userId })`), not just at the route level.

## API reference

All endpoints are prefixed with `/api`. All `/tasks/*` routes require an `Authorization: Bearer <token>` header.

### Auth — `/api/auth`

| Method | Path | Body | Description |
|---|---|---|---|
| POST | `/signup` | `{ name, email, password }` | Creates a user (password hashed with bcrypt). Returns `201` and a message — no session is issued; the client should redirect to login. |
| POST | `/login` | `{ email, password }` | Verifies credentials and returns `{ data: { user: { id, email, name }, token } }` on success. |

### Tasks — `/api/tasks` (requires auth)

| Method | Path | Body / Params | Description |
|---|---|---|---|
| POST | `/create` | `{ name, description, priority?, status?, dueDate? }` | Creates a task owned by the authenticated user. |
| POST | `/update` | `{ id, name?, description?, priority?, status?, dueDate? }` | Partial update — only fields present in the body are changed. Fails with `404` if the task doesn't belong to the user. |
| GET | `/get/:pageIndex` | — | Returns the user's tasks, 10 per page, 0-indexed (`pageIndex=0` is page 1). |
| GET | `/search/:pageIndex/:text` | — | Case-insensitive search by task title (`name`), paginated the same way. |
| GET | `/filter/:pageIndex/:priority?/:status?` | — | Filters by status and/or priority (both optional), paginated the same way. |
| GET | `/delete/:id` | — | Deletes a task by id, scoped to the authenticated user. (Implemented as `GET` for simplicity; a `DELETE` verb would be more RESTful.) |

### Response shape

Every endpoint responds with:

```json
{ "message": "optional human-readable message", "data": "optional payload" }
```

with the HTTP status code communicating success/failure (`200`/`201` success, `400` validation error, `401` auth error, `404` not found, `409` conflict, `500` unexpected error).

## Data models

**User**

| Field | Type | Notes |
|---|---|---|
| `name` | String | required |
| `email` | String | required, unique, stored lowercased |
| `password` | String | required, bcrypt hash |

**Task**

| Field | Type | Notes |
|---|---|---|
| `name` | String | required — the task's title |
| `description` | String | required |
| `userId` | String | required — owning user's id |
| `status` | Number | `1` To Do, `2` In Progress, `3` Done (default `1`) |
| `priority` | Number | `1` Low, `2` Medium, `3` High (default `2`) |
| `dueDate` | Number | Unix ms timestamp (defaults to 24h from creation) |

Statuses and priorities are stored as numbers rather than strings on the backend; the client maps them to labels (see `client/src/types/index.ts`).

## Validation

All request bodies are validated with Zod before touching the database:

- Signup/login: valid email (max 45 chars), password ≥ 6 characters, name required.
- Task create/update: `name` and `description` required (1–100 / 1–500 chars respectively) on create, all fields optional on update; `priority`/`status` constrained to `1`–`3`.

Validation failures return `400` with a joined message of all failing rules.

## Testing

```bash
npm test
```

Each layer has a matching `*.test.ts` file next to the code it covers: controllers, services, middleware, validators, and the `sendResult` utility. Tests use Vitest.

## Known issues (backend-specific)

- The `/api/tasks/delete/:id` endpoint uses `GET` rather than `DELETE` for simplicity.
