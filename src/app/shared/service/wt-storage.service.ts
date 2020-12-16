import {Injectable} from '@angular/core';
import * as jQuery from 'jquery';
//declare var jQuery: JQuery;

@Injectable()
export class WTStorageService {
  [x: string]: any;
  crmBaseUrl: string = '';
  boBaseUrl: string = '';
  loggingBaseUrl: string = '';
  ip: string = '';
  loginId: any;
  firstName: any;
  lastName: any;
  email: any;
  selected_lang: string = 'en';
  mobileAppDownloadLink = '';
  //login page account details
  userName: string = '';
  passWord: string = '';

  crmTokenExpireTime: number;
  crmTokenStartTime: number;
  issuer: string;
  crmToken: string;
  crmTokenType: string;
  isPortraitMode: boolean = false;
  rememberMe: boolean = false;
  crmOffsetValue: number = 0;

  //MT4 details
  mt4AccountsList: Array<any>;
  selectedMt4Account: any;
  selectedSymbol: string;
  selectedTimeFrame: any = 'm1';
  defaultTimeFrame: any = 'm1';
  showLogin = true;
  showDeposit = false;
  deviceInfo: any;
  hasDemo: any = false;
  user: any;

  //open trades

  offsetValue: any = 0;

  soundSetting: boolean = true;
  oneclickSetting: boolean = false;
  profileImage: any;
  utc;


  constructor() {
    // jQuery.get('https://api.ipify.org/?format=json', (data) => {
    //   this.ip = data.ip;
    // });
  }

  public clearStorage() {
    this.userName = '';
    this.passWord = '';
    this.crmTokenExpireTime = null;
    this.crmTokenStartTime = null;
    this.issuer = '';
    this.crmToken = '';
    this.crmTokenType = '';
    this.mt4AccountsList = [];
    this.selectedMt4Account = '';
    this.selectedSymbol = '';
    this.selectedTimeFrame = '';
  }
}
