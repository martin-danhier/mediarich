import { Breadcrumbs, Button, Link, Typography } from '@material-ui/core';
import LoadingScreen from 'components/loading-screen';
import { MediaServerProviderState } from 'components/mediaserver-provider';
import Scaffold from 'components/scaffold';
import { DrawerMenuItem } from 'components/scaffold/drawer-menu';
import React from 'react';
import { RouteComponentProps } from 'react-router';
import { MSChannelTreeItem, MSVideo } from 'utils/mediaserver';
import MSChannel from 'utils/mediaserver/classes/channel';

import { Localization } from 'components/localization-provider/types';
import { filterObject, stringToDuration, toUpperCaseFirstLetter } from 'utils/useful-functions';
import ChannelContentList, { DataGridActionColumnParams, DataGridEditableColumnParams } from '../channel-content-list';
import './scaffold.style.css';
import AlertDialog from '../dialogs/alert-dialog';
import { Delete, Edit, OpenInNew } from '@material-ui/icons';
import { GridRowsProp } from '@material-ui/data-grid';
import MSContent from 'utils/mediaserver/classes/content';
import EditDialog from '../dialogs/edit-dialog';

export interface ChannelScaffoldRouterProps {
    slug: string;
}

export interface ChannelScaffoldProps extends RouteComponentProps<ChannelScaffoldRouterProps> {
    mediaServerContext: MediaServerProviderState;
    localization: Localization;
}

export interface ChannelScaffoldState {
    /** Channels objects, indexed by slug (for easy access with the URL parameter) */
    channels: Record<string, MSChannel>;
    /** Video objects, indexed by slug */
    videos: Record<string, MSVideo>;
    /** Subchannels slugs */
    subchannelsSlugs: string[];
    /** Menu items to display in the drawer, organized as a tree */
    menuItems: DrawerMenuItem<string>[];
    /** If true, the loading screen will be displayed */
    loading: boolean;
    /** If true, the loading screen will be displayed in the content section */
    innerLoading: boolean;
    /** If an error message is provided, it will be displayed on the loading screen */
    error: string;
    /** Current channel slug */
    current: string;
    /** Data of the alert dialog */
    alertDialog: {
        open: boolean;
        title: string;
        description: string;
        submitText: string;
        onValidate?: () => void | Promise<void>;
    };
    /** Data of the edit dialog */
    editDialog: {
        defaultData: {
            title?: string;
            description?: string;
            thumbnailURL?: string;
        };
        omitEmpty: boolean;
        open: boolean;
        title: string;
        submitText: string;
        onValidate?: () => void | Promise<void>;
    };
}

class ChannelScaffold extends React.Component<ChannelScaffoldProps, ChannelScaffoldState> {

    constructor(props: ChannelScaffoldProps) {
        super(props);

        // Init empty state
        this.state = {
            channels: {},
            videos: {},
            menuItems: [],
            subchannelsSlugs: [],
            loading: true,
            innerLoading: false,
            error: '',
            current: '',
            alertDialog: {
                open: false,
                title: '',
                submitText: '',
                description: '',
            },
            editDialog: {
                open: true,
                omitEmpty: false,
                title: 'Edit a channel',
                submitText: 'Edit',
                defaultData: {
                    title: '',
                    thumbnailURL: '',
                    description: '',
                }
            }
        };
    }

    // Called when the component is mounted
    async componentDidMount(): Promise<void> {

        // Get the list of channels for the menu
        let mediaserver = this.props.mediaServerContext.mediaserver;
        let slug = this.props.match.params.slug;

        // Mediaserver null or undefined : not connected, try to refresh it
        if (!mediaserver) {
            try {
                mediaserver = await this.props.mediaServerContext.refresh(this.props.history, this.props.location.pathname);
            }
            catch (e) {
                this.setState(prev => ({
                    ...prev,
                    error: this.props.localization.Channel.error,
                }));
            }
        }
        // If there is a mediaserver
        if (mediaserver) {
            try {
                // /channel/my is a special URL reserved as a shortcut to the personnal channel
                if (slug === 'my') {
                    // Find the personnal channel
                    const myChannel = await mediaserver.myChannel();
                    if (myChannel && myChannel.slug) {
                        // Go to that page
                        this.props.history.push(`/channel/${myChannel.slug}`);
                        slug = myChannel.slug;
                    }
                }

                // Load the channels
                const channels: Record<string, MSChannel> = {};
                const menuItems = this.msTreeToDrawerTree(await mediaserver.channelsTree(), channels);

                // Redirect if the current channel does not exist
                if (!Object.keys(channels).includes(slug)) {
                    const firstChannel = Object.keys(channels)[0];
                    this.props.history.push(`/channel/${firstChannel}`);
                    slug = firstChannel;
                }

                // Get infos about the current channel
                const result = await this.fetchCurrentChannelInfos(slug, channels);


                this.setState(prev => ({
                    ...prev,
                    channels: result.channels,
                    videos: result.videos,
                    subchannelsSlugs: result.subchannelsSlugs,
                    menuItems,
                    current: slug,
                    loading: false,
                }));
            }
            catch {
                this.setState(prev => ({
                    ...prev,
                    error: this.props.localization.Channel.error,
                }));
            }
        }
    }

