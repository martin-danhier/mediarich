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
import { LocalizationConsumer } from 'components/localization-provider';
import LanguageSwitcher from 'components/language-switcher';
import Form, { FormErrors, SubmitValidationCallbackResult } from 'components/form';
import { MediarichAPIHandler, UserLoginResult } from 'utils/backend';
import { MediaServerContext } from 'components/mediaserver-provider';
import assert from 'assert';



class Login extends React.Component<Partial<RouteComponentProps>> {

    // Link to mediaserver context to be able to login with the api key
    context!: React.ContextType<typeof MediaServerContext>;
    static contextType = MediaServerContext;

    render(): JSX.Element {
        return (
            <>
                {/* Place the language switcher at the top right */}
                <LanguageSwitcher alignTopRight />

                { /* Place the body at the center */}
                <LocalizationConsumer>
                    {/* Get the manager and rebuild if the language changes */}
                    {(localization): JSX.Element => {

                        // Loading strings for this component
                        const strings = localization.Auth;

                        return (<Container className='alignContent-center' maxWidth='sm'>

                            {/* Icon */}
                            <img src={`${process.env.PUBLIC_URL}/logo.png`} alt='logo' className='Login-logo' />

                            {/* Title */}
                            <Typography className='margin-bottom' align='center'>{strings.description}</Typography>

                            <Form
                                initialState={{
                                    password: '',
                                    username: '',
                                }}
                                validateSubmit={async (credentials): Promise<SubmitValidationCallbackResult<typeof credentials>> => {
                                    // Result
                                    const result = {
                                        ok: true,
                                        errors: {} as FormErrors<typeof credentials>,
                                    };

                                    // Log in
                                    const loginResult = await MediarichAPIHandler.loginUser(credentials);

                                    // Wrong credentials
                                    if (loginResult.status === UserLoginResult.Unauthorized) {
                                        result.ok = false;
                                        result.errors.password = strings.errors.wrongCredentials;
                                    }
                                    // Unknown error
                                    else if (loginResult.status === UserLoginResult.Error) {
                                        result.ok = false;
                                        result.errors.password = strings.errors.unknownError;
                                    }
                                    // It worked
                                    else if (loginResult.apiKey) {
                                        // If it worked, we need to recreate the Mediaserver API handler with the API key
                                        assert.ok(this.context !== null, 'There should be a MediaServerProvider in the tree.');
                                        const mediaserver = this.context.changeApiKey(loginResult.apiKey);
                                        const callResult = await mediaserver.myChannel();
                                        if (callResult === null) {
                                            result.ok = false;
                                            result.errors.password = strings.errors.apiKeyNoLongerValid;
                                        }
                                    }
                                    // Server didn't return the api key for some reason
                                    else {
                                        console.error('The server did not return an api key despite the login being correct.');
                                        result.ok = false;
                                        result.errors.password = strings.errors.unknownError;
                                    }
                                    return result;
                                }}
                            >
                                {/* Username */}
                                <CustomTextField required name='username' label={strings.username} />

                                {/* Password */}
                                <CustomTextField required name='password' password label={strings.password} />

                                {/* Buttons */}
                                <div className='buttonBar'>
                                    <Button variant='contained' type='submit' color='primary'>{strings.login}</Button>
                                    <Button
                                        variant='outlined'
                                        // Redirect to /register if clicked
                                        onClick={(): void => this.props.history?.push('/register')}
                                    >{strings.register}</Button>
                                </div>
                            </Form>
                        </Container>
                        );
                    }}
                </LocalizationConsumer>
            </>
        );
    }
}

export default Login;