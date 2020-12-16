
import {throwError as observableThrowError, Observable} from 'rxjs';

import {catchError, map} from 'rxjs/operators';
import {Injectable} from '@angular/core';
import {Http, Response} from '@angular/http';



import { WtLoggingService } from './wt-logging.service';
import * as Sentry from '@sentry/browser';

@Injectable()
export class WTHttpService {

  constructor(private http: Http, private wtLoggingService: WtLoggingService) {
  }

  get(url: string, headers: any): Observable<string[]> {
    return this.http.get(url, headers).pipe(
      map((res: Response) => res.json()),
      catchError(error => this.handleError(error)),);
  }

  post(url: string, body: string, options: Object): Observable<string[]> {
    return this.http.post(url, body, options).pipe( // ...using post request
      map((res: Response) => res.json()), // ...and calling .json() on the response to return data
      catchError(error => this.handleError(error)),); //...errors if any
  }

  /**
   * Handle HTTP error
   */
  private handleError(error: any) {
    // In a real world app, we might use a remote logging infrastructure
    // We'd also dig deeper into the error to get a better message
    // Sentry.captureException(error);
    //this.wtLoggingService.logError(error);
    if (error.status === 401) {
      sessionStorage.clear();
      window.location.reload();
      return observableThrowError('401 Unauthorized');
    }
    let errMsg = (error.message) ? error.message :
      error.status ? `${error.status} - ${error.statusText}` : 'Server error';
    console.error(errMsg); // log to console instead
    return observableThrowError(error.json());
  }
}
