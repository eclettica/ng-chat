import { __decorate } from "tslib";
import { Component, Input, Output, EventEmitter } from '@angular/core';
var NgChatWindowOptionsComponent = /** @class */ (function () {
    function NgChatWindowOptionsComponent() {
        this.activeOptionTrackerChange = new EventEmitter();
        this.buttons = this.options.buttons;
    }
    NgChatWindowOptionsComponent.prototype.onOptionClicked = function (option, button) {
        if (button.action) {
            if (button.enableButton) {
                if (!button.enableButton(option.chattingTo.participant))
                    return;
            }
            button.action(option.chattingTo);
        }
        if (this.activeOptionTrackerChange)
            this.activeOptionTrackerChange.emit(option);
    };
    __decorate([
        Input()
    ], NgChatWindowOptionsComponent.prototype, "options", void 0);
    __decorate([
        Input()
    ], NgChatWindowOptionsComponent.prototype, "activeOptionTracker", void 0);
    __decorate([
        Output()
    ], NgChatWindowOptionsComponent.prototype, "activeOptionTrackerChange", void 0);
    NgChatWindowOptionsComponent = __decorate([
        Component({
            selector: 'ng-chat-window-options',
            template: "<div *ngIf=\"options && buttons && buttons.length > 0\" class=\"ng-chat-options\">\n\t\t<button class=\"ng-chat-options-activator\">\n\t\t\t<span class=\"primary-text\">...</span>\n\t\t</button>\n\t<div class=\"ng-chat-options-content primary-background shadowed\">\n\t\t<a *ngFor=\"let button of buttons; let i = index\" [ngClass]=\"'primary-text'\" (click)=\"onOptionClicked(options, button)\">\n\t\t\t<span *ngIf=\"button.showIcon\" class=\"material-icons\">{{button.icon}}</span>\n\t\t\t<span *ngIf=\"!button.showIcon\" class=\"material-icons\">{{button.title}}</span>\n\t\t</a>\n\t</div>      \n</div>\n",
            styles: [".ng-chat-options-activator{background-color:unset;color:#fff;line-height:28px;border:none;position:relative}.ng-chat-options-activator>span{position:relative;top:-5px;left:0}.ng-chat-options{position:relative;display:inline-block}.ng-chat-options:hover .ng-chat-options-content{display:block}.ng-chat-options:hover .ng-chat-options-activator{background-color:#ddd}.ng-chat-options-content{display:none;position:absolute;min-width:160px;z-index:1}.ng-chat-options-content a:hover{background-color:#ddd}.ng-chat-options-content a{padding:6px 16px;text-decoration:none;display:block}@media only screen and (max-width:581px){.ng-chat-options-content{right:0}}"]
        })
    ], NgChatWindowOptionsComponent);
    return NgChatWindowOptionsComponent;
}());
export { NgChatWindowOptionsComponent };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmctY2hhdC13aW5kb3ctb3B0aW9ucy5jb21wb25lbnQuanMiLCJzb3VyY2VSb290Ijoibmc6Ly9uZy1jaGF0LyIsInNvdXJjZXMiOlsibmctY2hhdC9jb21wb25lbnRzL25nLWNoYXQtd2luZG93LW9wdGlvbnMvbmctY2hhdC13aW5kb3ctb3B0aW9ucy5jb21wb25lbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBLE9BQU8sRUFBRSxTQUFTLEVBQUUsS0FBSyxFQUFFLE1BQU0sRUFBRSxZQUFZLEVBQUUsTUFBTSxlQUFlLENBQUM7QUFVdkU7SUFHQztRQW1CTyw4QkFBeUIsR0FBK0IsSUFBSSxZQUFZLEVBQWdCLENBQUM7UUFsQi9GLElBQUksQ0FBQyxPQUFPLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUM7SUFDckMsQ0FBQztJQW1CRCxzREFBZSxHQUFmLFVBQWdCLE1BQW9CLEVBQUUsTUFBb0I7UUFFekQsSUFBSSxNQUFNLENBQUMsTUFBTSxFQUFFO1lBQ2xCLElBQUcsTUFBTSxDQUFDLFlBQVksRUFBRTtnQkFDdkIsSUFBRyxDQUFDLE1BQU0sQ0FBQyxZQUFZLENBQUMsTUFBTSxDQUFDLFVBQVUsQ0FBQyxXQUFXLENBQUM7b0JBQ3JELE9BQU87YUFDUjtZQUNELE1BQU0sQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLFVBQVUsQ0FBQyxDQUFDO1NBQ2pDO1FBQ0QsSUFBRyxJQUFJLENBQUMseUJBQXlCO1lBQ2hDLElBQUksQ0FBQyx5QkFBeUIsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7SUFDOUMsQ0FBQztJQW5CRDtRQURDLEtBQUssRUFBRTtpRUFDcUI7SUFHN0I7UUFEQyxLQUFLLEVBQUU7NkVBQ2lDO0lBR3pDO1FBREMsTUFBTSxFQUFFO21GQUN1RjtJQXRCcEYsNEJBQTRCO1FBTHhDLFNBQVMsQ0FBQztZQUNQLFFBQVEsRUFBRSx3QkFBd0I7WUFDbEMsNG1CQUFzRDs7U0FFekQsQ0FBQztPQUNXLDRCQUE0QixDQW9DeEM7SUFBRCxtQ0FBQztDQUFBLEFBcENELElBb0NDO1NBcENZLDRCQUE0QiIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IENvbXBvbmVudCwgSW5wdXQsIE91dHB1dCwgRXZlbnRFbWl0dGVyIH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQgeyBJQ2hhdE9wdGlvbiB9IGZyb20gJy4uLy4uL2NvcmUvY2hhdC1vcHRpb24nO1xuaW1wb3J0IHsgV2luZG93T3B0aW9uIH0gZnJvbSAnLi4vLi4vY29yZS93aW5kb3ctb3B0aW9uJztcbmltcG9ydCB7IFdpbmRvd0J1dHRvbiB9IGZyb20gJy4uLy4uL2NvcmUvd2luZG93LWJ1dHRvbic7XG5cbkBDb21wb25lbnQoe1xuICAgIHNlbGVjdG9yOiAnbmctY2hhdC13aW5kb3ctb3B0aW9ucycsXG4gICAgdGVtcGxhdGVVcmw6ICcuL25nLWNoYXQtd2luZG93LW9wdGlvbnMuY29tcG9uZW50Lmh0bWwnLFxuICAgIHN0eWxlVXJsczogWycuL25nLWNoYXQtd2luZG93LW9wdGlvbnMuY29tcG9uZW50LmNzcyddXG59KVxuZXhwb3J0IGNsYXNzIE5nQ2hhdFdpbmRvd09wdGlvbnNDb21wb25lbnQge1xuXHRidXR0b25zOiBXaW5kb3dCdXR0b25bXSB8IHVuZGVmaW5lZDtcblxuXHRjb25zdHJ1Y3RvcigpIHsgXG5cdFx0dGhpcy5idXR0b25zID0gdGhpcy5vcHRpb25zLmJ1dHRvbnM7XG5cdH1cblxuXHQvLyB7XG5cdC8vIFx0dGl0bGU6IHN0cmluZztcblx0Ly8gXHRzaG93SWNvbjogYm9vbGVhbjtcblx0Ly8gXHRpY29uOiBzdHJpbmc7XG5cdC8vIFx0YWN0aW9uPzogKGNoYXR0aW5nVG86IFdpbmRvdykgPT4gdm9pZDtcblx0Ly8gXHRlbmFibGVCdXR0b24/OiAocGFydGljaXBhbnQ6IElDaGF0UGFydGljaXBhbnQpID0+IGJvb2xlYW47XG5cdC8vIH1cblxuXHRASW5wdXQoKVxuXHRwdWJsaWMgb3B0aW9uczogV2luZG93T3B0aW9uO1xuXG5cdEBJbnB1dCgpXG5cdHB1YmxpYyBhY3RpdmVPcHRpb25UcmFja2VyOiBXaW5kb3dPcHRpb247XG5cblx0QE91dHB1dCgpXG5cdHB1YmxpYyBhY3RpdmVPcHRpb25UcmFja2VyQ2hhbmdlOiBFdmVudEVtaXR0ZXI8V2luZG93T3B0aW9uPiA9IG5ldyBFdmVudEVtaXR0ZXI8V2luZG93T3B0aW9uPigpO1xuXG5cdG9uT3B0aW9uQ2xpY2tlZChvcHRpb246IFdpbmRvd09wdGlvbiwgYnV0dG9uOiBXaW5kb3dCdXR0b24pOiB2b2lkXG5cdHtcblx0XHRpZiAoYnV0dG9uLmFjdGlvbikgeyAgICBcblx0XHRcdGlmKGJ1dHRvbi5lbmFibGVCdXR0b24pIHtcblx0XHRcdFx0aWYoIWJ1dHRvbi5lbmFibGVCdXR0b24ob3B0aW9uLmNoYXR0aW5nVG8ucGFydGljaXBhbnQpKVxuXHRcdFx0XHRcdHJldHVybjtcblx0XHRcdH1cblx0XHRcdGJ1dHRvbi5hY3Rpb24ob3B0aW9uLmNoYXR0aW5nVG8pOyAgIFxuXHRcdH1cblx0XHRpZih0aGlzLmFjdGl2ZU9wdGlvblRyYWNrZXJDaGFuZ2UpXG5cdFx0XHR0aGlzLmFjdGl2ZU9wdGlvblRyYWNrZXJDaGFuZ2UuZW1pdChvcHRpb24pO1xuXHR9XG59XG4iXX0=