/**
 *
 * ## Server
 * Run the dev server
 *
 * @module server
 * @see module:server/envs
 */

// external modules
const express = require('express');
const proxy = require('http-proxy-middleware');
const { readFileSync } = require('fs');
const https = require('https');
const { execSync } = require('child_process');

// local
const envs = require('./envs');
const logger = require('./logger');
const setup = require('./middlewares');
const getFragmentTypes = require('./getFragmentTypes');

// Load in assets from s3. AWS credentials are borrowed from the local ~/.aws folder
if (envs.S3_BUCKET) {
  logger.info(`Cloning in the contents from the s3 bucket: ${envs.S3_BUCKET}"`);
  const cmd = `aws s3 cp s3://${envs.S3_BUCKET}/ "${envs.BUILD_PATH}" --recursive`;
  execSync(cmd);
}

// SSL options
const ssl = {
  cert: readFileSync(envs.SSL_CERT),
  key: readFileSync(envs.SSL_KEY),
};

/**
 * Start the server
 */
async function main() {
  // Get and store the fragment types from the graphql api
  if (envs.WRITE_FRAGMENT_PATH) {
    await getFragmentTypes(
      `${envs.BACKEND_URL}/${
        envs.FRAGMENTS_ROUTE.startsWith('/')
          ? envs.FRAGMENTS_ROUTE.slice(1)
          : envs.FRAGMENTS_ROUTE
      }`,
      envs.WRITE_FRAGMENT_PATH,
    );
  }

  // Log the config
  logger.config(envs);

  // Create an express server
  const app = express();

  // If you need a backend, e.g. an API, add your custom backend-specific middleware here
  app.use(
    envs.PROXY_ROUTE,
    proxy(envs.PROXY_ROUTE, {
      pathRewrite: { [`^${envs.PROXY_ROUTE}`]: '' },
      target: envs.BACKEND_URL,
      ssl,
      secure: false,
    }),
  );

  // In production we need to pass these values in instead of relying on webpack
  setup(app, {
    outputPath: envs.BUILD_PATH,
    publicPath: '/',
  });

  // Determine the host
  const splitFull = envs.FRONTEND_URL.split(':');
  const port = Number(splitFull.pop());
  const prettyHost = splitFull.join(':');

  // Start the server
  https.createServer(ssl, app).listen(port, err => {
    if (err) return logger.error(err.message);
    return logger.appStarted(port, prettyHost);
  });
}

// Run the server
main();
