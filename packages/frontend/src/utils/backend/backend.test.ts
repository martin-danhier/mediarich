/**
 * @file Tests for the mediarich backend
 * @version 1.0
 * @author Martin Danhier
 */

import fetch, { MockResponseInit } from 'jest-fetch-mock';
import { JSONInnerObject } from 'utils/api-client';
import { MediarichAPIHandler, UserAddResult, UserLoginResult } from '.';

/** Helper function that generate a mock response */
function mockUserResponse(status: number, json: JSONInnerObject, headers?: Record<string, string>): Promise<MockResponseInit> {
    return Promise.resolve({
        status,
        headers: {
            'Content-Type': 'application/json',
            ...headers,
        },
        body: JSON.stringify(json),
    });
}

// Create mock
beforeAll(() => {
    // Setup mocks
    fetch.mockResponse(async req => {

        const json = await req.json();

        // User add
        if (req.url === 'http://localhost:8000/api/user/add') {
            // Username taken
            if (json.username === 'existing') {
                return mockUserResponse(409, {
                    error: true,
                    cause: 'Username already taken',
                });
            }
            // Working
            else {
                return mockUserResponse(200, {
                    error: false,
                });
            }
        }
        // User login
        else if (req.url === 'http://localhost:8000/api/user/login') {
            // Invalid username or password
            if (json.username !== 'existing' || json.password !== 'password') {
                return mockUserResponse(401, {
                    error: true,
                    cause: 'Incorrect username or password'
                });
            }
            // Success
            else {
                return mockUserResponse(200, {
                    error: false,
                    apiKey: 'api-key',
                }, {
                    // Add the session cookie
                    'Set-Cookie': 'connect.sid=s%3Avery.secure%2F%2Fsession%2Ftoken; Path=/; HttpOnly'
                });
            }
        }
        else {
            return Promise.reject(new Error('Bad URL: ' + req.url));
        }
    });
});

afterEach(() => {
    // Mock should have been used
    expect(fetch).toHaveBeenCalled();
});

test('Username taken', async () => {
    // Try to add a user
    const status = await MediarichAPIHandler.addUser({
        username: 'existing',
        password: 'password',
        apiKey: 'api-key',
    });

    // Should conflict because it already exist
    expect(status).toBe(UserAddResult.Conflict);
});

test('Add user ok', async () => {
    // Try to add a user
    const status = await MediarichAPIHandler.addUser({
        username: 'new_one',
        password: 'password',
        apiKey: 'api-key',
    });

    // Should work
    expect(status).toBe(UserAddResult.Added);
});

test('Login user invalid username', async () => {
    // Try to login a user
    const result = await MediarichAPIHandler.loginUser({
        username: 'unexisting',
        password: 'password',
    });

    // Should not work
    expect(result.status).toBe(UserLoginResult.Unauthorized);
    expect(result.apiKey).toBeUndefined();
});

test('Login user invalid password', async () => {
    // Try to login a user
    const result = await MediarichAPIHandler.loginUser({
        username: 'existing',
        password: 'wrong',
    });

    // Should not work
    expect(result.status).toBe(UserLoginResult.Unauthorized);
    expect(result.apiKey).toBeUndefined();
});

test('Login user ok', async () => {
    // Try to login a user
    const result = await MediarichAPIHandler.loginUser({
        username: 'existing',
        password: 'password',
    });

    // Should work
    expect(result.status).toBe(UserLoginResult.LoggedIn);
    expect(result.apiKey).toBe('api-key');
});
