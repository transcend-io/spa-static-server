/* eslint-disable global-require */

/**
 * Front-end middleware
 *
 * @param {*} app - The app without middlewares
 * @param {*} options - The options to pass to the middlewares
 * @returns {*} The app containing the proper middlewares
 */
module.exports = (app, options) => {
  const isProd = process.env.NODE_ENV === 'production';

  if (isProd) {
    const addProdMiddlewares = require('./addProdMiddlewares');
    addProdMiddlewares(app, options);
  } else {
    const webpackConfig = require('../../internals/webpack/webpack.development.babel');
    const addDevMiddlewares = require('./addDevMiddlewares');
    addDevMiddlewares(app, webpackConfig);
  }

  return app;
};
