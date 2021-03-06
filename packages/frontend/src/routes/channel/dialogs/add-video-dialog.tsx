import React from 'react';
import { Localization } from 'components/localization-provider/types';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle } from '@material-ui/core';
import Form from 'components/form';
import CustomTextField from 'components/text-field';
import { DropzoneArea } from 'material-ui-dropzone';
import MSChannel from 'utils/mediaserver/classes/channel';
import VideoUpload from 'utils/mediaserver/classes/upload';

export interface AddVideoDialogProps {
    /** Should the dialog be opened or not */
    open: boolean;
    /** Function to close the dialog. Don't handle the result here but in `onValidate`. */
    handleClose: () => void;
    /** Localization */
    localization: Localization;
    /** Called on submit */
    handleDone: () => void | Promise<void>;
    /** Parent channel */
    parentChannel: MSChannel;
}

export interface VideoAddState {
    title: string;
    videoFile: File | undefined;
}

export interface AddVideoDialogState {
    upload?: VideoUpload;
}

export class AddVideoDialog extends React.Component<AddVideoDialogProps, AddVideoDialogState> {

    constructor(props: AddVideoDialogProps) {
        super(props);
        // Init state
        this.state = {
            upload: undefined,
        };
    }

    uploadVideo = async (data: VideoAddState): Promise<void> => {
        // Video must be provided
        if (data.videoFile !== undefined) {

            // Get upload object
            const upload = this.props.parentChannel.addVideo({
                title: data.title,
                videoFile: data.videoFile,
            });

            try {
                let uploadInProgress = true;

                // Continue the upload until it is finished
                // Also stop if the dialog closes
                while (uploadInProgress && this.props.open) {
                    uploadInProgress = await upload.continueUpload();
                    console.log(`${upload.end}/${upload.size}`);
                }

                console.log('done');

                // Finish !
                this.props.handleClose();
                this.props.handleDone();
            } catch (e) {
                console.error(e); //TODO handle
            }
        }
    }

    render(): JSX.Element {
        return <Dialog
            fullWidth
            open={this.props.open}
        >

            {/* Title */}
            <DialogTitle>{this.props.localization.Channel.dialogs.addVideoTitle}</DialogTitle>

            <Form<VideoAddState>
                initialState={{
                    title: '',
                    videoFile: undefined,
                }}
                onSubmit={(data): void => {
                    this.uploadVideo(data);
                }}
            >
                {/* Content */}
                <DialogContent>
                    <CustomTextField
                        className='margin-top'
                        label={this.props.localization.Channel.fieldsNames.title}
                        name='title'
                        required
                        noMargin
                        autoComplete='off'
                        autoFocus
                    />
                    <DropzoneArea
                        dropzoneClass='margin-top'
                        acceptedFiles={['video/mp4', 'video/x-msvideo']}
                        // dropzoneText={this.props.dropzoneText}
                        filesLimit={1}
                        maxFileSize={2147483648}
                        // classes={{
                        //     text: 'ImageField-dropZonePromptText',
                        //     icon: 'ImageField-dropZoneIcon',
                        // }}
                        useChipsForPreview={false}
                        showAlerts={false}
                        inputProps={{
                            name: 'videoFile',
                        }}
                    />

                </DialogContent>

                {/* Actions */}

                <DialogActions>

                    <Button onClick={this.props.handleClose}>
                        {this.props.localization.Channel.dialogs.cancel}
                    </Button>

                    <Button type='submit'>
                        {this.props.localization.Channel.actionsNames.add}
                    </Button>

                </DialogActions>
            </Form >
        </Dialog >;
    }
}

export default AddVideoDialog;