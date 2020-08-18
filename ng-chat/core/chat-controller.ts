import { User } from './user';
import { IChatParticipant } from './chat-participant';
import { WindowOption } from './window-option';

export interface IChatController
{
    triggerOpenChatWindow(user: User, options?: WindowOption): void;

    triggerCloseChatWindow(userId: any): void;

    triggerToggleChatWindowVisibility(userId: any): void;

    fetchFriendsList(isBootstrapping: boolean): void;

    setBeforeParteciantChatClosed(func: any): void;

}
