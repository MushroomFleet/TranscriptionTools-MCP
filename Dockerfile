# Generated by https://smithery.ai. See: https://smithery.ai/docs/config#dockerfile
FROM node:lts-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies without running scripts
RUN npm install --ignore-scripts

# Copy all files into the container
COPY . .

# Build the project
RUN npm run build

# Set the command to run the MCP server
CMD [ "node", "build/index.js" ]
