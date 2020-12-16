import {Injectable} from '@angular/core';
import {Headers, RequestOptions} from '@angular/http';
import {BehaviorSubject} from 'rxjs';
import {WTStorageService} from './wt-storage.service';
import {WTUtilService} from './wt-util.service';
import {WTHttpService} from './wt-http.service';


@Injectable()
export class WTCrmService {

  fetchRefreshToken: boolean = false;
  private crmCheckSub: BehaviorSubject<Object> = new BehaviorSubject({});

  constructor(private wtStorageService: WTStorageService,
              private wthttpService: WTHttpService,
              private wtUtilService: WTUtilService) {
  }

  startTokenRefresh() {
    if (!this.fetchRefreshToken) return;
    if (!this.wtStorageService.crmTokenExpireTime && !this.wtStorageService.userName
      && !this.wtStorageService.passWord) {
      this.wtStorageService.crmBaseUrl = this.wtUtilService.config.CRM_BASE_URL;
      this.wtStorageService.crmToken = sessionStorage.getItem('crmToken');
      this.wtStorageService.crmTokenExpireTime = parseInt(sessionStorage.getItem('crmTokenExpireTime'));
      this.wtStorageService.crmOffsetValue = parseInt(sessionStorage.getItem('crmOffsetValue'));
    }
    if (+new Date().getTime() + this.wtStorageService.crmOffsetValue > (this.wtStorageService.crmTokenExpireTime * 1000)) {
      this.authUser();
    } else {
      this.crmTokenExpiryCheck();
    }
  }

  private crmTokenExpiryCheck() {
    if (!this.fetchRefreshToken) return;
    setTimeout(
      () => {
        this.authUser();
      }, (this.wtStorageService.crmTokenExpireTime * 1000) - (+new Date().getTime() + this.wtStorageService.crmOffsetValue) - 20000);
  }

  private authUser() {
    if (!this.fetchRefreshToken) return;
    var loginHeaders = new Headers({});
    loginHeaders.append('Domain', this.wtUtilService.config.DOMAIN);
    loginHeaders.append('MerchantKey', this.wtUtilService.config.MERCHANT_KEY);
    loginHeaders.append('lang', this.wtStorageService.selected_lang);
    loginHeaders.append('Content-type', 'application/x-www-form-urlencoded; charset=UTF-8');
    loginHeaders.append('IP', this.wtStorageService.ip);
    loginHeaders.append('authorization', `bearer ${this.wtStorageService.crmToken}`);
    let options = new RequestOptions({headers: loginHeaders});
    this.wthttpService.get(`${this.wtStorageService.crmBaseUrl}${this.wtUtilService.config.REFRESH_URI}`, options).subscribe(
      (data: any) => {
        this.wtStorageService.crmToken = data.token;
        this.wtStorageService.crmTokenStartTime = data.start_time;
        this.wtStorageService.crmTokenExpireTime = data.expire_time;
        sessionStorage.setItem('crmToken', data.token);
        sessionStorage.setItem('crmTokenExpireTime', data.expire_time);
        this.crmTokenExpiryCheck();
      });
  }

  refreshToken() {
    var loginHeaders = new Headers({});
    loginHeaders.append('lang', 'en');
    loginHeaders.append('Content-type', 'application/json; charset=UTF-8');
    loginHeaders.append('Authorization', sessionStorage.getItem('crmToken'));
    let options = new RequestOptions({headers: loginHeaders});
    return this.wthttpService.post(this.wtStorageService.crmBaseUrl + this.wtUtilService.config.REFRESH_URI, null, options);

  }

  increaseTokenTime() {
    this.refreshToken();
    //setInterval(this.refreshToken , 900000);
    //setInterval(this.refreshToken.call(this) , 7000);
  }
}
