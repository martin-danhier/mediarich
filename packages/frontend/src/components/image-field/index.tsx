/**
 * @file Definition of an ImageField component
 * @version 1.0
 * @author Martin Danhier
 * @license Apache
*/

import './image-field.style.css';

import { DropzoneArea } from 'material-ui-dropzone';
import React from 'react';

import { Link, Typography } from '@material-ui/core';

/**
 * Props of an ImageField component
 */
export interface ImageFieldProps {
    /** HTML name of the field. Used by Form to recognize the field */
    name: string;
    /** Optional URL of the default image */
    defaultImageUrl?: string;
    /** Text to displayed on the dropzone (e.g. "Drag and drop an image here") */
    dropzoneText: string;
    /** Title of the field (displayed above the current thumbnail) */
    title: string;
    /** Callback called when a new image is provided */
    onChange?: (file: File | null) => void;
}

/**
 * State of an ImageField component
 */
export interface ImageFieldState {
    /** URL of the displayed image on the left */
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

            // If loaded, display it
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

    /**
     * Main method of a React component. Called each time the component needs to render.
     * @returns a tree of react elements
     */
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

            {/* Display reset link if the field is not empty */}
            {this.state.currentImageURL && <Typography className='padding-vertical'><Link className='ImageField-reset' onClick={this.handleReset}>Supprimer l image</Link></Typography>}
        </div>;
    }
}

export default ImageField;