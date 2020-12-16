import {Injectable} from '@angular/core';
import {Headers, RequestOptions} from '@angular/http';
import {WTHttpService} from '../../shared/service/wt-http.service';
import {WTStorageService} from '../../shared/service/wt-storage.service';
import {WTUtilService} from '../../shared/service/wt-util.service';
import { TranslateService } from '../../shared/translate/translate.service';
import * as environment from '../../../environments/wt.environment';
// import { TranslateService } from './shared/translate/translate.service';

@Injectable()
export class LoginService {

  isAuthenticate: boolean = false;
  showLogin = false;
  defaultLanguageSet = false;


  constructor(private wthttpService: WTHttpService,
              private wtstorageService: WTStorageService, private WTUtil: WTUtilService,
              public translateService: TranslateService) {
    this.wtstorageService.crmBaseUrl = WTUtil.config.CRM_BASE_URL;
    this.wtstorageService.boBaseUrl = WTUtil.config.BO_BASE_URL;
  }

  authUser(userName: string, pswrd: string): any {
    this.isAuthenticate = false;
    this.wtstorageService.userName = userName;
    this.wtstorageService.passWord = pswrd;

    var postParams = 'email=' + userName + '&password=' + pswrd;
    var loginHeaders = new Headers({});
    loginHeaders.append('Domain', this.WTUtil.config.DOMAIN);
    loginHeaders.append('MerchantKey', this.WTUtil.config.MERCHANT_KEY);
    loginHeaders.append('lang', this.wtstorageService.selected_lang);
    loginHeaders.append('Content-type', 'application/x-www-form-urlencoded; charset=UTF-8');
    loginHeaders.append('IP', this.wtstorageService.ip);
    let options = new RequestOptions({headers: loginHeaders});
    return this.callAuthAPI(this.wtstorageService.crmBaseUrl + this.WTUtil.config.LOGIN_URI, postParams, options);
  }

  authUserUsingToken(token: string): any {
    this.isAuthenticate = false;
    var loginHeaders = new Headers({});
    loginHeaders.append('lang', this.wtstorageService.selected_lang);
    loginHeaders.append('Content-type', 'application/json; charset=UTF-8');
    loginHeaders.append('Authorization', token);
    let options = new RequestOptions({headers: loginHeaders});
   // return this.callAuthAPI(this.wtstorageService.crmBaseUrl + this.WTUtil.config.LOGIN_URI_TOKEN, null, options);
    return this.wthttpService.get(`${this.wtstorageService.crmBaseUrl}${this.WTUtil.config.LOGIN_URI_TOKEN}`,
    options);
  }

  authUserUsingTempToken(token: string): any {
    this.isAuthenticate = false;
    var loginHeaders = new Headers({});
    loginHeaders.append('lang', this.wtstorageService.selected_lang);
    loginHeaders.append('Content-type', 'application/json; charset=UTF-8');
    loginHeaders.append('Authorization', token);
    let options = new RequestOptions({headers: loginHeaders});
    // return this.callAuthAPI(this.wtstorageService.crmBaseUrl + this.WTUtil.config.LOGIN_URI_TOKEN, null, options);
    return this.wthttpService.get(`${this.wtstorageService.crmBaseUrl}${this.WTUtil.config.LOGIN_URI_TEMP_TOKEN}`,
      options);
  }

  refreshToken(token) {
    let loginHeaders = new Headers({});
    loginHeaders.append('lang', this.wtstorageService.selected_lang);
    loginHeaders.append('Content-type', 'application/json; charset=UTF-8');
    loginHeaders.append('Authorization', token);
    const options = new RequestOptions({headers: loginHeaders});
    return this.callAuthAPI(this.wtstorageService.crmBaseUrl + this.WTUtil.config.REFRESH_URI, null, options);
  }


