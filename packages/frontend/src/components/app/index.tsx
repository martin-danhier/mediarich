/**
 * @file Definition of the App component
 * @version 1.0
 * @author Martin Danhier
 */

import LazyRoute from 'components/lazy-route';
import React from 'react';
import { BrowserRouter, Switch } from 'react-router-dom';
import { createMuiTheme, CssBaseline, ThemeProvider } from '@material-ui/core';
import { LocalizationProvider } from 'components/localization-provider';
import { AvailableLanguage, availableLocalisations } from 'components/localization-provider/types';
import Cookies from 'js-cookie';
import { MediaServerProvider } from 'components/mediaserver-provider';

// Import pages in a lazy mode for code splitting
// Code splitting = only download the code of the page you are visiting
const Home = React.lazy(() => import('routes/home'));
const Login = React.lazy(() => import('routes/login'));
const Register = React.lazy(() => import('routes/register'));
const Error404 = React.lazy(() => import('routes/error-404'));

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
                                {/* Fallback to error 404 when nothing else found */}
                                <LazyRoute render={(p): JSX.Element => <Error404 {...p} />} />
                            </Switch>
                        </BrowserRouter>
                    </LocalizationProvider>
                </MediaServerProvider>
            </ThemeProvider>
        );
    }
}

export default App;
