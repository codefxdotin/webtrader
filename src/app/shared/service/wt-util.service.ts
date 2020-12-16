import {Injectable} from '@angular/core';

@Injectable()
export class WTUtilService {
  config: any;
  promptEvent: any;
colorsFlipped: any = false;
  constructor(configuration: any) {
    this.config = configuration;

    // window.addEventListener('beforeinstallprompt', event => {
    //   this.promptEvent = event;
    // });

  }

  flipColors() {
    const ele = document.body;
    const greenColorCode = getComputedStyle(ele).getPropertyValue('--green');
    const redColorCode = getComputedStyle(ele).getPropertyValue('--red');
   // set variable on inline style
    ele.style.setProperty('--red', redColorCode );
    ele.style.setProperty('--green', greenColorCode);
    this.colorsFlipped = true;
  }

}
