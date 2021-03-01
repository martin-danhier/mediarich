/**
 * @file Definition of a Form component
 * @version 1.0
 * @author Martin Danhier
 */

import * as assert from 'assert';
import CustomTextField, { CustomTextFieldProps } from 'components/text-field';
import React from 'react';

import { Button, ButtonProps } from '@material-ui/core';
import { Localization } from 'components/localization-provider/types';
import { LocalizationConsumer } from 'components/localization-provider';

/** Format of the values that can be stored in a Form */
export type FormValues<T extends FormValues<T>> = {
    [key in keyof T]: string | boolean | number;
}

/** Function that checks if the new value of a text field is valid. */
export type ChangeValidationCallback<T extends FormValues<T>> = (name: keyof T, newValue: string, values: T) => ChangeValidationCallbackResult;
/** Result return by a ValidationCallback */
export interface ChangeValidationCallbackResult {
    /** If true, the change will be discarded (the value will not change).
     *
     * Useful for example when only numbers should be kept.
     */
    keepChange: boolean;
    /**
     * Error message to show below the field.
     * If undefined or empty, the error will be removed.
     */
    error?: string;
}

export type FormErrors<T extends FormValues<T>> = {
    [key in keyof T]?: string;
}

export type SubmitValidationCallback<T extends FormValues<T>> = (values: T) => Promise<SubmitValidationCallbackResult<T>>;
export interface SubmitValidationCallbackResult<T extends FormValues<T>> {
    /** Is the submit valid ? */
    ok: boolean;
    /** If needed, provide errors for some fields here.
     * Omitted values won't have any error.
     */
    errors?: FormErrors<T>;
}

/** props of a Form component */
export interface FormProps<T extends FormValues<T>> {
    children: JSX.Element[];
    initialState: T;
    localization: Localization;
    /** Called when the form is submitted and the data is valid */
    onSubmit?: (validData: T) => void | Promise<void>;
    /** Validation function for change event. Place checks in the callback to check if the new value is valid
     * @returns a ChangeValidationCallback
    */
    validateTextfieldChange?: ChangeValidationCallback<T>;
    /** Validation function for submit event. Place checks in the callback to check if the values are valid for submit.
     * Required fields are already checked automatically.
     * @returns a SubmitValidationCallback
     * */
    validateSubmit?: SubmitValidationCallback<T>;
}

/** State of a Form component */
export interface FormState<T extends FormValues<T>> {
    /** Values of the fields */
    values: T;
    /** Optional error messages for the fields */
    errors: FormErrors<T>;
    /** Required fields */
    required: (keyof T)[];
}

/** Component to manage the values of common form fields and provide useful callbacks. */
class FormContent<T extends FormValues<T>> extends React.Component<FormProps<T>, FormState<T>>{

    constructor(props: FormProps<T>) {
        super(props);

        // Get required fields
        const required: (keyof T)[] = [];
        for (const child of props.children) {
            if (child.type === CustomTextField && React.isValidElement<CustomTextFieldProps>(child) && child.props.required) {
                // Assert that the name is a key of the data
                assert.ok(Object.keys(props.initialState).includes(child.props.name), `The field "${child.props.name}" should be defined in the initialState.`);
                // Add its name to the list
                required.push(child.props.name as keyof T);
            }
        }

        // Init state object
        this.state = {
            values: props.initialState,
            errors: {},
            required,
        };
    }

    /** Called when the submit button is clicked */
    handleSubmit = async (event: React.MouseEvent): Promise<void> => {

        // Validate inputs
        let ok = true;
        let errors: FormErrors<T> = {};

        // Validate required fields
        for (const requiredField of this.state.required) {
            if (this.state.values[requiredField] === '') {
                ok = false;
                errors[requiredField] = this.props.localization.Form.required;
            }
        }

        // Validate with callback, if still ok (no required field missing)
        if (ok && this.props.validateSubmit) {
            const result = await this.props.validateSubmit(this.state.values);
            ok = result.ok;
            errors = {
                ...errors,
                ...result.errors
            };
        }

        // If ok, call callback
        if (ok && this.props.onSubmit) {
            this.props.onSubmit(this.state.values);
        }
        // If there are errors
        if (errors !== undefined) {
            this.setState(prevState => ({
                ...prevState,
                errors,
            }));
        }
    }

    /** Called when a textfield changes */
    handleChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
        // Get info about the sender of the event
        const newValue = event.target.value;
        const name = event.target.name;

        // Assert that the name is a key in the state
        assert.ok(Object.keys(this.state.values).includes(name), `The field "${name}" should be present in the state object.`);
        assert.ok(typeof this.state.values[name as keyof T] === 'string', `The field "${name}" should be a string.`);

        // Validate the new input
        let keepChange = true;
        let errorMsg = '';

        if (this.props.validateTextfieldChange) {
            // Call the check callback
            const result = this.props.validateTextfieldChange(name as keyof T, newValue, this.state.values);
            keepChange = result.keepChange;
            errorMsg = result.error ?? '';
        }

        // Update if the value is ok
        const newState: FormState<T> = { ...this.state };
        if (keepChange) {
            // Since we asserted that name is a key of values, and that the type is string, we can cast so that typescript
            // knows that it is true
            (newState.values as { [key in keyof T]: string })[name as keyof T] = newValue;
        }
        newState.errors[name as keyof T] = errorMsg;

        this.setState(newState);
    }

    /** Links event handlers to children */
    processChildren = (children: React.ReactElement[]): React.ReactElement[] => {
        return React.Children.map(children, elem => {

            // If a button bar is found, process it as well
            if (elem.type === 'div' && elem.props.className === 'buttonBar') {
                return React.cloneElement(elem, { children: this.processChildren(elem.props.children) });
            }
            // If a submit button is found, add a hook to the handleSubmit function
            else if (elem.type === Button && React.isValidElement<ButtonProps>(elem) && elem.props.type === 'submit') {
                return React.cloneElement(elem, { onClick: this.handleSubmit });
            }
            // If a text field is found
            else if (elem.type === CustomTextField && React.isValidElement<CustomTextFieldProps>(elem)) {
                // Assert that the name is in the state type and that it is a string
                assert.ok(
                    Object.keys(this.props.initialState).includes(elem.props.name),
                    `Unexpected name: "${elem.props.name}". The "name" of a field must exist in the form state.`
                );
                assert.ok(
                    typeof this.props.initialState[elem.props.name as keyof T] === 'string',
                    `The type of the "${elem.props.name}" field should be string.`
                );

                // Return a clone linked to the function
                return React.cloneElement(elem, {
                    onChange: this.handleChange,
                    value: this.state.values[elem.props.name as keyof T] as string,
                    error: this.state.errors[elem.props.name as keyof T],
                });
            }
            // Else don't change anything
            else {
                return elem;
            }
        });
    }

    render(): JSX.Element {
        return <div>
            {this.processChildren(this.props.children)}
        </div>;

    }
}

/** Component to manage the values of common form fields and provide useful callbacks.
 *
 * This wrapper component is used to reset the form and its errors whenever the localization is changed;
 */
class Form<T extends FormValues<T>> extends React.Component<Omit<FormProps<T>, 'localization'>> {
    render(): JSX.Element {
        return <LocalizationConsumer>
            {(localization): JSX.Element => {
                return <FormContent key={localization.name} {...this.props} localization={localization} />;
            }}
        </LocalizationConsumer>;
    }
}

export default Form;