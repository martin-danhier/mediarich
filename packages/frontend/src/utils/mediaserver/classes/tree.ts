import MSChannel from './channel';

export interface MSChannelTreeItem {
    channel: MSChannel;
    title: string;
    slug: string;
    children?: MSChannelTreeItem[];
}

