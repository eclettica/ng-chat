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
        this.windowClass = '';
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
    //windowOptions: WindowOption | null;
    NgChatWindowComponent.prototype.ngOnInit = function () {
        var _a, _b, _c;
        this.windowClass = (_c = (_b = (_a = this.window) === null || _a === void 0 ? void 0 : _a.participant) === null || _b === void 0 ? void 0 : _b.windowOptions) === null || _c === void 0 ? void 0 : _c.windowClass;
        if (this.windowClass == undefined || this.windowClass == null)
            this.windowClass = '';
    };
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
            template: "<ng-container *ngIf=\"window && window.isCollapsed\" [ngClass]=\"windowClass\">\n\t<div class=\"ng-chat-title secondary-background\">\n\t\t<div class=\"ng-chat-title-visibility-toggle-area\" (click)=\"onChatWindowClicked(window)\">\n\t\t\t<strong title=\"{{window.participant.displayName}}\">\n\t\t\t\t{{window.participant.displayName}}\n\t\t\t</strong>\n\t\t\t<span [ngClass]=\"{'ng-chat-participant-status': true, 'online': window.participant.status == ChatParticipantStatus.Online, 'busy': window.participant.status == ChatParticipantStatus.Busy, 'away': window.participant.status == ChatParticipantStatus.Away, 'offline': window.participant.status == ChatParticipantStatus.Offline}\" title=\"{{chatParticipantStatusDescriptor(window.participant.status, localization)}}\"></span>\n\t\t\t<span *ngIf=\"unreadMessagesTotal(window).length > 0\" class=\"ng-chat-unread-messages-count unread-messages-counter-container primary-text\">{{unreadMessagesTotal(window)}}</span>\n\t\t</div>\n\t\t<a href=\"javascript:void(0);\" class=\"ng-chat-close primary-text\" (click)=\"onCloseChatWindow()\">X</a>\n\t</div>\n</ng-container>\n<ng-container *ngIf=\"window && !window.isCollapsed\" [ngClass]=\"windowClass\">\n\t<div class=\"ng-chat-title secondary-background\">\n\t\t<div class=\"ng-chat-title-visibility-toggle-area\" (click)=\"onChatWindowClicked(window)\">\n\t\t\t<strong title=\"{{window.participant.displayName}}\">\n\t\t\t\t{{window.participant.displayName}}\n\t\t\t</strong>\n\t\t\t<span [ngClass]=\"{'ng-chat-participant-status': true, 'online': window.participant.status == ChatParticipantStatus.Online, 'busy': window.participant.status == ChatParticipantStatus.Busy, 'away': window.participant.status == ChatParticipantStatus.Away, 'offline': window.participant.status == ChatParticipantStatus.Offline}\" title=\"{{chatParticipantStatusDescriptor(window.participant.status, localization)}}\"></span>\n\t\t\t<span *ngIf=\"unreadMessagesTotal(window).length > 0\" class=\"ng-chat-unread-messages-count unread-messages-counter-container primary-text\">{{unreadMessagesTotal(window)}}</span>\n\t\t</div>\n\t\t<ng-chat-window-options *ngIf=\"window?.participant?.windowOptions?.buttons\" [ngClass]=\"{'ng-chat-options-container' : window.participant.windowOptions.buttons.length > 2, 'ng-chat-options-container-reduced': window.participant.windowOptions.buttons.length < 3 }\" [options]=\"window?.participant?.windowOptions\"></ng-chat-window-options>\n\t\t<a href=\"javascript:void(0);\" class=\"ng-chat-close primary-text\" (click)=\"onCloseChatWindow()\">X</a>\n\t\t<ng-chat-options [ngClass]=\"'ng-chat-options-container'\" [options]=\"defaultWindowOptions(window)\" (activeOptionTrackerChange)=\"activeOptionTrackerChange($event)\"></ng-chat-options>\n\t</div>\n\t<div #chatMessages class=\"ng-chat-messages primary-background\">\n\t\t<div *ngIf=\"window.isLoadingHistory\" class=\"ng-chat-loading-wrapper\">\n\t\t\t<div class=\"loader\">Loading history...</div>\n\t\t</div>\n\t\t<div *ngIf=\"hasPagedHistory && window.hasMoreMessages && !window.isLoadingHistory\" class=\"ng-chat-load-history\">\n\t\t\t<a class=\"load-history-action\" (click)=\"fetchMessageHistory(window)\">{{localization.loadMessageHistoryPlaceholder}}</a>\n\t\t</div>\n\n\t\t<div *ngFor=\"let message of window.messages; let i = index\" [ngClass]=\"{'ng-chat-message': true, 'ng-chat-message-received': message.fromId != userId}\">\n\t\t\t<ng-container *ngIf=\"isAvatarVisible(window, message, i)\">\n\t\t\t\t<div *ngIf=\"!getChatWindowAvatar(window.participant, message) && !getChatWindowAvatarSrc(window.participant, message)\" class=\"icon-wrapper\">\n\t\t\t\t\t<i class=\"user-icon\"></i>\n\t\t\t\t</div>\n\t\t\t\t<img *ngIf=\"getChatWindowAvatar(window.participant, message)\" alt=\"\" class=\"avatar\" height=\"30\" width=\"30\" [src]=\"getChatWindowAvatar(window.participant, message) | sanitize\" />\n\t\t\t\t<img *ngIf=\"getChatWindowAvatarSrc(window.participant, message)\" alt=\"\" class=\"avatar avatarSrc\" height=\"30\" width=\"30\" [src]=\"getChatWindowAvatarSrc(window.participant, message) | secure | async\" />\n\t\t\t\t<span *ngIf=\"window.participant.participantType == ChatParticipantType.Group\" class=\"ng-chat-participant-name\">{{window.participant | groupMessageDisplayName:message}}</span>\n\t\t\t</ng-container>\n\t\t\t<ng-container [ngSwitch]=\"message.type\">\n\t\t\t\t<div *ngSwitchCase=\"MessageType.Text\" [ngClass]=\"{'sent-chat-message-container': message.fromId == userId, 'received-chat-message-container': message.fromId != userId}\">\n          <span [innerHtml]=\"message.message | emojify:emojisEnabled | linkfy:linkfyEnabled\"></span>\n\t\t\t\t\t<span *ngIf=\"showMessageDate && message.dateSent\" class=\"message-sent-date\">{{message.dateSent | date:messageDatePipeFormat}}</span>\n\t\t\t\t</div>\n        <div *ngSwitchCase=\"MessageType.Image\" [ngClass]=\"{'sent-chat-message-container': message.fromId == userId, 'received-chat-message-container': message.fromId != userId}\">\n\n          <img src=\"{{message.message}}\" class=\"image-message\" />\n\n\t\t\t\t\t<span *ngIf=\"showMessageDate && message.dateSent\" class=\"message-sent-date\">{{message.dateSent | date:messageDatePipeFormat}}</span>\n\t\t\t\t</div>\n\t\t\t\t<div *ngSwitchCase=\"MessageType.File\" [ngClass]=\"{'file-message-container': true, 'received': message.fromId != userId}\">\n\t\t\t\t\t<div class=\"file-message-icon-container\">\n\t\t\t\t\t\t<i class=\"paperclip-icon\"></i>\n\t\t\t\t\t</div>\n\t\t\t\t\t<a class=\"file-details\" [attr.href]=\"message.downloadUrl\" target=\"_blank\" rel=\"noopener noreferrer\" (click)=\"this.markMessagesAsRead([message])\" download>\n\t\t\t\t\t\t<span class=\"file-message-title\" [attr.title]=\"message.message\">{{message.message}}</span>\n\t\t\t\t\t\t<span *ngIf=\"message.fileSizeInBytes\"  class=\"file-message-size\">{{message.fileSizeInBytes}} Bytes</span>\n\t\t\t\t\t</a>\n\t\t\t\t</div>\n\t\t\t</ng-container>\n\t\t</div>\n\t</div>\n\n\t<div class=\"ng-chat-footer primary-outline-color primary-background\">\n\t\t<input #chatWindowInput\n\t\t\ttype=\"text\"\n\t\t\t[ngModel]=\"window.newMessage | emojify:emojisEnabled\"\n\t\t\t(ngModelChange)=\"window.newMessage=$event\"\n\t\t\t[placeholder]=\"localization.messagePlaceholder\"\n\t\t\t[ngClass]=\"{'chat-window-input': true, 'has-side-action': fileUploadAdapter}\"\n\t\t\t(keydown)=\"onChatInputTyped($event, window)\"\n\t\t\t(blur)=\"toggleWindowFocus(window)\"\n\t\t\t(focus)=\"toggleWindowFocus(window)\"/>\n\n\t\t<!-- File Upload -->\n\t\t<ng-container *ngIf=\"fileUploadAdapter\">\n\t\t\t<a *ngIf=\"!isUploadingFile(window)\" class=\"btn-add-file\" (click)=\"triggerNativeFileUpload(window)\">\n\t\t\t\t<i class=\"upload-icon\"></i>\n\t\t\t</a>\n\t\t\t<input\n\t\t\t\ttype=\"file\"\n\t\t\t\t#nativeFileInput\n\t\t\t\tstyle=\"display: none;\"\n\t\t\t\t[attr.id]=\"getUniqueFileUploadInstanceId(window)\"\n\t\t\t\t(change)=\"onFileChosen(window)\" />\n\t\t\t<div *ngIf=\"isUploadingFile(window)\" class=\"loader\"></div>\n\t\t</ng-container>\n\t</div>\n</ng-container>\n",
            encapsulation: ViewEncapsulation.None,
            styles: [".ng-chat-window{right:260px;height:360px;z-index:999;bottom:0;width:300px;position:fixed;border-width:1px;border-style:solid;border-bottom:0;box-shadow:0 4px 8px rgba(0,0,0,.25)}.ng-chat-window-collapsed{height:30px!important}.ng-chat-window .ng-chat-footer{box-sizing:border-box;padding:0;display:block;height:calc(10%);width:100%;border:none;border-top:1px solid transparent;border-color:inherit}.ng-chat-window .ng-chat-footer>input{font-size:.8em;box-sizing:border-box;padding:0 5px;display:block;height:100%;width:100%;border:none}.ng-chat-window .ng-chat-footer>input.has-side-action{width:calc(100% - 30px)}.ng-chat-window .ng-chat-footer .btn-add-file{position:absolute;right:5px;bottom:7px;height:20px;width:20px;cursor:pointer}.ng-chat-window .ng-chat-footer .loader{position:absolute;right:14px;bottom:8px}.ng-chat-window .ng-chat-load-history{height:30px;text-align:center;font-size:.8em}.ng-chat-window .ng-chat-load-history>a{border-radius:15px;cursor:pointer;padding:5px 10px}.ng-chat-window .ng-chat-messages{padding:10px;width:100%;height:calc(90% - 30px);box-sizing:border-box;position:relative;overflow:auto}.ng-chat-window .ng-chat-messages .ng-chat-message{clear:both}.ng-chat-window .ng-chat-messages .ng-chat-message>.icon-wrapper,.ng-chat-window .ng-chat-messages .ng-chat-message>img.avatar{position:absolute;left:10px;border-radius:25px}.ng-chat-window .ng-chat-messages .ng-chat-message .ng-chat-participant-name{display:inline-block;margin-left:40px;padding-bottom:5px;font-weight:700;font-size:.8em;text-overflow:ellipsis;max-width:180px}.ng-chat-window .ng-chat-messages .ng-chat-message>.icon-wrapper{background-color:#bababa;overflow:hidden;width:30px;height:30px;padding:0}.ng-chat-window .ng-chat-messages .ng-chat-message>.icon-wrapper>i{color:#fff;transform:scale(.7)}.ng-chat-window .ng-chat-messages .ng-chat-message .message-sent-date{font-size:.8em;display:block;text-align:right;margin-top:5px}.ng-chat-window .ng-chat-messages .ng-chat-message>div{float:right;width:182px;padding:10px;border-radius:5px;margin-top:0;margin-bottom:5px;font-size:.9em;word-wrap:break-word}.ng-chat-window .ng-chat-messages .ng-chat-message.ng-chat-message-received>div.received-chat-message-container{float:left;margin-left:40px;padding-top:7px;padding-bottom:7px;border-style:solid;border-width:3px;margin-top:0;margin-bottom:5px}.ng-chat-window .ng-chat-messages .ng-chat-message .file-message-container{float:right;width:202px;border-style:solid;border-width:3px;border-radius:5px;overflow:hidden;margin-bottom:5px;display:block;text-decoration:none;font-size:.9em;padding:0;box-sizing:border-box}.ng-chat-window .ng-chat-messages .ng-chat-message .file-message-container.received{float:left;margin-left:40px;width:208px}.ng-chat-window .ng-chat-messages .ng-chat-message .file-message-container>.file-message-icon-container{width:20px;height:35px;padding:10px 5px;float:left}.ng-chat-window .ng-chat-messages .ng-chat-message .file-message-container>.file-message-icon-container i{margin-top:8px}.ng-chat-window .ng-chat-messages .ng-chat-message .file-message-container>.file-details{float:left;padding:10px;width:calc(100% - 60px);color:currentColor;text-decoration:none}.ng-chat-window .ng-chat-messages .ng-chat-message .file-message-container>.file-details:hover{text-decoration:underline}.ng-chat-window .ng-chat-messages .ng-chat-message .file-message-container>.file-details span{display:block;width:100%;text-overflow:ellipsis;overflow:hidden;white-space:nowrap}.ng-chat-window .ng-chat-messages .ng-chat-message .file-message-container>.file-details .file-message-title{font-weight:700}.ng-chat-window .ng-chat-messages .ng-chat-message .file-message-container>.file-details .file-message-size{font-size:.8em;margin-top:5px}.ng-chat-window .image-message{width:100%;height:auto}@media only screen and (max-width:581px){.ng-chat-window{position:initial}}"]
        })
    ], NgChatWindowComponent);
    return NgChatWindowComponent;
}());
export { NgChatWindowComponent };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmctY2hhdC13aW5kb3cuY29tcG9uZW50LmpzIiwic291cmNlUm9vdCI6Im5nOi8vbmctY2hhdC8iLCJzb3VyY2VzIjpbIm5nLWNoYXQvY29tcG9uZW50cy9uZy1jaGF0LXdpbmRvdy9uZy1jaGF0LXdpbmRvdy5jb21wb25lbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBLE9BQU8sRUFBRSxTQUFTLEVBQUUsS0FBSyxFQUFFLE1BQU0sRUFBRSxZQUFZLEVBQUUsaUJBQWlCLEVBQUUsU0FBUyxFQUFzQixNQUFNLGVBQWUsQ0FBQztBQUV6SCxPQUFPLEVBQUUsT0FBTyxFQUFFLE1BQU0sb0JBQW9CLENBQUM7QUFDN0MsT0FBTyxFQUFFLFdBQVcsRUFBRSxNQUFNLDhCQUE4QixDQUFDO0FBRTNELE9BQU8sRUFBRSxxQkFBcUIsRUFBRSxNQUFNLHlDQUF5QyxDQUFDO0FBQ2hGLE9BQU8sRUFBRSxlQUFlLEVBQUUsTUFBTSxrQ0FBa0MsQ0FBQztBQU1uRSxPQUFPLEVBQUUsbUJBQW1CLEVBQUUsTUFBTSx1Q0FBdUMsQ0FBQztBQUU1RSxPQUFPLEVBQUUsY0FBYyxFQUFFLE1BQU0sNEJBQTRCLENBQUM7QUFDNUQsT0FBTyxFQUFFLCtCQUErQixFQUFFLE1BQU0sK0NBQStDLENBQUM7QUFRaEc7SUFFSTtRQURBLGdCQUFXLEdBQXFCLEVBQUUsQ0FBQztRQTZCNUIsa0JBQWEsR0FBWSxJQUFJLENBQUM7UUFHOUIsa0JBQWEsR0FBWSxJQUFJLENBQUM7UUFHOUIsb0JBQWUsR0FBWSxJQUFJLENBQUM7UUFHaEMsMEJBQXFCLEdBQVcsT0FBTyxDQUFDO1FBR3hDLG9CQUFlLEdBQVksSUFBSSxDQUFDO1FBR2hDLHVCQUFrQixHQUF1RSxJQUFJLFlBQVksRUFBRSxDQUFDO1FBRzVHLHVCQUFrQixHQUFpRSxJQUFJLFlBQVksRUFBRSxDQUFDO1FBR3RHLG1CQUFjLEdBQTRCLElBQUksWUFBWSxFQUFFLENBQUM7UUFHN0Qsa0JBQWEsR0FBMEIsSUFBSSxZQUFZLEVB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QUU7eURBQ2M7SUFHdEI7UUFEQyxLQUFLLEVBQUU7eURBQ1c7SUFHbkI7UUFEQyxLQUFLLEVBQUU7K0RBQzBCO0lBR2xDO1FBREMsS0FBSyxFQUFFOzhEQUNvQjtJQUc1QjtRQURDLEtBQUssRUFBRTtnRUFDNkI7SUFHckM7UUFEQyxLQUFLLEVBQUU7Z0VBQzZCO0lBR3JDO1FBREMsS0FBSyxFQUFFO2tFQUMrQjtJQUd2QztRQURDLEtBQUssRUFBRTt3RUFDdUM7SUFHL0M7UUFEQyxLQUFLLEVBQUU7a0VBQytCO0lBR3ZDO1FBREMsTUFBTSxFQUFFO3FFQUMwRztJQUduSDtRQURDLE1BQU0sRUFBRTtxRUFDb0c7SUFHN0c7UUFEQyxNQUFNLEVBQUU7aUVBQzJEO0lBR3BFO1FBREMsTUFBTSxFQUFFO2dFQUN3RDtJQUdqRTtRQURDLE1BQU0sRUFBRTtpRUFDd0c7SUFHakg7UUFEQyxNQUFNLEVBQUU7b0VBQ2dFO0lBR3pFO1FBREMsTUFBTSxFQUFFO3lFQUNnRTtJQUU5QztRQUExQixTQUFTLENBQUMsY0FBYyxDQUFDOytEQUFtQjtJQUNmO1FBQTdCLFNBQVMsQ0FBQyxpQkFBaUIsQ0FBQztrRUFBNkI7SUFDNUI7UUFBN0IsU0FBUyxDQUFDLGlCQUFpQixDQUFDO2tFQUFzQjtJQW5FMUMscUJBQXFCO1FBTmpDLFNBQVMsQ0FBQztZQUNQLFFBQVEsRUFBRSxnQkFBZ0I7WUFDMUIsKzZOQUE4QztZQUU5QyxhQUFhLEVBQUUsaUJBQWlCLENBQUMsSUFBSTs7U0FDeEMsQ0FBQztPQUNXLHFCQUFxQixDQWtVakM7SUFBRCw0QkFBQztDQUFBLEFBbFVELElBa1VDO1NBbFVZLHFCQUFxQiIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IENvbXBvbmVudCwgSW5wdXQsIE91dHB1dCwgRXZlbnRFbWl0dGVyLCBWaWV3RW5jYXBzdWxhdGlvbiwgVmlld0NoaWxkLCBFbGVtZW50UmVmLCBPbkluaXQgfSBmcm9tICdAYW5ndWxhci9jb3JlJztcblxuaW1wb3J0IHsgTWVzc2FnZSB9IGZyb20gXCIuLi8uLi9jb3JlL21lc3NhZ2VcIjtcbmltcG9ydCB7IE1lc3NhZ2VUeXBlIH0gZnJvbSBcIi4uLy4uL2NvcmUvbWVzc2FnZS10eXBlLmVudW1cIjtcbmltcG9ydCB7IFdpbmRvdyB9IGZyb20gXCIuLi8uLi9jb3JlL3dpbmRvd1wiO1xuaW1wb3J0IHsgQ2hhdFBhcnRpY2lwYW50U3RhdHVzIH0gZnJvbSBcIi4uLy4uL2NvcmUvY2hhdC1wYXJ0aWNpcGFudC1zdGF0dXMuZW51bVwiO1xuaW1wb3J0IHsgU2Nyb2xsRGlyZWN0aW9uIH0gZnJvbSBcIi4uLy4uL2NvcmUvc2Nyb2xsLWRpcmVjdGlvbi5lbnVtXCI7XG5pbXBvcnQgeyBMb2NhbGl6YXRpb24gfSBmcm9tICcuLi8uLi9jb3JlL2xvY2FsaXphdGlvbic7XG5pbXBvcnQgeyBJRmlsZVVwbG9hZEFkYXB0ZXIgfSBmcm9tICcuLi8uLi9jb3JlL2ZpbGUtdXBsb2FkLWFkYXB0ZXInO1xuaW1wb3J0IHsgSUNoYXRPcHRpb24gfSBmcm9tICcuLi8uLi9jb3JlL2NoYXQtb3B0aW9uJztcbmltcG9ydCB7IFdpbmRvd09wdGlvbiB9IGZyb20gJy4uLy4uL2NvcmUvd2luZG93LW9wdGlvbic7XG5pbXBvcnQgeyBHcm91cCB9IGZyb20gXCIuLi8uLi9jb3JlL2dyb3VwXCI7XG5pbXBvcnQgeyBDaGF0UGFydGljaXBhbnRUeXBlIH0gZnJvbSBcIi4uLy4uL2NvcmUvY2hhdC1wYXJ0aWNpcGFudC10eXBlLmVudW1cIjtcbmltcG9ydCB7IElDaGF0UGFydGljaXBhbnQgfSBmcm9tIFwiLi4vLi4vY29yZS9jaGF0LXBhcnRpY2lwYW50XCI7XG5pbXBvcnQgeyBNZXNzYWdlQ291bnRlciB9IGZyb20gXCIuLi8uLi9jb3JlL21lc3NhZ2UtY291bnRlclwiO1xuaW1wb3J0IHsgY2hhdFBhcnRpY2lwYW50U3RhdHVzRGVzY3JpcHRvciB9IGZyb20gJy4uLy4uL2NvcmUvY2hhdC1wYXJ0aWNpcGFudC1zdGF0dXMtZGVzY3JpcHRvcic7XG5cbkBDb21wb25lbnQoe1xuICAgIHNlbGVjdG9yOiAnbmctY2hhdC13aW5kb3cnLFxuICAgIHRlbXBsYXRlVXJsOiAnLi9uZy1jaGF0LXdpbmRvdy5jb21wb25lbnQuaHRtbCcsXG4gICAgc3R5bGVVcmxzOiBbJy4vbmctY2hhdC13aW5kb3cuY29tcG9uZW50LmNzcyddLFxuICAgIGVuY2Fwc3VsYXRpb246IFZpZXdFbmNhcHN1bGF0aW9uLk5vbmVcbn0pXG5leHBvcnQgY2xhc3MgTmdDaGF0V2luZG93Q29tcG9uZW50IGltcGxlbWVudHMgT25Jbml0IHtcbiAgICB3aW5kb3dDbGFzczogc3RyaW5nfHVuZGVmaW5lZCA9ICcnO1xuICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICAvL3RoaXMud2luZG93T3B0aW9ucyA9IHRoaXMud2luZG93LnBhcnRpY2lwYW50LndpbmRvd09wdGlvbnM7XG4gICAgIH1cblxuICAgICAvL3dpbmRvd09wdGlvbnM6IFdpbmRvd09wdGlvbiB8IG51bGw7XG5cbiAgICAgbmdPbkluaXQoKSB7XG4gICAgICAgICB0aGlzLndpbmRvd0NsYXNzID0gIHRoaXMud2luZG93Py5wYXJ0aWNpcGFudD8ud2luZG93T3B0aW9ucz8ud2luZG93Q2xhc3M7XG4gICAgICAgICBpZih0aGlzLndpbmRvd0NsYXNzID09IHVuZGVmaW5lZCB8fCB0aGlzLndpbmRvd0NsYXNzID09IG51bGwpXG4gICAgICAgICAgICB0aGlzLndpbmRvd0NsYXNzID0nJztcbiAgICAgfVxuXG4gICAgQElucHV0KClcbiAgICBwdWJsaWMgZmlsZVVwbG9hZEFkYXB0ZXI6IElGaWxlVXBsb2FkQWRhcHRlcjtcblxuICAgIEBJbnB1dCgpXG4gICAgcHVibGljIHdpbmRvdzogV2luZG93O1xuXG4gICAgQElucHV0KClcbiAgICBwdWJsaWMgdXNlcklkOiBhbnk7XG5cbiAgICBASW5wdXQoKVxuICAgIHB1YmxpYyBsb2NhbGl6YXRpb246IExvY2FsaXphdGlvbjtcblxuICAgIEBJbnB1dCgpXG4gICAgcHVibGljIHNob3dPcHRpb25zOiBib29sZWFuO1xuXG4gICAgQElucHV0KCkgICAgXG4gICAgcHVibGljIGVtb2ppc0VuYWJsZWQ6IGJvb2xlYW4gPSB0cnVlO1xuXG4gICAgQElucHV0KCkgICAgXG4gICAgcHVibGljIGxpbmtmeUVuYWJsZWQ6IGJvb2xlYW4gPSB0cnVlO1xuXG4gICAgQElucHV0KClcbiAgICBwdWJsaWMgc2hvd01lc3NhZ2VEYXRlOiBib29sZWFuID0gdHJ1ZTtcblxuICAgIEBJbnB1dCgpXG4gICAgcHVibGljIG1lc3NhZ2VEYXRlUGlwZUZvcm1hdDogc3RyaW5nID0gXCJzaG9ydFwiO1xuXG4gICAgQElucHV0KClcbiAgICBwdWJsaWMgaGFzUGFnZWRIaXN0b3J5OiBib29sZWFuID0gdHJ1ZTtcblxuICAgIEBPdXRwdXQoKVxuICAgIHB1YmxpYyBvbkNoYXRXaW5kb3dDbG9zZWQ6IEV2ZW50RW1pdHRlcjx7IGNsb3NlZFdpbmRvdzogV2luZG93LCBjbG9zZWRWaWFFc2NhcGVLZXk6IGJvb2xlYW59PiA9IG5ldyBFdmVudEVtaXR0ZXIoKTtcblxuICAgIEBPdXRwdXQoKVxuICAgIHB1YmxpYyBvbkNoYXRXaW5kb3dUb2dnbGU6IEV2ZW50RW1pdHRlcjx7IGN1cnJlbnRXaW5kb3c6IFdpbmRvdywgaXNDb2xsYXBzZWQ6IGJvb2xlYW59PiA9IG5ldyBFdmVudEVtaXR0ZXIoKTtcblxuICAgIEBPdXRwdXQoKVxuICAgIHB1YmxpYyBvbk1lc3NhZ2VzU2VlbjogRXZlbnRFbWl0dGVyPE1lc3NhZ2VbXT4gPSBuZXcgRXZlbnRFbWl0dGVyKCk7XG5cbiAgICBAT3V0cHV0KClcbiAgICBwdWJsaWMgb25NZXNzYWdlU2VudDogRXZlbnRFbWl0dGVyPE1lc3NhZ2U+ID0gbmV3IEV2ZW50RW1pdHRlcigpO1xuXG4gICAgQE91dHB1dCgpXG4gICAgcHVibGljIG9uVGFiVHJpZ2dlcmVkOiBFdmVudEVtaXR0ZXI8eyB0cmlnZ2VyaW5nV2luZG93OiBXaW5kb3csIHNoaWZ0S2V5UHJlc3NlZDogYm9vbGVhbiB9PiA9IG5ldyBFdmVudEVtaXR0ZXIoKTtcblxuICAgIEBPdXRwdXQoKVxuICAgIHB1YmxpYyBvbk9wdGlvblRyaWdnZXJlZDogRXZlbnRFbWl0dGVyPElDaGF0T3B0aW9uPiA9IG5ldyBFdmVudEVtaXR0ZXIoKTtcblxuICAgIEBPdXRwdXQoKVxuICAgIHB1YmxpYyBvbkxvYWRIaXN0b3J5VHJpZ2dlcmVkOiBFdmVudEVtaXR0ZXI8V2luZG93PiA9IG5ldyBFdmVudEVtaXR0ZXIoKTtcblxuICAgIEBWaWV3Q2hpbGQoJ2NoYXRNZXNzYWdlcycpIGNoYXRNZXNzYWdlczogYW55O1xuICAgIEBWaWV3Q2hpbGQoJ25hdGl2ZUZpbGVJbnB1dCcpIG5hdGl2ZUZpbGVJbnB1dDogRWxlbWVudFJlZjtcbiAgICBAVmlld0NoaWxkKCdjaGF0V2luZG93SW5wdXQnKSBjaGF0V2luZG93SW5wdXQ6IGFueTtcblxuICAgIC8vIEZpbGUgdXBsb2FkIHN0YXRlXG4gICAgcHVibGljIGZpbGVVcGxvYWRlcnNJblVzZTogc3RyaW5nW10gPSBbXTsgLy8gSWQgYnVja2V0IG9mIHVwbG9hZGVycyBpbiB1c2VcblxuICAgIC8vIEV4cG9zZXMgZW51bXMgYW5kIGZ1bmN0aW9ucyBmb3IgdGhlIG5nLXRlbXBsYXRlXG4gICAgcHVibGljIENoYXRQYXJ0aWNpcGFudFR5cGUgPSBDaGF0UGFydGljaXBhbnRUeXBlO1xuICAgIHB1YmxpYyBDaGF0UGFydGljaXBhbnRTdGF0dXMgPSBDaGF0UGFydGljaXBhbnRTdGF0dXM7XG4gICAgcHVibGljIE1lc3NhZ2VUeXBlID0gTWVzc2FnZVR5cGU7XG4gICAgcHVibGljIGNoYXRQYXJ0aWNpcGFudFN0YXR1c0Rlc2NyaXB0b3IgPSBjaGF0UGFydGljaXBhbnRTdGF0dXNEZXNjcmlwdG9yO1xuXG4gICAgZGVmYXVsdFdpbmRvd09wdGlvbnMoY3VycmVudFdpbmRvdzogV2luZG93KTogSUNoYXRPcHRpb25bXVxuICAgIHtcbiAgICAgICAgaWYgKHRoaXMuc2hvd09wdGlvbnMgJiYgY3VycmVudFdpbmRvdy5wYXJ0aWNpcGFudC5wYXJ0aWNpcGFudFR5cGUgPT0gQ2hhdFBhcnRpY2lwYW50VHlwZS5Vc2VyKVxuICAgICAgICB7XG4gICAgICAgICAgICByZXR1cm4gW3tcbiAgICAgICAgICAgICAgICBpc0FjdGl2ZTogZmFsc2UsXG4gICAgICAgICAgICAgICAgY2hhdHRpbmdUbzogY3VycmVudFdpbmRvdyxcbiAgICAgICAgICAgICAgICB2YWxpZGF0ZUNvbnRleHQ6IChwYXJ0aWNpcGFudDogSUNoYXRQYXJ0aWNpcGFudCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gcGFydGljaXBhbnQucGFydGljaXBhbnRUeXBlID09IENoYXRQYXJ0aWNpcGFudFR5cGUuVXNlcjtcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIGRpc3BsYXlMYWJlbDogJ0FkZCBQZW9wbGUnIC8vIFRPRE86IExvY2FsaXplIHRoaXNcbiAgICAgICAgICAgIH1dO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIFtdO1xuICAgIH1cblxuICAgIC8vIEFzc2VydHMgaWYgYSB1c2VyIGF2YXRhciBpcyB2aXNpYmxlIGluIGEgY2hhdCBjbHVzdGVyXG4gICAgaXNBdmF0YXJWaXNpYmxlKHdpbmRvdzogV2luZG93LCBtZXNzYWdlOiBNZXNzYWdlLCBpbmRleDogbnVtYmVyKTogYm9vbGVhblxuICAgIHtcbiAgICAgICAgaWYgKG1lc3NhZ2UuZnJvbUlkICE9IHRoaXMudXNlcklkKXtcbiAgICAgICAgICAgIGlmIChpbmRleCA9PSAwKXtcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTsgLy8gRmlyc3QgbWVzc2FnZSwgZ29vZCB0byBzaG93IHRoZSB0aHVtYm5haWxcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2V7XG4gICAgICAgICAgICAgICAgLy8gQ2hlY2sgaWYgdGhlIHByZXZpb3VzIG1lc3NhZ2UgYmVsb25ncyB0byB0aGUgc2FtZSB1c2VyLCBpZiBpdCBiZWxvbmdzIHRoZXJlIGlzIG5vIG5lZWQgdG8gc2hvdyB0aGUgYXZhdGFyIGFnYWluIHRvIGZvcm0gdGhlIG1lc3NhZ2UgY2x1c3RlclxuICAgICAgICAgICAgICAgIGlmICh3aW5kb3cubWVzc2FnZXNbaW5kZXggLSAxXS5mcm9tSWQgIT0gbWVzc2FnZS5mcm9tSWQpe1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgZ2V0Q2hhdFdpbmRvd0F2YXRhcihwYXJ0aWNpcGFudDogSUNoYXRQYXJ0aWNpcGFudCwgbWVzc2FnZTogTWVzc2FnZSk6IHN0cmluZyB8IG51bGxcbiAgICB7XG4gICAgICAgIGlmIChwYXJ0aWNpcGFudC5wYXJ0aWNpcGFudFR5cGUgPT0gQ2hhdFBhcnRpY2lwYW50VHlwZS5Vc2VyKVxuICAgICAgICB7XG4gICAgICAgICAgICByZXR1cm4gcGFydGljaXBhbnQuYXZhdGFyO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKHBhcnRpY2lwYW50LnBhcnRpY2lwYW50VHlwZSA9PSBDaGF0UGFydGljaXBhbnRUeXBlLkdyb3VwKVxuICAgICAgICB7XG4gICAgICAgICAgICBsZXQgZ3JvdXAgPSBwYXJ0aWNpcGFudCBhcyBHcm91cDtcbiAgICAgICAgICAgIGxldCB1c2VySW5kZXggPSBncm91cC5jaGF0dGluZ1RvLmZpbmRJbmRleCh4ID0+IHguaWQgPT0gbWVzc2FnZS5mcm9tSWQpO1xuXG4gICAgICAgICAgICByZXR1cm4gZ3JvdXAuY2hhdHRpbmdUb1t1c2VySW5kZXggPj0gMCA/IHVzZXJJbmRleCA6IDBdLmF2YXRhcjtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBudWxsO1xuICAgIH1cblxuICAgIGdldENoYXRXaW5kb3dBdmF0YXJTcmMocGFydGljaXBhbnQ6IElDaGF0UGFydGljaXBhbnQsIG1lc3NhZ2U6IE1lc3NhZ2UpOiBzdHJpbmcgfCBudWxsXG4gICAge1xuICAgICAgICBpZiAocGFydGljaXBhbnQucGFydGljaXBhbnRUeXBlID09IENoYXRQYXJ0aWNpcGFudFR5cGUuVXNlcilcbiAgICAgICAge1xuICAgICAgICAgICAgcmV0dXJuIHBhcnRpY2lwYW50LmF2YXRhclNyYztcbiAgICAgICAgfVxuICAgICAgICAvLyBlbHNlIGlmIChwYXJ0aWNpcGFudC5wYXJ0aWNpcGFudFR5cGUgPT0gQ2hhdFBhcnRpY2lwYW50VHlwZS5Hcm91cClcbiAgICAgICAgLy8ge1xuICAgICAgICAvLyAgICAgbGV0IGdyb3VwID0gcGFydGljaXBhbnQgYXMgR3JvdXA7XG4gICAgICAgIC8vICAgICBsZXQgdXNlckluZGV4ID0gZ3JvdXAuY2hhdHRpbmdUby5maW5kSW5kZXgoeCA9PiB4LmlkID09IG1lc3NhZ2UuZnJvbUlkKTtcblxuICAgICAgICAvLyAgICAgcmV0dXJuIGdyb3VwLmNoYXR0aW5nVG9bdXNlckluZGV4ID49IDAgPyB1c2VySW5kZXggOiAwXS5hdmF0YXI7XG4gICAgICAgIC8vIH1cblxuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG5cbiAgICBpc1VwbG9hZGluZ0ZpbGUod2luZG93OiBXaW5kb3cpOiBib29sZWFuXG4gICAge1xuICAgICAgICBjb25zdCBmaWxlVXBsb2FkSW5zdGFuY2VJZCA9IHRoaXMuZ2V0VW5pcXVlRmlsZVVwbG9hZEluc3RhbmNlSWQod2luZG93KTtcblxuICAgICAgICByZXR1cm4gdGhpcy5maWxlVXBsb2FkZXJzSW5Vc2UuaW5kZXhPZihmaWxlVXBsb2FkSW5zdGFuY2VJZCkgPiAtMTtcbiAgICB9XG5cbiAgICAvLyBHZW5lcmF0ZXMgYSB1bmlxdWUgZmlsZSB1cGxvYWRlciBpZCBmb3IgZWFjaCBwYXJ0aWNpcGFudFxuICAgIGdldFVuaXF1ZUZpbGVVcGxvYWRJbnN0YW5jZUlkKHdpbmRvdzogV2luZG93KTogc3RyaW5nXG4gICAge1xuICAgICAgICBpZiAod2luZG93ICYmIHdpbmRvdy5wYXJ0aWNpcGFudClcbiAgICAgICAge1xuICAgICAgICAgICAgcmV0dXJuIGBuZy1jaGF0LWZpbGUtdXBsb2FkLSR7d2luZG93LnBhcnRpY2lwYW50LmlkfWA7XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIHJldHVybiAnbmctY2hhdC1maWxlLXVwbG9hZCc7XG4gICAgfVxuXG4gICAgdW5yZWFkTWVzc2FnZXNUb3RhbCh3aW5kb3c6IFdpbmRvdyk6IHN0cmluZ1xuICAgIHsgICAgICAgICAgIFxuICAgICAgICByZXR1cm4gTWVzc2FnZUNvdW50ZXIudW5yZWFkTWVzc2FnZXNUb3RhbCh3aW5kb3csIHRoaXMudXNlcklkKTtcbiAgICB9XG5cbiAgICAvLyBTY3JvbGxzIGEgY2hhdCB3aW5kb3cgbWVzc2FnZSBmbG93IHRvIHRoZSBib3R0b21cbiAgICBzY3JvbGxDaGF0V2luZG93KHdpbmRvdzogV2luZG93LCBkaXJlY3Rpb246IFNjcm9sbERpcmVjdGlvbik6IHZvaWRcbiAgICB7XG4gICAgICAgIGlmICghd2luZG93LmlzQ29sbGFwc2VkKXtcbiAgICAgICAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLmNoYXRNZXNzYWdlcyl7XG4gICAgICAgICAgICAgICAgICAgIGxldCBlbGVtZW50ID0gdGhpcy5jaGF0TWVzc2FnZXMubmF0aXZlRWxlbWVudDtcbiAgICAgICAgICAgICAgICAgICAgbGV0IHBvc2l0aW9uID0gKCBkaXJlY3Rpb24gPT09IFNjcm9sbERpcmVjdGlvbi5Ub3AgKSA/IDAgOiBlbGVtZW50LnNjcm9sbEhlaWdodDtcbiAgICAgICAgICAgICAgICAgICAgZWxlbWVudC5zY3JvbGxUb3AgPSBwb3NpdGlvbjtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTsgXG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBhY3RpdmVPcHRpb25UcmFja2VyQ2hhbmdlKG9wdGlvbjogSUNoYXRPcHRpb24pOiB2b2lkIHtcbiAgICAgICAgdGhpcy5vbk9wdGlvblRyaWdnZXJlZC5lbWl0KG9wdGlvbik7XG4gICAgfVxuXG4gICAgLy8gVHJpZ2dlcnMgbmF0aXZlIGZpbGUgdXBsb2FkIGZvciBmaWxlIHNlbGVjdGlvbiBmcm9tIHRoZSB1c2VyXG4gICAgdHJpZ2dlck5hdGl2ZUZpbGVVcGxvYWQod2luZG93OiBXaW5kb3cpOiB2b2lkXG4gICAge1xuICAgICAgICBpZiAod2luZG93KVxuICAgICAgICB7XG4gICAgICAgICAgICBpZiAodGhpcy5uYXRpdmVGaWxlSW5wdXQpIHRoaXMubmF0aXZlRmlsZUlucHV0Lm5hdGl2ZUVsZW1lbnQuY2xpY2soKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8vIFRvZ2dsZXMgYSB3aW5kb3cgZm9jdXMgb24gdGhlIGZvY3VzL2JsdXIgb2YgYSAnbmV3TWVzc2FnZScgaW5wdXRcbiAgICB0b2dnbGVXaW5kb3dGb2N1cyh3aW5kb3c6IFdpbmRvdyk6IHZvaWRcbiAgICB7XG4gICAgICAgIHdpbmRvdy5oYXNGb2N1cyA9ICF3aW5kb3cuaGFzRm9jdXM7XG4gICAgICAgIGlmKHdpbmRvdy5oYXNGb2N1cykge1xuICAgICAgICAgICAgY29uc3QgdW5yZWFkTWVzc2FnZXMgPSB3aW5kb3cubWVzc2FnZXNcbiAgICAgICAgICAgICAgICAuZmlsdGVyKG1lc3NhZ2UgPT4gbWVzc2FnZS5kYXRlU2VlbiA9PSBudWxsIFxuICAgICAgICAgICAgICAgICAgICAmJiAobWVzc2FnZS50b0lkID09IHRoaXMudXNlcklkIHx8IHdpbmRvdy5wYXJ0aWNpcGFudC5wYXJ0aWNpcGFudFR5cGUgPT09IENoYXRQYXJ0aWNpcGFudFR5cGUuR3JvdXApKTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgaWYgKHVucmVhZE1lc3NhZ2VzICYmIHVucmVhZE1lc3NhZ2VzLmxlbmd0aCA+IDApXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgdGhpcy5vbk1lc3NhZ2VzU2Vlbi5lbWl0KHVucmVhZE1lc3NhZ2VzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIG1hcmtNZXNzYWdlc0FzUmVhZChtZXNzYWdlczogTWVzc2FnZVtdKTogdm9pZCBcbiAgICB7XG4gICAgICAgIHRoaXMub25NZXNzYWdlc1NlZW4uZW1pdChtZXNzYWdlcyk7XG4gICAgfVxuXG4gICAgZmV0Y2hNZXNzYWdlSGlzdG9yeSh3aW5kb3c6IFdpbmRvdyk6IHZvaWQge1xuICAgICAgICB0aGlzLm9uTG9hZEhpc3RvcnlUcmlnZ2VyZWQuZW1pdCh3aW5kb3cpO1xuICAgIH1cblxuICAgIC8vIENsb3NlcyBhIGNoYXQgd2luZG93IHZpYSB0aGUgY2xvc2UgJ1gnIGJ1dHRvblxuICAgIG9uQ2xvc2VDaGF0V2luZG93KCk6IHZvaWQgXG4gICAge1xuICAgICAgICB0aGlzLm9uQ2hhdFdpbmRvd0Nsb3NlZC5lbWl0KHsgY2xvc2VkV2luZG93OiB0aGlzLndpbmRvdywgY2xvc2VkVmlhRXNjYXBlS2V5OiBmYWxzZSB9KTtcbiAgICB9XG5cbiAgICAvKiAgTW9uaXRvcnMgcHJlc3NlZCBrZXlzIG9uIGEgY2hhdCB3aW5kb3dcbiAgICAgICAgLSBEaXNwYXRjaGVzIGEgbWVzc2FnZSB3aGVuIHRoZSBFTlRFUiBrZXkgaXMgcHJlc3NlZFxuICAgICAgICAtIFRhYnMgYmV0d2VlbiB3aW5kb3dzIG9uIFRBQiBvciBTSElGVCArIFRBQlxuICAgICAgICAtIENsb3NlcyB0aGUgY3VycmVudCBmb2N1c2VkIHdpbmRvdyBvbiBFU0NcbiAgICAqL1xuICAgb25DaGF0SW5wdXRUeXBlZChldmVudDogYW55LCB3aW5kb3c6IFdpbmRvdyk6IHZvaWRcbiAgIHtcbiAgICAgICBzd2l0Y2ggKGV2ZW50LmtleUNvZGUpXG4gICAgICAge1xuICAgICAgICAgICBjYXNlIDEzOlxuICAgICAgICAgICAgICAgaWYgKHdpbmRvdy5uZXdNZXNzYWdlICYmIHdpbmRvdy5uZXdNZXNzYWdlLnRyaW0oKSAhPSBcIlwiKVxuICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgIGxldCBtZXNzYWdlID0gbmV3IE1lc3NhZ2UoKTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgIG1lc3NhZ2UuZnJvbUlkID0gdGhpcy51c2VySWQ7XG4gICAgICAgICAgICAgICAgICAgbWVzc2FnZS50b0lkID0gd2luZG93LnBhcnRpY2lwYW50LmlkO1xuICAgICAgICAgICAgICAgICAgIG1lc3NhZ2UubWVzc2FnZSA9IHdpbmRvdy5uZXdNZXNzYWdlO1xuICAgICAgICAgICAgICAgICAgIG1lc3NhZ2UuZGF0ZVNlbnQgPSBuZXcgRGF0ZSgpO1xuICAgICAgIFxuICAgICAgICAgICAgICAgICAgIHdpbmRvdy5tZXNzYWdlcy5wdXNoKG1lc3NhZ2UpO1xuICAgICAgIFxuICAgICAgICAgICAgICAgICAgIHRoaXMub25NZXNzYWdlU2VudC5lbWl0KG1lc3NhZ2UpO1xuICAgICAgIFxuICAgICAgICAgICAgICAgICAgIHdpbmRvdy5uZXdNZXNzYWdlID0gXCJcIjsgLy8gUmVzZXRzIHRoZSBuZXcgbWVzc2FnZSBpbnB1dFxuICAgICAgIFxuICAgICAgICAgICAgICAgICAgIHRoaXMuc2Nyb2xsQ2hhdFdpbmRvdyh3aW5kb3csIFNjcm9sbERpcmVjdGlvbi5Cb3R0b20pO1xuICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgIGNhc2UgOTpcbiAgICAgICAgICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG5cbiAgICAgICAgICAgICAgIHRoaXMub25UYWJUcmlnZ2VyZWQuZW1pdCh7IHRyaWdnZXJpbmdXaW5kb3c6IHdpbmRvdywgc2hpZnRLZXlQcmVzc2VkOiBldmVudC5zaGlmdEtleSB9KTtcblxuICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgIGNhc2UgMjc6XG4gICAgICAgICAgICAgICB0aGlzLm9uQ2hhdFdpbmRvd0Nsb3NlZC5lbWl0KHsgY2xvc2VkV2luZG93OiB3aW5kb3csIGNsb3NlZFZpYUVzY2FwZUtleTogdHJ1ZSB9KTtcblxuICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgfVxuICAgfVxuXG4gICAgLy8gVG9nZ2xlcyBhIGNoYXQgd2luZG93IHZpc2liaWxpdHkgYmV0d2VlbiBtYXhpbWl6ZWQvbWluaW1pemVkXG4gICAgb25DaGF0V2luZG93Q2xpY2tlZCh3aW5kb3c6IFdpbmRvdyk6IHZvaWRcbiAgICB7XG4gICAgICAgIHdpbmRvdy5pc0NvbGxhcHNlZCA9ICF3aW5kb3cuaXNDb2xsYXBzZWQ7XG4gICAgICAgIHRoaXMub25DaGF0V2luZG93VG9nZ2xlLmVtaXQoeyBjdXJyZW50V2luZG93OiB3aW5kb3csIGlzQ29sbGFwc2VkOiB3aW5kb3cuaXNDb2xsYXBzZWQgfSk7XG4gICAgICAgIHRoaXMuc2Nyb2xsQ2hhdFdpbmRvdyh3aW5kb3csIFNjcm9sbERpcmVjdGlvbi5Cb3R0b20pO1xuICAgIH1cblxuICAgIHByaXZhdGUgY2xlYXJJblVzZUZpbGVVcGxvYWRlcihmaWxlVXBsb2FkSW5zdGFuY2VJZDogc3RyaW5nKTogdm9pZFxuICAgIHtcbiAgICAgICAgY29uc3QgdXBsb2FkZXJJbnN0YW5jZUlkSW5kZXggPSB0aGlzLmZpbGVVcGxvYWRlcnNJblVzZS5pbmRleE9mKGZpbGVVcGxvYWRJbnN0YW5jZUlkKTtcblxuICAgICAgICBpZiAodXBsb2FkZXJJbnN0YW5jZUlkSW5kZXggPiAtMSkge1xuICAgICAgICAgICAgdGhpcy5maWxlVXBsb2FkZXJzSW5Vc2Uuc3BsaWNlKHVwbG9hZGVySW5zdGFuY2VJZEluZGV4LCAxKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8vIEhhbmRsZXMgZmlsZSBzZWxlY3Rpb24gYW5kIHVwbG9hZHMgdGhlIHNlbGVjdGVkIGZpbGUgdXNpbmcgdGhlIGZpbGUgdXBsb2FkIGFkYXB0ZXJcbiAgICBvbkZpbGVDaG9zZW4od2luZG93OiBXaW5kb3cpOiB2b2lkIHtcbiAgICAgICAgY29uc3QgZmlsZVVwbG9hZEluc3RhbmNlSWQgPSB0aGlzLmdldFVuaXF1ZUZpbGVVcGxvYWRJbnN0YW5jZUlkKHdpbmRvdyk7XG4gICAgICAgIGNvbnN0IHVwbG9hZEVsZW1lbnRSZWYgPSB0aGlzLm5hdGl2ZUZpbGVJbnB1dDtcblxuICAgICAgICBpZiAodXBsb2FkRWxlbWVudFJlZilcbiAgICAgICAge1xuICAgICAgICAgICAgY29uc3QgZmlsZTogRmlsZSA9IHVwbG9hZEVsZW1lbnRSZWYubmF0aXZlRWxlbWVudC5maWxlc1swXTtcblxuICAgICAgICAgICAgdGhpcy5maWxlVXBsb2FkZXJzSW5Vc2UucHVzaChmaWxlVXBsb2FkSW5zdGFuY2VJZCk7XG5cbiAgICAgICAgICAgIHRoaXMuZmlsZVVwbG9hZEFkYXB0ZXIudXBsb2FkRmlsZShmaWxlLCB3aW5kb3cucGFydGljaXBhbnQuaWQpXG4gICAgICAgICAgICAgICAgLnN1YnNjcmliZShmaWxlTWVzc2FnZSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuY2xlYXJJblVzZUZpbGVVcGxvYWRlcihmaWxlVXBsb2FkSW5zdGFuY2VJZCk7XG5cbiAgICAgICAgICAgICAgICAgICAgZmlsZU1lc3NhZ2UuZnJvbUlkID0gdGhpcy51c2VySWQ7XG5cbiAgICAgICAgICAgICAgICAgICAgLy8gUHVzaCBmaWxlIG1lc3NhZ2UgdG8gY3VycmVudCB1c2VyIHdpbmRvdyAgIFxuICAgICAgICAgICAgICAgICAgICB3aW5kb3cubWVzc2FnZXMucHVzaChmaWxlTWVzc2FnZSk7XG4gICAgICAgIFxuICAgICAgICAgICAgICAgICAgICB0aGlzLm9uTWVzc2FnZVNlbnQuZW1pdChmaWxlTWVzc2FnZSk7XG4gICAgICAgIFxuICAgICAgICAgICAgICAgICAgICB0aGlzLnNjcm9sbENoYXRXaW5kb3cod2luZG93LCBTY3JvbGxEaXJlY3Rpb24uQm90dG9tKTtcblxuICAgICAgICAgICAgICAgICAgICAvLyBSZXNldHMgdGhlIGZpbGUgdXBsb2FkIGVsZW1lbnRcbiAgICAgICAgICAgICAgICAgICAgdXBsb2FkRWxlbWVudFJlZi5uYXRpdmVFbGVtZW50LnZhbHVlID0gJyc7XG4gICAgICAgICAgICAgICAgfSwgKGVycm9yKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuY2xlYXJJblVzZUZpbGVVcGxvYWRlcihmaWxlVXBsb2FkSW5zdGFuY2VJZCk7XG5cbiAgICAgICAgICAgICAgICAgICAgLy8gUmVzZXRzIHRoZSBmaWxlIHVwbG9hZCBlbGVtZW50XG4gICAgICAgICAgICAgICAgICAgIHVwbG9hZEVsZW1lbnRSZWYubmF0aXZlRWxlbWVudC52YWx1ZSA9ICcnO1xuXG4gICAgICAgICAgICAgICAgICAgIC8vIFRPRE86IEludm9rZSBhIGZpbGUgdXBsb2FkIGFkYXB0ZXIgZXJyb3IgaGVyZVxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfVxufVxuIl19