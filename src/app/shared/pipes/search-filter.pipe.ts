import {Pipe, PipeTransform, Injectable} from '@angular/core';

@Pipe({
  name: 'searchFilter'
})
export class CustomSearchPipe implements PipeTransform {

  transform(items: any, searchObj: any): any {
    if (!searchObj || !searchObj.value || (searchObj.value.toString().trim() === undefined
        || searchObj.value.toString().trim() === null
        || searchObj.value.toString().trim() === '')) {
      return items;
    }
    return items.filter((item: any) => {
      if (searchObj.key) {
        return item[searchObj.key].toLowerCase().includes(searchObj.value.toString().trim().toLowerCase());
      } else {
        return item.toLowerCase().includes(searchObj.value.toString().trim().toLowerCase());
      }

    });
  }
}
