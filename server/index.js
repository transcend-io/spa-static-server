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
const { join, resolve } = require('path');

// local
const logger = require('./logger');
const argv = require('./argv');
const setup = require('./middlewares/frontendMiddleware');

// Settings
const isDev = NODE_ENV !== 'production';
const ngrok = (isDev && process.env.ENABLE_TUNNEL) || argv.tunnel ? require('ngrok') : false; // eslint-disable-line

// Create an express server
const app = express();

// SSL options
const options = {
  cert: readFileSync(join(__dirname, '..', 'internals', 'ssl', 'certificate.pem')),
  key: readFileSync(join(__dirname, '..', 'internals', 'ssl', 'private.key')),
};

// If you need a backend, e.g. an API, add your custom backend-specific middleware here
app.use('/backend', proxy('/backend', {
  pathRewrite: { '^/backend': '' },
  target: BACKEND_URL,
  ssl: options,
  secure: false,
}));

// Direct to s3
// app.use('/s3', require('react-dropzone-s3-uploader/s3router')({
//   ACL: 'public-read', // this is the default - set to `public-read` to let anyone view uploads
//   bucket: 'development-photo-upload', // required
//   headers: { 'Access-Control-Allow-Origin': '*' }, // optional
//   region: 'us-east-1', // optional
// }));

// In production we need to pass these values in instead of relying on webpack
setup(app, {
  outputPath: resolve(process.cwd(), 'builds', BUILD_ENV),
  publicPath: '/',
});

// Determine the host
const splitFull = FRONTEND_URL.split(':');
const port = Number(splitFull.pop());
const prettyHost = splitFull.join(':');

// Start the server
https.createServer(options, app).listen(port, (err) => {
  if (err) return logger.error(err.message);

  // Connect to ngrok in dev mode
  if (ngrok) {
    return ngrok.connect(port, (innerErr, url) => innerErr
      ? logger.error(innerErr)
      : logger.appStarted(port, prettyHost, url)
    );
  }

  return logger.appStarted(port, prettyHost);
});
