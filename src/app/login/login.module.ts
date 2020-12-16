import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {SharedModule} from '../shared/shared.module';
import {NgbModule} from '@ng-bootstrap/ng-bootstrap';
import {LoginComponent} from './login.component';
import {LoginService} from './shared/login.service';
import {WTHttpService} from '../shared/service/wt-http.service';
import {MT4AuthenticateComponent} from '../shared/mt4-authenticate/mt4-authenticate.component';
import {MobileDeviceComponent} from '../shared/mobile-device/mobile-device.component';
import { LivechatWidgetModule } from '@livechat/angular-widget';
import { RegisterComponent } from './register/register.component';

@NgModule({
  imports: [CommonModule, SharedModule, NgbModule, LivechatWidgetModule],
  declarations: [LoginComponent, RegisterComponent],
  exports: [LoginComponent],
  providers: [LoginService, WTHttpService],
  entryComponents: [MT4AuthenticateComponent, MobileDeviceComponent]
})
export class LoginModule {
}
