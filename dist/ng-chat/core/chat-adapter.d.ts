import { Observable } from 'rxjs';
import { Message } from "./message";
import { ParticipantResponse } from "./participant-response";
import { IChatParticipant } from './chat-participant';
export declare abstract class ChatAdapter {
    abstract listFriends(): Observable<ParticipantResponse[]>;
    abstract getMessageHistory(destinataryId: any): Observable<Message[]>;
    abstract sendMessage(message: Message): void;
    onFriendsListChanged(participantsResponse: ParticipantResponse[]): void;
    onMessageReceived(participant: IChatParticipant, message: Message): void;
    /** @internal */
    friendsListChangedHandler: (participantsResponse: ParticipantResponse[]) => void;
    /** @internal */
    messageReceivedHandler: (participant: IChatParticipant, message: Message) => void;
}
