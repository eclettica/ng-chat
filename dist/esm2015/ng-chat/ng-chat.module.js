import { __decorate } from "tslib";
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { NgChat } from './ng-chat.component';
import { EmojifyPipe } from './pipes/emojify.pipe';
import { LinkfyPipe } from './pipes/linkfy.pipe';
import { SanitizePipe } from './pipes/sanitize.pipe';
import { GroupMessageDisplayNamePipe } from './pipes/group-message-display-name.pipe';
import { NgChatOptionsComponent } from './components/ng-chat-options/ng-chat-options.component';
import { NgChatFriendsListComponent } from './components/ng-chat-friends-list/ng-chat-friends-list.component';
import { NgChatWindowComponent } from './components/ng-chat-window/ng-chat-window.component';
let NgChatModule = class NgChatModule {
};
NgChatModule = __decorate([
    NgModule({
        imports: [CommonModule, FormsModule, HttpClientModule],
        declarations: [
            NgChat,
            EmojifyPipe,
            LinkfyPipe,
            SanitizePipe,
            GroupMessageDisplayNamePipe,
            NgChatOptionsComponent,
            NgChatFriendsListComponent,
            NgChatWindowComponent
        ],
        exports: [NgChat]
    })
], NgChatModule);
export { NgChatModule };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmctY2hhdC5tb2R1bGUuanMiLCJzb3VyY2VSb290Ijoibmc6Ly9uZy1jaGF0LyIsInNvdXJjZXMiOlsibmctY2hhdC9uZy1jaGF0Lm1vZHVsZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUEsT0FBTyxFQUFFLFlBQVksRUFBRSxNQUFNLGlCQUFpQixDQUFDO0FBQy9DLE9BQU8sRUFBRSxRQUFRLEVBQUUsTUFBTSxlQUFlLENBQUM7QUFDekMsT0FBTyxFQUFFLFdBQVcsRUFBRSxNQUFNLGdCQUFnQixDQUFDO0FBQzdDLE9BQU8sRUFBRSxnQkFBZ0IsRUFBRSxNQUFNLHNCQUFzQixDQUFDO0FBRXhELE9BQU8sRUFBRSxNQUFNLEVBQUUsTUFBTSxxQkFBcUIsQ0FBQztBQUM3QyxPQUFPLEVBQUUsV0FBVyxFQUFFLE1BQU0sc0JBQXNCLENBQUM7QUFDbkQsT0FBTyxFQUFFLFVBQVUsRUFBRSxNQUFNLHFCQUFxQixDQUFDO0FBQ2pELE9BQU8sRUFBRSxZQUFZLEVBQUUsTUFBTSx1QkFBdUIsQ0FBQztBQUNyRCxPQUFPLEVBQUUsMkJBQTJCLEVBQUUsTUFBTSx5Q0FBeUMsQ0FBQztBQUN0RixPQUFPLEVBQUUsc0JBQXNCLEVBQUUsTUFBTSx3REFBd0QsQ0FBQztBQUNoRyxPQUFPLEVBQUUsMEJBQTBCLEVBQUUsTUFBTSxrRUFBa0UsQ0FBQztBQUM5RyxPQUFPLEVBQUUscUJBQXFCLEVBQUUsTUFBTSxzREFBc0QsQ0FBQztBQWdCN0YsSUFBYSxZQUFZLEdBQXpCLE1BQWEsWUFBWTtDQUN4QixDQUFBO0FBRFksWUFBWTtJQWR4QixRQUFRLENBQUM7UUFDUixPQUFPLEVBQUUsQ0FBQyxZQUFZLEVBQUUsV0FBVyxFQUFFLGdCQUFnQixDQUFDO1FBQ3RELFlBQVksRUFBRTtZQUNaLE1BQU07WUFDTixXQUFXO1lBQ1gsVUFBVTtZQUNWLFlBQVk7WUFDWiwyQkFBMkI7WUFDM0Isc0JBQXNCO1lBQ3RCLDBCQUEwQjtZQUMxQixxQkFBcUI7U0FDdEI7UUFDRCxPQUFPLEVBQUUsQ0FBQyxNQUFNLENBQUM7S0FDbEIsQ0FBQztHQUNXLFlBQVksQ0FDeEI7U0FEWSxZQUFZIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgQ29tbW9uTW9kdWxlIH0gZnJvbSAnQGFuZ3VsYXIvY29tbW9uJztcbmltcG9ydCB7IE5nTW9kdWxlIH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQgeyBGb3Jtc01vZHVsZSB9IGZyb20gJ0Bhbmd1bGFyL2Zvcm1zJztcbmltcG9ydCB7IEh0dHBDbGllbnRNb2R1bGUgfSBmcm9tICdAYW5ndWxhci9jb21tb24vaHR0cCc7XG5cbmltcG9ydCB7IE5nQ2hhdCB9IGZyb20gJy4vbmctY2hhdC5jb21wb25lbnQnO1xuaW1wb3J0IHsgRW1vamlmeVBpcGUgfSBmcm9tICcuL3BpcGVzL2Vtb2ppZnkucGlwZSc7XG5pbXBvcnQgeyBMaW5rZnlQaXBlIH0gZnJvbSAnLi9waXBlcy9saW5rZnkucGlwZSc7XG5pbXBvcnQgeyBTYW5pdGl6ZVBpcGUgfSBmcm9tICcuL3BpcGVzL3Nhbml0aXplLnBpcGUnO1xuaW1wb3J0IHsgR3JvdXBNZXNzYWdlRGlzcGxheU5hbWVQaXBlIH0gZnJvbSAnLi9waXBlcy9ncm91cC1tZXNzYWdlLWRpc3BsYXktbmFtZS5waXBlJztcbmltcG9ydCB7IE5nQ2hhdE9wdGlvbnNDb21wb25lbnQgfSBmcm9tICcuL2NvbXBvbmVudHMvbmctY2hhdC1vcHRpb25zL25nLWNoYXQtb3B0aW9ucy5jb21wb25lbnQnO1xuaW1wb3J0IHsgTmdDaGF0RnJpZW5kc0xpc3RDb21wb25lbnQgfSBmcm9tICcuL2NvbXBvbmVudHMvbmctY2hhdC1mcmllbmRzLWxpc3QvbmctY2hhdC1mcmllbmRzLWxpc3QuY29tcG9uZW50JztcbmltcG9ydCB7IE5nQ2hhdFdpbmRvd0NvbXBvbmVudCB9IGZyb20gJy4vY29tcG9uZW50cy9uZy1jaGF0LXdpbmRvdy9uZy1jaGF0LXdpbmRvdy5jb21wb25lbnQnO1xuXG5ATmdNb2R1bGUoe1xuICBpbXBvcnRzOiBbQ29tbW9uTW9kdWxlLCBGb3Jtc01vZHVsZSwgSHR0cENsaWVudE1vZHVsZV0sXG4gIGRlY2xhcmF0aW9uczogW1xuICAgIE5nQ2hhdCwgXG4gICAgRW1vamlmeVBpcGUsIFxuICAgIExpbmtmeVBpcGUsIFxuICAgIFNhbml0aXplUGlwZSwgXG4gICAgR3JvdXBNZXNzYWdlRGlzcGxheU5hbWVQaXBlLCBcbiAgICBOZ0NoYXRPcHRpb25zQ29tcG9uZW50LCBcbiAgICBOZ0NoYXRGcmllbmRzTGlzdENvbXBvbmVudCwgXG4gICAgTmdDaGF0V2luZG93Q29tcG9uZW50XG4gIF0sXG4gIGV4cG9ydHM6IFtOZ0NoYXRdXG59KVxuZXhwb3J0IGNsYXNzIE5nQ2hhdE1vZHVsZSB7XG59XG4iXX0=