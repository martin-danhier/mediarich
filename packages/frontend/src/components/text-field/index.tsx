import { TextField } from '@material-ui/core';
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
}

class CustomTextField extends React.Component<CustomTextFieldProps> {
    render(): JSX.Element {
        return <TextField
            className={`CustomTextField-field ${this.props.className ?? ''}`}
            fullWidth
            name={this.props.name}
            variant='outlined'
            label={this.props.label}
            required={this.props.required}
            type={this.props.password ? 'password' : undefined}
            onChange={this.props.onChange}
            value={this.props.value}
            helperText={this.props.error}
            error={!!this.props.error}
        />;
    }
}

export default CustomTextField;