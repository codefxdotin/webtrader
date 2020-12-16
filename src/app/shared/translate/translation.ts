import {InjectionToken} from '@angular/core';

// import translations
import {LANG_EN_NAME, LANG_EN_TRANS} from './lang-en';
import {LANG_ZH_NAME, LANG_ZH_TRANS} from './lang-zh';
import {LANG_TH_NAME, LANG_TH_TRANS} from './lang-th';
import {LANG_VI_NAME, LANG_VI_TRANS} from './lang-vi';
import {LANG_KO_NAME, LANG_KO_TRANS} from './lang-ko';
import {LANG_JP_NAME, LANG_JP_TRANS} from './lang-jp';
// translation token
export const TRANSLATIONS = new InjectionToken<any>('translations');

// all translations
export const dictionary: any = {};
dictionary[LANG_EN_NAME] = LANG_EN_TRANS;
dictionary[LANG_ZH_NAME] = LANG_ZH_TRANS;
dictionary[LANG_TH_NAME] = LANG_TH_TRANS;
dictionary[LANG_VI_NAME] = LANG_VI_TRANS;
dictionary[LANG_KO_NAME] = LANG_KO_TRANS;
dictionary[LANG_JP_NAME] = LANG_JP_TRANS;
// providers
export const TRANSLATION_PROVIDERS = [
  {provide: TRANSLATIONS, useValue: dictionary},
];
