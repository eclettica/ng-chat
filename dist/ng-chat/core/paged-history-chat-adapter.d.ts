import { Observable } from 'rxjs';
import { Message } from "./message";
import { ChatAdapter } from "./chat-adapter";
import { Window } from './window';
/**
 * @description Chat Adapter decorator class that adds pagination to load the history of messagesr.
 * You will need an existing @see ChatAdapter implementation
 */
export declare abstract class PagedHistoryChatAdapter extends ChatAdapter {
    abstract getMessageHistoryByPage(destinataryId: any, size: number, page: number, window?: Window | null | undefined): Observable<Message[]>;
}
