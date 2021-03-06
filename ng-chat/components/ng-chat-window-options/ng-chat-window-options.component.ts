import { Component, Input, Output, EventEmitter } from '@angular/core';
import { IChatOption } from '../../core/chat-option';
import { WindowOption } from '../../core/window-option';
import { WindowButton } from '../../core/window-button';
import { Window } from '../../core/window';

@Component({
    selector: 'ng-chat-window-options',
    templateUrl: './ng-chat-window-options.component.html',
    styleUrls: ['./ng-chat-window-options.component.css']
})
export class NgChatWindowOptionsComponent {
	//buttons: WindowButton[] | undefined;

	constructor() {
		//this.buttons = this.options.buttons;
	}

	// {
	// 	title: string;
	// 	showIcon: boolean;
	// 	icon: string;
	// 	action?: (chattingTo: Window) => void;
	// 	enableButton?: (participant: IChatParticipant) => boolean;
	// }

	@Input()
	public options: WindowOption;

	@Input()
  public activeOptionTracker: WindowOption;

  @Input()
	public window: Window;

	@Output()
	public activeOptionTrackerChange: EventEmitter<WindowOption> = new EventEmitter<WindowOption>();

	onOptionClicked(option: WindowOption, button: WindowButton): void
	{
		if (button.action) {
			if(button.enableButton) {
				if(!button.enableButton(this.window.participant))
					return;
			}
			button.action(this.window);
		}
		if(this.activeOptionTrackerChange)
			this.activeOptionTrackerChange.emit(option);
	}
}
