# README - pagina Pomodoro

## Ce am acum in pagina Pomodoro

Eu in pagina mea Pomodoro am deja urmatoarele functionalitati:

1. **Timer de tip Pomodoro** - timerul principal cu care pornesc sesiunea de lucru si urmaresc timpul ramas.
2. **Faze de lucru: `focus`, `break`, `longbreak`** - aplicatia schimba fazele in functie de progresul sesiunii.
3. **Butoane de `start`, `pause`, `reset`, `skip`** - pot porni timerul, il pot pune pe pauza, il pot reseta sau pot sari direct la faza urmatoare.
4. **Setari pentru durata fiecarei faze** - pot schimba durata pentru focus, pauza scurta si pauza lunga.
5. **Setare pentru numarul de cicluri pana la pauza lunga** - pot controla dupa cate sesiuni de focus primesc o pauza lunga.
6. **Optiune `auto start` in interfata** - exista optiunea in UI si este salvata in setari.
7. **Lista de task-uri** - am o zona separata in care imi vad toate task-urile pentru sesiune.
8. **Adaugare task** - pot crea task-uri noi cu titlu si estimare de pomodoro-uri.
9. **Bifare task ca finalizat** - pot marca un task drept terminat.
10. **Stergere task** - pot elimina task-urile de care nu mai am nevoie.
11. **Reordonare task-uri prin drag and drop** - pot schimba ordinea task-urilor direct din interfata.
12. **Selectare task activ** - pot alege pe ce task lucrez in momentul respectiv.
13. **Incrementare automata a numarului de pomodoro-uri facute pe taskul activ** - cand se termina un focus, progresul task-ului activ se actualizeaza automat.
14. **Sesiune de studiu cu start si end** - sesiunea incepe separat si poate fi incheiata cand consider ca am terminat.
15. **Calcul pentru timpul total de focus** - aplicatia aduna timpul efectiv petrecut in fazele de concentrare.
16. **Calcul pentru timpul total de pauza** - aplicatia aduna si timpul petrecut in pauze.
17. **Istoric de sesiuni** - sesiunile incheiate se salveaza si pot fi vazute ulterior.
18. **Rezumat la final de sesiune** - la final vad un sumar cu ce am facut in sesiunea respectiva.
19. **Puncte calculate din pomodoro-urile completate** - punctajul este calculat pe baza numarului de pomodoro-uri terminate.
20. **Notificari in browser** - aplicatia trimite notificari la schimbarea fazei.
21. **Sunete la schimbarea fazei** - exista feedback audio diferit atunci cand incepe o faza noua.

## Cum salvez datele acum

In momentul de fata, pagina mea nu foloseste baza de date. Eu salvez totul in `localStorage`, in 3 chei:

1. `pomodoro_settings`
2. `pomodoro_tasks`
3. `pomodoro_sessions`

Asta inseamna ca si tabelele din baza de date trebuie sa fie construite in functie de aceste 3 tipuri de date, ca sa fie in concordanta cu ce am deja implementat.

## Ideea principala

Pentru pagina mea Pomodoro, am nevoie doar de tabelele care acopera exact ce exista deja:

1. setarile timerului
2. task-urile mele
3. sesiunile mele de studiu
4. task-urile salvate in interiorul fiecarei sesiuni, ca sa nu pierd istoricul

## Culorile principale folosite in pagina

Pun aici culorile exact cum le am eu in cod, ca sa fie clar ce am folosit si unde.

Eu am atat light mode, cat si dark mode pentru ca in `frontend/src/index.css` am doua seturi de variabile de culoare:

1. culorile din `:root`, care sunt varianta standard
2. culorile din `@media (prefers-color-scheme: dark)`, care se aplica automat daca sistemul utilizatorului este pe dark mode

Asta inseamna ca pagina isi schimba automat culorile in functie de tema sistemului, chiar daca eu nu am un buton separat de switch pentru tema.

### 1. Culorile de baza din tema light

Acestea sunt culorile puse in `frontend/src/index.css` si sunt baza vizuala a paginii:

