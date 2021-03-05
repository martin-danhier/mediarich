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
        loading: string;
    };
    Auth: {
        username: string;
        password: string;
        newPassword: string;
        repeatPassword: string;
        login: string;
        logout: string;
        backToLogin: string;
        register: string;
        description: string;
        apiKey: string;
        apiKeyTutorial: {
            title: string;
            info: string;
            warning: string;
            steps: string[];
        };
        errors: {
            pwdMustMatch: string;
            usernameTaken: string;
            invalidApiKey: string;
            wrongCredentials: string;
            unknownError: string;
            apiKeyNoLongerValid: string;
        };
    };
    Error404: {
        error404: string;
        pageNotFound: string;
    };
    Form: {
        required: string;
    };
    Channel: {
        channel: string;
        channels: string;
        subchannels: string;
        video: string;
        videos: string;
        noRows: string;
        error: string;
        refresh: string;
        actionsNames: {
            delete: string;
            publish: string;
            edit: string;
            move: string;
            visit: string;
            add: string;
        };
        fieldsNames: {
            title: string;
            public: string;
            addDate: string;
            description: string;
            views: string;
            thumbnail: string;
            duration: string;
        };
        dialogs: {
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

export type AvailableLanguage = keyof typeof availableLocalisations;