/**
 * @file Definition of an Channel component
 * @version 1.0
 * @author Martin Danhier
 */

import { LocalizationConsumer } from 'components/localization-provider';
import { MediaServerConsumer } from 'components/mediaserver-provider';
import React from 'react';
import { Redirect, Route, RouteComponentProps, Switch } from 'react-router-dom';
import assert from 'utils/assert';

import ChannelScaffold from './scaffold';

/** Channel page, main page of the app */
class Channel extends React.Component<RouteComponentProps> {
    /**
     * Main method of a React component. Called each time the component needs to render.
     * @returns a tree of react elements
     */
    render(): JSX.Element {
        return (
            <Switch>
                {/* The url format is /channel/:slug where :slug is the mediaserver slug associated
                    with the channel. */}
                <Route path='/channel/:slug' render={(props): JSX.Element => <LocalizationConsumer>
                    {/* Localization consumer (to get the localization) */}
                    {(localization): JSX.Element => <MediaServerConsumer>
                        {/* Mediaserver consumer (to get the API) */}
                        {(state): JSX.Element => {
                            assert(state !== null, 'There should be a MediaServerProvider in the tree.');
                            return <ChannelScaffold {...props} mediaServerContext={state} localization={localization} />;
                        }}
                    </MediaServerConsumer>}
                </LocalizationConsumer>}
                />
                {/* If another route is passed, redirect to /channel/my which is the channel of the user */}
                <Route render={(props): JSX.Element => <Redirect to='/channel/my' {...props} />} />
            </Switch>
        );
    }
}

export default Channel;