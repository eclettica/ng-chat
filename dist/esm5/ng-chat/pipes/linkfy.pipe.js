import { __decorate } from "tslib";
import { Pipe } from '@angular/core';
/*
 * Transforms text containing URLs or E-mails to valid links/mailtos
*/
var LinkfyPipe = /** @class */ (function () {
    function LinkfyPipe() {
    }
    LinkfyPipe.prototype.transform = function (message, pipeEnabled) {
        if (pipeEnabled && message && message.length > 1) {
            var replacedText = void 0;
            var replacePatternProtocol = void 0;
            var replacePatternWWW = void 0;
            var replacePatternMailTo = void 0;
            // URLs starting with http://, https://, or ftp://
            replacePatternProtocol = /(\b(https?|ftp):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/gim;
            replacedText = message.replace(replacePatternProtocol, '<a href="$1" target="_blank">$1</a>');
            // URLs starting with "www." (ignoring // before it).
            replacePatternWWW = /(^|[^\/])(www\.[\S]+(\b|$))/gim;
            replacedText = replacedText.replace(replacePatternWWW, '$1<a href="http://$2" target="_blank">$2</a>');
            // Change email addresses to mailto:: links.
            replacePatternMailTo = /(([a-zA-Z0-9\-\_\.])+@[a-zA-Z\_]+?(\.[a-zA-Z]{2,6})+)/gim;
            replacedText = replacedText.replace(replacePatternMailTo, '<a href="mailto:$1">$1</a>');
            return replacedText;
        }
        else
            return message;
    };
    LinkfyPipe = __decorate([
        Pipe({ name: 'linkfy' })
    ], LinkfyPipe);
    return LinkfyPipe;
}());
export { LinkfyPipe };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGlua2Z5LnBpcGUuanMiLCJzb3VyY2VSb290Ijoibmc6Ly9uZy1jaGF0LyIsInNvdXJjZXMiOlsibmctY2hhdC9waXBlcy9saW5rZnkucGlwZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUEsT0FBTyxFQUFFLElBQUksRUFBaUIsTUFBTSxlQUFlLENBQUM7QUFFcEQ7O0VBRUU7QUFFRjtJQUFBO0lBMEJBLENBQUM7SUF6QkcsOEJBQVMsR0FBVCxVQUFVLE9BQWUsRUFBRSxXQUFvQjtRQUMzQyxJQUFJLFdBQVcsSUFBSSxPQUFPLElBQUksT0FBTyxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQ2hEO1lBQ0ksSUFBSSxZQUFZLFNBQUEsQ0FBQztZQUNqQixJQUFJLHNCQUFzQixTQUFBLENBQUM7WUFDM0IsSUFBSSxpQkFBaUIsU0FBQSxDQUFDO1lBQ3RCLElBQUksb0JBQW9CLFNBQUEsQ0FBQztZQUV6QixrREFBa0Q7WUFDbEQsc0JBQXNCLEdBQUcseUVBQXlFLENBQUM7WUFDbkcsWUFBWSxHQUFHLE9BQU8sQ0FBQyxPQUFPLENBQUMsc0JBQXNCLEVBQUUscUNBQXFDLENBQUMsQ0FBQztZQUU5RixxREFBcUQ7WUFDckQsaUJBQWlCLEdBQUcsZ0NBQWdDLENBQUM7WUFDckQsWUFBWSxHQUFHLFlBQVksQ0FBQyxPQUFPLENBQUMsaUJBQWlCLEVBQUUsOENBQThDLENBQUMsQ0FBQztZQUV2Ryw0Q0FBNEM7WUFDNUMsb0JBQW9CLEdBQUcsMERBQTBELENBQUM7WUFDbEYsWUFBWSxHQUFHLFlBQVksQ0FBQyxPQUFPLENBQUMsb0JBQW9CLEVBQUUsNEJBQTRCLENBQUMsQ0FBQztZQUV4RixPQUFPLFlBQVksQ0FBQztTQUN2Qjs7WUFFRyxPQUFPLE9BQU8sQ0FBQztJQUN2QixDQUFDO0lBekJRLFVBQVU7UUFEdEIsSUFBSSxDQUFDLEVBQUMsSUFBSSxFQUFFLFFBQVEsRUFBQyxDQUFDO09BQ1YsVUFBVSxDQTBCdEI7SUFBRCxpQkFBQztDQUFBLEFBMUJELElBMEJDO1NBMUJZLFVBQVUiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBQaXBlLCBQaXBlVHJhbnNmb3JtIH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5cbi8qXG4gKiBUcmFuc2Zvcm1zIHRleHQgY29udGFpbmluZyBVUkxzIG9yIEUtbWFpbHMgdG8gdmFsaWQgbGlua3MvbWFpbHRvc1xuKi9cbkBQaXBlKHtuYW1lOiAnbGlua2Z5J30pXG5leHBvcnQgY2xhc3MgTGlua2Z5UGlwZSBpbXBsZW1lbnRzIFBpcGVUcmFuc2Zvcm0ge1xuICAgIHRyYW5zZm9ybShtZXNzYWdlOiBzdHJpbmcsIHBpcGVFbmFibGVkOiBib29sZWFuKTogc3RyaW5nIHtcbiAgICAgICAgaWYgKHBpcGVFbmFibGVkICYmIG1lc3NhZ2UgJiYgbWVzc2FnZS5sZW5ndGggPiAxKVxuICAgICAgICB7XG4gICAgICAgICAgICBsZXQgcmVwbGFjZWRUZXh0O1xuICAgICAgICAgICAgbGV0IHJlcGxhY2VQYXR0ZXJuUHJvdG9jb2w7XG4gICAgICAgICAgICBsZXQgcmVwbGFjZVBhdHRlcm5XV1c7XG4gICAgICAgICAgICBsZXQgcmVwbGFjZVBhdHRlcm5NYWlsVG87XG5cbiAgICAgICAgICAgIC8vIFVSTHMgc3RhcnRpbmcgd2l0aCBodHRwOi8vLCBodHRwczovLywgb3IgZnRwOi8vXG4gICAgICAgICAgICByZXBsYWNlUGF0dGVyblByb3RvY29sID0gLyhcXGIoaHR0cHM/fGZ0cCk6XFwvXFwvWy1BLVowLTkrJkAjXFwvJT89fl98ITosLjtdKlstQS1aMC05KyZAI1xcLyU9fl98XSkvZ2ltO1xuICAgICAgICAgICAgcmVwbGFjZWRUZXh0ID0gbWVzc2FnZS5yZXBsYWNlKHJlcGxhY2VQYXR0ZXJuUHJvdG9jb2wsICc8YSBocmVmPVwiJDFcIiB0YXJnZXQ9XCJfYmxhbmtcIj4kMTwvYT4nKTtcblxuICAgICAgICAgICAgLy8gVVJMcyBzdGFydGluZyB3aXRoIFwid3d3LlwiIChpZ25vcmluZyAvLyBiZWZvcmUgaXQpLlxuICAgICAgICAgICAgcmVwbGFjZVBhdHRlcm5XV1cgPSAvKF58W15cXC9dKSh3d3dcXC5bXFxTXSsoXFxifCQpKS9naW07XG4gICAgICAgICAgICByZXBsYWNlZFRleHQgPSByZXBsYWNlZFRleHQucmVwbGFjZShyZXBsYWNlUGF0dGVybldXVywgJyQxPGEgaHJlZj1cImh0dHA6Ly8kMlwiIHRhcmdldD1cIl9ibGFua1wiPiQyPC9hPicpO1xuXG4gICAgICAgICAgICAvLyBDaGFuZ2UgZW1haWwgYWRkcmVzc2VzIHRvIG1haWx0bzo6IGxpbmtzLlxuICAgICAgICAgICAgcmVwbGFjZVBhdHRlcm5NYWlsVG8gPSAvKChbYS16QS1aMC05XFwtXFxfXFwuXSkrQFthLXpBLVpcXF9dKz8oXFwuW2EtekEtWl17Miw2fSkrKS9naW07XG4gICAgICAgICAgICByZXBsYWNlZFRleHQgPSByZXBsYWNlZFRleHQucmVwbGFjZShyZXBsYWNlUGF0dGVybk1haWxUbywgJzxhIGhyZWY9XCJtYWlsdG86JDFcIj4kMTwvYT4nKTtcblxuICAgICAgICAgICAgcmV0dXJuIHJlcGxhY2VkVGV4dDtcbiAgICAgICAgfVxuICAgICAgICBlbHNlXG4gICAgICAgICAgICByZXR1cm4gbWVzc2FnZTtcbiAgICB9IFxufVxuIl19