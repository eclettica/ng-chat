import { __extends, __awaiter, __generator, __decorate } from 'tslib';
import { CommonModule } from '@angular/common';
import { EventEmitter, Input, Output, ViewChildren, HostListener, Component, ViewEncapsulation, Pipe, ViewChild, NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { MatIconModule } from '@angular/material/icon';
import { map } from 'rxjs/operators';
import { DomSanitizer } from '@angular/platform-browser';
import { Observable } from 'rxjs';

var ChatAdapter = /** @class */ (function () {
    function ChatAdapter() {
        // ### Abstract adapter methods ###
        // Event handlers
        /** @internal */
        this.friendsListChangedHandler = function (participantsResponse) { };
        /** @internal */
        this.messageReceivedHandler = function (participant, message) { };
    }
    // ### Adapter/Chat income/ingress events ###
    ChatAdapter.prototype.onFriendsListChanged = function (participantsResponse) {
        this.friendsListChangedHandler(participantsResponse);
    };
    ChatAdapter.prototype.onMessageReceived = function (participant, message) {
        this.messageReceivedHandler(participant, message);
    };
    return ChatAdapter;
}());

var MessageType;
(function (MessageType) {
    MessageType[MessageType["Text"] = 1] = "Text";
    MessageType[MessageType["File"] = 2] = "File";
    MessageType[MessageType["Image"] = 3] = "Image";
})(MessageType || (MessageType = {}));

var Message = /** @class */ (function () {
    function Message() {
        this.type = MessageType.Text;
    }
    return Message;
}());

var ChatParticipantStatus;
(function (ChatParticipantStatus) {
    ChatParticipantStatus[ChatParticipantStatus["Online"] = 0] = "Online";
    ChatParticipantStatus[ChatParticipantStatus["Busy"] = 1] = "Busy";
    ChatParticipantStatus[ChatParticipantStatus["Away"] = 2] = "Away";
    ChatParticipantStatus[ChatParticipantStatus["Offline"] = 3] = "Offline";
})(ChatParticipantStatus || (ChatParticipantStatus = {}));

var ChatParticipantType;
(function (ChatParticipantType) {
    ChatParticipantType[ChatParticipantType["User"] = 0] = "User";
    ChatParticipantType[ChatParticipantType["Group"] = 1] = "Group";
})(ChatParticipantType || (ChatParticipantType = {}));

var User = /** @class */ (function () {
    function User() {
        this.participantType = ChatParticipantType.User;
    }
    return User;
}());

var ParticipantResponse = /** @class */ (function () {
    function ParticipantResponse() {
    }
    return ParticipantResponse;
}());

var ParticipantMetadata = /** @class */ (function () {
    function ParticipantMetadata() {
        this.totalUnreadMessages = 0;
    }
    return ParticipantMetadata;
}());

var Window = /** @class */ (function () {
    function Window(participant, isLoadingHistory, isCollapsed) {
        this.messages = [];
        this.newMessage = "";
        // UI Behavior properties
        this.isCollapsed = false;
        this.isLoadingHistory = false;
        this.hasFocus = false;
        this.hasMoreMessages = true;
        this.historyPage = 0;
        this.participant = participant;
        this.messages = [];
        this.isLoadingHistory = isLoadingHistory;
        this.hasFocus = false; // This will be triggered when the 'newMessage' input gets the current focus
        this.isCollapsed = isCollapsed;
        this.hasMoreMessages = false;
        this.historyPage = 0;
        if (this.participant.windowOptions != undefined && this.participant.windowOptions != null)
            this.participant.windowOptions.chattingTo = this;
    }
    return Window;
}());

/**
 * @description Chat Adapter decorator class that adds pagination to load the history of messagesr.
 * You will need an existing @see ChatAdapter implementation
 */
var PagedHistoryChatAdapter = /** @class */ (function (_super) {
    __extends(PagedHistoryChatAdapter, _super);
    function PagedHistoryChatAdapter() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return PagedHistoryChatAdapter;
}(ChatAdapter));

var Theme;
(function (Theme) {
    Theme["Custom"] = "custom-theme";
    Theme["Light"] = "light-theme";
    Theme["Dark"] = "dark-theme";
})(Theme || (Theme = {}));

var WindowOption = /** @class */ (function () {
    function WindowOption() {
    }
    return WindowOption;
}());

var WindowButton = /** @class */ (function () {
    function WindowButton() {
    }
    return WindowButton;
}());

// Poached from: https://github.com/Steve-Fenton/TypeScriptUtilities
// @dynamic
var Guid = /** @class */ (function () {
    function Guid() {
    }
    Guid.newGuid = function () {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    };
    return Guid;
}());

var Group = /** @class */ (function () {
    function Group(participants) {
        this.id = Guid.newGuid();
        this.participantType = ChatParticipantType.Group;
        this.windowOptions = null;
        this.chattingTo = participants;
        this.status = ChatParticipantStatus.Online;
        // TODO: Add some customization for this in future releases
        this.displayName = participants.map(function (p) { return p.displayName; }).sort(function (first, second) { return second > first ? -1 : 1; }).join(", ");
    }
    return Group;
}());

var ScrollDirection;
(function (ScrollDirection) {
    ScrollDirection[ScrollDirection["Top"] = 0] = "Top";
    ScrollDirection[ScrollDirection["Bottom"] = 1] = "Bottom";
})(ScrollDirection || (ScrollDirection = {}));

var DefaultFileUploadAdapter = /** @class */ (function () {
    /**
     * @summary Basic file upload adapter implementation for HTTP request form file consumption
     * @param _serverEndpointUrl The API endpoint full qualified address that will receive a form file to process and return the metadata.
     */
    function DefaultFileUploadAdapter(_serverEndpointUrl, _http) {
        this._serverEndpointUrl = _serverEndpointUrl;
        this._http = _http;
    }
    DefaultFileUploadAdapter.prototype.uploadFile = function (file, participantId, window) {
        var formData = new FormData();
        //formData.append('ng-chat-sender-userid', currentUserId);
        formData.append('ng-chat-participant-id', participantId);
        formData.append('file', file, file.name);
        return this._http.post(this._serverEndpointUrl, formData);
        // TODO: Leaving this if we want to track upload progress in detail in the future. Might need a different Subject generic type wrapper
        // const fileRequest = new HttpRequest('POST', this._serverEndpointUrl, formData, {
        //     reportProgress: true
        // });
        // const uploadProgress = new Subject<number>();
        // const uploadStatus = uploadProgress.asObservable();
        //const responsePromise = new Subject<Message>();
        // this._http
        //     .request(fileRequest)
        //     .subscribe(event => {
        //         // if (event.type == HttpEventType.UploadProgress)
        //         // {
        //         //     const percentDone = Math.round(100 * event.loaded / event.total);
        //         //     uploadProgress.next(percentDone);
        //         // }
        //         // else if (event instanceof HttpResponse)
        //         // {
        //         //     uploadProgress.complete();
        //         // }
        //     });
    };
    return DefaultFileUploadAdapter;
}());

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
            var lastTimestamp = null;
            // if(window.messages && window.messages[window.messages.length -1 ] && window.messages[window.messages.length -1 ].dateSent)
            //     lastTimestamp = window.messages[window.messages.length -1 ].dateSent.getTime();
            this.adapter.getMessageHistoryByPage(window.participant.id, this.historyPageSize, ++window.historyPage, window)
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
    return NgChat;
}());

