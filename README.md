# Mediarich

> Enhanced media management platform for medias.unamur.be

## Installing

### Setting up the repository

1. Install ``nodejs`` and ``npm``. The latest version is preferred.
2. Clone the repository
3. Run ``npm install``

### For Visual Studio Code : useful extensions

You can install these extensions for an optimal IDE:

- [Coverage Gutters](https://marketplace.visualstudio.com/items?itemName=ryanluker.vscode-coverage-gutters): display the coverage data next to the code.
- [Debugger for Chrome](https://marketplace.visualstudio.com/items?itemName=msjsdiag.debugger-for-chrome): allows to link VSCode to Google Chrome for debugging
- [ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint): Lint Javascript and Typescript
- [Jest Test Explorer](https://marketplace.visualstudio.com/items?itemName=kavod-io.vscode-jest-test-adapter): Run tests from the editor
- [Test Explorer UI](https://marketplace.visualstudio.com/items?itemName=hbenl.vscode-test-explorer): Required to make Jest Test Explorer work
- [Visual Studio IntelliCode](https://marketplace.visualstudio.com/items?itemName=VisualStudioExptTeam.vscodeintellicode): Use AI to assist development

## Run in debug mode

1. Simply run ``npm start``.
2. The website will be accessible from http://localhost:3000/ .

## Build for production

1. Run ``npm run build``
2. Use the ``build`` directory in production

Optional: use a node server

1. ``npm install -g serve``
2. ``serve -s build``