import * as assert from 'utils/assert/assert';
import { defaultErrorHandling, DefaultResponseHandling } from './defaults';
import {
    APIResponseSpecification,
    APIRouteSpecification,
    APIRoutesSpecification,
    APISpecification,
    ErrorHandlingSpecification,
    FetchInit,
    HTTPRequestBody,
    HTTPRequestResult,
    HTTPStatusCodes,
    JSONObject,
    MIMETypes,
    ObjectMap,
} from './types';
import Cookies from 'js-cookie';

class APIClient<T extends APISpecification<R>, R extends APIRoutesSpecification<R>> {
    private readonly _api: T;
    private readonly _defaultResponseHandling = new DefaultResponseHandling<R>();

    public get api(): T {
        return this._api;
    }

    /**
     * Creates an APICLient.
     * @param api Specification of the API to use with the client.
     */
    constructor(api: T) {
        this._api = api;
    }

    /**
     * Sends an http request to the given route. Handle it according to the specification.
     * @param routeName Either: Name of the route to call. Must be defined in the API specification. If it isn't, a compilation error will be thrown.
     * @param data Data used for the request. Its content depends on the request.
     *  - In methods that support a body (like POST), `data` contains the body of the request.\
     *      If the content type is `JSON` in the specification, it can be a generic object 
     *      that will be stringified automatically. This object will be merged (and override identical keys) 
     *      with the `baseJSONBody` provided to the request specification. If the generic object is not a list, the syntax
     *      `#{name}` will be replaced by the value of the cookie named 'name' (only in values and in the first level)
     * 
     *  - In GET method, `data` contains the query parameters to give
     *      to the request. Its type can thus be either an object of type ``{[key: string]: string}`` or a `URLSearchParams`. In case of a generic
     *      object, it will be merged with the `baseQueryParams` provided to the request specification.
     * @async
     */
    public async call(routeName: keyof R, data?: HTTPRequestBody | JSONObject): Promise<HTTPRequestResult> {
        // let routeName: string;
        // // if the route is a string (name of route in the specification)
        // if (typeof route === 'string') {
        //     // Save the name in routeName
        //     routeName = route;
        //     // Don't allow unexisting routes
        //     assert.ok(route in this._api.routes, `'routeName' must be defined in the API specification. Found: '${route}'.`);
        //     // Get the specification of the route and place it in 'route'
        //     route = this._api.routes[routeName];
        // } 
        // // Else, just get the url for a name
        // else {
        //     routeName = route.url;
        // }
        const route = this._api.routes[routeName];


        // Get the URL of the route
        const url = new URL(this.getURL(route));
        const fetchInit: FetchInit = {
            mode: route.mode,
            method: route.method,
        };

        // Prepare fetch init and url
        // In GET methods, data contains the search params
        if (route.method === 'GET') {
            // make some assertions on data to protect from programming errors
            // Type can only be URLSearchParams or {[key: string]: string} or undefined
            // All of this is specified in the documentation, so we can use assertions and remove them in production, where the code using this
            // function is supposed to be compliant with the specification
            assert.ok(typeof data !== 'string', 'In GET requests, \'data\' can be either a URLSearchParams or a object of type {[key:string] : string}. Received string');
            assert.ok(!(data instanceof ArrayBuffer), 'In GET requests, \'data\' can be either a URLSearchParams or a object of type {[key:string] : string}. Received ArrayBuffer');
            assert.ok(!(data instanceof Blob), 'In GET requests, \'data\' can be either a URLSearchParams or a object of type {[key:string] : string}. Received Blob');
            assert.ok(!(data instanceof FormData), 'In GET requests, \'data\' can be either a URLSearchParams or a object of type {[key:string] : string}. Received FormData');
            assert.ok(!Array.isArray(data), `In GET requests, 'data' can be either a URLSearchParams or a object of type {[key:string] : string}. Received: '${JSON.stringify(data)}'`);

            // Get the query parameters
            let params: URLSearchParams;

            // Convert {[key: string]: string} to URLSearchParams
            if (!(data instanceof URLSearchParams)) {
                // Check if it is {[key: string]: string} or undefined
                if (data) {
                    assert.ok(Object.values(data).every((value) => typeof value === 'string'),
                        `In GET requests, 'data' can be either a URLSearchParams or a object of type {[key:string] : string}. Received: '${JSON.stringify(data)}'`);
                    assert.ok(Object.keys(data).every((value) => typeof value === 'string'),
                        `In GET requests, 'data' can be either a URLSearchParams or a object of type {[key:string] : string}. Received: '${JSON.stringify(data)}'`);
                }
                // Process Cookies syntax
                const processedData = APIClient.processObjectWithCookieSyntax(data as (ObjectMap<string> | undefined));
                const processedBaseParams = APIClient.processObjectWithCookieSyntax(route.baseQueryParams);
                // Convert data to URLSearchParams
                params = new URLSearchParams({ ...processedBaseParams, ...processedData });
            } else {
                params = data;
            }
            // add the query parameters to the URL
            url.search = params.toString();

            // Get headers if there are some in the specification
            if (route.headers) {
                const headers = new Headers(APIClient.processObjectWithCookieSyntax(route.headers));
                fetchInit.headers = headers;
            }
        }
        // other methods
        else {
            // Allow an object in body only if the content type is JSON. If it is the case, parse it in a string
            // If the body is a generic object (i.e. not one of the possible types)
            if (typeof data === 'object' && !(
                data === null
                || data instanceof Blob
                || data instanceof ArrayBuffer
                || data instanceof FormData
                || data instanceof URLSearchParams
            )) {
                // And the content type is json
                if (route.requestContentType === MIMETypes.JSON) {
                    // If the JSON is not an array
                    if (!Array.isArray(data)) {

                        // Preprocess the JSON data to use the cookie syntax
                        const processedData = APIClient.processObjectWithCookieSyntax(data);

                        // Preprocess the base JSON body to use the cookie syntax
                        const processedBaseJSONBody = APIClient.processObjectWithCookieSyntax(route.baseJSONBody);

                        // Parse the body into a string and merge with the base JSON body
                        data = JSON.stringify({
                            ...processedBaseJSONBody,
                            ...processedData,
                        });
                    }
                    else {
                        // If the JSON object is an array, but some default data has been provided to the route
                        // it is an error : how are we supposed to merge them ?
                        assert.ok(route.baseJSONBody === undefined, 'An array was given to the call function, but the route specification is not undefined. Unable to merge.');

                        data = JSON.stringify(data);

                    }
                }
                // Else, we have a generic object that is not json, so there is a problem.
                else {
                    console.error(data);
                    return { ok: false, message: 'If body is a generic object, the content-type must be set to JSON.' };
                    // throw new Error('If body is a generic object, the content-type must be set to JSON.');
                }
            }
            // Save body
            fetchInit.body = data;

            // Get headers
            const headers = this.getHeaders(route, data);
            fetchInit.headers = headers;

        }

        
        // === Send HTTP Request ===
        
        let response: Response;
        try {
            // Send the request !
            response = await fetch(url.toString(), fetchInit);

        } catch (e) {
            return this.handleInternalError(routeName, e);
        }

        // Get the response handling specification
        let responseHandling: APIResponseSpecification<R>;

        // Is the status code supported ?
        // = is the status code in the enum of status codes
        if (Object.values(HTTPStatusCodes).includes(response.status)) {
            const status: HTTPStatusCodes = response.status;

            responseHandling = {
                // Get default values
                ...this._defaultResponseHandling[status],
                // Override with api values
                ...this._api.defaultResponses?.[status],
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
        }, fetchInit);
    }

