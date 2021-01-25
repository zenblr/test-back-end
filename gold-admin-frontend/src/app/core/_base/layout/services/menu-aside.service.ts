// Angular
import { Injectable } from '@angular/core';
// RxJS
import { BehaviorSubject } from 'rxjs';
// Object path
import * as objectPath from 'object-path';
// Services
import { MenuConfigService } from './menu-config.service';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

@Injectable()
export class MenuAsideService {
	// Public properties
	menuList$: BehaviorSubject<any[]> = new BehaviorSubject<any[]>([]);
	currentUrl = [];
	parentRouteUrl: string;
	childRouteUrl: string;

	/**
	 * Service constructor
	 *
	 * @param menuConfigService: MenuConfigService
	 */
	constructor(
		private menuConfigService: MenuConfigService,
		private router: Router,
	) {
		this.currentUrl = this.router.url.split('/');
		this.parentRouteUrl = this.currentUrl[1];
		this.childRouteUrl = this.currentUrl[2];
		this.router.events
			.pipe(filter(event => event instanceof NavigationEnd))
			.subscribe(event => {
				this.currentUrl = this.router.url.split('/');
				this.parentRouteUrl = this.currentUrl[1];
				this.childRouteUrl = this.currentUrl[2];
				this.loadMenu();
			});
		this.loadMenu();
	}

	/**
	 * Load menu list
	 */
	loadMenu() {
		// get menu list
		let aside = '';
		switch (this.parentRouteUrl) {
			case 'admin': aside = 'aside.adminItems';
				switch (this.childRouteUrl) {
					case 'user-management': aside = 'aside.userMgmtItems';
						break;
					case 'emi-management': aside = 'aside.emiMgmtItems';
						break;
					case 'scrap-management': aside = 'aside.scrapMgmtItems';
						break;
					case 'digi-gold': aside = 'aside.digiGoldItems';
						break;
				}
				break;
			case 'broker': aside = 'aside.brokerItems';
				break;
			default: aside = 'aside.adminItems';
				break;
		}
		const menuItems: any[] = objectPath.get(this.menuConfigService.getMenus(), aside);
		this.menuList$.next(menuItems);
	}
}
