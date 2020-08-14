import { __decorate } from "tslib";
import { Component, Input, Output, EventEmitter, ViewEncapsulation } from '@angular/core';
import { ChatParticipantStatus } from "../../core/chat-participant-status.enum";
import { MessageCounter } from "../../core/message-counter";
import { chatParticipantStatusDescriptor } from '../../core/chat-participant-status-descriptor';
var NgChatFriendsListComponent = /** @class */ (function () {
    function NgChatFriendsListComponent() {
        var _this = this;
        this.participantsInteractedWith = [];
        this.onParticipantClicked = new EventEmitter();
        this.onOptionPromptCanceled = new EventEmitter();
        this.onOptionPromptConfirmed = new EventEmitter();
        this.selectedUsersFromFriendsList = [];
        this.searchInput = '';
        // Exposes enums and functions for the ng-template
        this.ChatParticipantStatus = ChatParticipantStatus;
        this.chatParticipantStatusDescriptor = chatParticipantStatusDescriptor;
        this.cleanUpUserSelection = function () { return _this.selectedUsersFromFriendsList = []; };
    }
    NgChatFriendsListComponent.prototype.ngOnChanges = function (changes) {
        if (this.currentActiveOption) {
            var currentOptionTriggeredBy_1 = this.currentActiveOption && this.currentActiveOption.chattingTo.participant.id;
            var isActivatedUserInSelectedList = (this.selectedUsersFromFriendsList.filter(function (item) { return item.id == currentOptionTriggeredBy_1; })).length > 0;
            if (!isActivatedUserInSelectedList) {
                this.selectedUsersFromFriendsList = this.selectedUsersFromFriendsList.concat(this.currentActiveOption.chattingTo.participant);
            }
        }
    };
    Object.defineProperty(NgChatFriendsListComponent.prototype, "filteredParticipants", {
        get: function () {
            var _this = this;
            if (this.searchInput.length > 0) {
                // Searches in the friend list by the inputted search string
                return this.participants.filter(function (x) { return x.displayName.toUpperCase().includes(_this.searchInput.toUpperCase()); });
            }
            return this.participants;
        },
        enumerable: true,
        configurable: true
    });
    NgChatFriendsListComponent.prototype.isUserSelectedFromFriendsList = function (user) {
        return (this.selectedUsersFromFriendsList.filter(function (item) { return item.id == user.id; })).length > 0;
    };
    NgChatFriendsListComponent.prototype.unreadMessagesTotalByParticipant = function (participant) {
        var _this = this;
        var openedWindow = this.windows.find(function (x) { return x.participant.id == participant.id; });
        if (openedWindow) {
            return MessageCounter.unreadMessagesTotal(openedWindow, this.userId);
        }
        else {
            var totalUnreadMessages = this.participantsResponse
                .filter(function (x) { return x.participant.id == participant.id && !_this.participantsInteractedWith.find(function (u) { return u.id == participant.id; }) && x.metadata && x.metadata.totalUnreadMessages > 0; })
                .map(function (participantResponse) {
                return participantResponse.metadata.totalUnreadMessages;
            })[0];
            return MessageCounter.formatUnreadMessagesTotal(totalUnreadMessages);
        }
    };
    // Toggle friends list visibility
    NgChatFriendsListComponent.prototype.onChatTitleClicked = function () {
        this.isCollapsed = !this.isCollapsed;
    };
    NgChatFriendsListComponent.prototype.onFriendsListCheckboxChange = function (selectedUser, isChecked) {
        if (isChecked) {
            this.selectedUsersFromFriendsList.push(selectedUser);
        }
        else {
            this.selectedUsersFromFriendsList.splice(this.selectedUsersFromFriendsList.indexOf(selectedUser), 1);
        }
    };
    NgChatFriendsListComponent.prototype.onUserClick = function (clickedUser) {
        this.onParticipantClicked.emit(clickedUser);
    };
    NgChatFriendsListComponent.prototype.onFriendsListActionCancelClicked = function () {
        this.onOptionPromptCanceled.emit();
        this.cleanUpUserSelection();
    };
    NgChatFriendsListComponent.prototype.onFriendsListActionConfirmClicked = function () {
        this.onOptionPromptConfirmed.emit(this.selectedUsersFromFriendsList);
        this.cleanUpUserSelection();
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
            template: "<div *ngIf=\"shouldDisplay\" id=\"ng-chat-people\" [ngClass]=\"{'primary-outline-color': true, 'primary-background': true, 'ng-chat-people-collapsed': isCollapsed}\">\n\t<a href=\"javascript:void(0);\" class=\"ng-chat-title secondary-background shadowed\" (click)=\"onChatTitleClicked()\">\n\t\t<span>\n\t\t\t{{localization.title}}\n\t\t</span>\n\t</a>\n\t<div *ngIf=\"currentActiveOption\" class=\"ng-chat-people-actions\" (click)=\"onFriendsListActionCancelClicked()\">\n\t\t<a href=\"javascript:void(0);\" class=\"ng-chat-people-action\">\n\t\t\t<i class=\"remove-icon\"></i>\n\t\t</a>\n\t\t<a href=\"javascript:void(0);\" class=\"ng-chat-people-action\" (click)=\"onFriendsListActionConfirmClicked()\">\n\t\t\t<i class=\"check-icon\"></i>\n\t\t</a>\n\t</div>\n\t<input *ngIf=\"searchEnabled\" id=\"ng-chat-search_friend\" class=\"friends-search-bar\" type=\"search\" [placeholder]=\"localization.searchPlaceholder\" [(ngModel)]=\"searchInput\" />\n\t<ul id=\"ng-chat-users\" *ngIf=\"!isCollapsed\" [ngClass]=\"{'offset-search': searchEnabled}\">\n\t\t<li *ngFor=\"let user of filteredParticipants\">\n\t\t\t<input \n\t\t\t\t*ngIf=\"currentActiveOption && currentActiveOption.validateContext(user)\" \n\t\t\t\ttype=\"checkbox\" \n\t\t\t\tclass=\"ng-chat-users-checkbox\" \n\t\t\t\t(change)=\"onFriendsListCheckboxChange(user, $event.target.checked)\" \n\t\t\t\t[checked]=\"isUserSelectedFromFriendsList(user)\"/>\n\t\t\t<div [ngClass]=\"{'ng-chat-friends-list-selectable-offset': currentActiveOption, 'ng-chat-friends-list-container': true}\" (click)=\"onUserClick(user)\">\n\t\t\t\t<div *ngIf=\"!user.avatar\" class=\"icon-wrapper\">\n\t\t\t\t\t<i class=\"user-icon\"></i>\n\t\t\t\t</div>\n\t\t\t\t<img *ngIf=\"user.avatar\" alt=\"\" class=\"avatar\" height=\"30\" width=\"30\"  [src]=\"user.avatar | sanitize\"/>\n\t\t\t\t<strong title=\"{{user.displayName}}\">{{user.displayName}}</strong>\n\t\t\t\t<span [ngClass]=\"{'ng-chat-participant-status': true, 'online': user.status == ChatParticipantStatus.Online, 'busy': user.status == ChatParticipantStatus.Busy, 'away': user.status == ChatParticipantStatus.Away, 'offline': user.status == ChatParticipantStatus.Offline}\" title=\"{{chatParticipantStatusDescriptor(user.status, localization)}}\"></span>\n\t\t\t\t<span *ngIf=\"unreadMessagesTotalByParticipant(user).length > 0\" class=\"ng-chat-unread-messages-count unread-messages-counter-container primary-text\">{{unreadMessagesTotalByParticipant(user)}}</span>\n\t\t\t</div>\n\t\t</li>\n\t</ul>\n</div>",
            encapsulation: ViewEncapsulation.None,
            styles: ["#ng-chat-people{position:relative;width:240px;height:360px;border-width:1px;border-style:solid;margin-right:20px;box-shadow:0 4px 8px rgba(0,0,0,.25);border-bottom:0}#ng-chat-people.ng-chat-people-collapsed{height:30px}#ng-chat-search_friend{display:block;padding:7px 10px;margin:10px auto 0;width:calc(100% - 20px);font-size:.9em;-webkit-appearance:searchfield}#ng-chat-users{padding:0 10px;list-style:none;margin:0;overflow:auto;position:absolute;top:42px;bottom:0;width:100%;box-sizing:border-box}#ng-chat-users.offset-search{top:84px}#ng-chat-users .ng-chat-users-checkbox{float:left;margin-right:5px;margin-top:8px}#ng-chat-users li{clear:both;margin-bottom:10px;overflow:hidden;cursor:pointer;max-height:30px}#ng-chat-users li>.ng-chat-friends-list-selectable-offset{margin-left:22px}#ng-chat-users li .ng-chat-friends-list-container{display:inline-block;width:100%}#ng-chat-users li>.ng-chat-friends-list-selectable-offset.ng-chat-friends-list-container{display:block;width:auto}#ng-chat-users li .ng-chat-friends-list-container>.icon-wrapper,#ng-chat-users li .ng-chat-friends-list-container>img.avatar{float:left;margin-right:5px;border-radius:25px}#ng-chat-users li .ng-chat-friends-list-container>.icon-wrapper{background-color:#bababa;overflow:hidden;width:30px;height:30px}#ng-chat-users li .ng-chat-friends-list-container>.icon-wrapper>i{color:#fff;transform:scale(.7)}#ng-chat-users li .ng-chat-friends-list-container>strong{float:left;line-height:30px;font-size:.8em;max-width:57%;max-height:30px;overflow:hidden;white-space:nowrap;text-overflow:ellipsis}#ng-chat-users li .ng-chat-friends-list-container>.ng-chat-participant-status{float:right}.ng-chat-people-actions{position:absolute;top:4px;right:5px;margin:0;padding:0;z-index:2}.ng-chat-people-actions>a.ng-chat-people-action{display:inline-block;width:21px;height:21px;margin-right:8px;text-decoration:none;border:none;border-radius:25px;padding:1px}@media only screen and (max-width:581px){#ng-chat-people{width:300px;height:360px;margin-right:0}}"]
        })
    ], NgChatFriendsListComponent);
    return NgChatFriendsListComponent;
}());
export { NgChatFriendsListComponent };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmctY2hhdC1mcmllbmRzLWxpc3QuY29tcG9uZW50LmpzIiwic291cmNlUm9vdCI6Im5nOi8vbmctY2hhdC8iLCJzb3VyY2VzIjpbIm5nLWNoYXQvY29tcG9uZW50cy9uZy1jaGF0LWZyaWVuZHMtbGlzdC9uZy1jaGF0LWZyaWVuZHMtbGlzdC5jb21wb25lbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBLE9BQU8sRUFBRSxTQUFTLEVBQUUsS0FBSyxFQUFFLE1BQU0sRUFBRSxZQUFZLEVBQUUsaUJBQWlCLEVBQTRCLE1BQU0sZUFBZSxDQUFDO0FBSXBILE9BQU8sRUFBRSxxQkFBcUIsRUFBRSxNQUFNLHlDQUF5QyxDQUFDO0FBS2hGLE9BQU8sRUFBRSxjQUFjLEVBQUUsTUFBTSw0QkFBNEIsQ0FBQztBQUM1RCxPQUFPLEVBQUUsK0JBQStCLEVBQUUsTUFBTSwrQ0FBK0MsQ0FBQztBQVFoRztJQUNJO1FBQUEsaUJBQWlCO1FBU1YsK0JBQTBCLEdBQXVCLEVBQUUsQ0FBQztRQXdCcEQseUJBQW9CLEdBQW1DLElBQUksWUFBWSxFQUFFLENBQUM7UUFHMUUsMkJBQXNCLEdBQXNCLElBQUksWUFBWSxFQUFFLENBQUM7UUFHL0QsNEJBQXVCLEdBQXNCLElBQUksWUFBWSxFQUFFLENBQUM7UUFFaEUsaUNBQTRCLEdBQVcsRUFBRSxDQUFDO1FBRTFDLGdCQUFXLEdBQVcsRUFBRSxDQUFDO1FBRWhDLGtEQUFrRDtRQUMzQywwQkFBcUIsR0FBRyxxQkFBcUIsQ0FBQztRQUM5QyxvQ0FBK0IsR0FBRywrQkFBK0IsQ0FBQztRQStDekUseUJBQW9CLEdBQUcsY0FBTSxPQUFBLEtBQUksQ0FBQyw0QkFBNEIsR0FBRyxFQUFFLEVBQXRDLENBQXNDLENBQUM7SUE5RnBELENBQUM7SUFpRGpCLGdEQUFXLEdBQVgsVUFBWSxPQUFzQjtRQUM5QixJQUFJLElBQUksQ0FBQyxtQkFBbUIsRUFBRTtZQUMxQixJQUFNLDBCQUF3QixHQUFHLElBQUksQ0FBQyxtQkFBbUIsSUFB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QUUsc0JBQXNCO1lBQ2hDLDA5RUFBb0Q7WUFFcEQsYUFBYSxFQUFFLGlCQUFpQixDQUFDLElBQUk7O1NBQ3hDLENBQUM7T0FDVywwQkFBMEIsQ0FrSXRDO0lBQUQsaUNBQUM7Q0FBQSxBQWxJRCxJQWtJQztTQWxJWSwwQkFBMEIiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBDb21wb25lbnQsIElucHV0LCBPdXRwdXQsIEV2ZW50RW1pdHRlciwgVmlld0VuY2Fwc3VsYXRpb24sIE9uQ2hhbmdlcywgU2ltcGxlQ2hhbmdlcyB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuXG5pbXBvcnQgeyBMb2NhbGl6YXRpb24gfSBmcm9tICcuLi8uLi9jb3JlL2xvY2FsaXphdGlvbic7XG5pbXBvcnQgeyBJQ2hhdE9wdGlvbiB9IGZyb20gJy4uLy4uL2NvcmUvY2hhdC1vcHRpb24nO1xuaW1wb3J0IHsgQ2hhdFBhcnRpY2lwYW50U3RhdHVzIH0gZnJvbSBcIi4uLy4uL2NvcmUvY2hhdC1wYXJ0aWNpcGFudC1zdGF0dXMuZW51bVwiO1xuaW1wb3J0IHsgSUNoYXRQYXJ0aWNpcGFudCB9IGZyb20gXCIuLi8uLi9jb3JlL2NoYXQtcGFydGljaXBhbnRcIjtcbmltcG9ydCB7IFVzZXIgfSBmcm9tIFwiLi4vLi4vY29yZS91c2VyXCI7XG5pbXBvcnQgeyBXaW5kb3cgfSBmcm9tIFwiLi4vLi4vY29yZS93aW5kb3dcIjtcbmltcG9ydCB7IFBhcnRpY2lwYW50UmVzcG9uc2UgfSBmcm9tIFwiLi4vLi4vY29yZS9wYXJ0aWNpcGFudC1yZXNwb25zZVwiO1xuaW1wb3J0IHsgTWVzc2FnZUNvdW50ZXIgfSBmcm9tIFwiLi4vLi4vY29yZS9tZXNzYWdlLWNvdW50ZXJcIjtcbmltcG9ydCB7IGNoYXRQYXJ0aWNpcGFudFN0YXR1c0Rlc2NyaXB0b3IgfSBmcm9tICcuLi8uLi9jb3JlL2NoYXQtcGFydGljaXBhbnQtc3RhdHVzLWRlc2NyaXB0b3InO1xuXG5AQ29tcG9uZW50KHtcbiAgICBzZWxlY3RvcjogJ25nLWNoYXQtZnJpZW5kcy1saXN0JyxcbiAgICB0ZW1wbGF0ZVVybDogJy4vbmctY2hhdC1mcmllbmRzLWxpc3QuY29tcG9uZW50Lmh0bWwnLFxuICAgIHN0eWxlVXJsczogWycuL25nLWNoYXQtZnJpZW5kcy1saXN0LmNvbXBvbmVudC5jc3MnXSxcbiAgICBlbmNhcHN1bGF0aW9uOiBWaWV3RW5jYXBzdWxhdGlvbi5Ob25lXG59KVxuZXhwb3J0IGNsYXNzIE5nQ2hhdEZyaWVuZHNMaXN0Q29tcG9uZW50IGltcGxlbWVudHMgT25DaGFuZ2VzIHtcbiAgICBjb25zdHJ1Y3RvcigpIHsgfVxuXG4gICAgQElucHV0KClcbiAgICBwdWJsaWMgcGFydGljaXBhbnRzOiBJQ2hhdFBhcnRpY2lwYW50W107XG5cbiAgICBASW5wdXQoKVxuICAgIHB1YmxpYyBwYXJ0aWNpcGFudHNSZXNwb25zZTogUGFydGljaXBhbnRSZXNwb25zZVtdO1xuXG4gICAgQElucHV0KClcbiAgICBwdWJsaWMgcGFydGljaXBhbnRzSW50ZXJhY3RlZFdpdGg6IElDaGF0UGFydGljaXBhbnRbXSA9IFtdO1xuXG4gICAgQElucHV0KClcbiAgICBwdWJsaWMgd2luZG93czogV2luZG93W107XG5cbiAgICBASW5wdXQoKVxuICAgIHB1YmxpYyB1c2VySWQ6IGFueTtcblxuICAgIEBJbnB1dCgpXG4gICAgcHVibGljIGxvY2FsaXphdGlvbjogTG9jYWxpemF0aW9uO1xuXG4gICAgQElucHV0KClcbiAgICBwdWJsaWMgc2hvdWxkRGlzcGxheTogYm9vbGVhbjtcblxuICAgIEBJbnB1dCgpXG4gICAgcHVibGljIGlzQ29sbGFwc2VkOiBib29sZWFuO1xuXG4gICAgQElucHV0KClcbiAgICBwdWJsaWMgc2VhcmNoRW5hYmxlZDogYm9vbGVhbjtcblxuICAgIEBJbnB1dCgpXG4gICAgcHVibGljIGN1cnJlbnRBY3RpdmVPcHRpb246IElDaGF0T3B0aW9uIHwgbnVsbDtcblxuICAgIEBPdXRwdXQoKVxuICAgIHB1YmxpYyBvblBhcnRpY2lwYW50Q2xpY2tlZDogRXZlbnRFbWl0dGVyPElDaGF0UGFydGljaXBhbnQ+ID0gbmV3IEV2ZW50RW1pdHRlcigpO1xuXG4gICAgQE91dHB1dCgpXG4gICAgcHVibGljIG9uT3B0aW9uUHJvbXB0Q2FuY2VsZWQ6IEV2ZW50RW1pdHRlcjxhbnk+ID0gbmV3IEV2ZW50RW1pdHRlcigpO1xuXG4gICAgQE91dHB1dCgpXG4gICAgcHVibGljIG9uT3B0aW9uUHJvbXB0Q29uZmlybWVkOiBFdmVudEVtaXR0ZXI8YW55PiA9IG5ldyBFdmVudEVtaXR0ZXIoKTtcblxuICAgIHB1YmxpYyBzZWxlY3RlZFVzZXJzRnJvbUZyaWVuZHNMaXN0OiBVc2VyW10gPSBbXTtcblxuICAgIHB1YmxpYyBzZWFyY2hJbnB1dDogc3RyaW5nID0gJyc7XG5cbiAgICAvLyBFeHBvc2VzIGVudW1zIGFuZCBmdW5jdGlvbnMgZm9yIHRoZSBuZy10ZW1wbGF0ZVxuICAgIHB1YmxpYyBDaGF0UGFydGljaXBhbnRTdGF0dXMgPSBDaGF0UGFydGljaXBhbnRTdGF0dXM7XG4gICAgcHVibGljIGNoYXRQYXJ0aWNpcGFudFN0YXR1c0Rlc2NyaXB0b3IgPSBjaGF0UGFydGljaXBhbnRTdGF0dXNEZXNjcmlwdG9yO1xuXG4gICAgbmdPbkNoYW5nZXMoY2hhbmdlczogU2ltcGxlQ2hhbmdlcykge1xuICAgICAgICBpZiAodGhpcy5jdXJyZW50QWN0aXZlT3B0aW9uKSB7XG4gICAgICAgICAgICBjb25zdCBjdXJyZW50T3B0aW9uVHJpZ2dlcmVkQnkgPSB0aGlzLmN1cnJlbnRBY3RpdmVPcHRpb24gJiYgdGhpcy5jdXJyZW50QWN0aXZlT3B0aW9uLmNoYXR0aW5nVG8ucGFydGljaXBhbnQuaWQ7XG4gICAgICAgICAgICBjb25zdCBpc0FjdGl2YXRlZFVzZXJJblNlbGVjdGVkTGlzdCA9ICh0aGlzLnNlbGVjdGVkVXNlcnNGcm9tRnJpZW5kc0xpc3QuZmlsdGVyKGl0ZW0gPT4gaXRlbS5pZCA9PSBjdXJyZW50T3B0aW9uVHJpZ2dlcmVkQnkpKS5sZW5ndGggPiAwO1xuXG4gICAgICAgICAgICBpZiAoIWlzQWN0aXZhdGVkVXNlckluU2VsZWN0ZWRMaXN0KSB7XG4gICAgICAgICAgICAgICAgdGhpcy5zZWxlY3RlZFVzZXJzRnJvbUZyaWVuZHNMaXN0ID0gdGhpcy5zZWxlY3RlZFVzZXJzRnJvbUZyaWVuZHNMaXN0LmNvbmNhdCh0aGlzLmN1cnJlbnRBY3RpdmVPcHRpb24uY2hhdHRpbmdUby5wYXJ0aWNpcGFudCBhcyBVc2VyKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIGdldCBmaWx0ZXJlZFBhcnRpY2lwYW50cygpOiBJQ2hhdFBhcnRpY2lwYW50W11cbiAgICB7XG4gICAgICAgIGlmICh0aGlzLnNlYXJjaElucHV0Lmxlbmd0aCA+IDApe1xuICAgICAgICAgICAgLy8gU2VhcmNoZXMgaW4gdGhlIGZyaWVuZCBsaXN0IGJ5IHRoZSBpbnB1dHRlZCBzZWFyY2ggc3RyaW5nXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5wYXJ0aWNpcGFudHMuZmlsdGVyKHggPT4geC5kaXNwbGF5TmFtZS50b1VwcGVyQ2FzZSgpLmluY2x1ZGVzKHRoaXMuc2VhcmNoSW5wdXQudG9VcHBlckNhc2UoKSkpO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHRoaXMucGFydGljaXBhbnRzO1xuICAgIH1cblxuICAgIGlzVXNlclNlbGVjdGVkRnJvbUZyaWVuZHNMaXN0KHVzZXI6IFVzZXIpIDogYm9vbGVhblxuICAgIHtcbiAgICAgICAgcmV0dXJuICh0aGlzLnNlbGVjdGVkVXNlcnNGcm9tRnJpZW5kc0xpc3QuZmlsdGVyKGl0ZW0gPT4gaXRlbS5pZCA9PSB1c2VyLmlkKSkubGVuZ3RoID4gMFxuICAgIH1cblxuICAgIHVucmVhZE1lc3NhZ2VzVG90YWxCeVBhcnRpY2lwYW50KHBhcnRpY2lwYW50OiBJQ2hhdFBhcnRpY2lwYW50KTogc3RyaW5nXG4gICAge1xuICAgICAgICBsZXQgb3BlbmVkV2luZG93ID0gdGhpcy53aW5kb3dzLmZpbmQoeCA9PiB4LnBhcnRpY2lwYW50LmlkID09IHBhcnRpY2lwYW50LmlkKTtcblxuICAgICAgICBpZiAob3BlbmVkV2luZG93KXtcbiAgICAgICAgICAgIHJldHVybiBNZXNzYWdlQ291bnRlci51bnJlYWRNZXNzYWdlc1RvdGFsKG9wZW5lZFdpbmRvdywgdGhpcy51c2VySWQpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2VcbiAgICAgICAge1xuICAgICAgICAgICAgbGV0IHRvdGFsVW5yZWFkTWVzc2FnZXMgPSB0aGlzLnBhcnRpY2lwYW50c1Jlc3BvbnNlXG4gICAgICAgICAgICAgICAgLmZpbHRlcih4ID0+IHgucGFydGljaXBhbnQuaWQgPT0gcGFydGljaXBhbnQuaWQgJiYgIXRoaXMucGFydGljaXBhbnRzSW50ZXJhY3RlZFdpdGguZmluZCh1ID0+IHUuaWQgPT0gcGFydGljaXBhbnQuaWQpICYmIHgubWV0YWRhdGEgJiYgeC5tZXRhZGF0YS50b3RhbFVucmVhZE1lc3NhZ2VzID4gMClcbiAgICAgICAgICAgICAgICAubWFwKChwYXJ0aWNpcGFudFJlc3BvbnNlKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBwYXJ0aWNpcGFudFJlc3BvbnNlLm1ldGFkYXRhLnRvdGFsVW5yZWFkTWVzc2FnZXNcbiAgICAgICAgICAgICAgICB9KVswXTtcblxuICAgICAgICAgICAgcmV0dXJuIE1lc3NhZ2VDb3VudGVyLmZvcm1hdFVucmVhZE1lc3NhZ2VzVG90YWwodG90YWxVbnJlYWRNZXNzYWdlcyk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBjbGVhblVwVXNlclNlbGVjdGlvbiA9ICgpID0+IHRoaXMuc2VsZWN0ZWRVc2Vyc0Zyb21GcmllbmRzTGlzdCA9IFtdO1xuXG4gICAgLy8gVG9nZ2xlIGZyaWVuZHMgbGlzdCB2aXNpYmlsaXR5XG4gICAgb25DaGF0VGl0bGVDbGlja2VkKCk6IHZvaWRcbiAgICB7XG4gICAgICAgIHRoaXMuaXNDb2xsYXBzZWQgPSAhdGhpcy5pc0NvbGxhcHNlZDtcbiAgICB9XG5cbiAgICBvbkZyaWVuZHNMaXN0Q2hlY2tib3hDaGFuZ2Uoc2VsZWN0ZWRVc2VyOiBVc2VyLCBpc0NoZWNrZWQ6IGJvb2xlYW4pOiB2b2lkXG4gICAge1xuICAgICAgICBpZihpc0NoZWNrZWQpIHtcbiAgICAgICAgICAgIHRoaXMuc2VsZWN0ZWRVc2Vyc0Zyb21GcmllbmRzTGlzdC5wdXNoKHNlbGVjdGVkVXNlcik7XG4gICAgICAgIH0gXG4gICAgICAgIGVsc2UgXG4gICAgICAgIHtcbiAgICAgICAgICAgIHRoaXMuc2VsZWN0ZWRVc2Vyc0Zyb21GcmllbmRzTGlzdC5zcGxpY2UodGhpcy5zZWxlY3RlZFVzZXJzRnJvbUZyaWVuZHNMaXN0LmluZGV4T2Yoc2VsZWN0ZWRVc2VyKSwgMSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBvblVzZXJDbGljayhjbGlja2VkVXNlcjogVXNlcik6IHZvaWRcbiAgICB7XG4gICAgICAgIHRoaXMub25QYXJ0aWNpcGFudENsaWNrZWQuZW1pdChjbGlja2VkVXNlcik7XG4gICAgfVxuXG4gICAgb25GcmllbmRzTGlzdEFjdGlvbkNhbmNlbENsaWNrZWQoKTogdm9pZFxuICAgIHtcbiAgICAgICAgdGhpcy5vbk9wdGlvblByb21wdENhbmNlbGVkLmVtaXQoKTtcbiAgICAgICAgdGhpcy5jbGVhblVwVXNlclNlbGVjdGlvbigpO1xuICAgIH1cblxuICAgIG9uRnJpZW5kc0xpc3RBY3Rpb25Db25maXJtQ2xpY2tlZCgpIDogdm9pZFxuICAgIHtcbiAgICAgICAgdGhpcy5vbk9wdGlvblByb21wdENvbmZpcm1lZC5lbWl0KHRoaXMuc2VsZWN0ZWRVc2Vyc0Zyb21GcmllbmRzTGlzdCk7XG4gICAgICAgIHRoaXMuY2xlYW5VcFVzZXJTZWxlY3Rpb24oKTtcbiAgICB9XG59XG4iXX0=