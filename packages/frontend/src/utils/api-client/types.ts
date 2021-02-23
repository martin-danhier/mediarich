/**
 * @file Types used in an APIClient
 * @author Martin Danhier
 * @version 0.1
 */

/** Valid JSON object. Can safely be stringified to JSON. */
export type JSONObject = JSONInnerObject | JSONInnerArray;

/** JSON Object (key: value) */
export type JSONInnerObject = {
    [key: string]: JSONInnerObjectContent;
}
/** JSON array */
export type JSONInnerArray = string[] | number[] | boolean[] | JSONInnerObject[] | JSONInnerArray[];

/** Types that can be assigned as a value to a JSONInnerObject */
export type JSONInnerObjectContent = string | number | boolean | null | JSONInnerObject | JSONInnerArray | undefined;

/** Enum of the different MIME type usable in the 'content-type' header.
 * @see https://developer.mozilla.org/docs/Web/HTTP/Basics_of_HTTP/MIME_types/Common_types
 */
export enum MIMETypes {
    // Note : the list is probably too big for the current project, but the aim of the APIClient class is to be usable in multiple projects
    // In production, unused values are stripped from the code

    /** Default type for text files */
    PlainText = 'text/plain',
    /** Default type for non text files */
    OctetStream = 'application/octet-stream',
    /** Audio Advanced Coding (AAC) audio file */
    AAC = 'audio/aac',
    /** AbiWord document */
    ABW = 'application/abiword',
    /** Audio Video Interleave (AVI file) */
    AVI = 'video/x-msvideo',
    /** Amazon Kindle ebook file format */
    AZW = 'application/vnd.amazon.ebook',
    /** Bitmap image Windows OS/2 */
    BMP = 'image/bmp',
    /** BZip archive */
    BZ = 'application/x-bzip',
    /** BZip2 archive */
    BZ2 = 'application/x-bzip2',
    /** C-Shell script */
    CSH = 'application/x-csh',
    /** Cascading Style Sheets file (CSS) */
    CSS = 'text/css',
    /** Comma Separated Values file (CSV) */
    CSV = 'text/csv',
    /** Microsoft Word file (old) */
    DOC = 'application/msword',
    /** Microsoft Word file (OpenXML) */
    DOCX = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    /** MS Embedded OpenType font */
    EOT = 'application/vnd.ms-fontobject',
    /** Electronic publication file (EPUB) */
    EPUB = 'application/epub+zip',
    /** Form Data */
    FormData = 'multipart/form-data',
    /** Graphics Interchange Format file (GIF) */
    GIF = 'image/gif',
    /** HyperText Markup Language file (HTML) */
    HTML = 'text/html',
    /** Icon file */
    Icon = 'image/x-icon',
    /** iCalendar file (ICAL) */
    ICalendar = 'text/calendar',
    /** Java Archive file (JAR) */
    JAR = 'application/java-archive',
    /** Joint Photographic Experts Group (JPEG) image */
    JPG = 'image/jpeg',
    /** JavaScript (JS) file */
    JavaScript = 'application/javascript',
    /** JavaScript Object Notation (JSON) data file */
    JSON = 'application/json',
    /** Musical Intrument Digital Interface (MIDI) audio file */
    MIDI = 'audio/midi',
    /** Moving Picture Experts Group (MPEG) video */
    MPEG = 'video/mpeg',
    /** Apple Installer package file */
    MPKG = 'application/vnd.apple.installer+xml',
    /** OpenDocument Presentation (ODP) file */
    ODP = 'application/vnd.oasis.opendocument.presentation',
    /** OpenDocument Speadsheet (ODS) file */
    ODS = 'application/vnd.oasis.opendocument.spreadsheet',
    /** OpenDocument Text (ODT) file */
    ODT = 'application/vnd.oasis.opendocument.text',
    /** OGG audio file */
    OGGAudio = 'audio/ogg',
    /** OGG video file */
    OGGVideo = 'video/ogg',
    /** OGG multiplexed media file */
    OGGMultiplexed = 'application/ogg',
    /** OpenType font */
    OTF = 'font/otf',
    /** Portable Network Graphics (PNG) image file */
    PNG = 'image/png',
    /** Adobe Portable Document Format (PDF) file */
    PDF = 'application/pdf',
    /** Microsoft PowerPoint Presentation (old) */
    PPT = 'application/vnd.ms-powerpoint',
    /** Microsoft PowerPoint Presentation (OpenXML) */
    PPTX = 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    /** RAR archive */
    RAR = 'application/x-rar-compressed',
    /** Rich Text Format (RTF) */
    RTF = 'application/rtf',
    /** Shell script */
    SH = 'application/x-sh',
    /** Scalable Vector Graphics (SVG) file */
    SVG = 'image/svg+xml',
    /** Swall Web Format (SWF) or Adobe Flash file */
    SWF = 'application/x-shockwave-flash',
    /** TapeArchive (TAR) archive */
    TAR = 'application/x-tar',
    /** Tagged Image File Format (TIFF) image */
    TIFF = 'image/tiff',
    /** TypeScript (TS) file */
    TypeScript = 'application/typescript',
    /** TrueType font */
    TTF = 'font/ttf',
    /** Microsoft Visio file */
    VSD = 'application/vnd.visio',
    /** Waveform Audio Format (WAV) audio file */
    WAV = 'audio/x-wav',
    /** WEBM audio file */
    WEBA = 'audio/webm',
    /** WEBM video file */
    WEBM = 'video/webm',
    /** WEBP image file */
    WEBP = 'image/webp',
    /** Web Open Font Format (WOFF) font */
    WOFF = 'font/woff',
    /** Web Open Font Format 2 (WOFF2) font */
    WOFF2 = 'font/woff2',
    /** Extensible HyperText Markup Language (XHTML) */
    XHTML = 'application/xhtml+xml',
    /** Microsoft Excel file (old) */
    XLS = 'application/vnd.ms-excel',
    /** Microsoft Excel file (OpenXML) */
    XLSX = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    /** Extensible Markup Language (XML) data file */
    XML = 'application/xml',
    /** Mozilla Firefox self-contained application or extension */
    XUL = 'application/vnd.mozilla.xul+xml',
    /** x-www-form-urlencoded */
    XWWWFormUrlencoded = 'application/x-www-form-urlencoded',
    /** ZIP archive */
    ZIP = 'application/zip',
    /** 7-zip archive */
    SevenZIP = 'application/x-7z-compressed',
    /** No content type */
    None = 'null',
}

