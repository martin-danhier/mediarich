import { JSONInnerObject, JSONObject } from 'utils/api-client';
import MSChannel, { MSChannelSorting } from './classes/channel';

export class MediaServerError extends Error {
    public json?: JSONObject;

    constructor(message?: string, json?: JSONObject) {
        super(message);
        this.json = json;
    }

    /** Log a MediaServer Error in a helpful way in the console.
     *
     * It is disabled in production.
     * */
    public log(preMessage?: string): void {
        if (process.env.NODE_ENV !== 'production') {
            console.error('[MS Error] ' + preMessage ? preMessage + this.message : this.message);
            if (this.json !== undefined) {
                console.error('The API returned the following JSON that seems to be the cause of the error: ');
                console.error(this.json);
            }
        }
    }
}

export type MSResponseJson = { success: boolean } & JSONInnerObject;

/** Common parameters between /medias/edit and /channels/edit */
export interface MSContentEditBody {
    title?: string;
    /** New language of the content */
    language?: string;
    /** New thumbnail of the content (a file is expected) */
    thumb?: Blob;
    /** Set to true to remove the thumbnail */
    thumb_remove?: boolean;
    /** New parent (move the content) */
    parent?: MSChannel | string;
    /** Requires edition permission + edition permission of publishing settings */
    unlisted?: boolean;
}

/** Parameters of a /channels/edit */
export interface MSChannelEditBody extends MSContentEditBody {
    /** New sorting of the channel */
    sorting?: MSChannelSorting;
    /** Oid of a video. The thumbnail will be used for the channel */
    thumb_oid?: string;
}

/** Parameters of a /medias/edit */
export interface MSVideoEditBody extends MSChannelEditBody {
    /** The media description */
    description?: string;
    /** The media keywords */
    keywords?: string[];
    /** The media categories.
     *
     * The categories that are not present in the global settings
     * will be hidden in search and edition pages.  */
    categories?: string[];
    /** An integer value to replace the media thumbnail image with an image from
     * the video. Uusually, the value can be a integer from 0 (10%) to 9 (90%).
     *
     * A negative value can be used to target a slide, in that case the given value
     * must be the time of the slide (in seconds). */
    thumb_index?: number;
    /** Media transcription. */
    transcription?: string;
    /** The media slug (used for media url). A random number will be added to the slug,
     * so the media won’t use exactly the given value. */
    slug?: string;
    /** Media is validated (published) */
    validated?: boolean;
    /** Publish media after this date */
    start_publication_date?: Date;
    /** Unpublish media after this date. */
    end_publication_date?: Date;
    /** Speaker name. */
    speaker?: string;
    /** Speaker email. */
    speaker_email?: string;
    /** Speaker identifier. */
    speaker_id?: string;
    /** Company name. */
    company?: string;
    /** Company url. */
    company_url?: string;
    /** License name. */
    license?: string;
}

export interface MSVideoAddBody {
    title: string;
    videoFile: File;
}