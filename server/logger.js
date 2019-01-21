/* eslint-disable no-console */

// external modules
const chalk = require('chalk');

// Divider
const divider = chalk.gray('\n-----------------------------------');

/**
 * Logger middleware, you can customize it to make messages more personal
 */
const logger = {
  // Called when express.js app starts on given port w/o errors
  appStarted: (port, host, tunnelStarted) => {
    console.log(`Server started ! ${chalk.green('✓')}`);

    // If the tunnel started, log that and the URL it's available at
    if (tunnelStarted) {
      console.log(`Tunnel initialized ${chalk.green('✓')}`);
    }

    console.log(`
${chalk.bold('Access URLs:')}${divider}
Localhost: ${chalk.magenta(`${host}:${port}`)}
NODE_ENV: ${process.env.NODE_ENV}
${chalk.blue(`Press ${chalk.italic('CTRL-C')} to stop`)}
    `);
  },

  // Log the configuration
  config: (vars) => Object.entries(vars)
    .forEach(([key, val]) => console.log(`  ${key}: ${val}`)),

  // Called whenever there's an error on the server we want to print
  error: (err) => {
    console.error(chalk.red(err));
  },
};

module.exports = logger;
