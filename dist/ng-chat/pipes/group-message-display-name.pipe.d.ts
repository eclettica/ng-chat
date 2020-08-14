import { PipeTransform } from '@angular/core';
import { IChatParticipant } from "../core/chat-participant";
import { Message } from "../core/message";
export declare class GroupMessageDisplayNamePipe implements PipeTransform {
    transform(participant: IChatParticipant, message: Message): string;
}
