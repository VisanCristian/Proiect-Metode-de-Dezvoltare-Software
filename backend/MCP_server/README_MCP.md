# StudyAPP MCP Server Configuration

## 🏗️ System Architecture

1.  **Individual Servers**:
    *   `viewer_server.py`: Allows reading data (folders, files, flashcards, groups).
    *   `creator_server.py`: Allows creating content (new decks, flashcards, groups).
2.  **Aggregator (`main.py`)**:
    *   Combines both servers into a single application.
    *   Runs on port **8001**.
    *   Provides two routes (SSE endpoints):
        *   `/viewer`: For visualization tools.
        *   `/creator`: For creation tools.
3.  **SSE Transport**: Uses Server-Sent Events (SSE) for HTTP/ngrok compatibility instead of stdio.

## 🚀 Running & Testing

| Action | Command |
| :--- | :--- |
| **Start Server** | `python main.py` |
| **Start ngrok** | `ngrok http --url=dioxide-haste-seismic.ngrok-free.dev 8001` |
| **Inspector Viewer** | `npx @modelcontextprotocol/inspector https://dioxide-haste-seismic.ngrok-free.dev/viewer/sse` |
| **Inspector Creator**| `npx @modelcontextprotocol/inspector https://dioxide-haste-seismic.ngrok-free.dev/creator/sse` |

## 🤖 n8n Setup
- **Type**: SSE
- **URL**: `https://dioxide-haste-seismic.ngrok-free.dev/viewer/sse` (or `/creator/sse`)
