import { Window } from '../core/window';
import { IChatParticipant } from '../core/chat-participant';
export declare class WindowButton {
    title: string;
    showIcon: boolean;
    icon: string;
    action?: (chattingTo: Window) => void;
    enableButton?: (participant: IChatParticipant) => boolean;
}
