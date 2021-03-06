var ChatAdapter = /** @class */ (function () {
    function ChatAdapter() {
        // ### Abstract adapter methods ###
        // Event handlers
        /** @internal */
        this.friendsListChangedHandler = function (participantsResponse) { };
        /** @internal */
        this.messageReceivedHandler = function (participant, message) { };
    }
    // ### Adapter/Chat income/ingress events ###
    ChatAdapter.prototype.onFriendsListChanged = function (participantsResponse) {
        this.friendsListChangedHandler(participantsResponse);
    };
    ChatAdapter.prototype.onMessageReceived = function (participant, message) {
        this.messageReceivedHandler(participant, message);
    };
    return ChatAdapter;
}());
export { ChatAdapter };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2hhdC1hZGFwdGVyLmpzIiwic291cmNlUm9vdCI6Im5nOi8vbmctY2hhdC8iLCJzb3VyY2VzIjpbIm5nLWNoYXQvY29yZS9jaGF0LWFkYXB0ZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBTUE7SUFBQTtRQUVJLG1DQUFtQztRQXdCbkMsaUJBQWlCO1FBQ2pCLGdCQUFnQjtRQUNoQiw4QkFBeUIsR0FBMkQsVUFBQyxvQkFBMkMsSUFBTSxDQUFDLENBQUM7UUFDeEksZ0JBQWdCO1FBQ2hCLDJCQUFzQixHQUE4RCxVQUFDLFdBQTZCLEVBQUUsT0FBZ0IsSUFBTSxDQUFDLENBQUM7SUFDaEosQ0FBQztJQWpCRyw2Q0FBNkM7SUFFdEMsMENBQW9CLEdBQTNCLFVBQTRCLG9CQUEyQztRQUVuRSxJQUFJLENBQUMseUJBQXlCLENBQUMsb0JBQW9CLENBQUMsQ0FBQztJQUN6RCxDQUFDO0lBRU0sdUNBQWlCLEdBQXhCLFVBQXlCLFdBQTZCLEVBQUUsT0FBZ0I7UUFFcEUsSUFBSSxDQUFDLHNCQUFzQixDQUFDLFdBQVcsRUFBRSxPQUFPLENBQUMsQ0FBQztJQUN0RCxDQUFDO0lBT0wsa0JBQUM7QUFBRCxDQUFDLEFBL0JELElBK0JDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgT2JzZXJ2YWJsZSB9IGZyb20gJ3J4anMnO1xuaW1wb3J0IHsgTWVzc2FnZSB9IGZyb20gXCIuL21lc3NhZ2VcIjtcbmltcG9ydCB7IFVzZXIgfSBmcm9tIFwiLi91c2VyXCI7XG5pbXBvcnQgeyBQYXJ0aWNpcGFudFJlc3BvbnNlIH0gZnJvbSBcIi4vcGFydGljaXBhbnQtcmVzcG9uc2VcIjtcbmltcG9ydCB7IElDaGF0UGFydGljaXBhbnQgfSBmcm9tICcuL2NoYXQtcGFydGljaXBhbnQnO1xuXG5leHBvcnQgYWJzdHJhY3QgY2xhc3MgQ2hhdEFkYXB0ZXJcbntcbiAgICAvLyAjIyMgQWJzdHJhY3QgYWRhcHRlciBtZXRob2RzICMjI1xuXG4gICAgcHVibGljIGFic3RyYWN0IGxpc3RGcmllbmRzKCk6IE9ic2VydmFibGU8UGFydGljaXBhbnRSZXNwb25zZVtdPjtcblxuICAgIHB1YmxpYyBhYnN0cmFjdCBnZXRNZXNzYWdlSGlzdG9yeShkZXN0aW5hdGFyeUlkOiBhbnkpOiBPYnNlcnZhYmxlPE1lc3NhZ2VbXT47XG5cbiAgICBwdWJsaWMgYWJzdHJhY3Qgc2VuZE1lc3NhZ2UobWVzc2FnZTogTWVzc2FnZSk6IHZvaWQ7XG5cbiAgICBwdWJsaWMgYWJzdHJhY3QgZG93bmxvYWRGaWxlKHJlcG9zaXRvcnlJZDogc3RyaW5nLCBmaWxlTmFtZTogc3RyaW5nKTogdm9pZDtcblxuICAgIHB1YmxpYyBhYnN0cmFjdCBnb1RvUmVwbyhyZXBvc2l0b3J5SWQ6IHN0cmluZywgaXNHcm91cDogYm9vbGVhbik6IHZvaWQ7XG5cbiAgICAvLyAjIyMgQWRhcHRlci9DaGF0IGluY29tZS9pbmdyZXNzIGV2ZW50cyAjIyNcblxuICAgIHB1YmxpYyBvbkZyaWVuZHNMaXN0Q2hhbmdlZChwYXJ0aWNpcGFudHNSZXNwb25zZTogUGFydGljaXBhbnRSZXNwb25zZVtdKTogdm9pZFxuICAgIHtcbiAgICAgICAgdGhpcy5mcmllbmRzTGlzdENoYW5nZWRIYW5kbGVyKHBhcnRpY2lwYW50c1Jlc3BvbnNlKTtcbiAgICB9XG5cbiAgICBwdWJsaWMgb25NZXNzYWdlUmVjZWl2ZWQocGFydGljaXBhbnQ6IElDaGF0UGFydGljaXBhbnQsIG1lc3NhZ2U6IE1lc3NhZ2UpOiB2b2lkXG4gICAge1xuICAgICAgICB0aGlzLm1lc3NhZ2VSZWNlaXZlZEhhbmRsZXIocGFydGljaXBhbnQsIG1lc3NhZ2UpO1xuICAgIH1cblxuICAgIC8vIEV2ZW50IGhhbmRsZXJzXG4gICAgLyoqIEBpbnRlcm5hbCAqL1xuICAgIGZyaWVuZHNMaXN0Q2hhbmdlZEhhbmRsZXI6IChwYXJ0aWNpcGFudHNSZXNwb25zZTogUGFydGljaXBhbnRSZXNwb25zZVtdKSA9PiB2b2lkICA9IChwYXJ0aWNpcGFudHNSZXNwb25zZTogUGFydGljaXBhbnRSZXNwb25zZVtdKSA9PiB7fTtcbiAgICAvKiogQGludGVybmFsICovXG4gICAgbWVzc2FnZVJlY2VpdmVkSGFuZGxlcjogKHBhcnRpY2lwYW50OiBJQ2hhdFBhcnRpY2lwYW50LCBtZXNzYWdlOiBNZXNzYWdlKSA9PiB2b2lkID0gKHBhcnRpY2lwYW50OiBJQ2hhdFBhcnRpY2lwYW50LCBtZXNzYWdlOiBNZXNzYWdlKSA9PiB7fTtcbn1cbiJdfQ==