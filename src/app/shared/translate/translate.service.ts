import {Injectable, Inject} from '@angular/core';
import {dictionary, TRANSLATIONS} from '../translate/translation';
import {WTStorageService} from '../service/wt-storage.service';
import { WT_CONFIG } from '../../../environments/wt.environment';


@Injectable()
export class TranslateService {
  private _currentLang: string;
  translatedText: string;
  supportedLanguages: any[];
  public _translations: any;

  // inject our translations
  constructor(private wtStorageService: WTStorageService) {
    this._translations = dictionary;

    this.supportedLanguages = [
      {display: 'English', value: 'en'},
      {display: '华语', value: 'zh'},
      {display: 'ไทย', value: 'th'},
      {display: 'Tiếng Việt', value: 'vi'},
      {display: '한국어', value: 'ko'}
    ];

    // this.selectLang('en');

    // this.wtStorageService.selected_lang = WT_CONFIG.defaultLanguage;
    // this.selectLang(WT_CONFIG.defaultLanguage);
    // localStorage.setItem('lanGuage', WT_CONFIG.defaultLanguage);
  }

  currentLang() {
    // return this._currentLang;
    return this.wtStorageService.selected_lang;
  }

  use(lang: string): void {
    // set current language
    // this._currentLang = lang;
    this.wtStorageService.selected_lang = lang;
  }

  translate(key: string): string {
    // private perform translation
    let translation = key;

    // if (this._translations[this.currentLang] && this._translations[this.currentLang][key]) {
    //     return this._translations[this.currentLang][key];
    // }
    if (this._translations[this.wtStorageService.selected_lang] && this._translations[this.wtStorageService.selected_lang][key]) {
      return this._translations[this.wtStorageService.selected_lang][key];
    }

    return translation;
  }

  instant(key: string) {
    // call translation
    return this.translate(key);
  }

  isCurrentLang(lang: string) {
    // check if the selected lang is current lang
    // return lang === this.currentLang;
    return lang === this.wtStorageService.selected_lang;

  }

  selectLang(lang: string) {
    // set current lang;
    this.use(lang);
    this.refreshText();
  }

  refreshText() {
    // refresh translation when language change
    this.translatedText = this.instant('hello world');
  }
}
