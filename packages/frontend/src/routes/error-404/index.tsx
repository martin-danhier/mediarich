import { Typography } from '@material-ui/core';
import LanguageSwitcher from 'components/language-switcher';
import { LocalizationConsumer } from 'components/localization-provider';
import React from 'react';
import { RouteComponentProps } from 'react-router';


class Error404 extends React.Component<Partial<RouteComponentProps>> {
    render(): JSX.Element {
        return <div className="centerContent">
            
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