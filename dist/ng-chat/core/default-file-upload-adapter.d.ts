import { IFileUploadAdapter } from './file-upload-adapter';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Message } from './message';
export declare class DefaultFileUploadAdapter implements IFileUploadAdapter {
    private _serverEndpointUrl;
    private _http;
    /**
     * @summary Basic file upload adapter implementation for HTTP request form file consumption
     * @param _serverEndpointUrl The API endpoint full qualified address that will receive a form file to process and return the metadata.
     */
    constructor(_serverEndpointUrl: string, _http: HttpClient);
    uploadFile(file: File, participantId: any): Observable<Message>;
}
