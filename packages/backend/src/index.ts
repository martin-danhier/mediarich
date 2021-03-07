/**
 * @file Main file of the backend, launches the server
 * @author Martin Danhier
 * @license Apache
 * @version 1.0
 */

import Server from './server';
import { Logger } from './utils';

// Start server
Server.initServer()
    .then(() => Logger.info('Server started successfully.'))
    .catch(err => {
        // Print the full error with console to have the details
        console.error(err);
        Logger.error(`Server failed to start: ${err}`);
    });
