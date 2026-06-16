# StudyAPP

**StudyAPP** este o platformă web pentru organizarea și eficientizarea studiului — un singur spațiu care reunește sesiuni de focus, recapitulare cu flashcarduri, organizarea materialelor, colaborare în grup și un asistent AI integrat.

> Proiect realizat de **Vișan Cristian Andrei**, **Cărămidă Ioana Cătălina** și **Spătaru Georgiana Valentina**.

---

## Problema rezolvată

Înainte de StudyAPP, un student tipic folosea instrumente fragmentate: un timer separat, o platformă externă pentru flashcarduri, un cloud storage separat pentru notițe — fără nicio legătură între ele și fără progres unificat.

StudyAPP aduce totul într-un singur loc, cu un cont, cu statistici centralizate și cu un asistent AI care știe ce ai studiat.

---

## Tech stack

| Layer | Tehnologie |
|---|---|
| Frontend | React 19, Vite, React Router |
| Backend | Django 6, Django REST Framework |
| Autentificare | Djoser + Token Auth |
| AI Agent | n8n (workflow), FastMCP (Model Context Protocol) |
| Baza de date | SQLite (development) |
| CI/CD | GitHub Actions |

---

## Arhitectura aplicației

Arhitectura este de tip **client-server cu API REST**:

```
Browser (React + Vite)
        ↓ HTTP / JSON
Django REST Framework (API)
        ↓ ORM
Baza de date (SQLite / PostgreSQL)
        ↓ MCP tools
Agent AI (n8n + FastMCP)
```

---

## Echipa și contribuții

### Vișan Cristian Andrei

- **FileTree** — creare, editare și ștergere foldere și fișiere; editare Markdown live; conversie Markdown → PDF; criptarea conținutului fișierelor la stocare
- **Algoritm de recomandare flashcarduri** — SVD (Singular Value Decomposition) aplicat pe rata de succes zilnică per deck
- **Grupuri** — interfața UI, pool de flashcarduri comune și fișiere comune între membrii grupului
- **Workflow n8n** — integrarea agentului AI prin webhook; promptul agentului, specializat pentru a ajuta utilizatorul să învețe
- **Sistemul de tokeni** — mecanismul de consum al tokenilor la fiecare acțiune AI; fix-ul formulei de calcul

### Cărămidă Ioana Cătălina

- **Autentificare** — înregistrare și login cu token auth (Djoser), rute protejate, gestionarea erorilor
- **Modulul Flashcards** — creare deck-uri și carduri, parcurgere cu flip, marcaj known/unknown, salvarea sesiunilor cu greșeli și răspunsuri
- **Grupuri (backend)** — modelele `UserGroup`, `Deck-Group`, `Files-Group`; permisiuni și partajarea resurselor între membri
- **Serverele MCP** — implementarea completă a `viewer_server.py` și `creator_server.py`: tool-uri pentru citirea fișierelor, listarea folderelor, vizualizarea deck-urilor, crearea de flashcarduri și fișiere
- **Teste automate și CI/CD** — workflow GitHub Actions, suite de teste pytest (backend) și Vitest (frontend), linter Ruff și ESLint

### Spătaru Georgiana Valentina

- **Modulul Pomodoro** — timer configurabil, task management, notificări browser, istoric sesiuni, persistența sesiunii la navigare între pagini, modele și API backend
- **Dashboard** — salut personalizat, patru carduri de statistici (medie zilnică focus, trend față de ieri, focus cumulat, tokeni totali), shortcut-uri rapide, obiective lunare cu bare de progres
- **Pagina Home** — logo SVG animat cu icoane orbitale, carduri de prezentare module
- **Raport de activitate și tokeni** — agregare lunară (timp focus, carduri, puncte Pomodoro + flashcard, tokeni); formula `tokeni = puncte + (secunde_focus ÷ 60)`; tokeni disponibili: `2500 + câștigați − consumați`; trend zilnic (azi vs ieri)
- **Chatbot UI global** — panoul de chatbot disponibil pe orice pagină, redimensionabil și minimizabil, cu afișarea bugetului de tokeni în timp real
- **Statistici grup** — tab cu activitatea lunară per membru în cadrul grupului
- **Tool `update_agent_memory`** — tool MCP în viewer server care salvează observațiile AI despre student fără a consuma tokeni

---

## Funcționalități principale

### Autentificare
- Înregistrare și login cu token-based auth
- Rute protejate — utilizatorii neautentificați sunt redirecționați la `/auth`
- API: `/api/auth/`

### Pomodoro
- Timer cu sesiuni de focus și pauze scurte/lungi configurabile
- Task management cu estimări vs. realizat
- Sesiunea continuă indiferent de pagina pe care se află utilizatorul
- Modele: `PomodoroSession`, `PomodoroTask`
- API: `/api/pomodoro/`

