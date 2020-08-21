import { PipeTransform } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { DomSanitizer } from '@angular/platform-browser';
export declare class SecurePipe implements PipeTransform {
    private http;
    private sanitizer;
    constructor(http: HttpClient, sanitizer: DomSanitizer);
    transform(url: string): Observable<string | ArrayBuffer>;
}
