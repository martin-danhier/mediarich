/**
 * @file Definition of a LoadingScreen component
 * @version 1.0
 * @author Martin Danhier
 */

import React from 'react';
import { CircularProgress, Snackbar, Typography } from '@material-ui/core';
import { Alert } from '@material-ui/lab';
import { LocalizationConsumer } from 'components/localization-provider';

/** Parameters of a LoadingScreen component */
interface LoadingScreenProps {
    /** If a non-empty string is passed, an error will be displayed with that message */
    errorMessage?: string;
    hideText?: boolean;
}

/** Loading screen. Used when another component is loading and not ready to be displayed yet. */
class LoadingScreen extends React.Component<LoadingScreenProps>{
    render(): JSX.Element {
        return (
            <div className='alignContent-center'>
                {/* Hide the text when not needed */}
                {!this.props.hideText &&
                    /* Loading screen */
                    <LocalizationConsumer >
                        {(localization): JSX.Element => {
                            return <Typography variant="h5" className="padding-bottom">{localization.LoadingScreen.loading}</Typography>;
                        }}
                    </LocalizationConsumer>
                }
                <CircularProgress />

                {/* Snackbar containing given error message */}
                <Snackbar
                    /* Show the snackbar if there is a message to show */
                    open={this.props.errorMessage !== undefined && this.props.errorMessage !== ''}
                    /* Put the snackbar at the top center of the viewport */
                    anchorOrigin={{
                        horizontal: 'center',
                        vertical: 'top',
                    }}
                >
                    {/* Use an alert as a beautiful way to show the error */}
                    <Alert
                        variant='filled'
                        elevation={6}
                        severity='error'
                    >
                        {this.props.errorMessage}
                    </Alert>
                </Snackbar>
            </div >
        );
    }
}

export default LoadingScreen;