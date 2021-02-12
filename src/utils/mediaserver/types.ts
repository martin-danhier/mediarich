import { JSONInnerObject, JSONObject } from 'utils/api-client';

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

