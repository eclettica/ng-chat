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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2hhdC1hZGFwdGVyLmpzIiwic291cmNlUm9vdCI6Im5nOi8vbmctY2hhdC8iLCJzb3VyY2VzIjpbIm5nLWNoYXQvY29yZS9jaGF0LWFkYXB0ZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBTUEsTUFBTSxPQUFnQixXQUFXO0lBQWpDO1FBRUksbUNBQW1DO1FBd0JuQyxpQkFBaUI7UUFDakIsZ0JBQWdCO1FBQ2hCLDhCQUF5QixHQUEyRCxDQUFDLG9CQUEyQyxFQUFFLEVBQUUsR0FBRSxDQUFDLENBQUM7UUFDeEksZ0JBQWdCO1FBQ2hCLDJCQUFzQixHQUE4RCxDQUFDLFdBQTZCLEVBQUUsT0FBZ0IsRUFBRSxFQUFFLEdBQUUsQ0FBQyxDQUFDO0lBQ2hKLENBQUM7SUFqQkcsNkNBQTZDO0lBRXRDLG9CQUFvQixDQUFDLG9CQUEyQztRQUVuRSxJQUFJLENBQUMseUJBQXlCLENBQUMsb0JBQW9CLENBQUMsQ0FBQztJQUN6RCxDQUFDO0lBRU0saUJBQWlCLENBQUMsV0FBNkIsRUFBRSxPQUFnQjtRQUVwRSxJQUFJLENBQUMsc0JBQXNCLENBQUMsV0FBVyxFQUFFLE9BQU8sQ0FBQyxDQUFDO0lBQ3RELENBQUM7Q0FPSiIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IE9ic2VydmFibGUgfSBmcm9tICdyeGpzJztcbmltcG9ydCB7IE1lc3NhZ2UgfSBmcm9tIFwiLi9tZXNzYWdlXCI7XG5pbXBvcnQgeyBVc2VyIH0gZnJvbSBcIi4vdXNlclwiO1xuaW1wb3J0IHsgUGFydGljaXBhbnRSZXNwb25zZSB9IGZyb20gXCIuL3BhcnRpY2lwYW50LXJlc3BvbnNlXCI7XG5pbXBvcnQgeyBJQ2hhdFBhcnRpY2lwYW50IH0gZnJvbSAnLi9jaGF0LXBhcnRpY2lwYW50JztcblxuZXhwb3J0IGFic3RyYWN0IGNsYXNzIENoYXRBZGFwdGVyXG57XG4gICAgLy8gIyMjIEFic3RyYWN0IGFkYXB0ZXIgbWV0aG9kcyAjIyNcblxuICAgIHB1YmxpYyBhYnN0cmFjdCBsaXN0RnJpZW5kcygpOiBPYnNlcnZhYmxlPFBhcnRpY2lwYW50UmVzcG9uc2VbXT47XG5cbiAgICBwdWJsaWMgYWJzdHJhY3QgZ2V0TWVzc2FnZUhpc3RvcnkoZGVzdGluYXRhcnlJZDogYW55KTogT2JzZXJ2YWJsZTxNZXNzYWdlW10+O1xuXG4gICAgcHVibGljIGFic3RyYWN0IHNlbmRNZXNzYWdlKG1lc3NhZ2U6IE1lc3NhZ2UpOiB2b2lkO1xuXG4gICAgcHVibGljIGFic3RyYWN0IGRvd25sb2FkRmlsZShyZXBvc2l0b3J5SWQ6IHN0cmluZywgZmlsZU5hbWU6IHN0cmluZyk6IHZvaWQ7XG5cbiAgICBwdWJsaWMgYWJzdHJhY3QgZ29Ub1JlcG8ocmVwb3NpdG9yeUlkOiBzdHJpbmcsIGlzR3JvdXA6IGJvb2xlYW4pOiB2b2lkO1xuXG4gICAgLy8gIyMjIEFkYXB0ZXIvQ2hhdCBpbmNvbWUvaW5ncmVzcyBldmVudHMgIyMjXG5cbiAgICBwdWJsaWMgb25GcmllbmRzTGlzdENoYW5nZWQocGFydGljaXBhbnRzUmVzcG9uc2U6IFBhcnRpY2lwYW50UmVzcG9uc2VbXSk6IHZvaWRcbiAgICB7XG4gICAgICAgIHRoaXMuZnJpZW5kc0xpc3RDaGFuZ2VkSGFuZGxlcihwYXJ0aWNpcGFudHNSZXNwb25zZSk7XG4gICAgfVxuXG4gICAgcHVibGljIG9uTWVzc2FnZVJlY2VpdmVkKHBhcnRpY2lwYW50OiBJQ2hhdFBhcnRpY2lwYW50LCBtZXNzYWdlOiBNZXNzYWdlKTogdm9pZFxuICAgIHtcbiAgICAgICAgdGhpcy5tZXNzYWdlUmVjZWl2ZWRIYW5kbGVyKHBhcnRpY2lwYW50LCBtZXNzYWdlKTtcbiAgICB9XG5cbiAgICAvLyBFdmVudCBoYW5kbGVyc1xuICAgIC8qKiBAaW50ZXJuYWwgKi9cbiAgICBmcmllbmRzTGlzdENoYW5nZWRIYW5kbGVyOiAocGFydGljaXBhbnRzUmVzcG9uc2U6IFBhcnRpY2lwYW50UmVzcG9uc2VbXSkgPT4gdm9pZCAgPSAocGFydGljaXBhbnRzUmVzcG9uc2U6IFBhcnRpY2lwYW50UmVzcG9uc2VbXSkgPT4ge307XG4gICAgLyoqIEBpbnRlcm5hbCAqL1xuICAgIG1lc3NhZ2VSZWNlaXZlZEhhbmRsZXI6IChwYXJ0aWNpcGFudDogSUNoYXRQYXJ0aWNpcGFudCwgbWVzc2FnZTogTWVzc2FnZSkgPT4gdm9pZCA9IChwYXJ0aWNpcGFudDogSUNoYXRQYXJ0aWNpcGFudCwgbWVzc2FnZTogTWVzc2FnZSkgPT4ge307XG59XG4iXX0=