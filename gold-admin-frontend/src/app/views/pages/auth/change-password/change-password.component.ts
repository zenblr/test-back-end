// Angular
import { ChangeDetectorRef, Component, OnDestroy, OnInit, ViewEncapsulation, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
// RxJS
import { finalize, takeUntil, tap, catchError } from 'rxjs/operators';
// Translate
import { TranslateService } from '@ngx-translate/core';
// NGRX


// Auth
import { AuthNoticeService, AuthService, User } from '../../../../core/auth';
import { Subject } from 'rxjs';
import { ConfirmPasswordValidator } from './confirm-password.validator';
import { ToastrComponent } from '../../../../views/partials/components';

@Component({
	selector: 'kt-change-password',
	templateUrl: './change-password.component.html',
	encapsulation: ViewEncapsulation.None
})
export class ChangePassword implements OnInit, OnDestroy {
	changePasswordForm: FormGroup;
	loading = false;
	errors: any = [];
	@ViewChild(ToastrComponent, { static: true }) toastr: ToastrComponent;


	private unsubscribe: Subject<any>; // Read more: => https://brianflove.com/2016/12/11/anguar-2-unsubscribe-observables/

	/**
	 * Component constructor
	 *
	 * @param authNoticeService: AuthNoticeService
	 * @param translate: TranslateService
	 * @param router: Router
	 * @param auth: AuthService
	 * 
	 * @param fb: FormBuilder
	 * @param cdr
	 */
	constructor(
		private authNoticeService: AuthNoticeService,
		private translate: TranslateService,
		private router: Router,
		private auth: AuthService,

		private fb: FormBuilder,
		private cdr: ChangeDetectorRef
	) {
		this.unsubscribe = new Subject();
		var referenceCode = localStorage.getItem('reference')
		if (!referenceCode) {
			this.router.navigate(['/auth/login'])
		}
	}

	/*
	 * @ Lifecycle sequences => https://angular.io/guide/lifecycle-hooks
    */

	/**
	 * On init
	 */
	ngOnInit() {
		this.initRegisterForm();
	}

	/*
    * On destroy
    */
	ngOnDestroy(): void {
		this.unsubscribe.next();
		this.unsubscribe.complete();
		this.loading = false;
	}

	/**
	 * Form initalization
	 * Default params, validators
	 */
	initRegisterForm() {
		this.changePasswordForm = this.fb.group({
			password: ["", Validators.compose([
				Validators.required,
				Validators.minLength(8),
				Validators.maxLength(100)
			])
			],
			confirmPassword: ["", Validators.compose([
				Validators.required,
				Validators.minLength(8),
				Validators.maxLength(100)
			])
			]
		},
			{
				validator: ConfirmPasswordValidator.MatchPassword
			});
	}
	get controls() {
		if (this.changePasswordForm)
			return this.changePasswordForm.controls;
	}

	/**
	 * Form Submit
	 */
	submit() {
		const controls = this.changePasswordForm.controls;

		// check form
		if (this.changePasswordForm.invalid) {
			Object.keys(controls).forEach(controlName =>
				controls[controlName].markAsTouched()
			);
			return;
		}

		this.loading = true;
		var referenceCode = atob(localStorage.getItem('reference'))
		var newPassword = controls.password.value

		this.auth.changeforgotpassword(newPassword, referenceCode, 'forget').pipe(
			tap(user => {
				if (user) {
					// pass notice message to the login page
					this.toastr.successToastr(user.message);
					localStorage.removeItem('mobile')
					localStorage.removeItem('reference')
					this.router.navigateByUrl('/auth/login');
				} else {
					this.authNoticeService.setNotice(this.translate.instant('AUTH.VALIDATION.INVALID_LOGIN'), 'danger');
				}
			}),
			catchError(err => {
				this.toastr.successToastr(err.error.message);
				throw (err)
			}),
			takeUntil(this.unsubscribe),
			finalize(() => {
				this.loading = false;
				this.cdr.markForCheck();
			})
		).subscribe();
	}

	isControlHasError(controlName: string, validationType: string): boolean {
		const control = this.changePasswordForm.controls[controlName];
		if (!control) {
			return false;
		}
		const result = control.hasError(validationType) && (control.dirty || control.touched);
		return result;
	}
}
