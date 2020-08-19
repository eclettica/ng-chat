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
                if (this.fileUploadUrl && this.fileUploadUrl !== "") {
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
        // Not ideal but will keep this until we decide if we are shipping pagination with the default adapter
        if (this.adapter instanceof PagedHistoryChatAdapter) {
            window.isLoadingHistory = true;
            this.adapter.getMessageHistoryByPage(window.participant.id, this.historyPageSize, ++window.historyPage)
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
        template: "<link *ngIf=\"customTheme\" rel=\"stylesheet\" [href]='customTheme | sanitize'>\n\n<div id=\"ng-chat\" *ngIf=\"!isDisabled && isBootstrapped && !unsupportedViewport\" [ngClass]=\"theme\">\n    <ng-chat-friends-list\n        [localization]=\"localization\"\n        [shouldDisplay]=\"!hideFriendsList\"\n        [userId]=\"userId\"\n        [isCollapsed]=\"isCollapsed\"\n        [searchEnabled]=\"searchEnabled\"\n        [participants]=\"participants\"\n        [participantsResponse]=\"participantsResponse\"\n        [participantsInteractedWith]=\"participantsInteractedWith\"\n        [windows]=\"windows\"\n        [currentActiveOption]=\"currentActiveOption\"\n        (onParticipantClicked)=\"onParticipantClickedFromFriendsList($event)\"\n        (onOptionPromptCanceled)=\"onOptionPromptCanceled()\"\n        (onOptionPromptConfirmed)=\"onOptionPromptConfirmed($event)\"\n    >\n    </ng-chat-friends-list>\n\n    <div *ngFor=\"let window of windows; let i = index\" [ngClass]=\"{'ng-chat-window': true, 'primary-outline-color': true, 'ng-chat-window-collapsed': window.isCollapsed}\" [ngStyle]=\"{'right': (!hideFriendsList ? friendsListWidth : 0) + 20 + windowSizeFactor * i + 'px'}\">\n        <ng-chat-window\n            #chatWindow\n            [fileUploadAdapter]=\"fileUploadAdapter\"\n            [localization]=\"localization\"\n            [userId]=\"userId\"\n            [window]=\"window\"\n            [showOptions]=\"groupAdapter\"\n            [emojisEnabled]=\"emojisEnabled\"\n            [linkfyEnabled]=\"linkfyEnabled\"\n            [showMessageDate]=\"showMessageDate\"\n            [messageDatePipeFormat]=\"messageDatePipeFormat\"\n            [hasPagedHistory]=\"hasPagedHistory\"\n            (onMessagesSeen)=\"onWindowMessagesSeen($event)\"\n            (onMessageSent)=\"onWindowMessageSent($event)\"\n            (onTabTriggered)=\"onWindowTabTriggered($event)\"\n            (onChatWindowClosed)=\"onWindowChatClosed($event)\"\n            (onChatWindowToggle)=\"onWindowChatToggle($event)\"\n            (onOptionTriggered)=\"onWindowOptionTriggered($event)\"\n            (onLoadHistoryTriggered)=\"fetchMessageHistory($event)\"\n        >\n        </ng-chat-window>\n    </div>\n</div>\n",
        encapsulation: ViewEncapsulation.None,
        styles: [".user-icon{box-sizing:border-box;background-color:#fff;border:2px solid;width:32px;height:20px;border-radius:64px 64px 0 0/64px;margin-top:14px;margin-left:-1px;display:inline-block;vertical-align:middle;position:relative;font-style:normal;color:#ddd;text-align:left;text-indent:-9999px}.user-icon:before{border:2px solid;background-color:#fff;width:12px;height:12px;top:-19px;border-radius:50%;position:absolute;left:50%;transform:translateX(-50%)}.user-icon:after,.user-icon:before{content:'';pointer-events:none}.upload-icon{position:absolute;margin-left:3px;margin-top:12px;width:13px;height:4px;border:1px solid currentColor;border-top:none;border-radius:1px}.upload-icon:before{content:'';position:absolute;top:-8px;left:6px;width:1px;height:9px;background-color:currentColor}.upload-icon:after{content:'';position:absolute;top:-8px;left:4px;width:4px;height:4px;border-top:1px solid currentColor;border-right:1px solid currentColor;transform:rotate(-45deg)}.paperclip-icon{position:absolute;margin-left:9px;margin-top:2px;width:6px;height:12px;border-radius:4px 4px 0 0;border-left:1px solid currentColor;border-right:1px solid currentColor;border-top:1px solid currentColor;transform:rotate(45deg)}.paperclip-icon:before{content:'';position:absolute;top:11px;left:-1px;width:4px;height:6px;border-radius:0 0 3px 3px;border-left:1px solid currentColor;border-right:1px solid currentColor;border-bottom:1px solid currentColor}.paperclip-icon:after{content:'';position:absolute;left:1px;top:1px;width:2px;height:10px;border-radius:4px 4px 0 0;border-left:1px solid currentColor;border-right:1px solid currentColor;border-top:1px solid currentColor}.check-icon{color:#000;position:absolute;margin-left:3px;margin-top:4px;width:14px;height:8px;border-bottom:1px solid currentColor;border-left:1px solid currentColor;transform:rotate(-45deg)}.remove-icon{color:#000;position:absolute;margin-left:3px;margin-top:10px}.remove-icon:before{content:'';position:absolute;width:15px;height:1px;background-color:currentColor;transform:rotate(45deg)}.remove-icon:after{content:'';position:absolute;width:15px;height:1px;background-color:currentColor;transform:rotate(-45deg)}", ".loader,.loader:after,.loader:before{background:#e3e3e3;-webkit-animation:1s ease-in-out infinite load1;animation:1s ease-in-out infinite load1;width:1em;height:4em}.loader{color:#e3e3e3;text-indent:-9999em;margin:4px auto 0;position:relative;font-size:4px;transform:translateZ(0);-webkit-animation-delay:-.16s;animation-delay:-.16s}.loader:after,.loader:before{position:absolute;top:0;content:''}.loader:before{left:-1.5em;-webkit-animation-delay:-.32s;animation-delay:-.32s}.loader:after{left:1.5em}@-webkit-keyframes load1{0%,100%,80%{box-shadow:0 0;height:4em}40%{box-shadow:0 -2em;height:5em}}@keyframes load1{0%,100%,80%{box-shadow:0 0;height:4em}40%{box-shadow:0 -2em;height:5em}}", "#ng-chat{position:fixed;z-index:999;right:0;bottom:0;box-sizing:initial;font-size:11pt;text-align:left}#ng-chat .shadowed{box-shadow:0 4px 8px rgba(0,0,0,.25)}.ng-chat-loading-wrapper{height:30px;text-align:center;font-size:.9em}.ng-chat-close{text-decoration:none;float:right}.ng-chat-title,.ng-chat-title:hover{position:relative;z-index:2;height:30px;line-height:30px;font-size:.9em;padding:0 10px;display:block;text-decoration:none;color:inherit;font-weight:400;cursor:pointer}.ng-chat-title .ng-chat-title-visibility-toggle-area{display:inline-block;width:85%}.ng-chat-title .ng-chat-title-visibility-toggle-area>strong{font-weight:600;display:block;overflow:hidden;height:30px;text-overflow:ellipsis;white-space:nowrap;max-width:85%;float:left}.ng-chat-title .ng-chat-title-visibility-toggle-area .ng-chat-participant-status{float:left;margin-left:5px}.ng-chat-participant-status{display:inline-block;border-radius:25px;width:8px;height:8px;margin-top:10px}.ng-chat-participant-status.online{background-color:#92a400}.ng-chat-participant-status.busy{background-color:#f91c1e}.ng-chat-participant-status.away{background-color:#f7d21b}.ng-chat-participant-status.offline{background-color:#bababa}.ng-chat-unread-messages-count{margin-left:5px;padding:0 5px;border-radius:25px;font-size:.9em;line-height:30px}.ng-chat-options-container{float:right;margin-right:5px}", "#ng-chat.light-theme,#ng-chat.light-theme .primary-text{color:#5c5c5c;font-family:Arial,Helvetica,sans-serif}#ng-chat.light-theme .primary-background{background-color:#fff}#ng-chat.light-theme .secondary-background{background-color:#fafafa}#ng-chat.light-theme .primary-outline-color{border-color:#a3a3a3}#ng-chat.light-theme .friends-search-bar{background-color:#fff}#ng-chat.light-theme .ng-chat-people-action,#ng-chat.light-theme .ng-chat-people-action>i,#ng-chat.light-theme .unread-messages-counter-container{color:#5c5c5c;background-color:#e3e3e3}#ng-chat.light-theme .load-history-action{background-color:#e3e3e3}#ng-chat.light-theme .chat-window-input{background-color:#fff}#ng-chat.light-theme .file-message-container,#ng-chat.light-theme .sent-chat-message-container{background-color:#e3e3e3;border-color:#e3e3e3}#ng-chat.light-theme .file-message-container.received,#ng-chat.light-theme .received-chat-message-container{background-color:#fff;border-color:#e3e3e3}", "#ng-chat.dark-theme,#ng-chat.dark-theme .primary-text{color:#fff;font-family:Arial,Helvetica,sans-serif}#ng-chat.dark-theme .primary-background{background-color:#565656}#ng-chat.dark-theme .secondary-background{background-color:#444}#ng-chat.dark-theme .primary-outline-color{border-color:#353535}#ng-chat.dark-theme .friends-search-bar{background-color:#444;border:1px solid #444;color:#fff}#ng-chat.dark-theme .ng-chat-people-action,#ng-chat.dark-theme .ng-chat-people-action>i,#ng-chat.dark-theme .unread-messages-counter-container{background-color:#fff;color:#444}#ng-chat.dark-theme .load-history-action{background-color:#444}#ng-chat.dark-theme .chat-window-input{background-color:#444;color:#fff}#ng-chat.dark-theme .file-message-container,#ng-chat.dark-theme .sent-chat-message-container{border-color:#444;background-color:#444}#ng-chat.dark-theme .file-message-container.received,#ng-chat.dark-theme .received-chat-message-container{background-color:#565656;border-color:#444}#ng-chat.dark-theme .ng-chat-footer{background-color:#444}#ng-chat.dark-theme .ng-chat-message a{color:#fff}"]
    })
], NgChat);
export { NgChat };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmctY2hhdC5jb21wb25lbnQuanMiLCJzb3VyY2VSb290Ijoibmc6Ly9uZy1jaGF0LyIsInNvdXJjZXMiOlsibmctY2hhdC9uZy1jaGF0LmNvbXBvbmVudC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUEsT0FBTyxFQUFFLFNBQVMsRUFBRSxLQUFLLEVBQVUsWUFBWSxFQUFhLFlBQVksRUFBRSxNQUFNLEVBQUUsWUFBWSxFQUFFLGlCQUFpQixFQUFFLE1BQU0sZUFBZSxDQUFDO0FBQ3pJLE9BQU8sRUFBRSxVQUFVLEVBQUUsTUFBTSxzQkFBc0IsQ0FBQztBQU9sRCxPQUFPLEVBQUUsV0FBVyxFQUFFLE1BQU0sMEJBQTBCLENBQUM7QUFDdkQsT0FBTyxFQUFFLE1BQU0sRUFBRSxNQUFNLGVBQWUsQ0FBQztBQUN2QyxPQUFPLEVBQUUscUJBQXFCLEVBQUUsTUFBTSxxQ0FBcUMsQ0FBQztBQUM1RSxPQUFPLEVBQUUsZUFBZSxFQUFFLE1BQU0sOEJBQThCLENBQUM7QUFHL0QsT0FBTyxFQUFFLHVCQUF1QixFQUFFLE1BQU0sbUNBQW1DLENBQUM7QUFFNUUsT0FBTyxFQUFFLHdCQUF3QixFQUFFLE1BQU0sb0NBQW9DLENBQUM7QUFDOUUsT0FBTyxFQUFFLEtBQUssRUFBRSxNQUFNLG1CQUFtQixDQUFDO0FBRTFDLE9BQU8sRUFBRSxLQUFLLEVBQUUsTUFBTSxjQUFjLENBQUM7QUFDckMsT0FBTyxFQUFFLG1CQUFtQixFQUFFLE1BQU0sbUNBQW1DLENBQUM7QUFHeEUsT0FBTyxFQUFFLEdBQUcsRUFBRSxNQUFNLGdCQUFnQixDQUFDO0FBZ0JyQyxJQUFhLE1BQU0sR0FBbkIsTUFBYSxNQUFNO0lBQ2YsWUFBb0IsV0FBdUI7UUFBdkIsZ0JBQVcsR0FBWCxXQUFXLENBQVk7UUFFM0Msb0NBQW9DO1FBQzdCLHdCQUFtQixHQUFHLG1CQUFtQixDQUFDO1FBQzFDLDBCQUFxQixHQUFHLHFCQUFxQixDQUFDO1FBQzlDLGdCQUFXLEdBQUcsV0FBVyxDQUFDO1FBRXpCLGdCQUFXLEdBQVksS0FBSyxDQUFDO1FBK0I5QixnQkFBVyxHQUFZLEtBQUssQ0FBQztRQUc3QiwrQkFBMEIsR0FBWSxJQUFJLENBQUM7UUFHM0Msb0JBQWUsR0FBWSxLQUFLLENBQUM7UUFHakMsb0JBQWUsR0FBVyxJQUFJLENBQUM7UUFHL0IsbUJBQWMsR0FBWSxJQUFJLENBQUM7UUFHL0Isa0JBQWEsR0FBWSxJQUFJLENBQUM7UUFHOUIsa0JBQWEsR0FBWSxJQUFJLENBQUM7UUFHOUIsaUJBQVksR0FBWSxJQUFJLENBQUM7UUFHN0Isa0JBQWEsR0FBWSxJQUFJLENBQUM7UUFHOUIsZ0JBQVcsR0FBVyxnR0FBZ0csQ0FBQztRQUd2SCx3QkFBbUIsR0FBWSxJQUFJLENBQUM7UUFHcEMsVUFBSyxHQUFXLFNBQVMsQ0FBQztRQUcxQix1QkFBa0IsR0FBVyxnQkFBZ0IsQ0FBQztRQUc5QyxzQkFBaUIsR0FBVyxRQUFRLENBQUM7UUFHckMsZ0NBQTJCLEdBQVksSUFBSSxDQUFDO1FBRzVDLGtDQUE2QixHQUFXLGdHQUFnRyxDQUFDO1FBR3pJLDZCQUF3QixHQUFXLGtCQUFrQixDQUFDO1FBR3RELG9CQUFlLEdBQVcsRUFBRSxDQUFDO1FBTTdCLG9CQUFlLEdBQVksS0FBSyxDQUFDO1FBR2pDLHlDQUFvQyxHQUFZLElBQUksQ0FBQztRQU1yRCxVQUFLLEdBQVUsS0FBSyxDQUFDLEtBQUssQ0FBQztRQU0zQiwwQkFBcUIsR0FBVyxPQUFPLENBQUM7UUFHeEMsb0JBQWUsR0FBWSxJQUFJLENBQUM7UUFHaEMsOEJBQXlCLEdBQVksS0FBSyxDQUFDO1FBSzNDLHlCQUFvQixHQUFtQyxJQUFJLFlBQVksRUFBb0IsQ0FBQztRQUc1Riw0QkFBdUIsR0FBbUMsSUFBSSxZQUFZLEVBQW9CLENBQUM7UUFHL0YsNEJBQXVCLEdBQW1DLElBQUksWUFBWSxFQUFvQixDQUFDO1FBRy9GLG1CQUFjLEdBQTRCLElBQUksWUFBWSxFQUFhLENBQUM7UUFHeEUsd0JBQW1CLEdBQXdFLElBQUksWUFBWSxFQUF5RCxDQUFDO1FBRXBLLHFDQUFnQyxHQUFZLEtBQUssQ0FBQztRQUVuRCxvQkFBZSxHQUFZLEtBQUssQ0FBQztRQUV4Qyx3SkFBd0o7UUFDaEosc0JBQWlCLEdBQXNCO1lBQzNDLE1BQU0sRUFBRSxRQUFRO1lBQ2hCLElBQUksRUFBRSxNQUFNO1lBQ1osSUFBSSxFQUFFLE1BQU07WUFDWixPQUFPLEVBQUUsU0FBUztTQUNyQixDQUFDO1FBUUssK0JBQTBCLEdBQXVCLEVBQUUsQ0FBQztRQVczRCx1SEFBdUg7UUFDaEgscUJBQWdCLEdBQVcsR0FBRyxDQUFDO1FBRXRDLCtDQUErQztRQUN4QyxxQkFBZ0IsR0FBVyxHQUFHLENBQUM7UUFLdEMsMEhBQTBIO1FBQ25ILHdCQUFtQixHQUFZLEtBQUssQ0FBQztRQUs1QyxZQUFPLEdBQWEsRUFBRSxDQUFDO1FBQ3ZCLG1CQUFjLEdBQVksS0FBSyxDQUFDO0lBcExlLENBQUM7SUFTaEQsSUFBSSxVQUFVO1FBQ1YsT0FBTyxJQUFJLENBQUMsV0FBVyxDQUFDO0lBQzVCLENBQUM7SUFHRCxJQUFJLFVBQVUsQ0FBQyxLQUFjO1FBQ3pCLElBQUksQ0FBQyxXQUFXLEdBQUcsS0FBSyxDQUFDO1FBRXpCLElBQUksS0FBSyxFQUNUO1lBQ0ksbUVBQW1FO1lBQ25FLE1BQU0sQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDLDZCQUE2QixDQUFDLENBQUE7U0FDM0Q7YUFFRDtZQUNJLElBQUksQ0FBQyx1QkFBdUIsRUFBRSxDQUFDO1NBQ2xDO0lBQ0wsQ0FBQztJQXFJRCxJQUFZLGVBQWU7UUFFdkIsT0FBTyxpQkFBaUIsSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDLENBQUMsMEVBQTBFO0lBQ3JILENBQUM7SUFBQSxDQUFDO0lBc0JGLFFBQVE7UUFDSixJQUFJLENBQUMsYUFBYSxFQUFFLENBQUM7SUFDekIsQ0FBQztJQUdELFFBQVEsQ0FBQyxLQUFVO1FBQ2hCLElBQUksQ0FBQyxpQkFBaUIsR0FBRyxLQUFLLENBQUMsTUFBTSxDQUFDLFVBQVUsQ0FBQztRQUVqRCxJQUFJLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQztJQUMzQixDQUFDO0lBRUQseUVBQXlFO0lBQ2pFLGdCQUFnQjtRQUVwQixNQUFNLHlCQUF5QixHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxJQUFJLENBQUMsaUJBQWlCLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxlQUFlLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsQ0FBQztRQUNySixNQUFNLFVBQVUsR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLE1BQU0sR0FBRyx5QkFBeUIsQ0FBQztRQUVuRSxJQUFJLFVBQVUsSUFBSSxDQUFDLEVBQ25CO1lBQ0ksSUFBSSxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxNQUFNLEdBQUcsVUFBVSxDQUFDLENBQUM7U0FDekQ7UUFFRCxJQUFJLENBQUMsa0JBQWtCLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBRXRDLDBHQUEwRztRQUMxRyxJQUFJLENBQUMsbUJBQW1CLEdBQUcsSUFBSSxDQUFDLHlCQUF5QixDQUFBLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxvQ0FBb0MsSUFBSSx5QkFBeUIsR0FBRyxDQUFDLENBQUM7SUFDbEosQ0FBQztJQUVELHdEQUF3RDtJQUNoRCxhQUFhO1FBRWpCLElBQUksdUJBQXVCLEdBQUcsSUFBSSxDQUFDO1FBRW5DLElBQUksSUFBSSxDQUFDLE9BQU8sSUFBSSxJQUFJLElBQUksSUFBSSxDQUFDLE1BQU0sSUFBSSxJQUFJLEVBQy9DO1lBQ0ksSUFDQTtnQkFDSSxJQUFJLENBQUMsaUJBQWlCLEdBQUcsTUFBTSxDQUFDLFVBQVUsQ0FBQztnQkFFM0MsSUFBSSxDQUFDLGVBQWUsRUFBRSxDQUFDO2dCQUN2QixJQUFJLENBQUMscUJBQXFCLEVBQUUsQ0FBQztnQkFDN0IsSUFBSSxDQUFDLDhCQUE4QixFQUFFLENBQUM7Z0JBRXRDLDBCQUEwQjtnQkFDMUIsSUFBSSxDQUFDLE9BQU8sQ0FBQyxzQkFBc0IsR0FBRyxDQUFDLFdBQVcsRUFBRSxHQUFHLEVBQUUsRUFBRSxDQUFDLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxXQUFXLEVBQUUsR0FBRyxDQUFDLENBQUM7Z0JBQ3JHLElBQUksQ0FBQyxPQUFPLENBQUMseUJBQXlCLEdBQUcsQ0FBQyxvQkFBb0IsRUFBRSxFQUFFLENBQUMsSUFBSSxDQUFDLG9CQUFvQixDQUFDLG9CQUFvQixDQUFDLENBQUM7Z0JBRW5ILElBQUksQ0FBQyx1QkFBdUIsRUFBRSxDQUFDO2dCQUUvQixJQUFJLENBQUMsZUFBZSxFQUFFLENBQUM7Z0JBRXZCLElBQUksQ0FBQyxlQUFlLEdBQUcsSUFBSSxDQUFDLE9BQU8sWUFBWSx1QkFBdUIsQ0FBQztnQkFFdkUsSUFBSSxJQUFJLENBQUMsYUFBYSxJQUFJLElBQUksQ0FBQyxhQUFhLEtBQUssRUFBRSxFQUNuRDtvQkFDSSxJQUFJLENBQUMsaUJBQWlCLEdBQUcsSUFBSSx3QkFBd0IsQ0FBQyxJQUFJLENBQUMsYUFBYSxFQUFFLElBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQztpQkFDL0Y7Z0JBRUQsSUFBSSxDQUFDLGdCQUFnQixFQUFFLENBQUM7Z0JBRXhCLElBQUksQ0FBQyxjQUFjLEdBQUcsSUFBSSxDQUFDO2FBQzlCO1lBQ0QsT0FBTSxFQUFFLEVBQ1I7Z0JBQ0ksdUJBQXVCLEdBQUcsRUFBRSxDQUFDO2FBQ2hDO1NBQ0o7UUFFRCxJQUFJLENBQUMsSUFBSSxDQUFDLGNBQWMsRUFBQztZQUNyQixPQUFPLENBQUMsS0FBSyxDQUFDLDZDQUE2QyxDQUFDLENBQUM7WUFFN0QsSUFBSSxJQUFJLENBQUMsTUFBTSxJQUFJLElBQUksRUFBQztnQkFDcEIsT0FBTyxDQUFDLEtBQUssQ0FBQyxzSUFBc0ksQ0FBQyxDQUFDO2FBQ3pKO1lBQ0QsSUFBSSxJQUFJLENBQUMsT0FBTyxJQUFJLElBQUksRUFBQztnQkFDckIsT0FBTyxDQUFDLEtBQUssQ0FBQyw2SkFBNkosQ0FBQyxDQUFDO2FBQ2hMO1lBQ0QsSUFBSSx1QkFBdUIsRUFDM0I7Z0JBQ0ksT0FBTyxDQUFDLEtBQUssQ0FBQyxrRUFBa0UsdUJBQXVCLENBQUMsT0FBTyxFQUFFLENBQUMsQ0FBQztnQkFDbkgsT0FBTyxDQUFDLEtBQUssQ0FBQyx1QkFBdUIsQ0FBQyxDQUFDO2FBQzFDO1NBQ0o7SUFDTCxDQUFDO0lBRU8sdUJBQXVCO1FBQzNCLElBQUksSUFBSSxDQUFDLE9BQU8sRUFDaEI7WUFDSSw2QkFBNkI7WUFDN0IsSUFBSSxJQUFJLENBQUMsZUFBZSxFQUFDO2dCQUNyQiwwREFBMEQ7Z0JBQzFELElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxJQUFJLENBQUMsQ0FBQztnQkFDNUIsSUFBSSxDQUFDLDZCQUE2QixHQUFHLE1BQU0sQ0FBQyxXQUFXLENBQUMsR0FBRyxFQUFFLENBQUMsSUFBSSxDQUFDLGdCQUFnQixDQUFDLEtBQUssQ0FBQyxFQUFFLElBQUksQ0FBQyxlQUFlLENBQUMsQ0FBQzthQUNySDtpQkFFRDtnQkFDSSw4R0FBOEc7Z0JBQzlHLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxJQUFJLENBQUMsQ0FBQzthQUMvQjtTQUNKO0lBQ0wsQ0FBQztJQUVELG9DQUFvQztJQUN0Qiw4QkFBOEI7O1lBRXhDLElBQUksSUFBSSxDQUFDLDJCQUEyQixJQUFJLENBQUMsY0FBYyxJQUFJLE1BQU0sQ0FBQyxFQUNsRTtnQkFDSSxJQUFJLENBQUEsTUFBTSxZQUFZLENBQUMsaUJBQWlCLEVBQUUsTUFBSyxTQUFTLEVBQ3hEO29CQUNJLElBQUksQ0FBQyxnQ0FBZ0MsR0FBRyxJQUFJLENBQUM7aUJBQ2hEO2FBQ0o7UUFDTCxDQUFDO0tBQUE7SUFFRCwyQkFBMkI7SUFDbkIscUJBQXFCO1FBRXpCLElBQUksQ0FBQyxJQUFJLENBQUMsWUFBWSxFQUN0QjtZQUNJLElBQUksQ0FBQyxZQUFZLEdBQUc7Z0JBQ2hCLGtCQUFrQixFQUFFLElBQUksQ0FBQyxrQkFBa0I7Z0JBQzNDLGlCQUFpQixFQUFFLElBQUksQ0FBQyxpQkFBaUI7Z0JBQ3pDLEtBQUssRUFBRSxJQUFJLENBQUMsS0FBSztnQkFDakIsaUJBQWlCLEVBQUUsSUFBSSxDQUFDLGlCQUFpQjtnQkFDekMsd0JBQXdCLEVBQUUsSUFBSSxDQUFDLHdCQUF3QjtnQkFDdkQsNkJBQTZCLEVBQUUscUJBQXFCO2FBQ3ZELENBQUM7U0FDTDtJQUNMLENBQUM7SUFFTyxlQUFlO1FBRW5CLElBQUksSUFBSSxDQUFDLFdBQVcsRUFDcEI7WUFDSSxJQUFJLENBQUMsS0FBSyxHQUFHLEtBQUssQ0FBQyxNQUFNLENBQUM7U0FDN0I7YUFDSSxJQUFJLElBQUksQ0FBQyxLQUFLLElBQUksS0FBSyxDQUFDLEtBQUssSUFBSSxJQUFJLENBQUMsS0FBSyxJQUFJLEtBQUssQ0FBQyxJQUFJLEVBQzlEO1lBQ0ksNkZBQTZGO1lBQzdGLE1BQU0sSUFBSSxLQUFLLENBQUMsNkNBQTZDLElBQUksQ0FBQyxLQUFLLCtCQUErQixDQUFDLENBQUM7U0FDM0c7SUFDTCxDQUFDO0lBRUQsMkNBQTJDO0lBQ3BDLGdCQUFnQixDQUFDLGVBQXdCO1FBRTVDLElBQUksQ0FBQyxPQUFPLENBQUMsV0FBVyxFQUFFO2FBQ3pCLElBQUksQ0FDRCxHQUFHLENBQUMsQ0FBQyxvQkFBMkMsRUFBRSxFQUFFO1lBQ2hELElBQUksQ0FBQyxvQkFBb0IsR0FBRyxvQkFBb0IsQ0FBQztZQUVqRCxJQUFJLENBQUMsWUFBWSxHQUFHLG9CQUFvQixDQUFDLEdBQUcsQ0FBQyxDQUFDLFFBQTZCLEVBQUUsRUFBRTtnQkFDM0UsT0FBTyxRQUFRLENBQUMsV0FBVyxDQUFDO1lBQ2hDLENBQUMsQ0FBQyxDQUFDO1FBQ1AsQ0FBQyxDQUFDLENBQ0wsQ0FBQyxTQUFTLENBQUMsR0FBRyxFQUFFO1lBQ2IsSUFBSSxlQUFlLEVBQ25CO2dCQUNJLElBQUksQ0FBQyxtQkFBbUIsRUFBRSxDQUFDO2FBQzlCO1FBQ0wsQ0FBQyxDQUFDLENBQUM7SUFDUCxDQUFDO0lBRUQsbUJBQW1CLENBQUMsTUFBYztRQUM5QixzR0FBc0c7UUFDdEcsSUFBSSxJQUFJLENBQUMsT0FBTyxZQUFZLHVCQUF1QixFQUNuRDtZQUNJLE1BQU0sQ0FBQyxnQkFBZ0IsR0FBRyxJQUFJLENBQUM7WUFFL0IsSUFBSSxDQUFDLE9BQU8sQ0FBQyx1QkFBdUIsQ0FBQyxNQUFNLENBQUMsV0FBVyxDQUFDLEVBQUUsRUFBRSxJQUFJLENBQUMsZUFBZSxFQUFFLEVBQUUsTUFBTSxDQUFDLFdBQVcsQ0FBQztpQkFDdEcsSUFBSSxDQUNELEdBQUcsQ0FBQyxDQUFDLE1BQWlCLEVBQUUsRUFBRTtnQkFDdEIsTUFBTSxDQUFDLE9BQU8sQ0FBQyxDQUFDLE9BQU8sRUFBRSxFQUFFLENBQUMsSUFBSSxDQUFDLGlCQUFpQixDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUM7Z0JBRTdELE1BQU0sQ0FBQyxRQUFRLEdBQUcsTUFBTSxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLENBQUM7Z0JBQ2pELE1BQU0sQ0FBQyxnQkFBZ0IsR0FBRyxLQUFLLENBQUM7Z0JBRWhDLE1BQU0sU0FBUyxHQUFvQixDQUFDLE1BQU0sQ0FBQyxXQUFXLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLGVBQWUsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLGVBQWUsQ0FBQyxHQUFHLENBQUM7Z0JBQzVHLE1BQU0sQ0FBQyxlQUFlLEdBQUcsTUFBTSxDQUFDLE1BQU0sSUFBSSxJQUFJLENBQUMsZUFBZSxDQUFDO2dCQUUvRCxVQUFVLENBQUMsR0FBRyxFQUFFLENBQUMsSUFBSSxDQUFDLDJCQUEyQixDQUFDLE1BQU0sRUFBRSxNQUFNLEVBQUUsU0FBUyxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUM7WUFDeEYsQ0FBQyxDQUFDLENBQ0wsQ0FBQyxTQUFTLEVBQUUsQ0FBQztTQUNqQjthQUVEO1lBQ0ksSUFBSSxDQUFDLE9BQU8sQ0FBQyxpQkFBaUIsQ0FBQyxNQUFNLENBQUMsV0FBVyxDQUFDLEVBQUUsQ0FBQztpQkFDcEQsSUFBSSxDQUNELEdBQUcsQ0FBQyxDQUFDLE1BQWlCLEVBQUUsRUFBRTtnQkFDdEIsTUFBTSxDQUFDLE9BQU8sQ0FBQyxDQUFDLE9BQU8sRUFBRSxFQUFFLENBQUMsSUFBSSxDQUFDLGlCQUFpQixDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUM7Z0JBRTdELE1BQU0sQ0FBQyxRQUFRLEdBQUcsTUFBTSxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLENBQUM7Z0JBQ2pELE1BQU0sQ0FBQyxnQkFBZ0IsR0FBRyxLQUFLLENBQUM7Z0JBRWhDLFVBQVUsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxJQUFJLENBQUMsMkJBQTJCLENBQUMsTUFBTSxFQUFFLE1BQU0sRUFBRSxlQUFlLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQztZQUMvRixDQUFDLENBQUMsQ0FDTCxDQUFDLFNBQVMsRUFBRSxDQUFDO1NBQ2pCO0lBQ0wsQ0FBQztJQUVPLDJCQUEyQixDQUFDLFFBQW1CLEVBQUUsTUFBYyxFQUFFLFNBQTBCLEVBQUUsMEJBQW1DLEtBQUs7UUFFekksSUFBSSxDQUFDLGdCQUFnQixDQUFDLE1BQU0sRUFBRSxTQUFTLENBQUMsQ0FBQTtRQUV4QyxJQUFJLE1BQU0sQ0FBQyxRQUFRLElBQUksdUJBQXVCLEVBQzlDO1lBQ0ksTUFBTSxjQUFjLEdBQUcsUUFBUSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxDQUFDO1lBRXpELElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxjQUFjLENBQUMsQ0FBQztTQUMzQztJQUNMLENBQUM7SUFFRCxpREFBaUQ7SUFDekMsb0JBQW9CLENBQUMsb0JBQTJDO1FBRXBFLElBQUksb0JBQW9CLEVBQ3hCO1lBQ0ksSUFBSSxDQUFDLG9CQUFvQixHQUFHLG9CQUFvQixDQUFDO1lBRWpELElBQUksQ0FBQyxZQUFZLEdBQUcsb0JBQW9CLENBQUMsR0FBRyxDQUFDLENBQUMsUUFBNkIsRUFBRSxFQUFFO2dCQUMzRSxPQUFPLFFBQVEsQ0FBQyxXQUFXLENBQUM7WUFDaEMsQ0FBQyxDQUFDLENBQUM7WUFFSCxJQUFJLENBQUMsMEJBQTBCLEdBQUcsRUFBRSxDQUFDO1NBQ3hDO0lBQ0wsQ0FBQztJQUVELDJDQUEyQztJQUNuQyxpQkFBaUIsQ0FBQyxXQUE2QixFQUFFLE9BQWdCO1FBRXJFLElBQUksV0FBVyxJQUFJLE9BQU8sRUFDMUI7WUFDSSxNQUFNLFVBQVUsR0FBRyxJQUFJLENBQUMsY0FBYyxDQUFDLFdBQVcsQ0FBQyxDQUFDO1lBRXBELElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxPQUFPLENBQUMsQ0FBQztZQUVoQyxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLGNBQWMsRUFBQztnQkFDdkMsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUM7Z0JBRXJDLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLEVBQUUsZUFBZSxDQUFDLE1BQU0sQ0FBQyxDQUFDO2dCQUU3RCxJQUFJLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxRQUFRLEVBQzFCO29CQUNJLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUM7aUJBQ3RDO2FBQ0o7WUFFRCxJQUFJLENBQUMsZ0JBQWdCLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFFckMsb0JBQW9CO1lBQ3BCLGdLQUFnSztZQUNoSyxJQUFJLElBQUksQ0FBQywwQkFBMEIsSUFBSSxDQUFDLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDLFdBQVcsQ0FBQyxFQUNyRjtnQkFDSSxvSEFBb0g7Z0JBQ3BILElBQUksQ0FBQyx1QkFBdUIsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLEVBQUUsT0FBTyxDQUFDLENBQUM7YUFDeEQ7U0FDSjtJQUNMLENBQUM7SUFFRCxtQ0FBbUMsQ0FBQyxXQUE2QjtRQUM3RCxJQUFJLENBQUMsY0FBYyxDQUFDLFdBQVcsRUFBRSxJQUFJLEVBQUUsSUFBSSxDQUFDLENBQUM7SUFDakQsQ0FBQztJQUVPLGtCQUFrQjtRQUN0QixJQUFJLElBQUksQ0FBQyxtQkFBbUIsRUFDNUI7WUFDSSxJQUFJLENBQUMsbUJBQW1CLENBQUMsUUFBUSxHQUFHLEtBQUssQ0FBQztZQUMxQyxJQUFJLENBQUMsbUJBQW1CLEdBQUcsSUFBSSxDQUFDO1NBQ25DO0lBQ0wsQ0FBQztJQUVELHNCQUFzQjtRQUNsQixJQUFJLENBQUMsa0JBQWtCLEVBQUUsQ0FBQztJQUM5QixDQUFDO0lBRUQsdUJBQXVCLENBQUMsS0FBVTtRQUM5QixpSUFBaUk7UUFDakksSUFBSSxDQUFDLGVBQWUsQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUU1QiwwQkFBMEI7UUFDMUIsSUFBSSxDQUFDLGtCQUFrQixFQUFFLENBQUM7SUFDOUIsQ0FBQztJQUVPLGVBQWUsQ0FBQyxLQUFhO1FBQ2pDLE1BQU0sUUFBUSxHQUFHLElBQUksS0FBSyxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBRWxDLElBQUksQ0FBQyxjQUFjLENBQUMsUUFBUSxDQUFDLENBQUM7UUFFOUIsSUFBSSxJQUFJLENBQUMsWUFBWSxFQUNyQjtZQUNJLElBQUksQ0FBQyxZQUFZLENBQUMsWUFBWSxDQUFDLFFBQVEsQ0FBQyxDQUFDO1NBQzVDO0lBQ0wsQ0FBQztJQUVELDZEQUE2RDtJQUM3RCw2REFBNkQ7SUFDN0QsdUdBQXVHO0lBQy9GLGNBQWMsQ0FBQyxXQUE2QixFQUFFLG1CQUE0QixLQUFLLEVBQUUscUJBQThCLEtBQUs7UUFFeEgseUJBQXlCO1FBQ3pCLE1BQU0sWUFBWSxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLFdBQVcsQ0FBQyxFQUFFLElBQUksV0FBVyxDQUFDLEVBQUUsQ0FBQyxDQUFDO1FBRWhGLElBQUksQ0FBQyxZQUFZLEVBQ2pCO1lBQ0ksSUFBSSxrQkFBa0IsRUFDdEI7Z0JBQ0ksSUFBSSxDQUFDLG9CQUFvQixDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQzthQUMvQztZQUVELGdDQUFnQztZQUNoQyxNQUFNLGNBQWMsR0FBRyxrQkFBa0IsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQywwQkFBMEIsQ0FBQztZQUVyRixNQUFNLGFBQWEsR0FBVyxJQUFJLE1BQU0sQ0FBQyxXQUFXLEVBQUUsSUFBSSxDQUFDLGNBQWMsRUFBRSxjQUFjLENBQUMsQ0FBQztZQUUzRixnREFBZ0Q7WUFDaEQsSUFBSSxJQUFJLENBQUMsY0FBYyxFQUN2QjtnQkFDSSxJQUFJLENBQUMsbUJBQW1CLENBQUMsYUFBYSxDQUFDLENBQUM7YUFDM0M7WUFFRCxJQUFJLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxhQUFhLENBQUMsQ0FBQztZQUVwQyx1R0FBdUc7WUFDdkcsSUFBSSxDQUFDLElBQUksQ0FBQyx5QkFBeUIsRUFBRTtnQkFDakMsSUFBSSxJQUFJLENBQUMsT0FBTyxDQUFDLE1BQU0sR0FBRyxJQUFJLENBQUMsZ0JBQWdCLElBQUksSUFBSSxDQUFDLGlCQUFpQixHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsZUFBZSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFO29CQUM3SCxJQUFJLENBQUMsT0FBTyxDQUFDLEdBQUcsRUFBRSxDQUFDO2lCQUN0QjthQUNKO1lBRUQsSUFBSSxDQUFDLGtCQUFrQixDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQztZQUV0QyxJQUFJLGdCQUFnQixJQUFJLENBQUMsY0FBYyxFQUN2QztnQkFDSSxJQUFJLENBQUMsYUFBYSxDQUFDLGFBQWEsQ0FBQyxDQUFDO2FBQ3JDO1lBRUQsSUFBSSxDQUFDLDBCQUEwQixDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQztZQUNsRCxJQUFJLENBQUMsdUJBQXVCLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxDQUFDO1lBRS9DLE9BQU8sQ0FBQyxhQUFhLEVBQUUsSUFBSSxDQUFDLENBQUM7U0FDaEM7YUFFRDtZQUNJLHdDQUF3QztZQUN4QyxPQUFPLENBQUMsWUFBWSxFQUFFLEtBQUssQ0FBQyxDQUFDO1NBQ2hDO0lBQ0wsQ0FBQztJQUVELG9EQUFvRDtJQUM1QyxhQUFhLENBQUMsTUFBYyxFQUFFLFdBQXFCLEdBQUcsRUFBRSxHQUFFLENBQUM7UUFFL0QsTUFBTSxXQUFXLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLENBQUM7UUFDakQsSUFBSSxXQUFXLElBQUksQ0FBQyxFQUNwQjtZQUNJLFVBQVUsQ0FBQyxHQUFHLEVBQUU7Z0JBQ1osSUFBSSxJQUFJLENBQUMsV0FBVyxFQUNwQjtvQkFDSSxNQUFNLGlCQUFpQixHQUFHLElBQUksQ0FBQyxXQUFXLENBQUMsT0FBTyxFQUFFLENBQUMsV0FBVyxDQUFDLENBQUM7b0JBRWxFLGlCQUFpQixDQUFDLGVBQWUsQ0FBQyxhQUFhLENBQUMsS0FBSyxFQUFFLENBQUM7aUJBQzNEO2dCQUVELFFBQVEsRUFBRSxDQUFDO1lBQ2YsQ0FBQyxDQUFDLENBQUM7U0FDTjtJQUNMLENBQUM7SUFFTyxpQkFBaUIsQ0FBQyxPQUFnQjtRQUN0QyxnRUFBZ0U7UUFDaEUsSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLEVBQ2pCO1lBQ0ksT0FBTyxDQUFDLElBQUksR0FBRyxXQUFXLENBQUMsSUFBSSxDQUFDO1NBQ25DO0lBQ0wsQ0FBQztJQUVELDZEQUE2RDtJQUM3RCxrQkFBa0IsQ0FBQyxRQUFtQjtRQUVsQyxNQUFNLFdBQVcsR0FBRyxJQUFJLElBQUksRUFBRSxDQUFDO1FBRS9CLFFBQVEsQ0FBQyxPQUFPLENBQUMsQ0FBQyxHQUFHLEVBQUMsRUFBRTtZQUNwQixHQUFHLENBQUMsUUFBUSxHQUFHLFdBQVcsQ0FBQztRQUMvQixDQUFDLENBQUMsQ0FBQztRQUVILElBQUksQ0FBQyxjQUFjLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDO0lBQ3ZDLENBQUM7SUFFRCxxREFBcUQ7SUFDN0MsZUFBZTtRQUNuQixJQUFJLElBQUksQ0FBQyxXQUFXLElBQUksSUFBSSxDQUFDLFdBQVcsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUNuRDtZQUNJLElBQUksQ0FBQyxTQUFTLEdBQUcsSUFBSSxLQUFLLEVBQUUsQ0FBQztZQUM3QixJQUFJLENBQUMsU0FBUyxDQUFDLEdBQUcsR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDO1lBQ3RDLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxFQUFFLENBQUM7U0FDekI7SUFDTCxDQUFDO0lBRUQsNkVBQTZFO0lBQ3JFLGdCQUFnQixDQUFDLE1BQWM7UUFFbkMsSUFBSSxJQUFJLENBQUMsWUFBWSxJQUFJLENBQUMsTUFBTSxDQUFDLFFBQVEsSUFBSSxJQUFJLENBQUMsU0FBUyxFQUFFO1lBQ3pELElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxFQUFFLENBQUM7U0FDekI7SUFDTCxDQUFDO0lBRUQsK0JBQStCO0lBQ3ZCLHVCQUF1QixDQUFDLE1BQWMsRUFBRSxPQUFnQjtRQUU1RCxJQUFJLElBQUksQ0FBQyxnQ0FBZ0MsSUFBSSxDQUFDLE1BQU0sQ0FBQyxRQUFRLElBQUksT0FBTyxFQUFFO1lBQ3RFLE1BQU0sWUFBWSxHQUFHLElBQUksWUFBWSxDQUFDLEdBQUcsSUFBSSxDQUFDLFlBQVksQ0FBQyx3QkFBd0IsSUFBSSxNQUFNLENBQUMsV0FBVyxDQUFDLFdBQVcsRUFBRSxFQUFFO2dCQUNySCxNQUFNLEVBQUUsT0FBTyxDQUFDLE9BQU87Z0JBQ3ZCLE1BQU0sRUFBRSxJQUFJLENBQUMsNkJBQTZCO2FBQzdDLENBQUMsQ0FBQztZQUVILFVBQVUsQ0FBQyxHQUFHLEVBQUU7Z0JBQ1osWUFBWSxDQUFDLEtBQUssRUFBRSxDQUFDO1lBQ3pCLENBQUMsRUFBRSxPQUFPLENBQUMsT0FBTyxDQUFDLE1BQU0sSUFBSSxFQUFFLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxvQ0FBb0M7U0FDdkY7SUFDTCxDQUFDO0lBRUQsMkVBQTJFO0lBQ25FLGtCQUFrQixDQUFDLE9BQWlCO1FBRXhDLElBQUksSUFBSSxDQUFDLG1CQUFtQixFQUM1QjtZQUNJLE1BQU0sY0FBYyxHQUFHLE9BQU8sQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRTtnQkFDckMsT0FBTyxDQUFDLENBQUMsV0FBVyxDQUFDLEVBQUUsQ0FBQztZQUM1QixDQUFDLENBQUMsQ0FBQztZQUVILFlBQVksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLGVBQWUsRUFBRSxJQUFJLENBQUMsU0FBUyxDQUFDLGNBQWMsQ0FBQyxDQUFDLENBQUM7U0FDOUU7SUFDTCxDQUFDO0lBRU8sbUJBQW1CO1FBRXZCLElBQ0E7WUFDSSxJQUFJLElBQUksQ0FBQyxtQkFBbUIsRUFDNUI7Z0JBQ0ksTUFBTSx3QkFBd0IsR0FBRyxZQUFZLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxlQUFlLENBQUMsQ0FBQztnQkFFNUUsSUFBSSx3QkFBd0IsSUFBSSx3QkFBd0IsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUNuRTtvQkFDSSxNQUFNLGNBQWMsR0FBYSxJQUFJLENBQUMsS0FBSyxDQUFDLHdCQUF3QixDQUFDLENBQUM7b0JBRXRFLE1BQU0scUJBQXFCLEdBQUcsSUFBSSxDQUFDLFlBQVksQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxjQUFjLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztvQkFFL0YscUJBQXFCLENBQUMsT0FBTyxDQUFDLENBQUMsV0FBVyxFQUFFLEVBQUU7d0JBQzFDLElBQUksQ0FBQyxjQUFjLENBQUMsV0FBVyxDQUFDLENBQUM7b0JBQ3JDLENBQUMsQ0FBQyxDQUFDO2lCQUNOO2FBQ0o7U0FDSjtRQUNELE9BQU8sRUFBRSxFQUNUO1lBQ0ksT0FBTyxDQUFDLEtBQUssQ0FBQyxxRUFBcUUsRUFBRSxFQUFFLENBQUMsQ0FBQztTQUM1RjtJQUNMLENBQUM7SUFFRCwyRUFBMkU7SUFDbkUsZ0JBQWdCLENBQUMsTUFBYztRQUVuQyxNQUFNLEtBQUssR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUUzQyxJQUFJLEtBQUssR0FBRyxDQUFDLEVBQ2I7WUFDSSxPQUFPLElBQUksQ0FBQyxPQUFPLENBQUMsS0FBSyxHQUFHLENBQUMsQ0FBQyxDQUFDO1NBQ2xDO2FBQ0ksSUFBSSxLQUFLLElBQUksQ0FBQyxJQUFJLElBQUksQ0FBQyxPQUFPLENBQUMsTUFBTSxHQUFHLENBQUMsRUFDOUM7WUFDSSxPQUFPLElBQUksQ0FBQyxPQUFPLENBQUMsS0FBSyxHQUFHLENBQUMsQ0FBQyxDQUFDO1NBQ2xDO0lBQ0wsQ0FBQztJQUVPLFdBQVcsQ0FBQyxNQUFjO1FBRTlCLE1BQU0sS0FBSyxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBRTNDLElBQUksQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLEtBQUssRUFBRSxDQUFDLENBQUMsQ0FBQztRQUU5QixJQUFJLENBQUMsa0JBQWtCLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBRXRDLElBQUksQ0FBQyx1QkFBdUIsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLFdBQVcsQ0FBQyxDQUFDO0lBQzFELENBQUM7SUFFTyw4QkFBOEIsQ0FBQyxZQUFvQjtRQUN2RCxNQUFNLFdBQVcsR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxZQUFZLENBQUMsQ0FBQztRQUV2RCxJQUFJLElBQUksQ0FBQyxXQUFXLEVBQUM7WUFDakIsSUFBSSxZQUFZLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQyxPQUFPLEVBQUUsQ0FBQyxXQUFXLENBQUMsQ0FBQztZQUUzRCxPQUFPLFlBQVksQ0FBQztTQUN2QjtRQUVELE9BQU8sSUFBSSxDQUFDO0lBQ2hCLENBQUM7SUFFRCxtREFBbUQ7SUFDM0MsZ0JBQWdCLENBQUMsTUFBYyxFQUFFLFNBQTBCO1FBRS9ELE1BQU0sVUFBVSxHQUFHLElBQUksQ0FBQyw4QkFBOEIsQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUUvRCxJQUFJLFVBQVUsRUFBQztZQUNYLFVBQVUsQ0FBQyxnQkFBZ0IsQ0FBQyxNQUFNLEVBQUUsU0FBUyxDQUFDLENBQUM7U0FDbEQ7SUFDTCxDQUFDO0lBRUQsb0JBQW9CLENBQUMsWUFBdUI7UUFDeEMsSUFBSSxDQUFDLGtCQUFrQixDQUFDLFlBQVksQ0FBQyxDQUFDO0lBQzFDLENBQUM7SUFFSyxrQkFBa0IsQ0FBQyxPQUF3RDs7WUFDN0UsSUFBSSxDQUFDLG1CQUFtQixDQUFDLElBQUksQ0FBQyxFQUFDLFdBQVcsRUFBRSxPQUFPLENBQUMsYUFBYSxDQUFDLFdBQVcsRUFBRSxXQUFXLEVBQUUsT0FBTyxDQUFDLFdBQVcsRUFBQyxDQUFDLENBQUM7UUFFdEgsQ0FBQztLQUFBO0lBRUssa0JBQWtCLENBQUMsT0FBOEQ7O1lBQ25GLE1BQU0sRUFBRSxZQUFZLEVBQUUsa0JBQWtCLEVBQUUsR0FBRyxPQUFPLENBQUM7WUFDckQsT0FBTyxDQUFDLEdBQUcsQ0FBQyxvQkFBb0IsQ0FBQyxDQUFDO1lBQ2xDLElBQUcsSUFBSSxDQUFDLDBCQUEwQixJQUFJLFNBQVMsSUFBSSxJQUFJLENBQUMsMEJBQTBCLEVBQUU7Z0JBQ2hGLE1BQU0sQ0FBQyxHQUFHLE1BQU0sSUFBSSxDQUFDLDBCQUEwQixDQUFDLFlBQVksQ0FBQyxXQUFXLENBQUMsQ0FBQztnQkFDMUUsSUFBRyxDQUFDLElBQUksS0FBSztvQkFDVCxPQUFPO2FBQ2Q7WUFDRCxJQUFJLGtCQUFrQixFQUFFO2dCQUNwQixJQUFJLGFBQWEsR0FBRyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsWUFBWSxDQUFDLENBQUM7Z0JBRXhELElBQUksYUFBYSxFQUNqQjtvQkFDSSxJQUFJLENBQUMsYUFBYSxDQUFDLGFBQWEsRUFBRSxHQUFHLEVBQUUsR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7aUJBQ2hGO3FCQUVEO29CQUNJLElBQUksQ0FBQyxXQUFXLENBQUMsWUFBWSxDQUFDLENBQUM7aUJBQ2xDO2FBQ0o7aUJBQ0k7Z0JBQ0QsSUFBSSxDQUFDLFdBQVcsQ0FBQyxZQUFZLENBQUMsQ0FBQzthQUNsQztRQUNMLENBQUM7S0FBQTtJQUVELG9CQUFvQixDQUFDLE9BQStEO1FBQ2hGLE1BQU0sRUFBRSxnQkFBZ0IsRUFBRSxlQUFlLEVBQUUsR0FBRyxPQUFPLENBQUM7UUFFdEQsTUFBTSxrQkFBa0IsR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDO1FBQ2xFLElBQUksYUFBYSxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsa0JBQWtCLEdBQUcsQ0FBQyxlQUFlLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsMkJBQTJCO1FBRTlHLElBQUksQ0FBQyxhQUFhLEVBQ2xCO1lBQ0ksbUNBQW1DO1lBQ25DLGFBQWEsR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLGtCQUFrQixHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsQ0FBQztTQUMxRjtRQUVELElBQUksQ0FBQyxhQUFhLENBQUMsYUFBYSxDQUFDLENBQUM7SUFDdEMsQ0FBQztJQUVELG1CQUFtQixDQUFDLFdBQW9CO1FBQ3BDLElBQUksQ0FBQyxPQUFPLENBQUMsV0FBVyxDQUFDLFdBQVcsQ0FBQyxDQUFDO0lBQzFDLENBQUM7SUFFRCx1QkFBdUIsQ0FBQyxNQUFtQjtRQUN2QyxJQUFJLENBQUMsbUJBQW1CLEdBQUcsTUFBTSxDQUFDO0lBQ3RDLENBQUM7SUFFRCxxQkFBcUIsQ0FBQyxJQUFVO1FBQzVCLElBQUksSUFBSSxFQUNSO1lBQ0ksSUFBSSxDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQUMsQ0FBQztTQUM3QjtJQUNMLENBQUM7SUFFRCxzQkFBc0IsQ0FBQyxNQUFXO1FBQzlCLE1BQU0sWUFBWSxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLFdBQVcsQ0FBQyxFQUFFLElBQUksTUFBTSxDQUFDLENBQUM7UUFFeEUsSUFBSSxZQUFZLEVBQ2hCO1lBQ0ksSUFBSSxDQUFDLFdBQVcsQ0FBQyxZQUFZLENBQUMsQ0FBQztTQUNsQztJQUNMLENBQUM7SUFFRCxpQ0FBaUMsQ0FBQyxNQUFXO1FBQ3pDLE1BQU0sWUFBWSxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLFdBQVcsQ0FBQyxFQUFFLElBQUksTUFBTSxDQUFDLENBQUM7UUFFeEUsSUFBSSxZQUFZLEVBQ2hCO1lBQ0ksTUFBTSxVQUFVLEdBQUcsSUFBSSxDQUFDLDhCQUE4QixDQUFDLFlBQVksQ0FBQyxDQUFDO1lBRXJFLElBQUksVUFBVSxFQUFDO2dCQUNYLFVBQVUsQ0FBQyxtQkFBbUIsQ0FBQyxZQUFZLENBQUMsQ0FBQzthQUNoRDtTQUNKO0lBQ0wsQ0FBQztJQUVELDZCQUE2QixDQUFDLElBQVM7UUFDbkMsSUFBSSxDQUFDLDBCQUEwQixHQUFHLElBQUksQ0FBQztJQUMzQyxDQUFDO0NBQ0osQ0FBQTs7WUE1d0JvQyxVQUFVOztBQWMzQztJQURDLEtBQUssRUFBRTt3Q0FhUDtBQUdEO0lBREMsS0FBSyxFQUFFO3VDQUNvQjtBQUc1QjtJQURDLEtBQUssRUFBRTs0Q0FDK0I7QUFHdkM7SUFEQyxLQUFLLEVBQUU7c0NBQ1c7QUFHbkI7SUFEQyxLQUFLLEVBQUU7MkNBQzRCO0FBR3BDO0lBREMsS0FBSyxFQUFFOzBEQUMwQztBQUdsRDtJQURDLEtBQUssRUFBRTsrQ0FDZ0M7QUFHeEM7SUFEQyxLQUFLLEVBQUU7K0NBQzhCO0FBR3RDO0lBREMsS0FBSyxFQUFFOzhDQUM4QjtBQUd0QztJQURDLEtBQUssRUFBRTs2Q0FDNkI7QUFHckM7SUFEQyxLQUFLLEVBQUU7NkNBQzZCO0FBR3JDO0lBREMsS0FBSyxFQUFFOzRDQUM0QjtBQUdwQztJQURDLEtBQUssRUFBRTs2Q0FDNkI7QUFHckM7SUFEQyxLQUFLLEVBQUUsQ0FBQyxrREFBa0Q7MkNBQ21FO0FBRzlIO0lBREMsS0FBSyxFQUFFO21EQUNtQztBQUczQztJQURDLEtBQUssRUFBRTtxQ0FDeUI7QUFHakM7SUFEQyxLQUFLLEVBQUU7a0RBQzZDO0FBR3JEO0lBREMsS0FBSyxFQUFFO2lEQUNvQztBQUc1QztJQURDLEtBQUssRUFBRTsyREFDMkM7QUFHbkQ7SUFEQyxLQUFLLEVBQUUsQ0FBQyxrREFBa0Q7NkRBQ3FGO0FBR2hKO0lBREMsS0FBSyxFQUFFO3dEQUNxRDtBQUc3RDtJQURDLEtBQUssRUFBRTsrQ0FDNEI7QUFHcEM7SUFEQyxLQUFLLEVBQUU7NENBQzBCO0FBR2xDO0lBREMsS0FBSyxFQUFFOytDQUNnQztBQUd4QztJQURDLEtBQUssRUFBRTtvRUFDb0Q7QUFHNUQ7SUFEQyxLQUFLLEVBQUU7NkNBQ3FCO0FBRzdCO0lBREMsS0FBSyxFQUFFO3FDQUMwQjtBQUdsQztJQURDLEtBQUssRUFBRTsyQ0FDbUI7QUFHM0I7SUFEQyxLQUFLLEVBQUU7cURBQ3VDO0FBRy9DO0lBREMsS0FBSyxFQUFFOytDQUMrQjtBQUd2QztJQURDLEtBQUssRUFBRTt5REFDMEM7QUFLbEQ7SUFEQyxNQUFNLEVBQUU7b0RBQzBGO0FBR25HO0lBREMsTUFBTSxFQUFFO3VEQUM2RjtBQUd0RztJQURDLE1BQU0sRUFBRTt1REFDNkY7QUFHdEc7SUFEQyxNQUFNLEVBQUU7OENBQ3NFO0FBRy9FO0lBREMsTUFBTSxFQUFFO21EQUNtSztBQWlEaEo7SUFBM0IsWUFBWSxDQUFDLFlBQVksQ0FBQzsyQ0FBK0M7QUFPMUU7SUFEQyxZQUFZLENBQUMsZUFBZSxFQUFFLENBQUMsUUFBUSxDQUFDLENBQUM7c0NBS3pDO0FBbE1RLE1BQU07SUFibEIsU0FBUyxDQUFDO1FBQ1AsUUFBUSxFQUFFLFNBQVM7UUFDbkIsbXNFQUFxQztRQVFyQyxhQUFhLEVBQUUsaUJBQWlCLENBQUMsSUFBSTs7S0FDeEMsQ0FBQztHQUVXLE1BQU0sQ0E2d0JsQjtTQTd3QlksTUFBTSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IENvbXBvbmVudCwgSW5wdXQsIE9uSW5pdCwgVmlld0NoaWxkcmVuLCBRdWVyeUxpc3QsIEhvc3RMaXN0ZW5lciwgT3V0cHV0LCBFdmVudEVtaXR0ZXIsIFZpZXdFbmNhcHN1bGF0aW9uIH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQgeyBIdHRwQ2xpZW50IH0gZnJvbSAnQGFuZ3VsYXIvY29tbW9uL2h0dHAnO1xuXG5pbXBvcnQgeyBDaGF0QWRhcHRlciB9IGZyb20gJy4vY29yZS9jaGF0LWFkYXB0ZXInO1xuaW1wb3J0IHsgSUNoYXRHcm91cEFkYXB0ZXIgfSBmcm9tICcuL2NvcmUvY2hhdC1ncm91cC1hZGFwdGVyJztcbmltcG9ydCB7IFVzZXIgfSBmcm9tIFwiLi9jb3JlL3VzZXJcIjtcbmltcG9ydCB7IFBhcnRpY2lwYW50UmVzcG9uc2UgfSBmcm9tIFwiLi9jb3JlL3BhcnRpY2lwYW50LXJlc3BvbnNlXCI7XG5pbXBvcnQgeyBNZXNzYWdlIH0gZnJvbSBcIi4vY29yZS9tZXNzYWdlXCI7XG5pbXBvcnQgeyBNZXNzYWdlVHlwZSB9IGZyb20gXCIuL2NvcmUvbWVzc2FnZS10eXBlLmVudW1cIjtcbmltcG9ydCB7IFdpbmRvdyB9IGZyb20gXCIuL2NvcmUvd2luZG93XCI7XG5pbXBvcnQgeyBDaGF0UGFydGljaXBhbnRTdGF0dXMgfSBmcm9tIFwiLi9jb3JlL2NoYXQtcGFydGljaXBhbnQtc3RhdHVzLmVudW1cIjtcbmltcG9ydCB7IFNjcm9sbERpcmVjdGlvbiB9IGZyb20gXCIuL2NvcmUvc2Nyb2xsLWRpcmVjdGlvbi5lbnVtXCI7XG5pbXBvcnQgeyBMb2NhbGl6YXRpb24sIFN0YXR1c0Rlc2NyaXB0aW9uIH0gZnJvbSAnLi9jb3JlL2xvY2FsaXphdGlvbic7XG5pbXBvcnQgeyBJQ2hhdENvbnRyb2xsZXIgfSBmcm9tICcuL2NvcmUvY2hhdC1jb250cm9sbGVyJztcbmltcG9ydCB7IFBhZ2VkSGlzdG9yeUNoYXRBZGFwdGVyIH0gZnJvbSAnLi9jb3JlL3BhZ2VkLWhpc3RvcnktY2hhdC1hZGFwdGVyJztcbmltcG9ydCB7IElGaWxlVXBsb2FkQWRhcHRlciB9IGZyb20gJy4vY29yZS9maWxlLXVwbG9hZC1hZGFwdGVyJztcbmltcG9ydCB7IERlZmF1bHRGaWxlVXBsb2FkQWRhcHRlciB9IGZyb20gJy4vY29yZS9kZWZhdWx0LWZpbGUtdXBsb2FkLWFkYXB0ZXInO1xuaW1wb3J0IHsgVGhlbWUgfSBmcm9tICcuL2NvcmUvdGhlbWUuZW51bSc7XG5pbXBvcnQgeyBJQ2hhdE9wdGlvbiB9IGZyb20gJy4vY29yZS9jaGF0LW9wdGlvbic7XG5pbXBvcnQgeyBHcm91cCB9IGZyb20gXCIuL2NvcmUvZ3JvdXBcIjtcbmltcG9ydCB7IENoYXRQYXJ0aWNpcGFudFR5cGUgfSBmcm9tIFwiLi9jb3JlL2NoYXQtcGFydGljaXBhbnQtdHlwZS5lbnVtXCI7XG5pbXBvcnQgeyBJQ2hhdFBhcnRpY2lwYW50IH0gZnJvbSBcIi4vY29yZS9jaGF0LXBhcnRpY2lwYW50XCI7XG5cbmltcG9ydCB7IG1hcCB9IGZyb20gJ3J4anMvb3BlcmF0b3JzJztcbmltcG9ydCB7IE5nQ2hhdFdpbmRvd0NvbXBvbmVudCB9IGZyb20gJy4vY29tcG9uZW50cy9uZy1jaGF0LXdpbmRvdy9uZy1jaGF0LXdpbmRvdy5jb21wb25lbnQnO1xuXG5AQ29tcG9uZW50KHtcbiAgICBzZWxlY3RvcjogJ25nLWNoYXQnLFxuICAgIHRlbXBsYXRlVXJsOiAnbmctY2hhdC5jb21wb25lbnQuaHRtbCcsXG4gICAgc3R5bGVVcmxzOiBbXG4gICAgICAgICdhc3NldHMvaWNvbnMuY3NzJyxcbiAgICAgICAgJ2Fzc2V0cy9sb2FkaW5nLXNwaW5uZXIuY3NzJyxcbiAgICAgICAgJ2Fzc2V0cy9uZy1jaGF0LmNvbXBvbmVudC5kZWZhdWx0LmNzcycsXG4gICAgICAgICdhc3NldHMvdGhlbWVzL25nLWNoYXQudGhlbWUuZGVmYXVsdC5zY3NzJyxcbiAgICAgICAgJ2Fzc2V0cy90aGVtZXMvbmctY2hhdC50aGVtZS5kYXJrLnNjc3MnXG4gICAgXSxcbiAgICBlbmNhcHN1bGF0aW9uOiBWaWV3RW5jYXBzdWxhdGlvbi5Ob25lXG59KVxuXG5leHBvcnQgY2xhc3MgTmdDaGF0IGltcGxlbWVudHMgT25Jbml0LCBJQ2hhdENvbnRyb2xsZXIge1xuICAgIGNvbnN0cnVjdG9yKHByaXZhdGUgX2h0dHBDbGllbnQ6IEh0dHBDbGllbnQpIHsgfVxuXG4gICAgLy8gRXhwb3NlcyBlbnVtcyBmb3IgdGhlIG5nLXRlbXBsYXRlXG4gICAgcHVibGljIENoYXRQYXJ0aWNpcGFudFR5cGUgPSBDaGF0UGFydGljaXBhbnRUeXBlO1xuICAgIHB1YmxpYyBDaGF0UGFydGljaXBhbnRTdGF0dXMgPSBDaGF0UGFydGljaXBhbnRTdGF0dXM7XG4gICAgcHVibGljIE1lc3NhZ2VUeXBlID0gTWVzc2FnZVR5cGU7XG5cbiAgICBwcml2YXRlIF9pc0Rpc2FibGVkOiBib29sZWFuID0gZmFsc2U7XG5cbiAgICBnZXQgaXNEaXNhYmxlZCgpOiBib29sZWFuIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2lzRGlzYWJsZWQ7XG4gICAgfVxuICAgICAgXG4gICAgQElucHV0KClcbiAgICBzZXQgaXNEaXNhYmxlZCh2YWx1ZTogYm9vbGVhbikge1xuICAgICAgICB0aGlzLl9pc0Rpc2FibGVkID0gdmFsdWU7XG5cbiAgICAgICAgaWYgKHZhbHVlKVxuICAgICAgICB7XG4gICAgICAgICAgICAvLyBUbyBhZGRyZXNzIGlzc3VlIGh0dHBzOi8vZ2l0aHViLmNvbS9ycGFzY2hvYWwvbmctY2hhdC9pc3N1ZXMvMTIwXG4gICAgICAgICAgICB3aW5kb3cuY2xlYXJJbnRlcnZhbCh0aGlzLnBvbGxpbmdJbnRlcnZhbFdpbmRvd0luc3RhbmNlKVxuICAgICAgICB9XG4gICAgICAgIGVsc2VcbiAgICAgICAge1xuICAgICAgICAgICAgdGhpcy5hY3RpdmF0ZUZyaWVuZExpc3RGZXRjaCgpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgQElucHV0KClcbiAgICBwdWJsaWMgYWRhcHRlcjogQ2hhdEFkYXB0ZXI7XG5cbiAgICBASW5wdXQoKVxuICAgIHB1YmxpYyBncm91cEFkYXB0ZXI6IElDaGF0R3JvdXBBZGFwdGVyO1xuXG4gICAgQElucHV0KClcbiAgICBwdWJsaWMgdXNlcklkOiBhbnk7XG5cbiAgICBASW5wdXQoKVxuICAgIHB1YmxpYyBpc0NvbGxhcHNlZDogYm9vbGVhbiA9IGZhbHNlO1xuXG4gICAgQElucHV0KClcbiAgICBwdWJsaWMgbWF4aW1pemVXaW5kb3dPbk5ld01lc3NhZ2U6IGJvb2xlYW4gPSB0cnVlO1xuXG4gICAgQElucHV0KCkgICAgXG4gICAgcHVibGljIHBvbGxGcmllbmRzTGlzdDogYm9vbGVhbiA9IGZhbHNlO1xuXG4gICAgQElucHV0KClcbiAgICBwdWJsaWMgcG9sbGluZ0ludGVydmFsOiBudW1iZXIgPSA1MDAwO1xuXG4gICAgQElucHV0KCkgICAgXG4gICAgcHVibGljIGhpc3RvcnlFbmFibGVkOiBib29sZWFuID0gdHJ1ZTtcblxuICAgIEBJbnB1dCgpICAgIFxuICAgIHB1YmxpYyBlbW9qaXNFbmFibGVkOiBib29sZWFuID0gdHJ1ZTtcblxuICAgIEBJbnB1dCgpICAgIFxuICAgIHB1YmxpYyBsaW5rZnlFbmFibGVkOiBib29sZWFuID0gdHJ1ZTtcblxuICAgIEBJbnB1dCgpXG4gICAgcHVibGljIGF1ZGlvRW5hYmxlZDogYm9vbGVhbiA9IHRydWU7XG5cbiAgICBASW5wdXQoKVxuICAgIHB1YmxpYyBzZWFyY2hFbmFibGVkOiBib29sZWFuID0gdHJ1ZTtcblxuICAgIEBJbnB1dCgpIC8vIFRPRE86IFRoaXMgbWlnaHQgbmVlZCBhIGJldHRlciBjb250ZW50IHN0cmF0ZWd5XG4gICAgcHVibGljIGF1ZGlvU291cmNlOiBzdHJpbmcgPSAnaHR0cHM6Ly9yYXcuZ2l0aHVidXNlcmNvbnRlbnQuY29tL3JwYXNjaG9hbC9uZy1jaGF0L21hc3Rlci9zcmMvbmctY2hhdC9hc3NldHMvbm90aWZpY2F0aW9uLndhdic7XG5cbiAgICBASW5wdXQoKVxuICAgIHB1YmxpYyBwZXJzaXN0V2luZG93c1N0YXRlOiBib29sZWFuID0gdHJ1ZTtcblxuICAgIEBJbnB1dCgpXG4gICAgcHVibGljIHRpdGxlOiBzdHJpbmcgPSBcIkZyaWVuZHNcIjtcblxuICAgIEBJbnB1dCgpXG4gICAgcHVibGljIG1lc3NhZ2VQbGFjZWhvbGRlcjogc3RyaW5nID0gXCJUeXBlIGEgbWVzc2FnZVwiO1xuXG4gICAgQElucHV0KClcbiAgICBwdWJsaWMgc2VhcmNoUGxhY2Vob2xkZXI6IHN0cmluZyA9IFwiU2VhcmNoXCI7XG5cbiAgICBASW5wdXQoKVxuICAgIHB1YmxpYyBicm93c2VyTm90aWZpY2F0aW9uc0VuYWJsZWQ6IGJvb2xlYW4gPSB0cnVlO1xuXG4gICAgQElucHV0KCkgLy8gVE9ETzogVGhpcyBtaWdodCBuZWVkIGEgYmV0dGVyIGNvbnRlbnQgc3RyYXRlZ3lcbiAgICBwdWJsaWMgYnJvd3Nlck5vdGlmaWNhdGlvbkljb25Tb3VyY2U6IHN0cmluZyA9ICdodHRwczovL3Jhdy5naXRodWJ1c2VyY29udGVudC5jb20vcnBhc2Nob2FsL25nLWNoYXQvbWFzdGVyL3NyYy9uZy1jaGF0L2Fzc2V0cy9ub3RpZmljYXRpb24ucG5nJztcblxuICAgIEBJbnB1dCgpXG4gICAgcHVibGljIGJyb3dzZXJOb3RpZmljYXRpb25UaXRsZTogc3RyaW5nID0gXCJOZXcgbWVzc2FnZSBmcm9tXCI7XG4gICAgXG4gICAgQElucHV0KClcbiAgICBwdWJsaWMgaGlzdG9yeVBhZ2VTaXplOiBudW1iZXIgPSAxMDtcblxuICAgIEBJbnB1dCgpXG4gICAgcHVibGljIGxvY2FsaXphdGlvbjogTG9jYWxpemF0aW9uO1xuXG4gICAgQElucHV0KClcbiAgICBwdWJsaWMgaGlkZUZyaWVuZHNMaXN0OiBib29sZWFuID0gZmFsc2U7XG5cbiAgICBASW5wdXQoKVxuICAgIHB1YmxpYyBoaWRlRnJpZW5kc0xpc3RPblVuc3VwcG9ydGVkVmlld3BvcnQ6IGJvb2xlYW4gPSB0cnVlO1xuXG4gICAgQElucHV0KClcbiAgICBwdWJsaWMgZmlsZVVwbG9hZFVybDogc3RyaW5nO1xuXG4gICAgQElucHV0KClcbiAgICBwdWJsaWMgdGhlbWU6IFRoZW1lID0gVGhlbWUuTGlnaHQ7XG5cbiAgICBASW5wdXQoKVxuICAgIHB1YmxpYyBjdXN0b21UaGVtZTogc3RyaW5nO1xuXG4gICAgQElucHV0KClcbiAgICBwdWJsaWMgbWVzc2FnZURhdGVQaXBlRm9ybWF0OiBzdHJpbmcgPSBcInNob3J0XCI7XG5cbiAgICBASW5wdXQoKVxuICAgIHB1YmxpYyBzaG93TWVzc2FnZURhdGU6IGJvb2xlYW4gPSB0cnVlO1xuICAgIFxuICAgIEBJbnB1dCgpXG4gICAgcHVibGljIGlzVmlld3BvcnRPbk1vYmlsZUVuYWJsZWQ6IGJvb2xlYW4gPSBmYWxzZTtcblxuICAgIHB1YmxpYyBiZWZvcmVQYXJ0ZWNpYW50Q2hhdENsb3NlZDogKGFyZzA6IElDaGF0UGFydGljaXBhbnQpID0+IGJvb2xlYW47XG4gICAgIFxuICAgIEBPdXRwdXQoKVxuICAgIHB1YmxpYyBvblBhcnRpY2lwYW50Q2xpY2tlZDogRXZlbnRFbWl0dGVyPElDaGF0UGFydGljaXBhbnQ+ID0gbmV3IEV2ZW50RW1pdHRlcjxJQ2hhdFBhcnRpY2lwYW50PigpO1xuXG4gICAgQE91dHB1dCgpXG4gICAgcHVibGljIG9uUGFydGljaXBhbnRDaGF0T3BlbmVkOiBFdmVudEVtaXR0ZXI8SUNoYXRQYXJ0aWNpcGFudD4gPSBuZXcgRXZlbnRFbWl0dGVyPElDaGF0UGFydGljaXBhbnQ+KCk7XG5cbiAgICBAT3V0cHV0KClcbiAgICBwdWJsaWMgb25QYXJ0aWNpcGFudENoYXRDbG9zZWQ6IEV2ZW50RW1pdHRlcjxJQ2hhdFBhcnRpY2lwYW50PiA9IG5ldyBFdmVudEVtaXR0ZXI8SUNoYXRQYXJ0aWNpcGFudD4oKTtcbiAgICBcbiAgICBAT3V0cHV0KClcbiAgICBwdWJsaWMgb25NZXNzYWdlc1NlZW46IEV2ZW50RW1pdHRlcjxNZXNzYWdlW10+ID0gbmV3IEV2ZW50RW1pdHRlcjxNZXNzYWdlW10+KCk7XG5cbiAgICBAT3V0cHV0KClcbiAgICBwdWJsaWMgb25QYXJ0aWNpcGFudFRvZ2dsZTogRXZlbnRFbWl0dGVyPHtwYXJ0aWNpcGFudDogSUNoYXRQYXJ0aWNpcGFudCwgaXNDb2xsYXBzZWQ6IGJvb2xlYW59PiA9IG5ldyBFdmVudEVtaXR0ZXI8e3BhcnRpY2lwYW50OiBJQ2hhdFBhcnRpY2lwYW50LCBpc0NvbGxhcHNlZDogYm9vbGVhbn0+KCk7XG5cbiAgICBwcml2YXRlIGJyb3dzZXJOb3RpZmljYXRpb25zQm9vdHN0cmFwcGVkOiBib29sZWFuID0gZmFsc2U7XG5cbiAgICBwdWJsaWMgaGFzUGFnZWRIaXN0b3J5OiBib29sZWFuID0gZmFsc2U7XG5cbiAgICAvLyBEb24ndCB3YW50IHRvIGFkZCB0aGlzIGFzIGEgc2V0dGluZyB0byBzaW1wbGlmeSB1c2FnZS4gUHJldmlvdXMgcGxhY2Vob2xkZXIgYW5kIHRpdGxlIHNldHRpbmdzIGF2YWlsYWJsZSB0byBiZSB1c2VkLCBvciB1c2UgZnVsbCBMb2NhbGl6YXRpb24gb2JqZWN0LlxuICAgIHByaXZhdGUgc3RhdHVzRGVzY3JpcHRpb246IFN0YXR1c0Rlc2NyaXB0aW9uID0ge1xuICAgICAgICBvbmxpbmU6ICdPbmxpbmUnLFxuICAgICAgICBidXN5OiAnQnVzeScsXG4gICAgICAgIGF3YXk6ICdBd2F5JyxcbiAgICAgICAgb2ZmbGluZTogJ09mZmxpbmUnXG4gICAgfTtcblxuICAgIHByaXZhdGUgYXVkaW9GaWxlOiBIVE1MQXVkaW9FbGVtZW50O1xuXG4gICAgcHVibGljIHBhcnRpY2lwYW50czogSUNoYXRQYXJ0aWNpcGFudFtdO1xuXG4gICAgcHVibGljIHBhcnRpY2lwYW50c1Jlc3BvbnNlOiBQYXJ0aWNpcGFudFJlc3BvbnNlW107XG5cbiAgICBwdWJsaWMgcGFydGljaXBhbnRzSW50ZXJhY3RlZFdpdGg6IElDaGF0UGFydGljaXBhbnRbXSA9IFtdO1xuXG4gICAgcHVibGljIGN1cnJlbnRBY3RpdmVPcHRpb246IElDaGF0T3B0aW9uIHwgbnVsbDtcblxuICAgIHByaXZhdGUgcG9sbGluZ0ludGVydmFsV2luZG93SW5zdGFuY2U6IG51bWJlcjtcblxuICAgIHByaXZhdGUgZ2V0IGxvY2FsU3RvcmFnZUtleSgpOiBzdHJpbmcgXG4gICAge1xuICAgICAgICByZXR1cm4gYG5nLWNoYXQtdXNlcnMtJHt0aGlzLnVzZXJJZH1gOyAvLyBBcHBlbmRpbmcgdGhlIHVzZXIgaWQgc28gdGhlIHN0YXRlIGlzIHVuaXF1ZSBwZXIgdXNlciBpbiBhIGNvbXB1dGVyLiAgIFxuICAgIH07XG5cbiAgICAvLyBEZWZpbmVzIHRoZSBzaXplIG9mIGVhY2ggb3BlbmVkIHdpbmRvdyB0byBjYWxjdWxhdGUgaG93IG1hbnkgd2luZG93cyBjYW4gYmUgb3BlbmVkIG9uIHRoZSB2aWV3cG9ydCBhdCB0aGUgc2FtZSB0aW1lLlxuICAgIHB1YmxpYyB3aW5kb3dTaXplRmFjdG9yOiBudW1iZXIgPSAzMjA7XG5cbiAgICAvLyBUb3RhbCB3aWR0aCBzaXplIG9mIHRoZSBmcmllbmRzIGxpc3Qgc2VjdGlvblxuICAgIHB1YmxpYyBmcmllbmRzTGlzdFdpZHRoOiBudW1iZXIgPSAyNjI7XG5cbiAgICAvLyBBdmFpbGFibGUgYXJlYSB0byByZW5kZXIgdGhlIHBsdWdpblxuICAgIHByaXZhdGUgdmlld1BvcnRUb3RhbEFyZWE6IG51bWJlcjtcbiAgICBcbiAgICAvLyBTZXQgdG8gdHJ1ZSBpZiB0aGVyZSBpcyBubyBzcGFjZSB0byBkaXNwbGF5IGF0IGxlYXN0IG9uZSBjaGF0IHdpbmRvdyBhbmQgJ2hpZGVGcmllbmRzTGlzdE9uVW5zdXBwb3J0ZWRWaWV3cG9ydCcgaXMgdHJ1ZVxuICAgIHB1YmxpYyB1bnN1cHBvcnRlZFZpZXdwb3J0OiBib29sZWFuID0gZmFsc2U7XG5cbiAgICAvLyBGaWxlIHVwbG9hZCBhZGFwdGVyXG4gICAgcHVibGljIGZpbGVVcGxvYWRBZGFwdGVyOiBJRmlsZVVwbG9hZEFkYXB0ZXI7XG5cbiAgICB3aW5kb3dzOiBXaW5kb3dbXSA9IFtdO1xuICAgIGlzQm9vdHN0cmFwcGVkOiBib29sZWFuID0gZmFsc2U7XG5cbiAgICBAVmlld0NoaWxkcmVuKCdjaGF0V2luZG93JykgY2hhdFdpbmRvd3M6IFF1ZXJ5TGlzdDxOZ0NoYXRXaW5kb3dDb21wb25lbnQ+O1xuXG4gICAgbmdPbkluaXQoKSB7IFxuICAgICAgICB0aGlzLmJvb3RzdHJhcENoYXQoKTtcbiAgICB9XG5cbiAgICBASG9zdExpc3RlbmVyKCd3aW5kb3c6cmVzaXplJywgWyckZXZlbnQnXSlcbiAgICBvblJlc2l6ZShldmVudDogYW55KXtcbiAgICAgICB0aGlzLnZpZXdQb3J0VG90YWxBcmVhID0gZXZlbnQudGFyZ2V0LmlubmVyV2lkdGg7XG5cbiAgICAgICB0aGlzLk5vcm1hbGl6ZVdpbmRvd3MoKTtcbiAgICB9XG5cbiAgICAvLyBDaGVja3MgaWYgdGhlcmUgYXJlIG1vcmUgb3BlbmVkIHdpbmRvd3MgdGhhbiB0aGUgdmlldyBwb3J0IGNhbiBkaXNwbGF5XG4gICAgcHJpdmF0ZSBOb3JtYWxpemVXaW5kb3dzKCk6IHZvaWRcbiAgICB7XG4gICAgICAgIGNvbnN0IG1heFN1cHBvcnRlZE9wZW5lZFdpbmRvd3MgPSBNYXRoLmZsb29yKCh0aGlzLnZpZXdQb3J0VG90YWxBcmVhIC0gKCF0aGlzLmhpZGVGcmllbmRzTGlzdCA/IHRoaXMuZnJpZW5kc0xpc3RXaWR0aCA6IDApKSAvIHRoaXMud2luZG93U2l6ZUZhY3Rvcik7XG4gICAgICAgIGNvbnN0IGRpZmZlcmVuY2UgPSB0aGlzLndpbmRvd3MubGVuZ3RoIC0gbWF4U3VwcG9ydGVkT3BlbmVkV2luZG93cztcblxuICAgICAgICBpZiAoZGlmZmVyZW5jZSA+PSAwKVxuICAgICAgICB7XG4gICAgICAgICAgICB0aGlzLndpbmRvd3Muc3BsaWNlKHRoaXMud2luZG93cy5sZW5ndGggLSBkaWZmZXJlbmNlKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMudXBkYXRlV2luZG93c1N0YXRlKHRoaXMud2luZG93cyk7XG5cbiAgICAgICAgLy8gVmlld3BvcnQgc2hvdWxkIGhhdmUgc3BhY2UgZm9yIGF0IGxlYXN0IG9uZSBjaGF0IHdpbmRvdyBidXQgc2hvdWxkIHNob3cgaW4gbW9iaWxlIGlmIG9wdGlvbiBpcyBlbmFibGVkLlxuICAgICAgICB0aGlzLnVuc3VwcG9ydGVkVmlld3BvcnQgPSB0aGlzLmlzVmlld3BvcnRPbk1vYmlsZUVuYWJsZWQ/IGZhbHNlIDogdGhpcy5oaWRlRnJpZW5kc0xpc3RPblVuc3VwcG9ydGVkVmlld3BvcnQgJiYgbWF4U3VwcG9ydGVkT3BlbmVkV2luZG93cyA8IDE7XG4gICAgfVxuXG4gICAgLy8gSW5pdGlhbGl6ZXMgdGhlIGNoYXQgcGx1Z2luIGFuZCB0aGUgbWVzc2FnaW5nIGFkYXB0ZXJcbiAgICBwcml2YXRlIGJvb3RzdHJhcENoYXQoKTogdm9pZFxuICAgIHtcbiAgICAgICAgbGV0IGluaXRpYWxpemF0aW9uRXhjZXB0aW9uID0gbnVsbDtcblxuICAgICAgICBpZiAodGhpcy5hZGFwdGVyICE9IG51bGwgJiYgdGhpcy51c2VySWQgIT0gbnVsbClcbiAgICAgICAge1xuICAgICAgICAgICAgdHJ5XG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgdGhpcy52aWV3UG9ydFRvdGFsQXJlYSA9IHdpbmRvdy5pbm5lcldpZHRoO1xuXG4gICAgICAgICAgICAgICAgdGhpcy5pbml0aWFsaXplVGhlbWUoKTtcbiAgICAgICAgICAgICAgICB0aGlzLmluaXRpYWxpemVEZWZhdWx0VGV4dCgpO1xuICAgICAgICAgICAgICAgIHRoaXMuaW5pdGlhbGl6ZUJyb3dzZXJOb3RpZmljYXRpb25zKCk7XG5cbiAgICAgICAgICAgICAgICAvLyBCaW5kaW5nIGV2ZW50IGxpc3RlbmVyc1xuICAgICAgICAgICAgICAgIHRoaXMuYWRhcHRlci5tZXNzYWdlUmVjZWl2ZWRIYW5kbGVyID0gKHBhcnRpY2lwYW50LCBtc2cpID0+IHRoaXMub25NZXNzYWdlUmVjZWl2ZWQocGFydGljaXBhbnQsIG1zZyk7XG4gICAgICAgICAgICAgICAgdGhpcy5hZGFwdGVyLmZyaWVuZHNMaXN0Q2hhbmdlZEhhbmRsZXIgPSAocGFydGljaXBhbnRzUmVzcG9uc2UpID0+IHRoaXMub25GcmllbmRzTGlzdENoYW5nZWQocGFydGljaXBhbnRzUmVzcG9uc2UpO1xuXG4gICAgICAgICAgICAgICAgdGhpcy5hY3RpdmF0ZUZyaWVuZExpc3RGZXRjaCgpO1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIHRoaXMuYnVmZmVyQXVkaW9GaWxlKCk7XG5cbiAgICAgICAgICAgICAgICB0aGlzLmhhc1BhZ2VkSGlzdG9yeSA9IHRoaXMuYWRhcHRlciBpbnN0YW5jZW9mIFBhZ2VkSGlzdG9yeUNoYXRBZGFwdGVyO1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIGlmICh0aGlzLmZpbGVVcGxvYWRVcmwgJiYgdGhpcy5maWxlVXBsb2FkVXJsICE9PSBcIlwiKVxuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5maWxlVXBsb2FkQWRhcHRlciA9IG5ldyBEZWZhdWx0RmlsZVVwbG9hZEFkYXB0ZXIodGhpcy5maWxlVXBsb2FkVXJsLCB0aGlzLl9odHRwQ2xpZW50KTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICB0aGlzLk5vcm1hbGl6ZVdpbmRvd3MoKTtcblxuICAgICAgICAgICAgICAgIHRoaXMuaXNCb290c3RyYXBwZWQgPSB0cnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY2F0Y2goZXgpXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgaW5pdGlhbGl6YXRpb25FeGNlcHRpb24gPSBleDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGlmICghdGhpcy5pc0Jvb3RzdHJhcHBlZCl7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKFwibmctY2hhdCBjb21wb25lbnQgY291bGRuJ3QgYmUgYm9vdHN0cmFwcGVkLlwiKTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgaWYgKHRoaXMudXNlcklkID09IG51bGwpe1xuICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoXCJuZy1jaGF0IGNhbid0IGJlIGluaXRpYWxpemVkIHdpdGhvdXQgYW4gdXNlciBpZC4gUGxlYXNlIG1ha2Ugc3VyZSB5b3UndmUgcHJvdmlkZWQgYW4gdXNlcklkIGFzIGEgcGFyYW1ldGVyIG9mIHRoZSBuZy1jaGF0IGNvbXBvbmVudC5cIik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAodGhpcy5hZGFwdGVyID09IG51bGwpe1xuICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoXCJuZy1jaGF0IGNhbid0IGJlIGJvb3RzdHJhcHBlZCB3aXRob3V0IGEgQ2hhdEFkYXB0ZXIuIFBsZWFzZSBtYWtlIHN1cmUgeW91J3ZlIHByb3ZpZGVkIGEgQ2hhdEFkYXB0ZXIgaW1wbGVtZW50YXRpb24gYXMgYSBwYXJhbWV0ZXIgb2YgdGhlIG5nLWNoYXQgY29tcG9uZW50LlwiKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChpbml0aWFsaXphdGlvbkV4Y2VwdGlvbilcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKGBBbiBleGNlcHRpb24gaGFzIG9jY3VycmVkIHdoaWxlIGluaXRpYWxpemluZyBuZy1jaGF0LiBEZXRhaWxzOiAke2luaXRpYWxpemF0aW9uRXhjZXB0aW9uLm1lc3NhZ2V9YCk7XG4gICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcihpbml0aWFsaXphdGlvbkV4Y2VwdGlvbik7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwcml2YXRlIGFjdGl2YXRlRnJpZW5kTGlzdEZldGNoKCk6IHZvaWQge1xuICAgICAgICBpZiAodGhpcy5hZGFwdGVyKVxuICAgICAgICB7XG4gICAgICAgICAgICAvLyBMb2FkaW5nIGN1cnJlbnQgdXNlcnMgbGlzdFxuICAgICAgICAgICAgaWYgKHRoaXMucG9sbEZyaWVuZHNMaXN0KXtcbiAgICAgICAgICAgICAgICAvLyBTZXR0aW5nIGEgbG9uZyBwb2xsIGludGVydmFsIHRvIHVwZGF0ZSB0aGUgZnJpZW5kcyBsaXN0XG4gICAgICAgICAgICAgICAgdGhpcy5mZXRjaEZyaWVuZHNMaXN0KHRydWUpO1xuICAgICAgICAgICAgICAgIHRoaXMucG9sbGluZ0ludGVydmFsV2luZG93SW5zdGFuY2UgPSB3aW5kb3cuc2V0SW50ZXJ2YWwoKCkgPT4gdGhpcy5mZXRjaEZyaWVuZHNMaXN0KGZhbHNlKSwgdGhpcy5wb2xsaW5nSW50ZXJ2YWwpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIC8vIFNpbmNlIHBvbGxpbmcgd2FzIGRpc2FibGVkLCBhIGZyaWVuZHMgbGlzdCB1cGRhdGUgbWVjaGFuaXNtIHdpbGwgaGF2ZSB0byBiZSBpbXBsZW1lbnRlZCBpbiB0aGUgQ2hhdEFkYXB0ZXIuXG4gICAgICAgICAgICAgICAgdGhpcy5mZXRjaEZyaWVuZHNMaXN0KHRydWUpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgLy8gSW5pdGlhbGl6ZXMgYnJvd3NlciBub3RpZmljYXRpb25zXG4gICAgcHJpdmF0ZSBhc3luYyBpbml0aWFsaXplQnJvd3Nlck5vdGlmaWNhdGlvbnMoKVxuICAgIHtcbiAgICAgICAgaWYgKHRoaXMuYnJvd3Nlck5vdGlmaWNhdGlvbnNFbmFibGVkICYmIChcIk5vdGlmaWNhdGlvblwiIGluIHdpbmRvdykpXG4gICAgICAgIHtcbiAgICAgICAgICAgIGlmIChhd2FpdCBOb3RpZmljYXRpb24ucmVxdWVzdFBlcm1pc3Npb24oKSA9PT0gXCJncmFudGVkXCIpXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgdGhpcy5icm93c2VyTm90aWZpY2F0aW9uc0Jvb3RzdHJhcHBlZCA9IHRydWU7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBJbml0aWFsaXplcyBkZWZhdWx0IHRleHRcbiAgICBwcml2YXRlIGluaXRpYWxpemVEZWZhdWx0VGV4dCgpIDogdm9pZFxuICAgIHtcbiAgICAgICAgaWYgKCF0aGlzLmxvY2FsaXphdGlvbilcbiAgICAgICAge1xuICAgICAgICAgICAgdGhpcy5sb2NhbGl6YXRpb24gPSB7XG4gICAgICAgICAgICAgICAgbWVzc2FnZVBsYWNlaG9sZGVyOiB0aGlzLm1lc3NhZ2VQbGFjZWhvbGRlcixcbiAgICAgICAgICAgICAgICBzZWFyY2hQbGFjZWhvbGRlcjogdGhpcy5zZWFyY2hQbGFjZWhvbGRlciwgXG4gICAgICAgICAgICAgICAgdGl0bGU6IHRoaXMudGl0bGUsXG4gICAgICAgICAgICAgICAgc3RhdHVzRGVzY3JpcHRpb246IHRoaXMuc3RhdHVzRGVzY3JpcHRpb24sXG4gICAgICAgICAgICAgICAgYnJvd3Nlck5vdGlmaWNhdGlvblRpdGxlOiB0aGlzLmJyb3dzZXJOb3RpZmljYXRpb25UaXRsZSxcbiAgICAgICAgICAgICAgICBsb2FkTWVzc2FnZUhpc3RvcnlQbGFjZWhvbGRlcjogXCJMb2FkIG9sZGVyIG1lc3NhZ2VzXCJcbiAgICAgICAgICAgIH07XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwcml2YXRlIGluaXRpYWxpemVUaGVtZSgpOiB2b2lkXG4gICAge1xuICAgICAgICBpZiAodGhpcy5jdXN0b21UaGVtZSlcbiAgICAgICAge1xuICAgICAgICAgICAgdGhpcy50aGVtZSA9IFRoZW1lLkN1c3RvbTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmICh0aGlzLnRoZW1lICE9IFRoZW1lLkxpZ2h0ICYmIHRoaXMudGhlbWUgIT0gVGhlbWUuRGFyaylcbiAgICAgICAge1xuICAgICAgICAgICAgLy8gVE9ETzogVXNlIGVzMjAxNyBpbiBmdXR1cmUgd2l0aCBPYmplY3QudmFsdWVzKFRoZW1lKS5pbmNsdWRlcyh0aGlzLnRoZW1lKSB0byBkbyB0aGlzIGNoZWNrXG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYEludmFsaWQgdGhlbWUgY29uZmlndXJhdGlvbiBmb3IgbmctY2hhdC4gXCIke3RoaXMudGhlbWV9XCIgaXMgbm90IGEgdmFsaWQgdGhlbWUgdmFsdWUuYCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBTZW5kcyBhIHJlcXVlc3QgdG8gbG9hZCB0aGUgZnJpZW5kcyBsaXN0XG4gICAgcHVibGljIGZldGNoRnJpZW5kc0xpc3QoaXNCb290c3RyYXBwaW5nOiBib29sZWFuKTogdm9pZFxuICAgIHtcbiAgICAgICAgdGhpcy5hZGFwdGVyLmxpc3RGcmllbmRzKClcbiAgICAgICAgLnBpcGUoXG4gICAgICAgICAgICBtYXAoKHBhcnRpY2lwYW50c1Jlc3BvbnNlOiBQYXJ0aWNpcGFudFJlc3BvbnNlW10pID0+IHtcbiAgICAgICAgICAgICAgICB0aGlzLnBhcnRpY2lwYW50c1Jlc3BvbnNlID0gcGFydGljaXBhbnRzUmVzcG9uc2U7XG5cbiAgICAgICAgICAgICAgICB0aGlzLnBhcnRpY2lwYW50cyA9IHBhcnRpY2lwYW50c1Jlc3BvbnNlLm1hcCgocmVzcG9uc2U6IFBhcnRpY2lwYW50UmVzcG9uc2UpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHJlc3BvbnNlLnBhcnRpY2lwYW50O1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSlcbiAgICAgICAgKS5zdWJzY3JpYmUoKCkgPT4ge1xuICAgICAgICAgICAgaWYgKGlzQm9vdHN0cmFwcGluZylcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICB0aGlzLnJlc3RvcmVXaW5kb3dzU3RhdGUoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgZmV0Y2hNZXNzYWdlSGlzdG9yeSh3aW5kb3c6IFdpbmRvdykge1xuICAgICAgICAvLyBOb3QgaWRlYWwgYnV0IHdpbGwga2VlcCB0aGlzIHVudGlsIHdlIGRlY2lkZSBpZiB3ZSBhcmUgc2hpcHBpbmcgcGFnaW5hdGlvbiB3aXRoIHRoZSBkZWZhdWx0IGFkYXB0ZXJcbiAgICAgICAgaWYgKHRoaXMuYWRhcHRlciBpbnN0YW5jZW9mIFBhZ2VkSGlzdG9yeUNoYXRBZGFwdGVyKVxuICAgICAgICB7XG4gICAgICAgICAgICB3aW5kb3cuaXNMb2FkaW5nSGlzdG9yeSA9IHRydWU7XG5cbiAgICAgICAgICAgIHRoaXMuYWRhcHRlci5nZXRNZXNzYWdlSGlzdG9yeUJ5UGFnZSh3aW5kb3cucGFydGljaXBhbnQuaWQsIHRoaXMuaGlzdG9yeVBhZ2VTaXplLCArK3dpbmRvdy5oaXN0b3J5UGFnZSlcbiAgICAgICAgICAgIC5waXBlKFxuICAgICAgICAgICAgICAgIG1hcCgocmVzdWx0OiBNZXNzYWdlW10pID0+IHtcbiAgICAgICAgICAgICAgICAgICAgcmVzdWx0LmZvckVhY2goKG1lc3NhZ2UpID0+IHRoaXMuYXNzZXJ0TWVzc2FnZVR5cGUobWVzc2FnZSkpO1xuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgd2luZG93Lm1lc3NhZ2VzID0gcmVzdWx0LmNvbmNhdCh3aW5kb3cubWVzc2FnZXMpO1xuICAgICAgICAgICAgICAgICAgICB3aW5kb3cuaXNMb2FkaW5nSGlzdG9yeSA9IGZhbHNlO1xuICAgIFxuICAgICAgICAgICAgICAgICAgICBjb25zdCBkaXJlY3Rpb246IFNjcm9sbERpcmVjdGlvbiA9ICh3aW5kb3cuaGlzdG9yeVBhZ2UgPT0gMSkgPyBTY3JvbGxEaXJlY3Rpb24uQm90dG9tIDogU2Nyb2xsRGlyZWN0aW9uLlRvcDtcbiAgICAgICAgICAgICAgICAgICAgd2luZG93Lmhhc01vcmVNZXNzYWdlcyA9IHJlc3VsdC5sZW5ndGggPT0gdGhpcy5oaXN0b3J5UGFnZVNpemU7XG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHRoaXMub25GZXRjaE1lc3NhZ2VIaXN0b3J5TG9hZGVkKHJlc3VsdCwgd2luZG93LCBkaXJlY3Rpb24sIHRydWUpKTtcbiAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgKS5zdWJzY3JpYmUoKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlXG4gICAgICAgIHtcbiAgICAgICAgICAgIHRoaXMuYWRhcHRlci5nZXRNZXNzYWdlSGlzdG9yeSh3aW5kb3cucGFydGljaXBhbnQuaWQpXG4gICAgICAgICAgICAucGlwZShcbiAgICAgICAgICAgICAgICBtYXAoKHJlc3VsdDogTWVzc2FnZVtdKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIHJlc3VsdC5mb3JFYWNoKChtZXNzYWdlKSA9PiB0aGlzLmFzc2VydE1lc3NhZ2VUeXBlKG1lc3NhZ2UpKTtcbiAgICBcbiAgICAgICAgICAgICAgICAgICAgd2luZG93Lm1lc3NhZ2VzID0gcmVzdWx0LmNvbmNhdCh3aW5kb3cubWVzc2FnZXMpO1xuICAgICAgICAgICAgICAgICAgICB3aW5kb3cuaXNMb2FkaW5nSGlzdG9yeSA9IGZhbHNlO1xuICAgIFxuICAgICAgICAgICAgICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHRoaXMub25GZXRjaE1lc3NhZ2VIaXN0b3J5TG9hZGVkKHJlc3VsdCwgd2luZG93LCBTY3JvbGxEaXJlY3Rpb24uQm90dG9tKSk7XG4gICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICkuc3Vic2NyaWJlKCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwcml2YXRlIG9uRmV0Y2hNZXNzYWdlSGlzdG9yeUxvYWRlZChtZXNzYWdlczogTWVzc2FnZVtdLCB3aW5kb3c6IFdpbmRvdywgZGlyZWN0aW9uOiBTY3JvbGxEaXJlY3Rpb24sIGZvcmNlTWFya01lc3NhZ2VzQXNTZWVuOiBib29sZWFuID0gZmFsc2UpOiB2b2lkIFxuICAgIHtcbiAgICAgICAgdGhpcy5zY3JvbGxDaGF0V2luZG93KHdpbmRvdywgZGlyZWN0aW9uKVxuXG4gICAgICAgIGlmICh3aW5kb3cuaGFzRm9jdXMgfHwgZm9yY2VNYXJrTWVzc2FnZXNBc1NlZW4pXG4gICAgICAgIHtcbiAgICAgICAgICAgIGNvbnN0IHVuc2Vlbk1lc3NhZ2VzID0gbWVzc2FnZXMuZmlsdGVyKG0gPT4gIW0uZGF0ZVNlZW4pO1xuXG4gICAgICAgICAgICB0aGlzLm1hcmtNZXNzYWdlc0FzUmVhZCh1bnNlZW5NZXNzYWdlcyk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBVcGRhdGVzIHRoZSBmcmllbmRzIGxpc3QgdmlhIHRoZSBldmVudCBoYW5kbGVyXG4gICAgcHJpdmF0ZSBvbkZyaWVuZHNMaXN0Q2hhbmdlZChwYXJ0aWNpcGFudHNSZXNwb25zZTogUGFydGljaXBhbnRSZXNwb25zZVtdKTogdm9pZFxuICAgIHtcbiAgICAgICAgaWYgKHBhcnRpY2lwYW50c1Jlc3BvbnNlKSBcbiAgICAgICAge1xuICAgICAgICAgICAgdGhpcy5wYXJ0aWNpcGFudHNSZXNwb25zZSA9IHBhcnRpY2lwYW50c1Jlc3BvbnNlO1xuXG4gICAgICAgICAgICB0aGlzLnBhcnRpY2lwYW50cyA9IHBhcnRpY2lwYW50c1Jlc3BvbnNlLm1hcCgocmVzcG9uc2U6IFBhcnRpY2lwYW50UmVzcG9uc2UpID0+IHtcbiAgICAgICAgICAgICAgICByZXR1cm4gcmVzcG9uc2UucGFydGljaXBhbnQ7XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgdGhpcy5wYXJ0aWNpcGFudHNJbnRlcmFjdGVkV2l0aCA9IFtdO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLy8gSGFuZGxlcyByZWNlaXZlZCBtZXNzYWdlcyBieSB0aGUgYWRhcHRlclxuICAgIHByaXZhdGUgb25NZXNzYWdlUmVjZWl2ZWQocGFydGljaXBhbnQ6IElDaGF0UGFydGljaXBhbnQsIG1lc3NhZ2U6IE1lc3NhZ2UpXG4gICAge1xuICAgICAgICBpZiAocGFydGljaXBhbnQgJiYgbWVzc2FnZSlcbiAgICAgICAge1xuICAgICAgICAgICAgY29uc3QgY2hhdFdpbmRvdyA9IHRoaXMub3BlbkNoYXRXaW5kb3cocGFydGljaXBhbnQpO1xuXG4gICAgICAgICAgICB0aGlzLmFzc2VydE1lc3NhZ2VUeXBlKG1lc3NhZ2UpO1xuXG4gICAgICAgICAgICBpZiAoIWNoYXRXaW5kb3dbMV0gfHwgIXRoaXMuaGlzdG9yeUVuYWJsZWQpe1xuICAgICAgICAgICAgICAgIGNoYXRXaW5kb3dbMF0ubWVzc2FnZXMucHVzaChtZXNzYWdlKTtcblxuICAgICAgICAgICAgICAgIHRoaXMuc2Nyb2xsQ2hhdFdpbmRvdyhjaGF0V2luZG93WzBdLCBTY3JvbGxEaXJlY3Rpb24uQm90dG9tKTtcblxuICAgICAgICAgICAgICAgIGlmIChjaGF0V2luZG93WzBdLmhhc0ZvY3VzKVxuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5tYXJrTWVzc2FnZXNBc1JlYWQoW21lc3NhZ2VdKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHRoaXMuZW1pdE1lc3NhZ2VTb3VuZChjaGF0V2luZG93WzBdKTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgLy8gR2l0aHViIGlzc3VlICM1OCBcbiAgICAgICAgICAgIC8vIERvIG5vdCBwdXNoIGJyb3dzZXIgbm90aWZpY2F0aW9ucyB3aXRoIG1lc3NhZ2UgY29udGVudCBmb3IgcHJpdmFjeSBwdXJwb3NlcyBpZiB0aGUgJ21heGltaXplV2luZG93T25OZXdNZXNzYWdlJyBzZXR0aW5nIGlzIG9mZiBhbmQgdGhpcyBpcyBhIG5ldyBjaGF0IHdpbmRvdy5cbiAgICAgICAgICAgIGlmICh0aGlzLm1heGltaXplV2luZG93T25OZXdNZXNzYWdlIHx8ICghY2hhdFdpbmRvd1sxXSAmJiAhY2hhdFdpbmRvd1swXS5pc0NvbGxhcHNlZCkpXG4gICAgICAgICAgICB7IFxuICAgICAgICAgICAgICAgIC8vIFNvbWUgbWVzc2FnZXMgYXJlIG5vdCBwdXNoZWQgYmVjYXVzZSB0aGV5IGFyZSBsb2FkZWQgYnkgZmV0Y2hpbmcgdGhlIGhpc3RvcnkgaGVuY2Ugd2h5IHdlIHN1cHBseSB0aGUgbWVzc2FnZSBoZXJlXG4gICAgICAgICAgICAgICAgdGhpcy5lbWl0QnJvd3Nlck5vdGlmaWNhdGlvbihjaGF0V2luZG93WzBdLCBtZXNzYWdlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIG9uUGFydGljaXBhbnRDbGlja2VkRnJvbUZyaWVuZHNMaXN0KHBhcnRpY2lwYW50OiBJQ2hhdFBhcnRpY2lwYW50KTogdm9pZCB7XG4gICAgICAgIHRoaXMub3BlbkNoYXRXaW5kb3cocGFydGljaXBhbnQsIHRydWUsIHRydWUpO1xuICAgIH1cblxuICAgIHByaXZhdGUgY2FuY2VsT3B0aW9uUHJvbXB0KCk6IHZvaWQge1xuICAgICAgICBpZiAodGhpcy5jdXJyZW50QWN0aXZlT3B0aW9uKVxuICAgICAgICB7XG4gICAgICAgICAgICB0aGlzLmN1cnJlbnRBY3RpdmVPcHRpb24uaXNBY3RpdmUgPSBmYWxzZTtcbiAgICAgICAgICAgIHRoaXMuY3VycmVudEFjdGl2ZU9wdGlvbiA9IG51bGw7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBvbk9wdGlvblByb21wdENhbmNlbGVkKCk6IHZvaWQge1xuICAgICAgICB0aGlzLmNhbmNlbE9wdGlvblByb21wdCgpO1xuICAgIH1cblxuICAgIG9uT3B0aW9uUHJvbXB0Q29uZmlybWVkKGV2ZW50OiBhbnkpOiB2b2lkIHtcbiAgICAgICAgLy8gRm9yIG5vdyB0aGlzIGlzIGZpbmUgYXMgdGhlcmUgaXMgb25seSBvbmUgb3B0aW9uIGF2YWlsYWJsZS4gSW50cm9kdWNlIG9wdGlvbiB0eXBlcyBhbmQgdHlwZSBjaGVja2luZyBpZiBhIG5ldyBvcHRpb24gaXMgYWRkZWQuXG4gICAgICAgIHRoaXMuY29uZmlybU5ld0dyb3VwKGV2ZW50KTtcblxuICAgICAgICAvLyBDYW5jZWxpbmcgY3VycmVudCBzdGF0ZVxuICAgICAgICB0aGlzLmNhbmNlbE9wdGlvblByb21wdCgpO1xuICAgIH1cblxuICAgIHByaXZhdGUgY29uZmlybU5ld0dyb3VwKHVzZXJzOiBVc2VyW10pOiB2b2lkIHtcbiAgICAgICAgY29uc3QgbmV3R3JvdXAgPSBuZXcgR3JvdXAodXNlcnMpO1xuXG4gICAgICAgIHRoaXMub3BlbkNoYXRXaW5kb3cobmV3R3JvdXApO1xuXG4gICAgICAgIGlmICh0aGlzLmdyb3VwQWRhcHRlcilcbiAgICAgICAge1xuICAgICAgICAgICAgdGhpcy5ncm91cEFkYXB0ZXIuZ3JvdXBDcmVhdGVkKG5ld0dyb3VwKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8vIE9wZW5zIGEgbmV3IGNoYXQgd2hpbmRvdy4gVGFrZXMgY2FyZSBvZiBhdmFpbGFibGUgdmlld3BvcnRcbiAgICAvLyBXb3JrcyBmb3Igb3BlbmluZyBhIGNoYXQgd2luZG93IGZvciBhbiB1c2VyIG9yIGZvciBhIGdyb3VwXG4gICAgLy8gUmV0dXJucyA9PiBbV2luZG93OiBXaW5kb3cgb2JqZWN0IHJlZmVyZW5jZSwgYm9vbGVhbjogSW5kaWNhdGVzIGlmIHRoaXMgd2luZG93IGlzIGEgbmV3IGNoYXQgd2luZG93XVxuICAgIHByaXZhdGUgb3BlbkNoYXRXaW5kb3cocGFydGljaXBhbnQ6IElDaGF0UGFydGljaXBhbnQsIGZvY3VzT25OZXdXaW5kb3c6IGJvb2xlYW4gPSBmYWxzZSwgaW52b2tlZEJ5VXNlckNsaWNrOiBib29sZWFuID0gZmFsc2UpOiBbV2luZG93LCBib29sZWFuXVxuICAgIHtcbiAgICAgICAgLy8gSXMgdGhpcyB3aW5kb3cgb3BlbmVkP1xuICAgICAgICBjb25zdCBvcGVuZWRXaW5kb3cgPSB0aGlzLndpbmRvd3MuZmluZCh4ID0+IHgucGFydGljaXBhbnQuaWQgPT0gcGFydGljaXBhbnQuaWQpO1xuXG4gICAgICAgIGlmICghb3BlbmVkV2luZG93KVxuICAgICAgICB7XG4gICAgICAgICAgICBpZiAoaW52b2tlZEJ5VXNlckNsaWNrKSBcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICB0aGlzLm9uUGFydGljaXBhbnRDbGlja2VkLmVtaXQocGFydGljaXBhbnQpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBSZWZlciB0byBpc3N1ZSAjNTggb24gR2l0aHViIFxuICAgICAgICAgICAgY29uc3QgY29sbGFwc2VXaW5kb3cgPSBpbnZva2VkQnlVc2VyQ2xpY2sgPyBmYWxzZSA6ICF0aGlzLm1heGltaXplV2luZG93T25OZXdNZXNzYWdlO1xuXG4gICAgICAgICAgICBjb25zdCBuZXdDaGF0V2luZG93OiBXaW5kb3cgPSBuZXcgV2luZG93KHBhcnRpY2lwYW50LCB0aGlzLmhpc3RvcnlFbmFibGVkLCBjb2xsYXBzZVdpbmRvdyk7XG5cbiAgICAgICAgICAgIC8vIExvYWRzIHRoZSBjaGF0IGhpc3RvcnkgdmlhIGFuIFJ4SnMgT2JzZXJ2YWJsZVxuICAgICAgICAgICAgaWYgKHRoaXMuaGlzdG9yeUVuYWJsZWQpXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgdGhpcy5mZXRjaE1lc3NhZ2VIaXN0b3J5KG5ld0NoYXRXaW5kb3cpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB0aGlzLndpbmRvd3MudW5zaGlmdChuZXdDaGF0V2luZG93KTtcblxuICAgICAgICAgICAgLy8gSXMgdGhlcmUgZW5vdWdoIHNwYWNlIGxlZnQgaW4gdGhlIHZpZXcgcG9ydCA/IGJ1dCBzaG91bGQgYmUgZGlzcGxheWVkIGluIG1vYmlsZSBpZiBvcHRpb24gaXMgZW5hYmxlZFxuICAgICAgICAgICAgaWYgKCF0aGlzLmlzVmlld3BvcnRPbk1vYmlsZUVuYWJsZWQpIHtcbiAgICAgICAgICAgICAgICBpZiAodGhpcy53aW5kb3dzLmxlbmd0aCAqIHRoaXMud2luZG93U2l6ZUZhY3RvciA+PSB0aGlzLnZpZXdQb3J0VG90YWxBcmVhIC0gKCF0aGlzLmhpZGVGcmllbmRzTGlzdCA/IHRoaXMuZnJpZW5kc0xpc3RXaWR0aCA6IDApKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMud2luZG93cy5wb3AoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHRoaXMudXBkYXRlV2luZG93c1N0YXRlKHRoaXMud2luZG93cyk7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGlmIChmb2N1c09uTmV3V2luZG93ICYmICFjb2xsYXBzZVdpbmRvdykgXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgdGhpcy5mb2N1c09uV2luZG93KG5ld0NoYXRXaW5kb3cpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB0aGlzLnBhcnRpY2lwYW50c0ludGVyYWN0ZWRXaXRoLnB1c2gocGFydGljaXBhbnQpO1xuICAgICAgICAgICAgdGhpcy5vblBhcnRpY2lwYW50Q2hhdE9wZW5lZC5lbWl0KHBhcnRpY2lwYW50KTtcblxuICAgICAgICAgICAgcmV0dXJuIFtuZXdDaGF0V2luZG93LCB0cnVlXTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlXG4gICAgICAgIHtcbiAgICAgICAgICAgIC8vIFJldHVybnMgdGhlIGV4aXN0aW5nIGNoYXQgd2luZG93ICAgICBcbiAgICAgICAgICAgIHJldHVybiBbb3BlbmVkV2luZG93LCBmYWxzZV07ICAgICAgIFxuICAgICAgICB9XG4gICAgfVxuXG4gICAgLy8gRm9jdXMgb24gdGhlIGlucHV0IGVsZW1lbnQgb2YgdGhlIHN1cHBsaWVkIHdpbmRvd1xuICAgIHByaXZhdGUgZm9jdXNPbldpbmRvdyh3aW5kb3c6IFdpbmRvdywgY2FsbGJhY2s6IEZ1bmN0aW9uID0gKCkgPT4ge30pIDogdm9pZFxuICAgIHtcbiAgICAgICAgY29uc3Qgd2luZG93SW5kZXggPSB0aGlzLndpbmRvd3MuaW5kZXhPZih3aW5kb3cpO1xuICAgICAgICBpZiAod2luZG93SW5kZXggPj0gMClcbiAgICAgICAge1xuICAgICAgICAgICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuY2hhdFdpbmRvd3MpXG4gICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBjaGF0V2luZG93VG9Gb2N1cyA9IHRoaXMuY2hhdFdpbmRvd3MudG9BcnJheSgpW3dpbmRvd0luZGV4XTtcblxuICAgICAgICAgICAgICAgICAgICBjaGF0V2luZG93VG9Gb2N1cy5jaGF0V2luZG93SW5wdXQubmF0aXZlRWxlbWVudC5mb2N1cygpO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGNhbGxiYWNrKCk7IFxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0gXG4gICAgfVxuXG4gICAgcHJpdmF0ZSBhc3NlcnRNZXNzYWdlVHlwZShtZXNzYWdlOiBNZXNzYWdlKTogdm9pZCB7XG4gICAgICAgIC8vIEFsd2F5cyBmYWxsYmFjayB0byBcIlRleHRcIiBtZXNzYWdlcyB0byBhdm9pZCByZW5kZW5yaW5nIGlzc3Vlc1xuICAgICAgICBpZiAoIW1lc3NhZ2UudHlwZSlcbiAgICAgICAge1xuICAgICAgICAgICAgbWVzc2FnZS50eXBlID0gTWVzc2FnZVR5cGUuVGV4dDtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8vIE1hcmtzIGFsbCBtZXNzYWdlcyBwcm92aWRlZCBhcyByZWFkIHdpdGggdGhlIGN1cnJlbnQgdGltZS5cbiAgICBtYXJrTWVzc2FnZXNBc1JlYWQobWVzc2FnZXM6IE1lc3NhZ2VbXSk6IHZvaWRcbiAgICB7XG4gICAgICAgIGNvbnN0IGN1cnJlbnREYXRlID0gbmV3IERhdGUoKTtcblxuICAgICAgICBtZXNzYWdlcy5mb3JFYWNoKChtc2cpPT57XG4gICAgICAgICAgICBtc2cuZGF0ZVNlZW4gPSBjdXJyZW50RGF0ZTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgdGhpcy5vbk1lc3NhZ2VzU2Vlbi5lbWl0KG1lc3NhZ2VzKTtcbiAgICB9XG5cbiAgICAvLyBCdWZmZXJzIGF1ZGlvIGZpbGUgKEZvciBjb21wb25lbnQncyBib290c3RyYXBwaW5nKVxuICAgIHByaXZhdGUgYnVmZmVyQXVkaW9GaWxlKCk6IHZvaWQge1xuICAgICAgICBpZiAodGhpcy5hdWRpb1NvdXJjZSAmJiB0aGlzLmF1ZGlvU291cmNlLmxlbmd0aCA+IDApXG4gICAgICAgIHtcbiAgICAgICAgICAgIHRoaXMuYXVkaW9GaWxlID0gbmV3IEF1ZGlvKCk7XG4gICAgICAgICAgICB0aGlzLmF1ZGlvRmlsZS5zcmMgPSB0aGlzLmF1ZGlvU291cmNlO1xuICAgICAgICAgICAgdGhpcy5hdWRpb0ZpbGUubG9hZCgpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLy8gRW1pdHMgYSBtZXNzYWdlIG5vdGlmaWNhdGlvbiBhdWRpbyBpZiBlbmFibGVkIGFmdGVyIGV2ZXJ5IG1lc3NhZ2UgcmVjZWl2ZWRcbiAgICBwcml2YXRlIGVtaXRNZXNzYWdlU291bmQod2luZG93OiBXaW5kb3cpOiB2b2lkXG4gICAge1xuICAgICAgICBpZiAodGhpcy5hdWRpb0VuYWJsZWQgJiYgIXdpbmRvdy5oYXNGb2N1cyAmJiB0aGlzLmF1ZGlvRmlsZSkge1xuICAgICAgICAgICAgdGhpcy5hdWRpb0ZpbGUucGxheSgpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLy8gRW1pdHMgYSBicm93c2VyIG5vdGlmaWNhdGlvblxuICAgIHByaXZhdGUgZW1pdEJyb3dzZXJOb3RpZmljYXRpb24od2luZG93OiBXaW5kb3csIG1lc3NhZ2U6IE1lc3NhZ2UpOiB2b2lkXG4gICAgeyAgICAgICBcbiAgICAgICAgaWYgKHRoaXMuYnJvd3Nlck5vdGlmaWNhdGlvbnNCb290c3RyYXBwZWQgJiYgIXdpbmRvdy5oYXNGb2N1cyAmJiBtZXNzYWdlKSB7XG4gICAgICAgICAgICBjb25zdCBub3RpZmljYXRpb24gPSBuZXcgTm90aWZpY2F0aW9uKGAke3RoaXMubG9jYWxpemF0aW9uLmJyb3dzZXJOb3RpZmljYXRpb25UaXRsZX0gJHt3aW5kb3cucGFydGljaXBhbnQuZGlzcGxheU5hbWV9YCwge1xuICAgICAgICAgICAgICAgICdib2R5JzogbWVzc2FnZS5tZXNzYWdlLFxuICAgICAgICAgICAgICAgICdpY29uJzogdGhpcy5icm93c2VyTm90aWZpY2F0aW9uSWNvblNvdXJjZVxuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAgICAgICAgIG5vdGlmaWNhdGlvbi5jbG9zZSgpO1xuICAgICAgICAgICAgfSwgbWVzc2FnZS5tZXNzYWdlLmxlbmd0aCA8PSA1MCA/IDUwMDAgOiA3MDAwKTsgLy8gTW9yZSB0aW1lIHRvIHJlYWQgbG9uZ2VyIG1lc3NhZ2VzXG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBTYXZlcyBjdXJyZW50IHdpbmRvd3Mgc3RhdGUgaW50byBsb2NhbCBzdG9yYWdlIGlmIHBlcnNpc3RlbmNlIGlzIGVuYWJsZWRcbiAgICBwcml2YXRlIHVwZGF0ZVdpbmRvd3NTdGF0ZSh3aW5kb3dzOiBXaW5kb3dbXSk6IHZvaWRcbiAgICB7XG4gICAgICAgIGlmICh0aGlzLnBlcnNpc3RXaW5kb3dzU3RhdGUpXG4gICAgICAgIHtcbiAgICAgICAgICAgIGNvbnN0IHBhcnRpY2lwYW50SWRzID0gd2luZG93cy5tYXAoKHcpID0+IHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdy5wYXJ0aWNpcGFudC5pZDtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICBsb2NhbFN0b3JhZ2Uuc2V0SXRlbSh0aGlzLmxvY2FsU3RvcmFnZUtleSwgSlNPTi5zdHJpbmdpZnkocGFydGljaXBhbnRJZHMpKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHByaXZhdGUgcmVzdG9yZVdpbmRvd3NTdGF0ZSgpOiB2b2lkXG4gICAge1xuICAgICAgICB0cnlcbiAgICAgICAge1xuICAgICAgICAgICAgaWYgKHRoaXMucGVyc2lzdFdpbmRvd3NTdGF0ZSlcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBjb25zdCBzdHJpbmdmaWVkUGFydGljaXBhbnRJZHMgPSBsb2NhbFN0b3JhZ2UuZ2V0SXRlbSh0aGlzLmxvY2FsU3RvcmFnZUtleSk7XG5cbiAgICAgICAgICAgICAgICBpZiAoc3RyaW5nZmllZFBhcnRpY2lwYW50SWRzICYmIHN0cmluZ2ZpZWRQYXJ0aWNpcGFudElkcy5sZW5ndGggPiAwKVxuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgcGFydGljaXBhbnRJZHMgPSA8bnVtYmVyW10+SlNPTi5wYXJzZShzdHJpbmdmaWVkUGFydGljaXBhbnRJZHMpO1xuXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHBhcnRpY2lwYW50c1RvUmVzdG9yZSA9IHRoaXMucGFydGljaXBhbnRzLmZpbHRlcih1ID0+IHBhcnRpY2lwYW50SWRzLmluZGV4T2YodS5pZCkgPj0gMCk7XG5cbiAgICAgICAgICAgICAgICAgICAgcGFydGljaXBhbnRzVG9SZXN0b3JlLmZvckVhY2goKHBhcnRpY2lwYW50KSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLm9wZW5DaGF0V2luZG93KHBhcnRpY2lwYW50KTtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGNhdGNoIChleClcbiAgICAgICAge1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcihgQW4gZXJyb3Igb2NjdXJyZWQgd2hpbGUgcmVzdG9yaW5nIG5nLWNoYXQgd2luZG93cyBzdGF0ZS4gRGV0YWlsczogJHtleH1gKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8vIEdldHMgY2xvc2VzdCBvcGVuIHdpbmRvdyBpZiBhbnkuIE1vc3QgcmVjZW50IG9wZW5lZCBoYXMgcHJpb3JpdHkgKFJpZ2h0KVxuICAgIHByaXZhdGUgZ2V0Q2xvc2VzdFdpbmRvdyh3aW5kb3c6IFdpbmRvdyk6IFdpbmRvdyB8IHVuZGVmaW5lZFxuICAgIHsgICBcbiAgICAgICAgY29uc3QgaW5kZXggPSB0aGlzLndpbmRvd3MuaW5kZXhPZih3aW5kb3cpO1xuXG4gICAgICAgIGlmIChpbmRleCA+IDApXG4gICAgICAgIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLndpbmRvd3NbaW5kZXggLSAxXTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmIChpbmRleCA9PSAwICYmIHRoaXMud2luZG93cy5sZW5ndGggPiAxKVxuICAgICAgICB7ICAgXG4gICAgICAgICAgICByZXR1cm4gdGhpcy53aW5kb3dzW2luZGV4ICsgMV07XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwcml2YXRlIGNsb3NlV2luZG93KHdpbmRvdzogV2luZG93KTogdm9pZCBcbiAgICB7XG4gICAgICAgIGNvbnN0IGluZGV4ID0gdGhpcy53aW5kb3dzLmluZGV4T2Yod2luZG93KTtcblxuICAgICAgICB0aGlzLndpbmRvd3Muc3BsaWNlKGluZGV4LCAxKTtcblxuICAgICAgICB0aGlzLnVwZGF0ZVdpbmRvd3NTdGF0ZSh0aGlzLndpbmRvd3MpO1xuXG4gICAgICAgIHRoaXMub25QYXJ0aWNpcGFudENoYXRDbG9zZWQuZW1pdCh3aW5kb3cucGFydGljaXBhbnQpO1xuICAgIH1cblxuICAgIHByaXZhdGUgZ2V0Q2hhdFdpbmRvd0NvbXBvbmVudEluc3RhbmNlKHRhcmdldFdpbmRvdzogV2luZG93KTogTmdDaGF0V2luZG93Q29tcG9uZW50IHwgbnVsbCB7XG4gICAgICAgIGNvbnN0IHdpbmRvd0luZGV4ID0gdGhpcy53aW5kb3dzLmluZGV4T2YodGFyZ2V0V2luZG93KTtcblxuICAgICAgICBpZiAodGhpcy5jaGF0V2luZG93cyl7XG4gICAgICAgICAgICBsZXQgdGFyZ2V0V2luZG93ID0gdGhpcy5jaGF0V2luZG93cy50b0FycmF5KClbd2luZG93SW5kZXhdO1xuXG4gICAgICAgICAgICByZXR1cm4gdGFyZ2V0V2luZG93O1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuXG4gICAgLy8gU2Nyb2xscyBhIGNoYXQgd2luZG93IG1lc3NhZ2UgZmxvdyB0byB0aGUgYm90dG9tXG4gICAgcHJpdmF0ZSBzY3JvbGxDaGF0V2luZG93KHdpbmRvdzogV2luZG93LCBkaXJlY3Rpb246IFNjcm9sbERpcmVjdGlvbik6IHZvaWRcbiAgICB7XG4gICAgICAgIGNvbnN0IGNoYXRXaW5kb3cgPSB0aGlzLmdldENoYXRXaW5kb3dDb21wb25lbnRJbnN0YW5jZSh3aW5kb3cpO1xuXG4gICAgICAgIGlmIChjaGF0V2luZG93KXtcbiAgICAgICAgICAgIGNoYXRXaW5kb3cuc2Nyb2xsQ2hhdFdpbmRvdyh3aW5kb3csIGRpcmVjdGlvbik7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBvbldpbmRvd01lc3NhZ2VzU2VlbihtZXNzYWdlc1NlZW46IE1lc3NhZ2VbXSk6IHZvaWQge1xuICAgICAgICB0aGlzLm1hcmtNZXNzYWdlc0FzUmVhZChtZXNzYWdlc1NlZW4pO1xuICAgIH1cblxuICAgIGFzeW5jIG9uV2luZG93Q2hhdFRvZ2dsZShwYXlsb2FkOiB7IGN1cnJlbnRXaW5kb3c6IFdpbmRvdywgaXNDb2xsYXBzZWQ6IGJvb2xlYW4gfSkge1xuICAgICAgICB0aGlzLm9uUGFydGljaXBhbnRUb2dnbGUuZW1pdCh7cGFydGljaXBhbnQ6IHBheWxvYWQuY3VycmVudFdpbmRvdy5wYXJ0aWNpcGFudCwgaXNDb2xsYXBzZWQ6IHBheWxvYWQuaXNDb2xsYXBzZWR9KTtcbiAgICAgICAgXG4gICAgfVxuXG4gICAgYXN5bmMgb25XaW5kb3dDaGF0Q2xvc2VkKHBheWxvYWQ6IHsgY2xvc2VkV2luZG93OiBXaW5kb3csIGNsb3NlZFZpYUVzY2FwZUtleTogYm9vbGVhbiB9KSB7XG4gICAgICAgIGNvbnN0IHsgY2xvc2VkV2luZG93LCBjbG9zZWRWaWFFc2NhcGVLZXkgfSA9IHBheWxvYWQ7XG4gICAgICAgIGNvbnNvbGUubG9nKCdvbldpbmRvd0NoYXRDbG9zZWQnKTtcbiAgICAgICAgaWYodGhpcy5iZWZvcmVQYXJ0ZWNpYW50Q2hhdENsb3NlZCAhPSB1bmRlZmluZWQgJiYgdGhpcy5iZWZvcmVQYXJ0ZWNpYW50Q2hhdENsb3NlZCkge1xuICAgICAgICAgICAgY29uc3QgbCA9IGF3YWl0IHRoaXMuYmVmb3JlUGFydGVjaWFudENoYXRDbG9zZWQoY2xvc2VkV2luZG93LnBhcnRpY2lwYW50KTtcbiAgICAgICAgICAgIGlmKGwgPT0gZmFsc2UpXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGlmIChjbG9zZWRWaWFFc2NhcGVLZXkpIHtcbiAgICAgICAgICAgIGxldCBjbG9zZXN0V2luZG93ID0gdGhpcy5nZXRDbG9zZXN0V2luZG93KGNsb3NlZFdpbmRvdyk7XG5cbiAgICAgICAgICAgIGlmIChjbG9zZXN0V2luZG93KVxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIHRoaXMuZm9jdXNPbldpbmRvdyhjbG9zZXN0V2luZG93LCAoKSA9PiB7IHRoaXMuY2xvc2VXaW5kb3coY2xvc2VkV2luZG93KTsgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgdGhpcy5jbG9zZVdpbmRvdyhjbG9zZWRXaW5kb3cpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGVsc2UgeyBcbiAgICAgICAgICAgIHRoaXMuY2xvc2VXaW5kb3coY2xvc2VkV2luZG93KTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIG9uV2luZG93VGFiVHJpZ2dlcmVkKHBheWxvYWQ6IHsgdHJpZ2dlcmluZ1dpbmRvdzogV2luZG93LCBzaGlmdEtleVByZXNzZWQ6IGJvb2xlYW4gfSk6IHZvaWQge1xuICAgICAgICBjb25zdCB7IHRyaWdnZXJpbmdXaW5kb3csIHNoaWZ0S2V5UHJlc3NlZCB9ID0gcGF5bG9hZDtcblxuICAgICAgICBjb25zdCBjdXJyZW50V2luZG93SW5kZXggPSB0aGlzLndpbmRvd3MuaW5kZXhPZih0cmlnZ2VyaW5nV2luZG93KTtcbiAgICAgICAgbGV0IHdpbmRvd1RvRm9jdXMgPSB0aGlzLndpbmRvd3NbY3VycmVudFdpbmRvd0luZGV4ICsgKHNoaWZ0S2V5UHJlc3NlZCA/IDEgOiAtMSldOyAvLyBHb2VzIGJhY2sgb24gc2hpZnQgKyB0YWJcblxuICAgICAgICBpZiAoIXdpbmRvd1RvRm9jdXMpXG4gICAgICAgIHtcbiAgICAgICAgICAgIC8vIEVkZ2Ugd2luZG93cywgZ28gdG8gc3RhcnQgb3IgZW5kXG4gICAgICAgICAgICB3aW5kb3dUb0ZvY3VzID0gdGhpcy53aW5kb3dzW2N1cnJlbnRXaW5kb3dJbmRleCA+IDAgPyAwIDogdGhpcy5jaGF0V2luZG93cy5sZW5ndGggLSAxXTsgXG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLmZvY3VzT25XaW5kb3cod2luZG93VG9Gb2N1cyk7XG4gICAgfVxuXG4gICAgb25XaW5kb3dNZXNzYWdlU2VudChtZXNzYWdlU2VudDogTWVzc2FnZSk6IHZvaWQge1xuICAgICAgICB0aGlzLmFkYXB0ZXIuc2VuZE1lc3NhZ2UobWVzc2FnZVNlbnQpO1xuICAgIH1cbiAgICBcbiAgICBvbldpbmRvd09wdGlvblRyaWdnZXJlZChvcHRpb246IElDaGF0T3B0aW9uKTogdm9pZCB7XG4gICAgICAgIHRoaXMuY3VycmVudEFjdGl2ZU9wdGlvbiA9IG9wdGlvbjtcbiAgICB9XG5cbiAgICB0cmlnZ2VyT3BlbkNoYXRXaW5kb3codXNlcjogVXNlcik6IHZvaWQge1xuICAgICAgICBpZiAodXNlcilcbiAgICAgICAge1xuICAgICAgICAgICAgdGhpcy5vcGVuQ2hhdFdpbmRvdyh1c2VyKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHRyaWdnZXJDbG9zZUNoYXRXaW5kb3codXNlcklkOiBhbnkpOiB2b2lkIHtcbiAgICAgICAgY29uc3Qgb3BlbmVkV2luZG93ID0gdGhpcy53aW5kb3dzLmZpbmQoeCA9PiB4LnBhcnRpY2lwYW50LmlkID09IHVzZXJJZCk7XG5cbiAgICAgICAgaWYgKG9wZW5lZFdpbmRvdykgXG4gICAgICAgIHtcbiAgICAgICAgICAgIHRoaXMuY2xvc2VXaW5kb3cob3BlbmVkV2luZG93KTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHRyaWdnZXJUb2dnbGVDaGF0V2luZG93VmlzaWJpbGl0eSh1c2VySWQ6IGFueSk6IHZvaWQge1xuICAgICAgICBjb25zdCBvcGVuZWRXaW5kb3cgPSB0aGlzLndpbmRvd3MuZmluZCh4ID0+IHgucGFydGljaXBhbnQuaWQgPT0gdXNlcklkKTtcblxuICAgICAgICBpZiAob3BlbmVkV2luZG93KSBcbiAgICAgICAge1xuICAgICAgICAgICAgY29uc3QgY2hhdFdpbmRvdyA9IHRoaXMuZ2V0Q2hhdFdpbmRvd0NvbXBvbmVudEluc3RhbmNlKG9wZW5lZFdpbmRvdyk7XG5cbiAgICAgICAgICAgIGlmIChjaGF0V2luZG93KXtcbiAgICAgICAgICAgICAgICBjaGF0V2luZG93Lm9uQ2hhdFdpbmRvd0NsaWNrZWQob3BlbmVkV2luZG93KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIHNldEJlZm9yZVBhcnRlY2lhbnRDaGF0Q2xvc2VkKGZ1bmM6IGFueSkge1xuICAgICAgICB0aGlzLmJlZm9yZVBhcnRlY2lhbnRDaGF0Q2xvc2VkID0gZnVuYztcbiAgICB9XG59Il19