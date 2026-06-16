from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

# Importam mcp-ul din fisierele tale
from viewer_server import mcp as viewer_mcp
from creator_server import mcp as creator_mcp

# Dezactivam protectia DNS rebinding care blocheaza ngrok
# Aceasta protectie verifica daca "Host" header-ul se potriveste cu localhost
if hasattr(viewer_mcp, "settings") and hasattr(viewer_mcp.settings, "transport_security"):
    viewer_mcp.settings.transport_security.enable_dns_rebinding_protection = False

if hasattr(creator_mcp, "settings") and hasattr(creator_mcp.settings, "transport_security"):
    creator_mcp.settings.transport_security.enable_dns_rebinding_protection = False

app = FastAPI(title="StudyAPP Aggregator")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"status": "Server is running. Use /viewer or /creator endpoints."}

# Montam serverele
app.mount("/viewer", viewer_mcp.sse_app())
app.mount("/creator", creator_mcp.sse_app())

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8001)
