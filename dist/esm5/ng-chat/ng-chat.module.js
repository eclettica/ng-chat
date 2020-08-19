import { __decorate } from "tslib";
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { MatIconModule } from '@angular/material/icon';
import { NgChat } from './ng-chat.component';
import { EmojifyPipe } from './pipes/emojify.pipe';
import { LinkfyPipe } from './pipes/linkfy.pipe';
import { SanitizePipe } from './pipes/sanitize.pipe';
import { SecurePipe } from './pipes/secure.pipe';
import { GroupMessageDisplayNamePipe } from './pipes/group-message-display-name.pipe';
import { NgChatOptionsComponent } from './components/ng-chat-options/ng-chat-options.component';
import { NgChatWindowOptionsComponent } from './components/ng-chat-window-options/ng-chat-window-options.component';
import { NgChatFriendsListComponent } from './components/ng-chat-friends-list/ng-chat-friends-list.component';
import { NgChatWindowComponent } from './components/ng-chat-window/ng-chat-window.component';
var NgChatModule = /** @class */ (function () {
    function NgChatModule() {
    }
    NgChatModule = __decorate([
        NgModule({
            imports: [CommonModule, FormsModule, HttpClientModule, MatIconModule],
            declarations: [
                NgChat,
                EmojifyPipe,
                LinkfyPipe,
                SanitizePipe,
                SecurePipe,
                GroupMessageDisplayNamePipe,
                NgChatOptionsComponent,
                NgChatWindowOptionsComponent,
                NgChatFriendsListComponent,
                NgChatWindowComponent
            ],
            exports: [NgChat]
        })
    ], NgChatModule);
    return NgChatModule;
}());
export { NgChatModule };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmctY2hhdC5tb2R1bGUuanMiLCJzb3VyY2VSb290Ijoibmc6Ly9uZy1jaGF0LyIsInNvdXJjZXMiOlsibmctY2hhdC9uZy1jaGF0Lm1vZHVsZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUEsT0FBTyxFQUFFLFlBQVksRUFBRSxNQUFNLGlCQUFpQixDQUFDO0FBQy9DLE9BQU8sRUFBRSxRQUFRLEVBQUUsTUFBTSxlQUFlLENBQUM7QUFDekMsT0FBTyxFQUFFLFdBQVcsRUFBRSxNQUFNLGdCQUFnQixDQUFDO0FBQzdDLE9BQU8sRUFBRSxnQkFBZ0IsRUFBRSxNQUFNLHNCQUFzQixDQUFDO0FBQ3hELE9BQU8sRUFBRSxhQUFhLEVBQUUsTUFBTSx3QkFBd0IsQ0FBQztBQUd2RCxPQUFPLEVBQUUsTUFBTSxFQUFFLE1BQU0scUJBQXFCLENBQUM7QUFDN0MsT0FBTyxFQUFFLFdBQVcsRUFBRSxNQUFNLHNCQUFzQixDQUFDO0FBQ25ELE9BQU8sRUFBRSxVQUFVLEVBQUUsTUFBTSxxQkFBcUIsQ0FBQztBQUNqRCxPQUFPLEVBQUUsWUFBWSxFQUFFLE1BQU0sdUJBQXVCLENBQUM7QUFDckQsT0FBTyxFQUFFLFVBQVUsRUFBRSxNQUFNLHFCQUFxQixDQUFDO0FBQ2pELE9BQU8sRUFBRSwyQkFBMkIsRUFBRSxNQUFNLHlDQUF5QyxDQUFDO0FBQ3RGLE9BQU8sRUFBRSxzQkFBc0IsRUFBRSxNQUFNLHdEQUF3RCxDQUFDO0FBQ2hHLE9BQU8sRUFBRSw0QkFBNEIsRUFBRSxNQUFNLHNFQUFzRSxDQUFDO0FBQ3BILE9BQU8sRUFBRSwwQkFBMEIsRUFBRSxNQUFNLGtFQUFrRSxDQUFDO0FBQzlHLE9BQU8sRUFBRSxxQkFBcUIsRUFBRSxNQUFNLHNEQUFzRCxDQUFDO0FBa0I3RjtJQUFBO0lBQ0EsQ0FBQztJQURZLFlBQVk7UUFoQnhCLFFBQVEsQ0FBQztZQUNSLE9BQU8sRUFBRSxDQUFDLFlBQVksRUFBRSxXQUFXLEVBQUUsZ0JBQWdCLEVBQUUsYUFBYSxDQUFDO1lBQ3JFLFlBQVksRUFBRTtnQkFDWixNQUFNO2dCQUNOLFdBQVc7Z0JBQ1gsVUFBVTtnQkFDVixZQUFZO2dCQUNaLFVBQVU7Z0JBQ1YsMkJBQTJCO2dCQUMzQixzQkFBc0I7Z0JBQ3RCLDRCQUE0QjtnQkFDNUIsMEJBQTBCO2dCQUMxQixxQkFBcUI7YUFDdEI7WUFDRCxPQUFPLEVBQUUsQ0FBQyxNQUFNLENBQUM7U0FDbEIsQ0FBQztPQUNXLFlBQVksQ0FDeEI7SUFBRCxtQkFBQztDQUFBLEFBREQsSUFDQztTQURZLFlBQVkiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBDb21tb25Nb2R1bGUgfSBmcm9tICdAYW5ndWxhci9jb21tb24nO1xuaW1wb3J0IHsgTmdNb2R1bGUgfSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7IEZvcm1zTW9kdWxlIH0gZnJvbSAnQGFuZ3VsYXIvZm9ybXMnO1xuaW1wb3J0IHsgSHR0cENsaWVudE1vZHVsZSB9IGZyb20gJ0Bhbmd1bGFyL2NvbW1vbi9odHRwJztcbmltcG9ydCB7IE1hdEljb25Nb2R1bGUgfSBmcm9tICdAYW5ndWxhci9tYXRlcmlhbC9pY29uJztcblxuXG5pbXBvcnQgeyBOZ0NoYXQgfSBmcm9tICcuL25nLWNoYXQuY29tcG9uZW50JztcbmltcG9ydCB7IEVtb2ppZnlQaXBlIH0gZnJvbSAnLi9waXBlcy9lbW9qaWZ5LnBpcGUnO1xuaW1wb3J0IHsgTGlua2Z5UGlwZSB9IGZyb20gJy4vcGlwZXMvbGlua2Z5LnBpcGUnO1xuaW1wb3J0IHsgU2FuaXRpemVQaXBlIH0gZnJvbSAnLi9waXBlcy9zYW5pdGl6ZS5waXBlJztcbmltcG9ydCB7IFNlY3VyZVBpcGUgfSBmcm9tICcuL3BpcGVzL3NlY3VyZS5waXBlJztcbmltcG9ydCB7IEdyb3VwTWVzc2FnZURpc3BsYXlOYW1lUGlwZSB9IGZyb20gJy4vcGlwZXMvZ3JvdXAtbWVzc2FnZS1kaXNwbGF5LW5hbWUucGlwZSc7XG5pbXBvcnQgeyBOZ0NoYXRPcHRpb25zQ29tcG9uZW50IH0gZnJvbSAnLi9jb21wb25lbnRzL25nLWNoYXQtb3B0aW9ucy9uZy1jaGF0LW9wdGlvbnMuY29tcG9uZW50JztcbmltcG9ydCB7IE5nQ2hhdFdpbmRvd09wdGlvbnNDb21wb25lbnQgfSBmcm9tICcuL2NvbXBvbmVudHMvbmctY2hhdC13aW5kb3ctb3B0aW9ucy9uZy1jaGF0LXdpbmRvdy1vcHRpb25zLmNvbXBvbmVudCc7XG5pbXBvcnQgeyBOZ0NoYXRGcmllbmRzTGlzdENvbXBvbmVudCB9IGZyb20gJy4vY29tcG9uZW50cy9uZy1jaGF0LWZyaWVuZHMtbGlzdC9uZy1jaGF0LWZyaWVuZHMtbGlzdC5jb21wb25lbnQnO1xuaW1wb3J0IHsgTmdDaGF0V2luZG93Q29tcG9uZW50IH0gZnJvbSAnLi9jb21wb25lbnRzL25nLWNoYXQtd2luZG93L25nLWNoYXQtd2luZG93LmNvbXBvbmVudCc7XG5cbkBOZ01vZHVsZSh7XG4gIGltcG9ydHM6IFtDb21tb25Nb2R1bGUsIEZvcm1zTW9kdWxlLCBIdHRwQ2xpZW50TW9kdWxlLCBNYXRJY29uTW9kdWxlXSxcbiAgZGVjbGFyYXRpb25zOiBbXG4gICAgTmdDaGF0LCBcbiAgICBFbW9qaWZ5UGlwZSwgXG4gICAgTGlua2Z5UGlwZSwgXG4gICAgU2FuaXRpemVQaXBlLCBcbiAgICBTZWN1cmVQaXBlLFxuICAgIEdyb3VwTWVzc2FnZURpc3BsYXlOYW1lUGlwZSwgXG4gICAgTmdDaGF0T3B0aW9uc0NvbXBvbmVudCwgXG4gICAgTmdDaGF0V2luZG93T3B0aW9uc0NvbXBvbmVudCxcbiAgICBOZ0NoYXRGcmllbmRzTGlzdENvbXBvbmVudCwgXG4gICAgTmdDaGF0V2luZG93Q29tcG9uZW50XG4gIF0sXG4gIGV4cG9ydHM6IFtOZ0NoYXRdXG59KVxuZXhwb3J0IGNsYXNzIE5nQ2hhdE1vZHVsZSB7XG59XG4iXX0=