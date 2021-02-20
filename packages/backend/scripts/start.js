'use strict';

// Do this as the first thing so that any code reading it knows the right env.
process.env.BABEL_ENV = 'development';
process.env.NODE_ENV = 'development';

// Makes the script crash on unhandled rejections instead of silently
// ignoring them. In the future, promise rejections that are not handled will
// terminate the Node.js process with a non-zero exit code.
process.on('unhandledRejection', err => {
  throw err;
});

// Read environment variables
require('../config/env');

const webpack = require('webpack');
const child_process = require('child_process');
const paths = require('../config/paths');
const createCompiler = require('../config/createCompiler');
const configFactory = require('../config/webpack.config');
const { SIGINT, SIGTERM } = require('constants');

const tscCompileOnError = process.env.TSC_COMPILE_ON_ERROR === 'true';
const config = configFactory('development');

/** @type {child_process.ChildProcess} */
let server;

// Set port to 8000 if it is not set correctly
process.env.SERVER_PORT = parseInt(process.env.SERVER_PORT, 10) || 8000;

// Create webpack compiler

/** @type {webpack.Compiler | webpack.MultiCompiler} */
const compiler = createCompiler({
  config,
  webpack,
  tscCompileOnError,
  doneCallback: async (shouldStart) => {
    if (shouldStart) {
      server = await child_process.fork(paths.buildIndexModule);
    }
  }
});

compiler.hooks.beforeCompile.tap('stopServer', () => {
  if (server) {
    server.kill(SIGINT);
  }
})

compiler.watch({
  aggregateTimeout: 2000,
  stdin: true,
}, (err, stats) => { });

// Handle signals
['SIGINT', 'SIGTERM'].forEach(function (sig) {
  process.on(sig, function () {
    if (server) {
      server.kill(SIGTERM);
    }
    process.exit();
  });
});