## Aether Backend

The backend is a NestJS 10 service that implements the audit pipeline described in `docs/technical_impmentation.md`. It exposes REST endpoints under the `api/` prefix.

### Getting Started

```bash
cd backend
npm install
npm run start:dev
```

The server boots at `http://localhost:3000`. Health checks live at `GET /api/health`; the audit endpoint is `POST /api/audit`.

### Available Scripts

- `npm run start:dev` — start the Nest Dev server with hot reload.
- `npm run build` — compile TypeScript to `dist/`.
- `npm run start` — run the compiled app in production mode.
- `npm run lint` — run ESLint with the NestJS TypeScript rules.
- `npm run test` — execute Jest unit tests (placeholder).
- `npm run test:watch` — watch tests.
- `npm run test:cov` — collect coverage.

## Aether Frontend

The frontend is a standalone Vite + React application that provides an audit console for testing the backend service.

### Getting Started

```bash
cd frontend
npm install
npm run dev
```

The dev server runs on `http://localhost:5173` and automatically reloads on file changes.

### Available Scripts

- `npm run dev` — start the Vite development server.
- `npm run build` — type-check and create a production build.
- `npm run preview` — preview the production build locally.
