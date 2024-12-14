# First stage: Build the source code with Node
# Base on slim node image, nothing more is needed
FROM node:lts-alpine AS build
WORKDIR /app

# Add only configuration and run npm install to download dependencies
# This causes Docker to use the cached dependencies instead of downloading them every time
COPY ./package.json ./package-lock.json ./tsconfig.json ./webpack.config.js ./
RUN npm install

# Copy the sourcecode and build it
COPY src ./src/
COPY ./LICENSE ./LICENSE
RUN npm run build

# Second stage: Configure nginx
FROM nginx:alpine AS runtime

COPY ./LICENSE /app/
COPY --from=build /app/dist/ /app/
RUN chmod 644 /app/assets/*

COPY ./resources/nginx.conf /etc/nginx/conf.d/default.conf
