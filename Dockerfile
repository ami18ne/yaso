# Stage 1: Build the application
FROM node:20-alpine AS builder

# Set the working directory
WORKDIR /usr/src/app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of the application source code
COPY . .

# Run the build script to generate production assets
# This will build both the client and the server into the /dist folder
RUN npm run build

# Prune development dependencies for the final image
RUN npm prune --production

# Stage 2: Create the final production image
FROM node:20-alpine AS production

# Set the node environment to production
ENV NODE_ENV=production \
    PORT=4000 \
    LOG_LEVEL=info

# Set the working directory
WORKDIR /usr/src/app

# Copy the pruned node_modules and package files from the builder stage
COPY --from=builder /usr/src/app/node_modules ./node_modules
COPY --from=builder /usr/src/app/package*.json ./

# Copy the built application (client and server) from the builder stage
COPY --from=builder /usr/src/app/dist ./dist

# Expose the port the app runs on
EXPOSE 4000

# Health check to monitor the application
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:4000/api/health', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"

# The command to start the production server
CMD ["npm", "start"]
