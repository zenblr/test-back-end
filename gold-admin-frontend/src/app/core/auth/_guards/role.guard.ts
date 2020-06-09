import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from '@angular/router';
import { AuthService } from '../_services/auth.service';
import { SharedService } from '../../shared/services/shared.service';

@Injectable()
export class RoleGuard implements CanActivate {
  userType: any;

  constructor(
    private router: Router,
    private authService: AuthService,
    private sharedService: SharedService
  ) { }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    const expectedRole = route.data.expectedRole;
    const userDetails = this.sharedService.getDataFromStorage();
    this.userType = userDetails.userDetails.userTypeId;
    if (!this.authService.isLoggedIn() || this.userType !== expectedRole) {
      this.router.navigate(['/auth/login']);
      return false;
    } else {
      return true;
    }
  }
}