 import { Pipe, PipeTransform } from '@angular/core';

/*
 * Pipe is used to show the interval of trade in open trade screen
 * 
 */

@Pipe({name: 'timePeriod'})
export class TimePeriodPipe implements PipeTransform {
  	transform(openTrade: any): any {
  		var time = (new Date(openTrade.expirationTime).getTime() - new Date(openTrade.openTime).getTime())/1000;
  		var sec:number,min:number,hr:number;
		var min = time/60;
		if(min > 1 ) {
			sec = time%60;
			min = Math.floor(min);
			if(min >= 60) {
				hr = Math.floor(min/60);
				min = min %60;
				return (hr? hr+'H' : '')+(min? ':'+min+'M' : '')+(sec? ':'+sec+'S' : '');
			} else {
				return (min? min+'M' : '')+(sec? ':'+sec+'S' : '');
			}
		} else if(min == 1){
			sec = time%60;
			return (min? min+'M' : '')+(sec? ':'+sec+'S' : '');
		}else {
			sec = time%60;
			return (sec? sec+'S' : '');
		}
  }
}
