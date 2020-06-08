import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router } from '@angular/router';
import { AuthService } from '../_services/auth.service';
import { SharedService } from '../../shared/services/shared.service';

@Injectable({
  providedIn: 'root'
})
export class ReverseAuthGuard implements CanActivate {
  constructor(
    private router: Router,
    private authService: AuthService,
    private sharedService: SharedService
  ) { }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    if (this.authService.isLoggedIn()) {
      this.sharedService.getUserDetailsFromStorage().subscribe(res => {
        if (res.userDetails.userTypeId == 2 || res.userDetails.userTypeId == 3) {
          this.router.navigate(['/broker']);
        } else {
          this.router.navigate(['/admin']);
        }
      });
      return false;
    } else {
      return true;
    };
  }
}
