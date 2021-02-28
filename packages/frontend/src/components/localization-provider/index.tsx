import LoadingScreen from 'components/loading-screen';
import React from 'react';
import { AvailableLanguage, Localization, availableLocalisations } from './types';


/** Context for Localization State */
export const LocalizationContext = React.createContext<LocalizationProviderState | undefined>(undefined);


// ======== LOCALIZATION PROVIDER ========

/** Props of a LocalizationProvider */
interface LocalizationProviderProps {
    defaultLanguage: AvailableLanguage;
}

/** State of a LocalizationProvider */
interface LocalizationProviderState {
    strings?: Localization;
    // Include functions so consumer can easily change the language
    selectLanguage: typeof LocalizationProvider.prototype.selectLanguage;
}


export class LocalizationProvider extends React.Component<LocalizationProviderProps, LocalizationProviderState> {
    /** Context used in a LocalizationProvider */
    static contextType = LocalizationContext;

    constructor(props: LocalizationProviderProps) {
        super(props);

        this.state = {
            strings: undefined,
            // Include functions so consumer can easily change the language
            selectLanguage: this.selectLanguage,
        };
    }

    componentDidMount(): void {
        // Trigger update of language
        this.selectLanguage(this.props.defaultLanguage);
    }


    /** Lazily load the requested language file
     * @param language the language to load
    */
    public selectLanguage = async (language: AvailableLanguage): Promise<void> => {
        try {
            const json = await availableLocalisations[language]();

            // Use setstate so a new object is created and listeners are called
            this.setState((previousState) => ({
                strings: json,
                selectLanguage: previousState.selectLanguage,
            }));
        }
        catch (e) {
            console.error(e);
            throw new Error(`Localization not found: "${language}"`);
        }
    }

    render(): JSX.Element {
        if (this.state.strings === undefined) {
            // Load when undefined
            return <LoadingScreen />;
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

interface LocalizationConsumerProps {
    children: (localization: Localization) => JSX.Element;
}

/** Listens to a LocalizationProvider for changes and rebuild each time a change is detected. */
export class LocalizationConsumer extends React.Component<LocalizationConsumerProps> {
    static contextType = LocalizationContext;

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
