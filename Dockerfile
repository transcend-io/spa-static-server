# Docker image for the node app
ARG NODE_IMAGE=12.14.0-alpine
FROM node:$NODE_IMAGE

# In order to read from s3 buckets, we need aws cli
RUN apk add --no-cache --update \
  python3 && \
  python3 -m ensurepip && \
  rm -r /usr/lib/python*/ensurepip && \
  pip3 install --upgrade pip setuptools && \
  if [ ! -e /usr/bin/pip ]; then ln -s pip3 /usr/bin/pip ; fi && \
  if [[ ! -e /usr/bin/python ]]; then ln -sf /usr/bin/python3 /usr/bin/python; fi && \
  rm -r /root/.cache
RUN pip3 --no-cache-dir install --upgrade awscli

# Args
ARG NODE_ENV=production

# Set the envs
ENV YARN_VERSION "1.21.1"
ENV NODE_ENV ${NODE_ENV}

# Set working directory
RUN mkdir /ssl
RUN mkdir /build
RUN mkdir /app

# Build in app
WORKDIR /app

# Copy package.json and install
COPY package.json yarn.lock /app/

# Install yarn
RUN npm install -g yarn@${YARN_VERSION} --force

# Install deps
RUN yarn

# Copy over the server code
COPY server/ /app/server/

# Run from root
WORKDIR /

# Test runner
CMD ["node", "./app/server"]