/**
 * Enum of different HTTP status codes. The documentation comes from Wikipedia.
 * 
 * @see https://en.wikipedia.org/wiki/List_of_HTTP_status_codes
 */
export enum HTTPStatusCodes {
    /** Standard response for successful HTTP requests.
     *
     * The actual response will depend on the request method used. 
     * 
     * - In a GET request, the response will contain an entity corresponding 
     * to the requested resource. 
     * - In a POST request, the response will 
     * contain an entity describing or containing the result of the action. */
    OK = 200,
    /** The request has been fulfilled, resulting in the creation of a new resource. */
    Created = 201,
    /** The request has been accepted for processing, but the processing has not been completed. 
     * The request might or might not be eventually acted upon, and may be disallowed when processing occurs. */
    Accepted = 202,
    /** The server is a transforming proxy (e.g. a Web accelerator) that received a 200 OK from its origin, 
     * but is returning a modified version of the origin's response. */
    NonAuthoritativeInformation = 203,
    /** The server successfully processed the request, and is not returning any content. */
    NoContent = 204,
    /** The server successfully processed the request, asks that the requester reset its document view, and is not returning any content. */
    ResetContent = 205,
    /** The server is delivering only part of the resource (byte serving) due to a range header sent by the client. 
     * The range header is used by HTTP clients to enable resuming of interrupted downloads,
     *  or split a download into multiple simultaneous streams. */
    PartialContent = 206,
    /** The message body that follows is by default an XML message and can contain 
     * a number of separate response codes, depending on how many sub-requests were made. */
    MultiStatus = 207,
    /** The members of a DAV binding have already been enumerated in a preceding part of the 
     * (multistatus) response, and are not being included again. */
    AlreadyReported = 208,
    /**Indicates multiple options for the resource from which the client may choose
     * (via agent-driven content negotiation). For example, this code could be used
     * to present multiple video format options, to list files with different
     * filename extensions, or to suggest word-sense disambiguation. */

