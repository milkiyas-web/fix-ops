FROM node:20-alpine

# Set app working directory inside the container
WORKDIR /usr/src/app

# Copy the entire project first
COPY . .

# Change to the MCP directory
WORKDIR /usr/src/app/apps/mcp

# Install dependencies
RUN npm ci

# Build the TypeScript project (emits dist and copies tools)
RUN npm run build

# Expose default port used by server.ts
ENV PORT=3000
EXPOSE 3000

# Start the server
CMD ["npm", "start"]
