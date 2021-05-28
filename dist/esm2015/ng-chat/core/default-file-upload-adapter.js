export class DefaultFileUploadAdapter {
    /**
     * @summary Basic file upload adapter implementation for HTTP request form file consumption
     * @param _serverEndpointUrl The API endpoint full qualified address that will receive a form file to process and return the metadata.
     */
    constructor(_serverEndpointUrl, _http) {
        this._serverEndpointUrl = _serverEndpointUrl;
        this._http = _http;
    }
    uploadFile(file, participantId, window) {
        const formData = new FormData();
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
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGVmYXVsdC1maWxlLXVwbG9hZC1hZGFwdGVyLmpzIiwic291cmNlUm9vdCI6Im5nOi8vbmctY2hhdC8iLCJzb3VyY2VzIjpbIm5nLWNoYXQvY29yZS9kZWZhdWx0LWZpbGUtdXBsb2FkLWFkYXB0ZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBUUEsTUFBTSxPQUFPLHdCQUF3QjtJQUVqQzs7O09BR0c7SUFDSCxZQUFvQixrQkFBMEIsRUFBVSxLQUFpQjtRQUFyRCx1QkFBa0IsR0FBbEIsa0JBQWtCLENBQVE7UUFBVSxVQUFLLEdBQUwsS0FBSyxDQUFZO0lBQ3pFLENBQUM7SUFFRCxVQUFVLENBQUMsSUFBVSxFQUFFLGFBQWtCLEVBQUUsTUFBZTtRQUN0RCxNQUFNLFFBQVEsR0FBYSxJQUFJLFFBQVEsRUFBRSxDQUFDO1FBRTFDLDBEQUEwRDtRQUMxRCxRQUFRLENBQUMsTUFBTSxDQUFDLHdCQUF3QixFQUFFLGFBQWEsQ0FBQyxDQUFDO1FBQ3pELFFBQVEsQ0FBQyxNQUFNLENBQUMsTUFBTSxFQUFFLElBQUksRUFBRSxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7UUFFekMsT0FBTyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBVSxJQUFJLENBQUMsa0JBQWtCLEVBQUUsUUFBUSxDQUFDLENBQUM7UUFFbkUsc0lBQXNJO1FBQ3RJLG1GQUFtRjtRQUNuRiwyQkFBMkI7UUFDM0IsTUFBTTtRQUVOLGdEQUFnRDtRQUNoRCxzREFBc0Q7UUFFdEQsaURBQWlEO1FBRWpELGFBQWE7UUFDYiw0QkFBNEI7UUFDNUIsNEJBQTRCO1FBQzVCLDZEQUE2RDtRQUM3RCxlQUFlO1FBQ2YsbUZBQW1GO1FBRW5GLG1EQUFtRDtRQUNuRCxlQUFlO1FBQ2YscURBQXFEO1FBQ3JELGVBQWU7UUFFZiw0Q0FBNEM7UUFDNUMsZUFBZTtRQUNmLFVBQVU7SUFDZCxDQUFDO0NBQ0oiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBJRmlsZVVwbG9hZEFkYXB0ZXIgfSBmcm9tICcuL2ZpbGUtdXBsb2FkLWFkYXB0ZXInO1xuaW1wb3J0IHsgSHR0cENsaWVudCwgSHR0cFJlcXVlc3QsIEh0dHBFdmVudFR5cGUsIEh0dHBSZXNwb25zZSwgSHR0cEhlYWRlcnMgfSBmcm9tICdAYW5ndWxhci9jb21tb24vaHR0cCc7XG5pbXBvcnQgeyBPYnNlcnZhYmxlLCBTdWJqZWN0IH0gZnJvbSAncnhqcyc7XG5pbXBvcnQgeyBVc2VyIH0gZnJvbSAnLi91c2VyJztcbmltcG9ydCB7IE1lc3NhZ2UgfSBmcm9tICcuL21lc3NhZ2UnO1xuaW1wb3J0IHsgV2luZG93IH0gZnJvbSAnLi93aW5kb3cnO1xuXG5cbmV4cG9ydCBjbGFzcyBEZWZhdWx0RmlsZVVwbG9hZEFkYXB0ZXIgaW1wbGVtZW50cyBJRmlsZVVwbG9hZEFkYXB0ZXJcbntcbiAgICAvKipcbiAgICAgKiBAc3VtbWFyeSBCYXNpYyBmaWxlIHVwbG9hZCBhZGFwdGVyIGltcGxlbWVudGF0aW9uIGZvciBIVFRQIHJlcXVlc3QgZm9ybSBmaWxlIGNvbnN1bXB0aW9uXG4gICAgICogQHBhcmFtIF9zZXJ2ZXJFbmRwb2ludFVybCBUaGUgQVBJIGVuZHBvaW50IGZ1bGwgcXVhbGlmaWVkIGFkZHJlc3MgdGhhdCB3aWxsIHJlY2VpdmUgYSBmb3JtIGZpbGUgdG8gcHJvY2VzcyBhbmQgcmV0dXJuIHRoZSBtZXRhZGF0YS5cbiAgICAgKi9cbiAgICBjb25zdHJ1Y3Rvcihwcml2YXRlIF9zZXJ2ZXJFbmRwb2ludFVybDogc3RyaW5nLCBwcml2YXRlIF9odHRwOiBIdHRwQ2xpZW50KSB7XG4gICAgfVxuXG4gICAgdXBsb2FkRmlsZShmaWxlOiBGaWxlLCBwYXJ0aWNpcGFudElkOiBhbnksIHdpbmRvdz86IFdpbmRvdyk6IE9ic2VydmFibGU8TWVzc2FnZT4ge1xuICAgICAgICBjb25zdCBmb3JtRGF0YTogRm9ybURhdGEgPSBuZXcgRm9ybURhdGEoKTtcblxuICAgICAgICAvL2Zvcm1EYXRhLmFwcGVuZCgnbmctY2hhdC1zZW5kZXItdXNlcmlkJywgY3VycmVudFVzZXJJZCk7XG4gICAgICAgIGZvcm1EYXRhLmFwcGVuZCgnbmctY2hhdC1wYXJ0aWNpcGFudC1pZCcsIHBhcnRpY2lwYW50SWQpO1xuICAgICAgICBmb3JtRGF0YS5hcHBlbmQoJ2ZpbGUnLCBmaWxlLCBmaWxlLm5hbWUpO1xuXG4gICAgICAgIHJldHVybiB0aGlzLl9odHRwLnBvc3Q8TWVzc2FnZT4odGhpcy5fc2VydmVyRW5kcG9pbnRVcmwsIGZvcm1EYXRhKTtcblxuICAgICAgICAvLyBUT0RPOiBMZWF2aW5nIHRoaXMgaWYgd2Ugd2FudCB0byB0cmFjayB1cGxvYWQgcHJvZ3Jlc3MgaW4gZGV0YWlsIGluIHRoZSBmdXR1cmUuIE1pZ2h0IG5lZWQgYSBkaWZmZXJlbnQgU3ViamVjdCBnZW5lcmljIHR5cGUgd3JhcHBlclxuICAgICAgICAvLyBjb25zdCBmaWxlUmVxdWVzdCA9IG5ldyBIdHRwUmVxdWVzdCgnUE9TVCcsIHRoaXMuX3NlcnZlckVuZHBvaW50VXJsLCBmb3JtRGF0YSwge1xuICAgICAgICAvLyAgICAgcmVwb3J0UHJvZ3Jlc3M6IHRydWVcbiAgICAgICAgLy8gfSk7XG5cbiAgICAgICAgLy8gY29uc3QgdXBsb2FkUHJvZ3Jlc3MgPSBuZXcgU3ViamVjdDxudW1iZXI+KCk7XG4gICAgICAgIC8vIGNvbnN0IHVwbG9hZFN0YXR1cyA9IHVwbG9hZFByb2dyZXNzLmFzT2JzZXJ2YWJsZSgpO1xuXG4gICAgICAgIC8vY29uc3QgcmVzcG9uc2VQcm9taXNlID0gbmV3IFN1YmplY3Q8TWVzc2FnZT4oKTtcblxuICAgICAgICAvLyB0aGlzLl9odHRwXG4gICAgICAgIC8vICAgICAucmVxdWVzdChmaWxlUmVxdWVzdClcbiAgICAgICAgLy8gICAgIC5zdWJzY3JpYmUoZXZlbnQgPT4ge1xuICAgICAgICAvLyAgICAgICAgIC8vIGlmIChldmVudC50eXBlID09IEh0dHBFdmVudFR5cGUuVXBsb2FkUHJvZ3Jlc3MpXG4gICAgICAgIC8vICAgICAgICAgLy8ge1xuICAgICAgICAvLyAgICAgICAgIC8vICAgICBjb25zdCBwZXJjZW50RG9uZSA9IE1hdGgucm91bmQoMTAwICogZXZlbnQubG9hZGVkIC8gZXZlbnQudG90YWwpO1xuXG4gICAgICAgIC8vICAgICAgICAgLy8gICAgIHVwbG9hZFByb2dyZXNzLm5leHQocGVyY2VudERvbmUpO1xuICAgICAgICAvLyAgICAgICAgIC8vIH1cbiAgICAgICAgLy8gICAgICAgICAvLyBlbHNlIGlmIChldmVudCBpbnN0YW5jZW9mIEh0dHBSZXNwb25zZSlcbiAgICAgICAgLy8gICAgICAgICAvLyB7XG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAvLyAgICAgICAgIC8vICAgICB1cGxvYWRQcm9ncmVzcy5jb21wbGV0ZSgpO1xuICAgICAgICAvLyAgICAgICAgIC8vIH1cbiAgICAgICAgLy8gICAgIH0pO1xuICAgIH1cbn1cbiJdfQ==