#Use official Node.js image
FROM node:20-alpine

# Install dependacies first ()
# FROM node:20-alpine


# Change to MCP directory and install dependencies
WORKDIR /app
# RUN npm install
RUN npm install
# Copy the entire project
COPY . .

# Ensure node_modules/.bin is in PATH
ENV PATH /app/mcp/node_modules/.bin:$PATH

# Build the application
RUN npm run build

# Expose port expected by platform and set default PORT
ENV PORT=8080
EXPOSE 8080

# Start the application
CMD ["npm", "start"]

