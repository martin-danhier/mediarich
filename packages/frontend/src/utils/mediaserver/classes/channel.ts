import { JSONInnerObject } from 'utils/api-client';
import MediaServerAPIHandler from '../mediaserver-api-hanler';
import { MediaServerError, MSChannelEditBody } from '../types';
import { as, asBool, asEnum, asJsonObject, asJsonObjectArray } from '../../validation';
import MSContent from './content';
import { MSVideo } from './video';
import VideoUpload from './upload';

/** Possible ways to sort the content of a channel */
export enum MSChannelSorting {
    CreationDateDesc = 'creation_date-desc',
    CreationDateAsc = 'creation_date-asc',
    AddDateDesc = 'add_date-desc',
    AddDateAsc = 'add_date-asc',
    TitleDesc = 'title-desc',
    TitleAsc = 'title-asc',
    CommentsDesc = 'comments-desc',
    CommentsAsc = 'comments-asc',
    ViewsDesc = 'views-desc',
    ViewsAsc = 'views-asc',
}

export default class MSChannel extends MSContent {

    protected _sorting?: MSChannelSorting;
    protected _displayRSSLinks?: boolean;
    protected _canAddChannel?: boolean;
    protected _canAddVideo?: boolean;
    protected _canSeeStats?: boolean;
    protected _parentLanguage?: string;

    // Getters for the new variables

    /** Default content sorting used in this channel */
    public get sorting(): MSChannelSorting | undefined { return this._sorting; }
    /** Indicates if RSS links should be displayed */
    public get displayRSSLinks(): boolean | undefined { return this._displayRSSLinks; }
    /** true if the user can add new subchannels in this channel */
    public get canAddChannel(): boolean | undefined { return this._canAddChannel; }
    /** true if the user can add new videos in this channel */
    public get canAddVideo(): boolean | undefined { return this._canAddVideo; }
    /** true if the user can see statistics on this channel */
    public get canSeeStats(): boolean | undefined { return this._canSeeStats; }
    /** Language of the parent channel, if any */
    public get parentLanguage(): string | undefined { return this._parentLanguage; }

    // Methods

    /** Create a new channel from a JSON object.
     * The object must have a "oid" string field.
     * @return a new MSChannel
     */
    public static fromJSON(json: JSONInnerObject, mediaserver: MediaServerAPIHandler): MSChannel {
        if (MSContent.isJsonValid(json)) {
            const channel = new MSChannel(json.oid, mediaserver);

            // Register fields
            channel.updateFieldsFromJson(json);

            return channel;
        } else {
            throw new MediaServerError('The "oid" field is required and must be a string', json);
        }
    }

    protected updateFieldsFromJson(json: JSONInnerObject): void {
        // Add the base fields
        super.updateFieldsFromJson(json);

        // Add the additional fields if present
        this._sorting = asEnum(MSChannelSorting, json.sorting);
        this._displayRSSLinks = as('boolean', json.display_rss_links);
        this._canAddChannel = asBool(json.can_add_channel);
        this._canAddVideo = asBool(json.can_add_video);
        this._canSeeStats = asBool(json.can_see_stats);
        this._parentLanguage = as('string', json.parent_language);
    }

    /**
     * Calls the API to update all the fields of this channel.
     * @param full If set to false, only some informations will be fetched. If true, all infos will be fetched.
     */
    public async fetchInfos(full = false): Promise<void> {
        const result = await this._mediaServerAPIHandler.call('/channels/get', {
            oid: this._oid,
            full: full ? 'yes' : 'no',
        });

        if (result.success) {
            const infoJson = asJsonObject(result.info);
            if (infoJson !== undefined) {

                // Update the fields
                this.updateFieldsFromJson(infoJson);

            }
        }
    }

