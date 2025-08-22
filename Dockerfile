FROM node:20-alpine

# Set app working directory inside the container
WORKDIR /usr/src/app

# Copy the entire project first
COPY . .

# Change to the MCP directory and install dependencies
WORKDIR /usr/src/app/apps/mcp
RUN npm ci

# Build the TypeScript project (emits dist and copies tools)
RUN npm run build

# Expose default port used by server.ts
ENV PORT=3000
EXPOSE 3000

# Start the server
CMD ["npm", "start"]
