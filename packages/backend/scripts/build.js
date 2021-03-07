/**
 * @file Forked from Create React app: do the same thing as react, but for an express.js server
 * @author Martin Danhier, Facebook
 */

'use strict';

// Do this as the first thing so that any code reading it knows the right env.
process.env.BABEL_ENV = 'production';
process.env.NODE_ENV = 'production';

// Makes the script crash on unhandled rejections instead of silently
// ignoring them. In the future, promise rejections that are not handled will
// terminate the Node.js process with a non-zero exit code.
process.on('unhandledRejection', err => {
    throw err;
});

// Ensure environment variables are read.
require('../config/env');

const webpack = require('webpack');
const paths = require('../config/paths');
const createCompiler = require('../config/createCompiler');
const configFactory = require('../config/webpack.config');
const tscCompileOnError = process.env.TSC_COMPILE_ON_ERROR === 'true';

const config = configFactory('production');

/** @type {webpack.Compiler | webpack.MultiCompiler} */
const compiler = createCompiler({
    config,
    webpack,
    tscCompileOnError
  });

compiler.run()