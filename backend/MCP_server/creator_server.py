import os # for reading the .env file 
import httpx # for making async http requests to the backend
from dotenv import load_dotenv # for loading the .env file
from mcp.server.fastmcp import FastMCP # for creating the MCP server

load_dotenv()
BACKEND_URL = os.getenv("BACKEND_URL")

if not BACKEND_URL:
    print("BACKEND_URL not found in .env file. Please set it to the backend API URL.")
    exit(1)

mcp = FastMCP("StudyAPP-Creator-Agent")

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
async def create_new_deck(token: str, title: str, description: str = ""):
    """
    Create a new flashcard deck for the authenticated user.
    Returns the created deck details (including its ID) if successful.
    """
    await consume_tokens(token)
    headers = { "Authorization": f"Token {token}" }
    data = {
        "title": title,
        "description": description
    }
    async with httpx.AsyncClient() as client: 
        response = await client.post(f"{BACKEND_URL}/flashcards/decks/", json=data, headers=headers)
        return response.json()
    
@mcp.tool()
async def add_flashcard_to_deck(token: str, deck_id: float, question: str, answer: str):
    """
    Add a single flashcard (question and answer) to an existing deck.
    Requires the deck_id of the deck to which the flashcard will be added.
    """
    await consume_tokens(token)
    headers = { "Authorization": f"Token {token}" }
    data = {
        "deck": int(deck_id),
        "question": question,
        "answer": answer
    }
    async with httpx.AsyncClient() as client: 
        response = await client.post(f"{BACKEND_URL}/flashcards/cards/", json=data, headers=headers)
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
async def list_user_folders(token: str):
    """
    List all folders belonging to the authenticated user.
    Use this to find a valid folder_id before creating a file.
    """
    await consume_tokens(token)
    headers = { "Authorization": f"Token {token}" }
    async with httpx.AsyncClient() as client: 
        response = await client.get(f"{BACKEND_URL}/filesystem/folders", headers=headers)
        return response.json()

@mcp.tool()
async def create_study_file(token: str, folder_id: float, name: str, content: str, encrypt: bool = False):
    """
    Create a new study file (e.g. .md or .txt) with the given content.
    Requires the folder_id where the file should be placed.
    By default, files are unencrypted.
    """
    await consume_tokens(token)
    headers = { "Authorization": f"Token {token}" }
    data = {
        "folderId": int(folder_id),
        "name": name,
        "content": content,
        "encrypt": encrypt
    }
    async with httpx.AsyncClient() as client: 
        response = await client.post(f"{BACKEND_URL}/filesystem/files/create", json=data, headers=headers)
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

if __name__ == "__main__":
    mcp.run()