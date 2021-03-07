/**
 * @file Tests for the user router
 * @author Martin Danhier
 * @version 1.0
 */

import request, { agent } from 'supertest';
import { UserRepository } from '../../repositories';
import Server from '../../server';

let app: Express.Application;

// Init the server
beforeEach(async () => {
    // Init server
    await Server.initServerForTests();
    app = Server.getApp();

    // Setup mock data

    // Create some users
    await UserRepository.registerUser('bob12', 'azerty', 'api-key');
    await UserRepository.registerUser('other', 'password', 'the-key');

});

test('Login user with wrong username', async () => {
    // Try to connect to an unexisting account
    await request(app)
        .post('/user/login')
        .send({
            username: 'unexisting',
            password: 'azerty'
        })
        .expect('Content-Type', /json/)
        .expect(401)
        .expect({
            error: true,
            cause: 'Incorrect username or password',
        });
});

test('Login user with wrong password', async () => {
    // Try to connect with a wrong password
    await request(app)
        .post('/user/login')
        .send({
            username: 'bob12',
            password: 'qwerty'
        })
        .expect('Content-Type', /json/)
        .expect(401)
        .expect({
            error: true,
            cause: 'Incorrect username or password',
        });
});

test('Login user ok', async () => {
    // Try to connect with correct credentials
    await request(app)
        .post('/user/login')
        .send({
            username: 'bob12',
            password: 'azerty'
        })
        .expect('Content-Type', /json/)
        .expect(200)
        .expect({
            error: false,
            apiKey: 'api-key'
        });
});

test('User add ok', async () => {
    // Try to add a new user
    await request(app)
        .post('/user/add')
        .send({
            username: 'new',
            password: 'password',
            apiKey: 'my-key'
        })
        .expect('Content-Type', /json/)
        .expect(200)
        .expect({
            error: false,
        });
});

test('User add conflict', async () => {
    // Try to add a new user with an existing name
    await request(app)
        .post('/user/add')
        .send({
            username: 'bob12',
            password: 'password',
            apiKey: 'my-key'
        })
        .expect('Content-Type', /json/)
        .expect(409)
        .expect({
            error: true,
            cause: 'Username already taken'
        });
});

test('User edit not connected', async () => {
    // Try to edit an user while not being connected
    await request(app)
        .post('/user/edit')
        .send({
            username: 'bob12',
            newPassword: 'new_pwd',
            apiKey: 'new-key'
        })
        .expect('Content-Type', /json/)
        .expect(401)
        .expect({
            error: true,
            cause: 'Unauthorized'
        });
});

test('User edit other user', async () => {
    // Use superagent so that cookies persist from one request to another
    const superagent = agent(app);

    // First connect
    await superagent
        .post('/user/login')
        .send({
            username: 'bob12',
            password: 'azerty'
        })
        .expect(200);

    // Try to edit an user while not being connected
    await superagent
        .post('/user/edit')
        .send({
            username: 'other',
            newPassword: 'new_pwd',
            apiKey: 'new-key'
        })
        .expect('Content-Type', /json/)
        .expect(401)
        .expect({
            error: true,
            cause: 'You don\'t have the permission to update this account',
        });
});

test('User edit ok', async () => {
    // Use superagent so that cookies persist from one request to another
    const superagent = agent(app);

    // First connect
    await superagent
        .post('/user/login')
        .send({
            username: 'bob12',
            password: 'azerty'
        })
        .expect(200);

    // Try to edit an user while not being connected
    await superagent
        .post('/user/edit')
        .send({
            username: 'bob12',
            newPassword: 'new_pwd',
            newApiKey: 'new-key'
        })
        .expect('Content-Type', /json/)
        .expect(200)
        .expect({
            error: false,
            updated: ['password', 'apiKey'],
        });
});

test('User test ok', async () => {
    // Use superagent so that cookies persist from one request to another
    const superagent = agent(app);

    // First connect
    await superagent
        .post('/user/login')
        .send({
            username: 'bob12',
            password: 'azerty'
        })
        .expect(200);

    // Then test if connected
    await superagent
        .get('/user/test')
        .expect(200)
        .expect({
            error: false,
            username: 'bob12',
            apiKey: 'api-key'
        });
});

test('User test not connected', async () => {

    // Test if connected
    await request(app)
        .get('/user/test')
        .expect(401)
        .expect({
            error: true,
            cause: 'Unauthorized'
        });
});

test('User disconnect', async () => {
    // Use superagent so that cookies persist from one request to another
    const superagent = agent(app);

    // First connect
    await superagent
        .post('/user/login')
        .send({
            username: 'bob12',
            password: 'azerty'
        })
        .expect(200);

    // Then test if connected. It should be connected.
    await superagent
        .get('/user/test')
        .expect(200)
        .expect({
            error: false,
            username: 'bob12',
            apiKey: 'api-key'
        });

    // Then disconnect
    await superagent
        .get('/user/disconnect')
        .expect(200)
        .expect({
            error: false
        });

    // Then test again. It should be disconnected.
    await request(app)
        .get('/user/test')
        .expect(401)
        .expect({
            error: true,
            cause: 'Unauthorized'
        });

});