    /** Fetches infos about the current channel */
    async fetchCurrentChannelInfos(slug: string, channels: Record<string, MSChannel>): Promise<{
        channels: Record<string, MSChannel>;
        videos: Record<string, MSVideo>;
        subchannelsSlugs: string[];
    }> {
        // Load content of the current channel
        await channels[slug].fetchInfos(false);
        const result = await channels[slug].content(true, true);
        if (result === undefined) {
            throw Error('Unknown error');
        }

        // Save channels
        const subchannelsSlugs: string[] = [];
        for (const channel of result.channels) {
            if (channel.slug) {
                channels[channel.slug] = channel;
                subchannelsSlugs.push(channel.slug);
            }
        }

        // Save videos
        const videos: Record<string, MSVideo> = {};
        for (const video of result.videos) {
            if (video.slug) {
                videos[video.slug] = video;
            }
        }

        return {
            channels,
            subchannelsSlugs,
            videos,
        };
    }

    /** Called on update. We use it to refresh the channel when a new one is selected. */
    componentDidUpdate = async (): Promise<void> => {
        const current = this.props.match.params.slug;
        // Refresh if the current channel changed
        if (current !== this.state.current && !this.state.loading) {

            // Go back to loading mode
            this.setState(prev => ({
                ...prev,
                innerLoading: true,
                current,
            }));

            // Fetch infos about the current channel
            const result = await this.fetchCurrentChannelInfos(current, this.state.channels);

            this.setState(prev => ({
                ...prev,
                innerLoading: false,
                channels: result.channels,
                videos: result.videos,
                subchannelsSlugs: result.subchannelsSlugs,
            }));
        }
    }

    /** Converts a channel tree to a menu item tree */
    msTreeToDrawerTree(tree: MSChannelTreeItem[], channels: Record<string, MSChannel>): DrawerMenuItem<string>[] {
        const list: DrawerMenuItem<string>[] = [];

        for (const item of tree) {
            // Create menu item
            const menuItem: DrawerMenuItem<string> = {
                label: item.title,
                url: `/channel/${item.slug}`,
                data: item.slug,
            };

            // Append channel to list
            channels[item.slug] = item.channel;

            // Parse children recursively
            if (item.children) {
                menuItem.children = this.msTreeToDrawerTree(item.children, channels);
            }

            list.push(menuItem);
        }

        return list;
    }

    /** Scans the tree and builds the breadcrumbs and gets subchannels of the current channel */
    buildBreadcrumbsAndGetSubchannels(url: string, channels: DrawerMenuItem<string>[], builtList: JSX.Element[], subchannels: DrawerMenuItem<string>[]): boolean {
        for (const channel of channels) {
            // If it is the destination, add it as a typography
            if (channel.url === url) {
                builtList.push(<Typography key={builtList.length} color='textPrimary'>{channel.label}</Typography>);
                // Also store subchannels. We use a for because the object is passed by reference
                const children = channel.children ?? [];
                for (const item of children) {
                    subchannels.push(item);
                }
                return true;
            }
            // If it has children
            else if (channel.children && channel.children.length > 0) {
                const hasChannelInChildren = this.buildBreadcrumbsAndGetSubchannels(url, channel.children, builtList, subchannels);
                // Add it if in path
                if (hasChannelInChildren) {
                    builtList.push(<Link key={builtList.length} className='ChannelScaffold-breadcrumbsLink' onClick={(): void => this.props.history.push(channel.url)}>{channel.label}</Link>);
                    return true;
                }
            }
        }
        return false;
    }


