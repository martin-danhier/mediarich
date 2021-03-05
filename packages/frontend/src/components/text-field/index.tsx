import { TextField } from '@material-ui/core';
import clsx from 'clsx';
import React from 'react';
import { RouteComponentProps } from 'react-router';
import './text-field.style.css';

export interface CustomTextFieldProps extends Partial<RouteComponentProps> {
    /** Label of the field */
    label: string;
    /** Name of the field, used for forms */
    name: string;
    /** Default value of the field */
    value?: string;
    /** Is the field required ? */
    required?: boolean;
    /** Should the text be hidden ? */
    password?: boolean;
    /** The error message to display. Hidden if undefined or empty string. */
    error?: string;
    /** CSS classes */
    className?: string;
    /** Callback called when the text changes */
    onChange?: React.ChangeEventHandler;
    /* If true, disables the margin */
    noMargin?: boolean;
    /** Is the textfield multiline */
    multiline?: boolean;
    /** Autocomplete settings */
    autoComplete?: string;
}

class CustomTextField extends React.Component<CustomTextFieldProps> {
    render(): JSX.Element {
        return <TextField
            className={clsx(!this.props.noMargin && 'CustomTextField-field', this.props.className)}
            fullWidth
            name={this.props.name}
            variant='outlined'
            label={this.props.label}
            required={this.props.required}
            type={this.props.password ? 'password' : undefined}
            onChange={this.props.onChange}
            value={this.props.value}
            helperText={this.props.error}
            multiline={this.props.multiline}
            autoComplete={this.props.autoComplete}
            error={!!this.props.error}
        />;
    }
}

export default CustomTextField;