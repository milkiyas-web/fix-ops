FROM node:20-alpine

# Set app working directory inside the container
WORKDIR /usr/src/app

# Copy package files from the MCP app
COPY apps/mcp/package*.json ./

# Install dependencies first (better layer caching)
RUN npm ci

# Copy the MCP app source
COPY apps/mcp .

# Build the TypeScript project (emits dist and copies tools)
RUN npm run build

# Expose default port used by server.ts
ENV PORT=3000
EXPOSE 3000

# Start the server
CMD ["npm", "start"]
