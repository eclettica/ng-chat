import { __decorate } from "tslib";
import { Component, Input, Output, EventEmitter } from '@angular/core';
var NgChatWindowOptionsComponent = /** @class */ (function () {
    //buttons: WindowButton[] | undefined;
    function NgChatWindowOptionsComponent() {
        this.activeOptionTrackerChange = new EventEmitter();
        //this.buttons = this.options.buttons;
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
            template: "\n<div *ngIf=\"options && options.buttons && options.buttons.length > 0 && options.buttons.length < 3\" class=\"ng-chat-options-content-reduced\">\n\t<a *ngFor=\"let button of options?.buttons; let i = index\" [ngClass]=\"{'primary-text': true, 'disabled': button.enableButton(options.chattingTo.participant) == false, 'hidden': !button.showButton || button.showButton(options.chattingTo.participant) == false }\" (click)=\"onOptionClicked(options, button)\">\n\t\t<mat-icon *ngIf=\"button.showIcon\" class=\"material-icons\">{{button.icon}}</mat-icon>\n\t\t<span *ngIf=\"!button.showIcon\" class=\"material-icons\">{{button.title}}</span>\n\t</a>\n</div>\n<div *ngIf=\"options && options.buttons && options.buttons.length > 2\" class=\"ng-chat-options\">\n\t\t<button class=\"ng-chat-options-activator\">\n\t\t\t<span class=\"primary-text\">...</span>\n\t\t</button>\n\t<div class=\"ng-chat-options-content primary-background shadowed\">\n\t\t<a *ngFor=\"let button of options?.buttons; let i = index\" [ngClass]=\"{'primary-text': true, 'disabled': button.enableButton(options.chattingTo.participant) == false, 'hidden': !button.showButton || button.showButton(options.chattingTo.participant) == false }\" (click)=\"onOptionClicked(options, button)\">\n\t\t\t<mat-icon *ngIf=\"button.showIcon\" class=\"material-icons\">{{button.icon}}</mat-icon>\n\t\t\t<span *ngIf=\"!button.showIcon\" class=\"material-icons\">{{button.title}}</span>\n\t\t</a>\n\t</div>\n</div>\n",
            styles: [".ng-chat-options-activator{background-color:unset;color:#fff;line-height:28px;border:none;position:relative}.ng-chat-options-activator>span{position:relative;top:-5px;left:0}.ng-chat-options{position:relative;display:inline-block}.ng-chat-options:hover .ng-chat-options-content{display:block}.ng-chat-options:hover .ng-chat-options-activator{background-color:#ddd}.ng-chat-options-content{display:none;position:absolute;min-width:160px;z-index:1}.ng-chat-options-content-reduced{display:inline-block;position:relative;bottom:5px}.ng-chat-options-content a:hover{background-color:#ddd}.ng-chat-options-content a{padding:6px 16px;text-decoration:none;display:block}.ng-chat-options-content a.disabled mat-icon,.ng-chat-options-content-reduced a.disabled mat-icon{color:#bababa}.ng-chat-options-content a.hidden{display:none!important}@media only screen and (max-width:581px){.ng-chat-options-content{right:0}}"]
        })
    ], NgChatWindowOptionsComponent);
    return NgChatWindowOptionsComponent;
}());
export { NgChatWindowOptionsComponent };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmctY2hhdC13aW5kb3ctb3B0aW9ucy5jb21wb25lbnQuanMiLCJzb3VyY2VSb290Ijoibmc6Ly9uZy1jaGF0LyIsInNvdXJjZXMiOlsibmctY2hhdC9jb21wb25lbnRzL25nLWNoYXQtd2luZG93LW9wdGlvbnMvbmctY2hhdC13aW5kb3ctb3B0aW9ucy5jb21wb25lbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBLE9BQU8sRUFBRSxTQUFTLEVBQUUsS0FBSyxFQUFFLE1BQU0sRUFBRSxZQUFZLEVBQUUsTUFBTSxlQUFlLENBQUM7QUFVdkU7SUFDQyxzQ0FBc0M7SUFFdEM7UUFtQk8sOEJBQXlCLEdBQStCLElBQUksWUFBWSxFQUFnQixDQUFDO1FBbEIvRixzQ0FBc0M7SUFDdkMsQ0FBQztJQW1CRCxzREFBZSxHQUFmLFVBQWdCLE1BQW9CLEVBQUUsTUFBb0I7UUFFekQsSUFBSSxNQUFNLENBQUMsTUFBTSxFQUFFO1lBQ2xCLElBQUcsTUFBTSxDQUFDLFlBQVksRUFBRTtnQkFDdkIsSUFBRyxDQUFDLE1BQU0sQ0FBQyxZQUFZLENBQUMsTUFBTSxDQUFDLFVBQVUsQ0FBQyxXQUFXLENBQUM7b0JBQ3JELE9BQU87YUFDUjtZQUNELE1BQU0sQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLFVBQVUsQ0FBQyxDQUFDO1NBQ2pDO1FBQ0QsSUFBRyxJQUFJLENBQUMseUJBQXlCO1lBQ2hDLElBQUksQ0FBQyx5QkFBeUIsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7SUFDOUMsQ0FBQztJQW5CRDtRQURDLEtBQUssRUFBRTtpRUFDcUI7SUFHN0I7UUFEQyxLQUFLLEVBQUU7NkVBQ2lDO0lBR3pDO1FBREMsTUFBTSxFQUFFO21GQUN1RjtJQXRCcEYsNEJBQTRCO1FBTHhDLFNBQVMsQ0FBQztZQUNQLFFBQVEsRUFBRSx3QkFBd0I7WUFDbEMsdThDQUFzRDs7U0FFekQsQ0FBQztPQUNXLDRCQUE0QixDQW9DeEM7SUFBRCxtQ0FBQztDQUFBLEFBcENELElBb0NDO1NBcENZLDRCQUE0QiIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IENvbXBvbmVudCwgSW5wdXQsIE91dHB1dCwgRXZlbnRFbWl0dGVyIH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQgeyBJQ2hhdE9wdGlvbiB9IGZyb20gJy4uLy4uL2NvcmUvY2hhdC1vcHRpb24nO1xuaW1wb3J0IHsgV2luZG93T3B0aW9uIH0gZnJvbSAnLi4vLi4vY29yZS93aW5kb3ctb3B0aW9uJztcbmltcG9ydCB7IFdpbmRvd0J1dHRvbiB9IGZyb20gJy4uLy4uL2NvcmUvd2luZG93LWJ1dHRvbic7XG5cbkBDb21wb25lbnQoe1xuICAgIHNlbGVjdG9yOiAnbmctY2hhdC13aW5kb3ctb3B0aW9ucycsXG4gICAgdGVtcGxhdGVVcmw6ICcuL25nLWNoYXQtd2luZG93LW9wdGlvbnMuY29tcG9uZW50Lmh0bWwnLFxuICAgIHN0eWxlVXJsczogWycuL25nLWNoYXQtd2luZG93LW9wdGlvbnMuY29tcG9uZW50LmNzcyddXG59KVxuZXhwb3J0IGNsYXNzIE5nQ2hhdFdpbmRvd09wdGlvbnNDb21wb25lbnQge1xuXHQvL2J1dHRvbnM6IFdpbmRvd0J1dHRvbltdIHwgdW5kZWZpbmVkO1xuXG5cdGNvbnN0cnVjdG9yKCkgeyBcblx0XHQvL3RoaXMuYnV0dG9ucyA9IHRoaXMub3B0aW9ucy5idXR0b25zO1xuXHR9XG5cblx0Ly8ge1xuXHQvLyBcdHRpdGxlOiBzdHJpbmc7XG5cdC8vIFx0c2hvd0ljb246IGJvb2xlYW47XG5cdC8vIFx0aWNvbjogc3RyaW5nO1xuXHQvLyBcdGFjdGlvbj86IChjaGF0dGluZ1RvOiBXaW5kb3cpID0+IHZvaWQ7XG5cdC8vIFx0ZW5hYmxlQnV0dG9uPzogKHBhcnRpY2lwYW50OiBJQ2hhdFBhcnRpY2lwYW50KSA9PiBib29sZWFuO1xuXHQvLyB9XG5cblx0QElucHV0KClcblx0cHVibGljIG9wdGlvbnM6IFdpbmRvd09wdGlvbjtcblxuXHRASW5wdXQoKVxuXHRwdWJsaWMgYWN0aXZlT3B0aW9uVHJhY2tlcjogV2luZG93T3B0aW9uO1xuXG5cdEBPdXRwdXQoKVxuXHRwdWJsaWMgYWN0aXZlT3B0aW9uVHJhY2tlckNoYW5nZTogRXZlbnRFbWl0dGVyPFdpbmRvd09wdGlvbj4gPSBuZXcgRXZlbnRFbWl0dGVyPFdpbmRvd09wdGlvbj4oKTtcblxuXHRvbk9wdGlvbkNsaWNrZWQob3B0aW9uOiBXaW5kb3dPcHRpb24sIGJ1dHRvbjogV2luZG93QnV0dG9uKTogdm9pZFxuXHR7XG5cdFx0aWYgKGJ1dHRvbi5hY3Rpb24pIHsgICAgXG5cdFx0XHRpZihidXR0b24uZW5hYmxlQnV0dG9uKSB7XG5cdFx0XHRcdGlmKCFidXR0b24uZW5hYmxlQnV0dG9uKG9wdGlvbi5jaGF0dGluZ1RvLnBhcnRpY2lwYW50KSlcblx0XHRcdFx0XHRyZXR1cm47XG5cdFx0XHR9XG5cdFx0XHRidXR0b24uYWN0aW9uKG9wdGlvbi5jaGF0dGluZ1RvKTsgICBcblx0XHR9XG5cdFx0aWYodGhpcy5hY3RpdmVPcHRpb25UcmFja2VyQ2hhbmdlKVxuXHRcdFx0dGhpcy5hY3RpdmVPcHRpb25UcmFja2VyQ2hhbmdlLmVtaXQob3B0aW9uKTtcblx0fVxufVxuIl19