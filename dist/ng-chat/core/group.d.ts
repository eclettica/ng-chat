import { User } from "./user";
import { ChatParticipantStatus } from "./chat-participant-status.enum";
import { IChatParticipant } from "./chat-participant";
import { ChatParticipantType } from "./chat-participant-type.enum";
import { WindowOption } from "./window-option";
export declare class Group implements IChatParticipant {
    constructor(participants: User[]);
    id: string;
    chattingTo: User[];
    readonly participantType: ChatParticipantType;
    status: ChatParticipantStatus;
    avatar: string | null;
    avatarSrc: string | null;
    displayName: string;
    windowOptions: WindowOption | null;
}
