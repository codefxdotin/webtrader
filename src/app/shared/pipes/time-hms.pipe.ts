import {Pipe, PipeTransform} from '@angular/core';

/*
 * Pipe to convert given time to seconds, hours and min 
 */

@Pipe({name: 'timeHMS'})
export class TimeHMSPipe implements PipeTransform {
  transform(time: number): any {
    var sec: number, min: number, hr: number;
    var min = time / 60;
    if (time <= 0) {
      sec = 0;
      return sec + 's';
    }
    if (min > 1) {
      sec = time % 60;
      min = Math.floor(min);
      if (min >= 60) {
        hr = Math.floor(min / 60);
        min = min % 60;
        return (hr ? hr + 'H' : '') + (min ? ':' + min + 'M' : '') + (sec ? ':' + sec + 's' : '');
      } else {
        return (min ? min + 'M' : '') + (sec ? ':' + sec + 's' : '');
      }
    } else if (min == 1) {
      sec = time % 60;
      return (min ? min + 'M' : '') + (sec ? ':' + sec + 's' : '');
    } else {
      sec = time % 60;
      return (sec ? sec + 's' : '');
    }

  }
}
