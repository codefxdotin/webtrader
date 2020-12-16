import {Pipe, PipeTransform} from '@angular/core';

/*
 * Pipe to search a string in array of object
 */

@Pipe({name: 'searchList'})
export class SearchListPipe implements PipeTransform {
  transform(list: any, searchString: string): any {
    let status: boolean = false;
    list.forEach((value: any, index: any) => {
      if (value.symbol == searchString) {
        status = true;
      }
    });
    return status;
  }
}
