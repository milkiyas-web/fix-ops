FROM node:20-alpine

# Set app working directory inside the container
WORKDIR /usr/src/app

# Install dependencies first (better layer caching)
COPY package*.json ./
RUN npm ci

# Copy the MCP app source (Railway's build context is apps/mcp for this Dockerfile)
COPY . .

# Build the TypeScript project (emits dist and copies tools)
RUN npm run build

# Expose default port used by server.ts
ENV PORT=3000
EXPOSE 3000

# Start the server
CMD ["npm", "start"]
