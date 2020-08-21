import { __decorate } from "tslib";
import { Pipe } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { DomSanitizer } from '@angular/platform-browser';
/*
 * Sanitizes an URL resource
*/
var SecurePipe = /** @class */ (function () {
    function SecurePipe(http, sanitizer) {
        this.http = http;
        this.sanitizer = sanitizer;
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
                    if (reader.result != null) {
                        var res = reader.result;
                        res = _this.sanitizer.bypassSecurityTrustUrl(res);
                        observer.next(res);
                    }
                };
            });
            return { unsubscribe: function () { } };
        });
    };
    SecurePipe.ctorParameters = function () { return [
        { type: HttpClient },
        { type: DomSanitizer }
    ]; };
    SecurePipe = __decorate([
        Pipe({ name: 'secure' })
    ], SecurePipe);
    return SecurePipe;
}());
export { SecurePipe };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2VjdXJlLnBpcGUuanMiLCJzb3VyY2VSb290Ijoibmc6Ly9uZy1jaGF0LyIsInNvdXJjZXMiOlsibmctY2hhdC9waXBlcy9zZWN1cmUucGlwZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUEsT0FBTyxFQUFFLElBQUksRUFBaUIsTUFBTSxlQUFlLENBQUM7QUFDcEQsT0FBTyxFQUFFLFVBQVUsRUFBRSxNQUFNLHNCQUFzQixDQUFDO0FBQ2xELE9BQU8sRUFBRSxVQUFVLEVBQUUsTUFBTSxNQUFNLENBQUM7QUFDbEMsT0FBTyxFQUFFLFlBQVksRUFBRSxNQUFNLDJCQUEyQixDQUFDO0FBRXpEOztFQUVFO0FBRUY7SUFFSSxvQkFBb0IsSUFBZ0IsRUFDMUIsU0FBdUI7UUFEYixTQUFJLEdBQUosSUFBSSxDQUFZO1FBQzFCLGNBQVMsR0FBVCxTQUFTLENBQWM7SUFDM0IsQ0FBQztJQUVQLDhCQUFTLEdBQVQsVUFBVSxHQUFXO1FBQXJCLGlCQXdCQztRQXRCQyxPQUFPLElBQUksVUFBVSxDQUFxQixVQUFDLFFBQVE7WUFDakQsNkJBQTZCO1lBQzdCLFFBQVEsQ0FBQyxJQUFJLENBQUMsNEVBQTRFLENBQUMsQ0FBQztZQUU1RixpREFBaUQ7WUFDMUMsSUFBQSxvQkFBSSxFQUFFLHNCQUFLLENBQWE7WUFDL0IsT0FBTyxDQUFDLEdBQUcsQ0FBQyxhQUFhLENBQUMsQ0FBQztZQUMzQixLQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLEVBQUUsRUFBQyxZQUFZLEVBQUUsTUFBTSxFQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsVUFBQSxRQUFRO2dCQUMzRCxJQUFNLE1BQU0sR0FBRyxJQUFJLFVBQVUsRUFBRSxDQUFDO2dCQUNoQyxNQUFNLENBQUMsYUFBYSxDQUFDLFFBQVEsQ0FBQyxDQUFDO2dCQUMvQixNQUFNLENBQUMsU0FBUyxHQUFHO29CQUNmLElBQUcsTUFBTSxDQUFDLE1BQU0sSUFBSSxJQUFJLEVBQUU7d0JBQ3hCLElBQUksR0FBRyxHQUFRLE1BQU0sQ0FBQyxNQUFNLENBQUM7d0JBQzdCLEdBQUcsR0FBRyxLQUFJLENBQUMsU0FBUyxDQUFDLHNCQUFzQixDQUFDLEdBQUcsQ0FBQyxDQUFBO3dCQUNoRCxRQUFRLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDO3FCQUNwQjtnQkFFTCxDQUFDLENBQUM7WUFDSixDQUFDLENBQUMsQ0FBQztZQUVILE9BQU8sRUFBQyxXQUFXLGdCQUFNLENBQUMsRUFBQyxDQUFDO1FBQzlCLENBQUMsQ0FBQyxDQUFDO0lBQ0wsQ0FBQzs7Z0JBNUJ5QixVQUFVO2dCQUNmLFlBQVk7O0lBSHhCLFVBQVU7UUFEdEIsSUFBSSxDQUFDLEVBQUMsSUFBSSxFQUFFLFFBQVEsRUFBQyxDQUFDO09BQ1YsVUFBVSxDQStCcEI7SUFBRCxpQkFBQztDQUFBLEFBL0JILElBK0JHO1NBL0JVLFVBQVUiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBQaXBlLCBQaXBlVHJhbnNmb3JtIH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQgeyBIdHRwQ2xpZW50IH0gZnJvbSAnQGFuZ3VsYXIvY29tbW9uL2h0dHAnO1xuaW1wb3J0IHsgT2JzZXJ2YWJsZSB9IGZyb20gJ3J4anMnO1xuaW1wb3J0IHsgRG9tU2FuaXRpemVyIH0gZnJvbSAnQGFuZ3VsYXIvcGxhdGZvcm0tYnJvd3Nlcic7XG5cbi8qXG4gKiBTYW5pdGl6ZXMgYW4gVVJMIHJlc291cmNlXG4qL1xuQFBpcGUoe25hbWU6ICdzZWN1cmUnfSlcbmV4cG9ydCBjbGFzcyBTZWN1cmVQaXBlIGltcGxlbWVudHMgUGlwZVRyYW5zZm9ybSB7XG5cbiAgICBjb25zdHJ1Y3Rvcihwcml2YXRlIGh0dHA6IEh0dHBDbGllbnQsXG4gICAgICBwcml2YXRlIHNhbml0aXplcjogRG9tU2FuaXRpemVyLFxuICAgICAgKSB7IH1cbiAgXG4gICAgdHJhbnNmb3JtKHVybDogc3RyaW5nKSB7XG4gIFxuICAgICAgcmV0dXJuIG5ldyBPYnNlcnZhYmxlPHN0cmluZ3xBcnJheUJ1ZmZlcj4oKG9ic2VydmVyKSA9PiB7XG4gICAgICAgIC8vIFRoaXMgaXMgYSB0aW55IGJsYW5rIGltYWdlXG4gICAgICAgIG9ic2VydmVyLm5leHQoJ2RhdGE6aW1hZ2UvZ2lmO2Jhc2U2NCxSMGxHT0RsaEFRQUJBQUFBQUNINUJBRUtBQUVBTEFBQUFBQUJBQUVBQUFJQ1RBRUFPdz09Jyk7XG4gIFxuICAgICAgICAvLyBUaGUgbmV4dCBhbmQgZXJyb3IgY2FsbGJhY2tzIGZyb20gdGhlIG9ic2VydmVyXG4gICAgICAgIGNvbnN0IHtuZXh0LCBlcnJvcn0gPSBvYnNlcnZlcjtcbiAgICAgICAgY29uc29sZS5sb2coJ3NlY3VyZSBwaXBlJyk7XG4gICAgICAgIHRoaXMuaHR0cC5nZXQodXJsLCB7cmVzcG9uc2VUeXBlOiAnYmxvYid9KS5zdWJzY3JpYmUocmVzcG9uc2UgPT4ge1xuICAgICAgICAgIGNvbnN0IHJlYWRlciA9IG5ldyBGaWxlUmVhZGVyKCk7XG4gICAgICAgICAgcmVhZGVyLnJlYWRBc0RhdGFVUkwocmVzcG9uc2UpO1xuICAgICAgICAgIHJlYWRlci5vbmxvYWRlbmQgPSAoKSA9PiB7XG4gICAgICAgICAgICAgIGlmKHJlYWRlci5yZXN1bHQgIT0gbnVsbCkge1xuICAgICAgICAgICAgICAgIGxldCByZXM6IGFueSA9IHJlYWRlci5yZXN1bHQ7XG4gICAgICAgICAgICAgICAgcmVzID0gdGhpcy5zYW5pdGl6ZXIuYnlwYXNzU2VjdXJpdHlUcnVzdFVybChyZXMpXG4gICAgICAgICAgICAgICAgb2JzZXJ2ZXIubmV4dChyZXMpO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgfTtcbiAgICAgICAgfSk7XG4gIFxuICAgICAgICByZXR1cm4ge3Vuc3Vic2NyaWJlKCkgeyAgfX07XG4gICAgICB9KTtcbiAgICB9XG4gIH1cbiJdfQ==