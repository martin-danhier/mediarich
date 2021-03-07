
/**
 * @file Video upload handler. Contains all the logic for dynamic and flexibles uploads.
 * @version 1.0
 * @author Martin Danhier
 * @license Apache
*/

import { MIMETypes } from 'utils/api-client';
import { MediaServerError } from '..';
import SparkMd5 from 'spark-md5';
import MediaServerAPIHandler from '../mediaserver-api-hanler';
import { getBlobArrayBuffer } from 'utils/useful-functions';
import assert from 'utils/assert';

/**
 * Handler for a video upload.
 *
 * To upload, call the `continueUpload` method until it returns false.
 * Then, if it worked, call the `saveVideo` method to save it in mediaserver.
 *
 * This structure allows an upload to be cancelled at any time.
 * On MediaServer, uploads stay during 1 day after which they are deleted if not saved.
 * To cancel an upload, simply stop calling the ``continueUpload`` function.
 *
 * The getters can also be used to get the progress of the upload, for instance for a progress bar.
 */
class VideoUpload {
    /** oid of the channel to which this video should be added */
    private _parentOid: string;
    /** the file uploading */
    private _file: File;
    /** The starting byte of the last created chunk */
    private _start = 0;
    /** The ending byte of the last created chunk */
    private _end = 0;
    /** The size of the last created chunk */
    private _lastChunkSize = 0;
    /** The maximum size of a slice */
    private _sliceSize: number;
    /** The upload id returned by MediaServer. It should be null only for the first request. */
    private _uploadId: string | null = null;
    /** The API handler */
    private _mediaServerAPIHandler: MediaServerAPIHandler;
    /** The MD5 hash of the uploaded file, built at the same time */
    private _md5Hash = new SparkMd5.ArrayBuffer();

    /** Returns the start index of the last chunk */
    public get start(): number { return this._start; }
    /** Returns the end index of the last chunk */
    public get end(): number { return this._end; }
    /** Returns the total size of the file */
    public get size(): number { return this._file.size; }
    /** Returns the name of the uploaded file */
    public get filename(): string { return this._file.name; }

    constructor(params: File, sliceSize: number, mediaServerAPIHandler: MediaServerAPIHandler, parentOid: string) {
        this._file = params;
        this._sliceSize = sliceSize;
        this._mediaServerAPIHandler = mediaServerAPIHandler;
        this._parentOid = parentOid;
    }

    /** Returns the next chunk of the file */
    getNextChunk(): Blob | null {
        this._start += this._lastChunkSize;

        if (this._end < this.size) {
            // Get end
            this._end = this._start + this._sliceSize;
            if (this.size - this._end < 0) {
                // Set end to size if too big
                this._end = this.size;
            }
            // Slice the file
            const chunk = this._file.slice(this._start, this._end, this._file.type);

            // Save the size
            this._lastChunkSize = chunk.size;

            return chunk;
        } else {
            // Return null if there is no chunk left in the file
            return null;
        }
    }


    /**
     * Continues the process of uploading a file.
     * @returns true if this function needs to be called again, false when it is completed
     */
    async continueUpload(): Promise<boolean> {
        const nextChunk = this.getNextChunk();

        // If there is still at least one chunk to send
        if (nextChunk !== null) {
            // Add it in a form data
            const data = new FormData();
            data.append('file', nextChunk, this._file.name);

            // Add upload id if present
            if (this._uploadId !== null) {
                data.append('upload_id', this._uploadId);
            }

            // Send it and get the hash, but do everything at the same time to be more efficient
            const resultPromise = this._mediaServerAPIHandler.freeCall('/upload', data, {
                'Content-Range': `bytes ${this._start}-${this._end - 1}/${this.size}`,
            });
            const arrayBufferPromise = getBlobArrayBuffer(nextChunk);
            const [result, arrayBuffer] = await Promise.all([resultPromise, arrayBufferPromise]);

            // Check the json
            if (await result.isOfType(MIMETypes.JSON)) {
                const json = await result.getJson();

                if (!Array.isArray(json) && json !== undefined && typeof json.upload_id === 'string') {
                    // Get the upload id
                    this._uploadId = json.upload_id;
                    // Compute the hash
                    this._md5Hash.append(arrayBuffer);
                }
                else {
                    throw new MediaServerError('The API didn\'t return a valid JSON.', json);
                }
            } else {
                throw new MediaServerError('The API didn\'t return a JSON.');
            }

            // Return true because we need this function to be called again
            return true;
        }
        // If the upload ID is still null, there is an error
        else if (this._uploadId === null) {
            throw new MediaServerError('Upload complete, but no upload id found.');
        }
        // Else, it is finished
        else {
            // Upload complete : validate it
            const hash = this._md5Hash.end();

            const result = await this._mediaServerAPIHandler.call('/upload/complete', {
                md5: hash,
                'upload_id': this._uploadId,
            });

            if (!result.success) {
                throw new MediaServerError('The upload didn\'t complete successfully', result);
            }

            return false;
        }
    }

    /** Only call this when the file uploaded successfully. Saves the uploaded video. */
    async saveVideo(params: {
        title: string;
    }): Promise<boolean> {

        assert(this._end >= this.size, 'The file must have finished uploading.');
        assert(this._uploadId !== null, 'uploadId must not be null, call this function only when the upload worked.');

        // Add the video
        const addResult = await this._mediaServerAPIHandler.call('/medias/add', {
            code: this._uploadId,
            title: params.title,
            channel: this._parentOid,
        });

        return addResult.success;
    }
}

export default VideoUpload;