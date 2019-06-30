/* eslint-disable no-console */

// external modules
const chalk = require('chalk');

// local
const envs = require('./envs');

// Divider
const divider = chalk.gray('\n-----------------------------------');

/**
 * Logger middleware, you can customize it to make messages more personal
 */
const logger = {
  /** Info */
  info: (x) => console.log(chalk.magenta(x)),

  /** Called when express.js app starts on given port w/o errors */
  appStarted: (port, host, tunnelStarted) => {
    console.log(`Server started ! ${chalk.green('✓')}`);

    // If the tunnel started, log that and the URL it's available at
    if (tunnelStarted) {
      console.log(`Tunnel initialized ${chalk.green('✓')}`);
    }

    console.log(`
${chalk.bold('Access URLs:')}${divider}
Localhost: ${chalk.magenta(`${host}:${port}`)}
NODE_ENV: ${envs.NODE_ENV}
${chalk.blue(`Press ${chalk.italic('CTRL-C')} to stop`)}
    `);
  },

  /** Log the configuration */
  config: (vars) => {
    console.log(chalk.bold('ENVS:'));
    console.log(divider)
    Object.entries(vars)
      .filter(([k, v]) => !k.includes('AWS_') && v !== undefined)
      .forEach(([key, val]) => console.log(`  ${key}: ${val}`))
    console.log(divider)
  },

  /** Called whenever there's an error on the server we want to print */
  error: (err) => {
    console.error(chalk.red(err));
  },

  /** Standard log */
  log: (...args) => console.log(args),
};

module.exports = logger;
