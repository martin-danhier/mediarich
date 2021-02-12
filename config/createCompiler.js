const forkTsCheckerWebpackPlugin = require('react-dev-utils/ForkTsCheckerWebpackPlugin');
const typescriptFormatter = require('react-dev-utils/typescriptFormatter');
const chalk = require('chalk');
const clearConsole = require('react-dev-utils/clearConsole');
const formatWebpackMessages = require('react-dev-utils/formatWebpackMessages');

const isInteractive = process.stdout.isTTY;


// Forked from react_dev_utils

function createCompiler({
    webpack,
    config,
    tscCompileOnError,
    doneCallback
}) {
    // Create the compiler
    let compiler;
    try {
        compiler = webpack(config);
    } catch (err) {
        console.log(chalk.red('Failed to compile.'));
        console.log();
        console.log(err.message || err);
        console.log();
        process.exit(1);
    }

    // "invalid" event fires when you have changed a file, and webpack is
    // recompiling a bundle. WebpackDevServer takes care to pause serving the
    // bundle, so if you refresh, it'll wait instead of serving the old one.
    // "invalid" is short for "bundle invalidated", it doesn't imply any errors.
    compiler.hooks.invalid.tap('invalid', () => {
        if (isInteractive) {
            clearConsole();
        }
        console.log('Compiling...');
    });


    let isFirstCompile = true;
    let tsMessagesPromise;
    let tsMessagesResolver;

    // Configure typescript
    compiler.hooks.beforeCompile.tap('beforeCompile', () => {
        tsMessagesPromise = new Promise(resolve => {
            tsMessagesResolver = msgs => resolve(msgs);
        });
    });

    forkTsCheckerWebpackPlugin
        .getCompilerHooks(compiler)
        .receive.tap('afterTypeScriptCheck', (diagnostics, lints) => {
            // Get all messages
            const allMsgs = [...diagnostics, ...lints];
            // Format them
            const format = message =>
                `${message.file}\n${typescriptFormatter(message, true)}`;

            tsMessagesResolver({
                errors: allMsgs.filter(msg => msg.severity === 'error').map(format),
                warnings: allMsgs
                    .filter(msg => msg.severity === 'warning')
                    .map(format),
            });
        });

    // When compilation is finished
    compiler.hooks.done.tap('done', async (stats) => {
        if (isInteractive) {
            clearConsole();
        }

        // Get the list of errors and warnings
        const statsData = stats.toJson({
            all: false,
            warnings: true,
            errors: true,
        });

        // Typescript type check
        if (statsData.errors.length === 0) {
            const delayedMsg = setTimeout(() => {
                console.log(
                    chalk.yellow(
                        'Files successfully emitted, waiting for typecheck results...'
                    )
                );
            }, 100);

            const messages = await tsMessagesPromise;
            clearTimeout(delayedMsg);

            // Add errors to the list
            // Add them as warning if ts errors should not stop compilation
            if (tscCompileOnError) {
                statsData.warnings.push(...messages.errors);
            } else {
                statsData.errors.push(...messages.errors);
            }
            // Add the warnings to the list
            statsData.warnings.push(...messages.warnings);

            // Push errors and warnings into compilation result
            // to show them after page refresh triggered by user.
            if (tscCompileOnError) {
                stats.compilation.warnings.push(...messages.errors);
            } else {
                stats.compilation.errors.push(...messages.errors);
            }
            stats.compilation.warnings.push(...messages.warnings);

            // Clear console
            if (isInteractive) {
                clearConsole();
            }
        }

        const messages = formatWebpackMessages(statsData);
        const isSuccessful = !messages.errors.length && !messages.warnings.length;

        if (isSuccessful) {
            console.log(chalk.green('Compiled successfully!\n'));
        }

        // If errors exist, only show errors.
        if (messages.errors.length) {
            // Only keep the first error. Others are often indicative
            // of the same problem, but confuse the reader with noise.
            if (messages.errors.length > 1) {
                messages.errors.length = 1;
            }
            console.log(chalk.red('Failed to compile.\n'));
            console.log(messages.errors.join('\n\n'));
            return;
        }

        // Show warnings if no errors were found.
        if (messages.warnings.length) {
            console.log(chalk.yellow('Compiled with warnings.\n'));
            console.log(messages.warnings.join('\n\n'));

            // Teach some ESLint tricks.
            console.log(
                '\nSearch for the ' +
                chalk.underline(chalk.yellow('keywords')) +
                ' to learn more about each warning.'
            );
            console.log(
                'To ignore, add ' +
                chalk.cyan('// eslint-disable-next-line') +
                ' to the line before.\n'
            );
        }

        if (doneCallback) {
            doneCallback(!messages.errors.length);
        }

    });


    return compiler;
}

module.exports = createCompiler;