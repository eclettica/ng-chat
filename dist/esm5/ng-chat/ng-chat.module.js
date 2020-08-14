import { __decorate } from "tslib";
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { NgChat } from './ng-chat.component';
import { EmojifyPipe } from './pipes/emojify.pipe';
import { LinkfyPipe } from './pipes/linkfy.pipe';
import { SanitizePipe } from './pipes/sanitize.pipe';
import { SecurePipe } from './pipes/secure.pipe';
import { GroupMessageDisplayNamePipe } from './pipes/group-message-display-name.pipe';
import { NgChatOptionsComponent } from './components/ng-chat-options/ng-chat-options.component';
import { NgChatFriendsListComponent } from './components/ng-chat-friends-list/ng-chat-friends-list.component';
import { NgChatWindowComponent } from './components/ng-chat-window/ng-chat-window.component';
var NgChatModule = /** @class */ (function () {
    function NgChatModule() {
    }
    NgChatModule = __decorate([
        NgModule({
            imports: [CommonModule, FormsModule, HttpClientModule],
            declarations: [
                NgChat,
                EmojifyPipe,
                LinkfyPipe,
                SanitizePipe,
                SecurePipe,
                GroupMessageDisplayNamePipe,
                NgChatOptionsComponent,
                NgChatFriendsListComponent,
                NgChatWindowComponent
            ],
            exports: [NgChat]
        })
    ], NgChatModule);
    return NgChatModule;
}());
export { NgChatModule };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmctY2hhdC5tb2R1bGUuanMiLCJzb3VyY2VSb290Ijoibmc6Ly9uZy1jaGF0LyIsInNvdXJjZXMiOlsibmctY2hhdC9uZy1jaGF0Lm1vZHVsZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUEsT0FBTyxFQUFFLFlBQVksRUFBRSxNQUFNLGlCQUFpQixDQUFDO0FBQy9DLE9BQU8sRUFBRSxRQUFRLEVBQUUsTUFBTSxlQUFlLENBQUM7QUFDekMsT0FBTyxFQUFFLFdBQVcsRUFBRSxNQUFNLGdCQUFnQixDQUFDO0FBQzdDLE9BQU8sRUFBRSxnQkFBZ0IsRUFBRSxNQUFNLHNCQUFzQixDQUFDO0FBRXhELE9BQU8sRUFBRSxNQUFNLEVBQUUsTUFBTSxxQkFBcUIsQ0FBQztBQUM3QyxPQUFPLEVBQUUsV0FBVyxFQUFFLE1BQU0sc0JBQXNCLENBQUM7QUFDbkQsT0FBTyxFQUFFLFVBQVUsRUFBRSxNQUFNLHFCQUFxQixDQUFDO0FBQ2pELE9BQU8sRUFBRSxZQUFZLEVBQUUsTUFBTSx1QkFBdUIsQ0FBQztBQUNyRCxPQUFPLEVBQUUsVUFBVSxFQUFFLE1BQU0scUJBQXFCLENBQUM7QUFDakQsT0FBTyxFQUFFLDJCQUEyQixFQUFFLE1BQU0seUNBQXlDLENBQUM7QUFDdEYsT0FBTyxFQUFFLHNCQUFzQixFQUFFLE1BQU0sd0RBQXdELENBQUM7QUFDaEcsT0FBTyxFQUFFLDBCQUEwQixFQUFFLE1BQU0sa0VBQWtFLENBQUM7QUFDOUcsT0FBTyxFQUFFLHFCQUFxQixFQUFFLE1BQU0sc0RBQXNELENBQUM7QUFpQjdGO0lBQUE7SUFDQSxDQUFDO0lBRFksWUFBWTtRQWZ4QixRQUFRLENBQUM7WUFDUixPQUFPLEVBQUUsQ0FBQyxZQUFZLEVBQUUsV0FBVyxFQUFFLGdCQUFnQixDQUFDO1lBQ3RELFlBQVksRUFBRTtnQkFDWixNQUFNO2dCQUNOLFdBQVc7Z0JBQ1gsVUFBVTtnQkFDVixZQUFZO2dCQUNaLFVBQVU7Z0JBQ1YsMkJBQTJCO2dCQUMzQixzQkFBc0I7Z0JBQ3RCLDBCQUEwQjtnQkFDMUIscUJBQXFCO2FBQ3RCO1lBQ0QsT0FBTyxFQUFFLENBQUMsTUFBTSxDQUFDO1NBQ2xCLENBQUM7T0FDVyxZQUFZLENBQ3hCO0lBQUQsbUJBQUM7Q0FBQSxBQURELElBQ0M7U0FEWSxZQUFZIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgQ29tbW9uTW9kdWxlIH0gZnJvbSAnQGFuZ3VsYXIvY29tbW9uJztcbmltcG9ydCB7IE5nTW9kdWxlIH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQgeyBGb3Jtc01vZHVsZSB9IGZyb20gJ0Bhbmd1bGFyL2Zvcm1zJztcbmltcG9ydCB7IEh0dHBDbGllbnRNb2R1bGUgfSBmcm9tICdAYW5ndWxhci9jb21tb24vaHR0cCc7XG5cbmltcG9ydCB7IE5nQ2hhdCB9IGZyb20gJy4vbmctY2hhdC5jb21wb25lbnQnO1xuaW1wb3J0IHsgRW1vamlmeVBpcGUgfSBmcm9tICcuL3BpcGVzL2Vtb2ppZnkucGlwZSc7XG5pbXBvcnQgeyBMaW5rZnlQaXBlIH0gZnJvbSAnLi9waXBlcy9saW5rZnkucGlwZSc7XG5pbXBvcnQgeyBTYW5pdGl6ZVBpcGUgfSBmcm9tICcuL3BpcGVzL3Nhbml0aXplLnBpcGUnO1xuaW1wb3J0IHsgU2VjdXJlUGlwZSB9IGZyb20gJy4vcGlwZXMvc2VjdXJlLnBpcGUnO1xuaW1wb3J0IHsgR3JvdXBNZXNzYWdlRGlzcGxheU5hbWVQaXBlIH0gZnJvbSAnLi9waXBlcy9ncm91cC1tZXNzYWdlLWRpc3BsYXktbmFtZS5waXBlJztcbmltcG9ydCB7IE5nQ2hhdE9wdGlvbnNDb21wb25lbnQgfSBmcm9tICcuL2NvbXBvbmVudHMvbmctY2hhdC1vcHRpb25zL25nLWNoYXQtb3B0aW9ucy5jb21wb25lbnQnO1xuaW1wb3J0IHsgTmdDaGF0RnJpZW5kc0xpc3RDb21wb25lbnQgfSBmcm9tICcuL2NvbXBvbmVudHMvbmctY2hhdC1mcmllbmRzLWxpc3QvbmctY2hhdC1mcmllbmRzLWxpc3QuY29tcG9uZW50JztcbmltcG9ydCB7IE5nQ2hhdFdpbmRvd0NvbXBvbmVudCB9IGZyb20gJy4vY29tcG9uZW50cy9uZy1jaGF0LXdpbmRvdy9uZy1jaGF0LXdpbmRvdy5jb21wb25lbnQnO1xuXG5ATmdNb2R1bGUoe1xuICBpbXBvcnRzOiBbQ29tbW9uTW9kdWxlLCBGb3Jtc01vZHVsZSwgSHR0cENsaWVudE1vZHVsZV0sXG4gIGRlY2xhcmF0aW9uczogW1xuICAgIE5nQ2hhdCwgXG4gICAgRW1vamlmeVBpcGUsIFxuICAgIExpbmtmeVBpcGUsIFxuICAgIFNhbml0aXplUGlwZSwgXG4gICAgU2VjdXJlUGlwZSxcbiAgICBHcm91cE1lc3NhZ2VEaXNwbGF5TmFtZVBpcGUsIFxuICAgIE5nQ2hhdE9wdGlvbnNDb21wb25lbnQsIFxuICAgIE5nQ2hhdEZyaWVuZHNMaXN0Q29tcG9uZW50LCBcbiAgICBOZ0NoYXRXaW5kb3dDb21wb25lbnRcbiAgXSxcbiAgZXhwb3J0czogW05nQ2hhdF1cbn0pXG5leHBvcnQgY2xhc3MgTmdDaGF0TW9kdWxlIHtcbn1cbiJdfQ==