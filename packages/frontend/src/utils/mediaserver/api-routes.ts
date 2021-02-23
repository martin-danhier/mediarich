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
        } as const,
        [HTTPStatusCodes.NotFound]: {
            expectedContentTypes: [MIMETypes.JSON],
        } as const
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
    '/' = {
        requestContentType: MIMETypes.XWWWFormUrlencoded,
        url: '/',
        method: 'GET',
        mode: 'cors',
    } as const;
    /** Returns the list of media and sub channels matching the requested search words. */
    '/search' = {
        requestContentType: MIMETypes.XWWWFormUrlencoded,
        url: '/search/',
        method: 'GET',
        mode: 'cors',
    } as const;
    /**
     * Returns a list of medias and channels ordered by add date or creation date. Requests can take some time
     * due to permissions checks. The API call is limited to date query in antichronological order for the moment.
     */
    '/latest' = {
        requestContentType: MIMETypes.XWWWFormUrlencoded,
        url: '/latest/',
        method: 'GET',
        mode: 'cors',
    } as const;
    /** Returns a list of channels */
    '/channels' = {
        requestContentType: MIMETypes.XWWWFormUrlencoded,
        url: '/channels/',
        headers: {
            'Accept-Language': 'fr'
        },
        // credentials: 'include',
        method: 'GET',
        mode: 'cors',
    } as const;
    /** Returns a list of channels (as a tree) */
    '/channels/tree' = {
        requestContentType: MIMETypes.XWWWFormUrlencoded,
        url: '/channels/tree/',
        method: 'GET',
        mode: 'cors',
    } as const;
    /** Returns the path to access a channel or a media. The first item in the result list have no parents. */
    '/channels/path' = {
        requestContentType: MIMETypes.XWWWFormUrlencoded,
        url: '/channels/path/',
        method: 'GET',
        mode: 'cors',
    } as const;
    /** Returns the list of all media and sub channels in a channel */
    '/channels/content' = {
        requestContentType: MIMETypes.XWWWFormUrlencoded,
        url: '/channels/content/',
        method: 'GET',
        mode: 'cors',
    } as const;
    /** Returns info for the requested channel */
    '/channels/get' = {
        requestContentType: MIMETypes.XWWWFormUrlencoded,
        url: '/channels/get/',
        method: 'GET',
        mode: 'cors',
    } as const;
    /** Add a new channel. Omitted fields are unchanged. */
    '/channels/add' = {
        url: '/channels/add/',
        method: 'POST',
        mode: 'cors',
        requestContentType: MIMETypes.XWWWFormUrlencoded,
    } as const;
    /** Edit an existing channel. Omitted fields are unchanged. */
    '/channels/edit' = {
        url: '/channels/edit/',
        method: 'POST',
        mode: 'cors',
        requestContentType: MIMETypes.XWWWFormUrlencoded,
    } as const;
    /** Returns the object id of the users's personnal channel if he can have one, else a 403 will be returned.
      * The personal channel will be created  if it was not already created. If no user is specified, the user making the request will be used. */
    '/channels/personal' = {
        requestContentType: MIMETypes.XWWWFormUrlencoded,
        url: '/channels/personal',
        method: 'GET',
        mode: 'cors',
    } as const;
    /** Delete a channel */
    '/channels/delete' = {
        url: '/channels/delete/',
        method: 'POST',
        mode: 'cors',
        requestContentType: MIMETypes.XWWWFormUrlencoded,
    } as const;
    /** Returns info for the requested media */
    '/medias/get' = {
        url: '/medias/get/',
        requestContentType: MIMETypes.XWWWFormUrlencoded,
        method: 'GET',
        mode: 'cors',
    } as const;
    /** Returns the metadata zip for the requested media. The user making the request must have the community settings edition permission. */
    '/medias/get/zip' = {
        url: '/medias/get/zip/',
        requestContentType: MIMETypes.XWWWFormUrlencoded,
        method: 'GET',
        mode: 'cors',
        expectedResponses: {
            [HTTPStatusCodes.OK]: {
                expectedContentTypes: [MIMETypes.ZIP]
            }
        }
    } as const;
    /** This url can be used to add a new media using a metadata zip package, a media file or an upload id code. */
    '/medias/add' = {
        url: '/medias/add/',
        method: 'POST',
        mode: 'cors',
        requestContentType: MIMETypes.XWWWFormUrlencoded,
    } as const;
    /** Edit an existing media. Omitted fields are unchanged. */
    '/medias/edit' = {
        url: '/medias/edit/',
        method: 'POST',
        mode: 'cors',
        requestContentType: MIMETypes.XWWWFormUrlencoded,
    } as const;
    /** Delete the requested media */
    '/medias/delete' = {
        url: '/medias/delete/',
        method: 'POST',
        mode: 'cors',
        requestContentType: MIMETypes.XWWWFormUrlencoded,
    } as const;
    /** Set a thumbnail image to a media */
    '/medias/add-thumb' = {
        url: '/medias/add-thumb/',
        method: 'POST',
        mode: 'cors',
        requestContentType: MIMETypes.XWWWFormUrlencoded,
    } as const;
    /** Returns a list of users. Requires the 'can_change_users' permission or the 'can_use_permissions_tab' permission. */
    '/users' = {
        url: '/users/',
        method: 'GET',
        requestContentType: MIMETypes.XWWWFormUrlencoded,
        mode: 'cors',
    } as const;
}
