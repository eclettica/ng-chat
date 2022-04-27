import { __decorate } from "tslib";
import { Component, Input, Output, EventEmitter, ViewEncapsulation } from '@angular/core';
import { ChatParticipantStatus } from "../../core/chat-participant-status.enum";
import { MessageCounter } from "../../core/message-counter";
import { chatParticipantStatusDescriptor } from '../../core/chat-participant-status-descriptor';
let NgChatFriendsListComponent = class NgChatFriendsListComponent {
    constructor() {
        this.participantsInteractedWith = [];
        this.onParticipantClicked = new EventEmitter();
        this.onOptionPromptCanceled = new EventEmitter();
        this.onOptionPromptConfirmed = new EventEmitter();
        this.selectedUsersFromFriendsList = [];
        this.searchInput = '';
        // Exposes enums and functions for the ng-template
        this.ChatParticipantStatus = ChatParticipantStatus;
        this.chatParticipantStatusDescriptor = chatParticipantStatusDescriptor;
        this.cleanUpUserSelection = () => this.selectedUsersFromFriendsList = [];
    }
    ngOnChanges(changes) {
        if (this.currentActiveOption) {
            const currentOptionTriggeredBy = this.currentActiveOption && this.currentActiveOption.chattingTo.participant.id;
            const isActivatedUserInSelectedList = (this.selectedUsersFromFriendsList.filter(item => item.id == currentOptionTriggeredBy)).length > 0;
            if (!isActivatedUserInSelectedList) {
                this.selectedUsersFromFriendsList = this.selectedUsersFromFriendsList.concat(this.currentActiveOption.chattingTo.participant);
            }
        }
    }
    get filteredParticipants() {
        if (this.searchInput.length > 0) {
            // Searches in the friend list by the inputted search string
            return this.participants.filter(x => x.displayName.toUpperCase().includes(this.searchInput.toUpperCase()));
        }
        return this.participants;
    }
    isUserSelectedFromFriendsList(user) {
        return (this.selectedUsersFromFriendsList.filter(item => item.id == user.id)).length > 0;
    }
    unreadMessagesTotalByParticipant(participant) {
        let openedWindow = this.windows.find(x => x.participant.id == participant.id);
        if (openedWindow) {
            return MessageCounter.unreadMessagesTotal(openedWindow, this.userId);
        }
        else {
            let totalUnreadMessages = this.participantsResponse
                .filter(x => x.participant.id == participant.id && !this.participantsInteractedWith.find(u => u.id == participant.id) && x.metadata && x.metadata.totalUnreadMessages > 0)
                .map((participantResponse) => {
                return participantResponse.metadata.totalUnreadMessages;
            })[0];
            return MessageCounter.formatUnreadMessagesTotal(totalUnreadMessages);
        }
    }
    // Toggle friends list visibility
    onChatTitleClicked() {
        this.isCollapsed = !this.isCollapsed;
    }
    onFriendsListCheckboxChange(selectedUser, isChecked) {
        if (isChecked) {
            this.selectedUsersFromFriendsList.push(selectedUser);
        }
        else {
            this.selectedUsersFromFriendsList.splice(this.selectedUsersFromFriendsList.indexOf(selectedUser), 1);
        }
    }
    onUserClick(clickedUser) {
        this.onParticipantClicked.emit(clickedUser);
    }
    onFriendsListActionCancelClicked() {
        this.onOptionPromptCanceled.emit();
        this.cleanUpUserSelection();
    }
    onFriendsListActionConfirmClicked() {
        this.onOptionPromptConfirmed.emit(this.selectedUsersFromFriendsList);
        this.cleanUpUserSelection();
    }
};
__decorate([
    Input()
], NgChatFriendsListComponent.prototype, "participants", void 0);
__decorate([
    Input()
], NgChatFriendsListComponent.prototype, "participantsResponse", void 0);
__decorate([
    Input()
], NgChatFriendsListComponent.prototype, "participantsInteractedWith", void 0);
__decorate([
    Input()
], NgChatFriendsListComponent.prototype, "windows", void 0);
__decorate([
    Input()
], NgChatFriendsListComponent.prototype, "userId", void 0);
__decorate([
    Input()
], NgChatFriendsListComponent.prototype, "localization", void 0);
__decorate([
    Input()
], NgChatFriendsListComponent.prototype, "shouldDisplay", void 0);
__decorate([
    Input()
], NgChatFriendsListComponent.prototype, "isCollapsed", void 0);
__decorate([
    Input()
], NgChatFriendsListComponent.prototype, "searchEnabled", void 0);
__decorate([
    Input()
], NgChatFriendsListComponent.prototype, "currentActiveOption", void 0);
__decorate([
    Output()
], NgChatFriendsListComponent.prototype, "onParticipantClicked", void 0);
__decorate([
    Output()
], NgChatFriendsListComponent.prototype, "onOptionPromptCanceled", void 0);
__decorate([
    Output()
], NgChatFriendsListComponent.prototype, "onOptionPromptConfirmed", void 0);
NgChatFriendsListComponent = __decorate([
    Component({
        selector: 'ng-chat-friends-list',
        template: "<div *ngIf=\"shouldDisplay\" id=\"ng-chat-people\" [ngClass]=\"{'primary-outline-color': true, 'primary-background': true, 'ng-chat-people-collapsed': isCollapsed}\">\n\t<a href=\"javascript:void(0);\" class=\"ng-chat-title secondary-background shadowed\" (click)=\"onChatTitleClicked()\">\n\t\t<span>\n\t\t\t{{localization.title}}\n\t\t</span>\n\t</a>\n\t<div *ngIf=\"currentActiveOption\" class=\"ng-chat-people-actions\" (click)=\"onFriendsListActionCancelClicked()\">\n\t\t<a href=\"javascript:void(0);\" class=\"ng-chat-people-action\">\n\t\t\t<i class=\"remove-icon\"></i>\n\t\t</a>\n\t\t<a href=\"javascript:void(0);\" class=\"ng-chat-people-action\" (click)=\"onFriendsListActionConfirmClicked()\">\n\t\t\t<i class=\"check-icon\"></i>\n\t\t</a>\n\t</div>\n\t<input *ngIf=\"searchEnabled\" id=\"ng-chat-search_friend\" class=\"friends-search-bar\" type=\"search\" [placeholder]=\"localization.searchPlaceholder\" [(ngModel)]=\"searchInput\" />\n\t<ul id=\"ng-chat-users\" *ngIf=\"!isCollapsed\" [ngClass]=\"{'offset-search': searchEnabled}\">\n\t\t<li *ngFor=\"let user of filteredParticipants\">\n\t\t\t<input \n\t\t\t\t*ngIf=\"currentActiveOption && currentActiveOption.validateContext(user)\" \n\t\t\t\ttype=\"checkbox\" \n\t\t\t\tclass=\"ng-chat-users-checkbox\" \n\t\t\t\t(change)=\"onFriendsListCheckboxChange(user, $event.target.checked)\" \n\t\t\t\t[checked]=\"isUserSelectedFromFriendsList(user)\"/>\n\t\t\t<div [ngClass]=\"{'ng-chat-friends-list-selectable-offset': currentActiveOption, 'ng-chat-friends-list-container': true}\" (click)=\"onUserClick(user)\">\n\t\t\t\t<div *ngIf=\"!user.avatar && !user.avatarSrc\" class=\"icon-wrapper\">\n\t\t\t\t\t<i class=\"user-icon\"></i>\n\t\t\t\t</div>\n\t\t\t\t<img *ngIf=\"user.avatar\" alt=\"\" class=\"avatar\" height=\"30\" width=\"30\"  [src]=\"user.avatar | sanitize\"/>\n\t\t\t\t<img *ngIf=\"user.avatarSrc\" alt=\"\" class=\"avatar\" height=\"30\" width=\"30\"  [src]=\"user.avatarSrc | secure:true | async\"/>\n\t\t\t\t<strong title=\"{{user.displayName}}\">{{user.displayName}}</strong>\n\t\t\t\t<span [ngClass]=\"{'ng-chat-participant-status': true, 'online': user.status == ChatParticipantStatus.Online, 'busy': user.status == ChatParticipantStatus.Busy, 'away': user.status == ChatParticipantStatus.Away, 'offline': user.status == ChatParticipantStatus.Offline}\" title=\"{{chatParticipantStatusDescriptor(user.status, localization)}}\"></span>\n\t\t\t\t<span *ngIf=\"unreadMessagesTotalByParticipant(user).length > 0\" class=\"ng-chat-unread-messages-count unread-messages-counter-container primary-text\">{{unreadMessagesTotalByParticipant(user)}}</span>\n\t\t\t</div>\n\t\t</li>\n\t</ul>\n</div>",
        encapsulation: ViewEncapsulation.None,
        styles: ["#ng-chat-people{position:relative;width:240px;height:360px;border-width:1px;border-style:solid;margin-right:20px;box-shadow:0 4px 8px rgba(0,0,0,.25);border-bottom:0}#ng-chat-people.ng-chat-people-collapsed{height:30px}#ng-chat-search_friend{display:block;padding:7px 10px;margin:10px auto 0;width:calc(100% - 20px);font-size:.9em;-webkit-appearance:searchfield}#ng-chat-users{padding:0 10px;list-style:none;margin:0;overflow:auto;position:absolute;top:42px;bottom:0;width:100%;box-sizing:border-box}#ng-chat-users.offset-search{top:84px}#ng-chat-users .ng-chat-users-checkbox{float:left;margin-right:5px;margin-top:8px}#ng-chat-users li{clear:both;margin-bottom:10px;overflow:hidden;cursor:pointer;max-height:30px}#ng-chat-users li>.ng-chat-friends-list-selectable-offset{margin-left:22px}#ng-chat-users li .ng-chat-friends-list-container{display:inline-block;width:100%}#ng-chat-users li>.ng-chat-friends-list-selectable-offset.ng-chat-friends-list-container{display:block;width:auto}#ng-chat-users li .ng-chat-friends-list-container>.icon-wrapper,#ng-chat-users li .ng-chat-friends-list-container>img.avatar{float:left;margin-right:5px;border-radius:25px}#ng-chat-users li .ng-chat-friends-list-container>.icon-wrapper{background-color:#bababa;overflow:hidden;width:30px;height:30px}#ng-chat-users li .ng-chat-friends-list-container>.icon-wrapper>i{color:#fff;transform:scale(.7)}#ng-chat-users li .ng-chat-friends-list-container>strong{float:left;line-height:30px;font-size:.8em;max-width:57%;max-height:30px;overflow:hidden;white-space:nowrap;text-overflow:ellipsis}#ng-chat-users li .ng-chat-friends-list-container>.ng-chat-participant-status{float:right}.ng-chat-people-actions{position:absolute;top:4px;right:5px;margin:0;padding:0;z-index:2}.ng-chat-people-actions>a.ng-chat-people-action{display:inline-block;width:21px;height:21px;margin-right:8px;text-decoration:none;border:none;border-radius:25px;padding:1px}@media only screen and (max-width:581px){#ng-chat-people{width:300px;height:360px;margin-right:0}}"]
    })
], NgChatFriendsListComponent);
export { NgChatFriendsListComponent };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmctY2hhdC1mcmllbmRzLWxpc3QuY29tcG9uZW50LmpzIiwic291cmNlUm9vdCI6Im5nOi8vbmctY2hhdC8iLCJzb3VyY2VzIjpbIm5nLWNoYXQvY29tcG9uZW50cy9uZy1jaGF0LWZyaWVuZHMtbGlzdC9uZy1jaGF0LWZyaWVuZHMtbGlzdC5jb21wb25lbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBLE9BQU8sRUFBRSxTQUFTLEVBQUUsS0FBSyxFQUFFLE1BQU0sRUFBRSxZQUFZLEVBQUUsaUJBQWlCLEVBQTRCLE1BQU0sZUFBZSxDQUFDO0FBSXBILE9BQU8sRUFBRSxxQkFBcUIsRUFBRSxNQUFNLHlDQUF5QyxDQUFDO0FBS2hGLE9BQU8sRUFBRSxjQUFjLEVBQUUsTUFBTSw0QkFBNEIsQ0FBQztBQUM1RCxPQUFPLEVBQUUsK0JBQStCLEVBQUUsTUFBTSwrQ0FBK0MsQ0FBQztBQVFoRyxJQUFhLDBCQUEwQixHQUF2QyxNQUFhLDBCQUEwQjtJQUNuQztRQVNPLCtCQUEwQixHQUF1QixFQUFFLENBQUM7UUF3QnBELHlCQUFvQixHQUFtQyxJQUFJLFlBQVksRUFBRSxDQUFDO1FBRzFFLDJCQUFzQixHQUFzQixJQUFJLFlBQVksRUFBRSxDQUFDO1FBRy9ELDRCQUF1QixHQUFzQixJQUFJLFlBQVksRUFBRSxDQUFDO1FBRWhFLGlDQUE0QixHQUFXLEVBQUUsQ0FBQztRQUUxQyxnQkFBVyxHQUFXLEVBQUUsQ0FBQztRQUVoQyxrREFBa0Q7UUFDM0MsMEJBQXFCLEdBQUcscUJBQXFCLENBQUM7UUFDOUMsb0NBQStCLEdBQUcsK0JBQStCLENBQUM7UUErQ3pFLHlCQUFvQixHQUFHLEdBQUcsRUFBRSxDQUFDLElBQUksQ0FBQyw0QkFBNEIsR0FBRyxFQUFFLENBQUM7SUE5RnBELENBQUM7SUFpRGpCLFdBQVcsQ0FBQyxPQUFzQjtRQUM5QixJQUFJLElBQUksQ0FBQyxtQkFBbUIsRUFBRTtZQUMxQixNQUFNLHdCQUF3QixHQUFHLElBQUksQ0FBQyxtQkFB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IHsgQ29tcG9uZW50LCBJbnB1dCwgT3V0cHV0LCBFdmVudEVtaXR0ZXIsIFZpZXdFbmNhcHN1bGF0aW9uLCBPbkNoYW5nZXMsIFNpbXBsZUNoYW5nZXMgfSBmcm9tICdAYW5ndWxhci9jb3JlJztcblxuaW1wb3J0IHsgTG9jYWxpemF0aW9uIH0gZnJvbSAnLi4vLi4vY29yZS9sb2NhbGl6YXRpb24nO1xuaW1wb3J0IHsgSUNoYXRPcHRpb24gfSBmcm9tICcuLi8uLi9jb3JlL2NoYXQtb3B0aW9uJztcbmltcG9ydCB7IENoYXRQYXJ0aWNpcGFudFN0YXR1cyB9IGZyb20gXCIuLi8uLi9jb3JlL2NoYXQtcGFydGljaXBhbnQtc3RhdHVzLmVudW1cIjtcbmltcG9ydCB7IElDaGF0UGFydGljaXBhbnQgfSBmcm9tIFwiLi4vLi4vY29yZS9jaGF0LXBhcnRpY2lwYW50XCI7XG5pbXBvcnQgeyBVc2VyIH0gZnJvbSBcIi4uLy4uL2NvcmUvdXNlclwiO1xuaW1wb3J0IHsgV2luZG93IH0gZnJvbSBcIi4uLy4uL2NvcmUvd2luZG93XCI7XG5pbXBvcnQgeyBQYXJ0aWNpcGFudFJlc3BvbnNlIH0gZnJvbSBcIi4uLy4uL2NvcmUvcGFydGljaXBhbnQtcmVzcG9uc2VcIjtcbmltcG9ydCB7IE1lc3NhZ2VDb3VudGVyIH0gZnJvbSBcIi4uLy4uL2NvcmUvbWVzc2FnZS1jb3VudGVyXCI7XG5pbXBvcnQgeyBjaGF0UGFydGljaXBhbnRTdGF0dXNEZXNjcmlwdG9yIH0gZnJvbSAnLi4vLi4vY29yZS9jaGF0LXBhcnRpY2lwYW50LXN0YXR1cy1kZXNjcmlwdG9yJztcblxuQENvbXBvbmVudCh7XG4gICAgc2VsZWN0b3I6ICduZy1jaGF0LWZyaWVuZHMtbGlzdCcsXG4gICAgdGVtcGxhdGVVcmw6ICcuL25nLWNoYXQtZnJpZW5kcy1saXN0LmNvbXBvbmVudC5odG1sJyxcbiAgICBzdHlsZVVybHM6IFsnLi9uZy1jaGF0LWZyaWVuZHMtbGlzdC5jb21wb25lbnQuY3NzJ10sXG4gICAgZW5jYXBzdWxhdGlvbjogVmlld0VuY2Fwc3VsYXRpb24uTm9uZVxufSlcbmV4cG9ydCBjbGFzcyBOZ0NoYXRGcmllbmRzTGlzdENvbXBvbmVudCBpbXBsZW1lbnRzIE9uQ2hhbmdlcyB7XG4gICAgY29uc3RydWN0b3IoKSB7IH1cblxuICAgIEBJbnB1dCgpXG4gICAgcHVibGljIHBhcnRpY2lwYW50czogSUNoYXRQYXJ0aWNpcGFudFtdO1xuXG4gICAgQElucHV0KClcbiAgICBwdWJsaWMgcGFydGljaXBhbnRzUmVzcG9uc2U6IFBhcnRpY2lwYW50UmVzcG9uc2VbXTtcblxuICAgIEBJbnB1dCgpXG4gICAgcHVibGljIHBhcnRpY2lwYW50c0ludGVyYWN0ZWRXaXRoOiBJQ2hhdFBhcnRpY2lwYW50W10gPSBbXTtcblxuICAgIEBJbnB1dCgpXG4gICAgcHVibGljIHdpbmRvd3M6IFdpbmRvd1tdO1xuXG4gICAgQElucHV0KClcbiAgICBwdWJsaWMgdXNlcklkOiBhbnk7XG5cbiAgICBASW5wdXQoKVxuICAgIHB1YmxpYyBsb2NhbGl6YXRpb246IExvY2FsaXphdGlvbjtcblxuICAgIEBJbnB1dCgpXG4gICAgcHVibGljIHNob3VsZERpc3BsYXk6IGJvb2xlYW47XG5cbiAgICBASW5wdXQoKVxuICAgIHB1YmxpYyBpc0NvbGxhcHNlZDogYm9vbGVhbjtcblxuICAgIEBJbnB1dCgpXG4gICAgcHVibGljIHNlYXJjaEVuYWJsZWQ6IGJvb2xlYW47XG5cbiAgICBASW5wdXQoKVxuICAgIHB1YmxpYyBjdXJyZW50QWN0aXZlT3B0aW9uOiBJQ2hhdE9wdGlvbiB8IG51bGw7XG5cbiAgICBAT3V0cHV0KClcbiAgICBwdWJsaWMgb25QYXJ0aWNpcGFudENsaWNrZWQ6IEV2ZW50RW1pdHRlcjxJQ2hhdFBhcnRpY2lwYW50PiA9IG5ldyBFdmVudEVtaXR0ZXIoKTtcblxuICAgIEBPdXRwdXQoKVxuICAgIHB1YmxpYyBvbk9wdGlvblByb21wdENhbmNlbGVkOiBFdmVudEVtaXR0ZXI8YW55PiA9IG5ldyBFdmVudEVtaXR0ZXIoKTtcblxuICAgIEBPdXRwdXQoKVxuICAgIHB1YmxpYyBvbk9wdGlvblByb21wdENvbmZpcm1lZDogRXZlbnRFbWl0dGVyPGFueT4gPSBuZXcgRXZlbnRFbWl0dGVyKCk7XG5cbiAgICBwdWJsaWMgc2VsZWN0ZWRVc2Vyc0Zyb21GcmllbmRzTGlzdDogVXNlcltdID0gW107XG5cbiAgICBwdWJsaWMgc2VhcmNoSW5wdXQ6IHN0cmluZyA9ICcnO1xuXG4gICAgLy8gRXhwb3NlcyBlbnVtcyBhbmQgZnVuY3Rpb25zIGZvciB0aGUgbmctdGVtcGxhdGVcbiAgICBwdWJsaWMgQ2hhdFBhcnRpY2lwYW50U3RhdHVzID0gQ2hhdFBhcnRpY2lwYW50U3RhdHVzO1xuICAgIHB1YmxpYyBjaGF0UGFydGljaXBhbnRTdGF0dXNEZXNjcmlwdG9yID0gY2hhdFBhcnRpY2lwYW50U3RhdHVzRGVzY3JpcHRvcjtcblxuICAgIG5nT25DaGFuZ2VzKGNoYW5nZXM6IFNpbXBsZUNoYW5nZXMpIHtcbiAgICAgICAgaWYgKHRoaXMuY3VycmVudEFjdGl2ZU9wdGlvbikge1xuICAgICAgICAgICAgY29uc3QgY3VycmVudE9wdGlvblRyaWdnZXJlZEJ5ID0gdGhpcy5jdXJyZW50QWN0aXZlT3B0aW9uICYmIHRoaXMuY3VycmVudEFjdGl2ZU9wdGlvbi5jaGF0dGluZ1RvLnBhcnRpY2lwYW50LmlkO1xuICAgICAgICAgICAgY29uc3QgaXNBY3RpdmF0ZWRVc2VySW5TZWxlY3RlZExpc3QgPSAodGhpcy5zZWxlY3RlZFVzZXJzRnJvbUZyaWVuZHNMaXN0LmZpbHRlcihpdGVtID0+IGl0ZW0uaWQgPT0gY3VycmVudE9wdGlvblRyaWdnZXJlZEJ5KSkubGVuZ3RoID4gMDtcblxuICAgICAgICAgICAgaWYgKCFpc0FjdGl2YXRlZFVzZXJJblNlbGVjdGVkTGlzdCkge1xuICAgICAgICAgICAgICAgIHRoaXMuc2VsZWN0ZWRVc2Vyc0Zyb21GcmllbmRzTGlzdCA9IHRoaXMuc2VsZWN0ZWRVc2Vyc0Zyb21GcmllbmRzTGlzdC5jb25jYXQodGhpcy5jdXJyZW50QWN0aXZlT3B0aW9uLmNoYXR0aW5nVG8ucGFydGljaXBhbnQgYXMgVXNlcik7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBnZXQgZmlsdGVyZWRQYXJ0aWNpcGFudHMoKTogSUNoYXRQYXJ0aWNpcGFudFtdXG4gICAge1xuICAgICAgICBpZiAodGhpcy5zZWFyY2hJbnB1dC5sZW5ndGggPiAwKXtcbiAgICAgICAgICAgIC8vIFNlYXJjaGVzIGluIHRoZSBmcmllbmQgbGlzdCBieSB0aGUgaW5wdXR0ZWQgc2VhcmNoIHN0cmluZ1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMucGFydGljaXBhbnRzLmZpbHRlcih4ID0+IHguZGlzcGxheU5hbWUudG9VcHBlckNhc2UoKS5pbmNsdWRlcyh0aGlzLnNlYXJjaElucHV0LnRvVXBwZXJDYXNlKCkpKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiB0aGlzLnBhcnRpY2lwYW50cztcbiAgICB9XG5cbiAgICBpc1VzZXJTZWxlY3RlZEZyb21GcmllbmRzTGlzdCh1c2VyOiBVc2VyKSA6IGJvb2xlYW5cbiAgICB7XG4gICAgICAgIHJldHVybiAodGhpcy5zZWxlY3RlZFVzZXJzRnJvbUZyaWVuZHNMaXN0LmZpbHRlcihpdGVtID0+IGl0ZW0uaWQgPT0gdXNlci5pZCkpLmxlbmd0aCA+IDBcbiAgICB9XG5cbiAgICB1bnJlYWRNZXNzYWdlc1RvdGFsQnlQYXJ0aWNpcGFudChwYXJ0aWNpcGFudDogSUNoYXRQYXJ0aWNpcGFudCk6IHN0cmluZ1xuICAgIHtcbiAgICAgICAgbGV0IG9wZW5lZFdpbmRvdyA9IHRoaXMud2luZG93cy5maW5kKHggPT4geC5wYXJ0aWNpcGFudC5pZCA9PSBwYXJ0aWNpcGFudC5pZCk7XG5cbiAgICAgICAgaWYgKG9wZW5lZFdpbmRvdyl7XG4gICAgICAgICAgICByZXR1cm4gTWVzc2FnZUNvdW50ZXIudW5yZWFkTWVzc2FnZXNUb3RhbChvcGVuZWRXaW5kb3csIHRoaXMudXNlcklkKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlXG4gICAgICAgIHtcbiAgICAgICAgICAgIGxldCB0b3RhbFVucmVhZE1lc3NhZ2VzID0gdGhpcy5wYXJ0aWNpcGFudHNSZXNwb25zZVxuICAgICAgICAgICAgICAgIC5maWx0ZXIoeCA9PiB4LnBhcnRpY2lwYW50LmlkID09IHBhcnRpY2lwYW50LmlkICYmICF0aGlzLnBhcnRpY2lwYW50c0ludGVyYWN0ZWRXaXRoLmZpbmQodSA9PiB1LmlkID09IHBhcnRpY2lwYW50LmlkKSAmJiB4Lm1ldGFkYXRhICYmIHgubWV0YWRhdGEudG90YWxVbnJlYWRNZXNzYWdlcyA+IDApXG4gICAgICAgICAgICAgICAgLm1hcCgocGFydGljaXBhbnRSZXNwb25zZSkgPT4ge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gcGFydGljaXBhbnRSZXNwb25zZS5tZXRhZGF0YS50b3RhbFVucmVhZE1lc3NhZ2VzXG4gICAgICAgICAgICAgICAgfSlbMF07XG5cbiAgICAgICAgICAgIHJldHVybiBNZXNzYWdlQ291bnRlci5mb3JtYXRVbnJlYWRNZXNzYWdlc1RvdGFsKHRvdGFsVW5yZWFkTWVzc2FnZXMpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgY2xlYW5VcFVzZXJTZWxlY3Rpb24gPSAoKSA9PiB0aGlzLnNlbGVjdGVkVXNlcnNGcm9tRnJpZW5kc0xpc3QgPSBbXTtcblxuICAgIC8vIFRvZ2dsZSBmcmllbmRzIGxpc3QgdmlzaWJpbGl0eVxuICAgIG9uQ2hhdFRpdGxlQ2xpY2tlZCgpOiB2b2lkXG4gICAge1xuICAgICAgICB0aGlzLmlzQ29sbGFwc2VkID0gIXRoaXMuaXNDb2xsYXBzZWQ7XG4gICAgfVxuXG4gICAgb25GcmllbmRzTGlzdENoZWNrYm94Q2hhbmdlKHNlbGVjdGVkVXNlcjogVXNlciwgaXNDaGVja2VkOiBib29sZWFuKTogdm9pZFxuICAgIHtcbiAgICAgICAgaWYoaXNDaGVja2VkKSB7XG4gICAgICAgICAgICB0aGlzLnNlbGVjdGVkVXNlcnNGcm9tRnJpZW5kc0xpc3QucHVzaChzZWxlY3RlZFVzZXIpO1xuICAgICAgICB9IFxuICAgICAgICBlbHNlIFxuICAgICAgICB7XG4gICAgICAgICAgICB0aGlzLnNlbGVjdGVkVXNlcnNGcm9tRnJpZW5kc0xpc3Quc3BsaWNlKHRoaXMuc2VsZWN0ZWRVc2Vyc0Zyb21GcmllbmRzTGlzdC5pbmRleE9mKHNlbGVjdGVkVXNlciksIDEpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgb25Vc2VyQ2xpY2soY2xpY2tlZFVzZXI6IFVzZXIpOiB2b2lkXG4gICAge1xuICAgICAgICB0aGlzLm9uUGFydGljaXBhbnRDbGlja2VkLmVtaXQoY2xpY2tlZFVzZXIpO1xuICAgIH1cblxuICAgIG9uRnJpZW5kc0xpc3RBY3Rpb25DYW5jZWxDbGlja2VkKCk6IHZvaWRcbiAgICB7XG4gICAgICAgIHRoaXMub25PcHRpb25Qcm9tcHRDYW5jZWxlZC5lbWl0KCk7XG4gICAgICAgIHRoaXMuY2xlYW5VcFVzZXJTZWxlY3Rpb24oKTtcbiAgICB9XG5cbiAgICBvbkZyaWVuZHNMaXN0QWN0aW9uQ29uZmlybUNsaWNrZWQoKSA6IHZvaWRcbiAgICB7XG4gICAgICAgIHRoaXMub25PcHRpb25Qcm9tcHRDb25maXJtZWQuZW1pdCh0aGlzLnNlbGVjdGVkVXNlcnNGcm9tRnJpZW5kc0xpc3QpO1xuICAgICAgICB0aGlzLmNsZWFuVXBVc2VyU2VsZWN0aW9uKCk7XG4gICAgfVxufVxuIl19