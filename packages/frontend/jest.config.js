module.exports = {
    displayName: "frontend",
    roots: [
        "<rootDir>/src"
    ],
    collectCoverageFrom: [
        "<rootDir>/src/**/*.{js,jsx,ts,tsx}",
        "<rootDir>/!src/**/*.d.ts"
    ],
    setupFiles: [
        "react-app-polyfill/jsdom"
    ],
    setupFilesAfterEnv: [
        "<rootDir>/src/setupTests.ts"
    ],
    testMatch: [
        "<rootDir>/src/**/__tests__/**/*.{js,jsx,ts,tsx}",
        "<rootDir>/src/**/*.{spec,test}.{js,jsx,ts,tsx}"
    ],
    testEnvironment: "jest-environment-jsdom-fourteen",
    transform: {
        "^.+\\.(js|jsx|ts|tsx)$": "ts-jest",
        "^.+\\.css$": "<rootDir>/config/jest/cssTransform.js",
        "^(?!.*\\.(js|jsx|ts|tsx|css|json)$)": "<rootDir>/config/jest/fileTransform.js"
    },
    transformIgnorePatterns: [
        "[/\\\\]node_modules[/\\\\].+\\.(js|jsx|ts|tsx)$",
        "^.+\\.module\\.(css|sass|scss)$"
    ],
    moduleNameMapper: {
        "^react-native$": "react-native-web",
        "^.+\\.module\\.(css|sass|scss)$": "identity-obj-proxy"
    },
    moduleFileExtensions: [
        "web.js",
        "js",
        "web.ts",
        "d.ts",
        "ts",
        "web.tsx",
        "tsx",
        "json",
        "web.jsx",
        "jsx",
        "node"
    ],
    modulePaths: [
        "<rootDir>/src"
    ],
    watchPlugins: [
        "jest-watch-typeahead/filename",
        "jest-watch-typeahead/testname"
    ]
}