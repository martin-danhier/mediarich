/**
 * @file Definition of an CustomTextField component
 * @version 1.0
 * @author Martin Danhier
 * @license Apache
*/

import './text-field.style.css';

import clsx from 'clsx';
import React from 'react';
import { RouteComponentProps } from 'react-router';

import { TextField } from '@material-ui/core';

/** Props of a CustomTextField component */
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
    /** Autofocus */
    autoFocus?: boolean;
}

/**
 * Wrapper around TextField to default the values and give it a uniform style.
 */
class CustomTextField extends React.Component<CustomTextFieldProps> {
    /**
     * Main method of a React component. Called each time the component needs to render.
     * @returns a tree of react elements
     */
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
            autoFocus={this.props.autoFocus}
        />;
    }
}

export default CustomTextField;