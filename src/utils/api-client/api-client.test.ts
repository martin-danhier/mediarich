import APIClient from './api-client';
import { AssertionError } from 'utils/assert/assert';
import fetch from 'jest-fetch-mock';
import { HTTPStatusCodes, MIMETypes } from './types';

let client: APIClient;

beforeAll(() => {
    // Create API Client (the class we want to test)
    client = new APIClient({
        baseURL: 'https://en.wikipedia.org/wiki',
        routes: {
            // Existing route
            existing: {
                method: 'GET',
                url: '/API_testing',
                requestContentType: MIMETypes.None,
                expectedResponses: {
                    // OK : return page in html
                    [HTTPStatusCodes.OK]: {
                        isSuccess: true,
                        expectedContentTypes: [MIMETypes.HTML],
                    },
                }
            },
            // Existing route, but the URL is not valid
            wrongSpec: {
                method: 'POST',
                url: '/Error_404',
            },
            // JSON input
            jsonInput: {
                method: 'POST',
                url: '/JSON',
                requestContentType: MIMETypes.JSON,
                expectedResponses: {
                    // OK : return data in JSON
                    [HTTPStatusCodes.InternalServerError]: {
                        isSuccess: false,
                        expectedContentTypes: [MIMETypes.JSON],
                    },
                }
            }
        }
    });

    // Setup mocks
    fetch.mockResponse(async req => {
        switch (req.url) {
            // "existing" route
            case 'https://en.wikipedia.org/wiki/API_testing':
                // Return a fake response
                return Promise.resolve({
                    body: '<!DOCTYPE html><html><body><h1>Titre</h1></body></html>',
                    init: {
                        headers: {
                            'Content-Type': 'text/html; charset=UTF-8',
                            'Content-Length': '55',
                        },
                        status: 200,
                        statusText: 'OK',
                    }
                });
            // "JSON" route
            case 'https://en.wikipedia.org/wiki/JSON':

                // Do some checks on the request as well
                // expect(await req.json()).toBe('{number: 4}');
                // expect(req.headers.get('Content-Type')).toBe('application/json; charset=UTF8');
                // expect(req.headers.get('Content-Length')).toBe('11');

                // Return a fake response
                return Promise.resolve({
                    body: '{"value": 12, "list": ["item", "item2"]}',
                    init: {
                        headers: {
                            'Content-Type': 'application/json; charset=UTF-8',
                            'Content-Length': '55',
                        },
                        status: 500,
                        statusText: 'Internal Server Error',
                    }
                });

            // URL not supported in mock
            default:
                return Promise.reject(new Error('Bad URL: ' + req.url));
        }
    });
});

/**
 * Function containing several checks on the http response.
 * It is a separate function because it is used in several tests.
 * @param response HTTP response of the mock fetch
 */
async function checkMockResponse(response: Response | undefined): Promise<void> {
    // The response is not undefined
    expect(response).toBeDefined();

    if (response !== undefined) {
        // The header is the same as in the mock
        expect(response.headers.get('Content-Type')).toBe('text/html; charset=UTF-8');
        // The status is the same as in the mock
        expect(response.status).toBe(200);
        // The status text is the same as in the mock
        expect(response.statusText).toBe('OK');

        const text = await response.text();

        // The body is the same as in the mock
        expect(text).toBe('<!DOCTYPE html><html><body><h1>Titre</h1></body></html>');
    }

    // Just in case, check that the mock function have been called
    expect(fetch).toHaveBeenCalled();
}


test('can\'t call undefined routes', async () => {
    expect(client.call('unexisting')).rejects.toThrow(AssertionError);
});

test('can call existing routes', () => {
    expect(async () => await client.call('existing')).not.toThrow();
});

/**
 * This test aims to check if the mock is set up correctly.
 * If is it not set up correctly, it will call the real wikipedia page.
 */
test('fetch mock works', async () => {
    // Try to fetch the mock
    const response = await fetch('https://en.wikipedia.org/wiki/API_testing', {
        method: 'GET',
    });

    // Check that the response is valid
    await checkMockResponse(response);

});

/**
 * The client should return the response, as if we did a normal fetch
 */
test('API client fetch works', async () => {
    const response = await client.call('existing');

    // Check that the response is valid
    await checkMockResponse(response);
});

/**
 * The route exists in the specification, but the URL is not valid.
 * The client should return undefined for now.
 */
test('API client fetch error returns undefined', async () => {
    const response = await client.call('wrongSpec');

    expect(response).toBeUndefined();
});

test('JSON in request', async () => {
    const response = await client.call('jsonInput', {number: 4});

    // Check that the response is the same as in the mock
    expect(response).toBeDefined();
    if (response !== undefined) {
        // The status is the same as in the mock
        expect(response.status).toBe(500);
        // The status text is the same as in the mock
        expect(response.statusText).toBe('Internal Server Error');
        // The body is the same as in the mock
        expect(await response.json()).toStrictEqual({ value: 12, list: ['item', 'item2'] });
    }

});

test('Generic object but no JSON content type', async () => {
    // It is not allowed to give a generic object to the call function with a route that doesn't send JSON
    expect(client.call('existing', {number: 4})).rejects.toThrow(AssertionError);
});