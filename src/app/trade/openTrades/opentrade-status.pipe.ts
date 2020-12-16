 import { Pipe, PipeTransform } from '@angular/core';

/*
 * Pipe is used to show the result of trade in open trade
 * 
 */

@Pipe({name: 'openTradeStatus'})
export class OpenTradeStatusPipe implements PipeTransform {
  transform(tradeObj: any): any {
  	var status = '';
    	if(tradeObj.closeTime != null) {
    		if(tradeObj.profit == 0)
    			status = 'Draw';
    		if(tradeObj.profit > 0)
    			status = 'Win';
    		if(tradeObj.profit < 0)
    			status = 'Loss'
    	}
    	tradeObj.status = status;
    return status;
  }
}