    // REDIRECTS

    /** Indicates multiple options for the resource from which the client may choose
     * (via agent-driven content negotiation). For example, this code could be used to
     * present multiple video format options, to list files with different filename extensions,
     * or to suggest word-sense disambiguation. */
    MultipleChoices = 300,
    /** This and all future requests should be directed to the given URI. */
    MovedPermanently = 301,
    /** Tells the client to look at (browse to) another URL. 
     * 
     * 302 has been superseded by 303 and 307. This is an example of industry practice
     * contradicting the standard. The HTTP/1.0 specification (RFC 1945) required the client
     * to perform a temporary redirect (the original describing phrase was "Moved Temporarily"),
     * but popular browsers implemented 302 with the functionality of a 303 See Other.
     * Therefore, HTTP/1.1 added status codes 303 and 307 to distinguish between the two behaviours.
     * However, some Web applications and frameworks use the 302 status code as if it were the 303. */
    Found = 302,
    /** The response to the request can be found under another URI using the GET method. 
     * 
     * When received in response to a POST (or PUT/DELETE), the client should presume 
     * that the server has received the data and should issue a new GET request to the given URI. */
    SeeOther = 303,
    /** Indicates that the resource has not been modified since the version specified
     * by the request headers If-Modified-Since or If-None-Match. In such case,
     * there is no need to retransmit the resource since the client still has a 
     * previously-downloaded copy. */
    NotModified = 304,
    /** The requested resource is available only through a proxy, the address for which is provided in
     * the response. For security reasons, many HTTP clients (such as Mozilla Firefox and Internet Explorer) 
     * do not obey this status code */
    UseProxy = 305,
    /** In this case, the request should be repeated with another URI; 
     * however, future requests should still use the original URI.
     * In contrast to how 302 was historically implemented, the request method
     * is not allowed to be changed when reissuing the original request.
     * For example, a POST request should be repeated using another POST request. */
    TemporaryRedirect = 307,
    /** The request and all future requests should be repeated using another URI.
     * 307 and 308 parallel the behaviors of 302 and 301,
     * but do not allow the HTTP method to change. So, for example, submitting a
     * form to a permanently redirected resource may continue smoothly. */
    PermanentRedirect = 308,

    // CLIENT ERRORS

