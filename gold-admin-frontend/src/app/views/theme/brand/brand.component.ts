// Angular
import { AfterViewInit, Component, OnInit, ChangeDetectorRef } from '@angular/core';
// Layout
import { LayoutConfigService, ToggleOptions } from '../../../core/_base/layout';
import { HtmlClassService } from '../html-class.service';
import { UploadOfferService } from '../../../core/upload-data';
import { tap, filter } from 'rxjs/operators';
import { GoldRateService } from '../../../core/upload-data/gold-rate/gold-rate.service';
import { Router, NavigationEnd } from '@angular/router';

@Component({
	selector: 'kt-brand',
	styles: [`.gold-rate{
		 
		 /* padding-left: 62px ; */
	}`],
	templateUrl: './brand.component.html',
})
export class BrandComponent implements OnInit, AfterViewInit {
	// Public properties
	headerLogo: string;
	headerStickyLogo: string;
	height: number;
	showGoldRateFlag = false;

	toggleOptions: ToggleOptions = {
		target: 'body',
		targetState: 'kt-aside--minimize',
		togglerState: 'kt-aside__brand-aside-toggler--active'
	};
	goldRate: any;
	rate: any;

	/**
	 * Component constructor
	 *
	 * @param layoutConfigService: LayoutConfigService
	 * @param htmlClassService: HtmlClassService
	 */
	constructor(private layoutConfigService: LayoutConfigService, public htmlClassService: HtmlClassService,
		public goldRateService: GoldRateService, private ref: ChangeDetectorRef, private router: Router) {

		this.router.events
			.pipe(filter(event => event instanceof NavigationEnd))
			.subscribe(event => {
				this.hideGoldRate();	
			});

		this.goldRateService.getGoldRate().pipe(
			tap(res => {
				// console.log(res)
				this.rate = res.goldRate;
				this.goldRateService.goldRate.next(this.rate);
				this.hideGoldRate();
				this.ref.detectChanges();
			})
		).subscribe(res => {

		});
		// this.goldRateService.goldRate.next(this.rate);
	}

	/**
	 * @ Lifecycle sequences => https://angular.io/guide/lifecycle-hooks
	 */

	/**
	 * On init
	 */
	ngOnInit(): void {
		this.height = 110;
		this.headerLogo = this.layoutConfigService.getLogo();
		this.headerStickyLogo = this.layoutConfigService.getStickyLogo();
		// var rate;


		// this.goldRateService.goldRate$.subscribe(res => {
		// 	// console.log(res);
		// 	this.goldRate = res
		// 	this.ref.detectChanges();
		// });
	}

	/**
	 * On after view init
	 */
	ngAfterViewInit(): void {
	}

	hideGoldRate() {
		if (this.router.url.includes('/broker/')) {
			this.showGoldRateFlag = false;
		} else {
			this.showGoldRateFlag = true;
		}
	}
}
