import { EventEmitter } from '@angular/core';
import { IChatOption } from '../../core/chat-option';
export declare class NgChatOptionsComponent {
    constructor();
    options: IChatOption[];
    activeOptionTracker: IChatOption;
    activeOptionTrackerChange: EventEmitter<IChatOption>;
    onOptionClicked(option: IChatOption): void;
}
