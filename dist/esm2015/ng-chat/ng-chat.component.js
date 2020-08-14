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
    onWindowChatClosed(payload) {
        const { closedWindow, closedViaEscapeKey } = payload;
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
    ViewChildren('chatWindow')
], NgChat.prototype, "chatWindows", void 0);
__decorate([
    HostListener('window:resize', ['$event'])
], NgChat.prototype, "onResize", null);
NgChat = __decorate([
    Component({
        selector: 'ng-chat',
        template: "<link *ngIf=\"customTheme\" rel=\"stylesheet\" [href]='customTheme | sanitize'>\n\n<div id=\"ng-chat\" *ngIf=\"!isDisabled && isBootstrapped && !unsupportedViewport\" [ngClass]=\"theme\">\n    <ng-chat-friends-list\n        [localization]=\"localization\"\n        [shouldDisplay]=\"!hideFriendsList\"\n        [userId]=\"userId\"\n        [isCollapsed]=\"isCollapsed\"\n        [searchEnabled]=\"searchEnabled\"\n        [participants]=\"participants\"\n        [participantsResponse]=\"participantsResponse\"\n        [participantsInteractedWith]=\"participantsInteractedWith\"\n        [windows]=\"windows\"\n        [currentActiveOption]=\"currentActiveOption\"\n        (onParticipantClicked)=\"onParticipantClickedFromFriendsList($event)\"\n        (onOptionPromptCanceled)=\"onOptionPromptCanceled()\"\n        (onOptionPromptConfirmed)=\"onOptionPromptConfirmed($event)\"\n    >\n    </ng-chat-friends-list>\n\n    <div *ngFor=\"let window of windows; let i = index\" [ngClass]=\"{'ng-chat-window': true, 'primary-outline-color': true, 'ng-chat-window-collapsed': window.isCollapsed}\" [ngStyle]=\"{'right': (!hideFriendsList ? friendsListWidth : 0) + 20 + windowSizeFactor * i + 'px'}\">\n        <ng-chat-window\n            #chatWindow\n            [fileUploadAdapter]=\"fileUploadAdapter\"\n            [localization]=\"localization\"\n            [userId]=\"userId\"\n            [window]=\"window\"\n            [showOptions]=\"groupAdapter\"\n            [emojisEnabled]=\"emojisEnabled\"\n            [linkfyEnabled]=\"linkfyEnabled\"\n            [showMessageDate]=\"showMessageDate\"\n            [messageDatePipeFormat]=\"messageDatePipeFormat\"\n            [hasPagedHistory]=\"hasPagedHistory\"\n            (onMessagesSeen)=\"onWindowMessagesSeen($event)\"\n            (onMessageSent)=\"onWindowMessageSent($event)\"\n            (onTabTriggered)=\"onWindowTabTriggered($event)\"\n            (onChatWindowClosed)=\"onWindowChatClosed($event)\"\n            (onOptionTriggered)=\"onWindowOptionTriggered($event)\"\n            (onLoadHistoryTriggered)=\"fetchMessageHistory($event)\"\n        >\n        </ng-chat-window>\n    </div>\n</div>\n",
        encapsulation: ViewEncapsulation.None,
        styles: [".user-icon{box-sizing:border-box;background-color:#fff;border:2px solid;width:32px;height:20px;border-radius:64px 64px 0 0/64px;margin-top:14px;margin-left:-1px;display:inline-block;vertical-align:middle;position:relative;font-style:normal;color:#ddd;text-align:left;text-indent:-9999px}.user-icon:before{border:2px solid;background-color:#fff;width:12px;height:12px;top:-19px;border-radius:50%;position:absolute;left:50%;transform:translateX(-50%)}.user-icon:after,.user-icon:before{content:'';pointer-events:none}.upload-icon{position:absolute;margin-left:3px;margin-top:12px;width:13px;height:4px;border:1px solid currentColor;border-top:none;border-radius:1px}.upload-icon:before{content:'';position:absolute;top:-8px;left:6px;width:1px;height:9px;background-color:currentColor}.upload-icon:after{content:'';position:absolute;top:-8px;left:4px;width:4px;height:4px;border-top:1px solid currentColor;border-right:1px solid currentColor;transform:rotate(-45deg)}.paperclip-icon{position:absolute;margin-left:9px;margin-top:2px;width:6px;height:12px;border-radius:4px 4px 0 0;border-left:1px solid currentColor;border-right:1px solid currentColor;border-top:1px solid currentColor;transform:rotate(45deg)}.paperclip-icon:before{content:'';position:absolute;top:11px;left:-1px;width:4px;height:6px;border-radius:0 0 3px 3px;border-left:1px solid currentColor;border-right:1px solid currentColor;border-bottom:1px solid currentColor}.paperclip-icon:after{content:'';position:absolute;left:1px;top:1px;width:2px;height:10px;border-radius:4px 4px 0 0;border-left:1px solid currentColor;border-right:1px solid currentColor;border-top:1px solid currentColor}.check-icon{color:#000;position:absolute;margin-left:3px;margin-top:4px;width:14px;height:8px;border-bottom:1px solid currentColor;border-left:1px solid currentColor;transform:rotate(-45deg)}.remove-icon{color:#000;position:absolute;margin-left:3px;margin-top:10px}.remove-icon:before{content:'';position:absolute;width:15px;height:1px;background-color:currentColor;transform:rotate(45deg)}.remove-icon:after{content:'';position:absolute;width:15px;height:1px;background-color:currentColor;transform:rotate(-45deg)}", ".loader,.loader:after,.loader:before{background:#e3e3e3;-webkit-animation:1s ease-in-out infinite load1;animation:1s ease-in-out infinite load1;width:1em;height:4em}.loader{color:#e3e3e3;text-indent:-9999em;margin:4px auto 0;position:relative;font-size:4px;transform:translateZ(0);-webkit-animation-delay:-.16s;animation-delay:-.16s}.loader:after,.loader:before{position:absolute;top:0;content:''}.loader:before{left:-1.5em;-webkit-animation-delay:-.32s;animation-delay:-.32s}.loader:after{left:1.5em}@-webkit-keyframes load1{0%,100%,80%{box-shadow:0 0;height:4em}40%{box-shadow:0 -2em;height:5em}}@keyframes load1{0%,100%,80%{box-shadow:0 0;height:4em}40%{box-shadow:0 -2em;height:5em}}", "#ng-chat{position:fixed;z-index:999;right:0;bottom:0;box-sizing:initial;font-size:11pt;text-align:left}#ng-chat .shadowed{box-shadow:0 4px 8px rgba(0,0,0,.25)}.ng-chat-loading-wrapper{height:30px;text-align:center;font-size:.9em}.ng-chat-close{text-decoration:none;float:right}.ng-chat-title,.ng-chat-title:hover{position:relative;z-index:2;height:30px;line-height:30px;font-size:.9em;padding:0 10px;display:block;text-decoration:none;color:inherit;font-weight:400;cursor:pointer}.ng-chat-title .ng-chat-title-visibility-toggle-area{display:inline-block;width:85%}.ng-chat-title .ng-chat-title-visibility-toggle-area>strong{font-weight:600;display:block;overflow:hidden;height:30px;text-overflow:ellipsis;white-space:nowrap;max-width:85%;float:left}.ng-chat-title .ng-chat-title-visibility-toggle-area .ng-chat-participant-status{float:left;margin-left:5px}.ng-chat-participant-status{display:inline-block;border-radius:25px;width:8px;height:8px;margin-top:10px}.ng-chat-participant-status.online{background-color:#92a400}.ng-chat-participant-status.busy{background-color:#f91c1e}.ng-chat-participant-status.away{background-color:#f7d21b}.ng-chat-participant-status.offline{background-color:#bababa}.ng-chat-unread-messages-count{margin-left:5px;padding:0 5px;border-radius:25px;font-size:.9em;line-height:30px}.ng-chat-options-container{float:right;margin-right:5px}", "#ng-chat.light-theme,#ng-chat.light-theme .primary-text{color:#5c5c5c;font-family:Arial,Helvetica,sans-serif}#ng-chat.light-theme .primary-background{background-color:#fff}#ng-chat.light-theme .secondary-background{background-color:#fafafa}#ng-chat.light-theme .primary-outline-color{border-color:#a3a3a3}#ng-chat.light-theme .friends-search-bar{background-color:#fff}#ng-chat.light-theme .ng-chat-people-action,#ng-chat.light-theme .ng-chat-people-action>i,#ng-chat.light-theme .unread-messages-counter-container{color:#5c5c5c;background-color:#e3e3e3}#ng-chat.light-theme .load-history-action{background-color:#e3e3e3}#ng-chat.light-theme .chat-window-input{background-color:#fff}#ng-chat.light-theme .file-message-container,#ng-chat.light-theme .sent-chat-message-container{background-color:#e3e3e3;border-color:#e3e3e3}#ng-chat.light-theme .file-message-container.received,#ng-chat.light-theme .received-chat-message-container{background-color:#fff;border-color:#e3e3e3}", "#ng-chat.dark-theme,#ng-chat.dark-theme .primary-text{color:#fff;font-family:Arial,Helvetica,sans-serif}#ng-chat.dark-theme .primary-background{background-color:#565656}#ng-chat.dark-theme .secondary-background{background-color:#444}#ng-chat.dark-theme .primary-outline-color{border-color:#353535}#ng-chat.dark-theme .friends-search-bar{background-color:#444;border:1px solid #444;color:#fff}#ng-chat.dark-theme .ng-chat-people-action,#ng-chat.dark-theme .ng-chat-people-action>i,#ng-chat.dark-theme .unread-messages-counter-container{background-color:#fff;color:#444}#ng-chat.dark-theme .load-history-action{background-color:#444}#ng-chat.dark-theme .chat-window-input{background-color:#444;color:#fff}#ng-chat.dark-theme .file-message-container,#ng-chat.dark-theme .sent-chat-message-container{border-color:#444;background-color:#444}#ng-chat.dark-theme .file-message-container.received,#ng-chat.dark-theme .received-chat-message-container{background-color:#565656;border-color:#444}#ng-chat.dark-theme .ng-chat-footer{background-color:#444}#ng-chat.dark-theme .ng-chat-message a{color:#fff}"]
    })
], NgChat);
export { NgChat };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmctY2hhdC5jb21wb25lbnQuanMiLCJzb3VyY2VSb290Ijoibmc6Ly9uZy1jaGF0LyIsInNvdXJjZXMiOlsibmctY2hhdC9uZy1jaGF0LmNvbXBvbmVudC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUEsT0FBTyxFQUFFLFNBQVMsRUFBRSxLQUFLLEVBQVUsWUFBWSxFQUFhLFlBQVksRUFBRSxNQUFNLEVBQUUsWUFBWSxFQUFFLGlCQUFpQixFQUFFLE1BQU0sZUFBZSxDQUFDO0FBQ3pJLE9BQU8sRUFBRSxVQUFVLEVBQUUsTUFBTSxzQkFBc0IsQ0FBQztBQU9sRCxPQUFPLEVBQUUsV0FBVyxFQUFFLE1BQU0sMEJBQTBCLENBQUM7QUFDdkQsT0FBTyxFQUFFLE1BQU0sRUFBRSxNQUFNLGVBQWUsQ0FBQztBQUN2QyxPQUFPLEVBQUUscUJBQXFCLEVBQUUsTUFBTSxxQ0FBcUMsQ0FBQztBQUM1RSxPQUFPLEVBQUUsZUFBZSxFQUFFLE1BQU0sOEJBQThCLENBQUM7QUFHL0QsT0FBTyxFQUFFLHVCQUF1QixFQUFFLE1BQU0sbUNBQW1DLENBQUM7QUFFNUUsT0FBTyxFQUFFLHdCQUF3QixFQUFFLE1BQU0sb0NBQW9DLENBQUM7QUFDOUUsT0FBTyxFQUFFLEtBQUssRUFBRSxNQUFNLG1CQUFtQixDQUFDO0FBRTFDLE9BQU8sRUFBRSxLQUFLLEVBQUUsTUFBTSxjQUFjLENBQUM7QUFDckMsT0FBTyxFQUFFLG1CQUFtQixFQUFFLE1BQU0sbUNBQW1DLENBQUM7QUFHeEUsT0FBTyxFQUFFLEdBQUcsRUFBRSxNQUFNLGdCQUFnQixDQUFDO0FBZ0JyQyxJQUFhLE1BQU0sR0FBbkIsTUFBYSxNQUFNO0lBQ2YsWUFBb0IsV0FBdUI7UUFBdkIsZ0JBQVcsR0FBWCxXQUFXLENBQVk7UUFFM0Msb0NBQW9DO1FBQzdCLHdCQUFtQixHQUFHLG1CQUFtQixDQUFDO1FBQzFDLDBCQUFxQixHQUFHLHFCQUFxQixDQUFDO1FBQzlDLGdCQUFXLEdBQUcsV0FBVyxDQUFDO1FBRXpC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QyxLQUFLLEVBQUU7cURBQ3VDO0FBRy9DO0lBREMsS0FBSyxFQUFFOytDQUMrQjtBQUd2QztJQURDLEtBQUssRUFBRTt5REFDMEM7QUFHbEQ7SUFEQyxNQUFNLEVBQUU7b0RBQzBGO0FBR25HO0lBREMsTUFBTSxFQUFFO3VEQUM2RjtBQUd0RztJQURDLE1BQU0sRUFBRTt1REFDNkY7QUFHdEc7SUFEQyxNQUFNLEVBQUU7OENBQ3NFO0FBaURuRDtJQUEzQixZQUFZLENBQUMsWUFBWSxDQUFDOzJDQUErQztBQU8xRTtJQURDLFlBQVksQ0FBQyxlQUFlLEVBQUUsQ0FBQyxRQUFRLENBQUMsQ0FBQztzQ0FLekM7QUE3TFEsTUFBTTtJQWJsQixTQUFTLENBQUM7UUFDUCxRQUFRLEVBQUUsU0FBUztRQUNuQixrb0VBQXFDO1FBUXJDLGFBQWEsRUFBRSxpQkFBaUIsQ0FBQyxJQUFJOztLQUN4QyxDQUFDO0dBRVcsTUFBTSxDQTB2QmxCO1NBMXZCWSxNQUFNIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgQ29tcG9uZW50LCBJbnB1dCwgT25Jbml0LCBWaWV3Q2hpbGRyZW4sIFF1ZXJ5TGlzdCwgSG9zdExpc3RlbmVyLCBPdXRwdXQsIEV2ZW50RW1pdHRlciwgVmlld0VuY2Fwc3VsYXRpb24gfSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7IEh0dHBDbGllbnQgfSBmcm9tICdAYW5ndWxhci9jb21tb24vaHR0cCc7XG5cbmltcG9ydCB7IENoYXRBZGFwdGVyIH0gZnJvbSAnLi9jb3JlL2NoYXQtYWRhcHRlcic7XG5pbXBvcnQgeyBJQ2hhdEdyb3VwQWRhcHRlciB9IGZyb20gJy4vY29yZS9jaGF0LWdyb3VwLWFkYXB0ZXInO1xuaW1wb3J0IHsgVXNlciB9IGZyb20gXCIuL2NvcmUvdXNlclwiO1xuaW1wb3J0IHsgUGFydGljaXBhbnRSZXNwb25zZSB9IGZyb20gXCIuL2NvcmUvcGFydGljaXBhbnQtcmVzcG9uc2VcIjtcbmltcG9ydCB7IE1lc3NhZ2UgfSBmcm9tIFwiLi9jb3JlL21lc3NhZ2VcIjtcbmltcG9ydCB7IE1lc3NhZ2VUeXBlIH0gZnJvbSBcIi4vY29yZS9tZXNzYWdlLXR5cGUuZW51bVwiO1xuaW1wb3J0IHsgV2luZG93IH0gZnJvbSBcIi4vY29yZS93aW5kb3dcIjtcbmltcG9ydCB7IENoYXRQYXJ0aWNpcGFudFN0YXR1cyB9IGZyb20gXCIuL2NvcmUvY2hhdC1wYXJ0aWNpcGFudC1zdGF0dXMuZW51bVwiO1xuaW1wb3J0IHsgU2Nyb2xsRGlyZWN0aW9uIH0gZnJvbSBcIi4vY29yZS9zY3JvbGwtZGlyZWN0aW9uLmVudW1cIjtcbmltcG9ydCB7IExvY2FsaXphdGlvbiwgU3RhdHVzRGVzY3JpcHRpb24gfSBmcm9tICcuL2NvcmUvbG9jYWxpemF0aW9uJztcbmltcG9ydCB7IElDaGF0Q29udHJvbGxlciB9IGZyb20gJy4vY29yZS9jaGF0LWNvbnRyb2xsZXInO1xuaW1wb3J0IHsgUGFnZWRIaXN0b3J5Q2hhdEFkYXB0ZXIgfSBmcm9tICcuL2NvcmUvcGFnZWQtaGlzdG9yeS1jaGF0LWFkYXB0ZXInO1xuaW1wb3J0IHsgSUZpbGVVcGxvYWRBZGFwdGVyIH0gZnJvbSAnLi9jb3JlL2ZpbGUtdXBsb2FkLWFkYXB0ZXInO1xuaW1wb3J0IHsgRGVmYXVsdEZpbGVVcGxvYWRBZGFwdGVyIH0gZnJvbSAnLi9jb3JlL2RlZmF1bHQtZmlsZS11cGxvYWQtYWRhcHRlcic7XG5pbXBvcnQgeyBUaGVtZSB9IGZyb20gJy4vY29yZS90aGVtZS5lbnVtJztcbmltcG9ydCB7IElDaGF0T3B0aW9uIH0gZnJvbSAnLi9jb3JlL2NoYXQtb3B0aW9uJztcbmltcG9ydCB7IEdyb3VwIH0gZnJvbSBcIi4vY29yZS9ncm91cFwiO1xuaW1wb3J0IHsgQ2hhdFBhcnRpY2lwYW50VHlwZSB9IGZyb20gXCIuL2NvcmUvY2hhdC1wYXJ0aWNpcGFudC10eXBlLmVudW1cIjtcbmltcG9ydCB7IElDaGF0UGFydGljaXBhbnQgfSBmcm9tIFwiLi9jb3JlL2NoYXQtcGFydGljaXBhbnRcIjtcblxuaW1wb3J0IHsgbWFwIH0gZnJvbSAncnhqcy9vcGVyYXRvcnMnO1xuaW1wb3J0IHsgTmdDaGF0V2luZG93Q29tcG9uZW50IH0gZnJvbSAnLi9jb21wb25lbnRzL25nLWNoYXQtd2luZG93L25nLWNoYXQtd2luZG93LmNvbXBvbmVudCc7XG5cbkBDb21wb25lbnQoe1xuICAgIHNlbGVjdG9yOiAnbmctY2hhdCcsXG4gICAgdGVtcGxhdGVVcmw6ICduZy1jaGF0LmNvbXBvbmVudC5odG1sJyxcbiAgICBzdHlsZVVybHM6IFtcbiAgICAgICAgJ2Fzc2V0cy9pY29ucy5jc3MnLFxuICAgICAgICAnYXNzZXRzL2xvYWRpbmctc3Bpbm5lci5jc3MnLFxuICAgICAgICAnYXNzZXRzL25nLWNoYXQuY29tcG9uZW50LmRlZmF1bHQuY3NzJyxcbiAgICAgICAgJ2Fzc2V0cy90aGVtZXMvbmctY2hhdC50aGVtZS5kZWZhdWx0LnNjc3MnLFxuICAgICAgICAnYXNzZXRzL3RoZW1lcy9uZy1jaGF0LnRoZW1lLmRhcmsuc2NzcydcbiAgICBdLFxuICAgIGVuY2Fwc3VsYXRpb246IFZpZXdFbmNhcHN1bGF0aW9uLk5vbmVcbn0pXG5cbmV4cG9ydCBjbGFzcyBOZ0NoYXQgaW1wbGVtZW50cyBPbkluaXQsIElDaGF0Q29udHJvbGxlciB7XG4gICAgY29uc3RydWN0b3IocHJpdmF0ZSBfaHR0cENsaWVudDogSHR0cENsaWVudCkgeyB9XG5cbiAgICAvLyBFeHBvc2VzIGVudW1zIGZvciB0aGUgbmctdGVtcGxhdGVcbiAgICBwdWJsaWMgQ2hhdFBhcnRpY2lwYW50VHlwZSA9IENoYXRQYXJ0aWNpcGFudFR5cGU7XG4gICAgcHVibGljIENoYXRQYXJ0aWNpcGFudFN0YXR1cyA9IENoYXRQYXJ0aWNpcGFudFN0YXR1cztcbiAgICBwdWJsaWMgTWVzc2FnZVR5cGUgPSBNZXNzYWdlVHlwZTtcblxuICAgIHByaXZhdGUgX2lzRGlzYWJsZWQ6IGJvb2xlYW4gPSBmYWxzZTtcblxuICAgIGdldCBpc0Rpc2FibGVkKCk6IGJvb2xlYW4ge1xuICAgICAgICByZXR1cm4gdGhpcy5faXNEaXNhYmxlZDtcbiAgICB9XG4gICAgICBcbiAgICBASW5wdXQoKVxuICAgIHNldCBpc0Rpc2FibGVkKHZhbHVlOiBib29sZWFuKSB7XG4gICAgICAgIHRoaXMuX2lzRGlzYWJsZWQgPSB2YWx1ZTtcblxuICAgICAgICBpZiAodmFsdWUpXG4gICAgICAgIHtcbiAgICAgICAgICAgIC8vIFRvIGFkZHJlc3MgaXNzdWUgaHR0cHM6Ly9naXRodWIuY29tL3JwYXNjaG9hbC9uZy1jaGF0L2lzc3Vlcy8xMjBcbiAgICAgICAgICAgIHdpbmRvdy5jbGVhckludGVydmFsKHRoaXMucG9sbGluZ0ludGVydmFsV2luZG93SW5zdGFuY2UpXG4gICAgICAgIH1cbiAgICAgICAgZWxzZVxuICAgICAgICB7XG4gICAgICAgICAgICB0aGlzLmFjdGl2YXRlRnJpZW5kTGlzdEZldGNoKCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBASW5wdXQoKVxuICAgIHB1YmxpYyBhZGFwdGVyOiBDaGF0QWRhcHRlcjtcblxuICAgIEBJbnB1dCgpXG4gICAgcHVibGljIGdyb3VwQWRhcHRlcjogSUNoYXRHcm91cEFkYXB0ZXI7XG5cbiAgICBASW5wdXQoKVxuICAgIHB1YmxpYyB1c2VySWQ6IGFueTtcblxuICAgIEBJbnB1dCgpXG4gICAgcHVibGljIGlzQ29sbGFwc2VkOiBib29sZWFuID0gZmFsc2U7XG5cbiAgICBASW5wdXQoKVxuICAgIHB1YmxpYyBtYXhpbWl6ZVdpbmRvd09uTmV3TWVzc2FnZTogYm9vbGVhbiA9IHRydWU7XG5cbiAgICBASW5wdXQoKSAgICBcbiAgICBwdWJsaWMgcG9sbEZyaWVuZHNMaXN0OiBib29sZWFuID0gZmFsc2U7XG5cbiAgICBASW5wdXQoKVxuICAgIHB1YmxpYyBwb2xsaW5nSW50ZXJ2YWw6IG51bWJlciA9IDUwMDA7XG5cbiAgICBASW5wdXQoKSAgICBcbiAgICBwdWJsaWMgaGlzdG9yeUVuYWJsZWQ6IGJvb2xlYW4gPSB0cnVlO1xuXG4gICAgQElucHV0KCkgICAgXG4gICAgcHVibGljIGVtb2ppc0VuYWJsZWQ6IGJvb2xlYW4gPSB0cnVlO1xuXG4gICAgQElucHV0KCkgICAgXG4gICAgcHVibGljIGxpbmtmeUVuYWJsZWQ6IGJvb2xlYW4gPSB0cnVlO1xuXG4gICAgQElucHV0KClcbiAgICBwdWJsaWMgYXVkaW9FbmFibGVkOiBib29sZWFuID0gdHJ1ZTtcblxuICAgIEBJbnB1dCgpXG4gICAgcHVibGljIHNlYXJjaEVuYWJsZWQ6IGJvb2xlYW4gPSB0cnVlO1xuXG4gICAgQElucHV0KCkgLy8gVE9ETzogVGhpcyBtaWdodCBuZWVkIGEgYmV0dGVyIGNvbnRlbnQgc3RyYXRlZ3lcbiAgICBwdWJsaWMgYXVkaW9Tb3VyY2U6IHN0cmluZyA9ICdodHRwczovL3Jhdy5naXRodWJ1c2VyY29udGVudC5jb20vcnBhc2Nob2FsL25nLWNoYXQvbWFzdGVyL3NyYy9uZy1jaGF0L2Fzc2V0cy9ub3RpZmljYXRpb24ud2F2JztcblxuICAgIEBJbnB1dCgpXG4gICAgcHVibGljIHBlcnNpc3RXaW5kb3dzU3RhdGU6IGJvb2xlYW4gPSB0cnVlO1xuXG4gICAgQElucHV0KClcbiAgICBwdWJsaWMgdGl0bGU6IHN0cmluZyA9IFwiRnJpZW5kc1wiO1xuXG4gICAgQElucHV0KClcbiAgICBwdWJsaWMgbWVzc2FnZVBsYWNlaG9sZGVyOiBzdHJpbmcgPSBcIlR5cGUgYSBtZXNzYWdlXCI7XG5cbiAgICBASW5wdXQoKVxuICAgIHB1YmxpYyBzZWFyY2hQbGFjZWhvbGRlcjogc3RyaW5nID0gXCJTZWFyY2hcIjtcblxuICAgIEBJbnB1dCgpXG4gICAgcHVibGljIGJyb3dzZXJOb3RpZmljYXRpb25zRW5hYmxlZDogYm9vbGVhbiA9IHRydWU7XG5cbiAgICBASW5wdXQoKSAvLyBUT0RPOiBUaGlzIG1pZ2h0IG5lZWQgYSBiZXR0ZXIgY29udGVudCBzdHJhdGVneVxuICAgIHB1YmxpYyBicm93c2VyTm90aWZpY2F0aW9uSWNvblNvdXJjZTogc3RyaW5nID0gJ2h0dHBzOi8vcmF3LmdpdGh1YnVzZXJjb250ZW50LmNvbS9ycGFzY2hvYWwvbmctY2hhdC9tYXN0ZXIvc3JjL25nLWNoYXQvYXNzZXRzL25vdGlmaWNhdGlvbi5wbmcnO1xuXG4gICAgQElucHV0KClcbiAgICBwdWJsaWMgYnJvd3Nlck5vdGlmaWNhdGlvblRpdGxlOiBzdHJpbmcgPSBcIk5ldyBtZXNzYWdlIGZyb21cIjtcbiAgICBcbiAgICBASW5wdXQoKVxuICAgIHB1YmxpYyBoaXN0b3J5UGFnZVNpemU6IG51bWJlciA9IDEwO1xuXG4gICAgQElucHV0KClcbiAgICBwdWJsaWMgbG9jYWxpemF0aW9uOiBMb2NhbGl6YXRpb247XG5cbiAgICBASW5wdXQoKVxuICAgIHB1YmxpYyBoaWRlRnJpZW5kc0xpc3Q6IGJvb2xlYW4gPSBmYWxzZTtcblxuICAgIEBJbnB1dCgpXG4gICAgcHVibGljIGhpZGVGcmllbmRzTGlzdE9uVW5zdXBwb3J0ZWRWaWV3cG9ydDogYm9vbGVhbiA9IHRydWU7XG5cbiAgICBASW5wdXQoKVxuICAgIHB1YmxpYyBmaWxlVXBsb2FkVXJsOiBzdHJpbmc7XG5cbiAgICBASW5wdXQoKVxuICAgIHB1YmxpYyB0aGVtZTogVGhlbWUgPSBUaGVtZS5MaWdodDtcblxuICAgIEBJbnB1dCgpXG4gICAgcHVibGljIGN1c3RvbVRoZW1lOiBzdHJpbmc7XG5cbiAgICBASW5wdXQoKVxuICAgIHB1YmxpYyBtZXNzYWdlRGF0ZVBpcGVGb3JtYXQ6IHN0cmluZyA9IFwic2hvcnRcIjtcblxuICAgIEBJbnB1dCgpXG4gICAgcHVibGljIHNob3dNZXNzYWdlRGF0ZTogYm9vbGVhbiA9IHRydWU7XG4gICAgXG4gICAgQElucHV0KClcbiAgICBwdWJsaWMgaXNWaWV3cG9ydE9uTW9iaWxlRW5hYmxlZDogYm9vbGVhbiA9IGZhbHNlO1xuICAgICBcbiAgICBAT3V0cHV0KClcbiAgICBwdWJsaWMgb25QYXJ0aWNpcGFudENsaWNrZWQ6IEV2ZW50RW1pdHRlcjxJQ2hhdFBhcnRpY2lwYW50PiA9IG5ldyBFdmVudEVtaXR0ZXI8SUNoYXRQYXJ0aWNpcGFudD4oKTtcblxuICAgIEBPdXRwdXQoKVxuICAgIHB1YmxpYyBvblBhcnRpY2lwYW50Q2hhdE9wZW5lZDogRXZlbnRFbWl0dGVyPElDaGF0UGFydGljaXBhbnQ+ID0gbmV3IEV2ZW50RW1pdHRlcjxJQ2hhdFBhcnRpY2lwYW50PigpO1xuXG4gICAgQE91dHB1dCgpXG4gICAgcHVibGljIG9uUGFydGljaXBhbnRDaGF0Q2xvc2VkOiBFdmVudEVtaXR0ZXI8SUNoYXRQYXJ0aWNpcGFudD4gPSBuZXcgRXZlbnRFbWl0dGVyPElDaGF0UGFydGljaXBhbnQ+KCk7XG4gICAgXG4gICAgQE91dHB1dCgpXG4gICAgcHVibGljIG9uTWVzc2FnZXNTZWVuOiBFdmVudEVtaXR0ZXI8TWVzc2FnZVtdPiA9IG5ldyBFdmVudEVtaXR0ZXI8TWVzc2FnZVtdPigpO1xuXG4gICAgcHJpdmF0ZSBicm93c2VyTm90aWZpY2F0aW9uc0Jvb3RzdHJhcHBlZDogYm9vbGVhbiA9IGZhbHNlO1xuXG4gICAgcHVibGljIGhhc1BhZ2VkSGlzdG9yeTogYm9vbGVhbiA9IGZhbHNlO1xuXG4gICAgLy8gRG9uJ3Qgd2FudCB0byBhZGQgdGhpcyBhcyBhIHNldHRpbmcgdG8gc2ltcGxpZnkgdXNhZ2UuIFByZXZpb3VzIHBsYWNlaG9sZGVyIGFuZCB0aXRsZSBzZXR0aW5ncyBhdmFpbGFibGUgdG8gYmUgdXNlZCwgb3IgdXNlIGZ1bGwgTG9jYWxpemF0aW9uIG9iamVjdC5cbiAgICBwcml2YXRlIHN0YXR1c0Rlc2NyaXB0aW9uOiBTdGF0dXNEZXNjcmlwdGlvbiA9IHtcbiAgICAgICAgb25saW5lOiAnT25saW5lJyxcbiAgICAgICAgYnVzeTogJ0J1c3knLFxuICAgICAgICBhd2F5OiAnQXdheScsXG4gICAgICAgIG9mZmxpbmU6ICdPZmZsaW5lJ1xuICAgIH07XG5cbiAgICBwcml2YXRlIGF1ZGlvRmlsZTogSFRNTEF1ZGlvRWxlbWVudDtcblxuICAgIHB1YmxpYyBwYXJ0aWNpcGFudHM6IElDaGF0UGFydGljaXBhbnRbXTtcblxuICAgIHB1YmxpYyBwYXJ0aWNpcGFudHNSZXNwb25zZTogUGFydGljaXBhbnRSZXNwb25zZVtdO1xuXG4gICAgcHVibGljIHBhcnRpY2lwYW50c0ludGVyYWN0ZWRXaXRoOiBJQ2hhdFBhcnRpY2lwYW50W10gPSBbXTtcblxuICAgIHB1YmxpYyBjdXJyZW50QWN0aXZlT3B0aW9uOiBJQ2hhdE9wdGlvbiB8IG51bGw7XG5cbiAgICBwcml2YXRlIHBvbGxpbmdJbnRlcnZhbFdpbmRvd0luc3RhbmNlOiBudW1iZXI7XG5cbiAgICBwcml2YXRlIGdldCBsb2NhbFN0b3JhZ2VLZXkoKTogc3RyaW5nIFxuICAgIHtcbiAgICAgICAgcmV0dXJuIGBuZy1jaGF0LXVzZXJzLSR7dGhpcy51c2VySWR9YDsgLy8gQXBwZW5kaW5nIHRoZSB1c2VyIGlkIHNvIHRoZSBzdGF0ZSBpcyB1bmlxdWUgcGVyIHVzZXIgaW4gYSBjb21wdXRlci4gICBcbiAgICB9O1xuXG4gICAgLy8gRGVmaW5lcyB0aGUgc2l6ZSBvZiBlYWNoIG9wZW5lZCB3aW5kb3cgdG8gY2FsY3VsYXRlIGhvdyBtYW55IHdpbmRvd3MgY2FuIGJlIG9wZW5lZCBvbiB0aGUgdmlld3BvcnQgYXQgdGhlIHNhbWUgdGltZS5cbiAgICBwdWJsaWMgd2luZG93U2l6ZUZhY3RvcjogbnVtYmVyID0gMzIwO1xuXG4gICAgLy8gVG90YWwgd2lkdGggc2l6ZSBvZiB0aGUgZnJpZW5kcyBsaXN0IHNlY3Rpb25cbiAgICBwdWJsaWMgZnJpZW5kc0xpc3RXaWR0aDogbnVtYmVyID0gMjYyO1xuXG4gICAgLy8gQXZhaWxhYmxlIGFyZWEgdG8gcmVuZGVyIHRoZSBwbHVnaW5cbiAgICBwcml2YXRlIHZpZXdQb3J0VG90YWxBcmVhOiBudW1iZXI7XG4gICAgXG4gICAgLy8gU2V0IHRvIHRydWUgaWYgdGhlcmUgaXMgbm8gc3BhY2UgdG8gZGlzcGxheSBhdCBsZWFzdCBvbmUgY2hhdCB3aW5kb3cgYW5kICdoaWRlRnJpZW5kc0xpc3RPblVuc3VwcG9ydGVkVmlld3BvcnQnIGlzIHRydWVcbiAgICBwdWJsaWMgdW5zdXBwb3J0ZWRWaWV3cG9ydDogYm9vbGVhbiA9IGZhbHNlO1xuXG4gICAgLy8gRmlsZSB1cGxvYWQgYWRhcHRlclxuICAgIHB1YmxpYyBmaWxlVXBsb2FkQWRhcHRlcjogSUZpbGVVcGxvYWRBZGFwdGVyO1xuXG4gICAgd2luZG93czogV2luZG93W10gPSBbXTtcbiAgICBpc0Jvb3RzdHJhcHBlZDogYm9vbGVhbiA9IGZhbHNlO1xuXG4gICAgQFZpZXdDaGlsZHJlbignY2hhdFdpbmRvdycpIGNoYXRXaW5kb3dzOiBRdWVyeUxpc3Q8TmdDaGF0V2luZG93Q29tcG9uZW50PjtcblxuICAgIG5nT25Jbml0KCkgeyBcbiAgICAgICAgdGhpcy5ib290c3RyYXBDaGF0KCk7XG4gICAgfVxuXG4gICAgQEhvc3RMaXN0ZW5lcignd2luZG93OnJlc2l6ZScsIFsnJGV2ZW50J10pXG4gICAgb25SZXNpemUoZXZlbnQ6IGFueSl7XG4gICAgICAgdGhpcy52aWV3UG9ydFRvdGFsQXJlYSA9IGV2ZW50LnRhcmdldC5pbm5lcldpZHRoO1xuXG4gICAgICAgdGhpcy5Ob3JtYWxpemVXaW5kb3dzKCk7XG4gICAgfVxuXG4gICAgLy8gQ2hlY2tzIGlmIHRoZXJlIGFyZSBtb3JlIG9wZW5lZCB3aW5kb3dzIHRoYW4gdGhlIHZpZXcgcG9ydCBjYW4gZGlzcGxheVxuICAgIHByaXZhdGUgTm9ybWFsaXplV2luZG93cygpOiB2b2lkXG4gICAge1xuICAgICAgICBjb25zdCBtYXhTdXBwb3J0ZWRPcGVuZWRXaW5kb3dzID0gTWF0aC5mbG9vcigodGhpcy52aWV3UG9ydFRvdGFsQXJlYSAtICghdGhpcy5oaWRlRnJpZW5kc0xpc3QgPyB0aGlzLmZyaWVuZHNMaXN0V2lkdGggOiAwKSkgLyB0aGlzLndpbmRvd1NpemVGYWN0b3IpO1xuICAgICAgICBjb25zdCBkaWZmZXJlbmNlID0gdGhpcy53aW5kb3dzLmxlbmd0aCAtIG1heFN1cHBvcnRlZE9wZW5lZFdpbmRvd3M7XG5cbiAgICAgICAgaWYgKGRpZmZlcmVuY2UgPj0gMClcbiAgICAgICAge1xuICAgICAgICAgICAgdGhpcy53aW5kb3dzLnNwbGljZSh0aGlzLndpbmRvd3MubGVuZ3RoIC0gZGlmZmVyZW5jZSk7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLnVwZGF0ZVdpbmRvd3NTdGF0ZSh0aGlzLndpbmRvd3MpO1xuXG4gICAgICAgIC8vIFZpZXdwb3J0IHNob3VsZCBoYXZlIHNwYWNlIGZvciBhdCBsZWFzdCBvbmUgY2hhdCB3aW5kb3cgYnV0IHNob3VsZCBzaG93IGluIG1vYmlsZSBpZiBvcHRpb24gaXMgZW5hYmxlZC5cbiAgICAgICAgdGhpcy51bnN1cHBvcnRlZFZpZXdwb3J0ID0gdGhpcy5pc1ZpZXdwb3J0T25Nb2JpbGVFbmFibGVkPyBmYWxzZSA6IHRoaXMuaGlkZUZyaWVuZHNMaXN0T25VbnN1cHBvcnRlZFZpZXdwb3J0ICYmIG1heFN1cHBvcnRlZE9wZW5lZFdpbmRvd3MgPCAxO1xuICAgIH1cblxuICAgIC8vIEluaXRpYWxpemVzIHRoZSBjaGF0IHBsdWdpbiBhbmQgdGhlIG1lc3NhZ2luZyBhZGFwdGVyXG4gICAgcHJpdmF0ZSBib290c3RyYXBDaGF0KCk6IHZvaWRcbiAgICB7XG4gICAgICAgIGxldCBpbml0aWFsaXphdGlvbkV4Y2VwdGlvbiA9IG51bGw7XG5cbiAgICAgICAgaWYgKHRoaXMuYWRhcHRlciAhPSBudWxsICYmIHRoaXMudXNlcklkICE9IG51bGwpXG4gICAgICAgIHtcbiAgICAgICAgICAgIHRyeVxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIHRoaXMudmlld1BvcnRUb3RhbEFyZWEgPSB3aW5kb3cuaW5uZXJXaWR0aDtcblxuICAgICAgICAgICAgICAgIHRoaXMuaW5pdGlhbGl6ZVRoZW1lKCk7XG4gICAgICAgICAgICAgICAgdGhpcy5pbml0aWFsaXplRGVmYXVsdFRleHQoKTtcbiAgICAgICAgICAgICAgICB0aGlzLmluaXRpYWxpemVCcm93c2VyTm90aWZpY2F0aW9ucygpO1xuXG4gICAgICAgICAgICAgICAgLy8gQmluZGluZyBldmVudCBsaXN0ZW5lcnNcbiAgICAgICAgICAgICAgICB0aGlzLmFkYXB0ZXIubWVzc2FnZVJlY2VpdmVkSGFuZGxlciA9IChwYXJ0aWNpcGFudCwgbXNnKSA9PiB0aGlzLm9uTWVzc2FnZVJlY2VpdmVkKHBhcnRpY2lwYW50LCBtc2cpO1xuICAgICAgICAgICAgICAgIHRoaXMuYWRhcHRlci5mcmllbmRzTGlzdENoYW5nZWRIYW5kbGVyID0gKHBhcnRpY2lwYW50c1Jlc3BvbnNlKSA9PiB0aGlzLm9uRnJpZW5kc0xpc3RDaGFuZ2VkKHBhcnRpY2lwYW50c1Jlc3BvbnNlKTtcblxuICAgICAgICAgICAgICAgIHRoaXMuYWN0aXZhdGVGcmllbmRMaXN0RmV0Y2goKTtcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICB0aGlzLmJ1ZmZlckF1ZGlvRmlsZSgpO1xuXG4gICAgICAgICAgICAgICAgdGhpcy5oYXNQYWdlZEhpc3RvcnkgPSB0aGlzLmFkYXB0ZXIgaW5zdGFuY2VvZiBQYWdlZEhpc3RvcnlDaGF0QWRhcHRlcjtcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5maWxlVXBsb2FkVXJsICYmIHRoaXMuZmlsZVVwbG9hZFVybCAhPT0gXCJcIilcbiAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZmlsZVVwbG9hZEFkYXB0ZXIgPSBuZXcgRGVmYXVsdEZpbGVVcGxvYWRBZGFwdGVyKHRoaXMuZmlsZVVwbG9hZFVybCwgdGhpcy5faHR0cENsaWVudCk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgdGhpcy5Ob3JtYWxpemVXaW5kb3dzKCk7XG5cbiAgICAgICAgICAgICAgICB0aGlzLmlzQm9vdHN0cmFwcGVkID0gdHJ1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNhdGNoKGV4KVxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIGluaXRpYWxpemF0aW9uRXhjZXB0aW9uID0gZXg7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoIXRoaXMuaXNCb290c3RyYXBwZWQpe1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcihcIm5nLWNoYXQgY29tcG9uZW50IGNvdWxkbid0IGJlIGJvb3RzdHJhcHBlZC5cIik7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGlmICh0aGlzLnVzZXJJZCA9PSBudWxsKXtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKFwibmctY2hhdCBjYW4ndCBiZSBpbml0aWFsaXplZCB3aXRob3V0IGFuIHVzZXIgaWQuIFBsZWFzZSBtYWtlIHN1cmUgeW91J3ZlIHByb3ZpZGVkIGFuIHVzZXJJZCBhcyBhIHBhcmFtZXRlciBvZiB0aGUgbmctY2hhdCBjb21wb25lbnQuXCIpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKHRoaXMuYWRhcHRlciA9PSBudWxsKXtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKFwibmctY2hhdCBjYW4ndCBiZSBib290c3RyYXBwZWQgd2l0aG91dCBhIENoYXRBZGFwdGVyLiBQbGVhc2UgbWFrZSBzdXJlIHlvdSd2ZSBwcm92aWRlZCBhIENoYXRBZGFwdGVyIGltcGxlbWVudGF0aW9uIGFzIGEgcGFyYW1ldGVyIG9mIHRoZSBuZy1jaGF0IGNvbXBvbmVudC5cIik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoaW5pdGlhbGl6YXRpb25FeGNlcHRpb24pXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcihgQW4gZXhjZXB0aW9uIGhhcyBvY2N1cnJlZCB3aGlsZSBpbml0aWFsaXppbmcgbmctY2hhdC4gRGV0YWlsczogJHtpbml0aWFsaXphdGlvbkV4Y2VwdGlvbi5tZXNzYWdlfWApO1xuICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoaW5pdGlhbGl6YXRpb25FeGNlcHRpb24pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBhY3RpdmF0ZUZyaWVuZExpc3RGZXRjaCgpOiB2b2lkIHtcbiAgICAgICAgaWYgKHRoaXMuYWRhcHRlcilcbiAgICAgICAge1xuICAgICAgICAgICAgLy8gTG9hZGluZyBjdXJyZW50IHVzZXJzIGxpc3RcbiAgICAgICAgICAgIGlmICh0aGlzLnBvbGxGcmllbmRzTGlzdCl7XG4gICAgICAgICAgICAgICAgLy8gU2V0dGluZyBhIGxvbmcgcG9sbCBpbnRlcnZhbCB0byB1cGRhdGUgdGhlIGZyaWVuZHMgbGlzdFxuICAgICAgICAgICAgICAgIHRoaXMuZmV0Y2hGcmllbmRzTGlzdCh0cnVlKTtcbiAgICAgICAgICAgICAgICB0aGlzLnBvbGxpbmdJbnRlcnZhbFdpbmRvd0luc3RhbmNlID0gd2luZG93LnNldEludGVydmFsKCgpID0+IHRoaXMuZmV0Y2hGcmllbmRzTGlzdChmYWxzZSksIHRoaXMucG9sbGluZ0ludGVydmFsKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAvLyBTaW5jZSBwb2xsaW5nIHdhcyBkaXNhYmxlZCwgYSBmcmllbmRzIGxpc3QgdXBkYXRlIG1lY2hhbmlzbSB3aWxsIGhhdmUgdG8gYmUgaW1wbGVtZW50ZWQgaW4gdGhlIENoYXRBZGFwdGVyLlxuICAgICAgICAgICAgICAgIHRoaXMuZmV0Y2hGcmllbmRzTGlzdCh0cnVlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8vIEluaXRpYWxpemVzIGJyb3dzZXIgbm90aWZpY2F0aW9uc1xuICAgIHByaXZhdGUgYXN5bmMgaW5pdGlhbGl6ZUJyb3dzZXJOb3RpZmljYXRpb25zKClcbiAgICB7XG4gICAgICAgIGlmICh0aGlzLmJyb3dzZXJOb3RpZmljYXRpb25zRW5hYmxlZCAmJiAoXCJOb3RpZmljYXRpb25cIiBpbiB3aW5kb3cpKVxuICAgICAgICB7XG4gICAgICAgICAgICBpZiAoYXdhaXQgTm90aWZpY2F0aW9uLnJlcXVlc3RQZXJtaXNzaW9uKCkgPT09IFwiZ3JhbnRlZFwiKVxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIHRoaXMuYnJvd3Nlck5vdGlmaWNhdGlvbnNCb290c3RyYXBwZWQgPSB0cnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgLy8gSW5pdGlhbGl6ZXMgZGVmYXVsdCB0ZXh0XG4gICAgcHJpdmF0ZSBpbml0aWFsaXplRGVmYXVsdFRleHQoKSA6IHZvaWRcbiAgICB7XG4gICAgICAgIGlmICghdGhpcy5sb2NhbGl6YXRpb24pXG4gICAgICAgIHtcbiAgICAgICAgICAgIHRoaXMubG9jYWxpemF0aW9uID0ge1xuICAgICAgICAgICAgICAgIG1lc3NhZ2VQbGFjZWhvbGRlcjogdGhpcy5tZXNzYWdlUGxhY2Vob2xkZXIsXG4gICAgICAgICAgICAgICAgc2VhcmNoUGxhY2Vob2xkZXI6IHRoaXMuc2VhcmNoUGxhY2Vob2xkZXIsIFxuICAgICAgICAgICAgICAgIHRpdGxlOiB0aGlzLnRpdGxlLFxuICAgICAgICAgICAgICAgIHN0YXR1c0Rlc2NyaXB0aW9uOiB0aGlzLnN0YXR1c0Rlc2NyaXB0aW9uLFxuICAgICAgICAgICAgICAgIGJyb3dzZXJOb3RpZmljYXRpb25UaXRsZTogdGhpcy5icm93c2VyTm90aWZpY2F0aW9uVGl0bGUsXG4gICAgICAgICAgICAgICAgbG9hZE1lc3NhZ2VIaXN0b3J5UGxhY2Vob2xkZXI6IFwiTG9hZCBvbGRlciBtZXNzYWdlc1wiXG4gICAgICAgICAgICB9O1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBpbml0aWFsaXplVGhlbWUoKTogdm9pZFxuICAgIHtcbiAgICAgICAgaWYgKHRoaXMuY3VzdG9tVGhlbWUpXG4gICAgICAgIHtcbiAgICAgICAgICAgIHRoaXMudGhlbWUgPSBUaGVtZS5DdXN0b207XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAodGhpcy50aGVtZSAhPSBUaGVtZS5MaWdodCAmJiB0aGlzLnRoZW1lICE9IFRoZW1lLkRhcmspXG4gICAgICAgIHtcbiAgICAgICAgICAgIC8vIFRPRE86IFVzZSBlczIwMTcgaW4gZnV0dXJlIHdpdGggT2JqZWN0LnZhbHVlcyhUaGVtZSkuaW5jbHVkZXModGhpcy50aGVtZSkgdG8gZG8gdGhpcyBjaGVja1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBJbnZhbGlkIHRoZW1lIGNvbmZpZ3VyYXRpb24gZm9yIG5nLWNoYXQuIFwiJHt0aGlzLnRoZW1lfVwiIGlzIG5vdCBhIHZhbGlkIHRoZW1lIHZhbHVlLmApO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLy8gU2VuZHMgYSByZXF1ZXN0IHRvIGxvYWQgdGhlIGZyaWVuZHMgbGlzdFxuICAgIHB1YmxpYyBmZXRjaEZyaWVuZHNMaXN0KGlzQm9vdHN0cmFwcGluZzogYm9vbGVhbik6IHZvaWRcbiAgICB7XG4gICAgICAgIHRoaXMuYWRhcHRlci5saXN0RnJpZW5kcygpXG4gICAgICAgIC5waXBlKFxuICAgICAgICAgICAgbWFwKChwYXJ0aWNpcGFudHNSZXNwb25zZTogUGFydGljaXBhbnRSZXNwb25zZVtdKSA9PiB7XG4gICAgICAgICAgICAgICAgdGhpcy5wYXJ0aWNpcGFudHNSZXNwb25zZSA9IHBhcnRpY2lwYW50c1Jlc3BvbnNlO1xuXG4gICAgICAgICAgICAgICAgdGhpcy5wYXJ0aWNpcGFudHMgPSBwYXJ0aWNpcGFudHNSZXNwb25zZS5tYXAoKHJlc3BvbnNlOiBQYXJ0aWNpcGFudFJlc3BvbnNlKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiByZXNwb25zZS5wYXJ0aWNpcGFudDtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0pXG4gICAgICAgICkuc3Vic2NyaWJlKCgpID0+IHtcbiAgICAgICAgICAgIGlmIChpc0Jvb3RzdHJhcHBpbmcpXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgdGhpcy5yZXN0b3JlV2luZG93c1N0YXRlKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIGZldGNoTWVzc2FnZUhpc3Rvcnkod2luZG93OiBXaW5kb3cpIHtcbiAgICAgICAgLy8gTm90IGlkZWFsIGJ1dCB3aWxsIGtlZXAgdGhpcyB1bnRpbCB3ZSBkZWNpZGUgaWYgd2UgYXJlIHNoaXBwaW5nIHBhZ2luYXRpb24gd2l0aCB0aGUgZGVmYXVsdCBhZGFwdGVyXG4gICAgICAgIGlmICh0aGlzLmFkYXB0ZXIgaW5zdGFuY2VvZiBQYWdlZEhpc3RvcnlDaGF0QWRhcHRlcilcbiAgICAgICAge1xuICAgICAgICAgICAgd2luZG93LmlzTG9hZGluZ0hpc3RvcnkgPSB0cnVlO1xuXG4gICAgICAgICAgICB0aGlzLmFkYXB0ZXIuZ2V0TWVzc2FnZUhpc3RvcnlCeVBhZ2Uod2luZG93LnBhcnRpY2lwYW50LmlkLCB0aGlzLmhpc3RvcnlQYWdlU2l6ZSwgKyt3aW5kb3cuaGlzdG9yeVBhZ2UpXG4gICAgICAgICAgICAucGlwZShcbiAgICAgICAgICAgICAgICBtYXAoKHJlc3VsdDogTWVzc2FnZVtdKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIHJlc3VsdC5mb3JFYWNoKChtZXNzYWdlKSA9PiB0aGlzLmFzc2VydE1lc3NhZ2VUeXBlKG1lc3NhZ2UpKTtcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgIHdpbmRvdy5tZXNzYWdlcyA9IHJlc3VsdC5jb25jYXQod2luZG93Lm1lc3NhZ2VzKTtcbiAgICAgICAgICAgICAgICAgICAgd2luZG93LmlzTG9hZGluZ0hpc3RvcnkgPSBmYWxzZTtcbiAgICBcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgZGlyZWN0aW9uOiBTY3JvbGxEaXJlY3Rpb24gPSAod2luZG93Lmhpc3RvcnlQYWdlID09IDEpID8gU2Nyb2xsRGlyZWN0aW9uLkJvdHRvbSA6IFNjcm9sbERpcmVjdGlvbi5Ub3A7XG4gICAgICAgICAgICAgICAgICAgIHdpbmRvdy5oYXNNb3JlTWVzc2FnZXMgPSByZXN1bHQubGVuZ3RoID09IHRoaXMuaGlzdG9yeVBhZ2VTaXplO1xuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgc2V0VGltZW91dCgoKSA9PiB0aGlzLm9uRmV0Y2hNZXNzYWdlSGlzdG9yeUxvYWRlZChyZXN1bHQsIHdpbmRvdywgZGlyZWN0aW9uLCB0cnVlKSk7XG4gICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICkuc3Vic2NyaWJlKCk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZVxuICAgICAgICB7XG4gICAgICAgICAgICB0aGlzLmFkYXB0ZXIuZ2V0TWVzc2FnZUhpc3Rvcnkod2luZG93LnBhcnRpY2lwYW50LmlkKVxuICAgICAgICAgICAgLnBpcGUoXG4gICAgICAgICAgICAgICAgbWFwKChyZXN1bHQ6IE1lc3NhZ2VbXSkgPT4ge1xuICAgICAgICAgICAgICAgICAgICByZXN1bHQuZm9yRWFjaCgobWVzc2FnZSkgPT4gdGhpcy5hc3NlcnRNZXNzYWdlVHlwZShtZXNzYWdlKSk7XG4gICAgXG4gICAgICAgICAgICAgICAgICAgIHdpbmRvdy5tZXNzYWdlcyA9IHJlc3VsdC5jb25jYXQod2luZG93Lm1lc3NhZ2VzKTtcbiAgICAgICAgICAgICAgICAgICAgd2luZG93LmlzTG9hZGluZ0hpc3RvcnkgPSBmYWxzZTtcbiAgICBcbiAgICAgICAgICAgICAgICAgICAgc2V0VGltZW91dCgoKSA9PiB0aGlzLm9uRmV0Y2hNZXNzYWdlSGlzdG9yeUxvYWRlZChyZXN1bHQsIHdpbmRvdywgU2Nyb2xsRGlyZWN0aW9uLkJvdHRvbSkpO1xuICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICApLnN1YnNjcmliZSgpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBvbkZldGNoTWVzc2FnZUhpc3RvcnlMb2FkZWQobWVzc2FnZXM6IE1lc3NhZ2VbXSwgd2luZG93OiBXaW5kb3csIGRpcmVjdGlvbjogU2Nyb2xsRGlyZWN0aW9uLCBmb3JjZU1hcmtNZXNzYWdlc0FzU2VlbjogYm9vbGVhbiA9IGZhbHNlKTogdm9pZCBcbiAgICB7XG4gICAgICAgIHRoaXMuc2Nyb2xsQ2hhdFdpbmRvdyh3aW5kb3csIGRpcmVjdGlvbilcblxuICAgICAgICBpZiAod2luZG93Lmhhc0ZvY3VzIHx8IGZvcmNlTWFya01lc3NhZ2VzQXNTZWVuKVxuICAgICAgICB7XG4gICAgICAgICAgICBjb25zdCB1bnNlZW5NZXNzYWdlcyA9IG1lc3NhZ2VzLmZpbHRlcihtID0+ICFtLmRhdGVTZWVuKTtcblxuICAgICAgICAgICAgdGhpcy5tYXJrTWVzc2FnZXNBc1JlYWQodW5zZWVuTWVzc2FnZXMpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLy8gVXBkYXRlcyB0aGUgZnJpZW5kcyBsaXN0IHZpYSB0aGUgZXZlbnQgaGFuZGxlclxuICAgIHByaXZhdGUgb25GcmllbmRzTGlzdENoYW5nZWQocGFydGljaXBhbnRzUmVzcG9uc2U6IFBhcnRpY2lwYW50UmVzcG9uc2VbXSk6IHZvaWRcbiAgICB7XG4gICAgICAgIGlmIChwYXJ0aWNpcGFudHNSZXNwb25zZSkgXG4gICAgICAgIHtcbiAgICAgICAgICAgIHRoaXMucGFydGljaXBhbnRzUmVzcG9uc2UgPSBwYXJ0aWNpcGFudHNSZXNwb25zZTtcblxuICAgICAgICAgICAgdGhpcy5wYXJ0aWNpcGFudHMgPSBwYXJ0aWNpcGFudHNSZXNwb25zZS5tYXAoKHJlc3BvbnNlOiBQYXJ0aWNpcGFudFJlc3BvbnNlKSA9PiB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHJlc3BvbnNlLnBhcnRpY2lwYW50O1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIHRoaXMucGFydGljaXBhbnRzSW50ZXJhY3RlZFdpdGggPSBbXTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8vIEhhbmRsZXMgcmVjZWl2ZWQgbWVzc2FnZXMgYnkgdGhlIGFkYXB0ZXJcbiAgICBwcml2YXRlIG9uTWVzc2FnZVJlY2VpdmVkKHBhcnRpY2lwYW50OiBJQ2hhdFBhcnRpY2lwYW50LCBtZXNzYWdlOiBNZXNzYWdlKVxuICAgIHtcbiAgICAgICAgaWYgKHBhcnRpY2lwYW50ICYmIG1lc3NhZ2UpXG4gICAgICAgIHtcbiAgICAgICAgICAgIGNvbnN0IGNoYXRXaW5kb3cgPSB0aGlzLm9wZW5DaGF0V2luZG93KHBhcnRpY2lwYW50KTtcblxuICAgICAgICAgICAgdGhpcy5hc3NlcnRNZXNzYWdlVHlwZShtZXNzYWdlKTtcblxuICAgICAgICAgICAgaWYgKCFjaGF0V2luZG93WzFdIHx8ICF0aGlzLmhpc3RvcnlFbmFibGVkKXtcbiAgICAgICAgICAgICAgICBjaGF0V2luZG93WzBdLm1lc3NhZ2VzLnB1c2gobWVzc2FnZSk7XG5cbiAgICAgICAgICAgICAgICB0aGlzLnNjcm9sbENoYXRXaW5kb3coY2hhdFdpbmRvd1swXSwgU2Nyb2xsRGlyZWN0aW9uLkJvdHRvbSk7XG5cbiAgICAgICAgICAgICAgICBpZiAoY2hhdFdpbmRvd1swXS5oYXNGb2N1cylcbiAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMubWFya01lc3NhZ2VzQXNSZWFkKFttZXNzYWdlXSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB0aGlzLmVtaXRNZXNzYWdlU291bmQoY2hhdFdpbmRvd1swXSk7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIC8vIEdpdGh1YiBpc3N1ZSAjNTggXG4gICAgICAgICAgICAvLyBEbyBub3QgcHVzaCBicm93c2VyIG5vdGlmaWNhdGlvbnMgd2l0aCBtZXNzYWdlIGNvbnRlbnQgZm9yIHByaXZhY3kgcHVycG9zZXMgaWYgdGhlICdtYXhpbWl6ZVdpbmRvd09uTmV3TWVzc2FnZScgc2V0dGluZyBpcyBvZmYgYW5kIHRoaXMgaXMgYSBuZXcgY2hhdCB3aW5kb3cuXG4gICAgICAgICAgICBpZiAodGhpcy5tYXhpbWl6ZVdpbmRvd09uTmV3TWVzc2FnZSB8fCAoIWNoYXRXaW5kb3dbMV0gJiYgIWNoYXRXaW5kb3dbMF0uaXNDb2xsYXBzZWQpKVxuICAgICAgICAgICAgeyBcbiAgICAgICAgICAgICAgICAvLyBTb21lIG1lc3NhZ2VzIGFyZSBub3QgcHVzaGVkIGJlY2F1c2UgdGhleSBhcmUgbG9hZGVkIGJ5IGZldGNoaW5nIHRoZSBoaXN0b3J5IGhlbmNlIHdoeSB3ZSBzdXBwbHkgdGhlIG1lc3NhZ2UgaGVyZVxuICAgICAgICAgICAgICAgIHRoaXMuZW1pdEJyb3dzZXJOb3RpZmljYXRpb24oY2hhdFdpbmRvd1swXSwgbWVzc2FnZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBvblBhcnRpY2lwYW50Q2xpY2tlZEZyb21GcmllbmRzTGlzdChwYXJ0aWNpcGFudDogSUNoYXRQYXJ0aWNpcGFudCk6IHZvaWQge1xuICAgICAgICB0aGlzLm9wZW5DaGF0V2luZG93KHBhcnRpY2lwYW50LCB0cnVlLCB0cnVlKTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGNhbmNlbE9wdGlvblByb21wdCgpOiB2b2lkIHtcbiAgICAgICAgaWYgKHRoaXMuY3VycmVudEFjdGl2ZU9wdGlvbilcbiAgICAgICAge1xuICAgICAgICAgICAgdGhpcy5jdXJyZW50QWN0aXZlT3B0aW9uLmlzQWN0aXZlID0gZmFsc2U7XG4gICAgICAgICAgICB0aGlzLmN1cnJlbnRBY3RpdmVPcHRpb24gPSBudWxsO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgb25PcHRpb25Qcm9tcHRDYW5jZWxlZCgpOiB2b2lkIHtcbiAgICAgICAgdGhpcy5jYW5jZWxPcHRpb25Qcm9tcHQoKTtcbiAgICB9XG5cbiAgICBvbk9wdGlvblByb21wdENvbmZpcm1lZChldmVudDogYW55KTogdm9pZCB7XG4gICAgICAgIC8vIEZvciBub3cgdGhpcyBpcyBmaW5lIGFzIHRoZXJlIGlzIG9ubHkgb25lIG9wdGlvbiBhdmFpbGFibGUuIEludHJvZHVjZSBvcHRpb24gdHlwZXMgYW5kIHR5cGUgY2hlY2tpbmcgaWYgYSBuZXcgb3B0aW9uIGlzIGFkZGVkLlxuICAgICAgICB0aGlzLmNvbmZpcm1OZXdHcm91cChldmVudCk7XG5cbiAgICAgICAgLy8gQ2FuY2VsaW5nIGN1cnJlbnQgc3RhdGVcbiAgICAgICAgdGhpcy5jYW5jZWxPcHRpb25Qcm9tcHQoKTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGNvbmZpcm1OZXdHcm91cCh1c2VyczogVXNlcltdKTogdm9pZCB7XG4gICAgICAgIGNvbnN0IG5ld0dyb3VwID0gbmV3IEdyb3VwKHVzZXJzKTtcblxuICAgICAgICB0aGlzLm9wZW5DaGF0V2luZG93KG5ld0dyb3VwKTtcblxuICAgICAgICBpZiAodGhpcy5ncm91cEFkYXB0ZXIpXG4gICAgICAgIHtcbiAgICAgICAgICAgIHRoaXMuZ3JvdXBBZGFwdGVyLmdyb3VwQ3JlYXRlZChuZXdHcm91cCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBPcGVucyBhIG5ldyBjaGF0IHdoaW5kb3cuIFRha2VzIGNhcmUgb2YgYXZhaWxhYmxlIHZpZXdwb3J0XG4gICAgLy8gV29ya3MgZm9yIG9wZW5pbmcgYSBjaGF0IHdpbmRvdyBmb3IgYW4gdXNlciBvciBmb3IgYSBncm91cFxuICAgIC8vIFJldHVybnMgPT4gW1dpbmRvdzogV2luZG93IG9iamVjdCByZWZlcmVuY2UsIGJvb2xlYW46IEluZGljYXRlcyBpZiB0aGlzIHdpbmRvdyBpcyBhIG5ldyBjaGF0IHdpbmRvd11cbiAgICBwcml2YXRlIG9wZW5DaGF0V2luZG93KHBhcnRpY2lwYW50OiBJQ2hhdFBhcnRpY2lwYW50LCBmb2N1c09uTmV3V2luZG93OiBib29sZWFuID0gZmFsc2UsIGludm9rZWRCeVVzZXJDbGljazogYm9vbGVhbiA9IGZhbHNlKTogW1dpbmRvdywgYm9vbGVhbl1cbiAgICB7XG4gICAgICAgIC8vIElzIHRoaXMgd2luZG93IG9wZW5lZD9cbiAgICAgICAgY29uc3Qgb3BlbmVkV2luZG93ID0gdGhpcy53aW5kb3dzLmZpbmQoeCA9PiB4LnBhcnRpY2lwYW50LmlkID09IHBhcnRpY2lwYW50LmlkKTtcblxuICAgICAgICBpZiAoIW9wZW5lZFdpbmRvdylcbiAgICAgICAge1xuICAgICAgICAgICAgaWYgKGludm9rZWRCeVVzZXJDbGljaykgXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgdGhpcy5vblBhcnRpY2lwYW50Q2xpY2tlZC5lbWl0KHBhcnRpY2lwYW50KTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gUmVmZXIgdG8gaXNzdWUgIzU4IG9uIEdpdGh1YiBcbiAgICAgICAgICAgIGNvbnN0IGNvbGxhcHNlV2luZG93ID0gaW52b2tlZEJ5VXNlckNsaWNrID8gZmFsc2UgOiAhdGhpcy5tYXhpbWl6ZVdpbmRvd09uTmV3TWVzc2FnZTtcblxuICAgICAgICAgICAgY29uc3QgbmV3Q2hhdFdpbmRvdzogV2luZG93ID0gbmV3IFdpbmRvdyhwYXJ0aWNpcGFudCwgdGhpcy5oaXN0b3J5RW5hYmxlZCwgY29sbGFwc2VXaW5kb3cpO1xuXG4gICAgICAgICAgICAvLyBMb2FkcyB0aGUgY2hhdCBoaXN0b3J5IHZpYSBhbiBSeEpzIE9ic2VydmFibGVcbiAgICAgICAgICAgIGlmICh0aGlzLmhpc3RvcnlFbmFibGVkKVxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIHRoaXMuZmV0Y2hNZXNzYWdlSGlzdG9yeShuZXdDaGF0V2luZG93KTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdGhpcy53aW5kb3dzLnVuc2hpZnQobmV3Q2hhdFdpbmRvdyk7XG5cbiAgICAgICAgICAgIC8vIElzIHRoZXJlIGVub3VnaCBzcGFjZSBsZWZ0IGluIHRoZSB2aWV3IHBvcnQgPyBidXQgc2hvdWxkIGJlIGRpc3BsYXllZCBpbiBtb2JpbGUgaWYgb3B0aW9uIGlzIGVuYWJsZWRcbiAgICAgICAgICAgIGlmICghdGhpcy5pc1ZpZXdwb3J0T25Nb2JpbGVFbmFibGVkKSB7XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMud2luZG93cy5sZW5ndGggKiB0aGlzLndpbmRvd1NpemVGYWN0b3IgPj0gdGhpcy52aWV3UG9ydFRvdGFsQXJlYSAtICghdGhpcy5oaWRlRnJpZW5kc0xpc3QgPyB0aGlzLmZyaWVuZHNMaXN0V2lkdGggOiAwKSkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLndpbmRvd3MucG9wKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB0aGlzLnVwZGF0ZVdpbmRvd3NTdGF0ZSh0aGlzLndpbmRvd3MpO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICBpZiAoZm9jdXNPbk5ld1dpbmRvdyAmJiAhY29sbGFwc2VXaW5kb3cpIFxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIHRoaXMuZm9jdXNPbldpbmRvdyhuZXdDaGF0V2luZG93KTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdGhpcy5wYXJ0aWNpcGFudHNJbnRlcmFjdGVkV2l0aC5wdXNoKHBhcnRpY2lwYW50KTtcbiAgICAgICAgICAgIHRoaXMub25QYXJ0aWNpcGFudENoYXRPcGVuZWQuZW1pdChwYXJ0aWNpcGFudCk7XG5cbiAgICAgICAgICAgIHJldHVybiBbbmV3Q2hhdFdpbmRvdywgdHJ1ZV07XG4gICAgICAgIH1cbiAgICAgICAgZWxzZVxuICAgICAgICB7XG4gICAgICAgICAgICAvLyBSZXR1cm5zIHRoZSBleGlzdGluZyBjaGF0IHdpbmRvdyAgICAgXG4gICAgICAgICAgICByZXR1cm4gW29wZW5lZFdpbmRvdywgZmFsc2VdOyAgICAgICBcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8vIEZvY3VzIG9uIHRoZSBpbnB1dCBlbGVtZW50IG9mIHRoZSBzdXBwbGllZCB3aW5kb3dcbiAgICBwcml2YXRlIGZvY3VzT25XaW5kb3cod2luZG93OiBXaW5kb3csIGNhbGxiYWNrOiBGdW5jdGlvbiA9ICgpID0+IHt9KSA6IHZvaWRcbiAgICB7XG4gICAgICAgIGNvbnN0IHdpbmRvd0luZGV4ID0gdGhpcy53aW5kb3dzLmluZGV4T2Yod2luZG93KTtcbiAgICAgICAgaWYgKHdpbmRvd0luZGV4ID49IDApXG4gICAgICAgIHtcbiAgICAgICAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLmNoYXRXaW5kb3dzKVxuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgY2hhdFdpbmRvd1RvRm9jdXMgPSB0aGlzLmNoYXRXaW5kb3dzLnRvQXJyYXkoKVt3aW5kb3dJbmRleF07XG5cbiAgICAgICAgICAgICAgICAgICAgY2hhdFdpbmRvd1RvRm9jdXMuY2hhdFdpbmRvd0lucHV0Lm5hdGl2ZUVsZW1lbnQuZm9jdXMoKTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBjYWxsYmFjaygpOyBcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9IFxuICAgIH1cblxuICAgIHByaXZhdGUgYXNzZXJ0TWVzc2FnZVR5cGUobWVzc2FnZTogTWVzc2FnZSk6IHZvaWQge1xuICAgICAgICAvLyBBbHdheXMgZmFsbGJhY2sgdG8gXCJUZXh0XCIgbWVzc2FnZXMgdG8gYXZvaWQgcmVuZGVucmluZyBpc3N1ZXNcbiAgICAgICAgaWYgKCFtZXNzYWdlLnR5cGUpXG4gICAgICAgIHtcbiAgICAgICAgICAgIG1lc3NhZ2UudHlwZSA9IE1lc3NhZ2VUeXBlLlRleHQ7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBNYXJrcyBhbGwgbWVzc2FnZXMgcHJvdmlkZWQgYXMgcmVhZCB3aXRoIHRoZSBjdXJyZW50IHRpbWUuXG4gICAgbWFya01lc3NhZ2VzQXNSZWFkKG1lc3NhZ2VzOiBNZXNzYWdlW10pOiB2b2lkXG4gICAge1xuICAgICAgICBjb25zdCBjdXJyZW50RGF0ZSA9IG5ldyBEYXRlKCk7XG5cbiAgICAgICAgbWVzc2FnZXMuZm9yRWFjaCgobXNnKT0+e1xuICAgICAgICAgICAgbXNnLmRhdGVTZWVuID0gY3VycmVudERhdGU7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHRoaXMub25NZXNzYWdlc1NlZW4uZW1pdChtZXNzYWdlcyk7XG4gICAgfVxuXG4gICAgLy8gQnVmZmVycyBhdWRpbyBmaWxlIChGb3IgY29tcG9uZW50J3MgYm9vdHN0cmFwcGluZylcbiAgICBwcml2YXRlIGJ1ZmZlckF1ZGlvRmlsZSgpOiB2b2lkIHtcbiAgICAgICAgaWYgKHRoaXMuYXVkaW9Tb3VyY2UgJiYgdGhpcy5hdWRpb1NvdXJjZS5sZW5ndGggPiAwKVxuICAgICAgICB7XG4gICAgICAgICAgICB0aGlzLmF1ZGlvRmlsZSA9IG5ldyBBdWRpbygpO1xuICAgICAgICAgICAgdGhpcy5hdWRpb0ZpbGUuc3JjID0gdGhpcy5hdWRpb1NvdXJjZTtcbiAgICAgICAgICAgIHRoaXMuYXVkaW9GaWxlLmxvYWQoKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8vIEVtaXRzIGEgbWVzc2FnZSBub3RpZmljYXRpb24gYXVkaW8gaWYgZW5hYmxlZCBhZnRlciBldmVyeSBtZXNzYWdlIHJlY2VpdmVkXG4gICAgcHJpdmF0ZSBlbWl0TWVzc2FnZVNvdW5kKHdpbmRvdzogV2luZG93KTogdm9pZFxuICAgIHtcbiAgICAgICAgaWYgKHRoaXMuYXVkaW9FbmFibGVkICYmICF3aW5kb3cuaGFzRm9jdXMgJiYgdGhpcy5hdWRpb0ZpbGUpIHtcbiAgICAgICAgICAgIHRoaXMuYXVkaW9GaWxlLnBsYXkoKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8vIEVtaXRzIGEgYnJvd3NlciBub3RpZmljYXRpb25cbiAgICBwcml2YXRlIGVtaXRCcm93c2VyTm90aWZpY2F0aW9uKHdpbmRvdzogV2luZG93LCBtZXNzYWdlOiBNZXNzYWdlKTogdm9pZFxuICAgIHsgICAgICAgXG4gICAgICAgIGlmICh0aGlzLmJyb3dzZXJOb3RpZmljYXRpb25zQm9vdHN0cmFwcGVkICYmICF3aW5kb3cuaGFzRm9jdXMgJiYgbWVzc2FnZSkge1xuICAgICAgICAgICAgY29uc3Qgbm90aWZpY2F0aW9uID0gbmV3IE5vdGlmaWNhdGlvbihgJHt0aGlzLmxvY2FsaXphdGlvbi5icm93c2VyTm90aWZpY2F0aW9uVGl0bGV9ICR7d2luZG93LnBhcnRpY2lwYW50LmRpc3BsYXlOYW1lfWAsIHtcbiAgICAgICAgICAgICAgICAnYm9keSc6IG1lc3NhZ2UubWVzc2FnZSxcbiAgICAgICAgICAgICAgICAnaWNvbic6IHRoaXMuYnJvd3Nlck5vdGlmaWNhdGlvbkljb25Tb3VyY2VcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgICAgICAgICBub3RpZmljYXRpb24uY2xvc2UoKTtcbiAgICAgICAgICAgIH0sIG1lc3NhZ2UubWVzc2FnZS5sZW5ndGggPD0gNTAgPyA1MDAwIDogNzAwMCk7IC8vIE1vcmUgdGltZSB0byByZWFkIGxvbmdlciBtZXNzYWdlc1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLy8gU2F2ZXMgY3VycmVudCB3aW5kb3dzIHN0YXRlIGludG8gbG9jYWwgc3RvcmFnZSBpZiBwZXJzaXN0ZW5jZSBpcyBlbmFibGVkXG4gICAgcHJpdmF0ZSB1cGRhdGVXaW5kb3dzU3RhdGUod2luZG93czogV2luZG93W10pOiB2b2lkXG4gICAge1xuICAgICAgICBpZiAodGhpcy5wZXJzaXN0V2luZG93c1N0YXRlKVxuICAgICAgICB7XG4gICAgICAgICAgICBjb25zdCBwYXJ0aWNpcGFudElkcyA9IHdpbmRvd3MubWFwKCh3KSA9PiB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHcucGFydGljaXBhbnQuaWQ7XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgbG9jYWxTdG9yYWdlLnNldEl0ZW0odGhpcy5sb2NhbFN0b3JhZ2VLZXksIEpTT04uc3RyaW5naWZ5KHBhcnRpY2lwYW50SWRzKSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwcml2YXRlIHJlc3RvcmVXaW5kb3dzU3RhdGUoKTogdm9pZFxuICAgIHtcbiAgICAgICAgdHJ5XG4gICAgICAgIHtcbiAgICAgICAgICAgIGlmICh0aGlzLnBlcnNpc3RXaW5kb3dzU3RhdGUpXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgY29uc3Qgc3RyaW5nZmllZFBhcnRpY2lwYW50SWRzID0gbG9jYWxTdG9yYWdlLmdldEl0ZW0odGhpcy5sb2NhbFN0b3JhZ2VLZXkpO1xuXG4gICAgICAgICAgICAgICAgaWYgKHN0cmluZ2ZpZWRQYXJ0aWNpcGFudElkcyAmJiBzdHJpbmdmaWVkUGFydGljaXBhbnRJZHMubGVuZ3RoID4gMClcbiAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHBhcnRpY2lwYW50SWRzID0gPG51bWJlcltdPkpTT04ucGFyc2Uoc3RyaW5nZmllZFBhcnRpY2lwYW50SWRzKTtcblxuICAgICAgICAgICAgICAgICAgICBjb25zdCBwYXJ0aWNpcGFudHNUb1Jlc3RvcmUgPSB0aGlzLnBhcnRpY2lwYW50cy5maWx0ZXIodSA9PiBwYXJ0aWNpcGFudElkcy5pbmRleE9mKHUuaWQpID49IDApO1xuXG4gICAgICAgICAgICAgICAgICAgIHBhcnRpY2lwYW50c1RvUmVzdG9yZS5mb3JFYWNoKChwYXJ0aWNpcGFudCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5vcGVuQ2hhdFdpbmRvdyhwYXJ0aWNpcGFudCk7XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBjYXRjaCAoZXgpXG4gICAgICAgIHtcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoYEFuIGVycm9yIG9jY3VycmVkIHdoaWxlIHJlc3RvcmluZyBuZy1jaGF0IHdpbmRvd3Mgc3RhdGUuIERldGFpbHM6ICR7ZXh9YCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBHZXRzIGNsb3Nlc3Qgb3BlbiB3aW5kb3cgaWYgYW55LiBNb3N0IHJlY2VudCBvcGVuZWQgaGFzIHByaW9yaXR5IChSaWdodClcbiAgICBwcml2YXRlIGdldENsb3Nlc3RXaW5kb3cod2luZG93OiBXaW5kb3cpOiBXaW5kb3cgfCB1bmRlZmluZWRcbiAgICB7ICAgXG4gICAgICAgIGNvbnN0IGluZGV4ID0gdGhpcy53aW5kb3dzLmluZGV4T2Yod2luZG93KTtcblxuICAgICAgICBpZiAoaW5kZXggPiAwKVxuICAgICAgICB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy53aW5kb3dzW2luZGV4IC0gMV07XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAoaW5kZXggPT0gMCAmJiB0aGlzLndpbmRvd3MubGVuZ3RoID4gMSlcbiAgICAgICAgeyAgIFxuICAgICAgICAgICAgcmV0dXJuIHRoaXMud2luZG93c1tpbmRleCArIDFdO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBjbG9zZVdpbmRvdyh3aW5kb3c6IFdpbmRvdyk6IHZvaWQgXG4gICAge1xuICAgICAgICBjb25zdCBpbmRleCA9IHRoaXMud2luZG93cy5pbmRleE9mKHdpbmRvdyk7XG5cbiAgICAgICAgdGhpcy53aW5kb3dzLnNwbGljZShpbmRleCwgMSk7XG5cbiAgICAgICAgdGhpcy51cGRhdGVXaW5kb3dzU3RhdGUodGhpcy53aW5kb3dzKTtcblxuICAgICAgICB0aGlzLm9uUGFydGljaXBhbnRDaGF0Q2xvc2VkLmVtaXQod2luZG93LnBhcnRpY2lwYW50KTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGdldENoYXRXaW5kb3dDb21wb25lbnRJbnN0YW5jZSh0YXJnZXRXaW5kb3c6IFdpbmRvdyk6IE5nQ2hhdFdpbmRvd0NvbXBvbmVudCB8IG51bGwge1xuICAgICAgICBjb25zdCB3aW5kb3dJbmRleCA9IHRoaXMud2luZG93cy5pbmRleE9mKHRhcmdldFdpbmRvdyk7XG5cbiAgICAgICAgaWYgKHRoaXMuY2hhdFdpbmRvd3Mpe1xuICAgICAgICAgICAgbGV0IHRhcmdldFdpbmRvdyA9IHRoaXMuY2hhdFdpbmRvd3MudG9BcnJheSgpW3dpbmRvd0luZGV4XTtcblxuICAgICAgICAgICAgcmV0dXJuIHRhcmdldFdpbmRvdztcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBudWxsO1xuICAgIH1cblxuICAgIC8vIFNjcm9sbHMgYSBjaGF0IHdpbmRvdyBtZXNzYWdlIGZsb3cgdG8gdGhlIGJvdHRvbVxuICAgIHByaXZhdGUgc2Nyb2xsQ2hhdFdpbmRvdyh3aW5kb3c6IFdpbmRvdywgZGlyZWN0aW9uOiBTY3JvbGxEaXJlY3Rpb24pOiB2b2lkXG4gICAge1xuICAgICAgICBjb25zdCBjaGF0V2luZG93ID0gdGhpcy5nZXRDaGF0V2luZG93Q29tcG9uZW50SW5zdGFuY2Uod2luZG93KTtcblxuICAgICAgICBpZiAoY2hhdFdpbmRvdyl7XG4gICAgICAgICAgICBjaGF0V2luZG93LnNjcm9sbENoYXRXaW5kb3cod2luZG93LCBkaXJlY3Rpb24pO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgb25XaW5kb3dNZXNzYWdlc1NlZW4obWVzc2FnZXNTZWVuOiBNZXNzYWdlW10pOiB2b2lkIHtcbiAgICAgICAgdGhpcy5tYXJrTWVzc2FnZXNBc1JlYWQobWVzc2FnZXNTZWVuKTtcbiAgICB9XG5cbiAgICBvbldpbmRvd0NoYXRDbG9zZWQocGF5bG9hZDogeyBjbG9zZWRXaW5kb3c6IFdpbmRvdywgY2xvc2VkVmlhRXNjYXBlS2V5OiBib29sZWFuIH0pOiB2b2lkIHtcbiAgICAgICAgY29uc3QgeyBjbG9zZWRXaW5kb3csIGNsb3NlZFZpYUVzY2FwZUtleSB9ID0gcGF5bG9hZDtcblxuICAgICAgICBpZiAoY2xvc2VkVmlhRXNjYXBlS2V5KSB7XG4gICAgICAgICAgICBsZXQgY2xvc2VzdFdpbmRvdyA9IHRoaXMuZ2V0Q2xvc2VzdFdpbmRvdyhjbG9zZWRXaW5kb3cpO1xuXG4gICAgICAgICAgICBpZiAoY2xvc2VzdFdpbmRvdylcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICB0aGlzLmZvY3VzT25XaW5kb3coY2xvc2VzdFdpbmRvdywgKCkgPT4geyB0aGlzLmNsb3NlV2luZG93KGNsb3NlZFdpbmRvdyk7IH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIHRoaXMuY2xvc2VXaW5kb3coY2xvc2VkV2luZG93KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBlbHNlIHsgXG4gICAgICAgICAgICB0aGlzLmNsb3NlV2luZG93KGNsb3NlZFdpbmRvdyk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBvbldpbmRvd1RhYlRyaWdnZXJlZChwYXlsb2FkOiB7IHRyaWdnZXJpbmdXaW5kb3c6IFdpbmRvdywgc2hpZnRLZXlQcmVzc2VkOiBib29sZWFuIH0pOiB2b2lkIHtcbiAgICAgICAgY29uc3QgeyB0cmlnZ2VyaW5nV2luZG93LCBzaGlmdEtleVByZXNzZWQgfSA9IHBheWxvYWQ7XG5cbiAgICAgICAgY29uc3QgY3VycmVudFdpbmRvd0luZGV4ID0gdGhpcy53aW5kb3dzLmluZGV4T2YodHJpZ2dlcmluZ1dpbmRvdyk7XG4gICAgICAgIGxldCB3aW5kb3dUb0ZvY3VzID0gdGhpcy53aW5kb3dzW2N1cnJlbnRXaW5kb3dJbmRleCArIChzaGlmdEtleVByZXNzZWQgPyAxIDogLTEpXTsgLy8gR29lcyBiYWNrIG9uIHNoaWZ0ICsgdGFiXG5cbiAgICAgICAgaWYgKCF3aW5kb3dUb0ZvY3VzKVxuICAgICAgICB7XG4gICAgICAgICAgICAvLyBFZGdlIHdpbmRvd3MsIGdvIHRvIHN0YXJ0IG9yIGVuZFxuICAgICAgICAgICAgd2luZG93VG9Gb2N1cyA9IHRoaXMud2luZG93c1tjdXJyZW50V2luZG93SW5kZXggPiAwID8gMCA6IHRoaXMuY2hhdFdpbmRvd3MubGVuZ3RoIC0gMV07IFxuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5mb2N1c09uV2luZG93KHdpbmRvd1RvRm9jdXMpO1xuICAgIH1cblxuICAgIG9uV2luZG93TWVzc2FnZVNlbnQobWVzc2FnZVNlbnQ6IE1lc3NhZ2UpOiB2b2lkIHtcbiAgICAgICAgdGhpcy5hZGFwdGVyLnNlbmRNZXNzYWdlKG1lc3NhZ2VTZW50KTtcbiAgICB9XG4gICAgXG4gICAgb25XaW5kb3dPcHRpb25UcmlnZ2VyZWQob3B0aW9uOiBJQ2hhdE9wdGlvbik6IHZvaWQge1xuICAgICAgICB0aGlzLmN1cnJlbnRBY3RpdmVPcHRpb24gPSBvcHRpb247XG4gICAgfVxuXG4gICAgdHJpZ2dlck9wZW5DaGF0V2luZG93KHVzZXI6IFVzZXIpOiB2b2lkIHtcbiAgICAgICAgaWYgKHVzZXIpXG4gICAgICAgIHtcbiAgICAgICAgICAgIHRoaXMub3BlbkNoYXRXaW5kb3codXNlcik7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICB0cmlnZ2VyQ2xvc2VDaGF0V2luZG93KHVzZXJJZDogYW55KTogdm9pZCB7XG4gICAgICAgIGNvbnN0IG9wZW5lZFdpbmRvdyA9IHRoaXMud2luZG93cy5maW5kKHggPT4geC5wYXJ0aWNpcGFudC5pZCA9PSB1c2VySWQpO1xuXG4gICAgICAgIGlmIChvcGVuZWRXaW5kb3cpIFxuICAgICAgICB7XG4gICAgICAgICAgICB0aGlzLmNsb3NlV2luZG93KG9wZW5lZFdpbmRvdyk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICB0cmlnZ2VyVG9nZ2xlQ2hhdFdpbmRvd1Zpc2liaWxpdHkodXNlcklkOiBhbnkpOiB2b2lkIHtcbiAgICAgICAgY29uc3Qgb3BlbmVkV2luZG93ID0gdGhpcy53aW5kb3dzLmZpbmQoeCA9PiB4LnBhcnRpY2lwYW50LmlkID09IHVzZXJJZCk7XG5cbiAgICAgICAgaWYgKG9wZW5lZFdpbmRvdykgXG4gICAgICAgIHtcbiAgICAgICAgICAgIGNvbnN0IGNoYXRXaW5kb3cgPSB0aGlzLmdldENoYXRXaW5kb3dDb21wb25lbnRJbnN0YW5jZShvcGVuZWRXaW5kb3cpO1xuXG4gICAgICAgICAgICBpZiAoY2hhdFdpbmRvdyl7XG4gICAgICAgICAgICAgICAgY2hhdFdpbmRvdy5vbkNoYXRXaW5kb3dDbGlja2VkKG9wZW5lZFdpbmRvdyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG59Il19