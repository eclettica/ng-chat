import { __awaiter, __decorate } from "tslib";
import { Component, Input, ViewChildren, HostListener, Output, EventEmitter, ViewEncapsulation } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MessageType } from "./core/message-type.enum";
import { Window } from "./core/window";
import { ChatParticipantStatus } from "./core/chat-participant-status.enum";
import { ScrollDirection } from "./core/scroll-direction.enum";
import { PagedHistoryChatAdapter } from './core/paged-history-chat-adapter';
import { DefaultFileUploadAdapter } from './core/default-file-upload-adapter';
import { Theme } from './core/theme.enum';
import { Group } from "./core/group";
import { ChatParticipantType } from "./core/chat-participant-type.enum";
import { map } from 'rxjs/operators';
let NgChat = class NgChat {
    constructor(_httpClient) {
        this._httpClient = _httpClient;
        // Exposes enums for the ng-template
        this.ChatParticipantType = ChatParticipantType;
        this.ChatParticipantStatus = ChatParticipantStatus;
        this.MessageType = MessageType;
        this._isDisabled = false;
        this.isCollapsed = false;
        this.maximizeWindowOnNewMessage = true;
        this.pollFriendsList = false;
        this.pollingInterval = 5000;
        this.historyEnabled = true;
        this.emojisEnabled = true;
        this.linkfyEnabled = true;
        this.audioEnabled = true;
        this.searchEnabled = true;
        this.audioSource = 'https://raw.githubusercontent.com/rpaschoal/ng-chat/master/src/ng-chat/assets/notification.wav';
        this.persistWindowsState = true;
        this.title = "Friends";
        this.messagePlaceholder = "Type a message";
        this.searchPlaceholder = "Search";
        this.browserNotificationsEnabled = true;
        this.browserNotificationIconSource = 'https://raw.githubusercontent.com/rpaschoal/ng-chat/master/src/ng-chat/assets/notification.png';
        this.browserNotificationTitle = "New message from";
        this.historyPageSize = 10;
        this.hideFriendsList = false;
        this.hideFriendsListOnUnsupportedViewport = true;
        this.theme = Theme.Light;
        this.messageDatePipeFormat = "short";
        this.showMessageDate = true;
        this.isViewportOnMobileEnabled = false;
        this.onParticipantClicked = new EventEmitter();
        this.onParticipantChatOpened = new EventEmitter();
        this.onParticipantChatClosed = new EventEmitter();
        this.onMessagesSeen = new EventEmitter();
        this.onParticipantToggle = new EventEmitter();
        this.browserNotificationsBootstrapped = false;
        this.hasPagedHistory = false;
        // Don't want to add this as a setting to simplify usage. Previous placeholder and title settings available to be used, or use full Localization object.
        this.statusDescription = {
            online: 'Online',
            busy: 'Busy',
            away: 'Away',
            offline: 'Offline'
        };
        this.participantsInteractedWith = [];
        // Defines the size of each opened window to calculate how many windows can be opened on the viewport at the same time.
        this.windowSizeFactor = 320;
        // Total width size of the friends list section
        this.friendsListWidth = 262;
        // Set to true if there is no space to display at least one chat window and 'hideFriendsListOnUnsupportedViewport' is true
        this.unsupportedViewport = false;
        this.windows = [];
        this.isBootstrapped = false;
    }
    get isDisabled() {
        return this._isDisabled;
    }
    set isDisabled(value) {
        this._isDisabled = value;
        if (value) {
            // To address issue https://github.com/rpaschoal/ng-chat/issues/120
            window.clearInterval(this.pollingIntervalWindowInstance);
        }
        else {
            this.activateFriendListFetch();
        }
    }
    get localStorageKey() {
        return `ng-chat-users-${this.userId}`; // Appending the user id so the state is unique per user in a computer.
    }
    ;
    ngOnInit() {
        this.bootstrapChat();
    }
    onResize(event) {
        this.viewPortTotalArea = event.target.innerWidth;
        this.NormalizeWindows();
    }
    // Checks if there are more opened windows than the view port can display
    NormalizeWindows() {
        const maxSupportedOpenedWindows = Math.floor((this.viewPortTotalArea - (!this.hideFriendsList ? this.friendsListWidth : 0)) / this.windowSizeFactor);
        const difference = this.windows.length - maxSupportedOpenedWindows;
        if (difference >= 0) {
            this.windows.splice(this.windows.length - difference);
        }
        this.updateWindowsState(this.windows);
        // Viewport should have space for at least one chat window but should show in mobile if option is enabled.
        this.unsupportedViewport = this.isViewportOnMobileEnabled ? false : this.hideFriendsListOnUnsupportedViewport && maxSupportedOpenedWindows < 1;
    }
    // Initializes the chat plugin and the messaging adapter
    bootstrapChat() {
        let initializationException = null;
        if (this.adapter != null && this.userId != null) {
            try {
                this.viewPortTotalArea = window.innerWidth;
                this.initializeTheme();
                this.initializeDefaultText();
                this.initializeBrowserNotifications();
                // Binding event listeners
                this.adapter.messageReceivedHandler = (participant, msg) => this.onMessageReceived(participant, msg);
                this.adapter.friendsListChangedHandler = (participantsResponse) => this.onFriendsListChanged(participantsResponse);
                this.activateFriendListFetch();
                this.bufferAudioFile();
                this.hasPagedHistory = this.adapter instanceof PagedHistoryChatAdapter;
                if (!this.fileUploadAdapter && this.fileUploadUrl && this.fileUploadUrl !== "") {
                    this.fileUploadAdapter = new DefaultFileUploadAdapter(this.fileUploadUrl, this._httpClient);
                }
                this.NormalizeWindows();
                this.isBootstrapped = true;
            }
            catch (ex) {
                initializationException = ex;
            }
        }
        if (!this.isBootstrapped) {
            console.error("ng-chat component couldn't be bootstrapped.");
            if (this.userId == null) {
                console.error("ng-chat can't be initialized without an user id. Please make sure you've provided an userId as a parameter of the ng-chat component.");
            }
            if (this.adapter == null) {
                console.error("ng-chat can't be bootstrapped without a ChatAdapter. Please make sure you've provided a ChatAdapter implementation as a parameter of the ng-chat component.");
            }
            if (initializationException) {
                console.error(`An exception has occurred while initializing ng-chat. Details: ${initializationException.message}`);
                console.error(initializationException);
            }
        }
    }
    activateFriendListFetch() {
        if (this.adapter) {
            // Loading current users list
            if (this.pollFriendsList) {
                // Setting a long poll interval to update the friends list
                this.fetchFriendsList(true);
                this.pollingIntervalWindowInstance = window.setInterval(() => this.fetchFriendsList(false), this.pollingInterval);
            }
            else {
                // Since polling was disabled, a friends list update mechanism will have to be implemented in the ChatAdapter.
                this.fetchFriendsList(true);
            }
        }
    }
    // Initializes browser notifications
    initializeBrowserNotifications() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.browserNotificationsEnabled && ("Notification" in window)) {
                if ((yield Notification.requestPermission()) === "granted") {
                    this.browserNotificationsBootstrapped = true;
                }
            }
        });
    }
    // Initializes default text
    initializeDefaultText() {
        if (!this.localization) {
            this.localization = {
                messagePlaceholder: this.messagePlaceholder,
                searchPlaceholder: this.searchPlaceholder,
                title: this.title,
                statusDescription: this.statusDescription,
                browserNotificationTitle: this.browserNotificationTitle,
                loadMessageHistoryPlaceholder: "Load older messages"
            };
        }
    }
    initializeTheme() {
        if (this.customTheme) {
            this.theme = Theme.Custom;
        }
        else if (this.theme != Theme.Light && this.theme != Theme.Dark) {
            // TODO: Use es2017 in future with Object.values(Theme).includes(this.theme) to do this check
            throw new Error(`Invalid theme configuration for ng-chat. "${this.theme}" is not a valid theme value.`);
        }
    }
    // Sends a request to load the friends list
    fetchFriendsList(isBootstrapping) {
        this.adapter.listFriends()
            .pipe(map((participantsResponse) => {
            this.participantsResponse = participantsResponse;
            this.participants = participantsResponse.map((response) => {
                return response.participant;
            });
        })).subscribe(() => {
            if (isBootstrapping) {
                this.restoreWindowsState();
            }
        });
    }
    fetchMessageHistory(window) {
        var _a;
        // Not ideal but will keep this until we decide if we are shipping pagination with the default adapter
        if (this.adapter instanceof PagedHistoryChatAdapter) {
            window.isLoadingHistory = true;
            let lastTimestamp = null;
            if (window.messages && window.messages[window.messages.length - 1] && window.messages[window.messages.length - 1].dateSent)
                lastTimestamp = (_a = window.messages[window.messages.length - 1].dateSent) === null || _a === void 0 ? void 0 : _a.getTime();
            this.adapter.getMessageHistoryByPage(window.participant.id, this.historyPageSize, ++window.historyPage, lastTimestamp)
                .pipe(map((result) => {
                result.forEach((message) => this.assertMessageType(message));
                window.messages = result.concat(window.messages);
                window.isLoadingHistory = false;
                const direction = (window.historyPage == 1) ? ScrollDirection.Bottom : ScrollDirection.Top;
                window.hasMoreMessages = result.length == this.historyPageSize;
                setTimeout(() => this.onFetchMessageHistoryLoaded(result, window, direction, true));
            })).subscribe();
        }
        else {
            this.adapter.getMessageHistory(window.participant.id)
                .pipe(map((result) => {
                result.forEach((message) => this.assertMessageType(message));
                window.messages = result.concat(window.messages);
                window.isLoadingHistory = false;
                setTimeout(() => this.onFetchMessageHistoryLoaded(result, window, ScrollDirection.Bottom));
            })).subscribe();
        }
    }
    onFetchMessageHistoryLoaded(messages, window, direction, forceMarkMessagesAsSeen = false) {
        this.scrollChatWindow(window, direction);
        if (window.hasFocus || forceMarkMessagesAsSeen) {
            const unseenMessages = messages.filter(m => !m.dateSeen);
            this.markMessagesAsRead(unseenMessages);
        }
    }
    // Updates the friends list via the event handler
    onFriendsListChanged(participantsResponse) {
        if (participantsResponse) {
            this.participantsResponse = participantsResponse;
            this.participants = participantsResponse.map((response) => {
                return response.participant;
            });
            this.participantsInteractedWith = [];
        }
    }
    // Handles received messages by the adapter
    onMessageReceived(participant, message) {
        if (participant && message) {
            const chatWindow = this.openChatWindow(participant);
            this.assertMessageType(message);
            if (!chatWindow[1] || !this.historyEnabled) {
                chatWindow[0].messages.push(message);
                this.scrollChatWindow(chatWindow[0], ScrollDirection.Bottom);
                if (chatWindow[0].hasFocus) {
                    this.markMessagesAsRead([message]);
                }
            }
            this.emitMessageSound(chatWindow[0]);
            // Github issue #58
            // Do not push browser notifications with message content for privacy purposes if the 'maximizeWindowOnNewMessage' setting is off and this is a new chat window.
            if (this.maximizeWindowOnNewMessage || (!chatWindow[1] && !chatWindow[0].isCollapsed)) {
                // Some messages are not pushed because they are loaded by fetching the history hence why we supply the message here
                this.emitBrowserNotification(chatWindow[0], message);
            }
        }
    }
    onParticipantClickedFromFriendsList(participant) {
        this.openChatWindow(participant, true, true);
    }
    cancelOptionPrompt() {
        if (this.currentActiveOption) {
            this.currentActiveOption.isActive = false;
            this.currentActiveOption = null;
        }
    }
    onOptionPromptCanceled() {
        this.cancelOptionPrompt();
    }
    onOptionPromptConfirmed(event) {
        // For now this is fine as there is only one option available. Introduce option types and type checking if a new option is added.
        this.confirmNewGroup(event);
        // Canceling current state
        this.cancelOptionPrompt();
    }
    confirmNewGroup(users) {
        const newGroup = new Group(users);
        this.openChatWindow(newGroup);
        if (this.groupAdapter) {
            this.groupAdapter.groupCreated(newGroup);
        }
    }
    // Opens a new chat whindow. Takes care of available viewport
    // Works for opening a chat window for an user or for a group
    // Returns => [Window: Window object reference, boolean: Indicates if this window is a new chat window]
    openChatWindow(participant, focusOnNewWindow = false, invokedByUserClick = false) {
        // Is this window opened?
        const openedWindow = this.windows.find(x => x.participant.id == participant.id);
        if (!openedWindow) {
            if (invokedByUserClick) {
                this.onParticipantClicked.emit(participant);
            }
            // Refer to issue #58 on Github
            const collapseWindow = invokedByUserClick ? false : !this.maximizeWindowOnNewMessage;
            const newChatWindow = new Window(participant, this.historyEnabled, collapseWindow);
            // Loads the chat history via an RxJs Observable
            if (this.historyEnabled) {
                this.fetchMessageHistory(newChatWindow);
            }
            this.windows.unshift(newChatWindow);
            // Is there enough space left in the view port ? but should be displayed in mobile if option is enabled
            if (!this.isViewportOnMobileEnabled) {
                if (this.windows.length * this.windowSizeFactor >= this.viewPortTotalArea - (!this.hideFriendsList ? this.friendsListWidth : 0)) {
                    this.windows.pop();
                }
            }
            this.updateWindowsState(this.windows);
            if (focusOnNewWindow && !collapseWindow) {
                this.focusOnWindow(newChatWindow);
            }
            this.participantsInteractedWith.push(participant);
            this.onParticipantChatOpened.emit(participant);
            return [newChatWindow, true];
        }
        else {
            // Returns the existing chat window
            return [openedWindow, false];
        }
    }
    // Focus on the input element of the supplied window
    focusOnWindow(window, callback = () => { }) {
        const windowIndex = this.windows.indexOf(window);
        if (windowIndex >= 0) {
            setTimeout(() => {
                if (this.chatWindows) {
                    const chatWindowToFocus = this.chatWindows.toArray()[windowIndex];
                    chatWindowToFocus.chatWindowInput.nativeElement.focus();
                }
                callback();
            });
        }
    }
    assertMessageType(message) {
        // Always fallback to "Text" messages to avoid rendenring issues
        if (!message.type) {
            message.type = MessageType.Text;
        }
    }
    // Marks all messages provided as read with the current time.
    markMessagesAsRead(messages) {
        const currentDate = new Date();
        messages.forEach((msg) => {
            msg.dateSeen = currentDate;
        });
        this.onMessagesSeen.emit(messages);
    }
    // Buffers audio file (For component's bootstrapping)
    bufferAudioFile() {
        if (this.audioSource && this.audioSource.length > 0) {
            this.audioFile = new Audio();
            this.audioFile.src = this.audioSource;
            this.audioFile.load();
        }
    }
    // Emits a message notification audio if enabled after every message received
    emitMessageSound(window) {
        if (this.audioEnabled && !window.hasFocus && this.audioFile) {
            this.audioFile.play();
        }
    }
    // Emits a browser notification
    emitBrowserNotification(window, message) {
        if (this.browserNotificationsBootstrapped && !window.hasFocus && message) {
            const notification = new Notification(`${this.localization.browserNotificationTitle} ${window.participant.displayName}`, {
                'body': message.message,
                'icon': this.browserNotificationIconSource
            });
            setTimeout(() => {
                notification.close();
            }, message.message.length <= 50 ? 5000 : 7000); // More time to read longer messages
        }
    }
    // Saves current windows state into local storage if persistence is enabled
    updateWindowsState(windows) {
        if (this.persistWindowsState) {
            const participantIds = windows.map((w) => {
                return w.participant.id;
            });
            localStorage.setItem(this.localStorageKey, JSON.stringify(participantIds));
        }
    }
    restoreWindowsState() {
        try {
            if (this.persistWindowsState) {
                const stringfiedParticipantIds = localStorage.getItem(this.localStorageKey);
                if (stringfiedParticipantIds && stringfiedParticipantIds.length > 0) {
                    const participantIds = JSON.parse(stringfiedParticipantIds);
                    const participantsToRestore = this.participants.filter(u => participantIds.indexOf(u.id) >= 0);
                    participantsToRestore.forEach((participant) => {
                        this.openChatWindow(participant);
                    });
                }
            }
        }
        catch (ex) {
            console.error(`An error occurred while restoring ng-chat windows state. Details: ${ex}`);
        }
    }
    // Gets closest open window if any. Most recent opened has priority (Right)
    getClosestWindow(window) {
        const index = this.windows.indexOf(window);
        if (index > 0) {
            return this.windows[index - 1];
        }
        else if (index == 0 && this.windows.length > 1) {
            return this.windows[index + 1];
        }
    }
    closeWindow(window) {
        const index = this.windows.indexOf(window);
        this.windows.splice(index, 1);
        this.updateWindowsState(this.windows);
        this.onParticipantChatClosed.emit(window.participant);
    }
    getChatWindowComponentInstance(targetWindow) {
        const windowIndex = this.windows.indexOf(targetWindow);
        if (this.chatWindows) {
            let targetWindow = this.chatWindows.toArray()[windowIndex];
            return targetWindow;
        }
        return null;
    }
    // Scrolls a chat window message flow to the bottom
    scrollChatWindow(window, direction) {
        const chatWindow = this.getChatWindowComponentInstance(window);
        if (chatWindow) {
            chatWindow.scrollChatWindow(window, direction);
        }
    }
    onWindowMessagesSeen(messagesSeen) {
        this.markMessagesAsRead(messagesSeen);
    }
    onWindowChatToggle(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            this.onParticipantToggle.emit({ participant: payload.currentWindow.participant, isCollapsed: payload.isCollapsed });
        });
    }
    onWindowChatClosed(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            const { closedWindow, closedViaEscapeKey } = payload;
            console.log('onWindowChatClosed');
            if (this.beforeParteciantChatClosed != undefined && this.beforeParteciantChatClosed) {
                const l = yield this.beforeParteciantChatClosed(closedWindow.participant);
                if (l == false)
                    return;
            }
            if (closedViaEscapeKey) {
                let closestWindow = this.getClosestWindow(closedWindow);
                if (closestWindow) {
                    this.focusOnWindow(closestWindow, () => { this.closeWindow(closedWindow); });
                }
                else {
                    this.closeWindow(closedWindow);
                }
            }
            else {
                this.closeWindow(closedWindow);
            }
        });
    }
    onWindowTabTriggered(payload) {
        const { triggeringWindow, shiftKeyPressed } = payload;
        const currentWindowIndex = this.windows.indexOf(triggeringWindow);
        let windowToFocus = this.windows[currentWindowIndex + (shiftKeyPressed ? 1 : -1)]; // Goes back on shift + tab
        if (!windowToFocus) {
            // Edge windows, go to start or end
            windowToFocus = this.windows[currentWindowIndex > 0 ? 0 : this.chatWindows.length - 1];
        }
        this.focusOnWindow(windowToFocus);
    }
    onWindowMessageSent(messageSent) {
        this.adapter.sendMessage(messageSent);
    }
    onWindowOptionTriggered(option) {
        this.currentActiveOption = option;
    }
    triggerOpenChatWindow(user) {
        if (user) {
            this.openChatWindow(user);
        }
    }
    triggerCloseChatWindow(userId) {
        const openedWindow = this.windows.find(x => x.participant.id == userId);
        if (openedWindow) {
            this.closeWindow(openedWindow);
        }
    }
    triggerToggleChatWindowVisibility(userId) {
        const openedWindow = this.windows.find(x => x.participant.id == userId);
        if (openedWindow) {
            const chatWindow = this.getChatWindowComponentInstance(openedWindow);
            if (chatWindow) {
                chatWindow.onChatWindowClicked(openedWindow);
            }
        }
    }
    setBeforeParteciantChatClosed(func) {
        this.beforeParteciantChatClosed = func;
    }
    onDownloadFile(params) {
        this.adapter.downloadFile(params.repositoryId, params.fileName);
    }
    onGoToRepo(params) {
        this.adapter.goToRepo(params.repositoryId, params.isGroup);
    }
};
NgChat.ctorParameters = () => [
    { type: HttpClient }
];
__decorate([
    Input()
], NgChat.prototype, "isDisabled", null);
__decorate([
    Input()
], NgChat.prototype, "adapter", void 0);
__decorate([
    Input()
], NgChat.prototype, "groupAdapter", void 0);
__decorate([
    Input()
], NgChat.prototype, "fileUploadAdapter", void 0);
__decorate([
    Input()
], NgChat.prototype, "userId", void 0);
__decorate([
    Input()
], NgChat.prototype, "isCollapsed", void 0);
__decorate([
    Input()
], NgChat.prototype, "maximizeWindowOnNewMessage", void 0);
__decorate([
    Input()
], NgChat.prototype, "pollFriendsList", void 0);
__decorate([
    Input()
], NgChat.prototype, "pollingInterval", void 0);
__decorate([
    Input()
], NgChat.prototype, "historyEnabled", void 0);
__decorate([
    Input()
], NgChat.prototype, "emojisEnabled", void 0);
__decorate([
    Input()
], NgChat.prototype, "linkfyEnabled", void 0);
__decorate([
    Input()
], NgChat.prototype, "audioEnabled", void 0);
__decorate([
    Input()
], NgChat.prototype, "searchEnabled", void 0);
__decorate([
    Input() // TODO: This might need a better content strategy
], NgChat.prototype, "audioSource", void 0);
__decorate([
    Input()
], NgChat.prototype, "persistWindowsState", void 0);
__decorate([
    Input()
], NgChat.prototype, "title", void 0);
__decorate([
    Input()
], NgChat.prototype, "messagePlaceholder", void 0);
__decorate([
    Input()
], NgChat.prototype, "searchPlaceholder", void 0);
__decorate([
    Input()
], NgChat.prototype, "browserNotificationsEnabled", void 0);
__decorate([
    Input() // TODO: This might need a better content strategy
], NgChat.prototype, "browserNotificationIconSource", void 0);
__decorate([
    Input()
], NgChat.prototype, "browserNotificationTitle", void 0);
__decorate([
    Input()
], NgChat.prototype, "historyPageSize", void 0);
__decorate([
    Input()
], NgChat.prototype, "localization", void 0);
__decorate([
    Input()
], NgChat.prototype, "hideFriendsList", void 0);
__decorate([
    Input()
], NgChat.prototype, "hideFriendsListOnUnsupportedViewport", void 0);
__decorate([
    Input()
], NgChat.prototype, "fileUploadUrl", void 0);
__decorate([
    Input()
], NgChat.prototype, "theme", void 0);
__decorate([
    Input()
], NgChat.prototype, "customTheme", void 0);
__decorate([
    Input()
], NgChat.prototype, "messageDatePipeFormat", void 0);
__decorate([
    Input()
], NgChat.prototype, "showMessageDate", void 0);
__decorate([
    Input()
], NgChat.prototype, "isViewportOnMobileEnabled", void 0);
__decorate([
    Output()
], NgChat.prototype, "onParticipantClicked", void 0);
__decorate([
    Output()
], NgChat.prototype, "onParticipantChatOpened", void 0);
__decorate([
    Output()
], NgChat.prototype, "onParticipantChatClosed", void 0);
__decorate([
    Output()
], NgChat.prototype, "onMessagesSeen", void 0);
__decorate([
    Output()
], NgChat.prototype, "onParticipantToggle", void 0);
__decorate([
    ViewChildren('chatWindow')
], NgChat.prototype, "chatWindows", void 0);
__decorate([
    HostListener('window:resize', ['$event'])
], NgChat.prototype, "onResize", null);
NgChat = __decorate([
    Component({
        selector: 'ng-chat',
        template: "<link *ngIf=\"customTheme\" rel=\"stylesheet\" [href]='customTheme | sanitize'>\n\n<div id=\"ng-chat\" *ngIf=\"!isDisabled && isBootstrapped && !unsupportedViewport\" [ngClass]=\"theme\">\n    <ng-chat-friends-list\n        [localization]=\"localization\"\n        [shouldDisplay]=\"!hideFriendsList\"\n        [userId]=\"userId\"\n        [isCollapsed]=\"isCollapsed\"\n        [searchEnabled]=\"searchEnabled\"\n        [participants]=\"participants\"\n        [participantsResponse]=\"participantsResponse\"\n        [participantsInteractedWith]=\"participantsInteractedWith\"\n        [windows]=\"windows\"\n        [currentActiveOption]=\"currentActiveOption\"\n        (onParticipantClicked)=\"onParticipantClickedFromFriendsList($event)\"\n        (onOptionPromptCanceled)=\"onOptionPromptCanceled()\"\n        (onOptionPromptConfirmed)=\"onOptionPromptConfirmed($event)\"\n    >\n    </ng-chat-friends-list>\n\n    <div *ngFor=\"let window of windows; let i = index\" [ngClass]=\"{'ng-chat-window': true, 'primary-outline-color': true, 'ng-chat-window-collapsed': window.isCollapsed}\" [ngStyle]=\"{'right': (!hideFriendsList ? friendsListWidth : 0) + 20 + windowSizeFactor * i + 'px'}\">\n        <ng-chat-window\n            #chatWindow\n            [fileUploadAdapter]=\"fileUploadAdapter\"\n            [localization]=\"localization\"\n            [userId]=\"userId\"\n            [window]=\"window\"\n            [showOptions]=\"groupAdapter\"\n            [emojisEnabled]=\"emojisEnabled\"\n            [linkfyEnabled]=\"linkfyEnabled\"\n            [showMessageDate]=\"showMessageDate\"\n            [messageDatePipeFormat]=\"messageDatePipeFormat\"\n            [hasPagedHistory]=\"hasPagedHistory\"\n            (onMessagesSeen)=\"onWindowMessagesSeen($event)\"\n            (onMessageSent)=\"onWindowMessageSent($event)\"\n            (onTabTriggered)=\"onWindowTabTriggered($event)\"\n            (onChatWindowClosed)=\"onWindowChatClosed($event)\"\n            (onChatWindowToggle)=\"onWindowChatToggle($event)\"\n            (onOptionTriggered)=\"onWindowOptionTriggered($event)\"\n            (onLoadHistoryTriggered)=\"fetchMessageHistory($event)\"\n            (onDownloadFile)=\"onDownloadFile($event)\"\n            (onGoToRepo)=\"onGoToRepo($event)\"\n        >\n        </ng-chat-window>\n    </div>\n</div>\n",
        encapsulation: ViewEncapsulation.None,
        styles: [".user-icon{box-sizing:border-box;background-color:#fff;border:2px solid;width:32px;height:20px;border-radius:64px 64px 0 0/64px;margin-top:14px;margin-left:-1px;display:inline-block;vertical-align:middle;position:relative;font-style:normal;color:#ddd;text-align:left;text-indent:-9999px}.user-icon:before{border:2px solid;background-color:#fff;width:12px;height:12px;top:-19px;border-radius:50%;position:absolute;left:50%;transform:translateX(-50%)}.user-icon:after,.user-icon:before{content:'';pointer-events:none}.upload-icon{position:absolute;margin-left:3px;margin-top:12px;width:13px;height:4px;border:1px solid currentColor;border-top:none;border-radius:1px}.upload-icon:before{content:'';position:absolute;top:-8px;left:6px;width:1px;height:9px;background-color:currentColor}.upload-icon:after{content:'';position:absolute;top:-8px;left:4px;width:4px;height:4px;border-top:1px solid currentColor;border-right:1px solid currentColor;transform:rotate(-45deg)}.paperclip-icon{position:absolute;margin-left:9px;margin-top:2px;width:6px;height:12px;border-radius:4px 4px 0 0;border-left:1px solid currentColor;border-right:1px solid currentColor;border-top:1px solid currentColor;transform:rotate(45deg)}.paperclip-icon:before{content:'';position:absolute;top:11px;left:-1px;width:4px;height:6px;border-radius:0 0 3px 3px;border-left:1px solid currentColor;border-right:1px solid currentColor;border-bottom:1px solid currentColor}.paperclip-icon:after{content:'';position:absolute;left:1px;top:1px;width:2px;height:10px;border-radius:4px 4px 0 0;border-left:1px solid currentColor;border-right:1px solid currentColor;border-top:1px solid currentColor}.check-icon{color:#000;position:absolute;margin-left:3px;margin-top:4px;width:14px;height:8px;border-bottom:1px solid currentColor;border-left:1px solid currentColor;transform:rotate(-45deg)}.remove-icon{color:#000;position:absolute;margin-left:3px;margin-top:10px}.remove-icon:before{content:'';position:absolute;width:15px;height:1px;background-color:currentColor;transform:rotate(45deg)}.remove-icon:after{content:'';position:absolute;width:15px;height:1px;background-color:currentColor;transform:rotate(-45deg)}", ".loader,.loader:after,.loader:before{background:#e3e3e3;-webkit-animation:1s ease-in-out infinite load1;animation:1s ease-in-out infinite load1;width:1em;height:4em}.loader{color:#e3e3e3;text-indent:-9999em;margin:4px auto 0;position:relative;font-size:4px;transform:translateZ(0);-webkit-animation-delay:-.16s;animation-delay:-.16s}.loader:after,.loader:before{position:absolute;top:0;content:''}.loader:before{left:-1.5em;-webkit-animation-delay:-.32s;animation-delay:-.32s}.loader:after{left:1.5em}@-webkit-keyframes load1{0%,100%,80%{box-shadow:0 0;height:4em}40%{box-shadow:0 -2em;height:5em}}@keyframes load1{0%,100%,80%{box-shadow:0 0;height:4em}40%{box-shadow:0 -2em;height:5em}}", "#ng-chat{position:fixed;z-index:999;right:0;bottom:0;box-sizing:initial;font-size:11pt;text-align:left}#ng-chat .shadowed{box-shadow:0 4px 8px rgba(0,0,0,.25)}.ng-chat-loading-wrapper{height:30px;text-align:center;font-size:.9em}.ng-chat-close{text-decoration:none;float:right}.ng-chat-title,.ng-chat-title:hover{position:relative;z-index:2;height:30px;line-height:30px;font-size:.9em;padding:0 10px;display:block;text-decoration:none;color:inherit;font-weight:400;cursor:pointer}.ng-chat-title .ng-chat-title-visibility-toggle-area{display:inline-block;width:77%}.ng-chat-title .ng-chat-title-visibility-toggle-area>strong{font-weight:600;display:block;overflow:hidden;height:30px;text-overflow:ellipsis;white-space:nowrap;max-width:85%;float:left}.ng-chat-title .ng-chat-title-visibility-toggle-area .ng-chat-participant-status{float:left;margin-left:5px}.ng-chat-participant-status{display:inline-block;border-radius:25px;width:8px;height:8px;margin-top:10px}.ng-chat-participant-status.online{background-color:#92a400}.ng-chat-participant-status.busy{background-color:#f91c1e}.ng-chat-participant-status.away{background-color:#f7d21b}.ng-chat-participant-status.offline{background-color:#bababa}.ng-chat-unread-messages-count{margin-left:5px;padding:0 5px;border-radius:25px;font-size:.9em;line-height:30px}.ng-chat-options-container{float:right;margin-right:5px}.ng-chat-options-container-reduced{margin-right:5px}", "#ng-chat.light-theme,#ng-chat.light-theme .primary-text{color:#5c5c5c;font-family:Arial,Helvetica,sans-serif}#ng-chat.light-theme .primary-background{background-color:#fff}#ng-chat.light-theme .secondary-background{background-color:#fafafa}#ng-chat.light-theme .primary-outline-color{border-color:#a3a3a3}#ng-chat.light-theme .friends-search-bar{background-color:#fff}#ng-chat.light-theme .ng-chat-people-action,#ng-chat.light-theme .ng-chat-people-action>i,#ng-chat.light-theme .unread-messages-counter-container{color:#5c5c5c;background-color:#e3e3e3}#ng-chat.light-theme .load-history-action{background-color:#e3e3e3}#ng-chat.light-theme .chat-window-input{background-color:#fff}#ng-chat.light-theme .file-message-container,#ng-chat.light-theme .sent-chat-message-container{background-color:#e3e3e3;border-color:#e3e3e3}#ng-chat.light-theme .file-message-container.received,#ng-chat.light-theme .received-chat-message-container{background-color:#fff;border-color:#e3e3e3}", "#ng-chat.dark-theme,#ng-chat.dark-theme .primary-text{color:#fff;font-family:Arial,Helvetica,sans-serif}#ng-chat.dark-theme .primary-background{background-color:#565656}#ng-chat.dark-theme .secondary-background{background-color:#444}#ng-chat.dark-theme .primary-outline-color{border-color:#353535}#ng-chat.dark-theme .friends-search-bar{background-color:#444;border:1px solid #444;color:#fff}#ng-chat.dark-theme .ng-chat-people-action,#ng-chat.dark-theme .ng-chat-people-action>i,#ng-chat.dark-theme .unread-messages-counter-container{background-color:#fff;color:#444}#ng-chat.dark-theme .load-history-action{background-color:#444}#ng-chat.dark-theme .chat-window-input{background-color:#444;color:#fff}#ng-chat.dark-theme .file-message-container,#ng-chat.dark-theme .sent-chat-message-container{border-color:#444;background-color:#444}#ng-chat.dark-theme .file-message-container.received,#ng-chat.dark-theme .received-chat-message-container{background-color:#565656;border-color:#444}#ng-chat.dark-theme .ng-chat-footer{background-color:#444}#ng-chat.dark-theme .ng-chat-message a{color:#fff}"]
    })
], NgChat);
export { NgChat };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmctY2hhdC5jb21wb25lbnQuanMiLCJzb3VyY2VSb290Ijoibmc6Ly9uZy1jaGF0LyIsInNvdXJjZXMiOlsibmctY2hhdC9uZy1jaGF0LmNvbXBvbmVudC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUEsT0FBTyxFQUFFLFNBQVMsRUFBRSxLQUFLLEVBQVUsWUFBWSxFQUFhLFlBQVksRUFBRSxNQUFNLEVBQUUsWUFBWSxFQUFFLGlCQUFpQixFQUFFLE1BQU0sZUFBZSxDQUFDO0FBQ3pJLE9BQU8sRUFBRSxVQUFVLEVBQUUsTUFBTSxzQkFBc0IsQ0FBQztBQU9sRCxPQUFPLEVBQUUsV0FBVyxFQUFFLE1BQU0sMEJBQTBCLENBQUM7QUFDdkQsT0FBTyxFQUFFLE1BQU0sRUFBRSxNQUFNLGVBQWUsQ0FBQztBQUN2QyxPQUFPLEVBQUUscUJBQXFCLEVBQUUsTUFBTSxxQ0FBcUMsQ0FBQztBQUM1RSxPQUFPLEVBQUUsZUFBZSxFQUFFLE1BQU0sOEJBQThCLENBQUM7QUFHL0QsT0FBTyxFQUFFLHVCQUF1QixFQUFFLE1BQU0sbUNBQW1DLENBQUM7QUFFNUUsT0FBTyxFQUFFLHdCQUF3QixFQUFFLE1BQU0sb0NBQW9DLENBQUM7QUFDOUUsT0FBTyxFQUFFLEtBQUssRUFBRSxNQUFNLG1CQUFtQixDQUFDO0FBRTFDLE9BQU8sRUFBRSxLQUFLLEVBQUUsTUFBTSxjQUFjLENBQUM7QUFDckMsT0FBTyxFQUFFLG1CQUFtQixFQUFFLE1BQU0sbUNBQW1DLENBQUM7QUFHeEUsT0FBTyxFQUFFLEdBQUcsRUFBRSxNQUFNLGdCQUFnQixDQUFDO0FBZ0JyQyxJQUFhLE1BQU0sR0FBbkIsTUFBYSxNQUFNO0lBQ2YsWUFBb0IsV0FBdUI7UUFBdkIsZ0JBQVcsR0FBWCxXQUFXLENBQVk7UUFFM0Msb0NBQW9DO1FBQzdCLHdCQUFtQixHQUFHLG1CQUFtQixDQUFDO1FBQzFDLDBCQUFxQixHQUFHLHFCQUFxQixDQUFDO1FBQzlDLGdCQUFXLEdBQUcsV0FBVyxDQUFDO1FBRXpC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RDtBQUc3RDtJQURDLEtBQUssRUFBRTsrQ0FDNEI7QUFHcEM7SUFEQyxLQUFLLEVBQUU7NENBQzBCO0FBR2xDO0lBREMsS0FBSyxFQUFFOytDQUNnQztBQUd4QztJQURDLEtBQUssRUFBRTtvRUFDb0Q7QUFHNUQ7SUFEQyxLQUFLLEVBQUU7NkNBQ3FCO0FBRzdCO0lBREMsS0FBSyxFQUFFO3FDQUMwQjtBQUdsQztJQURDLEtBQUssRUFBRTsyQ0FDbUI7QUFHM0I7SUFEQyxLQUFLLEVBQUU7cURBQ3VDO0FBRy9DO0lBREMsS0FBSyxFQUFFOytDQUMrQjtBQUd2QztJQURDLEtBQUssRUFBRTt5REFDMEM7QUFLbEQ7SUFEQyxNQUFNLEVBQUU7b0RBQzBGO0FBR25HO0lBREMsTUFBTSxFQUFFO3VEQUM2RjtBQUd0RztJQURDLE1BQU0sRUFBRTt1REFDNkY7QUFHdEc7SUFEQyxNQUFNLEVBQUU7OENBQ3NFO0FBRy9FO0lBREMsTUFBTSxFQUFFO21EQUNtSztBQThDaEo7SUFBM0IsWUFBWSxDQUFDLFlBQVksQ0FBQzsyQ0FBK0M7QUFPMUU7SUFEQyxZQUFZLENBQUMsZUFBZSxFQUFFLENBQUMsUUFBUSxDQUFDLENBQUM7c0NBS3pDO0FBbk1RLE1BQU07SUFibEIsU0FBUyxDQUFDO1FBQ1AsUUFBUSxFQUFFLFNBQVM7UUFDbkIsNnlFQUFxQztRQVFyQyxhQUFhLEVBQUUsaUJBQWlCLENBQUMsSUFBSTs7S0FDeEMsQ0FBQztHQUVXLE1BQU0sQ0F5eEJsQjtTQXp4QlksTUFBTSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IENvbXBvbmVudCwgSW5wdXQsIE9uSW5pdCwgVmlld0NoaWxkcmVuLCBRdWVyeUxpc3QsIEhvc3RMaXN0ZW5lciwgT3V0cHV0LCBFdmVudEVtaXR0ZXIsIFZpZXdFbmNhcHN1bGF0aW9uIH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQgeyBIdHRwQ2xpZW50IH0gZnJvbSAnQGFuZ3VsYXIvY29tbW9uL2h0dHAnO1xuXG5pbXBvcnQgeyBDaGF0QWRhcHRlciB9IGZyb20gJy4vY29yZS9jaGF0LWFkYXB0ZXInO1xuaW1wb3J0IHsgSUNoYXRHcm91cEFkYXB0ZXIgfSBmcm9tICcuL2NvcmUvY2hhdC1ncm91cC1hZGFwdGVyJztcbmltcG9ydCB7IFVzZXIgfSBmcm9tIFwiLi9jb3JlL3VzZXJcIjtcbmltcG9ydCB7IFBhcnRpY2lwYW50UmVzcG9uc2UgfSBmcm9tIFwiLi9jb3JlL3BhcnRpY2lwYW50LXJlc3BvbnNlXCI7XG5pbXBvcnQgeyBNZXNzYWdlIH0gZnJvbSBcIi4vY29yZS9tZXNzYWdlXCI7XG5pbXBvcnQgeyBNZXNzYWdlVHlwZSB9IGZyb20gXCIuL2NvcmUvbWVzc2FnZS10eXBlLmVudW1cIjtcbmltcG9ydCB7IFdpbmRvdyB9IGZyb20gXCIuL2NvcmUvd2luZG93XCI7XG5pbXBvcnQgeyBDaGF0UGFydGljaXBhbnRTdGF0dXMgfSBmcm9tIFwiLi9jb3JlL2NoYXQtcGFydGljaXBhbnQtc3RhdHVzLmVudW1cIjtcbmltcG9ydCB7IFNjcm9sbERpcmVjdGlvbiB9IGZyb20gXCIuL2NvcmUvc2Nyb2xsLWRpcmVjdGlvbi5lbnVtXCI7XG5pbXBvcnQgeyBMb2NhbGl6YXRpb24sIFN0YXR1c0Rlc2NyaXB0aW9uIH0gZnJvbSAnLi9jb3JlL2xvY2FsaXphdGlvbic7XG5pbXBvcnQgeyBJQ2hhdENvbnRyb2xsZXIgfSBmcm9tICcuL2NvcmUvY2hhdC1jb250cm9sbGVyJztcbmltcG9ydCB7IFBhZ2VkSGlzdG9yeUNoYXRBZGFwdGVyIH0gZnJvbSAnLi9jb3JlL3BhZ2VkLWhpc3RvcnktY2hhdC1hZGFwdGVyJztcbmltcG9ydCB7IElGaWxlVXBsb2FkQWRhcHRlciB9IGZyb20gJy4vY29yZS9maWxlLXVwbG9hZC1hZGFwdGVyJztcbmltcG9ydCB7IERlZmF1bHRGaWxlVXBsb2FkQWRhcHRlciB9IGZyb20gJy4vY29yZS9kZWZhdWx0LWZpbGUtdXBsb2FkLWFkYXB0ZXInO1xuaW1wb3J0IHsgVGhlbWUgfSBmcm9tICcuL2NvcmUvdGhlbWUuZW51bSc7XG5pbXBvcnQgeyBJQ2hhdE9wdGlvbiB9IGZyb20gJy4vY29yZS9jaGF0LW9wdGlvbic7XG5pbXBvcnQgeyBHcm91cCB9IGZyb20gXCIuL2NvcmUvZ3JvdXBcIjtcbmltcG9ydCB7IENoYXRQYXJ0aWNpcGFudFR5cGUgfSBmcm9tIFwiLi9jb3JlL2NoYXQtcGFydGljaXBhbnQtdHlwZS5lbnVtXCI7XG5pbXBvcnQgeyBJQ2hhdFBhcnRpY2lwYW50IH0gZnJvbSBcIi4vY29yZS9jaGF0LXBhcnRpY2lwYW50XCI7XG5cbmltcG9ydCB7IG1hcCB9IGZyb20gJ3J4anMvb3BlcmF0b3JzJztcbmltcG9ydCB7IE5nQ2hhdFdpbmRvd0NvbXBvbmVudCB9IGZyb20gJy4vY29tcG9uZW50cy9uZy1jaGF0LXdpbmRvdy9uZy1jaGF0LXdpbmRvdy5jb21wb25lbnQnO1xuXG5AQ29tcG9uZW50KHtcbiAgICBzZWxlY3RvcjogJ25nLWNoYXQnLFxuICAgIHRlbXBsYXRlVXJsOiAnbmctY2hhdC5jb21wb25lbnQuaHRtbCcsXG4gICAgc3R5bGVVcmxzOiBbXG4gICAgICAgICdhc3NldHMvaWNvbnMuY3NzJyxcbiAgICAgICAgJ2Fzc2V0cy9sb2FkaW5nLXNwaW5uZXIuY3NzJyxcbiAgICAgICAgJ2Fzc2V0cy9uZy1jaGF0LmNvbXBvbmVudC5kZWZhdWx0LmNzcycsXG4gICAgICAgICdhc3NldHMvdGhlbWVzL25nLWNoYXQudGhlbWUuZGVmYXVsdC5zY3NzJyxcbiAgICAgICAgJ2Fzc2V0cy90aGVtZXMvbmctY2hhdC50aGVtZS5kYXJrLnNjc3MnXG4gICAgXSxcbiAgICBlbmNhcHN1bGF0aW9uOiBWaWV3RW5jYXBzdWxhdGlvbi5Ob25lXG59KVxuXG5leHBvcnQgY2xhc3MgTmdDaGF0IGltcGxlbWVudHMgT25Jbml0LCBJQ2hhdENvbnRyb2xsZXIge1xuICAgIGNvbnN0cnVjdG9yKHByaXZhdGUgX2h0dHBDbGllbnQ6IEh0dHBDbGllbnQpIHsgfVxuXG4gICAgLy8gRXhwb3NlcyBlbnVtcyBmb3IgdGhlIG5nLXRlbXBsYXRlXG4gICAgcHVibGljIENoYXRQYXJ0aWNpcGFudFR5cGUgPSBDaGF0UGFydGljaXBhbnRUeXBlO1xuICAgIHB1YmxpYyBDaGF0UGFydGljaXBhbnRTdGF0dXMgPSBDaGF0UGFydGljaXBhbnRTdGF0dXM7XG4gICAgcHVibGljIE1lc3NhZ2VUeXBlID0gTWVzc2FnZVR5cGU7XG5cbiAgICBwcml2YXRlIF9pc0Rpc2FibGVkOiBib29sZWFuID0gZmFsc2U7XG5cbiAgICBnZXQgaXNEaXNhYmxlZCgpOiBib29sZWFuIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2lzRGlzYWJsZWQ7XG4gICAgfVxuXG4gICAgQElucHV0KClcbiAgICBzZXQgaXNEaXNhYmxlZCh2YWx1ZTogYm9vbGVhbikge1xuICAgICAgICB0aGlzLl9pc0Rpc2FibGVkID0gdmFsdWU7XG5cbiAgICAgICAgaWYgKHZhbHVlKVxuICAgICAgICB7XG4gICAgICAgICAgICAvLyBUbyBhZGRyZXNzIGlzc3VlIGh0dHBzOi8vZ2l0aHViLmNvbS9ycGFzY2hvYWwvbmctY2hhdC9pc3N1ZXMvMTIwXG4gICAgICAgICAgICB3aW5kb3cuY2xlYXJJbnRlcnZhbCh0aGlzLnBvbGxpbmdJbnRlcnZhbFdpbmRvd0luc3RhbmNlKVxuICAgICAgICB9XG4gICAgICAgIGVsc2VcbiAgICAgICAge1xuICAgICAgICAgICAgdGhpcy5hY3RpdmF0ZUZyaWVuZExpc3RGZXRjaCgpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgQElucHV0KClcbiAgICBwdWJsaWMgYWRhcHRlcjogQ2hhdEFkYXB0ZXI7XG5cbiAgICBASW5wdXQoKVxuICAgIHB1YmxpYyBncm91cEFkYXB0ZXI6IElDaGF0R3JvdXBBZGFwdGVyO1xuXG4gICAgLy8gRmlsZSB1cGxvYWQgYWRhcHRlclxuICAgIEBJbnB1dCgpXG4gICAgcHVibGljIGZpbGVVcGxvYWRBZGFwdGVyOiBJRmlsZVVwbG9hZEFkYXB0ZXI7XG5cbiAgICBASW5wdXQoKVxuICAgIHB1YmxpYyB1c2VySWQ6IGFueTtcblxuICAgIEBJbnB1dCgpXG4gICAgcHVibGljIGlzQ29sbGFwc2VkOiBib29sZWFuID0gZmFsc2U7XG5cbiAgICBASW5wdXQoKVxuICAgIHB1YmxpYyBtYXhpbWl6ZVdpbmRvd09uTmV3TWVzc2FnZTogYm9vbGVhbiA9IHRydWU7XG5cbiAgICBASW5wdXQoKVxuICAgIHB1YmxpYyBwb2xsRnJpZW5kc0xpc3Q6IGJvb2xlYW4gPSBmYWxzZTtcblxuICAgIEBJbnB1dCgpXG4gICAgcHVibGljIHBvbGxpbmdJbnRlcnZhbDogbnVtYmVyID0gNTAwMDtcblxuICAgIEBJbnB1dCgpXG4gICAgcHVibGljIGhpc3RvcnlFbmFibGVkOiBib29sZWFuID0gdHJ1ZTtcblxuICAgIEBJbnB1dCgpXG4gICAgcHVibGljIGVtb2ppc0VuYWJsZWQ6IGJvb2xlYW4gPSB0cnVlO1xuXG4gICAgQElucHV0KClcbiAgICBwdWJsaWMgbGlua2Z5RW5hYmxlZDogYm9vbGVhbiA9IHRydWU7XG5cbiAgICBASW5wdXQoKVxuICAgIHB1YmxpYyBhdWRpb0VuYWJsZWQ6IGJvb2xlYW4gPSB0cnVlO1xuXG4gICAgQElucHV0KClcbiAgICBwdWJsaWMgc2VhcmNoRW5hYmxlZDogYm9vbGVhbiA9IHRydWU7XG5cbiAgICBASW5wdXQoKSAvLyBUT0RPOiBUaGlzIG1pZ2h0IG5lZWQgYSBiZXR0ZXIgY29udGVudCBzdHJhdGVneVxuICAgIHB1YmxpYyBhdWRpb1NvdXJjZTogc3RyaW5nID0gJ2h0dHBzOi8vcmF3LmdpdGh1YnVzZXJjb250ZW50LmNvbS9ycGFzY2hvYWwvbmctY2hhdC9tYXN0ZXIvc3JjL25nLWNoYXQvYXNzZXRzL25vdGlmaWNhdGlvbi53YXYnO1xuXG4gICAgQElucHV0KClcbiAgICBwdWJsaWMgcGVyc2lzdFdpbmRvd3NTdGF0ZTogYm9vbGVhbiA9IHRydWU7XG5cbiAgICBASW5wdXQoKVxuICAgIHB1YmxpYyB0aXRsZTogc3RyaW5nID0gXCJGcmllbmRzXCI7XG5cbiAgICBASW5wdXQoKVxuICAgIHB1YmxpYyBtZXNzYWdlUGxhY2Vob2xkZXI6IHN0cmluZyA9IFwiVHlwZSBhIG1lc3NhZ2VcIjtcblxuICAgIEBJbnB1dCgpXG4gICAgcHVibGljIHNlYXJjaFBsYWNlaG9sZGVyOiBzdHJpbmcgPSBcIlNlYXJjaFwiO1xuXG4gICAgQElucHV0KClcbiAgICBwdWJsaWMgYnJvd3Nlck5vdGlmaWNhdGlvbnNFbmFibGVkOiBib29sZWFuID0gdHJ1ZTtcblxuICAgIEBJbnB1dCgpIC8vIFRPRE86IFRoaXMgbWlnaHQgbmVlZCBhIGJldHRlciBjb250ZW50IHN0cmF0ZWd5XG4gICAgcHVibGljIGJyb3dzZXJOb3RpZmljYXRpb25JY29uU291cmNlOiBzdHJpbmcgPSAnaHR0cHM6Ly9yYXcuZ2l0aHVidXNlcmNvbnRlbnQuY29tL3JwYXNjaG9hbC9uZy1jaGF0L21hc3Rlci9zcmMvbmctY2hhdC9hc3NldHMvbm90aWZpY2F0aW9uLnBuZyc7XG5cbiAgICBASW5wdXQoKVxuICAgIHB1YmxpYyBicm93c2VyTm90aWZpY2F0aW9uVGl0bGU6IHN0cmluZyA9IFwiTmV3IG1lc3NhZ2UgZnJvbVwiO1xuXG4gICAgQElucHV0KClcbiAgICBwdWJsaWMgaGlzdG9yeVBhZ2VTaXplOiBudW1iZXIgPSAxMDtcblxuICAgIEBJbnB1dCgpXG4gICAgcHVibGljIGxvY2FsaXphdGlvbjogTG9jYWxpemF0aW9uO1xuXG4gICAgQElucHV0KClcbiAgICBwdWJsaWMgaGlkZUZyaWVuZHNMaXN0OiBib29sZWFuID0gZmFsc2U7XG5cbiAgICBASW5wdXQoKVxuICAgIHB1YmxpYyBoaWRlRnJpZW5kc0xpc3RPblVuc3VwcG9ydGVkVmlld3BvcnQ6IGJvb2xlYW4gPSB0cnVlO1xuXG4gICAgQElucHV0KClcbiAgICBwdWJsaWMgZmlsZVVwbG9hZFVybDogc3RyaW5nO1xuXG4gICAgQElucHV0KClcbiAgICBwdWJsaWMgdGhlbWU6IFRoZW1lID0gVGhlbWUuTGlnaHQ7XG5cbiAgICBASW5wdXQoKVxuICAgIHB1YmxpYyBjdXN0b21UaGVtZTogc3RyaW5nO1xuXG4gICAgQElucHV0KClcbiAgICBwdWJsaWMgbWVzc2FnZURhdGVQaXBlRm9ybWF0OiBzdHJpbmcgPSBcInNob3J0XCI7XG5cbiAgICBASW5wdXQoKVxuICAgIHB1YmxpYyBzaG93TWVzc2FnZURhdGU6IGJvb2xlYW4gPSB0cnVlO1xuXG4gICAgQElucHV0KClcbiAgICBwdWJsaWMgaXNWaWV3cG9ydE9uTW9iaWxlRW5hYmxlZDogYm9vbGVhbiA9IGZhbHNlO1xuXG4gICAgcHVibGljIGJlZm9yZVBhcnRlY2lhbnRDaGF0Q2xvc2VkOiAoYXJnMDogSUNoYXRQYXJ0aWNpcGFudCkgPT4gYm9vbGVhbjtcblxuICAgIEBPdXRwdXQoKVxuICAgIHB1YmxpYyBvblBhcnRpY2lwYW50Q2xpY2tlZDogRXZlbnRFbWl0dGVyPElDaGF0UGFydGljaXBhbnQ+ID0gbmV3IEV2ZW50RW1pdHRlcjxJQ2hhdFBhcnRpY2lwYW50PigpO1xuXG4gICAgQE91dHB1dCgpXG4gICAgcHVibGljIG9uUGFydGljaXBhbnRDaGF0T3BlbmVkOiBFdmVudEVtaXR0ZXI8SUNoYXRQYXJ0aWNpcGFudD4gPSBuZXcgRXZlbnRFbWl0dGVyPElDaGF0UGFydGljaXBhbnQ+KCk7XG5cbiAgICBAT3V0cHV0KClcbiAgICBwdWJsaWMgb25QYXJ0aWNpcGFudENoYXRDbG9zZWQ6IEV2ZW50RW1pdHRlcjxJQ2hhdFBhcnRpY2lwYW50PiA9IG5ldyBFdmVudEVtaXR0ZXI8SUNoYXRQYXJ0aWNpcGFudD4oKTtcblxuICAgIEBPdXRwdXQoKVxuICAgIHB1YmxpYyBvbk1lc3NhZ2VzU2VlbjogRXZlbnRFbWl0dGVyPE1lc3NhZ2VbXT4gPSBuZXcgRXZlbnRFbWl0dGVyPE1lc3NhZ2VbXT4oKTtcblxuICAgIEBPdXRwdXQoKVxuICAgIHB1YmxpYyBvblBhcnRpY2lwYW50VG9nZ2xlOiBFdmVudEVtaXR0ZXI8e3BhcnRpY2lwYW50OiBJQ2hhdFBhcnRpY2lwYW50LCBpc0NvbGxhcHNlZDogYm9vbGVhbn0+ID0gbmV3IEV2ZW50RW1pdHRlcjx7cGFydGljaXBhbnQ6IElDaGF0UGFydGljaXBhbnQsIGlzQ29sbGFwc2VkOiBib29sZWFufT4oKTtcblxuICAgIHByaXZhdGUgYnJvd3Nlck5vdGlmaWNhdGlvbnNCb290c3RyYXBwZWQ6IGJvb2xlYW4gPSBmYWxzZTtcblxuICAgIHB1YmxpYyBoYXNQYWdlZEhpc3Rvcnk6IGJvb2xlYW4gPSBmYWxzZTtcblxuICAgIC8vIERvbid0IHdhbnQgdG8gYWRkIHRoaXMgYXMgYSBzZXR0aW5nIHRvIHNpbXBsaWZ5IHVzYWdlLiBQcmV2aW91cyBwbGFjZWhvbGRlciBhbmQgdGl0bGUgc2V0dGluZ3MgYXZhaWxhYmxlIHRvIGJlIHVzZWQsIG9yIHVzZSBmdWxsIExvY2FsaXphdGlvbiBvYmplY3QuXG4gICAgcHJpdmF0ZSBzdGF0dXNEZXNjcmlwdGlvbjogU3RhdHVzRGVzY3JpcHRpb24gPSB7XG4gICAgICAgIG9ubGluZTogJ09ubGluZScsXG4gICAgICAgIGJ1c3k6ICdCdXN5JyxcbiAgICAgICAgYXdheTogJ0F3YXknLFxuICAgICAgICBvZmZsaW5lOiAnT2ZmbGluZSdcbiAgICB9O1xuXG4gICAgcHJpdmF0ZSBhdWRpb0ZpbGU6IEhUTUxBdWRpb0VsZW1lbnQ7XG5cbiAgICBwdWJsaWMgcGFydGljaXBhbnRzOiBJQ2hhdFBhcnRpY2lwYW50W107XG5cbiAgICBwdWJsaWMgcGFydGljaXBhbnRzUmVzcG9uc2U6IFBhcnRpY2lwYW50UmVzcG9uc2VbXTtcblxuICAgIHB1YmxpYyBwYXJ0aWNpcGFudHNJbnRlcmFjdGVkV2l0aDogSUNoYXRQYXJ0aWNpcGFudFtdID0gW107XG5cbiAgICBwdWJsaWMgY3VycmVudEFjdGl2ZU9wdGlvbjogSUNoYXRPcHRpb24gfCBudWxsO1xuXG4gICAgcHJpdmF0ZSBwb2xsaW5nSW50ZXJ2YWxXaW5kb3dJbnN0YW5jZTogbnVtYmVyO1xuXG4gICAgcHJpdmF0ZSBnZXQgbG9jYWxTdG9yYWdlS2V5KCk6IHN0cmluZ1xuICAgIHtcbiAgICAgICAgcmV0dXJuIGBuZy1jaGF0LXVzZXJzLSR7dGhpcy51c2VySWR9YDsgLy8gQXBwZW5kaW5nIHRoZSB1c2VyIGlkIHNvIHRoZSBzdGF0ZSBpcyB1bmlxdWUgcGVyIHVzZXIgaW4gYSBjb21wdXRlci5cbiAgICB9O1xuXG4gICAgLy8gRGVmaW5lcyB0aGUgc2l6ZSBvZiBlYWNoIG9wZW5lZCB3aW5kb3cgdG8gY2FsY3VsYXRlIGhvdyBtYW55IHdpbmRvd3MgY2FuIGJlIG9wZW5lZCBvbiB0aGUgdmlld3BvcnQgYXQgdGhlIHNhbWUgdGltZS5cbiAgICBwdWJsaWMgd2luZG93U2l6ZUZhY3RvcjogbnVtYmVyID0gMzIwO1xuXG4gICAgLy8gVG90YWwgd2lkdGggc2l6ZSBvZiB0aGUgZnJpZW5kcyBsaXN0IHNlY3Rpb25cbiAgICBwdWJsaWMgZnJpZW5kc0xpc3RXaWR0aDogbnVtYmVyID0gMjYyO1xuXG4gICAgLy8gQXZhaWxhYmxlIGFyZWEgdG8gcmVuZGVyIHRoZSBwbHVnaW5cbiAgICBwcml2YXRlIHZpZXdQb3J0VG90YWxBcmVhOiBudW1iZXI7XG5cbiAgICAvLyBTZXQgdG8gdHJ1ZSBpZiB0aGVyZSBpcyBubyBzcGFjZSB0byBkaXNwbGF5IGF0IGxlYXN0IG9uZSBjaGF0IHdpbmRvdyBhbmQgJ2hpZGVGcmllbmRzTGlzdE9uVW5zdXBwb3J0ZWRWaWV3cG9ydCcgaXMgdHJ1ZVxuICAgIHB1YmxpYyB1bnN1cHBvcnRlZFZpZXdwb3J0OiBib29sZWFuID0gZmFsc2U7XG5cbiAgICB3aW5kb3dzOiBXaW5kb3dbXSA9IFtdO1xuICAgIGlzQm9vdHN0cmFwcGVkOiBib29sZWFuID0gZmFsc2U7XG5cbiAgICBAVmlld0NoaWxkcmVuKCdjaGF0V2luZG93JykgY2hhdFdpbmRvd3M6IFF1ZXJ5TGlzdDxOZ0NoYXRXaW5kb3dDb21wb25lbnQ+O1xuXG4gICAgbmdPbkluaXQoKSB7XG4gICAgICAgIHRoaXMuYm9vdHN0cmFwQ2hhdCgpO1xuICAgIH1cblxuICAgIEBIb3N0TGlzdGVuZXIoJ3dpbmRvdzpyZXNpemUnLCBbJyRldmVudCddKVxuICAgIG9uUmVzaXplKGV2ZW50OiBhbnkpe1xuICAgICAgIHRoaXMudmlld1BvcnRUb3RhbEFyZWEgPSBldmVudC50YXJnZXQuaW5uZXJXaWR0aDtcblxuICAgICAgIHRoaXMuTm9ybWFsaXplV2luZG93cygpO1xuICAgIH1cblxuICAgIC8vIENoZWNrcyBpZiB0aGVyZSBhcmUgbW9yZSBvcGVuZWQgd2luZG93cyB0aGFuIHRoZSB2aWV3IHBvcnQgY2FuIGRpc3BsYXlcbiAgICBwcml2YXRlIE5vcm1hbGl6ZVdpbmRvd3MoKTogdm9pZFxuICAgIHtcbiAgICAgICAgY29uc3QgbWF4U3VwcG9ydGVkT3BlbmVkV2luZG93cyA9IE1hdGguZmxvb3IoKHRoaXMudmlld1BvcnRUb3RhbEFyZWEgLSAoIXRoaXMuaGlkZUZyaWVuZHNMaXN0ID8gdGhpcy5mcmllbmRzTGlzdFdpZHRoIDogMCkpIC8gdGhpcy53aW5kb3dTaXplRmFjdG9yKTtcbiAgICAgICAgY29uc3QgZGlmZmVyZW5jZSA9IHRoaXMud2luZG93cy5sZW5ndGggLSBtYXhTdXBwb3J0ZWRPcGVuZWRXaW5kb3dzO1xuXG4gICAgICAgIGlmIChkaWZmZXJlbmNlID49IDApXG4gICAgICAgIHtcbiAgICAgICAgICAgIHRoaXMud2luZG93cy5zcGxpY2UodGhpcy53aW5kb3dzLmxlbmd0aCAtIGRpZmZlcmVuY2UpO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy51cGRhdGVXaW5kb3dzU3RhdGUodGhpcy53aW5kb3dzKTtcblxuICAgICAgICAvLyBWaWV3cG9ydCBzaG91bGQgaGF2ZSBzcGFjZSBmb3IgYXQgbGVhc3Qgb25lIGNoYXQgd2luZG93IGJ1dCBzaG91bGQgc2hvdyBpbiBtb2JpbGUgaWYgb3B0aW9uIGlzIGVuYWJsZWQuXG4gICAgICAgIHRoaXMudW5zdXBwb3J0ZWRWaWV3cG9ydCA9IHRoaXMuaXNWaWV3cG9ydE9uTW9iaWxlRW5hYmxlZD8gZmFsc2UgOiB0aGlzLmhpZGVGcmllbmRzTGlzdE9uVW5zdXBwb3J0ZWRWaWV3cG9ydCAmJiBtYXhTdXBwb3J0ZWRPcGVuZWRXaW5kb3dzIDwgMTtcbiAgICB9XG5cbiAgICAvLyBJbml0aWFsaXplcyB0aGUgY2hhdCBwbHVnaW4gYW5kIHRoZSBtZXNzYWdpbmcgYWRhcHRlclxuICAgIHByaXZhdGUgYm9vdHN0cmFwQ2hhdCgpOiB2b2lkXG4gICAge1xuICAgICAgICBsZXQgaW5pdGlhbGl6YXRpb25FeGNlcHRpb24gPSBudWxsO1xuXG4gICAgICAgIGlmICh0aGlzLmFkYXB0ZXIgIT0gbnVsbCAmJiB0aGlzLnVzZXJJZCAhPSBudWxsKVxuICAgICAgICB7XG4gICAgICAgICAgICB0cnlcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICB0aGlzLnZpZXdQb3J0VG90YWxBcmVhID0gd2luZG93LmlubmVyV2lkdGg7XG5cbiAgICAgICAgICAgICAgICB0aGlzLmluaXRpYWxpemVUaGVtZSgpO1xuICAgICAgICAgICAgICAgIHRoaXMuaW5pdGlhbGl6ZURlZmF1bHRUZXh0KCk7XG4gICAgICAgICAgICAgICAgdGhpcy5pbml0aWFsaXplQnJvd3Nlck5vdGlmaWNhdGlvbnMoKTtcblxuICAgICAgICAgICAgICAgIC8vIEJpbmRpbmcgZXZlbnQgbGlzdGVuZXJzXG4gICAgICAgICAgICAgICAgdGhpcy5hZGFwdGVyLm1lc3NhZ2VSZWNlaXZlZEhhbmRsZXIgPSAocGFydGljaXBhbnQsIG1zZykgPT4gdGhpcy5vbk1lc3NhZ2VSZWNlaXZlZChwYXJ0aWNpcGFudCwgbXNnKTtcbiAgICAgICAgICAgICAgICB0aGlzLmFkYXB0ZXIuZnJpZW5kc0xpc3RDaGFuZ2VkSGFuZGxlciA9IChwYXJ0aWNpcGFudHNSZXNwb25zZSkgPT4gdGhpcy5vbkZyaWVuZHNMaXN0Q2hhbmdlZChwYXJ0aWNpcGFudHNSZXNwb25zZSk7XG5cbiAgICAgICAgICAgICAgICB0aGlzLmFjdGl2YXRlRnJpZW5kTGlzdEZldGNoKCk7XG5cbiAgICAgICAgICAgICAgICB0aGlzLmJ1ZmZlckF1ZGlvRmlsZSgpO1xuXG4gICAgICAgICAgICAgICAgdGhpcy5oYXNQYWdlZEhpc3RvcnkgPSB0aGlzLmFkYXB0ZXIgaW5zdGFuY2VvZiBQYWdlZEhpc3RvcnlDaGF0QWRhcHRlcjtcblxuICAgICAgICAgICAgICAgIGlmICghdGhpcy5maWxlVXBsb2FkQWRhcHRlciAmJiB0aGlzLmZpbGVVcGxvYWRVcmwgJiYgdGhpcy5maWxlVXBsb2FkVXJsICE9PSBcIlwiKVxuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5maWxlVXBsb2FkQWRhcHRlciA9IG5ldyBEZWZhdWx0RmlsZVVwbG9hZEFkYXB0ZXIodGhpcy5maWxlVXBsb2FkVXJsLCB0aGlzLl9odHRwQ2xpZW50KTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICB0aGlzLk5vcm1hbGl6ZVdpbmRvd3MoKTtcblxuICAgICAgICAgICAgICAgIHRoaXMuaXNCb290c3RyYXBwZWQgPSB0cnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY2F0Y2goZXgpXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgaW5pdGlhbGl6YXRpb25FeGNlcHRpb24gPSBleDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGlmICghdGhpcy5pc0Jvb3RzdHJhcHBlZCl7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKFwibmctY2hhdCBjb21wb25lbnQgY291bGRuJ3QgYmUgYm9vdHN0cmFwcGVkLlwiKTtcblxuICAgICAgICAgICAgaWYgKHRoaXMudXNlcklkID09IG51bGwpe1xuICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoXCJuZy1jaGF0IGNhbid0IGJlIGluaXRpYWxpemVkIHdpdGhvdXQgYW4gdXNlciBpZC4gUGxlYXNlIG1ha2Ugc3VyZSB5b3UndmUgcHJvdmlkZWQgYW4gdXNlcklkIGFzIGEgcGFyYW1ldGVyIG9mIHRoZSBuZy1jaGF0IGNvbXBvbmVudC5cIik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAodGhpcy5hZGFwdGVyID09IG51bGwpe1xuICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoXCJuZy1jaGF0IGNhbid0IGJlIGJvb3RzdHJhcHBlZCB3aXRob3V0IGEgQ2hhdEFkYXB0ZXIuIFBsZWFzZSBtYWtlIHN1cmUgeW91J3ZlIHByb3ZpZGVkIGEgQ2hhdEFkYXB0ZXIgaW1wbGVtZW50YXRpb24gYXMgYSBwYXJhbWV0ZXIgb2YgdGhlIG5nLWNoYXQgY29tcG9uZW50LlwiKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChpbml0aWFsaXphdGlvbkV4Y2VwdGlvbilcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKGBBbiBleGNlcHRpb24gaGFzIG9jY3VycmVkIHdoaWxlIGluaXRpYWxpemluZyBuZy1jaGF0LiBEZXRhaWxzOiAke2luaXRpYWxpemF0aW9uRXhjZXB0aW9uLm1lc3NhZ2V9YCk7XG4gICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcihpbml0aWFsaXphdGlvbkV4Y2VwdGlvbik7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwcml2YXRlIGFjdGl2YXRlRnJpZW5kTGlzdEZldGNoKCk6IHZvaWQge1xuICAgICAgICBpZiAodGhpcy5hZGFwdGVyKVxuICAgICAgICB7XG4gICAgICAgICAgICAvLyBMb2FkaW5nIGN1cnJlbnQgdXNlcnMgbGlzdFxuICAgICAgICAgICAgaWYgKHRoaXMucG9sbEZyaWVuZHNMaXN0KXtcbiAgICAgICAgICAgICAgICAvLyBTZXR0aW5nIGEgbG9uZyBwb2xsIGludGVydmFsIHRvIHVwZGF0ZSB0aGUgZnJpZW5kcyBsaXN0XG4gICAgICAgICAgICAgICAgdGhpcy5mZXRjaEZyaWVuZHNMaXN0KHRydWUpO1xuICAgICAgICAgICAgICAgIHRoaXMucG9sbGluZ0ludGVydmFsV2luZG93SW5zdGFuY2UgPSB3aW5kb3cuc2V0SW50ZXJ2YWwoKCkgPT4gdGhpcy5mZXRjaEZyaWVuZHNMaXN0KGZhbHNlKSwgdGhpcy5wb2xsaW5nSW50ZXJ2YWwpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIC8vIFNpbmNlIHBvbGxpbmcgd2FzIGRpc2FibGVkLCBhIGZyaWVuZHMgbGlzdCB1cGRhdGUgbWVjaGFuaXNtIHdpbGwgaGF2ZSB0byBiZSBpbXBsZW1lbnRlZCBpbiB0aGUgQ2hhdEFkYXB0ZXIuXG4gICAgICAgICAgICAgICAgdGhpcy5mZXRjaEZyaWVuZHNMaXN0KHRydWUpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgLy8gSW5pdGlhbGl6ZXMgYnJvd3NlciBub3RpZmljYXRpb25zXG4gICAgcHJpdmF0ZSBhc3luYyBpbml0aWFsaXplQnJvd3Nlck5vdGlmaWNhdGlvbnMoKVxuICAgIHtcbiAgICAgICAgaWYgKHRoaXMuYnJvd3Nlck5vdGlmaWNhdGlvbnNFbmFibGVkICYmIChcIk5vdGlmaWNhdGlvblwiIGluIHdpbmRvdykpXG4gICAgICAgIHtcbiAgICAgICAgICAgIGlmIChhd2FpdCBOb3RpZmljYXRpb24ucmVxdWVzdFBlcm1pc3Npb24oKSA9PT0gXCJncmFudGVkXCIpXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgdGhpcy5icm93c2VyTm90aWZpY2F0aW9uc0Jvb3RzdHJhcHBlZCA9IHRydWU7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBJbml0aWFsaXplcyBkZWZhdWx0IHRleHRcbiAgICBwcml2YXRlIGluaXRpYWxpemVEZWZhdWx0VGV4dCgpIDogdm9pZFxuICAgIHtcbiAgICAgICAgaWYgKCF0aGlzLmxvY2FsaXphdGlvbilcbiAgICAgICAge1xuICAgICAgICAgICAgdGhpcy5sb2NhbGl6YXRpb24gPSB7XG4gICAgICAgICAgICAgICAgbWVzc2FnZVBsYWNlaG9sZGVyOiB0aGlzLm1lc3NhZ2VQbGFjZWhvbGRlcixcbiAgICAgICAgICAgICAgICBzZWFyY2hQbGFjZWhvbGRlcjogdGhpcy5zZWFyY2hQbGFjZWhvbGRlcixcbiAgICAgICAgICAgICAgICB0aXRsZTogdGhpcy50aXRsZSxcbiAgICAgICAgICAgICAgICBzdGF0dXNEZXNjcmlwdGlvbjogdGhpcy5zdGF0dXNEZXNjcmlwdGlvbixcbiAgICAgICAgICAgICAgICBicm93c2VyTm90aWZpY2F0aW9uVGl0bGU6IHRoaXMuYnJvd3Nlck5vdGlmaWNhdGlvblRpdGxlLFxuICAgICAgICAgICAgICAgIGxvYWRNZXNzYWdlSGlzdG9yeVBsYWNlaG9sZGVyOiBcIkxvYWQgb2xkZXIgbWVzc2FnZXNcIlxuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHByaXZhdGUgaW5pdGlhbGl6ZVRoZW1lKCk6IHZvaWRcbiAgICB7XG4gICAgICAgIGlmICh0aGlzLmN1c3RvbVRoZW1lKVxuICAgICAgICB7XG4gICAgICAgICAgICB0aGlzLnRoZW1lID0gVGhlbWUuQ3VzdG9tO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKHRoaXMudGhlbWUgIT0gVGhlbWUuTGlnaHQgJiYgdGhpcy50aGVtZSAhPSBUaGVtZS5EYXJrKVxuICAgICAgICB7XG4gICAgICAgICAgICAvLyBUT0RPOiBVc2UgZXMyMDE3IGluIGZ1dHVyZSB3aXRoIE9iamVjdC52YWx1ZXMoVGhlbWUpLmluY2x1ZGVzKHRoaXMudGhlbWUpIHRvIGRvIHRoaXMgY2hlY2tcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgSW52YWxpZCB0aGVtZSBjb25maWd1cmF0aW9uIGZvciBuZy1jaGF0LiBcIiR7dGhpcy50aGVtZX1cIiBpcyBub3QgYSB2YWxpZCB0aGVtZSB2YWx1ZS5gKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8vIFNlbmRzIGEgcmVxdWVzdCB0byBsb2FkIHRoZSBmcmllbmRzIGxpc3RcbiAgICBwdWJsaWMgZmV0Y2hGcmllbmRzTGlzdChpc0Jvb3RzdHJhcHBpbmc6IGJvb2xlYW4pOiB2b2lkXG4gICAge1xuICAgICAgICB0aGlzLmFkYXB0ZXIubGlzdEZyaWVuZHMoKVxuICAgICAgICAucGlwZShcbiAgICAgICAgICAgIG1hcCgocGFydGljaXBhbnRzUmVzcG9uc2U6IFBhcnRpY2lwYW50UmVzcG9uc2VbXSkgPT4ge1xuICAgICAgICAgICAgICAgIHRoaXMucGFydGljaXBhbnRzUmVzcG9uc2UgPSBwYXJ0aWNpcGFudHNSZXNwb25zZTtcblxuICAgICAgICAgICAgICAgIHRoaXMucGFydGljaXBhbnRzID0gcGFydGljaXBhbnRzUmVzcG9uc2UubWFwKChyZXNwb25zZTogUGFydGljaXBhbnRSZXNwb25zZSkgPT4ge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gcmVzcG9uc2UucGFydGljaXBhbnQ7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9KVxuICAgICAgICApLnN1YnNjcmliZSgoKSA9PiB7XG4gICAgICAgICAgICBpZiAoaXNCb290c3RyYXBwaW5nKVxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIHRoaXMucmVzdG9yZVdpbmRvd3NTdGF0ZSgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBmZXRjaE1lc3NhZ2VIaXN0b3J5KHdpbmRvdzogV2luZG93KSB7XG4gICAgICAgIC8vIE5vdCBpZGVhbCBidXQgd2lsbCBrZWVwIHRoaXMgdW50aWwgd2UgZGVjaWRlIGlmIHdlIGFyZSBzaGlwcGluZyBwYWdpbmF0aW9uIHdpdGggdGhlIGRlZmF1bHQgYWRhcHRlclxuICAgICAgICBpZiAodGhpcy5hZGFwdGVyIGluc3RhbmNlb2YgUGFnZWRIaXN0b3J5Q2hhdEFkYXB0ZXIpXG4gICAgICAgIHtcbiAgICAgICAgICAgIHdpbmRvdy5pc0xvYWRpbmdIaXN0b3J5ID0gdHJ1ZTtcbiAgICAgICAgICAgIGxldCBsYXN0VGltZXN0YW1wID0gbnVsbDtcbiAgICAgICAgICAgIGlmKHdpbmRvdy5tZXNzYWdlcyAmJiB3aW5kb3cubWVzc2FnZXNbd2luZG93Lm1lc3NhZ2VzLmxlbmd0aCAtMSBdICYmIHdpbmRvdy5tZXNzYWdlc1t3aW5kb3cubWVzc2FnZXMubGVuZ3RoIC0xIF0uZGF0ZVNlbnQpXG4gICAgICAgICAgICAgICAgbGFzdFRpbWVzdGFtcCA9IHdpbmRvdy5tZXNzYWdlc1t3aW5kb3cubWVzc2FnZXMubGVuZ3RoIC0xIF0uZGF0ZVNlbnQ/LmdldFRpbWUoKTtcbiAgICAgICAgXG4gICAgICAgICAgICB0aGlzLmFkYXB0ZXIuZ2V0TWVzc2FnZUhpc3RvcnlCeVBhZ2Uod2luZG93LnBhcnRpY2lwYW50LmlkLCB0aGlzLmhpc3RvcnlQYWdlU2l6ZSwgKyt3aW5kb3cuaGlzdG9yeVBhZ2UsIGxhc3RUaW1lc3RhbXApXG4gICAgICAgICAgICAucGlwZShcbiAgICAgICAgICAgICAgICBtYXAoKHJlc3VsdDogTWVzc2FnZVtdKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIHJlc3VsdC5mb3JFYWNoKChtZXNzYWdlKSA9PiB0aGlzLmFzc2VydE1lc3NhZ2VUeXBlKG1lc3NhZ2UpKTtcblxuICAgICAgICAgICAgICAgICAgICB3aW5kb3cubWVzc2FnZXMgPSByZXN1bHQuY29uY2F0KHdpbmRvdy5tZXNzYWdlcyk7XG4gICAgICAgICAgICAgICAgICAgIHdpbmRvdy5pc0xvYWRpbmdIaXN0b3J5ID0gZmFsc2U7XG5cbiAgICAgICAgICAgICAgICAgICAgY29uc3QgZGlyZWN0aW9uOiBTY3JvbGxEaXJlY3Rpb24gPSAod2luZG93Lmhpc3RvcnlQYWdlID09IDEpID8gU2Nyb2xsRGlyZWN0aW9uLkJvdHRvbSA6IFNjcm9sbERpcmVjdGlvbi5Ub3A7XG4gICAgICAgICAgICAgICAgICAgIHdpbmRvdy5oYXNNb3JlTWVzc2FnZXMgPSByZXN1bHQubGVuZ3RoID09IHRoaXMuaGlzdG9yeVBhZ2VTaXplO1xuXG4gICAgICAgICAgICAgICAgICAgIHNldFRpbWVvdXQoKCkgPT4gdGhpcy5vbkZldGNoTWVzc2FnZUhpc3RvcnlMb2FkZWQocmVzdWx0LCB3aW5kb3csIGRpcmVjdGlvbiwgdHJ1ZSkpO1xuICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICApLnN1YnNjcmliZSgpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2VcbiAgICAgICAge1xuICAgICAgICAgICAgdGhpcy5hZGFwdGVyLmdldE1lc3NhZ2VIaXN0b3J5KHdpbmRvdy5wYXJ0aWNpcGFudC5pZClcbiAgICAgICAgICAgIC5waXBlKFxuICAgICAgICAgICAgICAgIG1hcCgocmVzdWx0OiBNZXNzYWdlW10pID0+IHtcbiAgICAgICAgICAgICAgICAgICAgcmVzdWx0LmZvckVhY2goKG1lc3NhZ2UpID0+IHRoaXMuYXNzZXJ0TWVzc2FnZVR5cGUobWVzc2FnZSkpO1xuXG4gICAgICAgICAgICAgICAgICAgIHdpbmRvdy5tZXNzYWdlcyA9IHJlc3VsdC5jb25jYXQod2luZG93Lm1lc3NhZ2VzKTtcbiAgICAgICAgICAgICAgICAgICAgd2luZG93LmlzTG9hZGluZ0hpc3RvcnkgPSBmYWxzZTtcblxuICAgICAgICAgICAgICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHRoaXMub25GZXRjaE1lc3NhZ2VIaXN0b3J5TG9hZGVkKHJlc3VsdCwgd2luZG93LCBTY3JvbGxEaXJlY3Rpb24uQm90dG9tKSk7XG4gICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICkuc3Vic2NyaWJlKCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwcml2YXRlIG9uRmV0Y2hNZXNzYWdlSGlzdG9yeUxvYWRlZChtZXNzYWdlczogTWVzc2FnZVtdLCB3aW5kb3c6IFdpbmRvdywgZGlyZWN0aW9uOiBTY3JvbGxEaXJlY3Rpb24sIGZvcmNlTWFya01lc3NhZ2VzQXNTZWVuOiBib29sZWFuID0gZmFsc2UpOiB2b2lkXG4gICAge1xuICAgICAgICB0aGlzLnNjcm9sbENoYXRXaW5kb3cod2luZG93LCBkaXJlY3Rpb24pXG5cbiAgICAgICAgaWYgKHdpbmRvdy5oYXNGb2N1cyB8fCBmb3JjZU1hcmtNZXNzYWdlc0FzU2VlbilcbiAgICAgICAge1xuICAgICAgICAgICAgY29uc3QgdW5zZWVuTWVzc2FnZXMgPSBtZXNzYWdlcy5maWx0ZXIobSA9PiAhbS5kYXRlU2Vlbik7XG5cbiAgICAgICAgICAgIHRoaXMubWFya01lc3NhZ2VzQXNSZWFkKHVuc2Vlbk1lc3NhZ2VzKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8vIFVwZGF0ZXMgdGhlIGZyaWVuZHMgbGlzdCB2aWEgdGhlIGV2ZW50IGhhbmRsZXJcbiAgICBwcml2YXRlIG9uRnJpZW5kc0xpc3RDaGFuZ2VkKHBhcnRpY2lwYW50c1Jlc3BvbnNlOiBQYXJ0aWNpcGFudFJlc3BvbnNlW10pOiB2b2lkXG4gICAge1xuICAgICAgICBpZiAocGFydGljaXBhbnRzUmVzcG9uc2UpXG4gICAgICAgIHtcbiAgICAgICAgICAgIHRoaXMucGFydGljaXBhbnRzUmVzcG9uc2UgPSBwYXJ0aWNpcGFudHNSZXNwb25zZTtcblxuICAgICAgICAgICAgdGhpcy5wYXJ0aWNpcGFudHMgPSBwYXJ0aWNpcGFudHNSZXNwb25zZS5tYXAoKHJlc3BvbnNlOiBQYXJ0aWNpcGFudFJlc3BvbnNlKSA9PiB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHJlc3BvbnNlLnBhcnRpY2lwYW50O1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIHRoaXMucGFydGljaXBhbnRzSW50ZXJhY3RlZFdpdGggPSBbXTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8vIEhhbmRsZXMgcmVjZWl2ZWQgbWVzc2FnZXMgYnkgdGhlIGFkYXB0ZXJcbiAgICBwcml2YXRlIG9uTWVzc2FnZVJlY2VpdmVkKHBhcnRpY2lwYW50OiBJQ2hhdFBhcnRpY2lwYW50LCBtZXNzYWdlOiBNZXNzYWdlKVxuICAgIHtcbiAgICAgICAgaWYgKHBhcnRpY2lwYW50ICYmIG1lc3NhZ2UpXG4gICAgICAgIHtcbiAgICAgICAgICAgIGNvbnN0IGNoYXRXaW5kb3cgPSB0aGlzLm9wZW5DaGF0V2luZG93KHBhcnRpY2lwYW50KTtcblxuICAgICAgICAgICAgdGhpcy5hc3NlcnRNZXNzYWdlVHlwZShtZXNzYWdlKTtcblxuICAgICAgICAgICAgaWYgKCFjaGF0V2luZG93WzFdIHx8ICF0aGlzLmhpc3RvcnlFbmFibGVkKXtcbiAgICAgICAgICAgICAgICBjaGF0V2luZG93WzBdLm1lc3NhZ2VzLnB1c2gobWVzc2FnZSk7XG5cbiAgICAgICAgICAgICAgICB0aGlzLnNjcm9sbENoYXRXaW5kb3coY2hhdFdpbmRvd1swXSwgU2Nyb2xsRGlyZWN0aW9uLkJvdHRvbSk7XG5cbiAgICAgICAgICAgICAgICBpZiAoY2hhdFdpbmRvd1swXS5oYXNGb2N1cylcbiAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMubWFya01lc3NhZ2VzQXNSZWFkKFttZXNzYWdlXSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB0aGlzLmVtaXRNZXNzYWdlU291bmQoY2hhdFdpbmRvd1swXSk7XG5cbiAgICAgICAgICAgIC8vIEdpdGh1YiBpc3N1ZSAjNThcbiAgICAgICAgICAgIC8vIERvIG5vdCBwdXNoIGJyb3dzZXIgbm90aWZpY2F0aW9ucyB3aXRoIG1lc3NhZ2UgY29udGVudCBmb3IgcHJpdmFjeSBwdXJwb3NlcyBpZiB0aGUgJ21heGltaXplV2luZG93T25OZXdNZXNzYWdlJyBzZXR0aW5nIGlzIG9mZiBhbmQgdGhpcyBpcyBhIG5ldyBjaGF0IHdpbmRvdy5cbiAgICAgICAgICAgIGlmICh0aGlzLm1heGltaXplV2luZG93T25OZXdNZXNzYWdlIHx8ICghY2hhdFdpbmRvd1sxXSAmJiAhY2hhdFdpbmRvd1swXS5pc0NvbGxhcHNlZCkpXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgLy8gU29tZSBtZXNzYWdlcyBhcmUgbm90IHB1c2hlZCBiZWNhdXNlIHRoZXkgYXJlIGxvYWRlZCBieSBmZXRjaGluZyB0aGUgaGlzdG9yeSBoZW5jZSB3aHkgd2Ugc3VwcGx5IHRoZSBtZXNzYWdlIGhlcmVcbiAgICAgICAgICAgICAgICB0aGlzLmVtaXRCcm93c2VyTm90aWZpY2F0aW9uKGNoYXRXaW5kb3dbMF0sIG1lc3NhZ2UpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgb25QYXJ0aWNpcGFudENsaWNrZWRGcm9tRnJpZW5kc0xpc3QocGFydGljaXBhbnQ6IElDaGF0UGFydGljaXBhbnQpOiB2b2lkIHtcbiAgICAgICAgdGhpcy5vcGVuQ2hhdFdpbmRvdyhwYXJ0aWNpcGFudCwgdHJ1ZSwgdHJ1ZSk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBjYW5jZWxPcHRpb25Qcm9tcHQoKTogdm9pZCB7XG4gICAgICAgIGlmICh0aGlzLmN1cnJlbnRBY3RpdmVPcHRpb24pXG4gICAgICAgIHtcbiAgICAgICAgICAgIHRoaXMuY3VycmVudEFjdGl2ZU9wdGlvbi5pc0FjdGl2ZSA9IGZhbHNlO1xuICAgICAgICAgICAgdGhpcy5jdXJyZW50QWN0aXZlT3B0aW9uID0gbnVsbDtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIG9uT3B0aW9uUHJvbXB0Q2FuY2VsZWQoKTogdm9pZCB7XG4gICAgICAgIHRoaXMuY2FuY2VsT3B0aW9uUHJvbXB0KCk7XG4gICAgfVxuXG4gICAgb25PcHRpb25Qcm9tcHRDb25maXJtZWQoZXZlbnQ6IGFueSk6IHZvaWQge1xuICAgICAgICAvLyBGb3Igbm93IHRoaXMgaXMgZmluZSBhcyB0aGVyZSBpcyBvbmx5IG9uZSBvcHRpb24gYXZhaWxhYmxlLiBJbnRyb2R1Y2Ugb3B0aW9uIHR5cGVzIGFuZCB0eXBlIGNoZWNraW5nIGlmIGEgbmV3IG9wdGlvbiBpcyBhZGRlZC5cbiAgICAgICAgdGhpcy5jb25maXJtTmV3R3JvdXAoZXZlbnQpO1xuXG4gICAgICAgIC8vIENhbmNlbGluZyBjdXJyZW50IHN0YXRlXG4gICAgICAgIHRoaXMuY2FuY2VsT3B0aW9uUHJvbXB0KCk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBjb25maXJtTmV3R3JvdXAodXNlcnM6IFVzZXJbXSk6IHZvaWQge1xuICAgICAgICBjb25zdCBuZXdHcm91cCA9IG5ldyBHcm91cCh1c2Vycyk7XG5cbiAgICAgICAgdGhpcy5vcGVuQ2hhdFdpbmRvdyhuZXdHcm91cCk7XG5cbiAgICAgICAgaWYgKHRoaXMuZ3JvdXBBZGFwdGVyKVxuICAgICAgICB7XG4gICAgICAgICAgICB0aGlzLmdyb3VwQWRhcHRlci5ncm91cENyZWF0ZWQobmV3R3JvdXApO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLy8gT3BlbnMgYSBuZXcgY2hhdCB3aGluZG93LiBUYWtlcyBjYXJlIG9mIGF2YWlsYWJsZSB2aWV3cG9ydFxuICAgIC8vIFdvcmtzIGZvciBvcGVuaW5nIGEgY2hhdCB3aW5kb3cgZm9yIGFuIHVzZXIgb3IgZm9yIGEgZ3JvdXBcbiAgICAvLyBSZXR1cm5zID0+IFtXaW5kb3c6IFdpbmRvdyBvYmplY3QgcmVmZXJlbmNlLCBib29sZWFuOiBJbmRpY2F0ZXMgaWYgdGhpcyB3aW5kb3cgaXMgYSBuZXcgY2hhdCB3aW5kb3ddXG4gICAgcHJpdmF0ZSBvcGVuQ2hhdFdpbmRvdyhwYXJ0aWNpcGFudDogSUNoYXRQYXJ0aWNpcGFudCwgZm9jdXNPbk5ld1dpbmRvdzogYm9vbGVhbiA9IGZhbHNlLCBpbnZva2VkQnlVc2VyQ2xpY2s6IGJvb2xlYW4gPSBmYWxzZSk6IFtXaW5kb3csIGJvb2xlYW5dXG4gICAge1xuICAgICAgICAvLyBJcyB0aGlzIHdpbmRvdyBvcGVuZWQ/XG4gICAgICAgIGNvbnN0IG9wZW5lZFdpbmRvdyA9IHRoaXMud2luZG93cy5maW5kKHggPT4geC5wYXJ0aWNpcGFudC5pZCA9PSBwYXJ0aWNpcGFudC5pZCk7XG5cbiAgICAgICAgaWYgKCFvcGVuZWRXaW5kb3cpXG4gICAgICAgIHtcbiAgICAgICAgICAgIGlmIChpbnZva2VkQnlVc2VyQ2xpY2spXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgdGhpcy5vblBhcnRpY2lwYW50Q2xpY2tlZC5lbWl0KHBhcnRpY2lwYW50KTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gUmVmZXIgdG8gaXNzdWUgIzU4IG9uIEdpdGh1YlxuICAgICAgICAgICAgY29uc3QgY29sbGFwc2VXaW5kb3cgPSBpbnZva2VkQnlVc2VyQ2xpY2sgPyBmYWxzZSA6ICF0aGlzLm1heGltaXplV2luZG93T25OZXdNZXNzYWdlO1xuXG4gICAgICAgICAgICBjb25zdCBuZXdDaGF0V2luZG93OiBXaW5kb3cgPSBuZXcgV2luZG93KHBhcnRpY2lwYW50LCB0aGlzLmhpc3RvcnlFbmFibGVkLCBjb2xsYXBzZVdpbmRvdyk7XG5cbiAgICAgICAgICAgIC8vIExvYWRzIHRoZSBjaGF0IGhpc3RvcnkgdmlhIGFuIFJ4SnMgT2JzZXJ2YWJsZVxuICAgICAgICAgICAgaWYgKHRoaXMuaGlzdG9yeUVuYWJsZWQpXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgdGhpcy5mZXRjaE1lc3NhZ2VIaXN0b3J5KG5ld0NoYXRXaW5kb3cpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB0aGlzLndpbmRvd3MudW5zaGlmdChuZXdDaGF0V2luZG93KTtcblxuICAgICAgICAgICAgLy8gSXMgdGhlcmUgZW5vdWdoIHNwYWNlIGxlZnQgaW4gdGhlIHZpZXcgcG9ydCA/IGJ1dCBzaG91bGQgYmUgZGlzcGxheWVkIGluIG1vYmlsZSBpZiBvcHRpb24gaXMgZW5hYmxlZFxuICAgICAgICAgICAgaWYgKCF0aGlzLmlzVmlld3BvcnRPbk1vYmlsZUVuYWJsZWQpIHtcbiAgICAgICAgICAgICAgICBpZiAodGhpcy53aW5kb3dzLmxlbmd0aCAqIHRoaXMud2luZG93U2l6ZUZhY3RvciA+PSB0aGlzLnZpZXdQb3J0VG90YWxBcmVhIC0gKCF0aGlzLmhpZGVGcmllbmRzTGlzdCA/IHRoaXMuZnJpZW5kc0xpc3RXaWR0aCA6IDApKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMud2luZG93cy5wb3AoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHRoaXMudXBkYXRlV2luZG93c1N0YXRlKHRoaXMud2luZG93cyk7XG5cbiAgICAgICAgICAgIGlmIChmb2N1c09uTmV3V2luZG93ICYmICFjb2xsYXBzZVdpbmRvdylcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICB0aGlzLmZvY3VzT25XaW5kb3cobmV3Q2hhdFdpbmRvdyk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHRoaXMucGFydGljaXBhbnRzSW50ZXJhY3RlZFdpdGgucHVzaChwYXJ0aWNpcGFudCk7XG4gICAgICAgICAgICB0aGlzLm9uUGFydGljaXBhbnRDaGF0T3BlbmVkLmVtaXQocGFydGljaXBhbnQpO1xuXG4gICAgICAgICAgICByZXR1cm4gW25ld0NoYXRXaW5kb3csIHRydWVdO1xuICAgICAgICB9XG4gICAgICAgIGVsc2VcbiAgICAgICAge1xuICAgICAgICAgICAgLy8gUmV0dXJucyB0aGUgZXhpc3RpbmcgY2hhdCB3aW5kb3dcbiAgICAgICAgICAgIHJldHVybiBbb3BlbmVkV2luZG93LCBmYWxzZV07XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBGb2N1cyBvbiB0aGUgaW5wdXQgZWxlbWVudCBvZiB0aGUgc3VwcGxpZWQgd2luZG93XG4gICAgcHJpdmF0ZSBmb2N1c09uV2luZG93KHdpbmRvdzogV2luZG93LCBjYWxsYmFjazogRnVuY3Rpb24gPSAoKSA9PiB7fSkgOiB2b2lkXG4gICAge1xuICAgICAgICBjb25zdCB3aW5kb3dJbmRleCA9IHRoaXMud2luZG93cy5pbmRleE9mKHdpbmRvdyk7XG4gICAgICAgIGlmICh3aW5kb3dJbmRleCA+PSAwKVxuICAgICAgICB7XG4gICAgICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5jaGF0V2luZG93cylcbiAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGNoYXRXaW5kb3dUb0ZvY3VzID0gdGhpcy5jaGF0V2luZG93cy50b0FycmF5KClbd2luZG93SW5kZXhdO1xuXG4gICAgICAgICAgICAgICAgICAgIGNoYXRXaW5kb3dUb0ZvY3VzLmNoYXRXaW5kb3dJbnB1dC5uYXRpdmVFbGVtZW50LmZvY3VzKCk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgY2FsbGJhY2soKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBhc3NlcnRNZXNzYWdlVHlwZShtZXNzYWdlOiBNZXNzYWdlKTogdm9pZCB7XG4gICAgICAgIC8vIEFsd2F5cyBmYWxsYmFjayB0byBcIlRleHRcIiBtZXNzYWdlcyB0byBhdm9pZCByZW5kZW5yaW5nIGlzc3Vlc1xuICAgICAgICBpZiAoIW1lc3NhZ2UudHlwZSlcbiAgICAgICAge1xuICAgICAgICAgICAgbWVzc2FnZS50eXBlID0gTWVzc2FnZVR5cGUuVGV4dDtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8vIE1hcmtzIGFsbCBtZXNzYWdlcyBwcm92aWRlZCBhcyByZWFkIHdpdGggdGhlIGN1cnJlbnQgdGltZS5cbiAgICBtYXJrTWVzc2FnZXNBc1JlYWQobWVzc2FnZXM6IE1lc3NhZ2VbXSk6IHZvaWRcbiAgICB7XG4gICAgICAgIGNvbnN0IGN1cnJlbnREYXRlID0gbmV3IERhdGUoKTtcblxuICAgICAgICBtZXNzYWdlcy5mb3JFYWNoKChtc2cpPT57XG4gICAgICAgICAgICBtc2cuZGF0ZVNlZW4gPSBjdXJyZW50RGF0ZTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgdGhpcy5vbk1lc3NhZ2VzU2Vlbi5lbWl0KG1lc3NhZ2VzKTtcbiAgICB9XG5cbiAgICAvLyBCdWZmZXJzIGF1ZGlvIGZpbGUgKEZvciBjb21wb25lbnQncyBib290c3RyYXBwaW5nKVxuICAgIHByaXZhdGUgYnVmZmVyQXVkaW9GaWxlKCk6IHZvaWQge1xuICAgICAgICBpZiAodGhpcy5hdWRpb1NvdXJjZSAmJiB0aGlzLmF1ZGlvU291cmNlLmxlbmd0aCA+IDApXG4gICAgICAgIHtcbiAgICAgICAgICAgIHRoaXMuYXVkaW9GaWxlID0gbmV3IEF1ZGlvKCk7XG4gICAgICAgICAgICB0aGlzLmF1ZGlvRmlsZS5zcmMgPSB0aGlzLmF1ZGlvU291cmNlO1xuICAgICAgICAgICAgdGhpcy5hdWRpb0ZpbGUubG9hZCgpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLy8gRW1pdHMgYSBtZXNzYWdlIG5vdGlmaWNhdGlvbiBhdWRpbyBpZiBlbmFibGVkIGFmdGVyIGV2ZXJ5IG1lc3NhZ2UgcmVjZWl2ZWRcbiAgICBwcml2YXRlIGVtaXRNZXNzYWdlU291bmQod2luZG93OiBXaW5kb3cpOiB2b2lkXG4gICAge1xuICAgICAgICBpZiAodGhpcy5hdWRpb0VuYWJsZWQgJiYgIXdpbmRvdy5oYXNGb2N1cyAmJiB0aGlzLmF1ZGlvRmlsZSkge1xuICAgICAgICAgICAgdGhpcy5hdWRpb0ZpbGUucGxheSgpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLy8gRW1pdHMgYSBicm93c2VyIG5vdGlmaWNhdGlvblxuICAgIHByaXZhdGUgZW1pdEJyb3dzZXJOb3RpZmljYXRpb24od2luZG93OiBXaW5kb3csIG1lc3NhZ2U6IE1lc3NhZ2UpOiB2b2lkXG4gICAge1xuICAgICAgICBpZiAodGhpcy5icm93c2VyTm90aWZpY2F0aW9uc0Jvb3RzdHJhcHBlZCAmJiAhd2luZG93Lmhhc0ZvY3VzICYmIG1lc3NhZ2UpIHtcbiAgICAgICAgICAgIGNvbnN0IG5vdGlmaWNhdGlvbiA9IG5ldyBOb3RpZmljYXRpb24oYCR7dGhpcy5sb2NhbGl6YXRpb24uYnJvd3Nlck5vdGlmaWNhdGlvblRpdGxlfSAke3dpbmRvdy5wYXJ0aWNpcGFudC5kaXNwbGF5TmFtZX1gLCB7XG4gICAgICAgICAgICAgICAgJ2JvZHknOiBtZXNzYWdlLm1lc3NhZ2UsXG4gICAgICAgICAgICAgICAgJ2ljb24nOiB0aGlzLmJyb3dzZXJOb3RpZmljYXRpb25JY29uU291cmNlXG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgICAgICAgICAgbm90aWZpY2F0aW9uLmNsb3NlKCk7XG4gICAgICAgICAgICB9LCBtZXNzYWdlLm1lc3NhZ2UubGVuZ3RoIDw9IDUwID8gNTAwMCA6IDcwMDApOyAvLyBNb3JlIHRpbWUgdG8gcmVhZCBsb25nZXIgbWVzc2FnZXNcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8vIFNhdmVzIGN1cnJlbnQgd2luZG93cyBzdGF0ZSBpbnRvIGxvY2FsIHN0b3JhZ2UgaWYgcGVyc2lzdGVuY2UgaXMgZW5hYmxlZFxuICAgIHByaXZhdGUgdXBkYXRlV2luZG93c1N0YXRlKHdpbmRvd3M6IFdpbmRvd1tdKTogdm9pZFxuICAgIHtcbiAgICAgICAgaWYgKHRoaXMucGVyc2lzdFdpbmRvd3NTdGF0ZSlcbiAgICAgICAge1xuICAgICAgICAgICAgY29uc3QgcGFydGljaXBhbnRJZHMgPSB3aW5kb3dzLm1hcCgodykgPT4ge1xuICAgICAgICAgICAgICAgIHJldHVybiB3LnBhcnRpY2lwYW50LmlkO1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIGxvY2FsU3RvcmFnZS5zZXRJdGVtKHRoaXMubG9jYWxTdG9yYWdlS2V5LCBKU09OLnN0cmluZ2lmeShwYXJ0aWNpcGFudElkcykpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHJpdmF0ZSByZXN0b3JlV2luZG93c1N0YXRlKCk6IHZvaWRcbiAgICB7XG4gICAgICAgIHRyeVxuICAgICAgICB7XG4gICAgICAgICAgICBpZiAodGhpcy5wZXJzaXN0V2luZG93c1N0YXRlKVxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIGNvbnN0IHN0cmluZ2ZpZWRQYXJ0aWNpcGFudElkcyA9IGxvY2FsU3RvcmFnZS5nZXRJdGVtKHRoaXMubG9jYWxTdG9yYWdlS2V5KTtcblxuICAgICAgICAgICAgICAgIGlmIChzdHJpbmdmaWVkUGFydGljaXBhbnRJZHMgJiYgc3RyaW5nZmllZFBhcnRpY2lwYW50SWRzLmxlbmd0aCA+IDApXG4gICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBwYXJ0aWNpcGFudElkcyA9IDxudW1iZXJbXT5KU09OLnBhcnNlKHN0cmluZ2ZpZWRQYXJ0aWNpcGFudElkcyk7XG5cbiAgICAgICAgICAgICAgICAgICAgY29uc3QgcGFydGljaXBhbnRzVG9SZXN0b3JlID0gdGhpcy5wYXJ0aWNpcGFudHMuZmlsdGVyKHUgPT4gcGFydGljaXBhbnRJZHMuaW5kZXhPZih1LmlkKSA+PSAwKTtcblxuICAgICAgICAgICAgICAgICAgICBwYXJ0aWNpcGFudHNUb1Jlc3RvcmUuZm9yRWFjaCgocGFydGljaXBhbnQpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMub3BlbkNoYXRXaW5kb3cocGFydGljaXBhbnQpO1xuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgY2F0Y2ggKGV4KVxuICAgICAgICB7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKGBBbiBlcnJvciBvY2N1cnJlZCB3aGlsZSByZXN0b3JpbmcgbmctY2hhdCB3aW5kb3dzIHN0YXRlLiBEZXRhaWxzOiAke2V4fWApO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLy8gR2V0cyBjbG9zZXN0IG9wZW4gd2luZG93IGlmIGFueS4gTW9zdCByZWNlbnQgb3BlbmVkIGhhcyBwcmlvcml0eSAoUmlnaHQpXG4gICAgcHJpdmF0ZSBnZXRDbG9zZXN0V2luZG93KHdpbmRvdzogV2luZG93KTogV2luZG93IHwgdW5kZWZpbmVkXG4gICAge1xuICAgICAgICBjb25zdCBpbmRleCA9IHRoaXMud2luZG93cy5pbmRleE9mKHdpbmRvdyk7XG5cbiAgICAgICAgaWYgKGluZGV4ID4gMClcbiAgICAgICAge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMud2luZG93c1tpbmRleCAtIDFdO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKGluZGV4ID09IDAgJiYgdGhpcy53aW5kb3dzLmxlbmd0aCA+IDEpXG4gICAgICAgIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLndpbmRvd3NbaW5kZXggKyAxXTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHByaXZhdGUgY2xvc2VXaW5kb3cod2luZG93OiBXaW5kb3cpOiB2b2lkXG4gICAge1xuICAgICAgICBjb25zdCBpbmRleCA9IHRoaXMud2luZG93cy5pbmRleE9mKHdpbmRvdyk7XG5cbiAgICAgICAgdGhpcy53aW5kb3dzLnNwbGljZShpbmRleCwgMSk7XG5cbiAgICAgICAgdGhpcy51cGRhdGVXaW5kb3dzU3RhdGUodGhpcy53aW5kb3dzKTtcblxuICAgICAgICB0aGlzLm9uUGFydGljaXBhbnRDaGF0Q2xvc2VkLmVtaXQod2luZG93LnBhcnRpY2lwYW50KTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGdldENoYXRXaW5kb3dDb21wb25lbnRJbnN0YW5jZSh0YXJnZXRXaW5kb3c6IFdpbmRvdyk6IE5nQ2hhdFdpbmRvd0NvbXBvbmVudCB8IG51bGwge1xuICAgICAgICBjb25zdCB3aW5kb3dJbmRleCA9IHRoaXMud2luZG93cy5pbmRleE9mKHRhcmdldFdpbmRvdyk7XG5cbiAgICAgICAgaWYgKHRoaXMuY2hhdFdpbmRvd3Mpe1xuICAgICAgICAgICAgbGV0IHRhcmdldFdpbmRvdyA9IHRoaXMuY2hhdFdpbmRvd3MudG9BcnJheSgpW3dpbmRvd0luZGV4XTtcblxuICAgICAgICAgICAgcmV0dXJuIHRhcmdldFdpbmRvdztcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBudWxsO1xuICAgIH1cblxuICAgIC8vIFNjcm9sbHMgYSBjaGF0IHdpbmRvdyBtZXNzYWdlIGZsb3cgdG8gdGhlIGJvdHRvbVxuICAgIHByaXZhdGUgc2Nyb2xsQ2hhdFdpbmRvdyh3aW5kb3c6IFdpbmRvdywgZGlyZWN0aW9uOiBTY3JvbGxEaXJlY3Rpb24pOiB2b2lkXG4gICAge1xuICAgICAgICBjb25zdCBjaGF0V2luZG93ID0gdGhpcy5nZXRDaGF0V2luZG93Q29tcG9uZW50SW5zdGFuY2Uod2luZG93KTtcblxuICAgICAgICBpZiAoY2hhdFdpbmRvdyl7XG4gICAgICAgICAgICBjaGF0V2luZG93LnNjcm9sbENoYXRXaW5kb3cod2luZG93LCBkaXJlY3Rpb24pO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgb25XaW5kb3dNZXNzYWdlc1NlZW4obWVzc2FnZXNTZWVuOiBNZXNzYWdlW10pOiB2b2lkIHtcbiAgICAgICAgdGhpcy5tYXJrTWVzc2FnZXNBc1JlYWQobWVzc2FnZXNTZWVuKTtcbiAgICB9XG5cbiAgICBhc3luYyBvbldpbmRvd0NoYXRUb2dnbGUocGF5bG9hZDogeyBjdXJyZW50V2luZG93OiBXaW5kb3csIGlzQ29sbGFwc2VkOiBib29sZWFuIH0pIHtcbiAgICAgICAgdGhpcy5vblBhcnRpY2lwYW50VG9nZ2xlLmVtaXQoe3BhcnRpY2lwYW50OiBwYXlsb2FkLmN1cnJlbnRXaW5kb3cucGFydGljaXBhbnQsIGlzQ29sbGFwc2VkOiBwYXlsb2FkLmlzQ29sbGFwc2VkfSk7XG5cbiAgICB9XG5cbiAgICBhc3luYyBvbldpbmRvd0NoYXRDbG9zZWQocGF5bG9hZDogeyBjbG9zZWRXaW5kb3c6IFdpbmRvdywgY2xvc2VkVmlhRXNjYXBlS2V5OiBib29sZWFuIH0pIHtcbiAgICAgICAgY29uc3QgeyBjbG9zZWRXaW5kb3csIGNsb3NlZFZpYUVzY2FwZUtleSB9ID0gcGF5bG9hZDtcbiAgICAgICAgY29uc29sZS5sb2coJ29uV2luZG93Q2hhdENsb3NlZCcpO1xuICAgICAgICBpZih0aGlzLmJlZm9yZVBhcnRlY2lhbnRDaGF0Q2xvc2VkICE9IHVuZGVmaW5lZCAmJiB0aGlzLmJlZm9yZVBhcnRlY2lhbnRDaGF0Q2xvc2VkKSB7XG4gICAgICAgICAgICBjb25zdCBsID0gYXdhaXQgdGhpcy5iZWZvcmVQYXJ0ZWNpYW50Q2hhdENsb3NlZChjbG9zZWRXaW5kb3cucGFydGljaXBhbnQpO1xuICAgICAgICAgICAgaWYobCA9PSBmYWxzZSlcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGNsb3NlZFZpYUVzY2FwZUtleSkge1xuICAgICAgICAgICAgbGV0IGNsb3Nlc3RXaW5kb3cgPSB0aGlzLmdldENsb3Nlc3RXaW5kb3coY2xvc2VkV2luZG93KTtcblxuICAgICAgICAgICAgaWYgKGNsb3Nlc3RXaW5kb3cpXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgdGhpcy5mb2N1c09uV2luZG93KGNsb3Nlc3RXaW5kb3csICgpID0+IHsgdGhpcy5jbG9zZVdpbmRvdyhjbG9zZWRXaW5kb3cpOyB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICB0aGlzLmNsb3NlV2luZG93KGNsb3NlZFdpbmRvdyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICB0aGlzLmNsb3NlV2luZG93KGNsb3NlZFdpbmRvdyk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBvbldpbmRvd1RhYlRyaWdnZXJlZChwYXlsb2FkOiB7IHRyaWdnZXJpbmdXaW5kb3c6IFdpbmRvdywgc2hpZnRLZXlQcmVzc2VkOiBib29sZWFuIH0pOiB2b2lkIHtcbiAgICAgICAgY29uc3QgeyB0cmlnZ2VyaW5nV2luZG93LCBzaGlmdEtleVByZXNzZWQgfSA9IHBheWxvYWQ7XG5cbiAgICAgICAgY29uc3QgY3VycmVudFdpbmRvd0luZGV4ID0gdGhpcy53aW5kb3dzLmluZGV4T2YodHJpZ2dlcmluZ1dpbmRvdyk7XG4gICAgICAgIGxldCB3aW5kb3dUb0ZvY3VzID0gdGhpcy53aW5kb3dzW2N1cnJlbnRXaW5kb3dJbmRleCArIChzaGlmdEtleVByZXNzZWQgPyAxIDogLTEpXTsgLy8gR29lcyBiYWNrIG9uIHNoaWZ0ICsgdGFiXG5cbiAgICAgICAgaWYgKCF3aW5kb3dUb0ZvY3VzKVxuICAgICAgICB7XG4gICAgICAgICAgICAvLyBFZGdlIHdpbmRvd3MsIGdvIHRvIHN0YXJ0IG9yIGVuZFxuICAgICAgICAgICAgd2luZG93VG9Gb2N1cyA9IHRoaXMud2luZG93c1tjdXJyZW50V2luZG93SW5kZXggPiAwID8gMCA6IHRoaXMuY2hhdFdpbmRvd3MubGVuZ3RoIC0gMV07XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLmZvY3VzT25XaW5kb3cod2luZG93VG9Gb2N1cyk7XG4gICAgfVxuXG4gICAgb25XaW5kb3dNZXNzYWdlU2VudChtZXNzYWdlU2VudDogTWVzc2FnZSk6IHZvaWQge1xuICAgICAgICB0aGlzLmFkYXB0ZXIuc2VuZE1lc3NhZ2UobWVzc2FnZVNlbnQpO1xuICAgIH1cblxuICAgIG9uV2luZG93T3B0aW9uVHJpZ2dlcmVkKG9wdGlvbjogSUNoYXRPcHRpb24pOiB2b2lkIHtcbiAgICAgICAgdGhpcy5jdXJyZW50QWN0aXZlT3B0aW9uID0gb3B0aW9uO1xuICAgIH1cblxuICAgIHRyaWdnZXJPcGVuQ2hhdFdpbmRvdyh1c2VyOiBVc2VyKTogdm9pZCB7XG4gICAgICAgIGlmICh1c2VyKVxuICAgICAgICB7XG4gICAgICAgICAgICB0aGlzLm9wZW5DaGF0V2luZG93KHVzZXIpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgdHJpZ2dlckNsb3NlQ2hhdFdpbmRvdyh1c2VySWQ6IGFueSk6IHZvaWQge1xuICAgICAgICBjb25zdCBvcGVuZWRXaW5kb3cgPSB0aGlzLndpbmRvd3MuZmluZCh4ID0+IHgucGFydGljaXBhbnQuaWQgPT0gdXNlcklkKTtcblxuICAgICAgICBpZiAob3BlbmVkV2luZG93KVxuICAgICAgICB7XG4gICAgICAgICAgICB0aGlzLmNsb3NlV2luZG93KG9wZW5lZFdpbmRvdyk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICB0cmlnZ2VyVG9nZ2xlQ2hhdFdpbmRvd1Zpc2liaWxpdHkodXNlcklkOiBhbnkpOiB2b2lkIHtcbiAgICAgICAgY29uc3Qgb3BlbmVkV2luZG93ID0gdGhpcy53aW5kb3dzLmZpbmQoeCA9PiB4LnBhcnRpY2lwYW50LmlkID09IHVzZXJJZCk7XG5cbiAgICAgICAgaWYgKG9wZW5lZFdpbmRvdylcbiAgICAgICAge1xuICAgICAgICAgICAgY29uc3QgY2hhdFdpbmRvdyA9IHRoaXMuZ2V0Q2hhdFdpbmRvd0NvbXBvbmVudEluc3RhbmNlKG9wZW5lZFdpbmRvdyk7XG5cbiAgICAgICAgICAgIGlmIChjaGF0V2luZG93KXtcbiAgICAgICAgICAgICAgICBjaGF0V2luZG93Lm9uQ2hhdFdpbmRvd0NsaWNrZWQob3BlbmVkV2luZG93KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIHNldEJlZm9yZVBhcnRlY2lhbnRDaGF0Q2xvc2VkKGZ1bmM6IGFueSkge1xuICAgICAgICB0aGlzLmJlZm9yZVBhcnRlY2lhbnRDaGF0Q2xvc2VkID0gZnVuYztcbiAgICB9XG5cbiAgICBvbkRvd25sb2FkRmlsZShwYXJhbXM6IHtyZXBvc2l0b3J5SWQ6IHN0cmluZywgZmlsZU5hbWU6IHN0cmluZ30pIHtcbiAgICAgIHRoaXMuYWRhcHRlci5kb3dubG9hZEZpbGUocGFyYW1zLnJlcG9zaXRvcnlJZCwgcGFyYW1zLmZpbGVOYW1lKTtcbiAgICB9XG5cbiAgICBvbkdvVG9SZXBvKHBhcmFtczoge3JlcG9zaXRvcnlJZDogc3RyaW5nLCBpc0dyb3VwOiBib29sZWFufSkge1xuICAgICAgdGhpcy5hZGFwdGVyLmdvVG9SZXBvKHBhcmFtcy5yZXBvc2l0b3J5SWQsIHBhcmFtcy5pc0dyb3VwKTtcbiAgICB9XG59XG4iXX0=