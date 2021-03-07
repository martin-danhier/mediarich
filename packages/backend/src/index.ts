/**
 * @file Main file of the backend, launches the server
 * @author Martin Danhier
 * @version 1.0
 */

import Server from './server';
import { Logger } from './utils';

// Start server
Server.initServer()
    .then(() => Logger.info('Server started successfully.'))
    .catch(err => Logger.error(`Server failed to start: ${err}`));
