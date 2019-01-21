# Docker image for the node app
ARG NODE_IMAGE=10.15.0-alpine
FROM node:$NODE_IMAGE

# Args
ARG SSL_CERT=/ssl/certificate.pem
ARG SSL_KEY=/ssl/private.key
ARG BACKEND_URL=https://yo.com:4012
ARG BUILD_PATH=/build
ARG FRONTEND_URL=https://yo.com:3012

# Set the envs
ENV SSL_CERT ${SSL_CERT}
ENV SSL_KEY ${SSL_KEY}
ENV BACKEND_URL ${BACKEND_URL}
ENV BUILD_PATH ${BUILD_PATH}
ENV FRONTEND_URL ${FRONTEND_URL}

# Always production
ARG NODE_ENV=production

# Set working directory
RUN mkdir /ssl
RUN mkdir /build
RUN mkdir /app
WORKDIR /app

# Copy package.json and install
COPY package.json package-lock.json /app/
# RUN npm ci TODO
RUN npm i

# Copy over the server code
COPY server/ /app/server/

# Test runner
CMD ["node", "server"]
