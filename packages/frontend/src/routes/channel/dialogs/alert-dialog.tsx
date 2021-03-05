import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@material-ui/core';
import React from 'react';

interface ConfirmationDialogProps {
    /** Whether the dialog should be open or not. */
    open: boolean;
    /** Title of the dialog */
    title: string;
    /** Description of the dialog */
    description: string;
    /** Cancel button text */
    cancelButtonText: string;
    /** Submit button text */
    submitButtonText: string;
    /** Function to close the dialog. Don't handle the result here but in `onValidate`. */
    handleClose: () => void;
    /** Function called when the submit button is pressed. */
    onSubmit?: () => void | Promise<void>;
}

/** Dialog displaying a title, a message, and two buttons */
class AlertDialog extends React.Component<ConfirmationDialogProps> {
    render(): JSX.Element {
        return <Dialog
            open={this.props.open}
            onClose={this.props.handleClose}
        >
            {/* TItle */}
            <DialogTitle>{this.props.title}</DialogTitle>

            {/* Description */}
            <DialogContent>
                <DialogContentText>
                    {this.props.description}
                </DialogContentText>
            </DialogContent>

            {/* Buttons */}
            <DialogActions>
                <Button onClick={this.props.handleClose}>
                    {this.props.cancelButtonText}
                </Button>
                <Button onClick={(): void => {
                    this.props.handleClose();
                    if (this.props.onSubmit) {
                        this.props.onSubmit();
                    }
                }}
                >
                    {this.props.submitButtonText}
                </Button>
            </DialogActions>
        </Dialog>;
    }
}

export default AlertDialog;