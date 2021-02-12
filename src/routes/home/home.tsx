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

    render(): JSX.Element {
        assert.strictEqual(this.props.name, 'Hey');
        return <span> Bonjour {this.props.title}</span>;
    }
}

export default Home;