| Variabila | Cod | Cum am folosit-o |
| --- | --- | --- |
| `--bg` | `#1C2167` | fundalul general al paginii |
| `--primary` | `#2c3e50` | culoare principala de tema |
| `--primary-light` | `#34495e` | varianta mai deschisa a culorii principale |
| `--primary-dark` | `#1a252f` | varianta mai inchisa a culorii principale |
| `--surface` | `#f0f4f8` | fundaluri secundare |
| `--surface-card` | `#ffffff` | carduri si panouri |
| `--surface-card-solid` | `#ffffff` | varianta opaca pentru carduri in light mode |
| `--text` | `#5a6d7e` | text secundar |
| `--text-h` | `#1e2d3d` | titluri si text important |
| `--border` | `#d5dde5` | borduri pentru task-uri, input-uri, butoane si panouri |
| `--code-bg` | `#e8eef3` | fundal pentru zone de tip code / suport |
| `--accent` | `#5b8fb9` | accent general in pagina |
| `--accent-bg` | `rgba(91, 143, 185, 0.1)` | highlight discret pentru accente |
| `--accent-border` | `rgba(91, 143, 185, 0.4)` | border cu accent |
| `--social-bg` | `rgba(240, 244, 248, 0.8)` | fundal secundar translucid |

### 2. Culorile de baza din dark mode

Acestea sunt tot din `frontend/src/index.css`, in varianta dark:

| Variabila | Cod | Cum am folosit-o |
| --- | --- | --- |
| `--bg` | `#1C2167` | fundalul general ramane acelasi si in dark mode |
| `--primary` | `#8fa8c0` | culoare principala in dark mode |
| `--primary-light` | `#a3bbd0` | varianta mai deschisa |
| `--primary-dark` | `#6b8eaa` | varianta mai inchisa |
| `--surface` | `#141c24` | fundaluri secundare in dark mode |
| `--surface-card` | `#00bbff30` | carduri semi-transparente in dark mode |
| `--surface-card-solid` | `#2f5f8a` | fundalul opac pentru butonul si panoul de setari |
| `--text` | `#8a9bb0` | text secundar in dark mode |
| `--text-h` | `#d5dfe8` | titluri si text important in dark mode |
| `--border` | `#2a3a4a` | borduri in dark mode |
| `--code-bg` | `#1a2530` | fundal pentru zone suport in dark mode |
| `--accent` | `#6ba3cc` | accent general in dark mode |
| `--accent-bg` | `rgba(107, 163, 204, 0.12)` | highlight discret in dark mode |
| `--accent-border` | `rgba(107, 163, 204, 0.4)` | border accent in dark mode |
| `--social-bg` | `rgba(28, 40, 51, 0.8)` | fundal translucid in dark mode |

### 3. Culorile pentru fazele Pomodoro

Aceste culori sunt definite in `frontend/src/utils/constants.js` si sunt cele mai importante pentru logica vizuala a paginii:

| Faza | Cod | Cum am folosit-o |
| --- | --- | --- |
| `focus` | `#e06469` | progresul timerului, task activ, stari urgente, butonul principal cand timerul ruleaza |
| `break` | `#4ecdc4` | pauza scurta, task completat, stari pozitive, butonul principal cand timerul este oprit |
| `longbreak` | `#5b8fb9` | pauza lunga, accent general, unele icon-uri si stats |

### 4. Culorile hardcodate folosite direct in componente

Pe langa variabile, am si cateva culori puse direct in componente sau in CSS:

| Cod | Unde l-am folosit |
| --- | --- |
| `#fff` / `#ffffff` | text alb pe butoane, icon de check, thumb-ul din switch, carduri in light mode |
| `#e0646908` | fundal foarte discret pentru task-ul activ |
| `#e0646915` | fundal discret pentru badge-uri sau stats legate de focus / pomodoros |
| `#4ecdc415` | fundal discret pentru stats legate de break / task-uri completate |
| `#5b8fb915` | fundal discret pentru stats legate de accent / long break |
| `#e0a84e` | culoarea pentru puncte / stea in rezumat si istoric |
| `rgba(20, 28, 36, 0.6)` | overlay-ul din spatele modalului de rezumat |
| `rgba(224, 100, 105, 0.3)` | shadow pentru butonul principal cand timerul ruleaza |
| `rgba(78, 205, 196, 0.3)` | shadow pentru butonul principal cand timerul este oprit |
| `rgba(0, 0, 0, 0.2)` | shadow mic pentru thumb-ul din switch |

### 5. Cum le am gandite in pagina

Eu am folosit culorile cu logica asta:

1. `#1C2167` este baza paginii si da identitatea principala de fundal.
2. `#e06469` inseamna focus, activitate, urgenta si progres de lucru.
3. `#4ecdc4` inseamna break, confirmare si stare pozitiva.
4. `#5b8fb9` este accentul general si in acelasi timp culoarea pentru `longbreak`.
5. alb, bordurile si tonurile de text sunt folosite ca sa tina pagina curata si aerisita.
6. variantele cu transparenta, cum ar fi `#e0646915`, `#4ecdc415` sau `rgba(...)`, sunt folosite doar ca highlights, umbre sau fundaluri discrete.


