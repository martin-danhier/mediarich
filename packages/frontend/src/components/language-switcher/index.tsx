/**
 * @file Definition of a LanguageSwitcher component
 * @version 1.0
 * @author Martin Danhier
 */

import { Button, Tooltip } from '@material-ui/core';
import { LocalizationConsumer, LocalizationContext } from 'components/localization-provider';
import { AvailableLanguage, availableLocalisations } from 'components/localization-provider/types';
import { addDays } from 'date-fns/esm';
import Cookies from 'js-cookie';
import React from 'react';
import * as assert from 'assert';

interface LanguageSwitcherProps {
    alignTopRight?: boolean;
    color?: 'inherit' | 'primary' | 'secondary' | 'default';
}

interface LanguageSwitcherState {
    current?: AvailableLanguage;
    next?: AvailableLanguage;
}

/** Button to cycle through the available languages */
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

    componentDidMount(): void {
        // Assert that the context is defined
        assert.ok(this.context !== undefined, 'Context is undefined');
        assert.ok(this.context.strings !== undefined, 'context.strings is undefined');
        assert.ok(Object.keys(availableLocalisations).includes(this.context.strings.name), `Invalid localization name: "${this.context.strings.name}"`);

        this.setState(this.getNewStateData(this.context.strings.name as AvailableLanguage));
    }

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
        assert.ok(this.state.current !== undefined, 'current is undefined');
        assert.ok(this.state.next !== undefined, 'next is undefined');

        // Change the language to that new one
        this.context?.selectLanguage(this.state.next);
        // Save it in a cookie
        Cookies.set('lang', this.state.next, {
            expires: addDays(new Date(), 14),
        });
        // Update state
        this.setState(state => {
            assert.ok(state.next !== undefined, 'next is undefined');
            return this.getNewStateData(state.next);
        });
    }

    render(): JSX.Element {
        // Create the consumer
        const consumer = <LocalizationConsumer>
            {(localization): JSX.Element => {
                return (
                    <Tooltip
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