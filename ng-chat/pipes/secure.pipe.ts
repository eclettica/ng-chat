import { Pipe, PipeTransform } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { DomSanitizer } from '@angular/platform-browser';

/*
 * Sanitizes an URL resource
*/
@Pipe({name: 'secure'})
export class SecurePipe implements PipeTransform {

    constructor(private http: HttpClient,
      private sanitizer: DomSanitizer,
      ) { }
  
    transform(url: string) {
  
      return new Observable<string|ArrayBuffer>((observer) => {
        // This is a tiny blank image
        observer.next('data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==');
  
        // The next and error callbacks from the observer
        const {next, error} = observer;
        console.log('secure pipe');
        this.http.get(url, {responseType: 'blob'}).subscribe(response => {
          const reader = new FileReader();
          reader.readAsDataURL(response);
          reader.onloadend = () => {
              if(reader.result != null) {
                let res: any = reader.result;
                res = this.sanitizer.bypassSecurityTrustUrl(URL.createObjectURL(res))
                observer.next(res);
              }
                
          };
        });
  
        return {unsubscribe() {  }};
      });
    }
  }
