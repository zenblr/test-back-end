import { Subscription } from 'rxjs';
// Angular
import { ChangeDetectionStrategy, Component, OnDestroy, OnInit, ChangeDetectorRef } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
// Layout
import { LayoutConfigService, SplashScreenService, TranslationService } from './core/_base/layout';
// language list
import { locale as enLang } from './core/_config/i18n/en';
import { locale as chLang } from './core/_config/i18n/ch';
import { locale as esLang } from './core/_config/i18n/es';
import { locale as jpLang } from './core/_config/i18n/jp';
import { locale as deLang } from './core/_config/i18n/de';
import { locale as frLang } from './core/_config/i18n/fr';
import { SharedService } from './core/shared/services/shared.service';

import { Spinkit } from 'ng-http-loader';
import { AuthService } from './core/auth';
import { ToastrService } from 'ngx-toastr';
import { CookieService } from 'ngx-cookie-service';

@Component({
	// tslint:disable-next-line:component-selector
	selector: 'kt-root',
	templateUrl: './app.component.html',
	styleUrls: ['./app.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppComponent implements OnInit, OnDestroy {
	// Public properties
	title = 'Metronic';
	loader: boolean;
	private unsubscribe: Subscription[] = []; // Read more: => https://brianflove.com/2016/12/11/anguar-2-unsubscribe-observables/

	public spinkit = Spinkit;
	hideLoader: boolean;
	/**
	 * Component constructor
	 *
	 * @param translationService: TranslationService
	 * @param router: Router
	 * @param layoutConfigService: LayoutCongifService
	 * @param splashScreenService: SplashScreenService
	 */
	constructor(
		private translationService: TranslationService,
		private router: Router,
		private layoutConfigService: LayoutConfigService,
		private splashScreenService: SplashScreenService,
		private sharedService: SharedService,
		private authService: AuthService,
		private ref: ChangeDetectorRef,
		private toast: ToastrService,
		private cookieService: CookieService,
	) {

		if(this.cookieService.check('test')){
			console.log(this.cookieService.check('test'))
		}
		if (this.cookieService.get('Token') && this.cookieService.get('modules') &&
			this.cookieService.get('permissions') && this.cookieService.get('userDetails')) {
			const userData = {
				Token: JSON.parse(this.cookieService.get('Token')),
				modules: JSON.parse(this.cookieService.get('modules')),
				permissions: JSON.parse(this.cookieService.get('permissions')),
				userDetails: JSON.parse(this.cookieService.get('userDetails')),
			}
			localStorage.setItem('UserDetails', JSON.stringify(userData));
			this.cookieService.deleteAll();
			setTimeout(() => {
				this.router.navigate(['/broker/dashboard']);
			});
		}
		// if(window.location.protocol != 'https:' && !window.location.href.includes('localhost')) {
		// 	location.href = location.href.replace("http://", "https://");
		//   }
		// register translations
		this.translationService.loadTranslations(enLang, chLang, esLang, jpLang, deLang, frLang);
		// this.sharedService.loader$.subscribe(res => {
		// 	if (res) {
		// 		this.spinner.show()
		// 	} else {
		// 		this.spinner.hide()
		// 		this.ref.markForCheck()
		// 	}
		// })
	}

	/**
	 * On init
	 */
	ngOnInit(): void {
		// enable/disable loader
		this.loader = this.layoutConfigService.getConfig('loader.enabled');

		const routerSubscription = this.router.events.subscribe(event => {
			if (event instanceof NavigationEnd) {
				// hide splash screen
				this.splashScreenService.hide();

				// scroll to top on every route change
				window.scrollTo(0, 0);

				// to display back the body content
				setTimeout(() => {
					document.body.classList.add('kt-page--loaded');
				}, 500);
			}
		});
		this.unsubscribe.push(routerSubscription);
		
		this.sharedService.hideLoader$.subscribe(res => this.hideLoader = res)
	}

	/**
	 * On Destroy
	 */
	ngOnDestroy() {
		this.unsubscribe.forEach(sb => sb.unsubscribe());
	}
}
