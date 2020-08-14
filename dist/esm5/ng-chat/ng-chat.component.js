import { __awaiter, __decorate, __generator } from "tslib";
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
var NgChat = /** @class */ (function () {
    function NgChat(_httpClient) {
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
    Object.defineProperty(NgChat.prototype, "isDisabled", {
        get: function () {
            return this._isDisabled;
        },
        set: function (value) {
            this._isDisabled = value;
            if (value) {
                // To address issue https://github.com/rpaschoal/ng-chat/issues/120
                window.clearInterval(this.pollingIntervalWindowInstance);
            }
            else {
                this.activateFriendListFetch();
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(NgChat.prototype, "localStorageKey", {
        get: function () {
            return "ng-chat-users-" + this.userId; // Appending the user id so the state is unique per user in a computer.   
        },
        enumerable: true,
        configurable: true
    });
    ;
    NgChat.prototype.ngOnInit = function () {
        this.bootstrapChat();
    };
    NgChat.prototype.onResize = function (event) {
        this.viewPortTotalArea = event.target.innerWidth;
        this.NormalizeWindows();
    };
    // Checks if there are more opened windows than the view port can display
    NgChat.prototype.NormalizeWindows = function () {
        var maxSupportedOpenedWindows = Math.floor((this.viewPortTotalArea - (!this.hideFriendsList ? this.friendsListWidth : 0)) / this.windowSizeFactor);
        var difference = this.windows.length - maxSupportedOpenedWindows;
        if (difference >= 0) {
            this.windows.splice(this.windows.length - difference);
        }
        this.updateWindowsState(this.windows);
        // Viewport should have space for at least one chat window but should show in mobile if option is enabled.
        this.unsupportedViewport = this.isViewportOnMobileEnabled ? false : this.hideFriendsListOnUnsupportedViewport && maxSupportedOpenedWindows < 1;
    };
    // Initializes the chat plugin and the messaging adapter
    NgChat.prototype.bootstrapChat = function () {
        var _this = this;
        var initializationException = null;
        if (this.adapter != null && this.userId != null) {
            try {
                this.viewPortTotalArea = window.innerWidth;
                this.initializeTheme();
                this.initializeDefaultText();
                this.initializeBrowserNotifications();
                // Binding event listeners
                this.adapter.messageReceivedHandler = function (participant, msg) { return _this.onMessageReceived(participant, msg); };
                this.adapter.friendsListChangedHandler = function (participantsResponse) { return _this.onFriendsListChanged(participantsResponse); };
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
                console.error("An exception has occurred while initializing ng-chat. Details: " + initializationException.message);
                console.error(initializationException);
            }
        }
    };
    NgChat.prototype.activateFriendListFetch = function () {
        var _this = this;
        if (this.adapter) {
            // Loading current users list
            if (this.pollFriendsList) {
                // Setting a long poll interval to update the friends list
                this.fetchFriendsList(true);
                this.pollingIntervalWindowInstance = window.setInterval(function () { return _this.fetchFriendsList(false); }, this.pollingInterval);
            }
            else {
                // Since polling was disabled, a friends list update mechanism will have to be implemented in the ChatAdapter.
                this.fetchFriendsList(true);
            }
        }
    };
    // Initializes browser notifications
    NgChat.prototype.initializeBrowserNotifications = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!(this.browserNotificationsEnabled && ("Notification" in window))) return [3 /*break*/, 2];
                        return [4 /*yield*/, Notification.requestPermission()];
                    case 1:
                        if ((_a.sent()) === "granted") {
                            this.browserNotificationsBootstrapped = true;
                        }
                        _a.label = 2;
                    case 2: return [2 /*return*/];
                }
            });
        });
    };
    // Initializes default text
    NgChat.prototype.initializeDefaultText = function () {
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
    };
    NgChat.prototype.initializeTheme = function () {
        if (this.customTheme) {
            this.theme = Theme.Custom;
        }
        else if (this.theme != Theme.Light && this.theme != Theme.Dark) {
            // TODO: Use es2017 in future with Object.values(Theme).includes(this.theme) to do this check
            throw new Error("Invalid theme configuration for ng-chat. \"" + this.theme + "\" is not a valid theme value.");
        }
    };
    // Sends a request to load the friends list
    NgChat.prototype.fetchFriendsList = function (isBootstrapping) {
        var _this = this;
        this.adapter.listFriends()
            .pipe(map(function (participantsResponse) {
            _this.participantsResponse = participantsResponse;
            _this.participants = participantsResponse.map(function (response) {
                return response.participant;
            });
        })).subscribe(function () {
            if (isBootstrapping) {
                _this.restoreWindowsState();
            }
        });
    };
    NgChat.prototype.fetchMessageHistory = function (window) {
        var _this = this;
        // Not ideal but will keep this until we decide if we are shipping pagination with the default adapter
        if (this.adapter instanceof PagedHistoryChatAdapter) {
            window.isLoadingHistory = true;
            this.adapter.getMessageHistoryByPage(window.participant.id, this.historyPageSize, ++window.historyPage)
                .pipe(map(function (result) {
                result.forEach(function (message) { return _this.assertMessageType(message); });
                window.messages = result.concat(window.messages);
                window.isLoadingHistory = false;
                var direction = (window.historyPage == 1) ? ScrollDirection.Bottom : ScrollDirection.Top;
                window.hasMoreMessages = result.length == _this.historyPageSize;
                setTimeout(function () { return _this.onFetchMessageHistoryLoaded(result, window, direction, true); });
            })).subscribe();
        }
        else {
            this.adapter.getMessageHistory(window.participant.id)
                .pipe(map(function (result) {
                result.forEach(function (message) { return _this.assertMessageType(message); });
                window.messages = result.concat(window.messages);
                window.isLoadingHistory = false;
                setTimeout(function () { return _this.onFetchMessageHistoryLoaded(result, window, ScrollDirection.Bottom); });
            })).subscribe();
        }
    };
    NgChat.prototype.onFetchMessageHistoryLoaded = function (messages, window, direction, forceMarkMessagesAsSeen) {
        if (forceMarkMessagesAsSeen === void 0) { forceMarkMessagesAsSeen = false; }
        this.scrollChatWindow(window, direction);
        if (window.hasFocus || forceMarkMessagesAsSeen) {
            var unseenMessages = messages.filter(function (m) { return !m.dateSeen; });
            this.markMessagesAsRead(unseenMessages);
        }
    };
    // Updates the friends list via the event handler
    NgChat.prototype.onFriendsListChanged = function (participantsResponse) {
        if (participantsResponse) {
            this.participantsResponse = participantsResponse;
            this.participants = participantsResponse.map(function (response) {
                return response.participant;
            });
            this.participantsInteractedWith = [];
        }
    };
    // Handles received messages by the adapter
    NgChat.prototype.onMessageReceived = function (participant, message) {
        if (participant && message) {
            var chatWindow = this.openChatWindow(participant);
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
    };
    NgChat.prototype.onParticipantClickedFromFriendsList = function (participant) {
        this.openChatWindow(participant, true, true);
    };
    NgChat.prototype.cancelOptionPrompt = function () {
        if (this.currentActiveOption) {
            this.currentActiveOption.isActive = false;
            this.currentActiveOption = null;
        }
    };
    NgChat.prototype.onOptionPromptCanceled = function () {
        this.cancelOptionPrompt();
    };
    NgChat.prototype.onOptionPromptConfirmed = function (event) {
        // For now this is fine as there is only one option available. Introduce option types and type checking if a new option is added.
        this.confirmNewGroup(event);
        // Canceling current state
        this.cancelOptionPrompt();
    };
    NgChat.prototype.confirmNewGroup = function (users) {
        var newGroup = new Group(users);
        this.openChatWindow(newGroup);
        if (this.groupAdapter) {
            this.groupAdapter.groupCreated(newGroup);
        }
    };
    // Opens a new chat whindow. Takes care of available viewport
    // Works for opening a chat window for an user or for a group
    // Returns => [Window: Window object reference, boolean: Indicates if this window is a new chat window]
    NgChat.prototype.openChatWindow = function (participant, focusOnNewWindow, invokedByUserClick) {
        if (focusOnNewWindow === void 0) { focusOnNewWindow = false; }
        if (invokedByUserClick === void 0) { invokedByUserClick = false; }
        // Is this window opened?
        var openedWindow = this.windows.find(function (x) { return x.participant.id == participant.id; });
        if (!openedWindow) {
            if (invokedByUserClick) {
                this.onParticipantClicked.emit(participant);
            }
            // Refer to issue #58 on Github 
            var collapseWindow = invokedByUserClick ? false : !this.maximizeWindowOnNewMessage;
            var newChatWindow = new Window(participant, this.historyEnabled, collapseWindow);
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
    };
    // Focus on the input element of the supplied window
    NgChat.prototype.focusOnWindow = function (window, callback) {
        var _this = this;
        if (callback === void 0) { callback = function () { }; }
        var windowIndex = this.windows.indexOf(window);
        if (windowIndex >= 0) {
            setTimeout(function () {
                if (_this.chatWindows) {
                    var chatWindowToFocus = _this.chatWindows.toArray()[windowIndex];
                    chatWindowToFocus.chatWindowInput.nativeElement.focus();
                }
                callback();
            });
        }
    };
    NgChat.prototype.assertMessageType = function (message) {
        // Always fallback to "Text" messages to avoid rendenring issues
        if (!message.type) {
            message.type = MessageType.Text;
        }
    };
    // Marks all messages provided as read with the current time.
    NgChat.prototype.markMessagesAsRead = function (messages) {
        var currentDate = new Date();
        messages.forEach(function (msg) {
            msg.dateSeen = currentDate;
        });
        this.onMessagesSeen.emit(messages);
    };
    // Buffers audio file (For component's bootstrapping)
    NgChat.prototype.bufferAudioFile = function () {
        if (this.audioSource && this.audioSource.length > 0) {
            this.audioFile = new Audio();
            this.audioFile.src = this.audioSource;
            this.audioFile.load();
        }
    };
    // Emits a message notification audio if enabled after every message received
    NgChat.prototype.emitMessageSound = function (window) {
        if (this.audioEnabled && !window.hasFocus && this.audioFile) {
            this.audioFile.play();
        }
    };
    // Emits a browser notification
    NgChat.prototype.emitBrowserNotification = function (window, message) {
        if (this.browserNotificationsBootstrapped && !window.hasFocus && message) {
            var notification_1 = new Notification(this.localization.browserNotificationTitle + " " + window.participant.displayName, {
                'body': message.message,
                'icon': this.browserNotificationIconSource
            });
            setTimeout(function () {
                notification_1.close();
            }, message.message.length <= 50 ? 5000 : 7000); // More time to read longer messages
        }
    };
    // Saves current windows state into local storage if persistence is enabled
    NgChat.prototype.updateWindowsState = function (windows) {
        if (this.persistWindowsState) {
            var participantIds = windows.map(function (w) {
                return w.participant.id;
            });
            localStorage.setItem(this.localStorageKey, JSON.stringify(participantIds));
        }
    };
    NgChat.prototype.restoreWindowsState = function () {
        var _this = this;
        try {
            if (this.persistWindowsState) {
                var stringfiedParticipantIds = localStorage.getItem(this.localStorageKey);
                if (stringfiedParticipantIds && stringfiedParticipantIds.length > 0) {
                    var participantIds_1 = JSON.parse(stringfiedParticipantIds);
                    var participantsToRestore = this.participants.filter(function (u) { return participantIds_1.indexOf(u.id) >= 0; });
                    participantsToRestore.forEach(function (participant) {
                        _this.openChatWindow(participant);
                    });
                }
            }
        }
        catch (ex) {
            console.error("An error occurred while restoring ng-chat windows state. Details: " + ex);
        }
    };
    // Gets closest open window if any. Most recent opened has priority (Right)
    NgChat.prototype.getClosestWindow = function (window) {
        var index = this.windows.indexOf(window);
        if (index > 0) {
            return this.windows[index - 1];
        }
        else if (index == 0 && this.windows.length > 1) {
            return this.windows[index + 1];
        }
    };
    NgChat.prototype.closeWindow = function (window) {
        var index = this.windows.indexOf(window);
        this.windows.splice(index, 1);
        this.updateWindowsState(this.windows);
        this.onParticipantChatClosed.emit(window.participant);
    };
    NgChat.prototype.getChatWindowComponentInstance = function (targetWindow) {
        var windowIndex = this.windows.indexOf(targetWindow);
        if (this.chatWindows) {
            var targetWindow_1 = this.chatWindows.toArray()[windowIndex];
            return targetWindow_1;
        }
        return null;
    };
    // Scrolls a chat window message flow to the bottom
    NgChat.prototype.scrollChatWindow = function (window, direction) {
        var chatWindow = this.getChatWindowComponentInstance(window);
        if (chatWindow) {
            chatWindow.scrollChatWindow(window, direction);
        }
    };
    NgChat.prototype.onWindowMessagesSeen = function (messagesSeen) {
        this.markMessagesAsRead(messagesSeen);
    };
    NgChat.prototype.onWindowChatClosed = function (payload) {
        var _this = this;
        var closedWindow = payload.closedWindow, closedViaEscapeKey = payload.closedViaEscapeKey;
        if (this.onBeforeParticipantChatClosed != undefined && this.onBeforeParticipantChatClosed) {
            if (!this.onBeforeParticipantChatClosed(closedWindow.participant))
                return;
        }
        if (closedViaEscapeKey) {
            var closestWindow = this.getClosestWindow(closedWindow);
            if (closestWindow) {
                this.focusOnWindow(closestWindow, function () { _this.closeWindow(closedWindow); });
            }
            else {
                this.closeWindow(closedWindow);
            }
        }
        else {
            this.closeWindow(closedWindow);
        }
    };
    NgChat.prototype.onWindowTabTriggered = function (payload) {
        var triggeringWindow = payload.triggeringWindow, shiftKeyPressed = payload.shiftKeyPressed;
        var currentWindowIndex = this.windows.indexOf(triggeringWindow);
        var windowToFocus = this.windows[currentWindowIndex + (shiftKeyPressed ? 1 : -1)]; // Goes back on shift + tab
        if (!windowToFocus) {
            // Edge windows, go to start or end
            windowToFocus = this.windows[currentWindowIndex > 0 ? 0 : this.chatWindows.length - 1];
        }
        this.focusOnWindow(windowToFocus);
    };
    NgChat.prototype.onWindowMessageSent = function (messageSent) {
        this.adapter.sendMessage(messageSent);
    };
    NgChat.prototype.onWindowOptionTriggered = function (option) {
        this.currentActiveOption = option;
    };
    NgChat.prototype.triggerOpenChatWindow = function (user) {
        if (user) {
            this.openChatWindow(user);
        }
    };
    NgChat.prototype.triggerCloseChatWindow = function (userId) {
        var openedWindow = this.windows.find(function (x) { return x.participant.id == userId; });
        if (openedWindow) {
            this.closeWindow(openedWindow);
        }
    };
    NgChat.prototype.triggerToggleChatWindowVisibility = function (userId) {
        var openedWindow = this.windows.find(function (x) { return x.participant.id == userId; });
        if (openedWindow) {
            var chatWindow = this.getChatWindowComponentInstance(openedWindow);
            if (chatWindow) {
                chatWindow.onChatWindowClicked(openedWindow);
            }
        }
    };
    NgChat.ctorParameters = function () { return [
        { type: HttpClient }
    ]; };
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
    ], NgChat.prototype, "onBeforeParticipantChatClosed", void 0);
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
    return NgChat;
}());
export { NgChat };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmctY2hhdC5jb21wb25lbnQuanMiLCJzb3VyY2VSb290Ijoibmc6Ly9uZy1jaGF0LyIsInNvdXJjZXMiOlsibmctY2hhdC9uZy1jaGF0LmNvbXBvbmVudC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUEsT0FBTyxFQUFFLFNBQVMsRUFBRSxLQUFLLEVBQVUsWUFBWSxFQUFhLFlBQVksRUFBRSxNQUFNLEVBQUUsWUFBWSxFQUFFLGlCQUFpQixFQUFFLE1BQU0sZUFBZSxDQUFDO0FBQ3pJLE9BQU8sRUFBRSxVQUFVLEVBQUUsTUFBTSxzQkFBc0IsQ0FBQztBQU9sRCxPQUFPLEVBQUUsV0FBVyxFQUFFLE1BQU0sMEJBQTBCLENBQUM7QUFDdkQsT0FBTyxFQUFFLE1BQU0sRUFBRSxNQUFNLGVBQWUsQ0FBQztBQUN2QyxPQUFPLEVBQUUscUJBQXFCLEVBQUUsTUFBTSxxQ0FBcUMsQ0FBQztBQUM1RSxPQUFPLEVBQUUsZUFBZSxFQUFFLE1BQU0sOEJBQThCLENBQUM7QUFHL0QsT0FBTyxFQUFFLHVCQUF1QixFQUFFLE1BQU0sbUNBQW1DLENBQUM7QUFFNUUsT0FBTyxFQUFFLHdCQUF3QixFQUFFLE1BQU0sb0NBQW9DLENBQUM7QUFDOUUsT0FBTyxFQUFFLEtBQUssRUFBRSxNQUFNLG1CQUFtQixDQUFDO0FBRTFDLE9BQU8sRUFBRSxLQUFLLEVBQUUsTUFBTSxjQUFjLENBQUM7QUFDckMsT0FBTyxFQUFFLG1CQUFtQixFQUFFLE1BQU0sbUNBQW1DLENBQUM7QUFHeEUsT0FBTyxFQUFFLEdBQUcsRUFBRSxNQUFNLGdCQUFnQixDQUFDO0FBZ0JyQztJQUNJLGdCQUFvQixXQUF1QjtRQUF2QixnQkFBVyxHQUFYLFdBQVcsQ0FBWTtRQUUzQyxvQ0FBb0M7UUFDN0Isd0JBQW1CLEdBQUcsbUJBQW1CLENBQUM7UUFDMUMsMEJBQXFCLEdBQUcscUJBQXFCLENBQUM7UUFDOUMsZ0JBQVcsR0FBRyxXQUFXLENBQUM7UUFFekIsZ0JBQVcsR0FBWSxLQUFLLENBQUM7UUEr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U0FDeEMsQ0FBQztPQUVXLE1BQU0sQ0Fnd0JsQjtJQUFELGFBQUM7Q0FBQSxBQWh3QkQsSUFnd0JDO1NBaHdCWSxNQUFNIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgQ29tcG9uZW50LCBJbnB1dCwgT25Jbml0LCBWaWV3Q2hpbGRyZW4sIFF1ZXJ5TGlzdCwgSG9zdExpc3RlbmVyLCBPdXRwdXQsIEV2ZW50RW1pdHRlciwgVmlld0VuY2Fwc3VsYXRpb24gfSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7IEh0dHBDbGllbnQgfSBmcm9tICdAYW5ndWxhci9jb21tb24vaHR0cCc7XG5cbmltcG9ydCB7IENoYXRBZGFwdGVyIH0gZnJvbSAnLi9jb3JlL2NoYXQtYWRhcHRlcic7XG5pbXBvcnQgeyBJQ2hhdEdyb3VwQWRhcHRlciB9IGZyb20gJy4vY29yZS9jaGF0LWdyb3VwLWFkYXB0ZXInO1xuaW1wb3J0IHsgVXNlciB9IGZyb20gXCIuL2NvcmUvdXNlclwiO1xuaW1wb3J0IHsgUGFydGljaXBhbnRSZXNwb25zZSB9IGZyb20gXCIuL2NvcmUvcGFydGljaXBhbnQtcmVzcG9uc2VcIjtcbmltcG9ydCB7IE1lc3NhZ2UgfSBmcm9tIFwiLi9jb3JlL21lc3NhZ2VcIjtcbmltcG9ydCB7IE1lc3NhZ2VUeXBlIH0gZnJvbSBcIi4vY29yZS9tZXNzYWdlLXR5cGUuZW51bVwiO1xuaW1wb3J0IHsgV2luZG93IH0gZnJvbSBcIi4vY29yZS93aW5kb3dcIjtcbmltcG9ydCB7IENoYXRQYXJ0aWNpcGFudFN0YXR1cyB9IGZyb20gXCIuL2NvcmUvY2hhdC1wYXJ0aWNpcGFudC1zdGF0dXMuZW51bVwiO1xuaW1wb3J0IHsgU2Nyb2xsRGlyZWN0aW9uIH0gZnJvbSBcIi4vY29yZS9zY3JvbGwtZGlyZWN0aW9uLmVudW1cIjtcbmltcG9ydCB7IExvY2FsaXphdGlvbiwgU3RhdHVzRGVzY3JpcHRpb24gfSBmcm9tICcuL2NvcmUvbG9jYWxpemF0aW9uJztcbmltcG9ydCB7IElDaGF0Q29udHJvbGxlciB9IGZyb20gJy4vY29yZS9jaGF0LWNvbnRyb2xsZXInO1xuaW1wb3J0IHsgUGFnZWRIaXN0b3J5Q2hhdEFkYXB0ZXIgfSBmcm9tICcuL2NvcmUvcGFnZWQtaGlzdG9yeS1jaGF0LWFkYXB0ZXInO1xuaW1wb3J0IHsgSUZpbGVVcGxvYWRBZGFwdGVyIH0gZnJvbSAnLi9jb3JlL2ZpbGUtdXBsb2FkLWFkYXB0ZXInO1xuaW1wb3J0IHsgRGVmYXVsdEZpbGVVcGxvYWRBZGFwdGVyIH0gZnJvbSAnLi9jb3JlL2RlZmF1bHQtZmlsZS11cGxvYWQtYWRhcHRlcic7XG5pbXBvcnQgeyBUaGVtZSB9IGZyb20gJy4vY29yZS90aGVtZS5lbnVtJztcbmltcG9ydCB7IElDaGF0T3B0aW9uIH0gZnJvbSAnLi9jb3JlL2NoYXQtb3B0aW9uJztcbmltcG9ydCB7IEdyb3VwIH0gZnJvbSBcIi4vY29yZS9ncm91cFwiO1xuaW1wb3J0IHsgQ2hhdFBhcnRpY2lwYW50VHlwZSB9IGZyb20gXCIuL2NvcmUvY2hhdC1wYXJ0aWNpcGFudC10eXBlLmVudW1cIjtcbmltcG9ydCB7IElDaGF0UGFydGljaXBhbnQgfSBmcm9tIFwiLi9jb3JlL2NoYXQtcGFydGljaXBhbnRcIjtcblxuaW1wb3J0IHsgbWFwIH0gZnJvbSAncnhqcy9vcGVyYXRvcnMnO1xuaW1wb3J0IHsgTmdDaGF0V2luZG93Q29tcG9uZW50IH0gZnJvbSAnLi9jb21wb25lbnRzL25nLWNoYXQtd2luZG93L25nLWNoYXQtd2luZG93LmNvbXBvbmVudCc7XG5cbkBDb21wb25lbnQoe1xuICAgIHNlbGVjdG9yOiAnbmctY2hhdCcsXG4gICAgdGVtcGxhdGVVcmw6ICduZy1jaGF0LmNvbXBvbmVudC5odG1sJyxcbiAgICBzdHlsZVVybHM6IFtcbiAgICAgICAgJ2Fzc2V0cy9pY29ucy5jc3MnLFxuICAgICAgICAnYXNzZXRzL2xvYWRpbmctc3Bpbm5lci5jc3MnLFxuICAgICAgICAnYXNzZXRzL25nLWNoYXQuY29tcG9uZW50LmRlZmF1bHQuY3NzJyxcbiAgICAgICAgJ2Fzc2V0cy90aGVtZXMvbmctY2hhdC50aGVtZS5kZWZhdWx0LnNjc3MnLFxuICAgICAgICAnYXNzZXRzL3RoZW1lcy9uZy1jaGF0LnRoZW1lLmRhcmsuc2NzcydcbiAgICBdLFxuICAgIGVuY2Fwc3VsYXRpb246IFZpZXdFbmNhcHN1bGF0aW9uLk5vbmVcbn0pXG5cbmV4cG9ydCBjbGFzcyBOZ0NoYXQgaW1wbGVtZW50cyBPbkluaXQsIElDaGF0Q29udHJvbGxlciB7XG4gICAgY29uc3RydWN0b3IocHJpdmF0ZSBfaHR0cENsaWVudDogSHR0cENsaWVudCkgeyB9XG5cbiAgICAvLyBFeHBvc2VzIGVudW1zIGZvciB0aGUgbmctdGVtcGxhdGVcbiAgICBwdWJsaWMgQ2hhdFBhcnRpY2lwYW50VHlwZSA9IENoYXRQYXJ0aWNpcGFudFR5cGU7XG4gICAgcHVibGljIENoYXRQYXJ0aWNpcGFudFN0YXR1cyA9IENoYXRQYXJ0aWNpcGFudFN0YXR1cztcbiAgICBwdWJsaWMgTWVzc2FnZVR5cGUgPSBNZXNzYWdlVHlwZTtcblxuICAgIHByaXZhdGUgX2lzRGlzYWJsZWQ6IGJvb2xlYW4gPSBmYWxzZTtcblxuICAgIGdldCBpc0Rpc2FibGVkKCk6IGJvb2xlYW4ge1xuICAgICAgICByZXR1cm4gdGhpcy5faXNEaXNhYmxlZDtcbiAgICB9XG4gICAgICBcbiAgICBASW5wdXQoKVxuICAgIHNldCBpc0Rpc2FibGVkKHZhbHVlOiBib29sZWFuKSB7XG4gICAgICAgIHRoaXMuX2lzRGlzYWJsZWQgPSB2YWx1ZTtcblxuICAgICAgICBpZiAodmFsdWUpXG4gICAgICAgIHtcbiAgICAgICAgICAgIC8vIFRvIGFkZHJlc3MgaXNzdWUgaHR0cHM6Ly9naXRodWIuY29tL3JwYXNjaG9hbC9uZy1jaGF0L2lzc3Vlcy8xMjBcbiAgICAgICAgICAgIHdpbmRvdy5jbGVhckludGVydmFsKHRoaXMucG9sbGluZ0ludGVydmFsV2luZG93SW5zdGFuY2UpXG4gICAgICAgIH1cbiAgICAgICAgZWxzZVxuICAgICAgICB7XG4gICAgICAgICAgICB0aGlzLmFjdGl2YXRlRnJpZW5kTGlzdEZldGNoKCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBASW5wdXQoKVxuICAgIHB1YmxpYyBhZGFwdGVyOiBDaGF0QWRhcHRlcjtcblxuICAgIEBJbnB1dCgpXG4gICAgcHVibGljIGdyb3VwQWRhcHRlcjogSUNoYXRHcm91cEFkYXB0ZXI7XG5cbiAgICBASW5wdXQoKVxuICAgIHB1YmxpYyB1c2VySWQ6IGFueTtcblxuICAgIEBJbnB1dCgpXG4gICAgcHVibGljIGlzQ29sbGFwc2VkOiBib29sZWFuID0gZmFsc2U7XG5cbiAgICBASW5wdXQoKVxuICAgIHB1YmxpYyBtYXhpbWl6ZVdpbmRvd09uTmV3TWVzc2FnZTogYm9vbGVhbiA9IHRydWU7XG5cbiAgICBASW5wdXQoKSAgICBcbiAgICBwdWJsaWMgcG9sbEZyaWVuZHNMaXN0OiBib29sZWFuID0gZmFsc2U7XG5cbiAgICBASW5wdXQoKVxuICAgIHB1YmxpYyBwb2xsaW5nSW50ZXJ2YWw6IG51bWJlciA9IDUwMDA7XG5cbiAgICBASW5wdXQoKSAgICBcbiAgICBwdWJsaWMgaGlzdG9yeUVuYWJsZWQ6IGJvb2xlYW4gPSB0cnVlO1xuXG4gICAgQElucHV0KCkgICAgXG4gICAgcHVibGljIGVtb2ppc0VuYWJsZWQ6IGJvb2xlYW4gPSB0cnVlO1xuXG4gICAgQElucHV0KCkgICAgXG4gICAgcHVibGljIGxpbmtmeUVuYWJsZWQ6IGJvb2xlYW4gPSB0cnVlO1xuXG4gICAgQElucHV0KClcbiAgICBwdWJsaWMgYXVkaW9FbmFibGVkOiBib29sZWFuID0gdHJ1ZTtcblxuICAgIEBJbnB1dCgpXG4gICAgcHVibGljIHNlYXJjaEVuYWJsZWQ6IGJvb2xlYW4gPSB0cnVlO1xuXG4gICAgQElucHV0KCkgLy8gVE9ETzogVGhpcyBtaWdodCBuZWVkIGEgYmV0dGVyIGNvbnRlbnQgc3RyYXRlZ3lcbiAgICBwdWJsaWMgYXVkaW9Tb3VyY2U6IHN0cmluZyA9ICdodHRwczovL3Jhdy5naXRodWJ1c2VyY29udGVudC5jb20vcnBhc2Nob2FsL25nLWNoYXQvbWFzdGVyL3NyYy9uZy1jaGF0L2Fzc2V0cy9ub3RpZmljYXRpb24ud2F2JztcblxuICAgIEBJbnB1dCgpXG4gICAgcHVibGljIHBlcnNpc3RXaW5kb3dzU3RhdGU6IGJvb2xlYW4gPSB0cnVlO1xuXG4gICAgQElucHV0KClcbiAgICBwdWJsaWMgdGl0bGU6IHN0cmluZyA9IFwiRnJpZW5kc1wiO1xuXG4gICAgQElucHV0KClcbiAgICBwdWJsaWMgbWVzc2FnZVBsYWNlaG9sZGVyOiBzdHJpbmcgPSBcIlR5cGUgYSBtZXNzYWdlXCI7XG5cbiAgICBASW5wdXQoKVxuICAgIHB1YmxpYyBzZWFyY2hQbGFjZWhvbGRlcjogc3RyaW5nID0gXCJTZWFyY2hcIjtcblxuICAgIEBJbnB1dCgpXG4gICAgcHVibGljIGJyb3dzZXJOb3RpZmljYXRpb25zRW5hYmxlZDogYm9vbGVhbiA9IHRydWU7XG5cbiAgICBASW5wdXQoKSAvLyBUT0RPOiBUaGlzIG1pZ2h0IG5lZWQgYSBiZXR0ZXIgY29udGVudCBzdHJhdGVneVxuICAgIHB1YmxpYyBicm93c2VyTm90aWZpY2F0aW9uSWNvblNvdXJjZTogc3RyaW5nID0gJ2h0dHBzOi8vcmF3LmdpdGh1YnVzZXJjb250ZW50LmNvbS9ycGFzY2hvYWwvbmctY2hhdC9tYXN0ZXIvc3JjL25nLWNoYXQvYXNzZXRzL25vdGlmaWNhdGlvbi5wbmcnO1xuXG4gICAgQElucHV0KClcbiAgICBwdWJsaWMgYnJvd3Nlck5vdGlmaWNhdGlvblRpdGxlOiBzdHJpbmcgPSBcIk5ldyBtZXNzYWdlIGZyb21cIjtcbiAgICBcbiAgICBASW5wdXQoKVxuICAgIHB1YmxpYyBoaXN0b3J5UGFnZVNpemU6IG51bWJlciA9IDEwO1xuXG4gICAgQElucHV0KClcbiAgICBwdWJsaWMgbG9jYWxpemF0aW9uOiBMb2NhbGl6YXRpb247XG5cbiAgICBASW5wdXQoKVxuICAgIHB1YmxpYyBoaWRlRnJpZW5kc0xpc3Q6IGJvb2xlYW4gPSBmYWxzZTtcblxuICAgIEBJbnB1dCgpXG4gICAgcHVibGljIGhpZGVGcmllbmRzTGlzdE9uVW5zdXBwb3J0ZWRWaWV3cG9ydDogYm9vbGVhbiA9IHRydWU7XG5cbiAgICBASW5wdXQoKVxuICAgIHB1YmxpYyBmaWxlVXBsb2FkVXJsOiBzdHJpbmc7XG5cbiAgICBASW5wdXQoKVxuICAgIHB1YmxpYyB0aGVtZTogVGhlbWUgPSBUaGVtZS5MaWdodDtcblxuICAgIEBJbnB1dCgpXG4gICAgcHVibGljIGN1c3RvbVRoZW1lOiBzdHJpbmc7XG5cbiAgICBASW5wdXQoKVxuICAgIHB1YmxpYyBtZXNzYWdlRGF0ZVBpcGVGb3JtYXQ6IHN0cmluZyA9IFwic2hvcnRcIjtcblxuICAgIEBJbnB1dCgpXG4gICAgcHVibGljIHNob3dNZXNzYWdlRGF0ZTogYm9vbGVhbiA9IHRydWU7XG4gICAgXG4gICAgQElucHV0KClcbiAgICBwdWJsaWMgaXNWaWV3cG9ydE9uTW9iaWxlRW5hYmxlZDogYm9vbGVhbiA9IGZhbHNlO1xuICAgIFxuICAgIEBJbnB1dCgpXG4gICAgcHVibGljIG9uQmVmb3JlUGFydGljaXBhbnRDaGF0Q2xvc2VkOiAocGFydGljaXBhbnQ6IElDaGF0UGFydGljaXBhbnQpID0+IGJvb2xlYW47XG4gICAgIFxuICAgIEBPdXRwdXQoKVxuICAgIHB1YmxpYyBvblBhcnRpY2lwYW50Q2xpY2tlZDogRXZlbnRFbWl0dGVyPElDaGF0UGFydGljaXBhbnQ+ID0gbmV3IEV2ZW50RW1pdHRlcjxJQ2hhdFBhcnRpY2lwYW50PigpO1xuXG4gICAgQE91dHB1dCgpXG4gICAgcHVibGljIG9uUGFydGljaXBhbnRDaGF0T3BlbmVkOiBFdmVudEVtaXR0ZXI8SUNoYXRQYXJ0aWNpcGFudD4gPSBuZXcgRXZlbnRFbWl0dGVyPElDaGF0UGFydGljaXBhbnQ+KCk7XG5cbiAgICBAT3V0cHV0KClcbiAgICBwdWJsaWMgb25QYXJ0aWNpcGFudENoYXRDbG9zZWQ6IEV2ZW50RW1pdHRlcjxJQ2hhdFBhcnRpY2lwYW50PiA9IG5ldyBFdmVudEVtaXR0ZXI8SUNoYXRQYXJ0aWNpcGFudD4oKTtcbiAgICBcbiAgICBAT3V0cHV0KClcbiAgICBwdWJsaWMgb25NZXNzYWdlc1NlZW46IEV2ZW50RW1pdHRlcjxNZXNzYWdlW10+ID0gbmV3IEV2ZW50RW1pdHRlcjxNZXNzYWdlW10+KCk7XG5cbiAgICBwcml2YXRlIGJyb3dzZXJOb3RpZmljYXRpb25zQm9vdHN0cmFwcGVkOiBib29sZWFuID0gZmFsc2U7XG5cbiAgICBwdWJsaWMgaGFzUGFnZWRIaXN0b3J5OiBib29sZWFuID0gZmFsc2U7XG5cbiAgICAvLyBEb24ndCB3YW50IHRvIGFkZCB0aGlzIGFzIGEgc2V0dGluZyB0byBzaW1wbGlmeSB1c2FnZS4gUHJldmlvdXMgcGxhY2Vob2xkZXIgYW5kIHRpdGxlIHNldHRpbmdzIGF2YWlsYWJsZSB0byBiZSB1c2VkLCBvciB1c2UgZnVsbCBMb2NhbGl6YXRpb24gb2JqZWN0LlxuICAgIHByaXZhdGUgc3RhdHVzRGVzY3JpcHRpb246IFN0YXR1c0Rlc2NyaXB0aW9uID0ge1xuICAgICAgICBvbmxpbmU6ICdPbmxpbmUnLFxuICAgICAgICBidXN5OiAnQnVzeScsXG4gICAgICAgIGF3YXk6ICdBd2F5JyxcbiAgICAgICAgb2ZmbGluZTogJ09mZmxpbmUnXG4gICAgfTtcblxuICAgIHByaXZhdGUgYXVkaW9GaWxlOiBIVE1MQXVkaW9FbGVtZW50O1xuXG4gICAgcHVibGljIHBhcnRpY2lwYW50czogSUNoYXRQYXJ0aWNpcGFudFtdO1xuXG4gICAgcHVibGljIHBhcnRpY2lwYW50c1Jlc3BvbnNlOiBQYXJ0aWNpcGFudFJlc3BvbnNlW107XG5cbiAgICBwdWJsaWMgcGFydGljaXBhbnRzSW50ZXJhY3RlZFdpdGg6IElDaGF0UGFydGljaXBhbnRbXSA9IFtdO1xuXG4gICAgcHVibGljIGN1cnJlbnRBY3RpdmVPcHRpb246IElDaGF0T3B0aW9uIHwgbnVsbDtcblxuICAgIHByaXZhdGUgcG9sbGluZ0ludGVydmFsV2luZG93SW5zdGFuY2U6IG51bWJlcjtcblxuICAgIHByaXZhdGUgZ2V0IGxvY2FsU3RvcmFnZUtleSgpOiBzdHJpbmcgXG4gICAge1xuICAgICAgICByZXR1cm4gYG5nLWNoYXQtdXNlcnMtJHt0aGlzLnVzZXJJZH1gOyAvLyBBcHBlbmRpbmcgdGhlIHVzZXIgaWQgc28gdGhlIHN0YXRlIGlzIHVuaXF1ZSBwZXIgdXNlciBpbiBhIGNvbXB1dGVyLiAgIFxuICAgIH07XG5cbiAgICAvLyBEZWZpbmVzIHRoZSBzaXplIG9mIGVhY2ggb3BlbmVkIHdpbmRvdyB0byBjYWxjdWxhdGUgaG93IG1hbnkgd2luZG93cyBjYW4gYmUgb3BlbmVkIG9uIHRoZSB2aWV3cG9ydCBhdCB0aGUgc2FtZSB0aW1lLlxuICAgIHB1YmxpYyB3aW5kb3dTaXplRmFjdG9yOiBudW1iZXIgPSAzMjA7XG5cbiAgICAvLyBUb3RhbCB3aWR0aCBzaXplIG9mIHRoZSBmcmllbmRzIGxpc3Qgc2VjdGlvblxuICAgIHB1YmxpYyBmcmllbmRzTGlzdFdpZHRoOiBudW1iZXIgPSAyNjI7XG5cbiAgICAvLyBBdmFpbGFibGUgYXJlYSB0byByZW5kZXIgdGhlIHBsdWdpblxuICAgIHByaXZhdGUgdmlld1BvcnRUb3RhbEFyZWE6IG51bWJlcjtcbiAgICBcbiAgICAvLyBTZXQgdG8gdHJ1ZSBpZiB0aGVyZSBpcyBubyBzcGFjZSB0byBkaXNwbGF5IGF0IGxlYXN0IG9uZSBjaGF0IHdpbmRvdyBhbmQgJ2hpZGVGcmllbmRzTGlzdE9uVW5zdXBwb3J0ZWRWaWV3cG9ydCcgaXMgdHJ1ZVxuICAgIHB1YmxpYyB1bnN1cHBvcnRlZFZpZXdwb3J0OiBib29sZWFuID0gZmFsc2U7XG5cbiAgICAvLyBGaWxlIHVwbG9hZCBhZGFwdGVyXG4gICAgcHVibGljIGZpbGVVcGxvYWRBZGFwdGVyOiBJRmlsZVVwbG9hZEFkYXB0ZXI7XG5cbiAgICB3aW5kb3dzOiBXaW5kb3dbXSA9IFtdO1xuICAgIGlzQm9vdHN0cmFwcGVkOiBib29sZWFuID0gZmFsc2U7XG5cbiAgICBAVmlld0NoaWxkcmVuKCdjaGF0V2luZG93JykgY2hhdFdpbmRvd3M6IFF1ZXJ5TGlzdDxOZ0NoYXRXaW5kb3dDb21wb25lbnQ+O1xuXG4gICAgbmdPbkluaXQoKSB7IFxuICAgICAgICB0aGlzLmJvb3RzdHJhcENoYXQoKTtcbiAgICB9XG5cbiAgICBASG9zdExpc3RlbmVyKCd3aW5kb3c6cmVzaXplJywgWyckZXZlbnQnXSlcbiAgICBvblJlc2l6ZShldmVudDogYW55KXtcbiAgICAgICB0aGlzLnZpZXdQb3J0VG90YWxBcmVhID0gZXZlbnQudGFyZ2V0LmlubmVyV2lkdGg7XG5cbiAgICAgICB0aGlzLk5vcm1hbGl6ZVdpbmRvd3MoKTtcbiAgICB9XG5cbiAgICAvLyBDaGVja3MgaWYgdGhlcmUgYXJlIG1vcmUgb3BlbmVkIHdpbmRvd3MgdGhhbiB0aGUgdmlldyBwb3J0IGNhbiBkaXNwbGF5XG4gICAgcHJpdmF0ZSBOb3JtYWxpemVXaW5kb3dzKCk6IHZvaWRcbiAgICB7XG4gICAgICAgIGNvbnN0IG1heFN1cHBvcnRlZE9wZW5lZFdpbmRvd3MgPSBNYXRoLmZsb29yKCh0aGlzLnZpZXdQb3J0VG90YWxBcmVhIC0gKCF0aGlzLmhpZGVGcmllbmRzTGlzdCA/IHRoaXMuZnJpZW5kc0xpc3RXaWR0aCA6IDApKSAvIHRoaXMud2luZG93U2l6ZUZhY3Rvcik7XG4gICAgICAgIGNvbnN0IGRpZmZlcmVuY2UgPSB0aGlzLndpbmRvd3MubGVuZ3RoIC0gbWF4U3VwcG9ydGVkT3BlbmVkV2luZG93cztcblxuICAgICAgICBpZiAoZGlmZmVyZW5jZSA+PSAwKVxuICAgICAgICB7XG4gICAgICAgICAgICB0aGlzLndpbmRvd3Muc3BsaWNlKHRoaXMud2luZG93cy5sZW5ndGggLSBkaWZmZXJlbmNlKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMudXBkYXRlV2luZG93c1N0YXRlKHRoaXMud2luZG93cyk7XG5cbiAgICAgICAgLy8gVmlld3BvcnQgc2hvdWxkIGhhdmUgc3BhY2UgZm9yIGF0IGxlYXN0IG9uZSBjaGF0IHdpbmRvdyBidXQgc2hvdWxkIHNob3cgaW4gbW9iaWxlIGlmIG9wdGlvbiBpcyBlbmFibGVkLlxuICAgICAgICB0aGlzLnVuc3VwcG9ydGVkVmlld3BvcnQgPSB0aGlzLmlzVmlld3BvcnRPbk1vYmlsZUVuYWJsZWQ/IGZhbHNlIDogdGhpcy5oaWRlRnJpZW5kc0xpc3RPblVuc3VwcG9ydGVkVmlld3BvcnQgJiYgbWF4U3VwcG9ydGVkT3BlbmVkV2luZG93cyA8IDE7XG4gICAgfVxuXG4gICAgLy8gSW5pdGlhbGl6ZXMgdGhlIGNoYXQgcGx1Z2luIGFuZCB0aGUgbWVzc2FnaW5nIGFkYXB0ZXJcbiAgICBwcml2YXRlIGJvb3RzdHJhcENoYXQoKTogdm9pZFxuICAgIHtcbiAgICAgICAgbGV0IGluaXRpYWxpemF0aW9uRXhjZXB0aW9uID0gbnVsbDtcblxuICAgICAgICBpZiAodGhpcy5hZGFwdGVyICE9IG51bGwgJiYgdGhpcy51c2VySWQgIT0gbnVsbClcbiAgICAgICAge1xuICAgICAgICAgICAgdHJ5XG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgdGhpcy52aWV3UG9ydFRvdGFsQXJlYSA9IHdpbmRvdy5pbm5lcldpZHRoO1xuXG4gICAgICAgICAgICAgICAgdGhpcy5pbml0aWFsaXplVGhlbWUoKTtcbiAgICAgICAgICAgICAgICB0aGlzLmluaXRpYWxpemVEZWZhdWx0VGV4dCgpO1xuICAgICAgICAgICAgICAgIHRoaXMuaW5pdGlhbGl6ZUJyb3dzZXJOb3RpZmljYXRpb25zKCk7XG5cbiAgICAgICAgICAgICAgICAvLyBCaW5kaW5nIGV2ZW50IGxpc3RlbmVyc1xuICAgICAgICAgICAgICAgIHRoaXMuYWRhcHRlci5tZXNzYWdlUmVjZWl2ZWRIYW5kbGVyID0gKHBhcnRpY2lwYW50LCBtc2cpID0+IHRoaXMub25NZXNzYWdlUmVjZWl2ZWQocGFydGljaXBhbnQsIG1zZyk7XG4gICAgICAgICAgICAgICAgdGhpcy5hZGFwdGVyLmZyaWVuZHNMaXN0Q2hhbmdlZEhhbmRsZXIgPSAocGFydGljaXBhbnRzUmVzcG9uc2UpID0+IHRoaXMub25GcmllbmRzTGlzdENoYW5nZWQocGFydGljaXBhbnRzUmVzcG9uc2UpO1xuXG4gICAgICAgICAgICAgICAgdGhpcy5hY3RpdmF0ZUZyaWVuZExpc3RGZXRjaCgpO1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIHRoaXMuYnVmZmVyQXVkaW9GaWxlKCk7XG5cbiAgICAgICAgICAgICAgICB0aGlzLmhhc1BhZ2VkSGlzdG9yeSA9IHRoaXMuYWRhcHRlciBpbnN0YW5jZW9mIFBhZ2VkSGlzdG9yeUNoYXRBZGFwdGVyO1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIGlmICh0aGlzLmZpbGVVcGxvYWRVcmwgJiYgdGhpcy5maWxlVXBsb2FkVXJsICE9PSBcIlwiKVxuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5maWxlVXBsb2FkQWRhcHRlciA9IG5ldyBEZWZhdWx0RmlsZVVwbG9hZEFkYXB0ZXIodGhpcy5maWxlVXBsb2FkVXJsLCB0aGlzLl9odHRwQ2xpZW50KTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICB0aGlzLk5vcm1hbGl6ZVdpbmRvd3MoKTtcblxuICAgICAgICAgICAgICAgIHRoaXMuaXNCb290c3RyYXBwZWQgPSB0cnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY2F0Y2goZXgpXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgaW5pdGlhbGl6YXRpb25FeGNlcHRpb24gPSBleDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGlmICghdGhpcy5pc0Jvb3RzdHJhcHBlZCl7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKFwibmctY2hhdCBjb21wb25lbnQgY291bGRuJ3QgYmUgYm9vdHN0cmFwcGVkLlwiKTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgaWYgKHRoaXMudXNlcklkID09IG51bGwpe1xuICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoXCJuZy1jaGF0IGNhbid0IGJlIGluaXRpYWxpemVkIHdpdGhvdXQgYW4gdXNlciBpZC4gUGxlYXNlIG1ha2Ugc3VyZSB5b3UndmUgcHJvdmlkZWQgYW4gdXNlcklkIGFzIGEgcGFyYW1ldGVyIG9mIHRoZSBuZy1jaGF0IGNvbXBvbmVudC5cIik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAodGhpcy5hZGFwdGVyID09IG51bGwpe1xuICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoXCJuZy1jaGF0IGNhbid0IGJlIGJvb3RzdHJhcHBlZCB3aXRob3V0IGEgQ2hhdEFkYXB0ZXIuIFBsZWFzZSBtYWtlIHN1cmUgeW91J3ZlIHByb3ZpZGVkIGEgQ2hhdEFkYXB0ZXIgaW1wbGVtZW50YXRpb24gYXMgYSBwYXJhbWV0ZXIgb2YgdGhlIG5nLWNoYXQgY29tcG9uZW50LlwiKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChpbml0aWFsaXphdGlvbkV4Y2VwdGlvbilcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKGBBbiBleGNlcHRpb24gaGFzIG9jY3VycmVkIHdoaWxlIGluaXRpYWxpemluZyBuZy1jaGF0LiBEZXRhaWxzOiAke2luaXRpYWxpemF0aW9uRXhjZXB0aW9uLm1lc3NhZ2V9YCk7XG4gICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcihpbml0aWFsaXphdGlvbkV4Y2VwdGlvbik7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwcml2YXRlIGFjdGl2YXRlRnJpZW5kTGlzdEZldGNoKCk6IHZvaWQge1xuICAgICAgICBpZiAodGhpcy5hZGFwdGVyKVxuICAgICAgICB7XG4gICAgICAgICAgICAvLyBMb2FkaW5nIGN1cnJlbnQgdXNlcnMgbGlzdFxuICAgICAgICAgICAgaWYgKHRoaXMucG9sbEZyaWVuZHNMaXN0KXtcbiAgICAgICAgICAgICAgICAvLyBTZXR0aW5nIGEgbG9uZyBwb2xsIGludGVydmFsIHRvIHVwZGF0ZSB0aGUgZnJpZW5kcyBsaXN0XG4gICAgICAgICAgICAgICAgdGhpcy5mZXRjaEZyaWVuZHNMaXN0KHRydWUpO1xuICAgICAgICAgICAgICAgIHRoaXMucG9sbGluZ0ludGVydmFsV2luZG93SW5zdGFuY2UgPSB3aW5kb3cuc2V0SW50ZXJ2YWwoKCkgPT4gdGhpcy5mZXRjaEZyaWVuZHNMaXN0KGZhbHNlKSwgdGhpcy5wb2xsaW5nSW50ZXJ2YWwpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIC8vIFNpbmNlIHBvbGxpbmcgd2FzIGRpc2FibGVkLCBhIGZyaWVuZHMgbGlzdCB1cGRhdGUgbWVjaGFuaXNtIHdpbGwgaGF2ZSB0byBiZSBpbXBsZW1lbnRlZCBpbiB0aGUgQ2hhdEFkYXB0ZXIuXG4gICAgICAgICAgICAgICAgdGhpcy5mZXRjaEZyaWVuZHNMaXN0KHRydWUpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgLy8gSW5pdGlhbGl6ZXMgYnJvd3NlciBub3RpZmljYXRpb25zXG4gICAgcHJpdmF0ZSBhc3luYyBpbml0aWFsaXplQnJvd3Nlck5vdGlmaWNhdGlvbnMoKVxuICAgIHtcbiAgICAgICAgaWYgKHRoaXMuYnJvd3Nlck5vdGlmaWNhdGlvbnNFbmFibGVkICYmIChcIk5vdGlmaWNhdGlvblwiIGluIHdpbmRvdykpXG4gICAgICAgIHtcbiAgICAgICAgICAgIGlmIChhd2FpdCBOb3RpZmljYXRpb24ucmVxdWVzdFBlcm1pc3Npb24oKSA9PT0gXCJncmFudGVkXCIpXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgdGhpcy5icm93c2VyTm90aWZpY2F0aW9uc0Jvb3RzdHJhcHBlZCA9IHRydWU7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBJbml0aWFsaXplcyBkZWZhdWx0IHRleHRcbiAgICBwcml2YXRlIGluaXRpYWxpemVEZWZhdWx0VGV4dCgpIDogdm9pZFxuICAgIHtcbiAgICAgICAgaWYgKCF0aGlzLmxvY2FsaXphdGlvbilcbiAgICAgICAge1xuICAgICAgICAgICAgdGhpcy5sb2NhbGl6YXRpb24gPSB7XG4gICAgICAgICAgICAgICAgbWVzc2FnZVBsYWNlaG9sZGVyOiB0aGlzLm1lc3NhZ2VQbGFjZWhvbGRlcixcbiAgICAgICAgICAgICAgICBzZWFyY2hQbGFjZWhvbGRlcjogdGhpcy5zZWFyY2hQbGFjZWhvbGRlciwgXG4gICAgICAgICAgICAgICAgdGl0bGU6IHRoaXMudGl0bGUsXG4gICAgICAgICAgICAgICAgc3RhdHVzRGVzY3JpcHRpb246IHRoaXMuc3RhdHVzRGVzY3JpcHRpb24sXG4gICAgICAgICAgICAgICAgYnJvd3Nlck5vdGlmaWNhdGlvblRpdGxlOiB0aGlzLmJyb3dzZXJOb3RpZmljYXRpb25UaXRsZSxcbiAgICAgICAgICAgICAgICBsb2FkTWVzc2FnZUhpc3RvcnlQbGFjZWhvbGRlcjogXCJMb2FkIG9sZGVyIG1lc3NhZ2VzXCJcbiAgICAgICAgICAgIH07XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwcml2YXRlIGluaXRpYWxpemVUaGVtZSgpOiB2b2lkXG4gICAge1xuICAgICAgICBpZiAodGhpcy5jdXN0b21UaGVtZSlcbiAgICAgICAge1xuICAgICAgICAgICAgdGhpcy50aGVtZSA9IFRoZW1lLkN1c3RvbTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmICh0aGlzLnRoZW1lICE9IFRoZW1lLkxpZ2h0ICYmIHRoaXMudGhlbWUgIT0gVGhlbWUuRGFyaylcbiAgICAgICAge1xuICAgICAgICAgICAgLy8gVE9ETzogVXNlIGVzMjAxNyBpbiBmdXR1cmUgd2l0aCBPYmplY3QudmFsdWVzKFRoZW1lKS5pbmNsdWRlcyh0aGlzLnRoZW1lKSB0byBkbyB0aGlzIGNoZWNrXG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYEludmFsaWQgdGhlbWUgY29uZmlndXJhdGlvbiBmb3IgbmctY2hhdC4gXCIke3RoaXMudGhlbWV9XCIgaXMgbm90IGEgdmFsaWQgdGhlbWUgdmFsdWUuYCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBTZW5kcyBhIHJlcXVlc3QgdG8gbG9hZCB0aGUgZnJpZW5kcyBsaXN0XG4gICAgcHVibGljIGZldGNoRnJpZW5kc0xpc3QoaXNCb290c3RyYXBwaW5nOiBib29sZWFuKTogdm9pZFxuICAgIHtcbiAgICAgICAgdGhpcy5hZGFwdGVyLmxpc3RGcmllbmRzKClcbiAgICAgICAgLnBpcGUoXG4gICAgICAgICAgICBtYXAoKHBhcnRpY2lwYW50c1Jlc3BvbnNlOiBQYXJ0aWNpcGFudFJlc3BvbnNlW10pID0+IHtcbiAgICAgICAgICAgICAgICB0aGlzLnBhcnRpY2lwYW50c1Jlc3BvbnNlID0gcGFydGljaXBhbnRzUmVzcG9uc2U7XG5cbiAgICAgICAgICAgICAgICB0aGlzLnBhcnRpY2lwYW50cyA9IHBhcnRpY2lwYW50c1Jlc3BvbnNlLm1hcCgocmVzcG9uc2U6IFBhcnRpY2lwYW50UmVzcG9uc2UpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHJlc3BvbnNlLnBhcnRpY2lwYW50O1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSlcbiAgICAgICAgKS5zdWJzY3JpYmUoKCkgPT4ge1xuICAgICAgICAgICAgaWYgKGlzQm9vdHN0cmFwcGluZylcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICB0aGlzLnJlc3RvcmVXaW5kb3dzU3RhdGUoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgZmV0Y2hNZXNzYWdlSGlzdG9yeSh3aW5kb3c6IFdpbmRvdykge1xuICAgICAgICAvLyBOb3QgaWRlYWwgYnV0IHdpbGwga2VlcCB0aGlzIHVudGlsIHdlIGRlY2lkZSBpZiB3ZSBhcmUgc2hpcHBpbmcgcGFnaW5hdGlvbiB3aXRoIHRoZSBkZWZhdWx0IGFkYXB0ZXJcbiAgICAgICAgaWYgKHRoaXMuYWRhcHRlciBpbnN0YW5jZW9mIFBhZ2VkSGlzdG9yeUNoYXRBZGFwdGVyKVxuICAgICAgICB7XG4gICAgICAgICAgICB3aW5kb3cuaXNMb2FkaW5nSGlzdG9yeSA9IHRydWU7XG5cbiAgICAgICAgICAgIHRoaXMuYWRhcHRlci5nZXRNZXNzYWdlSGlzdG9yeUJ5UGFnZSh3aW5kb3cucGFydGljaXBhbnQuaWQsIHRoaXMuaGlzdG9yeVBhZ2VTaXplLCArK3dpbmRvdy5oaXN0b3J5UGFnZSlcbiAgICAgICAgICAgIC5waXBlKFxuICAgICAgICAgICAgICAgIG1hcCgocmVzdWx0OiBNZXNzYWdlW10pID0+IHtcbiAgICAgICAgICAgICAgICAgICAgcmVzdWx0LmZvckVhY2goKG1lc3NhZ2UpID0+IHRoaXMuYXNzZXJ0TWVzc2FnZVR5cGUobWVzc2FnZSkpO1xuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgd2luZG93Lm1lc3NhZ2VzID0gcmVzdWx0LmNvbmNhdCh3aW5kb3cubWVzc2FnZXMpO1xuICAgICAgICAgICAgICAgICAgICB3aW5kb3cuaXNMb2FkaW5nSGlzdG9yeSA9IGZhbHNlO1xuICAgIFxuICAgICAgICAgICAgICAgICAgICBjb25zdCBkaXJlY3Rpb246IFNjcm9sbERpcmVjdGlvbiA9ICh3aW5kb3cuaGlzdG9yeVBhZ2UgPT0gMSkgPyBTY3JvbGxEaXJlY3Rpb24uQm90dG9tIDogU2Nyb2xsRGlyZWN0aW9uLlRvcDtcbiAgICAgICAgICAgICAgICAgICAgd2luZG93Lmhhc01vcmVNZXNzYWdlcyA9IHJlc3VsdC5sZW5ndGggPT0gdGhpcy5oaXN0b3J5UGFnZVNpemU7XG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHRoaXMub25GZXRjaE1lc3NhZ2VIaXN0b3J5TG9hZGVkKHJlc3VsdCwgd2luZG93LCBkaXJlY3Rpb24sIHRydWUpKTtcbiAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgKS5zdWJzY3JpYmUoKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlXG4gICAgICAgIHtcbiAgICAgICAgICAgIHRoaXMuYWRhcHRlci5nZXRNZXNzYWdlSGlzdG9yeSh3aW5kb3cucGFydGljaXBhbnQuaWQpXG4gICAgICAgICAgICAucGlwZShcbiAgICAgICAgICAgICAgICBtYXAoKHJlc3VsdDogTWVzc2FnZVtdKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIHJlc3VsdC5mb3JFYWNoKChtZXNzYWdlKSA9PiB0aGlzLmFzc2VydE1lc3NhZ2VUeXBlKG1lc3NhZ2UpKTtcbiAgICBcbiAgICAgICAgICAgICAgICAgICAgd2luZG93Lm1lc3NhZ2VzID0gcmVzdWx0LmNvbmNhdCh3aW5kb3cubWVzc2FnZXMpO1xuICAgICAgICAgICAgICAgICAgICB3aW5kb3cuaXNMb2FkaW5nSGlzdG9yeSA9IGZhbHNlO1xuICAgIFxuICAgICAgICAgICAgICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHRoaXMub25GZXRjaE1lc3NhZ2VIaXN0b3J5TG9hZGVkKHJlc3VsdCwgd2luZG93LCBTY3JvbGxEaXJlY3Rpb24uQm90dG9tKSk7XG4gICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICkuc3Vic2NyaWJlKCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwcml2YXRlIG9uRmV0Y2hNZXNzYWdlSGlzdG9yeUxvYWRlZChtZXNzYWdlczogTWVzc2FnZVtdLCB3aW5kb3c6IFdpbmRvdywgZGlyZWN0aW9uOiBTY3JvbGxEaXJlY3Rpb24sIGZvcmNlTWFya01lc3NhZ2VzQXNTZWVuOiBib29sZWFuID0gZmFsc2UpOiB2b2lkIFxuICAgIHtcbiAgICAgICAgdGhpcy5zY3JvbGxDaGF0V2luZG93KHdpbmRvdywgZGlyZWN0aW9uKVxuXG4gICAgICAgIGlmICh3aW5kb3cuaGFzRm9jdXMgfHwgZm9yY2VNYXJrTWVzc2FnZXNBc1NlZW4pXG4gICAgICAgIHtcbiAgICAgICAgICAgIGNvbnN0IHVuc2Vlbk1lc3NhZ2VzID0gbWVzc2FnZXMuZmlsdGVyKG0gPT4gIW0uZGF0ZVNlZW4pO1xuXG4gICAgICAgICAgICB0aGlzLm1hcmtNZXNzYWdlc0FzUmVhZCh1bnNlZW5NZXNzYWdlcyk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBVcGRhdGVzIHRoZSBmcmllbmRzIGxpc3QgdmlhIHRoZSBldmVudCBoYW5kbGVyXG4gICAgcHJpdmF0ZSBvbkZyaWVuZHNMaXN0Q2hhbmdlZChwYXJ0aWNpcGFudHNSZXNwb25zZTogUGFydGljaXBhbnRSZXNwb25zZVtdKTogdm9pZFxuICAgIHtcbiAgICAgICAgaWYgKHBhcnRpY2lwYW50c1Jlc3BvbnNlKSBcbiAgICAgICAge1xuICAgICAgICAgICAgdGhpcy5wYXJ0aWNpcGFudHNSZXNwb25zZSA9IHBhcnRpY2lwYW50c1Jlc3BvbnNlO1xuXG4gICAgICAgICAgICB0aGlzLnBhcnRpY2lwYW50cyA9IHBhcnRpY2lwYW50c1Jlc3BvbnNlLm1hcCgocmVzcG9uc2U6IFBhcnRpY2lwYW50UmVzcG9uc2UpID0+IHtcbiAgICAgICAgICAgICAgICByZXR1cm4gcmVzcG9uc2UucGFydGljaXBhbnQ7XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgdGhpcy5wYXJ0aWNpcGFudHNJbnRlcmFjdGVkV2l0aCA9IFtdO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLy8gSGFuZGxlcyByZWNlaXZlZCBtZXNzYWdlcyBieSB0aGUgYWRhcHRlclxuICAgIHByaXZhdGUgb25NZXNzYWdlUmVjZWl2ZWQocGFydGljaXBhbnQ6IElDaGF0UGFydGljaXBhbnQsIG1lc3NhZ2U6IE1lc3NhZ2UpXG4gICAge1xuICAgICAgICBpZiAocGFydGljaXBhbnQgJiYgbWVzc2FnZSlcbiAgICAgICAge1xuICAgICAgICAgICAgY29uc3QgY2hhdFdpbmRvdyA9IHRoaXMub3BlbkNoYXRXaW5kb3cocGFydGljaXBhbnQpO1xuXG4gICAgICAgICAgICB0aGlzLmFzc2VydE1lc3NhZ2VUeXBlKG1lc3NhZ2UpO1xuXG4gICAgICAgICAgICBpZiAoIWNoYXRXaW5kb3dbMV0gfHwgIXRoaXMuaGlzdG9yeUVuYWJsZWQpe1xuICAgICAgICAgICAgICAgIGNoYXRXaW5kb3dbMF0ubWVzc2FnZXMucHVzaChtZXNzYWdlKTtcblxuICAgICAgICAgICAgICAgIHRoaXMuc2Nyb2xsQ2hhdFdpbmRvdyhjaGF0V2luZG93WzBdLCBTY3JvbGxEaXJlY3Rpb24uQm90dG9tKTtcblxuICAgICAgICAgICAgICAgIGlmIChjaGF0V2luZG93WzBdLmhhc0ZvY3VzKVxuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5tYXJrTWVzc2FnZXNBc1JlYWQoW21lc3NhZ2VdKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHRoaXMuZW1pdE1lc3NhZ2VTb3VuZChjaGF0V2luZG93WzBdKTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgLy8gR2l0aHViIGlzc3VlICM1OCBcbiAgICAgICAgICAgIC8vIERvIG5vdCBwdXNoIGJyb3dzZXIgbm90aWZpY2F0aW9ucyB3aXRoIG1lc3NhZ2UgY29udGVudCBmb3IgcHJpdmFjeSBwdXJwb3NlcyBpZiB0aGUgJ21heGltaXplV2luZG93T25OZXdNZXNzYWdlJyBzZXR0aW5nIGlzIG9mZiBhbmQgdGhpcyBpcyBhIG5ldyBjaGF0IHdpbmRvdy5cbiAgICAgICAgICAgIGlmICh0aGlzLm1heGltaXplV2luZG93T25OZXdNZXNzYWdlIHx8ICghY2hhdFdpbmRvd1sxXSAmJiAhY2hhdFdpbmRvd1swXS5pc0NvbGxhcHNlZCkpXG4gICAgICAgICAgICB7IFxuICAgICAgICAgICAgICAgIC8vIFNvbWUgbWVzc2FnZXMgYXJlIG5vdCBwdXNoZWQgYmVjYXVzZSB0aGV5IGFyZSBsb2FkZWQgYnkgZmV0Y2hpbmcgdGhlIGhpc3RvcnkgaGVuY2Ugd2h5IHdlIHN1cHBseSB0aGUgbWVzc2FnZSBoZXJlXG4gICAgICAgICAgICAgICAgdGhpcy5lbWl0QnJvd3Nlck5vdGlmaWNhdGlvbihjaGF0V2luZG93WzBdLCBtZXNzYWdlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIG9uUGFydGljaXBhbnRDbGlja2VkRnJvbUZyaWVuZHNMaXN0KHBhcnRpY2lwYW50OiBJQ2hhdFBhcnRpY2lwYW50KTogdm9pZCB7XG4gICAgICAgIHRoaXMub3BlbkNoYXRXaW5kb3cocGFydGljaXBhbnQsIHRydWUsIHRydWUpO1xuICAgIH1cblxuICAgIHByaXZhdGUgY2FuY2VsT3B0aW9uUHJvbXB0KCk6IHZvaWQge1xuICAgICAgICBpZiAodGhpcy5jdXJyZW50QWN0aXZlT3B0aW9uKVxuICAgICAgICB7XG4gICAgICAgICAgICB0aGlzLmN1cnJlbnRBY3RpdmVPcHRpb24uaXNBY3RpdmUgPSBmYWxzZTtcbiAgICAgICAgICAgIHRoaXMuY3VycmVudEFjdGl2ZU9wdGlvbiA9IG51bGw7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBvbk9wdGlvblByb21wdENhbmNlbGVkKCk6IHZvaWQge1xuICAgICAgICB0aGlzLmNhbmNlbE9wdGlvblByb21wdCgpO1xuICAgIH1cblxuICAgIG9uT3B0aW9uUHJvbXB0Q29uZmlybWVkKGV2ZW50OiBhbnkpOiB2b2lkIHtcbiAgICAgICAgLy8gRm9yIG5vdyB0aGlzIGlzIGZpbmUgYXMgdGhlcmUgaXMgb25seSBvbmUgb3B0aW9uIGF2YWlsYWJsZS4gSW50cm9kdWNlIG9wdGlvbiB0eXBlcyBhbmQgdHlwZSBjaGVja2luZyBpZiBhIG5ldyBvcHRpb24gaXMgYWRkZWQuXG4gICAgICAgIHRoaXMuY29uZmlybU5ld0dyb3VwKGV2ZW50KTtcblxuICAgICAgICAvLyBDYW5jZWxpbmcgY3VycmVudCBzdGF0ZVxuICAgICAgICB0aGlzLmNhbmNlbE9wdGlvblByb21wdCgpO1xuICAgIH1cblxuICAgIHByaXZhdGUgY29uZmlybU5ld0dyb3VwKHVzZXJzOiBVc2VyW10pOiB2b2lkIHtcbiAgICAgICAgY29uc3QgbmV3R3JvdXAgPSBuZXcgR3JvdXAodXNlcnMpO1xuXG4gICAgICAgIHRoaXMub3BlbkNoYXRXaW5kb3cobmV3R3JvdXApO1xuXG4gICAgICAgIGlmICh0aGlzLmdyb3VwQWRhcHRlcilcbiAgICAgICAge1xuICAgICAgICAgICAgdGhpcy5ncm91cEFkYXB0ZXIuZ3JvdXBDcmVhdGVkKG5ld0dyb3VwKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8vIE9wZW5zIGEgbmV3IGNoYXQgd2hpbmRvdy4gVGFrZXMgY2FyZSBvZiBhdmFpbGFibGUgdmlld3BvcnRcbiAgICAvLyBXb3JrcyBmb3Igb3BlbmluZyBhIGNoYXQgd2luZG93IGZvciBhbiB1c2VyIG9yIGZvciBhIGdyb3VwXG4gICAgLy8gUmV0dXJucyA9PiBbV2luZG93OiBXaW5kb3cgb2JqZWN0IHJlZmVyZW5jZSwgYm9vbGVhbjogSW5kaWNhdGVzIGlmIHRoaXMgd2luZG93IGlzIGEgbmV3IGNoYXQgd2luZG93XVxuICAgIHByaXZhdGUgb3BlbkNoYXRXaW5kb3cocGFydGljaXBhbnQ6IElDaGF0UGFydGljaXBhbnQsIGZvY3VzT25OZXdXaW5kb3c6IGJvb2xlYW4gPSBmYWxzZSwgaW52b2tlZEJ5VXNlckNsaWNrOiBib29sZWFuID0gZmFsc2UpOiBbV2luZG93LCBib29sZWFuXVxuICAgIHtcbiAgICAgICAgLy8gSXMgdGhpcyB3aW5kb3cgb3BlbmVkP1xuICAgICAgICBjb25zdCBvcGVuZWRXaW5kb3cgPSB0aGlzLndpbmRvd3MuZmluZCh4ID0+IHgucGFydGljaXBhbnQuaWQgPT0gcGFydGljaXBhbnQuaWQpO1xuXG4gICAgICAgIGlmICghb3BlbmVkV2luZG93KVxuICAgICAgICB7XG4gICAgICAgICAgICBpZiAoaW52b2tlZEJ5VXNlckNsaWNrKSBcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICB0aGlzLm9uUGFydGljaXBhbnRDbGlja2VkLmVtaXQocGFydGljaXBhbnQpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBSZWZlciB0byBpc3N1ZSAjNTggb24gR2l0aHViIFxuICAgICAgICAgICAgY29uc3QgY29sbGFwc2VXaW5kb3cgPSBpbnZva2VkQnlVc2VyQ2xpY2sgPyBmYWxzZSA6ICF0aGlzLm1heGltaXplV2luZG93T25OZXdNZXNzYWdlO1xuXG4gICAgICAgICAgICBjb25zdCBuZXdDaGF0V2luZG93OiBXaW5kb3cgPSBuZXcgV2luZG93KHBhcnRpY2lwYW50LCB0aGlzLmhpc3RvcnlFbmFibGVkLCBjb2xsYXBzZVdpbmRvdyk7XG5cbiAgICAgICAgICAgIC8vIExvYWRzIHRoZSBjaGF0IGhpc3RvcnkgdmlhIGFuIFJ4SnMgT2JzZXJ2YWJsZVxuICAgICAgICAgICAgaWYgKHRoaXMuaGlzdG9yeUVuYWJsZWQpXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgdGhpcy5mZXRjaE1lc3NhZ2VIaXN0b3J5KG5ld0NoYXRXaW5kb3cpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB0aGlzLndpbmRvd3MudW5zaGlmdChuZXdDaGF0V2luZG93KTtcblxuICAgICAgICAgICAgLy8gSXMgdGhlcmUgZW5vdWdoIHNwYWNlIGxlZnQgaW4gdGhlIHZpZXcgcG9ydCA/IGJ1dCBzaG91bGQgYmUgZGlzcGxheWVkIGluIG1vYmlsZSBpZiBvcHRpb24gaXMgZW5hYmxlZFxuICAgICAgICAgICAgaWYgKCF0aGlzLmlzVmlld3BvcnRPbk1vYmlsZUVuYWJsZWQpIHtcbiAgICAgICAgICAgICAgICBpZiAodGhpcy53aW5kb3dzLmxlbmd0aCAqIHRoaXMud2luZG93U2l6ZUZhY3RvciA+PSB0aGlzLnZpZXdQb3J0VG90YWxBcmVhIC0gKCF0aGlzLmhpZGVGcmllbmRzTGlzdCA/IHRoaXMuZnJpZW5kc0xpc3RXaWR0aCA6IDApKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMud2luZG93cy5wb3AoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHRoaXMudXBkYXRlV2luZG93c1N0YXRlKHRoaXMud2luZG93cyk7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGlmIChmb2N1c09uTmV3V2luZG93ICYmICFjb2xsYXBzZVdpbmRvdykgXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgdGhpcy5mb2N1c09uV2luZG93KG5ld0NoYXRXaW5kb3cpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB0aGlzLnBhcnRpY2lwYW50c0ludGVyYWN0ZWRXaXRoLnB1c2gocGFydGljaXBhbnQpO1xuICAgICAgICAgICAgdGhpcy5vblBhcnRpY2lwYW50Q2hhdE9wZW5lZC5lbWl0KHBhcnRpY2lwYW50KTtcblxuICAgICAgICAgICAgcmV0dXJuIFtuZXdDaGF0V2luZG93LCB0cnVlXTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlXG4gICAgICAgIHtcbiAgICAgICAgICAgIC8vIFJldHVybnMgdGhlIGV4aXN0aW5nIGNoYXQgd2luZG93ICAgICBcbiAgICAgICAgICAgIHJldHVybiBbb3BlbmVkV2luZG93LCBmYWxzZV07ICAgICAgIFxuICAgICAgICB9XG4gICAgfVxuXG4gICAgLy8gRm9jdXMgb24gdGhlIGlucHV0IGVsZW1lbnQgb2YgdGhlIHN1cHBsaWVkIHdpbmRvd1xuICAgIHByaXZhdGUgZm9jdXNPbldpbmRvdyh3aW5kb3c6IFdpbmRvdywgY2FsbGJhY2s6IEZ1bmN0aW9uID0gKCkgPT4ge30pIDogdm9pZFxuICAgIHtcbiAgICAgICAgY29uc3Qgd2luZG93SW5kZXggPSB0aGlzLndpbmRvd3MuaW5kZXhPZih3aW5kb3cpO1xuICAgICAgICBpZiAod2luZG93SW5kZXggPj0gMClcbiAgICAgICAge1xuICAgICAgICAgICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuY2hhdFdpbmRvd3MpXG4gICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBjaGF0V2luZG93VG9Gb2N1cyA9IHRoaXMuY2hhdFdpbmRvd3MudG9BcnJheSgpW3dpbmRvd0luZGV4XTtcblxuICAgICAgICAgICAgICAgICAgICBjaGF0V2luZG93VG9Gb2N1cy5jaGF0V2luZG93SW5wdXQubmF0aXZlRWxlbWVudC5mb2N1cygpO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGNhbGxiYWNrKCk7IFxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0gXG4gICAgfVxuXG4gICAgcHJpdmF0ZSBhc3NlcnRNZXNzYWdlVHlwZShtZXNzYWdlOiBNZXNzYWdlKTogdm9pZCB7XG4gICAgICAgIC8vIEFsd2F5cyBmYWxsYmFjayB0byBcIlRleHRcIiBtZXNzYWdlcyB0byBhdm9pZCByZW5kZW5yaW5nIGlzc3Vlc1xuICAgICAgICBpZiAoIW1lc3NhZ2UudHlwZSlcbiAgICAgICAge1xuICAgICAgICAgICAgbWVzc2FnZS50eXBlID0gTWVzc2FnZVR5cGUuVGV4dDtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8vIE1hcmtzIGFsbCBtZXNzYWdlcyBwcm92aWRlZCBhcyByZWFkIHdpdGggdGhlIGN1cnJlbnQgdGltZS5cbiAgICBtYXJrTWVzc2FnZXNBc1JlYWQobWVzc2FnZXM6IE1lc3NhZ2VbXSk6IHZvaWRcbiAgICB7XG4gICAgICAgIGNvbnN0IGN1cnJlbnREYXRlID0gbmV3IERhdGUoKTtcblxuICAgICAgICBtZXNzYWdlcy5mb3JFYWNoKChtc2cpPT57XG4gICAgICAgICAgICBtc2cuZGF0ZVNlZW4gPSBjdXJyZW50RGF0ZTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgdGhpcy5vbk1lc3NhZ2VzU2Vlbi5lbWl0KG1lc3NhZ2VzKTtcbiAgICB9XG5cbiAgICAvLyBCdWZmZXJzIGF1ZGlvIGZpbGUgKEZvciBjb21wb25lbnQncyBib290c3RyYXBwaW5nKVxuICAgIHByaXZhdGUgYnVmZmVyQXVkaW9GaWxlKCk6IHZvaWQge1xuICAgICAgICBpZiAodGhpcy5hdWRpb1NvdXJjZSAmJiB0aGlzLmF1ZGlvU291cmNlLmxlbmd0aCA+IDApXG4gICAgICAgIHtcbiAgICAgICAgICAgIHRoaXMuYXVkaW9GaWxlID0gbmV3IEF1ZGlvKCk7XG4gICAgICAgICAgICB0aGlzLmF1ZGlvRmlsZS5zcmMgPSB0aGlzLmF1ZGlvU291cmNlO1xuICAgICAgICAgICAgdGhpcy5hdWRpb0ZpbGUubG9hZCgpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLy8gRW1pdHMgYSBtZXNzYWdlIG5vdGlmaWNhdGlvbiBhdWRpbyBpZiBlbmFibGVkIGFmdGVyIGV2ZXJ5IG1lc3NhZ2UgcmVjZWl2ZWRcbiAgICBwcml2YXRlIGVtaXRNZXNzYWdlU291bmQod2luZG93OiBXaW5kb3cpOiB2b2lkXG4gICAge1xuICAgICAgICBpZiAodGhpcy5hdWRpb0VuYWJsZWQgJiYgIXdpbmRvdy5oYXNGb2N1cyAmJiB0aGlzLmF1ZGlvRmlsZSkge1xuICAgICAgICAgICAgdGhpcy5hdWRpb0ZpbGUucGxheSgpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLy8gRW1pdHMgYSBicm93c2VyIG5vdGlmaWNhdGlvblxuICAgIHByaXZhdGUgZW1pdEJyb3dzZXJOb3RpZmljYXRpb24od2luZG93OiBXaW5kb3csIG1lc3NhZ2U6IE1lc3NhZ2UpOiB2b2lkXG4gICAgeyAgICAgICBcbiAgICAgICAgaWYgKHRoaXMuYnJvd3Nlck5vdGlmaWNhdGlvbnNCb290c3RyYXBwZWQgJiYgIXdpbmRvdy5oYXNGb2N1cyAmJiBtZXNzYWdlKSB7XG4gICAgICAgICAgICBjb25zdCBub3RpZmljYXRpb24gPSBuZXcgTm90aWZpY2F0aW9uKGAke3RoaXMubG9jYWxpemF0aW9uLmJyb3dzZXJOb3RpZmljYXRpb25UaXRsZX0gJHt3aW5kb3cucGFydGljaXBhbnQuZGlzcGxheU5hbWV9YCwge1xuICAgICAgICAgICAgICAgICdib2R5JzogbWVzc2FnZS5tZXNzYWdlLFxuICAgICAgICAgICAgICAgICdpY29uJzogdGhpcy5icm93c2VyTm90aWZpY2F0aW9uSWNvblNvdXJjZVxuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAgICAgICAgIG5vdGlmaWNhdGlvbi5jbG9zZSgpO1xuICAgICAgICAgICAgfSwgbWVzc2FnZS5tZXNzYWdlLmxlbmd0aCA8PSA1MCA/IDUwMDAgOiA3MDAwKTsgLy8gTW9yZSB0aW1lIHRvIHJlYWQgbG9uZ2VyIG1lc3NhZ2VzXG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBTYXZlcyBjdXJyZW50IHdpbmRvd3Mgc3RhdGUgaW50byBsb2NhbCBzdG9yYWdlIGlmIHBlcnNpc3RlbmNlIGlzIGVuYWJsZWRcbiAgICBwcml2YXRlIHVwZGF0ZVdpbmRvd3NTdGF0ZSh3aW5kb3dzOiBXaW5kb3dbXSk6IHZvaWRcbiAgICB7XG4gICAgICAgIGlmICh0aGlzLnBlcnNpc3RXaW5kb3dzU3RhdGUpXG4gICAgICAgIHtcbiAgICAgICAgICAgIGNvbnN0IHBhcnRpY2lwYW50SWRzID0gd2luZG93cy5tYXAoKHcpID0+IHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdy5wYXJ0aWNpcGFudC5pZDtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICBsb2NhbFN0b3JhZ2Uuc2V0SXRlbSh0aGlzLmxvY2FsU3RvcmFnZUtleSwgSlNPTi5zdHJpbmdpZnkocGFydGljaXBhbnRJZHMpKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHByaXZhdGUgcmVzdG9yZVdpbmRvd3NTdGF0ZSgpOiB2b2lkXG4gICAge1xuICAgICAgICB0cnlcbiAgICAgICAge1xuICAgICAgICAgICAgaWYgKHRoaXMucGVyc2lzdFdpbmRvd3NTdGF0ZSlcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBjb25zdCBzdHJpbmdmaWVkUGFydGljaXBhbnRJZHMgPSBsb2NhbFN0b3JhZ2UuZ2V0SXRlbSh0aGlzLmxvY2FsU3RvcmFnZUtleSk7XG5cbiAgICAgICAgICAgICAgICBpZiAoc3RyaW5nZmllZFBhcnRpY2lwYW50SWRzICYmIHN0cmluZ2ZpZWRQYXJ0aWNpcGFudElkcy5sZW5ndGggPiAwKVxuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgcGFydGljaXBhbnRJZHMgPSA8bnVtYmVyW10+SlNPTi5wYXJzZShzdHJpbmdmaWVkUGFydGljaXBhbnRJZHMpO1xuXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHBhcnRpY2lwYW50c1RvUmVzdG9yZSA9IHRoaXMucGFydGljaXBhbnRzLmZpbHRlcih1ID0+IHBhcnRpY2lwYW50SWRzLmluZGV4T2YodS5pZCkgPj0gMCk7XG5cbiAgICAgICAgICAgICAgICAgICAgcGFydGljaXBhbnRzVG9SZXN0b3JlLmZvckVhY2goKHBhcnRpY2lwYW50KSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLm9wZW5DaGF0V2luZG93KHBhcnRpY2lwYW50KTtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGNhdGNoIChleClcbiAgICAgICAge1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcihgQW4gZXJyb3Igb2NjdXJyZWQgd2hpbGUgcmVzdG9yaW5nIG5nLWNoYXQgd2luZG93cyBzdGF0ZS4gRGV0YWlsczogJHtleH1gKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8vIEdldHMgY2xvc2VzdCBvcGVuIHdpbmRvdyBpZiBhbnkuIE1vc3QgcmVjZW50IG9wZW5lZCBoYXMgcHJpb3JpdHkgKFJpZ2h0KVxuICAgIHByaXZhdGUgZ2V0Q2xvc2VzdFdpbmRvdyh3aW5kb3c6IFdpbmRvdyk6IFdpbmRvdyB8IHVuZGVmaW5lZFxuICAgIHsgICBcbiAgICAgICAgY29uc3QgaW5kZXggPSB0aGlzLndpbmRvd3MuaW5kZXhPZih3aW5kb3cpO1xuXG4gICAgICAgIGlmIChpbmRleCA+IDApXG4gICAgICAgIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLndpbmRvd3NbaW5kZXggLSAxXTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmIChpbmRleCA9PSAwICYmIHRoaXMud2luZG93cy5sZW5ndGggPiAxKVxuICAgICAgICB7ICAgXG4gICAgICAgICAgICByZXR1cm4gdGhpcy53aW5kb3dzW2luZGV4ICsgMV07XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwcml2YXRlIGNsb3NlV2luZG93KHdpbmRvdzogV2luZG93KTogdm9pZCBcbiAgICB7XG4gICAgICAgIGNvbnN0IGluZGV4ID0gdGhpcy53aW5kb3dzLmluZGV4T2Yod2luZG93KTtcblxuICAgICAgICB0aGlzLndpbmRvd3Muc3BsaWNlKGluZGV4LCAxKTtcblxuICAgICAgICB0aGlzLnVwZGF0ZVdpbmRvd3NTdGF0ZSh0aGlzLndpbmRvd3MpO1xuXG4gICAgICAgIHRoaXMub25QYXJ0aWNpcGFudENoYXRDbG9zZWQuZW1pdCh3aW5kb3cucGFydGljaXBhbnQpO1xuICAgIH1cblxuICAgIHByaXZhdGUgZ2V0Q2hhdFdpbmRvd0NvbXBvbmVudEluc3RhbmNlKHRhcmdldFdpbmRvdzogV2luZG93KTogTmdDaGF0V2luZG93Q29tcG9uZW50IHwgbnVsbCB7XG4gICAgICAgIGNvbnN0IHdpbmRvd0luZGV4ID0gdGhpcy53aW5kb3dzLmluZGV4T2YodGFyZ2V0V2luZG93KTtcblxuICAgICAgICBpZiAodGhpcy5jaGF0V2luZG93cyl7XG4gICAgICAgICAgICBsZXQgdGFyZ2V0V2luZG93ID0gdGhpcy5jaGF0V2luZG93cy50b0FycmF5KClbd2luZG93SW5kZXhdO1xuXG4gICAgICAgICAgICByZXR1cm4gdGFyZ2V0V2luZG93O1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuXG4gICAgLy8gU2Nyb2xscyBhIGNoYXQgd2luZG93IG1lc3NhZ2UgZmxvdyB0byB0aGUgYm90dG9tXG4gICAgcHJpdmF0ZSBzY3JvbGxDaGF0V2luZG93KHdpbmRvdzogV2luZG93LCBkaXJlY3Rpb246IFNjcm9sbERpcmVjdGlvbik6IHZvaWRcbiAgICB7XG4gICAgICAgIGNvbnN0IGNoYXRXaW5kb3cgPSB0aGlzLmdldENoYXRXaW5kb3dDb21wb25lbnRJbnN0YW5jZSh3aW5kb3cpO1xuXG4gICAgICAgIGlmIChjaGF0V2luZG93KXtcbiAgICAgICAgICAgIGNoYXRXaW5kb3cuc2Nyb2xsQ2hhdFdpbmRvdyh3aW5kb3csIGRpcmVjdGlvbik7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBvbldpbmRvd01lc3NhZ2VzU2VlbihtZXNzYWdlc1NlZW46IE1lc3NhZ2VbXSk6IHZvaWQge1xuICAgICAgICB0aGlzLm1hcmtNZXNzYWdlc0FzUmVhZChtZXNzYWdlc1NlZW4pO1xuICAgIH1cblxuICAgIG9uV2luZG93Q2hhdENsb3NlZChwYXlsb2FkOiB7IGNsb3NlZFdpbmRvdzogV2luZG93LCBjbG9zZWRWaWFFc2NhcGVLZXk6IGJvb2xlYW4gfSk6IHZvaWQge1xuICAgICAgICBjb25zdCB7IGNsb3NlZFdpbmRvdywgY2xvc2VkVmlhRXNjYXBlS2V5IH0gPSBwYXlsb2FkO1xuICAgICAgICBpZih0aGlzLm9uQmVmb3JlUGFydGljaXBhbnRDaGF0Q2xvc2VkICE9IHVuZGVmaW5lZCAmJiB0aGlzLm9uQmVmb3JlUGFydGljaXBhbnRDaGF0Q2xvc2VkKSB7XG4gICAgICAgICAgICBpZighdGhpcy5vbkJlZm9yZVBhcnRpY2lwYW50Q2hhdENsb3NlZChjbG9zZWRXaW5kb3cucGFydGljaXBhbnQpKVxuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBpZiAoY2xvc2VkVmlhRXNjYXBlS2V5KSB7XG4gICAgICAgICAgICBsZXQgY2xvc2VzdFdpbmRvdyA9IHRoaXMuZ2V0Q2xvc2VzdFdpbmRvdyhjbG9zZWRXaW5kb3cpO1xuXG4gICAgICAgICAgICBpZiAoY2xvc2VzdFdpbmRvdylcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICB0aGlzLmZvY3VzT25XaW5kb3coY2xvc2VzdFdpbmRvdywgKCkgPT4geyB0aGlzLmNsb3NlV2luZG93KGNsb3NlZFdpbmRvdyk7IH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIHRoaXMuY2xvc2VXaW5kb3coY2xvc2VkV2luZG93KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBlbHNlIHsgXG4gICAgICAgICAgICB0aGlzLmNsb3NlV2luZG93KGNsb3NlZFdpbmRvdyk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBvbldpbmRvd1RhYlRyaWdnZXJlZChwYXlsb2FkOiB7IHRyaWdnZXJpbmdXaW5kb3c6IFdpbmRvdywgc2hpZnRLZXlQcmVzc2VkOiBib29sZWFuIH0pOiB2b2lkIHtcbiAgICAgICAgY29uc3QgeyB0cmlnZ2VyaW5nV2luZG93LCBzaGlmdEtleVByZXNzZWQgfSA9IHBheWxvYWQ7XG5cbiAgICAgICAgY29uc3QgY3VycmVudFdpbmRvd0luZGV4ID0gdGhpcy53aW5kb3dzLmluZGV4T2YodHJpZ2dlcmluZ1dpbmRvdyk7XG4gICAgICAgIGxldCB3aW5kb3dUb0ZvY3VzID0gdGhpcy53aW5kb3dzW2N1cnJlbnRXaW5kb3dJbmRleCArIChzaGlmdEtleVByZXNzZWQgPyAxIDogLTEpXTsgLy8gR29lcyBiYWNrIG9uIHNoaWZ0ICsgdGFiXG5cbiAgICAgICAgaWYgKCF3aW5kb3dUb0ZvY3VzKVxuICAgICAgICB7XG4gICAgICAgICAgICAvLyBFZGdlIHdpbmRvd3MsIGdvIHRvIHN0YXJ0IG9yIGVuZFxuICAgICAgICAgICAgd2luZG93VG9Gb2N1cyA9IHRoaXMud2luZG93c1tjdXJyZW50V2luZG93SW5kZXggPiAwID8gMCA6IHRoaXMuY2hhdFdpbmRvd3MubGVuZ3RoIC0gMV07IFxuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5mb2N1c09uV2luZG93KHdpbmRvd1RvRm9jdXMpO1xuICAgIH1cblxuICAgIG9uV2luZG93TWVzc2FnZVNlbnQobWVzc2FnZVNlbnQ6IE1lc3NhZ2UpOiB2b2lkIHtcbiAgICAgICAgdGhpcy5hZGFwdGVyLnNlbmRNZXNzYWdlKG1lc3NhZ2VTZW50KTtcbiAgICB9XG4gICAgXG4gICAgb25XaW5kb3dPcHRpb25UcmlnZ2VyZWQob3B0aW9uOiBJQ2hhdE9wdGlvbik6IHZvaWQge1xuICAgICAgICB0aGlzLmN1cnJlbnRBY3RpdmVPcHRpb24gPSBvcHRpb247XG4gICAgfVxuXG4gICAgdHJpZ2dlck9wZW5DaGF0V2luZG93KHVzZXI6IFVzZXIpOiB2b2lkIHtcbiAgICAgICAgaWYgKHVzZXIpXG4gICAgICAgIHtcbiAgICAgICAgICAgIHRoaXMub3BlbkNoYXRXaW5kb3codXNlcik7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICB0cmlnZ2VyQ2xvc2VDaGF0V2luZG93KHVzZXJJZDogYW55KTogdm9pZCB7XG4gICAgICAgIGNvbnN0IG9wZW5lZFdpbmRvdyA9IHRoaXMud2luZG93cy5maW5kKHggPT4geC5wYXJ0aWNpcGFudC5pZCA9PSB1c2VySWQpO1xuXG4gICAgICAgIGlmIChvcGVuZWRXaW5kb3cpIFxuICAgICAgICB7XG4gICAgICAgICAgICB0aGlzLmNsb3NlV2luZG93KG9wZW5lZFdpbmRvdyk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICB0cmlnZ2VyVG9nZ2xlQ2hhdFdpbmRvd1Zpc2liaWxpdHkodXNlcklkOiBhbnkpOiB2b2lkIHtcbiAgICAgICAgY29uc3Qgb3BlbmVkV2luZG93ID0gdGhpcy53aW5kb3dzLmZpbmQoeCA9PiB4LnBhcnRpY2lwYW50LmlkID09IHVzZXJJZCk7XG5cbiAgICAgICAgaWYgKG9wZW5lZFdpbmRvdykgXG4gICAgICAgIHtcbiAgICAgICAgICAgIGNvbnN0IGNoYXRXaW5kb3cgPSB0aGlzLmdldENoYXRXaW5kb3dDb21wb25lbnRJbnN0YW5jZShvcGVuZWRXaW5kb3cpO1xuXG4gICAgICAgICAgICBpZiAoY2hhdFdpbmRvdyl7XG4gICAgICAgICAgICAgICAgY2hhdFdpbmRvdy5vbkNoYXRXaW5kb3dDbGlja2VkKG9wZW5lZFdpbmRvdyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG59Il19