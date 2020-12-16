import {Pipe, PipeTransform} from '@angular/core';

/*
 * Pipe to iterate through key value pair of json with key being string
 * (key, value) of Object
 */

@Pipe({name: 'wtcurrency'})
export class WTCurrencyPipe implements PipeTransform {
  transform(currString: any): any {
    let newStr;
    if (typeof currString !== 'undefined' || currString !== null) {
      if (currString.indexOf('(') > -1) {
        newStr = currString.replace(/\((.*?)\)/, '-$1');
        return newStr;
      } else {
        return currString;
      }
    } else {
      return currString;
    }
  }
}
