import React from 'react';
import { RouteComponentProps } from 'react-router-dom';
import * as assert from 'utils/assert';

interface HomeProps extends Partial<RouteComponentProps> {
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
