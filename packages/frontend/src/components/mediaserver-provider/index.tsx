import React from 'react';
import { MediarichAPIHandler, UserTestResult } from 'utils/backend';
import MediaServerAPIHandler from 'utils/mediaserver/mediaserver-api-hanler';
import { History } from 'history';
import Cookies from 'js-cookie';

/** Context for MediaServerAPIHandler */
export const MediaServerContext = React.createContext<MediaServerProviderState | null>(null);

/** Consumer for a MediaServerAPIHandler */
export const MediaServerConsumer = MediaServerContext.Consumer;

export interface MediaServerProviderProps {
    children: JSX.Element | JSX.Element[];
}

export interface MediaServerProviderState {
    mediaserver: MediaServerAPIHandler | null;
    changeApiKey: typeof MediaServerProvider.prototype.changeApiKey;
    reset: typeof MediaServerProvider.prototype.reset;
    refresh: typeof MediaServerProvider.prototype.refresh;
    triggerRebuild: typeof MediaServerProvider.prototype.triggerRebuild;
}

/** Provider for a MediaServerAPIHandler */
export class MediaServerProvider extends React.Component<MediaServerProviderProps, MediaServerProviderState> {
    constructor(props: MediaServerProviderProps) {
        super(props);

        // Init state
        this.state = {
            mediaserver: null,
            changeApiKey: this.changeApiKey,
            reset: this.reset,
            refresh: this.refresh,
            triggerRebuild: this.triggerRebuild,
        };
    }

    /** Recreates a new MediaServerAPIHandler with the given API key */
    public changeApiKey = (newApiKey: string): MediaServerAPIHandler => {
        const server = new MediaServerAPIHandler(newApiKey);
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

    /** Triggers a rebuild with a setState */
    public triggerRebuild = (): void => {
        this.setState(prev => ({
            ...prev,
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
            mediaserver = this.changeApiKey(result.apiKey);

            // Test a request to check if the key is valid
            const keyValid = await mediaserver.test();

            if (!keyValid) {
                // If it doesn't work, reset the handler abd redirect to login
                history.push('/login', { next: currentUrl });

                // Reset handler to avoid further requests
                this.context.reset();
                mediaserver = null;

                // Disconnect from backend
                Cookies.remove('connect.sid');
            }


        } else {
            throw new Error('Unable to refresh');
        }

        return mediaserver;
    }

    render(): JSX.Element {
        return <MediaServerContext.Provider
            value={this.state}>
            {this.props.children}
        </MediaServerContext.Provider>;
    }
}