    /** The server cannot or will not process the request due to an apparent client error
     * (e.g., malformed request syntax, size too large, invalid request message framing,
     * or deceptive request routing). */
    BadRequest = 400,
    /** Similar to 403 Forbidden, but specifically for use when authentication is
     * required and has failed or has not yet been provided.
     * 
     * The response must include a WWW-Authenticate header field containing a challenge applicable
     * to the requested resource. 
     * 
     * See Basic access authentication and Digest access authentication.
     * 401 semantically means "unauthorised", the user does not have valid authentication credentials 
     * for the target resource. */
    Unauthorized = 401,
    /** The request contained valid data and was understood by the server, but the server is refusing action.
     * 
     * This may be due to the user not having the necessary permissions for a resource or needing an account of
     * some sort, or attempting a prohibited action (e.g. creating a duplicate record where only one is allowed).
     * This code is also typically used if the request provided authentication by answering the WWW-Authenticate
     * header field challenge, but the server did not accept that authentication. The request should not be repeated. */
    Forbidden = 403,
    /** The requested resource could not be found but may be available in the future. Subsequent requests by the client are permissible. */
    NotFound = 404,
    /** A request method is not supported for the requested resource; for example, a GET request
     * on a form that requires data to be presented via POST, or a PUT request on a read-only resource. */
    MethodNotAllowed = 405,
    /** The requested resource is capable of generating only content not acceptable according to the Accept headers sent in the request. */
    NotAcceptable = 406,
    /** The client must first authenticate itself with the proxy. */
    ProxyAuthenticationRequired = 407,
    /** The server timed out waiting for the request. According to HTTP specifications:
     * "The client did not produce a request within the time that the server was prepared to wait.
     * The client MAY repeat the request without modifications at any later time." */
    RequestTimeout = 408,
    /** Indicates that the request could not be processed because of conflict in the current state of the resource,
     * such as an edit conflict between multiple simultaneous updates. */
    Conflict = 409,
    /** The request did not specify the length of its content, which is required by the requested resource. */
    LengthRequired = 411,
    /** The server does not meet one of the preconditions that the requester put on the request header fields. */
    PreconditionFailed = 412,
    /** The request is larger than the server is willing or able to process. */
    PayloadTooLarge = 413,
    /** The URI provided was too long for the server to process.
     * Often the result of too much data being encoded as a query-string of a GET request,
     * in which case it should be converted to a POST request. */
    URITooLong = 414,
    /** The request entity has a media type which the server or resource does not support.
     * For example, the client uploads an image as image/svg+xml, but the server requires that images use a different format. */
    UnsupportedMediaType = 415,
    /** The client has asked for a portion of the file (byte serving),
     * but the server cannot supply that portion. For example, if the client asked for a
     * part of the file that lies beyond the end of the file. */
    RangeNotSatisfiable = 416,
    /** The server cannot meet the requirements of the Expect request-header field. */
    ExpectationFailed = 417,
    /** The resource that is being accessed is locked. */
    Locked = 423,
    /** The client should switch to a different protocol such as TLS/1.0, given in the Upgrade header field. */
    UpgradeRequired = 426,
    /** The user has sent too many requests in a given amount of time. Intended for use with rate-limiting schemes. */
    TooManyRequests = 429,
    /** The server is unwilling to process the request because either an individual header field, or all the header fields collectively, are too large. */
    RequestHeaderFieldsTooLarge = 431,
    /** A server operator has received a legal demand to deny access to a resource or to a set of resources that
     * includes the requested resource. The code 451 was chosen as a reference to the novel Fahrenheit 451 */
    UnavailableForLegalReasons = 451,

    // SERVER ERRORS
    /** A generic error message, given when an unexpected condition was encountered and no more specific message is suitable. */
    InternalServerError = 500,
    /** The server either does not recognize the request method, or it lacks the ability to fulfil the request.
     * Usually this implies future availability (e.g., a new feature of a web-service API). */
    NotImplemented = 501,
    /** The server was acting as a gateway or proxy and received an invalid response from the upstream server. */
    BadGateway = 502,
    /** The server cannot handle the request (because it is overloaded or down for maintenance). Generally, this is a temporary state. */
    ServiceUnavailable = 503,
    /** The server was acting as a gateway or proxy and did not receive a timely response from the upstream server. */
    GatewayTimeout = 504,
    /** The server does not support the HTTP protocol version used in the request. */
    HTTPVersionNotSupported = 505,
    /** Transparent content negotiation for the request results in a circular reference. */
    VariantAlsoNegotiates = 506,
    /** The server is unable to store the representation needed to complete the request. */
    InsufficientStorage = 507,
    /** The server detected an infinite loop while processing the request (sent instead of 208 Already Reported). */
    LoopDetected = 508,
    /** Further extensions to the request are required for the server to fulfil it. */
    NotExtended = 510,
    /** The client needs to authenticate to gain network access.
     * Intended for use by intercepting proxies used to control access to the network
     * (e.g., "captive portals" used to require agreement to Terms of Service before granting
     * full Internet access via a Wi-Fi hotspot). */
    NetworkAuthenticationRequired = 511,
}



/**
 * Specification of the way the client should handle a response.
 */
