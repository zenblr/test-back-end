// Angular
import { Injectable } from '@angular/core';
import { HttpEvent, HttpInterceptor, HttpHandler, HttpRequest, HttpResponse } from '@angular/common/http';
// RxJS
import { Observable } from 'rxjs';
import { tap, finalize, catchError } from 'rxjs/operators';
import { AuthService } from '../../../../core/auth/_services/auth.service';
import { SharedService } from '../../../../core/shared/services/shared.service';
import { Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';

/**
 * More information there => https://medium.com/@MetonymyQT/angular-http-interceptors-what-are-they-and-how-to-use-them-52e060321088
 */
@Injectable()
export class InterceptService implements HttpInterceptor {

	constructor(
		private authService: AuthService,
		private sharedSerivce: SharedService,
		private router: Router,
		private cookieService: CookieService,
	) {
	}
	// intercept request and add token
	intercept(
		request: HttpRequest<any>,
		next: HttpHandler
	): Observable<HttpEvent<any>> {
		const token = this.authService.getToken();
		// tslint:disable-next-line:no-debugger
		// modify request
		// debugger
		if (this.authService.isLoggedIn()) {
			request = request.clone({
				setHeaders: {
					Authorization: `Bearer ${token}`,
					'Cache-Control': 'no-cache',
					Pragma: 'no-cache'
				}
			});
		}

		// console.log('----request----');
		// console.log(request);
		// console.log('--- end of request---');
		// this.sharedSerivce.loader.next(true)
		return next.handle(request).pipe(
			tap(
				event => {
					if (event instanceof HttpResponse) {
						// console.log('all looks good');
						// http response status code
						// console.log(event.body.count);
						if (event.body.count != undefined) {
							this.sharedSerivce.totalCount.next(event.body.count)
						} else {
							this.sharedSerivce.totalCount.next(0)
						}

					}
				},
				error => {
					// http response status code
					// console.log('----response----');
					// console.error('status code:');
					// tslint:disable-next-line:no-debugger
					// console.error(error.status);
					// console.error(error.message);
					// console.log('--- end of response---');
				}
			),
			catchError(
				err => {
					// console.log(err.status)
					if (err.status == 401) {
						localStorage.clear();
						this.cookieService.deleteAll();
						this.router.navigate(['/auth/login']);
					}
					throw err
				}
			),
			finalize(() => {
				// this.sharedSerivce.loader.next(false)
			})
		);
	}
}
