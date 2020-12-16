import {NgModule, ModuleWithProviders} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {RouterModule} from '@angular/router';
import { PerfectScrollbarModule, PerfectScrollbarConfigInterface, PERFECT_SCROLLBAR_CONFIG } from 'ngx-perfect-scrollbar';
import {PageNotFoundComponent} from '../shared/page-not-found/page-not-found.component';
import {AuthGuard} from '../shared/auth-guard/auth-guard.service';
import {NoActionLink} from '../shared/directives/anchor-tag-action.directive';
import {OnlyNumber} from './directives/onlynumber.directive';
import {MT4AuthenticateComponent} from './mt4-authenticate/mt4-authenticate.component';
import {Mt4LoginService} from './mt4-authenticate/mt4-authenticate.service';
import {WTHttpService} from './service/wt-http.service';
import {WTStorageService} from './service/wt-storage.service';
import {WTSignalrService} from './service/wt-signalr.service';
import {DepositComponent} from './deposit/deposit.component';
import {DepositService} from './deposit/deposit.service';
import {WithdrawalComponent} from './withdrawal/withdrawal.component';
import {WithdrawalService} from './withdrawal/withdrawal.service';
import {KeyValuePipe} from './pipes/key-value.pipe';
import {TimeHMSPipe} from './pipes/time-hms.pipe';
import {WTCrmService} from './service/wt-crm.service';
import {SearchListPipe} from './pipes/search-list.pipe';
import {CustomSearchPipe} from './pipes/search-filter.pipe';
import {TranslatePipe} from './translate/translate.pipe';
import {TranslateService} from './translate/translate.service';
import {TRANSLATION_PROVIDERS} from './translate/translation';
import {ObjKeysLengthPipe} from './pipes/jsonobj-keys-length.pipe';
import {IndicatorsStorageService} from './indicators/indicators-storage.service';
import {MobileDeviceComponent} from './mobile-device/mobile-device.component';
import {OrientationComponent} from './orientation/orientation.component';
import {RoundProgressService} from './round-progress-bar/round-progress.service';
import {RoundProgressConfig} from './round-progress-bar/round-progress.config';
import {RoundProgressEase} from './round-progress-bar/round-progress.ease';
import {RoundProgressComponent} from './round-progress-bar/round-progress.component';
import {WTCurrencyPipe} from './pipes/wt-currency.pipe';
import {DynamicFieldDirective} from './dynamic-form/components/dynamic-field/dynamic-field.directive';
import {DynamicFormComponent} from './dynamic-form/containers/dynamic-form/dynamic-form.component';
import {FormButtonComponent} from './dynamic-form/components/form-button/form-button.component';
import {FormInputComponent} from './dynamic-form/components/form-input/form-input.component';
import {FormSelectComponent} from './dynamic-form/components/form-select/form-select.component';
import {FileValueAccessor} from './directives/file-value-accessor.directive';
import {FileValidator} from './directives/file-validator.directive';
import {AcceptedValidator} from './directives/accepted-validator.directive';
import {UserProfileService} from './user-profile/user-profile.service';
import { WtLoggingService } from './service/wt-logging.service';


const DEFAULT_PERFECT_SCROLLBAR_CONFIG: PerfectScrollbarConfigInterface = {
  suppressScrollX: true
};
// import { ProgressBarModule } from 'angular2-progressbar';
/**
 * Do not specify providers for modules that might be imported by a lazy loaded module.
 */

@NgModule({

  imports: [CommonModule, RouterModule, FormsModule, ReactiveFormsModule, PerfectScrollbarModule],
  declarations: [MT4AuthenticateComponent, DepositComponent, WithdrawalComponent, KeyValuePipe, TimeHMSPipe, SearchListPipe,
    CustomSearchPipe, CustomSearchPipe, NoActionLink, OnlyNumber, PageNotFoundComponent, TranslatePipe, ObjKeysLengthPipe,
    MobileDeviceComponent, OrientationComponent, RoundProgressComponent, WTCurrencyPipe, DynamicFieldDirective, FileValidator,
    AcceptedValidator, DynamicFormComponent, FormButtonComponent, FormInputComponent, FormSelectComponent, FileValueAccessor],
  exports: [CommonModule, FormsModule, RouterModule, MT4AuthenticateComponent, DepositComponent, WithdrawalComponent, TimeHMSPipe,
    KeyValuePipe, SearchListPipe, CustomSearchPipe, CustomSearchPipe, NoActionLink, OnlyNumber, PageNotFoundComponent, TranslatePipe,
    ObjKeysLengthPipe, MobileDeviceComponent, OrientationComponent, RoundProgressComponent, WTCurrencyPipe, DynamicFormComponent,
    FileValueAccessor, FileValidator, AcceptedValidator],
  entryComponents: [FormButtonComponent, FormInputComponent, FormSelectComponent],
  providers: [{
    provide: PERFECT_SCROLLBAR_CONFIG,
    useValue: DEFAULT_PERFECT_SCROLLBAR_CONFIG
  }]
})
export class SharedModule {
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: SharedModule,
      providers: [WTStorageService, WTHttpService, WTSignalrService, Mt4LoginService, DepositService, WithdrawalService, WTCrmService,
        TranslateService, TRANSLATION_PROVIDERS, AuthGuard, IndicatorsStorageService, RoundProgressService, RoundProgressConfig,
        RoundProgressEase, UserProfileService, WtLoggingService]
    };
  }
}
