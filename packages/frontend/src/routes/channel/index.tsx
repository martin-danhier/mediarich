import React from 'react';
import { Redirect, Route, RouteComponentProps, Switch } from 'react-router-dom';
import ChannelContent from './content';


class Channel extends React.Component<RouteComponentProps> {
    render(): JSX.Element {
        return (
            <Switch>
                <Route path='/channel/:slug' component={ChannelContent} />
                <Route render={(props): JSX.Element => <Redirect to='/channel/my' {...props} />} />
            </Switch>
        );
    }
}

export default Channel;