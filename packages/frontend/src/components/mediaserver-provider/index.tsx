/**
 * @file Definition of the MediaServerProvider and MediaServerConsumer components
 * @version 1.0
 * @author Martin Danhier
 * @license Apache
*/

import React from 'react';
import { MediarichAPIHandler, UserTestResult } from 'utils/backend';
import MediaServerAPIHandler from 'utils/mediaserver/mediaserver-api-hanler';
import { History } from 'history';
import Cookies from 'js-cookie';

/** Context for MediaServerAPIHandler */
export const MediaServerContext = React.createContext<MediaServerProviderState | null>(null);

/** Consumer for a MediaServerAPIHandler. Listens to a provider for changes. */
export const MediaServerConsumer = MediaServerContext.Consumer;

/** Props of a MediaServerProvider component */
export interface MediaServerProviderProps {
    children: JSX.Element | JSX.Element[];
}

/** State of a MediaServerProvider component */
export interface MediaServerProviderState {
    /** The API handler used for requests with MediaServer */
    mediaserver: MediaServerAPIHandler | null;
    /** Create a new api handler with the given API key  */
    changeApiKey: typeof MediaServerProvider.prototype.changeApiKey;
    /** Destroys the API handler to prevent further requests */
    reset: typeof MediaServerProvider.prototype.reset;
    /** Checks the Mediarich backend to see if the user is connected.
     * If so, creates an api handler with the api key. */
    refresh: typeof MediaServerProvider.prototype.refresh;
}

/** Provider for a MediaServerAPIHandler.
 *
 * A provider is the same as an "Observable" in another language.
 */
export class MediaServerProvider extends React.Component<MediaServerProviderProps, MediaServerProviderState> {
    constructor(props: MediaServerProviderProps) {
        super(props);

        // Init state
        this.state = {
            mediaserver: null,
            changeApiKey: this.changeApiKey,
            reset: this.reset,
            refresh: this.refresh
        };
    }

    /** Recreates a new MediaServerAPIHandler with the given API key */
    public changeApiKey = async (newApiKey: string): Promise<MediaServerAPIHandler | null> => {
        // Create new server
        let server: MediaServerAPIHandler | null = new MediaServerAPIHandler(newApiKey);

        // Test a request to check if the key is valid
        const keyValid = await server.test();

        if (!keyValid) {

            // Reset handler to avoid further requests
            server = null;
            this.context.reset();

            // Disconnect from backend
            Cookies.remove('connect.sid');
        }

        this.setState(prev => ({
            ...prev,
            mediaserver: server,
        }));

        return server;
    }

    /** Resets the handler to null to prevent unwanted requests */
    public reset = (): void => {
        this.setState(prev => ({
            ...prev,
            mediaserver: null,
        }));
    }

    /** Tries to refresh the session */
    public refresh = async (history: History, currentUrl?: string): Promise<MediaServerAPIHandler | null> => {
        // Refresh session
        const result = await MediarichAPIHandler.testUser();
        let mediaserver: MediaServerAPIHandler | null = null;

        // if not connected, redirect to login
        if (result.status === UserTestResult.NotConnected) {
            history.push('/login', { next: currentUrl });
        }
        else if (result.status === UserTestResult.Connected && result.apiKey) {

            // Refresh api Key
            mediaserver = await this.changeApiKey(result.apiKey);

            if (!mediaserver) {
                history.push('/login', { next: currentUrl });
            }

        } else {
            throw new Error('Unable to refresh');
        }

        return mediaserver;
    }

    /**
     * Main method of a React component. Called each time the component needs to render.
     * @returns a tree of react elements
     */
    render(): JSX.Element {
        return <MediaServerContext.Provider
            value={this.state}>
            {this.props.children}
        </MediaServerContext.Provider>;
    }
}