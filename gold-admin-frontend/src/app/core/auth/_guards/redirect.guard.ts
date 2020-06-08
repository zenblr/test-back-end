// // Angular
// import { Injectable } from '@angular/core';
// import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from '@angular/router';

// import { AuthService } from '../_services/auth.service';

// @Injectable()
// export class AuthGuard implements CanActivate {
//     constructor(
//         private router: Router,
//         private authService: AuthService) { }

//     canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
//         if (this.authService.isLoggedIn()) {
//             return true;
//         } else {
//             this.router.navigate(['/auth/login']);
//             return false;
//         }
//     }
// }


import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthService } from '../_services/auth.service';
import { Observable } from 'rxjs';
import { SharedService } from '../../shared/services/shared.service';

@Injectable({
  providedIn: 'root'
})
export class RedirectGuard implements CanActivate {
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
      return true;
    } else {
      this.router.navigate(['/auth/login']);
      return false;
    }
  }
}