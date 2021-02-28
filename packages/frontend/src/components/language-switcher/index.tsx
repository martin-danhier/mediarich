/**
 * @file Definition of a LanguageSwitcher component
 * @version 1.0
 * @author Martin Danhier
 */

import { Button } from '@material-ui/core';
import { LocalizationConsumer, LocalizationContext } from 'components/localization-provider';
import { availableLocalisations } from 'components/localization-provider/types';
import { addDays } from 'date-fns/esm';
import Cookies from 'js-cookie';
import React from 'react';

/** Button to cycle through the available languages */
class LanguageSwitcher extends React.Component {
    static contextType = LocalizationContext;

    /** Triggers on click. Cycles through the languages */
    handleButtonClick = (event: React.MouseEvent, current: string): void => {
        event.preventDefault();
        // Get the list of languages
        const supportedLanguages = Object.keys(availableLocalisations);
        // Get the current position
        const currentIndex = supportedLanguages.findIndex(value => value === current);

        // Get the next language. Go back at the beginning if the end is reached
        const nextLanguage = supportedLanguages[(currentIndex + 1) % supportedLanguages.length];

        // Change the language to that new one
        this.context.selectLanguage(nextLanguage);
        // Save it in a cookie
        Cookies.set('lang', nextLanguage, {
            expires: addDays(new Date(), 14),
        });
    }

    render(): JSX.Element {
        return (
            <LocalizationConsumer>
                {(localization): JSX.Element => {
                    return (
                        <Button
                            onClick={(e): void => this.handleButtonClick(e, localization.name)}
                        >
                            {localization.name}
                        </Button>
                    );
                }}
            </LocalizationConsumer>
        );
    }
}

export default LanguageSwitcher;