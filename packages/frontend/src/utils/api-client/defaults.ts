/**
 * @file Default values for response handling
 * @author Martin Danhier
 * @license Apache
* @version 1.0
 */

import './types';
import { APIResponseHandlingSpecification, APIResponseSpecification, APIRoutesSpecification, ErrorHandlingSpecification, HTTPStatusCodes as hs } from './types';

/**
 * Default values for response handling.
 * 
 * If a response is not handled in the API specification provided by the user,
 * these values will be used instead.
 * 
 * The values are based on the conventions of HTTP status codes.
 */
export class DefaultResponseHandling<R extends APIRoutesSpecification<R>> implements APIResponseHandlingSpecification<R> {
    // Errors 200+
    [hs.OK] = {
        isSuccess: true,
    };
    [hs.Created] = {
        isSuccess: true,
    };
    [hs.Accepted] = {
        isSuccess: true,
    };
    [hs.NonAuthoritativeInformation] = {
        isSuccess: true,
    };
    [hs.NoContent] = {
        isSuccess: true,
    };
    [hs.ResetContent] = {
        isSuccess: true,
    };
    [hs.PartialContent] = {
        isSuccess: true,
    };
    [hs.MultiStatus] = {
        isSuccess: true,
    };
    [hs.AlreadyReported] = {
        isSuccess: true,
    };
    // Errors 300+
    [hs.MultipleChoices] = {
        isSuccess: true,
        // Since there are multiple choices, leave the choice to the user
    };
    [hs.MovedPermanently]: APIResponseSpecification<R> = {
        isSuccess: true,
        shouldRedirectTo: 'header-location',
        // In theory, it is preserved.
        // In practice, it is adviced to only use 301 to respond to GET or HEAD.
        // 308 is used to respond to POST
        shouldPreserveRequest: true,
    };
    [hs.Found]: APIResponseSpecification<R> = {
        isSuccess: true,
        shouldRedirectTo: 'header-location',
        // In theory, it is preserved.
        // In practice, it is adviced to only use 302 to respond to GET or HEAD.
        // 307 is used to respond to POST
        shouldPreserveRequest: true,
    };
    [hs.SeeOther]: APIResponseSpecification<R> = {
        isSuccess: true,
        shouldRedirectTo: 'header-location',
        // 303 should use GET in the new request
        shouldPreserveRequest: false,
    };
    [hs.NotModified] = {
        isSuccess: true,
    };
    [hs.UseProxy] = {
        isSuccess: true,
    };
    [hs.TemporaryRedirect]: APIResponseSpecification<R> = {
        isSuccess: true,
        shouldRedirectTo: 'header-location',
        // 307 should preserve request. Use 303 if you need to switch to GET
        shouldPreserveRequest: true,
    };
    [hs.PermanentRedirect]: APIResponseSpecification<R> = {
        isSuccess: true,
        shouldRedirectTo: 'header-location',
        // 308 should preserve request. Use 303 if you need to switch to GET
        shouldPreserveRequest: true,
    };
    // Errors 400+
    [hs.BadRequest] = {
        isSuccess: false,
        message: '400: Bad request',
    };
    [hs.Unauthorized] = {
        isSuccess: false,
        message: '401: Unauthorized',
    };
    [hs.Forbidden] = {
        isSuccess: false,
        message: '403: Forbidden',
    };
    [hs.NotFound] = {
        isSuccess: false,
        message: '404: Not found',
    };
    [hs.MethodNotAllowed] = {
        isSuccess: false,
        message: '405: Method not allowed',
    };
    [hs.NotAcceptable] = {
        isSuccess: false,
        message: '406: Not acceptable',
    };
    [hs.ProxyAuthenticationRequired] = {
        isSuccess: false,
        message: '407: Proxy authentication required',
    };
    [hs.RequestTimeout] = {
        isSuccess: false,
        message: '408: Request timeout',
    };
    [hs.Conflict] = {
        isSuccess: false,
        message: '409: Conflict',
    };
    [hs.LengthRequired] = {
        isSuccess: false,
        message: '411: Content-Length required',
    };
    [hs.PreconditionFailed] = {
        isSuccess: false,
        message: '412: Precondition failed',
    };
    [hs.PayloadTooLarge] = {
        isSuccess: false,
        message: '413: Payload is too large',
    };
    [hs.URITooLong] = {
        isSuccess: false,
        message: '414: URI too long (try to use POST)',
    };
    [hs.UnsupportedMediaType] = {
        isSuccess: false,
        message: '415: The provided media type is not supported',
    };
    [hs.RangeNotSatisfiable] = {
        isSuccess: false,
        message: '416: Range not satisfiable',
    };
    [hs.ExpectationFailed] = {
        isSuccess: false,
        message: '417: Expectation failed',
    };
    [hs.Locked] = {
        isSuccess: false,
        message: '423: The requested resource is locked',
    };
    [hs.UpgradeRequired] = {
        isSuccess: false,
        message: '426: Upgrade required',
    };
    [hs.TooManyRequests] = {
        isSuccess: false,
        message: '429: Too many requests',
    };
    [hs.RequestHeaderFieldsTooLarge] = {
        isSuccess: false,
        message: '431: Request header fields too large',
    };
    [hs.UnavailableForLegalReasons] = {
        isSuccess: false,
        message: '451: Unavailable for legal reasons',
    };
    // Errors 500+
    [hs.InternalServerError] = {
        isSuccess: false,
        message: '500: Internal server error',
    };
    [hs.NotImplemented] = {
        isSuccess: false,
        message: '501: This route is not implemented',
    };
    [hs.BadGateway] = {
        isSuccess: false,
        message: '502: Bad gateway',
    };
    [hs.ServiceUnavailable] = {
        isSuccess: false,
        message: '503: Service unavailable',
    };
    [hs.GatewayTimeout] = {
        isSuccess: false,
        message: '504: Gateway timeout',
    };
    [hs.HTTPVersionNotSupported] = {
        isSuccess: false,
        message: '505: HTTP version not supported',
    };
    [hs.VariantAlsoNegotiates] = {
        isSuccess: false,
        message: '506: Variant also negotiates',
    };
    [hs.InsufficientStorage] = {
        isSuccess: false,
        message: '507: Insufficient storage',
    };
    [hs.LoopDetected] = {
        isSuccess: false,
        message: '508: Loop detected',
    };
    [hs.NotExtended] = {
        isSuccess: false,
        message: '510: Not extended',
    };
    [hs.NetworkAuthenticationRequired] = {
        isSuccess: false,
        message: '511: Network authentication required',
    };
}

export const defaultErrorHandling: ErrorHandlingSpecification = {
    shouldLogError: true,
    shouldRethrow: false,
};
