import { __decorate } from "tslib";
import { Pipe } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
/*
 * Sanitizes an URL resource
*/
var SecurePipe = /** @class */ (function () {
    function SecurePipe(http) {
        this.http = http;
    }
    SecurePipe.prototype.transform = function (url) {
        var _this = this;
        return new Observable(function (observer) {
            // This is a tiny blank image
            observer.next('data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==');
            // The next and error callbacks from the observer
            var next = observer.next, error = observer.error;
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
        { type: HttpClient }
    ]; };
    SecurePipe = __decorate([
        Pipe({ name: 'secure' })
    ], SecurePipe);
    return SecurePipe;
}());
export { SecurePipe };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2VjdXJlLnBpcGUuanMiLCJzb3VyY2VSb290Ijoibmc6Ly9uZy1jaGF0LyIsInNvdXJjZXMiOlsibmctY2hhdC9waXBlcy9zZWN1cmUucGlwZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUEsT0FBTyxFQUFFLElBQUksRUFBaUIsTUFBTSxlQUFlLENBQUM7QUFFcEQsT0FBTyxFQUFFLFVBQVUsRUFBRSxNQUFNLHNCQUFzQixDQUFDO0FBQ2xELE9BQU8sRUFBRSxVQUFVLEVBQUUsTUFBTSxNQUFNLENBQUM7QUFFbEM7O0VBRUU7QUFFRjtJQUVJLG9CQUFvQixJQUFnQjtRQUFoQixTQUFJLEdBQUosSUFBSSxDQUFZO0lBQUksQ0FBQztJQUV6Qyw4QkFBUyxHQUFULFVBQVUsR0FBVztRQUFyQixpQkFvQkM7UUFsQkMsT0FBTyxJQUFJLFVBQVUsQ0FBcUIsVUFBQyxRQUFRO1lBQ2pELDZCQUE2QjtZQUM3QixRQUFRLENBQUMsSUFBSSxDQUFDLDRFQUE0RSxDQUFDLENBQUM7WUFFNUYsaURBQWlEO1lBQzFDLElBQUEsb0JBQUksRUFBRSxzQkFBSyxDQUFhO1lBRS9CLEtBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsRUFBRSxFQUFDLFlBQVksRUFBRSxNQUFNLEVBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxVQUFBLFFBQVE7Z0JBQzNELElBQU0sTUFBTSxHQUFHLElBQUksVUFBVSxFQUFFLENBQUM7Z0JBQ2hDLE1BQU0sQ0FBQyxhQUFhLENBQUMsUUFBUSxDQUFDLENBQUM7Z0JBQy9CLE1BQU0sQ0FBQyxTQUFTLEdBQUc7b0JBQ2YsSUFBRyxNQUFNLENBQUMsTUFBTSxJQUFJLElBQUk7d0JBQ3RCLFFBQVEsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDO2dCQUNuQyxDQUFDLENBQUM7WUFDSixDQUFDLENBQUMsQ0FBQztZQUVILE9BQU8sRUFBQyxXQUFXLGdCQUFNLENBQUMsRUFBQyxDQUFDO1FBQzlCLENBQUMsQ0FBQyxDQUFDO0lBQ0wsQ0FBQzs7Z0JBdEJ5QixVQUFVOztJQUYzQixVQUFVO1FBRHRCLElBQUksQ0FBQyxFQUFDLElBQUksRUFBRSxRQUFRLEVBQUMsQ0FBQztPQUNWLFVBQVUsQ0F5QnBCO0lBQUQsaUJBQUM7Q0FBQSxBQXpCSCxJQXlCRztTQXpCVSxVQUFVIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgUGlwZSwgUGlwZVRyYW5zZm9ybSB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHsgRG9tU2FuaXRpemVyLCBTYWZlUmVzb3VyY2VVcmwgIH0gZnJvbSAnQGFuZ3VsYXIvcGxhdGZvcm0tYnJvd3Nlcic7XG5pbXBvcnQgeyBIdHRwQ2xpZW50IH0gZnJvbSAnQGFuZ3VsYXIvY29tbW9uL2h0dHAnO1xuaW1wb3J0IHsgT2JzZXJ2YWJsZSB9IGZyb20gJ3J4anMnO1xuXG4vKlxuICogU2FuaXRpemVzIGFuIFVSTCByZXNvdXJjZVxuKi9cbkBQaXBlKHtuYW1lOiAnc2VjdXJlJ30pXG5leHBvcnQgY2xhc3MgU2VjdXJlUGlwZSBpbXBsZW1lbnRzIFBpcGVUcmFuc2Zvcm0ge1xuXG4gICAgY29uc3RydWN0b3IocHJpdmF0ZSBodHRwOiBIdHRwQ2xpZW50KSB7IH1cbiAgXG4gICAgdHJhbnNmb3JtKHVybDogc3RyaW5nKSB7XG4gIFxuICAgICAgcmV0dXJuIG5ldyBPYnNlcnZhYmxlPHN0cmluZ3xBcnJheUJ1ZmZlcj4oKG9ic2VydmVyKSA9PiB7XG4gICAgICAgIC8vIFRoaXMgaXMgYSB0aW55IGJsYW5rIGltYWdlXG4gICAgICAgIG9ic2VydmVyLm5leHQoJ2RhdGE6aW1hZ2UvZ2lmO2Jhc2U2NCxSMGxHT0RsaEFRQUJBQUFBQUNINUJBRUtBQUVBTEFBQUFBQUJBQUVBQUFJQ1RBRUFPdz09Jyk7XG4gIFxuICAgICAgICAvLyBUaGUgbmV4dCBhbmQgZXJyb3IgY2FsbGJhY2tzIGZyb20gdGhlIG9ic2VydmVyXG4gICAgICAgIGNvbnN0IHtuZXh0LCBlcnJvcn0gPSBvYnNlcnZlcjtcbiAgXG4gICAgICAgIHRoaXMuaHR0cC5nZXQodXJsLCB7cmVzcG9uc2VUeXBlOiAnYmxvYid9KS5zdWJzY3JpYmUocmVzcG9uc2UgPT4ge1xuICAgICAgICAgIGNvbnN0IHJlYWRlciA9IG5ldyBGaWxlUmVhZGVyKCk7XG4gICAgICAgICAgcmVhZGVyLnJlYWRBc0RhdGFVUkwocmVzcG9uc2UpO1xuICAgICAgICAgIHJlYWRlci5vbmxvYWRlbmQgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgaWYocmVhZGVyLnJlc3VsdCAhPSBudWxsKVxuICAgICAgICAgICAgICAgIG9ic2VydmVyLm5leHQocmVhZGVyLnJlc3VsdCk7XG4gICAgICAgICAgfTtcbiAgICAgICAgfSk7XG4gIFxuICAgICAgICByZXR1cm4ge3Vuc3Vic2NyaWJlKCkgeyAgfX07XG4gICAgICB9KTtcbiAgICB9XG4gIH1cbiJdfQ==