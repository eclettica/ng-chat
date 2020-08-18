import { EventEmitter } from '@angular/core';
import { WindowOption } from '../../core/window-option';
import { WindowButton } from '../../core/window-button';
export declare class NgChatWindowOptionsComponent {
    buttons: WindowButton[] | undefined;
    constructor();
    options: WindowOption;
    activeOptionTracker: WindowOption;
    activeOptionTrackerChange: EventEmitter<WindowOption>;
    onOptionClicked(option: WindowOption, button: WindowButton): void;
}
