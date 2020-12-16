import {Component} from '@angular/core';
import {NgbActiveModal} from '@ng-bootstrap/ng-bootstrap';
import {UserProfileService} from './user-profile.service';
import {WTStorageService} from '../service/wt-storage.service';
import cacheBusting from '../../../cache-busting/cache-busting.json';

@Component({
  moduleId: module.id,
  selector: 'user-profile',
  templateUrl: 'user-profile.component.html',
  styleUrls: ['user-profile.component.css'],
})
export class UserProfileComponent {

  viewUserProfile: boolean = false;
  isDataLoaded: boolean = false;
  user: any;
  cacheBusting = cacheBusting;

  constructor(private userProfileService: UserProfileService,
              private activeModal: NgbActiveModal,
              private wtStorageService: WTStorageService) {

    if (this.wtStorageService.user) this.user = this.wtStorageService.user;
    this.userProfileService.getUserProfileDetails()
      .subscribe((data: any) => {
        this.isDataLoaded = true;
        this.user = data;
        this.wtStorageService.user = this.user;
      });
  }

  close() {
    this.activeModal.close();
  }

}
