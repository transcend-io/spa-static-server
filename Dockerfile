# Args
ARG baseUrl=https://yo.com:4021
ARG record=false
ARG projectId=TODO

# Use the Cypress base image
FROM cypress/browsers:chrome69

ENV CI=true
ENV CYPRESS_baseUrl=${baseUrl}
ENV CYPRESS_projectId=${projectId}

# Set working directory
RUN mkdir /app
WORKDIR /app

# Copy over package.json and cypress.json
COPY package.json /app/package.json
COPY cypress.json /app/cypress.json

# Install Cypress and verify the installation
RUN npm install cypress@3.1.3 \
 && ln -s $(pwd)/node_modules/.bin/cypress /usr/local/bin/cypress \
 && cypress verify \
 && cypress --version

# Test runner
CMD ["cypress", "run", "--record", $record]
