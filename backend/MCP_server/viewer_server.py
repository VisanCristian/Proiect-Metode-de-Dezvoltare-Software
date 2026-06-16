import os # for reading the .env file 
import httpx # for making async http requests to the backend
from dotenv import load_dotenv # for loading the .env file
from mcp.server.fastmcp import FastMCP # for creating the MCP server

# Load environment variables from .env file
load_dotenv()
BACKEND_URL = os.getenv("BACKEND_URL")

if not BACKEND_URL:
    print("BACKEND_URL not found in .env file. Please set it to the backend API URL.")
    exit(1)

# Initialize the MCP server for the Viewer Agent
mcp = FastMCP("StudyAPP-Viewer-Agent")

async def consume_tokens(token: str, amount: int = 50):
    """Call backend to consume tokens. Raises Exception if insufficient."""
    headers = { "Authorization": f"Token {token}" }
    data = { "amount": amount }
    async with httpx.AsyncClient() as client:
        response = await client.post(f"{BACKEND_URL}/agents/consume-token/", json=data, headers=headers)
        if response.status_code == 403:
            raise Exception("Not enough tokens to perform this action. Please study more to earn tokens.")
        elif response.status_code != 200:
            raise Exception("Failed to consume tokens.")
        return response.json()



@mcp.tool()
async def list_user_folders(token: str):
    """
    List all folders belonging to the authenticated user.
    Requires the token obtained from login_to_backend.
    """
    await consume_tokens(token)
    headers = { "Authorization": f"Token {token}" }
    async with httpx.AsyncClient() as client: 
        response = await client.get(f"{BACKEND_URL}/filesystem/folders", headers=headers)
        return response.json()
    
@mcp.tool()
async def list_files_in_folder(folder_id: float, token: str):
    """
    List all files inside a specific folder using the folder_id.
    Requires the token obtained from login_to_backend.
    """
    await consume_tokens(token)
    headers = { "Authorization": f"Token {token}" }
    params = {"id": int(folder_id)}
    async with httpx.AsyncClient() as client: 
        response = await client.get(f"{BACKEND_URL}/filesystem/folders/list", params=params, headers=headers)
        return response.json()
    
@mcp.tool()
async def read_file_content(file_id: float, token: str):
    """
    Read the text/markdown content of a file using the file_id.
    Requires the token obtained from login_to_backend.
    """
    await consume_tokens(token)
    headers = { "Authorization": f"Token {token}" }
    params = {"id": int(file_id)}
    async with httpx.AsyncClient() as client: 
        response = await client.get(f"{BACKEND_URL}/filesystem/files/content", params=params, headers=headers)
        return response.json()
    
@mcp.tool()
async def list_user_decks(token: str):
    """
    List all flashcard decks available for the user.
    Requires the token obtained from login_to_backend.
    """
    await consume_tokens(token)
    headers = { "Authorization": f"Token {token}" }
    async with httpx.AsyncClient() as client:
        response = await client.get(f"{BACKEND_URL}/flashcards/decks/", headers=headers)
        return response.json()
    
@mcp.tool()
async def view_deck_flashcards(deck_id: float, token: str):
    """
    List the flashcards and details from a specific deck using the deck_id.
    Requires the token obtained from login_to_backend.
    """
    await consume_tokens(token)
    headers = { "Authorization": f"Token {token}" }
    async with httpx.AsyncClient() as client: 
        response = await client.get(f"{BACKEND_URL}/flashcards/decks/{int(deck_id)}/", headers=headers)
        return response.json()

@mcp.tool()
async def award_flashcard_points(token: str, points: float, flashcard_id: float):
    """
    Award points to the user for correctly answering a flashcard.
    Requires the user token. Use this after verifying a correct answer.
    """
    headers = { "Authorization": f"Token {token}" }
    data = {
        "points": int(points),
        "flashcard_id": int(flashcard_id)
    }
    async with httpx.AsyncClient() as client: 
        response = await client.post(f"{BACKEND_URL}/agents/points/", json=data, headers=headers)
        return response.json()


@mcp.tool()
async def update_agent_memory(
    token: str,
    excel_subjects: str | None = None,
    poor_subjects: str | None = None,
    notes: str | None = None,
):
    """
    Save observations about the user's study performance into AgentMemory.
    Use this when you notice patterns during the conversation, such as subjects
    the user excels at, struggles with, or any relevant notes for future sessions.
    This action does NOT consume tokens.

    Parameters:
    - excel_subjects: subjects or topics the user is doing well at
    - poor_subjects: subjects or topics the user is struggling with
    - notes: any other relevant observations about the user's study habits
    """
    headers = { "Authorization": f"Token {token}" }
    data = {}
    if excel_subjects is not None:
        data["excel_subjects"] = excel_subjects
    if poor_subjects is not None:
        data["poor_subjects"] = poor_subjects
    if notes is not None:
        data["notes"] = notes

    if not data:
        return {"message": "Nothing to update."}

    async with httpx.AsyncClient() as client:
        response = await client.patch(
            f"{BACKEND_URL}/agents/memory/",
            json=data,
            headers=headers,
        )
        if response.status_code == 200:
            return {"message": "Memory updated successfully."}
        return {"error": f"Failed to update memory: {response.status_code}"}

if __name__ == "__main__":
    mcp.run()
