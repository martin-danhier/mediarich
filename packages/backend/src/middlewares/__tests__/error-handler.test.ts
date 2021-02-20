import express from 'express';
import { json as jsonParser } from 'body-parser';
import request from 'supertest';
import { ContentTypeCheckMiddleware, ErrorHandlerMiddleware } from '..';
import { Logger } from '../../utils';
import { validate } from '../../utils';

let app: express.Application;

// Init the server
beforeEach(() => {
    // Init server
    Logger.initLevel();
    app = express();

    // Apply middlewares
    app.use(ContentTypeCheckMiddleware([
        'application/json',
    ]));
    app.use(jsonParser());
    app.use(ErrorHandlerMiddleware);

    // Create test route
    app.post('/test-route', (req, res) => {
        const data = validate<{ first: string, second: number, third: boolean }>(req, res, {
            first: 'string',
            second: 'number',
            third: 'boolean'
        });

        // If valid
        if (data) {
            res.status(200).send({
                error: false,
            });
        }
    });


});

// Invalid JSON syntax
test('Invalid JSON', async () => {
    await request(app)
        .post('/test-route')
        .set('Content-Type', 'application/json')
        .send('{ "first": "hello", "second": 4 "third": false}')
        .expect(400)
        .expect({
            error: true,
            cause: 'Unexpected string in JSON at position 32'
        });
});


// Invalid content type
test('No JSON content type', async () => {
    await request(app)
        .post('/test-route')
        .send('{ "first": "hello", "second": 4 "third": false}')
        .expect(400)
        .expect({
            error: true,
            cause: 'Unexpected content type',
            expected: ['application/json'],
            found: 'application/x-www-form-urlencoded'
        });
});

// Valid json and values should work
test('Valid JSON', async () => {
    await request(app)
        .post('/test-route')
        .send({
            first: 'hello',
            second: 4,
            third: true
        })
        .expect(200)
        .expect({
            error: false
        });
});

// Valid json but some fields are missing
test('Valid JSON but missing values', async () => {
    await request(app)
        .post('/test-route')
        .send({
            first: 'hello',
            third: true
        })
        .expect(400)
        .expect({
            error: true,
            cause: 'Missing fields',
            missing: ['second']
        });
});

// Valid json but some fields are of the wrong type
test('Valid JSON but incorrectly typed values', async () => {
    await request(app)
        .post('/test-route')
        .send({
            first: 'hello',
            second: 4,
            third: 1
        })
        .expect(400)
        .expect({
            error: true,
            cause: 'Badly typed fields',
            badlyTyped: [{
                key: 'third',
                expected: 'boolean',
                found: 'number'
            }]
        });
});