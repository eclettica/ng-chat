import { __decorate } from "tslib";
import { Pipe } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { DomSanitizer } from '@angular/platform-browser';
/*
 * Sanitizes an URL resource
*/
let SecurePipe = class SecurePipe {
    constructor(http, sanitizer) {
        this.http = http;
        this.sanitizer = sanitizer;
    }
    transform(url) {
        return new Observable((observer) => {
            // This is a tiny blank image
            observer.next('data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==');
            // The next and error callbacks from the observer
            const { next, error } = observer;
            console.log('secure pipe');
            this.http.get(url, { responseType: 'blob' }).subscribe(response => {
                const reader = new FileReader();
                reader.readAsDataURL(response);
                reader.onloadend = () => {
                    if (reader.result != null) {
                        let res = reader.result;
                        res = this.sanitizer.bypassSecurityTrustUrl(URL.createObjectURL(res));
                        observer.next(res);
                    }
                };
            });
            return { unsubscribe() { } };
        });
    }
};
SecurePipe.ctorParameters = () => [
    { type: HttpClient },
    { type: DomSanitizer }
];
SecurePipe = __decorate([
    Pipe({ name: 'secure' })
], SecurePipe);
export { SecurePipe };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2VjdXJlLnBpcGUuanMiLCJzb3VyY2VSb290Ijoibmc6Ly9uZy1jaGF0LyIsInNvdXJjZXMiOlsibmctY2hhdC9waXBlcy9zZWN1cmUucGlwZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUEsT0FBTyxFQUFFLElBQUksRUFBaUIsTUFBTSxlQUFlLENBQUM7QUFDcEQsT0FBTyxFQUFFLFVBQVUsRUFBRSxNQUFNLHNCQUFzQixDQUFDO0FBQ2xELE9BQU8sRUFBRSxVQUFVLEVBQUUsTUFBTSxNQUFNLENBQUM7QUFDbEMsT0FBTyxFQUFFLFlBQVksRUFBRSxNQUFNLDJCQUEyQixDQUFDO0FBRXpEOztFQUVFO0FBRUYsSUFBYSxVQUFVLEdBQXZCLE1BQWEsVUFBVTtJQUVuQixZQUFvQixJQUFnQixFQUMxQixTQUF1QjtRQURiLFNBQUksR0FBSixJQUFJLENBQVk7UUFDMUIsY0FBUyxHQUFULFNBQVMsQ0FBYztJQUMzQixDQUFDO0lBRVAsU0FBUyxDQUFDLEdBQVc7UUFFbkIsT0FBTyxJQUFJLFVBQVUsQ0FBcUIsQ0FBQyxRQUFRLEVBQUUsRUFBRTtZQUNyRCw2QkFBNkI7WUFDN0IsUUFBUSxDQUFDLElBQUksQ0FBQyw0RUFBNEUsQ0FBQyxDQUFDO1lBRTVGLGlEQUFpRDtZQUNqRCxNQUFNLEVBQUMsSUFBSSxFQUFFLEtBQUssRUFBQyxHQUFHLFFBQVEsQ0FBQztZQUMvQixPQUFPLENBQUMsR0FBRyxDQUFDLGFBQWEsQ0FBQyxDQUFDO1lBQzNCLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsRUFBRSxFQUFDLFlBQVksRUFBRSxNQUFNLEVBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxRQUFRLENBQUMsRUFBRTtnQkFDOUQsTUFBTSxNQUFNLEdBQUcsSUFBSSxVQUFVLEVBQUUsQ0FBQztnQkFDaEMsTUFBTSxDQUFDLGFBQWEsQ0FBQyxRQUFRLENBQUMsQ0FBQztnQkFDL0IsTUFBTSxDQUFDLFNBQVMsR0FBRyxHQUFHLEVBQUU7b0JBQ3BCLElBQUcsTUFBTSxDQUFDLE1BQU0sSUFBSSxJQUFJLEVBQUU7d0JBQ3hCLElBQUksR0FBRyxHQUFRLE1BQU0sQ0FBQyxNQUFNLENBQUM7d0JBQzdCLEdBQUcsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLHNCQUFzQixDQUFDLEdBQUcsQ0FBQyxlQUFlLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQTt3QkFDckUsUUFBUSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQztxQkFDcEI7Z0JBRUwsQ0FBQyxDQUFDO1lBQ0osQ0FBQyxDQUFDLENBQUM7WUFFSCxPQUFPLEVBQUMsV0FBVyxLQUFNLENBQUMsRUFBQyxDQUFDO1FBQzlCLENBQUMsQ0FBQyxDQUFDO0lBQ0wsQ0FBQztDQUNGLENBQUE7O1lBN0IyQixVQUFVO1lBQ2YsWUFBWTs7QUFIeEIsVUFBVTtJQUR0QixJQUFJLENBQUMsRUFBQyxJQUFJLEVBQUUsUUFBUSxFQUFDLENBQUM7R0FDVixVQUFVLENBK0JwQjtTQS9CVSxVQUFVIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgUGlwZSwgUGlwZVRyYW5zZm9ybSB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHsgSHR0cENsaWVudCB9IGZyb20gJ0Bhbmd1bGFyL2NvbW1vbi9odHRwJztcbmltcG9ydCB7IE9ic2VydmFibGUgfSBmcm9tICdyeGpzJztcbmltcG9ydCB7IERvbVNhbml0aXplciB9IGZyb20gJ0Bhbmd1bGFyL3BsYXRmb3JtLWJyb3dzZXInO1xuXG4vKlxuICogU2FuaXRpemVzIGFuIFVSTCByZXNvdXJjZVxuKi9cbkBQaXBlKHtuYW1lOiAnc2VjdXJlJ30pXG5leHBvcnQgY2xhc3MgU2VjdXJlUGlwZSBpbXBsZW1lbnRzIFBpcGVUcmFuc2Zvcm0ge1xuXG4gICAgY29uc3RydWN0b3IocHJpdmF0ZSBodHRwOiBIdHRwQ2xpZW50LFxuICAgICAgcHJpdmF0ZSBzYW5pdGl6ZXI6IERvbVNhbml0aXplcixcbiAgICAgICkgeyB9XG4gIFxuICAgIHRyYW5zZm9ybSh1cmw6IHN0cmluZykge1xuICBcbiAgICAgIHJldHVybiBuZXcgT2JzZXJ2YWJsZTxzdHJpbmd8QXJyYXlCdWZmZXI+KChvYnNlcnZlcikgPT4ge1xuICAgICAgICAvLyBUaGlzIGlzIGEgdGlueSBibGFuayBpbWFnZVxuICAgICAgICBvYnNlcnZlci5uZXh0KCdkYXRhOmltYWdlL2dpZjtiYXNlNjQsUjBsR09EbGhBUUFCQUFBQUFDSDVCQUVLQUFFQUxBQUFBQUFCQUFFQUFBSUNUQUVBT3c9PScpO1xuICBcbiAgICAgICAgLy8gVGhlIG5leHQgYW5kIGVycm9yIGNhbGxiYWNrcyBmcm9tIHRoZSBvYnNlcnZlclxuICAgICAgICBjb25zdCB7bmV4dCwgZXJyb3J9ID0gb2JzZXJ2ZXI7XG4gICAgICAgIGNvbnNvbGUubG9nKCdzZWN1cmUgcGlwZScpO1xuICAgICAgICB0aGlzLmh0dHAuZ2V0KHVybCwge3Jlc3BvbnNlVHlwZTogJ2Jsb2InfSkuc3Vic2NyaWJlKHJlc3BvbnNlID0+IHtcbiAgICAgICAgICBjb25zdCByZWFkZXIgPSBuZXcgRmlsZVJlYWRlcigpO1xuICAgICAgICAgIHJlYWRlci5yZWFkQXNEYXRhVVJMKHJlc3BvbnNlKTtcbiAgICAgICAgICByZWFkZXIub25sb2FkZW5kID0gKCkgPT4ge1xuICAgICAgICAgICAgICBpZihyZWFkZXIucmVzdWx0ICE9IG51bGwpIHtcbiAgICAgICAgICAgICAgICBsZXQgcmVzOiBhbnkgPSByZWFkZXIucmVzdWx0O1xuICAgICAgICAgICAgICAgIHJlcyA9IHRoaXMuc2FuaXRpemVyLmJ5cGFzc1NlY3VyaXR5VHJ1c3RVcmwoVVJMLmNyZWF0ZU9iamVjdFVSTChyZXMpKVxuICAgICAgICAgICAgICAgIG9ic2VydmVyLm5leHQocmVzKTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgIH07XG4gICAgICAgIH0pO1xuICBcbiAgICAgICAgcmV0dXJuIHt1bnN1YnNjcmliZSgpIHsgIH19O1xuICAgICAgfSk7XG4gICAgfVxuICB9XG4iXX0=