
import {fromEvent,  Observable ,  timer, merge, of } from 'rxjs';
import { map } from 'rxjs/operators';
/* To handle DST changes time Constants.DefaultTimeZone time is used to calculate time.
 * However there is an issue with time conversion at BOAPI end. When DST is on, offset is not changed to +300,
 * in the response what we get. Hence if DST is on subtracting 1hr i.e., 3600000 from time, to display proper time in
 * highchart.
 */
import { Component, ViewChild, HostListener, ElementRef, OnInit, AfterViewInit, AfterViewChecked, Renderer2, OnDestroy } from '@angular/core';
// import '../../../node_modules/intl/locale-data/jsonp/en.js';
import { NgbModal, NgbModalOptions, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { Idle, DEFAULT_INTERRUPTSOURCES } from '@ng-idle/core';
import { Router, ActivatedRoute } from '@angular/router';
import { DeviceDetectorService } from 'ngx-device-detector';
import * as moment from 'moment-timezone';
import swal from 'sweetalert2';
import { PerfectScrollbarComponent } from 'ngx-perfect-scrollbar';
import { PricehubService } from './shared/pricehub.service';
import { TradeshubService } from './shared/tradeshub.service';
import { TradeService } from './shared/trade.service';
import { ChartComponent } from './chart/chart.component';
import { OpenTradesComponent } from './openTrades/open-trades.component';
import { TradeHistoryComponent } from './history/history.component';
import { IndicatorsComponent } from './indicators/indicators.component';
import { IndicatorService } from './indicators/indicator.service';
import { WTStorageService } from '../shared/service/wt-storage.service';
import { WTUtilService } from '../shared/service/wt-util.service';
import { TranslatePipe } from '../shared/translate/translate.pipe';
import { DepositComponent } from '../shared/deposit/deposit.component';
import { WithdrawalComponent } from '../shared/withdrawal/withdrawal.component';
import { MT4AuthenticateComponent } from '../shared/mt4-authenticate/mt4-authenticate.component';
import { CustomSearchPipe } from '../shared/pipes/search-filter.pipe';
import { OnlyNumber } from '../shared/directives/onlynumber.directive';
import { WTCrmService } from '../shared/service/wt-crm.service';
import { ObjKeysLengthPipe } from '../shared/pipes/jsonobj-keys-length.pipe';
import { OrientationComponent } from '../shared/orientation/orientation.component';
import { UserProfileComponent } from '../shared/user-profile/user-profile.component';
import { IndicatorsStorageService } from '../shared/indicators/indicators-storage.service';
import { TranslateService } from '../shared/translate/translate.service';
import { LoginService } from '../login/shared/login.service';
import * as environment from '../../environments/wt.environment';
import { DomSanitizer } from '@angular/platform-browser';
import { WTSignalrService } from '../shared/service/wt-signalr.service';
import { Mt4LoginService } from '../shared/mt4-authenticate/mt4-authenticate.service';
import { Constants } from '../shared/config/constants';
import cacheBusting from '../../cache-busting/cache-busting.json';

declare var Highcharts: any;
declare var gtag: any;
const noop = () => { };
var hasOwnProperty: any = Object.prototype.hasOwnProperty;
declare var hopscotch: any;
declare var require: any;
/**
 * This class represents the lazy loaded TradeComponent.
 */
@Component({
	moduleId: module.id,
	selector: 'sd-about',
	templateUrl: 'trade.component.html',
	styleUrls: ['trade.component.scss'],
	host: {
		'(window:resize)': 'onResize($event)'
	}
})

export class TradeComponent implements OnInit, AfterViewInit, AfterViewChecked, OnDestroy {

	@ViewChild('chart', { static: true }) chartComponent: ChartComponent;
	@ViewChild('openTrade', { static: true }) openTradesComponent: OpenTradesComponent;
	@ViewChild('tradeHistory', { static: true }) tradeHistoryComponent: TradeHistoryComponent;
	@ViewChild('indicators', { static: true }) indicatorsComponent: IndicatorsComponent;
	@ViewChild('divtradescreen', { static: true }) tradeScreenDiv: any;
	@ViewChild('extendSession', { static: true }) extendSession: ElementRef;
	@ViewChild('depositRef', { static: true }) depositRef: ElementRef;
	@ViewChild('referralRef', { static: true }) referralRef: ElementRef;
	@ViewChild('fullscreenRef', { static: true }) fullscreenRef: ElementRef;
	@ViewChild('fileInput', { static: true }) fileInput: ElementRef;
	lang: string = localStorage.getItem('lanGuage');
	brandName = environment.WT_CONFIG.BRAND_NAME;
	licenseId: number;
	group = 13;
	currentPrice: string;
	date: string;
	configuration: any;
	accountInfo: any;
	profileData: any;
	userAvatar: any;
	userName: any;
	chart: any;
	chartData: Array<any>;
	chartTab: any = [];
	dropDowns: any = {};
	hasDemo: any;
	intervalList: any = [];
	isFavListEmpty: boolean = true;
	symbolConfiguration: any;
	favorites: any;
	selectedSymConfig: any = [];
	selectedChartIndex: any = -1;
	favCount: any = 0;
	selectedChart: any;
	trade: Object;
	removeIndex: any = 0;
	tradeAmount: number;
	maxAmountFlag: boolean = false;
	tradeAction: any;
	profit: number;
	tradeUpdate: any;
	totalExpAmount: number;
	openPositions: number = 0;
	currencySymbolPadding: number = 34;
	amountIpWidth: number = 50;
	searchInput: any;
	statusDescription: string = '';
	chartLoaded: boolean = false;
	showFSbutton: boolean = false;
	// fullScrView : boolean = false;
	initLoad: boolean = false;
	// isPortraitMode: boolean = false;
	isLoggingOut: boolean = false;
	accountSwitch: boolean = false;
	countryName: any;
	showCal: boolean = false;
	modalOption: NgbModalOptions = {
		backdrop: 'static',
		keyboard: false,
		windowClass: 'fadeInDown animated md',
		container: '#body_full_screen'
	};
	tradeValidate: boolean = false;
	crmToken: any;
	lastRecordDate: string;
	lastReqRecordDate: string;
	isSymbolLoaded: boolean = false;
	isMt4Switched: boolean = false;
	disableClose: boolean = false;
	secLeft: number = 60;
	orientationModalRef: any;
	orientationModalOpened: boolean = false;
	crmLogin: string;
	device: any;
	isMobileDevice: boolean = false;
	private oldLabelVal: any;
	private loadIndicator = true;
	private addPlot: boolean = false;
	private labelText: any;
	private sessionExtendDialog: NgbModalRef;
	private timer: any;
	private chartContainerWidth: any;
	public isConnected: Observable<boolean>;
	// private isHidden: Observable<any>;
	private ignoreHashChange: boolean = false;
	private preAmount: number;
	private withdrawUrl = this.crmLogin;
	openDepositRef: any;
	openReferralRef: any;
	openFullscreenRef: any;
	referralData: any;
	imageData: any;
	mt4Account: any;
	affiliateLinkEnglish: any;
	affiliateLinkChinese: any;
	affiliateLinkThai: any;
	affiliateLinkVietnamese: any;
	affiliateLinkKorean: any;
	facebookReferral: any;
	sinaReferral: any;
	whatsappReferral: any;
	countryFlagUrl = 'assets/images/us-flag.jpg?v=' + cacheBusting['us-flag.jpg'];
	languageIcon = environment.WT_CONFIG.languageIconMember + '?v=' + cacheBusting['globe-member.png'];
	isDocumentLoaded = false;
	inFullScreenMode = false;
	windowHeight: number;
	headerWrapperHeight: number;
	languages;
	activeLang = "";
	getBalanceByFoxAPI = environment.WT_CONFIG.getFoxAPI;
	demoSelected = false;
	staticLink = environment.WT_CONFIG.CRM_APP;
	disableTradeButtons = false;
	dynamicCoachMark = environment.WT_CONFIG.dynamicCoachMark;
	interval;
	zoomMobile = false;
	headerWrapperWidth: any;
	singleApi = environment.WT_CONFIG.getFoxAPI;
	tradeActive = false;
	demoAccountAvail = false;
	refLink: any;
	resetCandles = true;
	openTradesList: Array<any> = [];
	cacheBusting = cacheBusting;
	version = require("../../../package.json").releaseVersion;
	currentTime;
	scrollbarOptions = { axis: 'y', theme: 'inset' };

	constructor(private tradeshubService: TradeshubService,
		private tradeService: TradeService,
		private pricehubService: PricehubService,
		private modalService: NgbModal,
		private wtCrmService: WTCrmService,
		private router: Router,
		private idle: Idle,
		public wtStorageService: WTStorageService,
		public translateService: TranslateService,
		public wtUtilService: WTUtilService,
		private wtSignalrService: WTSignalrService,
		private indicatorStorage: IndicatorsStorageService,
		private indicatorService: IndicatorService,
		private deviceService: DeviceDetectorService,
		private loginService: LoginService,
		private mt4loginservice: Mt4LoginService,
		private renderer: Renderer2, private sanitizer: DomSanitizer,
		private activatedRoute: ActivatedRoute) {
		// this.languages = environment.WT_CONFIG.languages;
		this.hasDemo = this.wtStorageService.hasDemo;

		this.activatedRoute.queryParams.subscribe(params => {
			this.activeLang = params['lang'];
		});
		
		/* setInterval(() => {
			this.tradeshubService.getOpenTrades().subscribe(
				(openTrades: any) => {
					if (openTrades.trades && openTrades.trades.length > 0) {
						for (var i = 0; i < openTrades.trades.length; i++) {
							if (!openTrades.trades[i].closeTime) {
								// console.log(true);
								this.tradeActive = true;
								return;
							}
						}
					}
					this.tradeActive = false;
				}
			);
		}, 300); */
		
		// Calls on page refresh				
		this.tradeshubService.getOpenTrades().subscribe((openTrades: any) => {
			//console.log("on page refresh in trade page");
			this.openTradesList = openTrades.trades;
			this.activeTrades(this.openTradesList);
		});

		// Calls on new trade
		this.tradeshubService.getTradeUpdate().subscribe((openTrade: any) => {
			//console.log("on new trade or update in trade page");
			if (openTrade.trade) {
				if (openTrade.trade.closeTime == null) {
					this.openTradesList.push(openTrade.trade);
				} else {
					for (var i = 0; i < this.openTradesList.length; i++) {
						if (this.openTradesList[i].id == openTrade.trade.id) {
							// this.openTradesList[i] = openTrade.trade;
							// dont set whole object otherwise it will affect timmer panel
							this.openTradesList[i].closeTime = openTrade.trade.closeTime;
						}
					}
				}
				this.activeTrades(this.openTradesList);
			}
		});

		// if ( window.localStorage ) {
		// 	if ( !localStorage.getItem('firstLoad') ) {
		// 		localStorage['firstLoad'] = true;
		// 		window.location.reload();
		// 	} else {
		// 		localStorage.removeItem('firstLoad');
		// 	}
		// }


		// let demo = sessionStorage.getItem('demo');
		// if(this.wtStorageService.selectedMt4Account && this.wtStorageService.selectedMt4Account.demo) {
		// 	this.mt4loginservice.mt4DemoAuthUserUsingToken(this.wtStorageService.selectedMt4Account.accountId)
		// 	.subscribe(
		// 		(data: any) => {
		// 			this.wtStorageService.mt4AccountsList.forEach(
		// 				(mt4Account: any) => {
		// 						mt4Account['accessToken'] = data['access_token'];
		// 				});
		// 				this.wtStorageService.selectedMt4Account.accessToken = data['access_token'];
		// 				sessionStorage.setItem('mt4AccountList', JSON.stringify(this.wtStorageService.mt4AccountsList));
		// 				sessionStorage.setItem('mt4Account', JSON.stringify(this.wtStorageService.selectedMt4Account));
		// 		},
		// 		(err: any) => {
		// 		});
		// } else {
		// 	this.mt4loginservice.mt4AuthUserUsingToken()
		// .subscribe(
		// 	(data: any) => {
		// 		this.wtStorageService.mt4AccountsList.forEach(
		// 			(mt4Account: any) => {
		// 					mt4Account['accessToken'] = data['access_token'];
		// 			});

		// 			this.wtStorageService.selectedMt4Account.accessToken = data['access_token'];
		// 			sessionStorage.setItem('mt4AccountList', JSON.stringify(this.wtStorageService.mt4AccountsList));
		// 			sessionStorage.setItem('mt4Account', JSON.stringify(this.wtStorageService.selectedMt4Account));

		// 	},
		// 	(err: any) => {
		// 	});
		// }



		// this.getCountryList();
		this.renderer.addClass(document.body, 'webtrader-chart');
		let self = this;
		this.licenseId = environment.WT_CONFIG.liveChatLicenseId;
		this.wtStorageService.deviceInfo = this.deviceService.getDeviceInfo();
		this.device = this.wtStorageService.deviceInfo && this.wtStorageService.deviceInfo.device || null;
		if (this.device === "android"
			|| this.device === "iphone"
			|| (window.innerHeight > window.innerWidth && window.innerWidth < 767)) {
			this.isMobileDevice = true;
		}
		window.addEventListener("orientationchange", function () {
			self.applyOrientation();
		}, false);
		this.applyOrientation();
		this.showFSbutton = this.wtStorageService.deviceInfo.device === "android";


		// this.tradeService.getAppConfig()
		// 	.subscribe((data: any) => {
		// 	},
		// 	(err: any) => {

		// 	})
		this.isConnected = merge(
			of(navigator.onLine),
			fromEvent(window, 'online').pipe(map(() => true)),
			fromEvent(window, 'offline').pipe(map(() => false)));
		// this.isHidden = fromEvent(document, 'visibilitychange').pipe(map(() => document.visibilityState));
		this.selectedSymConfig.winPayout = 0;
		this.tradeAmount = 0;
		this.preAmount = 0;
		this.wtStorageService.selectedSymbol = 'Symbols';
		this.selectedSymConfig.interval = 0;
		this.isConnected.subscribe((data: any) => {
			if (data == false) {
				swal({
					html: `<span style="color:#ffffff">${(new TranslatePipe(this.translateService))
						.transform("Internet_connection_is_lost_Reconnecting")}<span>`,
					width: 400,
					allowOutsideClick: false,
					allowEscapeKey: false,
					background: '#030608 url(./assets/images/trade-dropdown-bg.jpg) 100% 100% no-repeat',
					showConfirmButton: false,
					target: '#body_full_screen'
				});
			} else if (data == true) {
				swal.close();
				if (this.wtStorageService.selectedSymbol !== 'Symbols') {
					this.fetchOldPrice();
					this.indicatorStorage.resetIndicatorStorage();
				}
			}
		});
		/* this.isHidden.subscribe((data: any) => {
			if (document.hidden) {
				this.pricehubService.stopPricesHub();
				this.tradeshubService.stopTradesHub();
			} else {
				this.pricehubService.startPricesHub();
				this.tradeshubService.startTradesHub();
				if (this.wtStorageService.selectedSymbol !== 'Symbols') {
					this.fetchOldPrice();
					this.indicatorStorage.resetIndicatorStorage();
				}
			}
		}); */
		this.crmLogin = this.staticLink;
		this.withdrawUrl = this.crmLogin + '/member/withdrawfund' + '?id=' + this.wtStorageService.crmToken;
		this.dropDowns = {
			closeSymSel: true,
			indicSel: true,
			calcSel: true
		}
		// // sets an idle timeout of 14min.
		// idle.setIdle(864000);
		// // sets a timeout period of 60 seconds. after 15min of inactivity, the user will be considered timed out.
		// idle.setTimeout(864000);
		// // sets the default interrupts, in this case, things like clicks, scrolls, touches to the document
		// idle.setInterrupts(DEFAULT_INTERRUPTSOURCES);

		// idle.onIdleEnd.subscribe(() => {
		// 	if (this.sessionExtendDialog) this.sessionExtendDialog.dismiss('closing');
		// 	this.secLeft = 60;
		// 	this.idle.watch();
		// });
		// idle.onTimeout.subscribe(() => {
		// 	this.sessionExtendDialog.dismiss('closing');
		// 	this.secLeft = 60;
		// 	//this.logOut();
		// });
		// idle.onIdleStart.subscribe(() => noop);
		// idle.onTimeoutWarning.subscribe(() => {
		// 	if (this.secLeft == 60) {
		// 		this.sessionExtendDialog = this.modalService.open(this.extendSession, { backdrop: 'static', windowClass: 'md', keyboard: false, container: '#body_full_screen' });
		// 	}
		// 	if (this.secLeft > 0) this.secLeft--;
		// });

		this.pricehubService.getPrice()
			.subscribe(
				(data: any) => {
					this.newPriceUpdate(data);
				});
		// setInterval(() => {
		// 	this.date = moment(moment().tz(Constants.DefaultTimeZone).valueOf() + this.wtStorageService.offsetValue).tz(Constants.DefaultTimeZone).format('DD-MMM-YYYY hh:mm:ss');
		// }, 1000);
		this.tradeshubService.getConfiguration().subscribe(
			(config: any) => {
				this.configuration = config;
				if (this.configuration.payoutConfigurations && this.configuration.payoutConfigurations.length > 0) {
					this.isSymbolLoaded = false;
					this.generateSymbolList();
					this.setFavorites(this.wtStorageService.selectedMt4Account.accountId);
					this.setCharts(this.wtStorageService.selectedMt4Account.accountId);
					let symbolName = null;
					let selectedSymbFound = false;
					let securityName = null;
					if (this.chart) {
						if (this.symbolConfiguration) {
							for (let security in this.symbolConfiguration) {
								for (let symbol in this.symbolConfiguration[security]) {
									if (this.symbolConfiguration[security][symbol].length > 0 && !selectedSymbFound) {
										if (!symbolName) {
											symbolName = symbol;
											securityName = security;
											if (!this.selectedChart) break;
										}
										if (this.selectedChart && this.selectedChart.symbol === symbol) {
											selectedSymbFound = true;
											symbolName = symbol;
											securityName = security;
											break;
										}
									}
								};
							}
							if (this.selectedChart && selectedSymbFound) {
								if ((!this.initLoad || this.accountSwitch || this.selectedChart.symbol !== this.wtStorageService.selectedSymbol)
									&& (this.selectedChart.timeFrame.toLowerCase() !== this.wtStorageService.selectedTimeFrame)) {
									this.wtStorageService.selectedTimeFrame = this.selectedChart.timeFrame.toLowerCase();
									if (this.symbolConfiguration.constructor === Object && Object.keys(this.symbolConfiguration).length !== 0) {
										this.changeSymbol(this.selectedChart.symbol, this.symbolConfiguration[securityName][this.selectedChart.symbol], false);
									}
								} else if (this.wtStorageService.selectedSymbol !== 'Symbols') {
									this.intervalList = this.symbolConfiguration[securityName][this.wtStorageService.selectedSymbol]
									// this.selectedSymConfig = this.clone(this.intervalList[0]);
									this.accountSwitch = false;
								} else {
									this.wtStorageService.selectedSymbol = symbolName;
									this.wtStorageService.selectedTimeFrame = this.wtStorageService.defaultTimeFrame;
									this.changeSymbol(this.wtStorageService.selectedSymbol, this.symbolConfiguration[securityName][this.wtStorageService.selectedSymbol], false);
								}
							} else {
								this.wtStorageService.selectedSymbol = symbolName;
								this.wtStorageService.selectedTimeFrame = this.wtStorageService.defaultTimeFrame;
								this.changeSymbol(this.wtStorageService.selectedSymbol, this.symbolConfiguration[securityName][this.wtStorageService.selectedSymbol], false);
							}
						};
						//	this.fetchOldPrice();
					}
				} else {
					this.chartLoaded = true;
					this.initLoad = true;
					this.accountSwitch = false;
					this.isSymbolLoaded = true;
					if (typeof this.configuration.payoutConfigurations !== 'undefined') {
						this.symbolConfiguration = { symbols: {} };
						this.showErrorMessage('Trade_No_Symbols_Found');
					}
				}
			}
		);
		this.tradeshubService.getAccountInfoUpdate().subscribe(
			(accntInfo: any) => {
				this.accountInfo = accntInfo;
			}
		);
		this.tradeshubService.getSendTradeStatus().subscribe(
			(sendTradeStatus: any) => {
				if (sendTradeStatus.status != undefined && sendTradeStatus.status == 134) {
					this.statusDescription = (new TranslatePipe(this.translateService)).transform("Trade_Insufficient_Account_Balance");
				} else if (sendTradeStatus.status != undefined && sendTradeStatus.status == 148) {
					this.statusDescription = (new TranslatePipe(this.translateService)).transform("Trade_Too_many_orders");
				} else if (sendTradeStatus.status != undefined && sendTradeStatus.status == 132) {
					this.statusDescription = (new TranslatePipe(this.translateService)).transform("Trade_Market_is_closed");
				} else if (sendTradeStatus.status != undefined && sendTradeStatus.status == 3.0) {
					this.statusDescription = (new TranslatePipe(this.translateService)).transform("Trade_Invalid_parameters");
				} else if (sendTradeStatus.status != undefined && sendTradeStatus.status == -100) {
					this.statusDescription = (new TranslatePipe(this.translateService)).transform("Trade_Submit_order_failure");
				} else if (sendTradeStatus.status != undefined && sendTradeStatus.status == 131) {
					this.statusDescription = (new TranslatePipe(this.translateService)).transform("Trade_Invalid_Amount");
				} else if (sendTradeStatus.status != undefined && sendTradeStatus.status == -1) {
					this.statusDescription = (new TranslatePipe(this.translateService)).transform("Trade_Submit_order_failure");
				} else if (sendTradeStatus.status != undefined && sendTradeStatus.status == 64) {
					this.statusDescription = (new TranslatePipe(this.translateService)).transform("Trade_Account_Inactive");
				} else if (sendTradeStatus.status != undefined && sendTradeStatus.status == 149) {
					this.statusDescription = (new TranslatePipe(this.translateService)).transform("Trade_Hedge_Prohibited");
				} else if (sendTradeStatus.status != undefined && sendTradeStatus.status == 136) {
					this.statusDescription = (new TranslatePipe(this.translateService)).transform("Trade_Submit_order_failure");
				} else {
					this.statusDescription = (new TranslatePipe(this.translateService)).transform("Trade_Submit_order_failure");
				}
				if (sendTradeStatus.status != undefined && sendTradeStatus.status == 0) {
					this.openTradesComponent.showOpenTrades = false;
					this.isShowOpenTrade();
					swal({
						html: `<i style="color:#ffffff;">${(new TranslatePipe(this.translateService))
							.transform("Trade_Order_placed_successfully")}</i>`,
						timer: 1000,
						width: 300,
						padding: 20,
						background: '#030608 url(./assets/images/trade-dropdown-bg.jpg) 100% 100% no-repeat',
						showConfirmButton: false,
						target: '#body_full_screen'
					})
				} else if (sendTradeStatus.status != undefined && sendTradeStatus.status != 0) {
					swal({
						html: '<i style="color:#ffffff;">' + this.statusDescription + '</i> ',
						timer: 1000,
						width: 300,
						padding: 20,
						background: '#954553 url(./assets/images/trade-dropdown-bg.jpg) 100% 100% no-repeat',
						showConfirmButton: false,
						target: '#body_full_screen'
					}
					);
				}
				setTimeout(() => {
					this.disableTradeButtons = false;
					document.getElementsByClassName("item-high")[0].setAttribute("id", "");
					document.getElementsByClassName("item-low")[0].setAttribute("id", "");
				}, 2000);
			}
		);
		this.tradeshubService.getTradeUpdate().subscribe(
			(tradeUpdate: any) => {
				this.tradeUpdate = tradeUpdate;
				if (this.tradeUpdate && this.tradeUpdate.accountInfo)
					this.accountInfo.balance = this.tradeUpdate.accountInfo.balance;


			}
		);
		// this.tradeshubService.getSignalrStatus().subscribe(
		// 	(signalrStatus:any) => {
		// 		if(signalrStatus == "Internet connection is slow"){
		// 			swal({
		// 					text:`<span style="color:#ffffff">${(new TranslatePipe(this.translateService))
		// 								.transform("Internet_connection_is_slow")}<span>`,
		// 					timer:2000,
		// 					width: 400,
		// 					background: '#030608 url(./assets/images/trade-dropdown-bg.jpg) 100% 100% no-repeat',
		// 					showConfirmButton:false
		// 				});
		// 		}
		// 		else if(signalrStatus == "Internet connection is lost. Reconnecting....") {
		// 			swal({
		// 					text:`<span style="color:#ffffff">${(new TranslatePipe(this.translateService))
		// 								.transform("Internet_connection_is_lost_Reconnecting")}<span>`,
		// 					width: 400,
		// 					allowOutsideClick: false,
		// 					allowEscapeKey :false,
		// 					background: '#030608 url(./assets/images/trade-dropdown-bg.jpg) 100% 100% no-repeat',
		// 					showConfirmButton:false
		// 				});
		// 			swal.disableButtons();
		// 		}
		// 		else if(signalrStatus == "Connecting...."){
		// 			swal({
		// 					text:`<span style="color:#ffffff">${(new TranslatePipe(this.translateService))
		// 								.transform("Connecting")}<span>`,
		// 					width: 400,
		// 					allowOutsideClick: false,
		// 					allowEscapeKey :false,
		// 					background: '#030608 url(./assets/images/trade-dropdown-bg.jpg) 100% 100% no-repeat',
		// 					showConfirmButton:false
		// 				});
		// 			swal.disableButtons();
		// 		}else if (signalrStatus == "Connection established."){
		// 			swal.close();
		// 		}
		// 	}
		// );
	}

	activeTrades(trades) {
		if (trades && trades.length > 0) {	
			for (var i = 0; i < trades.length; i++) {
				if (!trades[i].closeTime) {
					this.tradeActive = true;
					return;
				}
			}
		}
		this.tradeActive = false;
	}

	loadCoachMarks() {
		if (!this.dynamicCoachMark) {
			return;
		}

		if (!this.demoAccountAvail) {
			return;
		}

		var tourCoachMark;
		if (this.isMobileDevice && window.innerHeight > window.innerWidth) {
			console.log(this.isMobileDevice);
			tourCoachMark = {
				id: 'hello-hopscotch-' + Math.floor(Math.random() * Math.floor(100)),
				steps: [
					{
						target: 'mt4Dropdown',
						content: new TranslatePipe(this.translateService).transform('coachMarkStep1'),
						placement: 'bottom',
						arrowOffset: 10,
						yOffset: 0,
						xOffset: 10,
						showNextButton: true
					},
					{
						target: 'symbolTrading',
						content: new TranslatePipe(this.translateService).transform('coachMarkStep2'),
						placement: 'bottom',
						yOffset: -20
					},
					{
						target: 'timeFrame',
						placement: 'bottom',
						content: new TranslatePipe(this.translateService).transform('coachMarkStep3'),
						arrowOffset: 10,
						yOffset: 0,
						xOffset: 0

					},
					{
						target: 'amountDropdown',
						placement: 'bottom',
						content: new TranslatePipe(this.translateService).transform('coachMarkStep4'),
						arrowOffset: 50,
						yOffset: 0,
						xOffset: -50
					},
					{
						target: 'profitPercentage',
						placement: 'top',
						content: new TranslatePipe(this.translateService).transform('coachMarkStep5'),
						arrowOffset: 50,
						yOffset: 0,
						xOffset: 0
					},
					{
						target: 'predict',
						placement: 'top',
						content: new TranslatePipe(this.translateService).transform('coachMarkStep6'),
						arrowOffset: 50,
						yOffset: 0,
						xOffset: 0
					},
					{
						target: 'mt4Dropdown',
						placement: 'bottom',
						content: new TranslatePipe(this.translateService).transform('coachMarkStep7'),
						arrowOffset: 10,
						yOffset: 0,
						xOffset: 10
					}
				],
				showPrevButton: true,
				scrollTopMargin: 100,
				i18n: {
					nextBtn: new TranslatePipe(this.translateService).transform('next'),
					prevBtn: new TranslatePipe(this.translateService).transform('prev'),
					doneBtn: new TranslatePipe(this.translateService).transform('done'),
					skipBtn: new TranslatePipe(this.translateService).transform('skip'),
				},
			};
			hopscotch.startTour(tourCoachMark);
		}
		else {
			tourCoachMark = {
				id: 'hello-hopscotch-' + Math.floor(Math.random() * Math.floor(100)),
				steps: [
					{
						target: 'mt4Dropdown',
						content: new TranslatePipe(this.translateService).transform('coachMarkStep1'),
						placement: 'bottom',
						arrowOffset: 60,
						showNextButton: true,
					},
					{
						target: 'symbolTrading',
						content: new TranslatePipe(this.translateService).transform('coachMarkStep2'),
						placement: 'bottom',
						yOffset: -20
					},
					{
						target: 'timeFrame',
						placement: 'left',
						content: new TranslatePipe(this.translateService).transform('coachMarkStep3'),
						yOffset: -25,
						arrowOffset: 29

					},
					{
						target: 'amountDropdown',
						placement: 'left',
						content: new TranslatePipe(this.translateService).transform('coachMarkStep4'),
					},
					{
						target: 'profitPercentage',
						placement: 'left',
						content: new TranslatePipe(this.translateService).transform('coachMarkStep5'),
						arrowOffset: 0,
						// yOffset: -80
					},
					{
						target: 'predict',
						placement: 'top',
						content: new TranslatePipe(this.translateService).transform('coachMarkStep6'),
						arrowOffset: 90,
						yOffset: 0,
						xOffset: -100
					},
					{
						target: 'mt4Dropdown',
						placement: 'bottom',
						content: new TranslatePipe(this.translateService).transform('coachMarkStep7'),
					}
				],
				showPrevButton: true,
				scrollTopMargin: 100,
				i18n: {
					nextBtn: new TranslatePipe(this.translateService).transform('next'),
					prevBtn: new TranslatePipe(this.translateService).transform('prev'),
					doneBtn: new TranslatePipe(this.translateService).transform('done'),
					skipBtn: new TranslatePipe(this.translateService).transform('skip'),
				},
			};
			hopscotch.startTour(tourCoachMark);
		}

	}

	getLanguages(activeLang) {
		if (!this.singleApi) {
			this.loginService.getLanguages().subscribe((res) => {
				this.languages = this.loginService.processLanguage(res);
				for (var i = 0; i < this.languages.length; i++) {
					if (this.languages[i].code == localStorage.getItem('lanGuage')) {
						this.group = this.languages[i].group;
						var flagImageName = this.getFlagUrlName(this.languages[i].code);
						this.countryFlagUrl = this.languages[i].flagUrl + '?v=' + cacheBusting[flagImageName];
					}
					this.languages[i].referralLink = this.staticLink + '/affiliates/' + this.languages[i].id + '/' + this.wtStorageService.selectedMt4Account.accountId.loginId;
				}
			}, err => {
				console.log(err);
			});
		} else {
			let langArry: any = {}
			langArry = {
				"data": [
					{
						"id": "en",
						"name": "English",
						"translatedName": "English",
						"icon": "en.png",
						"default_lang": true
					},
					{
						"id": "zh",
						"name": "Chinese",
						"translatedName": "中文",
						"icon": "ch.png",
						"default_lang": false
					},
					{
						"id": "ko",
						"name": "Korean",
						"translatedName": "한국어",
						"icon": "ko.png",
						"default_lang": false
					}
				],
				"success": true,
				"error": {
					"key": null,
					"data": null
				}
			};
			this.languages = this.loginService.processLanguage(langArry);
			for (var i = 0; i < this.languages.length; i++) {
				if (this.languages[i].code == localStorage.getItem('lanGuage')) {
					this.group = this.languages[i].group;
					var flagImageName = this.getFlagUrlName(this.languages[i].code);
					this.countryFlagUrl = this.languages[i].flagUrl + '?v=' + cacheBusting[flagImageName];
				}
				this.languages[i].referralLink = this.staticLink + '/affiliates/' + this.languages[i].id + '/' + this.wtStorageService.selectedMt4Account.accountId.loginId;
			}
		}

	}

	ngOnInit() {
		
		this.demoAccountAvail = false;
		for (var i = 0; i < this.wtStorageService.mt4AccountsList.length; i++) {

			if (!isNaN(this.wtStorageService.mt4AccountsList[i].accountId)) {
				this.demoAccountAvail = true;
			}

		}
		// console.log(this.wtStorageService.mt4AccountsList);

		this.getDashboardInformation();
		this.getDashboardQRcode();
		this.getProfileInfo();
		this.heightManage();
		this.getLanguages(this.activeLang);
		if (window.innerHeight < window.innerWidth) {

			this.manageWidth();
		}
		else {
			this.headerWrapperWidth = window.innerWidth;
		}

		// if (localStorage.getItem('lanGuage') === 'zh') {
		// 	this.group = 13;
		// 	this.countryFlagUrl = 'assets/images/zh-flag.png';
		// } else if (localStorage.getItem('lanGuage') === 'en') {
		// 	this.countryFlagUrl = 'assets/images/us-flag.jpg';
		// 	this.group = 19;
		// } else if (localStorage.getItem('lanGuage') === 'th') {
		// 	this.countryFlagUrl = 'assets/images/th-flag.png';
		// 	// this.group = 19;
		// }




		const custom_variables = [
			{ name: environment.WT_CONFIG.mtVersion.mtx + 'ID', value: this.wtStorageService.selectedMt4Account.accountId },
			{ name: 'Email', value: this.wtStorageService.email },
			{ name: 'Name', value: this.wtStorageService.firstName + ' ' + this.wtStorageService.lastName },
			{ name: 'Preferred Language', value: this.translateService.currentLang() }
		];
		if (environment.WT_CONFIG.liveChatLicenseId) {
			const lcAPI = setInterval(() => {
				if (window['LC_API']) {
					window['LC_API'].set_custom_variables(custom_variables);
					clearInterval(lcAPI);
				}
			}, 3000);
		}

		// open referral popup after 15 mins

		// setTimeout(() => {
		// 	this.openReferral(this.referralRef);
		// }, 1 * 60 * 1000);



		// setTimeout(() => {
		//   if (this.accountInfo.balance === undefined || this.accountInfo.balance === null || this.accountInfo.balance <= 0) {
		//     this.openDeposit(this.depositRef);
		//   }
		// 	}, 30000);

		const refreshTokenTimer = timer(0,Constants.RefreshTokenInterval);
		refreshTokenTimer.subscribe(x => {
			this.loginService.refreshToken(this.wtStorageService.crmToken);
		});

		// setInterval(() => {
		// 	this.loginService.refreshToken(this.wtStorageService.crmToken);
		// }, 840000);

	}

	onResize(event) {
		if (window.innerHeight < window.innerWidth) {

			this.manageWidth();
		}
		else {
			this.headerWrapperWidth = window.innerWidth;
		}

		setTimeout(() => {
			this.heightManage();
		}, 200);

	}

	// getCountryList() {
	// 	this.loginService.getCountryList().subscribe(
	// 		res => {
	// 			if (res.success) {
	// 				res.data.forEach((element) => {
	// 					if (element['userCountry']) {
	// 						this.countryName = element['name'];
	// 						if (this.countryName) {
	// 							if (!(['China', 'Macao', 'Hong Kong', 'Taiwan'].includes(this.countryName))) {
	// 								this.wtUtilService.flipColors();
	// 								//   this.chartComponent.flipColors();
	// 							}
	// 						}
	// 					}
	// 				});
	// 			} else {
	// 				// this.utils.customErrorHandler(res);
	// 			}
	// 		}, err => {
	// 			// this.utils.httpErrorHandler(err);
	// 		});
	// }

	getProfileInfo() {
		if (this.wtStorageService.selectedMt4Account.accountId) {
			// this.userAvatar = this.sanitizer.bypassSecurityTrustUrl('data:image/jpeg;base64,' + this.wtStorageService.profileImage);
			// this.userName = this.wtStorageService.firstName;
		}
		this.userAvatar = this.sanitizer.bypassSecurityTrustUrl('data:image/jpeg;base64,' + localStorage.getItem('profileImage')
		);
		this.userName = localStorage.getItem('username');
	}

	closeDeposit() {
		// gtag('event', 'Deposit Closed', {
		//   eventCategory: 'Deposit Webtrader',
		//   eventAction: 'Deposit Closed',
		//   eventLabel: this.wtStorageService.email,
		//   eventValue: this.accountInfo.balance
		// });
		this.openDepositRef.close();
		this.openDepositRef = null;
	}

	closeReferral() {
		this.openReferralRef.close();
		this.openReferralRef = null;
	}

	closeFullscreen() {
		if (this.openFullscreenRef) {
			this.openFullscreenRef.close();
			this.openFullscreenRef = null;
		}
	}

	applyOrientation() {
		if (window.innerHeight > window.innerWidth || window.orientation === 0) {
			this.wtStorageService.isPortraitMode = true;
		} else {
			this.wtStorageService.isPortraitMode = false;
		}

		if (this.wtStorageService.isPortraitMode && this.isDocumentLoaded) {
			this.exitFS();
		} else if (this.wtStorageService.isPortraitMode == false && this.isDocumentLoaded) {
			//this.fileInput.nativeElement.click();
		}
	}
	ngAfterViewChecked() {
		if (this.chartContainerWidth != this.tradeScreenDiv.nativeElement.offsetWidth && this.chart) {
			this.chart.setSize();

		}
		this.chartContainerWidth = this.tradeScreenDiv.nativeElement.offsetWidth;



	}
	ngAfterViewInit() {

		
		// alert(sessionStorage.getItem('firstLogin') );

		// this.loadCoachMarks();
		if (sessionStorage.getItem('firstLogin') == 'true') {
			sessionStorage.setItem('demo', 'true');
			let mt4Account = this.wtStorageService.mt4AccountsList.find(t => t.demo == true);
			if (mt4Account) {
				this.changeMt4Account(mt4Account, 1);
			}
		}
		if (sessionStorage.getItem('demo') == 'true' && sessionStorage.getItem('firstLogin') == 'true') {
			this.demoSelected = true;
			this.loadCoachMarks();
			// setTimeout(function(){
			// 	sessionStorage.removeItem('firstLogin');
			// }, 5000);
			// sessionStorage.removeItem('firstLogin');
		}
		if (sessionStorage.getItem('demo') == 'true') {
			this.demoSelected = true;
		}

		let self = this;
		this.isDocumentLoaded = true;

		// if (this.device === "android" || this.device === "iphone") {
		window.onresize = function (event) {
			let document: any = window.document;
			if (!document.fullscreenElement &&
				!document.mozFullScreenElement &&
				!document.webkitFullscreenElement &&
				!document.msFullscreenElement) {
				self.applyOrientation();
			}
		}
		if (this.isMobileDevice === true) {
			//this.openFullscreen(this.fullscreenRef);
		}
		// this.applyOrientation();
		// }

		this.chart = this.chartComponent.getChart();

		// Storing settings in localstorage for the first time

		let settings = JSON.parse(localStorage.getItem('settings'));
		if (settings == null || !settings[this.wtStorageService.selectedMt4Account.accountId]) {
			let settings = {
				[this.wtStorageService.selectedMt4Account.accountId]:
					{ sound: this.wtStorageService.soundSetting, oneClick: this.wtStorageService.oneclickSetting }
			};
			localStorage.setItem('settings', JSON.stringify(settings));
		} else {
			this.wtStorageService.oneclickSetting = settings[this.wtStorageService.selectedMt4Account.accountId].oneClick;
			this.wtStorageService.soundSetting = settings[this.wtStorageService.selectedMt4Account.accountId].sound;
		}

		if (localStorage.getItem('lanGuage') != null) {
			this.wtStorageService.selected_lang = localStorage.getItem('lanGuage');
			this.translateService.selectLang(localStorage.getItem('lanGuage'));
		}

		if (localStorage.getItem('soundSetting') != null) {
			this.wtStorageService.soundSetting = JSON.parse(localStorage.getItem("soundSetting"));
		}

		if (localStorage.getItem('oneclickSetting') != null) {
			this.wtStorageService.oneclickSetting = JSON.parse(localStorage.getItem("oneclickSetting"));
		}

		let symbolName = null;
		let selectedSymbFound = false;
		let securityName = null;
		if (this.isSymbolLoaded) {
			for (let security in this.symbolConfiguration) {
				for (let symbol in this.symbolConfiguration[security]) {
					if (this.symbolConfiguration[security][symbol].length > 0 && !selectedSymbFound) {
						if (!symbolName) {
							symbolName = symbol;
							securityName = security;
							this.wtStorageService.selectedTimeFrame = this.wtStorageService.defaultTimeFrame;
							if (!this.selectedChart) break;
						}
						if (this.selectedChart && this.selectedChart.symbol === symbol) {
							selectedSymbFound = true;
							symbolName = symbol;
							securityName = security;
							this.wtStorageService.selectedTimeFrame = this.selectedChart.timeFrame.toLowerCase();
							break;
						}
					}
				};
			}
			if (symbolName) {
				this.changeSymbol(symbolName, this.symbolConfiguration[securityName][symbolName], false);
			}
		}
		Highcharts.addEvent(this.chart, 'redraw',
			(event: any) => {
				if (this.chart.xAxis) {
					let extremes = this.chart.xAxis[0].getExtremes();
					if (extremes && (extremes.min == extremes.dataMin || extremes.min < this.chart.series[0].xData[1]) && this.chartLoaded) {
						this.getMorePastData();
					}
				}
				this.alignCurrentPriceLabel();
				this.openTradesComponent.alignPlotlineLabel();
			}
		);
		Highcharts.addEvent(this.chart.xAxis[0], 'setExtremes',
			(event: any) => {
				this.alignCurrentPriceLabel();
				this.openTradesComponent.alignPlotlineLabel();
			}
		);
		this.idle.watch();
	}

	loadScript() {
		const body = <HTMLDivElement>document.body;
		const script = document.createElement('script');
		script.innerHTML = '';
		script.src = '../../assets/js/hopscotch/demo.js';
		body.appendChild(script);
	}
	resetCandlesView() {
		if (this.resetCandles) {
			this.resetCandles = false;
			if (this.chartData.length > 0) {
				this.chart.xAxis[0].setExtremes(this.chartData[this.chartData.length > 25 ? this.chartData.length - 75 : 0][0],
					this.chartData[this.chartData.length - 1][0], true, true);
				this.chart.yAxis[0].setExtremes(this.chart.yAxis[0].getExtremes().dataMin,
					this.chart.yAxis[0].getExtremes().dataMax, true, true);
			}
		}
	}
	private newPriceUpdate(newPrice: any) {
		if (newPrice.bar) {
			this.getCurrentTime(newPrice.time);
		}
		if (newPrice.bar && newPrice.bar.close && newPrice.info &&
			newPrice.info.symbol == this.wtStorageService.selectedSymbol &&
			newPrice.info.timeframe.toLowerCase() == this.wtStorageService.selectedTimeFrame.toLowerCase()) {
			this.currentPrice = this.doPrecision(newPrice.bar.close);
			try {
				if (this.chartData && this.chartData.length > 0 && this.chart) {
					// if(this.chartData[this.chartData.length-1][0] == (moment.tz(Constants.DefaultTimeZone).isDST()?
					// 						new Date(newPrice.bar.datetime).getTime()-3600000 :new Date(newPrice.bar.datetime).getTime())) {
					if (this.chartData[this.chartData.length - 1][0] == new Date(newPrice.bar.datetime).getTime()) {
						this.chartData[this.chartData.length - 1] = [
							/*moment.tz(Constants.DefaultTimeZone).isDST()?
								new Date(newPrice.bar.datetime).getTime()-3600000
										:new Date(newPrice.bar.datetime).getTime(),*/
							new Date(newPrice.bar.datetime).getTime(),
							newPrice.bar.open,
							newPrice.bar.high,
							newPrice.bar.low,
							newPrice.bar.close
						];
						this.chart.series[0].data[this.chart.series[0].data.length - 1].update(
							Object.assign(this.chartData[this.chartData.length - 1]));
						this.indicatorService.updateNewPoint(this.chart, [this.chart.series[0].xData, this.chart.series[0].yData],
							this.indicatorsComponent, 'update');

					} else {
						this.chartData.push([
							/*moment.tz(Constants.DefaultTimeZone).isDST()?
													new Date(newPrice.bar.datetime).getTime()-3600000
															:new Date(newPrice.bar.datetime).getTime(),*/
							new Date(newPrice.bar.datetime).getTime(),
							newPrice.bar.open,
							newPrice.bar.high,
							newPrice.bar.low,
							newPrice.bar.close
						]);
						this.chart.series[0].addPoint(Object.assign([], this.chartData[this.chartData.length - 1]), true, false, true);
						this.indicatorService.updateNewPoint(this.chart, [this.chart.series[0].xData, this.chart.series[0].yData],
							this.indicatorsComponent, 'addpoint');
					}
					this.chart.yAxis[0].setExtremes(this.chart.yAxis[0].getExtremes().dataMin,
						this.chart.yAxis[0].getExtremes().dataMax, true, true);
					// if (!this.addPlot) {
					// 	this.alignCurrentPriceLabel();
					this.chart.yAxis[0].removePlotLine('currentPrice');
					let price = this.doPrecision(this.chartData[this.chartData.length - 1][4]);
					this.chart.yAxis[0].addPlotLine({
						value: newPrice.bar.close,
						color: '#379bf2',
						arrow: true,
						width: 2,
						id: 'currentPrice',
						zIndex: 999,
						label: {
							align: 'right',
							backgroundColor: '#379bf2',
							textAlign: 'left',
							verticalAlign: 'middle',
							y: 5,
							text: '<span class="current-price-indicator">' +
								price.toString().substr(0, 4) + '<span class="dec-bold">' +
								price.toString().substr(4, price.toString().length) + '</span></span>',
						}
					});
					this.chart.yAxis[0].plotLinesAndBands[this.getPlotLineIndex()].label
						.yPosition = this.chart.yAxis[0].toPixels(newPrice.bar.close)
					this.addPlot = true;
					// }
				}

			} catch (error) {
			}
		}
	}
	private doPrecision(num: any) {
		let numString, splitNum = [], precNum = '';
		if (!num) return '';
		numString = num.toString();
		if (numString.indexOf('.') > -1) {
			splitNum = numString.split('.');
			if (splitNum[1]) {
				precNum = splitNum[1] + '0'.repeat(5 - splitNum[1].length);
			}
		} else if (numString.indexOf('.') == -1) {
			splitNum[0] = numString;
			precNum = '00000';
		}
		return `${splitNum[0]}.${precNum}`;
	}
	private fetchOldPrice() {
		this.chartLoaded = false;
		this.chartData = [];
		if (this.wtStorageService.selectedSymbol !== 'Symbols') {
			this.tradeService.getPastCandles(this.wtStorageService.selectedSymbol, this.wtStorageService.selectedTimeFrame, '200', null).subscribe(
				(oldPriceList: any) => {
					if (this.wtStorageService.selectedSymbol === oldPriceList.info.symbol
						&& this.wtStorageService.selectedTimeFrame.toLowerCase() === oldPriceList.info.timeframe.toLowerCase()) {
						var priceList: any = [];
						for (var i = 0; i < oldPriceList.bars.length; i++) {
							priceList[i] = [
								/*moment(oldPriceList.bars[i]['datetime']).tz(Constants.DefaultTimeZone).isDST() ? new Date(oldPriceList.bars[i]['datetime']).getTime() - 3600000
									: new Date(oldPriceList.bars[i]['datetime']).getTime(), // change required to handle daylight saving*/
								new Date(oldPriceList.bars[i]['datetime']).getTime(),
								oldPriceList.bars[i]['open'],
								oldPriceList.bars[i]['high'],
								oldPriceList.bars[i]['low'],
								oldPriceList.bars[i]['close']
							];
						}
						this.lastRecordDate = oldPriceList.bars[0].datetime;
						this.chartData = priceList;
						// this.getCurrentTime(oldPriceList.bars[(oldPriceList.bars.length-1)].datetime);
						this.chart.series[0].setData(Object.assign([], this.chartData), true, true, true);
						this.indicatorService.updatePreviousPoints(this.chart, [this.chart.series[0].xData, this.chart.series[0].yData], this.indicatorsComponent);
						if (this.chartData[this.chartData.length - 25]) 
						this.resetCandlesView();
						this.chartLoaded = true;
						this.initLoad = true;
						this.accountSwitch = false;
						this.chartComponent.zoomCount = 0;
						this.openTradesComponent.addAllPlotLines();
						// this.chart.update({
						// 	mapNavigation: { enableButtons: true }
						// });
						if (this.wtStorageService.deviceInfo.device === "android" || this.wtStorageService.deviceInfo.device === "iphone" || this.wtStorageService.deviceInfo.device === "ipad") {
							/* this.chart.update({
								exporting: {
									buttons: {
										customButton: {
											y: -65
										}
									}
								}
							}) */
						}
						if (this.loadIndicator) {
							this.indicatorsComponent.checkIndicators();
							this.loadIndicator = false;
						}

					}
				}
			);
		} else {
			this.chartLoaded = true;
		}

	}

	getCurrentTime(dateTime) {
		// console.log(dateTime);
		var date = dateTime.split('T')[0];
		var time = dateTime.split('T')[1];
		var day = (date.substring(date.indexOf('-')+1)).split('-')[1];
		var month = date.split('-')[1];
		if (time.includes('+')) {
			var timeString = time.split('+')[0];
			var utc = '+' + time.split('+')[1];
		}
		else {
			var timeString = time.split('-')[0];
			var utc = '-' + time.split('-')[1];
		}
		this.wtStorageService.utc = utc;
		this.currentTime = day + ' ' + this.getMonth(month) + ', ' + timeString + ' (UTC' + utc + ')';
	}

	getMonth(month) {
		if (month==1) {
			return 'JANUARY';
		}
		if (month==2) {
			return 'FEBRUARY';
		}
		if (month==3) {
			return 'MARCH';
		}
		if (month==4) {
			return 'APRIL';
		}
		if (month==5) {
			return 'MAY';
		}
		if (month==6) {
			return 'JUNE';
		}
		if (month==7) {
			return 'JULY';
		}
		if (month==8) {
			return 'AUGUST';
		}
		if (month==9) {
			return 'SEPTEMBER';
		}
		if (month==10) {
			return 'OCTOBER';
		}
		if (month==11) {
			return 'NOVEMBER';
		}
		if (month==12) {
			return 'DECEMBER';
		}
	}

	openDeposit(depositRef: any) {
		// if (this.wtStorageService.selectedMt4Account.demo) {
		//     //   swal({
		//     //     html: `<span style="color:#ffffff">${(new TranslatePipe(this.translateService))
		//     //       .transform('demoAccountCannotProceed')}<span>`,
		//     //     width: 400,
		//     //     timer: 1000,
		//     //     allowOutsideClick: false,
		//     //     allowEscapeKey: false,
		//     //     background: '#030608 url(./assets/images/trade-dropdown-bg.jpg) 100% 100% no-repeat',
		//     //     showConfirmButton: false,
		//     //     target: '#body_full_screen'
		//     //   });
		//     //   return false;
		//     // }
		if (!this.openDepositRef) {
			//   gtag('event', 'Deposit Appears', {
			//     'eventCategory': 'Deposit Webtrader',
			//     'eventAction': 'Deposit Appears',
			//     'eventLabel': this.wtStorageService.email,
			//     'eventValue': this.accountInfo.balance
			//   });
			this.openDepositRef = this.modalService.open(depositRef, {
				backdrop: 'static',
				windowClass: 'sm deposit-modal',
				keyboard: false,
				container: '#body_full_screen'
			});
		}
	}

	openReferral(referralRef: any) {
		if (this.wtStorageService.selectedMt4Account.demo) {
			swal({
				html: `<span style="color:#ffffff">${(new TranslatePipe(this.translateService))
					.transform('demoAccountCannotProceed')}<span>`,
				width: 400,
				timer: 1000,
				allowOutsideClick: false,
				allowEscapeKey: false,
				background: '#030608 url(./assets/images/trade-dropdown-bg.jpg) 100% 100% no-repeat',
				showConfirmButton: false,
				target: '#body_full_screen'
			});
			return false;
		}
		if (!this.openReferralRef) {
			this.referralData = this.mt4Account.find((o) => {
				return o['loginId'] === this.wtStorageService.selectedMt4Account.accountId
			});
			// this.imageData = this.sanitizer.bypassSecurityTrustResourceUrl('data:image/jpg;base64,' + this.referralData.qrCode);
			const lang =this.translateService.currentLang() ;
      this.refLink =  this.staticLink + '/affiliates/'+lang+'/' + this.wtStorageService.selectedMt4Account.accountId.loginId;
			if (this.refLink) {
				this.socialMediaReferral();
			}
			this.openReferralRef = this.modalService.open(referralRef, {
				backdrop: 'static',
				windowClass: 'sm referral-modal',
				keyboard: false,
				container: '#body_full_screen'
			});
		}
	}

	openFullscreen(fullscreenRef: any) {
		if (!this.openFullscreenRef) {
			this.openFullscreenRef = this.modalService.open(fullscreenRef, {
				backdrop: 'static',
				windowClass: 'sm deposit-modal',
				keyboard: false,
				container: '#body_full_screen'
			});
		}
	}

	onCopyText(lang) {
		this.copyToClipboard(lang.referralLink);
		// const copyText = lang.referralLink;
		// copyText.select();
		// document.execCommand('Copy');
	}

	socialMediaReferral() {
		const description = this.translateService.currentLang() == 'en' ? 'Check out the quick and easy way to earn profits' : '查看快速简便的赚取利润的方法';
		this.sinaReferral = 'http://service.weibo.com/share/share.php?url=' + this.refLink + '&appkey=&title=' + description + '&pic=&ralateUid=&language=zh_cn';
		this.facebookReferral = 'https://www.facebook.com/sharer/sharer.php?u=' + this.refLink;
		this.whatsappReferral = 'https://api.whatsapp.com/send?text=' + encodeURIComponent(description) + ' ' + this.refLink;
	}


	copyToClipboard(textToCopy) {
		const el = document.createElement('input');
		el.value = textToCopy;
		this.refLink = el.value;
		this.socialMediaReferral();
		document.body.appendChild(el);
		el.select();
		document.execCommand('copy');
		document.body.removeChild(el);
	}

	// onCopyEnglishText() {
	// 	const copyText = (<HTMLInputElement>document.getElementById('affiliateLinkEnglish'));
	// 	copyText.select();
	// 	document.execCommand('Copy');
	// }

	// onCopyChineseText() {
	// 	const copyText = (<HTMLInputElement>document.getElementById('affiliateLinkChinese'));
	// 	copyText.select();
	// 	document.execCommand('Copy');
	// }

	// onCopyThaiText() {
	// 	const copyText = (<HTMLInputElement>document.getElementById('affiliateLinkThai'));
	// 	copyText.select();
	// 	document.execCommand('Copy');
	// }

	// onCopyVietnameseText() {
	// 	const copyText = (<HTMLInputElement>document.getElementById('affiliateLinkVietnamese'));
	// 	copyText.select();
	// 	document.execCommand('Copy');
	// }

	// onCopyKoreanText() {
	// 	const copyText = (<HTMLInputElement>document.getElementById('affiliateLinkKorean'));
	// 	copyText.select();
	// 	document.execCommand('Copy');
	// }

	openWithdraw(withdrawRef: any) {
		if (this.wtStorageService.selectedMt4Account.demo) {
			swal({
				html: `<span style="color:#ffffff">${(new TranslatePipe(this.translateService))
					.transform('demoAccountCannotProceed')}<span>`,
				width: 400,
				timer: 1000,
				allowOutsideClick: false,
				allowEscapeKey: false,
				background: '#030608 url(./assets/images/trade-dropdown-bg.jpg) 100% 100% no-repeat',
				showConfirmButton: false,
				target: '#body_full_screen'
			});
			return false;
		}
		this.modalService.open(withdrawRef, {
			backdrop: 'static',
			windowClass: 'sm deposit-modal',
			keyboard: false,
			container: '#body_full_screen'
		});
	}

	navigateToWithdraw() {
		const payload = {
			'module': 'withdraw',
			'key': 'crm'
		};
		this.tradeService.getRedirectionInfo(payload).subscribe(res => {
			if (res.success) {
				if (res.data.redirectionUrl && res.data.authorization) {
					window.open(res.data.redirectionUrl + '?' + 'lang=' + this.translateService.currentLang() + '&' + 'id=' + res.data.authorization,
						'_blank');

				} else {
					//error
				}
			}
		}, err => {
			// error
		});
	}

	navigateToDeposit() {

		const payload = {
			'module': 'deposit',
			'key': 'crm'
		};
		if (localStorage.getItem('loginId') && localStorage.getItem('password')) {
			this.loginService.authUserNew(localStorage.getItem('loginId'), localStorage.getItem('password'))
			.subscribe(
			(res: any) => {
				if (res && res.success) {
					sessionStorage.setItem('tempToken', res.data.authorization);
					this.tradeService.getRedirectionInfo(payload).subscribe(res => {
						if (res.success) {
							if (res.data.redirectionUrl && res.data.authorization) {
								sessionStorage.setItem('crmToken', res.data.authorization);
								window.open(res.data.redirectionUrl + '?' + 'lang=' + this.translateService.currentLang() + '&' + 'id=' + res.data.authorization,
									'_self');
							} else {
								// error
							}
						}
					}, err => {
						// error
					});
				}
			});
		}
		else {
			this.tradeService.getRedirectionInfo(payload).subscribe(res => {
				if (res.success) {
					if (res.data.redirectionUrl && res.data.authorization) {
						sessionStorage.setItem('tempToken', sessionStorage.getItem('crmToken'));
						sessionStorage.setItem('crmToken', res.data.authorization);
						window.open(res.data.redirectionUrl + '?' + 'lang=' + this.translateService.currentLang() + '&' + 'id=' + res.data.authorization,
							'_self');
					} else {
						// error
					}
				}
			}, err => {
				// error
			});
		}
	}

	getDashboardInformation() {
		// this.tradeService.getDashboardInformation( sessionStorage.getItem('loginId'))
		// 	.subscribe(
		// 		result => {
		// 			if (result.success && result.data) {
		// 				this.mt4Accounts = result.data.mt4Accounts;
		// 			} else {
		// 				// failed
		// 			}
		// 		}, err => {
		// 			// failed
		// 		}
		// 	);
		this.mt4Account = this.wtStorageService.mt4AccountsList;
	}

	getDashboardQRcode() {
		if(!this.singleApi){
			this.tradeService.getDashboardQRcode()
			.subscribe(
				result => {
					this.imageData = environment.WT_CONFIG.s3BucketPath + 'assets/qrCode/qr_code_' + this.wtStorageService.selectedMt4Account.accountId.loginId + '.jpeg';

					}, err => {
						// failed
					}
				);
		}
	}


	// getDashboardQRcode() {
	// 	this.tradeService.getDashboardQRcode(sessionStorage.getItem('loginId'))
	// 		.subscribe(
	// 			result => {
	// 				if (result.success && result.data) {
	// 					this.mt4Accounts = result.data.mt4Accounts;
	// 				} else {
	// 					// failed
	// 				}
	// 			}, err => {
	// 				// failed
	// 			}
	// 		);
	// }
	// changeOrientation() {
	//this.modalService.open(DepositComponent);
	// if (this.device == "iphone" && !this.wtStorageService.isPortraitMode) {
	// if (this.orientationModalOpened) {
	// 	this.orientationModalRef.close();
	// 	this.orientationModalOpened = false;
	// }
	// } else if (!this.orientationModalOpened) {
	// this.orientationModalOpened = true;
	//this.orientationModalRef = this.modalService.open(OrientationComponent, { backdrop: 'static', windowClass: 'sm', keyboard: false, container: '#body_full_screen' });
	// this.orientationModalRef.result.then((result: any) => {
	// 	this.orientationModalOpened = false;
	// }, (reason: any) => {
	// 	this.orientationModalOpened = false;
	// });
	// }
	// this.modalService.open(orientationRef,{backdrop:'static', windowClass:'sm', keyboard:false, container:'#body_full_screen'});
	// }
	makeTrade(tradeAction: any, oneclick: any) {
		this.tradeAction = tradeAction;
		this.showCal = false;
		if (this.accountInfo.balance < this.selectedSymConfig.minAmount || this.tradeAmount > this.accountInfo.balance) {
			swal({
				html: `<i style="color:#ffffff;">${(new TranslatePipe(this.translateService))
					.transform("Trade_Not_enough_money")}</i>`,
				timer: 1000,
				width: 300,
				padding: 20,
				background: '#030608 url(./assets/images/trade-dropdown-bg.jpg) 100% 100% no-repeat',
				showConfirmButton: false,
				target: '#body_full_screen'
			});
		} else if (this.tradeAmount < this.selectedSymConfig.minAmount || this.tradeAmount > this.selectedSymConfig.maxAmount) {
			swal({
				html: `<i style="color:#ffffff;"> ${(new TranslatePipe(this.translateService))
					.transform("Trade_Amount_Range_1")} ` + this.selectedSymConfig.minAmount + `${(new TranslatePipe(this.translateService))
						.transform("Trade_Amount_Range_2")}` + this.selectedSymConfig.maxAmount + `${(new TranslatePipe(this.translateService))
							.transform("Trade_Amount_Range_3")}` + '</i> ',
				timer: 1000,
				width: 300,
				padding: 20,
				background: '#954553 url(./assets/images/trade-dropdown-bg.jpg) 100% 100% no-repeat',
				showConfirmButton: false,
				target: '#body_full_screen'
			});

		} /* else if (this.tradeAmount % this.selectedSymConfig.stepAmount > 0) {
			swal({
				html: `<i style="color:#ffffff;"> ${(new TranslatePipe(this.translateService))
					.transform("Trade_Amount_Multiples_Of")}` + this.selectedSymConfig.stepAmount + `${(new TranslatePipe(this.translateService))
						.transform("Trade_Amount_Multiples_Of_After")}` + '</i> ',
				timer: 1000,
				width: 300,
				padding: 20,
				background: '#954553 url(./assets/images/trade-dropdown-bg.jpg) 100% 100% no-repeat',
				showConfirmButton: false,
				target: '#body_full_screen'
			});
		} */ // commented code as always the amount allowed is not multiple of stepamount. its is amount * stepAmount +minamount
		else {
			if (this.wtStorageService.oneclickSetting == true) {
				this.disableButtons();
				this.sendTrade(tradeAction);
			}
			else {
				this.modalService.open(oneclick, { backdrop: 'static', windowClass: 'oneClick bounceIn animated md', keyboard: false, container: '#body_full_screen' }).
					result.then((result: any) => {
					},
						(reason: any) => {
							this.disableButtons();
							this.sendTrade(tradeAction);
						});;
			}
		}
	}

	disableButtons() {
		this.disableTradeButtons = true;
		document.getElementsByClassName("item-high")[0].setAttribute("id", "upButton");
		document.getElementsByClassName("item-low")[0].setAttribute("id", "downButton");
	}

	sendTrade(tradeAction: any) {
		this.tradeAction = tradeAction;
		this.trade = {
			"action": tradeAction,
			"amount": this.tradeAmount,
			"symbol": this.wtStorageService.selectedSymbol,
			"interval": this.selectedSymConfig.interval,
			"payout": this.selectedSymConfig.winPayout,
			"appType": this.wtUtilService.config.appType,
		}
		this.tradeshubService.sendTrade(this.trade);
	}
	logOut() {


		this.pricehubService.stopPricesHub();
		this.tradeshubService.stopTradesHub();
		this.wtCrmService.fetchRefreshToken = false;
		this.idle.stop();

		//this.isLoggingOut = true;
		this.tradeService.logOut()
			.subscribe((logoutInfo: any) => {
				this.wtStorageService.clearStorage();
				sessionStorage.clear();
				window.location.reload();
				//let msg = logoutInfo.msg[0].body[0];
				//this.isLoggingOut = false;



				// swal({
				// 	html: `<i style="color:#ffffff;">${msg}</i>`,
				// 	timer: 1000,
				// 	width: 300,
				// 	padding: 20,
				// 	allowOutsideClick: false,
				// 	allowEscapeKey: false,
				// 	background: '#030608 url(./assets/images/trade-dropdown-bg.jpg) 100% 100% no-repeat',
				// 	showConfirmButton: false,
				// 	target: '#body_full_screen'
				// })
				// setTimeout(() => {
				// 	// this.router.navigate(['/']);
				// 	window.location.reload();
				// }, 0);

			});
	}

	showErrorMessage(message) {
		let msg = (new TranslatePipe(this.translateService)).transform(message);
		swal({
			html: `<i style="color:#ffffff;">${msg}</i>`,
			timer: 3000,
			width: 300,
			padding: 20,
			allowOutsideClick: false,
			allowEscapeKey: false,
			background: '#030608 url(/assets/images/trade-dropdown-bg.jpg) 100% 100% no-repeat',
			showConfirmButton: false,
			target: '#body_full_screen'
		});
	}

	setTimeFrame(timeFrame: any) {
		this.showCal = false;
		if (this.wtStorageService.selectedTimeFrame === timeFrame.toLowerCase()) return;
		this.pricehubService.priceHubProxy.invoke('Unsubscribe', this.wtStorageService.selectedSymbol, this.wtStorageService.selectedTimeFrame);
		this.wtStorageService.selectedTimeFrame = timeFrame.toLowerCase();
		this.pricehubService.priceHubProxy.invoke('subscribe', this.wtStorageService.selectedSymbol, this.wtStorageService.selectedTimeFrame);
		if (this.wtStorageService.selectedSymbol !== 'Symbols') {
			this.fetchOldPrice();
			this.indicatorStorage.resetIndicatorStorage();
		}
		let currentSymbolTimeframe = {
			"symbol": this.wtStorageService.selectedSymbol,
			"timeFrame": this.wtStorageService.selectedTimeFrame.toUpperCase()
		}
		this.selectedChartIndex = this.getIndex(this.chartTab, currentSymbolTimeframe);
		this.saveToLocalStorage(currentSymbolTimeframe, 'chart_tab_selected', this.wtStorageService.selectedMt4Account.accountId);

	}

	showUserProfile(userProfileRef: any) {
		this.modalService.open(UserProfileComponent, { backdrop: 'static', keyboard: false, windowClass: 'depositModal' });
	}
	isShowOpenTrade() {
		this.openTradesComponent.tradeViewLoaded = true;
		this.openTradesComponent.showOpenTrades = this.openTradesComponent.showOpenTrades ? false : true;

		this.openTradesComponent.closeFromTradeComponent();

		this.toggleDpDown(this.openTradesComponent.showOpenTrades, 'skipCloseView');
		this.tradeHistoryComponent.showTradesHistory = false;
		// if (this.chartData.length > 0) {
		// 	this.chart.xAxis[0].setExtremes(this.chartData[this.chartData.length > 25 ? this.chartData.length - 25 : 0][0],
		// 		this.chartData[this.chartData.length - 1][0], true, true);
		// }
	}

	updateHistory(data: any) {
		this.tradeHistoryComponent.isDataOutdated = true;
		this.tradeHistoryComponent.totalRecordsCount++;
		this.tradeHistoryComponent.tradeRecordsCount++;
		if (this.tradeHistoryComponent.showTradesHistory) this.tradeHistoryComponent.openTradeClosed(data);
	}

	isShowTradeHistory(show: any) {
		this.tradeHistoryComponent.tradeViewLoaded = true;
		// this.tradeHistoryComponent.isHistoryEmpty = false;
		if (this.tradeHistoryComponent.showTradesHistory && show) return;
		if (!this.tradeHistoryComponent.showTradesHistory) {
			this.tradeHistoryComponent.initTradeHistory();
		}
		this.tradeHistoryComponent.showTradesHistory = show;
		if (this.tradeHistoryComponent.showTradesHistory) {
			this.toggleDpDown(this.tradeHistoryComponent.showTradesHistory, 'skipCloseView');
			this.openTradesComponent.showOpenTrades = false;
			if (this.chartData && this.chartData[this.chartData.length - 10]) {
				this.chart.xAxis[0].setExtremes(this.chartData[this.chartData.length - 10][0],
					this.chartData[this.chartData.length - 1][0], true, true);
			}

		} else {
			if (this.chartData) {
				this.chart.xAxis[0].setExtremes(this.chartData[this.chartData.length > 25 ? this.chartData.length - 75 : 0][0],
					this.chartData[this.chartData.length - 1][0], true, true);
			}
		}
	}
	showSettings(setting: any) {
		this.lang = this.languages;
		this.modalService.open(setting, { container: '#body_full_screen', backdrop: 'static' });
	}
	toggleDpDown(data: any, opType: any) {

		if (!data && opType && this.dropDowns[opType] !== undefined) {
			if (opType === 'closeSymSel') this.searchInput = null;
			this.dropDowns[opType] = !data;
		}
		if (!data) return;
		if (opType != 'calcSel' && this.isMobileDevice) {
			this.showCal = false;
			this.dropDowns.calcSel = true;
		}
		if (opType != 'skipCloseView' && (this.tradeHistoryComponent.showTradesHistory )) {
			this.closeViews()
		}
		// if (opType != 'skipCloseView' && (this.tradeHistoryComponent.showTradesHistory || this.openTradesComponent.showOpenTrades)) {
		// 	this.closeViews()
		// }
		for (let key in this.dropDowns) {
			if (key === opType) {
				this.dropDowns[key] = !data;
			} else {
				this.dropDowns[key] = true;
			}
		}

	}

	mapBalance() {
		let balances = [];
		// if single api true then get balance Fox
		if (!this.getBalanceByFoxAPI) {
			this.tradeService.getBalance()
				.subscribe(
					result => {
						if (result.success && result.data) {
							balances = result.data;
							this.wtStorageService.mt4AccountsList.forEach((mt4Account, i) => {
								balances.forEach((account) => {
									if (account.login == mt4Account.accountId.loginId) {
										this.wtStorageService.mt4AccountsList[i]['balance'] = account.balance;
									}
									if (account.login == mt4Account.accountId && mt4Account.demo) {
										this.wtStorageService.mt4AccountsList[i]['balance'] = account.balance;
									}
								});
							});
						} else {
							// failed
						}
					}, err => {
						// failed
					}
				);
		} else {
			var loginList: string = "";
			this.wtStorageService.mt4AccountsList.forEach(
				(mt4Account: any) => {
					loginList = loginList + mt4Account['accountId'].loginId + ",";
				});
			loginList = loginList.substring(0, loginList.length - 1);

			this.tradeService.getBalanceByFoxAPI(loginList)
				.subscribe(
					result => {
						if (result) {
							balances = result;
							this.wtStorageService.mt4AccountsList.forEach((mt4Account, i) => {
								balances.forEach((account) => {
									if (account.login == mt4Account.accountId.loginId) {
										this.wtStorageService.mt4AccountsList[i]['balance'] = account.balance;
									}
								});
							});
						} else {
							// failed
						}
					}, err => {
						// failed
					}
				);
		}
	}

	private closeViews() {
		let time = 350;
		if (this.tradeHistoryComponent.showTradesHistory) time = 450;
		this.tradeHistoryComponent.showTradesHistory = false;
		this.openTradesComponent.showOpenTrades = false;
		this.chart.xAxis[0].setExtremes(this.chartData[this.chartData.length > 25 ? this.chartData.length - 25 : 0][0],
			this.chartData[this.chartData.length - 1][0], true, true);
	}
	changeSymbol(selectedSymbol: any, selSymbolIntervalList: any, isChartTabUpdate: any) {
		this.wtStorageService.utc = '';
		this.dropDowns.closeSymSel = true;
		if (this.wtStorageService.selectedSymbol === selectedSymbol && isChartTabUpdate) return;
		this.currentPrice = '';
		this.pricehubService.unsubscribeNewSymPrice();
		this.wtStorageService.selectedSymbol = selectedSymbol;
		this.intervalList = selSymbolIntervalList;
		this.selectedSymConfig = this.clone(selSymbolIntervalList[0]);
		this.tradeAmount = parseInt(this.selectedSymConfig.minAmount);
		this.preAmount = this.tradeAmount;
		this.pricehubService.subscribeNewSymPrice();
		this.chart.yAxis[0].removePlotLine('currentPrice');
		if (this.labelText) this.labelText.destroy();
		this.openTradesComponent.removeAllPlotLines();
		this.addPlot = false;
		if (this.wtStorageService.selectedSymbol !== 'Symbols') {
			this.fetchOldPrice();
			this.indicatorStorage.resetIndicatorStorage();
		}

		let currentSymbolTimeframe = {
			"symbol": this.wtStorageService.selectedSymbol,
			"timeFrame": this.wtStorageService.selectedTimeFrame.toUpperCase()
		}
		this.saveToLocalStorage(currentSymbolTimeframe, 'chart_tab_selected', this.wtStorageService.selectedMt4Account.accountId);
		this.selectedChartIndex = this.getIndex(this.chartTab, currentSymbolTimeframe);
		this.chartComponent.candleZoom();

	}

	removeFromFav(fav: any) {
		this.favCount = this.favCount - 1;
		this.favorites[fav]['isFav'] = false;
		let favLocal = this.getFavoritesLocal(this.wtStorageService.selectedMt4Account.accountId);
		favLocal[fav] = undefined;
		favLocal = this.filterEmptyVal(favLocal);
		this.saveToLocalStorage(favLocal, 'favourites', this.wtStorageService.selectedMt4Account.accountId);
	}
	addToFavourite(selectedSymbol: any, opType: any) {
		let favLocal = this.getFavoritesLocal(this.wtStorageService.selectedMt4Account.accountId);
		if (!this.favorites[selectedSymbol]['isFav']) {
			this.favorites[selectedSymbol]['isFav'] = true;
			this.favCount = this.favCount + 1;
			favLocal[selectedSymbol] = opType;
		} else {
			this.favorites[selectedSymbol]['isFav'] = false;
			this.favCount = this.favCount - 1;
			delete favLocal[selectedSymbol];
		}
		this.saveToLocalStorage(favLocal, 'favourites', this.wtStorageService.selectedMt4Account.accountId);
	}
	private setFavorites(accId: any) {
		let favoritesData = JSON.parse(localStorage.getItem('favourites'));
		this.favorites = (favoritesData && favoritesData[accId]) || {};
		this.favorites = this.filterUnavailableSymbols(this.favorites);
	}
	private filterUnavailableSymbols(fav: any) {
		let symbols: Array<any> = [];
		let allSymbols: any = {};
		let favKeys = Object.keys(fav);
		this.favCount = 0;
		for (let security in this.symbolConfiguration) {
			let symbolKeys = (Object.keys(this.symbolConfiguration[security]))
			symbols.push(...symbolKeys);
			for (let symbol of symbolKeys) {
				if (this.symbolConfiguration[security][symbol] && this.symbolConfiguration[security][symbol].length > 0) {
					allSymbols[symbol] = { security }
					if (favKeys.indexOf(symbol) !== -1) {
						allSymbols[symbol]['isFav'] = true;
						this.favCount = this.favCount + 1;
					}
				}
			}
		}
		return allSymbols;
	}
	private getFavoritesLocal(accId: any) {
		let fav = JSON.parse(localStorage.getItem('favourites'));
		let data = (fav && fav[accId]) ? fav[accId] : {};
		return data;
	}
	private filterChartTabs(data: any) {
		let resultTabs: any = [];
		let mapSymbol: any = [];
		let availSymbol: any = [];
		for (let temp of data) {
			if (mapSymbol.indexOf(temp.symbol) === -1) mapSymbol.push(temp.symbol);
		}
		for (let security in this.symbolConfiguration) {
			let symbolKeys = (Object.keys(this.symbolConfiguration[security]))
			for (let symbol of symbolKeys) {
				if (this.symbolConfiguration[security][symbol]
					&& this.symbolConfiguration[security][symbol].length > 0
					&& mapSymbol.indexOf(symbol) !== -1) {
					availSymbol.push(symbol)
				}
			}
		}
		data.forEach((value: any, index: any) => {
			if (availSymbol.indexOf(value.symbol) !== -1) resultTabs.push(value);
		})
		return resultTabs;
	}
	private setCharts(accId: any) {
		let chartTabs = JSON.parse(localStorage.getItem('chart_tab'));
		if (chartTabs && chartTabs[accId] && (chartTabs[accId].length > 0)) {
			chartTabs[accId] = this.filterChartTabs(chartTabs[accId]);
			this.chartTab = chartTabs[accId].length > 5 ? chartTabs[accId].slice(chartTabs[accId].length - 5, chartTabs[accId].length) : chartTabs[accId];
			this.saveToLocalStorage(this.chartTab, 'chart_tab', accId);
		}
		if (JSON.parse(localStorage.getItem('chart_tab_selected'))) {
			this.selectedChart = (JSON.parse(localStorage.getItem('chart_tab_selected')))[accId];
		}
	}
	private getFromLocalStorage(getKey: any, updateKey: any) {
		let storedData = JSON.parse(localStorage.getItem(getKey)) || {};
		return storedData[updateKey] || {};
	}
	private saveToLocalStorage(data: any, getKey: any, updateKey: any) {
		let storedData = JSON.parse(localStorage.getItem(getKey)) || {};
		storedData[updateKey] = data;
		localStorage.setItem(getKey, JSON.stringify(storedData));
	}

	private updateLocalStorage(origArr: any, oldObj: any, newObj: any) {
		let storedData = this.getFromLocalStorage('chart_tab', this.wtStorageService.selectedMt4Account.accountId);
		let oldObjInChart = this.isInChartTab(origArr, oldObj || {});
		let newObjInLocal = this.isInChartTab(storedData, newObj || {});
		let updataLocalStorage = false;
		if (!oldObjInChart && oldObj != null) {
			storedData = this.removeFromArray(storedData, oldObj);
			updataLocalStorage = true;
		}
		if (!newObjInLocal && newObj != null) {
			storedData.push(this.chartTab[this.selectedChartIndex])
			updataLocalStorage = true;
		}
		if (updataLocalStorage) this.saveToLocalStorage(storedData, 'chart_tab', this.wtStorageService.selectedMt4Account.accountId);

	}

	goFS() {
		let document: any = window.document;
		let fs = document.getElementById("body_full_screen");

		if (!document.fullscreenElement &&
			!document.mozFullScreenElement && !document.webkitFullscreenElement && !document.msFullscreenElement) {
			if (fs.requestFullscreen) {
				fs.requestFullscreen();
			} else if (fs.msRequestFullscreen) {
				fs.msRequestFullscreen();
			} else if (fs.mozRequestFullScreen) {
				fs.mozRequestFullScreen();
			} else if (fs.webkitRequestFullscreen) {
				fs.webkitRequestFullscreen();
			}
			this.inFullScreenMode = true;
		} else {
			this.inFullScreenMode = false;
			if (document.exitFullscreen) {
				document.exitFullscreen();
			} else if (document.msExitFullscreen) {
				document.msExitFullscreen();
			} else if (document.mozCancelFullScreen) {
				document.mozCancelFullScreen();
			} else if (document.webkitExitFullscreen) {
				document.webkitExitFullscreen();
			}
		}
	}

	openFS() {

		let document: any = window.document;
		let fs = document.getElementById("body_full_screen");

		if (!document.fullscreenElement &&
			!document.mozFullScreenElement && !document.webkitFullscreenElement && !document.msFullscreenElement) {
			if (fs.requestFullscreen) {
				fs.requestFullscreen();
			} else if (fs.msRequestFullscreen) {
				fs.msRequestFullscreen();
			} else if (fs.mozRequestFullScreen) {
				fs.mozRequestFullScreen();
			} else if (fs.webkitRequestFullscreen) {
				fs.webkitRequestFullscreen();
			}
			this.inFullScreenMode = true;
		}
		this.closeFullscreen();
	}

	exitFS() {
		if (this.inFullScreenMode) {
			let document: any = window.document;
			if (document.exitFullscreen) {
				document.exitFullscreen();
			} else if (document.msExitFullscreen) {
				document.msExitFullscreen();
			} else if (document.mozCancelFullScreen) {
				document.mozCancelFullScreen();
			} else if (document.webkitExitFullscreen) {
				document.webkitExitFullscreen();
			}
		}
	}

	intervalChange(selectedInterval: any) {
		this.selectedSymConfig.interval = selectedInterval.interval;
		this.selectedSymConfig.winPayout = selectedInterval.winPayout;
		this.selectedSymConfig.minAmount = selectedInterval.minAmount;
		this.selectedSymConfig.maxAmount = selectedInterval.maxAmount;
		this.tradeAmount = parseInt(selectedInterval.minAmount);
	}
	private setAccount(accId: any, validated: any) {
		if (!validated) {
			let selectedAuth = false;
			for (var i = 0; i < this.wtStorageService.mt4AccountsList.length; i++) {
				if (this.wtStorageService.mt4AccountsList[i].validate) {
					if (accId == this.wtStorageService.mt4AccountsList[i].accountId) {
						selectedAuth = true;
						break;
					}
				}
			}
			if (!selectedAuth) {
				accId = this.wtStorageService.selectedMt4Account.accountId;
			}
		}
		this.accountSwitch = true;
		this.setFavorites(accId);
		this.chartTab = [];
		this.setCharts(accId);
		this.tradeHistoryComponent.currentRecords = [];
		this.tradeHistoryComponent.historyRecords = {};
		//this.restartSignalr();
		if (JSON.parse(localStorage.getItem('settings')) == null || !JSON.parse(localStorage.getItem('settings'))[this.wtStorageService.selectedMt4Account.accountId]) {
			this.wtStorageService.soundSetting = true;
			this.wtStorageService.oneclickSetting = false;
		} else {
			this.wtStorageService.soundSetting = JSON.parse(localStorage.getItem('settings'))[this.wtStorageService.selectedMt4Account.accountId].sound;
			this.wtStorageService.oneclickSetting = JSON.parse(localStorage.getItem('settings'))[this.wtStorageService.selectedMt4Account.accountId].oneClick;
		}


	}
	changeMt4Account(mt4Account: any, index: number) {
		if (mt4Account.accountId === this.wtStorageService.selectedMt4Account.accountId) return;
		for (var i = 0; i < this.wtStorageService.mt4AccountsList.length; i++) {
			this.wtStorageService.mt4AccountsList[i].isSelected = false;
		}
		if (mt4Account.validate) {
			// this.isMt4Switched = true;

			this.wtStorageService.selectedMt4Account = mt4Account;
			mt4Account.isSelected = true;
			sessionStorage.setItem('mt4Account', JSON.stringify(mt4Account));
			if (mt4Account.demo) {
				sessionStorage.setItem('demo', 'true');
				this.wtStorageService.boBaseUrl = this.wtUtilService.config.BO_DEMO_BASE_URL;
			} else {
				sessionStorage.removeItem('demo');
				this.wtStorageService.boBaseUrl = this.wtUtilService.config.BO_BASE_URL;
			}
			if (mt4Account.demo) {
				this.demoSelected = true;
				this.mt4loginservice.mt4DemoAuthUserUsingToken(this.wtStorageService.selectedMt4Account.accountId)
					.subscribe(
						(data: any) => {
							this.wtStorageService.mt4AccountsList.forEach(
								(mt4Account: any) => {
									mt4Account['accessToken'] = data['access_token'];
								});
							this.wtStorageService.selectedMt4Account.accessToken = data['access_token'];
							sessionStorage.setItem('mt4AccountList', JSON.stringify(this.wtStorageService.mt4AccountsList));
							sessionStorage.setItem('mt4Account', JSON.stringify(this.wtStorageService.selectedMt4Account));
							this.selectedSymConfig.winPayout = 0;
							this.tradeAmount = 0;
							this.preAmount = 0;
							this.wtStorageService.selectedSymbol = 'Symbols';
							this.selectedSymConfig.interval = 0;
							this.setAccount(mt4Account.accountId, true);
							this.tradeshubService.tradesHubProxy.off('tradesUpdate',
								(data: any) => {
								});
							this.pricehubService.stopPricesHub();
							this.tradeshubService.stopTradesHub();
							this.wtSignalrService.setConnectionParams();
							this.tradeshubService.createHubProxy();
							this.pricehubService.startPricesHub();
							this.tradeshubService.startTradesHub();
							if (this.wtStorageService.selectedSymbol !== 'Symbols') {
								this.indicatorStorage.resetIndicatorStorage();
							}
							if (sessionStorage.getItem('firstLogin') == 'true') {
								this.loadCoachMarks();
								sessionStorage.removeItem('firstLogin');
							}
						},
						(err: any) => {
						});

			} else {
				this.demoSelected = false;
				this.mt4loginservice.mt4AuthUserUsingToken()
					.subscribe(
						(data: any) => {
							this.wtStorageService.mt4AccountsList.forEach(
								(mt4Account: any) => {
									mt4Account['accessToken'] = data['access_token'];
								});
							this.wtStorageService.selectedMt4Account.accessToken = data['access_token'];
							sessionStorage.setItem('mt4AccountList', JSON.stringify(this.wtStorageService.mt4AccountsList));
							sessionStorage.setItem('mt4Account', JSON.stringify(this.wtStorageService.selectedMt4Account));
							this.selectedSymConfig.winPayout = 0;
							this.tradeAmount = 0;
							this.preAmount = 0;
							this.wtStorageService.selectedSymbol = 'Symbols';
							this.selectedSymConfig.interval = 0;
							this.setAccount(mt4Account.accountId, true);
							this.tradeshubService.tradesHubProxy.off('tradesUpdate',
								(data: any) => {
								});
							this.pricehubService.stopPricesHub();
							this.tradeshubService.stopTradesHub();
							this.wtSignalrService.setConnectionParams();
							this.tradeshubService.createHubProxy();
							this.pricehubService.startPricesHub();
							this.tradeshubService.startTradesHub();
							if (this.wtStorageService.selectedSymbol !== 'Symbols') {
								this.indicatorStorage.resetIndicatorStorage();
							}
						},
						(err: any) => {
						});
			}

		} else {
			mt4Account.isSelected = true;
			//  this.isMt4Switched = true;
			this.modalService.open(MT4AuthenticateComponent, this.modalOption).result.then(
				(result: any) => {
					//closing mt4 popup w/o any action
				}, (reason: any) => {
					this.setAccount(mt4Account.accountId, false);

				});
		}
		this.getDashboardQRcode();
	}
	private restartSignalr() {
		//this.pricehubService.stopPricesHub();
		//this.tradeshubService.stopTradesHub();
		this.pricehubService.startPricesHub();
		this.tradeshubService.startTradesHub();
		this.isMt4Switched = false;
	}
	incraseAmount() {
		let fixUpto = 0;
		const decimalString = this.selectedSymConfig.stepAmount.toString().split('.');
		if (typeof decimalString[1] != 'undefined' && decimalString[1] != null && decimalString[1] != '') {
			fixUpto = decimalString[1].length;
		}
		this.tradeAmount = this.tradeAmount + this.selectedSymConfig.stepAmount;
		this.tradeAmount = parseFloat(this.tradeAmount.toFixed(fixUpto));
		this.preAmount = this.tradeAmount;
		this.maxAmountCheck();
	}

	decreaseAmount() {
		let fixUpto = 0;
		const decimalString = this.selectedSymConfig.stepAmount.toString().split('.');
		if (typeof decimalString[1] != 'undefined' && decimalString[1] != null && decimalString[1] != '') {
			fixUpto = decimalString[1].length;
		}
		this.tradeAmount = Math.max(0, this.tradeAmount - this.selectedSymConfig.stepAmount);
		this.tradeAmount = parseFloat(this.tradeAmount.toFixed(fixUpto));
		this.preAmount = this.tradeAmount;
		this.maxAmountCheck();
	}
	onKey(event: any) {
		if (this.preAmount > this.selectedSymConfig.maxAmount && this.tradeAmount > this.selectedSymConfig.maxAmount) {
			this.tradeAmount = this.preAmount;
		}
		this.maxAmountCheck();
		this.preAmount = this.tradeAmount;
	}
	addCalculator(num: any) {
		this.tradeAmount = this.tradeAmount + num;
		this.preAmount = this.tradeAmount;
		this.maxAmountCheck();
	}
	subCalculator(num: any) {
		this.tradeAmount = Math.floor(this.tradeAmount - num);
		if (this.tradeAmount < 0) this.tradeAmount = 0;
		this.preAmount = this.tradeAmount;
		this.maxAmountCheck();
	}
	mulCalculator(num: any) {
		if (num != 2 && (this.tradeAmount * 10) + num >= this.selectedSymConfig.maxAmount * 10) return
		this.tradeAmount = this.tradeAmount * num;
		this.preAmount = this.tradeAmount;
		this.maxAmountCheck();
	}
	addString(num: any) {
		if ((this.tradeAmount * 10) + num >= this.selectedSymConfig.maxAmount * 10) return
		this.tradeAmount = this.tradeAmount * 10 + num;
		this.preAmount = this.tradeAmount;
		this.maxAmountCheck();
	}
	removeLast() {
		this.tradeAmount = Math.floor(this.tradeAmount / 10);
		this.preAmount = this.tradeAmount;
		this.maxAmountCheck();
	}
	private maxAmountCheck() {
		if (this.tradeAmount > this.selectedSymConfig.maxAmount) this.maxAmountFlag = true;
		else if (this.tradeAmount <= this.selectedSymConfig.maxAmount) this.maxAmountFlag = false;
	}
	setChartIndex(index: any) {
		this.toggleDpDown(true, null);
		this.selectedChartIndex = index;
		this.updateChart();
	}
	addChartTab() {
		this.toggleDpDown(true, null);
		if (this.chartTab.length < 5) {
			let newChart = {
				"symbol": this.wtStorageService.selectedSymbol,
				"timeFrame": this.wtStorageService.selectedTimeFrame.toUpperCase()
			}
			if (this.getIndex(this.chartTab, newChart) !== -1) {
				swal({
					html: `<i style="color:#ffffff;">${(new TranslatePipe(this.translateService))
						.transform("Trade_Chart_Bookmarked")}</i>`,
					timer: 1000,
					width: 300,
					padding: 20,
					background: '#030608 url(./assets/images/trade-dropdown-bg.jpg) 100% 100% no-repeat',
					showConfirmButton: false,
					target: '#body_full_screen'
				});
			} else {
				this.chartTab.push(newChart);
				this.selectedChartIndex = this.chartTab.length - 1;
				this.saveToLocalStorage(this.chartTab, 'chart_tab', this.wtStorageService.selectedMt4Account.accountId)
				this.updateChart();
				swal({
					html: `<i style="color:#ffffff;">${(new TranslatePipe(this.translateService))
						.transform("Bookmark_Added")}</i>`,
					timer: 1000,
					width: 300,
					padding: 20,
					background: '#030608 url(./assets/images/trade-dropdown-bg.jpg) 100% 100% no-repeat',
					showConfirmButton: false,
					target: '#body_full_screen'
				});
			}
		} else {
			swal({
				html: `<i style="color:#ffffff;">${(new TranslatePipe(this.translateService))
					.transform("Trade_Reached_Max_Chart_Tabs")}</i>`,
				timer: 1000,
				width: 300,
				padding: 20,
				background: '#030608 url(./assets/images/trade-dropdown-bg.jpg) 100% 100% no-repeat',
				showConfirmButton: false,
				target: '#body_full_screen'
			});
		}
	}
	removeChartTab(removeIndex: any) {
		this.toggleDpDown(true, null);
		let tempTab = this.chartTab[removeIndex];
		this.chartTab.splice(removeIndex, 1);
		let symbTime = {
			"symbol": this.wtStorageService.selectedSymbol,
			"timeFrame": this.wtStorageService.selectedTimeFrame.toUpperCase()
		}
		this.selectedChartIndex = this.getIndex(this.chartTab, symbTime);
		this.updateLocalStorage(this.chartTab, tempTab, null);
	}
	private alignPriceSymbols() {
		if (this.tradeAmount) {
			switch (this.tradeAmount.toString().length) {
				case 0:
					this.amountIpWidth = 40;
					this.currencySymbolPadding = 42;
					break;
				case 1:
					this.amountIpWidth = 45;
					this.currencySymbolPadding = 38;
					break;
				case 2:
					this.amountIpWidth = 50;
					this.currencySymbolPadding = 34;
					break;
				case 3:
					this.amountIpWidth = 55;
					this.currencySymbolPadding = 30;
					break;
				case 4:
					this.amountIpWidth = 60;
					this.currencySymbolPadding = 26;
					break;
			}
		} else {
			if (this.tradeAmount == null || (this.tradeAmount && this.tradeAmount.toString().length == 0)) {
				this.amountIpWidth = 40;
				this.currencySymbolPadding = 42;
			}
		}
	}
	private updateChart() {
		let selectedTimeFrame = this.wtStorageService.selectedTimeFrame;
		if (this.wtStorageService.selectedTimeFrame.toLowerCase() != this.chartTab[this.selectedChartIndex].timeFrame.toLowerCase()) {
			selectedTimeFrame = this.chartTab[this.selectedChartIndex].timeFrame.toLowerCase();;
		}
		if (this.wtStorageService.selectedSymbol != this.chartTab[this.selectedChartIndex].symbol) {
			this.wtStorageService.selectedTimeFrame = selectedTimeFrame;
			let selectedSymbol = this.chartTab[this.selectedChartIndex].symbol;
			for (let security in this.symbolConfiguration) {
				if (this.symbolConfiguration[security][selectedSymbol] != undefined && this.symbolConfiguration[security][selectedSymbol].length > 0) {
					this.changeSymbol(selectedSymbol, this.symbolConfiguration[security][selectedSymbol], true);
					break;
				}
			}
			// this.saveToLocalStorage(this.chartTab[this.selectedChartIndex],'chart_tab_selected',this.wtStorageService.selectedMt4Account.accountId);
		} else if (selectedTimeFrame !== this.wtStorageService.selectedTimeFrame) {
			this.setTimeFrame(selectedTimeFrame);
		}
	}
	private generateSymbolList() {
		this.symbolConfiguration = { symbols: {} };
		let securities: any = {};
		if (this.configuration && this.configuration.securities && this.configuration.symbols && this.configuration.payoutConfigurations) {
			this.configuration.securities.forEach((security: any) => {
				this.symbolConfiguration[security.name] = {};
				securities[security.name] = false;
			});
			this.configuration.symbols.forEach((symbol: any) => {
				if (this.symbolConfiguration[symbol.security]) {
					this.symbolConfiguration[symbol.security][symbol.name] = [];
					this.symbolConfiguration.symbols[symbol.name] = {}
					this.symbolConfiguration.symbols[symbol.name]['amountStep'] = symbol.amountStep;
				}
			});
			for (let j = 0; j < Object.keys(this.symbolConfiguration).length; j++) {
				if (Object.keys(this.symbolConfiguration)[j] == 'symbols') continue;
				for (let symbol in this.symbolConfiguration[Object.keys(this.symbolConfiguration)[j]]) {
					for (let i = 0; i < this.configuration.payoutConfigurations.length; i++) {
						if (this.configuration.payoutConfigurations[i].symbols.indexOf(symbol) > -1) {
							securities[Object.keys(this.symbolConfiguration)[j]] = true;
							for (let interval of this.configuration.payoutConfigurations[i].intervals) {
								if (this.checkForInterval(this.symbolConfiguration[Object.keys(this.symbolConfiguration)[j]][symbol], interval,
									this.configuration.payoutConfigurations[i].payoutInfo.winPayout)) {
									let symbolIndex = this.getSymbolIndex(this.configuration.symbols, symbol);
									this.symbolConfiguration[Object.keys(this.symbolConfiguration)[j]][symbol].push({
										interval: interval,
										winPayout: this.configuration.payoutConfigurations[i].payoutInfo.winPayout,
										minAmount: this.configuration.payoutConfigurations[i].amountRange.min > this.configuration.symbols[symbolIndex].amountMin ?
											this.configuration.payoutConfigurations[i].amountRange.min : this.configuration.symbols[symbolIndex].amountMin,
										maxAmount: this.configuration.payoutConfigurations[i].amountRange.max < this.configuration.symbols[symbolIndex].amountMax ?
											this.configuration.payoutConfigurations[i].amountRange.max : this.configuration.symbols[symbolIndex].amountMax,
										stepAmount: this.symbolConfiguration.symbols[symbol].amountStep
									});
								}
							}
						}
					}
				}
			}
			for (let security in securities) {
				if (securities[security] === false) {
					delete this.symbolConfiguration[security];
				}
			}
		}
		this.isSymbolLoaded = true;
		delete this.symbolConfiguration.symbols;
	}
	private checkForInterval(arr: any, interval: any, winPayout: any) {
		let index = arr.findIndex((ele: any) => ele.interval == interval && ele.winPayout == winPayout);
		if (index > -1) return false;
		else return true;
	}
	private getSymbolIndex(arr: any, symbol: any) {
		return arr.findIndex((ele: any) => ele.name == symbol);
	}
	private updatePlotLine(yValue: any) {
		let plotLine = this.chart.yAxis[0].plotLinesAndBands[this.getPlotLineIndex()].svgElem;
		let label = this.chart.yAxis[0].plotLinesAndBands[this.getPlotLineIndex()].label;
		let d = plotLine.d.split(' ');
		let newY = this.chart.yAxis[0].toPixels(yValue) - d[2];
		if (label) {
			label.attr('text', '<span class="current-price-indicator">' + yValue.toString().substr(0, 4) +
				'<span class="dec-bold">' + yValue.toString().substr(4, yValue.toString().length) +
				'</span></span>');
		}
	}
	private alignCurrentPriceLabel() {
		return;
		if (this.chart.yAxis[0].plotLinesAndBands[this.getPlotLineIndex()]) {
			let plotLine = this.chart.yAxis[0].plotLinesAndBands[this.getPlotLineIndex()].svgElem;
			let label = this.chart.yAxis[0].plotLinesAndBands[this.getPlotLineIndex()].label;
			let d = plotLine.d.split(' ');
			let newY = this.chart.yAxis[0].toPixels(this.currentPrice) - d[2];
			if (d && label) {
				plotLine.animate({
					translateY: newY,
				}, 0);
				// label.animate({
				// 	translateY: this.chart.yAxis[0].toPixels(this.currentPrice) - this.chart.yAxis[0].toPixels(this.oldLabelVal)
				// },250);
				/*if (this.oldLabelVal)
					label.animate({ 'foo': this.chart.yAxis[0].toPixels(this.oldLabelVal) + 3 },
						{
							step: function (foo: any) {
								label.attr('y', foo);
							},
							duration: 0
						});
				else
					label.attr(this.chart.yAxis[0].toPixels(this.currentPrice) + 3);*/
				// label.translateY = this.chart.yAxis[0].toPixels(this.currentPrice) - this.chart.yAxis[0].toPixels(this.oldLabelVal);
				if (this.oldLabelVal) label.attr('y', this.chart.yAxis[0].toPixels(this.oldLabelVal) + 3);
				label.attr('x', +d[4] + 18);
				label.attr('text', '<span class="current-price-indicator">' + this.currentPrice.toString().substr(0, 4) +
					'<span class="dec-bold">' + this.currentPrice.toString().substr(4, this.currentPrice.toString().length) +
					'</span></span>');
				this.oldLabelVal = this.currentPrice;
			}
		}
	}
	private getPlotLineIndex() {
		for (var i = 0; i < this.chart.yAxis[0].plotLinesAndBands.length; i++) {
			if (this.chart.yAxis[0].plotLinesAndBands[i].id == 'currentPrice') {
				break;
			}
		}
		return i;
	}
	getMorePastData() {
		if (this.lastRecordDate && this.lastRecordDate != this.lastReqRecordDate) {
			this.lastReqRecordDate = this.lastRecordDate;
			this.chartLoaded = false;
			this.tradeService.getPastCandles(this.wtStorageService.selectedSymbol,
				this.wtStorageService.selectedTimeFrame, '60', this.lastRecordDate.substr(0, 19) + 'Z').subscribe(
					(previousData: any) => {
						if (previousData.bars.length > 0
							&& this.wtStorageService.selectedSymbol === previousData.info.symbol
							&& this.wtStorageService.selectedTimeFrame === previousData.info.timeframe.toLowerCase()) {
							this.lastRecordDate = previousData.bars[0].datetime;
							if (this.chartData[0][0] > new Date(previousData.bars[0].datetime).getTime()) {
								var priceList: any = [];
								previousData.bars.forEach((data: any) => {
									priceList.push([
										/*moment(data['datetime']).tz(Constants.DefaultTimeZone).isDST() ? new Date(data['datetime']).getTime() - 3600000
											: new Date(data['datetime']).getTime(), // change required to handle daylight saving*/
										new Date(data['datetime']).getTime(),
										data['open'],
										data['high'],
										data['low'],
										data['close']
									]);
								});
								// this.getCurrentTime(previousData.bars[(previousData.bars.length-1)].datetime);
								this.chartData = priceList.concat(this.chartData);
								this.chart.series[0].setData(Object.assign([], this.chartData), true, true, true);
								this.indicatorService.updatePreviousPoints(this.chart, [this.chart.series[0].xData, this.chart.series[0].yData], this.indicatorsComponent);
							}
						}
						this.chartLoaded = true;
						this.initLoad = true;
						this.accountSwitch = false;
					}
				);
		}
	}

	clicked(event: any) {
		event.preventDefault();
	}

	private filterEmptyVal(obj: any) {
		if (null == obj || "object" != typeof obj) return obj;
		let copy = obj.constructor();
		for (let attr in obj) {
			if (obj.hasOwnProperty(attr) && obj[attr]) copy[attr] = obj[attr];
		}
		return copy;
	}
	private getIndex(arr: any, obj: any) {
		let index = -1;
		for (let i = 0; i < arr.length; i++) {
			if (arr[i].symbol === obj.symbol && arr[i].timeFrame === obj.timeFrame) {
				index = i;
				break;
			}
		}
		return index;
	}
	private isInChartTab(arr: any, obj: any) {
		if (arr.length === 0) return false;
		let isEleUnique = false;
		for (let i = 0; i < arr.length; i++) {
			if (arr[i].symbol === obj.symbol && arr[i].timeFrame === obj.timeFrame) {
				isEleUnique = true;
				break;
			}
		}
		return isEleUnique;
	}
	private isEmpty(obj: any) {

		if (obj == null) return true;

		if (obj.length > 0) return false;
		if (obj.length === 0) return true;

		if (typeof obj !== "object") return true;

		for (var key in obj) {
			if (hasOwnProperty.call(obj, key)) return false;
		}
		return true;
	}

	private removeFromArray(originalObj: any, obj: any) {
		return originalObj.filter((item: any) => {
			return (item.symbol === obj.symbol && item.timeFrame === obj.timeFrame) ? false : true;
		})

	}

	private clone(obj: any) {
		let copy: any;

		// Handle the 3 simple types, and null or undefined
		if (null == obj || "object" != typeof obj) return obj;

		// Handle Date
		if (obj instanceof Date) {
			copy = new Date();
			copy.setTime(obj.getTime());
			return copy;
		}

		// Handle Array
		if (obj instanceof Array) {
			copy = [];
			for (var i = 0, len = obj.length; i < len; i++) {
				copy[i] = this.clone(obj[i]);
			}
			return copy;
		}

		// Handle Object
		if (obj instanceof Object) {
			copy = {};
			for (var attr in obj) {
				if (obj.hasOwnProperty(attr)) copy[attr] = this.clone(obj[attr]);
			}
			return copy;
		}

		throw new Error("Unable to copy obj! Its type isn't supported.");
	}

	soundClick(event: any) {
		let settings = JSON.parse(localStorage.getItem('settings'));
		if (settings == null || !settings[this.wtStorageService.selectedMt4Account.accountId]) {
			if (settings == null)
				settings = {
					[this.wtStorageService.selectedMt4Account.accountId]:
						{ sound: this.wtStorageService.soundSetting, oneClick: this.wtStorageService.oneclickSetting }
				};
			else
				settings[this.wtStorageService.selectedMt4Account.accountId] =
					{ sound: this.wtStorageService.soundSetting, oneClick: this.wtStorageService.oneclickSetting };
		}
		this.wtStorageService.soundSetting = this.wtStorageService.soundSetting ? false : true;
		settings[this.wtStorageService.selectedMt4Account.accountId].sound = this.wtStorageService.soundSetting;
		localStorage.setItem('settings', JSON.stringify(settings));
	}

	oneClickSettingTogggle(event: any) {
		let settings = JSON.parse(localStorage.getItem('settings'));
		if (settings == null || !settings[this.wtStorageService.selectedMt4Account.accountId]) {
			if (settings == null)
				settings = {
					[this.wtStorageService.selectedMt4Account.accountId]:
						{ sound: this.wtStorageService.soundSetting, oneClick: this.wtStorageService.oneclickSetting }
				};
			else
				settings[this.wtStorageService.selectedMt4Account.accountId] =
					{ sound: this.wtStorageService.soundSetting, oneClick: this.wtStorageService.oneclickSetting };
		}
		this.wtStorageService.oneclickSetting = this.wtStorageService.oneclickSetting ? false : true;
		settings[this.wtStorageService.selectedMt4Account.accountId].oneClick = this.wtStorageService.oneclickSetting;
		localStorage.setItem('settings', JSON.stringify(settings));
	}

	switchLanguage(event: any, lang) {
		event.preventDefault();
		this.lang = lang.code;
		this.translateService.selectLang(lang.code);
		var flagImageName = this.getFlagUrlName(lang.code);
		this.countryFlagUrl = lang.flagUrl + '?v=' + cacheBusting[flagImageName];
		localStorage.setItem('lanGuage', lang.code);
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
	}

	// usClicked(event: any) {
	// 	event.preventDefault();
	// 	this.lang = 'en';
	// 	this.translateService.selectLang('en');
	// 	this.countryFlagUrl = 'assets/images/us-flag.jpg';
	// 	// localStorage.setItem('lanGuage','en');
	// 	const custom_variables = [
	// 		{ name: 'Preferred Language', value: 'en' }
	// 	];
	// 	if (environment.WT_CONFIG.liveChatLicenseId) {
	// 		const lcAPI2 = setInterval(() => {
	// 			if (window['LC_API']) {
	// 				window['LC_API'].set_custom_variables(custom_variables);
	// 				clearInterval(lcAPI2);
	// 			}
	// 		}, 1000);
	// 	}

	// }

	// chiClicked(event: any) {
	// 	event.preventDefault();
	// 	this.lang = 'zh';
	// 	this.translateService.selectLang('zh');
	// 	this.countryFlagUrl = 'assets/images/zh-flag.png';
	// 	// localStorage.setItem('lanGuage','zh');
	// 	const custom_variables = [
	// 		{ name: 'Preferred Language', value: 'zh' }
	// 	];
	// 	if (environment.WT_CONFIG.liveChatLicenseId) {
	// 		const lcAPI3 = setInterval(() => {
	// 			if (window['LC_API']) {
	// 				window['LC_API'].set_custom_variables(custom_variables);
	// 				clearInterval(lcAPI3);
	// 			}
	// 		}, 1000);
	// 	}
	// }

	// thClicked(event: any) {
	// 	event.preventDefault();
	// 	this.lang = 'th';
	// 	this.translateService.selectLang('th');
	// 	this.countryFlagUrl = 'assets/images/th-flag.png';
	// 	// localStorage.setItem('lanGuage','th');
	// 	const custom_variables = [
	// 		{ name: 'Preferred Language', value: 'th' }
	// 	];
	// 	if (environment.WT_CONFIG.liveChatLicenseId) {
	// 		const lcAPI3 = setInterval(() => {
	// 			if (window['LC_API']) {
	// 				window['LC_API'].set_custom_variables(custom_variables);
	// 				clearInterval(lcAPI3);
	// 			}
	// 		}, 1000);
	// 	}
	// }

	saveLang() {
		localStorage.setItem('lanGuage', this.lang);
	}

	closeLang() {
		this.translateService.selectLang(localStorage.getItem('lanGuage'));
		this.lang = localStorage.getItem('lanGuage');
		var zhFlag = 'assets/images/zh-flag.png?v=' + cacheBusting['zh-flag.png'];
		var enFlag = 'assets/images/us-flag.png?v=' + cacheBusting['us-flag.png'];
		this.countryFlagUrl = localStorage.getItem('lanGuage') == 'zh' ? zhFlag : enFlag;
	}

	@HostListener('window:popstate', ['$event'])
	onPopState(event: any) {
		this.getConfirmation();
	}

	getConfirmation() {
		var mssg = new TranslatePipe(this.translateService).transform("Log_Out_Mssg");
		var retVal = confirm(mssg);
		let self = this;
		self.ignoreHashChange = true;
		window.onhashchange = function () {
			if (!self.ignoreHashChange) {
				self.ignoreHashChange = true;
			} else {
				self.ignoreHashChange = false;
			}
		};
		// var retVal = confirm("You will be logged out, Do you want to continue ?");
		if (retVal == true) {
			this.logOut();
			//   return true;
		}
		else {
			//   return false;
		}
	}
	hideKeyPad(amtInput: any) {
		if (this.device === "ipad" || this.device === "android" || this.device === "iphone") amtInput.blur();
	}

	ngOnDestroy() {
		this.renderer.removeClass(document.body, 'webtrader-chart');
	}
	// @HostListener('window:keydown', ['$event'])
	//      keyboardInput(event: any) {
	//             if(event.keyCode == 116){
	// 				this.getConfirmation();
	//                 // alert('No Refresh Dude..!!');
	//                 // this.toggleDpDown(true,null);
	//             }
	//      }
	// 	 getConfirmation(){
	// 		 var retVal = confirm("You will be logged out, Do you want to continue ?");
	//        if( retVal == true ){
	// 		  this.logOut();
	//         //   return true;
	//        }
	//        else{
	//         //   return false;
	// 	 }
	// 	 }




	heightManage() {
		console.log(this.isMobileDevice);
		if (this.isMobileDevice && window.innerHeight > window.innerWidth) {
			this.windowHeight = window.innerHeight;
			this.headerWrapperHeight = this.windowHeight - ((document.getElementsByClassName('header-wrapper')[0].clientHeight) + (document.getElementsByClassName('right-wrapper')[0].clientHeight) + (document.getElementsByClassName('quick-wrappper')[0].clientHeight));
			console.log(this.headerWrapperHeight);
			setTimeout(() => {
				this.headerWrapperHeight = this.windowHeight - ((document.getElementsByClassName('header-wrapper')[0].clientHeight) + (document.getElementsByClassName('right-wrapper')[0].clientHeight) + (document.getElementsByClassName('quick-wrappper')[0].clientHeight));
				console.log(this.headerWrapperHeight);
			}, 0);
		}
		else {
			this.windowHeight = window.innerHeight;
			this.headerWrapperHeight = this.windowHeight - (document.getElementsByClassName('header-wrapper')[0].clientHeight);
			console.log(this.headerWrapperHeight);
		}
	}
	manageWidth() {

		this.headerWrapperWidth = window.innerWidth - (document.getElementsByClassName('right-wrapper')[0].clientWidth);
		console.log(this.headerWrapperWidth);
	}

	getFlagUrlName(code) {
		if (code=='en') {
			return 'us-flag.png';
		}
		return code + '-flag.png';
	}

}
