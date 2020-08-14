export class MessageCounter {
    static formatUnreadMessagesTotal(totalUnreadMessages) {
        if (totalUnreadMessages > 0) {
            if (totalUnreadMessages > 99)
                return "99+";
            else
                return String(totalUnreadMessages);
        }
        // Empty fallback.
        return "";
    }
    /**
     * Returns a formatted string containing the total unread messages of a chat window.
     * @param window The window instance to count the unread total messages.
     * @param currentUserId The current chat instance user id. In this context it would be the sender.
     */
    static unreadMessagesTotal(window, currentUserId) {
        let totalUnreadMessages = 0;
        if (window) {
            totalUnreadMessages = window.messages.filter(x => x.fromId != currentUserId && !x.dateSeen).length;
        }
        return MessageCounter.formatUnreadMessagesTotal(totalUnreadMessages);
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWVzc2FnZS1jb3VudGVyLmpzIiwic291cmNlUm9vdCI6Im5nOi8vbmctY2hhdC8iLCJzb3VyY2VzIjpbIm5nLWNoYXQvY29yZS9tZXNzYWdlLWNvdW50ZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBRUEsTUFBTSxPQUFPLGNBQWM7SUFFaEIsTUFBTSxDQUFDLHlCQUF5QixDQUFDLG1CQUEyQjtRQUUvRCxJQUFJLG1CQUFtQixHQUFHLENBQUMsRUFBQztZQUV4QixJQUFJLG1CQUFtQixHQUFHLEVBQUU7Z0JBQ3hCLE9BQVEsS0FBSyxDQUFDOztnQkFFZCxPQUFPLE1BQU0sQ0FBQyxtQkFBbUIsQ0FBQyxDQUFDO1NBQzFDO1FBRUQsa0JBQWtCO1FBQ2xCLE9BQU8sRUFBRSxDQUFDO0lBQ2QsQ0FBQztJQUVEOzs7O09BSUc7SUFDSSxNQUFNLENBQUMsbUJBQW1CLENBQUMsTUFBYyxFQUFFLGFBQWtCO1FBRWhFLElBQUksbUJBQW1CLEdBQUcsQ0FBQyxDQUFDO1FBRTVCLElBQUksTUFBTSxFQUFDO1lBQ1AsbUJBQW1CLEdBQUcsTUFBTSxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsTUFBTSxJQUFJLGFBQWEsSUFBSSxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxNQUFNLENBQUM7U0FDdEc7UUFFRCxPQUFPLGNBQWMsQ0FBQyx5QkFBeUIsQ0FBQyxtQkFBbUIsQ0FBQyxDQUFDO0lBQ3pFLENBQUM7Q0FDSiIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IFdpbmRvdyB9IGZyb20gJy4vd2luZG93JztcblxuZXhwb3J0IGNsYXNzIE1lc3NhZ2VDb3VudGVyXG57XG4gICAgcHVibGljIHN0YXRpYyBmb3JtYXRVbnJlYWRNZXNzYWdlc1RvdGFsKHRvdGFsVW5yZWFkTWVzc2FnZXM6IG51bWJlcik6IHN0cmluZ1xuICAgIHtcbiAgICAgICAgaWYgKHRvdGFsVW5yZWFkTWVzc2FnZXMgPiAwKXtcblxuICAgICAgICAgICAgaWYgKHRvdGFsVW5yZWFkTWVzc2FnZXMgPiA5OSkgXG4gICAgICAgICAgICAgICAgcmV0dXJuICBcIjk5K1wiO1xuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIHJldHVybiBTdHJpbmcodG90YWxVbnJlYWRNZXNzYWdlcyk7IFxuICAgICAgICB9XG5cbiAgICAgICAgLy8gRW1wdHkgZmFsbGJhY2suXG4gICAgICAgIHJldHVybiBcIlwiO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFJldHVybnMgYSBmb3JtYXR0ZWQgc3RyaW5nIGNvbnRhaW5pbmcgdGhlIHRvdGFsIHVucmVhZCBtZXNzYWdlcyBvZiBhIGNoYXQgd2luZG93LlxuICAgICAqIEBwYXJhbSB3aW5kb3cgVGhlIHdpbmRvdyBpbnN0YW5jZSB0byBjb3VudCB0aGUgdW5yZWFkIHRvdGFsIG1lc3NhZ2VzLlxuICAgICAqIEBwYXJhbSBjdXJyZW50VXNlcklkIFRoZSBjdXJyZW50IGNoYXQgaW5zdGFuY2UgdXNlciBpZC4gSW4gdGhpcyBjb250ZXh0IGl0IHdvdWxkIGJlIHRoZSBzZW5kZXIuXG4gICAgICovXG4gICAgcHVibGljIHN0YXRpYyB1bnJlYWRNZXNzYWdlc1RvdGFsKHdpbmRvdzogV2luZG93LCBjdXJyZW50VXNlcklkOiBhbnkpOiBzdHJpbmdcbiAgICB7XG4gICAgICAgIGxldCB0b3RhbFVucmVhZE1lc3NhZ2VzID0gMDtcblxuICAgICAgICBpZiAod2luZG93KXtcbiAgICAgICAgICAgIHRvdGFsVW5yZWFkTWVzc2FnZXMgPSB3aW5kb3cubWVzc2FnZXMuZmlsdGVyKHggPT4geC5mcm9tSWQgIT0gY3VycmVudFVzZXJJZCAmJiAheC5kYXRlU2VlbikubGVuZ3RoO1xuICAgICAgICB9XG4gICAgICAgICAgICBcbiAgICAgICAgcmV0dXJuIE1lc3NhZ2VDb3VudGVyLmZvcm1hdFVucmVhZE1lc3NhZ2VzVG90YWwodG90YWxVbnJlYWRNZXNzYWdlcyk7XG4gICAgfVxufVxuIl19