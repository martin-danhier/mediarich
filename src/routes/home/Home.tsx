import React from 'react';
import * as assert from 'assert';

interface HomeProps {
    name: string;
    title?: string;
}

class Home extends React.Component<HomeProps> {    
    render(): JSX.Element {
        if (false) {
            console.log('zalut');
        }
        return <span>Bonjour {this.props.title}</span>;
    }
}

export default Home;