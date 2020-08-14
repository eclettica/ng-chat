import { __decorate } from "tslib";
import { Component, Input, Output, EventEmitter } from '@angular/core';
let NgChatOptionsComponent = class NgChatOptionsComponent {
    constructor() {
        this.activeOptionTrackerChange = new EventEmitter();
    }
    onOptionClicked(option) {
        option.isActive = true;
        if (option.action) {
            option.action(option.chattingTo);
        }
        this.activeOptionTrackerChange.emit(option);
    }
};
__decorate([
    Input()
], NgChatOptionsComponent.prototype, "options", void 0);
__decorate([
    Input()
], NgChatOptionsComponent.prototype, "activeOptionTracker", void 0);
__decorate([
    Output()
], NgChatOptionsComponent.prototype, "activeOptionTrackerChange", void 0);
NgChatOptionsComponent = __decorate([
    Component({
        selector: 'ng-chat-options',
        template: "<div *ngIf=\"options && options.length > 0\" class=\"ng-chat-options\">\n\t\t<button class=\"ng-chat-options-activator\">\n\t\t\t<span class=\"primary-text\">...</span>\n\t\t</button>\n\t<div class=\"ng-chat-options-content primary-background shadowed\">\n\t\t<a *ngFor=\"let option of options; let i = index\" [ngClass]=\"'primary-text'\" (click)=\"onOptionClicked(option)\">\n\t\t\t{{option.displayLabel}}\n\t\t</a>\n\t</div>      \n</div>\n",
        styles: [".ng-chat-options-activator{background-color:unset;color:#fff;line-height:28px;border:none;position:relative}.ng-chat-options-activator>span{position:relative;top:-5px;left:0}.ng-chat-options{position:relative;display:inline-block}.ng-chat-options:hover .ng-chat-options-content{display:block}.ng-chat-options:hover .ng-chat-options-activator{background-color:#ddd}.ng-chat-options-content{display:none;position:absolute;min-width:160px;z-index:1}.ng-chat-options-content a:hover{background-color:#ddd}.ng-chat-options-content a{padding:6px 16px;text-decoration:none;display:block}@media only screen and (max-width:581px){.ng-chat-options-content{right:0}}"]
    })
], NgChatOptionsComponent);
export { NgChatOptionsComponent };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmctY2hhdC1vcHRpb25zLmNvbXBvbmVudC5qcyIsInNvdXJjZVJvb3QiOiJuZzovL25nLWNoYXQvIiwic291cmNlcyI6WyJuZy1jaGF0L2NvbXBvbmVudHMvbmctY2hhdC1vcHRpb25zL25nLWNoYXQtb3B0aW9ucy5jb21wb25lbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBLE9BQU8sRUFBRSxTQUFTLEVBQUUsS0FBSyxFQUFFLE1BQU0sRUFBRSxZQUFZLEVBQUUsTUFBTSxlQUFlLENBQUM7QUFRdkUsSUFBYSxzQkFBc0IsR0FBbkMsTUFBYSxzQkFBc0I7SUFFbEM7UUFTTyw4QkFBeUIsR0FBOEIsSUFBSSxZQUFZLEVBQWUsQ0FBQztJQVQ5RSxDQUFDO0lBV2pCLGVBQWUsQ0FBQyxNQUFtQjtRQUVsQyxNQUFNLENBQUMsUUFBUSxHQUFHLElBQUksQ0FBQztRQUV2QixJQUFJLE1BQU0sQ0FBQyxNQUFNLEVBQUU7WUFDbEIsTUFBTSxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsVUFBVSxDQUFDLENBQUM7U0FDakM7UUFFRCxJQUFJLENBQUMseUJBQXlCLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDO0lBQzdDLENBQUM7Q0FDRCxDQUFBO0FBbEJBO0lBREMsS0FBSyxFQUFFO3VEQUNzQjtBQUc5QjtJQURDLEtBQUssRUFBRTttRUFDZ0M7QUFHeEM7SUFEQyxNQUFNLEVBQUU7eUVBQ3FGO0FBWGxGLHNCQUFzQjtJQUxsQyxTQUFTLENBQUM7UUFDUCxRQUFRLEVBQUUsaUJBQWlCO1FBQzNCLHVjQUErQzs7S0FFbEQsQ0FBQztHQUNXLHNCQUFzQixDQXVCbEM7U0F2Qlksc0JBQXNCIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgQ29tcG9uZW50LCBJbnB1dCwgT3V0cHV0LCBFdmVudEVtaXR0ZXIgfSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7IElDaGF0T3B0aW9uIH0gZnJvbSAnLi4vLi4vY29yZS9jaGF0LW9wdGlvbic7XG5cbkBDb21wb25lbnQoe1xuICAgIHNlbGVjdG9yOiAnbmctY2hhdC1vcHRpb25zJyxcbiAgICB0ZW1wbGF0ZVVybDogJy4vbmctY2hhdC1vcHRpb25zLmNvbXBvbmVudC5odG1sJyxcbiAgICBzdHlsZVVybHM6IFsnLi9uZy1jaGF0LW9wdGlvbnMuY29tcG9uZW50LmNzcyddXG59KVxuZXhwb3J0IGNsYXNzIE5nQ2hhdE9wdGlvbnNDb21wb25lbnQge1xuXG5cdGNvbnN0cnVjdG9yKCkgeyB9XG5cblx0QElucHV0KClcblx0cHVibGljIG9wdGlvbnM6IElDaGF0T3B0aW9uW107XG5cblx0QElucHV0KClcblx0cHVibGljIGFjdGl2ZU9wdGlvblRyYWNrZXI6IElDaGF0T3B0aW9uO1xuXG5cdEBPdXRwdXQoKVxuXHRwdWJsaWMgYWN0aXZlT3B0aW9uVHJhY2tlckNoYW5nZTogRXZlbnRFbWl0dGVyPElDaGF0T3B0aW9uPiA9IG5ldyBFdmVudEVtaXR0ZXI8SUNoYXRPcHRpb24+KCk7XG5cblx0b25PcHRpb25DbGlja2VkKG9wdGlvbjogSUNoYXRPcHRpb24pOiB2b2lkXG5cdHtcblx0XHRvcHRpb24uaXNBY3RpdmUgPSB0cnVlO1xuXG5cdFx0aWYgKG9wdGlvbi5hY3Rpb24pIHsgICAgXG5cdFx0XHRvcHRpb24uYWN0aW9uKG9wdGlvbi5jaGF0dGluZ1RvKTsgICBcblx0XHR9XG5cblx0XHR0aGlzLmFjdGl2ZU9wdGlvblRyYWNrZXJDaGFuZ2UuZW1pdChvcHRpb24pO1xuXHR9XG59XG4iXX0=