import { Button, ButtonGroup, IconButton, Tooltip, Typography } from '@material-ui/core';
import React from 'react';
import { RouteComponentProps } from 'react-router';
import { DataGrid, GridColDef, GridRowsProp } from '@material-ui/data-grid';
import { Add, Check, Clear, Delete, Edit, Public } from '@material-ui/icons';
import { Icon } from '@iconify/react';
import moveFile from '@iconify/icons-ic/round-drive-file-move';
import { formatDuration, toUpperCaseFirstLetter } from 'utils/useful-functions';

import './channel-content.style.css';
import assert from 'utils/assert';
import EditableTypography from '../../../components/editable-typography';
import { format } from 'date-fns';
import { Localization } from 'components/localization-provider/types';

export interface ChannelContentListProps extends RouteComponentProps {
    title: string;
    columns: GridColDef[];
    rows: GridRowsProp;
    localization: Localization;
    addItem?: () => void;
    editItems?: (items: string[]) => void;
    publishItems?: (items: string[]) => void;
    moveItems?: (items: string[]) => void;
    deleteItems?: (items: string[]) => void;
    deletePermissionCheck: (item: string) => boolean;
    editPermissionCheck: (item: string) => boolean;
}

export interface DataGridActionColumnParams {
    icon: JSX.Element;
    onClick?: () => void;
    disabled?: boolean;
}

export interface DataGridEditableColumnParams {
    defaultText: string;
    onUpdate: (newText: string) => (void | Promise<void>);
    disabled?: boolean;
}

interface ChannelContentListState {
    selectionModel: string[];
}

class ChannelContentList extends React.Component<ChannelContentListProps, ChannelContentListState> {
    constructor(props: ChannelContentListProps) {
        super(props);
        // Init state
        this.state = {
            selectionModel: [],
        };
    }

