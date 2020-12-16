import { Injectable } from '@angular/core';
import { BehaviorSubject ,  Subscription } from 'rxjs';
import {WTSignalrService} from '../../shared/service/wt-signalr.service';
declare var swal:any;

@Injectable()
export class TradeshubService {
	tradesHubProxy:any;
	configuration:any;
	tradeUpdate:any;
	openTrades:any;
	accountInfo:any;

    private configUpdate: BehaviorSubject<Object> = new BehaviorSubject({});
    private openTradeUpdate: BehaviorSubject<Object> = new BehaviorSubject({});
    private accntInfoUpdate: BehaviorSubject<Object> = new BehaviorSubject({});
    private tradeStatusUpdate:  BehaviorSubject<Object> = new BehaviorSubject({});
	private sendTradeStatus: BehaviorSubject<Object> = new BehaviorSubject({});
    private signalrStatus: BehaviorSubject<Object> = new BehaviorSubject({});
    private tradesHubList:Subscription[] = [];

    constructor(private wtSignalrService:WTSignalrService) {
        //this.tradesHubProxy = this.wtSignalrService.getHubProxy('tradesHub');
        this.createHubProxy();
        this.startTradesHub();
        this.wtSignalrService.getConnectionStatus().subscribe(
            (status:string) => {
                this.signalrStatus.next(status);
            }
        );
    }

    createHubProxy() {
        this.tradesHubProxy = this.wtSignalrService.getHubProxy('tradesHub');
        this.tradesHubProxy.on('tradesUpdate',
                        (data:any) => {
                            this.tradeUpdate = data;
                            this.tradeStatusUpdate.next(this.tradeUpdate);
                        });
                        this.tradesHubProxy.on('ConfigurationUpdate',
                        (data:any) => {
                            this.configuration = data;
                            this.configUpdate.next(this.configuration);
                        });
    }
    startTradesHub(){
        this.tradesHubList.push(this.wtSignalrService.startConnection('tradesHub')
        .subscribe(
            (status:String) => {
                 if(status == 'Connection started') {
                    this.tradesHubProxy.invoke('getConfiguration').done(
                            (config:any) => {
                                this.configuration = config;
                                this.configUpdate.next(this.configuration);
                            });
                        this.tradesHubProxy.invoke('getOpenTrades').done(
                            (openTrade:any) => {
                                this.openTrades = openTrade;
                                this.openTradeUpdate.next(this.openTrades);
                            });
                        this.tradesHubProxy.invoke('getAccountInfo').done(
                            (accountInfo:any) => {
                                this.accountInfo = accountInfo;
                                this.accntInfoUpdate.next(this.accountInfo);
                            });
                    }
                },
            (error:any) => {
            }
        ));
    }
    stopTradesHub(){
        this.tradesHubList.forEach(s => s.unsubscribe());
        this.tradesHubList = [];
        this.wtSignalrService.stopConnection();
    }
    getConfiguration() {
        return this.configUpdate.asObservable();
    }

    getOpenTrades() {
        return this.openTradeUpdate.asObservable();
    }

    getAccountInfoUpdate() {
        return this.accntInfoUpdate.asObservable();
    }
    getSignalrStatus(){
        return this.signalrStatus.asObservable();
    }
    sendTrade(trade:any){
        this.tradesHubProxy.invoke('tradeSend',trade)
            .done(  (data:any) => {
                          this.sendTradeStatus.next(data);
            })
            .fail( (error:any) => {
                this.sendTradeStatus.next({status: 500, description: error});
            });
    }
    getSendTradeStatus(){
            return this.sendTradeStatus.asObservable();
    }
    getTradeUpdate(){
        return this.tradeStatusUpdate.asObservable();
    }
}
