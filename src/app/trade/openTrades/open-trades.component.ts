import { Component, Input, EventEmitter, Output } from '@angular/core';
import * as moment from 'moment-timezone';
import { TradeshubService } from '../shared/tradeshub.service';
import { PricehubService } from '../shared/pricehub.service';
import { OpenTradeStatusPipe } from './opentrade-status.pipe';
import { CountDownTimerPipe } from './countdown-timer.pipe';
import { OpenTradeOrderbyIdPipe } from './opentrade-orderbyId.pipe';
import { WTStorageService } from '../../shared/service/wt-storage.service';
import { TranslateService } from '../../shared/translate/translate.service';
import { TranslatePipe } from '../../shared/translate/translate.pipe';
import { WTCurrencyPipe } from '../../shared/pipes/wt-currency.pipe';
import { WTUtilService } from '../../shared/service/wt-util.service';
import { DeviceDetectorService } from 'ngx-device-detector';
import { timer, Subscription, interval, concat } from 'rxjs';
import { takeUntil, filter, take } from 'rxjs/operators';
import { Constants } from '../../shared/config/constants';

/**
 * This class represents the lazy loaded OpenTradeComponent.
 */
@Component({
	moduleId: module.id,
	selector: 'open-trade',
	templateUrl: 'open-trades.component.html',
	styleUrls: ['open-trades.component.scss'],
	providers: [OpenTradeStatusPipe, CountDownTimerPipe, OpenTradeOrderbyIdPipe],
	host: {
		'(window:resize)': 'onResize($event)'
	}
	
})

export class OpenTradesComponent {
	@Input() chart: any;
	showOpenTrades: boolean = false;
	disableClose: boolean = false;
	tradeViewLoaded: boolean = false;
	openTrades: Array<any> = [];
	date: Date;
	serverTime: any;
	openPositions: number = 0;
	totalExpArray: Array<number> = [];
	totalExpAmount: number = 0;
	updateHistory: boolean = false;
	serverAthens: any;
	currentAthens: any;
	isMobileDevice: boolean = false;
	windowHeight: number;
	headerWrapperHeight: number;
	device: any;
	isDocumentLoaded = false;




	@Output() closeOpenTradeView: EventEmitter<any> = new EventEmitter<any>();
	@Output() openTradeClosed: EventEmitter<any> = new EventEmitter<any>();

