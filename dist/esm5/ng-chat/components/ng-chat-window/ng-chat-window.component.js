import { __decorate } from "tslib";
import { Component, Input, Output, EventEmitter, ViewEncapsulation, ViewChild } from '@angular/core';
import { Message } from "../../core/message";
import { MessageType } from "../../core/message-type.enum";
import { ChatParticipantStatus } from "../../core/chat-participant-status.enum";
import { ScrollDirection } from "../../core/scroll-direction.enum";
import { ChatParticipantType } from "../../core/chat-participant-type.enum";
import { MessageCounter } from "../../core/message-counter";
import { chatParticipantStatusDescriptor } from '../../core/chat-participant-status-descriptor';
var NgChatWindowComponent = /** @class */ (function () {
    function NgChatWindowComponent() {
        this.emojisEnabled = true;
        this.linkfyEnabled = true;
        this.showMessageDate = true;
        this.messageDatePipeFormat = "short";
        this.hasPagedHistory = true;
        this.onChatWindowClosed = new EventEmitter();
        this.onChatWindowToggle = new EventEmitter();
        this.onMessagesSeen = new EventEmitter();
        this.onMessageSent = new EventEmitter();
        this.onTabTriggered = new EventEmitter();
        this.onOptionTriggered = new EventEmitter();
        this.onLoadHistoryTriggered = new EventEmitter();
        // File upload state
        this.fileUploadersInUse = []; // Id bucket of uploaders in use
        // Exposes enums and functions for the ng-template
        this.ChatParticipantType = ChatParticipantType;
        this.ChatParticipantStatus = ChatParticipantStatus;
        this.MessageType = MessageType;
        this.chatParticipantStatusDescriptor = chatParticipantStatusDescriptor;
        //this.windowOptions = this.window.participant.windowOptions;
    }
    NgChatWindowComponent.prototype.defaultWindowOptions = function (currentWindow) {
        if (this.showOptions && currentWindow.participant.participantType == ChatParticipantType.User) {
            return [{
                    isActive: false,
                    chattingTo: currentWindow,
                    validateContext: function (participant) {
                        return participant.participantType == ChatParticipantType.User;
                    },
                    displayLabel: 'Add People' // TODO: Localize this
                }];
        }
        return [];
    };
    // Asserts if a user avatar is visible in a chat cluster
    NgChatWindowComponent.prototype.isAvatarVisible = function (window, message, index) {
        if (message.fromId != this.userId) {
            if (index == 0) {
                return true; // First message, good to show the thumbnail
            }
            else {
                // Check if the previous message belongs to the same user, if it belongs there is no need to show the avatar again to form the message cluster
                if (window.messages[index - 1].fromId != message.fromId) {
                    return true;
                }
            }
        }
        return false;
    };
    NgChatWindowComponent.prototype.getChatWindowAvatar = function (participant, message) {
        if (participant.participantType == ChatParticipantType.User) {
            return participant.avatar;
        }
        else if (participant.participantType == ChatParticipantType.Group) {
            var group = participant;
            var userIndex = group.chattingTo.findIndex(function (x) { return x.id == message.fromId; });
            return group.chattingTo[userIndex >= 0 ? userIndex : 0].avatar;
        }
        return null;
    };
    NgChatWindowComponent.prototype.getChatWindowAvatarSrc = function (participant, message) {
        if (participant.participantType == ChatParticipantType.User) {
            return participant.avatarSrc;
        }
        // else if (participant.participantType == ChatParticipantType.Group)
        // {
        //     let group = participant as Group;
        //     let userIndex = group.chattingTo.findIndex(x => x.id == message.fromId);
        //     return group.chattingTo[userIndex >= 0 ? userIndex : 0].avatar;
        // }
        return null;
    };
    NgChatWindowComponent.prototype.isUploadingFile = function (window) {
        var fileUploadInstanceId = this.getUniqueFileUploadInstanceId(window);
        return this.fileUploadersInUse.indexOf(fileUploadInstanceId) > -1;
    };
    // Generates a unique file uploader id for each participant
    NgChatWindowComponent.prototype.getUniqueFileUploadInstanceId = function (window) {
        if (window && window.participant) {
            return "ng-chat-file-upload-" + window.participant.id;
        }
        return 'ng-chat-file-upload';
    };
    NgChatWindowComponent.prototype.unreadMessagesTotal = function (window) {
        return MessageCounter.unreadMessagesTotal(window, this.userId);
    };
    // Scrolls a chat window message flow to the bottom
    NgChatWindowComponent.prototype.scrollChatWindow = function (window, direction) {
        var _this = this;
        if (!window.isCollapsed) {
            setTimeout(function () {
                if (_this.chatMessages) {
                    var element = _this.chatMessages.nativeElement;
                    var position = (direction === ScrollDirection.Top) ? 0 : element.scrollHeight;
                    element.scrollTop = position;
                }
            });
        }
    };
    NgChatWindowComponent.prototype.activeOptionTrackerChange = function (option) {
        this.onOptionTriggered.emit(option);
    };
    // Triggers native file upload for file selection from the user
    NgChatWindowComponent.prototype.triggerNativeFileUpload = function (window) {
        if (window) {
            if (this.nativeFileInput)
                this.nativeFileInput.nativeElement.click();
        }
    };
    // Toggles a window focus on the focus/blur of a 'newMessage' input
    NgChatWindowComponent.prototype.toggleWindowFocus = function (window) {
        var _this = this;
        window.hasFocus = !window.hasFocus;
        if (window.hasFocus) {
            var unreadMessages = window.messages
                .filter(function (message) { return message.dateSeen == null
                && (message.toId == _this.userId || window.participant.participantType === ChatParticipantType.Group); });
            if (unreadMessages && unreadMessages.length > 0) {
                this.onMessagesSeen.emit(unreadMessages);
            }
        }
    };
    NgChatWindowComponent.prototype.markMessagesAsRead = function (messages) {
        this.onMessagesSeen.emit(messages);
    };
    NgChatWindowComponent.prototype.fetchMessageHistory = function (window) {
        this.onLoadHistoryTriggered.emit(window);
    };
    // Closes a chat window via the close 'X' button
    NgChatWindowComponent.prototype.onCloseChatWindow = function () {
        this.onChatWindowClosed.emit({ closedWindow: this.window, closedViaEscapeKey: false });
    };
    /*  Monitors pressed keys on a chat window
        - Dispatches a message when the ENTER key is pressed
        - Tabs between windows on TAB or SHIFT + TAB
        - Closes the current focused window on ESC
    */
    NgChatWindowComponent.prototype.onChatInputTyped = function (event, window) {
        switch (event.keyCode) {
            case 13:
                if (window.newMessage && window.newMessage.trim() != "") {
                    var message = new Message();
                    message.fromId = this.userId;
                    message.toId = window.participant.id;
                    message.message = window.newMessage;
                    message.dateSent = new Date();
                    window.messages.push(message);
                    this.onMessageSent.emit(message);
                    window.newMessage = ""; // Resets the new message input
                    this.scrollChatWindow(window, ScrollDirection.Bottom);
                }
                break;
            case 9:
                event.preventDefault();
                this.onTabTriggered.emit({ triggeringWindow: window, shiftKeyPressed: event.shiftKey });
                break;
            case 27:
                this.onChatWindowClosed.emit({ closedWindow: window, closedViaEscapeKey: true });
                break;
        }
    };
    // Toggles a chat window visibility between maximized/minimized
    NgChatWindowComponent.prototype.onChatWindowClicked = function (window) {
        window.isCollapsed = !window.isCollapsed;
        this.onChatWindowToggle.emit({ currentWindow: window, isCollapsed: window.isCollapsed });
        this.scrollChatWindow(window, ScrollDirection.Bottom);
    };
    NgChatWindowComponent.prototype.clearInUseFileUploader = function (fileUploadInstanceId) {
        var uploaderInstanceIdIndex = this.fileUploadersInUse.indexOf(fileUploadInstanceId);
        if (uploaderInstanceIdIndex > -1) {
            this.fileUploadersInUse.splice(uploaderInstanceIdIndex, 1);
        }
    };
    // Handles file selection and uploads the selected file using the file upload adapter
    NgChatWindowComponent.prototype.onFileChosen = function (window) {
        var _this = this;
        var fileUploadInstanceId = this.getUniqueFileUploadInstanceId(window);
        var uploadElementRef = this.nativeFileInput;
        if (uploadElementRef) {
            var file = uploadElementRef.nativeElement.files[0];
            this.fileUploadersInUse.push(fileUploadInstanceId);
            this.fileUploadAdapter.uploadFile(file, window.participant.id)
                .subscribe(function (fileMessage) {
                _this.clearInUseFileUploader(fileUploadInstanceId);
                fileMessage.fromId = _this.userId;
                // Push file message to current user window   
                window.messages.push(fileMessage);
                _this.onMessageSent.emit(fileMessage);
                _this.scrollChatWindow(window, ScrollDirection.Bottom);
                // Resets the file upload element
                uploadElementRef.nativeElement.value = '';
            }, function (error) {
                _this.clearInUseFileUploader(fileUploadInstanceId);
                // Resets the file upload element
                uploadElementRef.nativeElement.value = '';
                // TODO: Invoke a file upload adapter error here
            });
        }
    };
    __decorate([
        Input()
    ], NgChatWindowComponent.prototype, "fileUploadAdapter", void 0);
    __decorate([
        Input()
    ], NgChatWindowComponent.prototype, "window", void 0);
    __decorate([
        Input()
    ], NgChatWindowComponent.prototype, "userId", void 0);
    __decorate([
        Input()
    ], NgChatWindowComponent.prototype, "localization", void 0);
    __decorate([
        Input()
    ], NgChatWindowComponent.prototype, "showOptions", void 0);
    __decorate([
        Input()
    ], NgChatWindowComponent.prototype, "emojisEnabled", void 0);
    __decorate([
        Input()
    ], NgChatWindowComponent.prototype, "linkfyEnabled", void 0);
    __decorate([
        Input()
    ], NgChatWindowComponent.prototype, "showMessageDate", void 0);
    __decorate([
        Input()
    ], NgChatWindowComponent.prototype, "messageDatePipeFormat", void 0);
    __decorate([
        Input()
    ], NgChatWindowComponent.prototype, "hasPagedHistory", void 0);
    __decorate([
        Output()
    ], NgChatWindowComponent.prototype, "onChatWindowClosed", void 0);
    __decorate([
        Output()
    ], NgChatWindowComponent.prototype, "onChatWindowToggle", void 0);
    __decorate([
        Output()
    ], NgChatWindowComponent.prototype, "onMessagesSeen", void 0);
    __decorate([
        Output()
    ], NgChatWindowComponent.prototype, "onMessageSent", void 0);
    __decorate([
        Output()
    ], NgChatWindowComponent.prototype, "onTabTriggered", void 0);
    __decorate([
        Output()
    ], NgChatWindowComponent.prototype, "onOptionTriggered", void 0);
    __decorate([
        Output()
    ], NgChatWindowComponent.prototype, "onLoadHistoryTriggered", void 0);
    __decorate([
        ViewChild('chatMessages')
    ], NgChatWindowComponent.prototype, "chatMessages", void 0);
    __decorate([
        ViewChild('nativeFileInput')
    ], NgChatWindowComponent.prototype, "nativeFileInput", void 0);
    __decorate([
        ViewChild('chatWindowInput')
    ], NgChatWindowComponent.prototype, "chatWindowInput", void 0);
    NgChatWindowComponent = __decorate([
        Component({
            selector: 'ng-chat-window',
            template: "<ng-container *ngIf=\"window && window.isCollapsed\" [ngClass]=\"window?.participant?.windowOptions?.windowClass\">\n\t<div class=\"ng-chat-title secondary-background\">\n\t\t<div class=\"ng-chat-title-visibility-toggle-area\" (click)=\"onChatWindowClicked(window)\">\n\t\t\t<strong title=\"{{window.participant.displayName}}\">\n\t\t\t\t{{window.participant.displayName}}\n\t\t\t</strong>\n\t\t\t<span [ngClass]=\"{'ng-chat-participant-status': true, 'online': window.participant.status == ChatParticipantStatus.Online, 'busy': window.participant.status == ChatParticipantStatus.Busy, 'away': window.participant.status == ChatParticipantStatus.Away, 'offline': window.participant.status == ChatParticipantStatus.Offline}\" title=\"{{chatParticipantStatusDescriptor(window.participant.status, localization)}}\"></span>\n\t\t\t<span *ngIf=\"unreadMessagesTotal(window).length > 0\" class=\"ng-chat-unread-messages-count unread-messages-counter-container primary-text\">{{unreadMessagesTotal(window)}}</span>\n\t\t</div>\n\t\t<a href=\"javascript:void(0);\" class=\"ng-chat-close primary-text\" (click)=\"onCloseChatWindow()\">X</a>\n\t</div>\n</ng-container>\n<ng-container *ngIf=\"window && !window.isCollapsed\" [ngClass]=\"window?.participant?.windowOptions?.windowClass\">\n\t<div class=\"ng-chat-title secondary-background\">\n\t\t<div class=\"ng-chat-title-visibility-toggle-area\" (click)=\"onChatWindowClicked(window)\">\n\t\t\t<strong title=\"{{window.participant.displayName}}\">\n\t\t\t\t{{window.participant.displayName}}\n\t\t\t</strong>\n\t\t\t<span [ngClass]=\"{'ng-chat-participant-status': true, 'online': window.participant.status == ChatParticipantStatus.Online, 'busy': window.participant.status == ChatParticipantStatus.Busy, 'away': window.participant.status == ChatParticipantStatus.Away, 'offline': window.participant.status == ChatParticipantStatus.Offline}\" title=\"{{chatParticipantStatusDescriptor(window.participant.status, localization)}}\"></span>\n\t\t\t<span *ngIf=\"unreadMessagesTotal(window).length > 0\" class=\"ng-chat-unread-messages-count unread-messages-counter-container primary-text\">{{unreadMessagesTotal(window)}}</span>\n\t\t</div>\n\t\t<ng-chat-window-options *ngIf=\"window?.participant?.windowOptions?.buttons\" [ngClass]=\"{'ng-chat-options-container' : window.participant.windowOptions.buttons.length > 2, 'ng-chat-options-container-reduced': window.participant.windowOptions.buttons.length < 3 }\" [options]=\"window?.participant?.windowOptions\"></ng-chat-window-options>\n\t\t<a href=\"javascript:void(0);\" class=\"ng-chat-close primary-text\" (click)=\"onCloseChatWindow()\">X</a>\n\t\t<ng-chat-options [ngClass]=\"'ng-chat-options-container'\" [options]=\"defaultWindowOptions(window)\" (activeOptionTrackerChange)=\"activeOptionTrackerChange($event)\"></ng-chat-options>\n\t</div>\n\t<div #chatMessages class=\"ng-chat-messages primary-background\">\n\t\t<div *ngIf=\"window.isLoadingHistory\" class=\"ng-chat-loading-wrapper\">\n\t\t\t<div class=\"loader\">Loading history...</div>\n\t\t</div>\n\t\t<div *ngIf=\"hasPagedHistory && window.hasMoreMessages && !window.isLoadingHistory\" class=\"ng-chat-load-history\">\n\t\t\t<a class=\"load-history-action\" (click)=\"fetchMessageHistory(window)\">{{localization.loadMessageHistoryPlaceholder}}</a>\n\t\t</div>\n\n\t\t<div *ngFor=\"let message of window.messages; let i = index\" [ngClass]=\"{'ng-chat-message': true, 'ng-chat-message-received': message.fromId != userId}\">\n\t\t\t<ng-container *ngIf=\"isAvatarVisible(window, message, i)\">\n\t\t\t\t<div *ngIf=\"!getChatWindowAvatar(window.participant, message) && !getChatWindowAvatarSrc(window.participant, message)\" class=\"icon-wrapper\">\n\t\t\t\t\t<i class=\"user-icon\"></i>\n\t\t\t\t</div>\n\t\t\t\t<img *ngIf=\"getChatWindowAvatar(window.participant, message)\" alt=\"\" class=\"avatar\" height=\"30\" width=\"30\" [src]=\"getChatWindowAvatar(window.participant, message) | sanitize\" />\n\t\t\t\t<img *ngIf=\"getChatWindowAvatarSrc(window.participant, message)\" alt=\"\" class=\"avatar avatarSrc\" height=\"30\" width=\"30\" [src]=\"getChatWindowAvatarSrc(window.participant, message) | secure | async\" />\n\t\t\t\t<span *ngIf=\"window.participant.participantType == ChatParticipantType.Group\" class=\"ng-chat-participant-name\">{{window.participant | groupMessageDisplayName:message}}</span>\n\t\t\t</ng-container>\n\t\t\t<ng-container [ngSwitch]=\"message.type\">\n\t\t\t\t<div *ngSwitchCase=\"MessageType.Text\" [ngClass]=\"{'sent-chat-message-container': message.fromId == userId, 'received-chat-message-container': message.fromId != userId}\">\n          <span [innerHtml]=\"message.message | emojify:emojisEnabled | linkfy:linkfyEnabled\"></span>\n\t\t\t\t\t<span *ngIf=\"showMessageDate && message.dateSent\" class=\"message-sent-date\">{{message.dateSent | date:messageDatePipeFormat}}</span>\n\t\t\t\t</div>\n        <div *ngSwitchCase=\"MessageType.Image\" [ngClass]=\"{'sent-chat-message-container': message.fromId == userId, 'received-chat-message-container': message.fromId != userId}\">\n\n          <img src=\"{{message.message}}\" class=\"image-message\" />\n\n\t\t\t\t\t<span *ngIf=\"showMessageDate && message.dateSent\" class=\"message-sent-date\">{{message.dateSent | date:messageDatePipeFormat}}</span>\n\t\t\t\t</div>\n\t\t\t\t<div *ngSwitchCase=\"MessageType.File\" [ngClass]=\"{'file-message-container': true, 'received': message.fromId != userId}\">\n\t\t\t\t\t<div class=\"file-message-icon-container\">\n\t\t\t\t\t\t<i class=\"paperclip-icon\"></i>\n\t\t\t\t\t</div>\n\t\t\t\t\t<a class=\"file-details\" [attr.href]=\"message.downloadUrl\" target=\"_blank\" rel=\"noopener noreferrer\" (click)=\"this.markMessagesAsRead([message])\" download>\n\t\t\t\t\t\t<span class=\"file-message-title\" [attr.title]=\"message.message\">{{message.message}}</span>\n\t\t\t\t\t\t<span *ngIf=\"message.fileSizeInBytes\"  class=\"file-message-size\">{{message.fileSizeInBytes}} Bytes</span>\n\t\t\t\t\t</a>\n\t\t\t\t</div>\n\t\t\t</ng-container>\n\t\t</div>\n\t</div>\n\n\t<div class=\"ng-chat-footer primary-outline-color primary-background\">\n\t\t<input #chatWindowInput\n\t\t\ttype=\"text\"\n\t\t\t[ngModel]=\"window.newMessage | emojify:emojisEnabled\"\n\t\t\t(ngModelChange)=\"window.newMessage=$event\"\n\t\t\t[placeholder]=\"localization.messagePlaceholder\"\n\t\t\t[ngClass]=\"{'chat-window-input': true, 'has-side-action': fileUploadAdapter}\"\n\t\t\t(keydown)=\"onChatInputTyped($event, window)\"\n\t\t\t(blur)=\"toggleWindowFocus(window)\"\n\t\t\t(focus)=\"toggleWindowFocus(window)\"/>\n\n\t\t<!-- File Upload -->\n\t\t<ng-container *ngIf=\"fileUploadAdapter\">\n\t\t\t<a *ngIf=\"!isUploadingFile(window)\" class=\"btn-add-file\" (click)=\"triggerNativeFileUpload(window)\">\n\t\t\t\t<i class=\"upload-icon\"></i>\n\t\t\t</a>\n\t\t\t<input\n\t\t\t\ttype=\"file\"\n\t\t\t\t#nativeFileInput\n\t\t\t\tstyle=\"display: none;\"\n\t\t\t\t[attr.id]=\"getUniqueFileUploadInstanceId(window)\"\n\t\t\t\t(change)=\"onFileChosen(window)\" />\n\t\t\t<div *ngIf=\"isUploadingFile(window)\" class=\"loader\"></div>\n\t\t</ng-container>\n\t</div>\n</ng-container>\n",
            encapsulation: ViewEncapsulation.None,
            styles: [".ng-chat-window{right:260px;height:360px;z-index:999;bottom:0;width:300px;position:fixed;border-width:1px;border-style:solid;border-bottom:0;box-shadow:0 4px 8px rgba(0,0,0,.25)}.ng-chat-window-collapsed{height:30px!important}.ng-chat-window .ng-chat-footer{box-sizing:border-box;padding:0;display:block;height:calc(10%);width:100%;border:none;border-top:1px solid transparent;border-color:inherit}.ng-chat-window .ng-chat-footer>input{font-size:.8em;box-sizing:border-box;padding:0 5px;display:block;height:100%;width:100%;border:none}.ng-chat-window .ng-chat-footer>input.has-side-action{width:calc(100% - 30px)}.ng-chat-window .ng-chat-footer .btn-add-file{position:absolute;right:5px;bottom:7px;height:20px;width:20px;cursor:pointer}.ng-chat-window .ng-chat-footer .loader{position:absolute;right:14px;bottom:8px}.ng-chat-window .ng-chat-load-history{height:30px;text-align:center;font-size:.8em}.ng-chat-window .ng-chat-load-history>a{border-radius:15px;cursor:pointer;padding:5px 10px}.ng-chat-window .ng-chat-messages{padding:10px;width:100%;height:calc(90% - 30px);box-sizing:border-box;position:relative;overflow:auto}.ng-chat-window .ng-chat-messages .ng-chat-message{clear:both}.ng-chat-window .ng-chat-messages .ng-chat-message>.icon-wrapper,.ng-chat-window .ng-chat-messages .ng-chat-message>img.avatar{position:absolute;left:10px;border-radius:25px}.ng-chat-window .ng-chat-messages .ng-chat-message .ng-chat-participant-name{display:inline-block;margin-left:40px;padding-bottom:5px;font-weight:700;font-size:.8em;text-overflow:ellipsis;max-width:180px}.ng-chat-window .ng-chat-messages .ng-chat-message>.icon-wrapper{background-color:#bababa;overflow:hidden;width:30px;height:30px;padding:0}.ng-chat-window .ng-chat-messages .ng-chat-message>.icon-wrapper>i{color:#fff;transform:scale(.7)}.ng-chat-window .ng-chat-messages .ng-chat-message .message-sent-date{font-size:.8em;display:block;text-align:right;margin-top:5px}.ng-chat-window .ng-chat-messages .ng-chat-message>div{float:right;width:182px;padding:10px;border-radius:5px;margin-top:0;margin-bottom:5px;font-size:.9em;word-wrap:break-word}.ng-chat-window .ng-chat-messages .ng-chat-message.ng-chat-message-received>div.received-chat-message-container{float:left;margin-left:40px;padding-top:7px;padding-bottom:7px;border-style:solid;border-width:3px;margin-top:0;margin-bottom:5px}.ng-chat-window .ng-chat-messages .ng-chat-message .file-message-container{float:right;width:202px;border-style:solid;border-width:3px;border-radius:5px;overflow:hidden;margin-bottom:5px;display:block;text-decoration:none;font-size:.9em;padding:0;box-sizing:border-box}.ng-chat-window .ng-chat-messages .ng-chat-message .file-message-container.received{float:left;margin-left:40px;width:208px}.ng-chat-window .ng-chat-messages .ng-chat-message .file-message-container>.file-message-icon-container{width:20px;height:35px;padding:10px 5px;float:left}.ng-chat-window .ng-chat-messages .ng-chat-message .file-message-container>.file-message-icon-container i{margin-top:8px}.ng-chat-window .ng-chat-messages .ng-chat-message .file-message-container>.file-details{float:left;padding:10px;width:calc(100% - 60px);color:currentColor;text-decoration:none}.ng-chat-window .ng-chat-messages .ng-chat-message .file-message-container>.file-details:hover{text-decoration:underline}.ng-chat-window .ng-chat-messages .ng-chat-message .file-message-container>.file-details span{display:block;width:100%;text-overflow:ellipsis;overflow:hidden;white-space:nowrap}.ng-chat-window .ng-chat-messages .ng-chat-message .file-message-container>.file-details .file-message-title{font-weight:700}.ng-chat-window .ng-chat-messages .ng-chat-message .file-message-container>.file-details .file-message-size{font-size:.8em;margin-top:5px}.ng-chat-window .image-message{width:100%;height:auto}@media only screen and (max-width:581px){.ng-chat-window{position:initial}}"]
        })
    ], NgChatWindowComponent);
    return NgChatWindowComponent;
}());
export { NgChatWindowComponent };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmctY2hhdC13aW5kb3cuY29tcG9uZW50LmpzIiwic291cmNlUm9vdCI6Im5nOi8vbmctY2hhdC8iLCJzb3VyY2VzIjpbIm5nLWNoYXQvY29tcG9uZW50cy9uZy1jaGF0LXdpbmRvdy9uZy1jaGF0LXdpbmRvdy5jb21wb25lbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBLE9BQU8sRUFBRSxTQUFTLEVBQUUsS0FBSyxFQUFFLE1BQU0sRUFBRSxZQUFZLEVBQUUsaUJBQWlCLEVBQUUsU0FBUyxFQUFjLE1BQU0sZUFBZSxDQUFDO0FBRWpILE9BQU8sRUFBRSxPQUFPLEVBQUUsTUFBTSxvQkFBb0IsQ0FBQztBQUM3QyxPQUFPLEVBQUUsV0FBVyxFQUFFLE1BQU0sOEJBQThCLENBQUM7QUFFM0QsT0FBTyxFQUFFLHFCQUFxQixFQUFFLE1BQU0seUNBQXlDLENBQUM7QUFDaEYsT0FBTyxFQUFFLGVBQWUsRUFBRSxNQUFNLGtDQUFrQyxDQUFDO0FBTW5FLE9BQU8sRUFBRSxtQkFBbUIsRUFBRSxNQUFNLHVDQUF1QyxDQUFDO0FBRTVFLE9BQU8sRUFBRSxjQUFjLEVBQUUsTUFBTSw0QkFBNEIsQ0FBQztBQUM1RCxPQUFPLEVBQUUsK0JBQStCLEVBQUUsTUFBTSwrQ0FBK0MsQ0FBQztBQVFoRztJQUNJO1FBdUJPLGtCQUFhLEdBQVksSUFBSSxDQUFDO1FBRzlCLGtCQUFhLEdBQVksSUFBSSxDQUFDO1FBRzlCLG9CQUFlLEdBQVksSUFBSSxDQUFDO1FBR2hDLDBCQUFxQixHQUFXLE9BQU8sQ0FBQztRQUd4QyxvQkFBZSxHQUFZLElBQUksQ0FBQztRQUdoQyx1QkFBa0IsR0FBdUUsSUFBSSxZQUFZLEVBQUUsQ0FBQztRQUc1Ryx1QkFBa0IsR0FBaUUsSUFBSSxZQUFZLEVBQUUsQ0FBQztRQUd0RyxtQkFBYyxHQUE0QixJQUFJLFlBQVksRUFBRSxDQUFDO1FBRzdELGtCQUFhLEdBQTBCLElBQUksWUFBWSxFQUFFLENBQUM7UUFHMUQsbUJBQWMsR0FBeUUsSUFB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RTtxRUFDMEc7SUFHbkg7UUFEQyxNQUFNLEVBQUU7cUVBQ29HO0lBRzdHO1FBREMsTUFBTSxFQUFFO2lFQUMyRDtJQUdwRTtRQURDLE1BQU0sRUFBRTtnRUFDd0Q7SUFHakU7UUFEQyxNQUFNLEVBQUU7aUVBQ3dHO0lBR2pIO1FBREMsTUFBTSxFQUFFO29FQUNnRTtJQUd6RTtRQURDLE1BQU0sRUFBRTt5RUFDZ0U7SUFFOUM7UUFBMUIsU0FBUyxDQUFDLGNBQWMsQ0FBQzsrREFBbUI7SUFDZjtRQUE3QixTQUFTLENBQUMsaUJBQWlCLENBQUM7a0VBQTZCO0lBQzVCO1FBQTdCLFNBQVMsQ0FBQyxpQkFBaUIsQ0FBQztrRUFBc0I7SUE3RDFDLHFCQUFxQjtRQU5qQyxTQUFTLENBQUM7WUFDUCxRQUFRLEVBQUUsZ0JBQWdCO1lBQzFCLHUvTkFBOEM7WUFFOUMsYUFBYSxFQUFFLGlCQUFpQixDQUFDLElBQUk7O1NBQ3hDLENBQUM7T0FDVyxxQkFBcUIsQ0E0VGpDO0lBQUQsNEJBQUM7Q0FBQSxBQTVURCxJQTRUQztTQTVUWSxxQkFBcUIiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBDb21wb25lbnQsIElucHV0LCBPdXRwdXQsIEV2ZW50RW1pdHRlciwgVmlld0VuY2Fwc3VsYXRpb24sIFZpZXdDaGlsZCwgRWxlbWVudFJlZiB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuXG5pbXBvcnQgeyBNZXNzYWdlIH0gZnJvbSBcIi4uLy4uL2NvcmUvbWVzc2FnZVwiO1xuaW1wb3J0IHsgTWVzc2FnZVR5cGUgfSBmcm9tIFwiLi4vLi4vY29yZS9tZXNzYWdlLXR5cGUuZW51bVwiO1xuaW1wb3J0IHsgV2luZG93IH0gZnJvbSBcIi4uLy4uL2NvcmUvd2luZG93XCI7XG5pbXBvcnQgeyBDaGF0UGFydGljaXBhbnRTdGF0dXMgfSBmcm9tIFwiLi4vLi4vY29yZS9jaGF0LXBhcnRpY2lwYW50LXN0YXR1cy5lbnVtXCI7XG5pbXBvcnQgeyBTY3JvbGxEaXJlY3Rpb24gfSBmcm9tIFwiLi4vLi4vY29yZS9zY3JvbGwtZGlyZWN0aW9uLmVudW1cIjtcbmltcG9ydCB7IExvY2FsaXphdGlvbiB9IGZyb20gJy4uLy4uL2NvcmUvbG9jYWxpemF0aW9uJztcbmltcG9ydCB7IElGaWxlVXBsb2FkQWRhcHRlciB9IGZyb20gJy4uLy4uL2NvcmUvZmlsZS11cGxvYWQtYWRhcHRlcic7XG5pbXBvcnQgeyBJQ2hhdE9wdGlvbiB9IGZyb20gJy4uLy4uL2NvcmUvY2hhdC1vcHRpb24nO1xuaW1wb3J0IHsgV2luZG93T3B0aW9uIH0gZnJvbSAnLi4vLi4vY29yZS93aW5kb3ctb3B0aW9uJztcbmltcG9ydCB7IEdyb3VwIH0gZnJvbSBcIi4uLy4uL2NvcmUvZ3JvdXBcIjtcbmltcG9ydCB7IENoYXRQYXJ0aWNpcGFudFR5cGUgfSBmcm9tIFwiLi4vLi4vY29yZS9jaGF0LXBhcnRpY2lwYW50LXR5cGUuZW51bVwiO1xuaW1wb3J0IHsgSUNoYXRQYXJ0aWNpcGFudCB9IGZyb20gXCIuLi8uLi9jb3JlL2NoYXQtcGFydGljaXBhbnRcIjtcbmltcG9ydCB7IE1lc3NhZ2VDb3VudGVyIH0gZnJvbSBcIi4uLy4uL2NvcmUvbWVzc2FnZS1jb3VudGVyXCI7XG5pbXBvcnQgeyBjaGF0UGFydGljaXBhbnRTdGF0dXNEZXNjcmlwdG9yIH0gZnJvbSAnLi4vLi4vY29yZS9jaGF0LXBhcnRpY2lwYW50LXN0YXR1cy1kZXNjcmlwdG9yJztcblxuQENvbXBvbmVudCh7XG4gICAgc2VsZWN0b3I6ICduZy1jaGF0LXdpbmRvdycsXG4gICAgdGVtcGxhdGVVcmw6ICcuL25nLWNoYXQtd2luZG93LmNvbXBvbmVudC5odG1sJyxcbiAgICBzdHlsZVVybHM6IFsnLi9uZy1jaGF0LXdpbmRvdy5jb21wb25lbnQuY3NzJ10sXG4gICAgZW5jYXBzdWxhdGlvbjogVmlld0VuY2Fwc3VsYXRpb24uTm9uZVxufSlcbmV4cG9ydCBjbGFzcyBOZ0NoYXRXaW5kb3dDb21wb25lbnQge1xuICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICAvL3RoaXMud2luZG93T3B0aW9ucyA9IHRoaXMud2luZG93LnBhcnRpY2lwYW50LndpbmRvd09wdGlvbnM7XG4gICAgIH1cblxuICAgICAvL3dpbmRvd09wdGlvbnM6IFdpbmRvd09wdGlvbiB8IG51bGw7XG5cblxuICAgIEBJbnB1dCgpXG4gICAgcHVibGljIGZpbGVVcGxvYWRBZGFwdGVyOiBJRmlsZVVwbG9hZEFkYXB0ZXI7XG5cbiAgICBASW5wdXQoKVxuICAgIHB1YmxpYyB3aW5kb3c6IFdpbmRvdztcblxuICAgIEBJbnB1dCgpXG4gICAgcHVibGljIHVzZXJJZDogYW55O1xuXG4gICAgQElucHV0KClcbiAgICBwdWJsaWMgbG9jYWxpemF0aW9uOiBMb2NhbGl6YXRpb247XG5cbiAgICBASW5wdXQoKVxuICAgIHB1YmxpYyBzaG93T3B0aW9uczogYm9vbGVhbjtcblxuICAgIEBJbnB1dCgpICAgIFxuICAgIHB1YmxpYyBlbW9qaXNFbmFibGVkOiBib29sZWFuID0gdHJ1ZTtcblxuICAgIEBJbnB1dCgpICAgIFxuICAgIHB1YmxpYyBsaW5rZnlFbmFibGVkOiBib29sZWFuID0gdHJ1ZTtcblxuICAgIEBJbnB1dCgpXG4gICAgcHVibGljIHNob3dNZXNzYWdlRGF0ZTogYm9vbGVhbiA9IHRydWU7XG5cbiAgICBASW5wdXQoKVxuICAgIHB1YmxpYyBtZXNzYWdlRGF0ZVBpcGVGb3JtYXQ6IHN0cmluZyA9IFwic2hvcnRcIjtcblxuICAgIEBJbnB1dCgpXG4gICAgcHVibGljIGhhc1BhZ2VkSGlzdG9yeTogYm9vbGVhbiA9IHRydWU7XG5cbiAgICBAT3V0cHV0KClcbiAgICBwdWJsaWMgb25DaGF0V2luZG93Q2xvc2VkOiBFdmVudEVtaXR0ZXI8eyBjbG9zZWRXaW5kb3c6IFdpbmRvdywgY2xvc2VkVmlhRXNjYXBlS2V5OiBib29sZWFufT4gPSBuZXcgRXZlbnRFbWl0dGVyKCk7XG5cbiAgICBAT3V0cHV0KClcbiAgICBwdWJsaWMgb25DaGF0V2luZG93VG9nZ2xlOiBFdmVudEVtaXR0ZXI8eyBjdXJyZW50V2luZG93OiBXaW5kb3csIGlzQ29sbGFwc2VkOiBib29sZWFufT4gPSBuZXcgRXZlbnRFbWl0dGVyKCk7XG5cbiAgICBAT3V0cHV0KClcbiAgICBwdWJsaWMgb25NZXNzYWdlc1NlZW46IEV2ZW50RW1pdHRlcjxNZXNzYWdlW10+ID0gbmV3IEV2ZW50RW1pdHRlcigpO1xuXG4gICAgQE91dHB1dCgpXG4gICAgcHVibGljIG9uTWVzc2FnZVNlbnQ6IEV2ZW50RW1pdHRlcjxNZXNzYWdlPiA9IG5ldyBFdmVudEVtaXR0ZXIoKTtcblxuICAgIEBPdXRwdXQoKVxuICAgIHB1YmxpYyBvblRhYlRyaWdnZXJlZDogRXZlbnRFbWl0dGVyPHsgdHJpZ2dlcmluZ1dpbmRvdzogV2luZG93LCBzaGlmdEtleVByZXNzZWQ6IGJvb2xlYW4gfT4gPSBuZXcgRXZlbnRFbWl0dGVyKCk7XG5cbiAgICBAT3V0cHV0KClcbiAgICBwdWJsaWMgb25PcHRpb25UcmlnZ2VyZWQ6IEV2ZW50RW1pdHRlcjxJQ2hhdE9wdGlvbj4gPSBuZXcgRXZlbnRFbWl0dGVyKCk7XG5cbiAgICBAT3V0cHV0KClcbiAgICBwdWJsaWMgb25Mb2FkSGlzdG9yeVRyaWdnZXJlZDogRXZlbnRFbWl0dGVyPFdpbmRvdz4gPSBuZXcgRXZlbnRFbWl0dGVyKCk7XG5cbiAgICBAVmlld0NoaWxkKCdjaGF0TWVzc2FnZXMnKSBjaGF0TWVzc2FnZXM6IGFueTtcbiAgICBAVmlld0NoaWxkKCduYXRpdmVGaWxlSW5wdXQnKSBuYXRpdmVGaWxlSW5wdXQ6IEVsZW1lbnRSZWY7XG4gICAgQFZpZXdDaGlsZCgnY2hhdFdpbmRvd0lucHV0JykgY2hhdFdpbmRvd0lucHV0OiBhbnk7XG5cbiAgICAvLyBGaWxlIHVwbG9hZCBzdGF0ZVxuICAgIHB1YmxpYyBmaWxlVXBsb2FkZXJzSW5Vc2U6IHN0cmluZ1tdID0gW107IC8vIElkIGJ1Y2tldCBvZiB1cGxvYWRlcnMgaW4gdXNlXG5cbiAgICAvLyBFeHBvc2VzIGVudW1zIGFuZCBmdW5jdGlvbnMgZm9yIHRoZSBuZy10ZW1wbGF0ZVxuICAgIHB1YmxpYyBDaGF0UGFydGljaXBhbnRUeXBlID0gQ2hhdFBhcnRpY2lwYW50VHlwZTtcbiAgICBwdWJsaWMgQ2hhdFBhcnRpY2lwYW50U3RhdHVzID0gQ2hhdFBhcnRpY2lwYW50U3RhdHVzO1xuICAgIHB1YmxpYyBNZXNzYWdlVHlwZSA9IE1lc3NhZ2VUeXBlO1xuICAgIHB1YmxpYyBjaGF0UGFydGljaXBhbnRTdGF0dXNEZXNjcmlwdG9yID0gY2hhdFBhcnRpY2lwYW50U3RhdHVzRGVzY3JpcHRvcjtcblxuICAgIGRlZmF1bHRXaW5kb3dPcHRpb25zKGN1cnJlbnRXaW5kb3c6IFdpbmRvdyk6IElDaGF0T3B0aW9uW11cbiAgICB7XG4gICAgICAgIGlmICh0aGlzLnNob3dPcHRpb25zICYmIGN1cnJlbnRXaW5kb3cucGFydGljaXBhbnQucGFydGljaXBhbnRUeXBlID09IENoYXRQYXJ0aWNpcGFudFR5cGUuVXNlcilcbiAgICAgICAge1xuICAgICAgICAgICAgcmV0dXJuIFt7XG4gICAgICAgICAgICAgICAgaXNBY3RpdmU6IGZhbHNlLFxuICAgICAgICAgICAgICAgIGNoYXR0aW5nVG86IGN1cnJlbnRXaW5kb3csXG4gICAgICAgICAgICAgICAgdmFsaWRhdGVDb250ZXh0OiAocGFydGljaXBhbnQ6IElDaGF0UGFydGljaXBhbnQpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHBhcnRpY2lwYW50LnBhcnRpY2lwYW50VHlwZSA9PSBDaGF0UGFydGljaXBhbnRUeXBlLlVzZXI7XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBkaXNwbGF5TGFiZWw6ICdBZGQgUGVvcGxlJyAvLyBUT0RPOiBMb2NhbGl6ZSB0aGlzXG4gICAgICAgICAgICB9XTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBbXTtcbiAgICB9XG5cbiAgICAvLyBBc3NlcnRzIGlmIGEgdXNlciBhdmF0YXIgaXMgdmlzaWJsZSBpbiBhIGNoYXQgY2x1c3RlclxuICAgIGlzQXZhdGFyVmlzaWJsZSh3aW5kb3c6IFdpbmRvdywgbWVzc2FnZTogTWVzc2FnZSwgaW5kZXg6IG51bWJlcik6IGJvb2xlYW5cbiAgICB7XG4gICAgICAgIGlmIChtZXNzYWdlLmZyb21JZCAhPSB0aGlzLnVzZXJJZCl7XG4gICAgICAgICAgICBpZiAoaW5kZXggPT0gMCl7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7IC8vIEZpcnN0IG1lc3NhZ2UsIGdvb2QgdG8gc2hvdyB0aGUgdGh1bWJuYWlsXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNle1xuICAgICAgICAgICAgICAgIC8vIENoZWNrIGlmIHRoZSBwcmV2aW91cyBtZXNzYWdlIGJlbG9uZ3MgdG8gdGhlIHNhbWUgdXNlciwgaWYgaXQgYmVsb25ncyB0aGVyZSBpcyBubyBuZWVkIHRvIHNob3cgdGhlIGF2YXRhciBhZ2FpbiB0byBmb3JtIHRoZSBtZXNzYWdlIGNsdXN0ZXJcbiAgICAgICAgICAgICAgICBpZiAod2luZG93Lm1lc3NhZ2VzW2luZGV4IC0gMV0uZnJvbUlkICE9IG1lc3NhZ2UuZnJvbUlkKXtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIGdldENoYXRXaW5kb3dBdmF0YXIocGFydGljaXBhbnQ6IElDaGF0UGFydGljaXBhbnQsIG1lc3NhZ2U6IE1lc3NhZ2UpOiBzdHJpbmcgfCBudWxsXG4gICAge1xuICAgICAgICBpZiAocGFydGljaXBhbnQucGFydGljaXBhbnRUeXBlID09IENoYXRQYXJ0aWNpcGFudFR5cGUuVXNlcilcbiAgICAgICAge1xuICAgICAgICAgICAgcmV0dXJuIHBhcnRpY2lwYW50LmF2YXRhcjtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmIChwYXJ0aWNpcGFudC5wYXJ0aWNpcGFudFR5cGUgPT0gQ2hhdFBhcnRpY2lwYW50VHlwZS5Hcm91cClcbiAgICAgICAge1xuICAgICAgICAgICAgbGV0IGdyb3VwID0gcGFydGljaXBhbnQgYXMgR3JvdXA7XG4gICAgICAgICAgICBsZXQgdXNlckluZGV4ID0gZ3JvdXAuY2hhdHRpbmdUby5maW5kSW5kZXgoeCA9PiB4LmlkID09IG1lc3NhZ2UuZnJvbUlkKTtcblxuICAgICAgICAgICAgcmV0dXJuIGdyb3VwLmNoYXR0aW5nVG9bdXNlckluZGV4ID49IDAgPyB1c2VySW5kZXggOiAwXS5hdmF0YXI7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG5cbiAgICBnZXRDaGF0V2luZG93QXZhdGFyU3JjKHBhcnRpY2lwYW50OiBJQ2hhdFBhcnRpY2lwYW50LCBtZXNzYWdlOiBNZXNzYWdlKTogc3RyaW5nIHwgbnVsbFxuICAgIHtcbiAgICAgICAgaWYgKHBhcnRpY2lwYW50LnBhcnRpY2lwYW50VHlwZSA9PSBDaGF0UGFydGljaXBhbnRUeXBlLlVzZXIpXG4gICAgICAgIHtcbiAgICAgICAgICAgIHJldHVybiBwYXJ0aWNpcGFudC5hdmF0YXJTcmM7XG4gICAgICAgIH1cbiAgICAgICAgLy8gZWxzZSBpZiAocGFydGljaXBhbnQucGFydGljaXBhbnRUeXBlID09IENoYXRQYXJ0aWNpcGFudFR5cGUuR3JvdXApXG4gICAgICAgIC8vIHtcbiAgICAgICAgLy8gICAgIGxldCBncm91cCA9IHBhcnRpY2lwYW50IGFzIEdyb3VwO1xuICAgICAgICAvLyAgICAgbGV0IHVzZXJJbmRleCA9IGdyb3VwLmNoYXR0aW5nVG8uZmluZEluZGV4KHggPT4geC5pZCA9PSBtZXNzYWdlLmZyb21JZCk7XG5cbiAgICAgICAgLy8gICAgIHJldHVybiBncm91cC5jaGF0dGluZ1RvW3VzZXJJbmRleCA+PSAwID8gdXNlckluZGV4IDogMF0uYXZhdGFyO1xuICAgICAgICAvLyB9XG5cbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuXG4gICAgaXNVcGxvYWRpbmdGaWxlKHdpbmRvdzogV2luZG93KTogYm9vbGVhblxuICAgIHtcbiAgICAgICAgY29uc3QgZmlsZVVwbG9hZEluc3RhbmNlSWQgPSB0aGlzLmdldFVuaXF1ZUZpbGVVcGxvYWRJbnN0YW5jZUlkKHdpbmRvdyk7XG5cbiAgICAgICAgcmV0dXJuIHRoaXMuZmlsZVVwbG9hZGVyc0luVXNlLmluZGV4T2YoZmlsZVVwbG9hZEluc3RhbmNlSWQpID4gLTE7XG4gICAgfVxuXG4gICAgLy8gR2VuZXJhdGVzIGEgdW5pcXVlIGZpbGUgdXBsb2FkZXIgaWQgZm9yIGVhY2ggcGFydGljaXBhbnRcbiAgICBnZXRVbmlxdWVGaWxlVXBsb2FkSW5zdGFuY2VJZCh3aW5kb3c6IFdpbmRvdyk6IHN0cmluZ1xuICAgIHtcbiAgICAgICAgaWYgKHdpbmRvdyAmJiB3aW5kb3cucGFydGljaXBhbnQpXG4gICAgICAgIHtcbiAgICAgICAgICAgIHJldHVybiBgbmctY2hhdC1maWxlLXVwbG9hZC0ke3dpbmRvdy5wYXJ0aWNpcGFudC5pZH1gO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICByZXR1cm4gJ25nLWNoYXQtZmlsZS11cGxvYWQnO1xuICAgIH1cblxuICAgIHVucmVhZE1lc3NhZ2VzVG90YWwod2luZG93OiBXaW5kb3cpOiBzdHJpbmdcbiAgICB7ICAgICAgICAgICBcbiAgICAgICAgcmV0dXJuIE1lc3NhZ2VDb3VudGVyLnVucmVhZE1lc3NhZ2VzVG90YWwod2luZG93LCB0aGlzLnVzZXJJZCk7XG4gICAgfVxuXG4gICAgLy8gU2Nyb2xscyBhIGNoYXQgd2luZG93IG1lc3NhZ2UgZmxvdyB0byB0aGUgYm90dG9tXG4gICAgc2Nyb2xsQ2hhdFdpbmRvdyh3aW5kb3c6IFdpbmRvdywgZGlyZWN0aW9uOiBTY3JvbGxEaXJlY3Rpb24pOiB2b2lkXG4gICAge1xuICAgICAgICBpZiAoIXdpbmRvdy5pc0NvbGxhcHNlZCl7XG4gICAgICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5jaGF0TWVzc2FnZXMpe1xuICAgICAgICAgICAgICAgICAgICBsZXQgZWxlbWVudCA9IHRoaXMuY2hhdE1lc3NhZ2VzLm5hdGl2ZUVsZW1lbnQ7XG4gICAgICAgICAgICAgICAgICAgIGxldCBwb3NpdGlvbiA9ICggZGlyZWN0aW9uID09PSBTY3JvbGxEaXJlY3Rpb24uVG9wICkgPyAwIDogZWxlbWVudC5zY3JvbGxIZWlnaHQ7XG4gICAgICAgICAgICAgICAgICAgIGVsZW1lbnQuc2Nyb2xsVG9wID0gcG9zaXRpb247XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7IFxuICAgICAgICB9XG4gICAgfVxuXG4gICAgYWN0aXZlT3B0aW9uVHJhY2tlckNoYW5nZShvcHRpb246IElDaGF0T3B0aW9uKTogdm9pZCB7XG4gICAgICAgIHRoaXMub25PcHRpb25UcmlnZ2VyZWQuZW1pdChvcHRpb24pO1xuICAgIH1cblxuICAgIC8vIFRyaWdnZXJzIG5hdGl2ZSBmaWxlIHVwbG9hZCBmb3IgZmlsZSBzZWxlY3Rpb24gZnJvbSB0aGUgdXNlclxuICAgIHRyaWdnZXJOYXRpdmVGaWxlVXBsb2FkKHdpbmRvdzogV2luZG93KTogdm9pZFxuICAgIHtcbiAgICAgICAgaWYgKHdpbmRvdylcbiAgICAgICAge1xuICAgICAgICAgICAgaWYgKHRoaXMubmF0aXZlRmlsZUlucHV0KSB0aGlzLm5hdGl2ZUZpbGVJbnB1dC5uYXRpdmVFbGVtZW50LmNsaWNrKCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBUb2dnbGVzIGEgd2luZG93IGZvY3VzIG9uIHRoZSBmb2N1cy9ibHVyIG9mIGEgJ25ld01lc3NhZ2UnIGlucHV0XG4gICAgdG9nZ2xlV2luZG93Rm9jdXMod2luZG93OiBXaW5kb3cpOiB2b2lkXG4gICAge1xuICAgICAgICB3aW5kb3cuaGFzRm9jdXMgPSAhd2luZG93Lmhhc0ZvY3VzO1xuICAgICAgICBpZih3aW5kb3cuaGFzRm9jdXMpIHtcbiAgICAgICAgICAgIGNvbnN0IHVucmVhZE1lc3NhZ2VzID0gd2luZG93Lm1lc3NhZ2VzXG4gICAgICAgICAgICAgICAgLmZpbHRlcihtZXNzYWdlID0+IG1lc3NhZ2UuZGF0ZVNlZW4gPT0gbnVsbCBcbiAgICAgICAgICAgICAgICAgICAgJiYgKG1lc3NhZ2UudG9JZCA9PSB0aGlzLnVzZXJJZCB8fCB3aW5kb3cucGFydGljaXBhbnQucGFydGljaXBhbnRUeXBlID09PSBDaGF0UGFydGljaXBhbnRUeXBlLkdyb3VwKSk7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGlmICh1bnJlYWRNZXNzYWdlcyAmJiB1bnJlYWRNZXNzYWdlcy5sZW5ndGggPiAwKVxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIHRoaXMub25NZXNzYWdlc1NlZW4uZW1pdCh1bnJlYWRNZXNzYWdlcyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBtYXJrTWVzc2FnZXNBc1JlYWQobWVzc2FnZXM6IE1lc3NhZ2VbXSk6IHZvaWQgXG4gICAge1xuICAgICAgICB0aGlzLm9uTWVzc2FnZXNTZWVuLmVtaXQobWVzc2FnZXMpO1xuICAgIH1cblxuICAgIGZldGNoTWVzc2FnZUhpc3Rvcnkod2luZG93OiBXaW5kb3cpOiB2b2lkIHtcbiAgICAgICAgdGhpcy5vbkxvYWRIaXN0b3J5VHJpZ2dlcmVkLmVtaXQod2luZG93KTtcbiAgICB9XG5cbiAgICAvLyBDbG9zZXMgYSBjaGF0IHdpbmRvdyB2aWEgdGhlIGNsb3NlICdYJyBidXR0b25cbiAgICBvbkNsb3NlQ2hhdFdpbmRvdygpOiB2b2lkIFxuICAgIHtcbiAgICAgICAgdGhpcy5vbkNoYXRXaW5kb3dDbG9zZWQuZW1pdCh7IGNsb3NlZFdpbmRvdzogdGhpcy53aW5kb3csIGNsb3NlZFZpYUVzY2FwZUtleTogZmFsc2UgfSk7XG4gICAgfVxuXG4gICAgLyogIE1vbml0b3JzIHByZXNzZWQga2V5cyBvbiBhIGNoYXQgd2luZG93XG4gICAgICAgIC0gRGlzcGF0Y2hlcyBhIG1lc3NhZ2Ugd2hlbiB0aGUgRU5URVIga2V5IGlzIHByZXNzZWRcbiAgICAgICAgLSBUYWJzIGJldHdlZW4gd2luZG93cyBvbiBUQUIgb3IgU0hJRlQgKyBUQUJcbiAgICAgICAgLSBDbG9zZXMgdGhlIGN1cnJlbnQgZm9jdXNlZCB3aW5kb3cgb24gRVNDXG4gICAgKi9cbiAgIG9uQ2hhdElucHV0VHlwZWQoZXZlbnQ6IGFueSwgd2luZG93OiBXaW5kb3cpOiB2b2lkXG4gICB7XG4gICAgICAgc3dpdGNoIChldmVudC5rZXlDb2RlKVxuICAgICAgIHtcbiAgICAgICAgICAgY2FzZSAxMzpcbiAgICAgICAgICAgICAgIGlmICh3aW5kb3cubmV3TWVzc2FnZSAmJiB3aW5kb3cubmV3TWVzc2FnZS50cmltKCkgIT0gXCJcIilcbiAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICBsZXQgbWVzc2FnZSA9IG5ldyBNZXNzYWdlKCk7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICBtZXNzYWdlLmZyb21JZCA9IHRoaXMudXNlcklkO1xuICAgICAgICAgICAgICAgICAgIG1lc3NhZ2UudG9JZCA9IHdpbmRvdy5wYXJ0aWNpcGFudC5pZDtcbiAgICAgICAgICAgICAgICAgICBtZXNzYWdlLm1lc3NhZ2UgPSB3aW5kb3cubmV3TWVzc2FnZTtcbiAgICAgICAgICAgICAgICAgICBtZXNzYWdlLmRhdGVTZW50ID0gbmV3IERhdGUoKTtcbiAgICAgICBcbiAgICAgICAgICAgICAgICAgICB3aW5kb3cubWVzc2FnZXMucHVzaChtZXNzYWdlKTtcbiAgICAgICBcbiAgICAgICAgICAgICAgICAgICB0aGlzLm9uTWVzc2FnZVNlbnQuZW1pdChtZXNzYWdlKTtcbiAgICAgICBcbiAgICAgICAgICAgICAgICAgICB3aW5kb3cubmV3TWVzc2FnZSA9IFwiXCI7IC8vIFJlc2V0cyB0aGUgbmV3IG1lc3NhZ2UgaW5wdXRcbiAgICAgICBcbiAgICAgICAgICAgICAgICAgICB0aGlzLnNjcm9sbENoYXRXaW5kb3cod2luZG93LCBTY3JvbGxEaXJlY3Rpb24uQm90dG9tKTtcbiAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICBjYXNlIDk6XG4gICAgICAgICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuXG4gICAgICAgICAgICAgICB0aGlzLm9uVGFiVHJpZ2dlcmVkLmVtaXQoeyB0cmlnZ2VyaW5nV2luZG93OiB3aW5kb3csIHNoaWZ0S2V5UHJlc3NlZDogZXZlbnQuc2hpZnRLZXkgfSk7XG5cbiAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICBjYXNlIDI3OlxuICAgICAgICAgICAgICAgdGhpcy5vbkNoYXRXaW5kb3dDbG9zZWQuZW1pdCh7IGNsb3NlZFdpbmRvdzogd2luZG93LCBjbG9zZWRWaWFFc2NhcGVLZXk6IHRydWUgfSk7XG5cbiAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgIH1cbiAgIH1cblxuICAgIC8vIFRvZ2dsZXMgYSBjaGF0IHdpbmRvdyB2aXNpYmlsaXR5IGJldHdlZW4gbWF4aW1pemVkL21pbmltaXplZFxuICAgIG9uQ2hhdFdpbmRvd0NsaWNrZWQod2luZG93OiBXaW5kb3cpOiB2b2lkXG4gICAge1xuICAgICAgICB3aW5kb3cuaXNDb2xsYXBzZWQgPSAhd2luZG93LmlzQ29sbGFwc2VkO1xuICAgICAgICB0aGlzLm9uQ2hhdFdpbmRvd1RvZ2dsZS5lbWl0KHsgY3VycmVudFdpbmRvdzogd2luZG93LCBpc0NvbGxhcHNlZDogd2luZG93LmlzQ29sbGFwc2VkIH0pO1xuICAgICAgICB0aGlzLnNjcm9sbENoYXRXaW5kb3cod2luZG93LCBTY3JvbGxEaXJlY3Rpb24uQm90dG9tKTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGNsZWFySW5Vc2VGaWxlVXBsb2FkZXIoZmlsZVVwbG9hZEluc3RhbmNlSWQ6IHN0cmluZyk6IHZvaWRcbiAgICB7XG4gICAgICAgIGNvbnN0IHVwbG9hZGVySW5zdGFuY2VJZEluZGV4ID0gdGhpcy5maWxlVXBsb2FkZXJzSW5Vc2UuaW5kZXhPZihmaWxlVXBsb2FkSW5zdGFuY2VJZCk7XG5cbiAgICAgICAgaWYgKHVwbG9hZGVySW5zdGFuY2VJZEluZGV4ID4gLTEpIHtcbiAgICAgICAgICAgIHRoaXMuZmlsZVVwbG9hZGVyc0luVXNlLnNwbGljZSh1cGxvYWRlckluc3RhbmNlSWRJbmRleCwgMSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBIYW5kbGVzIGZpbGUgc2VsZWN0aW9uIGFuZCB1cGxvYWRzIHRoZSBzZWxlY3RlZCBmaWxlIHVzaW5nIHRoZSBmaWxlIHVwbG9hZCBhZGFwdGVyXG4gICAgb25GaWxlQ2hvc2VuKHdpbmRvdzogV2luZG93KTogdm9pZCB7XG4gICAgICAgIGNvbnN0IGZpbGVVcGxvYWRJbnN0YW5jZUlkID0gdGhpcy5nZXRVbmlxdWVGaWxlVXBsb2FkSW5zdGFuY2VJZCh3aW5kb3cpO1xuICAgICAgICBjb25zdCB1cGxvYWRFbGVtZW50UmVmID0gdGhpcy5uYXRpdmVGaWxlSW5wdXQ7XG5cbiAgICAgICAgaWYgKHVwbG9hZEVsZW1lbnRSZWYpXG4gICAgICAgIHtcbiAgICAgICAgICAgIGNvbnN0IGZpbGU6IEZpbGUgPSB1cGxvYWRFbGVtZW50UmVmLm5hdGl2ZUVsZW1lbnQuZmlsZXNbMF07XG5cbiAgICAgICAgICAgIHRoaXMuZmlsZVVwbG9hZGVyc0luVXNlLnB1c2goZmlsZVVwbG9hZEluc3RhbmNlSWQpO1xuXG4gICAgICAgICAgICB0aGlzLmZpbGVVcGxvYWRBZGFwdGVyLnVwbG9hZEZpbGUoZmlsZSwgd2luZG93LnBhcnRpY2lwYW50LmlkKVxuICAgICAgICAgICAgICAgIC5zdWJzY3JpYmUoZmlsZU1lc3NhZ2UgPT4ge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmNsZWFySW5Vc2VGaWxlVXBsb2FkZXIoZmlsZVVwbG9hZEluc3RhbmNlSWQpO1xuXG4gICAgICAgICAgICAgICAgICAgIGZpbGVNZXNzYWdlLmZyb21JZCA9IHRoaXMudXNlcklkO1xuXG4gICAgICAgICAgICAgICAgICAgIC8vIFB1c2ggZmlsZSBtZXNzYWdlIHRvIGN1cnJlbnQgdXNlciB3aW5kb3cgICBcbiAgICAgICAgICAgICAgICAgICAgd2luZG93Lm1lc3NhZ2VzLnB1c2goZmlsZU1lc3NhZ2UpO1xuICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5vbk1lc3NhZ2VTZW50LmVtaXQoZmlsZU1lc3NhZ2UpO1xuICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5zY3JvbGxDaGF0V2luZG93KHdpbmRvdywgU2Nyb2xsRGlyZWN0aW9uLkJvdHRvbSk7XG5cbiAgICAgICAgICAgICAgICAgICAgLy8gUmVzZXRzIHRoZSBmaWxlIHVwbG9hZCBlbGVtZW50XG4gICAgICAgICAgICAgICAgICAgIHVwbG9hZEVsZW1lbnRSZWYubmF0aXZlRWxlbWVudC52YWx1ZSA9ICcnO1xuICAgICAgICAgICAgICAgIH0sIChlcnJvcikgPT4ge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmNsZWFySW5Vc2VGaWxlVXBsb2FkZXIoZmlsZVVwbG9hZEluc3RhbmNlSWQpO1xuXG4gICAgICAgICAgICAgICAgICAgIC8vIFJlc2V0cyB0aGUgZmlsZSB1cGxvYWQgZWxlbWVudFxuICAgICAgICAgICAgICAgICAgICB1cGxvYWRFbGVtZW50UmVmLm5hdGl2ZUVsZW1lbnQudmFsdWUgPSAnJztcblxuICAgICAgICAgICAgICAgICAgICAvLyBUT0RPOiBJbnZva2UgYSBmaWxlIHVwbG9hZCBhZGFwdGVyIGVycm9yIGhlcmVcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH1cbn1cbiJdfQ==