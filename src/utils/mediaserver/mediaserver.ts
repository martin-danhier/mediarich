import APIClient from 'utils/api-client/api-client';
import { MSApiSpecification, MSRoutesSpec } from './api-routes';

/**
 *  MediaServer handler.
 * 
 * #### Config:
 * Set the ``REACT_APP_MEDIASERVER_API_ROOT`` environment variable to config the base url of the API.
 * 
 * Example:
 * ```env
 * REACT_APP_MEDIASERVER_API_ROOT="https://mediaserver.com/api/v2"
 * ```
 * 
 */
class MediaServer {

    /** APIClient handling the MediaServer API. The base URL can be set with the ``REACT_APP_MEDIASERVER_API_ROOT`` environment variable. */
    private static readonly _client = new APIClient<MSApiSpecification, MSRoutesSpec>(
        new MSApiSpecification(process.env.REACT_APP_MEDIASERVER_API_ROOT ?? 'http://localhost:8080')
    );




    





}

export default MediaServer;