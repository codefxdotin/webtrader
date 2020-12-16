import { Pipe, PipeTransform } from '@angular/core';
import * as moment from 'moment-timezone';

/*
 * Pipe is used to show the countdown timer for opentrade
 *
 */

@Pipe({ name: 'countDownTimer' })
export class CountDownTimerPipe implements PipeTransform {
  transform(date: any, expireTime: any, epochTimeFlag: any, openTime:any):  any {
    var timeDiff;
    if (epochTimeFlag)
      timeDiff = Math.round(moment(moment(expireTime).valueOf()).diff(
        /*moment.tz(Constants.DefaultTimeZone).isDST() ? moment(date) + 3600000 :*/ moment(date)) / 1000);
    else
      timeDiff = Math.round(moment(moment(expireTime).valueOf()).diff(moment(date).valueOf()) / 1000);
        if(openTime){
          var maxTime = (new Date(expireTime).getTime() - new Date(openTime).getTime()) / 1000;
          if(timeDiff > maxTime){
            return maxTime;
          }
        }
      return timeDiff;
  }
}
