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
export { DefaultFileUploadAdapter };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGVmYXVsdC1maWxlLXVwbG9hZC1hZGFwdGVyLmpzIiwic291cmNlUm9vdCI6Im5nOi8vbmctY2hhdC8iLCJzb3VyY2VzIjpbIm5nLWNoYXQvY29yZS9kZWZhdWx0LWZpbGUtdXBsb2FkLWFkYXB0ZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBUUE7SUFFSTs7O09BR0c7SUFDSCxrQ0FBb0Isa0JBQTBCLEVBQVUsS0FBaUI7UUFBckQsdUJBQWtCLEdBQWxCLGtCQUFrQixDQUFRO1FBQVUsVUFBSyxHQUFMLEtBQUssQ0FBWTtJQUN6RSxDQUFDO0lBRUQsNkNBQVUsR0FBVixVQUFXLElBQVUsRUFBRSxhQUFrQixFQUFFLE1BQWU7UUFDdEQsSUFBTSxRQUFRLEdBQWEsSUFBSSxRQUFRLEVBQUUsQ0FBQztRQUUxQywwREFBMEQ7UUFDMUQsUUFBUSxDQUFDLE1BQU0sQ0FBQyx3QkFBd0IsRUFBRSxhQUFhLENBQUMsQ0FBQztRQUN6RCxRQUFRLENBQUMsTUFBTSxDQUFDLE1BQU0sRUFBRSxJQUFJLEVBQUUsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO1FBRXpDLE9BQU8sSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQVUsSUFBSSxDQUFDLGtCQUFrQixFQUFFLFFBQVEsQ0FBQyxDQUFDO1FBRW5FLHNJQUFzSTtRQUN0SSxtRkFBbUY7UUFDbkYsMkJBQTJCO1FBQzNCLE1BQU07UUFFTixnREFBZ0Q7UUFDaEQsc0RBQXNEO1FBRXRELGlEQUFpRDtRQUVqRCxhQUFhO1FBQ2IsNEJBQTRCO1FBQzVCLDRCQUE0QjtRQUM1Qiw2REFBNkQ7UUFDN0QsZUFBZTtRQUNmLG1GQUFtRjtRQUVuRixtREFBbUQ7UUFDbkQsZUFBZTtRQUNmLHFEQUFxRDtRQUNyRCxlQUFlO1FBRWYsNENBQTRDO1FBQzVDLGVBQWU7UUFDZixVQUFVO0lBQ2QsQ0FBQztJQUNMLCtCQUFDO0FBQUQsQ0FBQyxBQTVDRCxJQTRDQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IElGaWxlVXBsb2FkQWRhcHRlciB9IGZyb20gJy4vZmlsZS11cGxvYWQtYWRhcHRlcic7XG5pbXBvcnQgeyBIdHRwQ2xpZW50LCBIdHRwUmVxdWVzdCwgSHR0cEV2ZW50VHlwZSwgSHR0cFJlc3BvbnNlLCBIdHRwSGVhZGVycyB9IGZyb20gJ0Bhbmd1bGFyL2NvbW1vbi9odHRwJztcbmltcG9ydCB7IE9ic2VydmFibGUsIFN1YmplY3QgfSBmcm9tICdyeGpzJztcbmltcG9ydCB7IFVzZXIgfSBmcm9tICcuL3VzZXInO1xuaW1wb3J0IHsgTWVzc2FnZSB9IGZyb20gJy4vbWVzc2FnZSc7XG5pbXBvcnQgeyBXaW5kb3cgfSBmcm9tICcuL3dpbmRvdyc7XG5cblxuZXhwb3J0IGNsYXNzIERlZmF1bHRGaWxlVXBsb2FkQWRhcHRlciBpbXBsZW1lbnRzIElGaWxlVXBsb2FkQWRhcHRlclxue1xuICAgIC8qKlxuICAgICAqIEBzdW1tYXJ5IEJhc2ljIGZpbGUgdXBsb2FkIGFkYXB0ZXIgaW1wbGVtZW50YXRpb24gZm9yIEhUVFAgcmVxdWVzdCBmb3JtIGZpbGUgY29uc3VtcHRpb25cbiAgICAgKiBAcGFyYW0gX3NlcnZlckVuZHBvaW50VXJsIFRoZSBBUEkgZW5kcG9pbnQgZnVsbCBxdWFsaWZpZWQgYWRkcmVzcyB0aGF0IHdpbGwgcmVjZWl2ZSBhIGZvcm0gZmlsZSB0byBwcm9jZXNzIGFuZCByZXR1cm4gdGhlIG1ldGFkYXRhLlxuICAgICAqL1xuICAgIGNvbnN0cnVjdG9yKHByaXZhdGUgX3NlcnZlckVuZHBvaW50VXJsOiBzdHJpbmcsIHByaXZhdGUgX2h0dHA6IEh0dHBDbGllbnQpIHtcbiAgICB9XG5cbiAgICB1cGxvYWRGaWxlKGZpbGU6IEZpbGUsIHBhcnRpY2lwYW50SWQ6IGFueSwgd2luZG93PzogV2luZG93KTogT2JzZXJ2YWJsZTxNZXNzYWdlPiB7XG4gICAgICAgIGNvbnN0IGZvcm1EYXRhOiBGb3JtRGF0YSA9IG5ldyBGb3JtRGF0YSgpO1xuXG4gICAgICAgIC8vZm9ybURhdGEuYXBwZW5kKCduZy1jaGF0LXNlbmRlci11c2VyaWQnLCBjdXJyZW50VXNlcklkKTtcbiAgICAgICAgZm9ybURhdGEuYXBwZW5kKCduZy1jaGF0LXBhcnRpY2lwYW50LWlkJywgcGFydGljaXBhbnRJZCk7XG4gICAgICAgIGZvcm1EYXRhLmFwcGVuZCgnZmlsZScsIGZpbGUsIGZpbGUubmFtZSk7XG5cbiAgICAgICAgcmV0dXJuIHRoaXMuX2h0dHAucG9zdDxNZXNzYWdlPih0aGlzLl9zZXJ2ZXJFbmRwb2ludFVybCwgZm9ybURhdGEpO1xuXG4gICAgICAgIC8vIFRPRE86IExlYXZpbmcgdGhpcyBpZiB3ZSB3YW50IHRvIHRyYWNrIHVwbG9hZCBwcm9ncmVzcyBpbiBkZXRhaWwgaW4gdGhlIGZ1dHVyZS4gTWlnaHQgbmVlZCBhIGRpZmZlcmVudCBTdWJqZWN0IGdlbmVyaWMgdHlwZSB3cmFwcGVyXG4gICAgICAgIC8vIGNvbnN0IGZpbGVSZXF1ZXN0ID0gbmV3IEh0dHBSZXF1ZXN0KCdQT1NUJywgdGhpcy5fc2VydmVyRW5kcG9pbnRVcmwsIGZvcm1EYXRhLCB7XG4gICAgICAgIC8vICAgICByZXBvcnRQcm9ncmVzczogdHJ1ZVxuICAgICAgICAvLyB9KTtcblxuICAgICAgICAvLyBjb25zdCB1cGxvYWRQcm9ncmVzcyA9IG5ldyBTdWJqZWN0PG51bWJlcj4oKTtcbiAgICAgICAgLy8gY29uc3QgdXBsb2FkU3RhdHVzID0gdXBsb2FkUHJvZ3Jlc3MuYXNPYnNlcnZhYmxlKCk7XG5cbiAgICAgICAgLy9jb25zdCByZXNwb25zZVByb21pc2UgPSBuZXcgU3ViamVjdDxNZXNzYWdlPigpO1xuXG4gICAgICAgIC8vIHRoaXMuX2h0dHBcbiAgICAgICAgLy8gICAgIC5yZXF1ZXN0KGZpbGVSZXF1ZXN0KVxuICAgICAgICAvLyAgICAgLnN1YnNjcmliZShldmVudCA9PiB7XG4gICAgICAgIC8vICAgICAgICAgLy8gaWYgKGV2ZW50LnR5cGUgPT0gSHR0cEV2ZW50VHlwZS5VcGxvYWRQcm9ncmVzcylcbiAgICAgICAgLy8gICAgICAgICAvLyB7XG4gICAgICAgIC8vICAgICAgICAgLy8gICAgIGNvbnN0IHBlcmNlbnREb25lID0gTWF0aC5yb3VuZCgxMDAgKiBldmVudC5sb2FkZWQgLyBldmVudC50b3RhbCk7XG5cbiAgICAgICAgLy8gICAgICAgICAvLyAgICAgdXBsb2FkUHJvZ3Jlc3MubmV4dChwZXJjZW50RG9uZSk7XG4gICAgICAgIC8vICAgICAgICAgLy8gfVxuICAgICAgICAvLyAgICAgICAgIC8vIGVsc2UgaWYgKGV2ZW50IGluc3RhbmNlb2YgSHR0cFJlc3BvbnNlKVxuICAgICAgICAvLyAgICAgICAgIC8vIHtcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgIC8vICAgICAgICAgLy8gICAgIHVwbG9hZFByb2dyZXNzLmNvbXBsZXRlKCk7XG4gICAgICAgIC8vICAgICAgICAgLy8gfVxuICAgICAgICAvLyAgICAgfSk7XG4gICAgfVxufVxuIl19