/**
 * @file Definition of an MoveDialog component
 * @version 1.0
 * @author Martin Danhier
 * @license Apache
*/

import './move-dialog.style.css';

import { Localization } from 'components/localization-provider/types';
import React, { ChangeEvent } from 'react';
import assert from 'utils/assert';
import MSChannel from 'utils/mediaserver/classes/channel';

import {
    Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField
} from '@material-ui/core';
import { Autocomplete } from '@material-ui/lab';

/** Props of a MoveDialog component */
export interface MoveDialogProps {
    /** Should the dialog be opened or not */
    open: boolean;
    /** Title of the dialog */
    title: string;
    /** Default data to prefill the fields */
    currentParentSlug: string;
    /** Function to close the dialog. Don't handle the result here but in `onValidate`. */
    handleClose: () => void;
    /** Function called when the submit button is pressed. */
    onSubmit?: (destination: string) => void | Promise<void>;
    /** List of all channels */
    potentialDestinationChannelsSlugs: string[];
    /** Localization */
    localization: Localization;
    /** Paths of each channel index by slug */
    paths: Record<string, string>;
    /** Channels */
    channels: Record<string, MSChannel>;
}

/** State of a MoveDialog component */
export interface MoveDialogState {
    selected: string;
}

/** Dialog with a field to get new parent channel for move */
class MoveDialog extends React.Component<MoveDialogProps, MoveDialogState> {

    constructor(props: MoveDialogProps) {
        super(props);


        // Init state
        this.state = {
            selected: props.currentParentSlug,
        };
    }


    /** Called when the selected item changes */
    handleSelectedChanges = (e: ChangeEvent<{}>, value: string): void => {
        this.setState({
            selected: value
        });
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
            <DialogTitle>{this.props.title}</DialogTitle>

            {/* Content */}
            <DialogContent>
                <Autocomplete
                    disableClearable
                    autoComplete
                    noOptionsText={this.props.localization.Channel.dialogs.noOptions}
                    /* Group together the channels with the same parent */
                    groupBy={(slug): string => {

                        // Get the parent path
                        const match = /^(?<parent>(?:\/[^/]+)*\/)[^/]+$/.exec(this.props.paths[slug]);
                        assert(match && match.groups && match.groups.parent, 'The regex should match.');

                        return match.groups.parent;
                    }}
                    value={this.state.selected}
                    /* Used options. We sort them to avoid duplicated in the grouping */
                    options={this.props.potentialDestinationChannelsSlugs}
                    getOptionLabel={(slug): string => {
                        return this.props.paths[slug] ?? '';
                    }}
                    fullWidth
                    filterOptions={(options, state): string[] => {
                        return options.filter((slug) => {
                            assert(this.props.channels[slug].title !== undefined, 'Each channel must have a title.');
                            return this.props.channels[slug].title?.toLowerCase().includes(state.inputValue.toLowerCase()) || this.props.paths[slug].includes(state.inputValue);
                        });
                    }}
                    onChange={this.handleSelectedChanges}
                    renderOption={(slug, state): JSX.Element => {

                        assert(this.props.channels[slug].title !== undefined, 'Each channel must have a title.');

                        return <div className='MoveDialog-autocompleteItem'>
                            <span className='MoveDialog-autocompleteItemTitle'>{this.props.channels[slug].title}</span>
                            <span className='MoveDialog-autocompleteItemPath'>{this.props.paths[slug]}</span>
                        </div>;
                    }}
                    renderInput={(params): JSX.Element => {
                        return <TextField
                            {...params}
                            label='Destination'
                            variant='outlined'
                            autoComplete='off'
                            inputProps={{
                                ...params.inputProps,
                            }}
                        />;
                    }}

                />
            </DialogContent>

            {/* Actions */}
            <DialogActions>
                <Button onClick={this.props.handleClose}>
                    {this.props.localization.Channel.dialogs.cancel}
                </Button>
                <Button onClick={(): void => { if (this.props.onSubmit) this.props.onSubmit(this.state.selected); }}>
                    {this.props.localization.Channel.actionsNames.move}
                </Button>
            </DialogActions>
        </Dialog >;
    }
}

export default MoveDialog;