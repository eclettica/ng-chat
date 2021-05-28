import { MessageType } from './message-type.enum';

export class Message
{
    public type?: MessageType = MessageType.Text;
    public fromId: any;
    public toId: any;
    public message: string;
    public dateSent?: Date;
    public dateSeen?: Date;
    public repositoryId?: string;
    public attachmentName?: string;
    public repositorySrcUri?: string;
    public groupId?: string;
    public randomId?: string;
    public fileId?: string;
    public fileName?: string;
}
