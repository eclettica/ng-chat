import { EventEmitter } from '@angular/core';
import { WindowOption } from '../../core/window-option';
import { WindowButton } from '../../core/window-button';
export declare class NgChatWindowOptionsComponent {
    constructor();
    options: WindowOption;
    activeOptionTracker: WindowOption;
    activeOptionTrackerChange: EventEmitter<WindowOption>;
    onOptionClicked(option: WindowOption, button: WindowButton): void;
}