## Tabelele de care am nevoie

Conform directiei stabilite pentru backend, schema trebuie simplificata la **doua tabele**:

1. `pomodoro_sessions`
2. `pomodoro_tasks`

Task-urile vor avea **foreign key catre sesiune**, iar pe ambele tabele vom avea si **`user_id`** pregatit pentru momentul in care vom introduce autentificarea.

### 1. `pomodoro_sessions`

Acest tabel devine tabelul principal al aplicatiei Pomodoro. El va tine:

- datele sesiunii
- setarile folosite pentru acea sesiune
- rezumatul final
- legatura cu userul

| Camp | Tip | De ce am nevoie de el |
| --- | --- | --- |
| `id` | UUID | identificator sesiune |
| `user_id` | FK -> user.id, NULL | pregatit pentru login |
| `start_time` | DATETIME | momentul de start |
| `end_time` | DATETIME, NULL | momentul de final |
| `status` | VARCHAR | de ex. `draft`, `active`, `ended`, `abandoned` |
| `focus_time` | INTEGER | durata de focus in secunde |
| `break_time` | INTEGER | durata pauzei scurte in secunde |
| `long_break_time` | INTEGER | durata pauzei lungi in secunde |
| `cycles_before_long_break` | INTEGER | dupa cate cicluri intra pauza lunga |
| `auto_start` | BOOLEAN | valoarea din switch-ul din UI |
| `total_focus_time` | INTEGER | total focus in secunde |
| `total_break_time` | INTEGER | total pauza in secunde |
| `completed_pomodoros` | INTEGER | cate pomodoro-uri am terminat |
| `points` | INTEGER | punctele calculate pentru sesiune |
| `created_at` | DATETIME | data salvarii |
| `updated_at` | DATETIME | data ultimei modificari |

### 2. `pomodoro_tasks`

Acest tabel tine task-urile dintr-o sesiune. In aceasta varianta, task-ul nu mai este tabela globala separata de snapshot; fiecare task apartine direct unei sesiuni.

| Camp | Tip | De ce am nevoie de el |
| --- | --- | --- |
| `id` | UUID | identificator task |
| `user_id` | FK -> user.id, NULL | pregatit pentru login |
| `session_id` | FK -> pomodoro_sessions.id | legatura cu sesiunea |
| `title` | VARCHAR | numele task-ului |
| `estimated_pomodoros` | INTEGER | cate pomodoro-uri estimez |
| `actual_pomodoros` | INTEGER | cate pomodoro-uri am facut efectiv |
| `completed` | BOOLEAN | daca task-ul este bifat sau nu |
| `display_order` | INTEGER | ordinea task-ului in lista |
| `created_at` | DATETIME | cand a fost creat |
| `updated_at` | DATETIME | cand a fost modificat ultima data |

## Cum se leaga tabelele intre ele

Legaturile corecte pentru ce am eu acum sunt acestea:

1. `pomodoro_sessions` este tabelul parinte
2. `pomodoro_tasks.session_id` trebuie sa pointeze catre `pomodoro_sessions.id`
3. `user_id` va exista pe ambele tabele si va fi populat cand introducem login

Pe scurt:

- o sesiune poate avea mai multe task-uri
- task-urile sunt dependente de sesiune
- setarile nu mai stau separat, ci direct pe sesiune

## Relatiile dintre tabele

| Tabel parinte | Tabel copil | Tip relatie |
| --- | --- | --- |
| `pomodoro_sessions` | `pomodoro_tasks` | one-to-many |

## Ordinea buna in care le creez

Ca sa nu am probleme cu foreign keys, ordinea buna este:

1. `pomodoro_sessions`
2. `pomodoro_tasks`

`pomodoro_tasks` se creeaza la final pentru ca depinde de `pomodoro_sessions`.

## Ce chei trebuie sa aiba

### Primary keys

Fiecare tabel trebuie sa aiba un `id` ca primary key:

- `pomodoro_sessions.id`
- `pomodoro_tasks.id`

### Foreign keys

Foreign keys:

- `pomodoro_tasks.session_id` -> `pomodoro_sessions.id`
- `pomodoro_sessions.user_id` -> `user.id`
- `pomodoro_tasks.user_id` -> `user.id`

## Ce trebuie sa stiu cand creez tabelele

### 1. Timpul sa fie salvat in secunde

