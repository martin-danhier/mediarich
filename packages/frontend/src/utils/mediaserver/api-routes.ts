import { APIRouteSpecification, APIRoutesSpecification, APISpecification, ErrorHandlingSpecification, HTTPStatusCodes, MIMETypes } from 'utils/api-client';

/**
 * Specification of the Mediaserver API.
 * 
 * @see https://ubicast.tv/static/mediaserver/docs/api/api.html Official documentation
 */
export class MSApiSpecification implements APISpecification<MSRoutesSpec> {
    readonly baseURL: string;
    // Routes of the API. Define them via another class so TypeScript can provide useful autocompletion by knowing exactly
    // which routes are defined in it
    readonly routes = new MSRoutesSpec();
    readonly defaultResponses = {
        // When a call succeeds, the server usually returns a JSON
        [HTTPStatusCodes.OK]: {
            expectedContentTypes: [MIMETypes.JSON],
        },
        [HTTPStatusCodes.NotFound]: {
            expectedContentTypes: [MIMETypes.JSON],
        }
    };
    readonly defaultErrorHandling: ErrorHandlingSpecification = {
        shouldLogError: true,
        shouldRethrow: false,
        callback: (error) => {
            console.log(error);
        }
    };

    constructor(baseURL: string) {
        this.baseURL = baseURL;
    }
}

/**
 * Specification of the different routes of the MediaServer API.
 * 
 * @see https://ubicast.tv/static/mediaserver/docs/api/api.html Official documentation
 */
export class MSRoutesSpec implements APIRoutesSpecification<MSRoutesSpec> {

    /** Ping the server */
    '/': APIRouteSpecification<MSRoutesSpec> = {
        url: '/',
        method: 'GET',
        mode: 'cors',
    };
    /** Returns the list of media and sub channels matching the requested search words. */
    '/search': APIRouteSpecification<MSRoutesSpec> = {
        url: '/search/',
        method: 'GET',
        mode: 'cors',
    };
    /**
     * Returns a list of medias and channels ordered by add date or creation date. Requests can take some time
     * due to permissions checks. The API call is limited to date query in antichronological order for the moment.
     */
    '/latest': APIRouteSpecification<MSRoutesSpec> = {
        url: '/latest/',
        method: 'GET',
        mode: 'cors',
    };
    /** Returns a list of channels */
    '/channels': APIRouteSpecification<MSRoutesSpec> = {
        url: '/channels/',
        headers: {
            'Accept-Language': 'fr'
        },
        // credentials: 'include',
        method: 'GET',
        mode: 'cors',
    };
    /** Returns a list of channels (as a tree) */
    '/channels/tree': APIRouteSpecification<MSRoutesSpec> = {
        url: '/channels/tree/',
        method: 'GET',
        mode: 'cors',
    };
    /** Returns the path to access a channel or a media. The first item in the result list have no parents. */
    '/channels/path': APIRouteSpecification<MSRoutesSpec> = {
        url: '/channels/path/',
        method: 'GET',
        mode: 'cors',
    };
    /** Returns the list of all media and sub channels in a channel */
    '/channels/content': APIRouteSpecification<MSRoutesSpec> = {
        url: '/channels/content/',
        method: 'GET',
        mode: 'cors',
    };
    /** Returns info for the requested channel */
    '/channels/get': APIRouteSpecification<MSRoutesSpec> = {
        url: '/channels/get/',
        method: 'GET',
        mode: 'cors',
    };
    /** Add a new channel. Omitted fields are unchanged. */
    '/channels/add': APIRouteSpecification<MSRoutesSpec> = {
        url: '/channels/add/',
        method: 'POST',
        mode: 'cors',
        requestContentType: MIMETypes.JSON,
    };
    /** Edit an existing channel. Omitted fields are unchanged. */
    '/channels/edit': APIRouteSpecification<MSRoutesSpec> = {
        url: '/channels/edit/',
        method: 'POST',
        mode: 'cors',
        requestContentType: MIMETypes.XWWWFormUrlencoded,
    };
    /** Returns the object id of the users's personnal channel if he can have one, else a 403 will be returned.
      * The personal channel will be created  if it was not already created. If no user is specified, the user making the request will be used. */
    '/channels/personal': APIRouteSpecification<MSRoutesSpec> = {
        url: '/channels/personal',
        method: 'GET',
        mode: 'cors',
    };
    /** Delete a channel */
    '/channels/delete': APIRouteSpecification<MSRoutesSpec> = {
        url: '/channels/delete/',
        method: 'POST',
        mode: 'cors',
        requestContentType: MIMETypes.JSON,
    };
    /** Returns info for the requested media */
    '/medias/get': APIRouteSpecification<MSRoutesSpec> = {
        url: '/medias/get/',
        method: 'GET',
        mode: 'cors',
    };
    /** Returns the metadata zip for the requested media. The user making the request must have the community settings edition permission. */
    '/medias/get/zip': APIRouteSpecification<MSRoutesSpec> = {
        url: '/medias/get/zip/',
        method: 'GET',
        mode: 'cors',
        expectedResponses: {
            [HTTPStatusCodes.OK]: {
                expectedContentTypes: [MIMETypes.ZIP]
            }
        }
    };
    /** This url can be used to add a new media using a metadata zip package, a media file or an upload id code. */
    '/medias/add': APIRouteSpecification<MSRoutesSpec> = {
        url: '/medias/add/',
        method: 'POST',
        mode: 'cors',
        requestContentType: MIMETypes.JSON,
    };
    /** Edit an existing media. Omitted fields are unchanged. */
    '/medias/edit': APIRouteSpecification<MSRoutesSpec> = {
        url: '/medias/edit/',
        method: 'POST',
        mode: 'cors',
        requestContentType: MIMETypes.JSON,
    };
    /** Delete the requested media */
    '/medias/delete': APIRouteSpecification<MSRoutesSpec> = {
        url: '/medias/delete/',
        method: 'POST',
        mode: 'cors',
        requestContentType: MIMETypes.JSON,
    };
    /** Set a thumbnail image to a media */
    '/medias/add-thumb': APIRouteSpecification<MSRoutesSpec> = {
        url: '/medias/add-thumb/',
        method: 'POST',
        mode: 'cors',
        requestContentType: MIMETypes.JSON,
    };
    /** Returns a list of users. Requires the 'can_change_users' permission or the 'can_use_permissions_tab' permission. */
    '/users': APIRouteSpecification<MSRoutesSpec> = {
        url: '/users/',
        method: 'GET',
        mode: 'cors',
    };
}
