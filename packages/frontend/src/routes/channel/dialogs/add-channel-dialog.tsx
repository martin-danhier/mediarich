/**
 * @file Definition of an AddChannelDialog component
 * @version 1.0
 * @author Martin Danhier
 * @license Apache
*/

import React from 'react';
import { Localization } from 'components/localization-provider/types';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Typography } from '@material-ui/core';
import Form from 'components/form';
import CustomTextField from 'components/text-field';

/** Props of an AddChannelDialog component */
export interface AddChannelDialogProps {
    /** Should the dialog be opened or not */
    open: boolean;
    /** Function to close the dialog. Don't handle the result here but in `onValidate`. */
    handleClose: () => void;
    /** Localization */
    localization: Localization;
    /** Called on submit */
    handleSubmit: (data: ChannelAddState) => void | Promise<void>;
}

/** State of a channel add form */
export interface ChannelAddState {
    /** Title of the new channel */
    title: string;
}

/**
 * Dialog with a form to get new channel data
 */
export class AddChannelDialog extends React.Component<AddChannelDialogProps> {

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
            <DialogTitle>{this.props.localization.Channel.dialogs.addChannelTitle}</DialogTitle>

            <Form<ChannelAddState>
                initialState={{
                    title: '',
                }}
                onSubmit={(data): void => {
                    this.props.handleSubmit(data);
                }}
            >
                {/* Content */}
                <DialogContent>

                    {/* Warning about unlisted */}
                    <Typography align='justify' className='margin-bottom'>{this.props.localization.Channel.dialogs.addChannelUnlistedWarning}</Typography>

                    {/* Title field */}
                    <CustomTextField
                        className='margin-top'
                        label={this.props.localization.Channel.fieldsNames.title}
                        name='title'
                        required
                        noMargin
                        autoComplete='off'
                        autoFocus
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

export default AddChannelDialog;