import { TextField } from '@material-ui/core';
import React from 'react';
import { RouteComponentProps } from 'react-router';
import './text-field.style.css';

interface CustomTextFieldProps extends Partial<RouteComponentProps> {
    /** Label of the field */
    label: string;
    /** Is the field required ? */
    required?: boolean;
    /** Should the text be hidden ? */
    password?: boolean;
    /** CSS classes */
    className?: string;
}

class CustomTextField extends React.Component<CustomTextFieldProps> {
    render(): JSX.Element {
        return <TextField
            className={`CustomTextField-field ${this.props.className ?? ''}`}
            fullWidth
            variant='outlined'
            label={this.props.label}
            required={this.props.required}
            type={this.props.password ? 'password' : undefined}
        />;
    }
}

export default CustomTextField;