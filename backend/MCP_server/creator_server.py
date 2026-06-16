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
async def create_new_deck(token: str, title: str, description: str = ""):
    """
    Create a new flashcard deck for the authenticated user.
    Returns the created deck details (including its ID) if successful.
    """
    headers = { "Authorization": f"Token {token}" }
    data = {
        "title": title,
        "description": description
    }
    async with httpx.AsyncClient() as client: 
        response = await client.post(f"{BACKEND_URL}/flashcards/decks/", json=data, headers=headers)
        return response.json()
    
@mcp.tool()
async def add_flashcard_to_deck(token: str, deck_id: int, question: str, answer: str):
    """
    Add a single flashcard (question and answer) to an existing deck.
    Requires the deck_id of the deck to which the flashcard will be added.
    """
    headers = { "Authorization": f"Token {token}" }
    data = {
        "deck": deck_id,
        "question": question,
        "answer": answer
    }
    async with httpx.AsyncClient() as client: 
        response = await client.post(f"{BACKEND_URL}/flashcards/cards/", json=data, headers=headers)
        return response.json()
    
if __name__ == "__main__":
    mcp.run()
