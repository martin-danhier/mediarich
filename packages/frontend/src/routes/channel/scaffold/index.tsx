import { Breadcrumbs, Button, IconButton, Link, Tooltip, Typography } from '@material-ui/core';
import LoadingScreen from 'components/loading-screen';
import { MediaServerProviderState } from 'components/mediaserver-provider';
import Scaffold from 'components/scaffold';
import { DrawerMenuItem } from 'components/scaffold/drawer-menu';
import React from 'react';
import { RouteComponentProps } from 'react-router';
import { MSChannelTreeItem, MSVideo, MSVideoEditBody } from 'utils/mediaserver';
import MSChannel from 'utils/mediaserver/classes/channel';

import { Localization } from 'components/localization-provider/types';
import { filterObject, stringToDuration, toUpperCaseFirstLetter } from 'utils/useful-functions';
import ChannelContentList, { DataGridActionColumnParams, DataGridEditableColumnParams } from '../channel-content-list';
import './scaffold.style.css';
import AlertDialog from '../dialogs/alert-dialog';
import { Delete, Edit, OpenInNew, Refresh } from '@material-ui/icons';
import { GridRowsProp } from '@material-ui/data-grid';
import MSContent from 'utils/mediaserver/classes/content';
import EditDialog, { ChannelEditState } from '../dialogs/edit-dialog';
import LanguageSwitcher from 'components/language-switcher';
import AddChannelDialog from '../dialogs/add-channel-dialog';
import MoveDialog from '../dialogs/move-dialog';
import assert from 'utils/assert';
import MediaServerAPIHandler from 'utils/mediaserver/mediaserver-api-hanler';
import Cookies from 'js-cookie';

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
        onSubmit?: () => void | Promise<void>;
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
        onSubmit?: (data: ChannelEditState) => void | Promise<void>;
    };
    /** Data of the add dialog */
    addChannelDialog: {
        open: boolean;
    };
    /** Data of the move dialog */
    moveDialog: {
        open: boolean;
        title: string;
        paths: Record<string, string>;
        potentialDestinationChannelsSlugs: string[];
        onSubmit?: (destination: string) => void | Promise<void>;
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
                open: false,
                omitEmpty: false,
                title: '',
                defaultData: {
                    title: '',
                    thumbnailURL: '',
                    description: '',
                }
            },
            addChannelDialog: {
                open: false,
            },
            moveDialog: {
                open: false,
                title: '',
                paths: {},
                potentialDestinationChannelsSlugs: [],
            }
        };
    }

    // Called when the component is mounted
    async componentDidMount(): Promise<void> {

        let slug = this.props.match.params.slug;

        const mediaserver = await this.getMediaServer();

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
                const { channels, menuItems } = await this.fetchChannelList(mediaserver);

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

    /** Returns the api handler, and try to refresh it if it is */
    async getMediaServer(): Promise<MediaServerAPIHandler | null> {
        // Get the list of channels for the menu
        let mediaserver = this.props.mediaServerContext.mediaserver;

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

        return mediaserver;
    }

    /**
     * Fetches the whole channel tree
     * @param mediaserver The API handler
     * @returns The list of all channels and the menuItems tree for the drawer
     */
    async fetchChannelList(mediaserver: MediaServerAPIHandler): Promise<{ channels: Record<string, MSChannel>; menuItems: DrawerMenuItem<string>[] }> {

        // Load the channels
        const channels: Record<string, MSChannel> = {};
        const menuItems = this.msTreeToDrawerTree(await mediaserver.channelsTree(), channels);

        return {
            menuItems,
            channels,
        };
    }

    /** Fetches infos about the current channel
     * @param slug The channel to get the content of
     * @param channels The recod of channels indexed by slug
    */
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

    /** Refreshes the loaded channel. Does not init the loading screen, if you want one call setState before this.
     * innerLoading is set to false at the end of this function in case you did set it to true before.
    */
    async triggerRefresh(complete = false): Promise<void> {

        /** Fetch channels if complete */
        let channels: Record<string, MSChannel> | undefined = undefined;
        let menuItems: DrawerMenuItem<string>[] | undefined = undefined;
        if (complete) {
            const mediaserver = await this.getMediaServer();
            if (mediaserver) {
                const fetchResult = await this.fetchChannelList(mediaserver);
                channels = fetchResult.channels;
                menuItems = fetchResult.menuItems;
            }
        }

        /** Trigger a fetch */
        const result = await this.fetchCurrentChannelInfos(this.state.current, channels ?? this.state.channels);

        this.setState(prev => ({
            ...prev,
            innerLoading: false,
            channels: result.channels,
            videos: result.videos,
            subchannelsSlugs: result.subchannelsSlugs,
            menuItems: menuItems ?? prev.menuItems,
        }));
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
                        // Open the channel
                        this.props.history.push(`/channel/${channel.slug}`);
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
                public: !video.validated,
                edit: {
                    icon: <Edit />,
                    disabled: !video.canEdit,
                    onClick: () => {
                        this.onEdit([video]);
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
                        // Open the video in mediaserver
                        window.open(video.getPermalink());
                    }
                } as DataGridActionColumnParams,
            };
        });
    }


    /**
     * Rename a series of MSContents
     * */
    async onRename(selected: MSContent, newTitle: string): Promise<void> {
        // Try to rename the field
        await selected.edit({
            title: newTitle,
        });

        // trigger a refresh
        await this.triggerRefresh();
    }

    /** Opens the edit dialog
     * @param selected list of videos to edit
    */
    onEdit(selected: MSVideo[]): void {
        const localization = this.props.localization.Channel;

        // Get object name with the correct plural if needed
        const objectName = (selected.length > 1 ? localization.videos : localization.video).toLowerCase();

        // Generate title and description
        const title = `${localization.actionsNames.edit} ${selected.length} ${objectName}`;

        // Take the data of the first video
        let thumbnail: string | undefined | null = selected[0].thumb;
        let currentTitle: string | undefined | null = selected[0].title;
        let currentDescription: string | undefined | null = selected[0].description;

        // Only keep default values for the fields if every field has identical values in it
        for (const video of selected) {
            // Check thumbnail
            if (thumbnail && thumbnail !== video.thumb) {
                thumbnail = null;
            }
            // Check title
            if (currentTitle && currentTitle !== video.title) {
                currentTitle = null;
            }
            // Check description
            if (currentDescription && currentDescription !== video.description) {
                currentDescription = null;
            }
        }

        // If true, empty fields will be ignored
        // If false, the empty string will be sent
        const omitEmpty = selected.length > 1 && (currentDescription === null || currentDescription === null);

        this.setState(prev => ({
            ...prev,
            editDialog: {
                open: true,
                title: toUpperCaseFirstLetter(title),
                omitEmpty,
                defaultData: {
                    title: currentTitle ?? '',
                    description: currentDescription ?? '',
                    thumbnailURL: thumbnail ?? undefined,
                },
                // Handle new data submitted
                onSubmit: async (data): Promise<void> => {
                    console.log('save !');

                    // Build body
                    const params: MSVideoEditBody = {};
                    let empty = true;

                    // Add title and description
                    // If omitEmpty, check that they are not empty
                    // Else always add it
                    if ((!omitEmpty || data.title !== '') && (data.title !== currentTitle)) {
                        params.title = data.title;
                        empty = false;
                    }
                    if ((!omitEmpty || data.description !== '') && (data.description !== currentDescription)) {
                        params.description = data.description;
                        empty = false;
                    }
                    // Always check if the thumbnail is different of null
                    if (data.thumbnail !== null) {
                        params.thumb = data.thumbnail;
                        empty = false;
                    }

                    if (!empty) {
                        console.log(params);

                        const editedMedia: string[] = [];
                        // For each selected media
                        for (const media of selected) {
                            // Try to edit it with the given params
                            const edited = await media.edit(params);
                            if (edited && media.slug) {
                                editedMedia.push(media.slug);
                            }
                        }

                        console.log(editedMedia);

                        // close the dialog
                        this.setState(prev => ({
                            ...prev,
                            editDialog: {
                                ...prev.editDialog,
                                open: false,
                            }
                        }));

                        // Trigger refresh
                        await this.triggerRefresh();
                    }

                }
            }
        }));
    }

    /** Toggle the unlisted property of a list of videos
     * @param selected the list of videos to publish/unpublish
    */
    onPublish(selected: MSVideo[]): void {
        const localization = this.props.localization.Channel;

        // Get object name with the correct plural if needed
        const objectName = (selected.length > 1 ? localization.videos : localization.video).toLowerCase();


        // Generate title and description
        const title = `${localization.actionsNames.publish} ${selected.length} ${objectName} ?`;
        const publishinfo = selected.length > 1 ? localization.dialogs.publishInfoPlural : localization.dialogs.publishInfoSingular;
        const description = `${localization.dialogs.areYouSure} ${title.toLowerCase()} ${publishinfo}`;

        this.setState(prev => ({
            ...prev,
            alertDialog: {
                open: true,
                description,
                title: toUpperCaseFirstLetter(title),
                submitText: localization.actionsNames.publish,
                onSubmit: async (): Promise<void> => {

                    for (const content of selected) {
                        // Toggle the unlisted property
                        await content.edit({
                            validated: !content.validated,
                        });

                    }

                    // Trigger a refresh
                    await this.triggerRefresh();
                }
            }
        }));
    }

    /** Delete the given channels
     * @param selected the list of ms content to delete
     * @param isVideo set it to true if the contents are videos
    */
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
                onSubmit: async (): Promise<void> => {
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

                        console.log(deletedItems);

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

    /** Returns a new list containing the menu items without the deleted ones. Recursive.
     * @param deleted list of the slugs of the deleted channels
     * @param items list of drawer items to iterate on
    */
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

    /** Adds a new channel */
    onAddChannel = (): void => {
        this.setState(prev => ({
            ...prev,
            addChannelDialog: { open: true },
        }));
    }

    /** Moves a content */
    onMoveContent = (selected: string[], isVideo: boolean): void => {
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
        const title = `${localization.actionsNames.move} ${selected.length} ${objectName} ?`;

        // Get other channels
        let potentialDestinationChannelsSlugs = Object.keys(this.state.channels).filter(x => !selected.includes(x));

        // Get paths
        const paths: Record<string, string> = {};
        this.getPaths(this.state.menuItems, paths);

        // Sort channels
        potentialDestinationChannelsSlugs = potentialDestinationChannelsSlugs.sort((s1, s2) => {
            // Get the path of the parent
            const a = /^(?<parent>(?:\/[^/]+)*\/)[^/]+$/.exec(paths[s1])?.groups?.parent;
            const b = /^(?<parent>(?:\/[^/]+)*\/)[^/]+$/.exec(paths[s2])?.groups?.parent;
            assert(a !== undefined, 'The regex should match.');
            assert(b !== undefined, 'The regex should match.');

            // Compare
            if (a < b) return -1;
            if (a > b) return 1;
            return 0;
        });

        // Open dialog
        this.setState(prev => ({
            ...prev,
            moveDialog: {
                open: true,
                title: toUpperCaseFirstLetter(title),
                paths,
                potentialDestinationChannelsSlugs,
                onSubmit: async (destination: string): Promise<void> => {
                    const destinationChannel = this.state.channels[destination];

                    // Move everything
                    for (const slug of selected) {
                        const content: MSContent = isVideo ? this.state.videos[slug] : this.state.channels[slug];
                        await content.move(destinationChannel);
                    }

                    // Close dialog
                    this.setState(prev => ({
                        ...prev,
                        moveDialog: {
                            open: false,
                            paths: {},
                            potentialDestinationChannelsSlugs: [],
                            title: '',
                        }
                    }));

                    // Trigger refresh
                    await this.triggerRefresh(true);
                }
            }
        }));
    }

    /** Computes the path of each menu item based on its data.
     * @param items the list of items to iterate on
     * @param output the output record containing to path of each channel index by slug
     * @param parentPath the path of the caller, used for generation. Leave it to ""
    */
    getPaths(items: DrawerMenuItem<string>[], output: Record<string, string>, parentPath = ''): void {
        for (const item of items) {

            // Save the path of this item
            const itemPath = `${parentPath}/${item.data}`;
            output[item.data] = itemPath;

            // If there are children, process them
            if (item.children) {
                this.getPaths(item.children, output, itemPath);
            }
        }
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
                    appBarActions={<>
                        <Tooltip title={this.props.localization.Channel.refresh}>
                            <IconButton color='inherit' onClick={(): void => {
                                this.setState({
                                    innerLoading: true,
                                });
                                this.triggerRefresh();
                            }}>
                                <Refresh />
                            </IconButton>
                        </Tooltip>
                        <LanguageSwitcher
                            color='inherit'
                        />
                        {/* Disconnect button */}
                        <Button
                            color='inherit'
                            onClick={(): void => {
                                // Reset everything
                                this.props.mediaServerContext.reset();
                                Cookies.remove('connect.sid');
                                // Go back to login
                                this.props.history.push('/login');
                            }}
                        >
                            {this.props.localization.Auth.logout}
                        </Button >
                    </>
                    }
                >
                    <div className='padding-all fullHeight'>
                        {/* Breadcrumbs */}
                        <Breadcrumbs
                            className='ChannelScaffold-breadcrumbs'
                            separator='>'
                        >{breadcrumbsList.reverse()}</Breadcrumbs>

                        {/* Content */}

                        {this.state.innerLoading ? <div className='ChannelScaffold-innerLoadingWrapper'><LoadingScreen errorMessage={this.state.error} /></div> :
                            /* Subchannels */
                            <>
                                <div className='padding-vertical'>
                                    <ChannelContentList
                                        {...this.props}
                                        addItem={this.onAddChannel}
                                        editPermissionCheck={(slug): boolean => !!this.state.channels[slug]?.canEdit}
                                        deletePermissionCheck={(slug): boolean => !!this.state.channels[slug]?.canDelete}
                                        deleteItems={(items): void => this.onDelete(items.map(slug => this.state.channels[slug]), false)}
                                        moveItems={(items): void => this.onMoveContent(items, false)}

                                        // Define columns of the table
                                        columns={[
                                            // Title (editable)
                                            {
                                                field: 'title',
                                                headerName: this.props.localization.Channel.fieldsNames.title,
                                                type: 'editable',
                                                flex: 3,
                                            },
                                            // Actions
                                            {
                                                description: toUpperCaseFirstLetter(this.props.localization.Channel.actionsNames.delete),
                                                field: 'delete',
                                                headerName: ' ',
                                                type: 'action',
                                            }, {
                                                description: toUpperCaseFirstLetter(this.props.localization.Channel.actionsNames.visit),
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
                                        editPermissionCheck={(slug): boolean => !!this.state.videos[slug]?.canEdit}
                                        deletePermissionCheck={(slug): boolean => !!this.state.videos[slug]?.canDelete}
                                        editItems={(items): void => this.onEdit(items.map(slug => this.state.videos[slug]))}
                                        publishItems={(items): void => this.onPublish(items.map(slug => this.state.videos[slug]))}
                                        deleteItems={(items): void => this.onDelete(items.map(slug => this.state.videos[slug]), true)}
                                        moveItems={(items): void => this.onMoveContent(items, true)}
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
                                                description: toUpperCaseFirstLetter(this.props.localization.Channel.actionsNames.edit),
                                                field: 'edit',
                                                headerName: ' ',
                                                type: 'action',
                                            }, {
                                                description: toUpperCaseFirstLetter(this.props.localization.Channel.actionsNames.delete),
                                                field: 'delete',
                                                headerName: ' ',
                                                type: 'action',
                                            }, {
                                                description: toUpperCaseFirstLetter(this.props.localization.Channel.actionsNames.visit),
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
                                    onSubmit={this.state.alertDialog.onSubmit}
                                />
                                <EditDialog
                                    localization={this.props.localization}
                                    omitEmpty={this.state.editDialog.omitEmpty}
                                    defaultData={this.state.editDialog.defaultData}
                                    open={this.state.editDialog.open}
                                    title={this.state.editDialog.title}
                                    handleClose={(): void => this.setState(prev => ({ ...prev, editDialog: { ...prev.editDialog, open: false } }))}
                                    onSubmit={this.state.editDialog.onSubmit}
                                />
                                <AddChannelDialog
                                    handleSubmit={async (data): Promise<void> => {
                                        // Close the dilaog
                                        this.setState(prev => ({
                                            ...prev,
                                            addChannelDialog: {
                                                open: false,
                                            }
                                        }));
                                        // Add the subchannel
                                        await this.state.channels[this.state.current].addSubchannel({
                                            title: data.title,

                                        });
                                        // Trigger a refresh
                                        await this.triggerRefresh(true);
                                    }}
                                    localization={this.props.localization}
                                    handleClose={(): void => this.setState(prev => ({ ...prev, addChannelDialog: { ...prev.addChannelDialog, open: false } }))}
                                    open={this.state.addChannelDialog.open}
                                />
                                <MoveDialog
                                    onSubmit={this.state.moveDialog.onSubmit}
                                    open={this.state.moveDialog.open}
                                    paths={this.state.moveDialog.paths}
                                    channels={this.state.channels}
                                    potentialDestinationChannelsSlugs={this.state.moveDialog.potentialDestinationChannelsSlugs}
                                    currentParentSlug={this.state.current}
                                    localization={this.props.localization}
                                    title={this.state.moveDialog.title}
                                    handleClose={(): void => this.setState(prev => ({ ...prev, moveDialog: { ...prev.moveDialog, open: false } }))}
                                />
                            </>}
                    </div>
                </Scaffold>
            );
        }
    }
}

export default ChannelScaffold;