    /** Generates items for the list */
    generateSubchannelList(): GridRowsProp {
        return this.state.subchannelsSlugs.map((slug) => {
            const channel = this.state.channels[slug];
            return {
                id: slug,
                title: {
                    defaultText: channel.title,
                    disabled: !channel.canEdit,
                    onUpdate: (newText) => this.onRename(channel, newText),
                } as DataGridEditableColumnParams,
                public: !channel.unlisted,
                delete: {
                    icon: <Delete />,
                    // Disable if the user doesn't have the permission
                    disabled: !channel.canDelete,
                    onClick: () => {
                        this.onDelete([channel], false);
                    }
                } as DataGridActionColumnParams,
                visit: {
                    icon: <OpenInNew />,
                    onClick: () => {
                        console.log(`I wanna see the channel ${slug}`);
                    }
                } as DataGridActionColumnParams,
            };
        });
    }

    generateVideoList(): GridRowsProp {
        return Object.keys(this.state.videos).map((slug) => {
            const video = this.state.videos[slug];
            return {
                id: slug,
                title: {
                    defaultText: video.title,
                    disabled: !video.canEdit,
                    onUpdate: (newText) => this.onRename(video, newText),
                } as DataGridEditableColumnParams,
                addDate: video.addDate,
                views: video.views,
                duration: stringToDuration(video.duration ?? '0'),
                public: !video.unlisted,
                edit: {
                    icon: <Edit />,
                    disabled: !video.canEdit,
                    onClick: () => {
                        console.log(`I wanna edit the video ${video.slug}`);
                    },
                } as DataGridActionColumnParams,
                delete: {
                    icon: <Delete />,
                    disabled: !video.canDelete,
                    onClick: () => {
                        this.onDelete([video], true);
                    },
                } as DataGridActionColumnParams,
                visit: {
                    icon: <OpenInNew />,
                    onClick: () => {
                        console.log(`I wanna see the video ${video.slug}`);
                    }
                } as DataGridActionColumnParams,
            };
        });
    }


    /** Rename a series of MSContents */
    async onRename(selected: MSContent, newTitle: string): Promise<void> {
        const edited = await selected.edit({
            title: newTitle,
        });
        if (!edited) {
            console.log('nope'); //TODO
        }
        else {
            this.props.mediaServerContext.triggerRebuild();
        }

    }

    onEdit(selected: MSVideo[]): void {
        const localization = this.props.localization.Channel;

        // Get object name with the correct plural if needed
        let objectName = (selected.length > 1 ? localization.videos : localization.video).toLowerCase();

        // Generate title and description
        const title = `${localization.actionsNames.edit} ${selected.length} ${objectName}`;
        // const description = `${localization.dialogs.areYouSure} ${title.toLowerCase()} ${publishinfo}`;

        // Take the data of the first video
        let thumbnail: string | undefined = selected[0].thumb;
        let currentTitle: string | undefined = selected[0].title;
        let currentDescription: string | undefined = selected[0].description;

        // Only keep default values for the fields if every field has identical values in it
        for (const video of selected) {
            // Check thumbnail
            if (thumbnail && thumbnail !== video.thumb) {
                thumbnail = undefined;
            }
            // Check title
            if (currentTitle && currentTitle !== video.title) {
                currentTitle = undefined;
            }
            // Check description
            if (currentDescription && currentDescription !== video.description) {
                currentDescription = undefined;
            }
        }

        this.setState(prev => ({
            ...prev,
            editDialog: {
                open: true,
                submitText: localization.actionsNames.edit,
                title: toUpperCaseFirstLetter(title),
                omitEmpty: selected.length > 1 && (currentDescription === undefined || currentDescription === undefined),
                defaultData: {
                    title: currentTitle,
                    description: currentDescription,
                    thumbnailURL: thumbnail,
                },
                onValidate: () => {
                    console.log('save !');
                }
            }
        }));
    }

    /** Toggle the unlisted property of a list of channels */
    onPublish(selected: MSContent[], isVideo: boolean): void {
        const localization = this.props.localization.Channel;

        // Get object name with the correct plural if needed
        let objectName: string;
        if (isVideo) {
            objectName = selected.length > 1 ? localization.videos : localization.video;
        }
        else {
            objectName = selected.length > 1 ? localization.channels : localization.channel;
        }
        objectName = objectName.toLowerCase();

        // Generate title and description
        const title = `${localization.actionsNames.publish} ${selected.length} ${objectName} ?`;
        const publishinfo = selected.length > 1 ?
            `${localization.dialogs.publishInfoStartPlural} ${objectName} ${localization.dialogs.publishInfoEndPlural}`
            : localization.dialogs.publishInfoSingular;
        const description = `${localization.dialogs.areYouSure} ${title.toLowerCase()} ${publishinfo}`;

        this.setState(prev => ({
            ...prev,
            alertDialog: {
                open: true,
                description,
                title: toUpperCaseFirstLetter(title),
                submitText: localization.actionsNames.publish,
                onValidate: async (): Promise<void> => {

                    for (const content of selected) {
                        // Toggle the unlisted property
                        console.log(content);
                        await content.edit({
                            unlisted: !content.unlisted,
                        });

                    }

                    // Trigger a rebuild
                    this.setState(prev => ({ ...prev }));

                }
            }
        }));
    }

