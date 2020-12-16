

export const WT_CONFIG = {
  CRM_BASE_URL: 'https://bb-v2-backend.whale-inc.com',
  BO_BASE_URL: 'https://whaleswt.mt4.space:20999',
  BO_DEMO_BASE_URL: 'https://whaledemowt.mt4.space:23999',
  FOX_BASE_URL: 'https://whalefoxapi.mt4.space:8445',

  TERMS_CONDITIONS_EN: 'https://whale-prod-bbv2-frontend.s3.ap-northeast-2.amazonaws.com/assets/registerTermsAndServices/WHALE+TOS+(Eng).pdf',
  TERMS_CONDITIONS_ZH: 'https://whale-prod-bbv2-frontend.s3.ap-northeast-2.amazonaws.com/assets/registerTermsAndServices/WHALE+TOS+(Chi).pdf',
  TERMS_CONDITIONS_KO: 'https://whale-prod-bbv2-frontend.s3.ap-northeast-2.amazonaws.com/assets/registerTermsAndServices/WHALE+TOS+(Chi).pdf',
  TERMS_CONDITIONS_TH: 'https://whale-prod-bbv2-frontend.s3.ap-northeast-2.amazonaws.com/assets/registerTermsAndServices/WHALE+TOS+(Chi).pdf',
  TERMS_CONDITIONS_JP: 'https://whale-prod-bbv2-frontend.s3.ap-northeast-2.amazonaws.com/assets/registerTermsAndServices/WHALE+TOS+(Chi).pdf',
  TERMS_CONDITIONS_VI: 'https://whale-prod-bbv2-frontend.s3.ap-northeast-2.amazonaws.com/assets/registerTermsAndServices/WHALE+TOS+(Chi).pdf',



  dynamicCoachMark: true,
  getFoxAPI: false,
  s3BucketPath: "https://whale-prod-bbv2-frontend.s3.ap-northeast-2.amazonaws.com/",



  ABOUT_US: 'https://whale-inc.com/about/about-whale/',
  CRM_APP: 'https://my.whale-inc.com',
  BRAND_NAME: 'myWhale',
  LOGGING_BASE_URL: 'https://frontend-logging.broctagon.com:9343',
  SECRET_KEY: '1c3f945e-9f43-44d8-ae9a-a247ea385e1e',
  APP_TITLE: 'Countdown',

  MERCHANT_KEY: '12345',
  DOMAIN: 'crm.broctagon.com',
  appType: 'web',


  REGISTER_URI: '/v2/register/short',
  DEPOSIT_URI: '/api/v2/deposit/gateways',
  WITHDRAWAL_URI: '/api/v2/withdraw/get-withdraw',
  REFRESH_URI: '/v2/refresh',
  HISTORY_URI: '/v2/reports/wt/trade/history?',
  HISTORY_ARCHIVE_URI: '/api/v2/mt4/archive-trade?',
  // LOGIN_URI: '/v2/login',
  LOGIN_URI: '/v2/webtrader/login',
  LOGOUT_URI: '/v2/logout',
  FORGOT_PSWRD_URI: '/v2/resetpassword',
  USER_PROFILE: '/v2/member/profile',
  APP_CONFIG_URI: '/api/v2/app-config',
  UPDATE_TOKEN: '/api/v2/update-token',
  DEPOSIT_UPLOAD_URI: '/api/deposit/upload',
  DEPOSIT_CARD_URI: '/api/deposit/card',
  WITHDRAWAL_WT_URI: '/api/withdrawal',
  VALIDATE_PROMOCODE_URI: '/v2/validate/promoCode?',
  VERIFY_URI: '/v2/verify',
  LOGIN_URI_TOKEN: '/v2/wt/validate',
  // LOGIN_URI_TEMP_TOKEN: '/v2/check-key',
  LOGIN_URI_TEMP_TOKEN: '/v2/wt/validate',
  LOGIN_COACHMARK: '/v2/wt/coachmarks',
  FOX_BALANCE_URI: '/api/user/Balance/',

  FOX_LOGIN_URI: '/api/auth',
  FOX_LOGOUT_URI: '/api/logout',
  FOX_HISTORY_URI: '/api/mt4/TradeL?',
  FOX_HISTORY_ARCHIVE_URI: '/api/mt4/archive-tradeL?',
  FOX_REFRESH_URI: '/v2/refresh',


  IMAGE_ROOT: '',
  GA_TRACKING_CODE: 'UA-123757204-14',
  liveChatLicenseId: 7181031,
  CrazyeggId: '',
  showLiveChatIntervalDesktop: 30000,
  showLiveChatIntervalMobile: 180000,
  csEmail: { csEmail: 'info@whale-inc.com' },
  mtVersion: {
    mtx: 'MT4'
  },
  languageIconMember: 'assets/images/globe-member.png',
  languageIconAdmin: 'assets/images/globe-member.png'
};