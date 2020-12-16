import { Injectable } from '@angular/core';
import { WTStorageService } from './wt-storage.service';
import {Http } from '@angular/http';
import { WTUtilService } from './wt-util.service';
import { Headers, RequestOptions } from '@angular/http';

@Injectable()
export class WtLoggingService {

  constructor(private wtStorageService: WTStorageService,
    private wtUtilService: WTUtilService, private http: Http ) {
    }

    logInfo(message?) {
        const headers = new Headers({});
        headers.append('secretkey', this.wtUtilService.config.SECRET_KEY);
        headers.append('lang', this.wtStorageService.selected_lang);
        headers.append('IP', this.wtStorageService.ip);
        const options = new RequestOptions({headers: headers});
        const postParams: any = {message: message};

        return this.http.post(`${this.wtUtilService.config.LOGGING_BASE_URL}/logInfo`, postParams, options);

    }

    logError(message?) {
      const headers = new Headers({});
      headers.append('secretkey', this.wtUtilService.config.SECRET_KEY);
      headers.append('lang', this.wtStorageService.selected_lang);
      headers.append('IP', this.wtStorageService.ip);
      const options = new RequestOptions({headers: headers});
      const postParams: any = {message: message};

      this.http.post(`${this.wtUtilService.config.LOGGING_BASE_URL}/logError`, postParams, options).subscribe(
        (data: any) => {
          // do nothing
        });
    }
}
