import { type } from 'os';
import { JSONInnerObject, JSONObject } from 'utils/api-client';

export class MediaServerError extends Error {
    public json?: JSONObject;

    constructor(message?: string, json?: JSONObject) {
        super(message);
        this.json = json;
    }
}

export type MSResponseJson = { success: boolean } & JSONInnerObject;

