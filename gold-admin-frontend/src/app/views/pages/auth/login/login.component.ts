// Angular
import { ChangeDetectorRef, Component, OnDestroy, OnInit, ViewEncapsulation, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
// RxJS
import { Observable, Subject } from 'rxjs';
import { finalize, takeUntil, tap, catchError } from 'rxjs/operators';
// Translate
import { TranslateService } from '@ngx-translate/core';
// Store


// Auth
import { AuthNoticeService,} from '../../../../core/auth';

// services
import { AuthService } from '../../../../core/auth/_services/auth.service';
import { ToastrService } from 'ngx-toastr';
import { ToastrComponent } from '../../../../views/partials/components/toastr/toastr.component';

/**
 * ! Just example => Should be removed in development
 */
const DEMO_PARAMS = {
	EMAIL: '',
	PASSWORD: ''
};

@Component({
	selector: 'kt-login',
	templateUrl: './login.component.html',
	styleUrls: ['./login.component.scss'],
	encapsulation: ViewEncapsulation.None
})
export class LoginComponent implements OnInit, OnDestroy {

	@ViewChild(ToastrComponent, { static: true }) toastr: ToastrComponent;
	// Public params
	loginForm: FormGroup;
	loading = false;
	isLoggedIn$: Observable<boolean>;
	errors: any = [];

	private unsubscribe: Subject<any>;

	private returnUrl: any;

	// Read more: => https://brianflove.com/2016/12/11/anguar-2-unsubscribe-observables/

	/**
	 * Component constructor
	 *
	 * @param router: Router
	 * @param auth: AuthService
	 * @param authNoticeService: AuthNoticeService
	 * @param translate: TranslateService
	 * 
	 * @param fb: FormBuilder
	 * @param cdr
	 * @param route
	 */
	constructor(
		private router: Router,
		private auth: AuthService,
		private authNoticeService: AuthNoticeService,
		private translate: TranslateService,
		
		private fb: FormBuilder,
		private cdr: ChangeDetectorRef,
		private route: ActivatedRoute,
	) {
		this.unsubscribe = new Subject();

	}

	/**
	 * @ Lifecycle sequences => https://angular.io/guide/lifecycle-hooks
	 */

	/**
	 * On init
	 */
	ngOnInit(): void {
		this.initLoginForm();

		// redirect back to the returnUrl before login
		this.route.queryParams.subscribe(params => {
			this.returnUrl = params.returnUrl || '/';
		});
	}

	/**
	 * On destroy
	 */
	ngOnDestroy(): void {
		this.authNoticeService.setNotice(null);
		this.unsubscribe.next();
		this.unsubscribe.complete();
		this.loading = false;
	}

	/**
	 * Form initalization
	 * Default params, validators
	 */
	initLoginForm() {
		// demo message to show
		if (!this.authNoticeService.onNoticeChanged$.getValue()) {
			const initialNotice = `Use account
			<strong>${DEMO_PARAMS.EMAIL}</strong> and password
			<strong>${DEMO_PARAMS.PASSWORD}</strong> to continue.`;
			this.authNoticeService.setNotice(initialNotice, 'info');
		}

		this.loginForm = this.fb.group({
			mobileNo: [null, Validators.compose([Validators.required,
			Validators.pattern(/^(\d{10}|\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3}))$/),]
			)],
			password: [DEMO_PARAMS.PASSWORD, Validators.compose([
				Validators.required,
				// Validators.minLength(3),
				// Validators.maxLength(100)
			])
			]
		});
	}

	/**
	 * Form Submit
	 */
	submit() {
		const controls = this.loginForm.controls;
		/** check form */
		if (this.loginForm.invalid) {
			Object.keys(controls).forEach(controlName =>
				controls[controlName].markAsTouched()
			);
			return;
		}

		this.loading = true;

		const authData = {
			mobileNo: controls.mobileNo.value,
			password: controls.password.value
		};
		this.auth
			.login(authData.mobileNo, authData.password)
			.pipe(
				tap(res => {
					// console.log(user);
					if (res) {
						// this.store.dispatch(new Login({ authToken: user.accessToken }));
						localStorage.setItem('UserDetails', JSON.stringify(res));
						// debugger
						if (this.returnUrl === '/') {
							this.router.navigate(['/dashboard']);
						} else {
							this.router.navigateByUrl(this.returnUrl); // Main page
						}
						// this.router.navigateByUrl(this.returnUrl); // Main page
					} else {
						this.authNoticeService.setNotice(this.translate.instant('AUTH.VALIDATION.INVALID_LOGIN'), 'danger');
					}
					const msg = 'Successfully Logged In';
					this.toastr.successToastr(msg);

				}),
				takeUntil(this.unsubscribe),
				finalize(() => {
					this.loading = false;
					this.cdr.markForCheck();
				}),
				catchError(err => {
					let showError = JSON.stringify(err.error.message);
					this.toastr.errorToastr(showError);
					throw err;

				})
			)
			.subscribe();
	}
	signInWithOtp() {
		if (this.loginForm.controls.mobileNo.invalid) {
			this.loginForm.controls.mobileNo.markAsTouched();
			return
		}
		this.auth.generateOtp(this.loginForm.controls.mobileNo.value).pipe(
			tap(response => {
				if (response) {
					this.authNoticeService.setNotice(this.translate.instant('AUTH.FORGOT.SUCCESS'), 'success');
					localStorage.setItem('reference', btoa(response.referenceCode))
					localStorage.setItem('mobile', this.loginForm.controls.mobileNo.value)
					this.router.navigate(['/auth/sign-in-otp'])
				} else {
					this.authNoticeService.setNotice(this.translate.instant('AUTH.VALIDATION.NOT_FOUND', { name: this.translate.instant('AUTH.INPUT.EMAIL') }), 'danger');
				}
			}),
			catchError(err => {
				this.toastr.errorToastr(err.error.message);
				throw err;
			}),
			takeUntil(this.unsubscribe),
			finalize(() => {
				this.loading = false;
				this.cdr.markForCheck();
			})
		).subscribe();

	}
	/**
	 * Checking control validation
	 *
	 * @param controlName: string => Equals to formControlName
	 * @param validationType: string => Equals to valitors name
	 */
	isControlHasError(controlName: string, validationType: string): boolean {
		const control = this.loginForm.controls[controlName];
		if (!control) {
			return false;
		}

		const result = control.hasError(validationType) && (control.dirty || control.touched);
		return result;
	}
}
