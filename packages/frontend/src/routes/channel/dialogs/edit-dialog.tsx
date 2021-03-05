import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, TextField, Typography } from '@material-ui/core';
import { Localization } from 'components/localization-provider/types';
import Form from 'components/form';
import ImageField from 'components/image-field';
import CustomTextField from 'components/text-field';
import React from 'react';

interface EditDialogProps {
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
    /** Cancel button text */
    cancelButtonText: string;
    /** Submit button text */
    submitButtonText: string;
    /** Function to close the dialog. Don't handle the result here but in `onValidate`. */
    handleClose: () => void;
    /** Function called when the submit button is pressed. */
    onValidate?: () => void | Promise<void>;
    /** If true, a text will be displayed to tell that empty fields are omitted */
    omitEmpty?: boolean;
    /** Localization */
    localization: Localization;
}

/** State of a channel edit form */
interface ChannelEditState {
    title: string;
    description: string;
    thumbnail: File | null;
}

interface EditDialogState {
    displayedThumbnail: File | undefined;
}

class EditDialog extends React.Component<EditDialogProps, EditDialogState> {
    constructor(props: EditDialogProps) {
        super(props);
        // Init empty state
        this.state = {
            displayedThumbnail: undefined,
        };
    }

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
                onSubmit={async (validData): Promise<void> => {
                    console.log(validData);
                }}
            >
                {/* Content */}
                <DialogContent>

                    {this.props.omitEmpty ? <Typography className='margin-bottom'>Les champs omis ne seront pas modifiés.</Typography> : <></>}

                    <CustomTextField
                        label={this.props.localization.Channel.fieldsNames.title} // TODO
                        name='title'
                        required
                        noMargin
                        autoComplete='off'
                    />
                    <CustomTextField
                        label={this.props.localization.Channel.fieldsNames.description} // TODO
                        name='description'
                        noMargin
                        multiline
                        autoComplete='off'
                        className='margin-vertical'
                    />

                    <ImageField
                        name='thumbnail'
                        defaultImageUrl={this.props.defaultData.thumbnailURL}
                        dropzoneText=''
                    />

                </DialogContent>

                {/* Actions */}
                <DialogActions>
                    <Button onClick={this.props.handleClose}>
                        {this.props.cancelButtonText}
                    </Button>
                    <Button type='submit' onClick={(): void => {
                        this.props.handleClose();
                        if (this.props.onValidate) {
                            this.props.onValidate();
                        }
                    }}
                    >
                        {this.props.submitButtonText}
                    </Button>
                </DialogActions>
            </Form >
        </Dialog >;
    }
}

export default EditDialog;