import {Injectable} from '@angular/core';
import {BehaviorSubject} from 'rxjs';
import { hubConnection } from 'signalr-no-jquery';
import {WTStorageService} from './wt-storage.service';
import {WTUtilService} from './wt-util.service';
//import * as jQuery from 'jquery';
//declare var jQuery: JQuery;

@Injectable()
export class WTSignalrService {

  connection: any;
  
  private conStarted: BehaviorSubject<Object> = new BehaviorSubject({});
  private connectionStatus: BehaviorSubject<Object> = new BehaviorSubject({});
  private proxies: any = [];
  private tryingToReconnect: boolean = false;

  constructor(private wtStorageService: WTStorageService,
              private wtUtilService: WTUtilService) {
    this.setConnectionParams();
  }

  getHubProxy(hubName: string) {
    return this.connection.createHubProxy(hubName);
  }

  getConnectionStatus() {
    return this.connectionStatus.asObservable();
  }

  setConnectionParams() {
    let demo = sessionStorage.getItem('demo');
    if (demo == 'true') {
      this.wtStorageService.boBaseUrl = this.wtUtilService.config.BO_DEMO_BASE_URL;
    } else {
      this.wtStorageService.boBaseUrl = this.wtUtilService.config.BO_BASE_URL;
    }
    if (this.wtStorageService.boBaseUrl) {
      this.connection = hubConnection(`${this.wtStorageService.boBaseUrl}/signalr`);
    } else {
      this.connection = hubConnection(`${this.wtUtilService.config.BO_BASE_URL}/signalr`);
    }
    if (this.wtStorageService.selectedMt4Account) {
      this.connection.qs = {'Bearer': this.wtStorageService.selectedMt4Account.accessToken};
    } else {
      this.connection.qs = {'Bearer': JSON.parse(sessionStorage.getItem('mt4Account')).accessToken};
    }
    this.connection.logging = false;

    this.connection.connectionSlow(() => {
      this.connectionStatus.next('Internet connection is slow');
    });
    this.connection.reconnecting(() => {
      this.tryingToReconnect = true;
    });
    this.connection.reconnected(() => {
      this.tryingToReconnect = false;
    });

    this.connection.disconnected(() => {
      if (this.tryingToReconnect) {
        this.connectionStatus.next('Internet connection is lost. Reconnecting....');
        setTimeout(() => {
          this.startSignalrConnection();
        }, 5000);
      }
    });
    this.connection.error((error: any) => {
      if (typeof error == 'undefined' ||  error.message.indexOf('Error during negotiation request') > -1 ||
        (error.source.indexOf('TimeoutException') > -1 &&
          error.message.indexOf('The client has been inactive') > -1)) {
        this.connectionStatus.next('Connecting....');
        this.tryingToReconnect = true;
        this.startSignalrConnection();
      }
    });
  }

  

  startConnection(proxy: any) {
    this.proxies.push(proxy);
    if (this.proxies.indexOf('tradesHub') > -1 && this.proxies.indexOf('pricesHub') > -1) {
      if (this.wtStorageService.selectedMt4Account) {
        this.connection.qs = {'Bearer': this.wtStorageService.selectedMt4Account.accessToken};
      } else {
        this.connection.qs = {'Bearer': JSON.parse(sessionStorage.getItem('mt4Account')).accessToken};
      }
      this.startSignalrConnection();
    }
    return this.conStarted.asObservable();
  }

  stopConnection() {
    if  (this.connection.state != 4) {
      this.connection.stop();
      this.proxies = [];
      this.conStarted.next('Connection stopped');
    }
  }

  public startSignalrConnection() {
    this.connection.start()
      .done(
        () => {
          this.connectionStatus.next('Connection established.');
          this.conStarted.next('Connection started');
        }
      )
      .fail(
        (error: any) => {
          console.log(error);
        }
      );
  }
}
