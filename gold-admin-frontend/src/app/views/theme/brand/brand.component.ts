// Angular
import { AfterViewInit, Component, OnInit, ChangeDetectorRef } from '@angular/core';
// Layout
import { LayoutConfigService, ToggleOptions } from '../../../core/_base/layout';
import { HtmlClassService } from '../html-class.service';
import { UploadOfferService } from '../../../core/upload-data';
import { tap } from 'rxjs/operators';

@Component({
	selector: 'kt-brand',
	styles: [`.gold-rate{
		font-weight: 600;
		color: #ffde9c;
		 background-color: #454D67; 
		 padding: 15px 0; 
		 /* padding-left: 62px ; */
	}`],
	templateUrl: './brand.component.html',
})
export class BrandComponent implements OnInit, AfterViewInit {
	// Public properties
	headerLogo: string;
	headerStickyLogo: string;
	height: number;

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
		private uploadOfferService: UploadOfferService, private ref: ChangeDetectorRef) {

		this.uploadOfferService.getGoldRate().pipe(
			tap(res => {
				// console.log(res)
				this.rate = res.goldRate;
				this.uploadOfferService.goldRate.next(this.rate);
				this.ref.detectChanges();

			})
		).subscribe(res => {

		});
		// this.uploadOfferService.goldRate.next(this.rate);
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


		this.uploadOfferService.goldRate$.subscribe(res => {
			// console.log(res);
			this.goldRate = res
			this.ref.detectChanges();
		});
	}

	/**
	 * On after view init
	 */
	ngAfterViewInit(): void {
	}
}
