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
            console.log('secure pipe');
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2VjdXJlLnBpcGUuanMiLCJzb3VyY2VSb290Ijoibmc6Ly9uZy1jaGF0LyIsInNvdXJjZXMiOlsibmctY2hhdC9waXBlcy9zZWN1cmUucGlwZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUEsT0FBTyxFQUFFLElBQUksRUFBaUIsTUFBTSxlQUFlLENBQUM7QUFFcEQsT0FBTyxFQUFFLFVBQVUsRUFBRSxNQUFNLHNCQUFzQixDQUFDO0FBQ2xELE9BQU8sRUFBRSxVQUFVLEVBQUUsTUFBTSxNQUFNLENBQUM7QUFFbEM7O0VBRUU7QUFFRjtJQUVJLG9CQUFvQixJQUFnQjtRQUFoQixTQUFJLEdBQUosSUFBSSxDQUFZO0lBQUksQ0FBQztJQUV6Qyw4QkFBUyxHQUFULFVBQVUsR0FBVztRQUFyQixpQkFvQkM7UUFsQkMsT0FBTyxJQUFJLFVBQVUsQ0FBcUIsVUFBQyxRQUFRO1lBQ2pELDZCQUE2QjtZQUM3QixRQUFRLENBQUMsSUFBSSxDQUFDLDRFQUE0RSxDQUFDLENBQUM7WUFFNUYsaURBQWlEO1lBQzFDLElBQUEsb0JBQUksRUFBRSxzQkFBSyxDQUFhO1lBQy9CLE9BQU8sQ0FBQyxHQUFHLENBQUMsYUFBYSxDQUFDLENBQUM7WUFDM0IsS0FBSSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxFQUFFLEVBQUMsWUFBWSxFQUFFLE1BQU0sRUFBQyxDQUFDLENBQUMsU0FBUyxDQUFDLFVBQUEsUUFBUTtnQkFDM0QsSUFBTSxNQUFNLEdBQUcsSUFBSSxVQUFVLEVBQUUsQ0FBQztnQkFDaEMsTUFBTSxDQUFDLGFBQWEsQ0FBQyxRQUFRLENBQUMsQ0FBQztnQkFDL0IsTUFBTSxDQUFDLFNBQVMsR0FBRztvQkFDZixJQUFHLE1BQU0sQ0FBQyxNQUFNLElBQUksSUFBSTt3QkFDdEIsUUFBUSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUM7Z0JBQ25DLENBQUMsQ0FBQztZQUNKLENBQUMsQ0FBQyxDQUFDO1lBRUgsT0FBTyxFQUFDLFdBQVcsZ0JBQU0sQ0FBQyxFQUFDLENBQUM7UUFDOUIsQ0FBQyxDQUFDLENBQUM7SUFDTCxDQUFDOztnQkF0QnlCLFVBQVU7O0lBRjNCLFVBQVU7UUFEdEIsSUFBSSxDQUFDLEVBQUMsSUFBSSxFQUFFLFFBQVEsRUFBQyxDQUFDO09BQ1YsVUFBVSxDQXlCcEI7SUFBRCxpQkFBQztDQUFBLEFBekJILElBeUJHO1NBekJVLFVBQVUiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBQaXBlLCBQaXBlVHJhbnNmb3JtIH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQgeyBEb21TYW5pdGl6ZXIsIFNhZmVSZXNvdXJjZVVybCAgfSBmcm9tICdAYW5ndWxhci9wbGF0Zm9ybS1icm93c2VyJztcbmltcG9ydCB7IEh0dHBDbGllbnQgfSBmcm9tICdAYW5ndWxhci9jb21tb24vaHR0cCc7XG5pbXBvcnQgeyBPYnNlcnZhYmxlIH0gZnJvbSAncnhqcyc7XG5cbi8qXG4gKiBTYW5pdGl6ZXMgYW4gVVJMIHJlc291cmNlXG4qL1xuQFBpcGUoe25hbWU6ICdzZWN1cmUnfSlcbmV4cG9ydCBjbGFzcyBTZWN1cmVQaXBlIGltcGxlbWVudHMgUGlwZVRyYW5zZm9ybSB7XG5cbiAgICBjb25zdHJ1Y3Rvcihwcml2YXRlIGh0dHA6IEh0dHBDbGllbnQpIHsgfVxuICBcbiAgICB0cmFuc2Zvcm0odXJsOiBzdHJpbmcpIHtcbiAgXG4gICAgICByZXR1cm4gbmV3IE9ic2VydmFibGU8c3RyaW5nfEFycmF5QnVmZmVyPigob2JzZXJ2ZXIpID0+IHtcbiAgICAgICAgLy8gVGhpcyBpcyBhIHRpbnkgYmxhbmsgaW1hZ2VcbiAgICAgICAgb2JzZXJ2ZXIubmV4dCgnZGF0YTppbWFnZS9naWY7YmFzZTY0LFIwbEdPRGxoQVFBQkFBQUFBQ0g1QkFFS0FBRUFMQUFBQUFBQkFBRUFBQUlDVEFFQU93PT0nKTtcbiAgXG4gICAgICAgIC8vIFRoZSBuZXh0IGFuZCBlcnJvciBjYWxsYmFja3MgZnJvbSB0aGUgb2JzZXJ2ZXJcbiAgICAgICAgY29uc3Qge25leHQsIGVycm9yfSA9IG9ic2VydmVyO1xuICAgICAgICBjb25zb2xlLmxvZygnc2VjdXJlIHBpcGUnKTtcbiAgICAgICAgdGhpcy5odHRwLmdldCh1cmwsIHtyZXNwb25zZVR5cGU6ICdibG9iJ30pLnN1YnNjcmliZShyZXNwb25zZSA9PiB7XG4gICAgICAgICAgY29uc3QgcmVhZGVyID0gbmV3IEZpbGVSZWFkZXIoKTtcbiAgICAgICAgICByZWFkZXIucmVhZEFzRGF0YVVSTChyZXNwb25zZSk7XG4gICAgICAgICAgcmVhZGVyLm9ubG9hZGVuZCA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICBpZihyZWFkZXIucmVzdWx0ICE9IG51bGwpXG4gICAgICAgICAgICAgICAgb2JzZXJ2ZXIubmV4dChyZWFkZXIucmVzdWx0KTtcbiAgICAgICAgICB9O1xuICAgICAgICB9KTtcbiAgXG4gICAgICAgIHJldHVybiB7dW5zdWJzY3JpYmUoKSB7ICB9fTtcbiAgICAgIH0pO1xuICAgIH1cbiAgfVxuIl19