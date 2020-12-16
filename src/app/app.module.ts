import { BrowserModule } from '@angular/platform-browser';
import { NgModule, InjectionToken, Directive } from '@angular/core';
import { PerfectScrollbarModule, PerfectScrollbarConfigInterface, PERFECT_SCROLLBAR_CONFIG } from 'ngx-perfect-scrollbar';
import { AppComponent } from './app.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { LoginModule } from './login/login.module';
import { SharedModule } from './shared/shared.module';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NgIdleModule } from '@ng-idle/core';
import { DeviceDetectorModule } from 'ngx-device-detector';
import { APP_BASE_HREF } from '@angular/common';
import { WT_CONFIG } from '../environments/wt.environment';
import { AppRoutingModule } from './app-routing.module';
import { RouterModule } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { ModalModule } from 'ngx-bootstrap/modal';
import { TradeModule } from './trade/trade.module';
import { WTUtilService } from './shared/service/wt-util.service';
import { NoActionLink } from './shared/directives/anchor-tag-action.directive';
import { HttpModule } from '@angular/http';
import * as Sentry from '@sentry/browser';
import { LivechatWidgetModule } from '@livechat/angular-widget';
import { environment } from '../environments/environment';
import { ServiceWorkerModule } from '@angular/service-worker';

// Sentry.init({ dsn: 'https://6a3da438e51c4288b56dbf1b1eae440c@sentry.io/1256649' });
const DEFAULT_PERFECT_SCROLLBAR_CONFIG: PerfectScrollbarConfigInterface = {
  suppressScrollX: true
};

let WTUtil_CONFIG = new InjectionToken<any>('WTUTIL');

export function WTUtilFactory(config: any) {
  return new WTUtilService(config);
}

@NgModule({
  declarations: [AppComponent],
  imports: [HttpClientModule, HttpModule, LivechatWidgetModule,
    BrowserModule, FormsModule, ReactiveFormsModule, RouterModule.forRoot([]), AppRoutingModule,
    LoginModule, SharedModule.forRoot(), NgbModule.forRoot(),
    NgIdleModule.forRoot(),
    PerfectScrollbarModule,
    DeviceDetectorModule.forRoot(),
    BsDropdownModule.forRoot(),
    TooltipModule.forRoot(),
    ModalModule.forRoot(),
    TradeModule
    //ServiceWorkerModule.register('./ngsw-worker.js', { enabled: true })
  ],
  providers: [
    {
      provide: APP_BASE_HREF,
      useValue: '/' + WT_CONFIG.IMAGE_ROOT
    },
    {
      provide: WTUtil_CONFIG,
      useValue: WT_CONFIG
    },
    {
      provide: WTUtilService,
      useFactory: WTUtilFactory, deps: [WTUtil_CONFIG]
    },
    {
      provide: Directive,
      useValue: NoActionLink, multi: true
    },
    {
      provide: PERFECT_SCROLLBAR_CONFIG,
      useValue: DEFAULT_PERFECT_SCROLLBAR_CONFIG
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
}
