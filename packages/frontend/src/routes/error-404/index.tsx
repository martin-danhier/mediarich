import { Typography } from '@material-ui/core';
import React from 'react';
import { RouteComponentProps } from 'react-router';


class Error404 extends React.Component<Partial<RouteComponentProps>> {
    render(): JSX.Element {
        return <div className="centerContent">
            <Typography variant="h2">Erreur 404</Typography>
            <Typography variant="h5">La page que vous essayez d&apos;atteindre n&apos;a pas été trouvée.</Typography>
        </div>;
    }
}

export default Error404;