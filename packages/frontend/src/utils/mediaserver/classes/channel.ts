import { JSONInnerObject } from 'utils/api-client';
import MediaServerAPIHandler from '../mediaserver-api-hanler';
import { MediaServerError } from '../types';
import { as, asEnum, asJsonObject, asJsonObjectArray } from '../utils';
import MSContent from './content';
import { MSVideo } from './video';

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
    public get sorting(): Promise<MSChannelSorting | undefined> { return this.getter('_sorting'); }
    /** Indicates if RSS links should be displayed */
    public get displayRSSLinks(): Promise<boolean | undefined> { return this.getter('_displayRSSLinks'); }
    /** true if the user can add new subchannels in this channel */
    public get canAddChannel(): Promise<boolean | undefined> { return this.getter('_canAddChannel', true); }
    /** true if the user can add new videos in this channel */
    public get canAddVideo(): Promise<boolean | undefined> { return this.getter('_canAddVideo', true); }
    /** true if the user can see statistics on this channel */
    public get canSeeStats(): Promise<boolean | undefined> { return this.getter('_canSeeStats', true); }
    /** Language of the parent channel, if any */
    public get parentLanguage(): Promise<string | undefined> { return this.getter('_parentLanguage'); }

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
        this._canAddChannel = as('boolean', json.can_add_channel);
        this._canAddVideo = as('boolean', json.can_add_video);
        this._canSeeStats = as('boolean', json.can_see_stats);
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

    /**
     * Moves this channel to another channel. Requires edition permission on channel
     * and edition permission of publishing settings.
     * @param newParent The channel (or its oid) that will be the new parent of this channel.
     * @returns success or not
     */
    public async move(newParent: MSChannel | string): Promise<boolean> {
        // Move the channel
        return await this.edit({
            parent: newParent,
        });
    }

    /** Edits this channel. Requires edition permission on channel.
     * @param params The values to update. Omit one to ignore it.
     * @returns success or not
     */
    public async edit(params: {
        /** New title of the channel */
        title?: string;
        /** New sorting of the channel */
        sorting?: MSChannelSorting;
        /** New language of the channel */
        language?: string;
        /** New thumbnail of the channel (a file is expected) */
        thumb?: string;
        /** Oid of a video. The thumbnail will be used for the channel */
        thumb_oid?: string;
        /** Set to true to remove the thumbnail */
        thumb_remove?: boolean;
        /** New parent (move the channel) */
        parent?: MSChannel | string;
        /** Requires edition permission + edition permission of publishing settings */
        unlisted?: boolean;
    }): Promise<boolean> {

        // Call the API
        const usedParams: {
            oid: string;
            sorting?: string;
            language?: string;
            thumb?: string;
            thumb_oid?: string;
            thumb_remove?: string;
            parent?: string;
            unlisted?: string;
            title?: string;
        } = {
            oid: this._oid,
        };
        // Add the fields that are present
        if (params.parent) usedParams.parent = typeof params.parent === 'string' ? params.parent : params.parent._oid;
        if (params.unlisted) usedParams.unlisted = params.unlisted === true ? 'yes' : 'no';
        if (params.language) usedParams.language = params.language;
        if (params.sorting) usedParams.sorting = params.sorting;
        if (params.thumb) usedParams.thumb = params.thumb;
        if (params.thumb_oid) usedParams['thumb_oid'] = params.thumb_oid;
        if (params.thumb_remove) usedParams['thumb_remove'] = params.thumb_remove === true ? 'yes' : 'no';
        if (params.title) usedParams.title = params.title;

        const result = await this._mediaServerAPIHandler.call('/channels/edit', usedParams);

        if (result.success) {
            return true;
        }
        else {
            console.error(result);
            return false;
        }
    }
}