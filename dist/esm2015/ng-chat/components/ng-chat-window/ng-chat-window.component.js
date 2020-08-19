import { __decorate } from "tslib";
import { Component, Input, Output, EventEmitter, ViewEncapsulation, ViewChild } from '@angular/core';
import { Message } from "../../core/message";
import { MessageType } from "../../core/message-type.enum";
import { ChatParticipantStatus } from "../../core/chat-participant-status.enum";
import { ScrollDirection } from "../../core/scroll-direction.enum";
import { ChatParticipantType } from "../../core/chat-participant-type.enum";
import { MessageCounter } from "../../core/message-counter";
import { chatParticipantStatusDescriptor } from '../../core/chat-participant-status-descriptor';
let NgChatWindowComponent = class NgChatWindowComponent {
    constructor() {
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
    ngOnInit() {
        var _a, _b, _c;
        this.windowClass = (_c = (_b = (_a = this.window) === null || _a === void 0 ? void 0 : _a.participant) === null || _b === void 0 ? void 0 : _b.windowOptions) === null || _c === void 0 ? void 0 : _c.windowClass;
        if (this.windowClass == undefined || this.windowClass == null)
            this.windowClass = '';
    }
    defaultWindowOptions(currentWindow) {
        if (this.showOptions && currentWindow.participant.participantType == ChatParticipantType.User) {
            return [{
                    isActive: false,
                    chattingTo: currentWindow,
                    validateContext: (participant) => {
                        return participant.participantType == ChatParticipantType.User;
                    },
                    displayLabel: 'Add People' // TODO: Localize this
                }];
        }
        return [];
    }
    // Asserts if a user avatar is visible in a chat cluster
    isAvatarVisible(window, message, index) {
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
    }
    getChatWindowAvatar(participant, message) {
        if (participant.participantType == ChatParticipantType.User) {
            return participant.avatar;
        }
        else if (participant.participantType == ChatParticipantType.Group) {
            let group = participant;
            let userIndex = group.chattingTo.findIndex(x => x.id == message.fromId);
            return group.chattingTo[userIndex >= 0 ? userIndex : 0].avatar;
        }
        return null;
    }
    getChatWindowAvatarSrc(participant, message) {
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
    }
    isUploadingFile(window) {
        const fileUploadInstanceId = this.getUniqueFileUploadInstanceId(window);
        return this.fileUploadersInUse.indexOf(fileUploadInstanceId) > -1;
    }
    // Generates a unique file uploader id for each participant
    getUniqueFileUploadInstanceId(window) {
        if (window && window.participant) {
            return `ng-chat-file-upload-${window.participant.id}`;
        }
        return 'ng-chat-file-upload';
    }
    unreadMessagesTotal(window) {
        return MessageCounter.unreadMessagesTotal(window, this.userId);
    }
    // Scrolls a chat window message flow to the bottom
    scrollChatWindow(window, direction) {
        if (!window.isCollapsed) {
            setTimeout(() => {
                if (this.chatMessages) {
                    let element = this.chatMessages.nativeElement;
                    let position = (direction === ScrollDirection.Top) ? 0 : element.scrollHeight;
                    element.scrollTop = position;
                }
            });
        }
    }
    activeOptionTrackerChange(option) {
        this.onOptionTriggered.emit(option);
    }
    // Triggers native file upload for file selection from the user
    triggerNativeFileUpload(window) {
        if (window) {
            if (this.nativeFileInput)
                this.nativeFileInput.nativeElement.click();
        }
    }
    // Toggles a window focus on the focus/blur of a 'newMessage' input
    toggleWindowFocus(window) {
        window.hasFocus = !window.hasFocus;
        if (window.hasFocus) {
            const unreadMessages = window.messages
                .filter(message => message.dateSeen == null
                && (message.toId == this.userId || window.participant.participantType === ChatParticipantType.Group));
            if (unreadMessages && unreadMessages.length > 0) {
                this.onMessagesSeen.emit(unreadMessages);
            }
        }
    }
    markMessagesAsRead(messages) {
        this.onMessagesSeen.emit(messages);
    }
    fetchMessageHistory(window) {
        this.onLoadHistoryTriggered.emit(window);
    }
    // Closes a chat window via the close 'X' button
    onCloseChatWindow() {
        this.onChatWindowClosed.emit({ closedWindow: this.window, closedViaEscapeKey: false });
    }
    /*  Monitors pressed keys on a chat window
        - Dispatches a message when the ENTER key is pressed
        - Tabs between windows on TAB or SHIFT + TAB
        - Closes the current focused window on ESC
    */
    onChatInputTyped(event, window) {
        switch (event.keyCode) {
            case 13:
                if (window.newMessage && window.newMessage.trim() != "") {
                    let message = new Message();
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
    }
    // Toggles a chat window visibility between maximized/minimized
    onChatWindowClicked(window) {
        window.isCollapsed = !window.isCollapsed;
        this.onChatWindowToggle.emit({ currentWindow: window, isCollapsed: window.isCollapsed });
        this.scrollChatWindow(window, ScrollDirection.Bottom);
    }
    clearInUseFileUploader(fileUploadInstanceId) {
        const uploaderInstanceIdIndex = this.fileUploadersInUse.indexOf(fileUploadInstanceId);
        if (uploaderInstanceIdIndex > -1) {
            this.fileUploadersInUse.splice(uploaderInstanceIdIndex, 1);
        }
    }
    // Handles file selection and uploads the selected file using the file upload adapter
    onFileChosen(window) {
        const fileUploadInstanceId = this.getUniqueFileUploadInstanceId(window);
        const uploadElementRef = this.nativeFileInput;
        if (uploadElementRef) {
            const file = uploadElementRef.nativeElement.files[0];
            this.fileUploadersInUse.push(fileUploadInstanceId);
            this.fileUploadAdapter.uploadFile(file, window.participant.id)
                .subscribe(fileMessage => {
                this.clearInUseFileUploader(fileUploadInstanceId);
                fileMessage.fromId = this.userId;
                // Push file message to current user window   
                window.messages.push(fileMessage);
                this.onMessageSent.emit(fileMessage);
                this.scrollChatWindow(window, ScrollDirection.Bottom);
                // Resets the file upload element
                uploadElementRef.nativeElement.value = '';
            }, (error) => {
                this.clearInUseFileUploader(fileUploadInstanceId);
                // Resets the file upload element
                uploadElementRef.nativeElement.value = '';
                // TODO: Invoke a file upload adapter error here
            });
        }
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
export { NgChatWindowComponent };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmctY2hhdC13aW5kb3cuY29tcG9uZW50LmpzIiwic291cmNlUm9vdCI6Im5nOi8vbmctY2hhdC8iLCJzb3VyY2VzIjpbIm5nLWNoYXQvY29tcG9uZW50cy9uZy1jaGF0LXdpbmRvdy9uZy1jaGF0LXdpbmRvdy5jb21wb25lbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBLE9BQU8sRUFBRSxTQUFTLEVBQUUsS0FBSyxFQUFFLE1BQU0sRUFBRSxZQUFZLEVBQUUsaUJBQWlCLEVBQUUsU0FBUyxFQUFzQixNQUFNLGVBQWUsQ0FBQztBQUV6SCxPQUFPLEVBQUUsT0FBTyxFQUFFLE1BQU0sb0JBQW9CLENBQUM7QUFDN0MsT0FBTyxFQUFFLFdBQVcsRUFBRSxNQUFNLDhCQUE4QixDQUFDO0FBRTNELE9BQU8sRUFBRSxxQkFBcUIsRUFBRSxNQUFNLHlDQUF5QyxDQUFDO0FBQ2hGLE9BQU8sRUFBRSxlQUFlLEVBQUUsTUFBTSxrQ0FBa0MsQ0FBQztBQU1uRSxPQUFPLEVBQUUsbUJBQW1CLEVBQUUsTUFBTSx1Q0FBdUMsQ0FBQztBQUU1RSxPQUFPLEVBQUUsY0FBYyxFQUFFLE1BQU0sNEJBQTRCLENBQUM7QUFDNUQsT0FBTyxFQUFFLCtCQUErQixFQUFFLE1BQU0sK0NBQStDLENBQUM7QUFRaEcsSUFBYSxxQkFBcUIsR0FBbEMsTUFBYSxxQkFBcUI7SUFFOUI7UUFEQSxnQkFBVyxHQUFxQixFQUFFLENBQUM7UUE2QjVCLGtCQUFhLEdBQVksSUFBSSxDQUFDO1FBRzlCLGtCQUFhLEdBQVksSUFBSSxDQUFDO1FBRzlCLG9CQUFlLEdBQVksSUFBSSxDQUFDO1FBR2hDLDBCQUFxQixHQUFXLE9BQU8sQ0FBQztRQUd4QyxvQkFBZSxHQUFZLElBQUksQ0FBQztRQUdoQyx1QkFBa0IsR0FBdUUsSUFBSSxZQUFZLEVBQUUsQ0FBQztRQUc1Ryx1QkFBa0IsR0FBaUUsSUFBSSxZQUFZLEVBQUUsQ0FBQztRQUd0RyxtQkFBYyxHQUE0QixJQUFJLFlBQVksRUFBRSxDQUFD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RUFBRTs0REFDNkI7QUFHckM7SUFEQyxLQUFLLEVBQUU7NERBQzZCO0FBR3JDO0lBREMsS0FBSyxFQUFFOzhEQUMrQjtBQUd2QztJQURDLEtBQUssRUFBRTtvRUFDdUM7QUFHL0M7SUFEQyxLQUFLLEVBQUU7OERBQytCO0FBR3ZDO0lBREMsTUFBTSxFQUFFO2lFQUMwRztBQUduSDtJQURDLE1BQU0sRUFBRTtpRUFDb0c7QUFHN0c7SUFEQyxNQUFNLEVBQUU7NkRBQzJEO0FBR3BFO0lBREMsTUFBTSxFQUFFOzREQUN3RDtBQUdqRTtJQURDLE1BQU0sRUFBRTs2REFDd0c7QUFHakg7SUFEQyxNQUFNLEVBQUU7Z0VBQ2dFO0FBR3pFO0lBREMsTUFBTSxFQUFFO3FFQUNnRTtBQUU5QztJQUExQixTQUFTLENBQUMsY0FBYyxDQUFDOzJEQUFtQjtBQUNmO0lBQTdCLFNBQVMsQ0FBQyxpQkFBaUIsQ0FBQzs4REFBNkI7QUFDNUI7SUFBN0IsU0FBUyxDQUFDLGlCQUFpQixDQUFDOzhEQUFzQjtBQW5FMUMscUJBQXFCO0lBTmpDLFNBQVMsQ0FBQztRQUNQLFFBQVEsRUFBRSxnQkFBZ0I7UUFDMUIsKzZOQUE4QztRQUU5QyxhQUFhLEVBQUUsaUJBQWlCLENBQUMsSUFBSTs7S0FDeEMsQ0FBQztHQUNXLHFCQUFxQixDQWtVakM7U0FsVVkscUJBQXFCIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgQ29tcG9uZW50LCBJbnB1dCwgT3V0cHV0LCBFdmVudEVtaXR0ZXIsIFZpZXdFbmNhcHN1bGF0aW9uLCBWaWV3Q2hpbGQsIEVsZW1lbnRSZWYsIE9uSW5pdCB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuXG5pbXBvcnQgeyBNZXNzYWdlIH0gZnJvbSBcIi4uLy4uL2NvcmUvbWVzc2FnZVwiO1xuaW1wb3J0IHsgTWVzc2FnZVR5cGUgfSBmcm9tIFwiLi4vLi4vY29yZS9tZXNzYWdlLXR5cGUuZW51bVwiO1xuaW1wb3J0IHsgV2luZG93IH0gZnJvbSBcIi4uLy4uL2NvcmUvd2luZG93XCI7XG5pbXBvcnQgeyBDaGF0UGFydGljaXBhbnRTdGF0dXMgfSBmcm9tIFwiLi4vLi4vY29yZS9jaGF0LXBhcnRpY2lwYW50LXN0YXR1cy5lbnVtXCI7XG5pbXBvcnQgeyBTY3JvbGxEaXJlY3Rpb24gfSBmcm9tIFwiLi4vLi4vY29yZS9zY3JvbGwtZGlyZWN0aW9uLmVudW1cIjtcbmltcG9ydCB7IExvY2FsaXphdGlvbiB9IGZyb20gJy4uLy4uL2NvcmUvbG9jYWxpemF0aW9uJztcbmltcG9ydCB7IElGaWxlVXBsb2FkQWRhcHRlciB9IGZyb20gJy4uLy4uL2NvcmUvZmlsZS11cGxvYWQtYWRhcHRlcic7XG5pbXBvcnQgeyBJQ2hhdE9wdGlvbiB9IGZyb20gJy4uLy4uL2NvcmUvY2hhdC1vcHRpb24nO1xuaW1wb3J0IHsgV2luZG93T3B0aW9uIH0gZnJvbSAnLi4vLi4vY29yZS93aW5kb3ctb3B0aW9uJztcbmltcG9ydCB7IEdyb3VwIH0gZnJvbSBcIi4uLy4uL2NvcmUvZ3JvdXBcIjtcbmltcG9ydCB7IENoYXRQYXJ0aWNpcGFudFR5cGUgfSBmcm9tIFwiLi4vLi4vY29yZS9jaGF0LXBhcnRpY2lwYW50LXR5cGUuZW51bVwiO1xuaW1wb3J0IHsgSUNoYXRQYXJ0aWNpcGFudCB9IGZyb20gXCIuLi8uLi9jb3JlL2NoYXQtcGFydGljaXBhbnRcIjtcbmltcG9ydCB7IE1lc3NhZ2VDb3VudGVyIH0gZnJvbSBcIi4uLy4uL2NvcmUvbWVzc2FnZS1jb3VudGVyXCI7XG5pbXBvcnQgeyBjaGF0UGFydGljaXBhbnRTdGF0dXNEZXNjcmlwdG9yIH0gZnJvbSAnLi4vLi4vY29yZS9jaGF0LXBhcnRpY2lwYW50LXN0YXR1cy1kZXNjcmlwdG9yJztcblxuQENvbXBvbmVudCh7XG4gICAgc2VsZWN0b3I6ICduZy1jaGF0LXdpbmRvdycsXG4gICAgdGVtcGxhdGVVcmw6ICcuL25nLWNoYXQtd2luZG93LmNvbXBvbmVudC5odG1sJyxcbiAgICBzdHlsZVVybHM6IFsnLi9uZy1jaGF0LXdpbmRvdy5jb21wb25lbnQuY3NzJ10sXG4gICAgZW5jYXBzdWxhdGlvbjogVmlld0VuY2Fwc3VsYXRpb24uTm9uZVxufSlcbmV4cG9ydCBjbGFzcyBOZ0NoYXRXaW5kb3dDb21wb25lbnQgaW1wbGVtZW50cyBPbkluaXQge1xuICAgIHdpbmRvd0NsYXNzOiBzdHJpbmd8dW5kZWZpbmVkID0gJyc7XG4gICAgY29uc3RydWN0b3IoKSB7XG4gICAgICAgIC8vdGhpcy53aW5kb3dPcHRpb25zID0gdGhpcy53aW5kb3cucGFydGljaXBhbnQud2luZG93T3B0aW9ucztcbiAgICAgfVxuXG4gICAgIC8vd2luZG93T3B0aW9uczogV2luZG93T3B0aW9uIHwgbnVsbDtcblxuICAgICBuZ09uSW5pdCgpIHtcbiAgICAgICAgIHRoaXMud2luZG93Q2xhc3MgPSAgdGhpcy53aW5kb3c/LnBhcnRpY2lwYW50Py53aW5kb3dPcHRpb25zPy53aW5kb3dDbGFzcztcbiAgICAgICAgIGlmKHRoaXMud2luZG93Q2xhc3MgPT0gdW5kZWZpbmVkIHx8IHRoaXMud2luZG93Q2xhc3MgPT0gbnVsbClcbiAgICAgICAgICAgIHRoaXMud2luZG93Q2xhc3MgPScnO1xuICAgICB9XG5cbiAgICBASW5wdXQoKVxuICAgIHB1YmxpYyBmaWxlVXBsb2FkQWRhcHRlcjogSUZpbGVVcGxvYWRBZGFwdGVyO1xuXG4gICAgQElucHV0KClcbiAgICBwdWJsaWMgd2luZG93OiBXaW5kb3c7XG5cbiAgICBASW5wdXQoKVxuICAgIHB1YmxpYyB1c2VySWQ6IGFueTtcblxuICAgIEBJbnB1dCgpXG4gICAgcHVibGljIGxvY2FsaXphdGlvbjogTG9jYWxpemF0aW9uO1xuXG4gICAgQElucHV0KClcbiAgICBwdWJsaWMgc2hvd09wdGlvbnM6IGJvb2xlYW47XG5cbiAgICBASW5wdXQoKSAgICBcbiAgICBwdWJsaWMgZW1vamlzRW5hYmxlZDogYm9vbGVhbiA9IHRydWU7XG5cbiAgICBASW5wdXQoKSAgICBcbiAgICBwdWJsaWMgbGlua2Z5RW5hYmxlZDogYm9vbGVhbiA9IHRydWU7XG5cbiAgICBASW5wdXQoKVxuICAgIHB1YmxpYyBzaG93TWVzc2FnZURhdGU6IGJvb2xlYW4gPSB0cnVlO1xuXG4gICAgQElucHV0KClcbiAgICBwdWJsaWMgbWVzc2FnZURhdGVQaXBlRm9ybWF0OiBzdHJpbmcgPSBcInNob3J0XCI7XG5cbiAgICBASW5wdXQoKVxuICAgIHB1YmxpYyBoYXNQYWdlZEhpc3Rvcnk6IGJvb2xlYW4gPSB0cnVlO1xuXG4gICAgQE91dHB1dCgpXG4gICAgcHVibGljIG9uQ2hhdFdpbmRvd0Nsb3NlZDogRXZlbnRFbWl0dGVyPHsgY2xvc2VkV2luZG93OiBXaW5kb3csIGNsb3NlZFZpYUVzY2FwZUtleTogYm9vbGVhbn0+ID0gbmV3IEV2ZW50RW1pdHRlcigpO1xuXG4gICAgQE91dHB1dCgpXG4gICAgcHVibGljIG9uQ2hhdFdpbmRvd1RvZ2dsZTogRXZlbnRFbWl0dGVyPHsgY3VycmVudFdpbmRvdzogV2luZG93LCBpc0NvbGxhcHNlZDogYm9vbGVhbn0+ID0gbmV3IEV2ZW50RW1pdHRlcigpO1xuXG4gICAgQE91dHB1dCgpXG4gICAgcHVibGljIG9uTWVzc2FnZXNTZWVuOiBFdmVudEVtaXR0ZXI8TWVzc2FnZVtdPiA9IG5ldyBFdmVudEVtaXR0ZXIoKTtcblxuICAgIEBPdXRwdXQoKVxuICAgIHB1YmxpYyBvbk1lc3NhZ2VTZW50OiBFdmVudEVtaXR0ZXI8TWVzc2FnZT4gPSBuZXcgRXZlbnRFbWl0dGVyKCk7XG5cbiAgICBAT3V0cHV0KClcbiAgICBwdWJsaWMgb25UYWJUcmlnZ2VyZWQ6IEV2ZW50RW1pdHRlcjx7IHRyaWdnZXJpbmdXaW5kb3c6IFdpbmRvdywgc2hpZnRLZXlQcmVzc2VkOiBib29sZWFuIH0+ID0gbmV3IEV2ZW50RW1pdHRlcigpO1xuXG4gICAgQE91dHB1dCgpXG4gICAgcHVibGljIG9uT3B0aW9uVHJpZ2dlcmVkOiBFdmVudEVtaXR0ZXI8SUNoYXRPcHRpb24+ID0gbmV3IEV2ZW50RW1pdHRlcigpO1xuXG4gICAgQE91dHB1dCgpXG4gICAgcHVibGljIG9uTG9hZEhpc3RvcnlUcmlnZ2VyZWQ6IEV2ZW50RW1pdHRlcjxXaW5kb3c+ID0gbmV3IEV2ZW50RW1pdHRlcigpO1xuXG4gICAgQFZpZXdDaGlsZCgnY2hhdE1lc3NhZ2VzJykgY2hhdE1lc3NhZ2VzOiBhbnk7XG4gICAgQFZpZXdDaGlsZCgnbmF0aXZlRmlsZUlucHV0JykgbmF0aXZlRmlsZUlucHV0OiBFbGVtZW50UmVmO1xuICAgIEBWaWV3Q2hpbGQoJ2NoYXRXaW5kb3dJbnB1dCcpIGNoYXRXaW5kb3dJbnB1dDogYW55O1xuXG4gICAgLy8gRmlsZSB1cGxvYWQgc3RhdGVcbiAgICBwdWJsaWMgZmlsZVVwbG9hZGVyc0luVXNlOiBzdHJpbmdbXSA9IFtdOyAvLyBJZCBidWNrZXQgb2YgdXBsb2FkZXJzIGluIHVzZVxuXG4gICAgLy8gRXhwb3NlcyBlbnVtcyBhbmQgZnVuY3Rpb25zIGZvciB0aGUgbmctdGVtcGxhdGVcbiAgICBwdWJsaWMgQ2hhdFBhcnRpY2lwYW50VHlwZSA9IENoYXRQYXJ0aWNpcGFudFR5cGU7XG4gICAgcHVibGljIENoYXRQYXJ0aWNpcGFudFN0YXR1cyA9IENoYXRQYXJ0aWNpcGFudFN0YXR1cztcbiAgICBwdWJsaWMgTWVzc2FnZVR5cGUgPSBNZXNzYWdlVHlwZTtcbiAgICBwdWJsaWMgY2hhdFBhcnRpY2lwYW50U3RhdHVzRGVzY3JpcHRvciA9IGNoYXRQYXJ0aWNpcGFudFN0YXR1c0Rlc2NyaXB0b3I7XG5cbiAgICBkZWZhdWx0V2luZG93T3B0aW9ucyhjdXJyZW50V2luZG93OiBXaW5kb3cpOiBJQ2hhdE9wdGlvbltdXG4gICAge1xuICAgICAgICBpZiAodGhpcy5zaG93T3B0aW9ucyAmJiBjdXJyZW50V2luZG93LnBhcnRpY2lwYW50LnBhcnRpY2lwYW50VHlwZSA9PSBDaGF0UGFydGljaXBhbnRUeXBlLlVzZXIpXG4gICAgICAgIHtcbiAgICAgICAgICAgIHJldHVybiBbe1xuICAgICAgICAgICAgICAgIGlzQWN0aXZlOiBmYWxzZSxcbiAgICAgICAgICAgICAgICBjaGF0dGluZ1RvOiBjdXJyZW50V2luZG93LFxuICAgICAgICAgICAgICAgIHZhbGlkYXRlQ29udGV4dDogKHBhcnRpY2lwYW50OiBJQ2hhdFBhcnRpY2lwYW50KSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBwYXJ0aWNpcGFudC5wYXJ0aWNpcGFudFR5cGUgPT0gQ2hhdFBhcnRpY2lwYW50VHlwZS5Vc2VyO1xuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgZGlzcGxheUxhYmVsOiAnQWRkIFBlb3BsZScgLy8gVE9ETzogTG9jYWxpemUgdGhpc1xuICAgICAgICAgICAgfV07XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gW107XG4gICAgfVxuXG4gICAgLy8gQXNzZXJ0cyBpZiBhIHVzZXIgYXZhdGFyIGlzIHZpc2libGUgaW4gYSBjaGF0IGNsdXN0ZXJcbiAgICBpc0F2YXRhclZpc2libGUod2luZG93OiBXaW5kb3csIG1lc3NhZ2U6IE1lc3NhZ2UsIGluZGV4OiBudW1iZXIpOiBib29sZWFuXG4gICAge1xuICAgICAgICBpZiAobWVzc2FnZS5mcm9tSWQgIT0gdGhpcy51c2VySWQpe1xuICAgICAgICAgICAgaWYgKGluZGV4ID09IDApe1xuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlOyAvLyBGaXJzdCBtZXNzYWdlLCBnb29kIHRvIHNob3cgdGhlIHRodW1ibmFpbFxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZXtcbiAgICAgICAgICAgICAgICAvLyBDaGVjayBpZiB0aGUgcHJldmlvdXMgbWVzc2FnZSBiZWxvbmdzIHRvIHRoZSBzYW1lIHVzZXIsIGlmIGl0IGJlbG9uZ3MgdGhlcmUgaXMgbm8gbmVlZCB0byBzaG93IHRoZSBhdmF0YXIgYWdhaW4gdG8gZm9ybSB0aGUgbWVzc2FnZSBjbHVzdGVyXG4gICAgICAgICAgICAgICAgaWYgKHdpbmRvdy5tZXNzYWdlc1tpbmRleCAtIDFdLmZyb21JZCAhPSBtZXNzYWdlLmZyb21JZCl7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICBnZXRDaGF0V2luZG93QXZhdGFyKHBhcnRpY2lwYW50OiBJQ2hhdFBhcnRpY2lwYW50LCBtZXNzYWdlOiBNZXNzYWdlKTogc3RyaW5nIHwgbnVsbFxuICAgIHtcbiAgICAgICAgaWYgKHBhcnRpY2lwYW50LnBhcnRpY2lwYW50VHlwZSA9PSBDaGF0UGFydGljaXBhbnRUeXBlLlVzZXIpXG4gICAgICAgIHtcbiAgICAgICAgICAgIHJldHVybiBwYXJ0aWNpcGFudC5hdmF0YXI7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAocGFydGljaXBhbnQucGFydGljaXBhbnRUeXBlID09IENoYXRQYXJ0aWNpcGFudFR5cGUuR3JvdXApXG4gICAgICAgIHtcbiAgICAgICAgICAgIGxldCBncm91cCA9IHBhcnRpY2lwYW50IGFzIEdyb3VwO1xuICAgICAgICAgICAgbGV0IHVzZXJJbmRleCA9IGdyb3VwLmNoYXR0aW5nVG8uZmluZEluZGV4KHggPT4geC5pZCA9PSBtZXNzYWdlLmZyb21JZCk7XG5cbiAgICAgICAgICAgIHJldHVybiBncm91cC5jaGF0dGluZ1RvW3VzZXJJbmRleCA+PSAwID8gdXNlckluZGV4IDogMF0uYXZhdGFyO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuXG4gICAgZ2V0Q2hhdFdpbmRvd0F2YXRhclNyYyhwYXJ0aWNpcGFudDogSUNoYXRQYXJ0aWNpcGFudCwgbWVzc2FnZTogTWVzc2FnZSk6IHN0cmluZyB8IG51bGxcbiAgICB7XG4gICAgICAgIGlmIChwYXJ0aWNpcGFudC5wYXJ0aWNpcGFudFR5cGUgPT0gQ2hhdFBhcnRpY2lwYW50VHlwZS5Vc2VyKVxuICAgICAgICB7XG4gICAgICAgICAgICByZXR1cm4gcGFydGljaXBhbnQuYXZhdGFyU3JjO1xuICAgICAgICB9XG4gICAgICAgIC8vIGVsc2UgaWYgKHBhcnRpY2lwYW50LnBhcnRpY2lwYW50VHlwZSA9PSBDaGF0UGFydGljaXBhbnRUeXBlLkdyb3VwKVxuICAgICAgICAvLyB7XG4gICAgICAgIC8vICAgICBsZXQgZ3JvdXAgPSBwYXJ0aWNpcGFudCBhcyBHcm91cDtcbiAgICAgICAgLy8gICAgIGxldCB1c2VySW5kZXggPSBncm91cC5jaGF0dGluZ1RvLmZpbmRJbmRleCh4ID0+IHguaWQgPT0gbWVzc2FnZS5mcm9tSWQpO1xuXG4gICAgICAgIC8vICAgICByZXR1cm4gZ3JvdXAuY2hhdHRpbmdUb1t1c2VySW5kZXggPj0gMCA/IHVzZXJJbmRleCA6IDBdLmF2YXRhcjtcbiAgICAgICAgLy8gfVxuXG4gICAgICAgIHJldHVybiBudWxsO1xuICAgIH1cblxuICAgIGlzVXBsb2FkaW5nRmlsZSh3aW5kb3c6IFdpbmRvdyk6IGJvb2xlYW5cbiAgICB7XG4gICAgICAgIGNvbnN0IGZpbGVVcGxvYWRJbnN0YW5jZUlkID0gdGhpcy5nZXRVbmlxdWVGaWxlVXBsb2FkSW5zdGFuY2VJZCh3aW5kb3cpO1xuXG4gICAgICAgIHJldHVybiB0aGlzLmZpbGVVcGxvYWRlcnNJblVzZS5pbmRleE9mKGZpbGVVcGxvYWRJbnN0YW5jZUlkKSA+IC0xO1xuICAgIH1cblxuICAgIC8vIEdlbmVyYXRlcyBhIHVuaXF1ZSBmaWxlIHVwbG9hZGVyIGlkIGZvciBlYWNoIHBhcnRpY2lwYW50XG4gICAgZ2V0VW5pcXVlRmlsZVVwbG9hZEluc3RhbmNlSWQod2luZG93OiBXaW5kb3cpOiBzdHJpbmdcbiAgICB7XG4gICAgICAgIGlmICh3aW5kb3cgJiYgd2luZG93LnBhcnRpY2lwYW50KVxuICAgICAgICB7XG4gICAgICAgICAgICByZXR1cm4gYG5nLWNoYXQtZmlsZS11cGxvYWQtJHt3aW5kb3cucGFydGljaXBhbnQuaWR9YDtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgcmV0dXJuICduZy1jaGF0LWZpbGUtdXBsb2FkJztcbiAgICB9XG5cbiAgICB1bnJlYWRNZXNzYWdlc1RvdGFsKHdpbmRvdzogV2luZG93KTogc3RyaW5nXG4gICAgeyAgICAgICAgICAgXG4gICAgICAgIHJldHVybiBNZXNzYWdlQ291bnRlci51bnJlYWRNZXNzYWdlc1RvdGFsKHdpbmRvdywgdGhpcy51c2VySWQpO1xuICAgIH1cblxuICAgIC8vIFNjcm9sbHMgYSBjaGF0IHdpbmRvdyBtZXNzYWdlIGZsb3cgdG8gdGhlIGJvdHRvbVxuICAgIHNjcm9sbENoYXRXaW5kb3cod2luZG93OiBXaW5kb3csIGRpcmVjdGlvbjogU2Nyb2xsRGlyZWN0aW9uKTogdm9pZFxuICAgIHtcbiAgICAgICAgaWYgKCF3aW5kb3cuaXNDb2xsYXBzZWQpe1xuICAgICAgICAgICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuY2hhdE1lc3NhZ2VzKXtcbiAgICAgICAgICAgICAgICAgICAgbGV0IGVsZW1lbnQgPSB0aGlzLmNoYXRNZXNzYWdlcy5uYXRpdmVFbGVtZW50O1xuICAgICAgICAgICAgICAgICAgICBsZXQgcG9zaXRpb24gPSAoIGRpcmVjdGlvbiA9PT0gU2Nyb2xsRGlyZWN0aW9uLlRvcCApID8gMCA6IGVsZW1lbnQuc2Nyb2xsSGVpZ2h0O1xuICAgICAgICAgICAgICAgICAgICBlbGVtZW50LnNjcm9sbFRvcCA9IHBvc2l0aW9uO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pOyBcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGFjdGl2ZU9wdGlvblRyYWNrZXJDaGFuZ2Uob3B0aW9uOiBJQ2hhdE9wdGlvbik6IHZvaWQge1xuICAgICAgICB0aGlzLm9uT3B0aW9uVHJpZ2dlcmVkLmVtaXQob3B0aW9uKTtcbiAgICB9XG5cbiAgICAvLyBUcmlnZ2VycyBuYXRpdmUgZmlsZSB1cGxvYWQgZm9yIGZpbGUgc2VsZWN0aW9uIGZyb20gdGhlIHVzZXJcbiAgICB0cmlnZ2VyTmF0aXZlRmlsZVVwbG9hZCh3aW5kb3c6IFdpbmRvdyk6IHZvaWRcbiAgICB7XG4gICAgICAgIGlmICh3aW5kb3cpXG4gICAgICAgIHtcbiAgICAgICAgICAgIGlmICh0aGlzLm5hdGl2ZUZpbGVJbnB1dCkgdGhpcy5uYXRpdmVGaWxlSW5wdXQubmF0aXZlRWxlbWVudC5jbGljaygpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLy8gVG9nZ2xlcyBhIHdpbmRvdyBmb2N1cyBvbiB0aGUgZm9jdXMvYmx1ciBvZiBhICduZXdNZXNzYWdlJyBpbnB1dFxuICAgIHRvZ2dsZVdpbmRvd0ZvY3VzKHdpbmRvdzogV2luZG93KTogdm9pZFxuICAgIHtcbiAgICAgICAgd2luZG93Lmhhc0ZvY3VzID0gIXdpbmRvdy5oYXNGb2N1cztcbiAgICAgICAgaWYod2luZG93Lmhhc0ZvY3VzKSB7XG4gICAgICAgICAgICBjb25zdCB1bnJlYWRNZXNzYWdlcyA9IHdpbmRvdy5tZXNzYWdlc1xuICAgICAgICAgICAgICAgIC5maWx0ZXIobWVzc2FnZSA9PiBtZXNzYWdlLmRhdGVTZWVuID09IG51bGwgXG4gICAgICAgICAgICAgICAgICAgICYmIChtZXNzYWdlLnRvSWQgPT0gdGhpcy51c2VySWQgfHwgd2luZG93LnBhcnRpY2lwYW50LnBhcnRpY2lwYW50VHlwZSA9PT0gQ2hhdFBhcnRpY2lwYW50VHlwZS5Hcm91cCkpO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICBpZiAodW5yZWFkTWVzc2FnZXMgJiYgdW5yZWFkTWVzc2FnZXMubGVuZ3RoID4gMClcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICB0aGlzLm9uTWVzc2FnZXNTZWVuLmVtaXQodW5yZWFkTWVzc2FnZXMpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgbWFya01lc3NhZ2VzQXNSZWFkKG1lc3NhZ2VzOiBNZXNzYWdlW10pOiB2b2lkIFxuICAgIHtcbiAgICAgICAgdGhpcy5vbk1lc3NhZ2VzU2Vlbi5lbWl0KG1lc3NhZ2VzKTtcbiAgICB9XG5cbiAgICBmZXRjaE1lc3NhZ2VIaXN0b3J5KHdpbmRvdzogV2luZG93KTogdm9pZCB7XG4gICAgICAgIHRoaXMub25Mb2FkSGlzdG9yeVRyaWdnZXJlZC5lbWl0KHdpbmRvdyk7XG4gICAgfVxuXG4gICAgLy8gQ2xvc2VzIGEgY2hhdCB3aW5kb3cgdmlhIHRoZSBjbG9zZSAnWCcgYnV0dG9uXG4gICAgb25DbG9zZUNoYXRXaW5kb3coKTogdm9pZCBcbiAgICB7XG4gICAgICAgIHRoaXMub25DaGF0V2luZG93Q2xvc2VkLmVtaXQoeyBjbG9zZWRXaW5kb3c6IHRoaXMud2luZG93LCBjbG9zZWRWaWFFc2NhcGVLZXk6IGZhbHNlIH0pO1xuICAgIH1cblxuICAgIC8qICBNb25pdG9ycyBwcmVzc2VkIGtleXMgb24gYSBjaGF0IHdpbmRvd1xuICAgICAgICAtIERpc3BhdGNoZXMgYSBtZXNzYWdlIHdoZW4gdGhlIEVOVEVSIGtleSBpcyBwcmVzc2VkXG4gICAgICAgIC0gVGFicyBiZXR3ZWVuIHdpbmRvd3Mgb24gVEFCIG9yIFNISUZUICsgVEFCXG4gICAgICAgIC0gQ2xvc2VzIHRoZSBjdXJyZW50IGZvY3VzZWQgd2luZG93IG9uIEVTQ1xuICAgICovXG4gICBvbkNoYXRJbnB1dFR5cGVkKGV2ZW50OiBhbnksIHdpbmRvdzogV2luZG93KTogdm9pZFxuICAge1xuICAgICAgIHN3aXRjaCAoZXZlbnQua2V5Q29kZSlcbiAgICAgICB7XG4gICAgICAgICAgIGNhc2UgMTM6XG4gICAgICAgICAgICAgICBpZiAod2luZG93Lm5ld01lc3NhZ2UgJiYgd2luZG93Lm5ld01lc3NhZ2UudHJpbSgpICE9IFwiXCIpXG4gICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgbGV0IG1lc3NhZ2UgPSBuZXcgTWVzc2FnZSgpO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgbWVzc2FnZS5mcm9tSWQgPSB0aGlzLnVzZXJJZDtcbiAgICAgICAgICAgICAgICAgICBtZXNzYWdlLnRvSWQgPSB3aW5kb3cucGFydGljaXBhbnQuaWQ7XG4gICAgICAgICAgICAgICAgICAgbWVzc2FnZS5tZXNzYWdlID0gd2luZG93Lm5ld01lc3NhZ2U7XG4gICAgICAgICAgICAgICAgICAgbWVzc2FnZS5kYXRlU2VudCA9IG5ldyBEYXRlKCk7XG4gICAgICAgXG4gICAgICAgICAgICAgICAgICAgd2luZG93Lm1lc3NhZ2VzLnB1c2gobWVzc2FnZSk7XG4gICAgICAgXG4gICAgICAgICAgICAgICAgICAgdGhpcy5vbk1lc3NhZ2VTZW50LmVtaXQobWVzc2FnZSk7XG4gICAgICAgXG4gICAgICAgICAgICAgICAgICAgd2luZG93Lm5ld01lc3NhZ2UgPSBcIlwiOyAvLyBSZXNldHMgdGhlIG5ldyBtZXNzYWdlIGlucHV0XG4gICAgICAgXG4gICAgICAgICAgICAgICAgICAgdGhpcy5zY3JvbGxDaGF0V2luZG93KHdpbmRvdywgU2Nyb2xsRGlyZWN0aW9uLkJvdHRvbSk7XG4gICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgY2FzZSA5OlxuICAgICAgICAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcblxuICAgICAgICAgICAgICAgdGhpcy5vblRhYlRyaWdnZXJlZC5lbWl0KHsgdHJpZ2dlcmluZ1dpbmRvdzogd2luZG93LCBzaGlmdEtleVByZXNzZWQ6IGV2ZW50LnNoaWZ0S2V5IH0pO1xuXG4gICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgY2FzZSAyNzpcbiAgICAgICAgICAgICAgIHRoaXMub25DaGF0V2luZG93Q2xvc2VkLmVtaXQoeyBjbG9zZWRXaW5kb3c6IHdpbmRvdywgY2xvc2VkVmlhRXNjYXBlS2V5OiB0cnVlIH0pO1xuXG4gICAgICAgICAgICAgICBicmVhaztcbiAgICAgICB9XG4gICB9XG5cbiAgICAvLyBUb2dnbGVzIGEgY2hhdCB3aW5kb3cgdmlzaWJpbGl0eSBiZXR3ZWVuIG1heGltaXplZC9taW5pbWl6ZWRcbiAgICBvbkNoYXRXaW5kb3dDbGlja2VkKHdpbmRvdzogV2luZG93KTogdm9pZFxuICAgIHtcbiAgICAgICAgd2luZG93LmlzQ29sbGFwc2VkID0gIXdpbmRvdy5pc0NvbGxhcHNlZDtcbiAgICAgICAgdGhpcy5vbkNoYXRXaW5kb3dUb2dnbGUuZW1pdCh7IGN1cnJlbnRXaW5kb3c6IHdpbmRvdywgaXNDb2xsYXBzZWQ6IHdpbmRvdy5pc0NvbGxhcHNlZCB9KTtcbiAgICAgICAgdGhpcy5zY3JvbGxDaGF0V2luZG93KHdpbmRvdywgU2Nyb2xsRGlyZWN0aW9uLkJvdHRvbSk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBjbGVhckluVXNlRmlsZVVwbG9hZGVyKGZpbGVVcGxvYWRJbnN0YW5jZUlkOiBzdHJpbmcpOiB2b2lkXG4gICAge1xuICAgICAgICBjb25zdCB1cGxvYWRlckluc3RhbmNlSWRJbmRleCA9IHRoaXMuZmlsZVVwbG9hZGVyc0luVXNlLmluZGV4T2YoZmlsZVVwbG9hZEluc3RhbmNlSWQpO1xuXG4gICAgICAgIGlmICh1cGxvYWRlckluc3RhbmNlSWRJbmRleCA+IC0xKSB7XG4gICAgICAgICAgICB0aGlzLmZpbGVVcGxvYWRlcnNJblVzZS5zcGxpY2UodXBsb2FkZXJJbnN0YW5jZUlkSW5kZXgsIDEpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLy8gSGFuZGxlcyBmaWxlIHNlbGVjdGlvbiBhbmQgdXBsb2FkcyB0aGUgc2VsZWN0ZWQgZmlsZSB1c2luZyB0aGUgZmlsZSB1cGxvYWQgYWRhcHRlclxuICAgIG9uRmlsZUNob3Nlbih3aW5kb3c6IFdpbmRvdyk6IHZvaWQge1xuICAgICAgICBjb25zdCBmaWxlVXBsb2FkSW5zdGFuY2VJZCA9IHRoaXMuZ2V0VW5pcXVlRmlsZVVwbG9hZEluc3RhbmNlSWQod2luZG93KTtcbiAgICAgICAgY29uc3QgdXBsb2FkRWxlbWVudFJlZiA9IHRoaXMubmF0aXZlRmlsZUlucHV0O1xuXG4gICAgICAgIGlmICh1cGxvYWRFbGVtZW50UmVmKVxuICAgICAgICB7XG4gICAgICAgICAgICBjb25zdCBmaWxlOiBGaWxlID0gdXBsb2FkRWxlbWVudFJlZi5uYXRpdmVFbGVtZW50LmZpbGVzWzBdO1xuXG4gICAgICAgICAgICB0aGlzLmZpbGVVcGxvYWRlcnNJblVzZS5wdXNoKGZpbGVVcGxvYWRJbnN0YW5jZUlkKTtcblxuICAgICAgICAgICAgdGhpcy5maWxlVXBsb2FkQWRhcHRlci51cGxvYWRGaWxlKGZpbGUsIHdpbmRvdy5wYXJ0aWNpcGFudC5pZClcbiAgICAgICAgICAgICAgICAuc3Vic2NyaWJlKGZpbGVNZXNzYWdlID0+IHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5jbGVhckluVXNlRmlsZVVwbG9hZGVyKGZpbGVVcGxvYWRJbnN0YW5jZUlkKTtcblxuICAgICAgICAgICAgICAgICAgICBmaWxlTWVzc2FnZS5mcm9tSWQgPSB0aGlzLnVzZXJJZDtcblxuICAgICAgICAgICAgICAgICAgICAvLyBQdXNoIGZpbGUgbWVzc2FnZSB0byBjdXJyZW50IHVzZXIgd2luZG93ICAgXG4gICAgICAgICAgICAgICAgICAgIHdpbmRvdy5tZXNzYWdlcy5wdXNoKGZpbGVNZXNzYWdlKTtcbiAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgIHRoaXMub25NZXNzYWdlU2VudC5lbWl0KGZpbGVNZXNzYWdlKTtcbiAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuc2Nyb2xsQ2hhdFdpbmRvdyh3aW5kb3csIFNjcm9sbERpcmVjdGlvbi5Cb3R0b20pO1xuXG4gICAgICAgICAgICAgICAgICAgIC8vIFJlc2V0cyB0aGUgZmlsZSB1cGxvYWQgZWxlbWVudFxuICAgICAgICAgICAgICAgICAgICB1cGxvYWRFbGVtZW50UmVmLm5hdGl2ZUVsZW1lbnQudmFsdWUgPSAnJztcbiAgICAgICAgICAgICAgICB9LCAoZXJyb3IpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5jbGVhckluVXNlRmlsZVVwbG9hZGVyKGZpbGVVcGxvYWRJbnN0YW5jZUlkKTtcblxuICAgICAgICAgICAgICAgICAgICAvLyBSZXNldHMgdGhlIGZpbGUgdXBsb2FkIGVsZW1lbnRcbiAgICAgICAgICAgICAgICAgICAgdXBsb2FkRWxlbWVudFJlZi5uYXRpdmVFbGVtZW50LnZhbHVlID0gJyc7XG5cbiAgICAgICAgICAgICAgICAgICAgLy8gVE9ETzogSW52b2tlIGEgZmlsZSB1cGxvYWQgYWRhcHRlciBlcnJvciBoZXJlXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICB9XG59XG4iXX0=