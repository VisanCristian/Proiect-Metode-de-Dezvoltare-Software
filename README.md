# StudyAPP

**StudyAPP** este o platformă web educațională care reunește într-un singur ecosistem toate instrumentele de care un student are nevoie: sesiuni de studiu cronometrate (Pomodoro), flashcard-uri cu recapitulare activă, gestiune de fișiere și notițe, colaborare în grupuri de studiu și un asistent AI integrat care învață stilul fiecărui utilizator.

Înainte de StudyAPP, un student tipic folosea instrumente fragmentate — o aplicație separată de timer, o platformă externă de flashcard-uri, un cloud storage diferit pentru notițe — fără nicio legătură între ele și fără un progres unificat. StudyAPP elimină această fragmentare: un singur cont, o singură interfață, statistici centralizate și un agent AI care știe exact ce ai studiat.

> Proiect realizat de **Vișan Cristian Andrei**, **Cărămidă Ioana Cătălina** și **Spătaru Georgiana Valentina**.

---

## Cuprins

- [Arhitectura aplicației](#arhitectura-aplicației)
- [Stack tehnologic](#stack-tehnologic)
- [Funcționalități](#funcționalități)
- [Structura bazei de date](#structura-bazei-de-date)
- [Workflow-ul AI (n8n)](#workflow-ul-ai-n8n)
- [Sistemul de puncte și token-uri](#sistemul-de-puncte-și-token-uri)
- [Echipa și contribuțiile](#echipa-și-contribuțiile)
- [Rute și endpoint-uri](#rute-și-endpoint-uri)
- [Rularea proiectului](#rularea-proiectului)
- [Teste automate și CI/CD](#teste-automate-și-cicd)

---

## Arhitectura aplicației

Aplicația urmează o **arhitectură client-server cu API REST**, extinsă cu un strat de orchestrare AI bazat pe n8n și servere MCP (Model Context Protocol).

![Diagrama arhitecturii](docs/diagrama_arhitectura.png)

Fluxul principal de date: browserul (React + Vite) comunică prin cereri HTTP/JSON cu backend-ul Django REST Framework, care accesează baza de date prin ORM. Pentru funcționalitățile AI, frontend-ul trimite mesaje printr-un webhook către workflow-ul n8n (rulat în Docker), care orchestrează un agent AI cu acces la serverele MCP — două servere FastMCP specializate: unul de citire (Viewer Server) și unul de scriere (Creator Server), care interacționează cu baza de date și sistemul de fișiere.

---

## Stack tehnologic

| Componentă | Tehnologie |
|---|---|
| Frontend | React 19, Vite, React Router 7 |
| Backend | Django 6, Django REST Framework |
| Autentificare | Djoser + Token Auth |
| Baza de date | PostgreSQL (producție) / SQLite (dezvoltare) |
| AI / Agenți | n8n (Docker, port 5678), FastMCP (port 8001), OpenRouter |
| PDF | pdfplumber, reportlab, pdfminer |
| Markdown | react-markdown, rehype-katex (formule matematice) |
| Testare | pytest + Ruff (backend), Vitest + ESLint (frontend) |
| CI/CD | GitHub Actions |

---

## Funcționalități

### Autentificare

Înregistrare și login cu autentificare bazată pe token (Djoser). Utilizatorii neautentificați sunt redirecționați automat către pagina de login. Fiecare cerere API include token-ul în header-ul `Authorization`.

### Pomodoro

Timer configurabil cu intervale de focus, pauze scurte și pauze lungi. Fiecare sesiune poate avea sarcini asociate cu estimări versus timp real. Timer-ul persistă indiferent de pagina pe care navighează utilizatorul (stare globală prin React Context). La finalul fiecărui ciclu se acordă puncte, iar sesiunea completă se salvează cu toate metricile (timp total de focus, cicluri completate, puncte).

Modele: `PomodoroSession`, `PomodoroTask`

### Flashcard-uri

Sistem complet de studiu cu carduri: creare de deck-uri manual sau din PDF (extragere automată), parcurgere prin flip (întrebare → răspuns), marcaj known/unknown per card, și sesiuni de studiu cu metrici detaliate (greșeli, răspunsuri). Algoritmul de recomandare SVD (Singular Value Decomposition) analizează 90 de zile de istoric și identifică deck-urile mai dificile pentru fiecare utilizator, prioritizându-le în sesiunile viitoare. Evaluarea AI permite utilizatorului să scrie răspunsul cu text liber, iar agentul verifică corectitudinea și acordă puncte.

Modele: `Deck`, `Flashcard`, `UserCardProgress`, `DeckSession`, `SourceDocument`

### Gestiune fișiere (FileTree)

Sistem de dosare și fișiere cu CRUD complet, editor Markdown live cu preview în timp real (inclusiv formule matematice prin KaTeX), conversie Markdown → PDF, și criptare opțională a conținutului la nivel de fișier (cheie unică per utilizator). Fișierele pot fi exportate sau vizualizate direct în aplicație.

Modele: `Folder`, `File`, `EncryptionKey`

### Grupuri de studiu

Spații colaborative create prin token unic de invitare. Membrii unui grup pot partaja deck-uri de flashcard-uri și fișiere, pot juca deck-urile celorlalți, și pot vedea statisticile de activitate ale fiecărui membru (ore de focus, carduri rezolvate, puncte). Fiecare grup are un chatbot contextual cu acces strict doar la resursele adăugate în acel grup.

Modele: `Group`, `UserGroup`, `GroupDeck`, `GroupFile`

### Asistent AI (Chatbot)

Chatbot disponibil global pe toate paginile aplicației, într-un panou colapsabil și redimensionabil. Chatbot-ul personal are acces la fișierele și deck-urile utilizatorului; chatbot-ul de grup are acces strict la resursele grupului. Fiecare acțiune AI consumă token-uri din bugetul utilizatorului, afișat în timp real.

Agentul AI este specializat în asistarea studiului: oferă explicații adaptate nivelului studentului, generează flashcard-uri și fișiere de rezumat, și propune exerciții practice când detectează dificultăți repetate.

### Servere MCP (Model Context Protocol)

**Viewer Server** — unelte de citire:

| Unealtă | Descriere |
|---|---|
| `list_folders` | Listează folderele utilizatorului |
| `read_file` | Citește conținutul unui fișier |
| `view_deck` | Listează cardurile dintr-un deck |
| `update_agent_memory` | Salvează observațiile AI despre student (fără consum de token-uri) |

**Creator Server** — unelte de scriere:

| Unealtă | Descriere |
|---|---|
| `create_flashcard` | Creează un card nou într-un deck |
| `create_folder` | Creează un folder nou |
| `create_file` | Creează un fișier nou |

### Memorie agent

Modelul `AgentMemory` stochează observațiile AI despre fiecare student de-a lungul sesiunilor: materiile la care excelează, materiile la care are dificultăți, notițe generale despre obiceiurile de studiu și token-urile consumate.

### Dashboard

Pagina principală afișează un salut dinamic bazat pe oră, patru carduri de statistici (focus mediu zilnic, trend față de ieri, focus total, token-uri disponibile), shortcut-uri rapide către toate modulele și obiective lunare cu bare de progres. Raportul de activitate lunară agregă timpul de focus, cardurile rezolvate, punctele din flashcard-uri și Pomodoro, și token-urile calculate.

---

## Structura bazei de date

![Diagrama bazei de date](docs/diagrama_baza_de_date.png)

Baza de date conține 15 tabele organizate în 5 module funcționale, toate legate de tabelul central `User` din Django. Relațiile principale sunt de tip OneToMany (un utilizator are mai multe sesiuni, deck-uri, foldere) și ManyToMany prin tabele de legătură (GroupDeck, GroupFile, UserGroup).

Structura ierarhică per modul:

```
User
 ├── PomodoroSession (status, focus_time, completed_pomodoros, points)
 │    └── PomodoroTask (title, estimated, completed)
 ├── Deck (title, description, source_file)
 │    ├── Flashcard (question, answer)
 │    ├── DeckSession (mistakes, responses)
 │    └── UserCardProgress (status, last_reviewed)
 ├── Folder (name)
 │    └── File (name, location, is_encrypted)
 ├── AgentMemory (excel_subjects, poor_subjects, notes, consumed_tokens)
 ├── FlashcardPointLog (flashcard_id, points, earned_at)
 └── UserGroup → Group
      ├── GroupDeck → Deck
      └── GroupFile → File
```

---

## Workflow-ul AI (n8n)

![Workflow-ul n8n](docs/workflow_n8n.png)

Workflow-ul n8n orchestrează comunicarea dintre chatbot și agentul AI. Fluxul de date: Webhook (primește mesajul de la frontend) → Edit Fields (formatare) → AI Agent (procesare cu prompt specializat) → Respond to Webhook (răspuns). Agentul principal folosește un model AI prin OpenRouter, memorie persistentă în PostgreSQL, și are acces la uneltele MCP prin sub-agenți. Sub-agentul (AI Agent Tool) este specializat în generarea de conținut educațional structurat (flashcard-uri, fișiere de rezumat, exerciții).

---

## Sistemul de puncte și token-uri

Sistemul de gamificare motivează studiul consistent printr-un buget de token-uri care se câștigă prin activitate și se consumă la acțiunile AI.

**Câștigare puncte:**
- +1 punct per răspuns corect la flashcard-uri
- +1 punct per ciclu Pomodoro completat

**Formula token-urilor:**
```
token-uri disponibile = 2500 (buget inițial) + puncte + (secunde_focus ÷ 60) − token-uri consumate
```

**Consum token-uri:**
- −50 token-uri per acțiune AI (citire fișiere, generare deck-uri, asistență chatbot)
- 0 token-uri pentru `update_agent_memory` (economia de token-uri pentru observații)

---

## Echipa și contribuțiile

### Vișan Cristian Andrei

- **FileTree** — creare, editare și ștergere de foldere și fișiere; editare Markdown live; conversie Markdown → PDF; criptare conținut la nivel de fișier
- **Algoritm de recomandare flashcard-uri** — SVD (Singular Value Decomposition) aplicat pe rata de succes zilnică per deck, pe 90 de zile de istoric
- **Grupuri** — interfață de grup, pool comun de flashcard-uri și fișiere partajate între membrii grupului
- **Workflow n8n** — integrare agent AI via webhook, prompt custom specializat pentru asistarea studiului, configurare Docker
- **Sistem de token-uri** — mecanism de consum token-uri per acțiune AI, corectare formulă

### Cărămidă Ioana Cătălina

- **Autentificare** — înregistrare și login cu token auth (Djoser), rute protejate, tratare erori
- **Modul flashcard-uri** — creare deck-uri și carduri, parcurgere flip, marcaj known/unknown, salvare sesiuni cu greșeli și răspunsuri
- **Grupuri (backend)** — modele `UserGroup`, `GroupDeck`, `GroupFile`; permisiuni și partajare resurse între membri
- **Servere MCP** — implementare completă `viewer_server.py` și `creator_server.py`: unelte de citire fișiere, listare foldere, vizualizare deck-uri, creare flashcard-uri și fișiere
- **Teste automate și CI/CD** — workflow GitHub Actions, suită de teste pytest (backend) și Vitest (frontend), linting cu Ruff și ESLint

### Spătaru Georgiana Valentina

- **Modul Pomodoro** — timer configurabil, gestiune sarcini, notificări browser, istoric sesiuni, persistență timer la navigare între pagini, modele și API backend
- **Dashboard** — salut personalizat, patru carduri de statistici (focus mediu zilnic, trend față de ieri, focus total, token-uri totale), shortcut-uri rapide, obiective lunare cu bare de progres
- **Pagina Home** — logo SVG animat cu icoane orbitale, carduri rezumative per modul
- **Raport activitate și sistem de token-uri** — agregare lunară (timp focus, carduri, puncte Pomodoro + flashcard-uri, token-uri); formula `tokens = points + (focus_seconds ÷ 60)`; token-uri disponibile: `2500 + câștigate − consumate`; trend zilnic (azi vs ieri)
- **Chatbot UI global** — panou de chatbot disponibil pe toate paginile, redimensionabil și colapsabil, cu afișare buget token-uri în timp real
- **Statistici de grup** — tab cu activitatea lunară a fiecărui membru din grup
- **Unealta `update_agent_memory`** — unealtă MCP în viewer server care salvează observațiile AI despre student fără a consuma token-uri

---

## Rute și endpoint-uri

### Rute frontend

| Rută | Descriere |
|---|---|
| `/auth` | Login și înregistrare |
| `/dashboard` | Dashboard personal cu statistici și shortcut-uri |
| `/pomodoro` | Timer de focus |
| `/flashcards` | Deck-uri de flashcard-uri și recapitulare |
| `/filetree` | Sistem de fișiere |
| `/group` | Spații de studiu colaborativ |

### Endpoint-uri API

| Endpoint | Descriere |
|---|---|
| `/api/auth/` | Autentificare (Djoser) |
| `/api/pomodoro/` | Sesiuni și sarcini Pomodoro |
| `/api/flashcards/` | Deck-uri și carduri |
| `/api/filesystem/` | Foldere și fișiere |
| `/api/groups/` | Grupuri și membri |
| `/api/activity/` | Raport activitate lunară și token-uri |
| `/api/agents/` | Puncte flashcard-uri, memorie agent |

---

## Rularea proiectului

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

### Servere MCP (opțional — necesare pentru uneltele agentului AI)

```bash
cd backend/MCP_server
python viewer_server.py
python creator_server.py
```

### n8n (opțional — necesar pentru chatbot)

```bash
cd Docker/n8n
docker compose up -d
```

Interfața n8n devine accesibilă la `http://localhost:5678`. Workflow-ul se importă din fișierul JSON furnizat și necesită configurarea credențialelor OpenRouter și PostgreSQL.

---

## Teste automate și CI/CD

Proiectul folosește GitHub Actions cu 6 job-uri paralele la fiecare push și pull request:

- **Linting:** Ruff (Python) + ESLint (JavaScript)
- **Teste backend:** pytest, separate pe module (auth, flashcards, groups, filesystem, pomodoro/activity)
- **Teste frontend:** Vitest

Rulare locală:

```bash
# Backend
cd backend
python -m pytest

# Frontend
cd frontend
npm test
```
