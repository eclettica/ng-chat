import { __decorate } from "tslib";
import { Pipe } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
/*
 * Sanitizes an URL resource
*/
var SanitizePipe = /** @class */ (function () {
    function SanitizePipe(sanitizer) {
        this.sanitizer = sanitizer;
    }
    SanitizePipe.prototype.transform = function (url) {
        return this.sanitizer.bypassSecurityTrustResourceUrl(url);
    };
    SanitizePipe.ctorParameters = function () { return [
        { type: DomSanitizer }
    ]; };
    SanitizePipe = __decorate([
        Pipe({ name: 'sanitize' })
    ], SanitizePipe);
    return SanitizePipe;
}());
export { SanitizePipe };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2FuaXRpemUucGlwZS5qcyIsInNvdXJjZVJvb3QiOiJuZzovL25nLWNoYXQvIiwic291cmNlcyI6WyJuZy1jaGF0L3BpcGVzL3Nhbml0aXplLnBpcGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBLE9BQU8sRUFBRSxJQUFJLEVBQWlCLE1BQU0sZUFBZSxDQUFDO0FBQ3BELE9BQU8sRUFBRSxZQUFZLEVBQUUsZUFBZSxFQUFHLE1BQU0sMkJBQTJCLENBQUM7QUFFM0U7O0VBRUU7QUFFRjtJQUNJLHNCQUFzQixTQUF1QjtRQUF2QixjQUFTLEdBQVQsU0FBUyxDQUFjO0lBQUcsQ0FBQztJQUVqRCxnQ0FBUyxHQUFULFVBQVUsR0FBVztRQUNqQixPQUFPLElBQUksQ0FBQyxTQUFTLENBQUMsOEJBQThCLENBQUMsR0FBRyxDQUFDLENBQUM7SUFDOUQsQ0FBQzs7Z0JBSmdDLFlBQVk7O0lBRHBDLFlBQVk7UUFEeEIsSUFBSSxDQUFDLEVBQUMsSUFBSSxFQUFFLFVBQVUsRUFBQyxDQUFDO09BQ1osWUFBWSxDQU14QjtJQUFELG1CQUFDO0NBQUEsQUFORCxJQU1DO1NBTlksWUFBWSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IFBpcGUsIFBpcGVUcmFuc2Zvcm0gfSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7IERvbVNhbml0aXplciwgU2FmZVJlc291cmNlVXJsICB9IGZyb20gJ0Bhbmd1bGFyL3BsYXRmb3JtLWJyb3dzZXInO1xuXG4vKlxuICogU2FuaXRpemVzIGFuIFVSTCByZXNvdXJjZVxuKi9cbkBQaXBlKHtuYW1lOiAnc2FuaXRpemUnfSlcbmV4cG9ydCBjbGFzcyBTYW5pdGl6ZVBpcGUgaW1wbGVtZW50cyBQaXBlVHJhbnNmb3JtIHtcbiAgICBjb25zdHJ1Y3Rvcihwcm90ZWN0ZWQgc2FuaXRpemVyOiBEb21TYW5pdGl6ZXIpIHt9XG5cbiAgICB0cmFuc2Zvcm0odXJsOiBzdHJpbmcpOiBTYWZlUmVzb3VyY2VVcmwge1xuICAgICAgICByZXR1cm4gdGhpcy5zYW5pdGl6ZXIuYnlwYXNzU2VjdXJpdHlUcnVzdFJlc291cmNlVXJsKHVybCk7XG4gICAgfVxufVxuIl19