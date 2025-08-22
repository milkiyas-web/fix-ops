// apps/mcp/server.ts
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import http from "http";
import { repoToolDef, repoToolHandler } from "./tools/repoTool.js";
import express from "express";
import bodyParser from "body-parser";

const app = express();
app.use(bodyParser.json());
console.log("Testing MCP server functionality...");

// Create MCP server
const server = new McpServer(
  {
    name: "incidents-server",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
      logging: {},
    },
  }
);

console.log("Server created successfully");
console.log(
  "Available methods:",
  Object.getOwnPropertyNames(Object.getPrototypeOf(server))
);

// Simple session ID generator
function generateSessionId() {
  return (
    "session-" + Date.now() + "-" + Math.random().toString(36).substr(2, 9)
  );
}

const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 8080;
async function startServer() {
  try {
    const port = process.env.PORT ? parseInt(process.env.PORT) : 3000;

    // MCP Transport
    const transport = new StreamableHTTPServerTransport({
      sessionIdGenerator: generateSessionId,
    });

    await server.registerTool("Repo", repoToolDef, repoToolHandler);
    console.log("Repo registered");

    await server.connect(transport);
    console.log("MCP server connected to transport");
    // Create HTTP server that Railway can detect
    const httpServer = http.createServer(async (req, res) => {
      if (req.url === "/health") {
        res.writeHead(200, { "Content-Type": "text/plain" });
        res.end("OK");
      } else if (req.url === "/mcp" && req.method === "POST") {
        // Handle MCP requests
        await transport.handleRequest(req, res);
      } else if (req.url == "/") {
        res.writeHead(200);
        res.end("MCP server is alive");
      } else {
        res.writeHead(404);
        res.end();
      }
    });

    httpServer.listen(port, "0.0.0.0", () => {
      console.log(`MCP server running on http://0.0.0.0:${port}`);
      console.log(`Health check available at http://0.0.0.0:${port}/health`);
    });
  } catch (error) {
    console.error("Error starting server:", error);
  }
}

startServer();

// app.post("/debug/repo", async (req, res) => {
//   const { repoUrl, branch } = req.body;
//   console.log("/debug/repo is hit");
//   try {
//     const result = await repoToolHandler({ repoUrl, branch }, {});
//     res.json(result);
//   } catch (err: any) {
//     res.status(500).json({ error: err.message });
//   }
// });

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`app litsening on port: ${PORT}`);
});
