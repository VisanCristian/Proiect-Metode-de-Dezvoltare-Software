# StudyAPP

**StudyAPP** is a web platform for organising and improving the study experience — a single space that brings together focus sessions, flashcard-based revision, file management, group collaboration, and an integrated AI assistant.

> Project built by **Vișan Cristian Andrei**, **Cărămidă Ioana Cătălina** and **Spătaru Georgiana Valentina**.

---

## The problem we solve

Before StudyAPP, a typical student used fragmented tools: a separate timer app, an external flashcard platform, a separate cloud storage for notes — with no connection between them and no unified progress.

StudyAPP brings everything into one place, with one account, centralised statistics, and an AI assistant that knows what you have been studying.

---

## Tech stack

| Layer | Technology |
|---|---|
| Frontend | React 19, Vite, React Router |
| Backend | Django 6, Django REST Framework |
| Authentication | Djoser + Token Auth |
| AI Agent | n8n (workflow), FastMCP (Model Context Protocol) |
| Database | SQLite (development) |
| CI/CD | GitHub Actions |

---

## Architecture

The application follows a **client-server architecture with a REST API**:

```
Browser (React + Vite)
        ↓ HTTP / JSON
Django REST Framework (API)
        ↓ ORM
Database (SQLite / PostgreSQL)
        ↓ MCP tools
AI Agent (n8n + FastMCP)
```

---

## Team and contributions

### Vișan Cristian Andrei

- **FileTree** — create, edit and delete folders and files; live Markdown editing; Markdown → PDF conversion; file content encrypted at rest
- **Flashcard recommendation algorithm** — SVD (Singular Value Decomposition) applied to the daily success rate per deck
- **Groups** — UI, shared flashcard pool and shared file pool between group members
- **n8n workflow** — AI agent integration via webhook; custom agent prompt specialised for helping users learn
- **Token system** — token consumption mechanism on every AI action; token formula fix

### Cărămidă Ioana Cătălina

- **Authentication** — registration and login with token auth (Djoser), protected routes, error handling
- **Flashcards module** — deck and card creation, flip-based review, known/unknown marking, session saving with mistakes and responses
- **Groups (backend)** — `UserGroup`, `Deck-Group`, `Files-Group` models; permissions and resource sharing between members
- **MCP servers** — full implementation of `viewer_server.py` and `creator_server.py`: tools for reading files, listing folders, viewing decks, creating flashcards and files
- **Automated tests and CI/CD** — GitHub Actions workflow, pytest test suite (backend) and Vitest (frontend), Ruff and ESLint linting

### Spătaru Georgiana Valentina

- **Pomodoro module** — configurable timer, task management, browser notifications, session history, session persistence across page navigation, backend models and API
- **Dashboard** — personalised greeting, four stat cards (avg daily focus, focus trend vs yesterday, all-time focus, all-time tokens), quick shortcuts, monthly goals with progress bars
- **Home page** — animated SVG logo with orbiting icons, module summary cards
- **Activity report and token system** — monthly aggregation (focus time, cards, Pomodoro + flashcard points, tokens); formula `tokens = points + (focus_seconds ÷ 60)`; available tokens: `2500 + earned − consumed`; daily trend (today vs yesterday)
- **Global chatbot UI** — chatbot panel available on every page, resizable and collapsible, with real-time token budget display
- **Group statistics** — tab showing each member's monthly activity within the group
- **`update_agent_memory` tool** — MCP tool in the viewer server that saves the AI's observations about the student without consuming tokens

---

## Features

### Authentication
- Registration and login with token-based auth
- Protected routes — unauthenticated users are redirected to `/auth`
- API: `/api/auth/`

### Pomodoro
- Configurable focus and short/long break intervals
- Task management with estimated vs actual tracking
- Session persists regardless of which page the user navigates to
- Models: `PomodoroSession`, `PomodoroTask`
- API: `/api/pomodoro/`

