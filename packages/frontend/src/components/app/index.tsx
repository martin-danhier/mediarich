/**
 * @file Definition of the App component
 * @version 1.0
 * @author Martin Danhier
 */

import LazyRoute from 'components/lazy-route';
import React from 'react';
import { BrowserRouter, Route, Switch } from 'react-router-dom';
import { unstable_createMuiStrictModeTheme as createMuiTheme, CssBaseline, ThemeProvider } from '@material-ui/core';
import { LocalizationProvider } from 'components/localization-provider';
import { AvailableLanguage, availableLocalisations } from 'components/localization-provider/types';
import Cookies from 'js-cookie';
import { MediaServerProvider } from 'components/mediaserver-provider';
import Error404 from 'routes/error-404';

// Import pages in a lazy mode for code splitting
// Code splitting = only download the code of the page you are visiting
const Home = React.lazy(() => import('routes/home'));
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

                <MediaServerProvider>
                    {/* Give the localization manager to the provider */}
                    <LocalizationProvider
                        defaultLanguage={defaultLanguage as AvailableLanguage}
                    >
                        {/* Main router of the app */}
                        <BrowserRouter>
                            <Switch>
                                {/* Home page */}
                                <LazyRoute exact path='/' render={(p): JSX.Element => <Home name='Hey' {...p} />} />
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
