import { Link, Typography } from '@material-ui/core';
import { DropzoneArea } from 'material-ui-dropzone';
import React from 'react';

import './image-field.style.css';

export interface ImageFieldProps {
    name: string;
    defaultImageUrl?: string;
    dropzoneText: string;
    title: string;
    onChange?: (file: File | null) => void;
}

export interface ImageFieldState {
    currentImageURL: string | null;
}

/** Beautiful field to edit images */
class ImageField extends React.Component<ImageFieldProps, ImageFieldState> {

    constructor(props: ImageFieldProps) {
        super(props);

        // init empty state
        this.state = {
            currentImageURL: null,
        };
    }

    /** Called when the file changes */
    handleChange = (files: File[]): void => {
        if (files.length > 0) {
            const file = files[0];

            // Use a reader to get the file
            const reader = new FileReader();
            reader.readAsDataURL(file);

            // // If loaded, display it
            reader.onloadend = (e): void => {
                if (!(reader.result instanceof ArrayBuffer)) {
                    this.setState({
                        currentImageURL: reader.result,
                    });
                }
            };

            // Call the callback with the file
            if (this.props.onChange) {
                this.props.onChange(file);
            }

        }
    }

    /** Resets the field and removes the image */
    handleReset = (): void => {
        this.setState({
            currentImageURL: null,
        });

        // Call the callback with null to remove the image
        if (this.props.onChange) {
            this.props.onChange(null);
        }
    }

    render(): JSX.Element {
        return <div>
            <div className='ImageField-thumbnailRow'>
                {/* Current thumbnail */}
                <div className='ImageField-currentThumbnailWrapper'>

                    <Typography variant='h6' className='expand'>{this.props.title}</Typography>

                    {/* Rectangle with the current thumbail*/}
                    <div className='ImageField-currentThumbnail'>
                        {(this.state.currentImageURL || this.props.defaultImageUrl) &&
                            <img
                                src={this.state.currentImageURL ?? this.props.defaultImageUrl}
                                alt={this.props.title} />}
                    </div>
                </div>
                {/* Dropzone for new thumbnail */}
                <DropzoneArea
                    dropzoneClass='ImageField-dropZone-root'
                    acceptedFiles={['image/png', 'image/jpeg']}
                    dropzoneText={this.props.dropzoneText}
                    filesLimit={1}
                    classes={{
                        text: 'ImageField-dropZonePromptText',
                        icon: 'ImageField-dropZoneIcon',
                    }}
                    onChange={this.handleChange}
                    useChipsForPreview={false}
                    showPreviewsInDropzone={false}
                    showPreviews={false}
                    showAlerts={false}
                    inputProps={{
                        name: this.props.name,
                    }}
                />
            </div>

            {this.state.currentImageURL && <Typography className='padding-vertical'><Link className='ImageField-reset' onClick={this.handleReset}>Supprimer l image</Link></Typography>}
        </div>;
    }
}

export default ImageField;