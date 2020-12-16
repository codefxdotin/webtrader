import {Injectable} from '@angular/core';
import {Headers} from '@angular/http';
import {WTHttpService} from '../service/wt-http.service';
import {WTStorageService} from '../service/wt-storage.service';
import {WTUtilService} from '../service/wt-util.service';
import {WTCrmService} from '../service/wt-crm.service';

@Injectable()
export class DepositService {

  constructor(private wthttpService: WTHttpService, private wtstorageService: WTStorageService,
              private wtCrmService: WTCrmService, private wtUtilService: WTUtilService,) {

  }

  getDepositOptions() {
    return this.wthttpService.get(`${this.wtstorageService.crmBaseUrl}${this.wtUtilService.config.DEPOSIT_URI}`,
      {headers: this.getHeaders()});
  }

  postGatewayForm(url: string, method: any, body: any, contentType?: any) {

    if (method.toLowerCase().indexOf('post') > -1) {
      let header = this.getHeaders();
      return this.wthttpService.post(`${url}`, body,
        {headers: header});
    } else {
      let header = this.getHeaders();
      contentType ? header.append('Content-type', contentType) : header.append('Content-type', 'application/xml');
      return this.wthttpService.get(`${url}`,
        {headers: header});
    }
  }

  private getHeaders() {
    var headers = new Headers({});
    headers.append('Domain', this.wtUtilService.config.DOMAIN);
    headers.append('MerchantKey', this.wtUtilService.config.MERCHANT_KEY);
    headers.append('lang', this.wtstorageService.selected_lang);
    headers.append('IP', this.wtstorageService.ip);
    headers.append('Authorization', `bearer ${this.wtstorageService.crmToken}`);
    headers.append('mt4account', `${this.wtstorageService.selectedMt4Account.accountId}`);
    return headers;
  }
}
