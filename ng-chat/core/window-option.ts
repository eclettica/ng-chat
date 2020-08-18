import { Window } from '../core/window';
import { IChatParticipant } from '../core/chat-participant';
import { WindowButton } from './window-button';

export class WindowOption
{
    public buttons?: Array<WindowButton>;
    public chattingTo: Window;
    public windowClass?: string;
}
