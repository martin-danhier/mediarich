/**
 * @file Definition of an EditableTypography component
 * @version 1.0
 * @author Martin Danhier
 * @license Apache
*/

import React from 'react';

import { TextField, Typography } from '@material-ui/core';
import { Variant } from '@material-ui/core/styles/createTypography';

/**
 * Props of an EditableTypography component
 */
export interface EditableTypographyProps {
    /** Initial text displayed in the Typography */
    defaultText: string;
    /** Callback called when the text is modified */
    onRename: (newText: string) => void | Promise<void>;
    /** If true, the edit mode will never be enabled, so the field will be read only */
    disabled?: boolean;
    /** Typography variant, passed to the Typography component */
    typographyVariant?: 'inherit' | Variant;
    /** Typography class name, passed to the Typography component */
    typographyClassName?: string;
}

/**
 * State of an EditableTypography component
 */
export interface EditableTypographyState {
    /** Current text of the text field */
    text: string;
    /** Text of the textfield when the edit mode was enabled.
     *
     * It is a backup that allows the component to reset the text to its
     * previous value if the edit is cancelled.
     */
    previousText: string;
    /** If true, the field will be in edit mode (TextField displayed and
     * editable instead of Typography) */
    inEditMode: boolean;
}

/**
 * Typography that can be editted on click.
 *
 * When the "edit mode" is enabled, a TextField is rendered.
 * A callback will be called if the change is validated.
 *
 * A change is considered validated if the text field loses focus
 * or if the Enter key is pressed. A change is cancelled if the Escape key is pressed.
 */
class EditableTypography extends React.Component<EditableTypographyProps, EditableTypographyState>  {
    constructor(props: EditableTypographyProps) {
        super(props);

        // Init state
        this.state = {
            text: this.props.defaultText,
            previousText: this.props.defaultText,
            inEditMode: false,
        };
    }

    /** Called when the textfield is edited */
    handleTextFieldChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
        const newValue = e.target.value;

        // Save the change in the state
        this.setState(prev => ({
            ...prev,
            text: newValue,
        }));
    }

    /** Enable edit mode  */
    enterEditMode = (): void => {
        // Don't enable edit mode if the field is disabled.
        if (!this.props.disabled) {

            // Enter edit mode
            this.setState(prev => ({
                ...prev,
                inEditMode: true,
                // Keep a backup of the text to be able to reset it if the change is
                // cancelled
                previousText: prev.text,
            }));
        }
    }

    /** Exit edit mode and confirm changes */
    exitEditMode = (): void => {
        // Do nothing if the field is empty
        if (this.state.text !== '') {
            // Only call the callback if the text actually changed
            if (this.state.text !== this.state.previousText) {
                // Call callback
                this.props.onRename(this.state.text);
            }

            // Exit edit mode
            this.setState(prev => ({
                ...prev,
                inEditMode: false,
            }));
        }
    }

    /** Exit edit mode but don't keep changes */
    resetEditMode = (): void => {
        this.setState(prev => ({
            ...prev,
            inEditMode: false,
            // Reset the text to the previous value
            // Don't call the callback since the value wasn't modified
            text: prev.previousText,
        }));
    }

    /**
     * Main method of a React component. Called each time the component needs to render.
     * @returns a tree of react elements
     */
    render(): JSX.Element {
        // No edit mode : typography
        if (!this.state.inEditMode) {
            return <Typography
                className={this.props.typographyClassName}
                variant={this.props.typographyVariant}
                onClick={this.enterEditMode}
            >
                {this.state.text}
            </Typography>;
        }
        // Edit mode : textfield
        else {
            return <TextField
                variant='outlined'
                autoFocus
                onChange={this.handleTextFieldChange}
                value={this.state.text}
                // onBlur = on loses focus
                onBlur={this.exitEditMode}
                onKeyDown={(e): void => {
                    // Validate on Enter
                    if (e.key === 'Enter') {
                        this.exitEditMode();
                    }
                    // Cancel on Escape
                    else if (e.key === 'Escape') {
                        this.resetEditMode();
                    }
                }}
            />;
        }
    }
}

export default EditableTypography;