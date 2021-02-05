import APIClient, { HTTPRequestBody, JSONInnerObject, JSONObject } from 'utils/api-client';
import { MSApiSpecification, MSRoutesSpec } from './api-routes';
import { MediaServerError, MSResponseJson } from './types';

/**
 *  MediaServer API handler.
 * 
 * #### Config:
 * Set the ``REACT_APP_MEDIASERVER_API_ROOT`` environment variable to config the base url of the API.
 * 
 * Example:
 * ```env
 * REACT_APP_MEDIASERVER_API_ROOT="https://mediaserver.com/api/v2"
 * ```
 */
class MediaServerAPIHandler {

    /** APIClient handling the MediaServer API. The base URL can be set with the ``REACT_APP_MEDIASERVER_API_ROOT`` environment variable. */
    private readonly _client;

    /**
     * Create a new media server
     * @param baseUrl base url of the server.
     * If not set, it will take the value of the environment variable ``REACT_APP_MEDIASERVER_API_ROOT``.
     * If still not set, it will default to `http://localhost:8080`.
     */
    public constructor(baseUrl?: string) {
        this._client = new APIClient<MSApiSpecification, MSRoutesSpec>(
            new MSApiSpecification(baseUrl ?? process.env.REACT_APP_MEDIASERVER_API_ROOT ?? 'http://localhost:8080')
        );
    }

    public async call(routeName: keyof MSRoutesSpec, data?: HTTPRequestBody | JSONObject): Promise<MSResponseJson> {
        try {
            // Call the route
            const result = await this._client.call(routeName, data);

            // In case of success, parse the JSON
            if (result.is200()) {
                const json = await result.getJson();

                if (!Array.isArray(json) && json !== undefined && typeof json.success === 'boolean') {
                    return json as MSResponseJson;
                }
                else {
                    throw new MediaServerError('The API didn\'t return a valid JSON', json);
                }
            }
            // else throw the error
            else {
                throw new MediaServerError(result.message);
            }
        }
        // in case of another error in the call
        catch (e) {
            throw new MediaServerError(e.message);
        }
    }

    // public static async ping(): Promise<string> {
    //     // return this.callHandler('/') as PingResponse;
    // }








}

export default MediaServerAPIHandler;