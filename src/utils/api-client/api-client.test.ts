import APIClient from './api-client';
import { AssertionError } from 'utils/assert/assert';
import fetch from 'jest-fetch-mock';
import { APIRouteSpecification, APIRoutesSpecification, APISpecification, HTTPStatusCodes, MIMETypes } from './types';
import { strictEqual } from 'assert';
import Cookies from 'js-cookie';

/** Routes of the test API. Use a 'implements , so the autocompletion will know the names of the routes*/
class TestApiRoutes implements APIRoutesSpecification<TestApiRoutes> {
    // Existing route
    existing: APIRouteSpecification<TestApiRoutes> = {
        method: 'GET',
        url: '/API_testing',
        requestContentType: MIMETypes.None,
        expectedResponses: {
            // OK : return page in html
            [HTTPStatusCodes.OK]: {
                isSuccess: true,
                expectedContentTypes: [MIMETypes.HTML],
            },
        },
        headers: {
            'Authorization': 'Bearer #{token}'
        }
    };
    // Existing route, but in post
    existingPost: APIRouteSpecification<TestApiRoutes> = {
        method: 'POST',
        url: '/API_testing',
        requestContentType: MIMETypes.None,
        expectedResponses: {
            // OK : return page in html
            [HTTPStatusCodes.OK]: {
                isSuccess: true,
                expectedContentTypes: [MIMETypes.HTML],
            },
        },
    };
    // Existing route, but the URL is not valid
    wrongSpec: APIRouteSpecification<TestApiRoutes> = {
        method: 'POST',
        url: '/Error_404',
        errorHandling: {
            shouldLogError: true,
            shouldRethrow: true,
        }
    };
    // Other wrong spec, with handler
    otherWrongSpec: APIRouteSpecification<TestApiRoutes> = {
        method: 'POST',
        url: '/Error_404',
        errorHandling: {
            shouldLogError: false,
            shouldRethrow: false,
            callback: otherWrongSpecErrorCallback,
        }
    };
    // JSON input
    jsonInput: APIRouteSpecification<TestApiRoutes> = {
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
    };
    // Blob input
    blobInput: APIRouteSpecification<TestApiRoutes> = {
        method: 'POST',
        url: '/blob',
        expectedResponses: {
            [HTTPStatusCodes.OK]: {
                isSuccess: true,
                expectedContentTypes: [MIMETypes.None],
            }
        },
        requestContentType: MIMETypes.JSON,
    };
    // Buffer input
    bufferInput: APIRouteSpecification<TestApiRoutes> = {
        method: 'POST',
        url: '/buffer',
        expectedResponses: {
            [HTTPStatusCodes.OK]: {
                isSuccess: true,
            }
        },
    };
    // API returns other type than expected
    unexpectedContentType: APIRouteSpecification<TestApiRoutes> = {
        method: 'POST',
        url: '/API_testing',
        expectedResponses: {
            [HTTPStatusCodes.OK]: {
                isSuccess: true,
                expectedContentTypes: [MIMETypes.JSON, MIMETypes.AAC],
            }
        }
    };
    // API returns nothing, but expected something
    expectedContentTypesInResponse: APIRouteSpecification<TestApiRoutes> = {
        method: 'GET',
        url: '/no-content',
        expectedResponses: {
            [HTTPStatusCodes.OK]: {
                isSuccess: true,
                expectedContentTypes: [MIMETypes.JSON],
            }
        }
    };
    // API returns an invalid status code
    unknownStatusCode: APIRouteSpecification<TestApiRoutes> = {
        method: 'GET',
        url: '/teapot',
        expectedResponses: {
            [HTTPStatusCodes.OK]: {
                isSuccess: true,
            }
        }
    };
    // redirection with get
    redirection: APIRouteSpecification<TestApiRoutes> = {
        method: 'GET',
        url: '/redirect',
    };
    // redirection, but override it
    redirectionOverride: APIRouteSpecification<TestApiRoutes> = {
        method: 'GET',
        url: '/redirect',
        expectedResponses: {
            [HTTPStatusCodes.SeeOther]: {
                isSuccess: true,
                shouldRedirectTo: 'existing',
            }
        }
    };
    // Redirection to header location, but no location provided by response
    redirectionUndefinedLocation: APIRouteSpecification<TestApiRoutes> = {
        method: 'GET',
        url: '/no-content',
        expectedResponses: {
            [HTTPStatusCodes.OK]: {
                isSuccess: true,
                shouldRedirectTo: 'header-location',
            }
        }
    };
    // Redirection and preserve body
    redirectionPreserveBody: APIRouteSpecification<TestApiRoutes> = {
        method: 'POST',
        url: '/redirect',
        expectedResponses: {
            [HTTPStatusCodes.SeeOther]: {
                shouldRedirectTo: 'blobInput',
                shouldPreserveRequest: true,
            }
        }
    };
    // Redirection to header location and preserve request
    redirectionHeaderPreserveRequest: APIRouteSpecification<TestApiRoutes> = {
        method: 'POST',
        url: '/redirect',
        expectedResponses: {
            [HTTPStatusCodes.SeeOther]: {
                shouldRedirectTo: 'header-location',
                shouldPreserveRequest: true,
            }
        }
    };
    // Header override
    headerOverride: APIRouteSpecification<TestApiRoutes> = {
        method: 'POST',
        url: '/API_testing',
        requestContentType: MIMETypes.None,
        expectedResponses: {
            // OK : return page in html
            [HTTPStatusCodes.OK]: {
                isSuccess: true,
                expectedContentTypes: [MIMETypes.HTML],
            },
        },
        headers: {
            'Content-Type': 'application/xml',
            'Content-Length': '7',
        }
    };
    // JSON input with body
    jsonInputDefault: APIRouteSpecification<TestApiRoutes> = {
        method: 'POST',
        url: '/JSON',
        requestContentType: MIMETypes.JSON,
        expectedResponses: {
            // OK : return data in JSON
            [HTTPStatusCodes.InternalServerError]: {
                isSuccess: false,
                expectedContentTypes: [MIMETypes.JSON],
            },
        },
        baseJSONBody: {
            token: '#{token}'
        }
    };
}

