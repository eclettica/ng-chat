import { Message } from "./message";
import { IChatParticipant } from "./chat-participant";
export declare class Window {
    constructor(participant: IChatParticipant, isLoadingHistory: boolean, isCollapsed: boolean);
    participant: IChatParticipant;
    messages: Message[];
    newMessage?: string;
    isCollapsed?: boolean;
    isLoadingHistory: boolean;
    hasFocus: boolean;
    hasMoreMessages: boolean;
    historyPage: number;
}
