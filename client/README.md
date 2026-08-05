# Task Management Client

React + TypeScript single-page app for the task management project. Built with Vite and Tailwind CSS, talking to the Express API in `../server`.

## Tech stack

- **React 18** + **TypeScript**
- **Vite** (dev server + build)
- **React Router v6** (routing, protected routes)
- **Tailwind CSS** (styling)
- **Vitest** + **Testing Library** (tests)

## Prerequisites

- Node.js 18+
- The API running (see `../server/README.md`) — either locally on port 4000 or at a URL you point `VITE_server` at

## Setup

```bash
cd client
npm install
cp .env.example .env   # optional in local dev — see below
npm run dev             # starts Vite on http://localhost:3000
```

Other scripts:

| Script | Purpose |
|---|---|
| `npm run dev` | Start the Vite dev server |
| `npm run build` | Type-check (`tsc -b`) and build for production |
| `npm run preview` | Preview the production build locally |
| `npm test` | Run the Vitest suite once |
| `npm run test:watch` | Run tests in watch mode |
| `npm run lint` | Lint `src/` |

## Environment variables

`.env.example`:

```env
# The Port which the application run on. 
VITE_PORT
# Base URL for the Express API. Leave unset to use the Vite dev proxy at /api.
VITE_SERVER
```

In development, `vite.config.ts` proxies any request to `/api/*` through to `http://localhost:4000`, so you generally don't need to set `VITE_server` at all — just make sure the server is running on port 4000. Set it explicitly if you're pointing the client at a deployed API.

## Project structure

```
src/
├── main.tsx              # app entry point
├── App.tsx                # route table
├── api/
│   ├── http.ts             # fetch wrapper: adds the JWT header, parses errors, handles 401 → logout
│   ├── authService.ts       # signup/login/logout calls
│   └── taskService.ts       # task CRUD + search/filter/pagination, maps API shape → UI Task type
├── context/
│   └── AuthContext.tsx      # session state (user, token), backed by sessionStorage
├── routes/
│   └── ProtectedRoute.tsx   # redirects to /login if there's no session
├── pages/
│   ├── Login.tsx
│   ├── Register.tsx
│   └── Tasks.tsx             # the main authenticated screen — owns filters, pagination, view state
├── components/
│   ├── FilterBar.tsx          # search box, status/priority selects, table/board toggle, "+ New task"
│   ├── CreateTaskModal.tsx     # create-task form with client-side validation
│   ├── TaskTable.tsx / TaskRow.tsx   # table view with inline edit-in-place
│   ├── KanbanBoard.tsx / TaskCard.tsx # board view with native HTML5 drag-and-drop between columns
│   ├── Pagination.tsx           # prev/next pager
│   ├── StatusBadge.tsx / PriorityBadge.tsx  # small label components
│   └── Navbar.tsx
├── types/index.ts           # shared TS types (Task, User, filters, status/priority label maps)
└── utils/
    ├── constants.ts          # status/priority values, storage keys, page size
    └── date.ts                # date <-> unix ms conversion helpers
```

## Key behaviors

- **Auth & session** — `AuthContext` keeps the JWT and user in `sessionStorage` (cleared when the tab closes). Every API call attaches `Authorization: Bearer <token>` via `api/http.ts`; a `401` response clears the session automatically and the UI falls back to the login screen through `ProtectedRoute`.
- **Two views of the same data** — a sortable/editable **table** view and a **Kanban board** view, toggled from the filter bar. Both are driven by the same `tasks` state in `Tasks.tsx`.
- **Search, filter, pagination** — search (by title), status filter, and priority filter are mutually exclusive query modes handled server-side; changing any of them resets to page 1. Search input is debounced (350ms) so it doesn't fire a request per keystroke. Page number lives in the URL (`?page=`) so it survives refreshes and back/forward navigation.
- **Drag and drop** — the board view uses the native HTML5 Drag and Drop API (no external library). Dropping a card on a different column optimistically calls the update endpoint with just `{ id, status }`; a failed move surfaces an inline error without losing the rest of the board state.
- **Inline editing** — in the table view, clicking "Edit" on a row turns its cells into inputs and swaps the action buttons for Save/Cancel, rather than opening a separate modal.
- **Validation & feedback** — the create-task form validates title and due date client-side before submitting; loading, empty, and error states are handled explicitly in the table and board views rather than left blank.

## Testing

```bash
npm test
```

Tests live under `tests/` and cover the API layer (`authService`, `taskService`), `AuthContext`, date utilities, and several components (`Pagination`, `StatusBadge`, `PriorityBadge`, `TaskRow`).
