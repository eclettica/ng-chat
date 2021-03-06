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
let NgChatModule = class NgChatModule {
};
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
export { NgChatModule };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmctY2hhdC5tb2R1bGUuanMiLCJzb3VyY2VSb290Ijoibmc6Ly9uZy1jaGF0LyIsInNvdXJjZXMiOlsibmctY2hhdC9uZy1jaGF0Lm1vZHVsZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUEsT0FBTyxFQUFFLFlBQVksRUFBRSxNQUFNLGlCQUFpQixDQUFDO0FBQy9DLE9BQU8sRUFBRSxRQUFRLEVBQUUsTUFBTSxlQUFlLENBQUM7QUFDekMsT0FBTyxFQUFFLFdBQVcsRUFBRSxNQUFNLGdCQUFnQixDQUFDO0FBQzdDLE9BQU8sRUFBRSxnQkFBZ0IsRUFBRSxNQUFNLHNCQUFzQixDQUFDO0FBQ3hELE9BQU8sRUFBRSxhQUFhLEVBQUUsTUFBTSx3QkFBd0IsQ0FBQztBQUd2RCxPQUFPLEVBQUUsTUFBTSxFQUFFLE1BQU0scUJBQXFCLENBQUM7QUFDN0MsT0FBTyxFQUFFLFdBQVcsRUFBRSxNQUFNLHNCQUFzQixDQUFDO0FBQ25ELE9BQU8sRUFBRSxVQUFVLEVBQUUsTUFBTSxxQkFBcUIsQ0FBQztBQUNqRCxPQUFPLEVBQUUsWUFBWSxFQUFFLE1BQU0sdUJBQXVCLENBQUM7QUFDckQsT0FBTyxFQUFFLFVBQVUsRUFBRSxNQUFNLHFCQUFxQixDQUFDO0FBQ2pELE9BQU8sRUFBRSwyQkFBMkIsRUFBRSxNQUFNLHlDQUF5QyxDQUFDO0FBQ3RGLE9BQU8sRUFBRSxzQkFBc0IsRUFBRSxNQUFNLHdEQUF3RCxDQUFDO0FBQ2hHLE9BQU8sRUFBRSw0QkFBNEIsRUFBRSxNQUFNLHNFQUFzRSxDQUFDO0FBQ3BILE9BQU8sRUFBRSwwQkFBMEIsRUFBRSxNQUFNLGtFQUFrRSxDQUFDO0FBQzlHLE9BQU8sRUFBRSxxQkFBcUIsRUFBRSxNQUFNLHNEQUFzRCxDQUFDO0FBa0I3RixJQUFhLFlBQVksR0FBekIsTUFBYSxZQUFZO0NBQ3hCLENBQUE7QUFEWSxZQUFZO0lBaEJ4QixRQUFRLENBQUM7UUFDUixPQUFPLEVBQUUsQ0FBQyxZQUFZLEVBQUUsV0FBVyxFQUFFLGdCQUFnQixFQUFFLGFBQWEsQ0FBQztRQUNyRSxZQUFZLEVBQUU7WUFDWixNQUFNO1lBQ04sV0FBVztZQUNYLFVBQVU7WUFDVixZQUFZO1lBQ1osVUFBVTtZQUNWLDJCQUEyQjtZQUMzQixzQkFBc0I7WUFDdEIsNEJBQTRCO1lBQzVCLDBCQUEwQjtZQUMxQixxQkFBcUI7U0FDdEI7UUFDRCxPQUFPLEVBQUUsQ0FBQyxNQUFNLENBQUM7S0FDbEIsQ0FBQztHQUNXLFlBQVksQ0FDeEI7U0FEWSxZQUFZIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgQ29tbW9uTW9kdWxlIH0gZnJvbSAnQGFuZ3VsYXIvY29tbW9uJztcbmltcG9ydCB7IE5nTW9kdWxlIH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQgeyBGb3Jtc01vZHVsZSB9IGZyb20gJ0Bhbmd1bGFyL2Zvcm1zJztcbmltcG9ydCB7IEh0dHBDbGllbnRNb2R1bGUgfSBmcm9tICdAYW5ndWxhci9jb21tb24vaHR0cCc7XG5pbXBvcnQgeyBNYXRJY29uTW9kdWxlIH0gZnJvbSAnQGFuZ3VsYXIvbWF0ZXJpYWwvaWNvbic7XG5cblxuaW1wb3J0IHsgTmdDaGF0IH0gZnJvbSAnLi9uZy1jaGF0LmNvbXBvbmVudCc7XG5pbXBvcnQgeyBFbW9qaWZ5UGlwZSB9IGZyb20gJy4vcGlwZXMvZW1vamlmeS5waXBlJztcbmltcG9ydCB7IExpbmtmeVBpcGUgfSBmcm9tICcuL3BpcGVzL2xpbmtmeS5waXBlJztcbmltcG9ydCB7IFNhbml0aXplUGlwZSB9IGZyb20gJy4vcGlwZXMvc2FuaXRpemUucGlwZSc7XG5pbXBvcnQgeyBTZWN1cmVQaXBlIH0gZnJvbSAnLi9waXBlcy9zZWN1cmUucGlwZSc7XG5pbXBvcnQgeyBHcm91cE1lc3NhZ2VEaXNwbGF5TmFtZVBpcGUgfSBmcm9tICcuL3BpcGVzL2dyb3VwLW1lc3NhZ2UtZGlzcGxheS1uYW1lLnBpcGUnO1xuaW1wb3J0IHsgTmdDaGF0T3B0aW9uc0NvbXBvbmVudCB9IGZyb20gJy4vY29tcG9uZW50cy9uZy1jaGF0LW9wdGlvbnMvbmctY2hhdC1vcHRpb25zLmNvbXBvbmVudCc7XG5pbXBvcnQgeyBOZ0NoYXRXaW5kb3dPcHRpb25zQ29tcG9uZW50IH0gZnJvbSAnLi9jb21wb25lbnRzL25nLWNoYXQtd2luZG93LW9wdGlvbnMvbmctY2hhdC13aW5kb3ctb3B0aW9ucy5jb21wb25lbnQnO1xuaW1wb3J0IHsgTmdDaGF0RnJpZW5kc0xpc3RDb21wb25lbnQgfSBmcm9tICcuL2NvbXBvbmVudHMvbmctY2hhdC1mcmllbmRzLWxpc3QvbmctY2hhdC1mcmllbmRzLWxpc3QuY29tcG9uZW50JztcbmltcG9ydCB7IE5nQ2hhdFdpbmRvd0NvbXBvbmVudCB9IGZyb20gJy4vY29tcG9uZW50cy9uZy1jaGF0LXdpbmRvdy9uZy1jaGF0LXdpbmRvdy5jb21wb25lbnQnO1xuXG5ATmdNb2R1bGUoe1xuICBpbXBvcnRzOiBbQ29tbW9uTW9kdWxlLCBGb3Jtc01vZHVsZSwgSHR0cENsaWVudE1vZHVsZSwgTWF0SWNvbk1vZHVsZV0sXG4gIGRlY2xhcmF0aW9uczogW1xuICAgIE5nQ2hhdCwgXG4gICAgRW1vamlmeVBpcGUsIFxuICAgIExpbmtmeVBpcGUsIFxuICAgIFNhbml0aXplUGlwZSwgXG4gICAgU2VjdXJlUGlwZSxcbiAgICBHcm91cE1lc3NhZ2VEaXNwbGF5TmFtZVBpcGUsIFxuICAgIE5nQ2hhdE9wdGlvbnNDb21wb25lbnQsIFxuICAgIE5nQ2hhdFdpbmRvd09wdGlvbnNDb21wb25lbnQsXG4gICAgTmdDaGF0RnJpZW5kc0xpc3RDb21wb25lbnQsIFxuICAgIE5nQ2hhdFdpbmRvd0NvbXBvbmVudFxuICBdLFxuICBleHBvcnRzOiBbTmdDaGF0XVxufSlcbmV4cG9ydCBjbGFzcyBOZ0NoYXRNb2R1bGUge1xufVxuIl19