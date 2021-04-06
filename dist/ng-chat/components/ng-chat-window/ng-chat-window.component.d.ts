import { EventEmitter, ElementRef, OnInit } from '@angular/core';
import { Message } from "../../core/message";
import { MessageType } from "../../core/message-type.enum";
import { Window } from "../../core/window";
import { ChatParticipantStatus } from "../../core/chat-participant-status.enum";
import { ScrollDirection } from "../../core/scroll-direction.enum";
import { Localization } from '../../core/localization';
import { IFileUploadAdapter } from '../../core/file-upload-adapter';
import { IChatOption } from '../../core/chat-option';
import { ChatParticipantType } from "../../core/chat-participant-type.enum";
import { IChatParticipant } from "../../core/chat-participant";
import { chatParticipantStatusDescriptor } from '../../core/chat-participant-status-descriptor';
export declare class NgChatWindowComponent implements OnInit {
    windowClass: string | undefined;
    constructor();
    ngOnInit(): void;
    fileUploadAdapter: IFileUploadAdapter;
    window: Window;
    userId: any;
    localization: Localization;
    showOptions: boolean;
    emojisEnabled: boolean;
    linkfyEnabled: boolean;
    showMessageDate: boolean;
    messageDatePipeFormat: string;
    hasPagedHistory: boolean;
    onChatWindowClosed: EventEmitter<{
        closedWindow: Window;
        closedViaEscapeKey: boolean;
    }>;
    onChatWindowToggle: EventEmitter<{
        currentWindow: Window;
        isCollapsed: boolean;
    }>;
    onMessagesSeen: EventEmitter<Message[]>;
    onMessageSent: EventEmitter<Message>;
    onTabTriggered: EventEmitter<{
        triggeringWindow: Window;
        shiftKeyPressed: boolean;
    }>;
    onOptionTriggered: EventEmitter<IChatOption>;
    onLoadHistoryTriggered: EventEmitter<Window>;
    onDownloadFile: EventEmitter<{
        repositoryId: string;
        fileName: string;
    }>;
    onGoToRepo: EventEmitter<{
        repositoryId: string;
        isGroup: boolean;
    }>;
    chatMessages: any;
    nativeFileInput: ElementRef;
    chatWindowInput: any;
    fileUploadersInUse: string[];
    ChatParticipantType: typeof ChatParticipantType;
    ChatParticipantStatus: typeof ChatParticipantStatus;
    MessageType: typeof MessageType;
    chatParticipantStatusDescriptor: typeof chatParticipantStatusDescriptor;
    defaultWindowOptions(currentWindow: Window): IChatOption[];
    isAvatarVisible(window: Window, message: Message, index: number): boolean;
    getChatWindowAvatar(participant: IChatParticipant, message: Message): string | null;
    getChatWindowAvatarSrc(participant: IChatParticipant, message: Message): string | null;
    isUploadingFile(window: Window): boolean;
    getUniqueFileUploadInstanceId(window: Window): string;
    unreadMessagesTotal(window: Window): string;
    scrollChatWindow(window: Window, direction: ScrollDirection): void;
    activeOptionTrackerChange(option: IChatOption): void;
    triggerNativeFileUpload(window: Window): void;
    toggleWindowFocus(window: Window): void;
    markMessagesAsRead(messages: Message[]): void;
    fetchMessageHistory(window: Window): void;
    onCloseChatWindow(): void;
    onChatInputTyped(event: any, window: Window): void;
    onChatWindowClicked(window: Window): void;
    private clearInUseFileUploader;
    onFileChosen(window: Window): void;
    downloadFile(message: Message): void;
    goToRepo(window: Window, message: Message): void;
}
