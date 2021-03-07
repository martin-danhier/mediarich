/**
 * @file Main file of the app, starts the React application
 * @version 1.0
 * @author Martin Danhier
 * @license Apache
*/

import './global.style.css';

import React from 'react';
import ReactDOM from 'react-dom';

import App from './components/app';
import * as serviceWorker from './utils/service-worker';

ReactDOM.render(
    <React.StrictMode>
        <App />
    </React.StrictMode>

    , document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