### Flashcards
- Deck-uri cu carduri, sesiuni de parcurgere cu flip și marcaj known/unknown
- Algoritm SVD de recomandare a deck-urilor pe baza activității
- Răspunsurile corecte acordă puncte înregistrate per sesiune
- Modele: `Deck`, `Flashcard`, `DeckSession`, `UserCardProgress`
- API: `/api/flashcards/`

### FileTree
- Creare, editare și ștergere foldere și fișiere
- Editare Markdown live, conversie → PDF, preview integrat
- Conținut criptat la stocare
- API: `/api/filesystem/`

### Grupuri
- Pool de flashcarduri comune (adăugate din deck-urile proprii sau generate din fișiere)
- Pool de fișiere comune partajate între membri
- Tab statistici cu activitatea lunară per membru
- Chatbot de grup cu acces strict la resursele adăugate în grup
- API: `/api/groups/`

### Asistentul AI (Chatbot)
- Disponibil global pe orice pagină, redimensionabil
- Workflow n8n cu agent AI și prompt custom specializat pentru studiu
- Chatbot personal: acces la propriile fișiere și deck-uri
- Chatbot de grup: acces strict la resursele grupului
- Fiecare acțiune AI deduce tokeni din buget

### Agenți MCP (Model Context Protocol)

**Viewer server** — tool-uri de citire:
| Tool | Descriere |
|---|---|
| `list_folders` | Listează folderele utilizatorului |
| `read_file` | Citește conținutul unui fișier |
| `view_deck` | Listează cardurile dintr-un deck |
| `update_agent_memory` | Salvează observațiile AI despre student fără a consuma tokeni |

**Creator server** — tool-uri de scriere:
| Tool | Descriere |
|---|---|
| `create_flashcard` | Creează un card nou într-un deck |
| `create_folder` | Creează un folder nou |
| `create_file` | Creează un fișier nou |

### Memoria agentului AI
Modelul `AgentMemory` stochează observațiile AI despre fiecare student între sesiuni:

| Câmp | Descriere |
|---|---|
| `excel_subjects` | Materiile la care studentul excelează |
| `poor_subjects` | Materiile la care studentul întâmpină dificultăți |
| `notes` | Observații generale despre obiceiurile de studiu |
| `consumed_tokens` | Total tokeni consumați pe acțiuni AI |

### Sistemul de puncte și tokeni
- Puncte din flashcarduri (1 per răspuns corect) și din Pomodoro (1 per ciclu completat)
- Formula: `tokeni = puncte + (secunde_focus ÷ 60)`
- Tokeni disponibili: `2500 (bază) + tokeni_câștigați − tokeni_consumați`
- API: `/api/activity/`, `/api/agents/`

### Teste automate
- GitHub Actions rulează la fiecare push și pull request
- Backend: pytest + Ruff
- Frontend: Vitest + ESLint

---

## Structura bazei de date

```
User
 ├── PomodoroSession (status, focus_time, completed_pomodoros, points)
 ├── PomodoroTask (title, estimated, completed)
 ├── Deck
 │    ├── Flashcard (question, answer)
 │    ├── DeckSession (mistakes, responses)
 │    └── UserCardProgress (status, last_reviewed)
 ├── Folder
 │    └── File (content criptat)
 ├── UserGroup (membri, permisiuni)
 ├── FlashcardPointLog (puncte per răspuns corect)
 └── AgentMemory (excel_subjects, poor_subjects, notes, consumed_tokens)
```

---

## Pornirea proiectului

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

### Serverele MCP (opțional — necesare pentru tool-urile agentului AI)

```bash
cd backend/MCP_server
python viewer_server.py
python creator_server.py
```

---

## Rute principale

| Rută | Descriere |
|---|---|
| `/auth` | Login și înregistrare |
| `/dashboard` | Dashboard personal cu statistici și shortcut-uri |
| `/pomodoro` | Timer de focus |
| `/flashcards` | Deck-uri și recapitulare |
| `/filetree` | Sistem de fișiere |
| `/group` | Spații collaborative de grup |

---

## Endpoints API

| Endpoint | Descriere |
|---|---|
| `/api/auth/` | Autentificare (Djoser) |
| `/api/pomodoro/` | Sesiuni și taskuri Pomodoro |
| `/api/flashcards/` | Deck-uri și carduri |
| `/api/filesystem/` | Foldere și fișiere |
| `/api/groups/` | Grupuri și membri |
| `/api/activity/` | Raport lunar de activitate și tokeni |
| `/api/agents/` | Puncte flashcard, memoria agentului AI |
