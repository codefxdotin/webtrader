import { Route } from '@angular/router';
import { AuthGuard } from '../shared/auth-guard/auth-guard.service';
import {TradeComponent} from './trade.component';

export const TradeRoutes: Route[] = [
  {
    path: 'trade',
    component: TradeComponent,
    canActivate: [AuthGuard]
  }
];
