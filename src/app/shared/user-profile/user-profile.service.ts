import {Injectable} from '@angular/core';
import {Headers, RequestOptions} from '@angular/http';
import {WTHttpService} from '../service/wt-http.service';
import {WTStorageService} from '../service/wt-storage.service';
import {WTUtilService} from '../service/wt-util.service';

@Injectable()
export class UserProfileService {

  constructor(private wthttpService: WTHttpService,
              private wtStorageService: WTStorageService,
              private wtUtilService: WTUtilService) {
  }

  getUserProfileDetails(): any {
    // let headers = this.getHeaders(this.wtStorageService.crmToken);
    // return this.callUserProfile(`${this.wtUtilService.config.CRM_BASE_URL}${this.wtUtilService.config.USER_PROFILE}`, headers);
  }

  private callUserProfile(url: string, headers: any): any {
    return this.wthttpService.get(url, {headers: headers});
  }

  private getHeaders(token: any) {
    var headers = new Headers({});
    headers.append('lang', this.wtStorageService.selected_lang);
    headers.append('Content-type', 'application/json');
    headers.append('Authorization', `${token}`);
    return headers;
  }

}
