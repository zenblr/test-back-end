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
	currentRouteUrl: string;

	/**
	 * Service constructor
	 *
	 * @param menuConfigService: MenuConfigService
	 */
	constructor(
		private menuConfigService: MenuConfigService,
		private router: Router,
	) {
		this.currentRouteUrl = this.router.url.split('/')[1]
		this.router.events
			.pipe(filter(event => event instanceof NavigationEnd))
			.subscribe(event => {
				this.currentRouteUrl = this.router.url.split('/')[1];
				this.loadMenu();
			});

		this.loadMenu();
	}

	/**
	 * Load menu list
	 */
	loadMenu() {
		// get menu list
		var aside = ''
		if (this.currentRouteUrl == 'user-management') {
			aside = 'aside.itemsTwo'
		} else {
			aside = 'aside.itemsOne'
		}
		const menuItems: any[] = objectPath.get(this.menuConfigService.getMenus(), aside);
		this.menuList$.next(menuItems);
	}
}
