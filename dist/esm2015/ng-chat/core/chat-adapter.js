export class ChatAdapter {
    constructor() {
        // ### Abstract adapter methods ###
        // Event handlers
        /** @internal */
        this.friendsListChangedHandler = (participantsResponse) => { };
        /** @internal */
        this.messageReceivedHandler = (participant, message) => { };
    }
    // ### Adapter/Chat income/ingress events ###
    onFriendsListChanged(participantsResponse) {
        this.friendsListChangedHandler(participantsResponse);
    }
    onMessageReceived(participant, message) {
        this.messageReceivedHandler(participant, message);
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2hhdC1hZGFwdGVyLmpzIiwic291cmNlUm9vdCI6Im5nOi8vbmctY2hhdC8iLCJzb3VyY2VzIjpbIm5nLWNoYXQvY29yZS9jaGF0LWFkYXB0ZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBTUEsTUFBTSxPQUFnQixXQUFXO0lBQWpDO1FBRUksbUNBQW1DO1FBb0JuQyxpQkFBaUI7UUFDakIsZ0JBQWdCO1FBQ2hCLDhCQUF5QixHQUEyRCxDQUFDLG9CQUEyQyxFQUFFLEVBQUUsR0FBRSxDQUFDLENBQUM7UUFDeEksZ0JBQWdCO1FBQ2hCLDJCQUFzQixHQUE4RCxDQUFDLFdBQTZCLEVBQUUsT0FBZ0IsRUFBRSxFQUFFLEdBQUUsQ0FBQyxDQUFDO0lBQ2hKLENBQUM7SUFqQkcsNkNBQTZDO0lBRXRDLG9CQUFvQixDQUFDLG9CQUEyQztRQUVuRSxJQUFJLENBQUMseUJBQXlCLENBQUMsb0JBQW9CLENBQUMsQ0FBQztJQUN6RCxDQUFDO0lBRU0saUJBQWlCLENBQUMsV0FBNkIsRUFBRSxPQUFnQjtRQUVwRSxJQUFJLENBQUMsc0JBQXNCLENBQUMsV0FBVyxFQUFFLE9BQU8sQ0FBQyxDQUFDO0lBQ3RELENBQUM7Q0FPSiIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IE9ic2VydmFibGUgfSBmcm9tICdyeGpzJztcbmltcG9ydCB7IE1lc3NhZ2UgfSBmcm9tIFwiLi9tZXNzYWdlXCI7XG5pbXBvcnQgeyBVc2VyIH0gZnJvbSBcIi4vdXNlclwiO1xuaW1wb3J0IHsgUGFydGljaXBhbnRSZXNwb25zZSB9IGZyb20gXCIuL3BhcnRpY2lwYW50LXJlc3BvbnNlXCI7XG5pbXBvcnQgeyBJQ2hhdFBhcnRpY2lwYW50IH0gZnJvbSAnLi9jaGF0LXBhcnRpY2lwYW50JztcblxuZXhwb3J0IGFic3RyYWN0IGNsYXNzIENoYXRBZGFwdGVyXG57XG4gICAgLy8gIyMjIEFic3RyYWN0IGFkYXB0ZXIgbWV0aG9kcyAjIyNcblxuICAgIHB1YmxpYyBhYnN0cmFjdCBsaXN0RnJpZW5kcygpOiBPYnNlcnZhYmxlPFBhcnRpY2lwYW50UmVzcG9uc2VbXT47XG4gICAgXG4gICAgcHVibGljIGFic3RyYWN0IGdldE1lc3NhZ2VIaXN0b3J5KGRlc3RpbmF0YXJ5SWQ6IGFueSk6IE9ic2VydmFibGU8TWVzc2FnZVtdPjtcblxuICAgIHB1YmxpYyBhYnN0cmFjdCBzZW5kTWVzc2FnZShtZXNzYWdlOiBNZXNzYWdlKTogdm9pZDtcblxuICAgIC8vICMjIyBBZGFwdGVyL0NoYXQgaW5jb21lL2luZ3Jlc3MgZXZlbnRzICMjI1xuXG4gICAgcHVibGljIG9uRnJpZW5kc0xpc3RDaGFuZ2VkKHBhcnRpY2lwYW50c1Jlc3BvbnNlOiBQYXJ0aWNpcGFudFJlc3BvbnNlW10pOiB2b2lkXG4gICAge1xuICAgICAgICB0aGlzLmZyaWVuZHNMaXN0Q2hhbmdlZEhhbmRsZXIocGFydGljaXBhbnRzUmVzcG9uc2UpO1xuICAgIH1cblxuICAgIHB1YmxpYyBvbk1lc3NhZ2VSZWNlaXZlZChwYXJ0aWNpcGFudDogSUNoYXRQYXJ0aWNpcGFudCwgbWVzc2FnZTogTWVzc2FnZSk6IHZvaWRcbiAgICB7XG4gICAgICAgIHRoaXMubWVzc2FnZVJlY2VpdmVkSGFuZGxlcihwYXJ0aWNpcGFudCwgbWVzc2FnZSk7XG4gICAgfVxuICAgIFxuICAgIC8vIEV2ZW50IGhhbmRsZXJzXG4gICAgLyoqIEBpbnRlcm5hbCAqL1xuICAgIGZyaWVuZHNMaXN0Q2hhbmdlZEhhbmRsZXI6IChwYXJ0aWNpcGFudHNSZXNwb25zZTogUGFydGljaXBhbnRSZXNwb25zZVtdKSA9PiB2b2lkICA9IChwYXJ0aWNpcGFudHNSZXNwb25zZTogUGFydGljaXBhbnRSZXNwb25zZVtdKSA9PiB7fTtcbiAgICAvKiogQGludGVybmFsICovXG4gICAgbWVzc2FnZVJlY2VpdmVkSGFuZGxlcjogKHBhcnRpY2lwYW50OiBJQ2hhdFBhcnRpY2lwYW50LCBtZXNzYWdlOiBNZXNzYWdlKSA9PiB2b2lkID0gKHBhcnRpY2lwYW50OiBJQ2hhdFBhcnRpY2lwYW50LCBtZXNzYWdlOiBNZXNzYWdlKSA9PiB7fTtcbn1cbiJdfQ==