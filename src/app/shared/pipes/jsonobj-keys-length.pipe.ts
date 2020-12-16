import {Pipe, PipeTransform} from '@angular/core';

/*
 * Pipe to iterate through key value pair of json with key being string
 * (key, value) of Object
 */

@Pipe({name: 'objKeysLength'})
export class ObjKeysLengthPipe implements PipeTransform {
  transform(jsonObject: any): any {
    let emptyFlag: boolean = true;
    for (var key in jsonObject) {
      if (jsonObject.hasOwnProperty(key) && jsonObject[key].length > 0) emptyFlag = false;
    }
    return emptyFlag;
  }
}
