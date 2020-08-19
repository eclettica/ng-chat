(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('@angular/common'), require('@angular/core'), require('@angular/forms'), require('@angular/common/http'), require('@angular/material/icon'), require('rxjs/operators'), require('@angular/platform-browser'), require('rxjs')) :
    typeof define === 'function' && define.amd ? define('ng-chat', ['exports', '@angular/common', '@angular/core', '@angular/forms', '@angular/common/http', '@angular/material/icon', 'rxjs/operators', '@angular/platform-browser', 'rxjs'], factory) :
    (global = global || self, factory(global['ng-chat'] = {}, global.ng.common, global.ng.core, global.ng.forms, global.ng.common.http, global.ng.material.icon, global.rxjs.operators, global.ng.platformBrowser, global.rxjs));
}(this, (function (exports, common, core, forms, http, icon, operators, platformBrowser, rxjs) { 'use strict';

    /*! *****************************************************************************
    Copyright (c) Microsoft Corporation.

    Permission to use, copy, modify, and/or distribute this software for any
    purpose with or without fee is hereby granted.

    THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
    REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
    AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
    INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
    LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
    OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
    PERFORMANCE OF THIS SOFTWARE.
    ***************************************************************************** */
    /* global Reflect, Promise */

    var extendStatics = function(d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };

    function __extends(d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    }

    var __assign = function() {
        __assign = Object.assign || function __assign(t) {
            for (var s, i = 1, n = arguments.length; i < n; i++) {
                s = arguments[i];
                for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
            }
            return t;
        };
        return __assign.apply(this, arguments);
    };

    function __rest(s, e) {
        var t = {};
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
            t[p] = s[p];
        if (s != null && typeof Object.getOwnPropertySymbols === "function")
            for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
                if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                    t[p[i]] = s[p[i]];
            }
        return t;
    }

    function __decorate(decorators, target, key, desc) {
        var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
        if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
        else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
        return c > 3 && r && Object.defineProperty(target, key, r), r;
    }

    function __param(paramIndex, decorator) {
        return function (target, key) { decorator(target, key, paramIndex); }
    }

    function __metadata(metadataKey, metadataValue) {
        if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(metadataKey, metadataValue);
    }

    function __awaiter(thisArg, _arguments, P, generator) {
        function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
        return new (P || (P = Promise))(function (resolve, reject) {
            function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
            function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
            function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
            step((generator = generator.apply(thisArg, _arguments || [])).next());
        });
    }

    function __generator(thisArg, body) {
        var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
        return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
        function verb(n) { return function (v) { return step([n, v]); }; }
        function step(op) {
            if (f) throw new TypeError("Generator is already executing.");
            while (_) try {
                if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
                if (y = 0, t) op = [op[0] & 2, t.value];
                switch (op[0]) {
                    case 0: case 1: t = op; break;
                    case 4: _.label++; return { value: op[1], done: false };
                    case 5: _.label++; y = op[1]; op = [0]; continue;
                    case 7: op = _.ops.pop(); _.trys.pop(); continue;
                    default:
                        if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                        if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                        if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                        if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                        if (t[2]) _.ops.pop();
                        _.trys.pop(); continue;
                }
                op = body.call(thisArg, _);
            } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
            if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
        }
    }

    function __createBinding(o, m, k, k2) {
        if (k2 === undefined) k2 = k;
        o[k2] = m[k];
    }

    function __exportStar(m, exports) {
        for (var p in m) if (p !== "default" && !exports.hasOwnProperty(p)) exports[p] = m[p];
    }

    function __values(o) {
        var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
        if (m) return m.call(o);
        if (o && typeof o.length === "number") return {
            next: function () {
                if (o && i >= o.length) o = void 0;
                return { value: o && o[i++], done: !o };
            }
        };
        throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
    }

    function __read(o, n) {
        var m = typeof Symbol === "function" && o[Symbol.iterator];
        if (!m) return o;
        var i = m.call(o), r, ar = [], e;
        try {
            while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
        }
        catch (error) { e = { error: error }; }
        finally {
            try {
                if (r && !r.done && (m = i["return"])) m.call(i);
            }
            finally { if (e) throw e.error; }
        }
        return ar;
    }

    function __spread() {
        for (var ar = [], i = 0; i < arguments.length; i++)
            ar = ar.concat(__read(arguments[i]));
        return ar;
    }

    function __spreadArrays() {
        for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
        for (var r = Array(s), k = 0, i = 0; i < il; i++)
            for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
                r[k] = a[j];
        return r;
    };

    function __await(v) {
        return this instanceof __await ? (this.v = v, this) : new __await(v);
    }

    function __asyncGenerator(thisArg, _arguments, generator) {
        if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
        var g = generator.apply(thisArg, _arguments || []), i, q = [];
        return i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i;
        function verb(n) { if (g[n]) i[n] = function (v) { return new Promise(function (a, b) { q.push([n, v, a, b]) > 1 || resume(n, v); }); }; }
        function resume(n, v) { try { step(g[n](v)); } catch (e) { settle(q[0][3], e); } }
        function step(r) { r.value instanceof __await ? Promise.resolve(r.value.v).then(fulfill, reject) : settle(q[0][2], r); }
        function fulfill(value) { resume("next", value); }
        function reject(value) { resume("throw", value); }
        function settle(f, v) { if (f(v), q.shift(), q.length) resume(q[0][0], q[0][1]); }
    }

    function __asyncDelegator(o) {
        var i, p;
        return i = {}, verb("next"), verb("throw", function (e) { throw e; }), verb("return"), i[Symbol.iterator] = function () { return this; }, i;
        function verb(n, f) { i[n] = o[n] ? function (v) { return (p = !p) ? { value: __await(o[n](v)), done: n === "return" } : f ? f(v) : v; } : f; }
    }

    function __asyncValues(o) {
        if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
        var m = o[Symbol.asyncIterator], i;
        return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
        function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
        function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
    }

    function __makeTemplateObject(cooked, raw) {
        if (Object.defineProperty) { Object.defineProperty(cooked, "raw", { value: raw }); } else { cooked.raw = raw; }
        return cooked;
    };

    function __importStar(mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
        result.default = mod;
        return result;
    }

    function __importDefault(mod) {
        return (mod && mod.__esModule) ? mod : { default: mod };
    }

    function __classPrivateFieldGet(receiver, privateMap) {
        if (!privateMap.has(receiver)) {
            throw new TypeError("attempted to get private field on non-instance");
        }
        return privateMap.get(receiver);
    }

    function __classPrivateFieldSet(receiver, privateMap, value) {
        if (!privateMap.has(receiver)) {
            throw new TypeError("attempted to set private field on non-instance");
        }
        privateMap.set(receiver, value);
        return value;
    }

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


    (function (MessageType) {
        MessageType[MessageType["Text"] = 1] = "Text";
        MessageType[MessageType["File"] = 2] = "File";
        MessageType[MessageType["Image"] = 3] = "Image";
    })(exports.MessageType || (exports.MessageType = {}));

    var Message = /** @class */ (function () {
        function Message() {
            this.type = exports.MessageType.Text;
        }
        return Message;
    }());


    (function (ChatParticipantStatus) {
        ChatParticipantStatus[ChatParticipantStatus["Online"] = 0] = "Online";
        ChatParticipantStatus[ChatParticipantStatus["Busy"] = 1] = "Busy";
        ChatParticipantStatus[ChatParticipantStatus["Away"] = 2] = "Away";
        ChatParticipantStatus[ChatParticipantStatus["Offline"] = 3] = "Offline";
    })(exports.ChatParticipantStatus || (exports.ChatParticipantStatus = {}));


    (function (ChatParticipantType) {
        ChatParticipantType[ChatParticipantType["User"] = 0] = "User";
        ChatParticipantType[ChatParticipantType["Group"] = 1] = "Group";
    })(exports.ChatParticipantType || (exports.ChatParticipantType = {}));

    var User = /** @class */ (function () {
        function User() {
            this.participantType = exports.ChatParticipantType.User;
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


    (function (Theme) {
        Theme["Custom"] = "custom-theme";
        Theme["Light"] = "light-theme";
        Theme["Dark"] = "dark-theme";
    })(exports.Theme || (exports.Theme = {}));

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
            this.participantType = exports.ChatParticipantType.Group;
            this.windowOptions = null;
            this.chattingTo = participants;
            this.status = exports.ChatParticipantStatus.Online;
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
        DefaultFileUploadAdapter.prototype.uploadFile = function (file, participantId) {
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
            this.ChatParticipantType = exports.ChatParticipantType;
            this.ChatParticipantStatus = exports.ChatParticipantStatus;
            this.MessageType = exports.MessageType;
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
            this.theme = exports.Theme.Light;
            this.messageDatePipeFormat = "short";
            this.showMessageDate = true;
            this.isViewportOnMobileEnabled = false;
            this.onParticipantClicked = new core.EventEmitter();
            this.onParticipantChatOpened = new core.EventEmitter();
            this.onParticipantChatClosed = new core.EventEmitter();
            this.onMessagesSeen = new core.EventEmitter();
            this.onParticipantToggle = new core.EventEmitter();
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
                this.theme = exports.Theme.Custom;
            }
            else if (this.theme != exports.Theme.Light && this.theme != exports.Theme.Dark) {
                // TODO: Use es2017 in future with Object.values(Theme).includes(this.theme) to do this check
                throw new Error("Invalid theme configuration for ng-chat. \"" + this.theme + "\" is not a valid theme value.");
            }
        };
        // Sends a request to load the friends list
        NgChat.prototype.fetchFriendsList = function (isBootstrapping) {
            var _this = this;
            this.adapter.listFriends()
                .pipe(operators.map(function (participantsResponse) {
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
                    .pipe(operators.map(function (result) {
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
                    .pipe(operators.map(function (result) {
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
                message.type = exports.MessageType.Text;
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
        NgChat.ctorParameters = function () { return [
            { type: http.HttpClient }
        ]; };
        __decorate([
            core.Input()
        ], NgChat.prototype, "isDisabled", null);
        __decorate([
            core.Input()
        ], NgChat.prototype, "adapter", void 0);
        __decorate([
            core.Input()
        ], NgChat.prototype, "groupAdapter", void 0);
        __decorate([
            core.Input()
        ], NgChat.prototype, "userId", void 0);
        __decorate([
            core.Input()
        ], NgChat.prototype, "isCollapsed", void 0);
        __decorate([
            core.Input()
        ], NgChat.prototype, "maximizeWindowOnNewMessage", void 0);
        __decorate([
            core.Input()
        ], NgChat.prototype, "pollFriendsList", void 0);
        __decorate([
            core.Input()
        ], NgChat.prototype, "pollingInterval", void 0);
        __decorate([
            core.Input()
        ], NgChat.prototype, "historyEnabled", void 0);
        __decorate([
            core.Input()
        ], NgChat.prototype, "emojisEnabled", void 0);
        __decorate([
            core.Input()
        ], NgChat.prototype, "linkfyEnabled", void 0);
        __decorate([
            core.Input()
        ], NgChat.prototype, "audioEnabled", void 0);
        __decorate([
            core.Input()
        ], NgChat.prototype, "searchEnabled", void 0);
        __decorate([
            core.Input() // TODO: This might need a better content strategy
        ], NgChat.prototype, "audioSource", void 0);
        __decorate([
            core.Input()
        ], NgChat.prototype, "persistWindowsState", void 0);
        __decorate([
            core.Input()
        ], NgChat.prototype, "title", void 0);
        __decorate([
            core.Input()
        ], NgChat.prototype, "messagePlaceholder", void 0);
        __decorate([
            core.Input()
        ], NgChat.prototype, "searchPlaceholder", void 0);
        __decorate([
            core.Input()
        ], NgChat.prototype, "browserNotificationsEnabled", void 0);
        __decorate([
            core.Input() // TODO: This might need a better content strategy
        ], NgChat.prototype, "browserNotificationIconSource", void 0);
        __decorate([
            core.Input()
        ], NgChat.prototype, "browserNotificationTitle", void 0);
        __decorate([
            core.Input()
        ], NgChat.prototype, "historyPageSize", void 0);
        __decorate([
            core.Input()
        ], NgChat.prototype, "localization", void 0);
        __decorate([
            core.Input()
        ], NgChat.prototype, "hideFriendsList", void 0);
        __decorate([
            core.Input()
        ], NgChat.prototype, "hideFriendsListOnUnsupportedViewport", void 0);
        __decorate([
            core.Input()
        ], NgChat.prototype, "fileUploadUrl", void 0);
        __decorate([
            core.Input()
        ], NgChat.prototype, "theme", void 0);
        __decorate([
            core.Input()
        ], NgChat.prototype, "customTheme", void 0);
        __decorate([
            core.Input()
        ], NgChat.prototype, "messageDatePipeFormat", void 0);
        __decorate([
            core.Input()
        ], NgChat.prototype, "showMessageDate", void 0);
        __decorate([
            core.Input()
        ], NgChat.prototype, "isViewportOnMobileEnabled", void 0);
        __decorate([
            core.Output()
        ], NgChat.prototype, "onParticipantClicked", void 0);
        __decorate([
            core.Output()
        ], NgChat.prototype, "onParticipantChatOpened", void 0);
        __decorate([
            core.Output()
        ], NgChat.prototype, "onParticipantChatClosed", void 0);
        __decorate([
            core.Output()
        ], NgChat.prototype, "onMessagesSeen", void 0);
        __decorate([
            core.Output()
        ], NgChat.prototype, "onParticipantToggle", void 0);
        __decorate([
            core.ViewChildren('chatWindow')
        ], NgChat.prototype, "chatWindows", void 0);
        __decorate([
            core.HostListener('window:resize', ['$event'])
        ], NgChat.prototype, "onResize", null);
        NgChat = __decorate([
            core.Component({
                selector: 'ng-chat',
                template: "<link *ngIf=\"customTheme\" rel=\"stylesheet\" [href]='customTheme | sanitize'>\n\n<div id=\"ng-chat\" *ngIf=\"!isDisabled && isBootstrapped && !unsupportedViewport\" [ngClass]=\"theme\">\n    <ng-chat-friends-list\n        [localization]=\"localization\"\n        [shouldDisplay]=\"!hideFriendsList\"\n        [userId]=\"userId\"\n        [isCollapsed]=\"isCollapsed\"\n        [searchEnabled]=\"searchEnabled\"\n        [participants]=\"participants\"\n        [participantsResponse]=\"participantsResponse\"\n        [participantsInteractedWith]=\"participantsInteractedWith\"\n        [windows]=\"windows\"\n        [currentActiveOption]=\"currentActiveOption\"\n        (onParticipantClicked)=\"onParticipantClickedFromFriendsList($event)\"\n        (onOptionPromptCanceled)=\"onOptionPromptCanceled()\"\n        (onOptionPromptConfirmed)=\"onOptionPromptConfirmed($event)\"\n    >\n    </ng-chat-friends-list>\n\n    <div *ngFor=\"let window of windows; let i = index\" [ngClass]=\"{'ng-chat-window': true, 'primary-outline-color': true, 'ng-chat-window-collapsed': window.isCollapsed}\" [ngStyle]=\"{'right': (!hideFriendsList ? friendsListWidth : 0) + 20 + windowSizeFactor * i + 'px'}\">\n        <ng-chat-window\n            #chatWindow\n            [fileUploadAdapter]=\"fileUploadAdapter\"\n            [localization]=\"localization\"\n            [userId]=\"userId\"\n            [window]=\"window\"\n            [showOptions]=\"groupAdapter\"\n            [emojisEnabled]=\"emojisEnabled\"\n            [linkfyEnabled]=\"linkfyEnabled\"\n            [showMessageDate]=\"showMessageDate\"\n            [messageDatePipeFormat]=\"messageDatePipeFormat\"\n            [hasPagedHistory]=\"hasPagedHistory\"\n            (onMessagesSeen)=\"onWindowMessagesSeen($event)\"\n            (onMessageSent)=\"onWindowMessageSent($event)\"\n            (onTabTriggered)=\"onWindowTabTriggered($event)\"\n            (onChatWindowClosed)=\"onWindowChatClosed($event)\"\n            (onChatWindowToggle)=\"onWindowChatToggle($event)\"\n            (onOptionTriggered)=\"onWindowOptionTriggered($event)\"\n            (onLoadHistoryTriggered)=\"fetchMessageHistory($event)\"\n        >\n        </ng-chat-window>\n    </div>\n</div>\n",
                encapsulation: core.ViewEncapsulation.None,
                styles: [".user-icon{box-sizing:border-box;background-color:#fff;border:2px solid;width:32px;height:20px;border-radius:64px 64px 0 0/64px;margin-top:14px;margin-left:-1px;display:inline-block;vertical-align:middle;position:relative;font-style:normal;color:#ddd;text-align:left;text-indent:-9999px}.user-icon:before{border:2px solid;background-color:#fff;width:12px;height:12px;top:-19px;border-radius:50%;position:absolute;left:50%;transform:translateX(-50%)}.user-icon:after,.user-icon:before{content:'';pointer-events:none}.upload-icon{position:absolute;margin-left:3px;margin-top:12px;width:13px;height:4px;border:1px solid currentColor;border-top:none;border-radius:1px}.upload-icon:before{content:'';position:absolute;top:-8px;left:6px;width:1px;height:9px;background-color:currentColor}.upload-icon:after{content:'';position:absolute;top:-8px;left:4px;width:4px;height:4px;border-top:1px solid currentColor;border-right:1px solid currentColor;transform:rotate(-45deg)}.paperclip-icon{position:absolute;margin-left:9px;margin-top:2px;width:6px;height:12px;border-radius:4px 4px 0 0;border-left:1px solid currentColor;border-right:1px solid currentColor;border-top:1px solid currentColor;transform:rotate(45deg)}.paperclip-icon:before{content:'';position:absolute;top:11px;left:-1px;width:4px;height:6px;border-radius:0 0 3px 3px;border-left:1px solid currentColor;border-right:1px solid currentColor;border-bottom:1px solid currentColor}.paperclip-icon:after{content:'';position:absolute;left:1px;top:1px;width:2px;height:10px;border-radius:4px 4px 0 0;border-left:1px solid currentColor;border-right:1px solid currentColor;border-top:1px solid currentColor}.check-icon{color:#000;position:absolute;margin-left:3px;margin-top:4px;width:14px;height:8px;border-bottom:1px solid currentColor;border-left:1px solid currentColor;transform:rotate(-45deg)}.remove-icon{color:#000;position:absolute;margin-left:3px;margin-top:10px}.remove-icon:before{content:'';position:absolute;width:15px;height:1px;background-color:currentColor;transform:rotate(45deg)}.remove-icon:after{content:'';position:absolute;width:15px;height:1px;background-color:currentColor;transform:rotate(-45deg)}", ".loader,.loader:after,.loader:before{background:#e3e3e3;-webkit-animation:1s ease-in-out infinite load1;animation:1s ease-in-out infinite load1;width:1em;height:4em}.loader{color:#e3e3e3;text-indent:-9999em;margin:4px auto 0;position:relative;font-size:4px;transform:translateZ(0);-webkit-animation-delay:-.16s;animation-delay:-.16s}.loader:after,.loader:before{position:absolute;top:0;content:''}.loader:before{left:-1.5em;-webkit-animation-delay:-.32s;animation-delay:-.32s}.loader:after{left:1.5em}@-webkit-keyframes load1{0%,100%,80%{box-shadow:0 0;height:4em}40%{box-shadow:0 -2em;height:5em}}@keyframes load1{0%,100%,80%{box-shadow:0 0;height:4em}40%{box-shadow:0 -2em;height:5em}}", "#ng-chat{position:fixed;z-index:999;right:0;bottom:0;box-sizing:initial;font-size:11pt;text-align:left}#ng-chat .shadowed{box-shadow:0 4px 8px rgba(0,0,0,.25)}.ng-chat-loading-wrapper{height:30px;text-align:center;font-size:.9em}.ng-chat-close{text-decoration:none;float:right}.ng-chat-title,.ng-chat-title:hover{position:relative;z-index:2;height:30px;line-height:30px;font-size:.9em;padding:0 10px;display:block;text-decoration:none;color:inherit;font-weight:400;cursor:pointer}.ng-chat-title .ng-chat-title-visibility-toggle-area{display:inline-block;width:85%}.ng-chat-title .ng-chat-title-visibility-toggle-area>strong{font-weight:600;display:block;overflow:hidden;height:30px;text-overflow:ellipsis;white-space:nowrap;max-width:85%;float:left}.ng-chat-title .ng-chat-title-visibility-toggle-area .ng-chat-participant-status{float:left;margin-left:5px}.ng-chat-participant-status{display:inline-block;border-radius:25px;width:8px;height:8px;margin-top:10px}.ng-chat-participant-status.online{background-color:#92a400}.ng-chat-participant-status.busy{background-color:#f91c1e}.ng-chat-participant-status.away{background-color:#f7d21b}.ng-chat-participant-status.offline{background-color:#bababa}.ng-chat-unread-messages-count{margin-left:5px;padding:0 5px;border-radius:25px;font-size:.9em;line-height:30px}.ng-chat-options-container{float:right;margin-right:5px}", "#ng-chat.light-theme,#ng-chat.light-theme .primary-text{color:#5c5c5c;font-family:Arial,Helvetica,sans-serif}#ng-chat.light-theme .primary-background{background-color:#fff}#ng-chat.light-theme .secondary-background{background-color:#fafafa}#ng-chat.light-theme .primary-outline-color{border-color:#a3a3a3}#ng-chat.light-theme .friends-search-bar{background-color:#fff}#ng-chat.light-theme .ng-chat-people-action,#ng-chat.light-theme .ng-chat-people-action>i,#ng-chat.light-theme .unread-messages-counter-container{color:#5c5c5c;background-color:#e3e3e3}#ng-chat.light-theme .load-history-action{background-color:#e3e3e3}#ng-chat.light-theme .chat-window-input{background-color:#fff}#ng-chat.light-theme .file-message-container,#ng-chat.light-theme .sent-chat-message-container{background-color:#e3e3e3;border-color:#e3e3e3}#ng-chat.light-theme .file-message-container.received,#ng-chat.light-theme .received-chat-message-container{background-color:#fff;border-color:#e3e3e3}", "#ng-chat.dark-theme,#ng-chat.dark-theme .primary-text{color:#fff;font-family:Arial,Helvetica,sans-serif}#ng-chat.dark-theme .primary-background{background-color:#565656}#ng-chat.dark-theme .secondary-background{background-color:#444}#ng-chat.dark-theme .primary-outline-color{border-color:#353535}#ng-chat.dark-theme .friends-search-bar{background-color:#444;border:1px solid #444;color:#fff}#ng-chat.dark-theme .ng-chat-people-action,#ng-chat.dark-theme .ng-chat-people-action>i,#ng-chat.dark-theme .unread-messages-counter-container{background-color:#fff;color:#444}#ng-chat.dark-theme .load-history-action{background-color:#444}#ng-chat.dark-theme .chat-window-input{background-color:#444;color:#fff}#ng-chat.dark-theme .file-message-container,#ng-chat.dark-theme .sent-chat-message-container{border-color:#444;background-color:#444}#ng-chat.dark-theme .file-message-container.received,#ng-chat.dark-theme .received-chat-message-container{background-color:#565656;border-color:#444}#ng-chat.dark-theme .ng-chat-footer{background-color:#444}#ng-chat.dark-theme .ng-chat-message a{color:#fff}"]
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
            core.Pipe({ name: 'emojify' })
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
            core.Pipe({ name: 'linkfy' })
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
            { type: platformBrowser.DomSanitizer }
        ]; };
        SanitizePipe = __decorate([
            core.Pipe({ name: 'sanitize' })
        ], SanitizePipe);
        return SanitizePipe;
    }());

    /*
     * Sanitizes an URL resource
    */
    var SecurePipe = /** @class */ (function () {
        function SecurePipe(http) {
            this.http = http;
        }
        SecurePipe.prototype.transform = function (url) {
            var _this = this;
            return new rxjs.Observable(function (observer) {
                // This is a tiny blank image
                observer.next('data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==');
                // The next and error callbacks from the observer
                var next = observer.next, error = observer.error;
                console.log('secure pipe');
                _this.http.get(url, { responseType: 'blob' }).subscribe(function (response) {
                    var reader = new FileReader();
                    reader.readAsDataURL(response);
                    reader.onloadend = function () {
                        if (reader.result != null)
                            observer.next(reader.result);
                    };
                });
                return { unsubscribe: function () { } };
            });
        };
        SecurePipe.ctorParameters = function () { return [
            { type: http.HttpClient }
        ]; };
        SecurePipe = __decorate([
            core.Pipe({ name: 'secure' })
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
            if (participant && participant.participantType == exports.ChatParticipantType.Group) {
                var group = participant;
                var userIndex = group.chattingTo.findIndex(function (x) { return x.id == message.fromId; });
                return group.chattingTo[userIndex >= 0 ? userIndex : 0].displayName;
            }
            else
                return "";
        };
        GroupMessageDisplayNamePipe = __decorate([
            core.Pipe({ name: 'groupMessageDisplayName' })
        ], GroupMessageDisplayNamePipe);
        return GroupMessageDisplayNamePipe;
    }());

    var NgChatOptionsComponent = /** @class */ (function () {
        function NgChatOptionsComponent() {
            this.activeOptionTrackerChange = new core.EventEmitter();
        }
        NgChatOptionsComponent.prototype.onOptionClicked = function (option) {
            option.isActive = true;
            if (option.action) {
                option.action(option.chattingTo);
            }
            this.activeOptionTrackerChange.emit(option);
        };
        __decorate([
            core.Input()
        ], NgChatOptionsComponent.prototype, "options", void 0);
        __decorate([
            core.Input()
        ], NgChatOptionsComponent.prototype, "activeOptionTracker", void 0);
        __decorate([
            core.Output()
        ], NgChatOptionsComponent.prototype, "activeOptionTrackerChange", void 0);
        NgChatOptionsComponent = __decorate([
            core.Component({
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
            this.activeOptionTrackerChange = new core.EventEmitter();
            //this.buttons = this.options.buttons;
        }
        NgChatWindowOptionsComponent.prototype.onOptionClicked = function (option, button) {
            if (button.action) {
                if (button.enableButton) {
                    if (!button.enableButton(option.chattingTo.participant))
                        return;
                }
                button.action(option.chattingTo);
            }
            if (this.activeOptionTrackerChange)
                this.activeOptionTrackerChange.emit(option);
        };
        __decorate([
            core.Input()
        ], NgChatWindowOptionsComponent.prototype, "options", void 0);
        __decorate([
            core.Input()
        ], NgChatWindowOptionsComponent.prototype, "activeOptionTracker", void 0);
        __decorate([
            core.Output()
        ], NgChatWindowOptionsComponent.prototype, "activeOptionTrackerChange", void 0);
        NgChatWindowOptionsComponent = __decorate([
            core.Component({
                selector: 'ng-chat-window-options',
                template: "<div *ngIf=\"options && options.buttons && options.buttons.length > 0\" class=\"ng-chat-options\">\n\t\t<button class=\"ng-chat-options-activator\">\n\t\t\t<span class=\"primary-text\">...</span>\n\t\t</button>\n\t<div class=\"ng-chat-options-content primary-background shadowed\">\n\t\t<a *ngFor=\"let button of options?.buttons; let i = index\" [ngClass]=\"'primary-text'\" (click)=\"onOptionClicked(options, button)\">\n\t\t\t<mat-icon *ngIf=\"button.showIcon\" class=\"material-icons\">{{button.icon}}</mat-icon>\n\t\t\t<span *ngIf=\"!button.showIcon\" class=\"material-icons\">{{button.title}}</span>\n\t\t</a>\n\t</div>      \n</div>\n",
                styles: [".ng-chat-options-activator{background-color:unset;color:#fff;line-height:28px;border:none;position:relative}.ng-chat-options-activator>span{position:relative;top:-5px;left:0}.ng-chat-options{position:relative;display:inline-block}.ng-chat-options:hover .ng-chat-options-content{display:block}.ng-chat-options:hover .ng-chat-options-activator{background-color:#ddd}.ng-chat-options-content{display:none;position:absolute;min-width:160px;z-index:1}.ng-chat-options-content a:hover{background-color:#ddd}.ng-chat-options-content a{padding:6px 16px;text-decoration:none;display:block}@media only screen and (max-width:581px){.ng-chat-options-content{right:0}}"]
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
        var currentStatus = exports.ChatParticipantStatus[status].toString().toLowerCase();
        return localization.statusDescription[currentStatus];
    }

    var NgChatFriendsListComponent = /** @class */ (function () {
        function NgChatFriendsListComponent() {
            var _this = this;
            this.participantsInteractedWith = [];
            this.onParticipantClicked = new core.EventEmitter();
            this.onOptionPromptCanceled = new core.EventEmitter();
            this.onOptionPromptConfirmed = new core.EventEmitter();
            this.selectedUsersFromFriendsList = [];
            this.searchInput = '';
            // Exposes enums and functions for the ng-template
            this.ChatParticipantStatus = exports.ChatParticipantStatus;
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
            core.Input()
        ], NgChatFriendsListComponent.prototype, "participants", void 0);
        __decorate([
            core.Input()
        ], NgChatFriendsListComponent.prototype, "participantsResponse", void 0);
        __decorate([
            core.Input()
        ], NgChatFriendsListComponent.prototype, "participantsInteractedWith", void 0);
        __decorate([
            core.Input()
        ], NgChatFriendsListComponent.prototype, "windows", void 0);
        __decorate([
            core.Input()
        ], NgChatFriendsListComponent.prototype, "userId", void 0);
        __decorate([
            core.Input()
        ], NgChatFriendsListComponent.prototype, "localization", void 0);
        __decorate([
            core.Input()
        ], NgChatFriendsListComponent.prototype, "shouldDisplay", void 0);
        __decorate([
            core.Input()
        ], NgChatFriendsListComponent.prototype, "isCollapsed", void 0);
        __decorate([
            core.Input()
        ], NgChatFriendsListComponent.prototype, "searchEnabled", void 0);
        __decorate([
            core.Input()
        ], NgChatFriendsListComponent.prototype, "currentActiveOption", void 0);
        __decorate([
            core.Output()
        ], NgChatFriendsListComponent.prototype, "onParticipantClicked", void 0);
        __decorate([
            core.Output()
        ], NgChatFriendsListComponent.prototype, "onOptionPromptCanceled", void 0);
        __decorate([
            core.Output()
        ], NgChatFriendsListComponent.prototype, "onOptionPromptConfirmed", void 0);
        NgChatFriendsListComponent = __decorate([
            core.Component({
                selector: 'ng-chat-friends-list',
                template: "<div *ngIf=\"shouldDisplay\" id=\"ng-chat-people\" [ngClass]=\"{'primary-outline-color': true, 'primary-background': true, 'ng-chat-people-collapsed': isCollapsed}\">\n\t<a href=\"javascript:void(0);\" class=\"ng-chat-title secondary-background shadowed\" (click)=\"onChatTitleClicked()\">\n\t\t<span>\n\t\t\t{{localization.title}}\n\t\t</span>\n\t</a>\n\t<div *ngIf=\"currentActiveOption\" class=\"ng-chat-people-actions\" (click)=\"onFriendsListActionCancelClicked()\">\n\t\t<a href=\"javascript:void(0);\" class=\"ng-chat-people-action\">\n\t\t\t<i class=\"remove-icon\"></i>\n\t\t</a>\n\t\t<a href=\"javascript:void(0);\" class=\"ng-chat-people-action\" (click)=\"onFriendsListActionConfirmClicked()\">\n\t\t\t<i class=\"check-icon\"></i>\n\t\t</a>\n\t</div>\n\t<input *ngIf=\"searchEnabled\" id=\"ng-chat-search_friend\" class=\"friends-search-bar\" type=\"search\" [placeholder]=\"localization.searchPlaceholder\" [(ngModel)]=\"searchInput\" />\n\t<ul id=\"ng-chat-users\" *ngIf=\"!isCollapsed\" [ngClass]=\"{'offset-search': searchEnabled}\">\n\t\t<li *ngFor=\"let user of filteredParticipants\">\n\t\t\t<input \n\t\t\t\t*ngIf=\"currentActiveOption && currentActiveOption.validateContext(user)\" \n\t\t\t\ttype=\"checkbox\" \n\t\t\t\tclass=\"ng-chat-users-checkbox\" \n\t\t\t\t(change)=\"onFriendsListCheckboxChange(user, $event.target.checked)\" \n\t\t\t\t[checked]=\"isUserSelectedFromFriendsList(user)\"/>\n\t\t\t<div [ngClass]=\"{'ng-chat-friends-list-selectable-offset': currentActiveOption, 'ng-chat-friends-list-container': true}\" (click)=\"onUserClick(user)\">\n\t\t\t\t<div *ngIf=\"!user.avatar\" class=\"icon-wrapper\">\n\t\t\t\t\t<i class=\"user-icon\"></i>\n\t\t\t\t</div>\n\t\t\t\t<img *ngIf=\"user.avatar\" alt=\"\" class=\"avatar\" height=\"30\" width=\"30\"  [src]=\"user.avatar | sanitize\"/>\n\t\t\t\t<strong title=\"{{user.displayName}}\">{{user.displayName}}</strong>\n\t\t\t\t<span [ngClass]=\"{'ng-chat-participant-status': true, 'online': user.status == ChatParticipantStatus.Online, 'busy': user.status == ChatParticipantStatus.Busy, 'away': user.status == ChatParticipantStatus.Away, 'offline': user.status == ChatParticipantStatus.Offline}\" title=\"{{chatParticipantStatusDescriptor(user.status, localization)}}\"></span>\n\t\t\t\t<span *ngIf=\"unreadMessagesTotalByParticipant(user).length > 0\" class=\"ng-chat-unread-messages-count unread-messages-counter-container primary-text\">{{unreadMessagesTotalByParticipant(user)}}</span>\n\t\t\t</div>\n\t\t</li>\n\t</ul>\n</div>",
                encapsulation: core.ViewEncapsulation.None,
                styles: ["#ng-chat-people{position:relative;width:240px;height:360px;border-width:1px;border-style:solid;margin-right:20px;box-shadow:0 4px 8px rgba(0,0,0,.25);border-bottom:0}#ng-chat-people.ng-chat-people-collapsed{height:30px}#ng-chat-search_friend{display:block;padding:7px 10px;margin:10px auto 0;width:calc(100% - 20px);font-size:.9em;-webkit-appearance:searchfield}#ng-chat-users{padding:0 10px;list-style:none;margin:0;overflow:auto;position:absolute;top:42px;bottom:0;width:100%;box-sizing:border-box}#ng-chat-users.offset-search{top:84px}#ng-chat-users .ng-chat-users-checkbox{float:left;margin-right:5px;margin-top:8px}#ng-chat-users li{clear:both;margin-bottom:10px;overflow:hidden;cursor:pointer;max-height:30px}#ng-chat-users li>.ng-chat-friends-list-selectable-offset{margin-left:22px}#ng-chat-users li .ng-chat-friends-list-container{display:inline-block;width:100%}#ng-chat-users li>.ng-chat-friends-list-selectable-offset.ng-chat-friends-list-container{display:block;width:auto}#ng-chat-users li .ng-chat-friends-list-container>.icon-wrapper,#ng-chat-users li .ng-chat-friends-list-container>img.avatar{float:left;margin-right:5px;border-radius:25px}#ng-chat-users li .ng-chat-friends-list-container>.icon-wrapper{background-color:#bababa;overflow:hidden;width:30px;height:30px}#ng-chat-users li .ng-chat-friends-list-container>.icon-wrapper>i{color:#fff;transform:scale(.7)}#ng-chat-users li .ng-chat-friends-list-container>strong{float:left;line-height:30px;font-size:.8em;max-width:57%;max-height:30px;overflow:hidden;white-space:nowrap;text-overflow:ellipsis}#ng-chat-users li .ng-chat-friends-list-container>.ng-chat-participant-status{float:right}.ng-chat-people-actions{position:absolute;top:4px;right:5px;margin:0;padding:0;z-index:2}.ng-chat-people-actions>a.ng-chat-people-action{display:inline-block;width:21px;height:21px;margin-right:8px;text-decoration:none;border:none;border-radius:25px;padding:1px}@media only screen and (max-width:581px){#ng-chat-people{width:300px;height:360px;margin-right:0}}"]
            })
        ], NgChatFriendsListComponent);
        return NgChatFriendsListComponent;
    }());

    var NgChatWindowComponent = /** @class */ (function () {
        function NgChatWindowComponent() {
            this.emojisEnabled = true;
            this.linkfyEnabled = true;
            this.showMessageDate = true;
            this.messageDatePipeFormat = "short";
            this.hasPagedHistory = true;
            this.onChatWindowClosed = new core.EventEmitter();
            this.onChatWindowToggle = new core.EventEmitter();
            this.onMessagesSeen = new core.EventEmitter();
            this.onMessageSent = new core.EventEmitter();
            this.onTabTriggered = new core.EventEmitter();
            this.onOptionTriggered = new core.EventEmitter();
            this.onLoadHistoryTriggered = new core.EventEmitter();
            // File upload state
            this.fileUploadersInUse = []; // Id bucket of uploaders in use
            // Exposes enums and functions for the ng-template
            this.ChatParticipantType = exports.ChatParticipantType;
            this.ChatParticipantStatus = exports.ChatParticipantStatus;
            this.MessageType = exports.MessageType;
            this.chatParticipantStatusDescriptor = chatParticipantStatusDescriptor;
            //this.windowOptions = this.window.participant.windowOptions;
        }
        NgChatWindowComponent.prototype.defaultWindowOptions = function (currentWindow) {
            if (this.showOptions && currentWindow.participant.participantType == exports.ChatParticipantType.User) {
                return [{
                        isActive: false,
                        chattingTo: currentWindow,
                        validateContext: function (participant) {
                            return participant.participantType == exports.ChatParticipantType.User;
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
            if (participant.participantType == exports.ChatParticipantType.User) {
                return participant.avatar;
            }
            else if (participant.participantType == exports.ChatParticipantType.Group) {
                var group = participant;
                var userIndex = group.chattingTo.findIndex(function (x) { return x.id == message.fromId; });
                return group.chattingTo[userIndex >= 0 ? userIndex : 0].avatar;
            }
            return null;
        };
        NgChatWindowComponent.prototype.getChatWindowAvatarSrc = function (participant, message) {
            if (participant.participantType == exports.ChatParticipantType.User) {
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
                    && (message.toId == _this.userId || window.participant.participantType === exports.ChatParticipantType.Group); });
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
                this.fileUploadAdapter.uploadFile(file, window.participant.id)
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
        __decorate([
            core.Input()
        ], NgChatWindowComponent.prototype, "fileUploadAdapter", void 0);
        __decorate([
            core.Input()
        ], NgChatWindowComponent.prototype, "window", void 0);
        __decorate([
            core.Input()
        ], NgChatWindowComponent.prototype, "userId", void 0);
        __decorate([
            core.Input()
        ], NgChatWindowComponent.prototype, "localization", void 0);
        __decorate([
            core.Input()
        ], NgChatWindowComponent.prototype, "showOptions", void 0);
        __decorate([
            core.Input()
        ], NgChatWindowComponent.prototype, "emojisEnabled", void 0);
        __decorate([
            core.Input()
        ], NgChatWindowComponent.prototype, "linkfyEnabled", void 0);
        __decorate([
            core.Input()
        ], NgChatWindowComponent.prototype, "showMessageDate", void 0);
        __decorate([
            core.Input()
        ], NgChatWindowComponent.prototype, "messageDatePipeFormat", void 0);
        __decorate([
            core.Input()
        ], NgChatWindowComponent.prototype, "hasPagedHistory", void 0);
        __decorate([
            core.Output()
        ], NgChatWindowComponent.prototype, "onChatWindowClosed", void 0);
        __decorate([
            core.Output()
        ], NgChatWindowComponent.prototype, "onChatWindowToggle", void 0);
        __decorate([
            core.Output()
        ], NgChatWindowComponent.prototype, "onMessagesSeen", void 0);
        __decorate([
            core.Output()
        ], NgChatWindowComponent.prototype, "onMessageSent", void 0);
        __decorate([
            core.Output()
        ], NgChatWindowComponent.prototype, "onTabTriggered", void 0);
        __decorate([
            core.Output()
        ], NgChatWindowComponent.prototype, "onOptionTriggered", void 0);
        __decorate([
            core.Output()
        ], NgChatWindowComponent.prototype, "onLoadHistoryTriggered", void 0);
        __decorate([
            core.ViewChild('chatMessages')
        ], NgChatWindowComponent.prototype, "chatMessages", void 0);
        __decorate([
            core.ViewChild('nativeFileInput')
        ], NgChatWindowComponent.prototype, "nativeFileInput", void 0);
        __decorate([
            core.ViewChild('chatWindowInput')
        ], NgChatWindowComponent.prototype, "chatWindowInput", void 0);
        NgChatWindowComponent = __decorate([
            core.Component({
                selector: 'ng-chat-window',
                template: "<ng-container *ngIf=\"window && window.isCollapsed\">\n\t<div class=\"ng-chat-title secondary-background\">\n\t\t<div class=\"ng-chat-title-visibility-toggle-area\" (click)=\"onChatWindowClicked(window)\">\n\t\t\t<strong title=\"{{window.participant.displayName}}\">\n\t\t\t\t{{window.participant.displayName}}\n\t\t\t</strong>\n\t\t\t<span [ngClass]=\"{'ng-chat-participant-status': true, 'online': window.participant.status == ChatParticipantStatus.Online, 'busy': window.participant.status == ChatParticipantStatus.Busy, 'away': window.participant.status == ChatParticipantStatus.Away, 'offline': window.participant.status == ChatParticipantStatus.Offline}\" title=\"{{chatParticipantStatusDescriptor(window.participant.status, localization)}}\"></span>\n\t\t\t<span *ngIf=\"unreadMessagesTotal(window).length > 0\" class=\"ng-chat-unread-messages-count unread-messages-counter-container primary-text\">{{unreadMessagesTotal(window)}}</span>\n\t\t</div>\n\t\t<a href=\"javascript:void(0);\" class=\"ng-chat-close primary-text\" (click)=\"onCloseChatWindow()\">X</a>\n\t</div>\n</ng-container>\n<ng-container *ngIf=\"window && !window.isCollapsed\">\n\t<div class=\"ng-chat-title secondary-background\">\n\t\t<div class=\"ng-chat-title-visibility-toggle-area\" (click)=\"onChatWindowClicked(window)\">\n\t\t\t<strong title=\"{{window.participant.displayName}}\">\n\t\t\t\t{{window.participant.displayName}}\n\t\t\t</strong>\n\t\t\t<span [ngClass]=\"{'ng-chat-participant-status': true, 'online': window.participant.status == ChatParticipantStatus.Online, 'busy': window.participant.status == ChatParticipantStatus.Busy, 'away': window.participant.status == ChatParticipantStatus.Away, 'offline': window.participant.status == ChatParticipantStatus.Offline}\" title=\"{{chatParticipantStatusDescriptor(window.participant.status, localization)}}\"></span>\n\t\t\t<span *ngIf=\"unreadMessagesTotal(window).length > 0\" class=\"ng-chat-unread-messages-count unread-messages-counter-container primary-text\">{{unreadMessagesTotal(window)}}</span>\n\t\t</div>\n\t\t<ng-chat-window-options *ngIf=\"window?.participant?.windowOptions\" [ngClass]=\"'ng-chat-options-container'\" [options]=\"window?.participant?.windowOptions\"></ng-chat-window-options>\n\t\t<a href=\"javascript:void(0);\" class=\"ng-chat-close primary-text\" (click)=\"onCloseChatWindow()\">X</a>\n\t\t<ng-chat-options [ngClass]=\"'ng-chat-options-container'\" [options]=\"defaultWindowOptions(window)\" (activeOptionTrackerChange)=\"activeOptionTrackerChange($event)\"></ng-chat-options>\n\t</div>\n\t<div #chatMessages class=\"ng-chat-messages primary-background\">\n\t\t<div *ngIf=\"window.isLoadingHistory\" class=\"ng-chat-loading-wrapper\">\n\t\t\t<div class=\"loader\">Loading history...</div>\n\t\t</div>\n\t\t<div *ngIf=\"hasPagedHistory && window.hasMoreMessages && !window.isLoadingHistory\" class=\"ng-chat-load-history\">\n\t\t\t<a class=\"load-history-action\" (click)=\"fetchMessageHistory(window)\">{{localization.loadMessageHistoryPlaceholder}}</a>\n\t\t</div>\n\n\t\t<div *ngFor=\"let message of window.messages; let i = index\" [ngClass]=\"{'ng-chat-message': true, 'ng-chat-message-received': message.fromId != userId}\">\n\t\t\t<ng-container *ngIf=\"isAvatarVisible(window, message, i)\">\n\t\t\t\t<div *ngIf=\"!getChatWindowAvatar(window.participant, message) && !getChatWindowAvatarSrc(window.participant, message)\" class=\"icon-wrapper\">\n\t\t\t\t\t<i class=\"user-icon\"></i>\n\t\t\t\t</div>\n\t\t\t\t<img *ngIf=\"getChatWindowAvatar(window.participant, message)\" alt=\"\" class=\"avatar\" height=\"30\" width=\"30\" [src]=\"getChatWindowAvatar(window.participant, message) | sanitize\" />\n\t\t\t\t<img *ngIf=\"getChatWindowAvatarSrc(window.participant, message)\" alt=\"\" class=\"avatar avatarSrc\" height=\"30\" width=\"30\" [src]=\"getChatWindowAvatarSrc(window.participant, message) | secure | async\" />\n\t\t\t\t<span *ngIf=\"window.participant.participantType == ChatParticipantType.Group\" class=\"ng-chat-participant-name\">{{window.participant | groupMessageDisplayName:message}}</span>\n\t\t\t</ng-container>\n\t\t\t<ng-container [ngSwitch]=\"message.type\">\n\t\t\t\t<div *ngSwitchCase=\"MessageType.Text\" [ngClass]=\"{'sent-chat-message-container': message.fromId == userId, 'received-chat-message-container': message.fromId != userId}\">\n          <span [innerHtml]=\"message.message | emojify:emojisEnabled | linkfy:linkfyEnabled\"></span>\n\t\t\t\t\t<span *ngIf=\"showMessageDate && message.dateSent\" class=\"message-sent-date\">{{message.dateSent | date:messageDatePipeFormat}}</span>\n\t\t\t\t</div>\n        <div *ngSwitchCase=\"MessageType.Image\" [ngClass]=\"{'sent-chat-message-container': message.fromId == userId, 'received-chat-message-container': message.fromId != userId}\">\n\n          <img src=\"{{message.message}}\" class=\"image-message\" />\n\n\t\t\t\t\t<span *ngIf=\"showMessageDate && message.dateSent\" class=\"message-sent-date\">{{message.dateSent | date:messageDatePipeFormat}}</span>\n\t\t\t\t</div>\n\t\t\t\t<div *ngSwitchCase=\"MessageType.File\" [ngClass]=\"{'file-message-container': true, 'received': message.fromId != userId}\">\n\t\t\t\t\t<div class=\"file-message-icon-container\">\n\t\t\t\t\t\t<i class=\"paperclip-icon\"></i>\n\t\t\t\t\t</div>\n\t\t\t\t\t<a class=\"file-details\" [attr.href]=\"message.downloadUrl\" target=\"_blank\" rel=\"noopener noreferrer\" (click)=\"this.markMessagesAsRead([message])\" download>\n\t\t\t\t\t\t<span class=\"file-message-title\" [attr.title]=\"message.message\">{{message.message}}</span>\n\t\t\t\t\t\t<span *ngIf=\"message.fileSizeInBytes\"  class=\"file-message-size\">{{message.fileSizeInBytes}} Bytes</span>\n\t\t\t\t\t</a>\n\t\t\t\t</div>\n\t\t\t</ng-container>\n\t\t</div>\n\t</div>\n\n\t<div class=\"ng-chat-footer primary-outline-color primary-background\">\n\t\t<input #chatWindowInput\n\t\t\ttype=\"text\"\n\t\t\t[ngModel]=\"window.newMessage | emojify:emojisEnabled\"\n\t\t\t(ngModelChange)=\"window.newMessage=$event\"\n\t\t\t[placeholder]=\"localization.messagePlaceholder\"\n\t\t\t[ngClass]=\"{'chat-window-input': true, 'has-side-action': fileUploadAdapter}\"\n\t\t\t(keydown)=\"onChatInputTyped($event, window)\"\n\t\t\t(blur)=\"toggleWindowFocus(window)\"\n\t\t\t(focus)=\"toggleWindowFocus(window)\"/>\n\n\t\t<!-- File Upload -->\n\t\t<ng-container *ngIf=\"fileUploadAdapter\">\n\t\t\t<a *ngIf=\"!isUploadingFile(window)\" class=\"btn-add-file\" (click)=\"triggerNativeFileUpload(window)\">\n\t\t\t\t<i class=\"upload-icon\"></i>\n\t\t\t</a>\n\t\t\t<input\n\t\t\t\ttype=\"file\"\n\t\t\t\t#nativeFileInput\n\t\t\t\tstyle=\"display: none;\"\n\t\t\t\t[attr.id]=\"getUniqueFileUploadInstanceId(window)\"\n\t\t\t\t(change)=\"onFileChosen(window)\" />\n\t\t\t<div *ngIf=\"isUploadingFile(window)\" class=\"loader\"></div>\n\t\t</ng-container>\n\t</div>\n</ng-container>\n",
                encapsulation: core.ViewEncapsulation.None,
                styles: [".ng-chat-window{right:260px;height:360px;z-index:999;bottom:0;width:300px;position:fixed;border-width:1px;border-style:solid;border-bottom:0;box-shadow:0 4px 8px rgba(0,0,0,.25)}.ng-chat-window-collapsed{height:30px!important}.ng-chat-window .ng-chat-footer{box-sizing:border-box;padding:0;display:block;height:calc(10%);width:100%;border:none;border-top:1px solid transparent;border-color:inherit}.ng-chat-window .ng-chat-footer>input{font-size:.8em;box-sizing:border-box;padding:0 5px;display:block;height:100%;width:100%;border:none}.ng-chat-window .ng-chat-footer>input.has-side-action{width:calc(100% - 30px)}.ng-chat-window .ng-chat-footer .btn-add-file{position:absolute;right:5px;bottom:7px;height:20px;width:20px;cursor:pointer}.ng-chat-window .ng-chat-footer .loader{position:absolute;right:14px;bottom:8px}.ng-chat-window .ng-chat-load-history{height:30px;text-align:center;font-size:.8em}.ng-chat-window .ng-chat-load-history>a{border-radius:15px;cursor:pointer;padding:5px 10px}.ng-chat-window .ng-chat-messages{padding:10px;width:100%;height:calc(90% - 30px);box-sizing:border-box;position:relative;overflow:auto}.ng-chat-window .ng-chat-messages .ng-chat-message{clear:both}.ng-chat-window .ng-chat-messages .ng-chat-message>.icon-wrapper,.ng-chat-window .ng-chat-messages .ng-chat-message>img.avatar{position:absolute;left:10px;border-radius:25px}.ng-chat-window .ng-chat-messages .ng-chat-message .ng-chat-participant-name{display:inline-block;margin-left:40px;padding-bottom:5px;font-weight:700;font-size:.8em;text-overflow:ellipsis;max-width:180px}.ng-chat-window .ng-chat-messages .ng-chat-message>.icon-wrapper{background-color:#bababa;overflow:hidden;width:30px;height:30px;padding:0}.ng-chat-window .ng-chat-messages .ng-chat-message>.icon-wrapper>i{color:#fff;transform:scale(.7)}.ng-chat-window .ng-chat-messages .ng-chat-message .message-sent-date{font-size:.8em;display:block;text-align:right;margin-top:5px}.ng-chat-window .ng-chat-messages .ng-chat-message>div{float:right;width:182px;padding:10px;border-radius:5px;margin-top:0;margin-bottom:5px;font-size:.9em;word-wrap:break-word}.ng-chat-window .ng-chat-messages .ng-chat-message.ng-chat-message-received>div.received-chat-message-container{float:left;margin-left:40px;padding-top:7px;padding-bottom:7px;border-style:solid;border-width:3px;margin-top:0;margin-bottom:5px}.ng-chat-window .ng-chat-messages .ng-chat-message .file-message-container{float:right;width:202px;border-style:solid;border-width:3px;border-radius:5px;overflow:hidden;margin-bottom:5px;display:block;text-decoration:none;font-size:.9em;padding:0;box-sizing:border-box}.ng-chat-window .ng-chat-messages .ng-chat-message .file-message-container.received{float:left;margin-left:40px;width:208px}.ng-chat-window .ng-chat-messages .ng-chat-message .file-message-container>.file-message-icon-container{width:20px;height:35px;padding:10px 5px;float:left}.ng-chat-window .ng-chat-messages .ng-chat-message .file-message-container>.file-message-icon-container i{margin-top:8px}.ng-chat-window .ng-chat-messages .ng-chat-message .file-message-container>.file-details{float:left;padding:10px;width:calc(100% - 60px);color:currentColor;text-decoration:none}.ng-chat-window .ng-chat-messages .ng-chat-message .file-message-container>.file-details:hover{text-decoration:underline}.ng-chat-window .ng-chat-messages .ng-chat-message .file-message-container>.file-details span{display:block;width:100%;text-overflow:ellipsis;overflow:hidden;white-space:nowrap}.ng-chat-window .ng-chat-messages .ng-chat-message .file-message-container>.file-details .file-message-title{font-weight:700}.ng-chat-window .ng-chat-messages .ng-chat-message .file-message-container>.file-details .file-message-size{font-size:.8em;margin-top:5px}.ng-chat-window .image-message{width:100%;height:auto}@media only screen and (max-width:581px){.ng-chat-window{position:initial}}"]
            })
        ], NgChatWindowComponent);
        return NgChatWindowComponent;
    }());

    var NgChatModule = /** @class */ (function () {
        function NgChatModule() {
        }
        NgChatModule = __decorate([
            core.NgModule({
                imports: [common.CommonModule, forms.FormsModule, http.HttpClientModule, icon.MatIconModule],
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

    exports.ChatAdapter = ChatAdapter;
    exports.Group = Group;
    exports.Message = Message;
    exports.NgChatModule = NgChatModule;
    exports.PagedHistoryChatAdapter = PagedHistoryChatAdapter;
    exports.ParticipantMetadata = ParticipantMetadata;
    exports.ParticipantResponse = ParticipantResponse;
    exports.User = User;
    exports.Window = Window;
    exports.WindowButton = WindowButton;
    exports.WindowOption = WindowOption;
    exports.ɵa = NgChat;
    exports.ɵb = EmojifyPipe;
    exports.ɵc = LinkfyPipe;
    exports.ɵd = SanitizePipe;
    exports.ɵe = SecurePipe;
    exports.ɵf = GroupMessageDisplayNamePipe;
    exports.ɵg = NgChatOptionsComponent;
    exports.ɵh = NgChatWindowOptionsComponent;
    exports.ɵi = NgChatFriendsListComponent;
    exports.ɵj = NgChatWindowComponent;

    Object.defineProperty(exports, '__esModule', { value: true });

})));
//# sourceMappingURL=ng-chat.umd.js.map
