import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { TranslateService } from './shared/translate/translate.service';
import { Title } from '@angular/platform-browser';
import * as environment from '../environments/wt.environment';
import { WTUtilService } from './shared/service/wt-util.service';
import {WTStorageService} from './shared/service/wt-storage.service';
import { LoginService } from './login/shared/login.service';
@Component({
  selector: 'sd-app',
  templateUrl: './app.component.html'
})


export class AppComponent implements OnInit {

  title = environment.WT_CONFIG.APP_TITLE || 'Countdown';
  brandName = environment.WT_CONFIG.BRAND_NAME;

  licenseId = environment.WT_CONFIG.liveChatLicenseId;
  groupLogin = 23;
  defaultCountry: any;
  countryList: any;
  singleApi = environment.WT_CONFIG.getFoxAPI;
  constructor(
    private route: ActivatedRoute,
    public translateService: TranslateService,
    private titleService: Title, public utils: WTUtilService,
    public wtStorageService: WTStorageService,
    public loginService: LoginService
  ) {
    this.setTitle();
  }

  ngOnInit() {
    const token = this.getQueryStringValue('id');
    if (token) {
      sessionStorage.setItem('crmToken', 'bearer ' + token);
      sessionStorage.setItem('fromCrm', 'true');
    }
    let lang = this.getQueryStringValue('lang');
    //lang = lang ? lang : (window.location.href.includes('/en') ? 'en' : (window.location.href.includes('/zh') ? 'zh' : undefined) );
    if (lang) {
      var includesLang = "/" + lang
      window.location.href.includes(includesLang);
      this.translateService.selectLang(lang);
      localStorage.setItem('lanGuage', lang);
    } else {
      if (localStorage.getItem('lanGuage')) {
        this.translateService.selectLang(localStorage.getItem('lanGuage'));
      }
      // else {
      //   this.translateService.selectLang('zh');
      // }
    }

    if (localStorage.getItem('lanGuage') != null) {
      this.wtStorageService.selected_lang = localStorage.getItem('lanGuage');
      this.translateService.selectLang(localStorage.getItem('lanGuage'));
    }
    // else if (localStorage.getItem('lanGuage') == null) {
    //   this.wtStorageService.selected_lang = 'zh';
    //   localStorage.setItem('lanGuage', 'zh');
    //   this.translateService.selectLang(localStorage.getItem('lanGuage'));
    // }

    if (window.location.href.indexOf('trade') > -1) {
      if (localStorage.getItem('lanGuage') === 'zh') {
        this.groupLogin = 14;
      } else if (localStorage.getItem('lanGuage') === 'en') {
        this.groupLogin = 17;
      } else if (localStorage.getItem('lanGuage') === 'th') {
        // this.groupLogin = 17;
      }
    } else {
      if (localStorage.getItem('lanGuage') === 'zh') {
        this.groupLogin = 23;
      } else if (localStorage.getItem('lanGuage') === 'en') {
        this.groupLogin = 22;
      } else if (localStorage.getItem('lanGuage') === 'th') {
        // this.groupLogin = 17;
      }
    }
    this.getAnalyticsData();
  }
  getQueryStringValue (key) {
    return decodeURIComponent(window.location.search.replace(new RegExp("^(?:.*[&\\?]" + encodeURIComponent(key).replace(/[\.\+\*]/g, "\\$&") + "(?:\\=([^&]*))?)?.*$", "i"), "$1"));
  }

  public setTitle() {
    this.titleService.setTitle(this.title);
  }

  installPwa(): void {
    this.utils.promptEvent.prompt();
  }

  getAnalyticsData() {
    if(!this.singleApi){
      this.getUserDefaultCountry();
      this.loginService.getAnalyticsData().subscribe(
        res => {
          if (res.success) {
            for (var i=0; i<res.data.length; i++) {
              if (res.data[i].slug=='webtrader-analytic' && res.data[i].active) {
                var blockedCountries = res.data[i].scriptBlockedCountry;
                var blockedCounty: boolean = false;
                for (var j = 0; j < blockedCountries.length; j++) {
                  if (blockedCountries[j].country_id.id == this.defaultCountry) {
                    blockedCounty = true;
                  }
                }
                if(!blockedCounty){
                  var script = res.data[i].script;
                  var range = document.createRange();
                  range.selectNode(document.getElementsByTagName("BODY")[0]);
                  var documentFragment = range.createContextualFragment(script);
                  document.body.appendChild(documentFragment);
                }
              }
            }
          }
        }, err => {
          // this.utils.httpErrorHandler(err);
        });
    }
  }

  getUserDefaultCountry() {
      this.loginService.getCountryList().subscribe(
        res => {
          if (res.success) {
            this.countryList = res.data;
            this.countryList.forEach((element) => {
              if (element['userCountry']) {
                this.defaultCountry = element['id'];
              }
            });
          } else {
            // this.utils.customErrorHandler(res);
          }
        }, err => {
          // this.utils.httpErrorHandler(err);
        });
    
  }

}
