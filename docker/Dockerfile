# First stage: Build the source code with Node
# Base on slim node image, nothing more is needed
FROM node:lts-alpine AS build
WORKDIR /app

# Add only configuration and run npm install to download dependencies
# This causes Docker to use the cached dependencies instead of downloading them every time
COPY ../client/package.json ../client/package-lock.json ../client/tsconfig.json ../client/webpack.config.js ./
RUN npm install

# Copy the sourcecode and build it
COPY ../client/src ./src/
COPY ../client/LICENSE ./LICENSE
RUN npm run build

# Second stage: Configure nginx
FROM nginx:alpine AS runtime

COPY ../client/LICENSE /app/
COPY --from=build /app/dist/ /app/
RUN chmod 644 /app/assets/*

COPY nginx.conf /etc/nginx/conf.d/default.conf
