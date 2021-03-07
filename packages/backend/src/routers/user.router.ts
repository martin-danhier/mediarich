/**
 * @file Router for user manipulation
 * @author Martin Danhier
 * @version 1.0
 */

import { Router } from 'express';
import { AuthMiddleware } from '../middlewares';
import { UserRepository } from '../repositories';
import { Logger, validate } from '../utils';

export const router = Router();

// == ADD ==

interface UserAddParams {
    username: string;
    password: string;
    apiKey: string;
}

router.post('/add', async (req, res) => {

    const body = validate<UserAddParams>(req, res, {
        username: 'string',
        password: 'string',
        apiKey: 'string',
    });

    if (body) {
        Logger.log(`Creating account "${body.username}"`);

        // Try to create the user
        const existingUser = await UserRepository.getUserByName(body.username);

        // Check if the user already exists
        if (existingUser !== null) {
            Logger.log(`Unable to add account "${body.username}" because the username was already taken.`);
            res.status(409).send({
                error: true,
                cause: 'Username already taken',
            });
        } else {
            // Create the user
            const user = await UserRepository.registerUser(body.username, body.password, body.apiKey);
            // If everything worked
            if (user) {
                res.status(200).send({
                    error: false,
                });
            } else {
                res.status(500).send({
                    error: true,
                    cause: 'Unknown error'
                });
            }
        }
    }
});

// == LOGIN ==

interface UserLoginParams {
    username: string;
    password: string;
}

router.post('/login', async (req, res) => {
    // Validate the body
    const body = validate<UserLoginParams>(req, res, {
        password: 'string',
        username: 'string',
    });

    // If it is correct
    if (body) {
        // If the user exists
        const user = await UserRepository.getUserByName(body.username);
        if (user) {
            // If the password is correct
            const passwordOk = await UserRepository.checkUserPassword(user, body.password);
            if (passwordOk) {

                // Log in the user
                req.session.user = user;

                // Send the api key in case of success
                res.status(200).send({
                    error: false,
                    apiKey: user.apiKey,
                });
                return;

            }
        }

        req.session.destroy(() => null);

        // Incorrect: send error
        res.status(401).send({
            error: true,
            cause: 'Incorrect username or password'
        });
    }
});

// == UPDATE ==

interface UserEditParams {
    username: string;
    newPassword: string | undefined;
    newApiKey: string | undefined;
}

router.post('/edit', AuthMiddleware, async (req, res) => {

    // Validate the body
    const body = validate<UserEditParams>(req, res, {
        username: 'string',
        newApiKey: 'string?',
        newPassword: 'string?'
    });

    // If it is correct
    if (body) {
        const user = await UserRepository.getUserByName(body.username);

        // Check if the modified user is the same as the connected one
        if (user && req.session.user && req.session.user.uuid === user?.uuid) {
            const updatedFields = await UserRepository.editUser(body.username, body.newPassword, body.newApiKey);
            // If it worked
            if (updatedFields) {
                res.status(200).send({
                    error: false,
                    updated: updatedFields,
                });
            }
            // If it didn't
            else {
                res.status(500).send({
                    error: true,
                    cause: 'Unknown error',
                });
            }
        } else {
            // Incorrect: send error
            res.status(401).send({
                error: true,
                cause: 'You don\'t have the permission to update this account',
            });
        }

    }
});

router.get('/disconnect', async (req, res) => {
    // Destroy the session
    req.session.destroy(() => null);

    // Send a response
    res.status(200).send({
        error: false,
    });
});

router.get('/test', AuthMiddleware, async (req, res) => {
    if (req.session.user) {
        // Send a response
        res.status(200).send({
            error: false,
            username: req.session.user.username,
            apiKey: req.session.user.apiKey,
        });
    }
});