export interface APIResponseSpecification<R extends APIRoutesSpecification<R>> {
    /** 
     * Should this response be considered a success or an error ? 
     * If not specified, the default of the status code will be used.
    */
    readonly isSuccess?: boolean;
    /**
     * In case of error, the message that is provided to the Error.
     */
    readonly message?: string;
    /**
     * The content types that the response is supposed to have.
     * If it doesn't match, an Error is thrown.
     * 
     * If not specified, all content types will be accepted.
     */
    readonly expectedContentTypes?: ReadonlyArray<MIMETypes>;
    /**
     * Route to which the client should redirect after receiving this response.
     * - If not specified, the client won't redirect.
     * - The given string must be the identifier of an existing route.
     * - Alternatively, if the given value is "header-location", the redirection will
     * follow the "Location" field of the response header, if it exists.
     */
    readonly shouldRedirectTo?: keyof R | 'header-location';
    /**
     * In case of a 'header-location' redirect, should the client use the same request (only change the URL),
     * or use a simple GET ?
     * - `true` : the request is preserved
     * - `false` or `undefined` : the request is not preserved. GET will be used.
     * 
     * In case of a redirect to another route of the API, should the client use the same body (recalculate headers using api specification),
     * or don't include body and only use the specification ?
     * - `true` : the body is preserved
     * - `false` or `undefined` : the body is not preserved
     * 
     * If `shouldRedirectTo` is undefined, this property is ignored.
     */
    readonly shouldPreserveRequest?: boolean;

}

/**
 * Specification of the way the client should handle each http status code.
 * 
 */
export type APIResponseHandlingSpecification<R extends APIRoutesSpecification<R>> = {
    [propName in HTTPStatusCodes]?: APIResponseSpecification<R>;
}

/** Specification of a route of an API. */
export interface APIRouteSpecification<R extends APIRoutesSpecification<R>> {
    /** URL of the route */
    readonly url: string;
    /** Method used for the request */
    readonly method: 'GET' | 'POST' | 'HEAD' | 'PUT' | 'DELETE' | 'PATCH';
    /** Content type used for the request. */
    readonly requestContentType: MIMETypes;
    /** Mode used for the request */
    readonly mode?: 'cors' | 'no-cors' | 'navigate' | 'same-origin';
    /** A string indicating whether credentials will be sent with the request always, never, or only when sent to a same-origin URL. Sets request's credentials. */
    readonly credentials?: 'include' | 'omit' | 'same-origin';
    /** JSON body that is merged with the body passed to the call function.
     * 
     * The content type must be JSON. The syntax `#{name}` will be replaced by the value of
     * the cookie named 'name' (only in values and in the first level)
     */
    readonly baseJSONBody?: JSONInnerObject;
    /** Query parameters that are merged with the ones passed to the call function.
     * 
     * In values, the syntax `#{name}` will be replaced by the value of
     * the cookie named 'name'.
     * 
     * The method must be GET.
    */
    readonly baseQueryParams?: Record<string, string>;
    /** Specification of all expected responses, according to the API documentation. */
    readonly expectedResponses?: APIResponseHandlingSpecification<R>;
    /** How should a fetch error be handled for this route ? */
    readonly errorHandling?: ErrorHandlingSpecification;
    /** Object used for headers. The keys given here override the ones computed in the client.
     * You can use the syntax ``#{}`` to get the value of a cookie.
     * 
     * Example:
     * ```ts
     * headers: {
     *  "Authorization": "Bearer #{token}"
     * }
     * ```
     * This example will replace `#{token}` with the value of the Cookie named "token".
     * If such cookie does not exist, it will be replaced by an empty string. //TODO handle that error correctly
     */
    readonly headers?: Record<string, string>;
}

/**
 * Specification of the way the client should handle an error.
 * It concerns fetch errors (when "fetch" throws), not bad status codes.
 */
export interface ErrorHandlingSpecification {
    /** Should the error be thrown again ?
     * (e.g. the "call" method will throw the error for you to catch it and handle it yourself) */
    readonly shouldRethrow: boolean;
    /** Should the error be logged to the console ? */
    readonly shouldLogError: boolean;
    /** Callback to call on error. Alternative way of handling the error yourself. */
    readonly callback?: (error: string | Error) => void;
}

