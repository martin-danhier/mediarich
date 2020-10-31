import * as assert from 'utils/assert/assert';
import { APIRouteSpecification, APISpecification, HTTPRequestBody, MIMETypes } from './types';

class APIClient {
    private readonly api: APISpecification;

    /**
     * Creates an APICLient.
     * @param api Specification of the API to use with the client.
     */
    constructor(api: APISpecification) {
        this.api = api;
    }

    /**
     * Sends an http request to the given route. Handle it according to the specification.
     * @param routeName Name of the route to call. Must be defined in the API specification.
     * @param body Body to send with the request. Must be coherent with the API specification. 
     *    It can only be a generic object if the content type is JSON in the API specification.
     * @async
     */
    async call(routeName: string, body?: HTTPRequestBody | object): Promise<Response | undefined> {
        // Don't allow unexisting routes
        assert.ok(routeName in this.api.routes, '"routeName" must be defined in the API specification.');

        // Get the specification of the route
        const route = this.api.routes[routeName];

        // Allow an object in body only if the content type is JSON. If it is the case, parse it in a string
        if (typeof body === 'object') {
            if (route.requestContentType === MIMETypes.JSON) {
                // Parse the body into a string
                body = JSON.stringify(body);
            }
            else {
                // Ensure that the body is not a generic object
                assert.ok(body instanceof Blob
                    || body instanceof ArrayBuffer
                    || body instanceof FormData
                    || body instanceof URLSearchParams
                    || body === null, 'body must not be a generic object if the request content type is not JSON');
            }
        }

        // === Prepare HTTP Request Headers ===
        const headers = this.getHeaders(route.requestContentType, body);

        // === Send HTTP Request ===
        let response: Response;
        try {

            response = await fetch(this.getURL(route), {
                mode: route.mode,
                method: route.method,
                headers: headers,
                body: body,
            });

        } catch (e) {
            console.error(e);
            return undefined;
        }

        return response;

    }

    private getHeaders(targetContentType?: MIMETypes, body?: HTTPRequestBody): Headers {
        const headers = new Headers();

        // Content length, when possible
        if (typeof body === 'string') {
            headers.append('Content-Length', body.length.toString());
        } else if (body instanceof Blob) {
            headers.append('Content-Length', body.size.toString());
        } else if (body instanceof ArrayBuffer) {
            headers.append('Content-Length', body.byteLength.toString());
        } else if (body instanceof FormData) {
            headers.append('Content-Length', body.values.length.toString());
        } else if (body instanceof URLSearchParams) {
            headers.append('Content-Length', body.values.length.toString());
        }

        // Content Type : check if provided in route
        if (targetContentType !== undefined) {

            // Only add a string content type (it might be null)
            if (typeof targetContentType === 'string') {
                headers.append('content-type', targetContentType);
            }
        }

        return headers;
    }

    private getURL(route: APIRouteSpecification): string {
        return this.api.baseURL + route.url;
    }
}

export default APIClient;