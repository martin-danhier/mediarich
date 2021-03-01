import React from 'react';
import MediaServerAPIHandler from 'utils/mediaserver/mediaserver-api-hanler';

/** Context for MediaServerAPIHandler */
export const MediaServerContext = React.createContext<MediaServerProviderState | null>(null);

/** Consumer for a MediaServerAPIHandler */
export const mediaServerConsumer = MediaServerContext.Consumer;

export interface MediaServerProviderProps {
    children: JSX.Element | JSX.Element[];
}

export interface MediaServerProviderState {
    mediaserver: MediaServerAPIHandler | null;
    changeApiKey: typeof MediaServerProvider.prototype.changeApiKey;
}

/** Provider for a MediaServerAPIHandler */
export class MediaServerProvider extends React.Component<MediaServerProviderProps, MediaServerProviderState> {

    constructor(props: MediaServerProviderProps) {
        super(props);

        // Init state
        this.state = {
            mediaserver: null,
            changeApiKey: this.changeApiKey,
        };
    }

    /** Recreates a new MediaServerAPIHandler with the given API key */
    public changeApiKey = (newApiKey: string): MediaServerAPIHandler => {
        const server = new MediaServerAPIHandler(newApiKey);
        this.setState({
            mediaserver: server,
            changeApiKey: this.changeApiKey,
        });
        return server;
    }

    render(): JSX.Element {
        return <MediaServerContext.Provider
            value={this.state}>
            {this.props.children}
        </MediaServerContext.Provider>;
    }
}