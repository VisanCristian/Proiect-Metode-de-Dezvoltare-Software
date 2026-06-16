import asyncio
from viewer_server import mcp

async def test():
    tools = await mcp.list_tools()
    for tool in tools:
        print(f"Tool: {tool.name}")
        print(f"Schema: {tool.inputSchema}")

asyncio.run(test())