In frontend eu lucrez deja in secunde, deci si in baza de date este mai bine sa pastrez tot in secunde:

- `focus_time`
- `break_time`
- `long_break_time`
- `total_focus_time`
- `total_break_time`

Asa baza de date ramane in concordanta cu codul meu actual.

### 2. Sa pun valori default unde are sens

Valori bune de default:

- `actual_pomodoros = 0`
- `completed = false`
- `auto_start = false`
- `points = 0`
- `completed_pomodoros = 0`
- `display_order = 0`

### 3. Sa nu permit valori negative

Ar fi bine sa existe reguli simple:

- `focus_time > 0`
- `break_time > 0`
- `long_break_time > 0`
- `cycles_before_long_break > 0`
- `estimated_pomodoros >= 0`
- `actual_pomodoros >= 0`
- `total_focus_time >= 0`
- `total_break_time >= 0`
- `completed_pomodoros >= 0`
- `points >= 0`

### 4. Ce se intampla daca sterg date

Pentru `pomodoro_tasks.session_id`, regula buna este:

- `ON DELETE CASCADE`

Adica daca sterg o sesiune, se sterg si task-urile asociate sesiunii respective.

Pentru `user_id`, regula buna este:

- `ON DELETE SET NULL`

Adica daca modelul de utilizator se schimba sau se sterge userul, datele Pomodoro pot ramane temporar in sistem fara sa se piarda.

### 5. Ce indexuri merita puse

Indexuri utile pentru ce am acum:

- index pe `pomodoro_tasks.session_id`
- index pe `pomodoro_tasks.user_id`
- index pe `pomodoro_tasks.display_order`
- index pe `pomodoro_sessions.user_id`
- index pe `pomodoro_sessions.start_time`

## Ce inseamna modelul cu doar 2 tabele

In varianta asta:

1. setarile nu mai stau intr-un tabel separat, ci pe sesiune
2. task-urile sunt legate direct de sesiune
3. istoricul unei sesiuni ramane corect pentru ca task-urile acelei sesiuni nu sunt reutilizate in alta sesiune

Adica:

- `pomodoro_sessions` = sesiunea + configuratia folosita + rezumatul final
- `pomodoro_tasks` = task-urile acelei sesiuni


## Legatura dintre ce am in frontend si ce voi avea in baza de date

| Ce am acum in frontend | Ce pun in baza de date |
| --- | --- |
| `pomodoro_settings` din localStorage | coloane pe `pomodoro_sessions` |
| `pomodoro_tasks` din localStorage | tabel `pomodoro_tasks` |
| `pomodoro_sessions` din localStorage | tabel `pomodoro_sessions` |
| `tasks` din fiecare sesiune salvata | tot `pomodoro_tasks`, filtrate dupa `session_id` |

## Observatie importanta

In pagina mea exista `activeTaskId`, dar acum el este doar state in React si nu este salvat in `localStorage`. Asta inseamna ca, atunci cand fac tabelele, eu **nu trebuie sa creez acum un camp special pentru task-ul activ**, pentru ca functia asta nu este persistenta in implementarea mea actuala.

Adica, in tabele eu voi face asa:

1. in `pomodoro_sessions` salvez datele sesiunii + setarile folosite in acea sesiune
2. in `pomodoro_tasks` salvez task-urile acelei sesiuni
3. adaug `user_id` pe ambele tabele, ca sa fie pregatite pentru login
4. nu adaug acum coloana `is_active` si nu adaug acum nici `active_task_id`

Motivul este ca eu vreau ca tabelele sa fie in concordanta cu ce face pagina mea acum, nu cu o functionalitate pe care poate o voi adauga mai tarziu.

Daca mai tarziu decid ca task-ul activ trebuie pastrat dupa refresh sau intre sesiuni, atunci am doua variante bune:

1. adaug un camp `is_active` in `pomodoro_tasks`
2. adaug un camp `active_task_id` intr-un tabel separat de stare curenta

Dar pentru versiunea mea actuala, alegerea corecta este sa nu complic tabelele si sa salvez doar ce este deja persistent in pagina.

## Concluzie

Pentru directia actuala stabilita cu colegul meu, schema corecta si suficienta este:

1. `pomodoro_sessions`
2. `pomodoro_tasks`

cu:

- `pomodoro_tasks.session_id` ca FK spre sesiune
- `user_id` ca FK pregatit pe ambele tabele

---

## Plan backend Pomodoro

## Problema

Frontend-ul Pomodoro este deja functional si persista datele in `localStorage` (`pomodoro_settings`, `pomodoro_tasks`, `pomodoro_sessions`), dar backend-ul este inca la nivel de schelet Django:

