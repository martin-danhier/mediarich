/**
 * @file A MediaServer video
 * @version 1.0
 * @author Martin Danhier
 * @license Apache
*/

import { format } from 'date-fns';
import { JSONInnerObject } from 'utils/api-client';

import { as, asDate, asEnum, asJsonObject } from '../../validation';
import MediaServerAPIHandler from '../mediaserver-api-hanler';
import { MediaServerError, MSVideoEditBody } from '../types';
import MSContent from './content';

export enum VideoLayout {
    /** Regular video */
    Regular = '',
    /** Video next to jpeg slides */
    Webinar = 'webinar',
    /** Dynamic rich media */
    Composition = 'composition',
}

/** Video object. Contains properties of the video, and useful
 * methods to do actions on edit (delete, edit, ...)
 */
export class MSVideo extends MSContent {
    protected _creationDate?: Date;
    protected _validated?: boolean;
    protected _keywords?: string;
    protected _speaker?: string;
    protected _speakerEmail?: string;
    protected _company?: string;
    protected _companyUrl?: string;
    protected _license?: string;
    protected _licenseUrl?: string;
    protected _categories?: string;
    protected _origin?: string;

    // Video only

    protected _layout?: VideoLayout;
    protected _duration?: string;

    // Getters

    /** Media creation date */
    public get creationDate(): Date | undefined { return this._creationDate; }
    /** Validated (only for editable medias)
     * Same as "published"
     */
    public get validated(): boolean | undefined { return this._validated; }
    /** Media keywords (comma separated values 'a,b') */
    public get keywords(): string | undefined { return this._keywords; }
    /** Media speaker */
    public get speaker(): string | undefined { return this._speaker; }
    /** Media speaker email */
    public get speakerEmail(): string | undefined { return this._speakerEmail; }
    /** Media company */
    public get company(): string | undefined { return this._company; }
    /** Media company URL */
    public get companyUrl(): string | undefined { return this._companyUrl; }
    /** Media license */
    public get license(): string | undefined { return this._license; }
    /** License URL */
    public get licenseUrl(): string | undefined { return this._licenseUrl; }
    /** Media categories (separate values with \n).
     * The categories that are not present in the global settings will be hidden in search and edition pages */
    public get categories(): string | undefined { return this._categories; }
    /** A text describing the device or application which requested the media add.
     * @example "autopublisher v1.6 on example.com"
     * @example "Manual (form: AddMediaWithFileForm)"
     */
    public get origin(): string | undefined { return this._origin; }
    /** Media layout */
    public get layout(): string | undefined { return this._layout; }
    /** Media duration
     * @example "5 m 58 s"
     */
    public get duration(): string | undefined { return this._duration; }

    // Methods

    /** Create a new video from a JSON object.
     * The object must have a "oid" string field.
     * @return a new MSChannel
     */
    public static fromJSON(json: JSONInnerObject, mediaserver: MediaServerAPIHandler): MSVideo {
        if (MSContent.isJsonValid(json)) {
            const video = new MSVideo(json.oid, mediaserver);

            // Register fields
            video.updateFieldsFromJson(json);

            return video;
        } else {
            throw new MediaServerError('The "oid" field is required and must be a string', json);
        }
    }

    // Docs on MSContent
    protected updateFieldsFromJson(json: JSONInnerObject): void {
        // Add the base fields
        super.updateFieldsFromJson(json);

        // Add the additional fields if present
        this._creationDate = asDate(json.creation);
        this._validated = as('boolean', json.validated);
        this._keywords = as('string', json.keywords);
        this._speaker = as('string', json.speaker);
        this._speakerEmail = as('string', json.speaker_email);
        this._company = as('string', json.company);
        this._companyUrl = as('string', json.company_url);
        this._license = as('string', json.license);
        this._licenseUrl = as('string', json.license_url);
        this._categories = as('string', json.categories);
        this._origin = as('string', json.origin);
        this._layout = asEnum(VideoLayout, json.layout);
        this._duration = as('string', json.duration);
    }

    /**
     * Calls the API to update all the fields of this video.
     * @param full If set to false, only some informations will be fetched. If true, all infos will be fetched.
     */
    public async fetchInfos(full: boolean): Promise<void> {
        const result = await this._mediaServerAPIHandler.call('/medias/get', {
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

    // Docs on MSContent
    public async edit(params: MSVideoEditBody): Promise<boolean> {

        const formData = new FormData();
        formData.append('oid', this._oid);
        
        // Add fields that are present and convert them in the right format
        if (params.title !== undefined) formData.append('title', params.title);
        if (params.parent) formData.append('channel', typeof params.parent === 'string' ? params.parent : params.parent.oid);
        if (params.description !== undefined) formData.append('description', params.description);
        if (params.keywords !== undefined) formData.append('keywords', params.keywords.join(','));
        if (params.language !== undefined) formData.append('language', params.language);
        if (params.categories !== undefined) formData.append('categories', params.categories.join('\n'));
        if (params.thumb) formData.append('thumb', params.thumb);
        if (params.thumb_index !== undefined) formData.append('thumb_index', params.thumb_index.toString());
        if (params.thumb_remove !== undefined) formData.append('thumb_remove', params.thumb_remove ? 'yes' : 'no');
        if (params.transcription !== undefined) formData.append('transcription', params.transcription);
        if (params.slug) formData.append('slug', params.slug);
        if (params.validated !== undefined) formData.append('validated', params.validated ? 'yes' : 'no');
        if (params.start_publication_date) formData.append('start_publication_date', format(params.start_publication_date, 'yyyy-MM-dd HH:mm:ss'));
        if (params.end_publication_date) formData.append('end_publication_date', format(params.end_publication_date, 'yyyy-MM-dd HH:mm:ss'));
        if (params.unlisted !== undefined) formData.append('unlisted', params.unlisted ? 'yes' : 'no');
        if (params.speaker !== undefined) formData.append('speaker', params.speaker);
        if (params.speaker_email !== undefined) formData.append('speaker_email', params.speaker_email);
        if (params.speaker_id) formData.append('speaker_id', params.speaker_id);
        if (params.company !== undefined) formData.append('company', params.company);
        if (params.company_url !== undefined) formData.append('company_url', params.company_url);
        if (params.license !== undefined) formData.append('license', params.license);



        // Call the API
        const result = await this._mediaServerAPIHandler.call('/medias/edit', formData);

        if (result.success) {
            return true;
        }
        else {
            console.error(result);
            return false;
        }
    }

    // Docs on MSContent
    public async delete(): Promise<boolean> {
        // Call the API
        const result = await this._mediaServerAPIHandler.call('/medias/delete', {
            oid: this._oid,
            'delete_metadata': 'yes',
            'delete_resources': 'yes',
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

}