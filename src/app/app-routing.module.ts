import {NgModule} from '@angular/core';
import {Routes, RouterModule} from '@angular/router';
import {PageNotFoundComponent} from './shared/page-not-found/page-not-found.component';
import {AuthGuard} from './shared/auth-guard/auth-guard.service';
import {LoginRoutes} from './login/login.routes';
import {TradeRoutes} from './trade/trade.routes';
import * as environment from '../environments/wt.environment';


const routes: Routes = [...LoginRoutes, ...TradeRoutes, {
  path: '**', component: PageNotFoundComponent,
  canActivate: [AuthGuard]
}];

const routesNew: Routes =[...TradeRoutes, {
  path: '**', component: PageNotFoundComponent,
  canActivate: [AuthGuard]
}];
var isWhale = false;
// For this code will manage login routes
// if(environment.WT_CONFIG.BRAND_NAME == 'myWhale' ){
//   isWhale = true;
// }



@NgModule({
  imports: [isWhale? RouterModule.forChild(routesNew) : RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {
}
