import { Component, ViewChild, AfterViewInit, ElementRef, OnInit, OnDestroy } from '@angular/core';
import { LoginService } from './shared/login.service';
import { FormBuilder } from '@angular/forms';
import { Injectable } from '@angular/core';
import { NgbModal, NgbModalOptions, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { DeviceDetectorModule, DeviceDetectorService } from 'ngx-device-detector';
import { Router, ActivatedRoute } from '@angular/router';
import * as moment from 'moment-timezone';
import { MT4AuthenticateComponent } from '../shared/mt4-authenticate/mt4-authenticate.component';
import { WTStorageService } from '../shared/service/wt-storage.service';
import { WTUtilService } from '../shared/service/wt-util.service';
import { MobileDeviceComponent } from '../shared/mobile-device/mobile-device.component';
import { TranslateService } from '../shared/translate/translate.service';
import { UserProfileService } from '../shared/user-profile/user-profile.service';
import { TranslatePipe } from '../shared/translate/translate.pipe';
import { Mt4LoginService } from '../shared/mt4-authenticate/mt4-authenticate.service';
import * as environment from '../../environments/wt.environment';
import { DomSanitizer } from '@angular/platform-browser';
import swal from "sweetalert2";
import cacheBusting from '../../cache-busting/cache-busting.json';
declare var require: any;

@Component({
  moduleId: module.id,
  selector: 'sd-home',
  templateUrl: 'login.component.html',
  styleUrls: ['login.component.scss'],
})
@Injectable()
export class LoginComponent implements OnInit, AfterViewInit, OnDestroy {
  licenseId: number;
  lcAPI: any;
  showLiveChatInterval = environment.WT_CONFIG.showLiveChatIntervalDesktop;
  groupLogin = 14;
  groupForgotPwd = 14;
  groupRegister = 12;
  countryList: any = [];
  country: any = -1;
  phoneCode: any;
  phone: any;
  selectedLang: any;
  invalidPhoneNumber: any;
  invalidPromoCode: any;
  invalidPromoCodeValue: any;
  regPassword: any;
  emailValidationErrorMessage: any;
  Incorrect_Password: any;
  otpValue: any;
  getOTPCount: any = 0;
  dismissible = true;
  upperCaseAlphabetValidation: Boolean = false;
  lowerCaseAlphabetValidation: Boolean = false;
  numberValidation: Boolean = false;
  lengthValidation: Boolean = false;
  specialCharacterValidation: Boolean = false;
  otpButtonLabelChanged: Boolean = false;
  otpButtonDisable: Boolean = false;
  captchaImageUrl: any;
  csEmail = environment.WT_CONFIG.liveChatLicenseId;
  captchaData: any;
  captchaCode: any = '';
  type = 'warning';
  loginId: string = '';
  checkBox: boolean = false;
  errorMessage: string;
  validationMessage: string = '';
  nameValidationErrorMessage: any;
  fpValidationMessage: string = '';
  password: string = '';
  promoCode: string = '';
  name = '';
  disablePromocode = false;
  otp = '';
  otp1 = '';
  otp2 = '';
  otp3 = '';
  otp4 = '';
  toAgree = 1;
  tempdata: any;
  accounts: Object;
  emailId: string = '';
  // showLogin: boolean = true;
  isValid: boolean = true;
  isInputEmpty: boolean = false;
  isFpEmailValid: boolean = false;
  isFpEmailVerified: boolean = false;
  closeResult: string;
  disableSubmit: boolean = false;
  disableFpSubmit: boolean = false;
  inLogin: boolean = true;
  inRegister: boolean = false;
  showOTP = true;
  showCaptchaDiv: Boolean = false;
  showCaptchaAPIFlag: Boolean = false;
  isAndriodAppAvailable: boolean = false;
  androidPopupShown: boolean = false;
  modalOptions: NgbModalOptions = {
    backdrop: 'static',
    keyboard: false,
    windowClass: 'bounceIn animated md'
  };
  user: any;
  isMobileDevice: any = false;
  imageUrl1 = './assets/images/slider-1.jpg?v='+cacheBusting['slider-1.jpg'];
  imageUrl2 = './assets/images/slider-2.jpg?v='+cacheBusting['slider-2.jpg'];
  imageUrl3 = './assets/images/slider-3.jpg?v='+cacheBusting['slider-3.jpg'];
  termsOfServiceURL = this.wtUtilService.config.TERMS_CONDITIONS_ZH;

  emailOTPText = new TranslatePipe(this.translateService).transform('get_email_otp');
  enableOTPButton = true;
  cid: any;
  showCoachMark = false;
  currentBrowser = '';
  ucFlag = 1;
  browserLang = "";
  isTablet = this.deviceService.isTablet();
  languages = [];
  languageIcon;
  hide = true;
  singleApi = environment.WT_CONFIG.getFoxAPI;
  cacheBusting = cacheBusting;
  version = require("../../../package.json").releaseVersion;

  /**
   * Creates an instance of the LoginComponent
   */
  constructor(fb: FormBuilder,
    private loginService: LoginService,
    public wtStorageService: WTStorageService,
    private modalService: NgbModal,
    public translateService: TranslateService,
    public wtUtilService: WTUtilService,
    private deviceService: DeviceDetectorService,
    private userProfileService: UserProfileService,
    private router: Router,
    private mt4loginservice: Mt4LoginService,
    private activatedRoute: ActivatedRoute,
    private sanitizer: DomSanitizer) {

    // this.languages = environment.WT_CONFIG.languages;
    this.languageIcon = environment.WT_CONFIG.languageIconAdmin +'?v=' + cacheBusting['globe-member.png'];
    this.wtStorageService.showLogin = false;
    this.licenseId = environment.WT_CONFIG.liveChatLicenseId;

    this.wtStorageService.deviceInfo = this.deviceService.getDeviceInfo();
    const device = this.wtStorageService.deviceInfo && this.wtStorageService.deviceInfo.device || null;
    if (device === "android"
      || device === "iphone"
      || (window.innerHeight > window.innerWidth && window.innerWidth < 640)) {
      this.isMobileDevice = true;
    }
    if ((this.wtStorageService.deviceInfo && this.wtStorageService.deviceInfo.device === 'android') ||
      (this.wtStorageService.deviceInfo.device === 'unknown' && (window.innerHeight > window.innerWidth && window.innerWidth < 640))) {
      this.androidPopupShown = sessionStorage.getItem('androidPopupShown') == 'true' ? true : false;
      this.isAndriodAppAvailable = true;
    }
    if ((this.wtStorageService.deviceInfo && this.wtStorageService.deviceInfo.device === 'android') ||
      (this.wtStorageService.deviceInfo.device === 'unknown' && (window.innerHeight > window.innerWidth && window.innerWidth < 640))) {
      // this.loginService.getAppConfig()
      //   .subscribe((data: any) => {
      //       let appLink = data && data.android && data.android.app_download_url || '';
      //       this.wtStorageService.mobileAppDownloadLink = appLink;
      //       if (appLink != null && appLink.trim() != '') this.isAndriodAppAvailable = true;
      //       this.initializeApp();
      //     },
      //     (err: any) => {

      //     });

    } else {
      this.initializeApp();
    }
  }

  getLanguages() {
    if (!this.singleApi) {
      this.loginService.getLanguages().subscribe((res) => {
        this.languages = this.loginService.processLanguage(res);
        for (var i = 0; i < this.languages.length; i++) {
          if (this.languages[i].code == localStorage.getItem('lanGuage')) {
            this.groupLogin = this.languages[i].groupLogin;
            this.groupForgotPwd = this.languages[i].groupForgotPwd;
            this.groupRegister = this.languages[i].groupRegister;
            this.termsOfServiceURL = this.languages[i].TERMS_CONDITIONS;

          }
        }
      }, err => {
        console.log(err);
      });
    }
  }

  ngOnInit() {


    this.getLanguages();

    // console.log(this.deviceService.getDeviceInfo());

    var deviceDetect = this.deviceService.getDeviceInfo().device;

    if (deviceDetect == 'Android' || deviceDetect == 'iPhone' || deviceDetect == 'BlackBerry' || deviceDetect == 'webOS') {
      this.isMobileDevice = true;

    }

    this.browserLang = navigator.language;
    if (this.browserLang.includes('zh')) {
      this.browserLang = 'zh';
    } else {
      this.browserLang = 'en';
    }


    const lang = this.activatedRoute.snapshot.params['lang'];
    if (lang) {
      // this.translateService.selectLang(lang);
      // localStorage.setItem('lanGuage', lang);
    }
    // TO DO REMOVE


    // if (localStorage.getItem('lanGuage') === 'zh') {
    //   this.groupLogin = 14;
    //   this.groupForgotPwd = 14;
    //   this.groupRegister = 12;
    //   this.termsOfServiceURL = this.wtUtilService.config.TERMS_CONDITIONS_ZH;
    // } else if (localStorage.getItem('lanGuage') === 'en') {
    //   this.groupLogin = 17;
    //   this.groupForgotPwd = 17;
    //   this.groupRegister = 16; // Registration Page English 16 (BLAC2-8931)
    //   this.termsOfServiceURL = this.wtUtilService.config.TERMS_CONDITIONS;
    // } else if (localStorage.getItem('lanGuage') === 'th') {
    //   // this.groupLogin = 17;
    //   // this.groupForgotPwd = 17;
    //   // this.groupRegister = 16; // Registration Page English 16 (BLAC2-8931)
    //   this.termsOfServiceURL = this.wtUtilService.config.TERMS_CONDITIONS_TH;
    // }
    // set tracking id
    if (this.activatedRoute.snapshot.queryParams['cid']) {
      this.cid = this.activatedRoute.snapshot.queryParams['cid'];
    }
    this.setPromoCode();

    const custom_variables = [
      { name: 'Preferred Language', value: this.translateService.currentLang() }
    ];
    if (environment.WT_CONFIG.liveChatLicenseId) {
      const lcAPI1 = setInterval(() => {
        if (window['LC_API']) {
          window['LC_API'].set_custom_variables(custom_variables);
          clearInterval(lcAPI1);
        }
      }, 3000);

      if (this.router.url.indexOf('/register') > -1 || this.router.url.indexOf('/affiliates') > -1) {
        this.onRegister();
      }
    }



    /*if (this.wtStorageService.deviceInfo.device === "android") {
      this.isAndriodAppAvailable = true; // TODO remove it once app config is updated with downloadable link
    }

    if (this.wtStorageService.deviceInfo && this.wtStorageService.deviceInfo.device === "android") {
      this.loginService.getAppConfig()
        .subscribe((data: any) => {
          let appLink = data && data.android && data.android.app_download_url || "";
          this.wtStorageService.mobileAppDownloadLink = appLink;
          if (appLink != null && appLink.trim() != "") this.isAndriodAppAvailable = true;
          this.initializeApp();
        },
        (err: any) => {

        })

    } else {
      this.initializeApp();
    }*/

    let cookie = this.getCookie('webTraderPWACookie');
    if (!cookie) {
      this.currentBrowser = this.getCurrentBrowser();
      // alert(this.currentBrowser);
      this.showCoachMark = true;
      this.setCookie('webTraderPWACookie', 'true', 36500);
    }


  }

  viewPassword() {
    this.hide = !this.hide;
  }

  setPromoCode() {
    if (this.activatedRoute.snapshot.params['promoCode'] || localStorage.getItem('promoCode')) {
      const pCode = this.activatedRoute.snapshot.params.promoCode || localStorage.getItem('promoCode');
      this.loginService.validatePromoCodeOnRegister(pCode).subscribe((response) => {
        if (response.success && response.data.key === 'validPromoCode') {
          this.promoCode = pCode;
          localStorage.setItem('promoCode', this.promoCode);
          this.disablePromocode = true;
        } else if (response.success && response.data.key !== 'validPromoCode') {
          this.promoCode = '';
          this.disablePromocode = false;
          localStorage.removeItem('promoCode');
        } else if (!response.success) {
          this.promoCode = '';
          this.disablePromocode = false;
          localStorage.removeItem('promoCode');
          // this.utils.customErrorHandler(response, true);
        }
      }, err => {
        this.promoCode = '';
        this.disablePromocode = false;
        localStorage.removeItem('promoCode');
      });
    }
  }

  getCountryList() {
    this.countryList = [];
    this.loginService.getCountryList().subscribe(
      res => {
        if (res.success) {
          this.countryList = res.data;
          this.countryList.forEach((element) => {
            if (element['userCountry']) {
              this.country = element['id'];
              this.phoneCode = element['dialCode'];
            }
          });
        } else {
          // this.utils.customErrorHandler(res);
        }
      }, err => {
        // this.utils.httpErrorHandler(err);
      });
  }
  onCountryChange(event) {
    const cCodeObj = this.countryList.find((o) => {
      return o.id === parseInt(event.target.value, 10);
    });
    if (cCodeObj && cCodeObj['dialCode']) {
      this.country = cCodeObj['id'];
      this.phoneCode = cCodeObj['dialCode'];
    }
  }
  onPromoChange() {
    if (this.promoCode) {
      const re = /^[0-9]*$/;
      if (this.promoCode && this.promoCode !== '' && this.promoCode !== null) {
        if (!(re.test(this.promoCode))) {
          this.validationMessage = 'invalidPromoCode';
          this.invalidPromoCode = true;
          this.isValid = true;
          this.isInputEmpty = true;
          return;
        } else if (Number(this.promoCode)>2147483647) {
          this.validationMessage = 'invalidPromoCodeValue';
          this.invalidPromoCodeValue = true;
          this.isValid = true;
          this.isInputEmpty = true;
          return;
        } else {
          this.invalidPromoCode = false;
          this.invalidPromoCodeValue = false;
          this.validationMessage = '';
          this.isValid = true;
          this.isInputEmpty = false;
        }
      }
    } else {
      this.invalidPromoCode = false;
      this.invalidPromoCodeValue = false;
      this.validationMessage = '';
      this.isValid = true;
      this.isInputEmpty = false;
    }
  }

  onPhoneChange() {
    const re = /^[0-9]{6,15}$/;
    if (this.phone && this.phone !== '' && this.phone !== null) {
      if (!(re.test(this.phone))) {
        this.validationMessage = 'invalidPhoneNumber';
        this.invalidPhoneNumber = true;
        this.isValid = true;
        this.isInputEmpty = true;
        return;
      } else {
        this.invalidPhoneNumber = false;
        this.validationMessage = '';
        this.isValid = true;
        this.isInputEmpty = false;
      }
    }
  }

  onPasswordChange() {
    this.otpButtonDisable = false;
    this.otpButtonLabelChanged = false;
    if (this.regPassword !== null && this.regPassword.length > 0) {
      if (this.regPassword.match(/(?=.*[a-z])/)) {
        this.lowerCaseAlphabetValidation = true;
      } else {
        this.lowerCaseAlphabetValidation = false;
      }
      if (this.regPassword.match(/^.{8,31}$/)) {
        this.lengthValidation = true;
      } else {
        this.lengthValidation = false;
      }
      if (this.regPassword.match(/(?=.*\d)/)) {
        this.numberValidation = true;
      } else {
        this.numberValidation = false;
      }
      if (this.regPassword.match(/(?=.*[A-Z])/)) {
        this.upperCaseAlphabetValidation = true;
      } else {
        this.upperCaseAlphabetValidation = false;
      }
      if (this.regPassword.match(/(?=.*[\`|\~|\!|\@|\#|\$|\%|\^|\&|\*|\(|\)|\+|\=|\[|\{|\]|\}|\||\\|\'|\<|\,|\.|\>|\?|\/|\""|\;|\:|\s])/)) {
        this.specialCharacterValidation = false;
      } else {
        this.specialCharacterValidation = true;
      }
    } else {
      this.lengthValidation = false;
      this.numberValidation = false;
      this.upperCaseAlphabetValidation = false;
      this.lowerCaseAlphabetValidation = false;
      this.specialCharacterValidation = false;
    }
    if (!(this.lengthValidation && this.numberValidation && this.upperCaseAlphabetValidation && this.lowerCaseAlphabetValidation &&
      this.specialCharacterValidation)) {
      this.validationMessage = 'Incorrect_Password';
      this.Incorrect_Password = true;
      this.isValid = true;
      this.isInputEmpty = true;
    } else {
      this.Incorrect_Password = false;
      this.validationMessage = '';
      this.isValid = true;
      this.isInputEmpty = false;
    }
  }

  validateEmail(value) {
    this.validationMessage = '';
    this.isValid = true;
    this.isInputEmpty = false;
    const emailId = value;
    const re = /^[a-zA-Z0-9._+-]+@[a-zA-Z0-9._-]*(\.[A-Za-z0-9]+)*(\.[A-Za-z]{2,})$/;
    if (emailId.length < 5 || !(re.test(emailId))) {
      this.validationMessage = 'emailValidationErrorMessage';
      this.emailValidationErrorMessage = true;
      this.isValid = true;
      this.isInputEmpty = true;
      return;
    } else {
      this.emailValidationErrorMessage = false;
      this.validationMessage = '';
      this.isValid = true;
      this.isInputEmpty = false;
    }
    this.otpButtonDisable = false;
    this.otpButtonLabelChanged = false;
    this.loginService.validateEmailOnRegister(emailId).subscribe(
      res => {
        if (res.success) {
          if (res['data']['key'] !== 'validEmail') {
            this.validationMessage = 'emailAlreadyExists';
            this.isValid = true;
            this.isInputEmpty = true;
          }
        }
      });
  }

  getEmailOTP() {
    if (this.loginId && this.regPassword &&
      this.country && this.phoneCode && this.phone && this.name
    ) {
      if (this.emailValidationErrorMessage) {
        this.validationMessage = 'emailValidationErrorMessage';
        this.isValid = true;
        this.isInputEmpty = true;
        return;
      } else if (this.Incorrect_Password) {
        this.validationMessage = 'Incorrect_Password';
        this.isValid = true;
        this.isInputEmpty = true;
        return;
      } else if (this.invalidPhoneNumber) {
        this.validationMessage = 'invalidPhoneNumber';
        this.isValid = true;
        this.isInputEmpty = true;
        return;
      } else if (this.nameValidationErrorMessage) {
        this.validationMessage = 'nameValidationErrorMessage';
        this.isValid = true;
        this.isInputEmpty = true;
        return;
      } else if (this.invalidPromoCode) {
        this.validationMessage = 'invalidPromoCode';
        this.isValid = true;
        this.isInputEmpty = true;
        return;
      } else if (this.invalidPromoCodeValue) {
        this.validationMessage = 'invalidPromoCodeValue';
        this.isValid = true;
        this.isInputEmpty = true;
        return;
      } else if (this.country === -1) {
        this.validationMessage = 'Please_Select_Country';
        this.isValid = true;
        this.isInputEmpty = true;
        return;
      } else {
        this.validationMessage = '';
        this.isValid = true;
        this.isInputEmpty = false;
      }

      this.getOTPCount++;
      this.otpButtonLabelChanged = true;
      this.otpButtonDisable = true;
      if (this.getOTPCount > 3 || this.showCaptchaAPIFlag) {
        this.showCaptchaDiv = true;
        this.getCaptcha();
      } else {
        this.otpButtonDisable = true;
        this.getOTP();
      }
    } else {
      this.validationMessage = 'Form_incomplete';
      this.isValid = true;
      this.isInputEmpty = true;
    }
  }

  getOTP() {
    const payload = {
      promoCode: this.promoCode,
      country: this.country,
      email: this.loginId,
      password: this.regPassword,
      phoneCode: this.phoneCode,
      phone: this.phone,
      name: this.name
    };
    this.loginService.getEmailOTP(payload).subscribe(
      res => {
        if (res.success) {
          if (res['data'] && res['data']['captchaRequired']) {
            this.showCaptchaAPIFlag = true;
          } else {
            this.showToast('otpSentOnYourEmail');
          }
        } else {
          this.otpButtonDisable = false;
          this.otpButtonLabelChanged = false;
        }
      }, err => {
        // some error occured fetching otp toast message
        this.otpButtonDisable = false;
        this.otpButtonLabelChanged = false;
      }
    );
  }

  getCaptcha() {
    this.loginService.getCaptcha().subscribe(
      res => {
        if (res.success) {
          this.captchaCode = '';
          const captchaImage = res['data']['image'];
          this.captchaData = res['data'];
          this.captchaImageUrl = this.sanitizer.bypassSecurityTrustResourceUrl('data:image/jpg;base64,'
            + captchaImage);
        } else {
          // this.utils.customErrorHandler(res);  handle success false;
        }
      }
    );
  }

  refreshCaptcha() {
    this.getCaptcha();
  }

  captchaSubmit() {
    this.validateCaptcha();
  }

  validateCaptcha() {
    if (this.captchaCode !== 0 && this.captchaCode) {
      const payload = {};
      payload['captchaId'] = this.captchaData['code'];
      payload['time'] = this.captchaData['time'];
      payload['captchaValue'] = this.captchaCode;
      this.loginService.validateCaptcha(payload).subscribe(
        res => {
          if (res.success) {
            this.validationMessage = '';
            this.isValid = true;
            this.isInputEmpty = false;
            this.getOTP();
            this.showCaptchaDiv = false;
          } else {
            if (res['error']['data'][0]['field'] === 'captcha' && res['error']['data'][0]['key'] === 'invalid') {
              this.validationMessage = 'invalidCaptcha';
              this.isValid = true;
              this.isInputEmpty = true;
            } else {
              // handle error
            }
          }
        }, err => {
          this.captchaCode = '';
          // this.utils.httpErrorHandler(err);  Handle http error
        }
      );
    } else {
      this.validationMessage = 'invalidCaptcha';
      this.isValid = true;
      this.isInputEmpty = true;
    }
  }

  initializeApp() {
    const lang = this.activatedRoute.snapshot.params['lang'];
    if (lang) {
      this.translateService.selectLang(lang);
      // localStorage.setItem('lanGuage', lang);
      // this.wtStorageService.selected_lang = lang;
    }
    // set promocode
    if (this.activatedRoute.snapshot.params['promoCode']) {
      localStorage.setItem('promoCode', this.activatedRoute.snapshot.params.promoCode);
    }

    if (sessionStorage.getItem('tempToken')) {
      sessionStorage.setItem('crmToken', sessionStorage.getItem('tempToken'));
      sessionStorage.setItem('tempToken', '');
    }

    const token = sessionStorage.getItem('crmToken');
    const fromCrm = sessionStorage.getItem('fromCrm');
    if (token) {
      if (token && fromCrm === 'true') {
        this.wtStorageService.showLogin = false;
        this.authenticateWithTempToken(token);
        sessionStorage.removeItem('fromCrm');
      } else {
        this.wtStorageService.showLogin = false;
        this.authenticateUsingSessionToken(token);
      }
    } else {
      this.wtStorageService.showLogin = true;
    }

    if (localStorage.getItem('lanGuage') != null) {
      this.wtStorageService.selected_lang = localStorage.getItem('lanGuage');
      this.translateService.selectLang(localStorage.getItem('lanGuage'));
    } else if (localStorage.getItem('lanGuage') == null) {
      this.wtStorageService.selected_lang = 'en';
    }

    for (var i = 0; i < this.languages.length; i++) {
      if (this.languages[i].code == localStorage.getItem('lanGuage')) {
        this.imageUrl1 = this.languages[i].imageUrl1;
        this.imageUrl2 = this.languages[i].imageUrl2;
        this.imageUrl3 = this.languages[i].imageUrl3;
        this.selectedLang = this.languages[i].name;
      }
    }
    // if (this.translateService.currentLang() === 'en') {
    //   this.imageUrl1 = './assets/images/slider-1.jpg';
    //   this.imageUrl2 = './assets/images/slider-2.jpg';
    //   this.imageUrl3 = './assets/images/slider-3.jpg';

    // } else if (this.translateService.currentLang() === 'th') {
    //   this.imageUrl1 = './assets/images/slider-th-1.jpg';
    //   this.imageUrl2 = './assets/images/slider-th-2.jpg';
    //   this.imageUrl3 = './assets/images/slider-th-3.jpg';

    // } else {
    //   this.imageUrl1 = './assets/images/slider-zh-1.jpg';
    //   this.imageUrl2 = './assets/images/slider-zh-2.jpg';
    //   this.imageUrl3 = './assets/images/slider-zh-3.jpg';

    // }
    /*else if (this.isAndriodAppAvailable && !this.androidPopupShown) {
      this.androidPopupShown = true;
      sessionStorage.setItem('androidPopupShown', 'true');
      this.modalService.open(MobileDeviceComponent, {
        // keyboard: false,
        windowClass: 'bounceIn animated md android-app'
      });
    }*/
    if (this.router.url.indexOf('/register') > -1 || this.router.url.indexOf('/affiliates') > -1) {
      this.onRegister();
    }
  }

  /**
   * For AutoFocus on Username
   */
  @ViewChild('input', { static: false }) input: ElementRef;

  ngAfterViewInit() {
    this.input && this.input.nativeElement && this.input.nativeElement.focus();

    // if (localStorage.getItem('lanGuage') != null) {
    //   this.wtStorageService.selected_lang = localStorage.getItem('lanGuage');
    //   this.translateService.selectLang(localStorage.getItem('lanGuage'));
    // } else if (localStorage.getItem('lanGuage') == null) {
    //   localStorage.setItem('lanGuage', 'en');
    //   this.wtStorageService.selected_lang = localStorage.getItem('lanGuage');
    //   this.translateService.selectLang(localStorage.getItem('lanGuage'));
    // }
    // this.setLiveChatForRegister();
  }

  setLiveChatForRegister() {
    // if (this.router.url === '/register') {
    if (environment.WT_CONFIG.liveChatLicenseId) {
      this.lcAPI = setInterval(() => {
        const self = this;
        if (window['LC_API']) {
          // let openedFlag = false;
          // let timeoutID;
          // window['LC_API'].on_chat_window_opened = function () {
          //   openedFlag = true;
          //   if (timeoutID) {
          //     window.clearTimeout(timeoutID);
          //   }
          // };
          // if (!openedFlag) {
          //   timeoutID = setTimeout(() => {
          //     window['LC_API'].open_chat_window();
          //   }, this.showLiveChatInterval);
          // }
          window['LC_API'].on_prechat_survey_submitted = function (data) {
            const emailAndName: any = self.getEmailAndName(data);
            self.createLead(emailAndName[0], emailAndName[1]);
          };
          window['LC_API'].on_ticket_created = function (data) {
            const emailAndName: any = self.getEmailAndName(data);
            self.createLead(emailAndName[0], emailAndName[1]);
          };
          clearInterval(this.lcAPI);
        }
      }, 3000);

    }
    // }
  }

  getEmailAndName(data) {
    let emailObj: any = {};
    const engEmailObjArray = data.form_data.filter(
      function (el) {
        return el.label.startsWith('E-mail');
      });
    const zhEmailObjArray = data.form_data.filter(
      function (el) {
        return el.label.startsWith('电邮');
      });
    if (engEmailObjArray.length > 0) {
      emailObj = engEmailObjArray[0];
    } else if (zhEmailObjArray.length > 0) {
      emailObj = zhEmailObjArray[0];
    }
    let nameObj: any = {};
    const engNameObjArray = data.form_data.filter(
      function (el) {
        return el.label.startsWith('Name');
      });
    const zhNameObjArray = data.form_data.filter(
      function (el) {
        return el.label.startsWith('名字');
      });
    if (engNameObjArray.length > 0) {
      nameObj = engNameObjArray[0];
    } else if (zhEmailObjArray.length > 0) {
      nameObj = zhNameObjArray[0];
    }
    return [emailObj.value, nameObj.value];
  }

  createLead(email, name) {
    if (email && name) {
      const firstName = name.split(' ')[0];
      const lastName = name.split(' ').slice(1).join(' ');
      const payload: any = {
        'firstName': firstName,
        'email': email,
        'lang': this.translateService.currentLang() || 'zh'
      };
      if (lastName) {
        payload['lastName'] = lastName;
      }
      this.loginService.createLead(payload).subscribe((res) => {
        console.log(JSON.stringify(res));
      }, (err) => {
        console.log(JSON.stringify(err));
      });
    }
  }


  /**
   * login to application
   * @return {boolean} false to prevent default form submit behavior to refresh the page.
   */
  login(): any {
    if ((this.loginId == '' || this.loginId == null) && (this.password == '' || this.password == null)) {
      this.validationMessage = 'Login_Please_Enter_Email_and_Password';
      this.isValid = true;
      this.isInputEmpty = true;
      return;
    } else if (this.loginId == '' || this.loginId == null) {
      this.validationMessage = 'Please_Enter_Email';
      this.isValid = true;
      this.isInputEmpty = true;
      return;
    } else if (this.password == '' || this.password == null) {
      this.validationMessage = 'Please_Enter_Password';
      this.isValid = true;
      this.isInputEmpty = true;
      return;
    }
    /*else if((this.loginId != '' || this.loginId != null) && (this.password != '' || this.password != null) && this.checkBox == false){
      this.validationMessage = "Please_Accept_Privacy_Policy";
      this.isValid =true;
      this.isInputEmpty = true;
      return;
    }*/

    this.disableSubmit = true;
    this.loginService.authUserNew(this.loginId, this.password)
      .subscribe(
        (res: any) => {
          if (res && res.success && res.data.mt4Accounts && res.data.mt4Accounts.length > 0) {
            this.isValid = true;
            if (!this.isValid) {
              this.loginId = null;
              this.password = null;
            }
            this.setItemInStorage(res);
            sessionStorage.setItem('crmToken', this.wtStorageService.crmToken);
            localStorage.setItem('loginId', this.loginId);
            localStorage.setItem('password', this.password);
            this.wtStorageService.mt4AccountsList = [];
            // console.log(res.data.mt4Accounts);
            res.data.mt4Accounts.forEach(
              (mt4Account: any) => {
                this.wtStorageService.mt4AccountsList.push({
                  'accountId': {
                    'loginId': mt4Account.loginId
                  },
                  'accessToken': '',
                  'validate': true,
                  'expiryTimeUnixTS': '',
                  'password': ''
                });
              });
            if (res.data.demoLogin) {
              this.wtStorageService.hasDemo = true;
              this.wtStorageService.mt4AccountsList.push({
                'accountId': res.data.demoLogin,
                'accessToken': '',
                'validate': true,
                'expiryTimeUnixTS': '',
                'password': '',
                'demo': true
              });
              this.mt4loginservice.mt4DemoAuthUserUsingToken(res.data.demoLogin)
                .subscribe(
                  (data: any) => {
                    this.wtStorageService.mt4AccountsList.forEach(
                      (mt4Account: any) => {
                        if (mt4Account.demo) {
                          mt4Account['accessToken'] = data['access_token'];
                        }
                      });
                  },
                  (err: any) => {
                  });
            }
            sessionStorage.setItem('mt4AccountList', JSON.stringify(this.wtStorageService.mt4AccountsList));
            sessionStorage.setItem('tempMt4Accounts', JSON.stringify(this.wtStorageService.mt4AccountsList));
            this.tempdata = res.data;
            this.accounts = res.data['accountId'];
            this.wtStorageService.selectedMt4Account = this.wtStorageService.mt4AccountsList[0];
            try {
            localStorage.setItem('profileImage', res.data.profileImage);
           }
            catch (e) {
              console.log("Local Storage is full");
            }
            this.wtStorageService.profileImage = res.data.profileImage;

            this.wtStorageService.showLogin = false;
            //coachmarks API
            if (res.data.displayCoachmarks == 0) {
              sessionStorage.setItem('firstLogin', 'true');
              this.loginService.coachmarks(sessionStorage.getItem('crmToken'), this.wtStorageService.selectedMt4Account.accountId.loginId).subscribe();
            } else {
              sessionStorage.setItem('firstLogin', 'false');
            }
            this.mt4loginservice.mt4AuthUserUsingToken()
              .subscribe(
                (data: any) => {
                  this.wtStorageService.mt4AccountsList.forEach(
                    (mt4Account: any) => {
                      mt4Account['accessToken'] = data['access_token'];
                    });
                  sessionStorage.setItem('mt4AccountList', JSON.stringify(this.wtStorageService.mt4AccountsList));
                  sessionStorage.setItem('tempMt4Accounts', JSON.stringify(this.wtStorageService.mt4AccountsList));
                  this.navigateToTradeScreen(data, null);
                },
                (err: any) => {
                  this.navigateToTradeScreen(null, err);
                });
          } else {
            this.disableSubmit = false;
            this.isValid = false;
            this.loginId = null;
            this.password = null;
          }
        }
        , err => {
          this.disableSubmit = false;
          this.isValid = false;
          this.loginId = null;
          this.password = null;
        });
    return false;
  }

  setItemInStorage(res) {

    this.wtStorageService.crmToken = res.data.authorization;
    this.wtStorageService.loginId = res.data.id;
    sessionStorage.setItem('loginId', res.data.id);
    this.wtStorageService.firstName = res.data.firstName || res.data.name || '';
    this.wtStorageService.lastName = res.data.lastName || '';
    this.wtStorageService.email = res.data.email;
    localStorage.setItem('username', this.wtStorageService.firstName);
  }

  authenticateUsingSessionToken(token) {

    this.wtStorageService.mt4AccountsList = this.wtStorageService.mt4AccountsList ||
      JSON.parse(sessionStorage.getItem('mt4AccountList')) ||
      JSON.parse(sessionStorage.getItem('tempMt4Accounts'));
    this.loginService.authUserUsingToken(token)
      .subscribe(
        (res: any) => {
          this.isValid = true;
          this.setItemInStorage(res);
          sessionStorage.setItem('crmToken', this.wtStorageService.crmToken);
          if (res && res.success && res.data) {
            this.wtStorageService.mt4AccountsList = [];
            // console.log(res.data);
            res.data.mt4Accounts.forEach(
              (mt4Account: any) => {
                this.wtStorageService.mt4AccountsList.push({
                  'accountId': {
                    'loginId': mt4Account.loginId
                  },
                  'accessToken': '',
                  'validate': true,
                  'expiryTimeUnixTS': '',
                  'password': ''
                });
              });
            if (res.data.demoLogin) {
              this.wtStorageService.hasDemo = true;
              this.wtStorageService.mt4AccountsList.push({
                'accountId': res.data.demoLogin,
                'accessToken': '',
                'validate': true,
                'expiryTimeUnixTS': '',
                'password': '',
                'demo': true
              });
              this.mt4loginservice.mt4DemoAuthUserUsingToken(res.data.demoLogin)
                .subscribe(
                  (data: any) => {
                    this.wtStorageService.mt4AccountsList.forEach(
                      (mt4Account: any) => {
                        if (mt4Account.demo) {
                          mt4Account['accessToken'] = data['access_token'];
                        }
                      });
                  },
                  (err: any) => {
                  });
            }
            sessionStorage.setItem('mt4AccountList', JSON.stringify(this.wtStorageService.mt4AccountsList));
            sessionStorage.setItem('tempMt4Accounts', JSON.stringify(this.wtStorageService.mt4AccountsList));
            this.tempdata = res.data;
            this.accounts = res.data['accountId'];
            this.wtStorageService.selectedMt4Account = this.wtStorageService.mt4AccountsList[0];
            try {
              localStorage.setItem('profileImage', res.data.profileImage);
             }
              catch (e) {
                console.log("Local Storage is full");
              }
            this.wtStorageService.profileImage = res.data.profileImage;

            this.wtStorageService.showLogin = false;
            if (res.data.displayCoachmarks == 0) {
              sessionStorage.setItem('firstLogin', 'true');
              this.loginService.coachmarks(sessionStorage.getItem('crmToken'), this.wtStorageService.selectedMt4Account.accountId.loginId).subscribe();
            } else {
              sessionStorage.setItem('firstLogin', 'false');
            }
            this.mt4loginservice.mt4AuthUserUsingToken()
              .subscribe(
                (data: any) => {
                  this.wtStorageService.mt4AccountsList.forEach(
                    (mt4Account: any) => {
                      mt4Account['accessToken'] = data['access_token'];
                    });
                  sessionStorage.setItem('mt4AccountList', JSON.stringify(this.wtStorageService.mt4AccountsList));
                  sessionStorage.setItem('tempMt4Accounts', JSON.stringify(this.wtStorageService.mt4AccountsList));
                  this.navigateToTradeScreen(data, null);
                },
                (err: any) => {
                  this.navigateToTradeScreen(null, err);
                });
          } else {
            this.disableSubmit = false;
            this.isValid = false;
            this.loginId = null;
            this.password = null;
          }
        }
        , err => {
          this.disableSubmit = false;
          this.isValid = false;
          this.loginId = null;
          this.password = null;
        });
    return false;
  }

  authenticateWithTempToken(token) {
    this.loginService.authUserUsingTempToken(token)
      .subscribe(
        (res: any) => {
          if (res && res.success && res.data) {
            this.isValid = true;
            this.setItemInStorage(res);
            sessionStorage.setItem('crmToken', res.data.authorization);
            this.wtStorageService.mt4AccountsList = [];
            console.log(res.data);
            res.data.mt4Accounts.forEach(
              (mt4Account: any) => {
                this.wtStorageService.mt4AccountsList.push({
                  'accountId': {
                    'loginId': mt4Account.loginId
                  },
                  'accessToken': '',
                  'validate': true,
                  'expiryTimeUnixTS': '',
                  'password': ''
                });
              });

            if (res.data.demoLogin) {
              this.wtStorageService.hasDemo = true;
              this.wtStorageService.mt4AccountsList.push({
                'accountId': res.data.demoLogin,
                'accessToken': '',
                'validate': true,
                'expiryTimeUnixTS': '',
                'password': '',
                'demo': true
              });
              this.mt4loginservice.mt4DemoAuthUserUsingToken(res.data.demoLogin)
                .subscribe(
                  (data: any) => {
                    this.wtStorageService.mt4AccountsList.forEach(
                      (mt4Account: any) => {
                        if (mt4Account.demo) {
                          mt4Account['accessToken'] = data['access_token'];
                        }
                      });
                  },
                  (err: any) => {
                  });
            }
            sessionStorage.setItem('mt4AccountList', JSON.stringify(this.wtStorageService.mt4AccountsList));
            sessionStorage.setItem('tempMt4Accounts', JSON.stringify(this.wtStorageService.mt4AccountsList));
            this.tempdata = res.data;
            this.accounts = res.data['accountId'];
            this.wtStorageService.selectedMt4Account = this.wtStorageService.mt4AccountsList[0];
            try {
              localStorage.setItem('profileImage', res.data.profileImage);
             }
              catch (e) {
                console.log("Local Storage is full");
              }
            this.wtStorageService.profileImage = res.data.profileImage;
            this.wtStorageService.showLogin = false;
            if (res.data.displayCoachmarks == 0) {
              sessionStorage.setItem('firstLogin', 'true');
              this.loginService.coachmarks(sessionStorage.getItem('crmToken'), this.wtStorageService.selectedMt4Account.accountId.loginId).subscribe();
            } else {
              sessionStorage.setItem('firstLogin', 'false');
            }
            this.mt4loginservice.mt4AuthUserUsingToken()
              .subscribe(
                (data: any) => {
                  this.wtStorageService.mt4AccountsList.forEach(
                    (mt4Account: any) => {
                      mt4Account['accessToken'] = data['access_token'];
                    });
                  sessionStorage.setItem('mt4AccountList', JSON.stringify(this.wtStorageService.mt4AccountsList));
                  sessionStorage.setItem('tempMt4Accounts', JSON.stringify(this.wtStorageService.mt4AccountsList));
                  this.navigateToTradeScreen(data, null);
                },
                (err: any) => {
                  this.navigateToTradeScreen(null, err);
                });
          } else {
            this.disableSubmit = false;
            this.isValid = false;
            this.loginId = null;
            this.password = null;
          }
        }
        , err => {
          this.disableSubmit = false;
          this.isValid = false;
          this.loginId = null;
          this.password = null;
        });
    return false;
  }

  authenticateQueryParameterToken(token) {

    this.loginService.authUserUsingToken(token)
      .subscribe(
        (res: any) => {
          if (res && res.success && res.data) {
            this.isValid = true;
            this.setItemInStorage(res);
            sessionStorage.setItem('crmToken', this.wtStorageService.crmToken);
            this.wtStorageService.mt4AccountsList = [];
            console.log(res.data);
            res.data.mt4Accounts.forEach(
              (mt4Account: any) => {
                this.wtStorageService.mt4AccountsList.push({
                  'accountId': {
                    'loginId': mt4Account.loginId
                  },
                  'accessToken': '',
                  'validate': true,
                  'expiryTimeUnixTS': '',
                  'password': ''
                });
              });
            if (res.data.demoLogin) {
              this.wtStorageService.hasDemo = true;
              this.wtStorageService.mt4AccountsList.push({
                'accountId': res.data.demoLogin,
                'accessToken': '',
                'validate': true,
                'expiryTimeUnixTS': '',
                'password': '',
                'demo': true
              });
              this.mt4loginservice.mt4DemoAuthUserUsingToken(res.data.demoLogin)
                .subscribe(
                  (data: any) => {
                    this.wtStorageService.mt4AccountsList.forEach(
                      (mt4Account: any) => {
                        if (mt4Account.demo) {
                          mt4Account['accessToken'] = data['access_token'];
                        }
                      });
                  },
                  (err: any) => {
                  });
            }
            sessionStorage.setItem('mt4AccountList', JSON.stringify(this.wtStorageService.mt4AccountsList));
            sessionStorage.setItem('tempMt4Accounts', JSON.stringify(this.wtStorageService.mt4AccountsList));
            this.tempdata = res.data;
            this.accounts = res.data['accountId'];
            this.wtStorageService.selectedMt4Account = this.wtStorageService.mt4AccountsList[0];
            if (res.data.displayCoachmarks == 0) {
              sessionStorage.setItem('firstLogin', 'true');
              var payload;
              if (this.wtStorageService.selectedMt4Account.accountId.loginId) {
                payload = this.wtStorageService.selectedMt4Account.accountId.loginId;
              }
              else {
                payload = this.wtStorageService.selectedMt4Account.accountId;
              }
              this.loginService.coachmarks(sessionStorage.getItem('crmToken'), payload).subscribe();
            } else {
              sessionStorage.setItem('firstLogin', 'false');
            }
            this.wtStorageService.showLogin = false;

            this.mt4loginservice.mt4AuthUserUsingToken()
              .subscribe(
                (data: any) => {
                  this.wtStorageService.mt4AccountsList.forEach(
                    (mt4Account: any) => {
                      mt4Account['accessToken'] = data['access_token'];
                    });
                  sessionStorage.setItem('mt4AccountList', JSON.stringify(this.wtStorageService.mt4AccountsList));
                  sessionStorage.setItem('tempMt4Accounts', JSON.stringify(this.wtStorageService.mt4AccountsList));
                  this.navigateToTradeScreen(data, null);
                },
                (err: any) => {
                  this.navigateToTradeScreen(null, err);
                });
          } else {
            this.disableSubmit = false;
            this.isValid = false;
            this.loginId = null;
            this.password = null;
          }
        }
        , err => {
          this.disableSubmit = false;
          this.isValid = false;
          this.loginId = null;
          this.password = null;
        });
    return false;
  }

  navigateToTradeScreen(data, err) {
    this.router.navigate(['/trade']);
    this.wtStorageService.showLogin = false;
    this.disableSubmit = false;
    this.loginId = '';
    this.password = '';
    this.checkBox = false;
    this.isValid = true;
    this.isInputEmpty = false;
  }

  openForgot() {
    this.inLogin = false;
  }

  validateName(value) {
    this.validationMessage = '';
    this.isValid = true;
    this.isInputEmpty = false;
    const fullName = value;
    if (fullName.length === 0) {
      this.validationMessage = '';
      this.isValid = true;
      this.isInputEmpty = false;
      return;
    }
    const re = /^((?![&|=|"|#|@|%|$|~|{|}|_|;|\-|\]|/|\\|[|{<|>|,|.|!|:|'|`|\|+|?|*|^|(|)|\d])[\s\S])*$/;
    if (fullName.length < 2 || !(re.test(fullName))) {
      this.validationMessage = 'nameValidationErrorMessage';
      this.nameValidationErrorMessage = true;
      this.isValid = true;
      this.isInputEmpty = true;
      return;
    } else {
      this.nameValidationErrorMessage = false;
      this.validationMessage = '';
      this.isValid = true;
      this.isInputEmpty = false;
    }
  }

  onRegister() {
    clearInterval(this.lcAPI);
    //window.history.replaceState('', '', '/register');
    //this.router.navigate(['/register']);
    this.getCountryList();
    this.inLogin = false;
    this.inRegister = true;
    this.loginId = '';
    this.password = '';
    this.toAgree = 0;
    this.otp = null;
    if (!localStorage.getItem('promoCode')) {
      this.promoCode = '';
      this.disablePromocode = false;
    }
    this.setLiveChatForRegister();
    this.router.navigate(['/register']);
  }

  otpValidation(otp) {
    const re = /^[0-9]{4}$/;
    return re.test(otp);
  }

  /**
   * register on application
   * @return {boolean} false to prevent default form submit behavior to refresh the page.
   */
  register(): any {
    // this.toAgree = 1;
    // if ((this.loginId == '' || this.loginId == null) && (this.regPassword == '' || this.regPassword == null)) {
    //   this.validationMessage = 'Login_Please_Enter_Email_and_Password';
    //   this.isValid = true;
    //   this.isInputEmpty = true;
    //   return;
    // } else
    if (localStorage.getItem('promoCode')) {
      this.promoCode = localStorage.getItem('promoCode');
    }
    if (this.country == -1 || this.country == null) {
      this.validationMessage = 'Please_Select_Country';
      this.isValid = true;
      this.isInputEmpty = true;
      return;
    } else if (this.phoneCode == '' || this.phoneCode == null) {
      this.validationMessage = 'Please_Enter_PhoneCode';
      this.isValid = true;
      this.isInputEmpty = true;
      return;
    } else if (this.phone == '' || this.phone == null) {
      this.validationMessage = 'Please_Enter_Phone';
      this.isValid = true;
      this.isInputEmpty = true;
      return;
    } else if (this.name === '' || this.name == null) {
      this.validationMessage = 'Please_Enter_Name';
      this.isValid = true;
      this.isInputEmpty = true;
      return;
    } else if (this.loginId == '' || this.loginId == null) {
      this.validationMessage = 'Please_Enter_Email';
      this.isValid = true;
      this.isInputEmpty = true;
      return;
    } else if (this.regPassword == '' || this.regPassword == null) {
      this.validationMessage = 'Please_Enter_Password';
      this.isValid = true;
      this.isInputEmpty = true;
      return;
    } else if (this.otpValue == '' || this.otpValue == null || !(this.otpValidation(this.otpValue))) {
      this.validationMessage = 'wrongOTP';
      this.isValid = true;
      this.isInputEmpty = true;
      return;
    } else if ((this.loginId != '' || this.loginId != null) && (this.regPassword != '' || this.regPassword != null) && this.toAgree == 0) {
      this.validationMessage = 'Please_Accept_Privacy_Policy';
      this.isValid = true;
      this.isInputEmpty = true;
      return;
    } else {
      this.disableSubmit = true;
      const payload: any = {
        promoCode: this.promoCode,
        country: this.country,
        email: this.loginId,
        password: this.regPassword,
        phoneCode: this.phoneCode,
        phone: this.phone,
        otpValue: this.otpValue,
        toAgree: this.toAgree ? 1 : 0,
        name: this.name
      };
      if (this.cid) {
        payload['cid'] = this.cid;
      }

      this.loginService.newRegistration(payload).subscribe((res) => {
        if (res.success && res['data']) {
          if (res['data']['isOtpValid'] === false) {
            this.validationMessage = 'wrongOTP';
            this.isValid = true;
            this.isInputEmpty = true;
            this.disableSubmit = false;
            this.otpValue = '';
            if (res['data']['isOtpExpired']) {
              this.otpButtonDisable = false;
              this.validationMessage = 'otpExpired';
              this.isValid = true;
              this.isInputEmpty = true;
              this.disableSubmit = false;
            }
          } else {
            this.getOTPCount = 0;
            this.isValid = true;
            this.wtStorageService.showDeposit = true;
            //sessionStorage.setItem('firstLogin', 'true');
            this.authenticateQueryParameterToken(res.data.authorization);
          }
        } else if (res.error.key === 'validationFailed' && res.error.data[0]) {
          if (res.error.data[0].field === 'email' && res.error.data[0].key === 'alreadyExists') {
            this.showToast('alreadyExists');
            this.router.navigate(['/']);
          } else {
            this.showToast('registrationFailed');
          }
        } else if (res['error']['key'] === 'operationFailed' && res['error']['data'][0]) {
          this.showToast('operationFailed');
        } else {
          this.showToast('operationFailed');
          this.disableSubmit = false;
          this.isValid = false;
          this.loginId = null;
          this.regPassword = null;
        }
      }, (err) => {
        this.showToast('operationFailed');
        this.disableSubmit = false;
        this.isValid = false;
        this.loginId = null;
        this.regPassword = null;
      });
      return false;

    }
  }

  backToLogin() {
    clearInterval(this.lcAPI);
    this.inLogin = true;
    this.loginId = null;
    this.password = null;
    this.isFpEmailValid = false;
    this.emailId = '';
    this.isInputEmpty = false;
    this.isValid = true;
    this.inRegister = false;
    this.showOTP = false;
    this.router.navigate(['/login']);
  }

  backToLoginReset() {
    this.inLogin = true;
    this.isFpEmailVerified = false;
    this.loginId = null;
    this.password = null;
    this.isValid = true;
    this.isInputEmpty = false;
    this.isFpEmailValid = false;
    this.inRegister = false;
    this.showOTP = false;
  }

  forgotPwd() {
    // this.inLogin = false;
    const re = /^[a-zA-Z0-9._+-]+@[a-zA-Z0-9._-]*(\.[A-Za-z0-9]+)*(\.[A-Za-z]{2,})$/;
    if (this.emailId == null || this.emailId == '') {
      this.fpValidationMessage = 'Enter_Email';
      this.isFpEmailValid = true;
    } else if (!re.test(this.emailId)) {
      this.isFpEmailValid = true;
      this.fpValidationMessage = 'Enter_valid_email';
    } else {
      this.disableFpSubmit = true;
      this.loginService.forgotCrmPwd(this.emailId).subscribe(
        (res: any) => {
          if (res && res.success) {
            this.isFpEmailValid = false;
            this.isFpEmailVerified = true;
            this.emailId = null;
            this.disableFpSubmit = false;
          } else {
            this.disableFpSubmit = false;
            this.fpValidationMessage = 'Please_enter_your_registered_email';
            this.isFpEmailValid = true;
            this.isFpEmailVerified = false;
            this.emailId = '';
          }
        },
        (err: any) => {
          this.disableFpSubmit = false;
          this.fpValidationMessage = 'Please_enter_your_registered_email';
          this.isFpEmailValid = true;
          this.isFpEmailVerified = false;
          this.emailId = '';
        });
    }
  }

  openFP(event: any, content: any) {
    event.preventDefault();
    this.modalService.open(content, this.modalOptions).result.then((result) => {
      this.isFpEmailVerified = false;
      this.isFpEmailValid = false;
    }, (reason) => {
      this.disableFpSubmit = false;
      this.isFpEmailVerified = false;
      this.emailId = '';
      this.isFpEmailValid = false;
    });
  }

  clicked(event: any) {
    event.preventDefault();
  }

  switchLanguage(event: any, lang) {
    event.preventDefault();
    const custom_variables = [
      { name: 'Preferred Language', value: lang.code }
    ];
    if (environment.WT_CONFIG.liveChatLicenseId) {
      const lcAPI2 = setInterval(() => {
        if (window['LC_API']) {
          window['LC_API'].set_custom_variables(custom_variables);
          clearInterval(lcAPI2);
        }
      }, 1000);
    }

    this.translateService.selectLang(lang.code);
    localStorage.setItem('lanGuage', lang.code);

    this.imageUrl1 = lang.imageUrl1;
    this.imageUrl2 = lang.imageUrl2;
    this.imageUrl3 = lang.imageUrl3;
    this.selectedLang = lang.name;
    this.termsOfServiceURL = lang.TERMS_CONDITIONS;

    // if (lang.code=='en') {
    //   this.imageUrl1 = './assets/images/slider-1.jpg';
    //   this.imageUrl2 = './assets/images/slider-2.jpg';
    //   this.imageUrl3 = './assets/images/slider-3.jpg';
    //   this.termsOfServiceURL = this.wtUtilService.config.TERMS_CONDITIONS;
    // }
    // if (lang.code=='zh') {
    //   this.imageUrl1 = './assets/images/slider-zh-1.jpg';
    //   this.imageUrl2 = './assets/images/slider-zh-2.jpg';
    //   this.imageUrl3 = './assets/images/slider-zh-3.jpg';
    //   this.termsOfServiceURL = this.wtUtilService.config.TERMS_CONDITIONS_ZH;
    // }
    // if (lang.code=='th') {
    //   this.imageUrl1 = './assets/images/slider-th-1.jpg';
    //   this.imageUrl2 = './assets/images/slider-th-2.jpg';
    //   this.imageUrl3 = './assets/images/slider-th-3.jpg';
    //   this.termsOfServiceURL = this.wtUtilService.config.TERMS_CONDITIONS_TH;
    // }
  }

  // usClicked(event: any) {
  //   event.preventDefault();
  //   const custom_variables = [
  //     { name: 'Preferred Language', value: 'en' }
  //   ];
  //   if (environment.WT_CONFIG.liveChatLicenseId) {
  //     const lcAPI2 = setInterval(() => {
  //       if (window['LC_API']) {
  //         window['LC_API'].set_custom_variables(custom_variables);
  //         clearInterval(lcAPI2);
  //       }
  //     }, 1000);
  //   }

  //   this.translateService.selectLang('en');
  //   localStorage.setItem('lanGuage', 'en');
  //   this.termsOfServiceURL = this.wtUtilService.config.TERMS_CONDITIONS;

  //   this.imageUrl1 = './assets/images/slider-1.jpg';
  //   this.imageUrl2 = './assets/images/slider-2.jpg';
  //   this.imageUrl3 = './assets/images/slider-3.jpg';

  // }

  // chiClicked(event: any) {
  //   event.preventDefault();
  //   const custom_variables = [
  //     { name: 'Preferred Language', value: 'zh' }
  //   ];
  //   if (environment.WT_CONFIG.liveChatLicenseId) {
  //     const lcAPI3 = setInterval(() => {
  //       if (window['LC_API']) {
  //         window['LC_API'].set_custom_variables(custom_variables);
  //         clearInterval(lcAPI3);
  //       }
  //     }, 1000);
  //   }

  //   this.translateService.selectLang('zh');
  //   localStorage.setItem('lanGuage', 'zh');
  //   this.imageUrl1 = './assets/images/slider-zh-1.jpg';
  //   this.imageUrl2 = './assets/images/slider-zh-2.jpg';
  //   this.imageUrl3 = './assets/images/slider-zh-3.jpg';
  //   this.termsOfServiceURL = this.wtUtilService.config.TERMS_CONDITIONS_ZH;

  // }

  // thClicked(event: any) {
  //   event.preventDefault();
  //   const custom_variables = [
  //     { name: 'Preferred Language', value: 'th' }
  //   ];
  //   if (environment.WT_CONFIG.liveChatLicenseId) {
  //     const lcAPI3 = setInterval(() => {
  //       if (window['LC_API']) {
  //         window['LC_API'].set_custom_variables(custom_variables);
  //         clearInterval(lcAPI3);
  //       }
  //     }, 1000);
  //   }

  //   this.translateService.selectLang('th');
  //   localStorage.setItem('lanGuage', 'th');
  //   this.imageUrl1 = './assets/images/slider-th-1.jpg';
  //   this.imageUrl2 = './assets/images/slider-th-2.jpg';
  //   this.imageUrl3 = './assets/images/slider-th-3.jpg';
  //   this.termsOfServiceURL = this.wtUtilService.config.TERMS_CONDITIONS_TH;

  // }

  // getEmailOTP() {
  //   if (this.loginId == '' || this.loginId == null) {
  //     this.validationMessage = 'Please_Enter_Email';
  //     this.isValid = true;
  //     this.isInputEmpty = true;
  //     return;
  //   }
  //   this.emailOTPText = new TranslatePipe(this.translateService).transform('email_otp_sent');
  //   this.enableOTPButton = false;
  //   this.showOTP = true;

  // }
  showToast(msg) {
    swal({
      html: `<span style="color:#ffffff">${(new TranslatePipe(this.translateService))
        .transform(msg)}<span>`,
      timer: 2000,
      width: 300,
      padding: 20,
      allowOutsideClick: false,
      allowEscapeKey: false,
      background: '#030608 url(./assets/images/trade-dropdown-bg.jpg) 100% 100% no-repeat',
      showConfirmButton: false,
      target: '#body_full_screen'
    });
  }

  ngOnDestroy() {
    clearInterval(this.lcAPI);
  }

  // Cocach Mark
  setCookie(name, value, days) {
    var expires = "";
    if (days) {
      var date = new Date();
      date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
      expires = "; expires = " + date.toUTCString();
    }
    document.cookie = name + "=" + (value || "") + expires + "; path=/";
  }
  getCookie(name) {
    var nameEQ = name + "=";
    var ca = document.cookie.split(';');
    for (var i = 0; i < ca.length; i++) {
      var c = ca[i];
      while (c.charAt(0) == ' ') c = c.substring(1, c.length);
      if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
  }

  eraseCookie(name) {
    document.cookie = name + '=; Max-Age=-99999999;';
  }

  getCurrentBrowser() {
    const deviceInfo = this.deviceService.getDeviceInfo();
    // console.log(deviceInfo);

    return deviceInfo.browser.toLocaleLowerCase();

  }

  switchUCImage(id) {
    if (id === '4') {
      this.showCoachMark = false;
    } else {
      this.ucFlag = id;
    }
  }

  closeCoachMark() {
    this.showCoachMark = false;
  }

  // Main function end

}
