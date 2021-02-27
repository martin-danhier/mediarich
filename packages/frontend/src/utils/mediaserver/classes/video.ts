import { JSONInnerObject } from 'utils/api-client';
import MediaServerAPIHandler from '../mediaserver-api-hanler';
import { MediaServerError, MSVideoEditBody } from '../types';
import { as, asDate, asEnum, asJsonObject } from '../../validation';
import MSContent from './content';
import { format } from 'date-fns';

export enum VideoLayout {
    /** Regular video */
    Regular = '',
    /** Video next to jpeg slides */
    Webinar = 'webinar',
    /** Dynamic rich media */
    Composition = 'composition',
}

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
    public get creationDate(): Promise<Date | undefined> { return this.getter('_creationDate'); }
    /** Validated (only for editable medias) */
    public get validated(): Promise<boolean | undefined> { return this.getter('_validated'); }
    /** Media keywords (comma separated values 'a,b') */
    public get keywords(): Promise<string | undefined> { return this.getter('_keywords'); }
    /** Media speaker */
    public get speaker(): Promise<string | undefined> { return this.getter('_speaker'); }
    /** Media speaker email */
    public get speakerEmail(): Promise<string | undefined> { return this.getter('_speakerEmail'); }
    /** Media company */
    public get company(): Promise<string | undefined> { return this.getter('_company'); }
    /** Media company URL */
    public get companyUrl(): Promise<string | undefined> { return this.getter('_companyUrl'); }
    /** Media license */
    public get license(): Promise<string | undefined> { return this.getter('_license'); }
    /** License URL */
    public get licenseUrl(): Promise<string | undefined> { return this.getter('_licenseUrl'); }
    /** Media categories (separate values with \n).
     * The categories that are not present in the global settings will be hidden in search and edition pages */
    public get categories(): Promise<string | undefined> { return this.getter('_categories'); }
    /** A text describing the device or application which requested the media add.
     * @example "autopublisher v1.6 on example.com"
     * @example "Manual (form: AddMediaWithFileForm)"
     */
    public get origin(): Promise<string | undefined> { return this.getter('_origin'); }
    /** Media layout */
    public get layout(): Promise<string | undefined> { return this.getter('_layout'); }
    /** Media duration
     * @example "5 m 58 s"
     */
    public get duration(): Promise<string | undefined> { return this.getter('_duration'); }

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

    public async edit(params: MSVideoEditBody): Promise<boolean> {

        const usedParams: {
            oid: string;
            title?: string;
            description?: string;
            keywords?: string;
            language?: string;
            categories?: string;
            thumb?: string;
            'thumb_index'?: number;
            'thumb_remove'?: string;
            transcription?: string;
            slug?: string;
            channel?: string;
            validated?: string;
            'start_publication_date'?: string;
            'end_publication_date'?: string;
            unlisted?: string;
            speaker?: string;
            'speaker_email'?: string;
            'speaker_id'?: string;
            company?: string;
            'company_url'?: string;
            license?: string;
        } = {
            oid: this._oid,
        };

        // Add fields that are present and convert them in the right format
        if (params.title !== undefined) usedParams.title = params.title;
        if (params.parent) usedParams.channel = typeof params.parent === 'string' ? params.parent : params.parent.oid;
        if (params.description !== undefined) usedParams.description = params.description;
        if (params.keywords !== undefined) usedParams.keywords = params.keywords.join(',');
        if (params.language !== undefined) usedParams.language = params.language;
        if (params.categories !== undefined) usedParams.categories = params.categories.join('\n');
        if (params.thumb) usedParams.thumb = params.thumb;
        if (params.thumb_index !== undefined) usedParams['thumb_index'] = params.thumb_index;
        if (params.thumb_remove !== undefined) usedParams['thumb_remove'] = params.thumb_remove ? 'yes' : 'no';
        if (params.transcription !== undefined) usedParams['transcription'] = params.transcription;
        if (params.slug) usedParams.slug = params.slug;
        if (params.validated !== undefined) usedParams.validated = params.validated ? 'yes' : 'no';
        if (params.start_publication_date) usedParams['start_publication_date'] = format(params.start_publication_date, 'yyyy-MM-dd HH:mm:ss');
        if (params.end_publication_date) usedParams['end_publication_date'] = format(params.end_publication_date, 'yyyy-MM-dd HH:mm:ss');
        if (params.unlisted !== undefined) usedParams.unlisted = params.unlisted ? 'yes' : 'no';
        if (params.speaker !== undefined) usedParams.speaker = params.speaker;
        if (params.speaker_email !== undefined) usedParams['speaker_email'] = params.speaker_email;
        if (params.speaker_id) usedParams['speaker_id'] = params.speaker_id;
        if (params.company !== undefined) usedParams.company = params.company;
        if (params.company_url !== undefined) usedParams['company_url'] = params.company_url;
        if (params.license !== undefined) usedParams.license = params.license;

        // Call the API
        const result = await this._mediaServerAPIHandler.call('/medias/edit', usedParams);

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