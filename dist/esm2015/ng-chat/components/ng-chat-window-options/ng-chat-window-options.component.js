import { __decorate } from "tslib";
import { Component, Input, Output, EventEmitter } from '@angular/core';
let NgChatWindowOptionsComponent = class NgChatWindowOptionsComponent {
    //buttons: WindowButton[] | undefined;
    constructor() {
        this.activeOptionTrackerChange = new EventEmitter();
        //this.buttons = this.options.buttons;
    }
    onOptionClicked(option, button) {
        if (button.action) {
            if (button.enableButton) {
                if (!button.enableButton(this.window.participant))
                    return;
            }
            button.action(this.window);
        }
        if (this.activeOptionTrackerChange)
            this.activeOptionTrackerChange.emit(option);
    }
};
__decorate([
    Input()
], NgChatWindowOptionsComponent.prototype, "options", void 0);
__decorate([
    Input()
], NgChatWindowOptionsComponent.prototype, "activeOptionTracker", void 0);
__decorate([
    Input()
], NgChatWindowOptionsComponent.prototype, "window", void 0);
__decorate([
    Output()
], NgChatWindowOptionsComponent.prototype, "activeOptionTrackerChange", void 0);
NgChatWindowOptionsComponent = __decorate([
    Component({
        selector: 'ng-chat-window-options',
        template: "\n<div *ngIf=\"options && options.buttons && options.buttons.length > 0 && options.buttons.length < 3\" class=\"ng-chat-options-content-reduced\">\n\t<a *ngFor=\"let button of options?.buttons; let i = index\" [ngClass]=\"{'primary-text': true, 'disabled': button.enableButton(options.chattingTo.participant) == false, 'hidden': !button.showButton || button.showButton(options.chattingTo.participant) == false }\" (click)=\"onOptionClicked(options, button)\">\n\t\t<mat-icon *ngIf=\"button.showIcon\" class=\"material-icons\">{{button.icon}}</mat-icon>\n\t\t<span *ngIf=\"!button.showIcon\" class=\"material-icons\">{{button.title}}</span>\n\t</a>\n</div>\n<div *ngIf=\"options && options.buttons && options.buttons.length > 2\" class=\"ng-chat-options\">\n\t\t<button class=\"ng-chat-options-activator\">\n\t\t\t<span class=\"primary-text\">...</span>\n\t\t</button>\n\t<div class=\"ng-chat-options-content primary-background shadowed\">\n    <a *ngFor=\"let button of options?.buttons; let i = index\"\n    [ngClass]=\"{'primary-text': true, 'disabled': button.enableButton(window.participant) == false, 'hidden': !button.showButton || button.showButton(window.participant) == false }\"\n    (click)=\"onOptionClicked(options, button)\">\n\t\t\t<mat-icon *ngIf=\"button.showIcon\" class=\"material-icons\">{{button.icon}}</mat-icon>\n\t\t\t<span *ngIf=\"!button.showIcon\" class=\"material-icons\">{{button.title}}</span>\n\t\t</a>\n\t</div>\n</div>\n",
        styles: [".ng-chat-options-activator{background-color:unset;color:#fff;line-height:28px;border:none;position:relative}.ng-chat-options-activator>span{position:relative;top:-5px;left:0}.ng-chat-options{position:relative;display:inline-block}.ng-chat-options:hover .ng-chat-options-content{display:block}.ng-chat-options:hover .ng-chat-options-activator{background-color:#ddd}.ng-chat-options-content{display:none;position:absolute;min-width:160px;z-index:1}.ng-chat-options-content-reduced{display:inline-block;position:relative;bottom:5px}.ng-chat-options-content a:hover{background-color:#ddd}.ng-chat-options-content a{padding:6px 16px;text-decoration:none;display:block}.ng-chat-options-content a.disabled mat-icon,.ng-chat-options-content-reduced a.disabled mat-icon{color:#bababa}@media only screen and (max-width:581px){.ng-chat-options-content{right:0}}"]
    })
], NgChatWindowOptionsComponent);
export { NgChatWindowOptionsComponent };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmctY2hhdC13aW5kb3ctb3B0aW9ucy5jb21wb25lbnQuanMiLCJzb3VyY2VSb290Ijoibmc6Ly9uZy1jaGF0LyIsInNvdXJjZXMiOlsibmctY2hhdC9jb21wb25lbnRzL25nLWNoYXQtd2luZG93LW9wdGlvbnMvbmctY2hhdC13aW5kb3ctb3B0aW9ucy5jb21wb25lbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBLE9BQU8sRUFBRSxTQUFTLEVBQUUsS0FBSyxFQUFFLE1BQU0sRUFBRSxZQUFZLEVBQUUsTUFBTSxlQUFlLENBQUM7QUFXdkUsSUFBYSw0QkFBNEIsR0FBekMsTUFBYSw0QkFBNEI7SUFDeEMsc0NBQXNDO0lBRXRDO1FBc0JPLDhCQUF5QixHQUErQixJQUFJLFlBQVksRUFBZ0IsQ0FBQztRQXJCL0Ysc0NBQXNDO0lBQ3ZDLENBQUM7SUFzQkQsZUFBZSxDQUFDLE1BQW9CLEVBQUUsTUFBb0I7UUFFekQsSUFBSSxNQUFNLENBQUMsTUFBTSxFQUFFO1lBQ2xCLElBQUcsTUFBTSxDQUFDLFlBQVksRUFBRTtnQkFDdkIsSUFBRyxDQUFDLE1BQU0sQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxXQUFXLENBQUM7b0JBQy9DLE9BQU87YUFDUjtZQUNELE1BQU0sQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1NBQzNCO1FBQ0QsSUFBRyxJQUFJLENBQUMseUJBQXlCO1lBQ2hDLElBQUksQ0FBQyx5QkFBeUIsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7SUFDOUMsQ0FBQztDQUNELENBQUE7QUF2QkE7SUFEQyxLQUFLLEVBQUU7NkRBQ3FCO0FBRzVCO0lBREEsS0FBSyxFQUFFO3lFQUNrQztBQUcxQztJQURFLEtBQUssRUFBRTs0REFDYTtBQUd0QjtJQURDLE1BQU0sRUFBRTsrRUFDdUY7QUF6QnBGLDRCQUE0QjtJQUx4QyxTQUFTLENBQUM7UUFDUCxRQUFRLEVBQUUsd0JBQXdCO1FBQ2xDLHk3Q0FBc0Q7O0tBRXpELENBQUM7R0FDVyw0QkFBNEIsQ0F1Q3hDO1NBdkNZLDRCQUE0QiIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IENvbXBvbmVudCwgSW5wdXQsIE91dHB1dCwgRXZlbnRFbWl0dGVyIH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQgeyBJQ2hhdE9wdGlvbiB9IGZyb20gJy4uLy4uL2NvcmUvY2hhdC1vcHRpb24nO1xuaW1wb3J0IHsgV2luZG93T3B0aW9uIH0gZnJvbSAnLi4vLi4vY29yZS93aW5kb3ctb3B0aW9uJztcbmltcG9ydCB7IFdpbmRvd0J1dHRvbiB9IGZyb20gJy4uLy4uL2NvcmUvd2luZG93LWJ1dHRvbic7XG5pbXBvcnQgeyBXaW5kb3cgfSBmcm9tICcuLi8uLi9jb3JlL3dpbmRvdyc7XG5cbkBDb21wb25lbnQoe1xuICAgIHNlbGVjdG9yOiAnbmctY2hhdC13aW5kb3ctb3B0aW9ucycsXG4gICAgdGVtcGxhdGVVcmw6ICcuL25nLWNoYXQtd2luZG93LW9wdGlvbnMuY29tcG9uZW50Lmh0bWwnLFxuICAgIHN0eWxlVXJsczogWycuL25nLWNoYXQtd2luZG93LW9wdGlvbnMuY29tcG9uZW50LmNzcyddXG59KVxuZXhwb3J0IGNsYXNzIE5nQ2hhdFdpbmRvd09wdGlvbnNDb21wb25lbnQge1xuXHQvL2J1dHRvbnM6IFdpbmRvd0J1dHRvbltdIHwgdW5kZWZpbmVkO1xuXG5cdGNvbnN0cnVjdG9yKCkge1xuXHRcdC8vdGhpcy5idXR0b25zID0gdGhpcy5vcHRpb25zLmJ1dHRvbnM7XG5cdH1cblxuXHQvLyB7XG5cdC8vIFx0dGl0bGU6IHN0cmluZztcblx0Ly8gXHRzaG93SWNvbjogYm9vbGVhbjtcblx0Ly8gXHRpY29uOiBzdHJpbmc7XG5cdC8vIFx0YWN0aW9uPzogKGNoYXR0aW5nVG86IFdpbmRvdykgPT4gdm9pZDtcblx0Ly8gXHRlbmFibGVCdXR0b24/OiAocGFydGljaXBhbnQ6IElDaGF0UGFydGljaXBhbnQpID0+IGJvb2xlYW47XG5cdC8vIH1cblxuXHRASW5wdXQoKVxuXHRwdWJsaWMgb3B0aW9uczogV2luZG93T3B0aW9uO1xuXG5cdEBJbnB1dCgpXG4gIHB1YmxpYyBhY3RpdmVPcHRpb25UcmFja2VyOiBXaW5kb3dPcHRpb247XG5cbiAgQElucHV0KClcblx0cHVibGljIHdpbmRvdzogV2luZG93O1xuXG5cdEBPdXRwdXQoKVxuXHRwdWJsaWMgYWN0aXZlT3B0aW9uVHJhY2tlckNoYW5nZTogRXZlbnRFbWl0dGVyPFdpbmRvd09wdGlvbj4gPSBuZXcgRXZlbnRFbWl0dGVyPFdpbmRvd09wdGlvbj4oKTtcblxuXHRvbk9wdGlvbkNsaWNrZWQob3B0aW9uOiBXaW5kb3dPcHRpb24sIGJ1dHRvbjogV2luZG93QnV0dG9uKTogdm9pZFxuXHR7XG5cdFx0aWYgKGJ1dHRvbi5hY3Rpb24pIHtcblx0XHRcdGlmKGJ1dHRvbi5lbmFibGVCdXR0b24pIHtcblx0XHRcdFx0aWYoIWJ1dHRvbi5lbmFibGVCdXR0b24odGhpcy53aW5kb3cucGFydGljaXBhbnQpKVxuXHRcdFx0XHRcdHJldHVybjtcblx0XHRcdH1cblx0XHRcdGJ1dHRvbi5hY3Rpb24odGhpcy53aW5kb3cpO1xuXHRcdH1cblx0XHRpZih0aGlzLmFjdGl2ZU9wdGlvblRyYWNrZXJDaGFuZ2UpXG5cdFx0XHR0aGlzLmFjdGl2ZU9wdGlvblRyYWNrZXJDaGFuZ2UuZW1pdChvcHRpb24pO1xuXHR9XG59XG4iXX0=