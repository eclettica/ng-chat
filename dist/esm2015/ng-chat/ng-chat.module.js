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
            SecurePipe,
            GroupMessageDisplayNamePipe,
            NgChatOptionsComponent,
            NgChatFriendsListComponent,
            NgChatWindowComponent
        ],
        exports: [NgChat]
    })
], NgChatModule);
export { NgChatModule };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmctY2hhdC5tb2R1bGUuanMiLCJzb3VyY2VSb290Ijoibmc6Ly9uZy1jaGF0LyIsInNvdXJjZXMiOlsibmctY2hhdC9uZy1jaGF0Lm1vZHVsZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUEsT0FBTyxFQUFFLFlBQVksRUFBRSxNQUFNLGlCQUFpQixDQUFDO0FBQy9DLE9BQU8sRUFBRSxRQUFRLEVBQUUsTUFBTSxlQUFlLENBQUM7QUFDekMsT0FBTyxFQUFFLFdBQVcsRUFBRSxNQUFNLGdCQUFnQixDQUFDO0FBQzdDLE9BQU8sRUFBRSxnQkFBZ0IsRUFBRSxNQUFNLHNCQUFzQixDQUFDO0FBRXhELE9BQU8sRUFBRSxNQUFNLEVBQUUsTUFBTSxxQkFBcUIsQ0FBQztBQUM3QyxPQUFPLEVBQUUsV0FBVyxFQUFFLE1BQU0sc0JBQXNCLENBQUM7QUFDbkQsT0FBTyxFQUFFLFVBQVUsRUFBRSxNQUFNLHFCQUFxQixDQUFDO0FBQ2pELE9BQU8sRUFBRSxZQUFZLEVBQUUsTUFBTSx1QkFBdUIsQ0FBQztBQUNyRCxPQUFPLEVBQUUsVUFBVSxFQUFFLE1BQU0scUJBQXFCLENBQUM7QUFDakQsT0FBTyxFQUFFLDJCQUEyQixFQUFFLE1BQU0seUNBQXlDLENBQUM7QUFDdEYsT0FBTyxFQUFFLHNCQUFzQixFQUFFLE1BQU0sd0RBQXdELENBQUM7QUFDaEcsT0FBTyxFQUFFLDBCQUEwQixFQUFFLE1BQU0sa0VBQWtFLENBQUM7QUFDOUcsT0FBTyxFQUFFLHFCQUFxQixFQUFFLE1BQU0sc0RBQXNELENBQUM7QUFpQjdGLElBQWEsWUFBWSxHQUF6QixNQUFhLFlBQVk7Q0FDeEIsQ0FBQTtBQURZLFlBQVk7SUFmeEIsUUFBUSxDQUFDO1FBQ1IsT0FBTyxFQUFFLENBQUMsWUFBWSxFQUFFLFdBQVcsRUFBRSxnQkFBZ0IsQ0FBQztRQUN0RCxZQUFZLEVBQUU7WUFDWixNQUFNO1lBQ04sV0FBVztZQUNYLFVBQVU7WUFDVixZQUFZO1lBQ1osVUFBVTtZQUNWLDJCQUEyQjtZQUMzQixzQkFBc0I7WUFDdEIsMEJBQTBCO1lBQzFCLHFCQUFxQjtTQUN0QjtRQUNELE9BQU8sRUFBRSxDQUFDLE1BQU0sQ0FBQztLQUNsQixDQUFDO0dBQ1csWUFBWSxDQUN4QjtTQURZLFlBQVkiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBDb21tb25Nb2R1bGUgfSBmcm9tICdAYW5ndWxhci9jb21tb24nO1xuaW1wb3J0IHsgTmdNb2R1bGUgfSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7IEZvcm1zTW9kdWxlIH0gZnJvbSAnQGFuZ3VsYXIvZm9ybXMnO1xuaW1wb3J0IHsgSHR0cENsaWVudE1vZHVsZSB9IGZyb20gJ0Bhbmd1bGFyL2NvbW1vbi9odHRwJztcblxuaW1wb3J0IHsgTmdDaGF0IH0gZnJvbSAnLi9uZy1jaGF0LmNvbXBvbmVudCc7XG5pbXBvcnQgeyBFbW9qaWZ5UGlwZSB9IGZyb20gJy4vcGlwZXMvZW1vamlmeS5waXBlJztcbmltcG9ydCB7IExpbmtmeVBpcGUgfSBmcm9tICcuL3BpcGVzL2xpbmtmeS5waXBlJztcbmltcG9ydCB7IFNhbml0aXplUGlwZSB9IGZyb20gJy4vcGlwZXMvc2FuaXRpemUucGlwZSc7XG5pbXBvcnQgeyBTZWN1cmVQaXBlIH0gZnJvbSAnLi9waXBlcy9zZWN1cmUucGlwZSc7XG5pbXBvcnQgeyBHcm91cE1lc3NhZ2VEaXNwbGF5TmFtZVBpcGUgfSBmcm9tICcuL3BpcGVzL2dyb3VwLW1lc3NhZ2UtZGlzcGxheS1uYW1lLnBpcGUnO1xuaW1wb3J0IHsgTmdDaGF0T3B0aW9uc0NvbXBvbmVudCB9IGZyb20gJy4vY29tcG9uZW50cy9uZy1jaGF0LW9wdGlvbnMvbmctY2hhdC1vcHRpb25zLmNvbXBvbmVudCc7XG5pbXBvcnQgeyBOZ0NoYXRGcmllbmRzTGlzdENvbXBvbmVudCB9IGZyb20gJy4vY29tcG9uZW50cy9uZy1jaGF0LWZyaWVuZHMtbGlzdC9uZy1jaGF0LWZyaWVuZHMtbGlzdC5jb21wb25lbnQnO1xuaW1wb3J0IHsgTmdDaGF0V2luZG93Q29tcG9uZW50IH0gZnJvbSAnLi9jb21wb25lbnRzL25nLWNoYXQtd2luZG93L25nLWNoYXQtd2luZG93LmNvbXBvbmVudCc7XG5cbkBOZ01vZHVsZSh7XG4gIGltcG9ydHM6IFtDb21tb25Nb2R1bGUsIEZvcm1zTW9kdWxlLCBIdHRwQ2xpZW50TW9kdWxlXSxcbiAgZGVjbGFyYXRpb25zOiBbXG4gICAgTmdDaGF0LCBcbiAgICBFbW9qaWZ5UGlwZSwgXG4gICAgTGlua2Z5UGlwZSwgXG4gICAgU2FuaXRpemVQaXBlLCBcbiAgICBTZWN1cmVQaXBlLFxuICAgIEdyb3VwTWVzc2FnZURpc3BsYXlOYW1lUGlwZSwgXG4gICAgTmdDaGF0T3B0aW9uc0NvbXBvbmVudCwgXG4gICAgTmdDaGF0RnJpZW5kc0xpc3RDb21wb25lbnQsIFxuICAgIE5nQ2hhdFdpbmRvd0NvbXBvbmVudFxuICBdLFxuICBleHBvcnRzOiBbTmdDaGF0XVxufSlcbmV4cG9ydCBjbGFzcyBOZ0NoYXRNb2R1bGUge1xufVxuIl19