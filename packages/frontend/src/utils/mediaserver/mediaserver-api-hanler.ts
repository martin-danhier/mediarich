/**
 * @file Handler for the MediaServer API
 * @version 1.0
 * @author Martin Danhier
 * @license Apache
*/

import assert from 'utils/assert';
import APIClient, { HTTPRequestResult, JSONInnerObject, MIMETypes } from 'utils/api-client';
import { CallBodyParam } from 'utils/api-client/api-client';
import { MSApiSpecification, MSRoutesSpec } from './api-routes';
import MSChannel from './classes/channel';
import { MediaServerError, MSChannelTreeItem, MSResponseJson } from './types';
import { as, asJsonObjectArray, } from '../validation';

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
    /** API key of the user */
    private _apiKey: string;
    /** Base url of the API */
    private _baseUrl: string;

    /** APIClient handling the MediaServer API. The base URL can be set with the ``REACT_APP_MEDIASERVER_API_ROOT`` environment variable. */
    private readonly _client;

    public get baseUrl(): string { return this._baseUrl; }

    /**
     * Create a new media server
     * @param baseUrl base url of the server.
     * If not set, it will take the value of the environment variable ``REACT_APP_MEDIASERVER_API_ROOT``.
     * The base URL should NOT include the `/api/v2` part.
     * If still not set, it will default to `http://localhost:8080`.
     */
    public constructor(apiKey: string, baseUrl?: string) {
        // Get the base URL
        const url = (baseUrl ?? process.env.REACT_APP_MEDIASERVER_API_ROOT ?? 'http://localhost:8080');

        // create a client and save parameters
        this._client = new APIClient<MSApiSpecification, MSRoutesSpec>(
            new MSApiSpecification(url + '/api/v2')
        );
        this._apiKey = apiKey;
        this._baseUrl = url;
    }

    /** Clones this class */
    public clone(): MediaServerAPIHandler {
        return new MediaServerAPIHandler(this._apiKey, this._baseUrl);
    }

    /** Handle a basic mediaserver request, but don't handle the response body.
     * @param routeName Name of the called route
     * @param data Data to send with the request
    */
    public async freeCall<K extends keyof MSRoutesSpec>(routeName: K, data?: JSONInnerObject | FormData, headers?: Record<string, string>): Promise<HTTPRequestResult> {
        // Assert that the route is in form url encoded
        assert(this._client.api.routes[routeName].requestContentType === MIMETypes.XWWWFormUrlencoded as const
            || this._client.api.routes[routeName].requestContentType === MIMETypes.FormData as const, 'All MediaServer request are done in x-w-form-urlencoded or in form-data');

        // Add api key
        if (data instanceof FormData) {
            data.append('api_key', this._apiKey);
        } else {        // Init data if undefined
            data = data ?? {};
            // Add Api Key
            data['api_key'] = this._apiKey;
        }

        // Do the request
        let result: HTTPRequestResult | undefined;
        try {
            // Call the route
            result = await this._client.call<K>(routeName, data as CallBodyParam<MSRoutesSpec, K>, headers);

        } catch (e) {
            console.error(e);
            throw new MediaServerError(e.message);
        }

        return result;

    }

    /**
     * Sends a request to media server and handle parts of the response
     * @param routeName Name of the called route
     * @param data Data to send with the request
     * @returns The returned media server json
     */
    public async call<K extends keyof MSRoutesSpec>(
        routeName: K,
        data?: JSONInnerObject | FormData,
    ): Promise<MSResponseJson> {

        const result = await this.freeCall(routeName, data);

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
            throw new MediaServerError('The API didn\'t return a JSON.');
        }


    }



    /**
     * Returns the list of all channels of the server.
     *
     * @returns the list of all the channels
     * @throws a MediaServerError if the API responds a completely unusable answer. You should try catch this function to handle that case.
     */
    public async channels(): Promise<MSChannel[]> {

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

    /**
     * Returns a tree of all the channels on the server.
     *
     * @returns a tree of all the channels
     * @throws MediaServerError if the API returns something completely unusable. You should catch that error to handle that case.
     */
    public async channelsTree(): Promise<MSChannelTreeItem[]> {
        // Make the request
        const result = await this.call('/channels/tree');

        if (result.success) {
            const channels = asJsonObjectArray(result.channels);

            if (channels) {
                // Parse the tree
                return this.parseTree(channels);
            } else {
                // Throw it since the MS client is useless without channels
                throw new MediaServerError('Bad response format. Expected an array of channels.', result);
            }
        } else {
            // Throw it since the MS client is useless without channels
            throw new MediaServerError('An error occured while accessing MediaServer channels', result);
        }
    }

    /** Recursively parses a JSON describing the channel tree.
     * @params JSON array representing a channel tree.
     * @returns the object representation of that tree
     */
    private parseTree(channelsJsonList: JSONInnerObject[]): MSChannelTreeItem[] {
        const list: MSChannelTreeItem[] = [];

        for (const channelJson of channelsJsonList) {

            // Try to init fields
            const title = as<string>('string', channelJson.title);
            const slug = as<string>('string', channelJson.slug);
            let channel: MSChannel;
            try {
                channel = MSChannel.fromJSON(channelJson, this);

                const children = asJsonObjectArray(channelJson.channels);

                // Ignore if invalid
                if (title && slug) {
                    // Create item
                    const item: MSChannelTreeItem = {
                        title,
                        slug,
                        channel
                    };

                    // Parse children if any
                    if (children && children.length > 0) {
                        item.children = this.parseTree(children);
                    }

                    // Add to the list
                    list.push(item);
                }
            } catch (error) {
                if (error instanceof MediaServerError) {
                    // Log the MS error. We simply ignore the channel and don't add it in the list.
                    // We don't throw the error, since maybe there are other usable channels that parsed successfully.
                    error.log('The following error was found when parsing a channel. The channel won\'t be added. ');
                } else throw error;
            }
        }
        return list;
    }

    /**
     * Find the channel of the current user
     * @param createIfDoesNotExist If the channel is not found, create it. Requires the permission to have one.
     * @returns the channel if found or created, or null
     * @throws MediaServerError if an unexpected error occured (e.g. the API did not return a valid JSON)
     */
    public async myChannel(createIfDoesNotExist = false): Promise<MSChannel | null> {
        // Call the API
        const result = await this.call('/channels/personal', {
            create: createIfDoesNotExist ? 'yes' : 'no',
        });

        if (result.success) {
            // Return the channel
            return MSChannel.fromJSON(result, this);
        } else {
            return null;
        }
    }

    /** Tests if the api key is valid or not */
    public async test(): Promise<boolean> {
        // Call the "ping" route with the api key
        // If the key is valid, it will respond 200
        // Else it will respond 403
        const result = await this.call('/');
        return result.success;
    }
}

export default MediaServerAPIHandler;