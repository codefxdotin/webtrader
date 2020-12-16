import {Pipe, PipeTransform} from '@angular/core';

/*
 * Pipe to iterate through key value pair of json with key being string
 * (key, value) of Object
 */

@Pipe({name: 'keyValue'})
export class KeyValuePipe implements PipeTransform {
  transform(jsonObject: any): any {
    if (!jsonObject) return [];
    return Object.keys(jsonObject);
  }
}