- exista doar proiectul `StudyAPP`
- nu exista Django REST Framework
- nu exista aplicatie backend pentru Pomodoro
- nu exista modele, API-uri sau migratii pentru schema descrisa in acest README

Trebuie implementat backend-ul astfel incat:

1. sa respecte conventiile colegului meu (`models.py`, `serializers.py`, `views.py`, `urls.py`, `selectors.py`, `services.py`, `permissions.py`)
2. sa fie compatibil cu datele si fluxurile deja existente in frontend
3. sa pregateasca inlocuirea `localStorage` cu API calls fara sa ceara schimbari majore in UI

## Starea actuala a proiectului

### Frontend

Pomodoro are deja:

- timer complet (`focus`, `break`, `longbreak`)
- setari configurabile si persistate
- task-uri persistate si reordonabile
- sesiuni salvate cu istoric si sumar
- notificari si sunete

Persistenta actuala este locala, prin:

- `pomodoro_settings`
- `pomodoro_tasks`
- `pomodoro_sessions`

### Backend

Backend-ul actual are:

- `StudyAPP/settings.py` cu PostgreSQL configurat, dar cu credentiale diferite fata de standardul primit
- doar ruta `admin/`
- o aplicatie `FileTree` goala, nefolosita
- fara DRF
- fara structura `apps/`

## Presupuneri de lucru

Planul de mai jos pleaca de la urmatoarele presupuneri:

1. **Nu exista autentificare acum**, deci backend-ul Pomodoro va fi tratat ca **single-user / single-workspace**.
2. **Nu persistam `activeTaskId`**, pentru ca nici frontend-ul actual nu il persista.
3. **Vom avea doar 2 tabele reale in backend: `pomodoro_sessions` si `pomodoro_tasks`.**
4. **Frontend-ul ramane neschimbat in prima faza**, iar backend-ul va fi construit astfel incat in pasul urmator sa pot inlocui `pomodoro_storage.js` cu API calls.
5. Pentru dezvoltare locala, daca frontend-ul ruleaza separat de backend, va fi nevoie de **CORS** sau de un proxy; planul recomanda CORS in backend.

Daca ulterior introducem useri, relatia este deja pregatita prin `user_id`. In implementarea Django, aceasta relatie trebuie definita prin `settings.AUTH_USER_MODEL`, nu hardcodat catre un tabel `user`.

## Schema tinta

### Modele de implementat

1. `PomodoroSession`
2. `PomodoroTask`

### Relatii

- `PomodoroSession` 1 -> N `PomodoroTask`
- `User` 1 -> N `PomodoroSession`
- `User` 1 -> N `PomodoroTask`

### Reguli importante

- toate duratele in secunde
- `user_id` pregatit din prima
- valori implicite:
  - `actual_pomodoros = 0`
  - `completed = False`
  - `auto_start = False`
  - `completed_pomodoros = 0`
  - `points = 0`
  - `display_order = 0`
- validari non-negative
- `session_id` cu `CASCADE`
- `user_id` cu `SET NULL`
- indexuri pentru:
  - `session_id`
  - `user_id`
  - `display_order`
  - `start_time`

### Sesiunea `draft`

Ca planul sa ramana compatibil cu frontend-ul actual, trebuie sa existe explicit conceptul de **sesiune `draft`**:

1. utilizatorul are o sesiune curenta de tip `draft`
2. setarile curente se salveaza pe aceasta sesiune `draft`
3. task-urile curente se leaga de aceasta sesiune `draft`
4. cand utilizatorul apasa Start, sesiunea `draft` devine `active`
5. cand sesiunea se termina, statusul devine `ended`
6. dupa finalizare sau abandon, backend-ul poate crea o noua sesiune `draft`

Asta inlocuieste vechiul model in care setarile si task-urile erau persistate separat in afara sesiunii.

## Structura backend recomandata

```text
backend/
├── manage.py
├── apps/
│   ├── __init__.py
│   └── pomodoro/
│       ├── __init__.py
│       ├── admin.py
│       ├── apps.py
│       ├── models.py
│       ├── serializers.py
│       ├── selectors.py
│       ├── services.py
│       ├── permissions.py
│       ├── views.py
│       ├── urls.py
│       ├── tests/
│       │   ├── __init__.py
│       │   ├── test_models.py
│       │   ├── test_services.py
│       │   └── test_api.py
│       └── migrations/
└── StudyAPP/
    ├── settings.py
    └── urls.py
```

