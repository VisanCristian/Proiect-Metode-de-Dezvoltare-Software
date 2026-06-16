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

if __name__ == "__main__":
    mcp.run()
