![](packages/frontend/public/logo.png)

> Enhanced media management platform for medias.unamur.be

## Installing for development

1. Install `node` and `npm`. The latest version is preferred.
2. Clone this repository
3. Run `npm install`.

If there is a permission error during this action, try executing `npm install` as an administrator.

## Run in debug mode

1. Open 2 terminal windows
2. Launch the backend: `npm run backend`
3. Launch the frontend: `npm run frontend`

## Build for production

TODO

## For Visual Studio Code : useful extensions

You can install these extensions for an optimal IDE:

- [Coverage Gutters](https://marketplace.visualstudio.com/items?itemName=ryanluker.vscode-coverage-gutters): display the coverage data next to the code.
- [Debugger for Chrome](https://marketplace.visualstudio.com/items?itemName=msjsdiag.debugger-for-chrome): allows to link VSCode to Google Chrome for debugging
- [ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint): Lint Javascript and Typescript
- [Jest Test Explorer](https://marketplace.visualstudio.com/items?itemName=kavod-io.vscode-jest-test-adapter): Run tests from the editor
- [Test Explorer UI](https://marketplace.visualstudio.com/items?itemName=hbenl.vscode-test-explorer): Required to make Jest Test Explorer work
- [Visual Studio IntelliCode](https://marketplace.visualstudio.com/items?itemName=VisualStudioExptTeam.vscodeintellicode): Use AI to assist development

Since the configuration of these extensions can be cumbersome, the .vscode directory is included in this repository, that way the editor is optimized for the IDE as soon as the repo is cloned.