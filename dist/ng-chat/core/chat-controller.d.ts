import { User } from './user';
import { WindowOption } from './window-option';
export interface IChatController {
    triggerOpenChatWindow(user: User, options?: WindowOption): void;
    triggerCloseChatWindow(userId: any): void;
    triggerToggleChatWindowVisibility(userId: any): void;
    fetchFriendsList(isBootstrapping: boolean): void;
    setBeforeParteciantChatClosed(func: any): void;
}
