
import {forkJoin as observableForkJoin, of as observableOf, Observable} from 'rxjs';
import {Component, ViewChild} from '@angular/core';
import {Router} from '@angular/router';
import {NgbActiveModal} from '@ng-bootstrap/ng-bootstrap';
import {TradeService} from '../../trade/shared/trade.service';
import * as moment from 'moment-timezone';
import {Mt4LoginService} from './mt4-authenticate.service';
import {WTStorageService} from '../service/wt-storage.service';
import swal from 'sweetalert2';
import {TranslatePipe} from '../translate/translate.pipe';
import cacheBusting from '../../../cache-busting/cache-busting.json';


/**
 * This class represents the component.
 */
@Component({
  moduleId: module.id,
  selector: 'mt4-authenticate',
  templateUrl: 'mt4-authenticate.component.html',
  styleUrls: ['mt4-authenticate.component.css'],
})

export class MT4AuthenticateComponent {

  loginId: string = '';
  mt4Accounts: any = [];
  disableSubmit: boolean = false;
  loggedIn: boolean = false;
  passwordEmpty: boolean = false;
  cacheBusting = cacheBusting;

  // rememberMe: boolean = false;

  constructor(private wtStorageService: WTStorageService,
              public activeModal: NgbActiveModal,
              private tradeService: TradeService,
              private mt4loginservice: Mt4LoginService,
              private router: Router) {
    // this.rememberMe = this.wtStorageService.rememberMe || JSON.parse(sessionStorage.getItem('rememberMe'));;
    this.loggedIn = this.wtStorageService.selectedMt4Account != null && this.wtStorageService.selectedMt4Account != '';
    this.mt4Accounts = this.wtStorageService.mt4AccountsList;
  }

  closeModal() {
    this.mt4Accounts.forEach(
      (account: any) => {
        delete account.validateStatus;
      });
    this.activeModal.close();
  }

  close() {
    var setAccFlag: boolean = false;
    this.mt4Accounts.forEach(
      (account: any) => {
        if (account.validate && account.validate === false) {
          account.password = '';
        } else if (account.isSelected && account.validate) {
          this.wtStorageService.selectedMt4Account = account;
          sessionStorage.setItem('mt4Account', JSON.stringify(account));
          setAccFlag = true;
        } else if (account.validate === true && !setAccFlag) {
          this.wtStorageService.selectedMt4Account = account;
          sessionStorage.setItem('mt4Account', JSON.stringify(account));
          setAccFlag = true;
        }
        delete account.validateStatus;
      }
    );
    this.wtStorageService.mt4AccountsList = this.mt4Accounts;
    sessionStorage.setItem('mt4AccountList', JSON.stringify(this.mt4Accounts));
    sessionStorage.removeItem('tempMt4Accounts');
    this.router.navigate(['trade']);
    this.activeModal.dismiss();
  }

  open() {
    this.mt4Accounts = this.wtStorageService.mt4AccountsList;
    this.disableSubmit = false;
  }

  login(): any {
    if (!this.loggedIn) {
      for (let i = 0; i < this.mt4Accounts.length; i++) {
        if (this.mt4Accounts[i].password == '' || this.mt4Accounts[i].password == undefined) {
          this.passwordEmpty = true;
        }
        else {
          this.passwordEmpty = false;
          break;
        }
      }
    } else {
      this.passwordEmpty = true;
      for (let i = 0; i < this.mt4Accounts.length; i++) {
        if (this.mt4Accounts[i].validate) {
          continue;
        }
        if (this.mt4Accounts[i].password != '') {
          this.passwordEmpty = false;
        }
      }
    }
    if (this.passwordEmpty) {
      return;
    }
    var obsList: any = [];
    this.mt4Accounts.forEach((account: any) => {
      this.passwordEmpty = false;
      if (account.hasOwnProperty('validateStatus') && !account.validateStatus) {
        delete account.validateStatus;
      }
      if (account.password != '' && !account.validate) {
        delete account.validate;
        obsList.push(this.mt4loginservice.mt4AuthUser(account.accountId, account.password).catch(
          (e: any) => observableOf({error: e})
        ));
      }
    });

    if (obsList.length > 0) {
      this.disableSubmit = true;
    }
    observableForkJoin(obsList).subscribe(
      (results: any) => {
        let validateFlag = false;
        results.forEach(
          (data1: any, key1: any) => {
            if (data1.error) {
              this.disableSubmit = false;
            } else {
              this.mt4Accounts.forEach(
                (data2: any, key2: any) => {
                  if (data1.login == data2.accountId && data1.access_token) {
                    this.passwordEmpty = false;
                    this.mt4Accounts[key2].validate = true; // for trade screen to check status
                    this.mt4Accounts[key2].validateStatus = true; // to display status in mt4 auth screen
                    this.mt4Accounts[key2].accessToken = data1.access_token;
                    this.mt4Accounts[key2].issuedTime = data1['.issued'];
                    this.mt4Accounts[key2].expiryTime = data1['.expires'];
                    this.mt4Accounts[key2].expiryTimeUnixTS = moment(data1['.expires']).unix();
                    this.mt4Accounts[key2].expiresIn = data1.expires_in;
                    this.mt4Accounts[key2].tokenType = data1.token_type;
                    validateFlag = true;
                  }
                });
            }

          });
        this.mt4Accounts.forEach((account: any, key: any) => {
          if (!account.hasOwnProperty('validate')) {
            if (account.password != '') {
              account.validateStatus = false; // only if password was der
              account.password = '';
            }
            account.validate = false;
            this.disableSubmit = false;
          }
        });
        if (validateFlag) {
          // if(this.rememberMe){
          // this.mt4loginservice.mt4RememberUser(this.mt4Accounts,this.rememberMe).subscribe(
          // 	(data: any) => {
          // 		sessionStorage.setItem('rememberMe',JSON.stringify(this.rememberMe));
          // 		this.wtStorageService.rememberMe = this.rememberMe;
          // 	},
          // 	(err: any) => {

          // 	});
          // }

          setTimeout(() => {
            this.close();
          }, 1000);
        }
      },
      (error: any) => {
        this.disableSubmit = false;
      }
    );
  }

  crmLogout() {
    this.tradeService.logOut()
      .subscribe((logoutInfo: any) => {
        let msg = logoutInfo.msg[0].body[0];
        swal({
          html: `<i style="color:#ffffff;">${msg}</i>`,
          timer: 1000,
          width: 300,
          padding: 20,
          allowOutsideClick: false,
          allowEscapeKey: false,
          background: '#030608 url(./assets/images/trade-dropdown-bg.jpg) 100% 100% no-repeat',
          showConfirmButton: false
        });
        sessionStorage.clear();
        this.wtStorageService.clearStorage();
        setTimeout(() => {
          this.closeModal();
          this.wtStorageService.showLogin = true;
        }, 1000);
      });
  }

}
