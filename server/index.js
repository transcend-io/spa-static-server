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

// local
const logger = require('./logger');
const setup = require('./addMiddlewares');

// Environments
const {
  SSL_CERT,
  SSL_KEY,
  BACKEND_URL,
  BUILD_PATH,
  FRONTEND_URL,
} = process.env;

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
