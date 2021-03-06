import { Card, CardContent, IconButton, LinearProgress, Tooltip, Typography } from '@material-ui/core';
import { Delete } from '@material-ui/icons';
import EditableTypography from 'components/editable-typography';
import { Localization } from 'components/localization-provider/types';
import React from 'react';
import VideoUpload from 'utils/mediaserver/classes/upload';

import './upload-card.style.css';

export interface UploadCardProps {
    upload: VideoUpload;
    defaultTitle: string;
    onDelete: () => void;
    onUploadComplete: (title: string) => void;
    localization: Localization;
}

export interface UploadCardState {
    title: string;
    progressBar: number;
    done: boolean;
}

class UploadCard extends React.Component<UploadCardProps, UploadCardState> {

    /** Used to cancel the upload if this card is unmounted */
    working = true;

    constructor(props: UploadCardProps) {
        super(props);

        this.state = {
            title: this.props.defaultTitle,
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
                this.props.onUploadComplete(this.state.title);
            }

        } catch (e) {
            console.error(e); //TODO handle
        }
    }

    render(): JSX.Element {
        return <Card variant='outlined' className='UploadCard-root'>
            <CardContent>
                {/* Editable title */}
                <div className='alignContent-right'>
                    <EditableTypography
                        typographyClassName='UploadCard-title'
                        variant='subtitle1'
                        defaultText={this.props.defaultTitle}
                        onRename={(newText): void => {
                            this.setState(prev => ({
                                ...prev,
                                title: newText,
                            }));
                        }}
                    />
                    <div className='expand' />
                    {/* Delete button */}
                    <Tooltip title={this.props.localization.Channel.dialogs.cancel}>
                        <IconButton
                            onClick={this.props.onDelete}
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