  authUserNew(userName: string, pswrd: string): any {
    this.isAuthenticate = false;
    this.wtstorageService.userName = userName;
    this.wtstorageService.passWord = pswrd;

    const payload: any = {
      userName: userName,
      password: pswrd
      // captchaKey: 'DUMMY',
      // token: '65F17730B6CCA38DFD7AB82D126D6E8E2E929045',
      // time: '1550920508182'
    };
    var loginHeaders = new Headers({});
    loginHeaders.append('lang', this.wtstorageService.selected_lang);
    loginHeaders.append('Content-type', 'application/json');
    let options = new RequestOptions({headers: loginHeaders});
    return this.callAuthAPI(this.wtstorageService.crmBaseUrl + this.WTUtil.config.LOGIN_URI, payload, options);
  }

  register(userName: string, pswrd: string, promoCode: string, otp: string, toAgree: number, toAware: number): any {
    this.isAuthenticate = false;
    this.wtstorageService.userName = userName;
    this.wtstorageService.passWord = pswrd;

    const payload: any = {
      email: userName,
      password: pswrd,
      confPassword: pswrd,
      phone: '9987878789',
      phoneCode: '+91',
      promoCode: promoCode,
      toAgree: toAgree,
      toAware: toAware
    };
    var loginHeaders = new Headers({});
    loginHeaders.append('lang', this.wtstorageService.selected_lang);
    loginHeaders.append('Content-type', 'application/json');
    let options = new RequestOptions({headers: loginHeaders});
    return this.callAuthAPI(this.wtstorageService.crmBaseUrl + this.WTUtil.config.REGISTER_URI, payload, options);
  }

  newRegistration(payload): any {
    const loginHeaders = new Headers({});
    loginHeaders.append('lang', this.wtstorageService.selected_lang);
    loginHeaders.append('Content-type', 'application/json');
    const options = new RequestOptions({headers: loginHeaders});
    return this.callAuthAPI(this.wtstorageService.crmBaseUrl + '/v2/register/short', payload, options);
  }

  getCountryList(): any {
    const loginHeaders = new Headers({});
    loginHeaders.append('lang', this.wtstorageService.selected_lang);
    loginHeaders.append('Content-type', 'application/json; charset=UTF-8');
    const options = new RequestOptions({headers: loginHeaders});
    return this.wthttpService.get(this.wtstorageService.crmBaseUrl + '/v2/register/countries?status=true', options);
  }

  getAnalyticsData(): any {
    const loginHeaders = new Headers({});
    loginHeaders.append('lang', this.wtstorageService.selected_lang);
    loginHeaders.append('Content-type', 'application/json; charset=UTF-8');
    const options = new RequestOptions({headers: loginHeaders});
    return this.wthttpService.get(this.wtstorageService.crmBaseUrl + '/v2/script/member', options);
  }


  validatePromoCodeOnRegister(promoCode): any {
    const loginHeaders = new Headers({});
    loginHeaders.append('lang', this.wtstorageService.selected_lang);
    loginHeaders.append('Content-type', 'application/json');
    const options = new RequestOptions({headers: loginHeaders});
    return this.callAuthAPI(this.wtstorageService.crmBaseUrl + `/v2//validate/promoCode?promoCode=${promoCode}`, null, options);
  }

  validateEmailOnRegister(emailId): any {
    const loginHeaders = new Headers({});
    loginHeaders.append('lang', this.wtstorageService.selected_lang);
    loginHeaders.append('Content-type', 'application/json');
    const options = new RequestOptions({headers: loginHeaders});
    return this.callAuthAPI(this.wtstorageService.crmBaseUrl + `/v2/validate/email?email=${emailId}`, null, options);
  }

  createLead(payload): any {
    const loginHeaders = new Headers({});
    loginHeaders.append('lang', this.wtstorageService.selected_lang);
    loginHeaders.append('Content-type', 'application/json');
    const options = new RequestOptions({headers: loginHeaders});
    return this.callAuthAPI(this.wtstorageService.crmBaseUrl + '/v2/register/livechat/leads', payload, options);
  }


