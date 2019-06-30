// external modules
const path = require('path');
const express = require('express');
const compression = require('compression');

/**
 * Prod middleware
 *
 * @param {*} app      The app without middlewares
 * @param {*} options  the options to pass to the middlewares
 * @returns {void}
 */
module.exports = function addProdMiddlewares(app, { publicPath = '/', outputPath }) {
  // compression middleware compresses your server responses which makes them
  // smaller (applies also to assets). You can read more about that technique
  // and other good practices on official Express.js docs http://mxs.is/googmy
  app.use(compression());
  app.use(publicPath, express.static(outputPath));

  // Host static
  app.get('*', (req, res) => res.sendFile(path.resolve(outputPath, 'index.html')));
};
