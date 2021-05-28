import { Observable } from 'rxjs';
import { Message } from './message';
import { Window } from './window';
export interface IFileUploadAdapter {
    uploadFile(file: File, participantId: any, window?: Window): Observable<Message>;
}
