import {Component} from '@angular/core';
import {NgbActiveModal} from '@ng-bootstrap/ng-bootstrap';
import {WTStorageService} from '../service/wt-storage.service';
import {TranslatePipe} from '../translate/translate.pipe';

/**
 * This class represents the component.
 */
@Component({
  moduleId: module.id,
  selector: 'mobile.device',
  templateUrl: 'mobile-device.component.html'
  // ,
  // styleUrls: ['mobile-device.component.css']
})

export class MobileDeviceComponent {
  constructor(public activeModal: NgbActiveModal,
              public wtStorageService: WTStorageService) {

  }

  closeModal() {
    this.activeModal.close();
  }
}
