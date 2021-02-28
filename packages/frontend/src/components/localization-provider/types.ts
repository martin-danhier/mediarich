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
    Login: {
        username: string;
        password: string;
        login: string;
        register: string;
        description: string;
    };
    Error404: {
        error404: string;
        pageNotFound: string;
    };
}

/** Import functions of each supported localization.
 * The import is done lazily, and webpack will create a separate chunk per localization.
*/
export const availableLocalisations = {
    en: async (): Promise<Localization> => await import(/* webpackChunkName: "LocalizationEN" */ 'localization/en.json'),
    fr: async (): Promise<Localization> => await import(/* webpackChunkName: "LocalizationFR" */ 'localization/fr.json'),
};

// Helper types

export type AvailableLanguage = keyof typeof availableLocalisations;