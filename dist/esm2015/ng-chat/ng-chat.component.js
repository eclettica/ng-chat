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
        this.showCloseButton = true;
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
    Input()
], NgChat.prototype, "showCloseButton", void 0);
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
        template: "<link *ngIf=\"customTheme\" rel=\"stylesheet\" [href]='customTheme | sanitize'>\n\n<div id=\"ng-chat\" *ngIf=\"!isDisabled && isBootstrapped && !unsupportedViewport\" [ngClass]=\"theme\">\n    <ng-chat-friends-list\n        [localization]=\"localization\"\n        [shouldDisplay]=\"!hideFriendsList\"\n        [userId]=\"userId\"\n        [isCollapsed]=\"isCollapsed\"\n        [searchEnabled]=\"searchEnabled\"\n        [participants]=\"participants\"\n        [participantsResponse]=\"participantsResponse\"\n        [participantsInteractedWith]=\"participantsInteractedWith\"\n        [windows]=\"windows\"\n        [currentActiveOption]=\"currentActiveOption\"\n        (onParticipantClicked)=\"onParticipantClickedFromFriendsList($event)\"\n        (onOptionPromptCanceled)=\"onOptionPromptCanceled()\"\n        (onOptionPromptConfirmed)=\"onOptionPromptConfirmed($event)\"\n    >\n    </ng-chat-friends-list>\n    <!-- check -->\n    <div *ngFor=\"let window of windows; let i = index\" [ngClass]=\"{'ng-chat-window': true, 'primary-outline-color': true, 'ng-chat-window-collapsed': window.isCollapsed}\" [ngStyle]=\"{'right': (!hideFriendsList ? friendsListWidth : 0) + 20 + windowSizeFactor * i + 'px'}\">\n        <ng-chat-window\n            #chatWindow\n            [fileUploadAdapter]=\"fileUploadAdapter\"\n            [localization]=\"localization\"\n            [userId]=\"userId\"\n            [window]=\"window\"\n            [showOptions]=\"groupAdapter\"\n            [emojisEnabled]=\"emojisEnabled\"\n            [showCloseButton]=\"showCloseButton\"\n            [linkfyEnabled]=\"linkfyEnabled\"\n            [showMessageDate]=\"showMessageDate\"\n            [messageDatePipeFormat]=\"messageDatePipeFormat\"\n            [hasPagedHistory]=\"hasPagedHistory\"\n            (onMessagesSeen)=\"onWindowMessagesSeen($event)\"\n            (onMessageSent)=\"onWindowMessageSent($event)\"\n            (onTabTriggered)=\"onWindowTabTriggered($event)\"\n            (onChatWindowClosed)=\"onWindowChatClosed($event)\"\n            (onChatWindowToggle)=\"onWindowChatToggle($event)\"\n            (onOptionTriggered)=\"onWindowOptionTriggered($event)\"\n            (onLoadHistoryTriggered)=\"fetchMessageHistory($event)\"\n        >\n        </ng-chat-window>\n    </div>\n</div>\n",
        encapsulation: ViewEncapsulation.None,
        styles: [".user-icon{box-sizing:border-box;background-color:#fff;border:2px solid;width:32px;height:20px;border-radius:64px 64px 0 0/64px;margin-top:14px;margin-left:-1px;display:inline-block;vertical-align:middle;position:relative;font-style:normal;color:#ddd;text-align:left;text-indent:-9999px}.user-icon:before{border:2px solid;background-color:#fff;width:12px;height:12px;top:-19px;border-radius:50%;position:absolute;left:50%;transform:translateX(-50%)}.user-icon:after,.user-icon:before{content:'';pointer-events:none}.upload-icon{position:absolute;margin-left:3px;margin-top:12px;width:13px;height:4px;border:1px solid currentColor;border-top:none;border-radius:1px}.upload-icon:before{content:'';position:absolute;top:-8px;left:6px;width:1px;height:9px;background-color:currentColor}.upload-icon:after{content:'';position:absolute;top:-8px;left:4px;width:4px;height:4px;border-top:1px solid currentColor;border-right:1px solid currentColor;transform:rotate(-45deg)}.paperclip-icon{position:absolute;margin-left:9px;margin-top:2px;width:6px;height:12px;border-radius:4px 4px 0 0;border-left:1px solid currentColor;border-right:1px solid currentColor;border-top:1px solid currentColor;transform:rotate(45deg)}.paperclip-icon:before{content:'';position:absolute;top:11px;left:-1px;width:4px;height:6px;border-radius:0 0 3px 3px;border-left:1px solid currentColor;border-right:1px solid currentColor;border-bottom:1px solid currentColor}.paperclip-icon:after{content:'';position:absolute;left:1px;top:1px;width:2px;height:10px;border-radius:4px 4px 0 0;border-left:1px solid currentColor;border-right:1px solid currentColor;border-top:1px solid currentColor}.check-icon{color:#000;position:absolute;margin-left:3px;margin-top:4px;width:14px;height:8px;border-bottom:1px solid currentColor;border-left:1px solid currentColor;transform:rotate(-45deg)}.remove-icon{color:#000;position:absolute;margin-left:3px;margin-top:10px}.remove-icon:before{content:'';position:absolute;width:15px;height:1px;background-color:currentColor;transform:rotate(45deg)}.remove-icon:after{content:'';position:absolute;width:15px;height:1px;background-color:currentColor;transform:rotate(-45deg)}", ".loader,.loader:after,.loader:before{background:#e3e3e3;-webkit-animation:1s ease-in-out infinite load1;animation:1s ease-in-out infinite load1;width:1em;height:4em}.loader{color:#e3e3e3;text-indent:-9999em;margin:4px auto 0;position:relative;font-size:4px;transform:translateZ(0);-webkit-animation-delay:-.16s;animation-delay:-.16s}.loader:after,.loader:before{position:absolute;top:0;content:''}.loader:before{left:-1.5em;-webkit-animation-delay:-.32s;animation-delay:-.32s}.loader:after{left:1.5em}@-webkit-keyframes load1{0%,100%,80%{box-shadow:0 0;height:4em}40%{box-shadow:0 -2em;height:5em}}@keyframes load1{0%,100%,80%{box-shadow:0 0;height:4em}40%{box-shadow:0 -2em;height:5em}}", "#ng-chat{position:fixed;z-index:999;right:0;bottom:0;box-sizing:initial;font-size:11pt;text-align:left}#ng-chat .shadowed{box-shadow:0 4px 8px rgba(0,0,0,.25)}.ng-chat-loading-wrapper{height:30px;text-align:center;font-size:.9em}.ng-chat-close{text-decoration:none;float:right}.ng-chat-title,.ng-chat-title:hover{position:relative;z-index:2;height:30px;line-height:30px;font-size:.9em;padding:0 10px;display:block;text-decoration:none;color:inherit;font-weight:400;cursor:pointer}.ng-chat-title .ng-chat-title-visibility-toggle-area{display:inline-block;width:85%}.ng-chat-title .ng-chat-title-visibility-toggle-area>strong{font-weight:600;display:block;overflow:hidden;height:30px;text-overflow:ellipsis;white-space:nowrap;max-width:85%;float:left}.ng-chat-title .ng-chat-title-visibility-toggle-area .ng-chat-participant-status{float:left;margin-left:5px}.ng-chat-participant-status{display:inline-block;border-radius:25px;width:8px;height:8px;margin-top:10px}.ng-chat-participant-status.online{background-color:#92a400}.ng-chat-participant-status.busy{background-color:#f91c1e}.ng-chat-participant-status.away{background-color:#f7d21b}.ng-chat-participant-status.offline{background-color:#bababa}.ng-chat-unread-messages-count{margin-left:5px;padding:0 5px;border-radius:25px;font-size:.9em;line-height:30px}.ng-chat-options-container{float:right;margin-right:5px}.ng-chat-options-container-reduced{margin-right:5px}", "#ng-chat.light-theme,#ng-chat.light-theme .primary-text{color:#5c5c5c;font-family:Arial,Helvetica,sans-serif}#ng-chat.light-theme .primary-background{background-color:#fff}#ng-chat.light-theme .secondary-background{background-color:#fafafa}#ng-chat.light-theme .primary-outline-color{border-color:#a3a3a3}#ng-chat.light-theme .friends-search-bar{background-color:#fff}#ng-chat.light-theme .ng-chat-people-action,#ng-chat.light-theme .ng-chat-people-action>i,#ng-chat.light-theme .unread-messages-counter-container{color:#5c5c5c;background-color:#e3e3e3}#ng-chat.light-theme .load-history-action{background-color:#e3e3e3}#ng-chat.light-theme .chat-window-input{background-color:#fff}#ng-chat.light-theme .file-message-container,#ng-chat.light-theme .sent-chat-message-container{background-color:#e3e3e3;border-color:#e3e3e3}#ng-chat.light-theme .file-message-container.received,#ng-chat.light-theme .received-chat-message-container{background-color:#fff;border-color:#e3e3e3}", "#ng-chat.dark-theme,#ng-chat.dark-theme .primary-text{color:#fff;font-family:Arial,Helvetica,sans-serif}#ng-chat.dark-theme .primary-background{background-color:#565656}#ng-chat.dark-theme .secondary-background{background-color:#444}#ng-chat.dark-theme .primary-outline-color{border-color:#353535}#ng-chat.dark-theme .friends-search-bar{background-color:#444;border:1px solid #444;color:#fff}#ng-chat.dark-theme .ng-chat-people-action,#ng-chat.dark-theme .ng-chat-people-action>i,#ng-chat.dark-theme .unread-messages-counter-container{background-color:#fff;color:#444}#ng-chat.dark-theme .load-history-action{background-color:#444}#ng-chat.dark-theme .chat-window-input{background-color:#444;color:#fff}#ng-chat.dark-theme .file-message-container,#ng-chat.dark-theme .sent-chat-message-container{border-color:#444;background-color:#444}#ng-chat.dark-theme .file-message-container.received,#ng-chat.dark-theme .received-chat-message-container{background-color:#565656;border-color:#444}#ng-chat.dark-theme .ng-chat-footer{background-color:#444}#ng-chat.dark-theme .ng-chat-message a{color:#fff}"]
    })
], NgChat);
export { NgChat };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmctY2hhdC5jb21wb25lbnQuanMiLCJzb3VyY2VSb290Ijoibmc6Ly9uZy1jaGF0LyIsInNvdXJjZXMiOlsibmctY2hhdC9uZy1jaGF0LmNvbXBvbmVudC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUEsT0FBTyxFQUFFLFNBQVMsRUFBRSxLQUFLLEVBQVUsWUFBWSxFQUFhLFlBQVksRUFBRSxNQUFNLEVBQUUsWUFBWSxFQUFFLGlCQUFpQixFQUFFLE1BQU0sZUFBZSxDQUFDO0FBQ3pJLE9BQU8sRUFBRSxVQUFVLEVBQUUsTUFBTSxzQkFBc0IsQ0FBQztBQU9sRCxPQUFPLEVBQUUsV0FBVyxFQUFFLE1BQU0sMEJBQTBCLENBQUM7QUFDdkQsT0FBTyxFQUFFLE1BQU0sRUFBRSxNQUFNLGVBQWUsQ0FBQztBQUN2QyxPQUFPLEVBQUUscUJBQXFCLEVBQUUsTUFBTSxxQ0FBcUMsQ0FBQztBQUM1RSxPQUFPLEVBQUUsZUFBZSxFQUFFLE1BQU0sOEJBQThCLENBQUM7QUFHL0QsT0FBTyxFQUFFLHVCQUF1QixFQUFFLE1BQU0sbUNBQW1DLENBQUM7QUFFNUUsT0FBTyxFQUFFLHdCQUF3QixFQUFFLE1BQU0sb0NBQW9DLENBQUM7QUFDOUUsT0FBTyxFQUFFLEtBQUssRUFBRSxNQUFNLG1CQUFtQixDQUFDO0FBRTFDLE9BQU8sRUFBRSxLQUFLLEVBQUUsTUFBTSxjQUFjLENBQUM7QUFDckMsT0FBTyxFQUFFLG1CQUFtQixFQUFFLE1BQU0sbUNBQW1DLENBQUM7QUFHeEUsT0FBTyxFQUFFLEdBQUcsRUFBRSxNQUFNLGdCQUFnQixDQUFDO0FBZ0JyQyxJQUFhLE1BQU0sR0FBbkIsTUFBYSxNQUFNO0lBQ2YsWUFBb0IsV0FBdUI7UUFBdkIsZ0JBQVcsR0FBWCxXQUFXLENBQVk7UUFFM0Msb0NBQW9DO1FBQzdCLHdCQUFtQixHQUFHLG1CQUFtQixDQUFDO1FBQzFDLDBCQUFxQixHQUFHLHFCQUFxQixDQUFDO1FBQzlDLGdCQUFXLEdBQUcsV0FBVyxDQUFDO1FBRXpC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Q1AsUUFBUSxFQUFFLFNBQVM7UUFDbkIsd3dFQUFxQztRQVFyQyxhQUFhLEVBQUUsaUJBQWlCLENBQUMsSUFBSTs7S0FDeEMsQ0FBQztHQUVXLE1BQU0sQ0E2c0JsQjtTQTdzQlksTUFBTSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IENvbXBvbmVudCwgSW5wdXQsIE9uSW5pdCwgVmlld0NoaWxkcmVuLCBRdWVyeUxpc3QsIEhvc3RMaXN0ZW5lciwgT3V0cHV0LCBFdmVudEVtaXR0ZXIsIFZpZXdFbmNhcHN1bGF0aW9uIH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQgeyBIdHRwQ2xpZW50IH0gZnJvbSAnQGFuZ3VsYXIvY29tbW9uL2h0dHAnO1xuXG5pbXBvcnQgeyBDaGF0QWRhcHRlciB9IGZyb20gJy4vY29yZS9jaGF0LWFkYXB0ZXInO1xuaW1wb3J0IHsgSUNoYXRHcm91cEFkYXB0ZXIgfSBmcm9tICcuL2NvcmUvY2hhdC1ncm91cC1hZGFwdGVyJztcbmltcG9ydCB7IFVzZXIgfSBmcm9tIFwiLi9jb3JlL3VzZXJcIjtcbmltcG9ydCB7IFBhcnRpY2lwYW50UmVzcG9uc2UgfSBmcm9tIFwiLi9jb3JlL3BhcnRpY2lwYW50LXJlc3BvbnNlXCI7XG5pbXBvcnQgeyBNZXNzYWdlIH0gZnJvbSBcIi4vY29yZS9tZXNzYWdlXCI7XG5pbXBvcnQgeyBNZXNzYWdlVHlwZSB9IGZyb20gXCIuL2NvcmUvbWVzc2FnZS10eXBlLmVudW1cIjtcbmltcG9ydCB7IFdpbmRvdyB9IGZyb20gXCIuL2NvcmUvd2luZG93XCI7XG5pbXBvcnQgeyBDaGF0UGFydGljaXBhbnRTdGF0dXMgfSBmcm9tIFwiLi9jb3JlL2NoYXQtcGFydGljaXBhbnQtc3RhdHVzLmVudW1cIjtcbmltcG9ydCB7IFNjcm9sbERpcmVjdGlvbiB9IGZyb20gXCIuL2NvcmUvc2Nyb2xsLWRpcmVjdGlvbi5lbnVtXCI7XG5pbXBvcnQgeyBMb2NhbGl6YXRpb24sIFN0YXR1c0Rlc2NyaXB0aW9uIH0gZnJvbSAnLi9jb3JlL2xvY2FsaXphdGlvbic7XG5pbXBvcnQgeyBJQ2hhdENvbnRyb2xsZXIgfSBmcm9tICcuL2NvcmUvY2hhdC1jb250cm9sbGVyJztcbmltcG9ydCB7IFBhZ2VkSGlzdG9yeUNoYXRBZGFwdGVyIH0gZnJvbSAnLi9jb3JlL3BhZ2VkLWhpc3RvcnktY2hhdC1hZGFwdGVyJztcbmltcG9ydCB7IElGaWxlVXBsb2FkQWRhcHRlciB9IGZyb20gJy4vY29yZS9maWxlLXVwbG9hZC1hZGFwdGVyJztcbmltcG9ydCB7IERlZmF1bHRGaWxlVXBsb2FkQWRhcHRlciB9IGZyb20gJy4vY29yZS9kZWZhdWx0LWZpbGUtdXBsb2FkLWFkYXB0ZXInO1xuaW1wb3J0IHsgVGhlbWUgfSBmcm9tICcuL2NvcmUvdGhlbWUuZW51bSc7XG5pbXBvcnQgeyBJQ2hhdE9wdGlvbiB9IGZyb20gJy4vY29yZS9jaGF0LW9wdGlvbic7XG5pbXBvcnQgeyBHcm91cCB9IGZyb20gXCIuL2NvcmUvZ3JvdXBcIjtcbmltcG9ydCB7IENoYXRQYXJ0aWNpcGFudFR5cGUgfSBmcm9tIFwiLi9jb3JlL2NoYXQtcGFydGljaXBhbnQtdHlwZS5lbnVtXCI7XG5pbXBvcnQgeyBJQ2hhdFBhcnRpY2lwYW50IH0gZnJvbSBcIi4vY29yZS9jaGF0LXBhcnRpY2lwYW50XCI7XG5cbmltcG9ydCB7IG1hcCB9IGZyb20gJ3J4anMvb3BlcmF0b3JzJztcbmltcG9ydCB7IE5nQ2hhdFdpbmRvd0NvbXBvbmVudCB9IGZyb20gJy4vY29tcG9uZW50cy9uZy1jaGF0LXdpbmRvdy9uZy1jaGF0LXdpbmRvdy5jb21wb25lbnQnO1xuXG5AQ29tcG9uZW50KHtcbiAgICBzZWxlY3RvcjogJ25nLWNoYXQnLFxuICAgIHRlbXBsYXRlVXJsOiAnbmctY2hhdC5jb21wb25lbnQuaHRtbCcsXG4gICAgc3R5bGVVcmxzOiBbXG4gICAgICAgICdhc3NldHMvaWNvbnMuY3NzJyxcbiAgICAgICAgJ2Fzc2V0cy9sb2FkaW5nLXNwaW5uZXIuY3NzJyxcbiAgICAgICAgJ2Fzc2V0cy9uZy1jaGF0LmNvbXBvbmVudC5kZWZhdWx0LmNzcycsXG4gICAgICAgICdhc3NldHMvdGhlbWVzL25nLWNoYXQudGhlbWUuZGVmYXVsdC5zY3NzJyxcbiAgICAgICAgJ2Fzc2V0cy90aGVtZXMvbmctY2hhdC50aGVtZS5kYXJrLnNjc3MnXG4gICAgXSxcbiAgICBlbmNhcHN1bGF0aW9uOiBWaWV3RW5jYXBzdWxhdGlvbi5Ob25lXG59KVxuXG5leHBvcnQgY2xhc3MgTmdDaGF0IGltcGxlbWVudHMgT25Jbml0LCBJQ2hhdENvbnRyb2xsZXIge1xuICAgIGNvbnN0cnVjdG9yKHByaXZhdGUgX2h0dHBDbGllbnQ6IEh0dHBDbGllbnQpIHsgfVxuXG4gICAgLy8gRXhwb3NlcyBlbnVtcyBmb3IgdGhlIG5nLXRlbXBsYXRlXG4gICAgcHVibGljIENoYXRQYXJ0aWNpcGFudFR5cGUgPSBDaGF0UGFydGljaXBhbnRUeXBlO1xuICAgIHB1YmxpYyBDaGF0UGFydGljaXBhbnRTdGF0dXMgPSBDaGF0UGFydGljaXBhbnRTdGF0dXM7XG4gICAgcHVibGljIE1lc3NhZ2VUeXBlID0gTWVzc2FnZVR5cGU7XG5cbiAgICBwcml2YXRlIF9pc0Rpc2FibGVkOiBib29sZWFuID0gZmFsc2U7XG5cbiAgICBnZXQgaXNEaXNhYmxlZCgpOiBib29sZWFuIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2lzRGlzYWJsZWQ7XG4gICAgfVxuXG4gICAgQElucHV0KClcbiAgICBzZXQgaXNEaXNhYmxlZCh2YWx1ZTogYm9vbGVhbikge1xuICAgICAgICB0aGlzLl9pc0Rpc2FibGVkID0gdmFsdWU7XG5cbiAgICAgICAgaWYgKHZhbHVlKSB7XG4gICAgICAgICAgICAvLyBUbyBhZGRyZXNzIGlzc3VlIGh0dHBzOi8vZ2l0aHViLmNvbS9ycGFzY2hvYWwvbmctY2hhdC9pc3N1ZXMvMTIwXG4gICAgICAgICAgICB3aW5kb3cuY2xlYXJJbnRlcnZhbCh0aGlzLnBvbGxpbmdJbnRlcnZhbFdpbmRvd0luc3RhbmNlKVxuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5hY3RpdmF0ZUZyaWVuZExpc3RGZXRjaCgpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgQElucHV0KClcbiAgICBwdWJsaWMgYWRhcHRlcjogQ2hhdEFkYXB0ZXI7XG5cbiAgICBASW5wdXQoKVxuICAgIHB1YmxpYyBncm91cEFkYXB0ZXI6IElDaGF0R3JvdXBBZGFwdGVyO1xuXG4gICAgQElucHV0KClcbiAgICBwdWJsaWMgdXNlcklkOiBhbnk7XG5cbiAgICBASW5wdXQoKVxuICAgIHB1YmxpYyBpc0NvbGxhcHNlZDogYm9vbGVhbiA9IGZhbHNlO1xuXG4gICAgQElucHV0KClcbiAgICBwdWJsaWMgbWF4aW1pemVXaW5kb3dPbk5ld01lc3NhZ2U6IGJvb2xlYW4gPSB0cnVlO1xuXG4gICAgQElucHV0KClcbiAgICBwdWJsaWMgcG9sbEZyaWVuZHNMaXN0OiBib29sZWFuID0gZmFsc2U7XG5cbiAgICBASW5wdXQoKVxuICAgIHB1YmxpYyBwb2xsaW5nSW50ZXJ2YWw6IG51bWJlciA9IDUwMDA7XG5cbiAgICBASW5wdXQoKVxuICAgIHB1YmxpYyBoaXN0b3J5RW5hYmxlZDogYm9vbGVhbiA9IHRydWU7XG5cbiAgICBASW5wdXQoKVxuICAgIHB1YmxpYyBlbW9qaXNFbmFibGVkOiBib29sZWFuID0gdHJ1ZTtcblxuICAgIEBJbnB1dCgpXG4gICAgcHVibGljIGxpbmtmeUVuYWJsZWQ6IGJvb2xlYW4gPSB0cnVlO1xuXG4gICAgQElucHV0KClcbiAgICBwdWJsaWMgYXVkaW9FbmFibGVkOiBib29sZWFuID0gdHJ1ZTtcblxuICAgIEBJbnB1dCgpXG4gICAgcHVibGljIHNlYXJjaEVuYWJsZWQ6IGJvb2xlYW4gPSB0cnVlO1xuXG4gICAgQElucHV0KCkgLy8gVE9ETzogVGhpcyBtaWdodCBuZWVkIGEgYmV0dGVyIGNvbnRlbnQgc3RyYXRlZ3lcbiAgICBwdWJsaWMgYXVkaW9Tb3VyY2U6IHN0cmluZyA9ICdodHRwczovL3Jhdy5naXRodWJ1c2VyY29udGVudC5jb20vcnBhc2Nob2FsL25nLWNoYXQvbWFzdGVyL3NyYy9uZy1jaGF0L2Fzc2V0cy9ub3RpZmljYXRpb24ud2F2JztcblxuICAgIEBJbnB1dCgpXG4gICAgcHVibGljIHBlcnNpc3RXaW5kb3dzU3RhdGU6IGJvb2xlYW4gPSB0cnVlO1xuXG4gICAgQElucHV0KClcbiAgICBwdWJsaWMgdGl0bGU6IHN0cmluZyA9IFwiRnJpZW5kc1wiO1xuXG4gICAgQElucHV0KClcbiAgICBwdWJsaWMgbWVzc2FnZVBsYWNlaG9sZGVyOiBzdHJpbmcgPSBcIlR5cGUgYSBtZXNzYWdlXCI7XG5cbiAgICBASW5wdXQoKVxuICAgIHB1YmxpYyBzZWFyY2hQbGFjZWhvbGRlcjogc3RyaW5nID0gXCJTZWFyY2hcIjtcblxuICAgIEBJbnB1dCgpXG4gICAgcHVibGljIGJyb3dzZXJOb3RpZmljYXRpb25zRW5hYmxlZDogYm9vbGVhbiA9IHRydWU7XG5cbiAgICBASW5wdXQoKSAvLyBUT0RPOiBUaGlzIG1pZ2h0IG5lZWQgYSBiZXR0ZXIgY29udGVudCBzdHJhdGVneVxuICAgIHB1YmxpYyBicm93c2VyTm90aWZpY2F0aW9uSWNvblNvdXJjZTogc3RyaW5nID0gJ2h0dHBzOi8vcmF3LmdpdGh1YnVzZXJjb250ZW50LmNvbS9ycGFzY2hvYWwvbmctY2hhdC9tYXN0ZXIvc3JjL25nLWNoYXQvYXNzZXRzL25vdGlmaWNhdGlvbi5wbmcnO1xuXG4gICAgQElucHV0KClcbiAgICBwdWJsaWMgYnJvd3Nlck5vdGlmaWNhdGlvblRpdGxlOiBzdHJpbmcgPSBcIk5ldyBtZXNzYWdlIGZyb21cIjtcblxuICAgIEBJbnB1dCgpXG4gICAgcHVibGljIGhpc3RvcnlQYWdlU2l6ZTogbnVtYmVyID0gMTA7XG5cbiAgICBASW5wdXQoKVxuICAgIHB1YmxpYyBsb2NhbGl6YXRpb246IExvY2FsaXphdGlvbjtcblxuICAgIEBJbnB1dCgpXG4gICAgcHVibGljIGhpZGVGcmllbmRzTGlzdDogYm9vbGVhbiA9IGZhbHNlO1xuXG4gICAgQElucHV0KClcbiAgICBwdWJsaWMgaGlkZUZyaWVuZHNMaXN0T25VbnN1cHBvcnRlZFZpZXdwb3J0OiBib29sZWFuID0gdHJ1ZTtcblxuICAgIEBJbnB1dCgpXG4gICAgcHVibGljIGZpbGVVcGxvYWRVcmw6IHN0cmluZztcblxuICAgIEBJbnB1dCgpXG4gICAgcHVibGljIHRoZW1lOiBUaGVtZSA9IFRoZW1lLkxpZ2h0O1xuXG4gICAgQElucHV0KClcbiAgICBwdWJsaWMgY3VzdG9tVGhlbWU6IHN0cmluZztcblxuICAgIEBJbnB1dCgpXG4gICAgcHVibGljIG1lc3NhZ2VEYXRlUGlwZUZvcm1hdDogc3RyaW5nID0gXCJzaG9ydFwiO1xuXG4gICAgQElucHV0KClcbiAgICBwdWJsaWMgc2hvd01lc3NhZ2VEYXRlOiBib29sZWFuID0gdHJ1ZTtcblxuICAgIEBJbnB1dCgpXG4gICAgcHVibGljIGlzVmlld3BvcnRPbk1vYmlsZUVuYWJsZWQ6IGJvb2xlYW4gPSBmYWxzZTtcblxuICAgIEBJbnB1dCgpXG4gICAgcHVibGljIHNob3dDbG9zZUJ1dHRvbjogYm9vbGVhbiA9IHRydWU7XG5cbiAgICBwdWJsaWMgYmVmb3JlUGFydGVjaWFudENoYXRDbG9zZWQ6IChhcmcwOiBJQ2hhdFBhcnRpY2lwYW50KSA9PiBib29sZWFuO1xuXG4gICAgQE91dHB1dCgpXG4gICAgcHVibGljIG9uUGFydGljaXBhbnRDbGlja2VkOiBFdmVudEVtaXR0ZXI8SUNoYXRQYXJ0aWNpcGFudD4gPSBuZXcgRXZlbnRFbWl0dGVyPElDaGF0UGFydGljaXBhbnQ+KCk7XG5cbiAgICBAT3V0cHV0KClcbiAgICBwdWJsaWMgb25QYXJ0aWNpcGFudENoYXRPcGVuZWQ6IEV2ZW50RW1pdHRlcjxJQ2hhdFBhcnRpY2lwYW50PiA9IG5ldyBFdmVudEVtaXR0ZXI8SUNoYXRQYXJ0aWNpcGFudD4oKTtcblxuICAgIEBPdXRwdXQoKVxuICAgIHB1YmxpYyBvblBhcnRpY2lwYW50Q2hhdENsb3NlZDogRXZlbnRFbWl0dGVyPElDaGF0UGFydGljaXBhbnQ+ID0gbmV3IEV2ZW50RW1pdHRlcjxJQ2hhdFBhcnRpY2lwYW50PigpO1xuXG4gICAgQE91dHB1dCgpXG4gICAgcHVibGljIG9uTWVzc2FnZXNTZWVuOiBFdmVudEVtaXR0ZXI8TWVzc2FnZVtdPiA9IG5ldyBFdmVudEVtaXR0ZXI8TWVzc2FnZVtdPigpO1xuXG4gICAgQE91dHB1dCgpXG4gICAgcHVibGljIG9uUGFydGljaXBhbnRUb2dnbGU6IEV2ZW50RW1pdHRlcjx7IHBhcnRpY2lwYW50OiBJQ2hhdFBhcnRpY2lwYW50LCBpc0NvbGxhcHNlZDogYm9vbGVhbiB9PiA9IG5ldyBFdmVudEVtaXR0ZXI8eyBwYXJ0aWNpcGFudDogSUNoYXRQYXJ0aWNpcGFudCwgaXNDb2xsYXBzZWQ6IGJvb2xlYW4gfT4oKTtcblxuICAgIHByaXZhdGUgYnJvd3Nlck5vdGlmaWNhdGlvbnNCb290c3RyYXBwZWQ6IGJvb2xlYW4gPSBmYWxzZTtcblxuICAgIHB1YmxpYyBoYXNQYWdlZEhpc3Rvcnk6IGJvb2xlYW4gPSBmYWxzZTtcblxuICAgIC8vIERvbid0IHdhbnQgdG8gYWRkIHRoaXMgYXMgYSBzZXR0aW5nIHRvIHNpbXBsaWZ5IHVzYWdlLiBQcmV2aW91cyBwbGFjZWhvbGRlciBhbmQgdGl0bGUgc2V0dGluZ3MgYXZhaWxhYmxlIHRvIGJlIHVzZWQsIG9yIHVzZSBmdWxsIExvY2FsaXphdGlvbiBvYmplY3QuXG4gICAgcHJpdmF0ZSBzdGF0dXNEZXNjcmlwdGlvbjogU3RhdHVzRGVzY3JpcHRpb24gPSB7XG4gICAgICAgIG9ubGluZTogJ09ubGluZScsXG4gICAgICAgIGJ1c3k6ICdCdXN5JyxcbiAgICAgICAgYXdheTogJ0F3YXknLFxuICAgICAgICBvZmZsaW5lOiAnT2ZmbGluZSdcbiAgICB9O1xuXG4gICAgcHJpdmF0ZSBhdWRpb0ZpbGU6IEhUTUxBdWRpb0VsZW1lbnQ7XG5cbiAgICBwdWJsaWMgcGFydGljaXBhbnRzOiBJQ2hhdFBhcnRpY2lwYW50W107XG5cbiAgICBwdWJsaWMgcGFydGljaXBhbnRzUmVzcG9uc2U6IFBhcnRpY2lwYW50UmVzcG9uc2VbXTtcblxuICAgIHB1YmxpYyBwYXJ0aWNpcGFudHNJbnRlcmFjdGVkV2l0aDogSUNoYXRQYXJ0aWNpcGFudFtdID0gW107XG5cbiAgICBwdWJsaWMgY3VycmVudEFjdGl2ZU9wdGlvbjogSUNoYXRPcHRpb24gfCBudWxsO1xuXG4gICAgcHJpdmF0ZSBwb2xsaW5nSW50ZXJ2YWxXaW5kb3dJbnN0YW5jZTogbnVtYmVyO1xuXG4gICAgcHJpdmF0ZSBnZXQgbG9jYWxTdG9yYWdlS2V5KCk6IHN0cmluZyB7XG4gICAgICAgIHJldHVybiBgbmctY2hhdC11c2Vycy0ke3RoaXMudXNlcklkfWA7IC8vIEFwcGVuZGluZyB0aGUgdXNlciBpZCBzbyB0aGUgc3RhdGUgaXMgdW5pcXVlIHBlciB1c2VyIGluIGEgY29tcHV0ZXIuICAgXG4gICAgfTtcblxuICAgIC8vIERlZmluZXMgdGhlIHNpemUgb2YgZWFjaCBvcGVuZWQgd2luZG93IHRvIGNhbGN1bGF0ZSBob3cgbWFueSB3aW5kb3dzIGNhbiBiZSBvcGVuZWQgb24gdGhlIHZpZXdwb3J0IGF0IHRoZSBzYW1lIHRpbWUuXG4gICAgcHVibGljIHdpbmRvd1NpemVGYWN0b3I6IG51bWJlciA9IDMyMDtcblxuICAgIC8vIFRvdGFsIHdpZHRoIHNpemUgb2YgdGhlIGZyaWVuZHMgbGlzdCBzZWN0aW9uXG4gICAgcHVibGljIGZyaWVuZHNMaXN0V2lkdGg6IG51bWJlciA9IDI2MjtcblxuICAgIC8vIEF2YWlsYWJsZSBhcmVhIHRvIHJlbmRlciB0aGUgcGx1Z2luXG4gICAgcHJpdmF0ZSB2aWV3UG9ydFRvdGFsQXJlYTogbnVtYmVyO1xuXG4gICAgLy8gU2V0IHRvIHRydWUgaWYgdGhlcmUgaXMgbm8gc3BhY2UgdG8gZGlzcGxheSBhdCBsZWFzdCBvbmUgY2hhdCB3aW5kb3cgYW5kICdoaWRlRnJpZW5kc0xpc3RPblVuc3VwcG9ydGVkVmlld3BvcnQnIGlzIHRydWVcbiAgICBwdWJsaWMgdW5zdXBwb3J0ZWRWaWV3cG9ydDogYm9vbGVhbiA9IGZhbHNlO1xuXG4gICAgLy8gRmlsZSB1cGxvYWQgYWRhcHRlclxuICAgIHB1YmxpYyBmaWxlVXBsb2FkQWRhcHRlcjogSUZpbGVVcGxvYWRBZGFwdGVyO1xuXG4gICAgd2luZG93czogV2luZG93W10gPSBbXTtcbiAgICBpc0Jvb3RzdHJhcHBlZDogYm9vbGVhbiA9IGZhbHNlO1xuXG4gICAgQFZpZXdDaGlsZHJlbignY2hhdFdpbmRvdycpIGNoYXRXaW5kb3dzOiBRdWVyeUxpc3Q8TmdDaGF0V2luZG93Q29tcG9uZW50PjtcblxuICAgIG5nT25Jbml0KCkge1xuICAgICAgICB0aGlzLmJvb3RzdHJhcENoYXQoKTtcbiAgICB9XG5cbiAgICBASG9zdExpc3RlbmVyKCd3aW5kb3c6cmVzaXplJywgWyckZXZlbnQnXSlcbiAgICBvblJlc2l6ZShldmVudDogYW55KSB7XG4gICAgICAgIHRoaXMudmlld1BvcnRUb3RhbEFyZWEgPSBldmVudC50YXJnZXQuaW5uZXJXaWR0aDtcblxuICAgICAgICB0aGlzLk5vcm1hbGl6ZVdpbmRvd3MoKTtcbiAgICB9XG5cbiAgICAvLyBDaGVja3MgaWYgdGhlcmUgYXJlIG1vcmUgb3BlbmVkIHdpbmRvd3MgdGhhbiB0aGUgdmlldyBwb3J0IGNhbiBkaXNwbGF5XG4gICAgcHJpdmF0ZSBOb3JtYWxpemVXaW5kb3dzKCk6IHZvaWQge1xuICAgICAgICBjb25zdCBtYXhTdXBwb3J0ZWRPcGVuZWRXaW5kb3dzID0gTWF0aC5mbG9vcigodGhpcy52aWV3UG9ydFRvdGFsQXJlYSAtICghdGhpcy5oaWRlRnJpZW5kc0xpc3QgPyB0aGlzLmZyaWVuZHNMaXN0V2lkdGggOiAwKSkgLyB0aGlzLndpbmRvd1NpemVGYWN0b3IpO1xuICAgICAgICBjb25zdCBkaWZmZXJlbmNlID0gdGhpcy53aW5kb3dzLmxlbmd0aCAtIG1heFN1cHBvcnRlZE9wZW5lZFdpbmRvd3M7XG5cbiAgICAgICAgaWYgKGRpZmZlcmVuY2UgPj0gMCkge1xuICAgICAgICAgICAgdGhpcy53aW5kb3dzLnNwbGljZSh0aGlzLndpbmRvd3MubGVuZ3RoIC0gZGlmZmVyZW5jZSk7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLnVwZGF0ZVdpbmRvd3NTdGF0ZSh0aGlzLndpbmRvd3MpO1xuXG4gICAgICAgIC8vIFZpZXdwb3J0IHNob3VsZCBoYXZlIHNwYWNlIGZvciBhdCBsZWFzdCBvbmUgY2hhdCB3aW5kb3cgYnV0IHNob3VsZCBzaG93IGluIG1vYmlsZSBpZiBvcHRpb24gaXMgZW5hYmxlZC5cbiAgICAgICAgdGhpcy51bnN1cHBvcnRlZFZpZXdwb3J0ID0gdGhpcy5pc1ZpZXdwb3J0T25Nb2JpbGVFbmFibGVkID8gZmFsc2UgOiB0aGlzLmhpZGVGcmllbmRzTGlzdE9uVW5zdXBwb3J0ZWRWaWV3cG9ydCAmJiBtYXhTdXBwb3J0ZWRPcGVuZWRXaW5kb3dzIDwgMTtcbiAgICB9XG5cbiAgICAvLyBJbml0aWFsaXplcyB0aGUgY2hhdCBwbHVnaW4gYW5kIHRoZSBtZXNzYWdpbmcgYWRhcHRlclxuICAgIHByaXZhdGUgYm9vdHN0cmFwQ2hhdCgpOiB2b2lkIHtcbiAgICAgICAgbGV0IGluaXRpYWxpemF0aW9uRXhjZXB0aW9uID0gbnVsbDtcblxuICAgICAgICBpZiAodGhpcy5hZGFwdGVyICE9IG51bGwgJiYgdGhpcy51c2VySWQgIT0gbnVsbCkge1xuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICB0aGlzLnZpZXdQb3J0VG90YWxBcmVhID0gd2luZG93LmlubmVyV2lkdGg7XG5cbiAgICAgICAgICAgICAgICB0aGlzLmluaXRpYWxpemVUaGVtZSgpO1xuICAgICAgICAgICAgICAgIHRoaXMuaW5pdGlhbGl6ZURlZmF1bHRUZXh0KCk7XG4gICAgICAgICAgICAgICAgdGhpcy5pbml0aWFsaXplQnJvd3Nlck5vdGlmaWNhdGlvbnMoKTtcblxuICAgICAgICAgICAgICAgIC8vIEJpbmRpbmcgZXZlbnQgbGlzdGVuZXJzXG4gICAgICAgICAgICAgICAgdGhpcy5hZGFwdGVyLm1lc3NhZ2VSZWNlaXZlZEhhbmRsZXIgPSAocGFydGljaXBhbnQsIG1zZykgPT4gdGhpcy5vbk1lc3NhZ2VSZWNlaXZlZChwYXJ0aWNpcGFudCwgbXNnKTtcbiAgICAgICAgICAgICAgICB0aGlzLmFkYXB0ZXIuZnJpZW5kc0xpc3RDaGFuZ2VkSGFuZGxlciA9IChwYXJ0aWNpcGFudHNSZXNwb25zZSkgPT4gdGhpcy5vbkZyaWVuZHNMaXN0Q2hhbmdlZChwYXJ0aWNpcGFudHNSZXNwb25zZSk7XG5cbiAgICAgICAgICAgICAgICB0aGlzLmFjdGl2YXRlRnJpZW5kTGlzdEZldGNoKCk7XG5cbiAgICAgICAgICAgICAgICB0aGlzLmJ1ZmZlckF1ZGlvRmlsZSgpO1xuXG4gICAgICAgICAgICAgICAgdGhpcy5oYXNQYWdlZEhpc3RvcnkgPSB0aGlzLmFkYXB0ZXIgaW5zdGFuY2VvZiBQYWdlZEhpc3RvcnlDaGF0QWRhcHRlcjtcblxuICAgICAgICAgICAgICAgIGlmICh0aGlzLmZpbGVVcGxvYWRVcmwgJiYgdGhpcy5maWxlVXBsb2FkVXJsICE9PSBcIlwiKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZmlsZVVwbG9hZEFkYXB0ZXIgPSBuZXcgRGVmYXVsdEZpbGVVcGxvYWRBZGFwdGVyKHRoaXMuZmlsZVVwbG9hZFVybCwgdGhpcy5faHR0cENsaWVudCk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgdGhpcy5Ob3JtYWxpemVXaW5kb3dzKCk7XG5cbiAgICAgICAgICAgICAgICB0aGlzLmlzQm9vdHN0cmFwcGVkID0gdHJ1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNhdGNoIChleCkge1xuICAgICAgICAgICAgICAgIGluaXRpYWxpemF0aW9uRXhjZXB0aW9uID0gZXg7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoIXRoaXMuaXNCb290c3RyYXBwZWQpIHtcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoXCJuZy1jaGF0IGNvbXBvbmVudCBjb3VsZG4ndCBiZSBib290c3RyYXBwZWQuXCIpO1xuXG4gICAgICAgICAgICBpZiAodGhpcy51c2VySWQgPT0gbnVsbCkge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoXCJuZy1jaGF0IGNhbid0IGJlIGluaXRpYWxpemVkIHdpdGhvdXQgYW4gdXNlciBpZC4gUGxlYXNlIG1ha2Ugc3VyZSB5b3UndmUgcHJvdmlkZWQgYW4gdXNlcklkIGFzIGEgcGFyYW1ldGVyIG9mIHRoZSBuZy1jaGF0IGNvbXBvbmVudC5cIik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAodGhpcy5hZGFwdGVyID09IG51bGwpIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKFwibmctY2hhdCBjYW4ndCBiZSBib290c3RyYXBwZWQgd2l0aG91dCBhIENoYXRBZGFwdGVyLiBQbGVhc2UgbWFrZSBzdXJlIHlvdSd2ZSBwcm92aWRlZCBhIENoYXRBZGFwdGVyIGltcGxlbWVudGF0aW9uIGFzIGEgcGFyYW1ldGVyIG9mIHRoZSBuZy1jaGF0IGNvbXBvbmVudC5cIik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoaW5pdGlhbGl6YXRpb25FeGNlcHRpb24pIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKGBBbiBleGNlcHRpb24gaGFzIG9jY3VycmVkIHdoaWxlIGluaXRpYWxpemluZyBuZy1jaGF0LiBEZXRhaWxzOiAke2luaXRpYWxpemF0aW9uRXhjZXB0aW9uLm1lc3NhZ2V9YCk7XG4gICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcihpbml0aWFsaXphdGlvbkV4Y2VwdGlvbik7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwcml2YXRlIGFjdGl2YXRlRnJpZW5kTGlzdEZldGNoKCk6IHZvaWQge1xuICAgICAgICBpZiAodGhpcy5hZGFwdGVyKSB7XG4gICAgICAgICAgICAvLyBMb2FkaW5nIGN1cnJlbnQgdXNlcnMgbGlzdFxuICAgICAgICAgICAgaWYgKHRoaXMucG9sbEZyaWVuZHNMaXN0KSB7XG4gICAgICAgICAgICAgICAgLy8gU2V0dGluZyBhIGxvbmcgcG9sbCBpbnRlcnZhbCB0byB1cGRhdGUgdGhlIGZyaWVuZHMgbGlzdFxuICAgICAgICAgICAgICAgIHRoaXMuZmV0Y2hGcmllbmRzTGlzdCh0cnVlKTtcbiAgICAgICAgICAgICAgICB0aGlzLnBvbGxpbmdJbnRlcnZhbFdpbmRvd0luc3RhbmNlID0gd2luZG93LnNldEludGVydmFsKCgpID0+IHRoaXMuZmV0Y2hGcmllbmRzTGlzdChmYWxzZSksIHRoaXMucG9sbGluZ0ludGVydmFsKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIC8vIFNpbmNlIHBvbGxpbmcgd2FzIGRpc2FibGVkLCBhIGZyaWVuZHMgbGlzdCB1cGRhdGUgbWVjaGFuaXNtIHdpbGwgaGF2ZSB0byBiZSBpbXBsZW1lbnRlZCBpbiB0aGUgQ2hhdEFkYXB0ZXIuXG4gICAgICAgICAgICAgICAgdGhpcy5mZXRjaEZyaWVuZHNMaXN0KHRydWUpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgLy8gSW5pdGlhbGl6ZXMgYnJvd3NlciBub3RpZmljYXRpb25zXG4gICAgcHJpdmF0ZSBhc3luYyBpbml0aWFsaXplQnJvd3Nlck5vdGlmaWNhdGlvbnMoKSB7XG4gICAgICAgIGlmICh0aGlzLmJyb3dzZXJOb3RpZmljYXRpb25zRW5hYmxlZCAmJiAoXCJOb3RpZmljYXRpb25cIiBpbiB3aW5kb3cpKSB7XG4gICAgICAgICAgICBpZiAoYXdhaXQgTm90aWZpY2F0aW9uLnJlcXVlc3RQZXJtaXNzaW9uKCkgPT09IFwiZ3JhbnRlZFwiKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5icm93c2VyTm90aWZpY2F0aW9uc0Jvb3RzdHJhcHBlZCA9IHRydWU7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBJbml0aWFsaXplcyBkZWZhdWx0IHRleHRcbiAgICBwcml2YXRlIGluaXRpYWxpemVEZWZhdWx0VGV4dCgpOiB2b2lkIHtcbiAgICAgICAgaWYgKCF0aGlzLmxvY2FsaXphdGlvbikge1xuICAgICAgICAgICAgdGhpcy5sb2NhbGl6YXRpb24gPSB7XG4gICAgICAgICAgICAgICAgbWVzc2FnZVBsYWNlaG9sZGVyOiB0aGlzLm1lc3NhZ2VQbGFjZWhvbGRlcixcbiAgICAgICAgICAgICAgICBzZWFyY2hQbGFjZWhvbGRlcjogdGhpcy5zZWFyY2hQbGFjZWhvbGRlcixcbiAgICAgICAgICAgICAgICB0aXRsZTogdGhpcy50aXRsZSxcbiAgICAgICAgICAgICAgICBzdGF0dXNEZXNjcmlwdGlvbjogdGhpcy5zdGF0dXNEZXNjcmlwdGlvbixcbiAgICAgICAgICAgICAgICBicm93c2VyTm90aWZpY2F0aW9uVGl0bGU6IHRoaXMuYnJvd3Nlck5vdGlmaWNhdGlvblRpdGxlLFxuICAgICAgICAgICAgICAgIGxvYWRNZXNzYWdlSGlzdG9yeVBsYWNlaG9sZGVyOiBcIkxvYWQgb2xkZXIgbWVzc2FnZXNcIlxuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHByaXZhdGUgaW5pdGlhbGl6ZVRoZW1lKCk6IHZvaWQge1xuICAgICAgICBpZiAodGhpcy5jdXN0b21UaGVtZSkge1xuICAgICAgICAgICAgdGhpcy50aGVtZSA9IFRoZW1lLkN1c3RvbTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmICh0aGlzLnRoZW1lICE9IFRoZW1lLkxpZ2h0ICYmIHRoaXMudGhlbWUgIT0gVGhlbWUuRGFyaykge1xuICAgICAgICAgICAgLy8gVE9ETzogVXNlIGVzMjAxNyBpbiBmdXR1cmUgd2l0aCBPYmplY3QudmFsdWVzKFRoZW1lKS5pbmNsdWRlcyh0aGlzLnRoZW1lKSB0byBkbyB0aGlzIGNoZWNrXG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYEludmFsaWQgdGhlbWUgY29uZmlndXJhdGlvbiBmb3IgbmctY2hhdC4gXCIke3RoaXMudGhlbWV9XCIgaXMgbm90IGEgdmFsaWQgdGhlbWUgdmFsdWUuYCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBTZW5kcyBhIHJlcXVlc3QgdG8gbG9hZCB0aGUgZnJpZW5kcyBsaXN0XG4gICAgcHVibGljIGZldGNoRnJpZW5kc0xpc3QoaXNCb290c3RyYXBwaW5nOiBib29sZWFuKTogdm9pZCB7XG4gICAgICAgIHRoaXMuYWRhcHRlci5saXN0RnJpZW5kcygpXG4gICAgICAgICAgICAucGlwZShcbiAgICAgICAgICAgICAgICBtYXAoKHBhcnRpY2lwYW50c1Jlc3BvbnNlOiBQYXJ0aWNpcGFudFJlc3BvbnNlW10pID0+IHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5wYXJ0aWNpcGFudHNSZXNwb25zZSA9IHBhcnRpY2lwYW50c1Jlc3BvbnNlO1xuXG4gICAgICAgICAgICAgICAgICAgIHRoaXMucGFydGljaXBhbnRzID0gcGFydGljaXBhbnRzUmVzcG9uc2UubWFwKChyZXNwb25zZTogUGFydGljaXBhbnRSZXNwb25zZSkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHJlc3BvbnNlLnBhcnRpY2lwYW50O1xuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgKS5zdWJzY3JpYmUoKCkgPT4ge1xuICAgICAgICAgICAgICAgIGlmIChpc0Jvb3RzdHJhcHBpbmcpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5yZXN0b3JlV2luZG93c1N0YXRlKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgZmV0Y2hNZXNzYWdlSGlzdG9yeSh3aW5kb3c6IFdpbmRvdykge1xuICAgICAgICAvLyBOb3QgaWRlYWwgYnV0IHdpbGwga2VlcCB0aGlzIHVudGlsIHdlIGRlY2lkZSBpZiB3ZSBhcmUgc2hpcHBpbmcgcGFnaW5hdGlvbiB3aXRoIHRoZSBkZWZhdWx0IGFkYXB0ZXJcbiAgICAgICAgaWYgKHRoaXMuYWRhcHRlciBpbnN0YW5jZW9mIFBhZ2VkSGlzdG9yeUNoYXRBZGFwdGVyKSB7XG4gICAgICAgICAgICB3aW5kb3cuaXNMb2FkaW5nSGlzdG9yeSA9IHRydWU7XG5cbiAgICAgICAgICAgIHRoaXMuYWRhcHRlci5nZXRNZXNzYWdlSGlzdG9yeUJ5UGFnZSh3aW5kb3cucGFydGljaXBhbnQuaWQsIHRoaXMuaGlzdG9yeVBhZ2VTaXplLCArK3dpbmRvdy5oaXN0b3J5UGFnZSlcbiAgICAgICAgICAgICAgICAucGlwZShcbiAgICAgICAgICAgICAgICAgICAgbWFwKChyZXN1bHQ6IE1lc3NhZ2VbXSkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmVzdWx0LmZvckVhY2goKG1lc3NhZ2UpID0+IHRoaXMuYXNzZXJ0TWVzc2FnZVR5cGUobWVzc2FnZSkpO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICB3aW5kb3cubWVzc2FnZXMgPSByZXN1bHQuY29uY2F0KHdpbmRvdy5tZXNzYWdlcyk7XG4gICAgICAgICAgICAgICAgICAgICAgICB3aW5kb3cuaXNMb2FkaW5nSGlzdG9yeSA9IGZhbHNlO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBkaXJlY3Rpb246IFNjcm9sbERpcmVjdGlvbiA9ICh3aW5kb3cuaGlzdG9yeVBhZ2UgPT0gMSkgPyBTY3JvbGxEaXJlY3Rpb24uQm90dG9tIDogU2Nyb2xsRGlyZWN0aW9uLlRvcDtcbiAgICAgICAgICAgICAgICAgICAgICAgIHdpbmRvdy5oYXNNb3JlTWVzc2FnZXMgPSByZXN1bHQubGVuZ3RoID09IHRoaXMuaGlzdG9yeVBhZ2VTaXplO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHRoaXMub25GZXRjaE1lc3NhZ2VIaXN0b3J5TG9hZGVkKHJlc3VsdCwgd2luZG93LCBkaXJlY3Rpb24sIHRydWUpKTtcbiAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICApLnN1YnNjcmliZSgpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5hZGFwdGVyLmdldE1lc3NhZ2VIaXN0b3J5KHdpbmRvdy5wYXJ0aWNpcGFudC5pZClcbiAgICAgICAgICAgICAgICAucGlwZShcbiAgICAgICAgICAgICAgICAgICAgbWFwKChyZXN1bHQ6IE1lc3NhZ2VbXSkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmVzdWx0LmZvckVhY2goKG1lc3NhZ2UpID0+IHRoaXMuYXNzZXJ0TWVzc2FnZVR5cGUobWVzc2FnZSkpO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICB3aW5kb3cubWVzc2FnZXMgPSByZXN1bHQuY29uY2F0KHdpbmRvdy5tZXNzYWdlcyk7XG4gICAgICAgICAgICAgICAgICAgICAgICB3aW5kb3cuaXNMb2FkaW5nSGlzdG9yeSA9IGZhbHNlO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHRoaXMub25GZXRjaE1lc3NhZ2VIaXN0b3J5TG9hZGVkKHJlc3VsdCwgd2luZG93LCBTY3JvbGxEaXJlY3Rpb24uQm90dG9tKSk7XG4gICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgKS5zdWJzY3JpYmUoKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHByaXZhdGUgb25GZXRjaE1lc3NhZ2VIaXN0b3J5TG9hZGVkKG1lc3NhZ2VzOiBNZXNzYWdlW10sIHdpbmRvdzogV2luZG93LCBkaXJlY3Rpb246IFNjcm9sbERpcmVjdGlvbiwgZm9yY2VNYXJrTWVzc2FnZXNBc1NlZW46IGJvb2xlYW4gPSBmYWxzZSk6IHZvaWQge1xuICAgICAgICB0aGlzLnNjcm9sbENoYXRXaW5kb3cod2luZG93LCBkaXJlY3Rpb24pXG5cbiAgICAgICAgaWYgKHdpbmRvdy5oYXNGb2N1cyB8fCBmb3JjZU1hcmtNZXNzYWdlc0FzU2Vlbikge1xuICAgICAgICAgICAgY29uc3QgdW5zZWVuTWVzc2FnZXMgPSBtZXNzYWdlcy5maWx0ZXIobSA9PiAhbS5kYXRlU2Vlbik7XG5cbiAgICAgICAgICAgIHRoaXMubWFya01lc3NhZ2VzQXNSZWFkKHVuc2Vlbk1lc3NhZ2VzKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8vIFVwZGF0ZXMgdGhlIGZyaWVuZHMgbGlzdCB2aWEgdGhlIGV2ZW50IGhhbmRsZXJcbiAgICBwcml2YXRlIG9uRnJpZW5kc0xpc3RDaGFuZ2VkKHBhcnRpY2lwYW50c1Jlc3BvbnNlOiBQYXJ0aWNpcGFudFJlc3BvbnNlW10pOiB2b2lkIHtcbiAgICAgICAgaWYgKHBhcnRpY2lwYW50c1Jlc3BvbnNlKSB7XG4gICAgICAgICAgICB0aGlzLnBhcnRpY2lwYW50c1Jlc3BvbnNlID0gcGFydGljaXBhbnRzUmVzcG9uc2U7XG5cbiAgICAgICAgICAgIHRoaXMucGFydGljaXBhbnRzID0gcGFydGljaXBhbnRzUmVzcG9uc2UubWFwKChyZXNwb25zZTogUGFydGljaXBhbnRSZXNwb25zZSkgPT4ge1xuICAgICAgICAgICAgICAgIHJldHVybiByZXNwb25zZS5wYXJ0aWNpcGFudDtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICB0aGlzLnBhcnRpY2lwYW50c0ludGVyYWN0ZWRXaXRoID0gW107XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBIYW5kbGVzIHJlY2VpdmVkIG1lc3NhZ2VzIGJ5IHRoZSBhZGFwdGVyXG4gICAgcHJpdmF0ZSBvbk1lc3NhZ2VSZWNlaXZlZChwYXJ0aWNpcGFudDogSUNoYXRQYXJ0aWNpcGFudCwgbWVzc2FnZTogTWVzc2FnZSkge1xuICAgICAgICBpZiAocGFydGljaXBhbnQgJiYgbWVzc2FnZSkge1xuICAgICAgICAgICAgY29uc3QgY2hhdFdpbmRvdyA9IHRoaXMub3BlbkNoYXRXaW5kb3cocGFydGljaXBhbnQpO1xuXG4gICAgICAgICAgICB0aGlzLmFzc2VydE1lc3NhZ2VUeXBlKG1lc3NhZ2UpO1xuXG4gICAgICAgICAgICBpZiAoIWNoYXRXaW5kb3dbMV0gfHwgIXRoaXMuaGlzdG9yeUVuYWJsZWQpIHtcbiAgICAgICAgICAgICAgICBjaGF0V2luZG93WzBdLm1lc3NhZ2VzLnB1c2gobWVzc2FnZSk7XG5cbiAgICAgICAgICAgICAgICB0aGlzLnNjcm9sbENoYXRXaW5kb3coY2hhdFdpbmRvd1swXSwgU2Nyb2xsRGlyZWN0aW9uLkJvdHRvbSk7XG5cbiAgICAgICAgICAgICAgICBpZiAoY2hhdFdpbmRvd1swXS5oYXNGb2N1cykge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLm1hcmtNZXNzYWdlc0FzUmVhZChbbWVzc2FnZV0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdGhpcy5lbWl0TWVzc2FnZVNvdW5kKGNoYXRXaW5kb3dbMF0pO1xuXG4gICAgICAgICAgICAvLyBHaXRodWIgaXNzdWUgIzU4IFxuICAgICAgICAgICAgLy8gRG8gbm90IHB1c2ggYnJvd3NlciBub3RpZmljYXRpb25zIHdpdGggbWVzc2FnZSBjb250ZW50IGZvciBwcml2YWN5IHB1cnBvc2VzIGlmIHRoZSAnbWF4aW1pemVXaW5kb3dPbk5ld01lc3NhZ2UnIHNldHRpbmcgaXMgb2ZmIGFuZCB0aGlzIGlzIGEgbmV3IGNoYXQgd2luZG93LlxuICAgICAgICAgICAgaWYgKHRoaXMubWF4aW1pemVXaW5kb3dPbk5ld01lc3NhZ2UgfHwgKCFjaGF0V2luZG93WzFdICYmICFjaGF0V2luZG93WzBdLmlzQ29sbGFwc2VkKSkge1xuICAgICAgICAgICAgICAgIC8vIFNvbWUgbWVzc2FnZXMgYXJlIG5vdCBwdXNoZWQgYmVjYXVzZSB0aGV5IGFyZSBsb2FkZWQgYnkgZmV0Y2hpbmcgdGhlIGhpc3RvcnkgaGVuY2Ugd2h5IHdlIHN1cHBseSB0aGUgbWVzc2FnZSBoZXJlXG4gICAgICAgICAgICAgICAgdGhpcy5lbWl0QnJvd3Nlck5vdGlmaWNhdGlvbihjaGF0V2luZG93WzBdLCBtZXNzYWdlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIG9uUGFydGljaXBhbnRDbGlja2VkRnJvbUZyaWVuZHNMaXN0KHBhcnRpY2lwYW50OiBJQ2hhdFBhcnRpY2lwYW50KTogdm9pZCB7XG4gICAgICAgIHRoaXMub3BlbkNoYXRXaW5kb3cocGFydGljaXBhbnQsIHRydWUsIHRydWUpO1xuICAgIH1cblxuICAgIHByaXZhdGUgY2FuY2VsT3B0aW9uUHJvbXB0KCk6IHZvaWQge1xuICAgICAgICBpZiAodGhpcy5jdXJyZW50QWN0aXZlT3B0aW9uKSB7XG4gICAgICAgICAgICB0aGlzLmN1cnJlbnRBY3RpdmVPcHRpb24uaXNBY3RpdmUgPSBmYWxzZTtcbiAgICAgICAgICAgIHRoaXMuY3VycmVudEFjdGl2ZU9wdGlvbiA9IG51bGw7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBvbk9wdGlvblByb21wdENhbmNlbGVkKCk6IHZvaWQge1xuICAgICAgICB0aGlzLmNhbmNlbE9wdGlvblByb21wdCgpO1xuICAgIH1cblxuICAgIG9uT3B0aW9uUHJvbXB0Q29uZmlybWVkKGV2ZW50OiBhbnkpOiB2b2lkIHtcbiAgICAgICAgLy8gRm9yIG5vdyB0aGlzIGlzIGZpbmUgYXMgdGhlcmUgaXMgb25seSBvbmUgb3B0aW9uIGF2YWlsYWJsZS4gSW50cm9kdWNlIG9wdGlvbiB0eXBlcyBhbmQgdHlwZSBjaGVja2luZyBpZiBhIG5ldyBvcHRpb24gaXMgYWRkZWQuXG4gICAgICAgIHRoaXMuY29uZmlybU5ld0dyb3VwKGV2ZW50KTtcblxuICAgICAgICAvLyBDYW5jZWxpbmcgY3VycmVudCBzdGF0ZVxuICAgICAgICB0aGlzLmNhbmNlbE9wdGlvblByb21wdCgpO1xuICAgIH1cblxuICAgIHByaXZhdGUgY29uZmlybU5ld0dyb3VwKHVzZXJzOiBVc2VyW10pOiB2b2lkIHtcbiAgICAgICAgY29uc3QgbmV3R3JvdXAgPSBuZXcgR3JvdXAodXNlcnMpO1xuXG4gICAgICAgIHRoaXMub3BlbkNoYXRXaW5kb3cobmV3R3JvdXApO1xuXG4gICAgICAgIGlmICh0aGlzLmdyb3VwQWRhcHRlcikge1xuICAgICAgICAgICAgdGhpcy5ncm91cEFkYXB0ZXIuZ3JvdXBDcmVhdGVkKG5ld0dyb3VwKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8vIE9wZW5zIGEgbmV3IGNoYXQgd2hpbmRvdy4gVGFrZXMgY2FyZSBvZiBhdmFpbGFibGUgdmlld3BvcnRcbiAgICAvLyBXb3JrcyBmb3Igb3BlbmluZyBhIGNoYXQgd2luZG93IGZvciBhbiB1c2VyIG9yIGZvciBhIGdyb3VwXG4gICAgLy8gUmV0dXJucyA9PiBbV2luZG93OiBXaW5kb3cgb2JqZWN0IHJlZmVyZW5jZSwgYm9vbGVhbjogSW5kaWNhdGVzIGlmIHRoaXMgd2luZG93IGlzIGEgbmV3IGNoYXQgd2luZG93XVxuICAgIHByaXZhdGUgb3BlbkNoYXRXaW5kb3cocGFydGljaXBhbnQ6IElDaGF0UGFydGljaXBhbnQsIGZvY3VzT25OZXdXaW5kb3c6IGJvb2xlYW4gPSBmYWxzZSwgaW52b2tlZEJ5VXNlckNsaWNrOiBib29sZWFuID0gZmFsc2UpOiBbV2luZG93LCBib29sZWFuXSB7XG4gICAgICAgIC8vIElzIHRoaXMgd2luZG93IG9wZW5lZD9cbiAgICAgICAgY29uc3Qgb3BlbmVkV2luZG93ID0gdGhpcy53aW5kb3dzLmZpbmQoeCA9PiB4LnBhcnRpY2lwYW50LmlkID09IHBhcnRpY2lwYW50LmlkKTtcblxuICAgICAgICBpZiAoIW9wZW5lZFdpbmRvdykge1xuICAgICAgICAgICAgaWYgKGludm9rZWRCeVVzZXJDbGljaykge1xuICAgICAgICAgICAgICAgIHRoaXMub25QYXJ0aWNpcGFudENsaWNrZWQuZW1pdChwYXJ0aWNpcGFudCk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIFJlZmVyIHRvIGlzc3VlICM1OCBvbiBHaXRodWIgXG4gICAgICAgICAgICBjb25zdCBjb2xsYXBzZVdpbmRvdyA9IGludm9rZWRCeVVzZXJDbGljayA/IGZhbHNlIDogIXRoaXMubWF4aW1pemVXaW5kb3dPbk5ld01lc3NhZ2U7XG5cbiAgICAgICAgICAgIGNvbnN0IG5ld0NoYXRXaW5kb3c6IFdpbmRvdyA9IG5ldyBXaW5kb3cocGFydGljaXBhbnQsIHRoaXMuaGlzdG9yeUVuYWJsZWQsIGNvbGxhcHNlV2luZG93KTtcblxuICAgICAgICAgICAgLy8gTG9hZHMgdGhlIGNoYXQgaGlzdG9yeSB2aWEgYW4gUnhKcyBPYnNlcnZhYmxlXG4gICAgICAgICAgICBpZiAodGhpcy5oaXN0b3J5RW5hYmxlZCkge1xuICAgICAgICAgICAgICAgIHRoaXMuZmV0Y2hNZXNzYWdlSGlzdG9yeShuZXdDaGF0V2luZG93KTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdGhpcy53aW5kb3dzLnVuc2hpZnQobmV3Q2hhdFdpbmRvdyk7XG5cbiAgICAgICAgICAgIC8vIElzIHRoZXJlIGVub3VnaCBzcGFjZSBsZWZ0IGluIHRoZSB2aWV3IHBvcnQgPyBidXQgc2hvdWxkIGJlIGRpc3BsYXllZCBpbiBtb2JpbGUgaWYgb3B0aW9uIGlzIGVuYWJsZWRcbiAgICAgICAgICAgIGlmICghdGhpcy5pc1ZpZXdwb3J0T25Nb2JpbGVFbmFibGVkKSB7XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMud2luZG93cy5sZW5ndGggKiB0aGlzLndpbmRvd1NpemVGYWN0b3IgPj0gdGhpcy52aWV3UG9ydFRvdGFsQXJlYSAtICghdGhpcy5oaWRlRnJpZW5kc0xpc3QgPyB0aGlzLmZyaWVuZHNMaXN0V2lkdGggOiAwKSkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLndpbmRvd3MucG9wKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB0aGlzLnVwZGF0ZVdpbmRvd3NTdGF0ZSh0aGlzLndpbmRvd3MpO1xuXG4gICAgICAgICAgICBpZiAoZm9jdXNPbk5ld1dpbmRvdyAmJiAhY29sbGFwc2VXaW5kb3cpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmZvY3VzT25XaW5kb3cobmV3Q2hhdFdpbmRvdyk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHRoaXMucGFydGljaXBhbnRzSW50ZXJhY3RlZFdpdGgucHVzaChwYXJ0aWNpcGFudCk7XG4gICAgICAgICAgICB0aGlzLm9uUGFydGljaXBhbnRDaGF0T3BlbmVkLmVtaXQocGFydGljaXBhbnQpO1xuXG4gICAgICAgICAgICByZXR1cm4gW25ld0NoYXRXaW5kb3csIHRydWVdO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgLy8gUmV0dXJucyB0aGUgZXhpc3RpbmcgY2hhdCB3aW5kb3cgICAgIFxuICAgICAgICAgICAgcmV0dXJuIFtvcGVuZWRXaW5kb3csIGZhbHNlXTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8vIEZvY3VzIG9uIHRoZSBpbnB1dCBlbGVtZW50IG9mIHRoZSBzdXBwbGllZCB3aW5kb3dcbiAgICBwcml2YXRlIGZvY3VzT25XaW5kb3cod2luZG93OiBXaW5kb3csIGNhbGxiYWNrOiBGdW5jdGlvbiA9ICgpID0+IHsgfSk6IHZvaWQge1xuICAgICAgICBjb25zdCB3aW5kb3dJbmRleCA9IHRoaXMud2luZG93cy5pbmRleE9mKHdpbmRvdyk7XG4gICAgICAgIGlmICh3aW5kb3dJbmRleCA+PSAwKSB7XG4gICAgICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5jaGF0V2luZG93cykge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBjaGF0V2luZG93VG9Gb2N1cyA9IHRoaXMuY2hhdFdpbmRvd3MudG9BcnJheSgpW3dpbmRvd0luZGV4XTtcblxuICAgICAgICAgICAgICAgICAgICBjaGF0V2luZG93VG9Gb2N1cy5jaGF0V2luZG93SW5wdXQubmF0aXZlRWxlbWVudC5mb2N1cygpO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGNhbGxiYWNrKCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHByaXZhdGUgYXNzZXJ0TWVzc2FnZVR5cGUobWVzc2FnZTogTWVzc2FnZSk6IHZvaWQge1xuICAgICAgICAvLyBBbHdheXMgZmFsbGJhY2sgdG8gXCJUZXh0XCIgbWVzc2FnZXMgdG8gYXZvaWQgcmVuZGVucmluZyBpc3N1ZXNcbiAgICAgICAgaWYgKCFtZXNzYWdlLnR5cGUpIHtcbiAgICAgICAgICAgIG1lc3NhZ2UudHlwZSA9IE1lc3NhZ2VUeXBlLlRleHQ7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBNYXJrcyBhbGwgbWVzc2FnZXMgcHJvdmlkZWQgYXMgcmVhZCB3aXRoIHRoZSBjdXJyZW50IHRpbWUuXG4gICAgbWFya01lc3NhZ2VzQXNSZWFkKG1lc3NhZ2VzOiBNZXNzYWdlW10pOiB2b2lkIHtcbiAgICAgICAgY29uc3QgY3VycmVudERhdGUgPSBuZXcgRGF0ZSgpO1xuXG4gICAgICAgIG1lc3NhZ2VzLmZvckVhY2goKG1zZykgPT4ge1xuICAgICAgICAgICAgbXNnLmRhdGVTZWVuID0gY3VycmVudERhdGU7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHRoaXMub25NZXNzYWdlc1NlZW4uZW1pdChtZXNzYWdlcyk7XG4gICAgfVxuXG4gICAgLy8gQnVmZmVycyBhdWRpbyBmaWxlIChGb3IgY29tcG9uZW50J3MgYm9vdHN0cmFwcGluZylcbiAgICBwcml2YXRlIGJ1ZmZlckF1ZGlvRmlsZSgpOiB2b2lkIHtcbiAgICAgICAgaWYgKHRoaXMuYXVkaW9Tb3VyY2UgJiYgdGhpcy5hdWRpb1NvdXJjZS5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICB0aGlzLmF1ZGlvRmlsZSA9IG5ldyBBdWRpbygpO1xuICAgICAgICAgICAgdGhpcy5hdWRpb0ZpbGUuc3JjID0gdGhpcy5hdWRpb1NvdXJjZTtcbiAgICAgICAgICAgIHRoaXMuYXVkaW9GaWxlLmxvYWQoKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8vIEVtaXRzIGEgbWVzc2FnZSBub3RpZmljYXRpb24gYXVkaW8gaWYgZW5hYmxlZCBhZnRlciBldmVyeSBtZXNzYWdlIHJlY2VpdmVkXG4gICAgcHJpdmF0ZSBlbWl0TWVzc2FnZVNvdW5kKHdpbmRvdzogV2luZG93KTogdm9pZCB7XG4gICAgICAgIGlmICh0aGlzLmF1ZGlvRW5hYmxlZCAmJiAhd2luZG93Lmhhc0ZvY3VzICYmIHRoaXMuYXVkaW9GaWxlKSB7XG4gICAgICAgICAgICB0aGlzLmF1ZGlvRmlsZS5wbGF5KCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBFbWl0cyBhIGJyb3dzZXIgbm90aWZpY2F0aW9uXG4gICAgcHJpdmF0ZSBlbWl0QnJvd3Nlck5vdGlmaWNhdGlvbih3aW5kb3c6IFdpbmRvdywgbWVzc2FnZTogTWVzc2FnZSk6IHZvaWQge1xuICAgICAgICBpZiAodGhpcy5icm93c2VyTm90aWZpY2F0aW9uc0Jvb3RzdHJhcHBlZCAmJiAhd2luZG93Lmhhc0ZvY3VzICYmIG1lc3NhZ2UpIHtcbiAgICAgICAgICAgIGNvbnN0IG5vdGlmaWNhdGlvbiA9IG5ldyBOb3RpZmljYXRpb24oYCR7dGhpcy5sb2NhbGl6YXRpb24uYnJvd3Nlck5vdGlmaWNhdGlvblRpdGxlfSAke3dpbmRvdy5wYXJ0aWNpcGFudC5kaXNwbGF5TmFtZX1gLCB7XG4gICAgICAgICAgICAgICAgJ2JvZHknOiBtZXNzYWdlLm1lc3NhZ2UsXG4gICAgICAgICAgICAgICAgJ2ljb24nOiB0aGlzLmJyb3dzZXJOb3RpZmljYXRpb25JY29uU291cmNlXG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgICAgICAgICAgbm90aWZpY2F0aW9uLmNsb3NlKCk7XG4gICAgICAgICAgICB9LCBtZXNzYWdlLm1lc3NhZ2UubGVuZ3RoIDw9IDUwID8gNTAwMCA6IDcwMDApOyAvLyBNb3JlIHRpbWUgdG8gcmVhZCBsb25nZXIgbWVzc2FnZXNcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8vIFNhdmVzIGN1cnJlbnQgd2luZG93cyBzdGF0ZSBpbnRvIGxvY2FsIHN0b3JhZ2UgaWYgcGVyc2lzdGVuY2UgaXMgZW5hYmxlZFxuICAgIHByaXZhdGUgdXBkYXRlV2luZG93c1N0YXRlKHdpbmRvd3M6IFdpbmRvd1tdKTogdm9pZCB7XG4gICAgICAgIGlmICh0aGlzLnBlcnNpc3RXaW5kb3dzU3RhdGUpIHtcbiAgICAgICAgICAgIGNvbnN0IHBhcnRpY2lwYW50SWRzID0gd2luZG93cy5tYXAoKHcpID0+IHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdy5wYXJ0aWNpcGFudC5pZDtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICBsb2NhbFN0b3JhZ2Uuc2V0SXRlbSh0aGlzLmxvY2FsU3RvcmFnZUtleSwgSlNPTi5zdHJpbmdpZnkocGFydGljaXBhbnRJZHMpKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHByaXZhdGUgcmVzdG9yZVdpbmRvd3NTdGF0ZSgpOiB2b2lkIHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGlmICh0aGlzLnBlcnNpc3RXaW5kb3dzU3RhdGUpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBzdHJpbmdmaWVkUGFydGljaXBhbnRJZHMgPSBsb2NhbFN0b3JhZ2UuZ2V0SXRlbSh0aGlzLmxvY2FsU3RvcmFnZUtleSk7XG5cbiAgICAgICAgICAgICAgICBpZiAoc3RyaW5nZmllZFBhcnRpY2lwYW50SWRzICYmIHN0cmluZ2ZpZWRQYXJ0aWNpcGFudElkcy5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHBhcnRpY2lwYW50SWRzID0gPG51bWJlcltdPkpTT04ucGFyc2Uoc3RyaW5nZmllZFBhcnRpY2lwYW50SWRzKTtcblxuICAgICAgICAgICAgICAgICAgICBjb25zdCBwYXJ0aWNpcGFudHNUb1Jlc3RvcmUgPSB0aGlzLnBhcnRpY2lwYW50cy5maWx0ZXIodSA9PiBwYXJ0aWNpcGFudElkcy5pbmRleE9mKHUuaWQpID49IDApO1xuXG4gICAgICAgICAgICAgICAgICAgIHBhcnRpY2lwYW50c1RvUmVzdG9yZS5mb3JFYWNoKChwYXJ0aWNpcGFudCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5vcGVuQ2hhdFdpbmRvdyhwYXJ0aWNpcGFudCk7XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBjYXRjaCAoZXgpIHtcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoYEFuIGVycm9yIG9jY3VycmVkIHdoaWxlIHJlc3RvcmluZyBuZy1jaGF0IHdpbmRvd3Mgc3RhdGUuIERldGFpbHM6ICR7ZXh9YCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBHZXRzIGNsb3Nlc3Qgb3BlbiB3aW5kb3cgaWYgYW55LiBNb3N0IHJlY2VudCBvcGVuZWQgaGFzIHByaW9yaXR5IChSaWdodClcbiAgICBwcml2YXRlIGdldENsb3Nlc3RXaW5kb3cod2luZG93OiBXaW5kb3cpOiBXaW5kb3cgfCB1bmRlZmluZWQge1xuICAgICAgICBjb25zdCBpbmRleCA9IHRoaXMud2luZG93cy5pbmRleE9mKHdpbmRvdyk7XG5cbiAgICAgICAgaWYgKGluZGV4ID4gMCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMud2luZG93c1tpbmRleCAtIDFdO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKGluZGV4ID09IDAgJiYgdGhpcy53aW5kb3dzLmxlbmd0aCA+IDEpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLndpbmRvd3NbaW5kZXggKyAxXTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHByaXZhdGUgY2xvc2VXaW5kb3cod2luZG93OiBXaW5kb3cpOiB2b2lkIHtcbiAgICAgICAgY29uc3QgaW5kZXggPSB0aGlzLndpbmRvd3MuaW5kZXhPZih3aW5kb3cpO1xuXG4gICAgICAgIHRoaXMud2luZG93cy5zcGxpY2UoaW5kZXgsIDEpO1xuXG4gICAgICAgIHRoaXMudXBkYXRlV2luZG93c1N0YXRlKHRoaXMud2luZG93cyk7XG5cbiAgICAgICAgdGhpcy5vblBhcnRpY2lwYW50Q2hhdENsb3NlZC5lbWl0KHdpbmRvdy5wYXJ0aWNpcGFudCk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBnZXRDaGF0V2luZG93Q29tcG9uZW50SW5zdGFuY2UodGFyZ2V0V2luZG93OiBXaW5kb3cpOiBOZ0NoYXRXaW5kb3dDb21wb25lbnQgfCBudWxsIHtcbiAgICAgICAgY29uc3Qgd2luZG93SW5kZXggPSB0aGlzLndpbmRvd3MuaW5kZXhPZih0YXJnZXRXaW5kb3cpO1xuXG4gICAgICAgIGlmICh0aGlzLmNoYXRXaW5kb3dzKSB7XG4gICAgICAgICAgICBsZXQgdGFyZ2V0V2luZG93ID0gdGhpcy5jaGF0V2luZG93cy50b0FycmF5KClbd2luZG93SW5kZXhdO1xuXG4gICAgICAgICAgICByZXR1cm4gdGFyZ2V0V2luZG93O1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuXG4gICAgLy8gU2Nyb2xscyBhIGNoYXQgd2luZG93IG1lc3NhZ2UgZmxvdyB0byB0aGUgYm90dG9tXG4gICAgcHJpdmF0ZSBzY3JvbGxDaGF0V2luZG93KHdpbmRvdzogV2luZG93LCBkaXJlY3Rpb246IFNjcm9sbERpcmVjdGlvbik6IHZvaWQge1xuICAgICAgICBjb25zdCBjaGF0V2luZG93ID0gdGhpcy5nZXRDaGF0V2luZG93Q29tcG9uZW50SW5zdGFuY2Uod2luZG93KTtcblxuICAgICAgICBpZiAoY2hhdFdpbmRvdykge1xuICAgICAgICAgICAgY2hhdFdpbmRvdy5zY3JvbGxDaGF0V2luZG93KHdpbmRvdywgZGlyZWN0aW9uKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIG9uV2luZG93TWVzc2FnZXNTZWVuKG1lc3NhZ2VzU2VlbjogTWVzc2FnZVtdKTogdm9pZCB7XG4gICAgICAgIHRoaXMubWFya01lc3NhZ2VzQXNSZWFkKG1lc3NhZ2VzU2Vlbik7XG4gICAgfVxuXG4gICAgYXN5bmMgb25XaW5kb3dDaGF0VG9nZ2xlKHBheWxvYWQ6IHsgY3VycmVudFdpbmRvdzogV2luZG93LCBpc0NvbGxhcHNlZDogYm9vbGVhbiB9KSB7XG4gICAgICAgIHRoaXMub25QYXJ0aWNpcGFudFRvZ2dsZS5lbWl0KHsgcGFydGljaXBhbnQ6IHBheWxvYWQuY3VycmVudFdpbmRvdy5wYXJ0aWNpcGFudCwgaXNDb2xsYXBzZWQ6IHBheWxvYWQuaXNDb2xsYXBzZWQgfSk7XG5cbiAgICB9XG5cbiAgICBhc3luYyBvbldpbmRvd0NoYXRDbG9zZWQocGF5bG9hZDogeyBjbG9zZWRXaW5kb3c6IFdpbmRvdywgY2xvc2VkVmlhRXNjYXBlS2V5OiBib29sZWFuIH0pIHtcbiAgICAgICAgY29uc3QgeyBjbG9zZWRXaW5kb3csIGNsb3NlZFZpYUVzY2FwZUtleSB9ID0gcGF5bG9hZDtcbiAgICAgICAgY29uc29sZS5sb2coJ29uV2luZG93Q2hhdENsb3NlZCcpO1xuICAgICAgICBpZiAodGhpcy5iZWZvcmVQYXJ0ZWNpYW50Q2hhdENsb3NlZCAhPSB1bmRlZmluZWQgJiYgdGhpcy5iZWZvcmVQYXJ0ZWNpYW50Q2hhdENsb3NlZCkge1xuICAgICAgICAgICAgY29uc3QgbCA9IGF3YWl0IHRoaXMuYmVmb3JlUGFydGVjaWFudENoYXRDbG9zZWQoY2xvc2VkV2luZG93LnBhcnRpY2lwYW50KTtcbiAgICAgICAgICAgIGlmIChsID09IGZhbHNlKVxuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBpZiAoY2xvc2VkVmlhRXNjYXBlS2V5KSB7XG4gICAgICAgICAgICBsZXQgY2xvc2VzdFdpbmRvdyA9IHRoaXMuZ2V0Q2xvc2VzdFdpbmRvdyhjbG9zZWRXaW5kb3cpO1xuXG4gICAgICAgICAgICBpZiAoY2xvc2VzdFdpbmRvdykge1xuICAgICAgICAgICAgICAgIHRoaXMuZm9jdXNPbldpbmRvdyhjbG9zZXN0V2luZG93LCAoKSA9PiB7IHRoaXMuY2xvc2VXaW5kb3coY2xvc2VkV2luZG93KTsgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICB0aGlzLmNsb3NlV2luZG93KGNsb3NlZFdpbmRvdyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICB0aGlzLmNsb3NlV2luZG93KGNsb3NlZFdpbmRvdyk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBvbldpbmRvd1RhYlRyaWdnZXJlZChwYXlsb2FkOiB7IHRyaWdnZXJpbmdXaW5kb3c6IFdpbmRvdywgc2hpZnRLZXlQcmVzc2VkOiBib29sZWFuIH0pOiB2b2lkIHtcbiAgICAgICAgY29uc3QgeyB0cmlnZ2VyaW5nV2luZG93LCBzaGlmdEtleVByZXNzZWQgfSA9IHBheWxvYWQ7XG5cbiAgICAgICAgY29uc3QgY3VycmVudFdpbmRvd0luZGV4ID0gdGhpcy53aW5kb3dzLmluZGV4T2YodHJpZ2dlcmluZ1dpbmRvdyk7XG4gICAgICAgIGxldCB3aW5kb3dUb0ZvY3VzID0gdGhpcy53aW5kb3dzW2N1cnJlbnRXaW5kb3dJbmRleCArIChzaGlmdEtleVByZXNzZWQgPyAxIDogLTEpXTsgLy8gR29lcyBiYWNrIG9uIHNoaWZ0ICsgdGFiXG5cbiAgICAgICAgaWYgKCF3aW5kb3dUb0ZvY3VzKSB7XG4gICAgICAgICAgICAvLyBFZGdlIHdpbmRvd3MsIGdvIHRvIHN0YXJ0IG9yIGVuZFxuICAgICAgICAgICAgd2luZG93VG9Gb2N1cyA9IHRoaXMud2luZG93c1tjdXJyZW50V2luZG93SW5kZXggPiAwID8gMCA6IHRoaXMuY2hhdFdpbmRvd3MubGVuZ3RoIC0gMV07XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLmZvY3VzT25XaW5kb3cod2luZG93VG9Gb2N1cyk7XG4gICAgfVxuXG4gICAgb25XaW5kb3dNZXNzYWdlU2VudChtZXNzYWdlU2VudDogTWVzc2FnZSk6IHZvaWQge1xuICAgICAgICB0aGlzLmFkYXB0ZXIuc2VuZE1lc3NhZ2UobWVzc2FnZVNlbnQpO1xuICAgIH1cblxuICAgIG9uV2luZG93T3B0aW9uVHJpZ2dlcmVkKG9wdGlvbjogSUNoYXRPcHRpb24pOiB2b2lkIHtcbiAgICAgICAgdGhpcy5jdXJyZW50QWN0aXZlT3B0aW9uID0gb3B0aW9uO1xuICAgIH1cblxuICAgIHRyaWdnZXJPcGVuQ2hhdFdpbmRvdyh1c2VyOiBVc2VyKTogdm9pZCB7XG4gICAgICAgIGlmICh1c2VyKSB7XG4gICAgICAgICAgICB0aGlzLm9wZW5DaGF0V2luZG93KHVzZXIpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgdHJpZ2dlckNsb3NlQ2hhdFdpbmRvdyh1c2VySWQ6IGFueSk6IHZvaWQge1xuICAgICAgICBjb25zdCBvcGVuZWRXaW5kb3cgPSB0aGlzLndpbmRvd3MuZmluZCh4ID0+IHgucGFydGljaXBhbnQuaWQgPT0gdXNlcklkKTtcblxuICAgICAgICBpZiAob3BlbmVkV2luZG93KSB7XG4gICAgICAgICAgICB0aGlzLmNsb3NlV2luZG93KG9wZW5lZFdpbmRvdyk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICB0cmlnZ2VyVG9nZ2xlQ2hhdFdpbmRvd1Zpc2liaWxpdHkodXNlcklkOiBhbnkpOiB2b2lkIHtcbiAgICAgICAgY29uc3Qgb3BlbmVkV2luZG93ID0gdGhpcy53aW5kb3dzLmZpbmQoeCA9PiB4LnBhcnRpY2lwYW50LmlkID09IHVzZXJJZCk7XG5cbiAgICAgICAgaWYgKG9wZW5lZFdpbmRvdykge1xuICAgICAgICAgICAgY29uc3QgY2hhdFdpbmRvdyA9IHRoaXMuZ2V0Q2hhdFdpbmRvd0NvbXBvbmVudEluc3RhbmNlKG9wZW5lZFdpbmRvdyk7XG5cbiAgICAgICAgICAgIGlmIChjaGF0V2luZG93KSB7XG4gICAgICAgICAgICAgICAgY2hhdFdpbmRvdy5vbkNoYXRXaW5kb3dDbGlja2VkKG9wZW5lZFdpbmRvdyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBzZXRCZWZvcmVQYXJ0ZWNpYW50Q2hhdENsb3NlZChmdW5jOiBhbnkpIHtcbiAgICAgICAgdGhpcy5iZWZvcmVQYXJ0ZWNpYW50Q2hhdENsb3NlZCA9IGZ1bmM7XG4gICAgfVxufSJdfQ==