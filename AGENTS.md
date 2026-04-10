# AGENTS.md

## Scope and current state
- This repo has two separate parts: `backend/` (Django) and `frontend/` (React + Vite).
- `frontend/src/services/filetree_api.js` is currently **mock-only** (hardcoded folders/files, no real HTTP calls).
- Django backend is mostly scaffolded right now: `FileTree` app exists but is not wired into `INSTALLED_APPS`, and `StudyAPP/urls.py` only exposes `/admin/`.

## Verified working directories and commands
- Python setup is expected from repo root:
  - `python3 -m venv .venv`
  - `source .venv/bin/activate`
  - `pip install -r requirements.txt`
- Frontend commands run in `frontend/`:
  - `npm install`
  - `npm run dev`
  - `npm run build`
  - `npm run lint`
- Backend commands run in `backend/`:
  - `python3 manage.py migrate`
  - `python3 manage.py runserver`
  - `python3 manage.py test`

## Environment and data gotchas
- Django DB is configured for local PostgreSQL in `backend/StudyAPP/settings.py`:
  - DB: `studyapp_db`
  - User: `visan`
  - Password: `123456`
  - Host: `localhost:5432`
- If Postgres is not running with those credentials, backend commands that touch DB will fail.
- `backend/db.sqlite3` is gitignored, but default settings are Postgres (not SQLite).

## Entry points and wiring
- Frontend app entry: `frontend/src/main.jsx`.
- Route mapping in frontend:
  - `/` → `App.jsx` (Vite starter-style page)
  - `/filetree` → `pages/FileTree/FileTree.jsx`
- Backend entry: `backend/manage.py` with settings module `StudyAPP.settings`.

## Agent workflow expectations
- Prefer validating frontend changes with `npm run lint` (in `frontend/`) and `npm run build` for integration sanity.
- Prefer validating backend changes with targeted `manage.py` commands from `backend/`.
- Do not assume frontend file-tree UI is connected to backend APIs unless you add that wiring explicitly.