/**
 * Routes of the API.
 * 
 * **Usage:**
 * 
 * Implement this interface in another class in that way :
 * ```ts
 * // Use the name of your class in the generic parameter
 * class Routes implements APIRoutesSpecification<Routes>{
 *    // then, each field must be a route specification
 *    name_of_the_route: APIRouteSpecification<Routes> = {
 *       // content
 *    }
 * }
 * ```
 * The generic parameter allows Typescript to perform additional compile-type checks.
 * 
 * That way, in the API Client, only the names of the routes you defined will be allowed in the "routeName" field.
 */
export type APIRoutesSpecification<R extends APIRoutesSpecification<R>> = {
    readonly [routeName in keyof R]: APIRouteSpecification<R>;
}

/**
 * Specification of an API.
 * 
 * Used by an APIClient to provide an abstraction over simple http requests.
 */
export interface APISpecification<R extends APIRoutesSpecification<R>> {
    /** URL of the api root. */
    readonly baseURL: string;

    /** Specification of the different routes of the API. Each key is an identifier for a route. */
    readonly routes: R;

    /** Default way to handle status codes in internal responses.
     * 
     * "Internal responses" are the responses received when calling an URL that is inside the specifie API.
     * 
     * That doesn't include the responses of requests to URL outside of the API, like redirects to a "Location" header.
     * 
     * To specify the external responses, see `defaultExternalResponses`.
     */
    readonly defaultResponses?: APIResponseHandlingSpecification<R>;

    /** Default way of handling fetch errors in calls */
    readonly defaultErrorHandling?: ErrorHandlingSpecification;

    /** 
     * Default way of handling status codes in external responses.
     * 
     * "External responses" are the responses received when calling an URL that is outside of the specified API.
     * 
     * For example, when redirecting to an URL indicated in the "Location" header of another response.
     * 
     * If none are provided, the HTTP conventions will be used (not the `defaultResponses` values !)
     */
    readonly defaultExternalResponses?: APIResponseHandlingSpecification<R>;
}

/**
 * Body of an HTTP request. Be sure to provide a value compatible with the Content-Type given to the specification.
 */
export type HTTPRequestBody = string | Blob | ArrayBuffer | FormData | URLSearchParams | null | undefined;
export class HTTPRequestResult {
    /** Was the request successful ? `true` if it was, `false` if there was an error. */
    ok: boolean;
    /** In case of an error, this property contains the error message. */
    message?: string;
    /** Response of the HTTP request. Can be undefined if the request didn't work. */
    response?: Response;

    public constructor(ok: boolean, message?: string, response?: Response) {
        this.ok = ok;
        this.message = message;
        this.response = response;
    }

    /** Is the result valid ? */
    public isOk(): this is { ok: true; response: Response; message?: string } {
        return this.ok === true
            && this.response !== undefined;
    }

    /** Is the result http 200 ? */
    public is200(): this is { ok: true; response: { status: 200 }; message?: string } {
        return this.ok === true
            && this.response !== undefined
            && this.response.status === 200;
    }

    /**
     * Checks if the response has the given content type, without consuming the response.
     * @param type The expected content type
     * @returns true if the response has the given content type. false otherwise
     */
    public async isOfType(type: MIMETypes): Promise<boolean> {
        const contentType = this.response?.headers?.get('content-type');
        if (contentType) {
            return contentType.split(/[;,]/g)[0] === type;
        }
        return false;
    }

    /**
     * Get the json from the response, if it exists 
     * @returns The body json. Consumes the body.
     * @throws if the parsing failed. Check with ``hasType(MIMETypes.JSON)`` before using this function.
     * */
    public async getJson(): Promise<JSONObject | undefined> {
        return await this.response?.json();
    }

    /**
     * Get the body text from the response
     * @returns the body text. Consumes the body.
     */
    public async getText(): Promise<string | undefined> {
        return await this.response?.text();
    }
}

export interface FetchInit extends RequestInit {
    body?: HTTPRequestBody;
}
