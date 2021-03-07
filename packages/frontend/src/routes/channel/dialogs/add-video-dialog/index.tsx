/**
 * @file Definition of an AddVideoDialog component
 * @version 1.0
 * @author Martin Danhier
 * @license Apache
*/


import { Localization } from 'components/localization-provider/types';
import { DropzoneArea } from 'material-ui-dropzone';
import React from 'react';
import MSChannel from 'utils/mediaserver/classes/channel';
import VideoUpload from 'utils/mediaserver/classes/upload';

import { Button, Dialog, DialogActions, DialogContent, DialogTitle } from '@material-ui/core';

import UploadCard from './upload-card';

/** Props of a AddVideoDialog component */
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

/** State of a AddVideoDialog component */
export interface AddVideoDialogState {
    /** Current uploads */
    uploads: { upload: VideoUpload; id: number; done: boolean; title: string }[];
    /** Id used to identify uploads (incremented at each one) */
    uploadId: number;
}

/** Dialog to add one or more files for upload and add them when complete */
export class AddVideoDialog extends React.Component<AddVideoDialogProps, AddVideoDialogState> {

    constructor(props: AddVideoDialogProps) {
        super(props);
        // Init state
        this.state = {
            uploads: [],
            uploadId: 0,
        };
    }

    /** Cleans the state and closes the dialog */
    close = (): void => {
        // Clear state
        this.setState({
            uploads: [],
            uploadId: 0,
        });
        // Call the callback
        this.props.handleClose();
    }

    /** Add a new upload to the list */
    addUpload = async (files: File[]): Promise<void> => {
        if (files.length > 0) {

            // Copy the state
            const newState = { ...this.state };

            // For each file
            for (const file of files) {
                // Get upload object
                const upload = this.props.parentChannel.addVideo(file);
                // Add to state
                newState.uploads.push({
                    upload,
                    id: newState.uploadId++, // Increment the id after usage
                    done: false,
                    title: upload.filename.replace(/\.[a-zA-Z0-9]+$/, ''),
                });
            }

            // Save changes
            this.setState(newState);

        }
    }

    /** Called when an upload is cancelled */
    handleUploadCancelled = (id: number): void => {
        const newState = { ...this.state };
        // Remove the item from the list
        newState.uploads.splice(newState.uploads.findIndex(x => x.id === id), 1);
        // Save
        this.setState(newState);
    }

    /** Called when an upload is complete */
    handleUploadComplete = (id: number): void => {
        const newState = { ...this.state };

        // Set the item from the list as done
        const upload = newState.uploads.find(x => x.id === id);
        if (upload) {
            upload.done = true;
        }
        // Save
        this.setState(newState);
    }

    /** Called when the title of an upload is modified */
    handleTitleChange = (id: number, title: string): void => {
        const newState = { ...this.state };

        // Set the item from the list as done
        const upload = newState.uploads.find(x => x.id === id);
        if (upload) {
            upload.title = title;
        }
        // Save
        this.setState(newState);
    }

    /** Tell mediaserver to save all the uploads as videos on the channel */
    saveAllUploads = async (): Promise<void> => {
        const promises = this.state.uploads.map(({ upload, title }) => upload.saveVideo({ title }));
        // Wait for all promises to resolve
        await Promise.all(promises);
        // Close the dialog
        this.close();
        this.props.handleDone();

    }

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
            <DialogTitle>{this.props.localization.Channel.dialogs.addVideoTitle}</DialogTitle>

            {/* Content */}
            <DialogContent>
                {   // Place one card by upload
                    this.state.uploads.map(({ upload, id, title: defaultTitle }) => {
                        return <UploadCard
                            localization={this.props.localization}
                            defaultTitle={defaultTitle}
                            onUploadComplete={(): void => this.handleUploadComplete(id)}
                            onTitleChange={(title): void => this.handleTitleChange(id, title)}
                            onUploadCancelled={(): void => this.handleUploadCancelled(id)}
                            key={id}
                            upload={upload}
                        />;
                    })
                }
                <DropzoneArea
                    dropzoneClass='margin-top alignContent-center'
                    acceptedFiles={['video/mp4', 'video/x-msvideo']}
                    maxFileSize={2147483648}
                    onDrop={this.addUpload}
                    clearOnUnmount
                    dropzoneText={this.props.localization.Channel.dialogs.dragNewVideo}
                    filesLimit={1}
                    showPreviews={false}
                    showPreviewsInDropzone={false}
                    showFileNames={false}
                    showFileNamesInPreview={false}
                    useChipsForPreview={false}
                    showAlerts={false}
                    inputProps={{
                        name: 'videoFile',
                    }}
                />

            </DialogContent>

            {/* Actions */}

            <DialogActions>

                <Button onClick={this.close}>
                    {this.props.localization.Channel.dialogs.cancel}
                </Button>

                <Button type='submit'
                    disabled={this.state.uploads.length === 0 || !this.state.uploads.every(x => x.done)}
                    onClick={this.saveAllUploads}
                >
                    {this.props.localization.Channel.actionsNames.add}
                </Button>

            </DialogActions>
        </Dialog >;
    }
}

export default AddVideoDialog;