var emojiDictionary = [
    { patterns: [':)', ':-)', '=)'], unicode: '😃' },
    { patterns: [':D', ':-D', '=D'], unicode: '😀' },
    { patterns: [':(', ':-(', '=('], unicode: '🙁' },
    { patterns: [':|', ':-|', '=|'], unicode: '😐' },
    { patterns: [':*', ':-*', '=*'], unicode: '😙' },
    { patterns: ['T_T', 'T.T'], unicode: '😭' },
    { patterns: [':O', ':-O', '=O', ':o', ':-o', '=o'], unicode: '😮' },
    { patterns: [':P', ':-P', '=P', ':p', ':-p', '=p'], unicode: '😋' },
    { patterns: ['>.<'], unicode: '😣' },
    { patterns: ['@.@'], unicode: '😵' },
    { patterns: ['*.*'], unicode: '😍' },
    { patterns: ['<3'], unicode: '❤️' },
    { patterns: ['^.^'], unicode: '😊' },
    { patterns: [':+1'], unicode: '👍' },
    { patterns: [':-1'], unicode: '👎' }
];
/*
 * Transforms common emoji text to UTF encoded emojis
*/
var EmojifyPipe = /** @class */ (function () {
    function EmojifyPipe() {
    }
    EmojifyPipe.prototype.transform = function (message, pipeEnabled) {
        if (pipeEnabled && message && message.length > 1) {
            emojiDictionary.forEach(function (emoji) {
                emoji.patterns.forEach(function (pattern) {
                    message = message.replace(pattern, emoji.unicode);
                });
            });
        }
        return message;
    };
    EmojifyPipe = __decorate([
        Pipe({ name: 'emojify' })
    ], EmojifyPipe);
    return EmojifyPipe;
}());

