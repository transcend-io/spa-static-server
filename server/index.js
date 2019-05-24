/**
 *
 * ## Server
 * Run the dev server
 *
 * @module server
 * @see module:server/envs
 */

// Always run in production
process.env.NODE_ENV = 'production';

// external modules
const express = require('express');
const proxy = require('http-proxy-middleware');
const { readFileSync, existsSync } = require('fs');
const https = require('https');
const { execSync } = require('child_process');

// local
const logger = require('./logger');
const setup = require('./addMiddlewares');

// Environments
const {
  // Create a proxy to the backend
  BACKEND_URL,
  // Host the frontend here
  FRONTEND_URL,
  // (optional) The location of the ssl certificate file (mount instead to /ssl/certificate.pem)
  SSL_CERT,
  // (optional) The location of the SSL_CERT file (mount instead to /ssl/private.key)
  SSL_KEY,
  // (optional) The location of the build (mount instead to /build)
  BUILD_PATH,
  // (optional) Provide the name of the s3 bucket to host from
  S3_BUCKET,
  AWS_ACCESS_KEY_ID,
  AWS_SECRET_ACCESS_KEY,
  // Disable buckets by name, useful in dev.yml on backend
  DISABLED_BUCKETS = '',
} = process.env;

// Load in assets from s3
if (S3_BUCKET) {
  // Potentially skip the bucket
  const skipBuckets = DISABLED_BUCKETS.split(',').map((x) => x.trim());
  if (skipBuckets.includes(S3_BUCKET)) {
    process.exit(0);
  }

  // Ensure access key and secret are set
  if (!AWS_ACCESS_KEY_ID || !AWS_SECRET_ACCESS_KEY) {
    throw new Error('AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY must be provided with S3_BUCKET')
  }

  logger.info(`Cloning in the contents form the s3 bucket: ${S3_BUCKET}"`)
  const cmd = `AWS_ACCESS_KEY_ID=${AWS_ACCESS_KEY_ID} AWS_SECRET_ACCESS_KEY=${AWS_SECRET_ACCESS_KEY} aws s3 cp s3://${S3_BUCKET}/ "${BUILD_PATH}" --recursive`;
  execSync(cmd);
}


// Log the config
const vars = {
  SSL_CERT,
  SSL_KEY,
  BACKEND_URL,
  BUILD_PATH,
  FRONTEND_URL,
};
logger.config(vars);

// Ensure provided
const missingVars = Object.entries(vars)
  .filter(([, val]) => !val)
  .map(([name]) => name)
if (missingVars.length > 0) {
  throw new Error(`Missing environment variables: "${missingVars.join('", "')}"`)
}

// Ensure certs exist
if (!existsSync(SSL_CERT)) throw new Error(`File does not exist: "${SSL_CERT}"`);
if (!existsSync(SSL_KEY)) throw new Error(`File does not exist: "${SSL_KEY}"`);
if (!existsSync(BUILD_PATH)) throw new Error(`Folder does not exist: "${BUILD_PATH}"`);

// Create an express server
const app = express();

// SSL options
const options = {
  cert: readFileSync(SSL_CERT),
  key: readFileSync(SSL_KEY),
};

// If you need a backend, e.g. an API, add your custom backend-specific middleware here
app.use('/backend', proxy('/backend', {
  pathRewrite: { '^/backend': '' },
  target: BACKEND_URL,
  ssl: options,
  secure: false,
}));

// In production we need to pass these values in instead of relying on webpack
setup(app, {
  outputPath: BUILD_PATH,
  publicPath: '/',
});

// Determine the host
const splitFull = FRONTEND_URL.split(':');
const port = Number(splitFull.pop());
const prettyHost = splitFull.join(':');

// Start the server
https.createServer(options, app).listen(port, (err) => {
  if (err) return logger.error(err.message);
  return logger.appStarted(port, prettyHost);
});