	constructor(private tradeshubService: TradeshubService,
		private pricehubService: PricehubService, private deviceService: DeviceDetectorService,
		private wtStorageService: WTStorageService, public wtUtilService: WTUtilService) {
			this.wtStorageService.deviceInfo = this.deviceService.getDeviceInfo();
		this.device = this.wtStorageService.deviceInfo && this.wtStorageService.deviceInfo.device || null;
		if (this.device === "Android"
			|| this.device === "iphone"
			|| (window.innerHeight > window.innerWidth && window.innerWidth < 767)) {
			this.isMobileDevice = true;
		}

			this.heightManage();
		this.isDocumentLoaded = true;
		// $(".opentrades").find(".ps__rail-y").css({"opacity":0.5});
			
		// setInterval(() => {
		// 	// console.log(this.openTrades);
		// 	this.date = moment().tz(Constants.DefaultTimeZone).valueOf() + this.wtStorageService.offsetValue;
		// }, 1000);
		
		// setInterval(() => {
		// 	if (this.openTrades.length > 0 ) {
		// 		for (var i = 0; i < this.openTrades.length; i++) {
		// 			if (!this.openTrades[i].closeTime) {
		// 				var endDate = new Date(this.openTrades[i].expirationTime).getTime();
		// 				var startDate = moment().tz(Constants.DefaultTimeZone).valueOf() + this.wtStorageService.offsetValue;
		// 				var diff = (endDate - startDate) / 1000;
		// 				this.openTrades[i].timeLeft = diff.toFixed(1);
		// 			}
		// 		}
		// 	}
		// }, 100);
		
		this.pricehubService.getPrice()
			.subscribe(
				(data: any) => {
					this.updatePrice(data);
				});

		// Calls on page refresh				
		this.tradeshubService.getOpenTrades().subscribe((openTrades: any) => {
			if (openTrades.trades && openTrades.trades.length>0) {
				for (var i = 0; i < openTrades.trades.length; i++) {
					this.renderTrade(openTrades.trades[i]);
				}
			}

			if (openTrades.serverTime && openTrades.serverTime != undefined) {
				this.serverAthens = moment(openTrades.serverTime).tz(Constants.DefaultTimeZone).valueOf();
				this.currentAthens = moment(new Date()).tz(Constants.DefaultTimeZone).valueOf();
				// if(moment.tz(Constants.DefaultTimeZone).isDST()){
				// 	this.currentAthens = this.currentAthens + 3600000;
				// }
				this.wtStorageService.offsetValue = this.serverAthens - this.currentAthens;
			}

			this.totalExpAmount = 0;
			this.totalExpArray = [];
			this.openPositions = 0;

			for (var i = 0; i < this.openTrades.length && this.chart; i++) {
				this.chart.chartStock.yAxis[0].removePlotLine(this.openTrades[i].id.toString());
			}

			this.openTrades = openTrades.trades || [];
			if (this.openTrades && this.openTrades.length > 0) {
				this.openPositions = this.openTrades.length;

				for (var i = 0; i < this.openTrades.length; i++) {
					this.totalExpArray.unshift(this.openTrades[i].amount);
					if (this.chart) {
						if (this.openTrades[i].closeTime == null) {
							this.addPlotLine(this.openTrades[i]);
						} else {
							this.chart.chartStock.yAxis[0].removePlotLine(this.openTrades[i].id.toString());
						}
					}
					this.subscribeForSymbol(this.openTrades[i].symbol);
				}
				for (let i = 0; i < this.totalExpArray.length; ++i) {
					this.totalExpAmount = this.totalExpAmount + this.totalExpArray[i];
				}
			}
		});

		// Calls on new trade
		this.tradeshubService.getTradeUpdate().subscribe((openTrade: any) => {
			if (openTrade.trade) {
				//console.log(openTrade.trade);
				this.setupOpenTradeView(openTrade.trade);

				if (openTrade.trade.closeTime == null) {
					//console.log("Trade Opened");
					this.renderTrade(openTrade.trade);
					this.subscribeForSymbol(openTrade.trade.symbol);
					if (this.chart) {
						this.addPlotLine(openTrade.trade);
					}
				} else {
					/* console.log("Trade Closed");
					var endDate = new Date(openTrade.trade.expirationTime).getTime();
					var localStartTime = moment().tz(Constants.DefaultTimeZone).valueOf() + this.wtStorageService.offsetValue;
					var timeDiff = (endDate - localStartTime) / 1000;
					var openTime = new Date(openTrade.trade.openTime).getTime();
					var diffInLocalAndServerOpenTime = (openTime-localStartTime) / 1000;

					console.log("timeDiff between endDate-localOpentime (in seconds): "+timeDiff);
					console.log("endDate or expirationTime : "+endDate);
					console.log("localStartTime : "+localStartTime);
					console.log("serverOpenTime : "+ openTime);
					console.log("serverOpenTime-localOpenTime (in seconds): "+ diffInLocalAndServerOpenTime);
					if(diffInLocalAndServerOpenTime > 0) {
						timeDiff = timeDiff - diffInLocalAndServerOpenTime;
						console.log("timeDiff after subtract extra time (in seconds): "+ timeDiff);
					} */

					this.openTradeClosed.emit(openTrade.trade);
					if (this.chart) {
						this.chart.chartStock.yAxis[0].removePlotLine(openTrade.trade.id.toString());
					}
				}
			}
		});
	}

