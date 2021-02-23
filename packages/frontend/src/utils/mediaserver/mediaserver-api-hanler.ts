import * as assert from 'utils/assert/assert';
import APIClient, { HTTPRequestResult, JSONInnerObject, MIMETypes } from 'utils/api-client';
import { CallBodyParam } from 'utils/api-client/api-client';
import { MSApiSpecification, MSRoutesSpec } from './api-routes';
import MSChannel from './classes/channel';
import { MediaServerError, MSResponseJson } from './types';
import { asJsonObjectArray, } from '../validation';

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

    private _apiKey: string;

    /** APIClient handling the MediaServer API. The base URL can be set with the ``REACT_APP_MEDIASERVER_API_ROOT`` environment variable. */
    private readonly _client;

    /**
     * Create a new media server
     * @param baseUrl base url of the server.
     * If not set, it will take the value of the environment variable ``REACT_APP_MEDIASERVER_API_ROOT``.
     * If still not set, it will default to `http://localhost:8080`.
     */
    public constructor(apiKey: string, baseUrl?: string) {
        this._client = new APIClient<MSApiSpecification, MSRoutesSpec>(
            new MSApiSpecification(baseUrl ?? process.env.REACT_APP_MEDIASERVER_API_ROOT ?? 'http://localhost:8080')
        );
        this._apiKey = apiKey;
    }


    public async call<K extends keyof MSRoutesSpec>(
        routeName: K,
        data?: JSONInnerObject
    ): Promise<MSResponseJson> {

        // Assert that the route is in form url encoded
        assert.strictEqual(this._client.api.routes[routeName].requestContentType, MIMETypes.XWWWFormUrlencoded as const, 'All MediaServer request are done in x-w-form-urlencoded');

        // Init data if undefined
        data = data ?? {};
        // Add Api Key
        data['api_key'] = this._apiKey;

        let result: HTTPRequestResult | undefined;
        try {

            // Call the route
            result = await this._client.call<K>(routeName, data as CallBodyParam<MSRoutesSpec, K>);

        } catch (e) {
            console.error(e);
            throw new MediaServerError(e.message);
        }

        // Parse the JSON if there is a content type
        if (await result.isOfType(MIMETypes.JSON)) {
            const json = await result.getJson();

            if (!Array.isArray(json) && json !== undefined && typeof json.success === 'boolean') {
                return json as MSResponseJson;
            }
            else {
                throw new MediaServerError('The API didn\'t return a valid JSON', json);
            }
        }
        // No JSON
        else {
            const body = await result.getText();

            if (body && await result.isOfType(MIMETypes.HTML)) {
                const newWindow = window.open();
                newWindow?.document.write(body);
            }
            console.log(body);
            throw new MediaServerError('The API didn\'t return a JSON.');
        }


    }



    /**
     * Returns the list of all channels of the server.
     *
     * The first time, the API will be called to get the data. It will be cached for later use.
     * If you call this function several times, the cache will be used instead of a request.
     *
     * To force a refresh, set the `forceRefresh` parameter to true. Since channels don't change very often, this is not
     * recommended.
     *
     * @param forceRefresh If true, a request will always be sent (slower)
     * @returns the list of all the channels
     * @throws a MediaServerError if the API responds a completely unusable answer. You should try catch this function to handle that case.
     */
    public async channels(forceRefresh = false): Promise<MSChannel[]> {

        // Make the request
        const result: MSResponseJson = await this.call('/channels');

        // Handle the result
        if (result.success) {

            const channelsJson = asJsonObjectArray(result.channels);

            if (channelsJson !== undefined) {

                const channels: MSChannel[] = [];

                for (const channelJson of channelsJson) {
                    try {
                        channels.push(MSChannel.fromJSON(channelJson, this));
                    }
                    // Only catch MS errors, but Typescript doesn't know that concept
                    // So we type check it and throw it again if it doesn't match
                    catch (error) {
                        if (error instanceof MediaServerError) {
                            // Log the MS error. We simply ignore the channel and don't add it in the list.
                            // We don't throw the error, since maybe there are other usable channels that parsed successfully.
                            error.log('The following error was found when parsing a channel. The channel won\'t be added. ');
                        } else throw error;
                    }

                }
                // Save the new list and return
                return channels;
            }
            else {
                // Throw it since the MS client is useless without channels
                throw new MediaServerError('Bad response format. Expected an array of channels.', result);
            }
        } else {
            // Throw it since the MS client is useless without channels
            throw new MediaServerError('An error occured while accessing MediaServer channels', result);

        }

    }
}

export default MediaServerAPIHandler;