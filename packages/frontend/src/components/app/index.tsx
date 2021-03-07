/**
 * @file Definition of the App component
 * @version 1.0
 * @author Martin Danhier
 * @license Apache
*/

import LazyRoute from 'components/lazy-route';
import { LocalizationProvider } from 'components/localization-provider';
import { AvailableLanguage, availableLocalisations } from 'components/localization-provider/types';
import { MediaServerProvider } from 'components/mediaserver-provider';
import Cookies from 'js-cookie';
import React from 'react';
import { BrowserRouter, Redirect, Route, Switch } from 'react-router-dom';
import Error404 from 'routes/error-404';

import {
    CssBaseline, ThemeProvider, unstable_createMuiStrictModeTheme as createMuiTheme
} from '@material-ui/core';

// Import pages in a lazy mode for code splitting
// Code splitting = only download the code of the page you are visiting
const Login = React.lazy(() => import('routes/login'));
const Register = React.lazy(() => import('routes/register'));
const Channel = React.lazy(() => import('routes/channel'));

// Define theme
const theme = createMuiTheme({
    // Color palette
    palette: {
        primary: {
            main: '#4CAF50',
            light: '#C8E6C9',
            dark: '#388E3C',
            contrastText: '#FFFFFF'
        },
        secondary: {
            main: '#8BC34A'
        },
        text: {
            primary: '#212121',
            secondary: '#757575',
        },
        divider: '#BDBDBD'
    },
    typography: {
        // Tell Material UI that we applied the 10px fix
        // (see global.style.css for details)
        htmlFontSize: 10,
    },
    overrides: {
        MuiToolbar: {
            // Make all toolbars use the size stored in a css variable so that when we
            // use that variable in the css, it matches the height of the toolbars
            regular: {
                '@media (min-width: 0px) and (orientation: landscape)': {
                    minHeight: 'var(--MuiToolbar-regular-minHeight)',
                },
                '@media (min-width: 600px)': {
                    minHeight: 'var(--MuiToolbar-regular-minHeight)',
                },
                minHeight: 'var(--MuiToolbar-regular-minHeight)',
            }
        }
    }
});

/**
 * The App, main component of the application. It manages the theme and the routing/code splitting.
 */
class App extends React.Component {


    /**
     * Main method of a React component. Called each time the component needs to render.
     * @returns a tree of react elements
     */
    render(): JSX.Element {
        // Get preferred language from cookie
        let defaultLanguage = Cookies.get('lang');
        // If it is undefined or invalid, set it to french
        if (!defaultLanguage || !Object.keys(availableLocalisations).includes(defaultLanguage)) {
            defaultLanguage = 'fr';
        }

        return (
            /* Give the theme to MaterialUi */
            <ThemeProvider
                theme={theme}>

                {/* Apply common CSS fixes for modern apps */}
                <CssBaseline />

                {/* Create a mediaserver provider that will be use to access the mediaserver API in the tree */}
                <MediaServerProvider>
                    {/* Give the localization manager to the provider */}
                    <LocalizationProvider
                        defaultLanguage={defaultLanguage as AvailableLanguage}
                    >
                        {/* Main router of the app */}
                        <BrowserRouter>
                            <Switch>
                                {/* Home page: redirect to login */}
                                <LazyRoute exact path='/' render={(p): JSX.Element => <Redirect to='/login' {...p} />} />
                                {/* Register page */}
                                <LazyRoute exact path='/register' render={(p): JSX.Element => <Register {...p} />} />
                                {/* Login page */}
                                <LazyRoute exact path='/login' render={(p): JSX.Element => <Login {...p} />} />
                                {/* Channel page */}
                                <LazyRoute path='/channel' render={(p): JSX.Element => <Channel {...p} />} />
                                {/* Fallback to error 404 when nothing else found */}
                                <Route component={Error404} />
                            </Switch>
                        </BrowserRouter>
                    </LocalizationProvider>
                </MediaServerProvider>
            </ThemeProvider>
        );
    }
}

export default App;
