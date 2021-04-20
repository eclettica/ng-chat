import { EventEmitter } from '@angular/core';
import { WindowOption } from '../../core/window-option';
import { WindowButton } from '../../core/window-button';
import { Window } from '../../core/window';
export declare class NgChatWindowOptionsComponent {
    constructor();
    options: WindowOption;
    activeOptionTracker: WindowOption;
    window: Window;
    activeOptionTrackerChange: EventEmitter<WindowOption>;
    onOptionClicked(option: WindowOption, button: WindowButton): void;
}