    /**
     * Call fetch with the given parameters and handles the response according to the specification
     * @param url URL to call with fetch
     * @param fetchInit fetch init to give to the fetch function as is
     */
    public async externalCall(url: string, fetchInit?: FetchInit): Promise<HTTPRequestResult> {
        let response: Response;
        try {
            // Send the request !
            response = await fetch(url, fetchInit);
        } catch (e) {
            return this.handleExternalError(url, e);
        }


        // Get the response handling specification
        let responseHandling: APIResponseSpecification<R>;

        // Is the status code supported ?
        // = is the status code in the enum of status codes
        if (Object.values(HTTPStatusCodes).includes(response.status)) {
            const status: HTTPStatusCodes = response.status;

            responseHandling = {
                // Get default values
                ...this._defaultResponseHandling[status],
                // Override with api values
                ...this._api.defaultExternalResponses?.[status],
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
        }, fetchInit);
    }

    async handleResponse(response: Response, responseHandling: APIResponseSpecification<R>, onError: (error: Error | string, response: Response) => HTTPRequestResult, fetchInit?: FetchInit): Promise<HTTPRequestResult> {
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
                        return this.externalCall(location, fetchInit);
                    } else {
                        // Don't preserve request : fetch without the same parameters, with GET
                        return this.externalCall(location, { method: 'GET' });
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
                    return this.call(responseHandling.shouldRedirectTo, fetchInit?.body);
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
    private getHeaders(route: APIRouteSpecification<R>, body?: HTTPRequestBody): Headers {
        // Use the syntax #{cookie-name} to fetch the value of a cookie
        const formattedHeaders = APIClient.processObjectWithCookieSyntax(route.headers);

        const headers = new Headers(formattedHeaders);

        // Check content length if it is not already provided
        if (!headers.has('Content-Length')) {
            // Content length, when possible
            if (typeof body === 'string') {
                headers.append('Content-Length', body.length.toString());
            } else if (body instanceof Blob) {
                headers.append('Content-Length', body.size.toString());
            } else if (body instanceof ArrayBuffer) {
                headers.append('Content-Length', body.byteLength.toString());
            }
        }

        // Check content type if it is not already provided
        if (!headers.has('Content-Type')) {
            // Content Type : check if provided in route
            // Only add a string content type (it might be null)
            if (typeof route.requestContentType === 'string') {
                // Consider that we only use utf-8 for strings
                if (typeof body === 'string') {
                    headers.append('Content-Type', route.requestContentType + '; charset=utf-8');
                }
                else {
                    headers.append('Content-Type', route.requestContentType);
                }
            }

        }
        return headers;
    }

    /**
     * Returns the full URL of a given route
     * @param route specification of the route of which the URL is requested
     */
    private getURL(route: APIRouteSpecification<R>): string {
        return this._api.baseURL + route.url;
    }

    /**
     * Handle an error that occured in an internal call
     * @param routeName Name of the route concerned by the error. Must exist in the API specification.
     * @param error The error to handle. Can be a string (message) or an Error object
     */
    private handleInternalError(routeName: keyof R, error: string | Error): HTTPRequestResult {
        // Don't allow unexisting routes
        assert.ok(routeName in this._api.routes, `'routeName' must be defined in the API specification. Found: '${routeName}'.`);

        // Get the error handling
        // Check first if the route has a specific one, then check if there is a default one, else provide default values.
        const errorHandling = this._api.routes[routeName].errorHandling ?? this._api.defaultErrorHandling ?? defaultErrorHandling;

        // Handle the error
        return APIClient.handleError(errorHandling, error, `[APIClient] The following error was thrown during a call to '${routeName}':`);
    }

    /**
     * Handle an error that occured in an external call
     * @param url URL of the external route concerned by the error
     * @param error The error to handle. Can be a string (message) or an Error object
     */
    private handleExternalError(url: string, error: string | Error): HTTPRequestResult {
        // Get error handling
        const errorHandling = this._api.defaultErrorHandling ?? defaultErrorHandling;

        // Handle the error
        return APIClient.handleError(errorHandling, error, `[APIClient] The following error was thrown during an external call to '${url}':`);
    }

    /**
     * Handles an error (logs to the console, calls the callback if needed, throws again if needed, or create a result object).
     * @param errorHandling Specification of the way the client should handle the error
     * @param error Error to handle. Can be a string (message) ou an Error object
     * @param logMessage Message to log before the error. For example "The following error was thrown:"
     */
    private static handleError(errorHandling: ErrorHandlingSpecification, error: string | Error, logMessage: string): HTTPRequestResult {

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

    /**
     * Replaces the occurences of the `#{cookie-name}` syntax in a string
     * with the value of the Cookie named `cookie-name`.
     * If the Cookie is undefined, replace with empty string instead. // TODO maybe handle that case
     * @param raw The raw string to process
     * @return the processed string
     */
    private static processCookieSyntax(raw: string): string {
        return raw.replace(/#{(?<name>\w+)}/g, (src, name) => {
            return Cookies.get(name) ?? '';
        });
    }

    /**
     * Process the cookie syntax in each value of the object. See `processCookieSyntax` for more infos.
     * @param raw An object with string keys and values of type T or string. The values can support the `#{cookie}` cookie syntax.
     */
    private static processObjectWithCookieSyntax<T>(raw: ObjectMap<T | string> | undefined): ObjectMap<T | string> {
        const processed: ObjectMap<T | string> = {};
        for (const key in raw) {
            // Get the value to process
            const unprocessedValue = raw[key];
            // Process it if its a string
            if (typeof unprocessedValue === 'string') {
                processed[key] = APIClient.processCookieSyntax(unprocessedValue);
            }
            // Else add it as is
            else {
                processed[key] = unprocessedValue;
            }
        }
        return processed;
    }
}

export default APIClient;