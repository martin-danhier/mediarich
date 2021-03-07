/**
 * @file Definition of an Error404 component
 * @version 1.0
 * @author Martin Danhier
 */

import { Typography } from '@material-ui/core';
import LanguageSwitcher from 'components/language-switcher';
import { LocalizationConsumer } from 'components/localization-provider';
import React from 'react';
import { RouteComponentProps } from 'react-router';

/** Error 404 page */
class Error404 extends React.Component<Partial<RouteComponentProps>> {
    /**
     * Main method of a React component. Called each time the component needs to render.
     * @returns a tree of react elements
     */
    render(): JSX.Element {
        return <div className="alignContent-center">

            <LanguageSwitcher alignTopRight />

            <LocalizationConsumer>
                {(localization): JSX.Element => {

                    const strings = localization.Error404;

                    return (<>
                        <Typography variant="h2">{strings.error404}</Typography>
                        <Typography variant="h5">{strings.pageNotFound}</Typography>
                    </>);
                }}
            </LocalizationConsumer>
        </div>;
    }
}

export default Error404;