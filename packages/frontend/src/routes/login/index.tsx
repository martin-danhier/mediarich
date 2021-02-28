/**
 * @file Definition of a Login page
 * @version 1.0
 * @author Martin Danhier
 */

import './login.style.css';

import CustomTextField from 'components/text-field';
import React from 'react';
import { RouteComponentProps } from 'react-router';

import { Button, Container, Typography } from '@material-ui/core';
import { LocalizationConsumer, LocalizationContext } from 'components/localization-provider';
import LanguageSwitcher from 'components/language-switcher';



class Login extends React.Component<Partial<RouteComponentProps>> {

    static contextType = LocalizationContext;

    render(): JSX.Element {
        return (
            <>
                {/* Place the language switcher at the top right */}
                <div className="alignContent-topLeftAbsolute">
                    <LanguageSwitcher />
                </div>

                { /* Place the body at the center */}
                <LocalizationConsumer>
                    {/* Get the manager and rebuild if the language changes */}
                    {(localization): JSX.Element => {

                        // Loading strings for this component
                        const strings = localization.Login;

                        return (<Container className='centerContent' maxWidth='sm'>
                            {/* Icon */}
                            <img src={`${process.env.PUBLIC_URL}/logo.png`} alt='logo' className='Login-logo' />

                            {/* Title */}
                            <Typography className='margin-bottom' align='center'>{strings.description}</Typography>

                            {/* Username */}
                            <CustomTextField required label={strings.username} />

                            {/* Password */}
                            <CustomTextField required password label={strings.password} />

                            {/* Buttons */}
                            <div className='buttonBar'>
                                <Button variant='contained' color='primary'>{strings.login}</Button>
                                <Button
                                    variant='outlined'
                                    // Redirect to /register if clicked
                                    onClick={(): void => this.props.history?.push('/register')}
                                >{strings.register}</Button>
                            </div>
                        </Container>
                        );
                    }}
                </LocalizationConsumer>
            </>
        );
    }
}

export default Login;