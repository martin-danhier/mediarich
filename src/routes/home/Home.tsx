import React from 'react';
import * as assert from 'utils/assert';

interface HomeProps {
    name: string;
    title?: string;
}


class Home extends React.Component<HomeProps> {

    render(): JSX.Element {
        assert.strictEqual(this.props.name, 'Bonjour');
        return <span>Bonjour {this.props.title}</span>;
    }
}

export default Home;