    /** Delete the given channels */
    onDelete(selected: MSContent[], isVideo: boolean): void {
        const localization = this.props.localization.Channel;

        // Get object name with the correct plural if needed
        let objectName: string;
        if (isVideo) {
            objectName = selected.length > 1 ? localization.videos : localization.video;
        }
        else {
            objectName = selected.length > 1 ? localization.channels : localization.channel;
        }
        objectName = objectName.toLowerCase();

        // Generate title and description
        const title = `${localization.actionsNames.delete} ${selected.length} ${objectName} ?`;
        const description = `${localization.dialogs.areYouSure} ${title} ${localization.dialogs.thisIsIrreversible}`;

        this.setState(prev => ({
            ...prev,
            alertDialog: {
                open: true,
                description,
                title: toUpperCaseFirstLetter(title),
                submitText: localization.actionsNames.delete,
                onValidate: async (): Promise<void> => {
                    const deletedItems: string[] = [];

                    // Delete the contents
                    for (const content of selected) {
                        const deleted = await content.delete();
                        if (deleted && content.slug) {
                            deletedItems.push(content.slug);
                        }
                    }
                    // Trigger refresh
                    if (isVideo) {
                        const newVideos = filterObject(this.state.videos, (key) => !deletedItems.includes(key));
                        this.setState(prev => ({
                            ...prev,
                            videos: newVideos,
                        }));
                    } else {
                        this.setState(prev => ({
                            ...prev,
                            // Remove the menu items with the deleted channels
                            menuItems: this.removeDeletedChannels(deletedItems, prev.menuItems),
                            // Remove the channels from the state
                            channels: filterObject(prev.channels, (slug) => !deletedItems.includes(slug)),
                            subchannelsSlugs: prev.subchannelsSlugs.filter(slug => !deletedItems.includes(slug)),
                        }));
                    }
                }
            }
        }));
    }

    /** Returns a new list containing the menu items without the deleted ones */
    removeDeletedChannels(deleted: string[], items: DrawerMenuItem<string>[]): DrawerMenuItem<string>[] {
        const newList: DrawerMenuItem<string>[] = [];
        for (const item of items) {
            // Only keep items that were not deleted
            if (!deleted.includes(item.data)) {
                newList.push(item);

                // Also check its children if it has any
                if (item.children) {
                    item.children = this.removeDeletedChannels(deleted, item.children);
                }
            }
        }
        return newList;
    }

