import { Injectable } from '@angular/core';
import { Headers } from '@angular/http';
import { BehaviorSubject } from 'rxjs';
import {WTHttpService} from '../../shared/service/wt-http.service';
import {WTStorageService} from '../../shared/service/wt-storage.service';
import {WTUtilService} from '../../shared/service/wt-util.service';
import {WTCrmService} from '../../shared/service/wt-crm.service';
import { LoginService } from '../../login/shared/login.service';

@Injectable()
export class TradeService {

	constructor(private wthttpService: WTHttpService,
				private wtStorageService:WTStorageService,
				private wtCrmService:WTCrmService,
				private wtUtilService: WTUtilService
				) {
		this.wtStorageService.foxApiBaseUrl = this.wtUtilService.config.FOX_BASE_URL;
		this.wtStorageService.boBaseUrl = this.wtUtilService.config.BO_BASE_URL;
		this.wtStorageService.crmBaseUrl = this.wtUtilService.config.CRM_BASE_URL;
		if(this.wtStorageService.crmToken == null ||
			this.wtStorageService.crmToken == undefined ||
			this.wtStorageService.crmToken == 'undefined'
			) {
			this.wtStorageService.crmToken = sessionStorage.getItem('crmToken');
		}

		if(!this.wtStorageService.selectedMt4Account) {
         	this.wtStorageService.selectedMt4Account = JSON.parse(sessionStorage.getItem('mt4Account'));
       	}
       	if(!this.wtStorageService.mt4AccountsList ) {
       		this.wtStorageService.mt4AccountsList = JSON.parse(sessionStorage.getItem('mt4AccountList'));
				 }

				 this.wtStorageService.mt4AccountsList.forEach(
					(mt4Account: any) => {
						if (mt4Account.demo) {
							this.wtStorageService.hasDemo = true;
						}
					});
		this.wtStorageService.rememberMe = JSON.parse(sessionStorage.getItem('rememberMe'));
       	this.wtCrmService.fetchRefreshToken = true;

	}
	getAppConfig(){
		var headers = new Headers({});
    	headers.append('Domain', this.wtUtilService.config.DOMAIN);
    	headers.append('MerchantKey', this.wtUtilService.config.MERCHANT_KEY);
    	headers.append('lang', this.wtStorageService.selected_lang);
    	headers.append('Content-type','application/x-www-form-urlencoded; charset=UTF-8');
    	headers.append('IP', this.wtStorageService.ip);
		return this.wthttpService.get(`${this.wtStorageService.crmBaseUrl}${this.wtUtilService.config.APP_CONFIG_URI}`,
					 {headers:headers})
	}

	private getApiHeaders(token:any) {
		var headers = new Headers({});
		headers.append('token', token);
		headers.append('cache-control','no-store')
    	return headers;
	}
	getTradeHistory(pageNumber:any, pageLength:any ) {
		if(pageNumber > 0) {
			pageNumber = pageNumber - 1;
		}
		var headers = this.getHeaders(this.wtStorageService.crmToken);
		var id = this.wtStorageService.selectedMt4Account.accountId;
		if (this.wtStorageService.selectedMt4Account.accountId.loginId) {
			id = this.wtStorageService.selectedMt4Account.accountId.loginId;
		}
		return this.wthttpService.get(`${this.wtStorageService.crmBaseUrl}${this.wtUtilService.config.HISTORY_URI}memberId=${id}&page-length=${pageLength}&page=${pageNumber}`,
					 {headers:headers})
	}

	getDashboardInformation(id): any {
    var headers = this.getHeaders(this.wtStorageService.crmToken);
    return this.wthttpService.get(this.wtStorageService.crmBaseUrl + `/v2/dashboard?userId=${id}`, {headers: headers});
  }
  getDashboardQRcode(): any {
    var headers = this.getHeaders(this.wtStorageService.crmToken);
    return this.wthttpService.get(this.wtStorageService.crmBaseUrl + `/v2/dashboard/qrCode`, {headers: headers});
  }

  getRedirectionInfo(payload): any {
    const headers = this.getHeaders(this.wtStorageService.crmToken);
    return this.wthttpService.post(this.wtStorageService.crmBaseUrl + `/v2/external/redirection`, payload,  {headers: headers});
  }

  getBalance(): any {
    const headers = this.getHeaders(this.wtStorageService.crmToken);
    return this.wthttpService.get(this.wtStorageService.crmBaseUrl + `/v2/user-balance`, {headers: headers});
  }

  getBalanceByFoxAPI(loginList): any {
	var token = this.wtStorageService.selectedMt4Account.accessToken;
	var headers = this.getApiHeaders(token);
	var timestamp = new Date().getTime();
	console.log(this.wtUtilService.config.FOX_BALANCE_URI);
	return this.wthttpService.get(`${this.wtStorageService.foxApiBaseUrl}${this.wtUtilService.config.FOX_BALANCE_URI}${loginList}`+`?`+timestamp,
	{headers:headers})
  }

