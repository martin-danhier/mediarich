/**
 * @file Default values for response handling
 * @author Martin Danhier
 * @version 0.1
 */

import './types';
import { APIResponseHandlingSpecification, ErrorHandlingSpecification, HTTPStatusCodes as hs } from './types';

/**
 * Default values for response handling.
 * 
 * If a response is not handled in the API specification provided by the user,
 * these values will be used instead.
 * 
 * The values are based on the conventions of HTTP status codes.
 */
export const defaultResponseHandling: APIResponseHandlingSpecification = {
    // Errors 200+
    [hs.OK]: {
        isSuccess: true,
    },
    [hs.Created]: {
        isSuccess: true,
    },
    [hs.Accepted] : {
        isSuccess: true,
    },
    [hs.NonAuthoritativeInformation] : {
        isSuccess: true,
    },
    [hs.NoContent] : {
        isSuccess: true,
    },
    [hs.ResetContent] : {
        isSuccess: true,
    },
    [hs.PartialContent] : {
        isSuccess: true,
    },
    [hs.MultiStatus] : {
        isSuccess: true,
    },
    [hs.AlreadyReported] : {
        isSuccess: true,
    },
    // Errors 300+
    [hs.MultipleChoices]: {
        isSuccess: true,
        // Since there are multiple choices, leave the choice to the user
    },
    [hs.MovedPermanently]: {
        isSuccess: true,
        shouldRedirectTo: 'header-location',
        // In theory, it is preserved.
        // In practice, it is adviced to only use 301 to respond to GET or HEAD.
        // 308 is used to respond to POST
        shouldPreserveRequest: true,
    },
    [hs.Found]: {
        isSuccess: true,
        shouldRedirectTo: 'header-location',
        // In theory, it is preserved.
        // In practice, it is adviced to only use 302 to respond to GET or HEAD.
        // 307 is used to respond to POST
        shouldPreserveRequest: true,
    },
    [hs.SeeOther]: {
        isSuccess: true,
        shouldRedirectTo: 'header-location',
        // 303 should use GET in the new request
        shouldPreserveRequest: false,
    },
    [hs.NotModified]: {
        isSuccess: true,
    },
    [hs.UseProxy]: {
        isSuccess: true,
    },
    [hs.TemporaryRedirect]: {
        isSuccess: true,
        shouldRedirectTo: 'header-location',
        // 307 should preserve request. Use 303 if you need to switch to GET
        shouldPreserveRequest: true,
    },
    [hs.PermanentRedirect]: {
        isSuccess: true,
        shouldRedirectTo: 'header-location',
        // 308 should preserve request. Use 303 if you need to switch to GET
        shouldPreserveRequest: true,
    },
    // Errors 400+
    [hs.BadRequest] : {
        isSuccess: false,
        message: 'Bad request',
    },
    [hs.Unauthorized] : {
        isSuccess: false,
        message: 'Unauthorized',
    },
    [hs.Forbidden] : {
        isSuccess: false,
        message: 'Forbidden',
    },
    [hs.NotFound] : {
        isSuccess: false,
        message: 'Not found',
    },
    [hs.MethodNotAllowed] : {
        isSuccess: false,
        message: 'Method not allowed',
    },
    [hs.NotAcceptable] : {
        isSuccess: false,
        message: 'Not acceptable',
    },
    [hs.ProxyAuthenticationRequired] : {
        isSuccess: false,
        message: 'Proxy authentication required',
    },
    [hs.RequestTimeout] : {
        isSuccess: false,
        message: 'Request timeout',
    },
    [hs.Conflict] : {
        isSuccess: false,
        message: 'Conflict',
    },
    [hs.LengthRequired] : {
        isSuccess: false,
        message: 'Content-Length required',
    },
    [hs.PreconditionFailed] : {
        isSuccess: false,
        message: 'Precondition failed',
    },
    [hs.PayloadTooLarge] : {
        isSuccess: false,
        message: 'Payload is too large',
    },
    [hs.URITooLong] : {
        isSuccess: false,
        message: 'URI too long (try to use POST)',
    },
    [hs.UnsupportedMediaType] : {
        isSuccess: false,
        message: 'The provided media type is not supported',
    },
    [hs.RangeNotSatisfiable] : {
        isSuccess: false,
        message: 'Range not satisfiable',
    },
    [hs.ExpectationFailed] : {
        isSuccess: false,
        message: 'Expectation failed',
    },
    [hs.Locked] : {
        isSuccess: false,
        message: 'The requested resource is locked',
    },
    [hs.UpgradeRequired] : {
        isSuccess: false,
        message: 'Upgrade required',
    },
    [hs.TooManyRequests] : {
        isSuccess: false,
        message: 'Too many requests',
    },
    [hs.RequestHeaderFieldsTooLarge] : {
        isSuccess: false,
        message: 'Request header fields too large',
    },
    [hs.UnavailableForLegalReasons] : {
        isSuccess: false,
        message: 'Unavailable for legal reasons',
    },
    // Errors 500+
    [hs.InternalServerError] : {
        isSuccess: false,
        message: 'Internal server error',
    },
    [hs.NotImplemented] : {
        isSuccess: false,
        message: 'This route is not implemented',
    },
    [hs.BadGateway] : {
        isSuccess: false,
        message: 'Bad gateway',
    },
    [hs.ServiceUnavailable] : {
        isSuccess: false,
        message: 'Service unavailable',
    },
    [hs.GatewayTimeout] : {
        isSuccess: false,
        message: 'Gateway timeout',
    },
    [hs.HTTPVersionNotSupported] : {
        isSuccess: false,
        message: 'HTTP version not supported',
    },
    [hs.VariantAlsoNegotiates] : {
        isSuccess: false,
        message: 'Variant also negotiates',
    },
    [hs.InsufficientStorage] : {
        isSuccess: false,
        message: 'Insufficient storage',
    },
    [hs.LoopDetected] : {
        isSuccess: false,
        message: 'Loop detected',
    },
    [hs.NotExtended] : {
        isSuccess: false,
        message: 'Not extended',
    },
    [hs.NetworkAuthenticationRequired] : {
        isSuccess: false,
        message: 'Network authentication required',
    },
};

export const defaultErrorHandling: ErrorHandlingSpecification = {
    shouldLogError: true,
    shouldRethrow: false,
};
