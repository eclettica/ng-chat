import { Window } from './window';
export declare class MessageCounter {
    static formatUnreadMessagesTotal(totalUnreadMessages: number): string;
    /**
     * Returns a formatted string containing the total unread messages of a chat window.
     * @param window The window instance to count the unread total messages.
     * @param currentUserId The current chat instance user id. In this context it would be the sender.
     */
    static unreadMessagesTotal(window: Window, currentUserId: any): string;
}
