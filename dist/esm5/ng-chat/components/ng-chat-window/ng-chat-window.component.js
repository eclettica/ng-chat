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
        this.showCloseButton = true;
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
        if (this.window
            && this.window.participant
            && this.window.participant.windowOptions
            && this.window.participant.windowOptions.windowClass)
            this.windowClass = this.window.participant.windowOptions.windowClass;
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
        Input()
    ], NgChatWindowComponent.prototype, "showCloseButton", void 0);
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
            template: "<ng-container *ngIf=\"window && window.isCollapsed\">\n\t<div class=\"ng-chat-title secondary-background {{windowClass}}\">\n\t\t<div class=\"ng-chat-title-visibility-toggle-area\" (click)=\"onChatWindowClicked(window)\">\n\t\t\t<strong title=\"{{window.participant.displayName}}\">\n\t\t\t\t{{window.participant.displayName}}\n\t\t\t</strong>\n\t\t\t<span [ngClass]=\"{'ng-chat-participant-status': true, 'online': window.participant.status == ChatParticipantStatus.Online, 'busy': window.participant.status == ChatParticipantStatus.Busy, 'away': window.participant.status == ChatParticipantStatus.Away, 'offline': window.participant.status == ChatParticipantStatus.Offline}\" title=\"{{chatParticipantStatusDescriptor(window.participant.status, localization)}}\"></span>\n\t\t\t<span *ngIf=\"unreadMessagesTotal(window).length > 0\" class=\"ng-chat-unread-messages-count unread-messages-counter-container primary-text\">{{unreadMessagesTotal(window)}}</span>\n\t\t</div>\n\t\t<a *ngIf=\"showCloseButton\" href=\"javascript:void(0);\" class=\"ng-chat-close primary-text\" (click)=\"onCloseChatWindow()\">X</a>\n\t</div>\n</ng-container>\n<ng-container *ngIf=\"window && !window.isCollapsed\">\n\t<div class=\"ng-chat-title secondary-background {{windowClass}}\">\n\t\t<div class=\"ng-chat-title-visibility-toggle-area\" (click)=\"onChatWindowClicked(window)\">\n\t\t\t<strong title=\"{{window.participant.displayName}}\">\n\t\t\t\t{{window.participant.displayName}}\n\t\t\t</strong>\n\t\t\t<span [ngClass]=\"{'ng-chat-participant-status': true, 'online': window.participant.status == ChatParticipantStatus.Online, 'busy': window.participant.status == ChatParticipantStatus.Busy, 'away': window.participant.status == ChatParticipantStatus.Away, 'offline': window.participant.status == ChatParticipantStatus.Offline}\" title=\"{{chatParticipantStatusDescriptor(window.participant.status, localization)}}\"></span>\n\t\t\t<span *ngIf=\"unreadMessagesTotal(window).length > 0\" class=\"ng-chat-unread-messages-count unread-messages-counter-container primary-text\">{{unreadMessagesTotal(window)}}</span>\n\t\t</div>\n\t\t<ng-chat-window-options *ngIf=\"window?.participant?.windowOptions?.buttons\" [ngClass]=\"{'ng-chat-options-container' : window.participant.windowOptions.buttons.length > 2, 'ng-chat-options-container-reduced': window.participant.windowOptions.buttons.length < 3 }\" [options]=\"window?.participant?.windowOptions\"></ng-chat-window-options>\n\t\t<a *ngIf=\"showCloseButton\" href=\"javascript:void(0);\" class=\"ng-chat-close primary-text\" (click)=\"onCloseChatWindow()\">X</a>\n\t\t<ng-chat-options [ngClass]=\"'ng-chat-options-container'\" [options]=\"defaultWindowOptions(window)\" (activeOptionTrackerChange)=\"activeOptionTrackerChange($event)\"></ng-chat-options>\n\t</div>\n\t<div #chatMessages class=\"ng-chat-messages primary-background\">\n\t\t<div *ngIf=\"window.isLoadingHistory\" class=\"ng-chat-loading-wrapper\">\n\t\t\t<div class=\"loader\">Loading history...</div>\n\t\t</div>\n\t\t<div *ngIf=\"hasPagedHistory && window.hasMoreMessages && !window.isLoadingHistory\" class=\"ng-chat-load-history\">\n\t\t\t<a class=\"load-history-action\" (click)=\"fetchMessageHistory(window)\">{{localization.loadMessageHistoryPlaceholder}}</a>\n\t\t</div>\n\n\t\t<div *ngFor=\"let message of window.messages; let i = index\" [ngClass]=\"{'ng-chat-message': true, 'ng-chat-message-received': message.fromId != userId}\">\n\t\t\t<ng-container *ngIf=\"isAvatarVisible(window, message, i)\">\n\t\t\t\t<div *ngIf=\"!getChatWindowAvatar(window.participant, message) && !getChatWindowAvatarSrc(window.participant, message)\" class=\"icon-wrapper\">\n\t\t\t\t\t<i class=\"user-icon\"></i>\n\t\t\t\t</div>\n\t\t\t\t<img *ngIf=\"getChatWindowAvatar(window.participant, message)\" alt=\"\" class=\"avatar\" height=\"30\" width=\"30\" [src]=\"getChatWindowAvatar(window.participant, message) | sanitize\" />\n\t\t\t\t<img *ngIf=\"getChatWindowAvatarSrc(window.participant, message)\" alt=\"\" class=\"avatar avatarSrc\" height=\"30\" width=\"30\" [src]=\"getChatWindowAvatarSrc(window.participant, message) | secure | async\" />\n\t\t\t\t<span *ngIf=\"window.participant.participantType == ChatParticipantType.Group\" class=\"ng-chat-participant-name\">{{window.participant | groupMessageDisplayName:message}}</span>\n\t\t\t</ng-container>\n\t\t\t<ng-container [ngSwitch]=\"message.type\">\n\t\t\t\t<div *ngSwitchCase=\"MessageType.Text\" [ngClass]=\"{'sent-chat-message-container': message.fromId == userId, 'received-chat-message-container': message.fromId != userId}\">\n          <span [innerHtml]=\"message.message | emojify:emojisEnabled | linkfy:linkfyEnabled\"></span>\n\t\t\t\t\t<span *ngIf=\"showMessageDate && message.dateSent\" class=\"message-sent-date\">{{message.dateSent | date:messageDatePipeFormat}}</span>\n\t\t\t\t</div>\n        <div *ngSwitchCase=\"MessageType.Image\" [ngClass]=\"{'sent-chat-message-container': message.fromId == userId, 'received-chat-message-container': message.fromId != userId}\">\n\n          <img src=\"{{message.message}}\" class=\"image-message\" />\n\n\t\t\t\t\t<span *ngIf=\"showMessageDate && message.dateSent\" class=\"message-sent-date\">{{message.dateSent | date:messageDatePipeFormat}}</span>\n\t\t\t\t</div>\n\t\t\t\t<div *ngSwitchCase=\"MessageType.File\" [ngClass]=\"{'file-message-container': true, 'received': message.fromId != userId}\">\n\t\t\t\t\t<div class=\"file-message-icon-container\">\n\t\t\t\t\t\t<i class=\"paperclip-icon\"></i>\n\t\t\t\t\t</div>\n\t\t\t\t\t<a class=\"file-details\" [attr.href]=\"message.downloadUrl\" target=\"_blank\" rel=\"noopener noreferrer\" (click)=\"this.markMessagesAsRead([message])\" download>\n\t\t\t\t\t\t<span class=\"file-message-title\" [attr.title]=\"message.message\">{{message.message}}</span>\n\t\t\t\t\t\t<span *ngIf=\"message.fileSizeInBytes\"  class=\"file-message-size\">{{message.fileSizeInBytes}} Bytes</span>\n\t\t\t\t\t</a>\n\t\t\t\t</div>\n\t\t\t</ng-container>\n\t\t</div>\n\t</div>\n\n\t<div class=\"ng-chat-footer primary-outline-color primary-background\">\n\t\t<input #chatWindowInput\n\t\t\ttype=\"text\"\n\t\t\t[ngModel]=\"window.newMessage | emojify:emojisEnabled\"\n\t\t\t(ngModelChange)=\"window.newMessage=$event\"\n\t\t\t[placeholder]=\"localization.messagePlaceholder\"\n\t\t\t[ngClass]=\"{'chat-window-input': true, 'has-side-action': fileUploadAdapter}\"\n\t\t\t(keydown)=\"onChatInputTyped($event, window)\"\n\t\t\t(blur)=\"toggleWindowFocus(window)\"\n\t\t\t(focus)=\"toggleWindowFocus(window)\"/>\n\n\t\t<!-- File Upload -->\n\t\t<ng-container *ngIf=\"fileUploadAdapter\">\n\t\t\t<a *ngIf=\"!isUploadingFile(window)\" class=\"btn-add-file\" (click)=\"triggerNativeFileUpload(window)\">\n\t\t\t\t<i class=\"upload-icon\"></i>\n\t\t\t</a>\n\t\t\t<input\n\t\t\t\ttype=\"file\"\n\t\t\t\t#nativeFileInput\n\t\t\t\tstyle=\"display: none;\"\n\t\t\t\t[attr.id]=\"getUniqueFileUploadInstanceId(window)\"\n\t\t\t\t(change)=\"onFileChosen(window)\" />\n\t\t\t<div *ngIf=\"isUploadingFile(window)\" class=\"loader\"></div>\n\t\t</ng-container>\n\t</div>\n</ng-container>\n",
            encapsulation: ViewEncapsulation.None,
            styles: [".ng-chat-window{right:260px;height:360px;z-index:999;bottom:0;width:300px;position:fixed;border-width:1px;border-style:solid;border-bottom:0;box-shadow:0 4px 8px rgba(0,0,0,.25)}.ng-chat-window-collapsed{height:30px!important}.ng-chat-window .ng-chat-footer{box-sizing:border-box;padding:0;display:block;height:calc(10%);width:100%;border:none;border-top:1px solid transparent;border-color:inherit}.ng-chat-window .ng-chat-footer>input{font-size:.8em;box-sizing:border-box;padding:0 5px;display:block;height:100%;width:100%;border:none}.ng-chat-window .ng-chat-footer>input.has-side-action{width:calc(100% - 30px)}.ng-chat-window .ng-chat-footer .btn-add-file{position:absolute;right:5px;bottom:7px;height:20px;width:20px;cursor:pointer}.ng-chat-window .ng-chat-footer .loader{position:absolute;right:14px;bottom:8px}.ng-chat-window .ng-chat-load-history{height:30px;text-align:center;font-size:.8em}.ng-chat-window .ng-chat-load-history>a{border-radius:15px;cursor:pointer;padding:5px 10px}.ng-chat-window .ng-chat-messages{padding:10px;width:100%;height:calc(90% - 30px);box-sizing:border-box;position:relative;overflow:auto}.ng-chat-window .ng-chat-messages .ng-chat-message{clear:both}.ng-chat-window .ng-chat-messages .ng-chat-message>.icon-wrapper,.ng-chat-window .ng-chat-messages .ng-chat-message>img.avatar{position:absolute;left:10px;border-radius:25px}.ng-chat-window .ng-chat-messages .ng-chat-message .ng-chat-participant-name{display:inline-block;margin-left:40px;padding-bottom:5px;font-weight:700;font-size:.8em;text-overflow:ellipsis;max-width:180px}.ng-chat-window .ng-chat-messages .ng-chat-message>.icon-wrapper{background-color:#bababa;overflow:hidden;width:30px;height:30px;padding:0}.ng-chat-window .ng-chat-messages .ng-chat-message>.icon-wrapper>i{color:#fff;transform:scale(.7)}.ng-chat-window .ng-chat-messages .ng-chat-message .message-sent-date{font-size:.8em;display:block;text-align:right;margin-top:5px}.ng-chat-window .ng-chat-messages .ng-chat-message>div{float:right;width:182px;padding:10px;border-radius:5px;margin-top:0;margin-bottom:5px;font-size:.9em;word-wrap:break-word}.ng-chat-window .ng-chat-messages .ng-chat-message.ng-chat-message-received>div.received-chat-message-container{float:left;margin-left:40px;padding-top:7px;padding-bottom:7px;border-style:solid;border-width:3px;margin-top:0;margin-bottom:5px}.ng-chat-window .ng-chat-messages .ng-chat-message .file-message-container{float:right;width:202px;border-style:solid;border-width:3px;border-radius:5px;overflow:hidden;margin-bottom:5px;display:block;text-decoration:none;font-size:.9em;padding:0;box-sizing:border-box}.ng-chat-window .ng-chat-messages .ng-chat-message .file-message-container.received{float:left;margin-left:40px;width:208px}.ng-chat-window .ng-chat-messages .ng-chat-message .file-message-container>.file-message-icon-container{width:20px;height:35px;padding:10px 5px;float:left}.ng-chat-window .ng-chat-messages .ng-chat-message .file-message-container>.file-message-icon-container i{margin-top:8px}.ng-chat-window .ng-chat-messages .ng-chat-message .file-message-container>.file-details{float:left;padding:10px;width:calc(100% - 60px);color:currentColor;text-decoration:none}.ng-chat-window .ng-chat-messages .ng-chat-message .file-message-container>.file-details:hover{text-decoration:underline}.ng-chat-window .ng-chat-messages .ng-chat-message .file-message-container>.file-details span{display:block;width:100%;text-overflow:ellipsis;overflow:hidden;white-space:nowrap}.ng-chat-window .ng-chat-messages .ng-chat-message .file-message-container>.file-details .file-message-title{font-weight:700}.ng-chat-window .ng-chat-messages .ng-chat-message .file-message-container>.file-details .file-message-size{font-size:.8em;margin-top:5px}.ng-chat-window .image-message{width:100%;height:auto}@media only screen and (max-width:581px){.ng-chat-window{position:initial}}"]
        })
    ], NgChatWindowComponent);
    return NgChatWindowComponent;
}());
export { NgChatWindowComponent };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmctY2hhdC13aW5kb3cuY29tcG9uZW50LmpzIiwic291cmNlUm9vdCI6Im5nOi8vbmctY2hhdC8iLCJzb3VyY2VzIjpbIm5nLWNoYXQvY29tcG9uZW50cy9uZy1jaGF0LXdpbmRvdy9uZy1jaGF0LXdpbmRvdy5jb21wb25lbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBLE9BQU8sRUFBRSxTQUFTLEVBQUUsS0FBSyxFQUFFLE1BQU0sRUFBRSxZQUFZLEVBQUUsaUJBQWlCLEVBQUUsU0FBUyxFQUFzQixNQUFNLGVBQWUsQ0FBQztBQUV6SCxPQUFPLEVBQUUsT0FBTyxFQUFFLE1BQU0sb0JBQW9CLENBQUM7QUFDN0MsT0FBTyxFQUFFLFdBQVcsRUFBRSxNQUFNLDhCQUE4QixDQUFDO0FBRTNELE9BQU8sRUFBRSxxQkFBcUIsRUFBRSxNQUFNLHlDQUF5QyxDQUFDO0FBQ2hGLE9BQU8sRUFBRSxlQUFlLEVBQUUsTUFBTSxrQ0FBa0MsQ0FBQztBQU1uRSxPQUFPLEVBQUUsbUJBQW1CLEVBQUUsTUFBTSx1Q0FBdUMsQ0FBQztBQUU1RSxPQUFPLEVBQUUsY0FBYyxFQUFFLE1BQU0sNEJBQTRCLENBQUM7QUFDNUQsT0FBTyxFQUFFLCtCQUErQixFQUFFLE1BQU0sK0NBQStDLENBQUM7QUFRaEc7SUFFSTtRQURBLGdCQUFXLEdBQXVCLEVBQUUsQ0FBQztRQWtDOUIsa0JBQWEsR0FBWSxJQUFJLENBQUM7UUFHOUIsa0JBQWEsR0FBWSxJQUFJLENBQUM7UUFHOUIsb0JBQWUsR0FBWSxJQUFJLENBQUM7UUFHaEMsMEJBQXFCLEdBQVcsT0FBTyxDQUFDO1FBR3hDLG9CQUFlLEdBQVksSUFBSSxDQUFDO1FBR2hDLG9CQUFlLEdBQVksSUFBSSxDQUFDO1FBR2hDLHVCQUFrQixHQUF3RSxJQUFJLFlBQVksRUFBRSxDQUFDO1FBRzdHLHVCQUFrQixHQUFrRSxJQUFJLFlBQVksRUFBRSxDQUFDO1FBR3ZHLG1CQUFjLEdBQTRCLElBQUksWUFBWSxFQUFFLENBQUM7UUFH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aVRDO1NBalRZLHFCQUFxQiIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IENvbXBvbmVudCwgSW5wdXQsIE91dHB1dCwgRXZlbnRFbWl0dGVyLCBWaWV3RW5jYXBzdWxhdGlvbiwgVmlld0NoaWxkLCBFbGVtZW50UmVmLCBPbkluaXQgfSBmcm9tICdAYW5ndWxhci9jb3JlJztcblxuaW1wb3J0IHsgTWVzc2FnZSB9IGZyb20gXCIuLi8uLi9jb3JlL21lc3NhZ2VcIjtcbmltcG9ydCB7IE1lc3NhZ2VUeXBlIH0gZnJvbSBcIi4uLy4uL2NvcmUvbWVzc2FnZS10eXBlLmVudW1cIjtcbmltcG9ydCB7IFdpbmRvdyB9IGZyb20gXCIuLi8uLi9jb3JlL3dpbmRvd1wiO1xuaW1wb3J0IHsgQ2hhdFBhcnRpY2lwYW50U3RhdHVzIH0gZnJvbSBcIi4uLy4uL2NvcmUvY2hhdC1wYXJ0aWNpcGFudC1zdGF0dXMuZW51bVwiO1xuaW1wb3J0IHsgU2Nyb2xsRGlyZWN0aW9uIH0gZnJvbSBcIi4uLy4uL2NvcmUvc2Nyb2xsLWRpcmVjdGlvbi5lbnVtXCI7XG5pbXBvcnQgeyBMb2NhbGl6YXRpb24gfSBmcm9tICcuLi8uLi9jb3JlL2xvY2FsaXphdGlvbic7XG5pbXBvcnQgeyBJRmlsZVVwbG9hZEFkYXB0ZXIgfSBmcm9tICcuLi8uLi9jb3JlL2ZpbGUtdXBsb2FkLWFkYXB0ZXInO1xuaW1wb3J0IHsgSUNoYXRPcHRpb24gfSBmcm9tICcuLi8uLi9jb3JlL2NoYXQtb3B0aW9uJztcbmltcG9ydCB7IFdpbmRvd09wdGlvbiB9IGZyb20gJy4uLy4uL2NvcmUvd2luZG93LW9wdGlvbic7XG5pbXBvcnQgeyBHcm91cCB9IGZyb20gXCIuLi8uLi9jb3JlL2dyb3VwXCI7XG5pbXBvcnQgeyBDaGF0UGFydGljaXBhbnRUeXBlIH0gZnJvbSBcIi4uLy4uL2NvcmUvY2hhdC1wYXJ0aWNpcGFudC10eXBlLmVudW1cIjtcbmltcG9ydCB7IElDaGF0UGFydGljaXBhbnQgfSBmcm9tIFwiLi4vLi4vY29yZS9jaGF0LXBhcnRpY2lwYW50XCI7XG5pbXBvcnQgeyBNZXNzYWdlQ291bnRlciB9IGZyb20gXCIuLi8uLi9jb3JlL21lc3NhZ2UtY291bnRlclwiO1xuaW1wb3J0IHsgY2hhdFBhcnRpY2lwYW50U3RhdHVzRGVzY3JpcHRvciB9IGZyb20gJy4uLy4uL2NvcmUvY2hhdC1wYXJ0aWNpcGFudC1zdGF0dXMtZGVzY3JpcHRvcic7XG5cbkBDb21wb25lbnQoe1xuICAgIHNlbGVjdG9yOiAnbmctY2hhdC13aW5kb3cnLFxuICAgIHRlbXBsYXRlVXJsOiAnLi9uZy1jaGF0LXdpbmRvdy5jb21wb25lbnQuaHRtbCcsXG4gICAgc3R5bGVVcmxzOiBbJy4vbmctY2hhdC13aW5kb3cuY29tcG9uZW50LmNzcyddLFxuICAgIGVuY2Fwc3VsYXRpb246IFZpZXdFbmNhcHN1bGF0aW9uLk5vbmVcbn0pXG5leHBvcnQgY2xhc3MgTmdDaGF0V2luZG93Q29tcG9uZW50IGltcGxlbWVudHMgT25Jbml0IHtcbiAgICB3aW5kb3dDbGFzczogc3RyaW5nIHwgdW5kZWZpbmVkID0gJyc7XG4gICAgY29uc3RydWN0b3IoKSB7XG4gICAgICAgIC8vdGhpcy53aW5kb3dPcHRpb25zID0gdGhpcy53aW5kb3cucGFydGljaXBhbnQud2luZG93T3B0aW9ucztcbiAgICB9XG5cbiAgICAvL3dpbmRvd09wdGlvbnM6IFdpbmRvd09wdGlvbiB8IG51bGw7XG5cbiAgICBuZ09uSW5pdCgpIHtcbiAgICAgICAgaWYgKHRoaXMud2luZG93XG4gICAgICAgICAgICAmJiB0aGlzLndpbmRvdy5wYXJ0aWNpcGFudFxuICAgICAgICAgICAgJiYgdGhpcy53aW5kb3cucGFydGljaXBhbnQud2luZG93T3B0aW9uc1xuICAgICAgICAgICAgJiYgdGhpcy53aW5kb3cucGFydGljaXBhbnQud2luZG93T3B0aW9ucy53aW5kb3dDbGFzcylcbiAgICAgICAgICAgIHRoaXMud2luZG93Q2xhc3MgPSB0aGlzLndpbmRvdy5wYXJ0aWNpcGFudC53aW5kb3dPcHRpb25zLndpbmRvd0NsYXNzO1xuXG4gICAgICAgIGlmICh0aGlzLndpbmRvd0NsYXNzID09IHVuZGVmaW5lZCB8fCB0aGlzLndpbmRvd0NsYXNzID09IG51bGwpXG4gICAgICAgICAgICB0aGlzLndpbmRvd0NsYXNzID0gJyc7XG4gICAgfVxuXG4gICAgQElucHV0KClcbiAgICBwdWJsaWMgZmlsZVVwbG9hZEFkYXB0ZXI6IElGaWxlVXBsb2FkQWRhcHRlcjtcblxuICAgIEBJbnB1dCgpXG4gICAgcHVibGljIHdpbmRvdzogV2luZG93O1xuXG4gICAgQElucHV0KClcbiAgICBwdWJsaWMgdXNlcklkOiBhbnk7XG5cbiAgICBASW5wdXQoKVxuICAgIHB1YmxpYyBsb2NhbGl6YXRpb246IExvY2FsaXphdGlvbjtcblxuICAgIEBJbnB1dCgpXG4gICAgcHVibGljIHNob3dPcHRpb25zOiBib29sZWFuO1xuXG4gICAgQElucHV0KClcbiAgICBwdWJsaWMgZW1vamlzRW5hYmxlZDogYm9vbGVhbiA9IHRydWU7XG5cbiAgICBASW5wdXQoKVxuICAgIHB1YmxpYyBsaW5rZnlFbmFibGVkOiBib29sZWFuID0gdHJ1ZTtcblxuICAgIEBJbnB1dCgpXG4gICAgcHVibGljIHNob3dNZXNzYWdlRGF0ZTogYm9vbGVhbiA9IHRydWU7XG5cbiAgICBASW5wdXQoKVxuICAgIHB1YmxpYyBtZXNzYWdlRGF0ZVBpcGVGb3JtYXQ6IHN0cmluZyA9IFwic2hvcnRcIjtcblxuICAgIEBJbnB1dCgpXG4gICAgcHVibGljIGhhc1BhZ2VkSGlzdG9yeTogYm9vbGVhbiA9IHRydWU7XG5cbiAgICBASW5wdXQoKVxuICAgIHB1YmxpYyBzaG93Q2xvc2VCdXR0b246IGJvb2xlYW4gPSB0cnVlO1xuXG4gICAgQE91dHB1dCgpXG4gICAgcHVibGljIG9uQ2hhdFdpbmRvd0Nsb3NlZDogRXZlbnRFbWl0dGVyPHsgY2xvc2VkV2luZG93OiBXaW5kb3csIGNsb3NlZFZpYUVzY2FwZUtleTogYm9vbGVhbiB9PiA9IG5ldyBFdmVudEVtaXR0ZXIoKTtcblxuICAgIEBPdXRwdXQoKVxuICAgIHB1YmxpYyBvbkNoYXRXaW5kb3dUb2dnbGU6IEV2ZW50RW1pdHRlcjx7IGN1cnJlbnRXaW5kb3c6IFdpbmRvdywgaXNDb2xsYXBzZWQ6IGJvb2xlYW4gfT4gPSBuZXcgRXZlbnRFbWl0dGVyKCk7XG5cbiAgICBAT3V0cHV0KClcbiAgICBwdWJsaWMgb25NZXNzYWdlc1NlZW46IEV2ZW50RW1pdHRlcjxNZXNzYWdlW10+ID0gbmV3IEV2ZW50RW1pdHRlcigpO1xuXG4gICAgQE91dHB1dCgpXG4gICAgcHVibGljIG9uTWVzc2FnZVNlbnQ6IEV2ZW50RW1pdHRlcjxNZXNzYWdlPiA9IG5ldyBFdmVudEVtaXR0ZXIoKTtcblxuICAgIEBPdXRwdXQoKVxuICAgIHB1YmxpYyBvblRhYlRyaWdnZXJlZDogRXZlbnRFbWl0dGVyPHsgdHJpZ2dlcmluZ1dpbmRvdzogV2luZG93LCBzaGlmdEtleVByZXNzZWQ6IGJvb2xlYW4gfT4gPSBuZXcgRXZlbnRFbWl0dGVyKCk7XG5cbiAgICBAT3V0cHV0KClcbiAgICBwdWJsaWMgb25PcHRpb25UcmlnZ2VyZWQ6IEV2ZW50RW1pdHRlcjxJQ2hhdE9wdGlvbj4gPSBuZXcgRXZlbnRFbWl0dGVyKCk7XG5cbiAgICBAT3V0cHV0KClcbiAgICBwdWJsaWMgb25Mb2FkSGlzdG9yeVRyaWdnZXJlZDogRXZlbnRFbWl0dGVyPFdpbmRvdz4gPSBuZXcgRXZlbnRFbWl0dGVyKCk7XG5cbiAgICBAVmlld0NoaWxkKCdjaGF0TWVzc2FnZXMnKSBjaGF0TWVzc2FnZXM6IGFueTtcbiAgICBAVmlld0NoaWxkKCduYXRpdmVGaWxlSW5wdXQnKSBuYXRpdmVGaWxlSW5wdXQ6IEVsZW1lbnRSZWY7XG4gICAgQFZpZXdDaGlsZCgnY2hhdFdpbmRvd0lucHV0JykgY2hhdFdpbmRvd0lucHV0OiBhbnk7XG5cbiAgICAvLyBGaWxlIHVwbG9hZCBzdGF0ZVxuICAgIHB1YmxpYyBmaWxlVXBsb2FkZXJzSW5Vc2U6IHN0cmluZ1tdID0gW107IC8vIElkIGJ1Y2tldCBvZiB1cGxvYWRlcnMgaW4gdXNlXG5cbiAgICAvLyBFeHBvc2VzIGVudW1zIGFuZCBmdW5jdGlvbnMgZm9yIHRoZSBuZy10ZW1wbGF0ZVxuICAgIHB1YmxpYyBDaGF0UGFydGljaXBhbnRUeXBlID0gQ2hhdFBhcnRpY2lwYW50VHlwZTtcbiAgICBwdWJsaWMgQ2hhdFBhcnRpY2lwYW50U3RhdHVzID0gQ2hhdFBhcnRpY2lwYW50U3RhdHVzO1xuICAgIHB1YmxpYyBNZXNzYWdlVHlwZSA9IE1lc3NhZ2VUeXBlO1xuICAgIHB1YmxpYyBjaGF0UGFydGljaXBhbnRTdGF0dXNEZXNjcmlwdG9yID0gY2hhdFBhcnRpY2lwYW50U3RhdHVzRGVzY3JpcHRvcjtcblxuICAgIGRlZmF1bHRXaW5kb3dPcHRpb25zKGN1cnJlbnRXaW5kb3c6IFdpbmRvdyk6IElDaGF0T3B0aW9uW10ge1xuICAgICAgICBpZiAodGhpcy5zaG93T3B0aW9ucyAmJiBjdXJyZW50V2luZG93LnBhcnRpY2lwYW50LnBhcnRpY2lwYW50VHlwZSA9PSBDaGF0UGFydGljaXBhbnRUeXBlLlVzZXIpIHtcbiAgICAgICAgICAgIHJldHVybiBbe1xuICAgICAgICAgICAgICAgIGlzQWN0aXZlOiBmYWxzZSxcbiAgICAgICAgICAgICAgICBjaGF0dGluZ1RvOiBjdXJyZW50V2luZG93LFxuICAgICAgICAgICAgICAgIHZhbGlkYXRlQ29udGV4dDogKHBhcnRpY2lwYW50OiBJQ2hhdFBhcnRpY2lwYW50KSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBwYXJ0aWNpcGFudC5wYXJ0aWNpcGFudFR5cGUgPT0gQ2hhdFBhcnRpY2lwYW50VHlwZS5Vc2VyO1xuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgZGlzcGxheUxhYmVsOiAnQWRkIFBlb3BsZScgLy8gVE9ETzogTG9jYWxpemUgdGhpc1xuICAgICAgICAgICAgfV07XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gW107XG4gICAgfVxuXG4gICAgLy8gQXNzZXJ0cyBpZiBhIHVzZXIgYXZhdGFyIGlzIHZpc2libGUgaW4gYSBjaGF0IGNsdXN0ZXJcbiAgICBpc0F2YXRhclZpc2libGUod2luZG93OiBXaW5kb3csIG1lc3NhZ2U6IE1lc3NhZ2UsIGluZGV4OiBudW1iZXIpOiBib29sZWFuIHtcbiAgICAgICAgaWYgKG1lc3NhZ2UuZnJvbUlkICE9IHRoaXMudXNlcklkKSB7XG4gICAgICAgICAgICBpZiAoaW5kZXggPT0gMCkge1xuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlOyAvLyBGaXJzdCBtZXNzYWdlLCBnb29kIHRvIHNob3cgdGhlIHRodW1ibmFpbFxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgLy8gQ2hlY2sgaWYgdGhlIHByZXZpb3VzIG1lc3NhZ2UgYmVsb25ncyB0byB0aGUgc2FtZSB1c2VyLCBpZiBpdCBiZWxvbmdzIHRoZXJlIGlzIG5vIG5lZWQgdG8gc2hvdyB0aGUgYXZhdGFyIGFnYWluIHRvIGZvcm0gdGhlIG1lc3NhZ2UgY2x1c3RlclxuICAgICAgICAgICAgICAgIGlmICh3aW5kb3cubWVzc2FnZXNbaW5kZXggLSAxXS5mcm9tSWQgIT0gbWVzc2FnZS5mcm9tSWQpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIGdldENoYXRXaW5kb3dBdmF0YXIocGFydGljaXBhbnQ6IElDaGF0UGFydGljaXBhbnQsIG1lc3NhZ2U6IE1lc3NhZ2UpOiBzdHJpbmcgfCBudWxsIHtcbiAgICAgICAgaWYgKHBhcnRpY2lwYW50LnBhcnRpY2lwYW50VHlwZSA9PSBDaGF0UGFydGljaXBhbnRUeXBlLlVzZXIpIHtcbiAgICAgICAgICAgIHJldHVybiBwYXJ0aWNpcGFudC5hdmF0YXI7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAocGFydGljaXBhbnQucGFydGljaXBhbnRUeXBlID09IENoYXRQYXJ0aWNpcGFudFR5cGUuR3JvdXApIHtcbiAgICAgICAgICAgIGxldCBncm91cCA9IHBhcnRpY2lwYW50IGFzIEdyb3VwO1xuICAgICAgICAgICAgbGV0IHVzZXJJbmRleCA9IGdyb3VwLmNoYXR0aW5nVG8uZmluZEluZGV4KHggPT4geC5pZCA9PSBtZXNzYWdlLmZyb21JZCk7XG5cbiAgICAgICAgICAgIHJldHVybiBncm91cC5jaGF0dGluZ1RvW3VzZXJJbmRleCA+PSAwID8gdXNlckluZGV4IDogMF0uYXZhdGFyO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuXG4gICAgZ2V0Q2hhdFdpbmRvd0F2YXRhclNyYyhwYXJ0aWNpcGFudDogSUNoYXRQYXJ0aWNpcGFudCwgbWVzc2FnZTogTWVzc2FnZSk6IHN0cmluZyB8IG51bGwge1xuICAgICAgICBpZiAocGFydGljaXBhbnQucGFydGljaXBhbnRUeXBlID09IENoYXRQYXJ0aWNpcGFudFR5cGUuVXNlcikge1xuICAgICAgICAgICAgcmV0dXJuIHBhcnRpY2lwYW50LmF2YXRhclNyYztcbiAgICAgICAgfVxuICAgICAgICAvLyBlbHNlIGlmIChwYXJ0aWNpcGFudC5wYXJ0aWNpcGFudFR5cGUgPT0gQ2hhdFBhcnRpY2lwYW50VHlwZS5Hcm91cClcbiAgICAgICAgLy8ge1xuICAgICAgICAvLyAgICAgbGV0IGdyb3VwID0gcGFydGljaXBhbnQgYXMgR3JvdXA7XG4gICAgICAgIC8vICAgICBsZXQgdXNlckluZGV4ID0gZ3JvdXAuY2hhdHRpbmdUby5maW5kSW5kZXgoeCA9PiB4LmlkID09IG1lc3NhZ2UuZnJvbUlkKTtcblxuICAgICAgICAvLyAgICAgcmV0dXJuIGdyb3VwLmNoYXR0aW5nVG9bdXNlckluZGV4ID49IDAgPyB1c2VySW5kZXggOiAwXS5hdmF0YXI7XG4gICAgICAgIC8vIH1cblxuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG5cbiAgICBpc1VwbG9hZGluZ0ZpbGUod2luZG93OiBXaW5kb3cpOiBib29sZWFuIHtcbiAgICAgICAgY29uc3QgZmlsZVVwbG9hZEluc3RhbmNlSWQgPSB0aGlzLmdldFVuaXF1ZUZpbGVVcGxvYWRJbnN0YW5jZUlkKHdpbmRvdyk7XG5cbiAgICAgICAgcmV0dXJuIHRoaXMuZmlsZVVwbG9hZGVyc0luVXNlLmluZGV4T2YoZmlsZVVwbG9hZEluc3RhbmNlSWQpID4gLTE7XG4gICAgfVxuXG4gICAgLy8gR2VuZXJhdGVzIGEgdW5pcXVlIGZpbGUgdXBsb2FkZXIgaWQgZm9yIGVhY2ggcGFydGljaXBhbnRcbiAgICBnZXRVbmlxdWVGaWxlVXBsb2FkSW5zdGFuY2VJZCh3aW5kb3c6IFdpbmRvdyk6IHN0cmluZyB7XG4gICAgICAgIGlmICh3aW5kb3cgJiYgd2luZG93LnBhcnRpY2lwYW50KSB7XG4gICAgICAgICAgICByZXR1cm4gYG5nLWNoYXQtZmlsZS11cGxvYWQtJHt3aW5kb3cucGFydGljaXBhbnQuaWR9YDtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiAnbmctY2hhdC1maWxlLXVwbG9hZCc7XG4gICAgfVxuXG4gICAgdW5yZWFkTWVzc2FnZXNUb3RhbCh3aW5kb3c6IFdpbmRvdyk6IHN0cmluZyB7XG4gICAgICAgIHJldHVybiBNZXNzYWdlQ291bnRlci51bnJlYWRNZXNzYWdlc1RvdGFsKHdpbmRvdywgdGhpcy51c2VySWQpO1xuICAgIH1cblxuICAgIC8vIFNjcm9sbHMgYSBjaGF0IHdpbmRvdyBtZXNzYWdlIGZsb3cgdG8gdGhlIGJvdHRvbVxuICAgIHNjcm9sbENoYXRXaW5kb3cod2luZG93OiBXaW5kb3csIGRpcmVjdGlvbjogU2Nyb2xsRGlyZWN0aW9uKTogdm9pZCB7XG4gICAgICAgIGlmICghd2luZG93LmlzQ29sbGFwc2VkKSB7XG4gICAgICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5jaGF0TWVzc2FnZXMpIHtcbiAgICAgICAgICAgICAgICAgICAgbGV0IGVsZW1lbnQgPSB0aGlzLmNoYXRNZXNzYWdlcy5uYXRpdmVFbGVtZW50O1xuICAgICAgICAgICAgICAgICAgICBsZXQgcG9zaXRpb24gPSAoZGlyZWN0aW9uID09PSBTY3JvbGxEaXJlY3Rpb24uVG9wKSA/IDAgOiBlbGVtZW50LnNjcm9sbEhlaWdodDtcbiAgICAgICAgICAgICAgICAgICAgZWxlbWVudC5zY3JvbGxUb3AgPSBwb3NpdGlvbjtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGFjdGl2ZU9wdGlvblRyYWNrZXJDaGFuZ2Uob3B0aW9uOiBJQ2hhdE9wdGlvbik6IHZvaWQge1xuICAgICAgICB0aGlzLm9uT3B0aW9uVHJpZ2dlcmVkLmVtaXQob3B0aW9uKTtcbiAgICB9XG5cbiAgICAvLyBUcmlnZ2VycyBuYXRpdmUgZmlsZSB1cGxvYWQgZm9yIGZpbGUgc2VsZWN0aW9uIGZyb20gdGhlIHVzZXJcbiAgICB0cmlnZ2VyTmF0aXZlRmlsZVVwbG9hZCh3aW5kb3c6IFdpbmRvdyk6IHZvaWQge1xuICAgICAgICBpZiAod2luZG93KSB7XG4gICAgICAgICAgICBpZiAodGhpcy5uYXRpdmVGaWxlSW5wdXQpIHRoaXMubmF0aXZlRmlsZUlucHV0Lm5hdGl2ZUVsZW1lbnQuY2xpY2soKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8vIFRvZ2dsZXMgYSB3aW5kb3cgZm9jdXMgb24gdGhlIGZvY3VzL2JsdXIgb2YgYSAnbmV3TWVzc2FnZScgaW5wdXRcbiAgICB0b2dnbGVXaW5kb3dGb2N1cyh3aW5kb3c6IFdpbmRvdyk6IHZvaWQge1xuICAgICAgICB3aW5kb3cuaGFzRm9jdXMgPSAhd2luZG93Lmhhc0ZvY3VzO1xuICAgICAgICBpZiAod2luZG93Lmhhc0ZvY3VzKSB7XG4gICAgICAgICAgICBjb25zdCB1bnJlYWRNZXNzYWdlcyA9IHdpbmRvdy5tZXNzYWdlc1xuICAgICAgICAgICAgICAgIC5maWx0ZXIobWVzc2FnZSA9PiBtZXNzYWdlLmRhdGVTZWVuID09IG51bGxcbiAgICAgICAgICAgICAgICAgICAgJiYgKG1lc3NhZ2UudG9JZCA9PSB0aGlzLnVzZXJJZCB8fCB3aW5kb3cucGFydGljaXBhbnQucGFydGljaXBhbnRUeXBlID09PSBDaGF0UGFydGljaXBhbnRUeXBlLkdyb3VwKSk7XG5cbiAgICAgICAgICAgIGlmICh1bnJlYWRNZXNzYWdlcyAmJiB1bnJlYWRNZXNzYWdlcy5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5vbk1lc3NhZ2VzU2Vlbi5lbWl0KHVucmVhZE1lc3NhZ2VzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIG1hcmtNZXNzYWdlc0FzUmVhZChtZXNzYWdlczogTWVzc2FnZVtdKTogdm9pZCB7XG4gICAgICAgIHRoaXMub25NZXNzYWdlc1NlZW4uZW1pdChtZXNzYWdlcyk7XG4gICAgfVxuXG4gICAgZmV0Y2hNZXNzYWdlSGlzdG9yeSh3aW5kb3c6IFdpbmRvdyk6IHZvaWQge1xuICAgICAgICB0aGlzLm9uTG9hZEhpc3RvcnlUcmlnZ2VyZWQuZW1pdCh3aW5kb3cpO1xuICAgIH1cblxuICAgIC8vIENsb3NlcyBhIGNoYXQgd2luZG93IHZpYSB0aGUgY2xvc2UgJ1gnIGJ1dHRvblxuICAgIG9uQ2xvc2VDaGF0V2luZG93KCk6IHZvaWQge1xuICAgICAgICB0aGlzLm9uQ2hhdFdpbmRvd0Nsb3NlZC5lbWl0KHsgY2xvc2VkV2luZG93OiB0aGlzLndpbmRvdywgY2xvc2VkVmlhRXNjYXBlS2V5OiBmYWxzZSB9KTtcbiAgICB9XG5cbiAgICAvKiAgTW9uaXRvcnMgcHJlc3NlZCBrZXlzIG9uIGEgY2hhdCB3aW5kb3dcbiAgICAgICAgLSBEaXNwYXRjaGVzIGEgbWVzc2FnZSB3aGVuIHRoZSBFTlRFUiBrZXkgaXMgcHJlc3NlZFxuICAgICAgICAtIFRhYnMgYmV0d2VlbiB3aW5kb3dzIG9uIFRBQiBvciBTSElGVCArIFRBQlxuICAgICAgICAtIENsb3NlcyB0aGUgY3VycmVudCBmb2N1c2VkIHdpbmRvdyBvbiBFU0NcbiAgICAqL1xuICAgIG9uQ2hhdElucHV0VHlwZWQoZXZlbnQ6IGFueSwgd2luZG93OiBXaW5kb3cpOiB2b2lkIHtcbiAgICAgICAgc3dpdGNoIChldmVudC5rZXlDb2RlKSB7XG4gICAgICAgICAgICBjYXNlIDEzOlxuICAgICAgICAgICAgICAgIGlmICh3aW5kb3cubmV3TWVzc2FnZSAmJiB3aW5kb3cubmV3TWVzc2FnZS50cmltKCkgIT0gXCJcIikge1xuICAgICAgICAgICAgICAgICAgICBsZXQgbWVzc2FnZSA9IG5ldyBNZXNzYWdlKCk7XG5cbiAgICAgICAgICAgICAgICAgICAgbWVzc2FnZS5mcm9tSWQgPSB0aGlzLnVzZXJJZDtcbiAgICAgICAgICAgICAgICAgICAgbWVzc2FnZS50b0lkID0gd2luZG93LnBhcnRpY2lwYW50LmlkO1xuICAgICAgICAgICAgICAgICAgICBtZXNzYWdlLm1lc3NhZ2UgPSB3aW5kb3cubmV3TWVzc2FnZTtcbiAgICAgICAgICAgICAgICAgICAgbWVzc2FnZS5kYXRlU2VudCA9IG5ldyBEYXRlKCk7XG5cbiAgICAgICAgICAgICAgICAgICAgd2luZG93Lm1lc3NhZ2VzLnB1c2gobWVzc2FnZSk7XG5cbiAgICAgICAgICAgICAgICAgICAgdGhpcy5vbk1lc3NhZ2VTZW50LmVtaXQobWVzc2FnZSk7XG5cbiAgICAgICAgICAgICAgICAgICAgd2luZG93Lm5ld01lc3NhZ2UgPSBcIlwiOyAvLyBSZXNldHMgdGhlIG5ldyBtZXNzYWdlIGlucHV0XG5cbiAgICAgICAgICAgICAgICAgICAgdGhpcy5zY3JvbGxDaGF0V2luZG93KHdpbmRvdywgU2Nyb2xsRGlyZWN0aW9uLkJvdHRvbSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSA5OlxuICAgICAgICAgICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG5cbiAgICAgICAgICAgICAgICB0aGlzLm9uVGFiVHJpZ2dlcmVkLmVtaXQoeyB0cmlnZ2VyaW5nV2luZG93OiB3aW5kb3csIHNoaWZ0S2V5UHJlc3NlZDogZXZlbnQuc2hpZnRLZXkgfSk7XG5cbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgMjc6XG4gICAgICAgICAgICAgICAgdGhpcy5vbkNoYXRXaW5kb3dDbG9zZWQuZW1pdCh7IGNsb3NlZFdpbmRvdzogd2luZG93LCBjbG9zZWRWaWFFc2NhcGVLZXk6IHRydWUgfSk7XG5cbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8vIFRvZ2dsZXMgYSBjaGF0IHdpbmRvdyB2aXNpYmlsaXR5IGJldHdlZW4gbWF4aW1pemVkL21pbmltaXplZFxuICAgIG9uQ2hhdFdpbmRvd0NsaWNrZWQod2luZG93OiBXaW5kb3cpOiB2b2lkIHtcbiAgICAgICAgd2luZG93LmlzQ29sbGFwc2VkID0gIXdpbmRvdy5pc0NvbGxhcHNlZDtcbiAgICAgICAgdGhpcy5vbkNoYXRXaW5kb3dUb2dnbGUuZW1pdCh7IGN1cnJlbnRXaW5kb3c6IHdpbmRvdywgaXNDb2xsYXBzZWQ6IHdpbmRvdy5pc0NvbGxhcHNlZCB9KTtcbiAgICAgICAgdGhpcy5zY3JvbGxDaGF0V2luZG93KHdpbmRvdywgU2Nyb2xsRGlyZWN0aW9uLkJvdHRvbSk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBjbGVhckluVXNlRmlsZVVwbG9hZGVyKGZpbGVVcGxvYWRJbnN0YW5jZUlkOiBzdHJpbmcpOiB2b2lkIHtcbiAgICAgICAgY29uc3QgdXBsb2FkZXJJbnN0YW5jZUlkSW5kZXggPSB0aGlzLmZpbGVVcGxvYWRlcnNJblVzZS5pbmRleE9mKGZpbGVVcGxvYWRJbnN0YW5jZUlkKTtcblxuICAgICAgICBpZiAodXBsb2FkZXJJbnN0YW5jZUlkSW5kZXggPiAtMSkge1xuICAgICAgICAgICAgdGhpcy5maWxlVXBsb2FkZXJzSW5Vc2Uuc3BsaWNlKHVwbG9hZGVySW5zdGFuY2VJZEluZGV4LCAxKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8vIEhhbmRsZXMgZmlsZSBzZWxlY3Rpb24gYW5kIHVwbG9hZHMgdGhlIHNlbGVjdGVkIGZpbGUgdXNpbmcgdGhlIGZpbGUgdXBsb2FkIGFkYXB0ZXJcbiAgICBvbkZpbGVDaG9zZW4od2luZG93OiBXaW5kb3cpOiB2b2lkIHtcbiAgICAgICAgY29uc3QgZmlsZVVwbG9hZEluc3RhbmNlSWQgPSB0aGlzLmdldFVuaXF1ZUZpbGVVcGxvYWRJbnN0YW5jZUlkKHdpbmRvdyk7XG4gICAgICAgIGNvbnN0IHVwbG9hZEVsZW1lbnRSZWYgPSB0aGlzLm5hdGl2ZUZpbGVJbnB1dDtcblxuICAgICAgICBpZiAodXBsb2FkRWxlbWVudFJlZikge1xuICAgICAgICAgICAgY29uc3QgZmlsZTogRmlsZSA9IHVwbG9hZEVsZW1lbnRSZWYubmF0aXZlRWxlbWVudC5maWxlc1swXTtcblxuICAgICAgICAgICAgdGhpcy5maWxlVXBsb2FkZXJzSW5Vc2UucHVzaChmaWxlVXBsb2FkSW5zdGFuY2VJZCk7XG5cbiAgICAgICAgICAgIHRoaXMuZmlsZVVwbG9hZEFkYXB0ZXIudXBsb2FkRmlsZShmaWxlLCB3aW5kb3cucGFydGljaXBhbnQuaWQpXG4gICAgICAgICAgICAgICAgLnN1YnNjcmliZShmaWxlTWVzc2FnZSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuY2xlYXJJblVzZUZpbGVVcGxvYWRlcihmaWxlVXBsb2FkSW5zdGFuY2VJZCk7XG5cbiAgICAgICAgICAgICAgICAgICAgZmlsZU1lc3NhZ2UuZnJvbUlkID0gdGhpcy51c2VySWQ7XG5cbiAgICAgICAgICAgICAgICAgICAgLy8gUHVzaCBmaWxlIG1lc3NhZ2UgdG8gY3VycmVudCB1c2VyIHdpbmRvdyAgIFxuICAgICAgICAgICAgICAgICAgICB3aW5kb3cubWVzc2FnZXMucHVzaChmaWxlTWVzc2FnZSk7XG5cbiAgICAgICAgICAgICAgICAgICAgdGhpcy5vbk1lc3NhZ2VTZW50LmVtaXQoZmlsZU1lc3NhZ2UpO1xuXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuc2Nyb2xsQ2hhdFdpbmRvdyh3aW5kb3csIFNjcm9sbERpcmVjdGlvbi5Cb3R0b20pO1xuXG4gICAgICAgICAgICAgICAgICAgIC8vIFJlc2V0cyB0aGUgZmlsZSB1cGxvYWQgZWxlbWVudFxuICAgICAgICAgICAgICAgICAgICB1cGxvYWRFbGVtZW50UmVmLm5hdGl2ZUVsZW1lbnQudmFsdWUgPSAnJztcbiAgICAgICAgICAgICAgICB9LCAoZXJyb3IpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5jbGVhckluVXNlRmlsZVVwbG9hZGVyKGZpbGVVcGxvYWRJbnN0YW5jZUlkKTtcblxuICAgICAgICAgICAgICAgICAgICAvLyBSZXNldHMgdGhlIGZpbGUgdXBsb2FkIGVsZW1lbnRcbiAgICAgICAgICAgICAgICAgICAgdXBsb2FkRWxlbWVudFJlZi5uYXRpdmVFbGVtZW50LnZhbHVlID0gJyc7XG5cbiAgICAgICAgICAgICAgICAgICAgLy8gVE9ETzogSW52b2tlIGEgZmlsZSB1cGxvYWQgYWRhcHRlciBlcnJvciBoZXJlXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICB9XG59XG4iXX0=