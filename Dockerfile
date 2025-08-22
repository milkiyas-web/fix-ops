FROM node:20-alpine

WORKDIR /app

# Copy the entire project
COPY . .

# Change to MCP directory and install dependencies
WORKDIR /app/apps/mcp
RUN npm install

# Build the application
RUN npm run build

# Expose port
EXPOSE 3000

# Start the application
CMD ["npm", "start"]
