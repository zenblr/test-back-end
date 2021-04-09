import {
	AfterViewInit,
	ChangeDetectionStrategy,
	ChangeDetectorRef,
	Component,
	ElementRef,
	OnInit,
	Renderer2,
	ViewChild
} from '@angular/core';
import { filter, catchError, map } from 'rxjs/operators';
import { NavigationEnd, Router } from '@angular/router';
import * as objectPath from 'object-path';
// Layout
import { LayoutConfigService, MenuAsideService, MenuOptions, OffcanvasOptions } from '../../../core/_base/layout';
import { HtmlClassService } from '../html-class.service';
import { AuthService } from '../../../core/auth';
import { SharedService } from '../../../core/shared/services/shared.service';
import { ShoppingCartService } from '../../../core/broker';
import { CookieService } from 'ngx-cookie-service';
import { NgxPermission } from 'ngx-permissions/lib/model/permission.model';
import { NgxPermissionsService } from 'ngx-permissions';

@Component({
	selector: 'kt-aside-left',
	templateUrl: './aside-left.component.html',
	styleUrls: ['./aside-left.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class AsideLeftComponent implements OnInit, AfterViewInit {

	@ViewChild('asideMenu', { static: true }) asideMenu: ElementRef;

	private returnUrl: string;
	currentRouteUrl = '';
	insideTm: any;
	outsideTm: any;
	cartTotalCount = 0;

	menuCanvasOptions: OffcanvasOptions = {
		baseClass: 'kt-aside',
		overlay: true,
		closeBy: 'kt_aside_close_btn',
		toggleBy: {
			target: 'kt_aside_mobile_toggler',
			state: 'kt-header-mobile__toolbar-toggler--active'
		}
	};

	menuOptions: MenuOptions = {
		// vertical scroll
		scroll: null,

		// submenu setup
		submenu: {
			desktop: {
				// by default the menu mode set to accordion in desktop mode
				default: 'dropdown',
			},
			tablet: 'accordion', // menu set to accordion in tablet mode
			mobile: 'accordion' // menu set to accordion in mobile mode
		},

		// accordion setup
		accordion: {
			expandAll: false // allow having multiple expanded accordions in the menu
		}
	};

	/**
	 * Component Conctructor
	 *
	 * @param htmlClassService: HtmlClassService
	 * @param menuAsideService
	 * @param layoutConfigService: LayouConfigService
	 * @param router: Router
	 * @param render: Renderer2
	 * @param cdr: ChangeDetectorRef
	 */
	constructor(
		public htmlClassService: HtmlClassService,
		public menuAsideService: MenuAsideService,
		public layoutConfigService: LayoutConfigService,
		private router: Router,
		private render: Renderer2,
		private cdr: ChangeDetectorRef,
		private auth: AuthService,
		private sharedService: SharedService,
		public shoppingCartService: ShoppingCartService,
		private ref: ChangeDetectorRef,
		private cookieService: CookieService,
		private permission: NgxPermissionsService
	) {
		this.router.events.subscribe(event => {
			if (event instanceof NavigationEnd) {
				if (event.url != '/logout' && event.url != '/auth' && event.url != '/login')
					this.returnUrl = event.url;
			}
		});
	}

	ngAfterViewInit(): void {
		this.shoppingCartService.cartCount$
			.subscribe((ct) => {
				if (ct != null) {
					Promise.resolve(null).then(() => {
						this.cartTotalCount = ct;
						// console.log(this.cartTotalCount);
						// this.ref.detectChanges();
					});
				}
			});
	}

	ngOnInit() {
		this.currentRouteUrl = this.router.url.split(/[?#]/)[0];

		this.router.events
			.pipe(filter(event => event instanceof NavigationEnd))
			.subscribe(event => {
				this.currentRouteUrl = this.router.url.split(/[?#]/)[0];
				this.cdr.markForCheck();
			});

		const config = this.layoutConfigService.getConfig();
		if (objectPath.get(config, 'aside.menu.dropdown')) {
			this.render.setAttribute(this.asideMenu.nativeElement, 'data-ktmenu-dropdown', '1');
			// tslint:disable-next-line:max-line-length
			this.render.setAttribute(this.asideMenu.nativeElement, 'data-ktmenu-dropdown-timeout', objectPath.get(config, 'aside.menu.submenu.dropdown.hover-timeout'));
		}

		if (document.body.classList.contains('kt-aside--minimize-hover')) {
			// hide the left aside menu
			this.render.removeClass(document.body, 'kt-aside--minimize-hover');
		}
		this.ref.detectChanges()
	}

	/**
	 * Check Menu is active
	 * @param item: any
	 */
	isMenuItemIsActive(item): boolean {
		if (item.submenu) {
			return this.isMenuRootItemIsActive(item);
		}

		if (!item.page) {
			return false;
		}

		return this.currentRouteUrl.indexOf(item.page) !== -1;
	}

	/**
	 * Check Menu Root Item is active
	 * @param item: any
	 */
	isMenuRootItemIsActive(item): boolean {
		let result = false;

		for (const subItem of item.submenu) {
			result = this.isMenuItemIsActive(subItem);
			if (result) {
				return true;
			}
		}

		return false;
	}

	/**
	 * Use for fixed left aside menu, to show menu on mouseenter event.
	 * @param e Event
	 */
	mouseEnter(e: Event) {
		// check if the left aside menu is fixed
		if (document.body.classList.contains('kt-aside--fixed')) {
			if (this.outsideTm) {
				clearTimeout(this.outsideTm);
				this.outsideTm = null;
			}

			this.insideTm = setTimeout(() => {
				// if the left aside menu is minimized
				if (document.body.classList.contains('kt-aside--minimize') && KTUtil.isInResponsiveRange('desktop')) {
					// show the left aside menu
					this.render.removeClass(document.body, 'kt-aside--minimize');
					this.render.addClass(document.body, 'kt-aside--minimize-hover');
				}
			}, 50);
		}
	}

	/**
	 * Use for fixed left aside menu, to show menu on mouseenter event.
	 * @param e Event
	 */
	mouseLeave(e: Event) {
		if (document.body.classList.contains('kt-aside--fixed')) {
			if (this.insideTm) {
				clearTimeout(this.insideTm);
				this.insideTm = null;
			}

			this.outsideTm = setTimeout(() => {
				// if the left aside menu is expand
				if (document.body.classList.contains('kt-aside--minimize-hover') && KTUtil.isInResponsiveRange('desktop')) {
					// hide back the left aside menu
					this.render.removeClass(document.body, 'kt-aside--minimize-hover');
					this.render.addClass(document.body, 'kt-aside--minimize');
				}
			}, 100);
		}
	}

	/**
	 * Returns Submenu CSS Class Name
	 * @param item: any
	 */
	getItemCssClasses(item) {
		let classes = 'kt-menu__item';

		if (objectPath.get(item, 'submenu')) {
			classes += ' kt-menu__item--submenu';
		}

		if (!item.submenu && this.isMenuItemIsActive(item)) {
			classes += ' kt-menu__item--active kt-menu__item--here';
		}

		if (item.submenu && this.isMenuItemIsActive(item)) {
			classes += ' kt-menu__item--open kt-menu__item--here';
		}

		// custom class for menu item
		const customClass = objectPath.get(item, 'custom-class');
		if (customClass) {
			classes += ' ' + customClass;
		}

		if (objectPath.get(item, 'icon-only')) {
			classes += ' kt-menu__item--icon-only';
		}

		return classes;
	}

	getItemAttrSubmenuToggle(item) {
		let toggle = 'hover';
		if (objectPath.get(item, 'toggle') === 'click') {
			toggle = 'click';
		} else if (objectPath.get(item, 'submenu.type') === 'tabs') {
			toggle = 'tabs';
		} else {
			// submenu toggle default to 'hover'
		}

		return toggle;
	}

	logout() {
		this.auth.logout().pipe(map(
			res => {
				// localStorage.clear();
				localStorage.removeItem('UserDetails')
				this.cookieService.deleteAll();
				this.sharedService.role.next(null);
				if (res.redirect) {
                    window.location.href = res.url;
                } else {
                    this.router.navigate(['/auth/login']);
                }
			}
		), catchError(err => {
			throw err
		})).subscribe()
	}
	switchCase(title) {
		switch (title) {
			case 'User Management':
				// this.userManagementRoute()
				break;

			case 'Log Out':
				this.logout()
				break;

			default:

				break;
		}
	}
	userManagementRoute() {
		let userManagementPermission = this.sharedService.getUserManagmentPermission()
		let userPermission = []
		this.permission.permissions$.subscribe(res => {
			// console.log(Object.keys(res).length)
			Object.keys(res).forEach(ele => {
				userPermission.push(ele)
			})
		})

		this.compareBothPermission(userManagementPermission, userPermission)
	}

	compareBothPermission(managementPermission, userPermission) {
		for (let i = 0; i < managementPermission.length; i++) {
			const management = managementPermission[i];
			for (let j = 0; j < userPermission.length; j++) {
				const user = userPermission[j];
				if (management == user) {
					var title = user
					i = managementPermission.length
					break;
				}
			}
		}
		this.routeToPage(title)
		console.log(title)
	}

	routeToPage(permission) {

		switch (permission) {
			case 'partnerView':
				this.router.navigate(['/admin/user-management/partner'])
				break;
			case 'partnerBranchView':
				this.router.navigate(['/admin/user-management/branch'])
				break;
			case 'internalUserView':
				this.router.navigate(['/admin/user-management/internal-user'])
				break;
			case 'internalBranchView':
				this.router.navigate(['/admin/user-management/internal-user-branch'])
				break;
			case 'merchantView':
				this.router.navigate(['/admin/user-management/merchant'])
				break;
			case 'brokerView':
				this.router.navigate(['/admin/user-management/broker'])
				break;
			case 'storeView':
				this.router.navigate(['/admin/user-management/store'])
				break;
			case 'concurrentLoginView':
				this.router.navigate(['/admin/user-management/concurrent-login'])
				break;
			case 'partnerBranchUserView':
				this.router.navigate(['/admin/user-management/partner-branch-user'])
				break;

			default:
				// this.router.navigate(['/admin/user-management/partner-branch-user'])
				break;
		}
	}
}
