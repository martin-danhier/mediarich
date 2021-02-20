import React from 'react';
import './app.style.css';
import Home from 'routes/home/home';


function App(): JSX.Element {
    return (
        <div className="App">
            <header className="App-header">
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
            <Home name="Hey" />
        </div>
    );
}

export default App;
