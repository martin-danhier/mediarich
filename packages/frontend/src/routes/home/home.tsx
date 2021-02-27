import React from 'react';
import * as assert from 'utils/assert/assert';
import MediaServerAPIHandler from 'utils/mediaserver/mediaserver-api-hanler';
import { findAsync } from 'utils/useful-functions';

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
