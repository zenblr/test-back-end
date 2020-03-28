// Angular
import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from '@angular/router';
// RxJS
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
// NGRX
import { select, Store } from '@ngrx/store';
// Auth reducers and selectors
import { AppState } from '../../../core/reducers/';
import { isLoggedIn } from '../_selectors/auth.selectors';
import { AuthService } from '../_services/auth.service';

@Injectable()
export class AuthGuard implements CanActivate {
    constructor(
        private store: Store<AppState>, private router: Router,
        private authService: AuthService) { }

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
        // return this.store
        //     .pipe(
        //         select(isLoggedIn),
        //         tap(loggedIn => {
        //             if (!loggedIn) {
        //                 this.router.navigateByUrl('/auth/login');
        //             }
        //         })
        //     );

        if (this.authService.isLoggedIn()) {
            return true;
        } else {
            this.router.navigate(['/auth/login']);
            return false;
        }
    }
}
