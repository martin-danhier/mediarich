/**
 * @file Forked from Create React app: do the same thing as react, but for an express.js server
 * @author Martin Danhier, Facebook
 */

'use strict';

const path = require('path');
const fs = require('fs');
const { resolve } = require('path');

// Make sure any symlinks in the project folder are resolved:
// https://github.com/facebook/create-react-app/issues/637
const appDirectory = fs.realpathSync(process.cwd());
const resolveApp = relativePath => path.resolve(appDirectory, relativePath);

const moduleFileExtensions = [
    'js',
    'ts',
    'tsx',
    'json',
    'jsx',
];

// Resolve file paths in the same order as webpack
const resolveModule = (resolveFn, filePath) => {
    const extension = moduleFileExtensions.find(extension =>
        fs.existsSync(resolveFn(`${filePath}.${extension}`))
    );

    if (extension) {
        return resolveFn(`${filePath}.${extension}`);
    }

    return resolveFn(`${filePath}.js`);
};


module.exports = {
    appPath: resolveApp('.'),
    srcDir: resolveApp('src'),
    buildDir: resolveApp('build'),
    buildIndexModule: resolveModule(resolveApp, 'build/index'),
    serverIndex: resolveModule(resolveApp, 'src/index'),
    appTsConfig: resolveApp('tsconfig.json'),
    appPackageJson: resolveApp('package.json'),
    appNodeModules: resolveApp('node_modules'),
    rootNodeModules: resolveApp('../../node_modules'),
    dotenv: resolveApp('.env'),
};