/**
 * @file Definition of a LanguageSwitcher component
 * @version 1.0
 * @author Martin Danhier
 */

import assert from 'utils/assert';
import { LocalizationConsumer, LocalizationContext } from 'components/localization-provider';
import { AvailableLanguage, availableLocalisations } from 'components/localization-provider/types';
import { addDays } from 'date-fns/esm';
import Cookies from 'js-cookie';
import React from 'react';

import { Button, Tooltip } from '@material-ui/core';

/** Props of a LanguageSwitcher component */
interface LanguageSwitcherProps {
    /** if true, the button will be place on the top right absolutely */
    alignTopRight?: boolean;
    /** Color of the button */
    color?: 'inherit' | 'primary' | 'secondary' | 'default';
}

/** State of a LanguageSwitcher component */
interface LanguageSwitcherState {
    /** Current language */
    current?: AvailableLanguage;
    /** Next language */
    next?: AvailableLanguage;
}

/** Button to cycle through the available languages. */
class LanguageSwitcher extends React.Component<LanguageSwitcherProps, LanguageSwitcherState> {

    constructor(props: LanguageSwitcherProps) {
        super(props);

        // Init state
        this.state = {
            current: undefined,
            next: undefined,
        };
    }

    // Link the context to this component so that we can easily access and update languages
    context!: React.ContextType<typeof LocalizationContext>
    static contextType = LocalizationContext;

    /** Called when the component mounts (is rendered for the first time) */
    componentDidMount(): void {

        // Assert that the context is defined
        assert(this.context !== undefined, 'Context is undefined');
        assert(this.context.strings !== undefined, 'context.strings is undefined');
        assert(Object.keys(availableLocalisations).includes(this.context.strings.name), `Invalid localization name: "${this.context.strings.name}"`);

        // Update the state
        this.setState(this.getNewStateData(this.context.strings.name as AvailableLanguage));
    }

    /** Get the current and next language. */
    getNewStateData = (current: AvailableLanguage): LanguageSwitcherState => {
        // Get the list of languages
        const supportedLanguages = Object.keys(availableLocalisations);
        // Get the current position
        const currentIndex = supportedLanguages.findIndex(value => value === current);

        // Get the next language. Go back at the beginning if the end is reached
        const next = supportedLanguages[(currentIndex + 1) % supportedLanguages.length] as AvailableLanguage;

        return { next, current };
    }

    /** Triggers on click. Cycles through the languages */
    handleButtonClick = (event: React.MouseEvent): void => {
        event.preventDefault();

        // Assert that the state is not undefined
        assert(this.state.current !== undefined, 'current is undefined');
        assert(this.state.next !== undefined, 'next is undefined');

        // Change the language to that new one
        this.context?.selectLanguage(this.state.next);

        // Save it in a cookie
        Cookies.set('lang', this.state.next, {
            expires: addDays(new Date(), 14),
        });

        // Update state
        this.setState(state => {
            assert(state.next !== undefined, 'next is undefined');
            return this.getNewStateData(state.next);
        });
    }

    /**
     * Main method of a React component. Called each time the component needs to render.
     * @returns a tree of react elements
     */
    render(): JSX.Element {
        // Create the consumer
        const consumer = <LocalizationConsumer>
            {(localization): JSX.Element => {
                return (
                    <Tooltip
                        // tooltip displayed when the button is hovered
                        title={localization.LanguageSwitcher.tooltip}
                    >
                        <Button
                            onClick={this.handleButtonClick}
                            color={this.props.color}
                        >
                            {this.state.next}
                        </Button>
                    </Tooltip>
                );
            }}
        </LocalizationConsumer>;


        // If it should be aligned, wrap it in a div
        return this.props.alignTopRight ?
            <div className="alignContent-topRightAbsolute">
                {consumer}
            </div> : consumer;
    }
}



export default LanguageSwitcher;