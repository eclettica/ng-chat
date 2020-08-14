import { PipeTransform } from '@angular/core';
export declare class EmojifyPipe implements PipeTransform {
    transform(message: string, pipeEnabled: boolean): string;
}
