import { MIMETypes } from 'utils/api-client';
import { MediaServerError, MSVideoAddBody } from '..';
import SparkMd5 from 'spark-md5';
import MediaServerAPIHandler from '../mediaserver-api-hanler';
import { getBlobArrayBuffer } from 'utils/useful-functions';

class VideoUpload {
    private _parentOid: string;
    private _addParams: MSVideoAddBody;
    private _start = 0;
    private _end = 0;
    private _lastChunkSize = 0;
    private _sliceSize: number;
    private _uploadId: string | null = null;
    private _mediaServerAPIHandler: MediaServerAPIHandler;
    private _md5Hash = new SparkMd5.ArrayBuffer();

    /** Returns the start index of the last chunk */
    public get start(): number { return this._start; }
    /** Returns the end index of the last chunk */
    public get end(): number { return this._end; }
    /** Returns the total size of the file */
    public get size(): number { return this._addParams.videoFile.size; }

    constructor(params: MSVideoAddBody, sliceSize: number, mediaServerAPIHandler: MediaServerAPIHandler, parentOid: string) {
        this._addParams = params;
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
            console.log(`${this._start}-${this._end - 1}`);
            const chunk = this._addParams.videoFile.slice(this._start, this._end, this._addParams.videoFile.type);

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
            data.append('file', nextChunk, this._addParams.videoFile.name);

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
            console.log(hash);
            const result = await this._mediaServerAPIHandler.call('/upload/complete', {
                md5: hash,
                'upload_id': this._uploadId,
            });

            if (result.success) {
                // Add the video
                const addResult = await this._mediaServerAPIHandler.call('/medias/add', {
                    code: this._uploadId,
                    title: this._addParams.title,
                    channel: this._parentOid,
                });

                if (!addResult.success) {
                    throw new MediaServerError('Unable to add video', addResult);
                }

                // process finished, no need to call this function again
                return false;
            } else {
                throw new MediaServerError('The upload didn\'t complete successfully', result);
            }
        }
    }
}

export default VideoUpload;