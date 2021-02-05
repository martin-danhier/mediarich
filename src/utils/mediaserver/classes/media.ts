import MSContent from './content';

export class MSMedia extends MSContent {
    /** Media creation date */
    private _creationDate?: Date;
    /** Validated (only for editable medias) */
    private _validated?: boolean;
    /** Media keywords (comma separated values 'a,b') */
    private _keywords?: string;
    /** Media speaker */
    private _speaker?: string;
    /** Media speaker email */
    private _speakerEmail?: string;
    /** Media company */
    private _company?: string;
    /** Media company URL */
    private _companyUrl?: string;
    /** Media license */
    private _license?: string;
    /** License URL */
    private _licenseUrl?: string;
    /** Media categories (separate values with \n).
     * The categories that are not present in the global settings will be hidden in search and edition pages */
    private _categories?: string;
    /** A text describing the device or application which requested the media add.
     * @example "autopublisher v1.6 on example.com"
     * @example "Manual (form: AddMediaWithFileForm)"
     */
    private _origin?: string;

}