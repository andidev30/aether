## Aether Backend

The backend is a NestJS 10 service that implements the audit pipeline described in `documentation/technical_impmentation.md`. It exposes REST endpoints under the `api/` prefix.

### Getting Started

```bash
cd backend
npm install
npm run start:dev
```

The server boots at `http://localhost:3000`. Health checks live at `GET /api/health`; the audit endpoint is `POST /api/audit`.

### Configuration

Copy `backend/.env.example` to `backend/.env` and populate the required secrets:

- **Elastic Cloud** — `ELASTIC_URL`, `ELASTIC_API_KEY`, and (optionally) `ELASTIC_INDEX`.
- **Vertex AI** — `VERTEX_PROJECT_ID`, `VERTEX_LOCATION`, `VERTEX_EMBEDDING_MODEL`, `VERTEX_MODERATION_MODEL`, and `GEMINI_MODEL`, plus `GOOGLE_APPLICATION_CREDENTIALS` pointing to a service-account JSON with Vertex permissions.
- **Gemini** — handled through Vertex; choose the model via `GEMINI_MODEL` (e.g., `gemini-1.5-flash`).

Without these values the services fall back to lightweight heuristics, which is useful for local prototyping but will not produce production-grade scores.

### Available Scripts

- `npm run start:dev` — start the Nest Dev server with hot reload.
- `npm run build` — compile TypeScript to `dist/`.
- `npm run start` — run the compiled app in production mode.
- `npm run lint` — run ESLint with the NestJS TypeScript rules.
- `npm run test` — execute Jest unit tests (placeholder).
- `npm run test:watch` — watch tests.
- `npm run test:cov` — collect coverage.

### Elasticsearch Utilities

Python tooling lives under `scripts/` for managing the Elastic evidence index.

```bash
python -m venv .venv
source .venv/bin/activate
pip install -r scripts/requirements.txt
export ELASTIC_URL=https://your-cluster.es.us-central1.gcp.elastic-cloud.com
export ELASTIC_API_KEY=your_api_key
python scripts/create_index.py
```

Available commands:

- `create_index.py` — provision the evidence index with mappings.
- `seed_index.py` — convert all `.txt` files under `scripts/example/` into documents and seed them.
- `seed_index.py --files scripts/example/doc1_ai_hallucination_trust.txt` — seed a specific subset of example files.
- `delete_index.py --force` — drop the index (requires explicit `--force`).

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
