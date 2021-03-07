/**
 * @file Forked from Create React app: do the same thing as react, but for an express.js server
 * @author Martin Danhier, Facebook
 */

const ForkTsCheckerWebpackPlugin = require('react-dev-utils/ForkTsCheckerWebpackPlugin');
const typescriptFormatter = require('react-dev-utils/typescriptFormatter');
const resolve = require('resolve');
const paths = require('./paths');
const webpackNodeExternals = require('webpack-node-externals');
const TerserPlugin = require('terser-webpack-plugin');
const webpack = require('webpack');
const path = require('path');
const GeneratePackageJsonPlugin = require('generate-package-json-webpack-plugin');

const basePackage = {
    'name': 'mediarich',
    'version': '1.0.0',
    'description': 'Enhanced media management platform for medias.unamur.be',
    'author': 'Martin Danhier',
    'main': './index.js',
    'scripts': {
        'start': 'node ./index.js'
    },
    'dependencies': {
        'sqlite3': '^5.0.2'
    }
};

/**
 * 
 * @param {string} webpackEnv
 * @typedef {import('webpack').Configuration} WebpackConfiguration
 * @returns {WebpackConfiguration}
 */
module.exports = function (webpackEnv) {

    const isEnvDevelopment = webpackEnv === 'development';
    const isEnvProduction = webpackEnv === 'production';

    return {
        entry: paths.serverIndex,
        mode: isEnvProduction ? 'production' : isEnvDevelopment && 'development',
        // devtool: isEnvProduction
        //     ? shouldUseSourceMap
        //         ? 'source-map'
        //         : false
        //     : isEnvDevelopment && 'cheap-module-source-map',
        target: 'node',
        output: {
            path: paths.buildDir,
            filename: 'index.js'
        },
        resolve: {
            extensions: ['.ts', '.js'],
        },
        module: {
            rules: [
                {
                    test: /\.ts$/,
                    use: [
                        'ts-loader'
                    ]
                }
            ]
        },
        optimization: {
            minimize: isEnvProduction,
            minimizer: [
                new TerserPlugin({
                    terserOptions: {
                        keep_classnames: true,
                    }
                })
            ]
        },
        externals: [webpackNodeExternals({
            modulesDir: paths.appNodeModules,
            additionalModuleDirs: [
                paths.rootNodeModules,
            ]
        })],
        plugins: [
            new ForkTsCheckerWebpackPlugin({

                typescript: resolve.sync('typescript', {
                    basedir: paths.appNodeModules,
                }),
                async: isEnvDevelopment,
                checkSyntacticErrors: true,
                resolveModuleNameModule: process.versions.pnp
                    ? `${__dirname}/pnpTs.js`
                    : undefined,
                resolveTypeReferenceDirectiveModule: process.versions.pnp
                    ? `${__dirname}/pnpTs.js`
                    : undefined,
                tsconfig: paths.appTsConfig,
                reportFiles: [
                    // This one is specifically to match during CI tests,
                    // as micromatch doesn't match
                    // '../cra-template-typescript/template/src/App.tsx'
                    // otherwise.
                    '../**/src/**/*.{ts,tsx}',
                    '**/src/**/*.{ts,tsx}',
                    '!**/src/**/__tests__/**',
                    '!**/src/**/?(*.)(spec|test).*',
                    '!**/src/setupProxy.*',
                    '!**/src/setupTests.*',
                ],
                silent: true,
                // The formatter is invoked directly in WebpackDevServerUtils during development
                formatter: typescriptFormatter,
            }),
            new webpack.ContextReplacementPlugin(
                /Sequelize(\\|\/)/,
                path.resolve(__dirname, '../src')
            ),
            isEnvProduction && new GeneratePackageJsonPlugin(basePackage),
        ].filter(Boolean)
    };
};