	renderTrade(openTrade) {
		var endDate = new Date(openTrade.expirationTime).getTime();
		var localStartDate = moment().tz(Constants.DefaultTimeZone).valueOf() + this.wtStorageService.offsetValue;
		var timeDiff = (endDate - localStartDate);
		var timeDiffMod1000 = (endDate - localStartDate) % 1000;
		var timeDiffMod100 = timeDiffMod1000 % 100;
		var timeDiffInMiliSeconds = (timeDiffMod1000-timeDiffMod100) / 100;
		var finalTimeDiff = ((timeDiff) - timeDiffMod1000)/1000;
		
		var timerInterval1 = timeDiffInMiliSeconds;
		var timerInterval2 = finalTimeDiff-10;
		var timerInterval3 = 10*10;

		timeDiff = timeDiff - timeDiffMod100;
		if(timeDiff < 10*1000) {
			timerInterval1 = timeDiffInMiliSeconds;
			timerInterval2 = 0;
			timerInterval3 = finalTimeDiff * 10;
		}
		
		//console.log("timeDiff:"+timeDiff);
		//console.log("timer1-100ms:"+timerInterval1);
		//console.log("timer2-1000ms:"+timerInterval2);
		//console.log("timer3-100ms:"+timerInterval3);

		//var openTime = new Date(openTrade.openTime).getTime();
		//var diffInLocalAndServerOpenTime = (openTime-localStartDate) / 1000;

		//console.log("timeDiff between endDate-localOpentime (in seconds): "+timeDiff);
		//console.log("endDate or expirationTime : "+endDate);
		//console.log("localStartDate : "+localStartDate);
		//console.log("serverOpenTime : "+ openTime);
		//console.log("serverOpenTime-localOpenTime (in seconds): "+ diffInLocalAndServerOpenTime);
		/*if(diffInLocalAndServerOpenTime > 0) {
			timeDiff = timeDiff - diffInLocalAndServerOpenTime;
			console.log("timeDiff after subtract extra time (in seconds): "+ timeDiff);
		}

		var timer1Value = 0;
		var timer2Value = 0;
		if(timeDiff <= 10) {
			timer1Value = 0;
			timer2Value = timeDiff*10;
		} else {
			timeDiff = Math.floor(timeDiff);
			//console.log("Timer off after math.floor: " + timeDiff);
			timer1Value = timeDiff-10;
			timer2Value = 10*10;
		}
		openTrade.counter = timeDiff;
		timer2Value = timer2Value + 1; */

		openTrade.counter = timeDiff/1000;
		const timer2 = interval(1000).pipe(take(timerInterval2));
		const timer3 = interval(100).pipe(take(timerInterval3));
		const result = concat(timer2, timer3);

		const timerGap = interval(100).pipe(take(timerInterval1));
		const subscribeGap = timerGap.subscribe(val => {
			openTrade.counter = openTrade.counter - 0.1;
			//console.log('Gap - subcriber val:' + val + 'counter:' + openTrade.counter);
		},
		err => { console.log('error in contdown timer'); },
		() => {
			const subscribe = result.subscribe(val => {
				if(openTrade.counter <= 10) {
					openTrade.counter = openTrade.counter - 0.1;
					if(openTrade.counter <= 0.1) {
						openTrade.counter = openTrade.counter - 1;
					}
				} else {
					openTrade.counter = openTrade.counter - 1;
				}
				//console.log('Main - subcriber val:' + val + 'counter:' + openTrade.counter);
			},
			err => { console.log('error in contdown timer'); },
			() => {
				//console.log('trade timer finished');
			});
		});
	}

