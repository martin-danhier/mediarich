import { MediaServerConsumer } from 'components/mediaserver-provider';
import assert from 'utils/assert';
import React from 'react';
import { Redirect, Route, RouteComponentProps, Switch } from 'react-router-dom';
import ChannelScaffold from './scaffold';
import { LocalizationConsumer } from 'components/localization-provider';


class Channel extends React.Component<RouteComponentProps> {
    render(): JSX.Element {
        return (
            <Switch>
                <Route path='/channel/:slug' render={(props): JSX.Element => <LocalizationConsumer>
                    {/* Localization consumer (to get the localization) */}
                    {(localization): JSX.Element => <MediaServerConsumer>
                        {/* Mediaserver consumer (to get the API) */}
                        {(state): JSX.Element => {
                            assert(state !== null, 'There should be a MediaServerProvider in the tree.');
                            return <ChannelScaffold {...props} mediaServerContext={state} localization={localization}/>;
                        }}
                    </MediaServerConsumer>}
                </LocalizationConsumer>}
                />
                <Route render={(props): JSX.Element => <Redirect to='/channel/my' {...props} />} />
            </Switch>
        );
    }
}

export default Channel;