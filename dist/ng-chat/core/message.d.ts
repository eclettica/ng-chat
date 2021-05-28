import { MessageType } from './message-type.enum';
export declare class Message {
    type?: MessageType;
    fromId: any;
    toId: any;
    message: string;
    dateSent?: Date;
    dateSeen?: Date;
    repositoryId?: string;
    attachmentName?: string;
    repositorySrcUri?: string;
    groupId?: string;
    randomId?: string;
    fileId?: string;
    fileName?: string;
}
