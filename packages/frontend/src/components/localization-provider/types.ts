/** Interface typing the localization jsons.
 * Each component stores its string in an object stored by the name of the component.
 * Each object then defines a series of strings.
 */
export interface Localization {
    /** Name of the language
     * @example 'fr', 'en'
     */
    name: string;

    // Component-specific strings:
    LoadingScreen: {
        /** Loading text */
        loading: string;
    };
    Auth: {
        /* Description text of Mediarich */
        description: string;
        /** fields name */
        fieldsNames: {
            username: string;
            password: string;
            newPassword: string;
            repeatPassword: string;
            apiKey: string;
        };
        /** Buttons names */
        buttonsNames: {
            login: string;
            logout: string;
            backToLogin: string;
            register: string;
        };
        /** Strings of the api key tutorial */
        apiKeyTutorial: {
            title: string;
            info: string;
            warning: string;
            steps: string[];
        };
        /** Auth error messages */
        errors: {
            pwdMustMatch: string;
            usernameTaken: string;
            invalidApiKey: string;
            wrongCredentials: string;
            unknownError: string;
            apiKeyNoLongerValid: string;
        };
    };
    /** Strings of the Error404 page */
    Error404: {
        error404: string;
        pageNotFound: string;
    };
    /** Strings of the Form component */
    Form: {
        required: string;
    };
    /** Strings of the Channel component */
    Channel: {
        channel: string;
        channels: string;
        subchannels: string;
        video: string;
        videos: string;
        error: string;
        /** No rows in the table message */
        noRows: string;
        /** Unknown error message */
        myChannel: string;
        /** Name of the actions */
        actionsNames: {
            refresh: string;
            delete: string;
            publish: string;
            edit: string;
            move: string;
            visit: string;
            add: string;
        };
        /** Names of the fields */
        fieldsNames: {
            title: string;
            public: string;
            addDate: string;
            description: string;
            views: string;
            thumbnail: string;
            duration: string;
        };
        /** Dialog related strings */
        dialogs: {
            omittedFields: string;
            areYouSure: string;
            cancel: string;
            thisIsIrreversible: string;
            publishInfoPlural: string;
            publishInfoSingular: string;
            editDialogTitleSingular: string;
            editDialogTitlePlural: string;
            dragNewThumbnailImage: string;
            addChannelTitle: string;
            addVideoTitle: string;
            addChannelUnlistedWarning: string;
            noOptions: string;
            dragNewVideo: string;
            uploadComplete: string;
            uploadInProgress: string;
        };
    };
    LanguageSwitcher: {
        tooltip: string;
    };
}

/** Import functions of each supported localization.
 * The import is done lazily, and webpack will create a separate chunk per localization.
*/
export const availableLocalisations = {
    en: async (): Promise<Localization> => await import(/* webpackChunkName: "LangEN" */ 'localization/en.json'),
    fr: async (): Promise<Localization> => await import(/* webpackChunkName: "LangFR" */ 'localization/fr.json'),
};

// Helper types

/**
 * Set of keys in availableLocalisations.
 * Any invalid language will then return a type error at compile time
 */
export type AvailableLanguage = keyof typeof availableLocalisations;