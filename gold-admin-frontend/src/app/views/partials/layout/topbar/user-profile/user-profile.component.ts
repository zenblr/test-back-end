import { Component, Input, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { AuthService } from '../../../../../core/auth';
import { SharedService } from '../../../../../core/shared/services/shared.service';
import { Router } from '@angular/router';
import { map, catchError } from 'rxjs/operators';
import { CookieService } from 'ngx-cookie-service';

@Component({
	selector: 'kt-user-profile',
	templateUrl: './user-profile.component.html',
})
export class UserProfileComponent implements OnInit {
	user$: Observable<any>;
	@Input() avatar: boolean = true;
	@Input() greeting: boolean = true;
	@Input() badge: boolean;
	@Input() icon: boolean;

	constructor(
		private router: Router,
		private sharedService: SharedService,
		private auth: AuthService,
		private cookieService: CookieService
	) { }

	ngOnInit(): void {
		this.user$ = this.sharedService.getTokenDecode()
	}

	redirectToMyTask() {
		this.router.navigate(['/mytask']);
	}

	logout() {
		this.auth.logout().pipe(map(
			res => {
				localStorage.clear();
				this.cookieService.deleteAll();
				this.sharedService.role.next(null);
				this.router.navigate(['/auth/login']);
			}
		), catchError(err => {
			throw err
		})).subscribe()
	}

	redirect() {
		this.router.navigate(['/viewuser']);
	}
}
