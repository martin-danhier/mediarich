/**
 * @file Definition of an EditDialog component
 * @version 1.0
 * @author Martin Danhier
 * @license Apache
*/

import Form from 'components/form';
import ImageField from 'components/image-field';
import { Localization } from 'components/localization-provider/types';
import CustomTextField from 'components/text-field';
import React from 'react';

import {
    Button, Dialog, DialogActions, DialogContent, DialogTitle, Typography
} from '@material-ui/core';

/** Props of an EditDialog component */
export interface EditDialogProps {
    /** Should the dialog be opened or not */
    open: boolean;
    /** Title of the dialog */
    title: string;
    /** Default data to prefill the fields */
    defaultData: {
        title?: string;
        description?: string;
        thumbnailURL?: string;
    };
    /** Function to close the dialog. Don't handle the result here but in `onValidate`. */
    handleClose: () => void;
    /** Function called when the submit button is pressed. */
    onSubmit?: (data: ChannelEditState) => void | Promise<void>;
    /** If true, a text will be displayed to tell that empty fields are omitted */
    omitEmpty?: boolean;
    /** Localization */
    localization: Localization;
}

/** State of a channel edit form */
export interface ChannelEditState {
    /** Title field */
    title: string;
    /** Description field */
    description: string;
    /** Thumbnail field (null = don't modify it) */
    thumbnail: File | null;
}

/** Dialog with video edition form */
class EditDialog extends React.Component<EditDialogProps> {

    /**
     * Main method of a React component. Called each time the component needs to render.
     * @returns a tree of react elements
     */
    render(): JSX.Element {
        return <Dialog
            fullWidth
            open={this.props.open}
        >

            {/* Title */}
            <DialogTitle>{this.props.title}</DialogTitle>

            <Form<ChannelEditState>
                initialState={{
                    title: this.props.defaultData.title ?? '',
                    description: this.props.defaultData.description ?? '',
                    thumbnail: null,
                }}
                requiredFieldsOverride={this.props.omitEmpty ? undefined : ['title']}
                onSubmit={(data): void => { if (this.props.onSubmit) this.props.onSubmit(data); }}

            >
                {/* Content */}
                <DialogContent>

                    {this.props.omitEmpty ? <Typography className='margin-bottom'>{this.props.localization.Channel.dialogs.omittedFields}</Typography> : <></>}

                    {/* Fields */}
                    <CustomTextField
                        label={this.props.localization.Channel.fieldsNames.title}
                        name='title'
                        required={!this.props.omitEmpty}
                        noMargin
                        autoComplete='off'
                    />
                    <CustomTextField
                        label={this.props.localization.Channel.fieldsNames.description}
                        name='description'
                        noMargin
                        multiline
                        autoComplete='off'
                        className='margin-vertical'
                    />
                    <ImageField
                        title={this.props.localization.Channel.fieldsNames.thumbnail}
                        name='thumbnail'
                        defaultImageUrl={this.props.defaultData.thumbnailURL}
                        dropzoneText=''
                    />

                </DialogContent>

                {/* Actions */}
                <DialogActions>
                    <Button onClick={this.props.handleClose}>
                        {this.props.localization.Channel.dialogs.cancel}
                    </Button>
                    <Button type='submit'>
                        {this.props.localization.Channel.actionsNames.edit}
                    </Button>
                </DialogActions>
            </Form >
        </Dialog >;
    }
}

export default EditDialog;