    render(): JSX.Element {
        return (
            <div className='ChannelContent-wrapper'>
                {/* Top bar */}
                <div className='ChannelContent-row'>
                    <Typography variant='h5'>{this.props.title}</Typography>

                    {/* Add button */}
                    <Tooltip
                        title={toUpperCaseFirstLetter(this.props.localization.Channel.actionsNames.add)}
                    >
                        {/* Wrap in span so that the tooltip can still receive events even when the button is disabled */}
                        <span>
                            <IconButton
                                className='ChannelContent-addButton'
                                disabled={this.props.addItem === undefined}
                                onClick={(): void => {
                                    if (this.props.addItem) {
                                        this.props.addItem();
                                    }
                                }}
                            ><Add />
                            </IconButton>
                        </span>
                    </Tooltip>

                    {/* Fill the space */}
                    <div className='expand' />

                    {/* Button bar */}
                    <ButtonGroup
                        size='small'

                    >
                        {/* Edit button */}
                        {this.props.editItems !== undefined && <Button startIcon={<Edit />}
                            disabled={this.state.selectionModel.length === 0 || !this.state.selectionModel.every(this.props.editPermissionCheck)}
                            onClick={(): void => {
                                if (this.props.editItems) {
                                    this.props.editItems(this.state.selectionModel);
                                }
                            }}
                        >
                            {this.props.localization.Channel.actionsNames.edit}
                        </Button>}
                        {/* (Un)publish button */}

                        {this.props.publishItems !== undefined && <Button
                            startIcon={<Public />}
                            disabled={this.state.selectionModel.length === 0 || !this.state.selectionModel.every(this.props.editPermissionCheck)}
                            onClick={(): void => {
                                if (this.props.publishItems) {
                                    this.props.publishItems(this.state.selectionModel);
                                }
                            }}
                        >
                            {this.props.localization.Channel.actionsNames.publish}
                        </Button>}

                        {/* Move button */}
                        {this.props.moveItems !== undefined && <Button
                            startIcon={<Icon icon={moveFile} />}
                            disabled={this.state.selectionModel.length === 0 || !this.state.selectionModel.every(this.props.editPermissionCheck)}
                            onClick={(): void => {
                                if (this.props.moveItems) {
                                    this.props.moveItems(this.state.selectionModel);
                                }
                            }}
                        >
                            {this.props.localization.Channel.actionsNames.move}
                        </Button>}
                        {/* Delete button */}
                        <Button
                            startIcon={<Delete />}
                            disabled={this.state.selectionModel.length === 0 || !this.state.selectionModel.every(this.props.deletePermissionCheck)}
                            onClick={(): void => {
                                if (this.props.deleteItems) {
                                    this.props.deleteItems(this.state.selectionModel);
                                }
                            }}
                        >
                            {this.props.localization.Channel.actionsNames.delete}
                        </Button>
                    </ButtonGroup>
                </div>
                <div>
                    {/* Data grid itself */}
                    <DataGrid
                        autoHeight
                        // Keep track of the selected lines
                        onSelectionModelChange={({ selectionModel }): void => {
                            this.setState({
                                selectionModel: selectionModel as string[]
                            });
                        }}
                        disableColumnReorder
                        disableSelectionOnClick
                        disableColumnMenu
                        className='ChannelContent-dataGrid margin-vertical'
                        disableMultipleColumnsSorting
                        disableColumnFilter
                        hideFooter
                        checkboxSelection={true}
                        hideFooterPagination
                        localeText={{
                            noRowsLabel: this.props.localization.Channel.noRows,
                            errorOverlayDefaultLabel: this.props.localization.Channel.error,
                        }}
                        // Define custom column types
                        columnTypes={{
                            // Editable: a string that can change to a textfield when clicked.
                            editable: {
                                filterable: false,
                                sortable: true,
                                sortComparator: (v1, v2): number => {
                                    const data1 = v1 as DataGridEditableColumnParams;
                                    const data2 = v2 as DataGridEditableColumnParams;

                                    // Assertions on the value
                                    assert(typeof data1 === 'object', 'The value in an field must be a DataGridEditableColumnParams');
                                    assert(typeof data2 === 'object', 'The value in an field must be a DataGridEditableColumnParams');
                                    assert(typeof data1.defaultText === 'string', 'The "defaultText" must be a string');
                                    assert(typeof data2.defaultText === 'string', 'The "defaultText" must be a string');

                                    const a: string = data1.defaultText;
                                    const b: string = data2.defaultText;

                                    // Compare
                                    if (a > b) return 1;
                                    if (a < b) return -1;
                                    return 0;
                                },
                                renderCell: (params): JSX.Element => {
                                    const data = params.value as DataGridEditableColumnParams;

                                    // Asserts to check that the column type is used correclty
                                    assert(typeof data === 'object', 'The value in an field must be a DataGridEditableColumnParams');
                                    assert(typeof data.defaultText === 'string', 'The "defaultText" must be a string');
                                    assert(typeof data.disabled === 'boolean' || data.disabled === undefined, 'The "disabled" field must be a boolean');
                                    assert(typeof data.onUpdate === 'function', 'The "onUpdate" callback must be a function');

                                    return <EditableTypography
                                        key={data.defaultText}
                                        defaultText={data.defaultText}
                                        onRename={data.onUpdate}
                                        disabled={data.disabled}
                                    />;
                                },
                            },
                            // Define a clean boolean field
                            boolean: {
                                filterable: false,
                                headerClassName: 'ChannelContent-header',
                                width: 100,
                                headerAlign: 'left',
                                align: 'center',
                                renderCell: (params): JSX.Element => {
                                    assert(typeof params.value === 'boolean', 'The value in a boolean field must be boolean (obviously)');

                                    // Use icons to show the value
                                    if (params.value) {
                                        return <Check htmlColor='green' />;
                                    } else {
                                        return <Clear htmlColor='red' />;
                                    }
                                }
                            },
                            // Date
                            date: {
                                filterable: false,
                                headerClassName: 'ChannelContent-header',
                                renderCell: (params): JSX.Element => {
                                    // Get the date
                                    const date = params.value as Date;
                                    assert(date instanceof Date, 'The value in a date field must be a Date');

                                    return <Typography>{format(date, 'dd/MM/y')}</Typography>;
                                }
                            },
                            // Duration
                            duration: {
                                sortable: true,
                                headerClassName: 'ChannelContent-header',
                                sortComparator: (v1, v2): number => {
                                    const dur1 = v1 as Duration;
                                    const dur2 = v2 as Duration;

                                    // Get the total number of seconds of the two durations
                                    const a = (dur1.hours ?? 0) * 3600 + (dur1.minutes ?? 0) * 60 + (dur1.seconds ?? 0);
                                    const b = (dur2.hours ?? 0) * 3600 + (dur2.minutes ?? 0) * 60 + (dur2.seconds ?? 0);

                                    // Compare
                                    if (a > b) return 1;
                                    if (a < b) return -1;
                                    return 0;
                                },
                                renderCell: (params): JSX.Element => {
                                    // Get the date
                                    const data = params.value as Duration;

                                    return <Typography>{formatDuration(data)}</Typography>;
                                }
                            },
                            // Number
                            number: {
                                headerClassName: 'ChannelContent-header',
                                align: 'left',
                                headerAlign: 'left',
                            },
                            // String
                            string: {
                                headerClassName: 'ChannelContent-header',
                            },
                            // Action column, that can contain icon buttons
                            action: {
                                disableClickEventBubbling: true,
                                filterable: false,
                                sortable: false,
                                width: 50,
                                headerAlign: 'center',
                                headerClassName: 'ChannelContent-header',
                                cellClassName: 'ChannelContent-actionColumn',
                                align: 'center',
                                renderCell: (params): JSX.Element => {
                                    const data = params.value as DataGridActionColumnParams;

                                    // Assert that the data is valid
                                    // We make a lot of assertions because typescript doesn't block type errors here
                                    assert(typeof data === 'object', 'The value of a action column should be a "DataGridActionColumnParams"');
                                    assert(data.icon !== undefined, 'The "icon" field is missing');
                                    assert(React.isValidElement(data.icon), 'The "icon" field must be a react element');
                                    assert(data.disabled === undefined || typeof data.disabled === 'boolean', 'The "disabled" field must be of type "boolean | undefined"');
                                    assert(data.onClick === undefined || typeof data.onClick === 'function', 'The "onClick" field must be of type "function | undefined"');

                                    // Define the button
                                    const button = <IconButton
                                        className='ChannelContent-actionColumnButton'
                                        disabled={data.disabled}
                                        onClick={data.onClick}
                                    >
                                        {data.icon}
                                    </IconButton>;

                                    // Wrap in a tooltip if a description is provided
                                    return params.colDef.description !== undefined ?
                                        <Tooltip title={params.colDef.description}>
                                            {/* Wrap in a span so that the tooltip can still receive hover events when the button is disabled. */}
                                            <span>
                                                {button}
                                            </span>
                                        </Tooltip> : button;
                                }
                            }
                        }}
                        columns={this.props.columns}
                        rows={this.props.rows}
                    />

                </div>
            </div>
        );
    }
}

export default ChannelContentList;