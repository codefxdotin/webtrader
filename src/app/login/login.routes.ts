import {Route} from '@angular/router';
import {AuthGuard} from '../shared/auth-guard/auth-guard.service';
import {LoginComponent} from './login.component';
import { WT_CONFIG } from '../../environments/wt.environment';
import { RegisterComponent } from './register/register.component';

// New dashboard use only for Whale inc

// export const LoginRoutes: Route[] = [
//   {
//     path: 'register/:emailId',
//     component: RegisterComponent
//   },
//   {
//     path: ':lang/:promoCode',
//     component: LoginNewComponent
//   },
//   {
//     path: 'register',
//     component: RegisterComponent
//   },
//   {
//     path: 'affiliates/:lang/:promoCode',
//     component: RegisterComponent
//   },
//   {
//     path: '',
//     component: LoginNewComponent,
//     canActivate: [AuthGuard]
//   }
// ];


// Old dashboard use for this client TTM, VT, Microfox, GDEX

export const LoginRoutes: Route[] = [
  {
    path: 'register/:emailId',
    component: LoginComponent
  },
  {
    path: ':lang/:promoCode',
    component: LoginComponent
  },
  {
    path: 'register',
    component: LoginComponent
  },
  {
    path: 'affiliates/:lang/:promoCode',
    component: LoginComponent
  },
  {
    path: '',
    component: LoginComponent,
    canActivate: [AuthGuard]
  }
];