/*
 * Transforms text containing URLs or E-mails to valid links/mailtos
*/
var LinkfyPipe = /** @class */ (function () {
    function LinkfyPipe() {
    }
    LinkfyPipe.prototype.transform = function (message, pipeEnabled) {
        if (pipeEnabled && message && message.length > 1) {
            var replacedText = void 0;
            var replacePatternProtocol = void 0;
            var replacePatternWWW = void 0;
            var replacePatternMailTo = void 0;
            // URLs starting with http://, https://, or ftp://
            replacePatternProtocol = /(\b(https?|ftp):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/gim;
            replacedText = message.replace(replacePatternProtocol, '<a href="$1" target="_blank">$1</a>');
            // URLs starting with "www." (ignoring // before it).
            replacePatternWWW = /(^|[^\/])(www\.[\S]+(\b|$))/gim;
            replacedText = replacedText.replace(replacePatternWWW, '$1<a href="http://$2" target="_blank">$2</a>');
            // Change email addresses to mailto:: links.
            replacePatternMailTo = /(([a-zA-Z0-9\-\_\.])+@[a-zA-Z\_]+?(\.[a-zA-Z]{2,6})+)/gim;
            replacedText = replacedText.replace(replacePatternMailTo, '<a href="mailto:$1">$1</a>');
            return replacedText;
        }
        else
            return message;
    };
    LinkfyPipe = __decorate([
        Pipe({ name: 'linkfy' })
    ], LinkfyPipe);
    return LinkfyPipe;
}());

/*
 * Sanitizes an URL resource
*/
var SanitizePipe = /** @class */ (function () {
    function SanitizePipe(sanitizer) {
        this.sanitizer = sanitizer;
    }
    SanitizePipe.prototype.transform = function (url) {
        return this.sanitizer.bypassSecurityTrustResourceUrl(url);
    };
    SanitizePipe.ctorParameters = function () { return [
        { type: DomSanitizer }
    ]; };
    SanitizePipe = __decorate([
        Pipe({ name: 'sanitize' })
    ], SanitizePipe);
    return SanitizePipe;
}());

/*
 * Sanitizes an URL resource
*/
var SecurePipe = /** @class */ (function () {
    function SecurePipe(http, sanitizer) {
        this.http = http;
        this.sanitizer = sanitizer;
        this.defaultImage = 'data:image/png;base64,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';
        this.cached = {};
    }
    SecurePipe.prototype.transform = function (url, cached) {
        var _this = this;
        if (!cached)
            cached = false;
        return new Observable(function (observer) {
            if (cached && _this.cached[url]) {
                observer.next(_this.cached[url]);
                return;
            }
            // This is a tiny blank image
            observer.next(_this.defaultImage);
            // The next and error callbacks from the observer
            var next = observer.next, error = observer.error;
            console.log('secure pipe');
            _this.http.get(url, { responseType: 'blob' }).subscribe(function (response) {
                var reader = new FileReader();
                reader.readAsDataURL(response);
                reader.onloadend = function () {
                    if (reader.result != null) {
                        var res = reader.result;
                        res = _this.sanitizer.bypassSecurityTrustUrl(res);
                        observer.next(res);
                        if (cached) {
                            _this.cached[url] = res;
                        }
                    }
                };
            }, function (error) {
                //observer.next('data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==');
                observer.next(_this.defaultImage);
                if (cached) {
                    _this.cached[url] = _this.defaultImage;
                }
            });
            return { unsubscribe: function () { } };
        });
    };
    SecurePipe.ctorParameters = function () { return [
        { type: HttpClient },
        { type: DomSanitizer }
    ]; };
    SecurePipe = __decorate([
        Pipe({ name: 'secure' })
    ], SecurePipe);
    return SecurePipe;
}());

/*
 * Renders the display name of a participant in a group based on who's sent the message
*/
var GroupMessageDisplayNamePipe = /** @class */ (function () {
    function GroupMessageDisplayNamePipe() {
    }
    GroupMessageDisplayNamePipe.prototype.transform = function (participant, message) {
        if (participant && participant.participantType == ChatParticipantType.Group) {
            var group = participant;
            var userIndex = group.chattingTo.findIndex(function (x) { return x.id == message.fromId; });
            return group.chattingTo[userIndex >= 0 ? userIndex : 0].displayName;
        }
        else
            return "";
    };
    GroupMessageDisplayNamePipe = __decorate([
        Pipe({ name: 'groupMessageDisplayName' })
    ], GroupMessageDisplayNamePipe);
    return GroupMessageDisplayNamePipe;
}());

var NgChatOptionsComponent = /** @class */ (function () {
    function NgChatOptionsComponent() {
        this.activeOptionTrackerChange = new EventEmitter();
    }
    NgChatOptionsComponent.prototype.onOptionClicked = function (option) {
        option.isActive = true;
        if (option.action) {
            option.action(option.chattingTo);
        }
        this.activeOptionTrackerChange.emit(option);
    };
    __decorate([
        Input()
    ], NgChatOptionsComponent.prototype, "options", void 0);
    __decorate([
        Input()
    ], NgChatOptionsComponent.prototype, "activeOptionTracker", void 0);
    __decorate([
        Output()
    ], NgChatOptionsComponent.prototype, "activeOptionTrackerChange", void 0);
    NgChatOptionsComponent = __decorate([
        Component({
            selector: 'ng-chat-options',
            template: "<div *ngIf=\"options && options.length > 0\" class=\"ng-chat-options\">\n\t\t<button class=\"ng-chat-options-activator\">\n\t\t\t<span class=\"primary-text\">...</span>\n\t\t</button>\n\t<div class=\"ng-chat-options-content primary-background shadowed\">\n\t\t<a *ngFor=\"let option of options; let i = index\" [ngClass]=\"'primary-text'\" (click)=\"onOptionClicked(option)\">\n\t\t\t{{option.displayLabel}}\n\t\t</a>\n\t</div>      \n</div>\n",
            styles: [".ng-chat-options-activator{background-color:unset;color:#fff;line-height:28px;border:none;position:relative}.ng-chat-options-activator>span{position:relative;top:-5px;left:0}.ng-chat-options{position:relative;display:inline-block}.ng-chat-options:hover .ng-chat-options-content{display:block}.ng-chat-options:hover .ng-chat-options-activator{background-color:#ddd}.ng-chat-options-content{display:none;position:absolute;min-width:160px;z-index:1}.ng-chat-options-content a:hover{background-color:#ddd}.ng-chat-options-content a{padding:6px 16px;text-decoration:none;display:block}@media only screen and (max-width:581px){.ng-chat-options-content{right:0}}"]
        })
    ], NgChatOptionsComponent);
    return NgChatOptionsComponent;
}());

var NgChatWindowOptionsComponent = /** @class */ (function () {
    //buttons: WindowButton[] | undefined;
    function NgChatWindowOptionsComponent() {
        this.activeOptionTrackerChange = new EventEmitter();
        //this.buttons = this.options.buttons;
    }
    NgChatWindowOptionsComponent.prototype.onOptionClicked = function (option, button) {
        if (button.action) {
            if (button.enableButton) {
                if (!button.enableButton(this.window.participant))
                    return;
            }
            button.action(this.window);
        }
        if (this.activeOptionTrackerChange)
            this.activeOptionTrackerChange.emit(option);
    };
    __decorate([
        Input()
    ], NgChatWindowOptionsComponent.prototype, "options", void 0);
    __decorate([
        Input()
    ], NgChatWindowOptionsComponent.prototype, "activeOptionTracker", void 0);
    __decorate([
        Input()
    ], NgChatWindowOptionsComponent.prototype, "window", void 0);
    __decorate([
        Output()
    ], NgChatWindowOptionsComponent.prototype, "activeOptionTrackerChange", void 0);
    NgChatWindowOptionsComponent = __decorate([
        Component({
            selector: 'ng-chat-window-options',
            template: "\n<div *ngIf=\"options && options.buttons && options.buttons.length > 0 && options.buttons.length < 3\" class=\"ng-chat-options-content-reduced\">\n\t<a *ngFor=\"let button of options?.buttons; let i = index\" [ngClass]=\"{'primary-text': true, 'disabled': button.enableButton(options.chattingTo.participant) == false, 'hidden': !button.showButton || button.showButton(options.chattingTo.participant) == false }\" (click)=\"onOptionClicked(options, button)\">\n\t\t<mat-icon *ngIf=\"button.showIcon\" class=\"material-icons\">{{button.icon}}</mat-icon>\n\t\t<span *ngIf=\"!button.showIcon\" class=\"material-icons\">{{button.title}}</span>\n\t</a>\n</div>\n<div *ngIf=\"options && options.buttons && options.buttons.length > 2\" class=\"ng-chat-options\">\n\t\t<button class=\"ng-chat-options-activator\">\n\t\t\t<span class=\"primary-text\">...</span>\n\t\t</button>\n\t<div class=\"ng-chat-options-content primary-background shadowed\">\n    <a *ngFor=\"let button of options?.buttons; let i = index\"\n    [ngClass]=\"{'primary-text': true, 'disabled': button.enableButton(window.participant) == false, 'hidden': !button.showButton || button.showButton(window.participant) == false }\"\n    (click)=\"onOptionClicked(options, button)\">\n\t\t\t<mat-icon *ngIf=\"button.showIcon\" class=\"material-icons\">{{button.icon}}</mat-icon>\n\t\t\t<span *ngIf=\"!button.showIcon\" class=\"material-icons\">{{button.title}}</span>\n\t\t</a>\n\t</div>\n</div>\n",
            styles: [".ng-chat-options-activator{background-color:unset;color:#fff;line-height:28px;border:none;position:relative}.ng-chat-options-activator>span{position:relative;top:-5px;left:0}.ng-chat-options{position:relative;display:inline-block}.ng-chat-options:hover .ng-chat-options-content{display:block}.ng-chat-options:hover .ng-chat-options-activator{background-color:#ddd}.ng-chat-options-content{display:none;position:absolute;min-width:160px;z-index:1}.ng-chat-options-content-reduced{display:inline-block;position:relative;bottom:5px}.ng-chat-options-content a:hover{background-color:#ddd}.ng-chat-options-content a{padding:6px 16px;text-decoration:none;display:block}.ng-chat-options-content a.disabled mat-icon,.ng-chat-options-content-reduced a.disabled mat-icon{color:#bababa}@media only screen and (max-width:581px){.ng-chat-options-content{right:0}}"]
        })
    ], NgChatWindowOptionsComponent);
    return NgChatWindowOptionsComponent;
}());

var MessageCounter = /** @class */ (function () {
    function MessageCounter() {
    }
    MessageCounter.formatUnreadMessagesTotal = function (totalUnreadMessages) {
        if (totalUnreadMessages > 0) {
            if (totalUnreadMessages > 99)
                return "99+";
            else
                return String(totalUnreadMessages);
        }
        // Empty fallback.
        return "";
    };
    /**
     * Returns a formatted string containing the total unread messages of a chat window.
     * @param window The window instance to count the unread total messages.
     * @param currentUserId The current chat instance user id. In this context it would be the sender.
     */
    MessageCounter.unreadMessagesTotal = function (window, currentUserId) {
        var totalUnreadMessages = 0;
        if (window) {
            totalUnreadMessages = window.messages.filter(function (x) { return x.fromId != currentUserId && !x.dateSeen; }).length;
        }
        return MessageCounter.formatUnreadMessagesTotal(totalUnreadMessages);
    };
    return MessageCounter;
}());

function chatParticipantStatusDescriptor(status, localization) {
    var currentStatus = ChatParticipantStatus[status].toString().toLowerCase();
    return localization.statusDescription[currentStatus];
}

var NgChatFriendsListComponent = /** @class */ (function () {
    function NgChatFriendsListComponent() {
        var _this = this;
        this.participantsInteractedWith = [];
        this.onParticipantClicked = new EventEmitter();
        this.onOptionPromptCanceled = new EventEmitter();
        this.onOptionPromptConfirmed = new EventEmitter();
        this.selectedUsersFromFriendsList = [];
        this.searchInput = '';
        // Exposes enums and functions for the ng-template
        this.ChatParticipantStatus = ChatParticipantStatus;
        this.chatParticipantStatusDescriptor = chatParticipantStatusDescriptor;
        this.cleanUpUserSelection = function () { return _this.selectedUsersFromFriendsList = []; };
    }
    NgChatFriendsListComponent.prototype.ngOnChanges = function (changes) {
        if (this.currentActiveOption) {
            var currentOptionTriggeredBy_1 = this.currentActiveOption && this.currentActiveOption.chattingTo.participant.id;
            var isActivatedUserInSelectedList = (this.selectedUsersFromFriendsList.filter(function (item) { return item.id == currentOptionTriggeredBy_1; })).length > 0;
            if (!isActivatedUserInSelectedList) {
                this.selectedUsersFromFriendsList = this.selectedUsersFromFriendsList.concat(this.currentActiveOption.chattingTo.participant);
            }
        }
    };
    Object.defineProperty(NgChatFriendsListComponent.prototype, "filteredParticipants", {
        get: function () {
            var _this = this;
            if (this.searchInput.length > 0) {
                // Searches in the friend list by the inputted search string
                return this.participants.filter(function (x) { return x.displayName.toUpperCase().includes(_this.searchInput.toUpperCase()); });
            }
            return this.participants;
        },
        enumerable: true,
        configurable: true
    });
    NgChatFriendsListComponent.prototype.isUserSelectedFromFriendsList = function (user) {
        return (this.selectedUsersFromFriendsList.filter(function (item) { return item.id == user.id; })).length > 0;
    };
    NgChatFriendsListComponent.prototype.unreadMessagesTotalByParticipant = function (participant) {
        var _this = this;
        var openedWindow = this.windows.find(function (x) { return x.participant.id == participant.id; });
        if (openedWindow) {
            return MessageCounter.unreadMessagesTotal(openedWindow, this.userId);
        }
        else {
            var totalUnreadMessages = this.participantsResponse
                .filter(function (x) { return x.participant.id == participant.id && !_this.participantsInteractedWith.find(function (u) { return u.id == participant.id; }) && x.metadata && x.metadata.totalUnreadMessages > 0; })
                .map(function (participantResponse) {
                return participantResponse.metadata.totalUnreadMessages;
            })[0];
            return MessageCounter.formatUnreadMessagesTotal(totalUnreadMessages);
        }
    };
    // Toggle friends list visibility
    NgChatFriendsListComponent.prototype.onChatTitleClicked = function () {
        this.isCollapsed = !this.isCollapsed;
    };
    NgChatFriendsListComponent.prototype.onFriendsListCheckboxChange = function (selectedUser, isChecked) {
        if (isChecked) {
            this.selectedUsersFromFriendsList.push(selectedUser);
        }
        else {
            this.selectedUsersFromFriendsList.splice(this.selectedUsersFromFriendsList.indexOf(selectedUser), 1);
        }
    };
    NgChatFriendsListComponent.prototype.onUserClick = function (clickedUser) {
        this.onParticipantClicked.emit(clickedUser);
    };
    NgChatFriendsListComponent.prototype.onFriendsListActionCancelClicked = function () {
        this.onOptionPromptCanceled.emit();
        this.cleanUpUserSelection();
    };
    NgChatFriendsListComponent.prototype.onFriendsListActionConfirmClicked = function () {
        this.onOptionPromptConfirmed.emit(this.selectedUsersFromFriendsList);
        this.cleanUpUserSelection();
    };
    __decorate([
        Input()
    ], NgChatFriendsListComponent.prototype, "participants", void 0);
    __decorate([
        Input()
    ], NgChatFriendsListComponent.prototype, "participantsResponse", void 0);
    __decorate([
        Input()
    ], NgChatFriendsListComponent.prototype, "participantsInteractedWith", void 0);
    __decorate([
        Input()
    ], NgChatFriendsListComponent.prototype, "windows", void 0);
    __decorate([
        Input()
    ], NgChatFriendsListComponent.prototype, "userId", void 0);
    __decorate([
        Input()
    ], NgChatFriendsListComponent.prototype, "localization", void 0);
    __decorate([
        Input()
    ], NgChatFriendsListComponent.prototype, "shouldDisplay", void 0);
    __decorate([
        Input()
    ], NgChatFriendsListComponent.prototype, "isCollapsed", void 0);
    __decorate([
        Input()
    ], NgChatFriendsListComponent.prototype, "searchEnabled", void 0);
    __decorate([
        Input()
    ], NgChatFriendsListComponent.prototype, "currentActiveOption", void 0);
    __decorate([
        Output()
    ], NgChatFriendsListComponent.prototype, "onParticipantClicked", void 0);
    __decorate([
        Output()
    ], NgChatFriendsListComponent.prototype, "onOptionPromptCanceled", void 0);
    __decorate([
        Output()
    ], NgChatFriendsListComponent.prototype, "onOptionPromptConfirmed", void 0);
    NgChatFriendsListComponent = __decorate([
        Component({
            selector: 'ng-chat-friends-list',
            template: "<div *ngIf=\"shouldDisplay\" id=\"ng-chat-people\" [ngClass]=\"{'primary-outline-color': true, 'primary-background': true, 'ng-chat-people-collapsed': isCollapsed}\">\n\t<a href=\"javascript:void(0);\" class=\"ng-chat-title secondary-background shadowed\" (click)=\"onChatTitleClicked()\">\n\t\t<span>\n\t\t\t{{localization.title}}\n\t\t</span>\n\t</a>\n\t<div *ngIf=\"currentActiveOption\" class=\"ng-chat-people-actions\" (click)=\"onFriendsListActionCancelClicked()\">\n\t\t<a href=\"javascript:void(0);\" class=\"ng-chat-people-action\">\n\t\t\t<i class=\"remove-icon\"></i>\n\t\t</a>\n\t\t<a href=\"javascript:void(0);\" class=\"ng-chat-people-action\" (click)=\"onFriendsListActionConfirmClicked()\">\n\t\t\t<i class=\"check-icon\"></i>\n\t\t</a>\n\t</div>\n\t<input *ngIf=\"searchEnabled\" id=\"ng-chat-search_friend\" class=\"friends-search-bar\" type=\"search\" [placeholder]=\"localization.searchPlaceholder\" [(ngModel)]=\"searchInput\" />\n\t<ul id=\"ng-chat-users\" *ngIf=\"!isCollapsed\" [ngClass]=\"{'offset-search': searchEnabled}\">\n\t\t<li *ngFor=\"let user of filteredParticipants\">\n\t\t\t<input \n\t\t\t\t*ngIf=\"currentActiveOption && currentActiveOption.validateContext(user)\" \n\t\t\t\ttype=\"checkbox\" \n\t\t\t\tclass=\"ng-chat-users-checkbox\" \n\t\t\t\t(change)=\"onFriendsListCheckboxChange(user, $event.target.checked)\" \n\t\t\t\t[checked]=\"isUserSelectedFromFriendsList(user)\"/>\n\t\t\t<div [ngClass]=\"{'ng-chat-friends-list-selectable-offset': currentActiveOption, 'ng-chat-friends-list-container': true}\" (click)=\"onUserClick(user)\">\n\t\t\t\t<div *ngIf=\"!user.avatar && !user.avatarSrc\" class=\"icon-wrapper\">\n\t\t\t\t\t<i class=\"user-icon\"></i>\n\t\t\t\t</div>\n\t\t\t\t<img *ngIf=\"user.avatar\" alt=\"\" class=\"avatar\" height=\"30\" width=\"30\"  [src]=\"user.avatar | sanitize\"/>\n\t\t\t\t<img *ngIf=\"user.avatarSrc\" alt=\"\" class=\"avatar\" height=\"30\" width=\"30\"  [src]=\"user.avatarSrc | secure:true | async\"/>\n\t\t\t\t<strong title=\"{{user.displayName}}\">{{user.displayName}}</strong>\n\t\t\t\t<span [ngClass]=\"{'ng-chat-participant-status': true, 'online': user.status == ChatParticipantStatus.Online, 'busy': user.status == ChatParticipantStatus.Busy, 'away': user.status == ChatParticipantStatus.Away, 'offline': user.status == ChatParticipantStatus.Offline}\" title=\"{{chatParticipantStatusDescriptor(user.status, localization)}}\"></span>\n\t\t\t\t<span *ngIf=\"unreadMessagesTotalByParticipant(user).length > 0\" class=\"ng-chat-unread-messages-count unread-messages-counter-container primary-text\">{{unreadMessagesTotalByParticipant(user)}}</span>\n\t\t\t</div>\n\t\t</li>\n\t</ul>\n</div>",
            encapsulation: ViewEncapsulation.None,
            styles: ["#ng-chat-people{position:relative;width:240px;height:360px;border-width:1px;border-style:solid;margin-right:20px;box-shadow:0 4px 8px rgba(0,0,0,.25);border-bottom:0}#ng-chat-people.ng-chat-people-collapsed{height:30px}#ng-chat-search_friend{display:block;padding:7px 10px;margin:10px auto 0;width:calc(100% - 20px);font-size:.9em;-webkit-appearance:searchfield}#ng-chat-users{padding:0 10px;list-style:none;margin:0;overflow:auto;position:absolute;top:42px;bottom:0;width:100%;box-sizing:border-box}#ng-chat-users.offset-search{top:84px}#ng-chat-users .ng-chat-users-checkbox{float:left;margin-right:5px;margin-top:8px}#ng-chat-users li{clear:both;margin-bottom:10px;overflow:hidden;cursor:pointer;max-height:30px}#ng-chat-users li>.ng-chat-friends-list-selectable-offset{margin-left:22px}#ng-chat-users li .ng-chat-friends-list-container{display:inline-block;width:100%}#ng-chat-users li>.ng-chat-friends-list-selectable-offset.ng-chat-friends-list-container{display:block;width:auto}#ng-chat-users li .ng-chat-friends-list-container>.icon-wrapper,#ng-chat-users li .ng-chat-friends-list-container>img.avatar{float:left;margin-right:5px;border-radius:25px}#ng-chat-users li .ng-chat-friends-list-container>.icon-wrapper{background-color:#bababa;overflow:hidden;width:30px;height:30px}#ng-chat-users li .ng-chat-friends-list-container>.icon-wrapper>i{color:#fff;transform:scale(.7)}#ng-chat-users li .ng-chat-friends-list-container>strong{float:left;line-height:30px;font-size:.8em;max-width:57%;max-height:30px;overflow:hidden;white-space:nowrap;text-overflow:ellipsis}#ng-chat-users li .ng-chat-friends-list-container>.ng-chat-participant-status{float:right}.ng-chat-people-actions{position:absolute;top:4px;right:5px;margin:0;padding:0;z-index:2}.ng-chat-people-actions>a.ng-chat-people-action{display:inline-block;width:21px;height:21px;margin-right:8px;text-decoration:none;border:none;border-radius:25px;padding:1px}@media only screen and (max-width:581px){#ng-chat-people{width:300px;height:360px;margin-right:0}}"]
        })
    ], NgChatFriendsListComponent);
    return NgChatFriendsListComponent;
}());

var NgChatWindowComponent = /** @class */ (function () {
    function NgChatWindowComponent() {
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
    NgChatWindowComponent.prototype.ngOnInit = function () {
        if (this.window
            && this.window.participant
            && this.window.participant.windowOptions
            && this.window.participant.windowOptions.windowClass)
            this.windowClass = this.window.participant.windowOptions.windowClass;
        if (this.windowClass == undefined || this.windowClass == null)
            this.windowClass = '';
    };
    NgChatWindowComponent.prototype.defaultWindowOptions = function (currentWindow) {
        if (this.showOptions && currentWindow.participant.participantType == ChatParticipantType.User) {
            return [{
                    isActive: false,
                    chattingTo: currentWindow,
                    validateContext: function (participant) {
                        return participant.participantType == ChatParticipantType.User;
                    },
                    displayLabel: 'Add People' // TODO: Localize this
                }];
        }
        return [];
    };
    // Asserts if a user avatar is visible in a chat cluster
    NgChatWindowComponent.prototype.isAvatarVisible = function (window, message, index) {
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
    };
    NgChatWindowComponent.prototype.getChatWindowAvatar = function (participant, message) {
        if (participant.participantType == ChatParticipantType.User) {
            return participant.avatar;
        }
        else if (participant.participantType == ChatParticipantType.Group) {
            var group = participant;
            if (!group || !group.chattingTo)
                return null;
            var userIndex = group.chattingTo.findIndex(function (x) { return x.id == message.fromId; });
            return group.chattingTo[userIndex >= 0 ? userIndex : 0].avatar;
        }
        return null;
    };
    NgChatWindowComponent.prototype.getChatWindowAvatarSrc = function (participant, message) {
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
    };
    NgChatWindowComponent.prototype.isUploadingFile = function (window) {
        var fileUploadInstanceId = this.getUniqueFileUploadInstanceId(window);
        return this.fileUploadersInUse.indexOf(fileUploadInstanceId) > -1;
    };
    // Generates a unique file uploader id for each participant
    NgChatWindowComponent.prototype.getUniqueFileUploadInstanceId = function (window) {
        if (window && window.participant) {
            return "ng-chat-file-upload-" + window.participant.id;
        }
        return 'ng-chat-file-upload';
    };
    NgChatWindowComponent.prototype.unreadMessagesTotal = function (window) {
        return MessageCounter.unreadMessagesTotal(window, this.userId);
    };
    // Scrolls a chat window message flow to the bottom
    NgChatWindowComponent.prototype.scrollChatWindow = function (window, direction) {
        var _this = this;
        if (!window.isCollapsed) {
            setTimeout(function () {
                if (_this.chatMessages) {
                    var element = _this.chatMessages.nativeElement;
                    var position = (direction === ScrollDirection.Top) ? 0 : element.scrollHeight;
                    element.scrollTop = position;
                }
            });
        }
    };
    NgChatWindowComponent.prototype.activeOptionTrackerChange = function (option) {
        this.onOptionTriggered.emit(option);
    };
    // Triggers native file upload for file selection from the user
    NgChatWindowComponent.prototype.triggerNativeFileUpload = function (window) {
        if (window) {
            if (this.nativeFileInput)
                this.nativeFileInput.nativeElement.click();
        }
    };
    // Toggles a window focus on the focus/blur of a 'newMessage' input
    NgChatWindowComponent.prototype.toggleWindowFocus = function (window) {
        var _this = this;
        window.hasFocus = !window.hasFocus;
        if (window.hasFocus) {
            var unreadMessages = window.messages
                .filter(function (message) { return message.dateSeen == null
                && (message.toId == _this.userId || window.participant.participantType === ChatParticipantType.Group); });
            if (unreadMessages && unreadMessages.length > 0) {
                this.onMessagesSeen.emit(unreadMessages);
            }
        }
    };
    NgChatWindowComponent.prototype.markMessagesAsRead = function (messages) {
        this.onMessagesSeen.emit(messages);
    };
    NgChatWindowComponent.prototype.fetchMessageHistory = function (window) {
        this.onLoadHistoryTriggered.emit(window);
    };
    // Closes a chat window via the close 'X' button
    NgChatWindowComponent.prototype.onCloseChatWindow = function () {
        this.onChatWindowClosed.emit({ closedWindow: this.window, closedViaEscapeKey: false });
    };
    /*  Monitors pressed keys on a chat window
        - Dispatches a message when the ENTER key is pressed
        - Tabs between windows on TAB or SHIFT + TAB
        - Closes the current focused window on ESC
    */
    NgChatWindowComponent.prototype.onChatInputTyped = function (event, window) {
        switch (event.keyCode) {
            case 13:
                if (window.newMessage && window.newMessage.trim() != "") {
                    var message = new Message();
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
    };
    // Toggles a chat window visibility between maximized/minimized
    NgChatWindowComponent.prototype.onChatWindowClicked = function (window) {
        window.isCollapsed = !window.isCollapsed;
        this.onChatWindowToggle.emit({ currentWindow: window, isCollapsed: window.isCollapsed });
        this.scrollChatWindow(window, ScrollDirection.Bottom);
    };
    NgChatWindowComponent.prototype.clearInUseFileUploader = function (fileUploadInstanceId) {
        var uploaderInstanceIdIndex = this.fileUploadersInUse.indexOf(fileUploadInstanceId);
        if (uploaderInstanceIdIndex > -1) {
            this.fileUploadersInUse.splice(uploaderInstanceIdIndex, 1);
        }
    };
    // Handles file selection and uploads the selected file using the file upload adapter
    NgChatWindowComponent.prototype.onFileChosen = function (window) {
        var _this = this;
        var fileUploadInstanceId = this.getUniqueFileUploadInstanceId(window);
        var uploadElementRef = this.nativeFileInput;
        if (uploadElementRef) {
            var file = uploadElementRef.nativeElement.files[0];
            this.fileUploadersInUse.push(fileUploadInstanceId);
            this.fileUploadAdapter.uploadFile(file, window.participant.id, window)
                .subscribe(function (fileMessage) {
                _this.clearInUseFileUploader(fileUploadInstanceId);
                fileMessage.fromId = _this.userId;
                // Push file message to current user window
                window.messages.push(fileMessage);
                _this.onMessageSent.emit(fileMessage);
                _this.scrollChatWindow(window, ScrollDirection.Bottom);
                // Resets the file upload element
                uploadElementRef.nativeElement.value = '';
            }, function (error) {
                _this.clearInUseFileUploader(fileUploadInstanceId);
                // Resets the file upload element
                uploadElementRef.nativeElement.value = '';
                // TODO: Invoke a file upload adapter error here
            });
        }
    };
    NgChatWindowComponent.prototype.downloadFile = function (message) {
        this.markMessagesAsRead([message]);
        if (message.repositoryId) {
            var fileName = message.attachmentName ? message.attachmentName : message.message;
            this.onDownloadFile.emit({
                repositoryId: message.repositoryId,
                fileName: fileName
            });
        }
    };
    NgChatWindowComponent.prototype.goToRepo = function (window, message) {
        if (message.repositoryId) {
            var fileName = message.attachmentName ? message.attachmentName : message.message;
            this.onGoToRepo.emit({
                repositoryId: message.repositoryId,
                isGroup: message.groupId ? true : false
            });
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
            template: "<ng-container *ngIf=\"window && window.isCollapsed\">\n\t<div class=\"ng-chat-title secondary-background {{windowClass}}\">\n\t\t<div class=\"ng-chat-title-visibility-toggle-area\" (click)=\"onChatWindowClicked(window)\">\n\t\t\t<strong title=\"{{window.participant.displayName}}\">\n\t\t\t\t{{window.participant.displayName}}\n\t\t\t</strong>\n\t\t\t<span [ngClass]=\"{'ng-chat-participant-status': true, 'online': window.participant.status == ChatParticipantStatus.Online, 'busy': window.participant.status == ChatParticipantStatus.Busy, 'away': window.participant.status == ChatParticipantStatus.Away, 'offline': window.participant.status == ChatParticipantStatus.Offline}\" title=\"{{chatParticipantStatusDescriptor(window.participant.status, localization)}}\"></span>\n\t\t\t<span *ngIf=\"unreadMessagesTotal(window).length > 0\" class=\"ng-chat-unread-messages-count unread-messages-counter-container primary-text\">{{unreadMessagesTotal(window)}}</span>\n\t\t</div>\n\t\t<a href=\"javascript:void(0);\" class=\"ng-chat-close primary-text\" (click)=\"onCloseChatWindow()\">X</a>\n\t</div>\n</ng-container>\n<ng-container *ngIf=\"window && !window.isCollapsed\">\n\t<div class=\"ng-chat-title secondary-background {{windowClass}}\">\n\t\t<div class=\"ng-chat-title-visibility-toggle-area\" (click)=\"onChatWindowClicked(window)\">\n\t\t\t<strong title=\"{{window.participant.displayName}}\">\n\t\t\t\t{{window.participant.displayName}}\n\t\t\t</strong>\n\t\t\t<span [ngClass]=\"{'ng-chat-participant-status': true, 'online': window.participant.status == ChatParticipantStatus.Online, 'busy': window.participant.status == ChatParticipantStatus.Busy, 'away': window.participant.status == ChatParticipantStatus.Away, 'offline': window.participant.status == ChatParticipantStatus.Offline}\" title=\"{{chatParticipantStatusDescriptor(window.participant.status, localization)}}\"></span>\n\t\t\t<span *ngIf=\"unreadMessagesTotal(window).length > 0\" class=\"ng-chat-unread-messages-count unread-messages-counter-container primary-text\">{{unreadMessagesTotal(window)}}</span>\n\t\t</div>\n\t\t<ng-chat-window-options *ngIf=\"window?.participant?.windowOptions?.buttons\" [ngClass]=\"{'ng-chat-options-container' : window.participant.windowOptions.buttons.length > 2, 'ng-chat-options-container-reduced': window.participant.windowOptions.buttons.length < 3 }\" [options]=\"window?.participant?.windowOptions\" [window]=\"window\"></ng-chat-window-options>\n\t\t<a href=\"javascript:void(0);\" class=\"ng-chat-close primary-text\" (click)=\"onCloseChatWindow()\">X</a>\n\t\t<ng-chat-options [ngClass]=\"'ng-chat-options-container'\" [options]=\"defaultWindowOptions(window)\" (activeOptionTrackerChange)=\"activeOptionTrackerChange($event)\"></ng-chat-options>\n\t</div>\n\t<div #chatMessages class=\"ng-chat-messages primary-background\">\n\t\t<div *ngIf=\"window.isLoadingHistory\" class=\"ng-chat-loading-wrapper\">\n\t\t\t<div class=\"loader\">Loading history...</div>\n\t\t</div>\n\t\t<div *ngIf=\"hasPagedHistory && window.hasMoreMessages && !window.isLoadingHistory\" class=\"ng-chat-load-history\">\n\t\t\t<a class=\"load-history-action\" (click)=\"fetchMessageHistory(window)\">{{localization.loadMessageHistoryPlaceholder}}</a>\n\t\t</div>\n\n\t\t<div *ngFor=\"let message of window.messages; let i = index\" [ngClass]=\"{'ng-chat-message': true, 'ng-chat-message-received': message.fromId != userId}\">\n\t\t\t<ng-container *ngIf=\"isAvatarVisible(window, message, i)\">\n\t\t\t\t<div *ngIf=\"!getChatWindowAvatar(window.participant, message) && !getChatWindowAvatarSrc(window.participant, message)\" class=\"icon-wrapper\">\n\t\t\t\t\t<i class=\"user-icon\"></i>\n\t\t\t\t</div>\n\t\t\t\t<img *ngIf=\"getChatWindowAvatar(window.participant, message)\" alt=\"\" class=\"avatar\" height=\"30\" width=\"30\" [src]=\"getChatWindowAvatar(window.participant, message) | sanitize\" />\n\t\t\t\t<img *ngIf=\"getChatWindowAvatarSrc(window.participant, message)\" alt=\"\" class=\"avatar avatarSrc\" height=\"30\" width=\"30\" [src]=\"getChatWindowAvatarSrc(window.participant, message) | secure:true | async\" />\n\t\t\t\t<span *ngIf=\"window.participant.participantType == ChatParticipantType.Group\" class=\"ng-chat-participant-name\">{{window.participant | groupMessageDisplayName:message}}</span>\n\t\t\t</ng-container>\n\t\t\t<ng-container [ngSwitch]=\"message.type\">\n\t\t\t\t<div *ngSwitchCase=\"MessageType.Text\" [ngClass]=\"{'sent-chat-message-container': message.fromId == userId, 'received-chat-message-container': message.fromId != userId}\">\n          <span [innerHtml]=\"message.message | emojify:emojisEnabled | linkfy:linkfyEnabled\"></span>\n\t\t\t\t\t<span *ngIf=\"showMessageDate && message.dateSent\" class=\"message-sent-date\">{{message.dateSent | date:messageDatePipeFormat}}</span>\n\t\t\t\t</div>\n        <div *ngSwitchCase=\"MessageType.Image\" [ngClass]=\"{'sent-chat-message-container': message.fromId == userId, 'received-chat-message-container': message.fromId != userId}\">\n\n          <img *ngIf=\"!message.repositoryId\" src=\"{{message.message}}\" class=\"image-message\" />\n          <img *ngIf=\"message.repositoryId && message.repositorySrcUri\" [src]=\"message.repositorySrcUri | secure | async\" class=\"image-message\" />\n\n\n\t\t\t\t\t<span *ngIf=\"showMessageDate && message.dateSent\" class=\"message-sent-date\">{{message.dateSent | date:messageDatePipeFormat}}</span>\n\t\t\t\t</div>\n\t\t\t\t<div *ngSwitchCase=\"MessageType.File\" [ngClass]=\"{'file-message-container': true, 'received': message.fromId != userId}\">\n\t\t\t\t\t<!-- <div class=\"file-message-icon-container\">\n\t\t\t\t\t\t<i class=\"paperclip-icon\"></i>\n\t\t\t\t\t</div> -->\n\t\t\t\t\t<a *ngIf=\"!message.repositoryId\" class=\"file-details\" [attr.href]=\"message.downloadUrl\" target=\"_blank\" rel=\"noopener noreferrer\" (click)=\"this.markMessagesAsRead([message])\" download>\n\t\t\t\t\t\t<span class=\"file-message-title\" [attr.title]=\"message.message\">{{message.message}}</span>\n\t\t\t\t\t\t<span *ngIf=\"message.fileSizeInBytes\"  class=\"file-message-size\">{{message.fileSizeInBytes}} Bytes</span>\n          </a>\n          <div *ngIf=\"message.repositoryId\">\n            <button (click)=\"downloadFile(message)\" mat-flat-button class=\"download-button\">SCARICA</button>\n            <button (click)=\"goToRepo(window, message)\" mat-flat-button class=\"download-button\">REPO</button>\n            <div class=\"file-message-title\" [attr.title]=\"message.message\">{{message.message}}</div>\n          <div>\n            <span *ngIf=\"showMessageDate && message.dateSent\" class=\"message-sent-date\">{{message.dateSent | date:messageDatePipeFormat}}</span>\n          </div>\n        </div>\n\n\t\t\t\t</div>\n\t\t\t</ng-container>\n\t\t</div>\n\t</div>\n\n\t<div class=\"ng-chat-footer primary-outline-color primary-background\">\n\t\t<input #chatWindowInput\n\t\t\ttype=\"text\"\n\t\t\t[ngModel]=\"window.newMessage | emojify:emojisEnabled\"\n\t\t\t(ngModelChange)=\"window.newMessage=$event\"\n\t\t\t[placeholder]=\"localization.messagePlaceholder\"\n\t\t\t[ngClass]=\"{'chat-window-input': true, 'has-side-action': fileUploadAdapter}\"\n\t\t\t(keydown)=\"onChatInputTyped($event, window)\"\n\t\t\t(blur)=\"toggleWindowFocus(window)\"\n\t\t\t(focus)=\"toggleWindowFocus(window)\"/>\n\n\t\t<!-- File Upload -->\n\t\t<ng-container *ngIf=\"fileUploadAdapter\">\n\t\t\t<a *ngIf=\"!isUploadingFile(window)\" class=\"btn-add-file\" (click)=\"triggerNativeFileUpload(window)\">\n\t\t\t\t<i class=\"upload-icon\"></i>\n\t\t\t</a>\n\t\t\t<input\n\t\t\t\ttype=\"file\"\n\t\t\t\t#nativeFileInput\n\t\t\t\tstyle=\"display: none;\"\n\t\t\t\t[attr.id]=\"getUniqueFileUploadInstanceId(window)\"\n\t\t\t\t(change)=\"onFileChosen(window)\" />\n\t\t\t<div *ngIf=\"isUploadingFile(window)\" class=\"loader\"></div>\n\t\t</ng-container>\n\t</div>\n</ng-container>\n",
            encapsulation: ViewEncapsulation.None,
            styles: [".ng-chat-window{right:260px;height:360px;z-index:999;bottom:0;width:300px;position:fixed;border-width:1px;border-style:solid;border-bottom:0;box-shadow:0 4px 8px rgba(0,0,0,.25)}.ng-chat-window-collapsed{height:30px!important}.ng-chat-window .ng-chat-footer{box-sizing:border-box;padding:0;display:block;height:calc(10%);width:100%;border:none;border-top:1px solid transparent;border-color:inherit}.ng-chat-window .ng-chat-footer>input{font-size:.8em;box-sizing:border-box;padding:0 5px;display:block;height:100%;width:100%;border:none}.ng-chat-window .ng-chat-footer>input.has-side-action{width:calc(100% - 30px)}.ng-chat-window .ng-chat-footer .btn-add-file{position:absolute;right:5px;bottom:7px;height:20px;width:20px;cursor:pointer}.ng-chat-window .ng-chat-footer .loader{position:absolute;right:14px;bottom:8px}.ng-chat-window .ng-chat-load-history{height:30px;text-align:center;font-size:.8em}.ng-chat-window .ng-chat-load-history>a{border-radius:15px;cursor:pointer;padding:5px 10px}.ng-chat-window .ng-chat-messages{padding:10px;width:100%;height:calc(90% - 30px);box-sizing:border-box;position:relative;overflow:auto}.ng-chat-window .ng-chat-messages .ng-chat-message{clear:both}.ng-chat-window .ng-chat-messages .ng-chat-message>.icon-wrapper,.ng-chat-window .ng-chat-messages .ng-chat-message>img.avatar{position:absolute;left:10px;border-radius:25px}.ng-chat-window .ng-chat-messages .ng-chat-message .ng-chat-participant-name{display:inline-block;margin-left:40px;padding-bottom:5px;font-weight:700;font-size:.8em;text-overflow:ellipsis;max-width:180px}.ng-chat-window .ng-chat-messages .ng-chat-message>.icon-wrapper{background-color:#bababa;overflow:hidden;width:30px;height:30px;padding:0}.ng-chat-window .ng-chat-messages .ng-chat-message>.icon-wrapper>i{color:#fff;transform:scale(.7)}.ng-chat-window .ng-chat-messages .ng-chat-message .message-sent-date{font-size:.8em;display:block;text-align:right;margin-top:5px}.ng-chat-window .ng-chat-messages .ng-chat-message>div{float:right;width:182px;padding:10px;border-radius:5px;margin-top:0;margin-bottom:5px;font-size:.9em;word-wrap:break-word}.ng-chat-window .ng-chat-messages .ng-chat-message.ng-chat-message-received>div.received-chat-message-container{float:left;margin-left:40px;padding-top:7px;padding-bottom:7px;border-style:solid;border-width:3px;margin-top:0;margin-bottom:5px}.ng-chat-window .ng-chat-messages .ng-chat-message .file-message-container{float:right;width:202px;border-style:solid;border-width:3px;border-radius:5px;overflow:hidden;margin-bottom:5px;display:block;text-decoration:none;font-size:.9em;padding:0;box-sizing:border-box}.ng-chat-window .ng-chat-messages .ng-chat-message .file-message-container.received{float:left;margin-left:40px;width:208px}.ng-chat-window .ng-chat-messages .ng-chat-message .file-message-container>.file-message-icon-container{width:20px;height:35px;padding:10px 5px;float:left}.ng-chat-window .ng-chat-messages .ng-chat-message .file-message-container>.file-message-icon-container i{margin-top:8px}.ng-chat-window .ng-chat-messages .ng-chat-message .file-message-container>.file-details{float:left;padding:10px;width:calc(100% - 60px);color:currentColor;text-decoration:none}.ng-chat-window .ng-chat-messages .ng-chat-message .file-message-container>.file-details:hover{text-decoration:underline}.ng-chat-window .ng-chat-messages .ng-chat-message .file-message-container>.file-details span{display:block;width:100%;text-overflow:ellipsis;overflow:hidden;white-space:nowrap}.ng-chat-window .ng-chat-messages .ng-chat-message .file-message-container>.file-details .file-message-title{font-weight:700}.ng-chat-window .ng-chat-messages .ng-chat-message .file-message-container>.file-details .file-message-size{font-size:.8em;margin-top:5px}.ng-chat-window .image-message{width:100%;height:auto}button.download-button{background-color:#4caf50;border:none;color:#fff;text-align:center;text-decoration:none;display:inline-block;font-size:16px;margin:4px 2px;border-radius:12px}@media only screen and (max-width:581px){.ng-chat-window{position:initial}}"]
        })
    ], NgChatWindowComponent);
    return NgChatWindowComponent;
}());

var NgChatModule = /** @class */ (function () {
    function NgChatModule() {
    }
    NgChatModule = __decorate([
        NgModule({
            imports: [CommonModule, FormsModule, HttpClientModule, MatIconModule],
            declarations: [
                NgChat,
                EmojifyPipe,
                LinkfyPipe,
                SanitizePipe,
                SecurePipe,
                GroupMessageDisplayNamePipe,
                NgChatOptionsComponent,
                NgChatWindowOptionsComponent,
                NgChatFriendsListComponent,
                NgChatWindowComponent
            ],
            exports: [NgChat]
        })
    ], NgChatModule);
    return NgChatModule;
}());

/**
 * Generated bundle index. Do not edit.
 */

export { ChatAdapter, ChatParticipantStatus, ChatParticipantType, Group, Message, MessageType, NgChatModule, PagedHistoryChatAdapter, ParticipantMetadata, ParticipantResponse, Theme, User, Window, WindowButton, WindowOption, NgChat as ɵa, EmojifyPipe as ɵb, LinkfyPipe as ɵc, SanitizePipe as ɵd, SecurePipe as ɵe, GroupMessageDisplayNamePipe as ɵf, NgChatOptionsComponent as ɵg, NgChatWindowOptionsComponent as ɵh, NgChatFriendsListComponent as ɵi, NgChatWindowComponent as ɵj };
//# sourceMappingURL=ng-chat.js.map
