/**
 *
 * ## Server Envs
 * Environment variables for the server.
 *
 * @module server/envs
 * @see module:server
 */

// external modules
const dotenv = require('dotenv');
const { existsSync } = require('fs');

// Read in a .env configuration if specified
if (process.env.BUILD_ENV_PATH) {
  // Ensure the env file exists
  if (!existsSync(process.env.BUILD_ENV_PATH)) {
    throw new Error(`Env file does not exist: "${process.env.BUILD_ENV_PATH}"`);
  }

  // Load in the environment variables
  dotenv.config({ path: process.env.BUILD_ENV_PATH });
}

// Environments
const {
  // Proxy from backend, hosted on frontend
  BACKEND_URL,
  FRONTEND_URL,
  // Proxy route to redirect requests to BACKEND_URL from frontend
  PROXY_ROUTE = '/backend',
  // The location of the ssl certificate and secret (can mount to default)
  SSL_CERT = '/ssl/certificate.pem',
  SSL_KEY = '/ssl/private.key',
  // The location of the build (mount instead to /build)
  BUILD_PATH = '/build',
  // (optional) Provide the name of the s3 bucket to host from
  S3_BUCKET,
  AWS_ACCESS_KEY_ID,
  AWS_SECRET_ACCESS_KEY,
  // Fetch GraphQL fragment types
  WRITE_FRAGMENT_PATH,
  FRAGMENTS_ROUTE = '/graphql',
  // Environment
  NODE_ENV = 'production',
} = process.env;

// Set NODE_ENV if not
process.env.NODE_ENV = NODE_ENV;

// Ensure paths exist
if (!existsSync(SSL_CERT)) throw new Error(`File does not exist: "${SSL_CERT}"`);
if (!existsSync(SSL_KEY)) throw new Error(`File does not exist: "${SSL_KEY}"`);
if (!existsSync(BUILD_PATH)) throw new Error(`Folder does not exist: "${BUILD_PATH}"`);

// Ensure URLS are provided
if (!BACKEND_URL) throw new Error('Missing env: "BACKEND_URL"');
if (!FRONTEND_URL) throw new Error('Missing env: "FRONTEND_URL"');

/**
 * The url of the backend server
 */
module.exports = {
  BACKEND_URL,
  FRONTEND_URL,
  PROXY_ROUTE,
  SSL_CERT,
  SSL_KEY,
  BUILD_PATH,
  S3_BUCKET,
  AWS_ACCESS_KEY_ID,
  AWS_SECRET_ACCESS_KEY,
  WRITE_FRAGMENT_PATH,
  FRAGMENTS_ROUTE,
  NODE_ENV,
};
