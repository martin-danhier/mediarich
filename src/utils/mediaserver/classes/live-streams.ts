import { MSMedia } from './media';

export enum MSLiveStreamStatus {
    Ongoing = 'ongoing',
    Planned = 'planned',
    Finished = 'finished',
}

export default class MSLiveStream extends MSMedia {
    private _status?: MSLiveStreamStatus;
}