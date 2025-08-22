#Use official Node.js image
FROM node:20-slim AS builder 

#Install dependacies first ()
COPY package*.json ./
# FROM node:20-alpine


# Change to MCP directory and install dependencies
WORKDIR /app/mcp
# RUN npm install
RUN npm ci 
# Copy the entire project
COPY . .

# Ensure node_modules/.bin is in PATH
ENV PATH /app/mcp/node_modules/.bin:$PATH

# Build the application
RUN npm run build

# Expose port
EXPOSE 3000

# Start the application
CMD ["npm", "start"]

