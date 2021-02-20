# Mediarich

![Tests](https://github.com/martin-danhier/mediarich/workflows/Tests/badge.svg)

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

Since the configuration of these extensions can be cumbersome, the .vscode directory is included in this repository, that way the editor is optimized for the IDE as soon as the repo is cloned.

## Run in debug mode

1. Simply run ``npm start``.
2. The website will be accessible from [http://localhost:3000/](http://localhost:3000/) .

## Build for production

1. Run ``npm run build``
2. Use the ``build`` directory in production

Optional: use a node server

1. ``npm install -g serve``
2. ``serve -s build``

## Test

- Run ``npm test`` to launch test watcher
- Alternatively, tests can be launched with the Test Explorer extension
- Tests automatically run at every commit
- Run ``npm run coverage`` to collect coverage from the code (readable from Coverage Gutters extension)
