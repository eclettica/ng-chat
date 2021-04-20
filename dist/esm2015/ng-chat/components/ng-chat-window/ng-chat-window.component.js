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
        this.onDownloadFile = new EventEmitter();
        this.onGoToRepo = new EventEmitter();
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
        if (this.window
            && this.window.participant
            && this.window.participant.windowOptions
            && this.window.participant.windowOptions.windowClass)
            this.windowClass = this.window.participant.windowOptions.windowClass;
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
    downloadFile(message) {
        this.markMessagesAsRead([message]);
        if (message.repositoryId) {
            const fileName = message.attachmentName ? message.attachmentName : message.message;
            this.onDownloadFile.emit({
                repositoryId: message.repositoryId,
                fileName: fileName
            });
        }
    }
    goToRepo(window, message) {
        if (message.repositoryId) {
            const fileName = message.attachmentName ? message.attachmentName : message.message;
            this.onGoToRepo.emit({
                repositoryId: message.repositoryId,
                isGroup: message.groupId ? true : false
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
    Output()
], NgChatWindowComponent.prototype, "onDownloadFile", void 0);
__decorate([
    Output()
], NgChatWindowComponent.prototype, "onGoToRepo", void 0);
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
        template: "<ng-container *ngIf=\"window && window.isCollapsed\">\n\t<div class=\"ng-chat-title secondary-background {{windowClass}}\">\n\t\t<div class=\"ng-chat-title-visibility-toggle-area\" (click)=\"onChatWindowClicked(window)\">\n\t\t\t<strong title=\"{{window.participant.displayName}}\">\n\t\t\t\t{{window.participant.displayName}}\n\t\t\t</strong>\n\t\t\t<span [ngClass]=\"{'ng-chat-participant-status': true, 'online': window.participant.status == ChatParticipantStatus.Online, 'busy': window.participant.status == ChatParticipantStatus.Busy, 'away': window.participant.status == ChatParticipantStatus.Away, 'offline': window.participant.status == ChatParticipantStatus.Offline}\" title=\"{{chatParticipantStatusDescriptor(window.participant.status, localization)}}\"></span>\n\t\t\t<span *ngIf=\"unreadMessagesTotal(window).length > 0\" class=\"ng-chat-unread-messages-count unread-messages-counter-container primary-text\">{{unreadMessagesTotal(window)}}</span>\n\t\t</div>\n\t\t<a href=\"javascript:void(0);\" class=\"ng-chat-close primary-text\" (click)=\"onCloseChatWindow()\">X</a>\n\t</div>\n</ng-container>\n<ng-container *ngIf=\"window && !window.isCollapsed\">\n\t<div class=\"ng-chat-title secondary-background {{windowClass}}\">\n\t\t<div class=\"ng-chat-title-visibility-toggle-area\" (click)=\"onChatWindowClicked(window)\">\n\t\t\t<strong title=\"{{window.participant.displayName}}\">\n\t\t\t\t{{window.participant.displayName}}\n\t\t\t</strong>\n\t\t\t<span [ngClass]=\"{'ng-chat-participant-status': true, 'online': window.participant.status == ChatParticipantStatus.Online, 'busy': window.participant.status == ChatParticipantStatus.Busy, 'away': window.participant.status == ChatParticipantStatus.Away, 'offline': window.participant.status == ChatParticipantStatus.Offline}\" title=\"{{chatParticipantStatusDescriptor(window.participant.status, localization)}}\"></span>\n\t\t\t<span *ngIf=\"unreadMessagesTotal(window).length > 0\" class=\"ng-chat-unread-messages-count unread-messages-counter-container primary-text\">{{unreadMessagesTotal(window)}}</span>\n\t\t</div>\n\t\t<ng-chat-window-options *ngIf=\"window?.participant?.windowOptions?.buttons\" [ngClass]=\"{'ng-chat-options-container' : window.participant.windowOptions.buttons.length > 2, 'ng-chat-options-container-reduced': window.participant.windowOptions.buttons.length < 3 }\" [options]=\"window?.participant?.windowOptions\" [window]=\"window\"></ng-chat-window-options>\n\t\t<a href=\"javascript:void(0);\" class=\"ng-chat-close primary-text\" (click)=\"onCloseChatWindow()\">X</a>\n\t\t<ng-chat-options [ngClass]=\"'ng-chat-options-container'\" [options]=\"defaultWindowOptions(window)\" (activeOptionTrackerChange)=\"activeOptionTrackerChange($event)\"></ng-chat-options>\n\t</div>\n\t<div #chatMessages class=\"ng-chat-messages primary-background\">\n\t\t<div *ngIf=\"window.isLoadingHistory\" class=\"ng-chat-loading-wrapper\">\n\t\t\t<div class=\"loader\">Loading history...</div>\n\t\t</div>\n\t\t<div *ngIf=\"hasPagedHistory && window.hasMoreMessages && !window.isLoadingHistory\" class=\"ng-chat-load-history\">\n\t\t\t<a class=\"load-history-action\" (click)=\"fetchMessageHistory(window)\">{{localization.loadMessageHistoryPlaceholder}}</a>\n\t\t</div>\n\n\t\t<div *ngFor=\"let message of window.messages; let i = index\" [ngClass]=\"{'ng-chat-message': true, 'ng-chat-message-received': message.fromId != userId}\">\n\t\t\t<ng-container *ngIf=\"isAvatarVisible(window, message, i)\">\n\t\t\t\t<div *ngIf=\"!getChatWindowAvatar(window.participant, message) && !getChatWindowAvatarSrc(window.participant, message)\" class=\"icon-wrapper\">\n\t\t\t\t\t<i class=\"user-icon\"></i>\n\t\t\t\t</div>\n\t\t\t\t<img *ngIf=\"getChatWindowAvatar(window.participant, message)\" alt=\"\" class=\"avatar\" height=\"30\" width=\"30\" [src]=\"getChatWindowAvatar(window.participant, message) | sanitize\" />\n\t\t\t\t<img *ngIf=\"getChatWindowAvatarSrc(window.participant, message)\" alt=\"\" class=\"avatar avatarSrc\" height=\"30\" width=\"30\" [src]=\"getChatWindowAvatarSrc(window.participant, message) | secure | async\" />\n\t\t\t\t<span *ngIf=\"window.participant.participantType == ChatParticipantType.Group\" class=\"ng-chat-participant-name\">{{window.participant | groupMessageDisplayName:message}}</span>\n\t\t\t</ng-container>\n\t\t\t<ng-container [ngSwitch]=\"message.type\">\n\t\t\t\t<div *ngSwitchCase=\"MessageType.Text\" [ngClass]=\"{'sent-chat-message-container': message.fromId == userId, 'received-chat-message-container': message.fromId != userId}\">\n          <span [innerHtml]=\"message.message | emojify:emojisEnabled | linkfy:linkfyEnabled\"></span>\n\t\t\t\t\t<span *ngIf=\"showMessageDate && message.dateSent\" class=\"message-sent-date\">{{message.dateSent | date:messageDatePipeFormat}}</span>\n\t\t\t\t</div>\n        <div *ngSwitchCase=\"MessageType.Image\" [ngClass]=\"{'sent-chat-message-container': message.fromId == userId, 'received-chat-message-container': message.fromId != userId}\">\n\n          <img *ngIf=\"!message.repositoryId\" src=\"{{message.message}}\" class=\"image-message\" />\n          <img *ngIf=\"message.repositoryId && message.repositorySrcUri\" [src]=\"message.repositorySrcUri | secure | async\" class=\"image-message\" />\n\n\n\t\t\t\t\t<span *ngIf=\"showMessageDate && message.dateSent\" class=\"message-sent-date\">{{message.dateSent | date:messageDatePipeFormat}}</span>\n\t\t\t\t</div>\n\t\t\t\t<div *ngSwitchCase=\"MessageType.File\" [ngClass]=\"{'file-message-container': true, 'received': message.fromId != userId}\">\n\t\t\t\t\t<!-- <div class=\"file-message-icon-container\">\n\t\t\t\t\t\t<i class=\"paperclip-icon\"></i>\n\t\t\t\t\t</div> -->\n\t\t\t\t\t<a *ngIf=\"!message.repositoryId\" class=\"file-details\" [attr.href]=\"message.downloadUrl\" target=\"_blank\" rel=\"noopener noreferrer\" (click)=\"this.markMessagesAsRead([message])\" download>\n\t\t\t\t\t\t<span class=\"file-message-title\" [attr.title]=\"message.message\">{{message.message}}</span>\n\t\t\t\t\t\t<span *ngIf=\"message.fileSizeInBytes\"  class=\"file-message-size\">{{message.fileSizeInBytes}} Bytes</span>\n          </a>\n          <div *ngIf=\"message.repositoryId\">\n            <button (click)=\"downloadFile(message)\" mat-flat-button class=\"download-button\">SCARICA</button>\n            <button (click)=\"goToRepo(window, message)\" mat-flat-button class=\"download-button\">REPO</button>\n            <div class=\"file-message-title\" [attr.title]=\"message.message\">{{message.message}}</div>\n          <div>\n            <span *ngIf=\"showMessageDate && message.dateSent\" class=\"message-sent-date\">{{message.dateSent | date:messageDatePipeFormat}}</span>\n          </div>\n        </div>\n\n\t\t\t\t</div>\n\t\t\t</ng-container>\n\t\t</div>\n\t</div>\n\n\t<div class=\"ng-chat-footer primary-outline-color primary-background\">\n\t\t<input #chatWindowInput\n\t\t\ttype=\"text\"\n\t\t\t[ngModel]=\"window.newMessage | emojify:emojisEnabled\"\n\t\t\t(ngModelChange)=\"window.newMessage=$event\"\n\t\t\t[placeholder]=\"localization.messagePlaceholder\"\n\t\t\t[ngClass]=\"{'chat-window-input': true, 'has-side-action': fileUploadAdapter}\"\n\t\t\t(keydown)=\"onChatInputTyped($event, window)\"\n\t\t\t(blur)=\"toggleWindowFocus(window)\"\n\t\t\t(focus)=\"toggleWindowFocus(window)\"/>\n\n\t\t<!-- File Upload -->\n\t\t<ng-container *ngIf=\"fileUploadAdapter\">\n\t\t\t<a *ngIf=\"!isUploadingFile(window)\" class=\"btn-add-file\" (click)=\"triggerNativeFileUpload(window)\">\n\t\t\t\t<i class=\"upload-icon\"></i>\n\t\t\t</a>\n\t\t\t<input\n\t\t\t\ttype=\"file\"\n\t\t\t\t#nativeFileInput\n\t\t\t\tstyle=\"display: none;\"\n\t\t\t\t[attr.id]=\"getUniqueFileUploadInstanceId(window)\"\n\t\t\t\t(change)=\"onFileChosen(window)\" />\n\t\t\t<div *ngIf=\"isUploadingFile(window)\" class=\"loader\"></div>\n\t\t</ng-container>\n\t</div>\n</ng-container>\n",
        encapsulation: ViewEncapsulation.None,
        styles: [".ng-chat-window{right:260px;height:360px;z-index:999;bottom:0;width:300px;position:fixed;border-width:1px;border-style:solid;border-bottom:0;box-shadow:0 4px 8px rgba(0,0,0,.25)}.ng-chat-window-collapsed{height:30px!important}.ng-chat-window .ng-chat-footer{box-sizing:border-box;padding:0;display:block;height:calc(10%);width:100%;border:none;border-top:1px solid transparent;border-color:inherit}.ng-chat-window .ng-chat-footer>input{font-size:.8em;box-sizing:border-box;padding:0 5px;display:block;height:100%;width:100%;border:none}.ng-chat-window .ng-chat-footer>input.has-side-action{width:calc(100% - 30px)}.ng-chat-window .ng-chat-footer .btn-add-file{position:absolute;right:5px;bottom:7px;height:20px;width:20px;cursor:pointer}.ng-chat-window .ng-chat-footer .loader{position:absolute;right:14px;bottom:8px}.ng-chat-window .ng-chat-load-history{height:30px;text-align:center;font-size:.8em}.ng-chat-window .ng-chat-load-history>a{border-radius:15px;cursor:pointer;padding:5px 10px}.ng-chat-window .ng-chat-messages{padding:10px;width:100%;height:calc(90% - 30px);box-sizing:border-box;position:relative;overflow:auto}.ng-chat-window .ng-chat-messages .ng-chat-message{clear:both}.ng-chat-window .ng-chat-messages .ng-chat-message>.icon-wrapper,.ng-chat-window .ng-chat-messages .ng-chat-message>img.avatar{position:absolute;left:10px;border-radius:25px}.ng-chat-window .ng-chat-messages .ng-chat-message .ng-chat-participant-name{display:inline-block;margin-left:40px;padding-bottom:5px;font-weight:700;font-size:.8em;text-overflow:ellipsis;max-width:180px}.ng-chat-window .ng-chat-messages .ng-chat-message>.icon-wrapper{background-color:#bababa;overflow:hidden;width:30px;height:30px;padding:0}.ng-chat-window .ng-chat-messages .ng-chat-message>.icon-wrapper>i{color:#fff;transform:scale(.7)}.ng-chat-window .ng-chat-messages .ng-chat-message .message-sent-date{font-size:.8em;display:block;text-align:right;margin-top:5px}.ng-chat-window .ng-chat-messages .ng-chat-message>div{float:right;width:182px;padding:10px;border-radius:5px;margin-top:0;margin-bottom:5px;font-size:.9em;word-wrap:break-word}.ng-chat-window .ng-chat-messages .ng-chat-message.ng-chat-message-received>div.received-chat-message-container{float:left;margin-left:40px;padding-top:7px;padding-bottom:7px;border-style:solid;border-width:3px;margin-top:0;margin-bottom:5px}.ng-chat-window .ng-chat-messages .ng-chat-message .file-message-container{float:right;width:202px;border-style:solid;border-width:3px;border-radius:5px;overflow:hidden;margin-bottom:5px;display:block;text-decoration:none;font-size:.9em;padding:0;box-sizing:border-box}.ng-chat-window .ng-chat-messages .ng-chat-message .file-message-container.received{float:left;margin-left:40px;width:208px}.ng-chat-window .ng-chat-messages .ng-chat-message .file-message-container>.file-message-icon-container{width:20px;height:35px;padding:10px 5px;float:left}.ng-chat-window .ng-chat-messages .ng-chat-message .file-message-container>.file-message-icon-container i{margin-top:8px}.ng-chat-window .ng-chat-messages .ng-chat-message .file-message-container>.file-details{float:left;padding:10px;width:calc(100% - 60px);color:currentColor;text-decoration:none}.ng-chat-window .ng-chat-messages .ng-chat-message .file-message-container>.file-details:hover{text-decoration:underline}.ng-chat-window .ng-chat-messages .ng-chat-message .file-message-container>.file-details span{display:block;width:100%;text-overflow:ellipsis;overflow:hidden;white-space:nowrap}.ng-chat-window .ng-chat-messages .ng-chat-message .file-message-container>.file-details .file-message-title{font-weight:700}.ng-chat-window .ng-chat-messages .ng-chat-message .file-message-container>.file-details .file-message-size{font-size:.8em;margin-top:5px}.ng-chat-window .image-message{width:100%;height:auto}button.download-button{background-color:#4caf50;border:none;color:#fff;text-align:center;text-decoration:none;display:inline-block;font-size:16px;margin:4px 2px;border-radius:12px}@media only screen and (max-width:581px){.ng-chat-window{position:initial}}"]
    })
], NgChatWindowComponent);
export { NgChatWindowComponent };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmctY2hhdC13aW5kb3cuY29tcG9uZW50LmpzIiwic291cmNlUm9vdCI6Im5nOi8vbmctY2hhdC8iLCJzb3VyY2VzIjpbIm5nLWNoYXQvY29tcG9uZW50cy9uZy1jaGF0LXdpbmRvdy9uZy1jaGF0LXdpbmRvdy5jb21wb25lbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBLE9BQU8sRUFBRSxTQUFTLEVBQUUsS0FBSyxFQUFFLE1BQU0sRUFBRSxZQUFZLEVBQUUsaUJBQWlCLEVBQUUsU0FBUyxFQUFzQixNQUFNLGVBQWUsQ0FBQztBQUV6SCxPQUFPLEVBQUUsT0FBTyxFQUFFLE1BQU0sb0JBQW9CLENBQUM7QUFDN0MsT0FBTyxFQUFFLFdBQVcsRUFBRSxNQUFNLDhCQUE4QixDQUFDO0FBRTNELE9BQU8sRUFBRSxxQkFBcUIsRUFBRSxNQUFNLHlDQUF5QyxDQUFDO0FBQ2hGLE9BQU8sRUFBRSxlQUFlLEVBQUUsTUFBTSxrQ0FBa0MsQ0FBQztBQU1uRSxPQUFPLEVBQUUsbUJBQW1CLEVBQUUsTUFBTSx1Q0FBdUMsQ0FBQztBQUU1RSxPQUFPLEVBQUUsY0FBYyxFQUFFLE1BQU0sNEJBQTRCLENBQUM7QUFDNUQsT0FBTyxFQUFFLCtCQUErQixFQUFFLE1BQU0sK0NBQStDLENBQUM7QUFRaEcsSUFBYSxxQkFBcUIsR0FBbEMsTUFBYSxxQkFBcUI7SUFFOUI7UUFEQSxnQkFBVyxHQUFxQixFQUFFLENBQUM7UUFrQzVCLGtCQUFhLEdBQVksSUFBSSxDQUFDO1FBRzlCLGtCQUFhLEdBQVksSUFBSSxDQUFDO1FBRzlCLG9CQUFlLEdBQVksSUFBSSxDQUFDO1FBR2hDLDBCQUFxQixHQUFXLE9BQU8sQ0FBQztRQUd4QyxvQkFBZSxHQUFZLElBQUksQ0FBQztRQUdoQyx1QkFBa0IsR0FBdUUsSUFBSSxZQUFZLEVBQUUsQ0FBQztRQUc1Ryx1QkFBa0IsR0FBaUUsSUFBSSxZQUFZLEVBQUUsQ0FBQztRQUd0RyxtQkFBYyxHQUE0QixJQUFJLFlBQVksRUFBRSxDQUFD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QyxLQUFLLEVBQUU7NERBQzZCO0FBR3JDO0lBREMsS0FBSyxFQUFFOzhEQUMrQjtBQUd2QztJQURDLEtBQUssRUFBRTtvRUFDdUM7QUFHL0M7SUFEQyxLQUFLLEVBQUU7OERBQytCO0FBR3ZDO0lBREMsTUFBTSxFQUFFO2lFQUMwRztBQUduSDtJQURDLE1BQU0sRUFBRTtpRUFDb0c7QUFHN0c7SUFEQyxNQUFNLEVBQUU7NkRBQzJEO0FBR3BFO0lBREMsTUFBTSxFQUFFOzREQUN3RDtBQUdqRTtJQURDLE1BQU0sRUFBRTs2REFDd0c7QUFHakg7SUFEQyxNQUFNLEVBQUU7Z0VBQ2dFO0FBR3pFO0lBREMsTUFBTSxFQUFFO3FFQUNnRTtBQUd6RTtJQURDLE1BQU0sRUFBRTs2REFDMEY7QUFHbkc7SUFEQyxNQUFNLEVBQUU7eURBQ3NGO0FBR3BFO0lBQTFCLFNBQVMsQ0FBQyxjQUFjLENBQUM7MkRBQW1CO0FBQ2Y7SUFBN0IsU0FBUyxDQUFDLGlCQUFpQixDQUFDOzhEQUE2QjtBQUM1QjtJQUE3QixTQUFTLENBQUMsaUJBQWlCLENBQUM7OERBQXNCO0FBL0UxQyxxQkFBcUI7SUFOakMsU0FBUyxDQUFDO1FBQ1AsUUFBUSxFQUFFLGdCQUFnQjtRQUMxQiw4dFBBQThDO1FBRTlDLGFBQWEsRUFBRSxpQkFBaUIsQ0FBQyxJQUFJOztLQUN4QyxDQUFDO0dBQ1cscUJBQXFCLENBa1dqQztTQWxXWSxxQkFBcUIiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBDb21wb25lbnQsIElucHV0LCBPdXRwdXQsIEV2ZW50RW1pdHRlciwgVmlld0VuY2Fwc3VsYXRpb24sIFZpZXdDaGlsZCwgRWxlbWVudFJlZiwgT25Jbml0IH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5cbmltcG9ydCB7IE1lc3NhZ2UgfSBmcm9tIFwiLi4vLi4vY29yZS9tZXNzYWdlXCI7XG5pbXBvcnQgeyBNZXNzYWdlVHlwZSB9IGZyb20gXCIuLi8uLi9jb3JlL21lc3NhZ2UtdHlwZS5lbnVtXCI7XG5pbXBvcnQgeyBXaW5kb3cgfSBmcm9tIFwiLi4vLi4vY29yZS93aW5kb3dcIjtcbmltcG9ydCB7IENoYXRQYXJ0aWNpcGFudFN0YXR1cyB9IGZyb20gXCIuLi8uLi9jb3JlL2NoYXQtcGFydGljaXBhbnQtc3RhdHVzLmVudW1cIjtcbmltcG9ydCB7IFNjcm9sbERpcmVjdGlvbiB9IGZyb20gXCIuLi8uLi9jb3JlL3Njcm9sbC1kaXJlY3Rpb24uZW51bVwiO1xuaW1wb3J0IHsgTG9jYWxpemF0aW9uIH0gZnJvbSAnLi4vLi4vY29yZS9sb2NhbGl6YXRpb24nO1xuaW1wb3J0IHsgSUZpbGVVcGxvYWRBZGFwdGVyIH0gZnJvbSAnLi4vLi4vY29yZS9maWxlLXVwbG9hZC1hZGFwdGVyJztcbmltcG9ydCB7IElDaGF0T3B0aW9uIH0gZnJvbSAnLi4vLi4vY29yZS9jaGF0LW9wdGlvbic7XG5pbXBvcnQgeyBXaW5kb3dPcHRpb24gfSBmcm9tICcuLi8uLi9jb3JlL3dpbmRvdy1vcHRpb24nO1xuaW1wb3J0IHsgR3JvdXAgfSBmcm9tIFwiLi4vLi4vY29yZS9ncm91cFwiO1xuaW1wb3J0IHsgQ2hhdFBhcnRpY2lwYW50VHlwZSB9IGZyb20gXCIuLi8uLi9jb3JlL2NoYXQtcGFydGljaXBhbnQtdHlwZS5lbnVtXCI7XG5pbXBvcnQgeyBJQ2hhdFBhcnRpY2lwYW50IH0gZnJvbSBcIi4uLy4uL2NvcmUvY2hhdC1wYXJ0aWNpcGFudFwiO1xuaW1wb3J0IHsgTWVzc2FnZUNvdW50ZXIgfSBmcm9tIFwiLi4vLi4vY29yZS9tZXNzYWdlLWNvdW50ZXJcIjtcbmltcG9ydCB7IGNoYXRQYXJ0aWNpcGFudFN0YXR1c0Rlc2NyaXB0b3IgfSBmcm9tICcuLi8uLi9jb3JlL2NoYXQtcGFydGljaXBhbnQtc3RhdHVzLWRlc2NyaXB0b3InO1xuXG5AQ29tcG9uZW50KHtcbiAgICBzZWxlY3RvcjogJ25nLWNoYXQtd2luZG93JyxcbiAgICB0ZW1wbGF0ZVVybDogJy4vbmctY2hhdC13aW5kb3cuY29tcG9uZW50Lmh0bWwnLFxuICAgIHN0eWxlVXJsczogWycuL25nLWNoYXQtd2luZG93LmNvbXBvbmVudC5jc3MnXSxcbiAgICBlbmNhcHN1bGF0aW9uOiBWaWV3RW5jYXBzdWxhdGlvbi5Ob25lXG59KVxuZXhwb3J0IGNsYXNzIE5nQ2hhdFdpbmRvd0NvbXBvbmVudCBpbXBsZW1lbnRzIE9uSW5pdCB7XG4gICAgd2luZG93Q2xhc3M6IHN0cmluZ3x1bmRlZmluZWQgPSAnJztcbiAgICBjb25zdHJ1Y3RvcigpIHtcbiAgICAgICAgLy90aGlzLndpbmRvd09wdGlvbnMgPSB0aGlzLndpbmRvdy5wYXJ0aWNpcGFudC53aW5kb3dPcHRpb25zO1xuICAgICB9XG5cbiAgICAgLy93aW5kb3dPcHRpb25zOiBXaW5kb3dPcHRpb24gfCBudWxsO1xuXG4gICAgIG5nT25Jbml0KCkge1xuICAgICAgICBpZih0aGlzLndpbmRvd1xuICAgICAgICAgICAgJiYgdGhpcy53aW5kb3cucGFydGljaXBhbnRcbiAgICAgICAgICAgICYmIHRoaXMud2luZG93LnBhcnRpY2lwYW50LndpbmRvd09wdGlvbnNcbiAgICAgICAgICAgICYmIHRoaXMud2luZG93LnBhcnRpY2lwYW50LndpbmRvd09wdGlvbnMud2luZG93Q2xhc3MpXG4gICAgICAgICB0aGlzLndpbmRvd0NsYXNzID0gIHRoaXMud2luZG93LnBhcnRpY2lwYW50LndpbmRvd09wdGlvbnMud2luZG93Q2xhc3M7XG5cbiAgICAgICAgIGlmKHRoaXMud2luZG93Q2xhc3MgPT0gdW5kZWZpbmVkIHx8IHRoaXMud2luZG93Q2xhc3MgPT0gbnVsbClcbiAgICAgICAgICAgIHRoaXMud2luZG93Q2xhc3MgPScnO1xuICAgICB9XG5cbiAgICBASW5wdXQoKVxuICAgIHB1YmxpYyBmaWxlVXBsb2FkQWRhcHRlcjogSUZpbGVVcGxvYWRBZGFwdGVyO1xuXG4gICAgQElucHV0KClcbiAgICBwdWJsaWMgd2luZG93OiBXaW5kb3c7XG5cbiAgICBASW5wdXQoKVxuICAgIHB1YmxpYyB1c2VySWQ6IGFueTtcblxuICAgIEBJbnB1dCgpXG4gICAgcHVibGljIGxvY2FsaXphdGlvbjogTG9jYWxpemF0aW9uO1xuXG4gICAgQElucHV0KClcbiAgICBwdWJsaWMgc2hvd09wdGlvbnM6IGJvb2xlYW47XG5cbiAgICBASW5wdXQoKVxuICAgIHB1YmxpYyBlbW9qaXNFbmFibGVkOiBib29sZWFuID0gdHJ1ZTtcblxuICAgIEBJbnB1dCgpXG4gICAgcHVibGljIGxpbmtmeUVuYWJsZWQ6IGJvb2xlYW4gPSB0cnVlO1xuXG4gICAgQElucHV0KClcbiAgICBwdWJsaWMgc2hvd01lc3NhZ2VEYXRlOiBib29sZWFuID0gdHJ1ZTtcblxuICAgIEBJbnB1dCgpXG4gICAgcHVibGljIG1lc3NhZ2VEYXRlUGlwZUZvcm1hdDogc3RyaW5nID0gXCJzaG9ydFwiO1xuXG4gICAgQElucHV0KClcbiAgICBwdWJsaWMgaGFzUGFnZWRIaXN0b3J5OiBib29sZWFuID0gdHJ1ZTtcblxuICAgIEBPdXRwdXQoKVxuICAgIHB1YmxpYyBvbkNoYXRXaW5kb3dDbG9zZWQ6IEV2ZW50RW1pdHRlcjx7IGNsb3NlZFdpbmRvdzogV2luZG93LCBjbG9zZWRWaWFFc2NhcGVLZXk6IGJvb2xlYW59PiA9IG5ldyBFdmVudEVtaXR0ZXIoKTtcblxuICAgIEBPdXRwdXQoKVxuICAgIHB1YmxpYyBvbkNoYXRXaW5kb3dUb2dnbGU6IEV2ZW50RW1pdHRlcjx7IGN1cnJlbnRXaW5kb3c6IFdpbmRvdywgaXNDb2xsYXBzZWQ6IGJvb2xlYW59PiA9IG5ldyBFdmVudEVtaXR0ZXIoKTtcblxuICAgIEBPdXRwdXQoKVxuICAgIHB1YmxpYyBvbk1lc3NhZ2VzU2VlbjogRXZlbnRFbWl0dGVyPE1lc3NhZ2VbXT4gPSBuZXcgRXZlbnRFbWl0dGVyKCk7XG5cbiAgICBAT3V0cHV0KClcbiAgICBwdWJsaWMgb25NZXNzYWdlU2VudDogRXZlbnRFbWl0dGVyPE1lc3NhZ2U+ID0gbmV3IEV2ZW50RW1pdHRlcigpO1xuXG4gICAgQE91dHB1dCgpXG4gICAgcHVibGljIG9uVGFiVHJpZ2dlcmVkOiBFdmVudEVtaXR0ZXI8eyB0cmlnZ2VyaW5nV2luZG93OiBXaW5kb3csIHNoaWZ0S2V5UHJlc3NlZDogYm9vbGVhbiB9PiA9IG5ldyBFdmVudEVtaXR0ZXIoKTtcblxuICAgIEBPdXRwdXQoKVxuICAgIHB1YmxpYyBvbk9wdGlvblRyaWdnZXJlZDogRXZlbnRFbWl0dGVyPElDaGF0T3B0aW9uPiA9IG5ldyBFdmVudEVtaXR0ZXIoKTtcblxuICAgIEBPdXRwdXQoKVxuICAgIHB1YmxpYyBvbkxvYWRIaXN0b3J5VHJpZ2dlcmVkOiBFdmVudEVtaXR0ZXI8V2luZG93PiA9IG5ldyBFdmVudEVtaXR0ZXIoKTtcblxuICAgIEBPdXRwdXQoKVxuICAgIHB1YmxpYyBvbkRvd25sb2FkRmlsZTogRXZlbnRFbWl0dGVyPHtyZXBvc2l0b3J5SWQ6IHN0cmluZywgZmlsZU5hbWU6IHN0cmluZ30+ID0gbmV3IEV2ZW50RW1pdHRlcigpO1xuXG4gICAgQE91dHB1dCgpXG4gICAgcHVibGljIG9uR29Ub1JlcG86IEV2ZW50RW1pdHRlcjx7cmVwb3NpdG9yeUlkOiBzdHJpbmcsIGlzR3JvdXA6IGJvb2xlYW59PiA9IG5ldyBFdmVudEVtaXR0ZXIoKTtcblxuXG4gICAgQFZpZXdDaGlsZCgnY2hhdE1lc3NhZ2VzJykgY2hhdE1lc3NhZ2VzOiBhbnk7XG4gICAgQFZpZXdDaGlsZCgnbmF0aXZlRmlsZUlucHV0JykgbmF0aXZlRmlsZUlucHV0OiBFbGVtZW50UmVmO1xuICAgIEBWaWV3Q2hpbGQoJ2NoYXRXaW5kb3dJbnB1dCcpIGNoYXRXaW5kb3dJbnB1dDogYW55O1xuXG4gICAgLy8gRmlsZSB1cGxvYWQgc3RhdGVcbiAgICBwdWJsaWMgZmlsZVVwbG9hZGVyc0luVXNlOiBzdHJpbmdbXSA9IFtdOyAvLyBJZCBidWNrZXQgb2YgdXBsb2FkZXJzIGluIHVzZVxuXG4gICAgLy8gRXhwb3NlcyBlbnVtcyBhbmQgZnVuY3Rpb25zIGZvciB0aGUgbmctdGVtcGxhdGVcbiAgICBwdWJsaWMgQ2hhdFBhcnRpY2lwYW50VHlwZSA9IENoYXRQYXJ0aWNpcGFudFR5cGU7XG4gICAgcHVibGljIENoYXRQYXJ0aWNpcGFudFN0YXR1cyA9IENoYXRQYXJ0aWNpcGFudFN0YXR1cztcbiAgICBwdWJsaWMgTWVzc2FnZVR5cGUgPSBNZXNzYWdlVHlwZTtcbiAgICBwdWJsaWMgY2hhdFBhcnRpY2lwYW50U3RhdHVzRGVzY3JpcHRvciA9IGNoYXRQYXJ0aWNpcGFudFN0YXR1c0Rlc2NyaXB0b3I7XG5cbiAgICBkZWZhdWx0V2luZG93T3B0aW9ucyhjdXJyZW50V2luZG93OiBXaW5kb3cpOiBJQ2hhdE9wdGlvbltdXG4gICAge1xuICAgICAgICBpZiAodGhpcy5zaG93T3B0aW9ucyAmJiBjdXJyZW50V2luZG93LnBhcnRpY2lwYW50LnBhcnRpY2lwYW50VHlwZSA9PSBDaGF0UGFydGljaXBhbnRUeXBlLlVzZXIpXG4gICAgICAgIHtcbiAgICAgICAgICAgIHJldHVybiBbe1xuICAgICAgICAgICAgICAgIGlzQWN0aXZlOiBmYWxzZSxcbiAgICAgICAgICAgICAgICBjaGF0dGluZ1RvOiBjdXJyZW50V2luZG93LFxuICAgICAgICAgICAgICAgIHZhbGlkYXRlQ29udGV4dDogKHBhcnRpY2lwYW50OiBJQ2hhdFBhcnRpY2lwYW50KSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBwYXJ0aWNpcGFudC5wYXJ0aWNpcGFudFR5cGUgPT0gQ2hhdFBhcnRpY2lwYW50VHlwZS5Vc2VyO1xuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgZGlzcGxheUxhYmVsOiAnQWRkIFBlb3BsZScgLy8gVE9ETzogTG9jYWxpemUgdGhpc1xuICAgICAgICAgICAgfV07XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gW107XG4gICAgfVxuXG4gICAgLy8gQXNzZXJ0cyBpZiBhIHVzZXIgYXZhdGFyIGlzIHZpc2libGUgaW4gYSBjaGF0IGNsdXN0ZXJcbiAgICBpc0F2YXRhclZpc2libGUod2luZG93OiBXaW5kb3csIG1lc3NhZ2U6IE1lc3NhZ2UsIGluZGV4OiBudW1iZXIpOiBib29sZWFuXG4gICAge1xuICAgICAgICBpZiAobWVzc2FnZS5mcm9tSWQgIT0gdGhpcy51c2VySWQpe1xuICAgICAgICAgICAgaWYgKGluZGV4ID09IDApe1xuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlOyAvLyBGaXJzdCBtZXNzYWdlLCBnb29kIHRvIHNob3cgdGhlIHRodW1ibmFpbFxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZXtcbiAgICAgICAgICAgICAgICAvLyBDaGVjayBpZiB0aGUgcHJldmlvdXMgbWVzc2FnZSBiZWxvbmdzIHRvIHRoZSBzYW1lIHVzZXIsIGlmIGl0IGJlbG9uZ3MgdGhlcmUgaXMgbm8gbmVlZCB0byBzaG93IHRoZSBhdmF0YXIgYWdhaW4gdG8gZm9ybSB0aGUgbWVzc2FnZSBjbHVzdGVyXG4gICAgICAgICAgICAgICAgaWYgKHdpbmRvdy5tZXNzYWdlc1tpbmRleCAtIDFdLmZyb21JZCAhPSBtZXNzYWdlLmZyb21JZCl7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICBnZXRDaGF0V2luZG93QXZhdGFyKHBhcnRpY2lwYW50OiBJQ2hhdFBhcnRpY2lwYW50LCBtZXNzYWdlOiBNZXNzYWdlKTogc3RyaW5nIHwgbnVsbFxuICAgIHtcbiAgICAgICAgaWYgKHBhcnRpY2lwYW50LnBhcnRpY2lwYW50VHlwZSA9PSBDaGF0UGFydGljaXBhbnRUeXBlLlVzZXIpXG4gICAgICAgIHtcbiAgICAgICAgICAgIHJldHVybiBwYXJ0aWNpcGFudC5hdmF0YXI7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAocGFydGljaXBhbnQucGFydGljaXBhbnRUeXBlID09IENoYXRQYXJ0aWNpcGFudFR5cGUuR3JvdXApXG4gICAgICAgIHtcbiAgICAgICAgICAgIGxldCBncm91cCA9IHBhcnRpY2lwYW50IGFzIEdyb3VwO1xuICAgICAgICAgICAgbGV0IHVzZXJJbmRleCA9IGdyb3VwLmNoYXR0aW5nVG8uZmluZEluZGV4KHggPT4geC5pZCA9PSBtZXNzYWdlLmZyb21JZCk7XG5cbiAgICAgICAgICAgIHJldHVybiBncm91cC5jaGF0dGluZ1RvW3VzZXJJbmRleCA+PSAwID8gdXNlckluZGV4IDogMF0uYXZhdGFyO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuXG4gICAgZ2V0Q2hhdFdpbmRvd0F2YXRhclNyYyhwYXJ0aWNpcGFudDogSUNoYXRQYXJ0aWNpcGFudCwgbWVzc2FnZTogTWVzc2FnZSk6IHN0cmluZyB8IG51bGxcbiAgICB7XG4gICAgICAgIGlmIChwYXJ0aWNpcGFudC5wYXJ0aWNpcGFudFR5cGUgPT0gQ2hhdFBhcnRpY2lwYW50VHlwZS5Vc2VyKVxuICAgICAgICB7XG4gICAgICAgICAgICByZXR1cm4gcGFydGljaXBhbnQuYXZhdGFyU3JjO1xuICAgICAgICB9XG4gICAgICAgIC8vIGVsc2UgaWYgKHBhcnRpY2lwYW50LnBhcnRpY2lwYW50VHlwZSA9PSBDaGF0UGFydGljaXBhbnRUeXBlLkdyb3VwKVxuICAgICAgICAvLyB7XG4gICAgICAgIC8vICAgICBsZXQgZ3JvdXAgPSBwYXJ0aWNpcGFudCBhcyBHcm91cDtcbiAgICAgICAgLy8gICAgIGxldCB1c2VySW5kZXggPSBncm91cC5jaGF0dGluZ1RvLmZpbmRJbmRleCh4ID0+IHguaWQgPT0gbWVzc2FnZS5mcm9tSWQpO1xuXG4gICAgICAgIC8vICAgICByZXR1cm4gZ3JvdXAuY2hhdHRpbmdUb1t1c2VySW5kZXggPj0gMCA/IHVzZXJJbmRleCA6IDBdLmF2YXRhcjtcbiAgICAgICAgLy8gfVxuXG4gICAgICAgIHJldHVybiBudWxsO1xuICAgIH1cblxuICAgIGlzVXBsb2FkaW5nRmlsZSh3aW5kb3c6IFdpbmRvdyk6IGJvb2xlYW5cbiAgICB7XG4gICAgICAgIGNvbnN0IGZpbGVVcGxvYWRJbnN0YW5jZUlkID0gdGhpcy5nZXRVbmlxdWVGaWxlVXBsb2FkSW5zdGFuY2VJZCh3aW5kb3cpO1xuXG4gICAgICAgIHJldHVybiB0aGlzLmZpbGVVcGxvYWRlcnNJblVzZS5pbmRleE9mKGZpbGVVcGxvYWRJbnN0YW5jZUlkKSA+IC0xO1xuICAgIH1cblxuICAgIC8vIEdlbmVyYXRlcyBhIHVuaXF1ZSBmaWxlIHVwbG9hZGVyIGlkIGZvciBlYWNoIHBhcnRpY2lwYW50XG4gICAgZ2V0VW5pcXVlRmlsZVVwbG9hZEluc3RhbmNlSWQod2luZG93OiBXaW5kb3cpOiBzdHJpbmdcbiAgICB7XG4gICAgICAgIGlmICh3aW5kb3cgJiYgd2luZG93LnBhcnRpY2lwYW50KVxuICAgICAgICB7XG4gICAgICAgICAgICByZXR1cm4gYG5nLWNoYXQtZmlsZS11cGxvYWQtJHt3aW5kb3cucGFydGljaXBhbnQuaWR9YDtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiAnbmctY2hhdC1maWxlLXVwbG9hZCc7XG4gICAgfVxuXG4gICAgdW5yZWFkTWVzc2FnZXNUb3RhbCh3aW5kb3c6IFdpbmRvdyk6IHN0cmluZ1xuICAgIHtcbiAgICAgICAgcmV0dXJuIE1lc3NhZ2VDb3VudGVyLnVucmVhZE1lc3NhZ2VzVG90YWwod2luZG93LCB0aGlzLnVzZXJJZCk7XG4gICAgfVxuXG4gICAgLy8gU2Nyb2xscyBhIGNoYXQgd2luZG93IG1lc3NhZ2UgZmxvdyB0byB0aGUgYm90dG9tXG4gICAgc2Nyb2xsQ2hhdFdpbmRvdyh3aW5kb3c6IFdpbmRvdywgZGlyZWN0aW9uOiBTY3JvbGxEaXJlY3Rpb24pOiB2b2lkXG4gICAge1xuICAgICAgICBpZiAoIXdpbmRvdy5pc0NvbGxhcHNlZCl7XG4gICAgICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5jaGF0TWVzc2FnZXMpe1xuICAgICAgICAgICAgICAgICAgICBsZXQgZWxlbWVudCA9IHRoaXMuY2hhdE1lc3NhZ2VzLm5hdGl2ZUVsZW1lbnQ7XG4gICAgICAgICAgICAgICAgICAgIGxldCBwb3NpdGlvbiA9ICggZGlyZWN0aW9uID09PSBTY3JvbGxEaXJlY3Rpb24uVG9wICkgPyAwIDogZWxlbWVudC5zY3JvbGxIZWlnaHQ7XG4gICAgICAgICAgICAgICAgICAgIGVsZW1lbnQuc2Nyb2xsVG9wID0gcG9zaXRpb247XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBhY3RpdmVPcHRpb25UcmFja2VyQ2hhbmdlKG9wdGlvbjogSUNoYXRPcHRpb24pOiB2b2lkIHtcbiAgICAgICAgdGhpcy5vbk9wdGlvblRyaWdnZXJlZC5lbWl0KG9wdGlvbik7XG4gICAgfVxuXG4gICAgLy8gVHJpZ2dlcnMgbmF0aXZlIGZpbGUgdXBsb2FkIGZvciBmaWxlIHNlbGVjdGlvbiBmcm9tIHRoZSB1c2VyXG4gICAgdHJpZ2dlck5hdGl2ZUZpbGVVcGxvYWQod2luZG93OiBXaW5kb3cpOiB2b2lkXG4gICAge1xuICAgICAgICBpZiAod2luZG93KVxuICAgICAgICB7XG4gICAgICAgICAgICBpZiAodGhpcy5uYXRpdmVGaWxlSW5wdXQpIHRoaXMubmF0aXZlRmlsZUlucHV0Lm5hdGl2ZUVsZW1lbnQuY2xpY2soKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8vIFRvZ2dsZXMgYSB3aW5kb3cgZm9jdXMgb24gdGhlIGZvY3VzL2JsdXIgb2YgYSAnbmV3TWVzc2FnZScgaW5wdXRcbiAgICB0b2dnbGVXaW5kb3dGb2N1cyh3aW5kb3c6IFdpbmRvdyk6IHZvaWRcbiAgICB7XG4gICAgICAgIHdpbmRvdy5oYXNGb2N1cyA9ICF3aW5kb3cuaGFzRm9jdXM7XG4gICAgICAgIGlmKHdpbmRvdy5oYXNGb2N1cykge1xuICAgICAgICAgICAgY29uc3QgdW5yZWFkTWVzc2FnZXMgPSB3aW5kb3cubWVzc2FnZXNcbiAgICAgICAgICAgICAgICAuZmlsdGVyKG1lc3NhZ2UgPT4gbWVzc2FnZS5kYXRlU2VlbiA9PSBudWxsXG4gICAgICAgICAgICAgICAgICAgICYmIChtZXNzYWdlLnRvSWQgPT0gdGhpcy51c2VySWQgfHwgd2luZG93LnBhcnRpY2lwYW50LnBhcnRpY2lwYW50VHlwZSA9PT0gQ2hhdFBhcnRpY2lwYW50VHlwZS5Hcm91cCkpO1xuXG4gICAgICAgICAgICBpZiAodW5yZWFkTWVzc2FnZXMgJiYgdW5yZWFkTWVzc2FnZXMubGVuZ3RoID4gMClcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICB0aGlzLm9uTWVzc2FnZXNTZWVuLmVtaXQodW5yZWFkTWVzc2FnZXMpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgbWFya01lc3NhZ2VzQXNSZWFkKG1lc3NhZ2VzOiBNZXNzYWdlW10pOiB2b2lkXG4gICAge1xuICAgICAgICB0aGlzLm9uTWVzc2FnZXNTZWVuLmVtaXQobWVzc2FnZXMpO1xuICAgIH1cblxuICAgIGZldGNoTWVzc2FnZUhpc3Rvcnkod2luZG93OiBXaW5kb3cpOiB2b2lkIHtcbiAgICAgICAgdGhpcy5vbkxvYWRIaXN0b3J5VHJpZ2dlcmVkLmVtaXQod2luZG93KTtcbiAgICB9XG5cbiAgICAvLyBDbG9zZXMgYSBjaGF0IHdpbmRvdyB2aWEgdGhlIGNsb3NlICdYJyBidXR0b25cbiAgICBvbkNsb3NlQ2hhdFdpbmRvdygpOiB2b2lkXG4gICAge1xuICAgICAgICB0aGlzLm9uQ2hhdFdpbmRvd0Nsb3NlZC5lbWl0KHsgY2xvc2VkV2luZG93OiB0aGlzLndpbmRvdywgY2xvc2VkVmlhRXNjYXBlS2V5OiBmYWxzZSB9KTtcbiAgICB9XG5cbiAgICAvKiAgTW9uaXRvcnMgcHJlc3NlZCBrZXlzIG9uIGEgY2hhdCB3aW5kb3dcbiAgICAgICAgLSBEaXNwYXRjaGVzIGEgbWVzc2FnZSB3aGVuIHRoZSBFTlRFUiBrZXkgaXMgcHJlc3NlZFxuICAgICAgICAtIFRhYnMgYmV0d2VlbiB3aW5kb3dzIG9uIFRBQiBvciBTSElGVCArIFRBQlxuICAgICAgICAtIENsb3NlcyB0aGUgY3VycmVudCBmb2N1c2VkIHdpbmRvdyBvbiBFU0NcbiAgICAqL1xuICAgb25DaGF0SW5wdXRUeXBlZChldmVudDogYW55LCB3aW5kb3c6IFdpbmRvdyk6IHZvaWRcbiAgIHtcbiAgICAgICBzd2l0Y2ggKGV2ZW50LmtleUNvZGUpXG4gICAgICAge1xuICAgICAgICAgICBjYXNlIDEzOlxuICAgICAgICAgICAgICAgaWYgKHdpbmRvdy5uZXdNZXNzYWdlICYmIHdpbmRvdy5uZXdNZXNzYWdlLnRyaW0oKSAhPSBcIlwiKVxuICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgIGxldCBtZXNzYWdlID0gbmV3IE1lc3NhZ2UoKTtcblxuICAgICAgICAgICAgICAgICAgIG1lc3NhZ2UuZnJvbUlkID0gdGhpcy51c2VySWQ7XG4gICAgICAgICAgICAgICAgICAgbWVzc2FnZS50b0lkID0gd2luZG93LnBhcnRpY2lwYW50LmlkO1xuICAgICAgICAgICAgICAgICAgIG1lc3NhZ2UubWVzc2FnZSA9IHdpbmRvdy5uZXdNZXNzYWdlO1xuICAgICAgICAgICAgICAgICAgIG1lc3NhZ2UuZGF0ZVNlbnQgPSBuZXcgRGF0ZSgpO1xuXG4gICAgICAgICAgICAgICAgICAgd2luZG93Lm1lc3NhZ2VzLnB1c2gobWVzc2FnZSk7XG5cbiAgICAgICAgICAgICAgICAgICB0aGlzLm9uTWVzc2FnZVNlbnQuZW1pdChtZXNzYWdlKTtcblxuICAgICAgICAgICAgICAgICAgIHdpbmRvdy5uZXdNZXNzYWdlID0gXCJcIjsgLy8gUmVzZXRzIHRoZSBuZXcgbWVzc2FnZSBpbnB1dFxuXG4gICAgICAgICAgICAgICAgICAgdGhpcy5zY3JvbGxDaGF0V2luZG93KHdpbmRvdywgU2Nyb2xsRGlyZWN0aW9uLkJvdHRvbSk7XG4gICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgY2FzZSA5OlxuICAgICAgICAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcblxuICAgICAgICAgICAgICAgdGhpcy5vblRhYlRyaWdnZXJlZC5lbWl0KHsgdHJpZ2dlcmluZ1dpbmRvdzogd2luZG93LCBzaGlmdEtleVByZXNzZWQ6IGV2ZW50LnNoaWZ0S2V5IH0pO1xuXG4gICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgY2FzZSAyNzpcbiAgICAgICAgICAgICAgIHRoaXMub25DaGF0V2luZG93Q2xvc2VkLmVtaXQoeyBjbG9zZWRXaW5kb3c6IHdpbmRvdywgY2xvc2VkVmlhRXNjYXBlS2V5OiB0cnVlIH0pO1xuXG4gICAgICAgICAgICAgICBicmVhaztcbiAgICAgICB9XG4gICB9XG5cbiAgICAvLyBUb2dnbGVzIGEgY2hhdCB3aW5kb3cgdmlzaWJpbGl0eSBiZXR3ZWVuIG1heGltaXplZC9taW5pbWl6ZWRcbiAgICBvbkNoYXRXaW5kb3dDbGlja2VkKHdpbmRvdzogV2luZG93KTogdm9pZFxuICAgIHtcbiAgICAgICAgd2luZG93LmlzQ29sbGFwc2VkID0gIXdpbmRvdy5pc0NvbGxhcHNlZDtcbiAgICAgICAgdGhpcy5vbkNoYXRXaW5kb3dUb2dnbGUuZW1pdCh7IGN1cnJlbnRXaW5kb3c6IHdpbmRvdywgaXNDb2xsYXBzZWQ6IHdpbmRvdy5pc0NvbGxhcHNlZCB9KTtcbiAgICAgICAgdGhpcy5zY3JvbGxDaGF0V2luZG93KHdpbmRvdywgU2Nyb2xsRGlyZWN0aW9uLkJvdHRvbSk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBjbGVhckluVXNlRmlsZVVwbG9hZGVyKGZpbGVVcGxvYWRJbnN0YW5jZUlkOiBzdHJpbmcpOiB2b2lkXG4gICAge1xuICAgICAgICBjb25zdCB1cGxvYWRlckluc3RhbmNlSWRJbmRleCA9IHRoaXMuZmlsZVVwbG9hZGVyc0luVXNlLmluZGV4T2YoZmlsZVVwbG9hZEluc3RhbmNlSWQpO1xuXG4gICAgICAgIGlmICh1cGxvYWRlckluc3RhbmNlSWRJbmRleCA+IC0xKSB7XG4gICAgICAgICAgICB0aGlzLmZpbGVVcGxvYWRlcnNJblVzZS5zcGxpY2UodXBsb2FkZXJJbnN0YW5jZUlkSW5kZXgsIDEpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLy8gSGFuZGxlcyBmaWxlIHNlbGVjdGlvbiBhbmQgdXBsb2FkcyB0aGUgc2VsZWN0ZWQgZmlsZSB1c2luZyB0aGUgZmlsZSB1cGxvYWQgYWRhcHRlclxuICAgIG9uRmlsZUNob3Nlbih3aW5kb3c6IFdpbmRvdyk6IHZvaWQge1xuICAgICAgICBjb25zdCBmaWxlVXBsb2FkSW5zdGFuY2VJZCA9IHRoaXMuZ2V0VW5pcXVlRmlsZVVwbG9hZEluc3RhbmNlSWQod2luZG93KTtcbiAgICAgICAgY29uc3QgdXBsb2FkRWxlbWVudFJlZiA9IHRoaXMubmF0aXZlRmlsZUlucHV0O1xuXG4gICAgICAgIGlmICh1cGxvYWRFbGVtZW50UmVmKVxuICAgICAgICB7XG4gICAgICAgICAgICBjb25zdCBmaWxlOiBGaWxlID0gdXBsb2FkRWxlbWVudFJlZi5uYXRpdmVFbGVtZW50LmZpbGVzWzBdO1xuXG4gICAgICAgICAgICB0aGlzLmZpbGVVcGxvYWRlcnNJblVzZS5wdXNoKGZpbGVVcGxvYWRJbnN0YW5jZUlkKTtcblxuICAgICAgICAgICAgdGhpcy5maWxlVXBsb2FkQWRhcHRlci51cGxvYWRGaWxlKGZpbGUsIHdpbmRvdy5wYXJ0aWNpcGFudC5pZClcbiAgICAgICAgICAgICAgICAuc3Vic2NyaWJlKGZpbGVNZXNzYWdlID0+IHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5jbGVhckluVXNlRmlsZVVwbG9hZGVyKGZpbGVVcGxvYWRJbnN0YW5jZUlkKTtcblxuICAgICAgICAgICAgICAgICAgICBmaWxlTWVzc2FnZS5mcm9tSWQgPSB0aGlzLnVzZXJJZDtcblxuICAgICAgICAgICAgICAgICAgICAvLyBQdXNoIGZpbGUgbWVzc2FnZSB0byBjdXJyZW50IHVzZXIgd2luZG93XG4gICAgICAgICAgICAgICAgICAgIHdpbmRvdy5tZXNzYWdlcy5wdXNoKGZpbGVNZXNzYWdlKTtcblxuICAgICAgICAgICAgICAgICAgICB0aGlzLm9uTWVzc2FnZVNlbnQuZW1pdChmaWxlTWVzc2FnZSk7XG5cbiAgICAgICAgICAgICAgICAgICAgdGhpcy5zY3JvbGxDaGF0V2luZG93KHdpbmRvdywgU2Nyb2xsRGlyZWN0aW9uLkJvdHRvbSk7XG5cbiAgICAgICAgICAgICAgICAgICAgLy8gUmVzZXRzIHRoZSBmaWxlIHVwbG9hZCBlbGVtZW50XG4gICAgICAgICAgICAgICAgICAgIHVwbG9hZEVsZW1lbnRSZWYubmF0aXZlRWxlbWVudC52YWx1ZSA9ICcnO1xuICAgICAgICAgICAgICAgIH0sIChlcnJvcikgPT4ge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmNsZWFySW5Vc2VGaWxlVXBsb2FkZXIoZmlsZVVwbG9hZEluc3RhbmNlSWQpO1xuXG4gICAgICAgICAgICAgICAgICAgIC8vIFJlc2V0cyB0aGUgZmlsZSB1cGxvYWQgZWxlbWVudFxuICAgICAgICAgICAgICAgICAgICB1cGxvYWRFbGVtZW50UmVmLm5hdGl2ZUVsZW1lbnQudmFsdWUgPSAnJztcblxuICAgICAgICAgICAgICAgICAgICAvLyBUT0RPOiBJbnZva2UgYSBmaWxlIHVwbG9hZCBhZGFwdGVyIGVycm9yIGhlcmVcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGRvd25sb2FkRmlsZShtZXNzYWdlOiBNZXNzYWdlKSB7XG4gICAgICB0aGlzLm1hcmtNZXNzYWdlc0FzUmVhZChbbWVzc2FnZV0pO1xuICAgICAgaWYobWVzc2FnZS5yZXBvc2l0b3J5SWQpIHtcbiAgICAgICAgY29uc3QgZmlsZU5hbWUgPSBtZXNzYWdlLmF0dGFjaG1lbnROYW1lID8gbWVzc2FnZS5hdHRhY2htZW50TmFtZSA6IG1lc3NhZ2UubWVzc2FnZTtcbiAgICAgICAgdGhpcy5vbkRvd25sb2FkRmlsZS5lbWl0KHtcbiAgICAgICAgICByZXBvc2l0b3J5SWQ6IG1lc3NhZ2UucmVwb3NpdG9yeUlkLFxuICAgICAgICAgIGZpbGVOYW1lOiBmaWxlTmFtZX0pO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgZ29Ub1JlcG8od2luZG93OiBXaW5kb3csIG1lc3NhZ2U6IE1lc3NhZ2UpIHtcbiAgICAgIGlmKG1lc3NhZ2UucmVwb3NpdG9yeUlkKSB7XG4gICAgICAgIGNvbnN0IGZpbGVOYW1lID0gbWVzc2FnZS5hdHRhY2htZW50TmFtZSA/IG1lc3NhZ2UuYXR0YWNobWVudE5hbWUgOiBtZXNzYWdlLm1lc3NhZ2U7XG4gICAgICAgIHRoaXMub25Hb1RvUmVwby5lbWl0KHtcbiAgICAgICAgICByZXBvc2l0b3J5SWQ6IG1lc3NhZ2UucmVwb3NpdG9yeUlkLFxuICAgICAgICAgIGlzR3JvdXA6IG1lc3NhZ2UuZ3JvdXBJZCA/IHRydWUgOiBmYWxzZVxuICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH1cbn1cbiJdfQ==