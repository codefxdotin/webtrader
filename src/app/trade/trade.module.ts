import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../shared/shared.module';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import {PricehubService} from './shared/pricehub.service';
import {TradeshubService} from './shared/tradeshub.service';
import {TradeService} from './shared/trade.service';
import {TradeComponent} from './trade.component';
import {TradeHistoryComponent} from './history/history.component';
import {ChartComponent} from './chart/chart.component';
import {OpenTradesComponent} from './openTrades/open-trades.component';
import {OpenTradeOrderbyIdPipe} from './openTrades/opentrade-orderbyId.pipe';
import {IndicatorsComponent} from './indicators/indicators.component';
import {OpenTradeStatusPipe} from './openTrades/opentrade-status.pipe';
import {TimePeriodPipe} from './openTrades/time-period.pipe';
import {CountDownTimerPipe} from './openTrades/countdown-timer.pipe';
import {IndicatorService} from './indicators/indicator.service';
import {WTSignalrService} from '../shared/service/wt-signalr.service';
import {DepositComponent} from '../shared/deposit/deposit.component';
import {WithdrawalComponent} from '../shared/withdrawal/withdrawal.component';
import {OrientationComponent} from '../shared/orientation/orientation.component';
import {UserProfileComponent} from '../shared/user-profile/user-profile.component';
import {TranslateService} from '../shared/translate/translate.service';
import {CustomDropdownToggle} from '../shared/directives/custom-dropdown-toggle.directive';
import {TranslatePipe} from '../shared/translate/translate.pipe';
import {TRANSLATION_PROVIDERS} from '../shared/translate/translation';
import {TRANSLATIONS} from '../shared/translate/translation';
import { PerfectScrollbarModule } from 'ngx-perfect-scrollbar';
import { PERFECT_SCROLLBAR_CONFIG } from 'ngx-perfect-scrollbar';
import { PerfectScrollbarConfigInterface } from 'ngx-perfect-scrollbar';
import { LivechatWidgetModule } from '@livechat/angular-widget';
import { MalihuScrollbarModule } from 'ngx-malihu-scrollbar';

const DEFAULT_PERFECT_SCROLLBAR_CONFIG: PerfectScrollbarConfigInterface = {
  suppressScrollX: true
};



@NgModule({
    imports: [CommonModule, SharedModule, NgbModule, LivechatWidgetModule, PerfectScrollbarModule, MalihuScrollbarModule.forRoot()],
    declarations: [TradeComponent, TradeHistoryComponent, ChartComponent, OpenTradesComponent,
        IndicatorsComponent, OpenTradeStatusPipe, TimePeriodPipe, CountDownTimerPipe,
        OpenTradeOrderbyIdPipe, CustomDropdownToggle, UserProfileComponent],
    exports: [TradeComponent],
    providers: [WTSignalrService, PricehubService, TradeshubService, TradeService,
        TranslateService, IndicatorService,
      {
        provide: PERFECT_SCROLLBAR_CONFIG,
      useValue: DEFAULT_PERFECT_SCROLLBAR_CONFIG
      }],
    entryComponents: [DepositComponent,WithdrawalComponent,OrientationComponent,UserProfileComponent]
})

export class TradeModule { }
