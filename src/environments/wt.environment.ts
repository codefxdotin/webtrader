export const WT_CONFIG = {
  // CRM_BASE_URL: 'https://bbv2qaapi.c64f.com',
  // BO_BASE_URL: 'https://boapi.c64f.com:9012',
  // BO_DEMO_BASE_URL: 'https://boapi.c64f.com:9012',
  // FOX_BASE_URL: 'https://foxwtapi.c64f.com:59004',
  CRM_BASE_URL: 'https://portal.swisstrade.io',
  BO_BASE_URL: 'https://wtbo.swisstrade.io:26999',
  BO_DEMO_BASE_URL: 'https://wtbo.swisstrade.io:26999',
  FOX_BASE_URL: 'https://foxwtapi.c64f.com:59004',

  TERMS_CONDITIONS_EN: 'https://s3.ap-northeast-2.amazonaws.com/blackbuckv2-frontend/US-FXCRM-MT4-DEMO/broctagon/assets/registerTermsAndServices/Microfox+TOS.pdf',
  TERMS_CONDITIONS_ZH: 'https://s3.ap-northeast-2.amazonaws.com/blackbuckv2-frontend/US-FXCRM-MT4-DEMO/broctagon/assets/registerTermsAndServices/Microfox+TOS(zh).pdf',
  TERMS_CONDITIONS_KO: 'https://s3.ap-northeast-2.amazonaws.com/blackbuckv2-frontend/US-FXCRM-MT4-DEMO/broctagon/assets/registerTermsAndServices/Microfox+TOS.pdf',
  TERMS_CONDITIONS_TH: 'https://s3.ap-northeast-2.amazonaws.com/blackbuckv2-frontend/US-FXCRM-MT4-DEMO/broctagon/assets/registerTermsAndServices/Microfox+TOS.pdf',
  TERMS_CONDITIONS_JP: 'https://s3.ap-northeast-2.amazonaws.com/blackbuckv2-frontend/US-FXCRM-MT4-DEMO/broctagon/assets/registerTermsAndServices/Microfox+TOS.pdf',
  TERMS_CONDITIONS_VI: 'https://s3.ap-northeast-2.amazonaws.com/blackbuckv2-frontend/US-FXCRM-MT4-DEMO/broctagon/assets/registerTermsAndServices/Microfox+TOS.pdf',

  dynamicCoachMark: true,
  getFoxAPI: false,
  s3BucketPath: "https://bbv2-qa-frontend.s3.ap-northeast-2.amazonaws.com/",


  ABOUT_US: 'https://bb-v2.c64f.com/',
  CRM_APP: 'https://bb-v2.c64f.com/',
  BRAND_NAME: 'CRM',
  LOGGING_BASE_URL: 'https://frontend-logging.broctagon.com:9343',
  SECRET_KEY: '1c3f945e-9f43-44d8-ae9a-a247ea385e1e',
  APP_TITLE: 'WebTrader',

    MERCHANT_KEY: "12345",
    DOMAIN: 'crm.broctagon.com',
    appType : 'web',


  REGISTER_URI: '/v2/register/short',
  DEPOSIT_URI: '/api/v2/deposit/gateways',
  WITHDRAWAL_URI: '/api/v2/withdraw/get-withdraw',
  REFRESH_URI: '/v2/refresh',
  HISTORY_URI: '/v2/reports/wt/trade/history?',
  HISTORY_ARCHIVE_URI: '/api/v2/mt4/archive-trade?',
  LOGIN_URI: '/api/v1/login',
  // LOGIN_URI: '/v2/webtrader/login',
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
  GA_TRACKING_CODE: '',
  liveChatLicenseId: 0,
  CrazyeggId: '',
  showLiveChatIntervalDesktop: 30000,
  showLiveChatIntervalMobile: 180000,
  csEmail: { csEmail: 'info@microfox.io' },
  mtVersion: {
    mtx: 'Trading Account'
  },
  languageIconMember: 'assets/images/globe-member.png',
  languageIconAdmin: 'assets/images/globe-member.png'
};
