/**
 * @file Definition of a Register page
 * @version 1.0
 * @author Martin Danhier
 */

import './register.style.css';

import Form, { FormErrors, SubmitValidationCallbackResult } from 'components/form';
import LanguageSwitcher from 'components/language-switcher';
import { LocalizationConsumer } from 'components/localization-provider';
import { MediaServerContext } from 'components/mediaserver-provider';
import CustomTextField from 'components/text-field';
import React from 'react';
import { RouteComponentProps } from 'react-router';
import assert from 'utils/assert';
import { MediarichAPIHandler, UserAddResult } from 'utils/backend';

import { Button, Container, Link, Typography } from '@material-ui/core';

/** Register page */
class Register extends React.Component<RouteComponentProps> {

    // Link to mediaserver context to be able to login with the api key
    context!: React.ContextType<typeof MediaServerContext>;
    static contextType = MediaServerContext;

    /**
     * Main method of a React component. Called each time the component needs to render.
     * @returns a tree of react elements
     */
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

                        return (<Container className='alignContent-center padding-vertical' maxWidth='sm'>
                            {/* Title */}
                            <Typography variant="h4" className='margin-bottom' align='center'>{strings.buttonsNames.register}</Typography>


                            <Form
                                {...this.props}

                                // Init the fields
                                initialState={{
                                    username: '',
                                    password: '',
                                    confirmPassword: '',
                                    apiKey: '',
                                }}
                                // Validate the fields
                                validateSubmit={async (values): Promise<SubmitValidationCallbackResult<typeof values>> => {
                                    const result = {
                                        ok: true,
                                        errors: {} as FormErrors<typeof values>,
                                    };

                                    // Passwords must be the same
                                    if (values.password !== values.confirmPassword) {
                                        result.ok = false;
                                        result.errors.confirmPassword = strings.errors.pwdMustMatch;
                                    }
                                    // If the API Key is not 29 characters long
                                    if (values.apiKey.length > 0 && values.apiKey.length !== 29) {
                                        result.ok = false;
                                        result.errors.apiKey = strings.errors.invalidApiKey;
                                    }
                                    // Check the API Key on the MediaServer if there is no other error
                                    else if (result.ok) {
                                        assert(this.context !== null, 'MediaServerProvider should be in the tree.');

                                        // Try to change the api key
                                        const mediaserver = await this.context.changeApiKey(values.apiKey);

                                        if (!mediaserver) {
                                            // if it throws, then the api key is not valid
                                            result.ok = false;
                                            result.errors.apiKey = strings.errors.invalidApiKey;
                                        }

                                    }

                                    // If everything is still good at this point, try to add the user
                                    if (result.ok) {
                                        const addResult = await MediarichAPIHandler.addUser({
                                            username: values.username,
                                            password: values.password,
                                            apiKey: values.apiKey,
                                        });
                                        // Conflict: username already taken
                                        if (addResult === UserAddResult.Conflict) {
                                            result.ok = false;
                                            result.errors.username = strings.errors.usernameTaken;
                                        }
                                        // Error: an unknown error occured
                                        else if (addResult === UserAddResult.Error) {
                                            result.ok = false;
                                            result.errors.username = strings.errors.unknownError;
                                        }
                                    }

                                    return result;
                                }}
                                onSubmit={async (): Promise<string> => {
                                    return '/channel/my';
                                }}
                            >
                                {/* Username */}
                                <CustomTextField autoComplete='off' required name='username' label={strings.fieldsNames.username} />

                                {/* Password */}
                                <CustomTextField required name='password' password label={strings.fieldsNames.newPassword} />

                                {/* Repeat Password */}
                                <CustomTextField required name='confirmPassword' password label={strings.fieldsNames.repeatPassword} />

                                {/* Api Key */}
                                <CustomTextField autoComplete='off' required name='apiKey' label={strings.fieldsNames.apiKey} />

                                {/* Tutorial */}
                                <div className="Register-apiKeyTutorial">
                                    {/* Title */}
                                    <Typography variant="h6" className="margin-bottom">{strings.apiKeyTutorial.title}</Typography>
                                    {/* Info */}
                                    <Typography align="justify">{strings.apiKeyTutorial.info}</Typography>
                                    {/* Steps */}
                                    <ol>
                                        {strings.apiKeyTutorial.steps.map((step, i) => {
                                            // Use a regex to parse the link syntax
                                            const match = /^(?<start>[^{}]*)(?:{(?<link>[^{}]+)})?(?<end>[^{}]*)$/.exec(step);

                                            // Assertions on the result
                                            assert(match !== null, 'The regex should match, or the localization is invalid');
                                            assert(match.groups !== undefined, 'The regex should always return groups');

                                            return <Typography key={i}>
                                                <li>
                                                    {match.groups.start}
                                                    {/* If a link was found, display it*/}
                                                    {match.groups.link && <>
                                                        <Link
                                                            target='_blank' // Open in new tab
                                                            href={`${process.env.REACT_APP_MEDIASERVER_API_ROOT}/authentication/account-settings/`}
                                                        >
                                                            {match.groups.link}
                                                        </Link>
                                                        {match?.groups.end}
                                                    </>}
                                                </li>
                                            </Typography>;

                                        })}
                                    </ol>
                                    {/* Warning */}
                                    <Typography align="justify">{strings.apiKeyTutorial.warning}</Typography>
                                </div>

                                {/* Buttons */}
                                <div className='buttonBar'>
                                    <Button
                                        type='submit'
                                        variant='contained'
                                        color='primary'
                                    >
                                        {strings.buttonsNames.register}
                                    </Button>
                                    <Button
                                        variant='outlined'
                                        onClick={(): void => this.props.history?.push('/login')}
                                    >
                                        {strings.buttonsNames.backToLogin}
                                    </Button>
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

export default Register;