/**
 * @file Definition of a Form component
 * @version 1.0
 * @author Martin Danhier
 */

import assert from 'assert';
import CustomTextField, { CustomTextFieldProps } from 'components/text-field';
import React from 'react';

import { Localization } from 'components/localization-provider/types';
import { LocalizationConsumer } from 'components/localization-provider';
import { RouteComponentProps } from 'react-router';
import { DropzoneArea, DropzoneAreaProps } from 'material-ui-dropzone';
import { DialogActions, DialogContent } from '@material-ui/core';
import ImageField, { ImageFieldProps } from 'components/image-field';

/** Format of the values that can be stored in a Form */
export type FormValues<T extends FormValues<T>> = {
    [key in keyof T]: string | boolean | number | File | null | undefined;
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
export interface FormProps<T extends FormValues<T>> extends Partial<RouteComponentProps> {
    children: JSX.Element[];
    initialState: T;
    localization: Localization;
    /** Called when the form is submitted and the data is valid
     * @return a string with an url to redirect there
    */
    onSubmit?: (validData: T) => Promise<void> | Promise<string>;
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
    handleSubmit = async (): Promise<void> => {

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
        let willRedirect = false;
        let destination = '';
        if (ok && this.props.onSubmit) {
            const result = await this.props.onSubmit(this.state.values);
            if (typeof result === 'string') {
                destination = result;
                willRedirect = true;
            }
        }
        // If there are errors
        if (!willRedirect && errors !== undefined) {
            this.setState(prevState => ({
                ...prevState,
                errors,
            }));
        }
        // If should redirect
        if (willRedirect) {
            this.props.history?.push(destination);
        }
    }

    /** Called when a textfield changes */
    handleTextFieldChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
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

    /** Called when a dropzone changes */
    handleDropZoneChange = (files: File[], name: string): void => {
        // Assert that the name is a key in the state
        assert.ok(Object.keys(this.state.values).includes(name), `The field "${name}" should be present in the state object.`);
        assert.ok(this.state.values[name as keyof T] instanceof File || this.state.values[name as keyof T] === undefined, `The field "${name}" should be a File or undefined.`);

        // Update state
        const newState: FormState<T> = { ...this.state };
        (newState.values as { [key in keyof T]: File })[name as keyof T] = files[0];
        this.setState(newState);
    }

    handleImageFieldChange = (image: File | null, name: string): void => {
        // Assert that the name is a key in the state
        assert.ok(Object.keys(this.state.values).includes(name), `The field "${name}" should be present in the state object.`);
        assert.ok(this.state.values[name as keyof T] instanceof File || this.state.values[name as keyof T] === null, `The field "${name}" should be a File or null.`);

        // Update state
        const newState: FormState<T> = { ...this.state };
        (newState.values as { [key in keyof T]: File | null })[name as keyof T] = image;
        this.setState(newState);
    }

    /** Links event handlers to children */
    processChildren = (children: React.ReactElement[]): React.ReactElement[] => {
        return React.Children.map(children, elem => {
            // If a text field is found
            if (elem.type === CustomTextField && React.isValidElement<CustomTextFieldProps>(elem)) {
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
                    onChange: this.handleTextFieldChange,
                    value: this.state.values[elem.props.name as keyof T] as string,
                    error: this.state.errors[elem.props.name as keyof T],
                });
            }
            // Vanilla dropzone
            else if (elem.type === DropzoneArea && React.isValidElement<DropzoneAreaProps>(elem)) {
                // Assert that the name is in the state type and that it is a file
                assert(elem.props.inputProps !== undefined, 'The "inputProps" field must be defined');
                assert(elem.props.inputProps.name !== undefined, 'The "name" field must be defined');
                assert(
                    Object.keys(this.props.initialState).includes(elem.props.inputProps.name),
                    `Unexpected name: "${elem.props.inputProps.name}". The "name" of a field must exist in the form state.`
                );
                assert(
                    this.props.initialState[elem.props.inputProps.name as keyof T] instanceof File
                    || this.props.initialState[elem.props.inputProps.name as keyof T] === undefined,
                    `The type of the "${elem.props.inputProps.name}" field should be a file or undefined.`
                );
                // Get the name
                const name = elem.props.inputProps.name;

                return React.cloneElement(elem, {
                    onChange: (files: File[]) => this.handleDropZoneChange(files, name),
                });
            }
            // Custom image field
            else if (elem.type === ImageField && React.isValidElement<ImageFieldProps>(elem)) {
                assert(
                    Object.keys(this.props.initialState).includes(elem.props.name),
                    `Unexpected name: "${elem.props.name}". The "name" of a field must exist in the form state.`
                );
                assert(
                    this.props.initialState[elem.props.name as keyof T] instanceof File
                    || this.props.initialState[elem.props.name as keyof T] === null,
                    `The type of the "${elem.props.name}" field should be a file or null.`
                );
                // Get
                const name = elem.props.name;

                return React.cloneElement(elem, {
                    onChange: (image: File | null) => this.handleImageFieldChange(image, name),
                });

            }
            // Div or other common containers of fields
            else if (elem.type === 'div' || elem.type === DialogContent) {
                if (elem.props.children) {
                    return React.cloneElement(elem, {
                        children: this.processChildren(elem.props.children),
                    });
                }
            }
            // Else don't change anything
            return elem;

        });
    }

    render(): JSX.Element {
        return <form
            noValidate
            onSubmit={(e): void => {
                e.preventDefault();
                this.handleSubmit();
            }}
            className='fullWidth'
        >
            {this.processChildren(this.props.children)}
        </form>;

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