## API tinta recomandata

Pentru a ramane aproape de frontend-ul actual, API-ul trebuie sa expuna resursele care corespund exact cheilor din `localStorage`.

### Sessions

- `GET /api/pomodoro/sessions/`
- `POST /api/pomodoro/sessions/`
- `GET /api/pomodoro/sessions/current/`
- `GET /api/pomodoro/sessions/<uuid:session_id>/`
- `PATCH /api/pomodoro/sessions/<uuid:session_id>/`
- `DELETE /api/pomodoro/sessions/clear/`

### Tasks

- `GET /api/pomodoro/tasks/?session_id=<uuid>`
- `POST /api/pomodoro/tasks/`
- `PATCH /api/pomodoro/tasks/<uuid:task_id>/`
- `DELETE /api/pomodoro/tasks/<uuid:task_id>/`
- `POST /api/pomodoro/tasks/reorder/`

### Observatie

Nu recomand in prima versiune un flux mare de endpoint-uri dedicate pentru fiecare pas intern al timerului. Singura exceptie utila este tranzitia explicita din `draft` in `active`:

- `POST /sessions/<uuid:session_id>/start/`

Nu este nevoie de endpoint separat de tip `/end_session/`, pentru ca finalizarea poate ramane un `PATCH` pe sesiune cu valorile finale. Prima versiune trebuie sa fie aliniata cu implementarea reala din UI, nu cu un flux teoretic mai mare decat ce exista deja.

## Plan de implementare

### Faza 1 — infrastructura backend

Obiectiv: pregatirea proiectului Django pentru o aplicatie REST reala.

#### Ce modific

1. in `requirements.txt` adaug:
   - `djangorestframework`
   - `django-cors-headers` (recomandat pentru dev local)
2. creez `backend/apps/`
3. creez aplicatia `pomodoro` sub `backend/apps/pomodoro`
4. actualizez `StudyAPP/settings.py`:
   - credentialele PostgreSQL conform conventiei primite
   - `INSTALLED_APPS`:
     - `rest_framework`
     - `corsheaders`
     - `apps.pomodoro`
   - `MIDDLEWARE`:
     - `corsheaders.middleware.CorsMiddleware`
   - CORS pentru frontend local (`http://localhost:5173`)
5. actualizez `StudyAPP/urls.py` cu:
   - `path("api/pomodoro/", include("apps.pomodoro.urls"))`

#### Rezultat

Proiectul poate porni ca backend REST si are infrastructura minima pentru a servi frontend-ul.

---

### Faza 2 — modelele si migratiile

Obiectiv: implementarea schemei de baza de date simplificate din README.

#### Ce implementez in `models.py`

1. `PomodoroSession`
   - `id` UUID
   - `user` FK nullable catre `settings.AUTH_USER_MODEL`
   - `start_time`
   - `end_time`
   - `status`
   - `focus_time`
   - `break_time`
   - `long_break_time`
   - `cycles_before_long_break`
   - `auto_start`
   - `total_focus_time`
   - `total_break_time`
   - `completed_pomodoros`
   - `points`
   - timestamps

2. `PomodoroTask`
   - `id` UUID
   - `user` FK nullable catre `settings.AUTH_USER_MODEL`
   - `session` FK catre sesiune
   - `title`
   - `estimated_pomodoros`
   - `actual_pomodoros`
   - `completed`
   - `display_order`
   - timestamps

#### Ce reguli adaug

- `CheckConstraint` pentru campuri non-negative
- `db_index=True` unde merita
- ordering implicit pentru task-uri si sesiuni

#### Ce mai fac

1. in `admin.py` inregistrez ambele modele
2. rulez:
   - `makemigrations`
   - `migrate`

#### Rezultat

Am schema completa a bazei de date, aliniata cu frontend-ul actual.

---

### Faza 3 — selectors si services

Obiectiv: separarea logicii de citire si scriere dupa conventia colegului meu.

#### `selectors.py`

Functiile de citire recomandate:

- `get_current_draft_session()`
- `get_or_create_draft_session()`
- `list_tasks(session_id=None)`
- `get_task_by_id(task_id)`
- `list_sessions()`
- `get_session_by_id(session_id)`

#### `services.py`

Functiile de scriere recomandate:

- `create_task(data)`
- `update_task(task, data)`
- `delete_task(task)`
- `reorder_tasks(task_orders)`
- `create_session(data)`  # pentru crearea initiala a unei sesiuni draft
- `update_session_settings(session, data)`
- `start_session(session)`
- `finish_session(session, data)`
- `abandon_session(session)`
- `clear_sessions()`

