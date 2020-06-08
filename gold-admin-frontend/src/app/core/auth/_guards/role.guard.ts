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
import {
  Router,
  CanActivate,
  ActivatedRouteSnapshot
} from '@angular/router';
import { AuthService } from '../_services/auth.service';
// import decode from 'jwt-decode';
@Injectable()
export class RoleGuard implements CanActivate {
  constructor(public auth: AuthService, public router: Router) { }
  canActivate(route: ActivatedRouteSnapshot): boolean {
    // this will be passed from the route config
    // on the data property
    const expectedRole = route.data.expectedRole;
    const token = localStorage.getItem('token');
    // decode the token to get its payload
    // const tokenPayload = decode(token);
    const tokenPayload = (token);
    if (
      // !this.auth.isAuthenticated() ||
      tokenPayload !== expectedRole
    ) {
      this.router.navigate(['login']);
      return false;
    }
    return true;
  }
}