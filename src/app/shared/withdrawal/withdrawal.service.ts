import {Injectable} from '@angular/core';
import {Headers} from '@angular/http';
import {WTHttpService} from '../service/wt-http.service';
import {WTStorageService} from '../service/wt-storage.service';
import {WTUtilService} from '../service/wt-util.service';
import {WTCrmService} from '../service/wt-crm.service';

@Injectable()
export class WithdrawalService {

    constructor(private wthttpService: WTHttpService, private wtstorageService: WTStorageService,
        private wtCrmService: WTCrmService, private wtUtilService: WTUtilService) {

    }
    getWithdrawal(){
        return this.wthttpService.post(`${this.wtstorageService.crmBaseUrl}${this.wtUtilService.config.WITHDRAWAL_URI}`,
         '',{ headers: this.postHeaders() });

    }
    postGatewayForm(url: string, method: any, body: any, contentType?: any) {
        if (method.toLowerCase().indexOf('post') > -1) {
            let header = this.postHeaders();
            contentType ? header.append('Content-type', contentType) : header.append('Content-type', 'application/json');
            return this.wthttpService.post(`${url}`, body,
                { headers: header });
        } else {
            let header = this.postHeaders();
            contentType ? header.append('Content-type', contentType) : header.append('Content-type', 'application/xml');
            return this.wthttpService.get(`${url}`,
                { headers: header });
        }
    }
    private postHeaders() {
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


        // headers.append('withdrawal_method', '49');
