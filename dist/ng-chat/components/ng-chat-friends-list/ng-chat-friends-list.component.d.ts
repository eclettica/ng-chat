import { EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { Localization } from '../../core/localization';
import { IChatOption } from '../../core/chat-option';
import { ChatParticipantStatus } from "../../core/chat-participant-status.enum";
import { IChatParticipant } from "../../core/chat-participant";
import { User } from "../../core/user";
import { Window } from "../../core/window";
import { ParticipantResponse } from "../../core/participant-response";
import { chatParticipantStatusDescriptor } from '../../core/chat-participant-status-descriptor';
export declare class NgChatFriendsListComponent implements OnChanges {
    constructor();
    participants: IChatParticipant[];
    participantsResponse: ParticipantResponse[];
    participantsInteractedWith: IChatParticipant[];
    windows: Window[];
    userId: any;
    localization: Localization;
    shouldDisplay: boolean;
    isCollapsed: boolean;
    searchEnabled: boolean;
    currentActiveOption: IChatOption | null;
    onParticipantClicked: EventEmitter<IChatParticipant>;
    onOptionPromptCanceled: EventEmitter<any>;
    onOptionPromptConfirmed: EventEmitter<any>;
    selectedUsersFromFriendsList: User[];
    searchInput: string;
    ChatParticipantStatus: typeof ChatParticipantStatus;
    chatParticipantStatusDescriptor: typeof chatParticipantStatusDescriptor;
    ngOnChanges(changes: SimpleChanges): void;
    get filteredParticipants(): IChatParticipant[];
    isUserSelectedFromFriendsList(user: User): boolean;
    unreadMessagesTotalByParticipant(participant: IChatParticipant): string;
    cleanUpUserSelection: () => any[];
    onChatTitleClicked(): void;
    onFriendsListCheckboxChange(selectedUser: User, isChecked: boolean): void;
    onUserClick(clickedUser: User): void;
    onFriendsListActionCancelClicked(): void;
    onFriendsListActionConfirmClicked(): void;
}
