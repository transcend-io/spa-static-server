/* eslint-disable no-underscore-dangle */

// external modules
const { writeFile } = require('fs');
const https = require('https');
const fetch = require('node-fetch');

// local
const logger = require('./logger');

/**
 * Fetch with a timeout
 *
 * @param url - The fetch url
 * @param options - The fetch options
 * @param timeout - Timeout
 */
function fetchTimeout(url, options, timeout = 4000) {
  return Promise.race([
    fetch(url, options),
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error('timeout')), timeout),
    ),
  ]);
}

/**
 * Get the fragment types from the backend graphql route, and write them to file so that apollo client can optimize fragments without throwing a console warning.
 *
 * @memberof module:utils
 *
 * @param graphqlRoute - The url of the graphql route
 * @param writeLocation - The absolute path to where the results should be written
 * @param options - Get fragment options
 * @returns Writes results to file specified
 */
module.exports = async function getFragmentTypes(
  graphqlRoute,
  writeLocation,
  options = {},
) {
  const { timeout = 3000, mustReturn = false } = options;
  // Get and store the fragment types from the graphql api
  return fetchTimeout(
    graphqlRoute,
    {
      agent: new https.Agent({ rejectUnauthorized: false }),
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        variables: {},
        operationName: '',
        query: `
        {
          __schema {
            types {
              kind
              name
              possibleTypes {
                name
              }
            }
          }
        }
      `,
      }),
    },
    timeout,
  )
    .then((result) => result.json())
    .then((result) => {
      // here we're filtering out any type information unrelated to unions or interfaces
      const filteredData = result.data.__schema.types.filter(
        (type) => type.possibleTypes !== null,
      );
      result.data.__schema.types = filteredData; // eslint-disable-line no-param-reassign
      writeFile(writeLocation, JSON.stringify(result.data, null, 2), (err) => {
        if (err) {
          logger.error('Error writing fragmentTypes file');
          logger.error(err);
        } else {
          logger.log('Fragment types successfully extracted!');
        }
      });
    })
    .catch((err) => {
      if (
        !mustReturn &&
        (err.message === 'timeout' ||
          err.message.includes(
            'Client network socket disconnected before secure TLS connection was established',
          ) ||
          err.message.includes('ECONNREFUSED'))
      ) {
        logger.log('[SKIP] Skipping fragment types because backend is off');
      } else {
        throw err;
      }
    });
};
