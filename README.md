# StudyAPP

StudyAPP is a learning application built with **React + Vite** in the frontend and **Django** in the backend.

At the moment, the project includes:

- **Pomodoro** for focus sessions and breaks
- **Flashcards** for card-based learning
- **File System** for organizing study materials
- **Activity Report** for tracking monthly focus time and solved flashcards, displayed on the homepage
- authentication and a homepage for navigating between modules

The application is still under development, and more improvements and features will be added in the future.

## Run the project

### Backend

```bash
source .venv/bin/activate
pip install -r requirements.txt
cd backend
python3 manage.py migrate
python3 manage.py runserver 8080
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

## Main routes

- `/auth`
- `/home`
- `/pomodoro`
- `/flashcards`
- `/filetree`

## API

- `/api/auth/`
- `/api/pomodoro/`
- `/api/flashcards/`
- `/api/filesystem/`
