# Repository Guidelines

## Project Structure & Module Organization
`docs/technical_impmentation.md` captures the architecture and should remain the single source for service boundaries. Place application code in `src/` following the controller/service/utils layout described there (e.g., `src/controllers/audit.controller.ts`). Keep integration fixtures and Elastic/Gemini stubs under `tests/fixtures/`, and store shared configs like Axios clients in `src/services/`. Root-level `README.md` stays as the entry point for onboarding notes.

## Build, Test, and Development Commands
Run `npm install` before any local work to sync dependencies. Use `npm run dev` for the Express dev server once the Node scaffolding lands—it should reload on changes via `ts-node-dev` or similar. Ship production bundles with `npm run build`, ensuring TypeScript emits to `dist/`. Execute the full suite with `npm test`; add `npm run test:watch` for rapid loops when configuring Jest.

## Coding Style & Naming Conventions
Favor modern TypeScript (ES2022 modules, async/await). Indent with two spaces, keep imports sorted by module depth, and export named functions rather than defaults for services. Route handlers live in `audit.controller.ts` and should delegate to thin service layers. Align with ESLint + Prettier defaults (`eslint --ext .ts src`) and run the formatter before pushes.

## Testing Guidelines
Adopt Jest with `ts-jest` for fast unit coverage and Supertest for API smoke checks. Mirror implementation paths—`src/services/vertex.service.ts` should be tested by `tests/services/vertex.service.spec.ts`. Aim for 80% statement coverage, double-checking hallucination scoring branches with edge inputs. Use `.env.test` to stub API keys and avoid hitting real endpoints; mock Elastic and Vertex clients.

## Commit & Pull Request Guidelines
Follow Conventional Commits (`feat:`, `fix:`, `chore:`) since the history is clean slate. Keep messages under 72 characters and include context in the body when touching external integrations. Pull requests should link target Jira/GitHub issues, describe the audit scenario covered, and attach sample `/audit` requests plus JSON responses. Request at least one review, and ensure CI (build + tests) runs green before merge.

## Security & Configuration Tips
Never commit `.env` or credential files—use `.env.example` with placeholder keys for Vertex, Elastic, and Gemini. Rotate service keys quarterly and prefer service accounts with least privilege. When sharing logs, redact raw audit inputs and external document IDs to protect customer data.
