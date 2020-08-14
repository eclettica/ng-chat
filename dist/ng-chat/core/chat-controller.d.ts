import { User } from './user';
export interface IChatController {
    triggerOpenChatWindow(user: User): void;
    triggerCloseChatWindow(userId: any): void;
    triggerToggleChatWindowVisibility(userId: any): void;
    fetchFriendsList(isBootstrapping: boolean): void;
    setBeforeParteciantChatClosed(func: any): void;
}
