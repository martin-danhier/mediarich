/**
 * @file API routes of the Mediarich backend
 * @version 1.0
 * @author Martin Danhier
 */

import { APIResponseHandlingSpecification, APIRoutesSpecification, APISpecification, HTTPStatusCodes, MIMETypes } from 'utils/api-client';

/**
 * Specification of the Mediarich API
 */
export class MediarichApiSpecification implements APISpecification<MediarichRoutesSpec> {
    readonly baseURL: string;
    // Routes of the API. Define them via another class so TypeScript can provide useful autocompletion by knowing exactly
    // which routes are defined in it
    readonly routes = new MediarichRoutesSpec();
    readonly defaultResponses: APIResponseHandlingSpecification<MediarichRoutesSpec> = {
        // When a call succeeds, the server always returns a JSON
        [HTTPStatusCodes.OK]: {
            expectedContentTypes: [MIMETypes.JSON],
        },
        // When the user does not have permission
        [HTTPStatusCodes.Unauthorized]: {
            expectedContentTypes: [MIMETypes.JSON],
        }
    };

    constructor(baseURL: string) {
        this.baseURL = baseURL;
    }
}

/**
 * Specification of the different routes of the Mediarich API.
 */
export class MediarichRoutesSpec implements APIRoutesSpecification<MediarichRoutesSpec> {
    /** Add a user
     *
     * **Parameters**
     *
     * ```json
     * {
     *   "username": "<username>",
     *   "password": "<password>",
     *   "apiKey": "<apiKey>"
     * }
     * ```
     *
     * **Returns (if 200)**
     *
     * ```json
     * {
     *   "error": false
     * }
     * ```
     */
    '/user/add' = {
        url: '/user/add',
        method: 'POST',
        requestContentType: MIMETypes.JSON,
        credentials: 'include',
        mode: 'cors',
    } as const;
    /** Login a user
     *
     * **Parameters**
     *
     * ```json
     * {
     *   "username": "<username>",
     *   "password": "<password>"
     * }
     * ```
     *
     * **Returns (if 200)**
     *
     * ```json
     * {
     *   "error": false,
     *   "apiKey": "<apiKey>"
     * }
     * ```
     */
    '/user/login' = {
        url: '/user/login',
        method: 'POST',
        requestContentType: MIMETypes.JSON,
        mode: 'cors',
        credentials: 'include',
    } as const;
    /** Edit a user
     *
     * **Parameters**
     *
     * ```json
     * {
     *   "username": "<username>",
     *   "newPassword": "<password>", // optional
     *   "newApiKey": "<apiKey>" // optional
     * }
     * ```
     *
     * **Returns (if 200)**
     *
     * ```json
     * {
     *   "error": false,
     *   "edited": ["<nameOfEditedField>"]
     * }
     * ```
     */
    '/user/edit' = {
        url: '/user/edit',
        method: 'POST',
        requestContentType: MIMETypes.JSON,
        credentials: 'include',
        mode: 'cors',
    } as const;
    /**
     * Check if the user is connected
     *
     * **Returns (if 200)**
     *
     * ```json
     * {
     *   "error": false,
     *   "apiKey": "<apiKey>"
     * }
     * ```
     */
    '/user/test' = {
        url: '/user/test',
        requestContentType: MIMETypes.XWWWFormUrlencoded,
        method: 'GET',
        mode: 'cors',
        credentials: 'include',
    } as const;
    /**
     * Disconnect the user
     *
     * **Returns (if 200)**
     *
     * ```json
     * {
     *   "error": false
     * }
     * ```
     */
    '/user/disconnect' = {
        url: '/user/disconnect',
        requestContentType: MIMETypes.XWWWFormUrlencoded,
        method: 'GET',
        credentials: 'include',
        mode: 'cors',
    } as const;
}