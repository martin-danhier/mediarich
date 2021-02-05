import { JSONInnerObject } from 'utils/api-client';
import MediaServerAPIHandler from '../mediaserver-api-hanler';
import { MediaServerError } from '../types';
import { as, asEnum } from '../utils';
import MSContent from './content';

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
    /** Default content sorting used in this channel */
    private _sorting?: MSChannelSorting;
    /** Indicates if RSS links should be displayed */
    private _displayRSSLinks?: boolean;
    /** true if the user can add new subchannels in this channel */
    private _canAddChannel?: boolean;
    /** true if the user can add new videos in this channel */
    private _canAddVideo?: boolean;
    /** true if the user can see statistics on this channel */
    private _canSeeStats?: boolean;
    /** Language of the parent channel, if any */
    private _parentLanguage?: string;

    // Getters for the new variables
    public get sorting(): MSChannelSorting | undefined { return this._sorting; }
    public get displayRSSLinks(): boolean | undefined { return this._displayRSSLinks; }
    public get canAddChannel(): boolean | undefined { return this._canAddChannel; }
    public get canAddVideo(): boolean | undefined { return this._canAddVideo; }
    public get canSeeStats(): boolean | undefined { return this._canSeeStats; }
    public get parentLanguage(): string | undefined { return this._parentLanguage; }

    // Methods

    /** Create a new channel from a JSON object.
     * The object must have a "oid" string field.
     * @return a new MSChannel
     */
    public static fromJSON(json: JSONInnerObject, mediaserver: MediaServerAPIHandler): MSChannel {
        if (MSContent.isJsonValid(json)) {
            const channel = new MSChannel(json.oid, mediaserver);

            // Add the additional fields if present
            channel._sorting = asEnum(MSChannelSorting, json.sorting);
            channel._displayRSSLinks = as('boolean', json.display_rss_links);
            channel._canAddChannel = as('boolean', json.can_add_channel);
            channel._canAddVideo = as('boolean', json.can_add_video);
            channel._canSeeStats = as('boolean', json.can_see_stats);
            channel._parentLanguage = as('string', json.parent_language);

            return channel;
        } else {
            throw new MediaServerError('The "oid" field is required and must be a string', json);
        }
    }

    public async fetchInfos(full: boolean): Promise<void> {
        const result = await this._mediaServerAPIHandler.call('/channels/get', );
        if (result.success) {

        }

    }

}