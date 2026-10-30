# AIR Lab – API server

Express + TypeScript + MongoDB (Mongoose) backend for the AIR Lab website.

## Quick start

```bash
cd server
npm install
cp .env.example .env      # then set MONGO_URI (Atlas or local)
npm run seed              # import src/data/*.json into MongoDB (only empty collections)
npm run dev               # http://localhost:5000
```

Run the frontend in another terminal from the repo root (`npm run dev`). Vite proxies `/api` to this server.

## Scripts

| Script | What it does |
|---|---|
| `npm run dev` | Start with auto-reload (tsx watch) |
| `npm run build` / `npm start` | Compile to `dist/` and run (production) |
| `npm run seed` | Import JSON into **empty** collections (safe) |
| `npm run seed -- --force` | Wipe and re-import **all** collections. ⚠️ Destroys admin edits |
| `npm run seed -- team projects` | Limit seeding to specific collections |
| `npm run typecheck` | TypeScript check without emitting |

## Endpoints (so far)

| Method | Path | Description |
|---|---|---|
| GET | `/api/health` | Server and DB status |
| GET | `/api/content` | List of content collections |
| GET | `/api/content/:slug` | Published items of a collection |
| GET | `/api/content/:slug/:id` | Single item by public `id` |
| GET | `/api/positions` | Open vacancies |

Collection slugs: `team`, `previous-interns`, `interns`, `projects`, `publications`, `grants`, `sponsors`, `collaborations`, `gallery`, `performers`, `blogs`.

## Structure

```
src/
  config/env.ts        validated environment variables
  db.ts                Mongo connection
  content/registry.ts  field definitions for every content collection (single source of truth)
  models/              content (generated from the registry), Position, Application, Admin
  routes/              public routers
  middleware/          error handling
  scripts/seed.ts      JSON → Mongo importer
```

To add a field to the website content, add it to `content/registry.ts`. The model updates from that, and so will the admin form later.
