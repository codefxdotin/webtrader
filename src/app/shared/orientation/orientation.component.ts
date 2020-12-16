import {Component, ViewChild} from '@angular/core';
import {Router} from '@angular/router';
import {Observable} from 'rxjs';
import {NgbActiveModal} from '@ng-bootstrap/ng-bootstrap';
//import {TradeService} from '../../trade/index';
import {WTStorageService} from '../service/wt-storage.service';
import {TranslatePipe} from '../translate/translate.pipe';

/**
 * This class represents the component.
 */
@Component({
  moduleId: module.id,
  selector: 'orientation',
  templateUrl: 'orientation.component.html'
  // ,
  // styleUrls: ['orientation.component.css']
})

export class OrientationComponent {
  isAndriod: boolean = false;

  constructor(public activeModal: NgbActiveModal,
              public wtStorageService: WTStorageService) {
    this.isAndriod = this.wtStorageService.deviceInfo.device === 'android';
  }

  closeModal() {
    this.activeModal.close();
  }

  goFS() {
    let document: any = window.document;
    let fs = document.getElementById('body_full_screen');
    if (!document.fullscreenElement &&
      !document.mozFullScreenElement && !document.webkitFullscreenElement && !document.msFullscreenElement) {
      if (fs.requestFullscreen) {
        fs.requestFullscreen();
      } else if (fs.msRequestFullscreen) {
        fs.msRequestFullscreen();
      } else if (fs.mozRequestFullScreen) {
        fs.mozRequestFullScreen();
      } else if (fs.webkitRequestFullscreen) {
        fs.webkitRequestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if (document.msExitFullscreen) {
        document.msExitFullscreen();
      } else if (document.mozCancelFullScreen) {
        document.mozCancelFullScreen();
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
      }
    }
    this.activeModal.dismiss();
  }
}
