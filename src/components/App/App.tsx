import React from 'react';
import Home from '../../routes/home/Home';
import logo from '../assets/logo.svg';
import './App.css';

function App() : JSX.Element {
    console.log('hello');
    return (
        <div className="App">
            <header className="App-header">
                <img src={logo} className="App-logo" alt="logo" />
                <p>
                    Edit <code>src/App.tsx</code> and save to reload.
                </p>
                <a
                    className="App-link"
                    href="https://reactjs.org"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    Learn React
                </a>
            </header>
            <Home name="" />
        </div>
    );
}

export default App;
