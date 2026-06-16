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

@mcp.tool()
async def login_to_backend(username:str, password:str) -> str:
    """
    Auth the aggent to the backend.
    Return the access token if the login is successful, otherwise return an error message.
    """
    login_url = f"{BACKEND_URL}/auth/token/login/"
    
    date_login = {
        "username": username,
        "password": password
    }
    
    async with httpx.AsyncClient() as client:
        try: 
            response = await client.post(login_url, json=date_login)
            if response.status_code == 200:
                #if its successful, return the access token
                token = response.json().get("auth_token")
                return f"Auth successful. Access token: {token}"
            else:
                return f"Auth failed. Status code: {response.status_code}, Response: {response.text}"
        except Exception as e:
            return f"An error occurred during login: {str(e)}"

@mcp.tool()
async def list_user_folders(token: str):
    """
    List all folders belonging to the authenticated user.
    Requires the token obtained from login_to_backend.
    """
    headers = { "Authorization": f"Token {token}" }
    async with httpx.AsyncClient() as client: 
        response = await client.get(f"{BACKEND_URL}/filesystem/folders", headers=headers)
        return response.json()
    
@mcp.tool()
async def list_files_in_folder(folder_id: int, token: str):
    """
    List all files inside a specific folder using the folder_id.
    Requires the token obtained from login_to_backend.
    """
    headers = { "Authorization": f"Token {token}" }
    params = {"id": folder_id}
    async with httpx.AsyncClient() as client: 
        response = await client.get(f"{BACKEND_URL}/filesystem/folders/list", params=params, headers=headers)
        return response.json()
    
@mcp.tool()
async def read_file_content(file_id: int, token: str):
    """
    Read the text/markdown content of a file using the file_id.
    Requires the token obtained from login_to_backend.
    """
    headers = { "Authorization": f"Token {token}" }
    params = {"id": file_id}
    async with httpx.AsyncClient() as client: 
        response = await client.get(f"{BACKEND_URL}/filesystem/files/content", params=params, headers=headers)
        return response.json()
    
@mcp.tool()
async def list_user_decks(token: str):
    """
    List all flashcard decks available for the user.
    Requires the token obtained from login_to_backend.
    """
    headers = { "Authorization": f"Token {token}" }
    async with httpx.AsyncClient() as client:
        response = await client.get(f"{BACKEND_URL}/flashcards/decks/", headers=headers)
        return response.json()
    
@mcp.tool()
async def view_deck_flashcards(deck_id: int, token: str):
    """
    List the flashcards and details from a specific deck using the deck_id.
    Requires the token obtained from login_to_backend.
    """
    headers = { "Authorization": f"Token {token}" }
    async with httpx.AsyncClient() as client: 
        response = await client.get(f"{BACKEND_URL}/flashcards/decks/{deck_id}/", headers=headers)
        return response.json()

if __name__ == "__main__":
    mcp.run()
