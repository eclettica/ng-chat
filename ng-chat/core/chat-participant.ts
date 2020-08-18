import { ChatParticipantStatus } from "./chat-participant-status.enum";
import { ChatParticipantType } from "./chat-participant-type.enum";
import { WindowOption } from "./window-option";

export interface IChatParticipant {
    readonly participantType: ChatParticipantType;
    readonly id: any;
    readonly status: ChatParticipantStatus;
    readonly avatar: string|null;
    readonly avatarSrc: string|null;
    readonly displayName: string;
    readonly windowOptions: WindowOption|null;
}
