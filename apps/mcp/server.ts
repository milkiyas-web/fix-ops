// apps/mcp/server.ts
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import http from "http";

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

async function startServer() {
  try {
    const port = process.env.PORT ? parseInt(process.env.PORT) : 3000;

    // MCP Transport
    const transport = new StreamableHTTPServerTransport({
      sessionIdGenerator: generateSessionId,
    });

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
