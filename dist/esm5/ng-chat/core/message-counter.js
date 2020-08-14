var MessageCounter = /** @class */ (function () {
    function MessageCounter() {
    }
    MessageCounter.formatUnreadMessagesTotal = function (totalUnreadMessages) {
        if (totalUnreadMessages > 0) {
            if (totalUnreadMessages > 99)
                return "99+";
            else
                return String(totalUnreadMessages);
        }
        // Empty fallback.
        return "";
    };
    /**
     * Returns a formatted string containing the total unread messages of a chat window.
     * @param window The window instance to count the unread total messages.
     * @param currentUserId The current chat instance user id. In this context it would be the sender.
     */
    MessageCounter.unreadMessagesTotal = function (window, currentUserId) {
        var totalUnreadMessages = 0;
        if (window) {
            totalUnreadMessages = window.messages.filter(function (x) { return x.fromId != currentUserId && !x.dateSeen; }).length;
        }
        return MessageCounter.formatUnreadMessagesTotal(totalUnreadMessages);
    };
    return MessageCounter;
}());
export { MessageCounter };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWVzc2FnZS1jb3VudGVyLmpzIiwic291cmNlUm9vdCI6Im5nOi8vbmctY2hhdC8iLCJzb3VyY2VzIjpbIm5nLWNoYXQvY29yZS9tZXNzYWdlLWNvdW50ZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBRUE7SUFBQTtJQStCQSxDQUFDO0lBN0JpQix3Q0FBeUIsR0FBdkMsVUFBd0MsbUJBQTJCO1FBRS9ELElBQUksbUJBQW1CLEdBQUcsQ0FBQyxFQUFDO1lBRXhCLElBQUksbUJBQW1CLEdBQUcsRUFBRTtnQkFDeEIsT0FBUSxLQUFLLENBQUM7O2dCQUVkLE9BQU8sTUFBTSxDQUFDLG1CQUFtQixDQUFDLENBQUM7U0FDMUM7UUFFRCxrQkFBa0I7UUFDbEIsT0FBTyxFQUFFLENBQUM7SUFDZCxDQUFDO0lBRUQ7Ozs7T0FJRztJQUNXLGtDQUFtQixHQUFqQyxVQUFrQyxNQUFjLEVBQUUsYUFBa0I7UUFFaEUsSUFBSSxtQkFBbUIsR0FBRyxDQUFDLENBQUM7UUFFNUIsSUFBSSxNQUFNLEVBQUM7WUFDUCxtQkFBbUIsR0FBRyxNQUFNLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxVQUFBLENBQUMsSUFBSSxPQUFBLENBQUMsQ0FBQyxNQUFNLElBQUksYUFBYSxJQUFJLENBQUMsQ0FBQyxDQUFDLFFBQVEsRUFBeEMsQ0FBd0MsQ0FBQyxDQUFDLE1BQU0sQ0FBQztTQUN0RztRQUVELE9BQU8sY0FBYyxDQUFDLHlCQUF5QixDQUFDLG1CQUFtQixDQUFDLENBQUM7SUFDekUsQ0FBQztJQUNMLHFCQUFDO0FBQUQsQ0FBQyxBQS9CRCxJQStCQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IFdpbmRvdyB9IGZyb20gJy4vd2luZG93JztcblxuZXhwb3J0IGNsYXNzIE1lc3NhZ2VDb3VudGVyXG57XG4gICAgcHVibGljIHN0YXRpYyBmb3JtYXRVbnJlYWRNZXNzYWdlc1RvdGFsKHRvdGFsVW5yZWFkTWVzc2FnZXM6IG51bWJlcik6IHN0cmluZ1xuICAgIHtcbiAgICAgICAgaWYgKHRvdGFsVW5yZWFkTWVzc2FnZXMgPiAwKXtcblxuICAgICAgICAgICAgaWYgKHRvdGFsVW5yZWFkTWVzc2FnZXMgPiA5OSkgXG4gICAgICAgICAgICAgICAgcmV0dXJuICBcIjk5K1wiO1xuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIHJldHVybiBTdHJpbmcodG90YWxVbnJlYWRNZXNzYWdlcyk7IFxuICAgICAgICB9XG5cbiAgICAgICAgLy8gRW1wdHkgZmFsbGJhY2suXG4gICAgICAgIHJldHVybiBcIlwiO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFJldHVybnMgYSBmb3JtYXR0ZWQgc3RyaW5nIGNvbnRhaW5pbmcgdGhlIHRvdGFsIHVucmVhZCBtZXNzYWdlcyBvZiBhIGNoYXQgd2luZG93LlxuICAgICAqIEBwYXJhbSB3aW5kb3cgVGhlIHdpbmRvdyBpbnN0YW5jZSB0byBjb3VudCB0aGUgdW5yZWFkIHRvdGFsIG1lc3NhZ2VzLlxuICAgICAqIEBwYXJhbSBjdXJyZW50VXNlcklkIFRoZSBjdXJyZW50IGNoYXQgaW5zdGFuY2UgdXNlciBpZC4gSW4gdGhpcyBjb250ZXh0IGl0IHdvdWxkIGJlIHRoZSBzZW5kZXIuXG4gICAgICovXG4gICAgcHVibGljIHN0YXRpYyB1bnJlYWRNZXNzYWdlc1RvdGFsKHdpbmRvdzogV2luZG93LCBjdXJyZW50VXNlcklkOiBhbnkpOiBzdHJpbmdcbiAgICB7XG4gICAgICAgIGxldCB0b3RhbFVucmVhZE1lc3NhZ2VzID0gMDtcblxuICAgICAgICBpZiAod2luZG93KXtcbiAgICAgICAgICAgIHRvdGFsVW5yZWFkTWVzc2FnZXMgPSB3aW5kb3cubWVzc2FnZXMuZmlsdGVyKHggPT4geC5mcm9tSWQgIT0gY3VycmVudFVzZXJJZCAmJiAheC5kYXRlU2VlbikubGVuZ3RoO1xuICAgICAgICB9XG4gICAgICAgICAgICBcbiAgICAgICAgcmV0dXJuIE1lc3NhZ2VDb3VudGVyLmZvcm1hdFVucmVhZE1lc3NhZ2VzVG90YWwodG90YWxVbnJlYWRNZXNzYWdlcyk7XG4gICAgfVxufVxuIl19