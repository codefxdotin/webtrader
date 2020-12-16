export const WT_CONFIG = {
  CRM_BASE_URL: 'https://bbv2-backend.tianyufinance.com/',
  BO_BASE_URL: 'https://tywt.mt4.space:21996',
  BO_DEMO_BASE_URL: 'https://tywt.mt4.space:21996',
  FOX_BASE_URL: '',

  TERMS_CONDITIONS_EN: 'https://bbv2-tianyu-prod-frontend.s3.ap-east-1.amazonaws.com/assets/registerTermsAndServices/TianYu.pdf',
  TERMS_CONDITIONS_ZH: 'https://bbv2-tianyu-prod-frontend.s3.ap-east-1.amazonaws.com/assets/registerTermsAndServices/TianYu.pdf',
  TERMS_CONDITIONS_KO: 'https://bbv2-tianyu-prod-frontend.s3.ap-east-1.amazonaws.com/assets/registerTermsAndServices/TianYu.pdf',
  TERMS_CONDITIONS_TH: 'https://bbv2-tianyu-prod-frontend.s3.ap-east-1.amazonaws.com/assets/registerTermsAndServices/TianYu.pdf',
  TERMS_CONDITIONS_JP: 'https://bbv2-tianyu-prod-frontend.s3.ap-east-1.amazonaws.com/assets/registerTermsAndServices/TianYu.pdf',
  TERMS_CONDITIONS_VI: 'https://bbv2-tianyu-prod-frontend.s3.ap-east-1.amazonaws.com/assets/registerTermsAndServices/TianYu.pdf',



  dynamicCoachMark: true,
  getFoxAPI: false,
  s3BucketPath: "https://bbv2-tianyu-prod-frontend.s3.ap-east-1.amazonaws.com/",




  ABOUT_US: 'https://my.tianyufinance.com',
  CRM_APP: 'https://my.tianyufinance.com',
  BRAND_NAME: 'tianyu',
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
  GA_TRACKING_CODE: '0',
  liveChatLicenseId: 0,
  CrazyeggId: '',
  showLiveChatIntervalDesktop: 30000,
  showLiveChatIntervalMobile: 180000,
  csEmail: { csEmail: '2582342457@qq.com' },
  mtVersion: {
    mtx: 'MT4'
  },
  languageIconMember: 'assets/images/globe-member.png',
  languageIconAdmin: 'assets/images/globe-member.png'
};