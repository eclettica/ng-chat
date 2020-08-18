import { Window } from '../core/window';
import { IChatParticipant } from '../core/chat-participant';

export class WindowButton
{
    title: string;
    showIcon: boolean;
    icon: string;
    action?: (chattingTo: Window) => void;
    enableButton?: (participant: IChatParticipant) => boolean;
}
