import {Injectable} from '@angular/core';
import {Headers, RequestOptions} from '@angular/http';
import {WTHttpService} from '../service/wt-http.service';
import {WTStorageService} from '../service/wt-storage.service';
import {WTUtilService} from '../service/wt-util.service';
import {WTCrmService} from '../service/wt-crm.service';

@Injectable()
export class Mt4LoginService {
  isAuthenticate: boolean = false;

  constructor(private wthttpService: WTHttpService,
              private wtstorageService: WTStorageService,
              private wtCrmService: WTCrmService,
              private wtUtilService: WTUtilService) {
    this.wtstorageService.crmBaseUrl = this.wtUtilService.config.CRM_BASE_URL;
    //this.wtCrmService.fetchRefreshToken = true;
    //this.wtCrmService.startTokenRefresh();
  }

  mt4AuthUser(userName: string, pswrd: string): any {
    this.isAuthenticate = false;
    var postParams = 'username=' + userName + '&password=' + pswrd + '&grant_type=' + 'password';
    var loginHeaders = new Headers({});
    loginHeaders.append('Domain', this.wtUtilService.config.DOMAIN);
    loginHeaders.append('MerchantKey', this.wtUtilService.config.MERCHANT_KEY);
    loginHeaders.append('lang', this.wtstorageService.selected_lang);
    loginHeaders.append('Content-type', 'application/x-www-form-urlencoded; charset=UTF-8');
    loginHeaders.append('IP', this.wtstorageService.ip);
    let options = new RequestOptions({headers: loginHeaders});
    if (this.wtstorageService.selectedMt4Account && this.wtstorageService.selectedMt4Account.demo) {
      return this.callAuthAPI(`${this.wtUtilService.config.BO_DEMO_BASE_URL}/auth`, postParams, options);
    } else {
      return this.callAuthAPI(`${this.wtUtilService.config.BO_BASE_URL}/auth`, postParams, options);
    }
  }

  mt4AuthUserUsingToken(): any {
    this.isAuthenticate = false;
    var postParams = 'username=' +  this.wtstorageService.selectedMt4Account.accountId.loginId + '&grant_type=' + 'password';
    var loginHeaders = new Headers({});
    loginHeaders.append('lang', this.wtstorageService.selected_lang);
    loginHeaders.append('Content-type', 'application/x-www-form-urlencoded; charset=UTF-8');
    loginHeaders.append('CRMToken', this.wtstorageService.crmToken);
    let options = new RequestOptions({headers: loginHeaders});
    if (this.wtstorageService.selectedMt4Account && this.wtstorageService.selectedMt4Account.demo) {
      return this.callAuthAPI(`${this.wtUtilService.config.BO_DEMO_BASE_URL}/auth`, postParams, options);
    } else {
      return this.callAuthAPI(`${this.wtUtilService.config.BO_BASE_URL}/auth`, postParams, options);
    }
  }

  mt4DemoAuthUserUsingToken(demoLogin): any {
    this.isAuthenticate = false;
    var postParams = 'username=' +  demoLogin + '&grant_type=' + 'password';
    var loginHeaders = new Headers({});
    loginHeaders.append('lang', this.wtstorageService.selected_lang);
    loginHeaders.append('Content-type', 'application/x-www-form-urlencoded; charset=UTF-8');
    loginHeaders.append('CRMToken', this.wtstorageService.crmToken);
    let options = new RequestOptions({headers: loginHeaders});
      return this.callAuthAPI(`${this.wtUtilService.config.BO_DEMO_BASE_URL}/auth`, postParams, options);
  }

  mt4RememberUser(remData: any, rememberMe: any): any {
    let postData: any = {};
    remData.forEach(
      (data: any) => {
        if (data.validate) {
          postData.login = postData.login ? postData.login + ',' + data.accountId : data.accountId;
          postData.mt4token = postData.mt4token ? postData.mt4token + ',' + data.accessToken : data.accessToken;
          postData.expiry = postData.expiry ? postData.expiry + ',' + data.expiryTimeUnixTS : data.expiryTimeUnixTS;
        }
      });
    rememberMe = rememberMe ? 1 : 0;
    let body = `login[]=${postData.login}&mt4token[]=${postData.mt4token}&expiry[]=${postData.expiry}&remember_me=${rememberMe}`;
    let loginHeaders = new Headers({});
    loginHeaders.append('Domain', this.wtUtilService.config.DOMAIN);
    loginHeaders.append('MerchantKey', this.wtUtilService.config.MERCHANT_KEY);
    loginHeaders.append('lang', this.wtstorageService.selected_lang);
    loginHeaders.append('Content-type', 'application/x-www-form-urlencoded; charset=UTF-8');
    loginHeaders.append('IP', this.wtstorageService.ip);
    loginHeaders.append('authorization', `bearer ${this.wtstorageService.crmToken}`);
    let options = new RequestOptions({headers: loginHeaders});
    return this.postRememberUser(`${this.wtUtilService.config.CRM_BASE_URL}${this.wtUtilService.config.UPDATE_TOKEN}`, body, options);
  }

  private callAuthAPI(url: string, body: string, headers: any): any {
    return this.wthttpService.post(url, body, headers);
  }

  private postRememberUser(url: string, body: string, headers: any): any {
    return this.wthttpService.post(url, body, headers);
  }
}
