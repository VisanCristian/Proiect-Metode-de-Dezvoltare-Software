import os #for reading the .env file 
import httpx # for making async http requests to the backend
from dotenv import load_dotenv # for loading the .env file
from mcp.server.fastmcp import FastMCP # for creating the MCP server

load_dotenv()
BACKEND_URL = os.getenv("BACKEND_URL")
if not BACKEND_URL:
    print("BACKEND_URL not found in .env file. Please set it to the backend API URL.")
    exit(1)


mcp = FastMCP("StudyAPP-Agent")

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
        
if __name__ == "__main__":
    mcp.run()
           