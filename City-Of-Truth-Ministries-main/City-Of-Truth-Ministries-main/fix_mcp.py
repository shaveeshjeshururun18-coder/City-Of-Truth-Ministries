import json
import os

config_path = r"C:\Users\HP\.gemini\antigravity\mcp_config.json"

with open(config_path, "r", encoding="utf-8") as f:
    config = json.load(f)

if "github-mcp-server" in config.get("mcpServers", {}):
    pat = config["mcpServers"]["github-mcp-server"]["env"].get("GITHUB_PERSONAL_ACCESS_TOKEN", "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")
    
    config["mcpServers"]["github-mcp-server"].update({
        "command": "npx",
        "args": [
            "-y",
            "@modelcontextprotocol/server-github"
        ],
        "env": {
            "GITHUB_PERSONAL_ACCESS_TOKEN": pat
        }
    })
    
    with open(config_path, "w", encoding="utf-8") as f:
        json.dump(config, f, indent=2)
    print("Updated mcp_config.json to use NPX for github-mcp-server")
else:
    print("github-mcp-server not found in config")
