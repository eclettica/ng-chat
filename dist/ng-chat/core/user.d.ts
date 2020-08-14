import { ChatParticipantStatus } from "./chat-participant-status.enum";
import { IChatParticipant } from "./chat-participant";
import { ChatParticipantType } from "./chat-participant-type.enum";
export declare class User implements IChatParticipant {
    readonly participantType: ChatParticipantType;
    id: any;
    displayName: string;
    status: ChatParticipantStatus;
    avatar: string;
}
