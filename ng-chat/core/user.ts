import { ChatParticipantStatus } from "./chat-participant-status.enum";
import { IChatParticipant } from "./chat-participant";
import { ChatParticipantType } from "./chat-participant-type.enum";
import { WindowOption } from "./window-option";

export class User implements IChatParticipant
{
    public readonly participantType: ChatParticipantType = ChatParticipantType.User;
    public id: any;
    public displayName: string;
    public status: ChatParticipantStatus;
    public avatar: string;
    public avatarSrc: string;
    public windowOptions: WindowOption|null;
}