/** API Specification used for testing */
class TestAPISpecification implements APISpecification<TestApiRoutes> {
    baseURL = 'https://en.wikipedia.org/wiki';
    defaultExternalResponses = {
        201: {
            isSuccess: true,
            expectedContentTypes: [MIMETypes.XML],
        }
    };
    routes = new TestApiRoutes();
}

let client: APIClient<TestAPISpecification, TestApiRoutes>;

beforeAll(() => {
    // Create API Client (the class we want to test)
    client = new APIClient(new TestAPISpecification());

    beforeEach(() => {
        // Reset the call count of fetch between each mock
        jest.clearAllMocks();
        // Clear cookies
        Cookies.remove('token');
    });

    // Setup mocks
    fetch.mockResponse(async req => {

        // "existing" route
        if (req.url === 'https://en.wikipedia.org/wiki/API_testing') {
            const headers: { [key: string]: string } = {
                'Content-Type': 'text/html; charset=UTF-8',
                'Content-Length': '55',
            };

            // If cookie is valid, return a sesskey
            if (req.headers.get('Authorization') === 'Bearer my-very-secure-token') {
                headers['Set-Cookie'] = 'sesskey=ok';
            }

            // Return some of headers for verification
            headers['Request-Content-Type'] = req.headers.get('Content-Type') ?? 'null';
            headers['Request-Content-Length'] = req.headers.get('Content-Length') ?? 'null';

            // Return a fake response
            return Promise.resolve({
                body: '<!DOCTYPE html><html><body><h1>Titre</h1></body></html>',
                init: {
                    headers,
                    status: 200,
                    statusText: 'OK',
                }
            });
        }
        // Existing with query params
        else if (req.url === 'https://en.wikipedia.org/wiki/API_testing?param=value') {
            return Promise.resolve({
                init: {
                    status: HTTPStatusCodes.Created,
                    statusText: 'Created',
                }
            });
        }
        // "JSON" route
        else if (req.url === 'https://en.wikipedia.org/wiki/JSON') {

            // Do some checks on the request as well
            const json = await req.json();
            if (Array.isArray(json)) {
                expect(json).toStrictEqual([4, 5, 6]);
            } else {
                expect(json.number).toBe(4);
                if (json.token) {
                    expect(json.token).toBe('my-very-secure-token');
                }
            }
            expect(req.headers.get('Content-Type')).toBe('application/json; charset=utf-8');

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
        }
        // "Blob" route
        else if (req.url === 'https://en.wikipedia.org/wiki/blob') {

            // Length is 37 in blob test
            strictEqual(req.headers.get('Content-Length'), '37');
            return Promise.resolve({
                init: {
                    status: 200,
                    statusText: 'OK',
                }
            });
        }
        else if (req.url === 'https://en.wikipedia.org/wiki/buffer') {
            // Length is 20 in buffer test
            strictEqual(req.headers.get('Content-Length'), '20');
            return Promise.resolve({
                body: req.headers.get('Content-Length'),
                init: {
                    status: 200,
                    statusText: 'OK',
                }
            });
        }
        // Unexpected empty response
        else if (req.url === 'https://en.wikipedia.org/wiki/no-content') {
            return Promise.resolve({
                init: {
                    status: 200,
                    statusText: 'OK',
                }
            });
        }
        // Invalid status
        else if (req.url === 'https://en.wikipedia.org/wiki/teapot') {
            return Promise.resolve({
                init: {
                    status: 418,
                    statusText: 'I\'m a teapot',
                }
            });
        }
        // Redirection to external site
        else if (req.url === 'https://en.wikipedia.org/wiki/redirect') {
            return Promise.resolve({
                init: {
                    status: 303,
                    statusText: 'See Other',
                    headers: {
                        'Location': 'https://www.unamur.be/',
                    }
                }
            });
        }
        // External request
        else if (req.url === 'https://www.unamur.be/') {
            if (await req.text() === 'request content') {
                return Promise.resolve({
                    body: '{"page": "UNamur", "preserved": true}',
                    init: {
                        status: 200,
                        statusText: 'OK',
                        headers: {
                            'Content-Type': 'application/json; charset=utf-8',
                            'Content-Length': '37',
                        }
                    }
                });
            }
            else {
                return Promise.resolve({
                    body: '{"page": "UNamur"}',
                    init: {
                        status: 200,
                        statusText: 'OK',
                        headers: {
                            'Content-Type': 'application/json; charset=utf-8',
                            'Content-Length': '18',
                        }
                    }
                });
            }
        }
        // External request expected to return something else
        else if (req.url === 'https://www.unamur.be/xml/') {

            return Promise.resolve({
                init: {
                    status: 201,
                    statusText: 'Created',
                }
            });
        }

        // URL not supported in mock
        else {
            return Promise.reject(new Error('Bad URL: ' + req.url));
        }

    });
});