	onResize(event){
		this.heightManage();
	}
	/**
	 * For fixing the issue now
	 */
	closeFromTradeComponent() {
		for (var i = 0; i < this.openTrades.length; i++) {
			if (this.openTrades[i].closeTime != null) {
				this.openTrades.splice(i--, 1);
			}
		}
	}
	close() {
		this.disableClose = true;
		this.closeOpenTradeView.emit();

		for (var i = 0; i < this.openTrades.length; i++) {
			if (this.openTrades[i].closeTime != null) {
				this.openTrades.splice(i--, 1);
			}
		}

	}
	//closeOpenTrades(){
	//for(var i=0; i< this.openTrades.length; i++){
	//	if(this.openTrades[i].closeTime != null) {
	//		this.openTrades.splice(i,1);
	//	}
	//}
	removeAllPlotLines() {
		if (this.chart) {
			for (let i = 0; i < this.openTrades.length; i++) {
				if (this.wtStorageService.selectedSymbol != this.openTrades[i].symbol) {
					this.chart.chartStock.yAxis[0].removePlotLine(this.openTrades[i].id.toString());
				}
			}
		}
	}
	addAllPlotLines() {
		if (this.chart) {
			for (let i = 0; i < this.openTrades.length; i++) {
				if (this.wtStorageService.selectedSymbol == this.openTrades[i].symbol && this.openTrades[i].closeTime == null) {
					this.addPlotLine(this.openTrades[i]);
				}
			}
		}
	}
	private setupOpenTradeView(tradeUpdate: any) {
		var tradeLocated = false;
		//	if(this.openTrades.length > 0) {
		for (var i = 0; i < this.openTrades.length; i++) {
			if (this.openTrades[i].id == tradeUpdate.id) {
				//this.openTrades[i] = tradeUpdate;
				this.openTrades[i].action = tradeUpdate.action;
				this.openTrades[i].amount = tradeUpdate.amount;
				this.openTrades[i].closePrice = tradeUpdate.closePrice;
				this.openTrades[i].closeTime = tradeUpdate.closeTime;
				this.openTrades[i].digits = tradeUpdate.digits;
				this.openTrades[i].expirationTime = tradeUpdate.expirationTime;
				this.openTrades[i].id = tradeUpdate.id;
				this.openTrades[i].isAutomatic = tradeUpdate.isAutomatic;
				this.openTrades[i].openPrice = tradeUpdate.openPrice;
				this.openTrades[i].openTime = tradeUpdate.openTime;
				this.openTrades[i].payout = tradeUpdate.payout;
				this.openTrades[i].profit = tradeUpdate.profit;
				this.openTrades[i].symbol = tradeUpdate.symbol;
				tradeLocated = true;
				if (tradeUpdate.closeTime != null) {
					if (this.openPositions > 0) {
						this.openPositions = this.openPositions - 1;
					}
					if (this.totalExpAmount > 0 && this.totalExpArray.length > 0) {
						this.totalExpArray.shift();
						this.totalExpAmount = this.totalExpAmount - tradeUpdate.amount;
					}
				}
			}
		}

		//}
		if (!tradeLocated && tradeUpdate.closeTime == null) {
			this.openTrades.unshift(tradeUpdate);
			this.openPositions = this.openPositions + 1;
			this.totalExpArray.unshift(tradeUpdate.amount);
			this.totalExpAmount = this.totalExpAmount + tradeUpdate.amount;
		}
		//	} else {
		//		this.openTrades.push(tradeUpdate);
		//		this.openPositions = this.openPositions + 1;
		//	}
	}
	private updatePrice(data: any) {
		if (data.bar && data.bar.close)
			for (var i = 0; i < this.openTrades.length; i++) {
				if (this.openTrades[i].closeTime == null && this.openTrades[i].symbol == data.info.symbol)
					this.openTrades[i].closePrice = data.bar.close;
			}
	}
	private subscribeForSymbol(symbol: string) {
		this.pricehubService.priceHubProxy.invoke('subscribe', symbol, 'M1');
	}
	private addPlotLine(trade: any) {
		if (this.wtStorageService.selectedSymbol == trade.symbol && this.chart.chartStock.xAxis[0].getExtremes().max
			&& isNaN(this.getPlotLineIndex(trade.id.toString()))) {
			this.chart.chartStock.yAxis[0].addPlotLine({
				value: trade.openPrice,
				color: trade.action == 'Up' ? '#1fd6a4' : '#f25d65',
				arrow: true,
				label: {
					backgroundColor: trade.action == 'Up' ? '#1fd6a4' : '#f25d65',
					align: 'right',
					textAlign: 'left',
					text: '<span style="color:white;margin-top:9px;margin-left:13px">' +
						trade.openPrice
						+ '</span>',
					//useHTML: true,
					//verticalAlign: 'middle',
					zIndex: 9
				},
				width: 2,
				id: trade.id.toString(),
				zIndex: 8,
			});
			let index = this.getPlotLineIndex(trade.id.toString());
			let plotLine = this.chart.chartStock.yAxis[0].plotLinesAndBands[index].svgElem;
			let label = this.chart.chartStock.yAxis[0].plotLinesAndBands[index].label;
			if (plotLine.d && label) {
				let d = plotLine.d.split(' ');
				label.attr('y', +d[2] + 5);
				label.attr('x', +d[8] + 15);
			}
		}
	}
	private getPlotLineIndex(id: string) {
		for (let i = 0; i < this.chart.chartStock.yAxis[0].plotLinesAndBands.length; i++) {
			if (this.chart.chartStock.yAxis[0].plotLinesAndBands[i].id == id) {
				return i;
			}
		}
		return NaN;
	}
	alignPlotlineLabel() {
		for (let i = 0; i < this.openTrades.length; i++) {
			if (this.wtStorageService.selectedSymbol == this.openTrades[i].symbol && !isNaN(this.getPlotLineIndex(this.openTrades[i].id.toString()))) {
				let plotLine = this.chart.chartStock.yAxis[0].plotLinesAndBands[this.getPlotLineIndex(this.openTrades[i].id.toString())].svgElem;
				let label = this.chart.chartStock.yAxis[0].plotLinesAndBands[this.getPlotLineIndex(this.openTrades[i].id.toString())].label;
				if (plotLine.d && label) {
					let d = plotLine.d.split(' ');
					label.attr('y', +d[2] + 5);
					label.attr('x', +d[8] + 15);
				}
			}
		}
	}

	counter() {
		return !this.openTrades.length;
	}

	heightManage() {
		// Portrait mode (mobile)
		if (this.isMobileDevice && window.innerHeight > window.innerWidth) {
			this.windowHeight = window.innerHeight;
			this.headerWrapperHeight = this.windowHeight - 220;
		}	
		// landscape mode (mobile)
		if(this.isMobileDevice && window.innerHeight < window.innerWidth) {
			this.windowHeight = window.innerHeight;
			this.headerWrapperHeight = this.windowHeight - 40;
			
		}
		// desktop mode
		if(!this.isMobileDevice){
			this.windowHeight = window.innerHeight;
			this.headerWrapperHeight = this.windowHeight;

		}
	}
}