  getEmailOTP(payload): any {
    const loginHeaders = new Headers({});
    loginHeaders.append('lang', this.wtstorageService.selected_lang);
    loginHeaders.append('Content-type', 'application/json');
    const options = new RequestOptions({headers: loginHeaders});
    return this.callAuthAPI(this.wtstorageService.crmBaseUrl + '/v2/register/send-email-otp', payload, options);
  }

  getCaptcha(): any {
    const loginHeaders = new Headers({});
    loginHeaders.append('lang', this.wtstorageService.selected_lang);
    loginHeaders.append('Content-type', 'application/json');
    const options = new RequestOptions({headers: loginHeaders});
    return this.wthttpService.get(this.wtstorageService.crmBaseUrl + '/v2/captcha', options);
  }

  validateCaptcha(payload): any {
    const loginHeaders = new Headers({});
    loginHeaders.append('lang', this.wtstorageService.selected_lang);
    loginHeaders.append('Content-type', 'application/json');
    const options = new RequestOptions({headers: loginHeaders});
    return this.callAuthAPI(this.wtstorageService.crmBaseUrl + '/v2/register/verify-captcha', payload, options);
  }

  getAppConfig() {
    const headers = new Headers({});
    headers.append('Domain', this.WTUtil.config.DOMAIN);
    headers.append('MerchantKey', this.WTUtil.config.MERCHANT_KEY);
    headers.append('lang', this.wtstorageService.selected_lang);
    headers.append('Content-type', 'application/x-www-form-urlencoded; charset=UTF-8');
    headers.append('IP', this.wtstorageService.ip);
    return this.wthttpService.get(`${this.wtstorageService.crmBaseUrl}${this.WTUtil.config.APP_CONFIG_URI}`,
      {headers: headers});
  }

  forgotCrmPwd(emailid: string): any {
    var postParams = {email: emailid};
    const loginHeaders = new Headers({});
    loginHeaders.append('lang', this.wtstorageService.selected_lang);
    loginHeaders.append('Content-type', 'application/json');
    const options = new RequestOptions({headers: loginHeaders});
    // var loginHeaders = new Headers({});
    // loginHeaders.append('Domain', this.WTUtil.config.DOMAIN);
    // loginHeaders.append('MerchantKey', this.WTUtil.config.MERCHANT_KEY);
    // loginHeaders.append('lang', this.wtstorageService.selected_lang);
    // loginHeaders.append('IP', this.wtstorageService.ip);
    // let options = new RequestOptions({headers: loginHeaders});
    return this.callAuthAPI(this.wtstorageService.crmBaseUrl + this.WTUtil.config.FORGOT_PSWRD_URI, postParams, options);
  }

  getLanguages() {
    const loginHeaders = new Headers({});
    loginHeaders.append('lang', this.wtstorageService.selected_lang);
    loginHeaders.append('Content-type', 'application/json; charset=UTF-8');
    const options = new RequestOptions({headers: loginHeaders});
    return this.wthttpService.get(this.wtstorageService.crmBaseUrl + '/v2/dashboard/all-lang', options);
    // return this.wthttpService.get('https://bbv2qaapi.c64f.com/v2/dashboard/all-lang', options);
  }

  // private callForgotPwdAPI(url:string, body:string, headers:Object){
  //     return this.wthttpService.post(url, body, headers);
  // }

  private callAuthAPI(url: string, body: any, headers: Object) {
    return this.wthttpService.post(url, body, headers);
  }

