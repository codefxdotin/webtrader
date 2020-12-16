import { Pipe, PipeTransform } from "@angular/core";

/*
 * Pipe is used to maintain the order of latest open trade on the top  in open trade view slide bar.
 * 
 */

@Pipe( {
name: 'openTradeOrderbyId'
} )

export class OpenTradeOrderbyIdPipe implements PipeTransform {
transform( openTrades: any ,openTrade:any ): any {
    openTrades.sort( ( a: any, b: any ) => {
        if(a.id > b.id ){
            return -1;
        }else if(a.id < b.id){
            return 1;
        }else{
            return 0;
        }
        
    } );
    return openTrades;
  }
}