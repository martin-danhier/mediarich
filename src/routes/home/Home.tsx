import React from 'react';

type HomeProps = {
    name: string,
    title?: string
}

class Home extends React.Component<HomeProps> {

    render() : JSX.Element {
        return <span>Bonjour {this.props.title}</span>;
    }
}

export default Home;