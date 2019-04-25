# Docker image for the node app
ARG NODE_IMAGE=10.15.0-alpine
FROM node:$NODE_IMAGE

# In order to read from s3 buckets, we need aws cli
RUN apk add python3 && \
    python3 -m ensurepip && \
    rm -r /usr/lib/python*/ensurepip && \
    pip3 install --upgrade pip setuptools && \
    if [ ! -e /usr/bin/pip ]; then ln -s pip3 /usr/bin/pip ; fi && \
    if [[ ! -e /usr/bin/python ]]; then ln -sf /usr/bin/python3 /usr/bin/python; fi && \
    rm -r /root/.cache
RUN pip3 --no-cache-dir install --upgrade awscli

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