  processLanguage(res, activeLang?) {
    if(activeLang){
      this.wtstorageService.selected_lang = activeLang;
          this.translateService.selectLang(activeLang);
          localStorage.setItem('lanGuage', activeLang);
    }
    else{
      if (!localStorage.getItem('lanGuage')) {
        for (var i=0; i<res.data.length; i++) {
          if (res.data[i].default_lang) {
            this.defaultLanguageSet = true;
            var defaultLanguage = res.data[i].id;
            this.wtstorageService.selected_lang = defaultLanguage;
            this.translateService.selectLang(defaultLanguage);
            localStorage.setItem('lanGuage', defaultLanguage);
            break;
          }
        }
      }else{
        this.wtstorageService.selected_lang = localStorage.getItem('lanGuage');
        this.translateService.selectLang(localStorage.getItem('lanGuage'));
      }
    }


    for (var i=0; i<res.data.length; i++) {
      res.data[i].code = res.data[i].id;
      if (res.data[i].id=='en') {
        res.data[i].TERMS_CONDITIONS = environment.WT_CONFIG.TERMS_CONDITIONS_EN;
        res.data[i].groupLogin = 17;
        res.data[i].groupForgotPwd = 17;
        res.data[i].groupRegister = 16;
        res.data[i].group = 19;
        if (!res.data[i].translatedName) {
          res.data[i].translatedName = 'English';
        }
      }
      if (res.data[i].id=='zh') {
        res.data[i].TERMS_CONDITIONS = environment.WT_CONFIG.TERMS_CONDITIONS_ZH;
        res.data[i].groupLogin = 14;
        res.data[i].groupForgotPwd = 14;
        res.data[i].groupRegister = 12;
        res.data[i].group = 13;
        if (!res.data[i].translatedName) {
          res.data[i].translatedName = '中文';
        }
      }
      if (res.data[i].id=='ko') {
        res.data[i].TERMS_CONDITIONS = environment.WT_CONFIG.TERMS_CONDITIONS_KO;
        res.data[i].groupLogin = 0;
        res.data[i].groupForgotPwd = 0;
        res.data[i].groupRegister = 0;
        res.data[i].group = 0;
        if (!res.data[i].translatedName) {
          res.data[i].translatedName = '한국어';
        }
      }
      if (res.data[i].id=='jp') {
        res.data[i].TERMS_CONDITIONS = environment.WT_CONFIG.TERMS_CONDITIONS_JP;
        res.data[i].groupLogin = 0;
        res.data[i].groupForgotPwd = 0;
        res.data[i].groupRegister = 0;
        res.data[i].group = 0;
        if (!res.data[i].translatedName) {
          res.data[i].translatedName = '日本語';
        }
      }
      if (res.data[i].id=='vi') {
        res.data[i].TERMS_CONDITIONS = environment.WT_CONFIG.TERMS_CONDITIONS_VI;
        res.data[i].groupLogin = 0;
        res.data[i].groupForgotPwd = 0;
        res.data[i].groupRegister = 0;
        res.data[i].group = 0;
        if (!res.data[i].translatedName) {
          res.data[i].translatedName = 'Tiếng Việt';
        }
      }
      if (res.data[i].id=='th') {
        res.data[i].TERMS_CONDITIONS = environment.WT_CONFIG.TERMS_CONDITIONS_TH;
        res.data[i].groupLogin = 0;
        res.data[i].groupForgotPwd = 0;
        res.data[i].groupRegister = 0;
        res.data[i].group = 0;
        if (!res.data[i].translatedName) {
          res.data[i].translatedName = 'ไทย';
        }
      }
    }
    return res.data;
  }

  coachmarks(token: string, mt4ID: any): any {
    var loginHeaders = new Headers({});
    const payload = {'mt4Id': mt4ID};
    loginHeaders.append('lang', this.wtstorageService.selected_lang);
    loginHeaders.append('Content-type', 'application/json');
    loginHeaders.append('Authorization', token);
    let options = new RequestOptions({headers: loginHeaders});
    return this.callAuthAPI(this.wtstorageService.crmBaseUrl + this.WTUtil.config.LOGIN_COACHMARK ,payload,
    options);
  }

}
