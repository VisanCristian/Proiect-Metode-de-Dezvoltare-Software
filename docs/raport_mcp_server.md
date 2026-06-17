# Raport privind utilizarea AI în dezvoltarea componentei MCP Server

În cadrul proiectului, am folosit AI-ul ca instrument de sprijin în procesul de dezvoltare pentru componenta **MCP Server**. Această componentă are rolul de a face legătura între aplicația *StudyAPP* și un agent AI, oferind agentului acces la anumite funcționalități ale backend-ului printr-un set de instrumente bine definite.

---

## 1. Înțelegerea conceptului de Model Context Protocol

AI-ul a fost folosit în primul rând pentru înțelegerea conceptului de **Model Context Protocol** și pentru clarificarea modului în care acesta poate fi integrat într-o aplicație web. Deoarece MCP presupune expunerea unor funcții ale aplicației către un agent AI, am folosit AI-ul pentru a înțelege mai bine cum trebuie organizată această comunicare și ce rol are serverul MCP în arhitectura generală a proiectului.

---

## 2. Separarea responsabilităților în cadrul componentei

Un aspect important în care AI-ul ne-a ajutat a fost separarea responsabilităților în cadrul componentei. În proiect, MCP Server-ul este împărțit în două părți principale: `viewer_server.py` și `creator_server.py`.

### Viewer

Partea de **viewer** este destinată operațiilor de citire și vizualizare, precum:

- listarea folderelor,
- afișarea fișierelor,
- citirea conținutului unui fișier,
- vizualizarea deck-urilor de flashcard-uri.

### Creator

Partea de **creator** este destinată operațiilor prin care se creează conținut nou, cum ar fi:

- crearea unui deck de flashcard-uri,
- adăugarea unui flashcard,
- crearea unui fișier de studiu.

Am folosit AI-ul pentru a verifica dacă această separare este logică și potrivită pentru arhitectura aplicației. Prin explicațiile primite, am înțeles că împărțirea între acțiuni de vizualizare și acțiuni de creare ajută la organizarea codului și face componenta mai ușor de întreținut.

---

## 3. Transformarea funcțiilor în tool-uri MCP

AI-ul a fost util și pentru înțelegerea modului în care funcțiile sunt transformate în tool-uri MCP. În cod, funcțiile sunt marcate cu decoratorul `@mcp.tool()`, ceea ce le face disponibile pentru agentul AI. Cu ajutorul AI-ului, am înțeles că aceste tool-uri reprezintă acțiunile concrete pe care agentul le poate executa în aplicație. Astfel, agentul nu are acces liber la întregul backend, ci poate apela doar funcțiile definite explicit în serverul MCP.

---

## 4. Comunicarea cu backend-ul

Pentru comunicarea cu backend-ul aplicației, MCP Server-ul folosește cereri HTTP către endpoint-urile existente. AI-ul ne-a ajutat să clarificăm modul în care aceste cereri trebuie structurate și de ce este utilă folosirea unei biblioteci asincrone precum `httpx`. Prin această abordare, serverul MCP nu stochează date separat, ci acționează ca un intermediar între agentul AI și API-ul aplicației. Acest lucru păstrează logica principală în backend și permite reutilizarea endpoint-urilor deja implementate.

---

## 5. Rolul fișierului `main.py`

O altă parte în care AI-ul ne-a fost util a fost înțelegerea rolului fișierului `main.py`. Acesta unește serverele `viewer` și `creator` într-o aplicație FastAPI și le expune prin endpoint-uri separate. AI-ul ne-a ajutat să formulăm mai clar ideea că `main.py` funcționează ca un **agregator** — o componentă care adună mai multe servere MCP într-un singur punct de acces.

---

## 6. Transportul prin Server-Sent Events (SSE)

În cadrul acestei componente se folosește transportul prin **SSE** (*Server-Sent Events*). AI-ul ne-a ajutat să înțelegem de ce această alegere este potrivită: SSE permite comunicarea prin HTTP și face serverul mai ușor de conectat cu instrumente externe. Astfel, serverul MCP poate fi testat și folosit de agenți AI sau de platforme externe care pot comunica prin endpoint-uri HTTP.

---

## 7. Rolul ngrok în procesul de testare

Am folosit AI-ul și pentru a înțelege rolul **ngrok** în procesul de testare. Deoarece serverul MCP rulează local, acesta nu poate fi accesat direct de servicii externe. Ngrok permite expunerea serverului local printr-un URL public temporar. Acest lucru ne-a fost util pentru testarea endpoint-urilor MCP și pentru verificarea modului în care serverul poate fi accesat din exterior.

---

## 8. Utilizarea AI-ului pentru documentare

Pe lângă partea tehnică, AI-ul a fost folosit și pentru documentare. După ce am lucrat la componenta MCP Server, am folosit AI-ul pentru a formula explicații mai clare despre rolul fișierelor, structura serverului și modul în care acesta se integrează în aplicație. Acest lucru ne-a ajutat să descriem mai bine contribuția noastră și să transformăm partea tehnică într-o explicație ușor de înțeles.

---

## Concluzie

Considerăm că utilizarea AI-ului a fost utilă în procesul de dezvoltare deoarece ne-a ajutat să înțelegem mai rapid conceptele noi, să verificăm structura implementării și să formulăm explicații clare pentru documentație. AI-ul nu a înlocuit procesul de dezvoltare, ci a fost folosit ca un instrument de sprijin pentru clarificare, organizare și documentare.

În concluzie, AI-ul a contribuit la dezvoltarea componentei MCP Server prin:

- explicarea conceptelor legate de *Model Context Protocol*,
- sprijin în organizarea serverelor `viewer` și `creator`,
- clarificarea comunicării cu backend-ul,
- ajutor în documentarea arhitecturii.

Componenta rezultată permite aplicației *StudyAPP* să comunice cu un agent AI prin tool-uri bine definite, transformând AI-ul într-un asistent integrat în aplicație, capabil să interacționeze cu funcționalitățile backend-ului într-un mod controlat și organizat.