    render(): JSX.Element {
        if (this.state.loading) {
            return <LoadingScreen
                errorMessage={this.state.error}
            />;
        }
        else {
            // Scan the tree for the following:
            // List of parents of the current channel, for the breacrumbs
            const breadcrumbsList: JSX.Element[] = [];
            // List of subchannels of the current channel, for the main page
            const subchannelsMenuItems: DrawerMenuItem<string>[] = [];
            // do all of them at once to avoid iterating multiple times
            this.buildBreadcrumbsAndGetSubchannels(this.props.location.pathname, this.state.menuItems, breadcrumbsList, subchannelsMenuItems);

            return (
                /* App bar */
                <Scaffold
                    {...this.props}
                    title={this.state.channels[this.state.current].title}
                    showDrawerByDefault
                    drawerMenuItems={this.state.menuItems}
                    appBarActions={
                        < Button
                            color='inherit'
                        >
                            Log out {/* TODO localization */}
                        </Button >
                    }
                >
                    <div className='padding-all fullHeight'>
                        {/* Breadcrumbs */}
                        <Breadcrumbs
                            separator='>'
                        >{breadcrumbsList.reverse()}</Breadcrumbs>

                        {/* Content */}

                        {this.state.innerLoading ? <div className='ChannelScaffold-innerLoadingWrapper'><LoadingScreen errorMessage={this.state.error} /></div> :
                            /* Subchannels */
                            <>
                                <div className='padding-vertical'>
                                    <ChannelContentList
                                        {...this.props}
                                        editPermissionCheck={(slug): boolean => !!this.state.channels[slug].canEdit}
                                        deletePermissionCheck={(slug): boolean => !!this.state.channels[slug].canDelete}
                                        publishItems={(items): void => this.onPublish(items.map(slug => this.state.channels[slug]), false)}
                                        deleteItems={(items): void => this.onDelete(items.map(slug => this.state.channels[slug]), false)}
                                        // Define columns of the table
                                        columns={[
                                            // Title (editable)
                                            {
                                                field: 'title',
                                                headerName: this.props.localization.Channel.fieldsNames.title,
                                                type: 'editable',
                                                flex: 3,
                                            },
                                            // Public or not
                                            {
                                                field: 'public',
                                                headerName: this.props.localization.Channel.fieldsNames.public,
                                                type: 'boolean',
                                                flex: 1,
                                            },
                                            // Actions
                                            {
                                                field: 'delete',
                                                headerName: ' ',
                                                type: 'action',
                                            }, {
                                                field: 'visit',
                                                headerName: ' ',
                                                type: 'action',
                                            }]}
                                        // Define rows of the table
                                        rows={this.generateSubchannelList()}
                                        title={this.props.localization.Channel.subchannels}
                                    />
                                </div>
                                <div className='padding-vertical'>
                                    {/* Videos */}
                                    <ChannelContentList
                                        {...this.props}
                                        editPermissionCheck={(slug): boolean => !!this.state.videos[slug].canEdit}
                                        deletePermissionCheck={(slug): boolean => !!this.state.videos[slug].canDelete}
                                        editItems={(items): void => this.onEdit(items.map(slug => this.state.videos[slug]))}
                                        publishItems={(items): void => this.onPublish(items.map(slug => this.state.videos[slug]), true)}
                                        deleteItems={(items): void => this.onDelete(items.map(slug => this.state.videos[slug]), true)}
                                        title={this.props.localization.Channel.videos}
                                        columns={[
                                            // Title (editable)
                                            {
                                                field: 'title',
                                                headerName: this.props.localization.Channel.fieldsNames.title,
                                                type: 'editable',
                                                flex: 2,
                                            },
                                            // Add date
                                            {
                                                field: 'addDate',
                                                headerName: this.props.localization.Channel.fieldsNames.addDate,
                                                type: 'date',
                                                flex: 2,
                                            },
                                            // Views
                                            {
                                                field: 'views',
                                                headerName: this.props.localization.Channel.fieldsNames.views,
                                                type: 'number',
                                                flex: 1,
                                            },
                                            // Duration
                                            {
                                                field: 'duration',
                                                headerName: this.props.localization.Channel.fieldsNames.duration,
                                                type: 'duration',
                                                flex: 1
                                            },
                                            // Public or not
                                            {
                                                field: 'public',
                                                headerName: this.props.localization.Channel.fieldsNames.public,
                                                type: 'boolean',
                                                flex: 1,
                                            },
                                            // Actions
                                            {
                                                field: 'edit',
                                                headerName: ' ',
                                                type: 'action',
                                            }, {
                                                field: 'delete',
                                                headerName: ' ',
                                                type: 'action',
                                            }, {
                                                field: 'visit',
                                                headerName: ' ',
                                                type: 'action',
                                            }]}
                                        rows={this.generateVideoList()}
                                    />
                                </div>
                                {/* Dialogs */}
                                <AlertDialog
                                    open={this.state.alertDialog.open}
                                    cancelButtonText={this.props.localization.Channel.dialogs.cancel}
                                    submitButtonText={this.state.alertDialog.submitText}
                                    title={this.state.alertDialog.title}
                                    description={this.state.alertDialog.description}
                                    handleClose={(): void => this.setState(prev => ({ ...prev, alertDialog: { ...prev.alertDialog, open: false } }))}
                                    onValidate={this.state.alertDialog.onValidate}
                                />
                                <EditDialog
                                    localization={this.props.localization}
                                    omitEmpty={this.state.editDialog.omitEmpty}
                                    defaultData={this.state.editDialog.defaultData}
                                    open={this.state.editDialog.open}
                                    cancelButtonText={this.props.localization.Channel.dialogs.cancel}
                                    submitButtonText={this.state.editDialog.submitText}
                                    title={this.state.editDialog.title}
                                    handleClose={(): void => this.setState(prev => ({ ...prev, editDialog: { ...prev.editDialog, open: false } }))}
                                />
                            </>}
                    </div>
                </Scaffold >
            );
        }
    }
}

export default ChannelScaffold;