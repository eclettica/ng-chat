import { OnInit, QueryList, EventEmitter } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ChatAdapter } from './core/chat-adapter';
import { IChatGroupAdapter } from './core/chat-group-adapter';
import { User } from "./core/user";
import { ParticipantResponse } from "./core/participant-response";
import { Message } from "./core/message";
import { MessageType } from "./core/message-type.enum";
import { Window } from "./core/window";
import { ChatParticipantStatus } from "./core/chat-participant-status.enum";
import { Localization } from './core/localization';
import { IChatController } from './core/chat-controller';
import { IFileUploadAdapter } from './core/file-upload-adapter';
import { Theme } from './core/theme.enum';
import { IChatOption } from './core/chat-option';
import { ChatParticipantType } from "./core/chat-participant-type.enum";
import { IChatParticipant } from "./core/chat-participant";
import { NgChatWindowComponent } from './components/ng-chat-window/ng-chat-window.component';
export declare class NgChat implements OnInit, IChatController {
    private _httpClient;
    constructor(_httpClient: HttpClient);
    ChatParticipantType: typeof ChatParticipantType;
    ChatParticipantStatus: typeof ChatParticipantStatus;
    MessageType: typeof MessageType;
    private _isDisabled;
    get isDisabled(): boolean;
    set isDisabled(value: boolean);
    adapter: ChatAdapter;
    groupAdapter: IChatGroupAdapter;
    userId: any;
    isCollapsed: boolean;
    maximizeWindowOnNewMessage: boolean;
    pollFriendsList: boolean;
    pollingInterval: number;
    historyEnabled: boolean;
    emojisEnabled: boolean;
    linkfyEnabled: boolean;
    audioEnabled: boolean;
    searchEnabled: boolean;
    audioSource: string;
    persistWindowsState: boolean;
    title: string;
    messagePlaceholder: string;
    searchPlaceholder: string;
    browserNotificationsEnabled: boolean;
    browserNotificationIconSource: string;
    browserNotificationTitle: string;
    historyPageSize: number;
    localization: Localization;
    hideFriendsList: boolean;
    hideFriendsListOnUnsupportedViewport: boolean;
    fileUploadUrl: string;
    theme: Theme;
    customTheme: string;
    messageDatePipeFormat: string;
    showMessageDate: boolean;
    isViewportOnMobileEnabled: boolean;
    beforeParteciantChatClosed: (arg0: IChatParticipant) => boolean;
    onParticipantClicked: EventEmitter<IChatParticipant>;
    onParticipantChatOpened: EventEmitter<IChatParticipant>;
    onParticipantChatClosed: EventEmitter<IChatParticipant>;
    onMessagesSeen: EventEmitter<Message[]>;
    onParticipantToggle: EventEmitter<{
        participant: IChatParticipant;
        isCollapsed: boolean;
    }>;
    private browserNotificationsBootstrapped;
    hasPagedHistory: boolean;
    private statusDescription;
    private audioFile;
    participants: IChatParticipant[];
    participantsResponse: ParticipantResponse[];
    participantsInteractedWith: IChatParticipant[];
    currentActiveOption: IChatOption | null;
    private pollingIntervalWindowInstance;
    private get localStorageKey();
    windowSizeFactor: number;
    friendsListWidth: number;
    private viewPortTotalArea;
    unsupportedViewport: boolean;
    fileUploadAdapter: IFileUploadAdapter;
    windows: Window[];
    isBootstrapped: boolean;
    chatWindows: QueryList<NgChatWindowComponent>;
    ngOnInit(): void;
    onResize(event: any): void;
    private NormalizeWindows;
    private bootstrapChat;
    private activateFriendListFetch;
    private initializeBrowserNotifications;
    private initializeDefaultText;
    private initializeTheme;
    fetchFriendsList(isBootstrapping: boolean): void;
    fetchMessageHistory(window: Window): void;
    private onFetchMessageHistoryLoaded;
    private onFriendsListChanged;
    private onMessageReceived;
    onParticipantClickedFromFriendsList(participant: IChatParticipant): void;
    private cancelOptionPrompt;
    onOptionPromptCanceled(): void;
    onOptionPromptConfirmed(event: any): void;
    private confirmNewGroup;
    private openChatWindow;
    private focusOnWindow;
    private assertMessageType;
    markMessagesAsRead(messages: Message[]): void;
    private bufferAudioFile;
    private emitMessageSound;
    private emitBrowserNotification;
    private updateWindowsState;
    private restoreWindowsState;
    private getClosestWindow;
    private closeWindow;
    private getChatWindowComponentInstance;
    private scrollChatWindow;
    onWindowMessagesSeen(messagesSeen: Message[]): void;
    onWindowChatToggle(payload: {
        currentWindow: Window;
        isCollapsed: boolean;
    }): Promise<void>;
    onWindowChatClosed(payload: {
        closedWindow: Window;
        closedViaEscapeKey: boolean;
    }): Promise<void>;
    onWindowTabTriggered(payload: {
        triggeringWindow: Window;
        shiftKeyPressed: boolean;
    }): void;
    onWindowMessageSent(messageSent: Message): void;
    onWindowOptionTriggered(option: IChatOption): void;
    triggerOpenChatWindow(user: User): void;
    triggerCloseChatWindow(userId: any): void;
    triggerToggleChatWindowVisibility(userId: any): void;
    setBeforeParteciantChatClosed(func: any): void;
}