#### Reguli pentru service-ul de sesiune

Modelul recomandat pentru sesiune este:

1. `create_session(data)` creeaza sau initializeaza o sesiune `draft`
2. `update_session_settings(session, data)` modifica setarile sesiunii `draft`
3. `start_session(session)` schimba statusul din `draft` in `active`
4. `finish_session(session, data)` inchide sesiunea cu valorile finale
5. `abandon_session(session)` marcheaza sesiunea ca `abandoned`

`finish_session(session, data)` trebuie sa:

1. actualizeze sesiunea cu valorile finale
2. marcheze sesiunea ca `ended`
3. lase task-urile legate direct de sesiunea respectiva
4. ruleze totul intr-o tranzactie atomica

#### Rezultat

Am stratul de business si de acces la date separat, clar si usor de testat.

---

### Faza 4 — serializers

Obiectiv: validarea request-urilor si formatarea raspunsurilor JSON.

#### Serializers de intrare / iesire recomandate

- `PomodoroTaskSerializer`
- `PomodoroTaskUpdateSerializer`
- `PomodoroTaskReorderSerializer`
- `PomodoroSessionSerializer`
- `PomodoroSessionCreateSerializer`
- `PomodoroSessionSettingsSerializer`
- `PomodoroSessionFinishSerializer`

#### Validari importante

- duratele > 0
- ciclurile > 0
- valori non-negative pentru pomodoros si points
- `title` obligatoriu pentru task-uri
- lista de reorder sa contina perechi `id + display_order`

#### Rezultat

Backend-ul valideaza strict datele venite din frontend si raspunde intr-un format stabil.

---

### Faza 5 — views si urls

Obiectiv: expunerea serviciilor prin API DRF.

#### `views.py`

Recomandare: folosesc `APIView`, pentru ca se potriveste cu structura descrisa de colegul meu.

Clase recomandate:

- `PomodoroCurrentSessionView`
  - `get()`

- `PomodoroTaskListCreateView`
  - `get()`
  - `post()`

- `PomodoroTaskDetailView`
  - `patch()`
  - `delete()`

- `PomodoroTaskReorderView`
  - `post()`

- `PomodoroSessionListCreateView`
  - `get()`
  - `post()`

- `PomodoroSessionDetailView`
  - `get()`
  - `patch()`

- `PomodoroSessionStartView`
  - `post()`

- `PomodoroSessionClearView`
  - `delete()`

#### `urls.py`

Exemplu de structura:

```python
urlpatterns = [
    path("sessions/current/", PomodoroCurrentSessionView.as_view(), name="session-current"),
    path("tasks/", PomodoroTaskListCreateView.as_view(), name="task-list"),
    path("tasks/reorder/", PomodoroTaskReorderView.as_view(), name="task-reorder"),
    path("tasks/<uuid:task_id>/", PomodoroTaskDetailView.as_view(), name="task-detail"),
    path("sessions/", PomodoroSessionListCreateView.as_view(), name="session-list"),
    path("sessions/<uuid:session_id>/start/", PomodoroSessionStartView.as_view(), name="session-start"),
    path("sessions/clear/", PomodoroSessionClearView.as_view(), name="session-clear"),
    path("sessions/<uuid:session_id>/", PomodoroSessionDetailView.as_view(), name="session-detail"),
]
```

#### Rezultat

Frontend-ul are punctele de intrare de care are nevoie pentru a inlocui `localStorage`.

---

### Faza 6 — permissions si securizare minima

Obiectiv: respectarea structurii cerute, fara a introduce auth care inca nu exista.

#### Ce fac

1. creez `permissions.py`
2. daca nu exista autentificare acum, definesc o permisie minimala sau las `AllowAny`
3. daca echipa vrea restrictie fata de browser access direct, asta nu se rezolva real doar din `urls.py`; trebuie fie auth, fie CSRF/session, fie un gateway clar

#### Recomandare pragmatica

In prima versiune:

- `AllowAny`
- backend accesibil doar in dev local
- comentariu clar ca protectia reala vine odata cu autentificarea

#### Rezultat

Structura ramane compatibila cu conventia echipei fara sa inventez o securitate falsa.

---

### Faza 7 — testare backend

Obiectiv: sa validez modelele, serviciile si endpoint-urile.

#### Teste de scris

##### `test_models.py`

- creeaza modele valide
- verifica constrangerile importante
- verifica `on_delete`

##### `test_services.py`

