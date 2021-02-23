import APIClient, { HTTPRequestResult, JSONInnerObject, MIMETypes } from "utils/api-client";
import { CallBodyParam } from "utils/api-client/api-client";
import { as } from "utils/validation";
import { MediarichApiSpecification, MediarichRoutesSpec } from "./api-routes";
import { MediarichResponseJSON, UserAddBody, UserAddResult, UserEditBody, UserEditResult, UserLoginResult, UserTestResult, UserLoginBody } from "./types";

export default class MediarichAPIHandler {

    /**
     * Instance (singleton pattern)
     */
    private static _instance = new MediarichAPIHandler();

    /**
     * Private constructor (singleton pattern)
     */
    private constructor() {
        // Create the client
        this._client = new APIClient<MediarichApiSpecification, MediarichRoutesSpec>(
            new MediarichApiSpecification(process.env.REACT_APP_MEDIARICH_API_ROOT ?? 'http://localhost:8000')
        );
    }

    /** The APIClient for the Mediarich API */
    private readonly _client;


    /** Send a request to the mediarich API
     * @param routeName the route to call
     * @param data the data to send with the route. See the specification of the route.
     * @returns the response JSON if it is valid
     * @throws an Error otherwise
     */
    public static async call<K extends keyof MediarichRoutesSpec>(
        routeName: K,
        data?: CallBodyParam<MediarichRoutesSpec, K>
    ): Promise<{ json: MediarichResponseJSON, statusCode: number }> {

        // Get instance
        const instance = MediarichAPIHandler._instance;

        // Make the request
        let result: HTTPRequestResult | undefined;
        try {
            result = await instance._client.call<K>(routeName, data);
        } catch (e) {
            console.error(e);
            throw e;
        }

        // Get and check the JSON
        if (await result.isOfType(MIMETypes.JSON)) {
            const json = await result.getJson();
            if (!Array.isArray(json) && json !== undefined && typeof json.error === 'boolean') {
                // Return it if valid
                return { json: json as MediarichResponseJSON, statusCode: result.response?.status ?? 0 };
            }
            else {
                throw new Error('The API didn\'t return a valid JSON.');
            }
        } else {
            throw new Error('The API didn\'t return a JSON.');
        }
    };

    /**
     * Tries to add the given user
     * @param user The user to add
     * @returns a status indicating wheter it worked or not
     */
    public static async addUser(user: UserAddBody): Promise<UserAddResult> {
        let result;
        try {
            result = await MediarichAPIHandler.call('/user/add', user);
        } catch (e) {
            return UserAddResult.Error;
        }

        // If it didn't work
        if (result.json.error === true) {

            console.error(result.json.cause);

            // Username already taken
            if (result.statusCode === 409) {
                return UserAddResult.Conflict;
            }
            // Otherwise
            else {
                return UserAddResult.Error;
            }

        }
        // If it worked
        else {
            return UserAddResult.Added;
        }
    }

    /**
     * Tries to log in the given user
     * @param user The user to log in. apiKey doesn't need to be set.
     * @returns an object containing a status and the api key of the user (in case of success)
     */
    public static async loginUser(user: UserLoginBody): Promise<{ status: UserLoginResult, apiKey?: string }> {
        let result;
        try {
            result = await MediarichAPIHandler.call('/user/login', user);
        } catch (e) {
            return { status: UserLoginResult.Error };
        }

        // If it didn't work
        if (result.json.error === true) {
            console.error(result.json.cause);

            // Unauthorized (wrong credentials)
            if (result.statusCode === 401) {
                return { status: UserLoginResult.Unauthorized };
            }
            // Otherwise
            else {
                return { status: UserLoginResult.Error };
            }
        }
        // If it worked
        else {
            return {
                status: UserLoginResult.LoggedIn,
                apiKey: as('string', result.json.apiKey)
            };
        }
    }

    /** Tries to edit the given user
     * @param user The user to edit. Username is required to find the user, then newPassword and
     *  newApiKey are optional. Only the provided ones will be edited
     * @returns A status indicating whether it worked or not
     */
    public static async editUser(user: UserEditBody): Promise<UserEditResult> {
        // Do the request
        let result;
        try {
            result = await MediarichAPIHandler.call('/user/edit', user);
        } catch (e) {
            return UserEditResult.Error;
        }

        // If it didn't work
        if (result.json.error === true) {
            console.error(result.json.cause);

            // Unauthorized (not connected or not the same user)
            if (result.statusCode === 401) {
                return UserEditResult.Unauthorized;
            }
            // Otherwise
            else {
                return UserEditResult.Error;
            }
        }
        // If it worked
        else {
            return UserEditResult.Edited;
        }
    }

    /** Tests if the user is connected.
     * @returns a status indicating whether it worked or not, and in case of success the username and api key of the user
     */
    public static async testUser(): Promise<{ status: UserTestResult, username?: string, apiKey?: string }> {
        // Do the request
        let result;
        try {
            result = await MediarichAPIHandler.call('/user/test');
        } catch (e) {
            return {
                status: UserTestResult.Error
            };
        }

        // If it didn't work
        if (result.json.error === true) {
            console.error(result.json.cause);

            // Unauthorized (not connected)
            if (result.statusCode === 401) {
                return {
                    status: UserTestResult.NotConnected
                };

            }
            // Otherwise
            else {
                return {
                    status: UserTestResult.Error
                };
            }
        }
        // If it worked
        else {
            return {
                status: UserTestResult.Connected,
                username: as('string', result.json.username),
                apiKey: as('string', result.json.error),
            };
        }
    }

    /** Disconnects the user
     * @returns a boolean indicating whether there was an error or not
     */
    public static async disconnectUser(): Promise<boolean> {
        // Do the request
        let result;
        try {
            result = await MediarichAPIHandler.call('/user/disconnect');
        } catch (e) {
            return false;
        }

        // in case of error, print it
        if (result.json.error === false) {
            console.error(result.json.cause);
        }

        // Return the boolean value
        return result.json.error;
    }
}
