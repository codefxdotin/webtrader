import {Injectable} from '@angular/core';
import {ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot} from '@angular/router';
import {WTStorageService} from '../../shared/service/wt-storage.service';

@Injectable()
export class AuthGuard implements CanActivate {
  routes: any = ['/', '/trade', '/register'];

  constructor(private router: Router,
              private wtStorageService: WTStorageService) {
  }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    let url: string = state.url;
    if (this.routes.indexOf(url) === -1) {
      this.router.navigate(['/']);
      return false;
    }
    return this.checkLogin(url);
  }

  checkLogin(url: string): boolean {
    let selectedMt4Account = this.wtStorageService && this.wtStorageService.selectedMt4Account ||
      JSON.parse(sessionStorage.getItem('mt4Account'));
    if (selectedMt4Account && selectedMt4Account.validate && url !== '/trade') {
      this.router.navigate(['/trade']);
      return false;
    }

    if (!(selectedMt4Account && selectedMt4Account.validate) && url !== '/') {
      if (url === '/register') {
        this.router.navigate(['/register']);
      } else {
      this.router.navigate(['/']);
      }
      return false;
    }

    return true;
  }
}
