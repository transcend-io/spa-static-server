/* eslint-disable global-require */
// external modules
const { existsSync } = require('fs');
const { resolve } = require('path');

// local
const { NODE_ENV, WEBPACK_PATH } = require('../envs');

/**
 * Front-end middleware
 *
 * @param {*} app - The app without middlewares
 * @param {*} options - The options to pass to the middlewares
 * @returns {*} The app containing the proper middlewares
 */
module.exports = (app, options) => {
  const isProd = NODE_ENV === 'production';

  if (isProd) {
    const addProdMiddlewares = require('./addProdMiddlewares');
    addProdMiddlewares(app, options);
  } else {
    const FULL_PATH = resolve(WEBPACK_PATH);
    if (!existsSync(FULL_PATH)) {
      throw new Error(`Invalid path to webpack config: "${WEBPACK_PATH}"`)
    }
    const webpackConfig = require(FULL_PATH); // eslint-disable-line import/no-dynamic-require
    const addDevMiddlewares = require('./addDevMiddlewares');
    addDevMiddlewares(app, webpackConfig);
  }

  return app;
};