- `get_or_create_draft_session`
- `update_session_settings`
- `start_session`
- `create_task`
- `reorder_tasks`
- `finish_session`
- `clear_sessions`

##### `test_api.py`

- `GET current session`
- `GET/POST tasks`
- `PATCH/DELETE task`
- `POST reorder`
- `GET/POST sessions`
- `PATCH session`
- `POST start session`
- `DELETE clear sessions`

#### Rezultat

Backend-ul are acoperire minima buna inainte sa fie conectat la frontend.

---

### Faza 8 — integrarea frontend-backend

Obiectiv: inlocuirea persistentei locale cu API calls.

#### Ce modific in frontend

In `frontend/src/services/pomodoro_storage.js`:

- inlocuiesc `localStorage.getItem(...)` cu `fetch(...)`
- transform metodele in `async`
- ajustez `PomodoroPage.jsx` si locurile unde acestea sunt apelate

#### Mapping recomandat

- `getSettings()` -> `GET /api/pomodoro/sessions/current/`
- `saveSettings()` -> `PATCH /api/pomodoro/sessions/<uuid:session_id>/`
- `getTasks()` -> `GET /api/pomodoro/tasks/?session_id=<draft_session_id>`
- `saveTasks()`:
  - fie tradus in mai multe API calls (create/update/delete/reorder)
  - fie refactorizat pe actiuni mai explicite in frontend
- `getSessions()` -> `GET /api/pomodoro/sessions/`
- `saveSession()` -> `PATCH /api/pomodoro/sessions/<uuid:session_id>/` pentru finalizare
- `startSession()` -> `POST /api/pomodoro/sessions/<uuid:session_id>/start/`
- `clearSessions()` -> `DELETE /api/pomodoro/sessions/clear/`

#### Observatie importanta

Aceasta este faza in care trebuie sa decid daca:

1. pastrez API-ul simplu si refac `pomodoro_storage.js` pe operatii explicite
2. sau construiesc endpoint-uri mai apropiate de structura localStorage

Recomandarea mai curata: **operatii explicite**, nu un endpoint generic de tip “save everything”.

## Ordinea exacta recomandata de implementare

1. instalez DRF + CORS
2. creez `backend/apps/pomodoro`
3. configurez `settings.py` si `urls.py`
4. implementez cele 2 modele: `PomodoroSession` si `PomodoroTask`
5. adaug `user_id` pe ambele modele
6. fac migratiile
7. implementez `selectors.py`
8. implementez `services.py`
9. implementez `serializers.py`
10. implementez `views.py`
11. implementez `urls.py` in aplicatia Pomodoro
12. scriu testele backend
13. abia dupa aceea incep migrarea frontend-ului de pe `localStorage` pe API

## Fisiere care trebuie modificate sau create

### De modificat

- `backend/StudyAPP/settings.py`
- `backend/StudyAPP/urls.py`
- `requirements.txt`

### De creat

- `backend/apps/__init__.py`
- `backend/apps/pomodoro/__init__.py`
- `backend/apps/pomodoro/apps.py`
- `backend/apps/pomodoro/admin.py`
- `backend/apps/pomodoro/models.py`
- `backend/apps/pomodoro/serializers.py`
- `backend/apps/pomodoro/selectors.py`
- `backend/apps/pomodoro/services.py`
- `backend/apps/pomodoro/permissions.py`
- `backend/apps/pomodoro/views.py`
- `backend/apps/pomodoro/urls.py`
- `backend/apps/pomodoro/tests/__init__.py`
- `backend/apps/pomodoro/tests/test_models.py`
- `backend/apps/pomodoro/tests/test_services.py`
- `backend/apps/pomodoro/tests/test_api.py`

## Comenzi utile

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r ../requirements.txt
python3 manage.py startapp pomodoro apps/pomodoro
python3 manage.py makemigrations
python3 manage.py migrate
python3 manage.py runserver
python3 manage.py test
```

## Note finale

1. **Urmez schema simplificata cu doar 2 tabele reale:** `pomodoro_sessions` si `pomodoro_tasks`.
2. **Adaug `user_id` de acum** pe ambele modele, chiar daca login-ul vine mai tarziu.
3. **Nu adaug acum `activeTaskId` in DB.** Nu este o cerinta reala a versiunii curente.
4. **Nu las `FileTree` sa ma incurce.** Poate ramane nefolosit momentan; noua aplicatie trebuie sa fie `apps.pomodoro`.
5. **Cea mai buna livrare pentru faza urmatoare este backend-ul Pomodoro complet + teste backend, inainte de a conecta frontend-ul la API.**