    public async content(includeSubchannels = true, includeVideos = true): Promise<{ channels: MSChannel[]; videos: MSVideo[] } | undefined> {
        const filterChannel = includeSubchannels ? 'c' : '';
        const filterVideos = includeVideos ? 'v' : '';


        const result = await this._mediaServerAPIHandler.call('/channels/content', {
            'parent_oid': this._oid,
            'content': filterChannel + filterVideos,
        });

        if (result.success) {
            // Parse channels
            const channels = [];
            const channelsJson = asJsonObjectArray(result.channels);
            if (channelsJson !== undefined) {
                for (const channelJson of channelsJson) {
                    try {
                        // Try to add the channel
                        channels.push(MSChannel.fromJSON(channelJson, this._mediaServerAPIHandler));
                    }
                    // Only catch MS errors, but Typescript doesn't know that concept
                    // So we type check it and throw it again if it doesn't match
                    catch (error) {
                        if (error instanceof MediaServerError) {
                            // Log the MS error. We simply ignore the channel and don't add it in the list.
                            // We don't throw the error, since maybe there are other usable channels that parsed successfully.
                            error.log('The following error was found when parsing a channel. The channel won\'t be added. ');
                        } else throw error;
                    }
                }
            }

            // Parse videos
            const videos = [];
            const videosJson = asJsonObjectArray(result.videos);
            if (videosJson !== undefined) {
                for (const videoJson of videosJson) {
                    try {
                        // Try to add the channel
                        videos.push(MSVideo.fromJSON(videoJson, this._mediaServerAPIHandler));
                    }
                    // Only catch MS errors, but Typescript doesn't know that concept
                    // So we type check it and throw it again if it doesn't match
                    catch (error) {
                        if (error instanceof MediaServerError) {
                            // Log the MS error. We simply ignore the video and don't add it in the list.
                            // We don't throw the error, since maybe there are other usable videos that parsed successfully.
                            error.log('The following error was found when parsing a video. The video won\'t be added. ');
                        } else throw error;
                    }
                }
            }

            return { channels, videos };
        }
    }



    /** Edits this channel. Requires edition permission on channel.
     * @param params The values to update. Omit one to ignore it.
     * @returns success or not
     */
    public async edit(params: MSChannelEditBody): Promise<boolean> {

        // Use a form data so we can add files in it as well (the thumbnail for instance)
        const formData = new FormData();
        formData.append('oid', this._oid);

        // Add the fields that are present
        if (params.parent) {
            const newParentOid = typeof params.parent === 'string' ? params.parent : params.parent._oid;
            // Don't set a channel as its own child
            if (newParentOid !== this._oid) {
                formData.append('parent', newParentOid);
            }
        }
        if (params.unlisted !== undefined) formData.append('unlisted', params.unlisted ? 'yes' : 'no');
        if (params.language !== undefined) formData.append('language', params.language);
        if (params.sorting) formData.append('sorthing', params.sorting);
        if (params.thumb) formData.append('thumb', params.thumb);
        if (params.thumb_oid) formData.append('thumb_oid', params.thumb_oid);
        if (params.thumb_remove !== undefined) formData.append('thumb_remove', params['thumb_remove'] ? 'yes' : 'no');
        if (params.title !== undefined) formData.append('title', params.title);

        const result = await this._mediaServerAPIHandler.call('/channels/edit', formData);

        if (result.success) {
            return true;
        }
        else {
            console.error(result);
            return false;
        }
    }

    public async delete(): Promise<boolean> {
        // Call the API
        const result = await this._mediaServerAPIHandler.call('/channels/delete', {
            oid: this._oid,
            'delete_content': 'yes',
            'delete_resources': 'yes'
        });

        // Handle result
        if (result.success) {
            return true;
        }
        else {
            console.error(result);
            return false;
        }
    }

    /**
     * Creates a new channel as a subchannel of the current channel
     * @param params Parameters of the added channel
     * @returns the new channel if success, null otherwise
     * @throws MediaServerError in case of unexpected error (e.g. invalid response from the API)
     */
    public async addSubchannel(params: {
        /** The title of the new channel */
        title: string;
        /** The slug of the channel (used in the URL for example) */
        slug?: string;
        /** The sorting settings of the channel */
        sorting?: MSChannelSorting;
        /** The language of the new channel */
        language?: string;
    }): Promise<MSChannel | null> {

        // Define parameters sent to the route
        const usedParams: {
            // TODO parent_oid is deprecated in the API reference. However, "parent", the new option to use,
            // does not work with the unamur server (maybe they still are using an old version).
            // When "parent" works, remove "parent_oid"
            'parent_oid': string;
            parent: string;
            title: string;
            slug?: string;
            sorting?: string;
            language?: string;
        } = {
            'parent_oid': this._oid,
            parent: this._oid,
            title: params.title,
        };
        // Add other fields if present
        if (params.slug) usedParams.slug = params.slug;
        if (params.language) usedParams.language = params.language;
        if (params.sorting) usedParams.sorting = params.sorting;

        // Call the API
        const result = await this._mediaServerAPIHandler.call('/channels/add', usedParams);

        // Handle result
        if (result.success) {
            return MSChannel.fromJSON(result, this._mediaServerAPIHandler);
        }
        else {
            console.error(result);
            return null;
        }
    }

    /** Add a new video to the server. Since a video can be big, this function returns a VideoUpload.
     * You need to call the `continueUpload()` function until it returns false. You can use the other properties for
     * progress bars for instance.
     */
    public addVideo(file: File): VideoUpload {
        return new VideoUpload(file, 5000000, this._mediaServerAPIHandler, this._oid);
    }
}