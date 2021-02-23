import { JSONInnerObject } from 'utils/api-client';
import MediaServerAPIHandler from '../mediaserver-api-hanler';
import { MediaServerError } from '../types';
import { as, asDate, asEnum, asJsonObject } from '../../validation';
import MSContent from './content';

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

}