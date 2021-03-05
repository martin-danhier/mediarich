import React from 'react';
import { Localization } from 'components/localization-provider/types';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Typography } from '@material-ui/core';
import Form from 'components/form';
import CustomTextField from 'components/text-field';

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

export interface ChannelAddState {
    title: string;
}

export class AddChannelDialog extends React.Component<AddChannelDialogProps> {

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

                    <Typography align='justify' className='margin-bottom'>{this.props.localization.Channel.dialogs.addChannelUnlistedWarning}</Typography>

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