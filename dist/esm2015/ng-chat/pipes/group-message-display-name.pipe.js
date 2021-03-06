import { __decorate } from "tslib";
import { Pipe } from '@angular/core';
import { ChatParticipantType } from "../core/chat-participant-type.enum";
/*
 * Renders the display name of a participant in a group based on who's sent the message
*/
let GroupMessageDisplayNamePipe = class GroupMessageDisplayNamePipe {
    transform(participant, message) {
        if (participant && participant.participantType == ChatParticipantType.Group) {
            let group = participant;
            let userIndex = group.chattingTo.findIndex(x => x.id == message.fromId);
            return group.chattingTo[userIndex >= 0 ? userIndex : 0].displayName;
        }
        else
            return "";
    }
};
GroupMessageDisplayNamePipe = __decorate([
    Pipe({ name: 'groupMessageDisplayName' })
], GroupMessageDisplayNamePipe);
export { GroupMessageDisplayNamePipe };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ3JvdXAtbWVzc2FnZS1kaXNwbGF5LW5hbWUucGlwZS5qcyIsInNvdXJjZVJvb3QiOiJuZzovL25nLWNoYXQvIiwic291cmNlcyI6WyJuZy1jaGF0L3BpcGVzL2dyb3VwLW1lc3NhZ2UtZGlzcGxheS1uYW1lLnBpcGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBLE9BQU8sRUFBRSxJQUFJLEVBQWlCLE1BQU0sZUFBZSxDQUFDO0FBRXBELE9BQU8sRUFBRSxtQkFBbUIsRUFBRSxNQUFNLG9DQUFvQyxDQUFDO0FBSXpFOztFQUVFO0FBRUYsSUFBYSwyQkFBMkIsR0FBeEMsTUFBYSwyQkFBMkI7SUFDcEMsU0FBUyxDQUFDLFdBQTZCLEVBQUUsT0FBZ0I7UUFDckQsSUFBSSxXQUFXLElBQUksV0FBVyxDQUFDLGVBQWUsSUFBSSxtQkFBbUIsQ0FBQyxLQUFLLEVBQzNFO1lBQ0ksSUFBSSxLQUFLLEdBQUcsV0FBb0IsQ0FBQztZQUNqQyxJQUFJLFNBQVMsR0FBRyxLQUFLLENBQUMsVUFBVSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxFQUFFLElBQUksT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDO1lBRXhFLE9BQU8sS0FBSyxDQUFDLFVBQVUsQ0FBQyxTQUFTLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFdBQVcsQ0FBQztTQUN2RTs7WUFFRyxPQUFPLEVBQUUsQ0FBQztJQUNsQixDQUFDO0NBQ0osQ0FBQTtBQVpZLDJCQUEyQjtJQUR2QyxJQUFJLENBQUMsRUFBQyxJQUFJLEVBQUUseUJBQXlCLEVBQUMsQ0FBQztHQUMzQiwyQkFBMkIsQ0FZdkM7U0FaWSwyQkFBMkIiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBQaXBlLCBQaXBlVHJhbnNmb3JtIH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQgeyBHcm91cCB9IGZyb20gXCIuLi9jb3JlL2dyb3VwXCI7XG5pbXBvcnQgeyBDaGF0UGFydGljaXBhbnRUeXBlIH0gZnJvbSBcIi4uL2NvcmUvY2hhdC1wYXJ0aWNpcGFudC10eXBlLmVudW1cIjtcbmltcG9ydCB7IElDaGF0UGFydGljaXBhbnQgfSBmcm9tIFwiLi4vY29yZS9jaGF0LXBhcnRpY2lwYW50XCI7XG5pbXBvcnQgeyBNZXNzYWdlIH0gZnJvbSBcIi4uL2NvcmUvbWVzc2FnZVwiO1xuXG4vKlxuICogUmVuZGVycyB0aGUgZGlzcGxheSBuYW1lIG9mIGEgcGFydGljaXBhbnQgaW4gYSBncm91cCBiYXNlZCBvbiB3aG8ncyBzZW50IHRoZSBtZXNzYWdlXG4qL1xuQFBpcGUoe25hbWU6ICdncm91cE1lc3NhZ2VEaXNwbGF5TmFtZSd9KVxuZXhwb3J0IGNsYXNzIEdyb3VwTWVzc2FnZURpc3BsYXlOYW1lUGlwZSBpbXBsZW1lbnRzIFBpcGVUcmFuc2Zvcm0ge1xuICAgIHRyYW5zZm9ybShwYXJ0aWNpcGFudDogSUNoYXRQYXJ0aWNpcGFudCwgbWVzc2FnZTogTWVzc2FnZSk6IHN0cmluZyB7XG4gICAgICAgIGlmIChwYXJ0aWNpcGFudCAmJiBwYXJ0aWNpcGFudC5wYXJ0aWNpcGFudFR5cGUgPT0gQ2hhdFBhcnRpY2lwYW50VHlwZS5Hcm91cClcbiAgICAgICAge1xuICAgICAgICAgICAgbGV0IGdyb3VwID0gcGFydGljaXBhbnQgYXMgR3JvdXA7XG4gICAgICAgICAgICBsZXQgdXNlckluZGV4ID0gZ3JvdXAuY2hhdHRpbmdUby5maW5kSW5kZXgoeCA9PiB4LmlkID09IG1lc3NhZ2UuZnJvbUlkKTtcblxuICAgICAgICAgICAgcmV0dXJuIGdyb3VwLmNoYXR0aW5nVG9bdXNlckluZGV4ID49IDAgPyB1c2VySW5kZXggOiAwXS5kaXNwbGF5TmFtZTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlXG4gICAgICAgICAgICByZXR1cm4gXCJcIjtcbiAgICB9IFxufVxuIl19