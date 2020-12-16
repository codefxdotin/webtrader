import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable ,  Subscription } from 'rxjs';
import {WTSignalrService} from '../../shared/service/wt-signalr.service';
import {WTStorageService} from '../../shared/service/wt-storage.service';

@Injectable()
export class PricehubService {
	public priceHubProxy:any;
	public newPrice:any;
    private priceUpdate: BehaviorSubject<Object> = new BehaviorSubject({});
    private priceHubList:Subscription[] = [];

    constructor(private wtSignalrService:WTSignalrService,
                    private wtStorageService:WTStorageService) {
    	this.priceHubProxy = this.wtSignalrService.getHubProxy('pricesHub');
        this.priceHubProxy.on('update',
                (data:any) => {
                    this.newPrice = data;
                    this.priceUpdate.next(this.newPrice);
                });
    	this.startPricesHub();
    }
    startPricesHub() {
        this.priceHubList.push(this.wtSignalrService.startConnection('pricesHub')
        .subscribe(
            (status:String) => {

                if(status == 'Connection started') {
                    this.priceHubProxy = this.wtSignalrService.getHubProxy('pricesHub');
                    this.priceHubProxy.invoke('subscribe', this.wtStorageService.selectedSymbol, this.wtStorageService.selectedTimeFrame);
                    this.priceHubProxy.on('update',
                        (data:any) => {
                            this.newPrice = data;
                            this.priceUpdate.next(this.newPrice);
                        });
                }
            },
            (error:any) => {
            }
        ));
    }
    stopPricesHub(){
        this.priceHubList.forEach(s => s.unsubscribe());
        this.priceHubList = [];
        this.wtSignalrService.stopConnection();
    }
    getPrice() {
        return this.priceUpdate.asObservable();
    }
    subscribeNewSymPrice(){
        this.priceHubProxy.invoke('subscribe', this.wtStorageService.selectedSymbol, this.wtStorageService.selectedTimeFrame);
    }
    unsubscribeNewSymPrice(){
        this.priceHubProxy.invoke('Unsubscribe', this.wtStorageService.selectedSymbol, this.wtStorageService.selectedTimeFrame);
    }

}
