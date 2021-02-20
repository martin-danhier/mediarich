import Cookies from 'js-cookie';
import React from 'react';
import * as assert from 'utils/assert/assert';
import MSChannel from 'utils/mediaserver/classes/channel';
import MediaServerAPIHandler from 'utils/mediaserver/mediaserver-api-hanler';

interface HomeProps {
    name: string;
    title?: string;
}

class Home extends React.Component<HomeProps> {

    // async componentDidMount() {
    //     const ms = new MediaServerAPIHandler('psZs7-gW978-SmRw6-36rvJ-NWJ94');

    //     const channels = await ms.channels();
    //     if (channels) {
    //         let myChannel;
    //         for (const channel of channels) {
    //             if (await channel.title === 'Test sous-chaine') {
    //                 myChannel = channel;
    //             }
    //         }

    //         if (myChannel) {
    //             myChannel.edit({
    //                 title: 'Test sous-chaine modifié'
    //             });
    //         }
    //     }
    // }

    render(): JSX.Element {
        assert.strictEqual(this.props.name, 'Hey');
        return <span> Bonjour {this.props.title}</span>;
    }
}

export default Home;
