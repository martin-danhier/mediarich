import { JSONInnerObject, JSONInnerObjectContent } from 'utils/api-client';
import MediaServerAPIHandler from '../mediaserver-api-hanler';
import { MediaServerError } from '../types';
import * as assert from 'utils/assert/assert';
import { as, asDate } from '../../validation';

export default abstract class MSContent {
    // Ref to the mediaserver api handler object
    protected _mediaServerAPIHandler: MediaServerAPIHandler;
    // Data of the content
    protected _oid: string;
    protected _dbid?: number;
    protected _title?: string;
    protected _slug?: string;
    protected _language?: string;
    protected _thumb?: string;
    protected _addDate?: Date;
    protected _views?: number;
    protected _viewsLastMonth?: number;
    protected _comments?: number;
    protected _commentsLastMonth?: number;
    protected _unlisted?: boolean;
    protected _canEdit?: boolean;
    protected _canDelete?: boolean;
    protected _shortDescription?: string;
    protected _description?: string;
    protected _metaDescription?: string;
    protected _folderName?: string;
    protected _externalRef?: string;
    protected _externalData?: string;
    protected _parentOid?: string;
    protected _parentTitle?: string;
    protected _parentSlug?: string;

    // Constructor

    /**
     * Create an empty MSContent object.
     * It can fetch the other values from the API automatically later (provided that the oid is valid)
     * @param oid Object ID of the content. Must exist in the API (otherwise, the API requests will fail)
     */
    public constructor(oid: string, mediaserver: MediaServerAPIHandler) {
        this._oid = oid;
        this._mediaServerAPIHandler = mediaserver;
    }

    // Getters
    // By using getters, we gain multiple advantages
    // - readonly from the outside of the class
    // - if the value is not currently defined, we can fetch it from the api without complexiflying the client code

    /** The object id of the content */
    public get oid(): string { return this._oid; }
    /** The database id of the content */
    public get dbid(): Promise<number | undefined> { return this.getter('_dbid'); }
    /** The title of the content */
    public get title(): Promise<string | undefined> { return this.getter('_title'); }
    /** The slug of the content */
    public get slug(): Promise<string | undefined> { return this.getter('_slug'); }
    /** The language of the content */
    public get language(): Promise<string | undefined> { return this.getter('_language'); }
    /** URL of the thumbnail image */
    public get thumb(): Promise<string | undefined> { return this.getter('_thumb'); }
    /** Add date (when the content has been added to the catalog) */
    public get addDate(): Promise<Date | undefined> { return this.getter('_addDate'); }
    /** Number of views */
    public get views(): Promise<number | undefined> { return this.getter('_views'); }
    /** Number of views last month */
    public get viewsLastMonth(): Promise<number | undefined> { return this.getter('_viewsLastMonth'); }
    /** Number of comments */
    public get comments(): Promise<number | undefined> { return this.getter('_comments'); }
    /** Number of comments last month */
    public get commentsLastMonth(): Promise<number | undefined> { return this.getter('_commentsLastMonth'); }
    /** true if not listed in the portal (only for editable channels) */
    public get unlisted(): Promise<boolean | undefined> { return this.getter('_unlisted'); }
    /** true if the user can edit this channel */
    public get canEdit(): Promise<boolean | undefined> { return this.getter('_canEdit'); }
    /** true if the user can delete this channel */
    public get canDelete(): Promise<boolean | undefined> { return this.getter('_canDelete'); }
    /** Short decription of the channel */
    public get shortDescription(): Promise<string | undefined> { return this.getter('_shortDescription', true); }
    /** Description of the channel */
    public get description(): Promise<string | undefined> { return this.getter('_description', true); }
    /** Description of channel for HTML meta tag (no HTML markups) */
    public get metaDescription(): Promise<string | undefined> { return this.getter('_metaDescription', true); }
    /** The folder name of the channel public and private content (used to build thumbnail path or url) */
    public get folderName(): Promise<string | undefined> { return this.getter('_folderName', true); }
    /** the channel external reference value */
    public get externalRef(): Promise<string | undefined> { return this.getter('_externalRef', true); }
    /*** the channel external data */
    public get externalData(): Promise<string | undefined> { return this.getter('_externalData', true); }
    /** Object id of the parent channel, if any */
    public get parentOid(): Promise<string | undefined> { return this.getter('_parentOid'); }
    /** Title of the parent channel, if any */
    public get parentTitle(): Promise<string | undefined> { return this.getter('_parentTitle'); }
    /** Sluge of the parent channel, if any */
    public get parentSlug(): Promise<string | undefined> { return this.getter('_parentSlug'); }

    // Methods

    /** Returns the requested field. If it is missing, fetch it on the API.
     * This is protected because it is used in other getters only (to avoid repeating code).
     * @param field The field to get
     * @param requiresFullFetch does the API need that the "full" parameter is true to return this field ?
     */
    protected async getter<T>(field: string, requiresFullFetch = false): Promise<T | undefined> {

        if (this[field as keyof this] === undefined) {
            await this.fetchInfos(requiresFullFetch);
        }
        // Then return the field
        return this[field as keyof this] as any; // This is not ideal, but Typescript will have to trust us
    }

    /**
     * Check if the given json is a valid json for a MSContent.
     * (meaning it has a oid key that has a string value).\
     * If it has, it provides a type guard for it.\
     * @param json The json to check
     */
    protected static isJsonValid(json: JSONInnerObject): json is {
        oid: string;
        [key: string]: JSONInnerObjectContent;
    } {
        // valid value
        if (typeof json.oid === 'string') {
            return true;
        }
        else {
            return false;
        }
    }

    /** 
     * Sets the values based on the given json
     * Any field that is missing or the wrong type will be set to undefined.
     * 
     * It is protected so that the update functions in the subclasses don't have to write the same code
     * every time, but outside of the class it is not possible to modify the values with a fake JSON.
     */
    protected updateFieldsFromJson(json: JSONInnerObject): void {

        // Add other fields if they exist.
        // If they are undefined, or if they are not of the correct type, leave the field to undefined
        // content allows us to be sure that if a field is not undefined, it is valid
        this._dbid = as('number', json.dbid);
        this._title = as('string', json.title);
        this._slug = as('string', json.slug);
        this._language = as('string', json.language);
        this._thumb = as('string', json.thumb);
        this._addDate = asDate(json.add_date);
        this._views = as('number', json.views);
        this._viewsLastMonth = as('number', json.views_last_month);
        this._comments = as('number', json.comments);
        this._commentsLastMonth = as('number', json.comments_last_month);
        this._unlisted = as('boolean', json.unlisted);
        this._canEdit = as('boolean', json.can_edit);
        this._canDelete = as('boolean', json.can_delete);
        this._shortDescription = as('string', json.short_description);
        this._description = as('string', json.description);
        this._metaDescription = as('string', json.meta_description);
        this._folderName = as('string', json.folder_name);
        this._externalRef = as('string', json.external_ref);
        this._externalData = as('string', json.external_data);
        this._parentOid = as('string', json.parent_oid);
        this._parentTitle = as('string', json.parent_title);
        this._parentSlug = as('string', json.parent_slug);
    }

    /**
     * Fetch the data of this content on the API. Saves the result in the object.
     * @param full Should fetch all infos or not
     */
    public abstract fetchInfos(full: boolean): Promise<void>;
}