/**
 * Function containing several checks on the http response.
 * It is a separate function because it is used in several tests.
 * @param response HTTP response of the mock fetch
 */
async function checkMockResponse(response: Response | null): Promise<void> {
    // The response is not null
    expect(response).not.toBeNull();

    if (response !== null) {
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

/** Function called during a test, to check if callback works */
function otherWrongSpecErrorCallback(e: Error | string): void {
    expect(e instanceof Error || typeof e === 'string').toBeTruthy();
}

test('can call existing routes', async () => {
    const result = await client.call('existing');
    // Check that the response is valid
    expect(result.ok).toBeTruthy();
    expect(result.response).toBeDefined();
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
    const result = await client.call('existing');

    // Check that the response is valid
    expect(result.ok).toBeTruthy();
    expect(result.response).toBeDefined();
    if (result.response) {
        await checkMockResponse(result.response);
    }
});

/**
 * The route exists in the specification, but the URL is not valid.
 * The client should rethrow the error.
 */
test('API client fetch error throws exception', async () => {
    await expect(client.call('wrongSpec')).rejects.toThrow(Error);
});

/**
 * The route exists in the specification, but the URL is not valid.
 * The client should return null and call the callback.
 */
test('API client fetch error handler works', async () => {
    const result = await client.call('otherWrongSpec');

    // Check that the response is valid
    expect(result.ok).not.toBeTruthy();
    expect(result.response).toBeUndefined();
    expect(result.message).toBeDefined();
    expect(result.message).toBe('Bad URL: https://en.wikipedia.org/wiki/Error_404');
});



test('JSON in request', async () => {
    const result = await client.call('jsonInput', { number: 4 });

    // Check that the response is the same as in the mock
    expect(result.ok).not.toBeTruthy();
    expect(result.message).toBe('Internal server error');
    expect(result.response).toBeDefined();
    if (result.response) {
        // The status is the same as in the mock
        expect(result.response.status).toBe(500);
        // The status text is the same as in the mock
        expect(result.response.statusText).toBe('Internal Server Error');
        // The body is the same as in the mock
        expect(await result.response.json()).toStrictEqual({ value: 12, list: ['item', 'item2'] });
    }

});

test('Blob in request', async () => {
    const data = '{"item" : 4, "bojnour": 4, "hey": 45}';
    const blob = new Blob([data], { type: 'application/json' });

    const result = await client.call('blobInput', blob);

    expect(result.ok).toBeTruthy();
    expect(result.response).toBeDefined();
    if (result.response) {
        expect(result.response.status).toBe(200);
        expect(fetch).toHaveBeenCalled();
    }
});

test('ArrayBuffer in request', async () => {
    // Create an array buffer from a int 32 array (example)
    const buffer = new Int32Array([5, 2, 3, 10, 22]).buffer;
    const result = await client.call('bufferInput', buffer);

    expect(result.ok).toBeTruthy();
    expect(result.response).toBeDefined();
    if (result.response) {
        expect(result.response.status).toBe(200);
        expect(await result.response.text()).toBe(buffer.byteLength.toString());
    }

});

test('Generic object but no JSON content type', async () => {
    // It is not allowed to give a generic object to the call function with a route that doesn't send JSON
    const result = await client.call('existingPost', { number: 4 });

    expect(result.ok).not.toBeTruthy();
    expect(result.message).toBe('If body is a generic object, the content-type must be set to JSON.');
    expect(result.response).toBeUndefined();
});

/**
 * When the api returns an unexpected content type, still return the response, but tell that this is not normal
 */
test('Unexpected response content type', async () => {
    const result = await client.call('unexpectedContentType');

    expect(result.message).toBe('Expected content types [\'application/json\',\'audio/aac\'], got \'text/html\'.');
    expect(result.ok).not.toBeTruthy();
    expect(result.response).toBeDefined();
});

/**
 * When the api returns nothing while we expected somtething, still return the response, but tell that this is not normal
 */
test('Expected a JSON in response but received nothing', async () => {
    const result = await client.call('expectedContentTypesInResponse');

    expect(result.ok).not.toBeTruthy();
    expect(result.message).toBe('Expected content types [\'application/json\'], but the request didn\'t specify a content type.');
    expect(result.response).toBeDefined();
});

/**
 * When the api returns an invalid status code, still return the response, but tell that this is not normal
 */
test('API returns invalid status code', async () => {
    const result = await client.call('unknownStatusCode');

    expect(result.ok).not.toBeTruthy();
    expect(result.message).toBe('Unknown status code: 418 (I\'m a teapot)');
    expect(result.response).toBeDefined();
});

/**
 * Everything works when calling a valid url externally
 */
test('External request', async () => {
    const result = await client.externalCall('https://www.unamur.be/', {
        method: 'GET',
    });
    expect(result.ok).toBeTruthy();
    expect(result.message).toBeUndefined();
    expect(result.response).toBeDefined();
});

/**
 * Test of the handling of unknown status code during external request
 */
test('External bad status', async () => {
    // Call an url that returns a invalid status code
    // This url is defined in the api, but it doesn't matter since we call it externally
    // That way we can test the same things without needing to mock too many urls
    const result = await client.externalCall('https://en.wikipedia.org/wiki/teapot', {
        method: 'GET',
    });
    expect(result.ok).toBeFalsy();
    expect(result.message).toBe('Unknown status code: 418 (I\'m a teapot)');
    expect(result.response).toBeDefined();
});

/**
 * Test an external route that causes an error, to test the handleExternalError method
 */
test('External specification', async () => {
    const result = await client.externalCall('https://www.unamur.be/xml/', {
        method: 'GET',
    });
    expect(result.ok).toBeFalsy();
    expect(result.message).toBe('Expected content types [\'application/xml\'], but the request didn\'t specify a content type.');
    expect(result.response).toBeDefined();
});

test('External bad url', async () => {
    const result = await client.externalCall('https://www.google.com/', {
        method: 'GET',
    });
    expect(result.ok).toBeFalsy();
    expect(result.response).toBeUndefined();
    expect(result.message).toBe('Bad URL: https://www.google.com/');
});

/**
 * Internal route returns 303 redirecting to external url
 * Use the default handling (follow http conventions)
 */
test('Internal redirect to External', async () => {
    const result = await client.call('redirection');
    // Check response
    expect(result.ok).toBeTruthy();
    expect(result.message).toBeUndefined();
    expect(result.response).toBeDefined();
    if (result.response) {
        expect(result.response.status).toBe(200);
        expect(await result.response.text()).toBe('{"page": "UNamur"}');
    }
    // Check mock
    expect(fetch).toHaveBeenCalledTimes(2);
});

test('Internal redirect to other internal', async () => {
    const result = await client.call('redirectionOverride');
    // Check response
    expect(result.ok).toBeTruthy();
    expect(result.message).toBeUndefined();
    expect(result.response).toBeDefined();
    if (result.response) {
        expect(result.response.status).toBe(200);
        expect(await result.response.text()).toBe('<!DOCTYPE html><html><body><h1>Titre</h1></body></html>');
    }
    // Check mock
    expect(fetch).toHaveBeenCalledTimes(2);
});

test('Redirection to undefined location', async () => {
    const result = await client.call('redirectionUndefinedLocation');
    // Check response
    expect(result.ok).toBeFalsy();
    expect(result.message).toBe('Specification indicates to redirect to the location given in the response\'s \'Location\' header, but none was provided.');
    expect(result.response).toBeDefined();
});

test('Redirection to other route and preserve body', async () => {
    // Prepare body
    const data = '{"item" : 4, "bojnour": 4, "hey": 45}';
    const blob = new Blob([data], { type: 'application/json' });
    // Send request
    const result = await client.call('redirectionPreserveBody', blob);

    expect(result.ok).toBeTruthy();
    expect(result.message).toBeUndefined();
    expect(result.response).toBeDefined();
    if (result.response) {
        expect(result.response.status).toBe(200);
    }
    // check mock
    expect(fetch).toHaveBeenCalledTimes(2);
});

test('External call body preserved', async () => {
    const result = await client.call('redirectionHeaderPreserveRequest', 'request content');
    // Check response
    expect(result.ok).toBeTruthy();
    expect(result.message).toBeUndefined();
    expect(result.response).toBeDefined();
    if (result.response) {
        expect(result.response.status).toBe(200);
        const json = await result.response.json();
        expect(json.preserved).toBeTruthy();
    }
    // check mock
    expect(fetch).toHaveBeenCalledTimes(2);
});

test('Header with Cookie', async () => {
    // Set a Cookie
    Cookies.set('token', 'my-very-secure-token');

    const result = await client.call('existing');
    expect(result.ok).toBeTruthy();
    expect(result.message).toBeUndefined();
    expect(result.response).toBeDefined();
    if (result.response) {
        // Check if the response contains a Set-Cookie
        // It is returned by the mock if the cookie was correctly replaced
        expect(result.response.headers.get('Set-Cookie')).toBe('sesskey=ok');
    }
});

test('Header override', async () => {
    const result = await client.call('headerOverride');
    expect(result.ok).toBeTruthy();
    expect(result.message).toBeUndefined();
    expect(result.response).toBeDefined();
    if (result.response) {
        // The mock is programmed to return the received content type and content length
        // Check if the values are the overriden ones
        expect(result.response.headers.get('Request-Content-Type')).toBe('application/xml');
        expect(result.response.headers.get('Request-Content-Length')).toBe('7');
    }
});

test('JSON input with default body', async () => {
    // Set a Cookie
    Cookies.set('token', 'my-very-secure-token');

    const result = await client.call('jsonInputDefault', { number: 4 });

    // Check that the response is the same as in the mock
    expect(result.ok).not.toBeTruthy();
    expect(result.message).toBe('Internal server error');
    expect(result.response).toBeDefined();
    if (result.response) {
        // The status is the same as in the mock
        expect(result.response.status).toBe(500);
        // The status text is the same as in the mock
        expect(result.response.statusText).toBe('Internal Server Error');
        // The body is the same as in the mock
        expect(await result.response.json()).toStrictEqual({ value: 12, list: ['item', 'item2'] });
    }
});

test('JSON array input with default body', async () => {
    // Set a Cookie
    Cookies.set('token', 'my-very-secure-token');

    expect(client.call('jsonInputDefault', [4, 5, 6])).rejects.toThrow(AssertionError);

});

test('JSON input without default body', async () => {

    const result = await client.call('jsonInput', [4, 5, 6]);

    // Check that the response is the same as in the mock
    expect(result.ok).not.toBeTruthy();
    expect(result.message).toBe('Internal server error');
    expect(result.response).toBeDefined();
});

test('GET with query parameters', async () => {
    const result = await client.call('existing', { param: 'value' });
    // Check that the response is the same as in the mock
    expect(result.ok).toBeTruthy();
    expect(result.message).toBeUndefined();
    expect(result.response).toBeDefined();
    if (result.response) {
        // It will return 201 if the query params were successful
        // it will return 200 if there were no params
        expect(result.response.status).toBe(201);
    }
});

test('GET with url search params', async () => {
    const result = await client.call('existing', new URLSearchParams({ param: 'value' }));
    // Check that the response is the same as in the mock
    expect(result.ok).toBeTruthy();
    expect(result.message).toBeUndefined();
    expect(result.response).toBeDefined();
    if (result.response) {
        // It will return 201 if the query params were successful
        // it will return 200 if there were no params
        expect(result.response.status).toBe(201);
    }
});