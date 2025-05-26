# Dockerfile for Decentralized Voting Platform Frontend

# Stage 1: Build the React application
FROM node:20-alpine AS build

# Set the working directory
WORKDIR /app/frontend

# Copy package.json and package-lock.json (or yarn.lock)
COPY frontend/package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the frontend application code
COPY frontend/ .

# Set build-time environment variables (can be overridden)
# These are needed for the build process if they affect the static output
ARG VITE_NETWORK=testnet
ARG VITE_CONTRACT_ADDRESS=ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM
ARG VITE_CONTRACT_NAME=voting
ARG VITE_APP_TITLE="Decentralized Voting Platform"

ENV VITE_NETWORK=$VITE_NETWORK
ENV VITE_CONTRACT_ADDRESS=$VITE_CONTRACT_ADDRESS
ENV VITE_CONTRACT_NAME=$VITE_CONTRACT_NAME
ENV VITE_APP_TITLE=$VITE_APP_TITLE

# Build the application
RUN npm run build

# Stage 2: Serve the application with Nginx
FROM nginx:1.25-alpine

# Copy built assets from the build stage
COPY --from=build /app/frontend/dist /usr/share/nginx/html

# Copy custom Nginx configuration
COPY frontend/nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]

