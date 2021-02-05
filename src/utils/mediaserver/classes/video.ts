import { MSMedia } from './media';

export class MSVideo extends MSMedia {
    /** Media layout (can be "composition" for dynamic rich media, "webinar" for video next to jpeg slides, or "" for regular videos) */
    private _layout?: 'composition' | 'webinar' | '';
    /** Media duration
     * @example "5 m 58 s"
     */
    private _duration?: string;
}