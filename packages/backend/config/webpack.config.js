
const ForkTsCheckerWebpackPlugin = require('react-dev-utils/ForkTsCheckerWebpackPlugin');
const typescriptFormatter = require('react-dev-utils/typescriptFormatter');
const resolve = require('resolve');
const paths = require('./paths');
const nodeExternals = require('webpack-node-externals');

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
        externals: [nodeExternals()],
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
        ]
    };
};