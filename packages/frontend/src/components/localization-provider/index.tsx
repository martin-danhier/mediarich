import LoadingScreen from 'components/loading-screen';
import React from 'react';

import { AvailableLanguage, availableLocalisations, Localization } from './types';

/** Context for Localization State */
export const LocalizationContext = React.createContext<LocalizationProviderState | undefined>(undefined);


// ======== LOCALIZATION PROVIDER ========

/** Props of a LocalizationProvider */
interface LocalizationProviderProps {
    /** The language that will be fetched by default. */
    defaultLanguage: AvailableLanguage;
}

/** State of a LocalizationProvider */
interface LocalizationProviderState {
    /** All localized strings of the current language */
    strings?: Localization;
    // Include functions so consumer can easily change the language

    /** Changes the current language. */
    selectLanguage: typeof LocalizationProvider.prototype.selectLanguage;
}

/** Provides a Localization so that it can easily be consumed by a LocalizationConsumer
 * somewhere in the subtree.
 *
 * In other languages, this pattern is called "Observable"/"Observer"
 */
export class LocalizationProvider extends React.Component<LocalizationProviderProps, LocalizationProviderState> {
    constructor(props: LocalizationProviderProps) {
        super(props);

        // Init state
        this.state = {
            strings: undefined,
            // Include functions so consumer can easily change the language
            selectLanguage: this.selectLanguage,
        };
    }

    /** When the component mounts (is rendered for the first time) */
    componentDidMount(): void {
        // Trigger update of language
        this.selectLanguage(this.props.defaultLanguage);
    }


    /** Lazily load the requested language file
     * @param language the language to load
    */
    public selectLanguage = async (language: AvailableLanguage): Promise<void> => {
        try {
            // We don't need to assert that language exists in availableLocalisations,
            // because "AvailableLanguage" is defined as "the set of the keys of availableLocalisations"
            // So an invalid key will return a type error and won't be allowed by TypeScript
            const json = await availableLocalisations[language]();

            // Use setstate so a new object is created and listeners are called
            this.setState((previousState) => ({
                strings: json,
                selectLanguage: previousState.selectLanguage,
            }));
        }
        catch (e) {
            // Even if language exists in availableLocalisations, the import statement
            // might fail. For example, the request to fetch the localization file could timeout
            throw new Error(`Localization not found: "${language}"`);
        }
    }

    /**
     * Main method of a React component. Called each time the component needs to render.
     * @returns a tree of react elements
     */
    render(): JSX.Element {
        if (this.state.strings === undefined) {
            // Load when undefined
            return <LoadingScreen hideText />;
        }
        else {
            // Use a provider when defined
            return (
                <LocalizationContext.Provider value={this.state}>
                    {this.props.children}
                </LocalizationContext.Provider>
            );
        }
    }
}

// ======== LOCALIZATION CONSUMER ========

/** Props of a LocalizationConsumer component */
interface LocalizationConsumerProps {
    children: (localization: Localization) => JSX.Element;
}

/** Listens to a LocalizationProvider for changes and rebuild each time a change is detected. */
export class LocalizationConsumer extends React.Component<LocalizationConsumerProps> {
    /**
     * Main method of a React component. Called each time the component needs to render.
     * @returns a tree of react elements
     */
    render(): JSX.Element {
        return <LocalizationContext.Consumer>
            {(state): JSX.Element => {
                // If the strings exist
                if (state?.strings) {
                    return this.props.children(state.strings);
                }
                // Otherwise
                else {
                    throw new Error('Cannot find Localization');
                }
            }}
        </LocalizationContext.Consumer>;
    }
}
