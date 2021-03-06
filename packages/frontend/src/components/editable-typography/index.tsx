import { TextField, Typography } from '@material-ui/core';
import { Variant } from '@material-ui/core/styles/createTypography';
import React from 'react';

export interface EditableTypographyProps {
    defaultText: string;
    onRename: (newText: string) => void | Promise<void>;
    disabled?: boolean;
    variant?: 'inherit' | Variant;
    typographyClassName?: string;
}

export interface EditableTypographyState {
    text: string;
    previousText: string;
    inEditMode: boolean;
}

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
        this.setState(prev => ({
            ...prev,
            text: newValue,
        }));
    }

    /** Enable edit mode  */
    enterEditMode = (e: React.MouseEvent<HTMLSpanElement>): void => {
        if (!this.props.disabled) {
            // Enter edit mode
            this.setState(prev => ({
                ...prev,
                inEditMode: true,
                previousText: prev.text,
            }));
        }
    }

    /** Exit edit mode and confirm changes */
    exitEditMode = (): void => {
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

    /** Exit edit mode but don't keep changes */
    resetEditMode = (): void => {
        this.setState(prev => ({
            ...prev,
            inEditMode: false,
            text: prev.previousText,
        }));
    }

    render(): JSX.Element {
        // No edit mode : typography
        if (!this.state.inEditMode) {
            return <Typography
                className={this.props.typographyClassName}
                variant={this.props.variant}
                onClick={this.enterEditMode}
            >{this.state.text}</Typography>;
        }
        // Edit mode : textfield
        else {
            return <TextField

                variant='outlined'
                autoFocus
                onChange={this.handleTextFieldChange}
                value={this.state.text}
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