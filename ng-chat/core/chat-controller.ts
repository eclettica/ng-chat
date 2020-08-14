import { User } from './user';
import { IChatParticipant } from './chat-participant';

export interface IChatController
{
    triggerOpenChatWindow(user: User): void;

    triggerCloseChatWindow(userId: any): void;

    triggerToggleChatWindowVisibility(userId: any): void;

    fetchFriendsList(isBootstrapping: boolean): void;

    setBeforeParteciantChatClosed(func: any): void;

}
