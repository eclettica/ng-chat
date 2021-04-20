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
    NgChat.prototype.onWindowChatToggle = function (payload) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                this.onParticipantToggle.emit({ participant: payload.currentWindow.participant, isCollapsed: payload.isCollapsed });
                return [2 /*return*/];
            });
        });
    };
    NgChat.prototype.onWindowChatClosed = function (payload) {
        return __awaiter(this, void 0, void 0, function () {
            var closedWindow, closedViaEscapeKey, l, closestWindow;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        closedWindow = payload.closedWindow, closedViaEscapeKey = payload.closedViaEscapeKey;
                        console.log('onWindowChatClosed');
                        if (!(this.beforeParteciantChatClosed != undefined && this.beforeParteciantChatClosed)) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.beforeParteciantChatClosed(closedWindow.participant)];
                    case 1:
                        l = _a.sent();
                        if (l == false)
                            return [2 /*return*/];
                        _a.label = 2;
                    case 2:
                        if (closedViaEscapeKey) {
                            closestWindow = this.getClosestWindow(closedWindow);
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
                        return [2 /*return*/];
                }
            });
        });
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
    NgChat.prototype.setBeforeParteciantChatClosed = function (func) {
        this.beforeParteciantChatClosed = func;
    };
    NgChat.prototype.onDownloadFile = function (params) {
        this.adapter.downloadFile(params.repositoryId, params.fileName);
    };
    NgChat.prototype.onGoToRepo = function (params) {
        this.adapter.goToRepo(params.repositoryId, params.isGroup);
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
    return NgChat;
}());
export { NgChat };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmctY2hhdC5jb21wb25lbnQuanMiLCJzb3VyY2VSb290Ijoibmc6Ly9uZy1jaGF0LyIsInNvdXJjZXMiOlsibmctY2hhdC9uZy1jaGF0LmNvbXBvbmVudC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUEsT0FBTyxFQUFFLFNBQVMsRUFBRSxLQUFLLEVBQVUsWUFBWSxFQUFhLFlBQVksRUFBRSxNQUFNLEVBQUUsWUFBWSxFQUFFLGlCQUFpQixFQUFFLE1BQU0sZUFBZSxDQUFDO0FBQ3pJLE9BQU8sRUFBRSxVQUFVLEVBQUUsTUFBTSxzQkFBc0IsQ0FBQztBQU9sRCxPQUFPLEVBQUUsV0FBVyxFQUFFLE1BQU0sMEJBQTBCLENBQUM7QUFDdkQsT0FBTyxFQUFFLE1BQU0sRUFBRSxNQUFNLGVBQWUsQ0FBQztBQUN2QyxPQUFPLEVBQUUscUJBQXFCLEVBQUUsTUFBTSxxQ0FBcUMsQ0FBQztBQUM1RSxPQUFPLEVBQUUsZUFBZSxFQUFFLE1BQU0sOEJBQThCLENBQUM7QUFHL0QsT0FBTyxFQUFFLHVCQUF1QixFQUFFLE1BQU0sbUNBQW1DLENBQUM7QUFFNUUsT0FBTyxFQUFFLHdCQUF3QixFQUFFLE1BQU0sb0NBQW9DLENBQUM7QUFDOUUsT0FBTyxFQUFFLEtBQUssRUFBRSxNQUFNLG1CQUFtQixDQUFDO0FBRTFDLE9BQU8sRUFBRSxLQUFLLEVBQUUsTUFBTSxjQUFjLENBQUM7QUFDckMsT0FBTyxFQUFFLG1CQUFtQixFQUFFLE1BQU0sbUNBQW1DLENBQUM7QUFHeEUsT0FBTyxFQUFFLEdBQUcsRUFBRSxNQUFNLGdCQUFnQixDQUFDO0FBZ0JyQztJQUNJLGdCQUFvQixXQUF1QjtRQUF2QixnQkFBVyxHQUFYLFdBQVcsQ0FBWTtRQUUzQyxvQ0FBb0M7UUFDN0Isd0JBQW1CLEdBQUcsbUJBQW1CLENBQUM7UUFDMUMsMEJBQXFCLEdBQUcscUJBQXFCLENBQUM7UUFDOUMsZ0JBQVcsR0FBRyxXQUFXLENBQUM7UUFFekIsZ0JBQVcsR0FBWSxLQUFLLENBQUM7UUEr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QUFrRDtpRUFDcUY7SUFHaEo7UUFEQyxLQUFLLEVBQUU7NERBQ3FEO0lBRzdEO1FBREMsS0FBSyxFQUFFO21EQUM0QjtJQUdwQztRQURDLEtBQUssRUFBRTtnREFDMEI7SUFHbEM7UUFEQyxLQUFLLEVBQUU7bURBQ2dDO0lBR3hDO1FBREMsS0FBSyxFQUFFO3dFQUNvRDtJQUc1RDtRQURDLEtBQUssRUFBRTtpREFDcUI7SUFHN0I7UUFEQyxLQUFLLEVBQUU7eUNBQzBCO0lBR2xDO1FBREMsS0FBSyxFQUFFOytDQUNtQjtJQUczQjtRQURDLEtBQUssRUFBRTt5REFDdUM7SUFHL0M7UUFEQyxLQUFLLEVBQUU7bURBQytCO0lBR3ZDO1FBREMsS0FBSyxFQUFFOzZEQUMwQztJQUtsRDtRQURDLE1BQU0sRUFBRTt3REFDMEY7SUFHbkc7UUFEQyxNQUFNLEVBQUU7MkRBQzZGO0lBR3RHO1FBREMsTUFBTSxFQUFFOzJEQUM2RjtJQUd0RztRQURDLE1BQU0sRUFBRTtrREFDc0U7SUFHL0U7UUFEQyxNQUFNLEVBQUU7dURBQ21LO0lBaURoSjtRQUEzQixZQUFZLENBQUMsWUFBWSxDQUFDOytDQUErQztJQU8xRTtRQURDLFlBQVksQ0FBQyxlQUFlLEVBQUUsQ0FBQyxRQUFRLENBQUMsQ0FBQzswQ0FLekM7SUFsTVEsTUFBTTtRQWJsQixTQUFTLENBQUM7WUFDUCxRQUFRLEVBQUUsU0FBUztZQUNuQiw2eUVBQXFDO1lBUXJDLGFBQWEsRUFBRSxpQkFBaUIsQ0FBQyxJQUFJOztTQUN4QyxDQUFDO09BRVcsTUFBTSxDQXF4QmxCO0lBQUQsYUFBQztDQUFBLEFBcnhCRCxJQXF4QkM7U0FyeEJZLE1BQU0iLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBDb21wb25lbnQsIElucHV0LCBPbkluaXQsIFZpZXdDaGlsZHJlbiwgUXVlcnlMaXN0LCBIb3N0TGlzdGVuZXIsIE91dHB1dCwgRXZlbnRFbWl0dGVyLCBWaWV3RW5jYXBzdWxhdGlvbiB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHsgSHR0cENsaWVudCB9IGZyb20gJ0Bhbmd1bGFyL2NvbW1vbi9odHRwJztcblxuaW1wb3J0IHsgQ2hhdEFkYXB0ZXIgfSBmcm9tICcuL2NvcmUvY2hhdC1hZGFwdGVyJztcbmltcG9ydCB7IElDaGF0R3JvdXBBZGFwdGVyIH0gZnJvbSAnLi9jb3JlL2NoYXQtZ3JvdXAtYWRhcHRlcic7XG5pbXBvcnQgeyBVc2VyIH0gZnJvbSBcIi4vY29yZS91c2VyXCI7XG5pbXBvcnQgeyBQYXJ0aWNpcGFudFJlc3BvbnNlIH0gZnJvbSBcIi4vY29yZS9wYXJ0aWNpcGFudC1yZXNwb25zZVwiO1xuaW1wb3J0IHsgTWVzc2FnZSB9IGZyb20gXCIuL2NvcmUvbWVzc2FnZVwiO1xuaW1wb3J0IHsgTWVzc2FnZVR5cGUgfSBmcm9tIFwiLi9jb3JlL21lc3NhZ2UtdHlwZS5lbnVtXCI7XG5pbXBvcnQgeyBXaW5kb3cgfSBmcm9tIFwiLi9jb3JlL3dpbmRvd1wiO1xuaW1wb3J0IHsgQ2hhdFBhcnRpY2lwYW50U3RhdHVzIH0gZnJvbSBcIi4vY29yZS9jaGF0LXBhcnRpY2lwYW50LXN0YXR1cy5lbnVtXCI7XG5pbXBvcnQgeyBTY3JvbGxEaXJlY3Rpb24gfSBmcm9tIFwiLi9jb3JlL3Njcm9sbC1kaXJlY3Rpb24uZW51bVwiO1xuaW1wb3J0IHsgTG9jYWxpemF0aW9uLCBTdGF0dXNEZXNjcmlwdGlvbiB9IGZyb20gJy4vY29yZS9sb2NhbGl6YXRpb24nO1xuaW1wb3J0IHsgSUNoYXRDb250cm9sbGVyIH0gZnJvbSAnLi9jb3JlL2NoYXQtY29udHJvbGxlcic7XG5pbXBvcnQgeyBQYWdlZEhpc3RvcnlDaGF0QWRhcHRlciB9IGZyb20gJy4vY29yZS9wYWdlZC1oaXN0b3J5LWNoYXQtYWRhcHRlcic7XG5pbXBvcnQgeyBJRmlsZVVwbG9hZEFkYXB0ZXIgfSBmcm9tICcuL2NvcmUvZmlsZS11cGxvYWQtYWRhcHRlcic7XG5pbXBvcnQgeyBEZWZhdWx0RmlsZVVwbG9hZEFkYXB0ZXIgfSBmcm9tICcuL2NvcmUvZGVmYXVsdC1maWxlLXVwbG9hZC1hZGFwdGVyJztcbmltcG9ydCB7IFRoZW1lIH0gZnJvbSAnLi9jb3JlL3RoZW1lLmVudW0nO1xuaW1wb3J0IHsgSUNoYXRPcHRpb24gfSBmcm9tICcuL2NvcmUvY2hhdC1vcHRpb24nO1xuaW1wb3J0IHsgR3JvdXAgfSBmcm9tIFwiLi9jb3JlL2dyb3VwXCI7XG5pbXBvcnQgeyBDaGF0UGFydGljaXBhbnRUeXBlIH0gZnJvbSBcIi4vY29yZS9jaGF0LXBhcnRpY2lwYW50LXR5cGUuZW51bVwiO1xuaW1wb3J0IHsgSUNoYXRQYXJ0aWNpcGFudCB9IGZyb20gXCIuL2NvcmUvY2hhdC1wYXJ0aWNpcGFudFwiO1xuXG5pbXBvcnQgeyBtYXAgfSBmcm9tICdyeGpzL29wZXJhdG9ycyc7XG5pbXBvcnQgeyBOZ0NoYXRXaW5kb3dDb21wb25lbnQgfSBmcm9tICcuL2NvbXBvbmVudHMvbmctY2hhdC13aW5kb3cvbmctY2hhdC13aW5kb3cuY29tcG9uZW50JztcblxuQENvbXBvbmVudCh7XG4gICAgc2VsZWN0b3I6ICduZy1jaGF0JyxcbiAgICB0ZW1wbGF0ZVVybDogJ25nLWNoYXQuY29tcG9uZW50Lmh0bWwnLFxuICAgIHN0eWxlVXJsczogW1xuICAgICAgICAnYXNzZXRzL2ljb25zLmNzcycsXG4gICAgICAgICdhc3NldHMvbG9hZGluZy1zcGlubmVyLmNzcycsXG4gICAgICAgICdhc3NldHMvbmctY2hhdC5jb21wb25lbnQuZGVmYXVsdC5jc3MnLFxuICAgICAgICAnYXNzZXRzL3RoZW1lcy9uZy1jaGF0LnRoZW1lLmRlZmF1bHQuc2NzcycsXG4gICAgICAgICdhc3NldHMvdGhlbWVzL25nLWNoYXQudGhlbWUuZGFyay5zY3NzJ1xuICAgIF0sXG4gICAgZW5jYXBzdWxhdGlvbjogVmlld0VuY2Fwc3VsYXRpb24uTm9uZVxufSlcblxuZXhwb3J0IGNsYXNzIE5nQ2hhdCBpbXBsZW1lbnRzIE9uSW5pdCwgSUNoYXRDb250cm9sbGVyIHtcbiAgICBjb25zdHJ1Y3Rvcihwcml2YXRlIF9odHRwQ2xpZW50OiBIdHRwQ2xpZW50KSB7IH1cblxuICAgIC8vIEV4cG9zZXMgZW51bXMgZm9yIHRoZSBuZy10ZW1wbGF0ZVxuICAgIHB1YmxpYyBDaGF0UGFydGljaXBhbnRUeXBlID0gQ2hhdFBhcnRpY2lwYW50VHlwZTtcbiAgICBwdWJsaWMgQ2hhdFBhcnRpY2lwYW50U3RhdHVzID0gQ2hhdFBhcnRpY2lwYW50U3RhdHVzO1xuICAgIHB1YmxpYyBNZXNzYWdlVHlwZSA9IE1lc3NhZ2VUeXBlO1xuXG4gICAgcHJpdmF0ZSBfaXNEaXNhYmxlZDogYm9vbGVhbiA9IGZhbHNlO1xuXG4gICAgZ2V0IGlzRGlzYWJsZWQoKTogYm9vbGVhbiB7XG4gICAgICAgIHJldHVybiB0aGlzLl9pc0Rpc2FibGVkO1xuICAgIH1cblxuICAgIEBJbnB1dCgpXG4gICAgc2V0IGlzRGlzYWJsZWQodmFsdWU6IGJvb2xlYW4pIHtcbiAgICAgICAgdGhpcy5faXNEaXNhYmxlZCA9IHZhbHVlO1xuXG4gICAgICAgIGlmICh2YWx1ZSlcbiAgICAgICAge1xuICAgICAgICAgICAgLy8gVG8gYWRkcmVzcyBpc3N1ZSBodHRwczovL2dpdGh1Yi5jb20vcnBhc2Nob2FsL25nLWNoYXQvaXNzdWVzLzEyMFxuICAgICAgICAgICAgd2luZG93LmNsZWFySW50ZXJ2YWwodGhpcy5wb2xsaW5nSW50ZXJ2YWxXaW5kb3dJbnN0YW5jZSlcbiAgICAgICAgfVxuICAgICAgICBlbHNlXG4gICAgICAgIHtcbiAgICAgICAgICAgIHRoaXMuYWN0aXZhdGVGcmllbmRMaXN0RmV0Y2goKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIEBJbnB1dCgpXG4gICAgcHVibGljIGFkYXB0ZXI6IENoYXRBZGFwdGVyO1xuXG4gICAgQElucHV0KClcbiAgICBwdWJsaWMgZ3JvdXBBZGFwdGVyOiBJQ2hhdEdyb3VwQWRhcHRlcjtcblxuICAgIEBJbnB1dCgpXG4gICAgcHVibGljIHVzZXJJZDogYW55O1xuXG4gICAgQElucHV0KClcbiAgICBwdWJsaWMgaXNDb2xsYXBzZWQ6IGJvb2xlYW4gPSBmYWxzZTtcblxuICAgIEBJbnB1dCgpXG4gICAgcHVibGljIG1heGltaXplV2luZG93T25OZXdNZXNzYWdlOiBib29sZWFuID0gdHJ1ZTtcblxuICAgIEBJbnB1dCgpXG4gICAgcHVibGljIHBvbGxGcmllbmRzTGlzdDogYm9vbGVhbiA9IGZhbHNlO1xuXG4gICAgQElucHV0KClcbiAgICBwdWJsaWMgcG9sbGluZ0ludGVydmFsOiBudW1iZXIgPSA1MDAwO1xuXG4gICAgQElucHV0KClcbiAgICBwdWJsaWMgaGlzdG9yeUVuYWJsZWQ6IGJvb2xlYW4gPSB0cnVlO1xuXG4gICAgQElucHV0KClcbiAgICBwdWJsaWMgZW1vamlzRW5hYmxlZDogYm9vbGVhbiA9IHRydWU7XG5cbiAgICBASW5wdXQoKVxuICAgIHB1YmxpYyBsaW5rZnlFbmFibGVkOiBib29sZWFuID0gdHJ1ZTtcblxuICAgIEBJbnB1dCgpXG4gICAgcHVibGljIGF1ZGlvRW5hYmxlZDogYm9vbGVhbiA9IHRydWU7XG5cbiAgICBASW5wdXQoKVxuICAgIHB1YmxpYyBzZWFyY2hFbmFibGVkOiBib29sZWFuID0gdHJ1ZTtcblxuICAgIEBJbnB1dCgpIC8vIFRPRE86IFRoaXMgbWlnaHQgbmVlZCBhIGJldHRlciBjb250ZW50IHN0cmF0ZWd5XG4gICAgcHVibGljIGF1ZGlvU291cmNlOiBzdHJpbmcgPSAnaHR0cHM6Ly9yYXcuZ2l0aHVidXNlcmNvbnRlbnQuY29tL3JwYXNjaG9hbC9uZy1jaGF0L21hc3Rlci9zcmMvbmctY2hhdC9hc3NldHMvbm90aWZpY2F0aW9uLndhdic7XG5cbiAgICBASW5wdXQoKVxuICAgIHB1YmxpYyBwZXJzaXN0V2luZG93c1N0YXRlOiBib29sZWFuID0gdHJ1ZTtcblxuICAgIEBJbnB1dCgpXG4gICAgcHVibGljIHRpdGxlOiBzdHJpbmcgPSBcIkZyaWVuZHNcIjtcblxuICAgIEBJbnB1dCgpXG4gICAgcHVibGljIG1lc3NhZ2VQbGFjZWhvbGRlcjogc3RyaW5nID0gXCJUeXBlIGEgbWVzc2FnZVwiO1xuXG4gICAgQElucHV0KClcbiAgICBwdWJsaWMgc2VhcmNoUGxhY2Vob2xkZXI6IHN0cmluZyA9IFwiU2VhcmNoXCI7XG5cbiAgICBASW5wdXQoKVxuICAgIHB1YmxpYyBicm93c2VyTm90aWZpY2F0aW9uc0VuYWJsZWQ6IGJvb2xlYW4gPSB0cnVlO1xuXG4gICAgQElucHV0KCkgLy8gVE9ETzogVGhpcyBtaWdodCBuZWVkIGEgYmV0dGVyIGNvbnRlbnQgc3RyYXRlZ3lcbiAgICBwdWJsaWMgYnJvd3Nlck5vdGlmaWNhdGlvbkljb25Tb3VyY2U6IHN0cmluZyA9ICdodHRwczovL3Jhdy5naXRodWJ1c2VyY29udGVudC5jb20vcnBhc2Nob2FsL25nLWNoYXQvbWFzdGVyL3NyYy9uZy1jaGF0L2Fzc2V0cy9ub3RpZmljYXRpb24ucG5nJztcblxuICAgIEBJbnB1dCgpXG4gICAgcHVibGljIGJyb3dzZXJOb3RpZmljYXRpb25UaXRsZTogc3RyaW5nID0gXCJOZXcgbWVzc2FnZSBmcm9tXCI7XG5cbiAgICBASW5wdXQoKVxuICAgIHB1YmxpYyBoaXN0b3J5UGFnZVNpemU6IG51bWJlciA9IDEwO1xuXG4gICAgQElucHV0KClcbiAgICBwdWJsaWMgbG9jYWxpemF0aW9uOiBMb2NhbGl6YXRpb247XG5cbiAgICBASW5wdXQoKVxuICAgIHB1YmxpYyBoaWRlRnJpZW5kc0xpc3Q6IGJvb2xlYW4gPSBmYWxzZTtcblxuICAgIEBJbnB1dCgpXG4gICAgcHVibGljIGhpZGVGcmllbmRzTGlzdE9uVW5zdXBwb3J0ZWRWaWV3cG9ydDogYm9vbGVhbiA9IHRydWU7XG5cbiAgICBASW5wdXQoKVxuICAgIHB1YmxpYyBmaWxlVXBsb2FkVXJsOiBzdHJpbmc7XG5cbiAgICBASW5wdXQoKVxuICAgIHB1YmxpYyB0aGVtZTogVGhlbWUgPSBUaGVtZS5MaWdodDtcblxuICAgIEBJbnB1dCgpXG4gICAgcHVibGljIGN1c3RvbVRoZW1lOiBzdHJpbmc7XG5cbiAgICBASW5wdXQoKVxuICAgIHB1YmxpYyBtZXNzYWdlRGF0ZVBpcGVGb3JtYXQ6IHN0cmluZyA9IFwic2hvcnRcIjtcblxuICAgIEBJbnB1dCgpXG4gICAgcHVibGljIHNob3dNZXNzYWdlRGF0ZTogYm9vbGVhbiA9IHRydWU7XG5cbiAgICBASW5wdXQoKVxuICAgIHB1YmxpYyBpc1ZpZXdwb3J0T25Nb2JpbGVFbmFibGVkOiBib29sZWFuID0gZmFsc2U7XG5cbiAgICBwdWJsaWMgYmVmb3JlUGFydGVjaWFudENoYXRDbG9zZWQ6IChhcmcwOiBJQ2hhdFBhcnRpY2lwYW50KSA9PiBib29sZWFuO1xuXG4gICAgQE91dHB1dCgpXG4gICAgcHVibGljIG9uUGFydGljaXBhbnRDbGlja2VkOiBFdmVudEVtaXR0ZXI8SUNoYXRQYXJ0aWNpcGFudD4gPSBuZXcgRXZlbnRFbWl0dGVyPElDaGF0UGFydGljaXBhbnQ+KCk7XG5cbiAgICBAT3V0cHV0KClcbiAgICBwdWJsaWMgb25QYXJ0aWNpcGFudENoYXRPcGVuZWQ6IEV2ZW50RW1pdHRlcjxJQ2hhdFBhcnRpY2lwYW50PiA9IG5ldyBFdmVudEVtaXR0ZXI8SUNoYXRQYXJ0aWNpcGFudD4oKTtcblxuICAgIEBPdXRwdXQoKVxuICAgIHB1YmxpYyBvblBhcnRpY2lwYW50Q2hhdENsb3NlZDogRXZlbnRFbWl0dGVyPElDaGF0UGFydGljaXBhbnQ+ID0gbmV3IEV2ZW50RW1pdHRlcjxJQ2hhdFBhcnRpY2lwYW50PigpO1xuXG4gICAgQE91dHB1dCgpXG4gICAgcHVibGljIG9uTWVzc2FnZXNTZWVuOiBFdmVudEVtaXR0ZXI8TWVzc2FnZVtdPiA9IG5ldyBFdmVudEVtaXR0ZXI8TWVzc2FnZVtdPigpO1xuXG4gICAgQE91dHB1dCgpXG4gICAgcHVibGljIG9uUGFydGljaXBhbnRUb2dnbGU6IEV2ZW50RW1pdHRlcjx7cGFydGljaXBhbnQ6IElDaGF0UGFydGljaXBhbnQsIGlzQ29sbGFwc2VkOiBib29sZWFufT4gPSBuZXcgRXZlbnRFbWl0dGVyPHtwYXJ0aWNpcGFudDogSUNoYXRQYXJ0aWNpcGFudCwgaXNDb2xsYXBzZWQ6IGJvb2xlYW59PigpO1xuXG4gICAgcHJpdmF0ZSBicm93c2VyTm90aWZpY2F0aW9uc0Jvb3RzdHJhcHBlZDogYm9vbGVhbiA9IGZhbHNlO1xuXG4gICAgcHVibGljIGhhc1BhZ2VkSGlzdG9yeTogYm9vbGVhbiA9IGZhbHNlO1xuXG4gICAgLy8gRG9uJ3Qgd2FudCB0byBhZGQgdGhpcyBhcyBhIHNldHRpbmcgdG8gc2ltcGxpZnkgdXNhZ2UuIFByZXZpb3VzIHBsYWNlaG9sZGVyIGFuZCB0aXRsZSBzZXR0aW5ncyBhdmFpbGFibGUgdG8gYmUgdXNlZCwgb3IgdXNlIGZ1bGwgTG9jYWxpemF0aW9uIG9iamVjdC5cbiAgICBwcml2YXRlIHN0YXR1c0Rlc2NyaXB0aW9uOiBTdGF0dXNEZXNjcmlwdGlvbiA9IHtcbiAgICAgICAgb25saW5lOiAnT25saW5lJyxcbiAgICAgICAgYnVzeTogJ0J1c3knLFxuICAgICAgICBhd2F5OiAnQXdheScsXG4gICAgICAgIG9mZmxpbmU6ICdPZmZsaW5lJ1xuICAgIH07XG5cbiAgICBwcml2YXRlIGF1ZGlvRmlsZTogSFRNTEF1ZGlvRWxlbWVudDtcblxuICAgIHB1YmxpYyBwYXJ0aWNpcGFudHM6IElDaGF0UGFydGljaXBhbnRbXTtcblxuICAgIHB1YmxpYyBwYXJ0aWNpcGFudHNSZXNwb25zZTogUGFydGljaXBhbnRSZXNwb25zZVtdO1xuXG4gICAgcHVibGljIHBhcnRpY2lwYW50c0ludGVyYWN0ZWRXaXRoOiBJQ2hhdFBhcnRpY2lwYW50W10gPSBbXTtcblxuICAgIHB1YmxpYyBjdXJyZW50QWN0aXZlT3B0aW9uOiBJQ2hhdE9wdGlvbiB8IG51bGw7XG5cbiAgICBwcml2YXRlIHBvbGxpbmdJbnRlcnZhbFdpbmRvd0luc3RhbmNlOiBudW1iZXI7XG5cbiAgICBwcml2YXRlIGdldCBsb2NhbFN0b3JhZ2VLZXkoKTogc3RyaW5nXG4gICAge1xuICAgICAgICByZXR1cm4gYG5nLWNoYXQtdXNlcnMtJHt0aGlzLnVzZXJJZH1gOyAvLyBBcHBlbmRpbmcgdGhlIHVzZXIgaWQgc28gdGhlIHN0YXRlIGlzIHVuaXF1ZSBwZXIgdXNlciBpbiBhIGNvbXB1dGVyLlxuICAgIH07XG5cbiAgICAvLyBEZWZpbmVzIHRoZSBzaXplIG9mIGVhY2ggb3BlbmVkIHdpbmRvdyB0byBjYWxjdWxhdGUgaG93IG1hbnkgd2luZG93cyBjYW4gYmUgb3BlbmVkIG9uIHRoZSB2aWV3cG9ydCBhdCB0aGUgc2FtZSB0aW1lLlxuICAgIHB1YmxpYyB3aW5kb3dTaXplRmFjdG9yOiBudW1iZXIgPSAzMjA7XG5cbiAgICAvLyBUb3RhbCB3aWR0aCBzaXplIG9mIHRoZSBmcmllbmRzIGxpc3Qgc2VjdGlvblxuICAgIHB1YmxpYyBmcmllbmRzTGlzdFdpZHRoOiBudW1iZXIgPSAyNjI7XG5cbiAgICAvLyBBdmFpbGFibGUgYXJlYSB0byByZW5kZXIgdGhlIHBsdWdpblxuICAgIHByaXZhdGUgdmlld1BvcnRUb3RhbEFyZWE6IG51bWJlcjtcblxuICAgIC8vIFNldCB0byB0cnVlIGlmIHRoZXJlIGlzIG5vIHNwYWNlIHRvIGRpc3BsYXkgYXQgbGVhc3Qgb25lIGNoYXQgd2luZG93IGFuZCAnaGlkZUZyaWVuZHNMaXN0T25VbnN1cHBvcnRlZFZpZXdwb3J0JyBpcyB0cnVlXG4gICAgcHVibGljIHVuc3VwcG9ydGVkVmlld3BvcnQ6IGJvb2xlYW4gPSBmYWxzZTtcblxuICAgIC8vIEZpbGUgdXBsb2FkIGFkYXB0ZXJcbiAgICBwdWJsaWMgZmlsZVVwbG9hZEFkYXB0ZXI6IElGaWxlVXBsb2FkQWRhcHRlcjtcblxuICAgIHdpbmRvd3M6IFdpbmRvd1tdID0gW107XG4gICAgaXNCb290c3RyYXBwZWQ6IGJvb2xlYW4gPSBmYWxzZTtcblxuICAgIEBWaWV3Q2hpbGRyZW4oJ2NoYXRXaW5kb3cnKSBjaGF0V2luZG93czogUXVlcnlMaXN0PE5nQ2hhdFdpbmRvd0NvbXBvbmVudD47XG5cbiAgICBuZ09uSW5pdCgpIHtcbiAgICAgICAgdGhpcy5ib290c3RyYXBDaGF0KCk7XG4gICAgfVxuXG4gICAgQEhvc3RMaXN0ZW5lcignd2luZG93OnJlc2l6ZScsIFsnJGV2ZW50J10pXG4gICAgb25SZXNpemUoZXZlbnQ6IGFueSl7XG4gICAgICAgdGhpcy52aWV3UG9ydFRvdGFsQXJlYSA9IGV2ZW50LnRhcmdldC5pbm5lcldpZHRoO1xuXG4gICAgICAgdGhpcy5Ob3JtYWxpemVXaW5kb3dzKCk7XG4gICAgfVxuXG4gICAgLy8gQ2hlY2tzIGlmIHRoZXJlIGFyZSBtb3JlIG9wZW5lZCB3aW5kb3dzIHRoYW4gdGhlIHZpZXcgcG9ydCBjYW4gZGlzcGxheVxuICAgIHByaXZhdGUgTm9ybWFsaXplV2luZG93cygpOiB2b2lkXG4gICAge1xuICAgICAgICBjb25zdCBtYXhTdXBwb3J0ZWRPcGVuZWRXaW5kb3dzID0gTWF0aC5mbG9vcigodGhpcy52aWV3UG9ydFRvdGFsQXJlYSAtICghdGhpcy5oaWRlRnJpZW5kc0xpc3QgPyB0aGlzLmZyaWVuZHNMaXN0V2lkdGggOiAwKSkgLyB0aGlzLndpbmRvd1NpemVGYWN0b3IpO1xuICAgICAgICBjb25zdCBkaWZmZXJlbmNlID0gdGhpcy53aW5kb3dzLmxlbmd0aCAtIG1heFN1cHBvcnRlZE9wZW5lZFdpbmRvd3M7XG5cbiAgICAgICAgaWYgKGRpZmZlcmVuY2UgPj0gMClcbiAgICAgICAge1xuICAgICAgICAgICAgdGhpcy53aW5kb3dzLnNwbGljZSh0aGlzLndpbmRvd3MubGVuZ3RoIC0gZGlmZmVyZW5jZSk7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLnVwZGF0ZVdpbmRvd3NTdGF0ZSh0aGlzLndpbmRvd3MpO1xuXG4gICAgICAgIC8vIFZpZXdwb3J0IHNob3VsZCBoYXZlIHNwYWNlIGZvciBhdCBsZWFzdCBvbmUgY2hhdCB3aW5kb3cgYnV0IHNob3VsZCBzaG93IGluIG1vYmlsZSBpZiBvcHRpb24gaXMgZW5hYmxlZC5cbiAgICAgICAgdGhpcy51bnN1cHBvcnRlZFZpZXdwb3J0ID0gdGhpcy5pc1ZpZXdwb3J0T25Nb2JpbGVFbmFibGVkPyBmYWxzZSA6IHRoaXMuaGlkZUZyaWVuZHNMaXN0T25VbnN1cHBvcnRlZFZpZXdwb3J0ICYmIG1heFN1cHBvcnRlZE9wZW5lZFdpbmRvd3MgPCAxO1xuICAgIH1cblxuICAgIC8vIEluaXRpYWxpemVzIHRoZSBjaGF0IHBsdWdpbiBhbmQgdGhlIG1lc3NhZ2luZyBhZGFwdGVyXG4gICAgcHJpdmF0ZSBib290c3RyYXBDaGF0KCk6IHZvaWRcbiAgICB7XG4gICAgICAgIGxldCBpbml0aWFsaXphdGlvbkV4Y2VwdGlvbiA9IG51bGw7XG5cbiAgICAgICAgaWYgKHRoaXMuYWRhcHRlciAhPSBudWxsICYmIHRoaXMudXNlcklkICE9IG51bGwpXG4gICAgICAgIHtcbiAgICAgICAgICAgIHRyeVxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIHRoaXMudmlld1BvcnRUb3RhbEFyZWEgPSB3aW5kb3cuaW5uZXJXaWR0aDtcblxuICAgICAgICAgICAgICAgIHRoaXMuaW5pdGlhbGl6ZVRoZW1lKCk7XG4gICAgICAgICAgICAgICAgdGhpcy5pbml0aWFsaXplRGVmYXVsdFRleHQoKTtcbiAgICAgICAgICAgICAgICB0aGlzLmluaXRpYWxpemVCcm93c2VyTm90aWZpY2F0aW9ucygpO1xuXG4gICAgICAgICAgICAgICAgLy8gQmluZGluZyBldmVudCBsaXN0ZW5lcnNcbiAgICAgICAgICAgICAgICB0aGlzLmFkYXB0ZXIubWVzc2FnZVJlY2VpdmVkSGFuZGxlciA9IChwYXJ0aWNpcGFudCwgbXNnKSA9PiB0aGlzLm9uTWVzc2FnZVJlY2VpdmVkKHBhcnRpY2lwYW50LCBtc2cpO1xuICAgICAgICAgICAgICAgIHRoaXMuYWRhcHRlci5mcmllbmRzTGlzdENoYW5nZWRIYW5kbGVyID0gKHBhcnRpY2lwYW50c1Jlc3BvbnNlKSA9PiB0aGlzLm9uRnJpZW5kc0xpc3RDaGFuZ2VkKHBhcnRpY2lwYW50c1Jlc3BvbnNlKTtcblxuICAgICAgICAgICAgICAgIHRoaXMuYWN0aXZhdGVGcmllbmRMaXN0RmV0Y2goKTtcblxuICAgICAgICAgICAgICAgIHRoaXMuYnVmZmVyQXVkaW9GaWxlKCk7XG5cbiAgICAgICAgICAgICAgICB0aGlzLmhhc1BhZ2VkSGlzdG9yeSA9IHRoaXMuYWRhcHRlciBpbnN0YW5jZW9mIFBhZ2VkSGlzdG9yeUNoYXRBZGFwdGVyO1xuXG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuZmlsZVVwbG9hZFVybCAmJiB0aGlzLmZpbGVVcGxvYWRVcmwgIT09IFwiXCIpXG4gICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmZpbGVVcGxvYWRBZGFwdGVyID0gbmV3IERlZmF1bHRGaWxlVXBsb2FkQWRhcHRlcih0aGlzLmZpbGVVcGxvYWRVcmwsIHRoaXMuX2h0dHBDbGllbnQpO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIHRoaXMuTm9ybWFsaXplV2luZG93cygpO1xuXG4gICAgICAgICAgICAgICAgdGhpcy5pc0Jvb3RzdHJhcHBlZCA9IHRydWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjYXRjaChleClcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBpbml0aWFsaXphdGlvbkV4Y2VwdGlvbiA9IGV4O1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgaWYgKCF0aGlzLmlzQm9vdHN0cmFwcGVkKXtcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoXCJuZy1jaGF0IGNvbXBvbmVudCBjb3VsZG4ndCBiZSBib290c3RyYXBwZWQuXCIpO1xuXG4gICAgICAgICAgICBpZiAodGhpcy51c2VySWQgPT0gbnVsbCl7XG4gICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcihcIm5nLWNoYXQgY2FuJ3QgYmUgaW5pdGlhbGl6ZWQgd2l0aG91dCBhbiB1c2VyIGlkLiBQbGVhc2UgbWFrZSBzdXJlIHlvdSd2ZSBwcm92aWRlZCBhbiB1c2VySWQgYXMgYSBwYXJhbWV0ZXIgb2YgdGhlIG5nLWNoYXQgY29tcG9uZW50LlwiKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICh0aGlzLmFkYXB0ZXIgPT0gbnVsbCl7XG4gICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcihcIm5nLWNoYXQgY2FuJ3QgYmUgYm9vdHN0cmFwcGVkIHdpdGhvdXQgYSBDaGF0QWRhcHRlci4gUGxlYXNlIG1ha2Ugc3VyZSB5b3UndmUgcHJvdmlkZWQgYSBDaGF0QWRhcHRlciBpbXBsZW1lbnRhdGlvbiBhcyBhIHBhcmFtZXRlciBvZiB0aGUgbmctY2hhdCBjb21wb25lbnQuXCIpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKGluaXRpYWxpemF0aW9uRXhjZXB0aW9uKVxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoYEFuIGV4Y2VwdGlvbiBoYXMgb2NjdXJyZWQgd2hpbGUgaW5pdGlhbGl6aW5nIG5nLWNoYXQuIERldGFpbHM6ICR7aW5pdGlhbGl6YXRpb25FeGNlcHRpb24ubWVzc2FnZX1gKTtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKGluaXRpYWxpemF0aW9uRXhjZXB0aW9uKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIHByaXZhdGUgYWN0aXZhdGVGcmllbmRMaXN0RmV0Y2goKTogdm9pZCB7XG4gICAgICAgIGlmICh0aGlzLmFkYXB0ZXIpXG4gICAgICAgIHtcbiAgICAgICAgICAgIC8vIExvYWRpbmcgY3VycmVudCB1c2VycyBsaXN0XG4gICAgICAgICAgICBpZiAodGhpcy5wb2xsRnJpZW5kc0xpc3Qpe1xuICAgICAgICAgICAgICAgIC8vIFNldHRpbmcgYSBsb25nIHBvbGwgaW50ZXJ2YWwgdG8gdXBkYXRlIHRoZSBmcmllbmRzIGxpc3RcbiAgICAgICAgICAgICAgICB0aGlzLmZldGNoRnJpZW5kc0xpc3QodHJ1ZSk7XG4gICAgICAgICAgICAgICAgdGhpcy5wb2xsaW5nSW50ZXJ2YWxXaW5kb3dJbnN0YW5jZSA9IHdpbmRvdy5zZXRJbnRlcnZhbCgoKSA9PiB0aGlzLmZldGNoRnJpZW5kc0xpc3QoZmFsc2UpLCB0aGlzLnBvbGxpbmdJbnRlcnZhbCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgLy8gU2luY2UgcG9sbGluZyB3YXMgZGlzYWJsZWQsIGEgZnJpZW5kcyBsaXN0IHVwZGF0ZSBtZWNoYW5pc20gd2lsbCBoYXZlIHRvIGJlIGltcGxlbWVudGVkIGluIHRoZSBDaGF0QWRhcHRlci5cbiAgICAgICAgICAgICAgICB0aGlzLmZldGNoRnJpZW5kc0xpc3QodHJ1ZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBJbml0aWFsaXplcyBicm93c2VyIG5vdGlmaWNhdGlvbnNcbiAgICBwcml2YXRlIGFzeW5jIGluaXRpYWxpemVCcm93c2VyTm90aWZpY2F0aW9ucygpXG4gICAge1xuICAgICAgICBpZiAodGhpcy5icm93c2VyTm90aWZpY2F0aW9uc0VuYWJsZWQgJiYgKFwiTm90aWZpY2F0aW9uXCIgaW4gd2luZG93KSlcbiAgICAgICAge1xuICAgICAgICAgICAgaWYgKGF3YWl0IE5vdGlmaWNhdGlvbi5yZXF1ZXN0UGVybWlzc2lvbigpID09PSBcImdyYW50ZWRcIilcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICB0aGlzLmJyb3dzZXJOb3RpZmljYXRpb25zQm9vdHN0cmFwcGVkID0gdHJ1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8vIEluaXRpYWxpemVzIGRlZmF1bHQgdGV4dFxuICAgIHByaXZhdGUgaW5pdGlhbGl6ZURlZmF1bHRUZXh0KCkgOiB2b2lkXG4gICAge1xuICAgICAgICBpZiAoIXRoaXMubG9jYWxpemF0aW9uKVxuICAgICAgICB7XG4gICAgICAgICAgICB0aGlzLmxvY2FsaXphdGlvbiA9IHtcbiAgICAgICAgICAgICAgICBtZXNzYWdlUGxhY2Vob2xkZXI6IHRoaXMubWVzc2FnZVBsYWNlaG9sZGVyLFxuICAgICAgICAgICAgICAgIHNlYXJjaFBsYWNlaG9sZGVyOiB0aGlzLnNlYXJjaFBsYWNlaG9sZGVyLFxuICAgICAgICAgICAgICAgIHRpdGxlOiB0aGlzLnRpdGxlLFxuICAgICAgICAgICAgICAgIHN0YXR1c0Rlc2NyaXB0aW9uOiB0aGlzLnN0YXR1c0Rlc2NyaXB0aW9uLFxuICAgICAgICAgICAgICAgIGJyb3dzZXJOb3RpZmljYXRpb25UaXRsZTogdGhpcy5icm93c2VyTm90aWZpY2F0aW9uVGl0bGUsXG4gICAgICAgICAgICAgICAgbG9hZE1lc3NhZ2VIaXN0b3J5UGxhY2Vob2xkZXI6IFwiTG9hZCBvbGRlciBtZXNzYWdlc1wiXG4gICAgICAgICAgICB9O1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBpbml0aWFsaXplVGhlbWUoKTogdm9pZFxuICAgIHtcbiAgICAgICAgaWYgKHRoaXMuY3VzdG9tVGhlbWUpXG4gICAgICAgIHtcbiAgICAgICAgICAgIHRoaXMudGhlbWUgPSBUaGVtZS5DdXN0b207XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAodGhpcy50aGVtZSAhPSBUaGVtZS5MaWdodCAmJiB0aGlzLnRoZW1lICE9IFRoZW1lLkRhcmspXG4gICAgICAgIHtcbiAgICAgICAgICAgIC8vIFRPRE86IFVzZSBlczIwMTcgaW4gZnV0dXJlIHdpdGggT2JqZWN0LnZhbHVlcyhUaGVtZSkuaW5jbHVkZXModGhpcy50aGVtZSkgdG8gZG8gdGhpcyBjaGVja1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBJbnZhbGlkIHRoZW1lIGNvbmZpZ3VyYXRpb24gZm9yIG5nLWNoYXQuIFwiJHt0aGlzLnRoZW1lfVwiIGlzIG5vdCBhIHZhbGlkIHRoZW1lIHZhbHVlLmApO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLy8gU2VuZHMgYSByZXF1ZXN0IHRvIGxvYWQgdGhlIGZyaWVuZHMgbGlzdFxuICAgIHB1YmxpYyBmZXRjaEZyaWVuZHNMaXN0KGlzQm9vdHN0cmFwcGluZzogYm9vbGVhbik6IHZvaWRcbiAgICB7XG4gICAgICAgIHRoaXMuYWRhcHRlci5saXN0RnJpZW5kcygpXG4gICAgICAgIC5waXBlKFxuICAgICAgICAgICAgbWFwKChwYXJ0aWNpcGFudHNSZXNwb25zZTogUGFydGljaXBhbnRSZXNwb25zZVtdKSA9PiB7XG4gICAgICAgICAgICAgICAgdGhpcy5wYXJ0aWNpcGFudHNSZXNwb25zZSA9IHBhcnRpY2lwYW50c1Jlc3BvbnNlO1xuXG4gICAgICAgICAgICAgICAgdGhpcy5wYXJ0aWNpcGFudHMgPSBwYXJ0aWNpcGFudHNSZXNwb25zZS5tYXAoKHJlc3BvbnNlOiBQYXJ0aWNpcGFudFJlc3BvbnNlKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiByZXNwb25zZS5wYXJ0aWNpcGFudDtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0pXG4gICAgICAgICkuc3Vic2NyaWJlKCgpID0+IHtcbiAgICAgICAgICAgIGlmIChpc0Jvb3RzdHJhcHBpbmcpXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgdGhpcy5yZXN0b3JlV2luZG93c1N0YXRlKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIGZldGNoTWVzc2FnZUhpc3Rvcnkod2luZG93OiBXaW5kb3cpIHtcbiAgICAgICAgLy8gTm90IGlkZWFsIGJ1dCB3aWxsIGtlZXAgdGhpcyB1bnRpbCB3ZSBkZWNpZGUgaWYgd2UgYXJlIHNoaXBwaW5nIHBhZ2luYXRpb24gd2l0aCB0aGUgZGVmYXVsdCBhZGFwdGVyXG4gICAgICAgIGlmICh0aGlzLmFkYXB0ZXIgaW5zdGFuY2VvZiBQYWdlZEhpc3RvcnlDaGF0QWRhcHRlcilcbiAgICAgICAge1xuICAgICAgICAgICAgd2luZG93LmlzTG9hZGluZ0hpc3RvcnkgPSB0cnVlO1xuXG4gICAgICAgICAgICB0aGlzLmFkYXB0ZXIuZ2V0TWVzc2FnZUhpc3RvcnlCeVBhZ2Uod2luZG93LnBhcnRpY2lwYW50LmlkLCB0aGlzLmhpc3RvcnlQYWdlU2l6ZSwgKyt3aW5kb3cuaGlzdG9yeVBhZ2UpXG4gICAgICAgICAgICAucGlwZShcbiAgICAgICAgICAgICAgICBtYXAoKHJlc3VsdDogTWVzc2FnZVtdKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIHJlc3VsdC5mb3JFYWNoKChtZXNzYWdlKSA9PiB0aGlzLmFzc2VydE1lc3NhZ2VUeXBlKG1lc3NhZ2UpKTtcblxuICAgICAgICAgICAgICAgICAgICB3aW5kb3cubWVzc2FnZXMgPSByZXN1bHQuY29uY2F0KHdpbmRvdy5tZXNzYWdlcyk7XG4gICAgICAgICAgICAgICAgICAgIHdpbmRvdy5pc0xvYWRpbmdIaXN0b3J5ID0gZmFsc2U7XG5cbiAgICAgICAgICAgICAgICAgICAgY29uc3QgZGlyZWN0aW9uOiBTY3JvbGxEaXJlY3Rpb24gPSAod2luZG93Lmhpc3RvcnlQYWdlID09IDEpID8gU2Nyb2xsRGlyZWN0aW9uLkJvdHRvbSA6IFNjcm9sbERpcmVjdGlvbi5Ub3A7XG4gICAgICAgICAgICAgICAgICAgIHdpbmRvdy5oYXNNb3JlTWVzc2FnZXMgPSByZXN1bHQubGVuZ3RoID09IHRoaXMuaGlzdG9yeVBhZ2VTaXplO1xuXG4gICAgICAgICAgICAgICAgICAgIHNldFRpbWVvdXQoKCkgPT4gdGhpcy5vbkZldGNoTWVzc2FnZUhpc3RvcnlMb2FkZWQocmVzdWx0LCB3aW5kb3csIGRpcmVjdGlvbiwgdHJ1ZSkpO1xuICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICApLnN1YnNjcmliZSgpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2VcbiAgICAgICAge1xuICAgICAgICAgICAgdGhpcy5hZGFwdGVyLmdldE1lc3NhZ2VIaXN0b3J5KHdpbmRvdy5wYXJ0aWNpcGFudC5pZClcbiAgICAgICAgICAgIC5waXBlKFxuICAgICAgICAgICAgICAgIG1hcCgocmVzdWx0OiBNZXNzYWdlW10pID0+IHtcbiAgICAgICAgICAgICAgICAgICAgcmVzdWx0LmZvckVhY2goKG1lc3NhZ2UpID0+IHRoaXMuYXNzZXJ0TWVzc2FnZVR5cGUobWVzc2FnZSkpO1xuXG4gICAgICAgICAgICAgICAgICAgIHdpbmRvdy5tZXNzYWdlcyA9IHJlc3VsdC5jb25jYXQod2luZG93Lm1lc3NhZ2VzKTtcbiAgICAgICAgICAgICAgICAgICAgd2luZG93LmlzTG9hZGluZ0hpc3RvcnkgPSBmYWxzZTtcblxuICAgICAgICAgICAgICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHRoaXMub25GZXRjaE1lc3NhZ2VIaXN0b3J5TG9hZGVkKHJlc3VsdCwgd2luZG93LCBTY3JvbGxEaXJlY3Rpb24uQm90dG9tKSk7XG4gICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICkuc3Vic2NyaWJlKCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwcml2YXRlIG9uRmV0Y2hNZXNzYWdlSGlzdG9yeUxvYWRlZChtZXNzYWdlczogTWVzc2FnZVtdLCB3aW5kb3c6IFdpbmRvdywgZGlyZWN0aW9uOiBTY3JvbGxEaXJlY3Rpb24sIGZvcmNlTWFya01lc3NhZ2VzQXNTZWVuOiBib29sZWFuID0gZmFsc2UpOiB2b2lkXG4gICAge1xuICAgICAgICB0aGlzLnNjcm9sbENoYXRXaW5kb3cod2luZG93LCBkaXJlY3Rpb24pXG5cbiAgICAgICAgaWYgKHdpbmRvdy5oYXNGb2N1cyB8fCBmb3JjZU1hcmtNZXNzYWdlc0FzU2VlbilcbiAgICAgICAge1xuICAgICAgICAgICAgY29uc3QgdW5zZWVuTWVzc2FnZXMgPSBtZXNzYWdlcy5maWx0ZXIobSA9PiAhbS5kYXRlU2Vlbik7XG5cbiAgICAgICAgICAgIHRoaXMubWFya01lc3NhZ2VzQXNSZWFkKHVuc2Vlbk1lc3NhZ2VzKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8vIFVwZGF0ZXMgdGhlIGZyaWVuZHMgbGlzdCB2aWEgdGhlIGV2ZW50IGhhbmRsZXJcbiAgICBwcml2YXRlIG9uRnJpZW5kc0xpc3RDaGFuZ2VkKHBhcnRpY2lwYW50c1Jlc3BvbnNlOiBQYXJ0aWNpcGFudFJlc3BvbnNlW10pOiB2b2lkXG4gICAge1xuICAgICAgICBpZiAocGFydGljaXBhbnRzUmVzcG9uc2UpXG4gICAgICAgIHtcbiAgICAgICAgICAgIHRoaXMucGFydGljaXBhbnRzUmVzcG9uc2UgPSBwYXJ0aWNpcGFudHNSZXNwb25zZTtcblxuICAgICAgICAgICAgdGhpcy5wYXJ0aWNpcGFudHMgPSBwYXJ0aWNpcGFudHNSZXNwb25zZS5tYXAoKHJlc3BvbnNlOiBQYXJ0aWNpcGFudFJlc3BvbnNlKSA9PiB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHJlc3BvbnNlLnBhcnRpY2lwYW50O1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIHRoaXMucGFydGljaXBhbnRzSW50ZXJhY3RlZFdpdGggPSBbXTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8vIEhhbmRsZXMgcmVjZWl2ZWQgbWVzc2FnZXMgYnkgdGhlIGFkYXB0ZXJcbiAgICBwcml2YXRlIG9uTWVzc2FnZVJlY2VpdmVkKHBhcnRpY2lwYW50OiBJQ2hhdFBhcnRpY2lwYW50LCBtZXNzYWdlOiBNZXNzYWdlKVxuICAgIHtcbiAgICAgICAgaWYgKHBhcnRpY2lwYW50ICYmIG1lc3NhZ2UpXG4gICAgICAgIHtcbiAgICAgICAgICAgIGNvbnN0IGNoYXRXaW5kb3cgPSB0aGlzLm9wZW5DaGF0V2luZG93KHBhcnRpY2lwYW50KTtcblxuICAgICAgICAgICAgdGhpcy5hc3NlcnRNZXNzYWdlVHlwZShtZXNzYWdlKTtcblxuICAgICAgICAgICAgaWYgKCFjaGF0V2luZG93WzFdIHx8ICF0aGlzLmhpc3RvcnlFbmFibGVkKXtcbiAgICAgICAgICAgICAgICBjaGF0V2luZG93WzBdLm1lc3NhZ2VzLnB1c2gobWVzc2FnZSk7XG5cbiAgICAgICAgICAgICAgICB0aGlzLnNjcm9sbENoYXRXaW5kb3coY2hhdFdpbmRvd1swXSwgU2Nyb2xsRGlyZWN0aW9uLkJvdHRvbSk7XG5cbiAgICAgICAgICAgICAgICBpZiAoY2hhdFdpbmRvd1swXS5oYXNGb2N1cylcbiAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMubWFya01lc3NhZ2VzQXNSZWFkKFttZXNzYWdlXSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB0aGlzLmVtaXRNZXNzYWdlU291bmQoY2hhdFdpbmRvd1swXSk7XG5cbiAgICAgICAgICAgIC8vIEdpdGh1YiBpc3N1ZSAjNThcbiAgICAgICAgICAgIC8vIERvIG5vdCBwdXNoIGJyb3dzZXIgbm90aWZpY2F0aW9ucyB3aXRoIG1lc3NhZ2UgY29udGVudCBmb3IgcHJpdmFjeSBwdXJwb3NlcyBpZiB0aGUgJ21heGltaXplV2luZG93T25OZXdNZXNzYWdlJyBzZXR0aW5nIGlzIG9mZiBhbmQgdGhpcyBpcyBhIG5ldyBjaGF0IHdpbmRvdy5cbiAgICAgICAgICAgIGlmICh0aGlzLm1heGltaXplV2luZG93T25OZXdNZXNzYWdlIHx8ICghY2hhdFdpbmRvd1sxXSAmJiAhY2hhdFdpbmRvd1swXS5pc0NvbGxhcHNlZCkpXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgLy8gU29tZSBtZXNzYWdlcyBhcmUgbm90IHB1c2hlZCBiZWNhdXNlIHRoZXkgYXJlIGxvYWRlZCBieSBmZXRjaGluZyB0aGUgaGlzdG9yeSBoZW5jZSB3aHkgd2Ugc3VwcGx5IHRoZSBtZXNzYWdlIGhlcmVcbiAgICAgICAgICAgICAgICB0aGlzLmVtaXRCcm93c2VyTm90aWZpY2F0aW9uKGNoYXRXaW5kb3dbMF0sIG1lc3NhZ2UpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgb25QYXJ0aWNpcGFudENsaWNrZWRGcm9tRnJpZW5kc0xpc3QocGFydGljaXBhbnQ6IElDaGF0UGFydGljaXBhbnQpOiB2b2lkIHtcbiAgICAgICAgdGhpcy5vcGVuQ2hhdFdpbmRvdyhwYXJ0aWNpcGFudCwgdHJ1ZSwgdHJ1ZSk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBjYW5jZWxPcHRpb25Qcm9tcHQoKTogdm9pZCB7XG4gICAgICAgIGlmICh0aGlzLmN1cnJlbnRBY3RpdmVPcHRpb24pXG4gICAgICAgIHtcbiAgICAgICAgICAgIHRoaXMuY3VycmVudEFjdGl2ZU9wdGlvbi5pc0FjdGl2ZSA9IGZhbHNlO1xuICAgICAgICAgICAgdGhpcy5jdXJyZW50QWN0aXZlT3B0aW9uID0gbnVsbDtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIG9uT3B0aW9uUHJvbXB0Q2FuY2VsZWQoKTogdm9pZCB7XG4gICAgICAgIHRoaXMuY2FuY2VsT3B0aW9uUHJvbXB0KCk7XG4gICAgfVxuXG4gICAgb25PcHRpb25Qcm9tcHRDb25maXJtZWQoZXZlbnQ6IGFueSk6IHZvaWQge1xuICAgICAgICAvLyBGb3Igbm93IHRoaXMgaXMgZmluZSBhcyB0aGVyZSBpcyBvbmx5IG9uZSBvcHRpb24gYXZhaWxhYmxlLiBJbnRyb2R1Y2Ugb3B0aW9uIHR5cGVzIGFuZCB0eXBlIGNoZWNraW5nIGlmIGEgbmV3IG9wdGlvbiBpcyBhZGRlZC5cbiAgICAgICAgdGhpcy5jb25maXJtTmV3R3JvdXAoZXZlbnQpO1xuXG4gICAgICAgIC8vIENhbmNlbGluZyBjdXJyZW50IHN0YXRlXG4gICAgICAgIHRoaXMuY2FuY2VsT3B0aW9uUHJvbXB0KCk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBjb25maXJtTmV3R3JvdXAodXNlcnM6IFVzZXJbXSk6IHZvaWQge1xuICAgICAgICBjb25zdCBuZXdHcm91cCA9IG5ldyBHcm91cCh1c2Vycyk7XG5cbiAgICAgICAgdGhpcy5vcGVuQ2hhdFdpbmRvdyhuZXdHcm91cCk7XG5cbiAgICAgICAgaWYgKHRoaXMuZ3JvdXBBZGFwdGVyKVxuICAgICAgICB7XG4gICAgICAgICAgICB0aGlzLmdyb3VwQWRhcHRlci5ncm91cENyZWF0ZWQobmV3R3JvdXApO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLy8gT3BlbnMgYSBuZXcgY2hhdCB3aGluZG93LiBUYWtlcyBjYXJlIG9mIGF2YWlsYWJsZSB2aWV3cG9ydFxuICAgIC8vIFdvcmtzIGZvciBvcGVuaW5nIGEgY2hhdCB3aW5kb3cgZm9yIGFuIHVzZXIgb3IgZm9yIGEgZ3JvdXBcbiAgICAvLyBSZXR1cm5zID0+IFtXaW5kb3c6IFdpbmRvdyBvYmplY3QgcmVmZXJlbmNlLCBib29sZWFuOiBJbmRpY2F0ZXMgaWYgdGhpcyB3aW5kb3cgaXMgYSBuZXcgY2hhdCB3aW5kb3ddXG4gICAgcHJpdmF0ZSBvcGVuQ2hhdFdpbmRvdyhwYXJ0aWNpcGFudDogSUNoYXRQYXJ0aWNpcGFudCwgZm9jdXNPbk5ld1dpbmRvdzogYm9vbGVhbiA9IGZhbHNlLCBpbnZva2VkQnlVc2VyQ2xpY2s6IGJvb2xlYW4gPSBmYWxzZSk6IFtXaW5kb3csIGJvb2xlYW5dXG4gICAge1xuICAgICAgICAvLyBJcyB0aGlzIHdpbmRvdyBvcGVuZWQ/XG4gICAgICAgIGNvbnN0IG9wZW5lZFdpbmRvdyA9IHRoaXMud2luZG93cy5maW5kKHggPT4geC5wYXJ0aWNpcGFudC5pZCA9PSBwYXJ0aWNpcGFudC5pZCk7XG5cbiAgICAgICAgaWYgKCFvcGVuZWRXaW5kb3cpXG4gICAgICAgIHtcbiAgICAgICAgICAgIGlmIChpbnZva2VkQnlVc2VyQ2xpY2spXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgdGhpcy5vblBhcnRpY2lwYW50Q2xpY2tlZC5lbWl0KHBhcnRpY2lwYW50KTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gUmVmZXIgdG8gaXNzdWUgIzU4IG9uIEdpdGh1YlxuICAgICAgICAgICAgY29uc3QgY29sbGFwc2VXaW5kb3cgPSBpbnZva2VkQnlVc2VyQ2xpY2sgPyBmYWxzZSA6ICF0aGlzLm1heGltaXplV2luZG93T25OZXdNZXNzYWdlO1xuXG4gICAgICAgICAgICBjb25zdCBuZXdDaGF0V2luZG93OiBXaW5kb3cgPSBuZXcgV2luZG93KHBhcnRpY2lwYW50LCB0aGlzLmhpc3RvcnlFbmFibGVkLCBjb2xsYXBzZVdpbmRvdyk7XG5cbiAgICAgICAgICAgIC8vIExvYWRzIHRoZSBjaGF0IGhpc3RvcnkgdmlhIGFuIFJ4SnMgT2JzZXJ2YWJsZVxuICAgICAgICAgICAgaWYgKHRoaXMuaGlzdG9yeUVuYWJsZWQpXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgdGhpcy5mZXRjaE1lc3NhZ2VIaXN0b3J5KG5ld0NoYXRXaW5kb3cpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB0aGlzLndpbmRvd3MudW5zaGlmdChuZXdDaGF0V2luZG93KTtcblxuICAgICAgICAgICAgLy8gSXMgdGhlcmUgZW5vdWdoIHNwYWNlIGxlZnQgaW4gdGhlIHZpZXcgcG9ydCA/IGJ1dCBzaG91bGQgYmUgZGlzcGxheWVkIGluIG1vYmlsZSBpZiBvcHRpb24gaXMgZW5hYmxlZFxuICAgICAgICAgICAgaWYgKCF0aGlzLmlzVmlld3BvcnRPbk1vYmlsZUVuYWJsZWQpIHtcbiAgICAgICAgICAgICAgICBpZiAodGhpcy53aW5kb3dzLmxlbmd0aCAqIHRoaXMud2luZG93U2l6ZUZhY3RvciA+PSB0aGlzLnZpZXdQb3J0VG90YWxBcmVhIC0gKCF0aGlzLmhpZGVGcmllbmRzTGlzdCA/IHRoaXMuZnJpZW5kc0xpc3RXaWR0aCA6IDApKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMud2luZG93cy5wb3AoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHRoaXMudXBkYXRlV2luZG93c1N0YXRlKHRoaXMud2luZG93cyk7XG5cbiAgICAgICAgICAgIGlmIChmb2N1c09uTmV3V2luZG93ICYmICFjb2xsYXBzZVdpbmRvdylcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICB0aGlzLmZvY3VzT25XaW5kb3cobmV3Q2hhdFdpbmRvdyk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHRoaXMucGFydGljaXBhbnRzSW50ZXJhY3RlZFdpdGgucHVzaChwYXJ0aWNpcGFudCk7XG4gICAgICAgICAgICB0aGlzLm9uUGFydGljaXBhbnRDaGF0T3BlbmVkLmVtaXQocGFydGljaXBhbnQpO1xuXG4gICAgICAgICAgICByZXR1cm4gW25ld0NoYXRXaW5kb3csIHRydWVdO1xuICAgICAgICB9XG4gICAgICAgIGVsc2VcbiAgICAgICAge1xuICAgICAgICAgICAgLy8gUmV0dXJucyB0aGUgZXhpc3RpbmcgY2hhdCB3aW5kb3dcbiAgICAgICAgICAgIHJldHVybiBbb3BlbmVkV2luZG93LCBmYWxzZV07XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBGb2N1cyBvbiB0aGUgaW5wdXQgZWxlbWVudCBvZiB0aGUgc3VwcGxpZWQgd2luZG93XG4gICAgcHJpdmF0ZSBmb2N1c09uV2luZG93KHdpbmRvdzogV2luZG93LCBjYWxsYmFjazogRnVuY3Rpb24gPSAoKSA9PiB7fSkgOiB2b2lkXG4gICAge1xuICAgICAgICBjb25zdCB3aW5kb3dJbmRleCA9IHRoaXMud2luZG93cy5pbmRleE9mKHdpbmRvdyk7XG4gICAgICAgIGlmICh3aW5kb3dJbmRleCA+PSAwKVxuICAgICAgICB7XG4gICAgICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5jaGF0V2luZG93cylcbiAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGNoYXRXaW5kb3dUb0ZvY3VzID0gdGhpcy5jaGF0V2luZG93cy50b0FycmF5KClbd2luZG93SW5kZXhdO1xuXG4gICAgICAgICAgICAgICAgICAgIGNoYXRXaW5kb3dUb0ZvY3VzLmNoYXRXaW5kb3dJbnB1dC5uYXRpdmVFbGVtZW50LmZvY3VzKCk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgY2FsbGJhY2soKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBhc3NlcnRNZXNzYWdlVHlwZShtZXNzYWdlOiBNZXNzYWdlKTogdm9pZCB7XG4gICAgICAgIC8vIEFsd2F5cyBmYWxsYmFjayB0byBcIlRleHRcIiBtZXNzYWdlcyB0byBhdm9pZCByZW5kZW5yaW5nIGlzc3Vlc1xuICAgICAgICBpZiAoIW1lc3NhZ2UudHlwZSlcbiAgICAgICAge1xuICAgICAgICAgICAgbWVzc2FnZS50eXBlID0gTWVzc2FnZVR5cGUuVGV4dDtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8vIE1hcmtzIGFsbCBtZXNzYWdlcyBwcm92aWRlZCBhcyByZWFkIHdpdGggdGhlIGN1cnJlbnQgdGltZS5cbiAgICBtYXJrTWVzc2FnZXNBc1JlYWQobWVzc2FnZXM6IE1lc3NhZ2VbXSk6IHZvaWRcbiAgICB7XG4gICAgICAgIGNvbnN0IGN1cnJlbnREYXRlID0gbmV3IERhdGUoKTtcblxuICAgICAgICBtZXNzYWdlcy5mb3JFYWNoKChtc2cpPT57XG4gICAgICAgICAgICBtc2cuZGF0ZVNlZW4gPSBjdXJyZW50RGF0ZTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgdGhpcy5vbk1lc3NhZ2VzU2Vlbi5lbWl0KG1lc3NhZ2VzKTtcbiAgICB9XG5cbiAgICAvLyBCdWZmZXJzIGF1ZGlvIGZpbGUgKEZvciBjb21wb25lbnQncyBib290c3RyYXBwaW5nKVxuICAgIHByaXZhdGUgYnVmZmVyQXVkaW9GaWxlKCk6IHZvaWQge1xuICAgICAgICBpZiAodGhpcy5hdWRpb1NvdXJjZSAmJiB0aGlzLmF1ZGlvU291cmNlLmxlbmd0aCA+IDApXG4gICAgICAgIHtcbiAgICAgICAgICAgIHRoaXMuYXVkaW9GaWxlID0gbmV3IEF1ZGlvKCk7XG4gICAgICAgICAgICB0aGlzLmF1ZGlvRmlsZS5zcmMgPSB0aGlzLmF1ZGlvU291cmNlO1xuICAgICAgICAgICAgdGhpcy5hdWRpb0ZpbGUubG9hZCgpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLy8gRW1pdHMgYSBtZXNzYWdlIG5vdGlmaWNhdGlvbiBhdWRpbyBpZiBlbmFibGVkIGFmdGVyIGV2ZXJ5IG1lc3NhZ2UgcmVjZWl2ZWRcbiAgICBwcml2YXRlIGVtaXRNZXNzYWdlU291bmQod2luZG93OiBXaW5kb3cpOiB2b2lkXG4gICAge1xuICAgICAgICBpZiAodGhpcy5hdWRpb0VuYWJsZWQgJiYgIXdpbmRvdy5oYXNGb2N1cyAmJiB0aGlzLmF1ZGlvRmlsZSkge1xuICAgICAgICAgICAgdGhpcy5hdWRpb0ZpbGUucGxheSgpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLy8gRW1pdHMgYSBicm93c2VyIG5vdGlmaWNhdGlvblxuICAgIHByaXZhdGUgZW1pdEJyb3dzZXJOb3RpZmljYXRpb24od2luZG93OiBXaW5kb3csIG1lc3NhZ2U6IE1lc3NhZ2UpOiB2b2lkXG4gICAge1xuICAgICAgICBpZiAodGhpcy5icm93c2VyTm90aWZpY2F0aW9uc0Jvb3RzdHJhcHBlZCAmJiAhd2luZG93Lmhhc0ZvY3VzICYmIG1lc3NhZ2UpIHtcbiAgICAgICAgICAgIGNvbnN0IG5vdGlmaWNhdGlvbiA9IG5ldyBOb3RpZmljYXRpb24oYCR7dGhpcy5sb2NhbGl6YXRpb24uYnJvd3Nlck5vdGlmaWNhdGlvblRpdGxlfSAke3dpbmRvdy5wYXJ0aWNpcGFudC5kaXNwbGF5TmFtZX1gLCB7XG4gICAgICAgICAgICAgICAgJ2JvZHknOiBtZXNzYWdlLm1lc3NhZ2UsXG4gICAgICAgICAgICAgICAgJ2ljb24nOiB0aGlzLmJyb3dzZXJOb3RpZmljYXRpb25JY29uU291cmNlXG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgICAgICAgICAgbm90aWZpY2F0aW9uLmNsb3NlKCk7XG4gICAgICAgICAgICB9LCBtZXNzYWdlLm1lc3NhZ2UubGVuZ3RoIDw9IDUwID8gNTAwMCA6IDcwMDApOyAvLyBNb3JlIHRpbWUgdG8gcmVhZCBsb25nZXIgbWVzc2FnZXNcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8vIFNhdmVzIGN1cnJlbnQgd2luZG93cyBzdGF0ZSBpbnRvIGxvY2FsIHN0b3JhZ2UgaWYgcGVyc2lzdGVuY2UgaXMgZW5hYmxlZFxuICAgIHByaXZhdGUgdXBkYXRlV2luZG93c1N0YXRlKHdpbmRvd3M6IFdpbmRvd1tdKTogdm9pZFxuICAgIHtcbiAgICAgICAgaWYgKHRoaXMucGVyc2lzdFdpbmRvd3NTdGF0ZSlcbiAgICAgICAge1xuICAgICAgICAgICAgY29uc3QgcGFydGljaXBhbnRJZHMgPSB3aW5kb3dzLm1hcCgodykgPT4ge1xuICAgICAgICAgICAgICAgIHJldHVybiB3LnBhcnRpY2lwYW50LmlkO1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIGxvY2FsU3RvcmFnZS5zZXRJdGVtKHRoaXMubG9jYWxTdG9yYWdlS2V5LCBKU09OLnN0cmluZ2lmeShwYXJ0aWNpcGFudElkcykpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHJpdmF0ZSByZXN0b3JlV2luZG93c1N0YXRlKCk6IHZvaWRcbiAgICB7XG4gICAgICAgIHRyeVxuICAgICAgICB7XG4gICAgICAgICAgICBpZiAodGhpcy5wZXJzaXN0V2luZG93c1N0YXRlKVxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIGNvbnN0IHN0cmluZ2ZpZWRQYXJ0aWNpcGFudElkcyA9IGxvY2FsU3RvcmFnZS5nZXRJdGVtKHRoaXMubG9jYWxTdG9yYWdlS2V5KTtcblxuICAgICAgICAgICAgICAgIGlmIChzdHJpbmdmaWVkUGFydGljaXBhbnRJZHMgJiYgc3RyaW5nZmllZFBhcnRpY2lwYW50SWRzLmxlbmd0aCA+IDApXG4gICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBwYXJ0aWNpcGFudElkcyA9IDxudW1iZXJbXT5KU09OLnBhcnNlKHN0cmluZ2ZpZWRQYXJ0aWNpcGFudElkcyk7XG5cbiAgICAgICAgICAgICAgICAgICAgY29uc3QgcGFydGljaXBhbnRzVG9SZXN0b3JlID0gdGhpcy5wYXJ0aWNpcGFudHMuZmlsdGVyKHUgPT4gcGFydGljaXBhbnRJZHMuaW5kZXhPZih1LmlkKSA+PSAwKTtcblxuICAgICAgICAgICAgICAgICAgICBwYXJ0aWNpcGFudHNUb1Jlc3RvcmUuZm9yRWFjaCgocGFydGljaXBhbnQpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMub3BlbkNoYXRXaW5kb3cocGFydGljaXBhbnQpO1xuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgY2F0Y2ggKGV4KVxuICAgICAgICB7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKGBBbiBlcnJvciBvY2N1cnJlZCB3aGlsZSByZXN0b3JpbmcgbmctY2hhdCB3aW5kb3dzIHN0YXRlLiBEZXRhaWxzOiAke2V4fWApO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLy8gR2V0cyBjbG9zZXN0IG9wZW4gd2luZG93IGlmIGFueS4gTW9zdCByZWNlbnQgb3BlbmVkIGhhcyBwcmlvcml0eSAoUmlnaHQpXG4gICAgcHJpdmF0ZSBnZXRDbG9zZXN0V2luZG93KHdpbmRvdzogV2luZG93KTogV2luZG93IHwgdW5kZWZpbmVkXG4gICAge1xuICAgICAgICBjb25zdCBpbmRleCA9IHRoaXMud2luZG93cy5pbmRleE9mKHdpbmRvdyk7XG5cbiAgICAgICAgaWYgKGluZGV4ID4gMClcbiAgICAgICAge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMud2luZG93c1tpbmRleCAtIDFdO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKGluZGV4ID09IDAgJiYgdGhpcy53aW5kb3dzLmxlbmd0aCA+IDEpXG4gICAgICAgIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLndpbmRvd3NbaW5kZXggKyAxXTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHByaXZhdGUgY2xvc2VXaW5kb3cod2luZG93OiBXaW5kb3cpOiB2b2lkXG4gICAge1xuICAgICAgICBjb25zdCBpbmRleCA9IHRoaXMud2luZG93cy5pbmRleE9mKHdpbmRvdyk7XG5cbiAgICAgICAgdGhpcy53aW5kb3dzLnNwbGljZShpbmRleCwgMSk7XG5cbiAgICAgICAgdGhpcy51cGRhdGVXaW5kb3dzU3RhdGUodGhpcy53aW5kb3dzKTtcblxuICAgICAgICB0aGlzLm9uUGFydGljaXBhbnRDaGF0Q2xvc2VkLmVtaXQod2luZG93LnBhcnRpY2lwYW50KTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGdldENoYXRXaW5kb3dDb21wb25lbnRJbnN0YW5jZSh0YXJnZXRXaW5kb3c6IFdpbmRvdyk6IE5nQ2hhdFdpbmRvd0NvbXBvbmVudCB8IG51bGwge1xuICAgICAgICBjb25zdCB3aW5kb3dJbmRleCA9IHRoaXMud2luZG93cy5pbmRleE9mKHRhcmdldFdpbmRvdyk7XG5cbiAgICAgICAgaWYgKHRoaXMuY2hhdFdpbmRvd3Mpe1xuICAgICAgICAgICAgbGV0IHRhcmdldFdpbmRvdyA9IHRoaXMuY2hhdFdpbmRvd3MudG9BcnJheSgpW3dpbmRvd0luZGV4XTtcblxuICAgICAgICAgICAgcmV0dXJuIHRhcmdldFdpbmRvdztcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBudWxsO1xuICAgIH1cblxuICAgIC8vIFNjcm9sbHMgYSBjaGF0IHdpbmRvdyBtZXNzYWdlIGZsb3cgdG8gdGhlIGJvdHRvbVxuICAgIHByaXZhdGUgc2Nyb2xsQ2hhdFdpbmRvdyh3aW5kb3c6IFdpbmRvdywgZGlyZWN0aW9uOiBTY3JvbGxEaXJlY3Rpb24pOiB2b2lkXG4gICAge1xuICAgICAgICBjb25zdCBjaGF0V2luZG93ID0gdGhpcy5nZXRDaGF0V2luZG93Q29tcG9uZW50SW5zdGFuY2Uod2luZG93KTtcblxuICAgICAgICBpZiAoY2hhdFdpbmRvdyl7XG4gICAgICAgICAgICBjaGF0V2luZG93LnNjcm9sbENoYXRXaW5kb3cod2luZG93LCBkaXJlY3Rpb24pO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgb25XaW5kb3dNZXNzYWdlc1NlZW4obWVzc2FnZXNTZWVuOiBNZXNzYWdlW10pOiB2b2lkIHtcbiAgICAgICAgdGhpcy5tYXJrTWVzc2FnZXNBc1JlYWQobWVzc2FnZXNTZWVuKTtcbiAgICB9XG5cbiAgICBhc3luYyBvbldpbmRvd0NoYXRUb2dnbGUocGF5bG9hZDogeyBjdXJyZW50V2luZG93OiBXaW5kb3csIGlzQ29sbGFwc2VkOiBib29sZWFuIH0pIHtcbiAgICAgICAgdGhpcy5vblBhcnRpY2lwYW50VG9nZ2xlLmVtaXQoe3BhcnRpY2lwYW50OiBwYXlsb2FkLmN1cnJlbnRXaW5kb3cucGFydGljaXBhbnQsIGlzQ29sbGFwc2VkOiBwYXlsb2FkLmlzQ29sbGFwc2VkfSk7XG5cbiAgICB9XG5cbiAgICBhc3luYyBvbldpbmRvd0NoYXRDbG9zZWQocGF5bG9hZDogeyBjbG9zZWRXaW5kb3c6IFdpbmRvdywgY2xvc2VkVmlhRXNjYXBlS2V5OiBib29sZWFuIH0pIHtcbiAgICAgICAgY29uc3QgeyBjbG9zZWRXaW5kb3csIGNsb3NlZFZpYUVzY2FwZUtleSB9ID0gcGF5bG9hZDtcbiAgICAgICAgY29uc29sZS5sb2coJ29uV2luZG93Q2hhdENsb3NlZCcpO1xuICAgICAgICBpZih0aGlzLmJlZm9yZVBhcnRlY2lhbnRDaGF0Q2xvc2VkICE9IHVuZGVmaW5lZCAmJiB0aGlzLmJlZm9yZVBhcnRlY2lhbnRDaGF0Q2xvc2VkKSB7XG4gICAgICAgICAgICBjb25zdCBsID0gYXdhaXQgdGhpcy5iZWZvcmVQYXJ0ZWNpYW50Q2hhdENsb3NlZChjbG9zZWRXaW5kb3cucGFydGljaXBhbnQpO1xuICAgICAgICAgICAgaWYobCA9PSBmYWxzZSlcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGNsb3NlZFZpYUVzY2FwZUtleSkge1xuICAgICAgICAgICAgbGV0IGNsb3Nlc3RXaW5kb3cgPSB0aGlzLmdldENsb3Nlc3RXaW5kb3coY2xvc2VkV2luZG93KTtcblxuICAgICAgICAgICAgaWYgKGNsb3Nlc3RXaW5kb3cpXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgdGhpcy5mb2N1c09uV2luZG93KGNsb3Nlc3RXaW5kb3csICgpID0+IHsgdGhpcy5jbG9zZVdpbmRvdyhjbG9zZWRXaW5kb3cpOyB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICB0aGlzLmNsb3NlV2luZG93KGNsb3NlZFdpbmRvdyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICB0aGlzLmNsb3NlV2luZG93KGNsb3NlZFdpbmRvdyk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBvbldpbmRvd1RhYlRyaWdnZXJlZChwYXlsb2FkOiB7IHRyaWdnZXJpbmdXaW5kb3c6IFdpbmRvdywgc2hpZnRLZXlQcmVzc2VkOiBib29sZWFuIH0pOiB2b2lkIHtcbiAgICAgICAgY29uc3QgeyB0cmlnZ2VyaW5nV2luZG93LCBzaGlmdEtleVByZXNzZWQgfSA9IHBheWxvYWQ7XG5cbiAgICAgICAgY29uc3QgY3VycmVudFdpbmRvd0luZGV4ID0gdGhpcy53aW5kb3dzLmluZGV4T2YodHJpZ2dlcmluZ1dpbmRvdyk7XG4gICAgICAgIGxldCB3aW5kb3dUb0ZvY3VzID0gdGhpcy53aW5kb3dzW2N1cnJlbnRXaW5kb3dJbmRleCArIChzaGlmdEtleVByZXNzZWQgPyAxIDogLTEpXTsgLy8gR29lcyBiYWNrIG9uIHNoaWZ0ICsgdGFiXG5cbiAgICAgICAgaWYgKCF3aW5kb3dUb0ZvY3VzKVxuICAgICAgICB7XG4gICAgICAgICAgICAvLyBFZGdlIHdpbmRvd3MsIGdvIHRvIHN0YXJ0IG9yIGVuZFxuICAgICAgICAgICAgd2luZG93VG9Gb2N1cyA9IHRoaXMud2luZG93c1tjdXJyZW50V2luZG93SW5kZXggPiAwID8gMCA6IHRoaXMuY2hhdFdpbmRvd3MubGVuZ3RoIC0gMV07XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLmZvY3VzT25XaW5kb3cod2luZG93VG9Gb2N1cyk7XG4gICAgfVxuXG4gICAgb25XaW5kb3dNZXNzYWdlU2VudChtZXNzYWdlU2VudDogTWVzc2FnZSk6IHZvaWQge1xuICAgICAgICB0aGlzLmFkYXB0ZXIuc2VuZE1lc3NhZ2UobWVzc2FnZVNlbnQpO1xuICAgIH1cblxuICAgIG9uV2luZG93T3B0aW9uVHJpZ2dlcmVkKG9wdGlvbjogSUNoYXRPcHRpb24pOiB2b2lkIHtcbiAgICAgICAgdGhpcy5jdXJyZW50QWN0aXZlT3B0aW9uID0gb3B0aW9uO1xuICAgIH1cblxuICAgIHRyaWdnZXJPcGVuQ2hhdFdpbmRvdyh1c2VyOiBVc2VyKTogdm9pZCB7XG4gICAgICAgIGlmICh1c2VyKVxuICAgICAgICB7XG4gICAgICAgICAgICB0aGlzLm9wZW5DaGF0V2luZG93KHVzZXIpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgdHJpZ2dlckNsb3NlQ2hhdFdpbmRvdyh1c2VySWQ6IGFueSk6IHZvaWQge1xuICAgICAgICBjb25zdCBvcGVuZWRXaW5kb3cgPSB0aGlzLndpbmRvd3MuZmluZCh4ID0+IHgucGFydGljaXBhbnQuaWQgPT0gdXNlcklkKTtcblxuICAgICAgICBpZiAob3BlbmVkV2luZG93KVxuICAgICAgICB7XG4gICAgICAgICAgICB0aGlzLmNsb3NlV2luZG93KG9wZW5lZFdpbmRvdyk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICB0cmlnZ2VyVG9nZ2xlQ2hhdFdpbmRvd1Zpc2liaWxpdHkodXNlcklkOiBhbnkpOiB2b2lkIHtcbiAgICAgICAgY29uc3Qgb3BlbmVkV2luZG93ID0gdGhpcy53aW5kb3dzLmZpbmQoeCA9PiB4LnBhcnRpY2lwYW50LmlkID09IHVzZXJJZCk7XG5cbiAgICAgICAgaWYgKG9wZW5lZFdpbmRvdylcbiAgICAgICAge1xuICAgICAgICAgICAgY29uc3QgY2hhdFdpbmRvdyA9IHRoaXMuZ2V0Q2hhdFdpbmRvd0NvbXBvbmVudEluc3RhbmNlKG9wZW5lZFdpbmRvdyk7XG5cbiAgICAgICAgICAgIGlmIChjaGF0V2luZG93KXtcbiAgICAgICAgICAgICAgICBjaGF0V2luZG93Lm9uQ2hhdFdpbmRvd0NsaWNrZWQob3BlbmVkV2luZG93KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIHNldEJlZm9yZVBhcnRlY2lhbnRDaGF0Q2xvc2VkKGZ1bmM6IGFueSkge1xuICAgICAgICB0aGlzLmJlZm9yZVBhcnRlY2lhbnRDaGF0Q2xvc2VkID0gZnVuYztcbiAgICB9XG5cbiAgICBvbkRvd25sb2FkRmlsZShwYXJhbXM6IHtyZXBvc2l0b3J5SWQ6IHN0cmluZywgZmlsZU5hbWU6IHN0cmluZ30pIHtcbiAgICAgIHRoaXMuYWRhcHRlci5kb3dubG9hZEZpbGUocGFyYW1zLnJlcG9zaXRvcnlJZCwgcGFyYW1zLmZpbGVOYW1lKTtcbiAgICB9XG5cbiAgICBvbkdvVG9SZXBvKHBhcmFtczoge3JlcG9zaXRvcnlJZDogc3RyaW5nLCBpc0dyb3VwOiBib29sZWFufSkge1xuICAgICAgdGhpcy5hZGFwdGVyLmdvVG9SZXBvKHBhcmFtcy5yZXBvc2l0b3J5SWQsIHBhcmFtcy5pc0dyb3VwKTtcbiAgICB9XG59XG4iXX0=