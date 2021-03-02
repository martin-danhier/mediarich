import { Button, Typography } from '@material-ui/core';
import Scaffold from 'components/scaffold';
import React from 'react';
import { RouteComponentProps } from 'react-router';

export interface ChannelRouterProps {
    slug: string;
}

class ChannelContent extends React.Component<RouteComponentProps<ChannelRouterProps>> {
    render(): JSX.Element {
        return (
            /* App bar */
            <Scaffold
                {...this.props}
                title='Channel'
                showDrawerByDefault
                drawerMenuItems={
                    [
                        {
                            label: 'Repository',
                            url: '/channel/repository',
                            children: [
                                {
                                    label: 'Channel 1',
                                    url: '/channel/channel-1',
                                    children: [
                                        {
                                            label: 'Subchannel',
                                            url: '/channel/subchannel',
                                        }
                                    ]
                                },
                                {
                                    label: 'Channel 2',
                                    url: '/channel/channel-2',
                                }
                            ],
                        }
                    ]}
                appBarActions={
                    <Button
                        color='inherit'
                    >
                        Log out
                    </Button>
                }
            >
                <Typography>{this.props.match.params.slug}</Typography>
            </Scaffold>
        );
    }
}

export default ChannelContent;