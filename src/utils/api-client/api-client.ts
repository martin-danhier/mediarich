import * as assert from 'utils/assert/assert';
import { defaultErrorHandling, defaultResponseHandling } from './defaults';
import { APIResponseSpecification, APIRouteSpecification, APISpecification, ErrorHandlingSpecification, HTTPRequestBody, HTTPRequestResult, HTTPStatusCodes, MIMETypes } from './types';

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
    public async call(routeName: string, body?: HTTPRequestBody | object): Promise<HTTPRequestResult> {
        // Don't allow unexisting routes
        assert.ok(routeName in this.api.routes, `'routeName' must be defined in the API specification. Found: '${routeName}'.`);

        // Get the specification of the route
        const route = this.api.routes[routeName];

        // Allow an object in body only if the content type is JSON. If it is the case, parse it in a string
        // If the body is a generic object (i.e. not one of the possible types)
        if (typeof body === 'object' && !(
            body === null
            || body instanceof Blob
            || body instanceof ArrayBuffer
            || body instanceof FormData
            || body instanceof URLSearchParams
            // body instanceof ArrayBufferView
            || ('buffer' in body && 'byteLength' in body && 'byteOffset' in body
                && body.buffer instanceof ArrayBuffer
                && typeof body.byteLength === 'number'
                && typeof body.byteOffset === 'number')
        )) {
            // And the content type is json
            if (route.requestContentType === MIMETypes.JSON) {
                // Parse the body into a string
                body = JSON.stringify(body);
            }
            // Else, we have a generic object that is not json, so there is a problem.
            else {

                console.error(body);
                return { ok: false, message: 'If body is a generic object, the content-type must be set to JSON.' };
                // throw new Error('If body is a generic object, the content-type must be set to JSON.');

            }
        }


        // === Prepare HTTP Request Headers ===
        const headers = this.getHeaders(route.requestContentType, body);

        // === Send HTTP Request ===
        let response: Response;
        // Create params outside of the try-catch, so that we can use it later for redirections
        const fetchParams = {
            mode: route.mode,
            method: route.method,
            headers: headers,
            body: body,
        };

        try {
            // Send the request !
            response = await fetch(this.getURL(route), fetchParams);

        } catch (e) {
            return this.handleInternalError(routeName, e);
        }

        // Get the response handling specification
        let responseHandling: APIResponseSpecification;

        // Is the status code supported ?
        // = is the status code in the enum of status codes
        if (Object.values(HTTPStatusCodes).includes(response.status)) {
            const status: HTTPStatusCodes = response.status;

            responseHandling = {
                // Get default values
                ...defaultResponseHandling[status],
                // Override with api values
                ...this.api.defaultResponses?.[status],
                // Override with route values
                ...route.expectedResponses?.[status]
            };
        }
        // The status code is not supported (not in the enum)
        else {
            responseHandling = {
                isSuccess: false,
                message: `Unknown status code: ${response.status} (${response.statusText})`,
            };
        }

        return this.handleResponse(response, responseHandling, (e, r) => {
            const response = this.handleInternalError(routeName, e);
            response.response = r;
            return response;
        }, fetchParams);
    }

    /**
     * Call fetch with the given parameters and handles the response according to the specification
     * @param url URL to call with fetch
     * @param params Params to give to the fetch function as is
     */
    public async externalCall(url: string, params?: RequestInit): Promise<HTTPRequestResult> {
        let response: Response;
        try {
            // Send the request !
            response = await fetch(url, params);

        } catch (e) {
            return this.handleExternalError(url, e);
        }


        // Get the response handling specification
        let responseHandling: APIResponseSpecification;

        // Is the status code supported ?
        // = is the status code in the enum of status codes
        if (Object.values(HTTPStatusCodes).includes(response.status)) {
            const status: HTTPStatusCodes = response.status;

            responseHandling = {
                // Get default values
                ...defaultResponseHandling[status],
                // Override with api values
                ...this.api.defaultExternalResponses?.[status],
            };
        }
        // The status code is not supported (not in the enum)
        else {
            responseHandling = {
                isSuccess: false,
                message: `Unknown status code: ${response.status} (${response.statusText})`,
            };
        }

        return this.handleResponse(response, responseHandling, (e, r) => {
            const response = this.handleExternalError(url, e);
            response.response = r;
            return response;
        }, params);
    }

    async handleResponse(response: Response, responseHandling: APIResponseSpecification, onError: (error: Error | string, response: Response) => HTTPRequestResult, fetchParams?: RequestInit): Promise<HTTPRequestResult> {
        // Check content type of the response if one is provided. Don't check if none is provided
        if (responseHandling.expectedContentTypes) {
            const responseContentType = response.headers.get('Content-Type');
            // If the content type is not null
            if (responseContentType) {
                // Get the base type
                // Ex: "text/html ; encoding='utf-8'" -> "text/html"
                const baseString = responseContentType.split(';')[0].trim();
                let found = false;

                // For each expected type
                for (const type of responseHandling.expectedContentTypes) {
                    // Compare it to the response type
                    if (type === baseString) {
                        found = true;
                        break; // not ideal, but it doesn't hurt
                    }
                }

                // If the received content type is not in the expected list
                if (!found) {
                    // Return the error in a result
                    // Don't handle it here because we can be either in external or internal route
                    return onError(`Expected content types [${responseHandling.expectedContentTypes.map((value) => `'${value}'`)}], got '${baseString}'.`, response);
                }
            }
            // If the response doesn't have any content-type, check if "MIMETypes.None" is present is the expected ones
            // If not, then it is not valid !
            else if (!(responseHandling.expectedContentTypes.length === 0 || responseHandling.expectedContentTypes.includes(MIMETypes.None))) {

                return onError(`Expected content types [${responseHandling.expectedContentTypes.map((value) => `'${value}'`)}], but the request didn't specify a content type.`, response);
            }
        }

        // Should we redirect ?
        if (responseHandling.shouldRedirectTo) {
            // "header-location" -> redirect to the value of "Location" in header
            if (responseHandling.shouldRedirectTo === 'header-location') {
                const location = response.headers.get('Location');
                // If a location was found
                if (location) {
                    // Here, we don't know what to expect
                    // We are outside of the specified API
                    // All we can do is use the HTTP conventions (given through default values), make a valid request, and hope
                    if (responseHandling.shouldPreserveRequest) {
                        // Preserve request : fetch with the same parameters
                        return this.externalCall(location, fetchParams);
                    } else {
                        // Don't preserve request : fetch without the same parameters, with GET
                        return this.externalCall(location, {method: 'GET'});
                    }
                }
                // If no Location header was found, return the response but tell that something went wrong
                else return {
                    ok: false,
                    message: 'Specification indicates to redirect to the location given in the response\'s \'Location\' header, but none was provided.',
                    response
                };
            }
            else {
                // Else, redirect to the route named by the value. 
                // Since call already has an assertion that the name must exist, we can assume that shouldRedirectTo is a valid name
                // Indeed, it is a programming error if it is not (wrong specification)
                // Moreover, it is a choice of the developper to redirect (e.g after this route, call this one)
                // It is not a normal HTTP redirection
                // Thus, we don't need to keep the fetch params, only the body
                if (responseHandling.shouldPreserveRequest) {
                    return this.call(responseHandling.shouldRedirectTo, fetchParams?.body);
                } else {
                    // Don't include body if preserve request is not true
                    return this.call(responseHandling.shouldRedirectTo);
                }
            }
        }

        // No redirect occured, return
        return {
            ok: responseHandling.isSuccess ?? false,
            message: responseHandling.message,
            response
        };
    }

    /**
     * Generate a Headers object for the given parameters.
     * @param targetContentType Expected content type of the body. It is simply added to the headers, without checks.
     * @param body body of the request. Not modified by the method.
     */
    private getHeaders(targetContentType?: MIMETypes, body?: HTTPRequestBody): Headers {
        const headers = new Headers();

        // Content length, when possible
        if (typeof body === 'string') {
            headers.append('Content-Length', body.length.toString());
        } else if (body instanceof Blob) {
            headers.append('Content-Length', body.size.toString());
        } else if (body instanceof ArrayBuffer) {
            headers.append('Content-Length', body.byteLength.toString());
        }

        // Content Type : check if provided in route
        // Only add a string content type (it might be null)
        if (typeof targetContentType === 'string') {
            // Consider that we only use utf-8 for strings
            if (typeof body === 'string') {
                headers.append('Content-Type', targetContentType + '; charset=utf-8');
            }
            else {
                headers.append('Content-Type', targetContentType);
            }
        }

        return headers;
    }

    /**
     * Returns the full URL of a given route
     * @param route specification of the route of which the URL is requested
     */
    private getURL(route: APIRouteSpecification): string {
        return this.api.baseURL + route.url;
    }

    /**
     * Handle an error that occured in an internal call
     * @param routeName Name of the route concerned by the error. Must exist in the API specification.
     * @param error The error to handle. Can be a string (message) or an Error object
     */
    private handleInternalError(routeName: string, error: string | Error): HTTPRequestResult {
        // Don't allow unexisting routes
        assert.ok(routeName in this.api.routes, `'routeName' must be defined in the API specification. Found: '${routeName}'.`);

        // Get the error handling
        // Check first if the route has a specific one, then check if there is a default one, else provide default values.
        const errorHandling = this.api.routes[routeName].errorHandling ?? this.api.defaultErrorHandling ?? defaultErrorHandling;

        // Handle the error
        return this.handleError(errorHandling, error, `[APIClient] The following error was thrown during a call to '${routeName}':`);
    }

    /**
     * Handle an error that occured in an external call
     * @param url URL of the external route concerned by the error
     * @param error The error to handle. Can be a string (message) or an Error object
     */
    private handleExternalError(url: string, error: string | Error): HTTPRequestResult {
        // Get error handling
        const errorHandling = this.api.defaultErrorHandling ?? defaultErrorHandling;

        // Handle the error
        return this.handleError(errorHandling, error, `[APIClient] The following error was thrown during an external call to '${url}':`);
    }

    /**
     * Handles an error (logs to the console, calls the callback if needed, throws again if needed, or create a result object).
     * @param errorHandling Specification of the way the client should handle the error
     * @param error Error to handle. Can be a string (message) ou an Error object
     * @param logMessage Message to log before the error. For example "The following error was thrown:"
     */
    private handleError(errorHandling: ErrorHandlingSpecification, error: string | Error, logMessage: string): HTTPRequestResult {

        // Should the error be logged ?
        if (errorHandling.shouldLogError) {
            console.error(logMessage);
            console.error(error);
        }

        // Should call callback ?
        if (errorHandling.callback !== undefined) {
            errorHandling.callback(error);
        }

        // Should the error be thrown again ?
        if (errorHandling.shouldRethrow) {
            throw error;
        }
        // Return result instead
        else {
            // Get message
            let message;
            if (error instanceof Error) {
                message = error.message;
            }
            else {
                message = error;
            }
            // Return result
            return {
                ok: false,
                message
            };
        }
    }
}

export default APIClient;