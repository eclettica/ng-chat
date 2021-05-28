import { Observable } from 'rxjs';
import { User } from './user';
import { Message } from './message';
import { Window } from './window';

export interface IFileUploadAdapter
{
    uploadFile(file: File, participantId: any, window?: Window): Observable<Message>;
}
