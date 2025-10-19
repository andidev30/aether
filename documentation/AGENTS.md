# Repository Guidelines

## Project Structure & Module Organization
Architecture decisions live in `documentation/technical_impmentation.md`; update it whenever endpoints or service boundaries shift. The Nest backend resides in `backend/src` with the controller/service/utils layering—route handlers in `controllers/*.controller.ts` stay thin and delegate to `services/*.service.ts`, while helpers belong in `utils/`. Tests mirror implementation under `backend/test`, with fixtures and mocks in a matching `backend/test/fixtures/`; add new fixtures rather than mutating shared ones. The Vite client lives in `frontend/src`, and operational Python utilities (Elastic seeding, index ops) stay in `scripts/`.

## Build, Test, and Development Commands
Run `cd backend && npm install` before local work to sync dependencies. Use `npm run start:dev` for the hot-reloading API server and `npm run build` to emit the production bundle into `dist/`. Execute `npm run test` for the full Jest suite, `npm run test:watch` during tight loops, and `npm run test:cov` to verify coverage. Keep code style aligned with `npm run lint` and `npm run format` before opening a pull request.

## Coding Style & Naming Conventions
Write modern TypeScript (ES2022 modules, async/await) with two-space indentation and module-sorted imports. Name services `*.service.ts`, controllers `*.controller.ts`, DTOs `*.dto.ts`, and utilities `*.util.ts`. Prefer named exports, keep configuration clients in `backend/src/services/clients/`, and ensure HTTP adapters remain focused on orchestration.

## Testing Guidelines
Use Jest with `ts-jest` and Supertest; each service module needs a companion spec under `backend/test` that mirrors the feature folder (for example, `backend/test/audit/audit.service.spec.ts`). Target at least 80% statement coverage, explicitly exercising hallucination scoring branches and unhappy path error handling. Load `.env.test` to stub API keys, and mock Elastic or Vertex clients via fixtures instead of hitting live endpoints.

## Commit & Pull Request Guidelines
Follow Conventional Commits (`feat:`, `fix:`, `chore:`) capped at 72 characters, adding context in the body when touching integrations or infrastructure. Pull requests must link the relevant Jira or GitHub issue, summarize the audit scenario, and attach a sample `/audit` request plus JSON response. Ensure CI build and tests finish green, request at least one review, and note any manual steps for deploys.

## Security & Configuration Tips
Never commit secrets; rely on `.env.example` with placeholder keys for Vertex, Elastic, and Gemini. Rotate service credentials quarterly, prefer least-privilege service accounts, and redact customer data or document IDs in all shared logs or PR notes.
