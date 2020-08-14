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
        this.emojisEnabled = true;
        this.linkfyEnabled = true;
        this.showMessageDate = true;
        this.messageDatePipeFormat = "short";
        this.hasPagedHistory = true;
        this.onChatWindowClosed = new EventEmitter();
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
        template: "<ng-container *ngIf=\"window && window.isCollapsed\">\n\t<div class=\"ng-chat-title secondary-background\">\n\t\t<div class=\"ng-chat-title-visibility-toggle-area\" (click)=\"onChatWindowClicked(window)\">\n\t\t\t<strong title=\"{{window.participant.displayName}}\">\n\t\t\t\t{{window.participant.displayName}}\n\t\t\t</strong>\n\t\t\t<span [ngClass]=\"{'ng-chat-participant-status': true, 'online': window.participant.status == ChatParticipantStatus.Online, 'busy': window.participant.status == ChatParticipantStatus.Busy, 'away': window.participant.status == ChatParticipantStatus.Away, 'offline': window.participant.status == ChatParticipantStatus.Offline}\" title=\"{{chatParticipantStatusDescriptor(window.participant.status, localization)}}\"></span>\n\t\t\t<span *ngIf=\"unreadMessagesTotal(window).length > 0\" class=\"ng-chat-unread-messages-count unread-messages-counter-container primary-text\">{{unreadMessagesTotal(window)}}</span>\n\t\t</div>\n\t\t<a href=\"javascript:void(0);\" class=\"ng-chat-close primary-text\" (click)=\"onCloseChatWindow()\">X</a>\n\t</div>\n</ng-container>\n<ng-container *ngIf=\"window && !window.isCollapsed\">\n\t<div class=\"ng-chat-title secondary-background\">\n\t\t<div class=\"ng-chat-title-visibility-toggle-area\" (click)=\"onChatWindowClicked(window)\">\n\t\t\t<strong title=\"{{window.participant.displayName}}\">\n\t\t\t\t{{window.participant.displayName}}\n\t\t\t</strong>\n\t\t\t<span [ngClass]=\"{'ng-chat-participant-status': true, 'online': window.participant.status == ChatParticipantStatus.Online, 'busy': window.participant.status == ChatParticipantStatus.Busy, 'away': window.participant.status == ChatParticipantStatus.Away, 'offline': window.participant.status == ChatParticipantStatus.Offline}\" title=\"{{chatParticipantStatusDescriptor(window.participant.status, localization)}}\"></span>\n\t\t\t<span *ngIf=\"unreadMessagesTotal(window).length > 0\" class=\"ng-chat-unread-messages-count unread-messages-counter-container primary-text\">{{unreadMessagesTotal(window)}}</span>\n\t\t</div>\n\t\t<a href=\"javascript:void(0);\" class=\"ng-chat-close primary-text\" (click)=\"onCloseChatWindow()\">X</a>\n\t\t<ng-chat-options [ngClass]=\"'ng-chat-options-container'\" [options]=\"defaultWindowOptions(window)\" (activeOptionTrackerChange)=\"activeOptionTrackerChange($event)\"></ng-chat-options>\n\t</div>\n\t<div #chatMessages class=\"ng-chat-messages primary-background\">\n\t\t<div *ngIf=\"window.isLoadingHistory\" class=\"ng-chat-loading-wrapper\">\n\t\t\t<div class=\"loader\">Loading history...</div>\n\t\t</div>\n\t\t<div *ngIf=\"hasPagedHistory && window.hasMoreMessages && !window.isLoadingHistory\" class=\"ng-chat-load-history\">\n\t\t\t<a class=\"load-history-action\" (click)=\"fetchMessageHistory(window)\">{{localization.loadMessageHistoryPlaceholder}}</a>\n\t\t</div>\n\n\t\t<div *ngFor=\"let message of window.messages; let i = index\" [ngClass]=\"{'ng-chat-message': true, 'ng-chat-message-received': message.fromId != userId}\">\n\t\t\t<ng-container *ngIf=\"isAvatarVisible(window, message, i)\">\n\t\t\t\t<div *ngIf=\"!getChatWindowAvatar(window.participant, message)\" class=\"icon-wrapper\">\n\t\t\t\t\t<i class=\"user-icon\"></i>\n\t\t\t\t</div>\n\t\t\t\t<img *ngIf=\"getChatWindowAvatar(window.participant, message)\" alt=\"\" class=\"avatar\" height=\"30\" width=\"30\" [src]=\"getChatWindowAvatar(window.participant, message) | sanitize\" />\n\t\t\t\t<span *ngIf=\"window.participant.participantType == ChatParticipantType.Group\" class=\"ng-chat-participant-name\">{{window.participant | groupMessageDisplayName:message}}</span>\n\t\t\t</ng-container>\n\t\t\t<ng-container [ngSwitch]=\"message.type\">\n\t\t\t\t<div *ngSwitchCase=\"MessageType.Text\" [ngClass]=\"{'sent-chat-message-container': message.fromId == userId, 'received-chat-message-container': message.fromId != userId}\">\n          <span [innerHtml]=\"message.message | emojify:emojisEnabled | linkfy:linkfyEnabled\"></span>\n\t\t\t\t\t<span *ngIf=\"showMessageDate && message.dateSent\" class=\"message-sent-date\">{{message.dateSent | date:messageDatePipeFormat}}</span>\n\t\t\t\t</div>\n        <div *ngSwitchCase=\"MessageType.Image\" [ngClass]=\"{'sent-chat-message-container': message.fromId == userId, 'received-chat-message-container': message.fromId != userId}\">\n\n          <img src=\"{{message.message}}\" class=\"image-message\" />\n\n\t\t\t\t\t<span *ngIf=\"showMessageDate && message.dateSent\" class=\"message-sent-date\">{{message.dateSent | date:messageDatePipeFormat}}</span>\n\t\t\t\t</div>\n\t\t\t\t<div *ngSwitchCase=\"MessageType.File\" [ngClass]=\"{'file-message-container': true, 'received': message.fromId != userId}\">\n\t\t\t\t\t<div class=\"file-message-icon-container\">\n\t\t\t\t\t\t<i class=\"paperclip-icon\"></i>\n\t\t\t\t\t</div>\n\t\t\t\t\t<a class=\"file-details\" [attr.href]=\"message.downloadUrl\" target=\"_blank\" rel=\"noopener noreferrer\" (click)=\"this.markMessagesAsRead([message])\" download>\n\t\t\t\t\t\t<span class=\"file-message-title\" [attr.title]=\"message.message\">{{message.message}}</span>\n\t\t\t\t\t\t<span *ngIf=\"message.fileSizeInBytes\"  class=\"file-message-size\">{{message.fileSizeInBytes}} Bytes</span>\n\t\t\t\t\t</a>\n\t\t\t\t</div>\n\t\t\t</ng-container>\n\t\t</div>\n\t</div>\n\n\t<div class=\"ng-chat-footer primary-outline-color primary-background\">\n\t\t<input #chatWindowInput\n\t\t\ttype=\"text\"\n\t\t\t[ngModel]=\"window.newMessage | emojify:emojisEnabled\"\n\t\t\t(ngModelChange)=\"window.newMessage=$event\"\n\t\t\t[placeholder]=\"localization.messagePlaceholder\"\n\t\t\t[ngClass]=\"{'chat-window-input': true, 'has-side-action': fileUploadAdapter}\"\n\t\t\t(keydown)=\"onChatInputTyped($event, window)\"\n\t\t\t(blur)=\"toggleWindowFocus(window)\"\n\t\t\t(focus)=\"toggleWindowFocus(window)\"/>\n\n\t\t<!-- File Upload -->\n\t\t<ng-container *ngIf=\"fileUploadAdapter\">\n\t\t\t<a *ngIf=\"!isUploadingFile(window)\" class=\"btn-add-file\" (click)=\"triggerNativeFileUpload(window)\">\n\t\t\t\t<i class=\"upload-icon\"></i>\n\t\t\t</a>\n\t\t\t<input\n\t\t\t\ttype=\"file\"\n\t\t\t\t#nativeFileInput\n\t\t\t\tstyle=\"display: none;\"\n\t\t\t\t[attr.id]=\"getUniqueFileUploadInstanceId(window)\"\n\t\t\t\t(change)=\"onFileChosen(window)\" />\n\t\t\t<div *ngIf=\"isUploadingFile(window)\" class=\"loader\"></div>\n\t\t</ng-container>\n\t</div>\n</ng-container>\n",
        encapsulation: ViewEncapsulation.None,
        styles: [".ng-chat-window{right:260px;height:360px;z-index:999;bottom:0;width:300px;position:fixed;border-width:1px;border-style:solid;border-bottom:0;box-shadow:0 4px 8px rgba(0,0,0,.25)}.ng-chat-window-collapsed{height:30px!important}.ng-chat-window .ng-chat-footer{box-sizing:border-box;padding:0;display:block;height:calc(10%);width:100%;border:none;border-top:1px solid transparent;border-color:inherit}.ng-chat-window .ng-chat-footer>input{font-size:.8em;box-sizing:border-box;padding:0 5px;display:block;height:100%;width:100%;border:none}.ng-chat-window .ng-chat-footer>input.has-side-action{width:calc(100% - 30px)}.ng-chat-window .ng-chat-footer .btn-add-file{position:absolute;right:5px;bottom:7px;height:20px;width:20px;cursor:pointer}.ng-chat-window .ng-chat-footer .loader{position:absolute;right:14px;bottom:8px}.ng-chat-window .ng-chat-load-history{height:30px;text-align:center;font-size:.8em}.ng-chat-window .ng-chat-load-history>a{border-radius:15px;cursor:pointer;padding:5px 10px}.ng-chat-window .ng-chat-messages{padding:10px;width:100%;height:calc(90% - 30px);box-sizing:border-box;position:relative;overflow:auto}.ng-chat-window .ng-chat-messages .ng-chat-message{clear:both}.ng-chat-window .ng-chat-messages .ng-chat-message>.icon-wrapper,.ng-chat-window .ng-chat-messages .ng-chat-message>img.avatar{position:absolute;left:10px;border-radius:25px}.ng-chat-window .ng-chat-messages .ng-chat-message .ng-chat-participant-name{display:inline-block;margin-left:40px;padding-bottom:5px;font-weight:700;font-size:.8em;text-overflow:ellipsis;max-width:180px}.ng-chat-window .ng-chat-messages .ng-chat-message>.icon-wrapper{background-color:#bababa;overflow:hidden;width:30px;height:30px;padding:0}.ng-chat-window .ng-chat-messages .ng-chat-message>.icon-wrapper>i{color:#fff;transform:scale(.7)}.ng-chat-window .ng-chat-messages .ng-chat-message .message-sent-date{font-size:.8em;display:block;text-align:right;margin-top:5px}.ng-chat-window .ng-chat-messages .ng-chat-message>div{float:right;width:182px;padding:10px;border-radius:5px;margin-top:0;margin-bottom:5px;font-size:.9em;word-wrap:break-word}.ng-chat-window .ng-chat-messages .ng-chat-message.ng-chat-message-received>div.received-chat-message-container{float:left;margin-left:40px;padding-top:7px;padding-bottom:7px;border-style:solid;border-width:3px;margin-top:0;margin-bottom:5px}.ng-chat-window .ng-chat-messages .ng-chat-message .file-message-container{float:right;width:202px;border-style:solid;border-width:3px;border-radius:5px;overflow:hidden;margin-bottom:5px;display:block;text-decoration:none;font-size:.9em;padding:0;box-sizing:border-box}.ng-chat-window .ng-chat-messages .ng-chat-message .file-message-container.received{float:left;margin-left:40px;width:208px}.ng-chat-window .ng-chat-messages .ng-chat-message .file-message-container>.file-message-icon-container{width:20px;height:35px;padding:10px 5px;float:left}.ng-chat-window .ng-chat-messages .ng-chat-message .file-message-container>.file-message-icon-container i{margin-top:8px}.ng-chat-window .ng-chat-messages .ng-chat-message .file-message-container>.file-details{float:left;padding:10px;width:calc(100% - 60px);color:currentColor;text-decoration:none}.ng-chat-window .ng-chat-messages .ng-chat-message .file-message-container>.file-details:hover{text-decoration:underline}.ng-chat-window .ng-chat-messages .ng-chat-message .file-message-container>.file-details span{display:block;width:100%;text-overflow:ellipsis;overflow:hidden;white-space:nowrap}.ng-chat-window .ng-chat-messages .ng-chat-message .file-message-container>.file-details .file-message-title{font-weight:700}.ng-chat-window .ng-chat-messages .ng-chat-message .file-message-container>.file-details .file-message-size{font-size:.8em;margin-top:5px}.ng-chat-window .image-message{width:100%;height:auto}@media only screen and (max-width:581px){.ng-chat-window{position:initial}}"]
    })
], NgChatWindowComponent);
export { NgChatWindowComponent };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmctY2hhdC13aW5kb3cuY29tcG9uZW50LmpzIiwic291cmNlUm9vdCI6Im5nOi8vbmctY2hhdC8iLCJzb3VyY2VzIjpbIm5nLWNoYXQvY29tcG9uZW50cy9uZy1jaGF0LXdpbmRvdy9uZy1jaGF0LXdpbmRvdy5jb21wb25lbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBLE9BQU8sRUFBRSxTQUFTLEVBQUUsS0FBSyxFQUFFLE1BQU0sRUFBRSxZQUFZLEVBQUUsaUJBQWlCLEVBQUUsU0FBUyxFQUFjLE1BQU0sZUFBZSxDQUFDO0FBRWpILE9BQU8sRUFBRSxPQUFPLEVBQUUsTUFBTSxvQkFBb0IsQ0FBQztBQUM3QyxPQUFPLEVBQUUsV0FBVyxFQUFFLE1BQU0sOEJBQThCLENBQUM7QUFFM0QsT0FBTyxFQUFFLHFCQUFxQixFQUFFLE1BQU0seUNBQXlDLENBQUM7QUFDaEYsT0FBTyxFQUFFLGVBQWUsRUFBRSxNQUFNLGtDQUFrQyxDQUFDO0FBS25FLE9BQU8sRUFBRSxtQkFBbUIsRUFBRSxNQUFNLHVDQUF1QyxDQUFDO0FBRTVFLE9BQU8sRUFBRSxjQUFjLEVBQUUsTUFBTSw0QkFBNEIsQ0FBQztBQUM1RCxPQUFPLEVBQUUsK0JBQStCLEVBQUUsTUFBTSwrQ0FBK0MsQ0FBQztBQVFoRyxJQUFhLHFCQUFxQixHQUFsQyxNQUFhLHFCQUFxQjtJQUM5QjtRQWtCTyxrQkFBYSxHQUFZLElBQUksQ0FBQztRQUc5QixrQkFBYSxHQUFZLElBQUksQ0FBQztRQUc5QixvQkFBZSxHQUFZLElBQUksQ0FBQztRQUdoQywwQkFBcUIsR0FBVyxPQUFPLENBQUM7UUFHeEMsb0JBQWUsR0FBWSxJQUFJLENBQUM7UUFHaEMsdUJBQWtCLEdBQXVFLElBQUksWUFBWSxFQUFFLENBQUM7UUFHNUcsbUJBQWMsR0FBNEIsSUFBSSxZQUFZLEVBQUUsQ0FBQztRQUc3RCxrQkFBYSxHQUEwQixJQUFJLFlBQVksRUFBRSxDQUFDO1FBRzFELG1CQUFjLEdBQXlFLElBQUksWUFBWSxF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RWxELGlDQUFpQztnQkFDakMsZ0JBQWdCLENBQUMsYUFBYSxDQUFDLEtBQUssR0FBRyxFQUFFLENBQUM7Z0JBRTFDLGdEQUFnRDtZQUNwRCxDQUFDLENBQUMsQ0FBQztTQUNWO0lBQ0wsQ0FBQztDQUNKLENBQUE7QUE5Ukc7SUFEQyxLQUFLLEVBQUU7Z0VBQ3FDO0FBRzdDO0lBREMsS0FBSyxFQUFFO3FEQUNjO0FBR3RCO0lBREMsS0FBSyxFQUFFO3FEQUNXO0FBR25CO0lBREMsS0FBSyxFQUFFOzJEQUMwQjtBQUdsQztJQURDLEtBQUssRUFBRTswREFDb0I7QUFHNUI7SUFEQyxLQUFLLEVBQUU7NERBQzZCO0FBR3JDO0lBREMsS0FBSyxFQUFFOzREQUM2QjtBQUdyQztJQURDLEtBQUssRUFBRTs4REFDK0I7QUFHdkM7SUFEQyxLQUFLLEVBQUU7b0VBQ3VDO0FBRy9DO0lBREMsS0FBSyxFQUFFOzhEQUMrQjtBQUd2QztJQURDLE1BQU0sRUFBRTtpRUFDMEc7QUFHbkg7SUFEQyxNQUFNLEVBQUU7NkRBQzJEO0FBR3BFO0lBREMsTUFBTSxFQUFFOzREQUN3RDtBQUdqRTtJQURDLE1BQU0sRUFBRTs2REFDd0c7QUFHakg7SUFEQyxNQUFNLEVBQUU7Z0VBQ2dFO0FBR3pFO0lBREMsTUFBTSxFQUFFO3FFQUNnRTtBQUU5QztJQUExQixTQUFTLENBQUMsY0FBYyxDQUFDOzJEQUFtQjtBQUNmO0lBQTdCLFNBQVMsQ0FBQyxpQkFBaUIsQ0FBQzs4REFBNkI7QUFDNUI7SUFBN0IsU0FBUyxDQUFDLGlCQUFpQixDQUFDOzhEQUFzQjtBQXJEMUMscUJBQXFCO0lBTmpDLFNBQVMsQ0FBQztRQUNQLFFBQVEsRUFBRSxnQkFBZ0I7UUFDMUIsMndNQUE4QztRQUU5QyxhQUFhLEVBQUUsaUJBQWlCLENBQUMsSUFBSTs7S0FDeEMsQ0FBQztHQUNXLHFCQUFxQixDQWtTakM7U0FsU1kscUJBQXFCIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgQ29tcG9uZW50LCBJbnB1dCwgT3V0cHV0LCBFdmVudEVtaXR0ZXIsIFZpZXdFbmNhcHN1bGF0aW9uLCBWaWV3Q2hpbGQsIEVsZW1lbnRSZWYgfSBmcm9tICdAYW5ndWxhci9jb3JlJztcblxuaW1wb3J0IHsgTWVzc2FnZSB9IGZyb20gXCIuLi8uLi9jb3JlL21lc3NhZ2VcIjtcbmltcG9ydCB7IE1lc3NhZ2VUeXBlIH0gZnJvbSBcIi4uLy4uL2NvcmUvbWVzc2FnZS10eXBlLmVudW1cIjtcbmltcG9ydCB7IFdpbmRvdyB9IGZyb20gXCIuLi8uLi9jb3JlL3dpbmRvd1wiO1xuaW1wb3J0IHsgQ2hhdFBhcnRpY2lwYW50U3RhdHVzIH0gZnJvbSBcIi4uLy4uL2NvcmUvY2hhdC1wYXJ0aWNpcGFudC1zdGF0dXMuZW51bVwiO1xuaW1wb3J0IHsgU2Nyb2xsRGlyZWN0aW9uIH0gZnJvbSBcIi4uLy4uL2NvcmUvc2Nyb2xsLWRpcmVjdGlvbi5lbnVtXCI7XG5pbXBvcnQgeyBMb2NhbGl6YXRpb24gfSBmcm9tICcuLi8uLi9jb3JlL2xvY2FsaXphdGlvbic7XG5pbXBvcnQgeyBJRmlsZVVwbG9hZEFkYXB0ZXIgfSBmcm9tICcuLi8uLi9jb3JlL2ZpbGUtdXBsb2FkLWFkYXB0ZXInO1xuaW1wb3J0IHsgSUNoYXRPcHRpb24gfSBmcm9tICcuLi8uLi9jb3JlL2NoYXQtb3B0aW9uJztcbmltcG9ydCB7IEdyb3VwIH0gZnJvbSBcIi4uLy4uL2NvcmUvZ3JvdXBcIjtcbmltcG9ydCB7IENoYXRQYXJ0aWNpcGFudFR5cGUgfSBmcm9tIFwiLi4vLi4vY29yZS9jaGF0LXBhcnRpY2lwYW50LXR5cGUuZW51bVwiO1xuaW1wb3J0IHsgSUNoYXRQYXJ0aWNpcGFudCB9IGZyb20gXCIuLi8uLi9jb3JlL2NoYXQtcGFydGljaXBhbnRcIjtcbmltcG9ydCB7IE1lc3NhZ2VDb3VudGVyIH0gZnJvbSBcIi4uLy4uL2NvcmUvbWVzc2FnZS1jb3VudGVyXCI7XG5pbXBvcnQgeyBjaGF0UGFydGljaXBhbnRTdGF0dXNEZXNjcmlwdG9yIH0gZnJvbSAnLi4vLi4vY29yZS9jaGF0LXBhcnRpY2lwYW50LXN0YXR1cy1kZXNjcmlwdG9yJztcblxuQENvbXBvbmVudCh7XG4gICAgc2VsZWN0b3I6ICduZy1jaGF0LXdpbmRvdycsXG4gICAgdGVtcGxhdGVVcmw6ICcuL25nLWNoYXQtd2luZG93LmNvbXBvbmVudC5odG1sJyxcbiAgICBzdHlsZVVybHM6IFsnLi9uZy1jaGF0LXdpbmRvdy5jb21wb25lbnQuY3NzJ10sXG4gICAgZW5jYXBzdWxhdGlvbjogVmlld0VuY2Fwc3VsYXRpb24uTm9uZVxufSlcbmV4cG9ydCBjbGFzcyBOZ0NoYXRXaW5kb3dDb21wb25lbnQge1xuICAgIGNvbnN0cnVjdG9yKCkgeyB9XG5cbiAgICBASW5wdXQoKVxuICAgIHB1YmxpYyBmaWxlVXBsb2FkQWRhcHRlcjogSUZpbGVVcGxvYWRBZGFwdGVyO1xuXG4gICAgQElucHV0KClcbiAgICBwdWJsaWMgd2luZG93OiBXaW5kb3c7XG5cbiAgICBASW5wdXQoKVxuICAgIHB1YmxpYyB1c2VySWQ6IGFueTtcblxuICAgIEBJbnB1dCgpXG4gICAgcHVibGljIGxvY2FsaXphdGlvbjogTG9jYWxpemF0aW9uO1xuXG4gICAgQElucHV0KClcbiAgICBwdWJsaWMgc2hvd09wdGlvbnM6IGJvb2xlYW47XG5cbiAgICBASW5wdXQoKSAgICBcbiAgICBwdWJsaWMgZW1vamlzRW5hYmxlZDogYm9vbGVhbiA9IHRydWU7XG5cbiAgICBASW5wdXQoKSAgICBcbiAgICBwdWJsaWMgbGlua2Z5RW5hYmxlZDogYm9vbGVhbiA9IHRydWU7XG5cbiAgICBASW5wdXQoKVxuICAgIHB1YmxpYyBzaG93TWVzc2FnZURhdGU6IGJvb2xlYW4gPSB0cnVlO1xuXG4gICAgQElucHV0KClcbiAgICBwdWJsaWMgbWVzc2FnZURhdGVQaXBlRm9ybWF0OiBzdHJpbmcgPSBcInNob3J0XCI7XG5cbiAgICBASW5wdXQoKVxuICAgIHB1YmxpYyBoYXNQYWdlZEhpc3Rvcnk6IGJvb2xlYW4gPSB0cnVlO1xuXG4gICAgQE91dHB1dCgpXG4gICAgcHVibGljIG9uQ2hhdFdpbmRvd0Nsb3NlZDogRXZlbnRFbWl0dGVyPHsgY2xvc2VkV2luZG93OiBXaW5kb3csIGNsb3NlZFZpYUVzY2FwZUtleTogYm9vbGVhbn0+ID0gbmV3IEV2ZW50RW1pdHRlcigpO1xuXG4gICAgQE91dHB1dCgpXG4gICAgcHVibGljIG9uTWVzc2FnZXNTZWVuOiBFdmVudEVtaXR0ZXI8TWVzc2FnZVtdPiA9IG5ldyBFdmVudEVtaXR0ZXIoKTtcblxuICAgIEBPdXRwdXQoKVxuICAgIHB1YmxpYyBvbk1lc3NhZ2VTZW50OiBFdmVudEVtaXR0ZXI8TWVzc2FnZT4gPSBuZXcgRXZlbnRFbWl0dGVyKCk7XG5cbiAgICBAT3V0cHV0KClcbiAgICBwdWJsaWMgb25UYWJUcmlnZ2VyZWQ6IEV2ZW50RW1pdHRlcjx7IHRyaWdnZXJpbmdXaW5kb3c6IFdpbmRvdywgc2hpZnRLZXlQcmVzc2VkOiBib29sZWFuIH0+ID0gbmV3IEV2ZW50RW1pdHRlcigpO1xuXG4gICAgQE91dHB1dCgpXG4gICAgcHVibGljIG9uT3B0aW9uVHJpZ2dlcmVkOiBFdmVudEVtaXR0ZXI8SUNoYXRPcHRpb24+ID0gbmV3IEV2ZW50RW1pdHRlcigpO1xuXG4gICAgQE91dHB1dCgpXG4gICAgcHVibGljIG9uTG9hZEhpc3RvcnlUcmlnZ2VyZWQ6IEV2ZW50RW1pdHRlcjxXaW5kb3c+ID0gbmV3IEV2ZW50RW1pdHRlcigpO1xuXG4gICAgQFZpZXdDaGlsZCgnY2hhdE1lc3NhZ2VzJykgY2hhdE1lc3NhZ2VzOiBhbnk7XG4gICAgQFZpZXdDaGlsZCgnbmF0aXZlRmlsZUlucHV0JykgbmF0aXZlRmlsZUlucHV0OiBFbGVtZW50UmVmO1xuICAgIEBWaWV3Q2hpbGQoJ2NoYXRXaW5kb3dJbnB1dCcpIGNoYXRXaW5kb3dJbnB1dDogYW55O1xuXG4gICAgLy8gRmlsZSB1cGxvYWQgc3RhdGVcbiAgICBwdWJsaWMgZmlsZVVwbG9hZGVyc0luVXNlOiBzdHJpbmdbXSA9IFtdOyAvLyBJZCBidWNrZXQgb2YgdXBsb2FkZXJzIGluIHVzZVxuXG4gICAgLy8gRXhwb3NlcyBlbnVtcyBhbmQgZnVuY3Rpb25zIGZvciB0aGUgbmctdGVtcGxhdGVcbiAgICBwdWJsaWMgQ2hhdFBhcnRpY2lwYW50VHlwZSA9IENoYXRQYXJ0aWNpcGFudFR5cGU7XG4gICAgcHVibGljIENoYXRQYXJ0aWNpcGFudFN0YXR1cyA9IENoYXRQYXJ0aWNpcGFudFN0YXR1cztcbiAgICBwdWJsaWMgTWVzc2FnZVR5cGUgPSBNZXNzYWdlVHlwZTtcbiAgICBwdWJsaWMgY2hhdFBhcnRpY2lwYW50U3RhdHVzRGVzY3JpcHRvciA9IGNoYXRQYXJ0aWNpcGFudFN0YXR1c0Rlc2NyaXB0b3I7XG5cbiAgICBkZWZhdWx0V2luZG93T3B0aW9ucyhjdXJyZW50V2luZG93OiBXaW5kb3cpOiBJQ2hhdE9wdGlvbltdXG4gICAge1xuICAgICAgICBpZiAodGhpcy5zaG93T3B0aW9ucyAmJiBjdXJyZW50V2luZG93LnBhcnRpY2lwYW50LnBhcnRpY2lwYW50VHlwZSA9PSBDaGF0UGFydGljaXBhbnRUeXBlLlVzZXIpXG4gICAgICAgIHtcbiAgICAgICAgICAgIHJldHVybiBbe1xuICAgICAgICAgICAgICAgIGlzQWN0aXZlOiBmYWxzZSxcbiAgICAgICAgICAgICAgICBjaGF0dGluZ1RvOiBjdXJyZW50V2luZG93LFxuICAgICAgICAgICAgICAgIHZhbGlkYXRlQ29udGV4dDogKHBhcnRpY2lwYW50OiBJQ2hhdFBhcnRpY2lwYW50KSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBwYXJ0aWNpcGFudC5wYXJ0aWNpcGFudFR5cGUgPT0gQ2hhdFBhcnRpY2lwYW50VHlwZS5Vc2VyO1xuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgZGlzcGxheUxhYmVsOiAnQWRkIFBlb3BsZScgLy8gVE9ETzogTG9jYWxpemUgdGhpc1xuICAgICAgICAgICAgfV07XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gW107XG4gICAgfVxuXG4gICAgLy8gQXNzZXJ0cyBpZiBhIHVzZXIgYXZhdGFyIGlzIHZpc2libGUgaW4gYSBjaGF0IGNsdXN0ZXJcbiAgICBpc0F2YXRhclZpc2libGUod2luZG93OiBXaW5kb3csIG1lc3NhZ2U6IE1lc3NhZ2UsIGluZGV4OiBudW1iZXIpOiBib29sZWFuXG4gICAge1xuICAgICAgICBpZiAobWVzc2FnZS5mcm9tSWQgIT0gdGhpcy51c2VySWQpe1xuICAgICAgICAgICAgaWYgKGluZGV4ID09IDApe1xuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlOyAvLyBGaXJzdCBtZXNzYWdlLCBnb29kIHRvIHNob3cgdGhlIHRodW1ibmFpbFxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZXtcbiAgICAgICAgICAgICAgICAvLyBDaGVjayBpZiB0aGUgcHJldmlvdXMgbWVzc2FnZSBiZWxvbmdzIHRvIHRoZSBzYW1lIHVzZXIsIGlmIGl0IGJlbG9uZ3MgdGhlcmUgaXMgbm8gbmVlZCB0byBzaG93IHRoZSBhdmF0YXIgYWdhaW4gdG8gZm9ybSB0aGUgbWVzc2FnZSBjbHVzdGVyXG4gICAgICAgICAgICAgICAgaWYgKHdpbmRvdy5tZXNzYWdlc1tpbmRleCAtIDFdLmZyb21JZCAhPSBtZXNzYWdlLmZyb21JZCl7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICBnZXRDaGF0V2luZG93QXZhdGFyKHBhcnRpY2lwYW50OiBJQ2hhdFBhcnRpY2lwYW50LCBtZXNzYWdlOiBNZXNzYWdlKTogc3RyaW5nIHwgbnVsbFxuICAgIHtcbiAgICAgICAgaWYgKHBhcnRpY2lwYW50LnBhcnRpY2lwYW50VHlwZSA9PSBDaGF0UGFydGljaXBhbnRUeXBlLlVzZXIpXG4gICAgICAgIHtcbiAgICAgICAgICAgIHJldHVybiBwYXJ0aWNpcGFudC5hdmF0YXI7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAocGFydGljaXBhbnQucGFydGljaXBhbnRUeXBlID09IENoYXRQYXJ0aWNpcGFudFR5cGUuR3JvdXApXG4gICAgICAgIHtcbiAgICAgICAgICAgIGxldCBncm91cCA9IHBhcnRpY2lwYW50IGFzIEdyb3VwO1xuICAgICAgICAgICAgbGV0IHVzZXJJbmRleCA9IGdyb3VwLmNoYXR0aW5nVG8uZmluZEluZGV4KHggPT4geC5pZCA9PSBtZXNzYWdlLmZyb21JZCk7XG5cbiAgICAgICAgICAgIHJldHVybiBncm91cC5jaGF0dGluZ1RvW3VzZXJJbmRleCA+PSAwID8gdXNlckluZGV4IDogMF0uYXZhdGFyO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuXG4gICAgaXNVcGxvYWRpbmdGaWxlKHdpbmRvdzogV2luZG93KTogYm9vbGVhblxuICAgIHtcbiAgICAgICAgY29uc3QgZmlsZVVwbG9hZEluc3RhbmNlSWQgPSB0aGlzLmdldFVuaXF1ZUZpbGVVcGxvYWRJbnN0YW5jZUlkKHdpbmRvdyk7XG5cbiAgICAgICAgcmV0dXJuIHRoaXMuZmlsZVVwbG9hZGVyc0luVXNlLmluZGV4T2YoZmlsZVVwbG9hZEluc3RhbmNlSWQpID4gLTE7XG4gICAgfVxuXG4gICAgLy8gR2VuZXJhdGVzIGEgdW5pcXVlIGZpbGUgdXBsb2FkZXIgaWQgZm9yIGVhY2ggcGFydGljaXBhbnRcbiAgICBnZXRVbmlxdWVGaWxlVXBsb2FkSW5zdGFuY2VJZCh3aW5kb3c6IFdpbmRvdyk6IHN0cmluZ1xuICAgIHtcbiAgICAgICAgaWYgKHdpbmRvdyAmJiB3aW5kb3cucGFydGljaXBhbnQpXG4gICAgICAgIHtcbiAgICAgICAgICAgIHJldHVybiBgbmctY2hhdC1maWxlLXVwbG9hZC0ke3dpbmRvdy5wYXJ0aWNpcGFudC5pZH1gO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICByZXR1cm4gJ25nLWNoYXQtZmlsZS11cGxvYWQnO1xuICAgIH1cblxuICAgIHVucmVhZE1lc3NhZ2VzVG90YWwod2luZG93OiBXaW5kb3cpOiBzdHJpbmdcbiAgICB7ICAgICAgICAgICBcbiAgICAgICAgcmV0dXJuIE1lc3NhZ2VDb3VudGVyLnVucmVhZE1lc3NhZ2VzVG90YWwod2luZG93LCB0aGlzLnVzZXJJZCk7XG4gICAgfVxuXG4gICAgLy8gU2Nyb2xscyBhIGNoYXQgd2luZG93IG1lc3NhZ2UgZmxvdyB0byB0aGUgYm90dG9tXG4gICAgc2Nyb2xsQ2hhdFdpbmRvdyh3aW5kb3c6IFdpbmRvdywgZGlyZWN0aW9uOiBTY3JvbGxEaXJlY3Rpb24pOiB2b2lkXG4gICAge1xuICAgICAgICBpZiAoIXdpbmRvdy5pc0NvbGxhcHNlZCl7XG4gICAgICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5jaGF0TWVzc2FnZXMpe1xuICAgICAgICAgICAgICAgICAgICBsZXQgZWxlbWVudCA9IHRoaXMuY2hhdE1lc3NhZ2VzLm5hdGl2ZUVsZW1lbnQ7XG4gICAgICAgICAgICAgICAgICAgIGxldCBwb3NpdGlvbiA9ICggZGlyZWN0aW9uID09PSBTY3JvbGxEaXJlY3Rpb24uVG9wICkgPyAwIDogZWxlbWVudC5zY3JvbGxIZWlnaHQ7XG4gICAgICAgICAgICAgICAgICAgIGVsZW1lbnQuc2Nyb2xsVG9wID0gcG9zaXRpb247XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7IFxuICAgICAgICB9XG4gICAgfVxuXG4gICAgYWN0aXZlT3B0aW9uVHJhY2tlckNoYW5nZShvcHRpb246IElDaGF0T3B0aW9uKTogdm9pZCB7XG4gICAgICAgIHRoaXMub25PcHRpb25UcmlnZ2VyZWQuZW1pdChvcHRpb24pO1xuICAgIH1cblxuICAgIC8vIFRyaWdnZXJzIG5hdGl2ZSBmaWxlIHVwbG9hZCBmb3IgZmlsZSBzZWxlY3Rpb24gZnJvbSB0aGUgdXNlclxuICAgIHRyaWdnZXJOYXRpdmVGaWxlVXBsb2FkKHdpbmRvdzogV2luZG93KTogdm9pZFxuICAgIHtcbiAgICAgICAgaWYgKHdpbmRvdylcbiAgICAgICAge1xuICAgICAgICAgICAgaWYgKHRoaXMubmF0aXZlRmlsZUlucHV0KSB0aGlzLm5hdGl2ZUZpbGVJbnB1dC5uYXRpdmVFbGVtZW50LmNsaWNrKCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBUb2dnbGVzIGEgd2luZG93IGZvY3VzIG9uIHRoZSBmb2N1cy9ibHVyIG9mIGEgJ25ld01lc3NhZ2UnIGlucHV0XG4gICAgdG9nZ2xlV2luZG93Rm9jdXMod2luZG93OiBXaW5kb3cpOiB2b2lkXG4gICAge1xuICAgICAgICB3aW5kb3cuaGFzRm9jdXMgPSAhd2luZG93Lmhhc0ZvY3VzO1xuICAgICAgICBpZih3aW5kb3cuaGFzRm9jdXMpIHtcbiAgICAgICAgICAgIGNvbnN0IHVucmVhZE1lc3NhZ2VzID0gd2luZG93Lm1lc3NhZ2VzXG4gICAgICAgICAgICAgICAgLmZpbHRlcihtZXNzYWdlID0+IG1lc3NhZ2UuZGF0ZVNlZW4gPT0gbnVsbCBcbiAgICAgICAgICAgICAgICAgICAgJiYgKG1lc3NhZ2UudG9JZCA9PSB0aGlzLnVzZXJJZCB8fCB3aW5kb3cucGFydGljaXBhbnQucGFydGljaXBhbnRUeXBlID09PSBDaGF0UGFydGljaXBhbnRUeXBlLkdyb3VwKSk7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGlmICh1bnJlYWRNZXNzYWdlcyAmJiB1bnJlYWRNZXNzYWdlcy5sZW5ndGggPiAwKVxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIHRoaXMub25NZXNzYWdlc1NlZW4uZW1pdCh1bnJlYWRNZXNzYWdlcyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBtYXJrTWVzc2FnZXNBc1JlYWQobWVzc2FnZXM6IE1lc3NhZ2VbXSk6IHZvaWQgXG4gICAge1xuICAgICAgICB0aGlzLm9uTWVzc2FnZXNTZWVuLmVtaXQobWVzc2FnZXMpO1xuICAgIH1cblxuICAgIGZldGNoTWVzc2FnZUhpc3Rvcnkod2luZG93OiBXaW5kb3cpOiB2b2lkIHtcbiAgICAgICAgdGhpcy5vbkxvYWRIaXN0b3J5VHJpZ2dlcmVkLmVtaXQod2luZG93KTtcbiAgICB9XG5cbiAgICAvLyBDbG9zZXMgYSBjaGF0IHdpbmRvdyB2aWEgdGhlIGNsb3NlICdYJyBidXR0b25cbiAgICBvbkNsb3NlQ2hhdFdpbmRvdygpOiB2b2lkIFxuICAgIHtcbiAgICAgICAgdGhpcy5vbkNoYXRXaW5kb3dDbG9zZWQuZW1pdCh7IGNsb3NlZFdpbmRvdzogdGhpcy53aW5kb3csIGNsb3NlZFZpYUVzY2FwZUtleTogZmFsc2UgfSk7XG4gICAgfVxuXG4gICAgLyogIE1vbml0b3JzIHByZXNzZWQga2V5cyBvbiBhIGNoYXQgd2luZG93XG4gICAgICAgIC0gRGlzcGF0Y2hlcyBhIG1lc3NhZ2Ugd2hlbiB0aGUgRU5URVIga2V5IGlzIHByZXNzZWRcbiAgICAgICAgLSBUYWJzIGJldHdlZW4gd2luZG93cyBvbiBUQUIgb3IgU0hJRlQgKyBUQUJcbiAgICAgICAgLSBDbG9zZXMgdGhlIGN1cnJlbnQgZm9jdXNlZCB3aW5kb3cgb24gRVNDXG4gICAgKi9cbiAgIG9uQ2hhdElucHV0VHlwZWQoZXZlbnQ6IGFueSwgd2luZG93OiBXaW5kb3cpOiB2b2lkXG4gICB7XG4gICAgICAgc3dpdGNoIChldmVudC5rZXlDb2RlKVxuICAgICAgIHtcbiAgICAgICAgICAgY2FzZSAxMzpcbiAgICAgICAgICAgICAgIGlmICh3aW5kb3cubmV3TWVzc2FnZSAmJiB3aW5kb3cubmV3TWVzc2FnZS50cmltKCkgIT0gXCJcIilcbiAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICBsZXQgbWVzc2FnZSA9IG5ldyBNZXNzYWdlKCk7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICBtZXNzYWdlLmZyb21JZCA9IHRoaXMudXNlcklkO1xuICAgICAgICAgICAgICAgICAgIG1lc3NhZ2UudG9JZCA9IHdpbmRvdy5wYXJ0aWNpcGFudC5pZDtcbiAgICAgICAgICAgICAgICAgICBtZXNzYWdlLm1lc3NhZ2UgPSB3aW5kb3cubmV3TWVzc2FnZTtcbiAgICAgICAgICAgICAgICAgICBtZXNzYWdlLmRhdGVTZW50ID0gbmV3IERhdGUoKTtcbiAgICAgICBcbiAgICAgICAgICAgICAgICAgICB3aW5kb3cubWVzc2FnZXMucHVzaChtZXNzYWdlKTtcbiAgICAgICBcbiAgICAgICAgICAgICAgICAgICB0aGlzLm9uTWVzc2FnZVNlbnQuZW1pdChtZXNzYWdlKTtcbiAgICAgICBcbiAgICAgICAgICAgICAgICAgICB3aW5kb3cubmV3TWVzc2FnZSA9IFwiXCI7IC8vIFJlc2V0cyB0aGUgbmV3IG1lc3NhZ2UgaW5wdXRcbiAgICAgICBcbiAgICAgICAgICAgICAgICAgICB0aGlzLnNjcm9sbENoYXRXaW5kb3cod2luZG93LCBTY3JvbGxEaXJlY3Rpb24uQm90dG9tKTtcbiAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICBjYXNlIDk6XG4gICAgICAgICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuXG4gICAgICAgICAgICAgICB0aGlzLm9uVGFiVHJpZ2dlcmVkLmVtaXQoeyB0cmlnZ2VyaW5nV2luZG93OiB3aW5kb3csIHNoaWZ0S2V5UHJlc3NlZDogZXZlbnQuc2hpZnRLZXkgfSk7XG5cbiAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICBjYXNlIDI3OlxuICAgICAgICAgICAgICAgdGhpcy5vbkNoYXRXaW5kb3dDbG9zZWQuZW1pdCh7IGNsb3NlZFdpbmRvdzogd2luZG93LCBjbG9zZWRWaWFFc2NhcGVLZXk6IHRydWUgfSk7XG5cbiAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgIH1cbiAgIH1cblxuICAgIC8vIFRvZ2dsZXMgYSBjaGF0IHdpbmRvdyB2aXNpYmlsaXR5IGJldHdlZW4gbWF4aW1pemVkL21pbmltaXplZFxuICAgIG9uQ2hhdFdpbmRvd0NsaWNrZWQod2luZG93OiBXaW5kb3cpOiB2b2lkXG4gICAge1xuICAgICAgICB3aW5kb3cuaXNDb2xsYXBzZWQgPSAhd2luZG93LmlzQ29sbGFwc2VkO1xuICAgICAgICB0aGlzLnNjcm9sbENoYXRXaW5kb3cod2luZG93LCBTY3JvbGxEaXJlY3Rpb24uQm90dG9tKTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGNsZWFySW5Vc2VGaWxlVXBsb2FkZXIoZmlsZVVwbG9hZEluc3RhbmNlSWQ6IHN0cmluZyk6IHZvaWRcbiAgICB7XG4gICAgICAgIGNvbnN0IHVwbG9hZGVySW5zdGFuY2VJZEluZGV4ID0gdGhpcy5maWxlVXBsb2FkZXJzSW5Vc2UuaW5kZXhPZihmaWxlVXBsb2FkSW5zdGFuY2VJZCk7XG5cbiAgICAgICAgaWYgKHVwbG9hZGVySW5zdGFuY2VJZEluZGV4ID4gLTEpIHtcbiAgICAgICAgICAgIHRoaXMuZmlsZVVwbG9hZGVyc0luVXNlLnNwbGljZSh1cGxvYWRlckluc3RhbmNlSWRJbmRleCwgMSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBIYW5kbGVzIGZpbGUgc2VsZWN0aW9uIGFuZCB1cGxvYWRzIHRoZSBzZWxlY3RlZCBmaWxlIHVzaW5nIHRoZSBmaWxlIHVwbG9hZCBhZGFwdGVyXG4gICAgb25GaWxlQ2hvc2VuKHdpbmRvdzogV2luZG93KTogdm9pZCB7XG4gICAgICAgIGNvbnN0IGZpbGVVcGxvYWRJbnN0YW5jZUlkID0gdGhpcy5nZXRVbmlxdWVGaWxlVXBsb2FkSW5zdGFuY2VJZCh3aW5kb3cpO1xuICAgICAgICBjb25zdCB1cGxvYWRFbGVtZW50UmVmID0gdGhpcy5uYXRpdmVGaWxlSW5wdXQ7XG5cbiAgICAgICAgaWYgKHVwbG9hZEVsZW1lbnRSZWYpXG4gICAgICAgIHtcbiAgICAgICAgICAgIGNvbnN0IGZpbGU6IEZpbGUgPSB1cGxvYWRFbGVtZW50UmVmLm5hdGl2ZUVsZW1lbnQuZmlsZXNbMF07XG5cbiAgICAgICAgICAgIHRoaXMuZmlsZVVwbG9hZGVyc0luVXNlLnB1c2goZmlsZVVwbG9hZEluc3RhbmNlSWQpO1xuXG4gICAgICAgICAgICB0aGlzLmZpbGVVcGxvYWRBZGFwdGVyLnVwbG9hZEZpbGUoZmlsZSwgd2luZG93LnBhcnRpY2lwYW50LmlkKVxuICAgICAgICAgICAgICAgIC5zdWJzY3JpYmUoZmlsZU1lc3NhZ2UgPT4ge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmNsZWFySW5Vc2VGaWxlVXBsb2FkZXIoZmlsZVVwbG9hZEluc3RhbmNlSWQpO1xuXG4gICAgICAgICAgICAgICAgICAgIGZpbGVNZXNzYWdlLmZyb21JZCA9IHRoaXMudXNlcklkO1xuXG4gICAgICAgICAgICAgICAgICAgIC8vIFB1c2ggZmlsZSBtZXNzYWdlIHRvIGN1cnJlbnQgdXNlciB3aW5kb3cgICBcbiAgICAgICAgICAgICAgICAgICAgd2luZG93Lm1lc3NhZ2VzLnB1c2goZmlsZU1lc3NhZ2UpO1xuICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5vbk1lc3NhZ2VTZW50LmVtaXQoZmlsZU1lc3NhZ2UpO1xuICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5zY3JvbGxDaGF0V2luZG93KHdpbmRvdywgU2Nyb2xsRGlyZWN0aW9uLkJvdHRvbSk7XG5cbiAgICAgICAgICAgICAgICAgICAgLy8gUmVzZXRzIHRoZSBmaWxlIHVwbG9hZCBlbGVtZW50XG4gICAgICAgICAgICAgICAgICAgIHVwbG9hZEVsZW1lbnRSZWYubmF0aXZlRWxlbWVudC52YWx1ZSA9ICcnO1xuICAgICAgICAgICAgICAgIH0sIChlcnJvcikgPT4ge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmNsZWFySW5Vc2VGaWxlVXBsb2FkZXIoZmlsZVVwbG9hZEluc3RhbmNlSWQpO1xuXG4gICAgICAgICAgICAgICAgICAgIC8vIFJlc2V0cyB0aGUgZmlsZSB1cGxvYWQgZWxlbWVudFxuICAgICAgICAgICAgICAgICAgICB1cGxvYWRFbGVtZW50UmVmLm5hdGl2ZUVsZW1lbnQudmFsdWUgPSAnJztcblxuICAgICAgICAgICAgICAgICAgICAvLyBUT0RPOiBJbnZva2UgYSBmaWxlIHVwbG9hZCBhZGFwdGVyIGVycm9yIGhlcmVcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH1cbn1cbiJdfQ==