### Flashcards
- Deck and card creation, flip-based review sessions, known/unknown marking
- SVD-based deck recommendation algorithm based on user activity
- Correct answers award flashcard points recorded per session
- Models: `Deck`, `Flashcard`, `DeckSession`, `UserCardProgress`
- API: `/api/flashcards/`

### FileTree
- Create, edit and delete folders and files
- Live Markdown editing, conversion to PDF, integrated preview
- Content encrypted at rest
- API: `/api/filesystem/`

### Groups
- Shared flashcard pool (added from members' own decks or generated from files)
- Shared file pool between members
- Statistics tab with each member's monthly activity
- Group chatbot with strict access only to resources added to the group
- API: `/api/groups/`

### AI Assistant (Chatbot)
- Available globally on every page, resizable and collapsible
- n8n workflow with a custom AI agent prompt specialised for studying
- Personal chatbot: access to the user's own files and decks
- Group chatbot: strict access to group resources only
- Every AI action deducts tokens from the user's budget

### MCP Agents (Model Context Protocol)

**Viewer server** — read-only tools:
| Tool | Description |
|---|---|
| `list_folders` | Lists the user's folders |
| `read_file` | Reads a file's content |
| `view_deck` | Lists cards in a flashcard deck |
| `update_agent_memory` | Saves the AI's observations about the student without consuming tokens |

**Creator server** — write tools:
| Tool | Description |
|---|---|
| `create_flashcard` | Creates a new card in a deck |
| `create_folder` | Creates a new folder |
| `create_file` | Creates a new file |

### Agent memory
The `AgentMemory` model stores the AI's observations about each student across sessions:

| Field | Description |
|---|---|
| `excel_subjects` | Subjects the student excels at |
| `poor_subjects` | Subjects the student struggles with |
| `notes` | General observations about study habits |
| `consumed_tokens` | Total tokens spent on AI actions |

### Points and token system
- Points from flashcards (1 per correct answer) and Pomodoro (1 per completed cycle)
- Formula: `tokens = points + (focus_seconds ÷ 60)`
- Available tokens: `2500 (base) + earned_tokens − consumed_tokens`
- API: `/api/activity/`, `/api/agents/`

### Automated tests
- GitHub Actions runs on every push and pull request
- Backend: pytest + Ruff
- Frontend: Vitest + ESLint

---

## Database structure

```
User
 ├── PomodoroSession (status, focus_time, completed_pomodoros, points)
 ├── PomodoroTask (title, estimated, completed)
 ├── Deck
 │    ├── Flashcard (question, answer)
 │    ├── DeckSession (mistakes, responses)
 │    └── UserCardProgress (status, last_reviewed)
 ├── Folder
 │    └── File (encrypted content)
 ├── UserGroup (members, permissions)
 ├── FlashcardPointLog (points per correct answer)
 └── AgentMemory (excel_subjects, poor_subjects, notes, consumed_tokens)
```

---

## Running the project

### Backend

```bash
source .venv/bin/activate
pip install -r requirements.txt
cd backend
python manage.py migrate
python manage.py runserver 8080
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

### MCP servers (optional — required for AI agent tools)

```bash
cd backend/MCP_server
python viewer_server.py
python creator_server.py
```

---

## Routes

| Route | Description |
|---|---|
| `/auth` | Login and registration |
| `/dashboard` | Personal dashboard with stats and shortcuts |
| `/pomodoro` | Focus timer |
| `/flashcards` | Flashcard decks and revision |
| `/filetree` | File system |
| `/group` | Group study spaces |

---

## API endpoints

| Endpoint | Description |
|---|---|
| `/api/auth/` | Authentication (Djoser) |
| `/api/pomodoro/` | Pomodoro sessions and tasks |
| `/api/flashcards/` | Decks and cards |
| `/api/filesystem/` | Folders and files |
| `/api/groups/` | Groups and members |
| `/api/activity/` | Monthly activity report and tokens |
| `/api/agents/` | Flashcard points, agent memory |