  getProfileInformation(id): any {
    // var headers = this.getHeaders(this.wtStorageService.crmToken);
    // const queryparam = id ? ('?mt4Id=' + id) : '';
    // return this.wthttpService.get(this.wtStorageService.crmBaseUrl + `/v2/member/profile${queryparam}`, {headers: headers});
  }

	getArchiveHistory(pageNumber:any, pageLength:any) {
		var headers = this.getHeaders(this.wtStorageService.crmToken);
		headers.append('mt4account', this.wtStorageService.selectedMt4Account.accountId.loginId);
		return this.wthttpService.get(`${this.wtStorageService.crmBaseUrl}${this.wtUtilService.config.HISTORY_ARCHIVE_URI}page-length=${pageLength}&page=${pageNumber}`,
		{headers:headers});
	}


	getPastCandles(symbol:string, period:string, count:string, lastCandleDate:string) {
		// console.log('Candle chart');

		var headers = this.getBOAPIHeaders(this.wtStorageService.selectedMt4Account.accessToken);
		headers.append('mt4account', this.wtStorageService.selectedMt4Account.accountId);
		if(lastCandleDate){
			if (this.wtStorageService.selectedMt4Account && this.wtStorageService.selectedMt4Account.demo) {
				// console.log('last 1');

				return this.wthttpService.post(`${this.wtUtilService.config.BO_DEMO_BASE_URL}/history/last/${symbol}?
				timeframe=${period}&count=${count}&openDate=${lastCandleDate}`,null, {headers:headers});
			} else {
				// console.log('last 2');
				return this.wthttpService.post(`${this.wtUtilService.config.BO_BASE_URL}/history/last/${symbol}?
				timeframe=${period}&count=${count}&openDate=${lastCandleDate}`,null, {headers:headers});
			}
		} else {
			if (this.wtStorageService.selectedMt4Account && this.wtStorageService.selectedMt4Account.demo) {
				// console.log('last 3');
				return this.wthttpService.post(`${this.wtUtilService.config.BO_DEMO_BASE_URL}/history/last/${symbol}?
				timeframe=${period}&count=${count}`,null, {headers:headers});
			} else {
				// console.log('last 4');
			return this.wthttpService.post(`${this.wtUtilService.config.BO_BASE_URL}/history/last/${symbol}?
				timeframe=${period}&count=${count}`,null, {headers:headers});
			}
		}
	}
	private getHeaders(token:any) {
		var headers = new Headers({});
    	headers.append('lang', this.wtStorageService.selected_lang);
    	headers.append('Content-type','application/json');
    	headers.append('Authorization', `${token}`);

    	return headers;
	}
	private getBOAPIHeaders(token:any) {
		var headers = new Headers({});
    	headers.append('Domain', this.wtUtilService.config.DOMAIN);
    	headers.append('MerchantKey', this.wtUtilService.config.MERCHANT_KEY);
    	headers.append('lang', this.wtStorageService.selected_lang);
    	headers.append('Content-type','application/xml');
    	headers.append('IP', this.wtStorageService.ip);
    	headers.append('Authorization', `bearer ${token}`);

    	return headers;
	}

	logOut() {
		var headers = this.getHeaders(this.wtStorageService.crmToken);
		const timestamp = new Date().getTime();
		const urlparam = '?timestamp=' + timestamp;
		return this.wthttpService.get(`${this.wtStorageService.crmBaseUrl}${this.wtUtilService.config.LOGOUT_URI}${urlparam}`, {headers: headers});
	}

	getTradeHistoryFox(pageNumber:any, pageLength:any) {
		var token = this.wtStorageService.selectedMt4Account.accountId.accessToken;
		var timestamp = new Date().getTime();
		var headers = this.getApiHeaders(token);
		headers.append('Login', this.wtStorageService.selectedMt4Account.accountId.loginId);
		return this.wthttpService.get(`${this.wtStorageService.foxApiBaseUrl}${this.wtUtilService.config.FOX_HISTORY_URI}page-length=${pageLength}&page=${pageNumber}&timestamp=${timestamp}`,
					 {headers:headers})
	}

	getArchiveHistoryFox(pageNumber:any, pageLength:any) {
		var token = this.wtStorageService.selectedMt4Account.accountId.accessToken;
		var headers = this.getApiHeaders(token);
		headers.append('Login', this.wtStorageService.selectedMt4Account.accountId.loginId);
		var timestamp = new Date().getTime();
		return this.wthttpService.get(`${this.wtStorageService.foxApiBaseUrl}${this.wtUtilService.config.FOX_HISTORY_ARCHIVE_URI}page-length=${pageLength}&page=${pageNumber}&timestamp=${timestamp}`,
					 {headers:headers})
	}


}
