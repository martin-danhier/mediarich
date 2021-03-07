/**
 * @file Definition of an UploadCard component
 * @version 1.0
 * @author Martin Danhier
 */

import { Card, CardContent, IconButton, LinearProgress, Tooltip, Typography } from '@material-ui/core';
import { Delete } from '@material-ui/icons';
import EditableTypography from 'components/editable-typography';
import { Localization } from 'components/localization-provider/types';
import React from 'react';
import VideoUpload from 'utils/mediaserver/classes/upload';

import './upload-card.style.css';

/** Props of a UploadCard component */
export interface UploadCardProps {
    /** The upload represented by this card */
    upload: VideoUpload;
    /** The default title of this file */
    defaultTitle: string;
    /** Callback called when the cancel button is clicked */
    onUploadCancelled: () => void;
    /** Callback called when the upload is complete */
    onUploadComplete: () => void;
    /** Callback called when the title is modified */
    onTitleChange: (newTitle: string) => void;
    /** Current localization object */
    localization: Localization;
}

/** State of a UploadCard component */
export interface UploadCardState {
    /** Value of the progress bar, between 0 and 100 */
    progressBar: number;
    /** Is the upload complete or not */
    done: boolean;
}

class UploadCard extends React.Component<UploadCardProps, UploadCardState> {

    /** Used to cancel the upload if this card is unmounted */
    working = true;

    constructor(props: UploadCardProps) {
        super(props);

        // Init state
        this.state = {
            progressBar: 0,
            done: false,
        };
    }

    // Cancel the upload on unmount
    componentWillUnmount(): void {
        this.working = false;
    }

    componentDidMount(): void {
        // Start uploading the file
        this.process();
    }

    /** Handles the upload of the file */
    async process(): Promise<void> {
        try {
            let uploadInProgress = true;
            const size = this.props.upload.size;

            // Continue the upload until it is finished
            // Also stop if the component is unmounted
            while (uploadInProgress && this.working) {
                uploadInProgress = await this.props.upload.continueUpload();

                const end = this.props.upload.end;

                // Update progress bar if still not done
                if (uploadInProgress && this.working) {
                    this.setState(prev => ({
                        ...prev,
                        progressBar: (end / size) * 100, // percentages done
                    }));
                }
            }

            // If it is still working at this point, that means that it finished
            if (this.working) {
                this.working = false;
                this.setState(prev => ({
                    ...prev,
                    progressBar: 100,
                    done: true,
                }));
                // call the callback
                this.props.onUploadComplete();
            }

        } catch (e) {
            console.error(e); //TODO handle
        }
    }

    /**
     * Main method of a React component. Called each time the component needs to render.
     * @returns a tree of react elements
     */
    render(): JSX.Element {
        return <Card variant='outlined' className='UploadCard-root'>
            <CardContent>
                {/* Editable title */}
                <div className='alignContent-right'>
                    <EditableTypography
                        typographyClassName='UploadCard-title'
                        typographyVariant='subtitle1'
                        defaultText={this.props.defaultTitle}
                        onRename={this.props.onTitleChange}
                    />
                    <div className='expand' />
                    {/* Delete button */}
                    <Tooltip title={this.props.localization.Channel.dialogs.cancel}>
                        <IconButton
                            onClick={this.props.onUploadCancelled}
                        >
                            <Delete />
                        </IconButton>
                    </Tooltip>
                </div>
                <Typography>
                    {this.state.done ?
                        this.props.localization.Channel.dialogs.uploadComplete
                        : this.props.localization.Channel.dialogs.uploadInProgress}
                </Typography>
                {/* Progress bar */}
                <LinearProgress
                    className='margin-top'
                    variant='determinate'
                    value={this.state.progressBar}

                />
            </CardContent>
        </Card>;
    }
}

export default UploadCard;