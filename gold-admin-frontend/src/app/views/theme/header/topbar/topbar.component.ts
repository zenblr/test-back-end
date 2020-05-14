// Angular
import { Component, OnInit, Input } from '@angular/core';
import { Router } from '@angular/router';
import { Location } from "@angular/common";
import { CustomerManagementService } from '../../../../core/customer-management/services/customer-management.service';
import { LoanSettingsService } from '../.././../../core/loan-setting'
import { PartnerService } from '../.././../../core/user-management/partner/services/partner.service';
import { BranchService } from '../.././../../core/user-management/branch/services/branch.service';
import { WalletPriceService } from '../.././../../core/emi-management/config-details/wallet-price/services/wallet-price.service';
import { RolesService } from '../.././../../core/user-management/roles';
import { BrokerService } from '../../../../core/user-management/broker';
import { CategoryService, SubCategoryService } from '../../../../core/emi-management/product';
import { InternalUserService } from '../.././../../core/user-management/internal-user';
import { AppraiserService } from '../../../../core/user-management/appraiser';
import { InternalUserBranchService } from '../../../../core/user-management/internal-user-branch'
import { Breadcrumb } from '../../../../core/_base/layout/services/subheader.service';
import { Subject, Subscription, from } from 'rxjs';
import { SharedService } from '../../../../core/shared/services/shared.service';
import { SubheaderService } from '../../../../core/_base/layout';
import { takeUntil } from 'rxjs/operators';
import { PacketsService } from '../../../../core/loan-management';
import { StoreService } from '../../../../core/user-management/store/service/store.service';
import { LogisticPartnerService } from '../../../../core/emi-management/logistic-partner/service/logistic-partner.service';
import { KaratDetailsService } from '../../../../core/loan-setting/karat-details/services/karat-details.service';

@Component({
	selector: 'kt-topbar',
	templateUrl: './topbar.component.html',
	styleUrls: ['./topbar.component.scss'],
})
export class TopbarComponent implements OnInit {
	// Public properties
	@Input() fluid: boolean;
	@Input() clear: boolean;

	today: number = Date.now();
	title: string = '';
	desc: string = '';
	totalRecords: number = 0;
	breadcrumbs: Breadcrumb[] = [];
	destroy$ = new Subject()
	// Private properties
	private subscriptions: Subscription[] = [];

	rightButton: boolean = false;
	showfilter: boolean = false
	type1: string;
	value1: string;
	type2: string;
	value2: string;
	showInput: boolean;
	toogle: boolean;
	toogler: string;
	path: string;
	constructor(
		public sharedService: SharedService,
		public subheaderService: SubheaderService,
		private router: Router,
		private location: Location,
		private customerManagementServiceCustomer: CustomerManagementService,
		private loanSettingService: LoanSettingsService,
		private partnerService: PartnerService,
		private branchService: BranchService,
		private rolesService: RolesService,
		private brokerService: BrokerService,
		private walletPriceService: WalletPriceService,
		private categoryService: CategoryService,
		private subCategoryService: SubCategoryService,
		private internalUserService: InternalUserService,
		private internalUserBranchService: InternalUserBranchService,
		private appraiserService: AppraiserService,
		private packetService: PacketsService,
		private storeService: StoreService,
		private logisticPartnerService: LogisticPartnerService,
		private karatDetailsService: KaratDetailsService) {

		this.router.events.subscribe(val => {
			this.reset()
			this.setTopbar(location.path())
		})
	}

	ngOnInit() {
		this.setTopbar(this.router.url)
	}
	ngAfterViewInit(): void {

		this.subscriptions.push(this.sharedService.totalCount$.pipe(
			takeUntil(this.destroy$)
		).subscribe(ct => {
			if (ct) {
				Promise.resolve(null).then(() => {
					this.totalRecords = ct;
					console.log(this.totalRecords)
				});
			}
		}));
		this.subscriptions.push(this.subheaderService.title$.subscribe(bt => {
			// breadcrumbs title sometimes can be undefined
			if (bt) {
				Promise.resolve(null).then(() => {
					this.title = bt.title;
					this.desc = bt.desc;
				});
			}
		}));

		this.subscriptions.push(this.subheaderService.breadcrumbs$.subscribe(bc => {
			Promise.resolve(null).then(() => {
				this.breadcrumbs = bc;
			});
		}));
	}
	/**
	 * On destroy
	 */
	ngOnDestroy(): void {
		this.subscriptions.forEach(sb => sb.unsubscribe());
	}
	reset() {
		this.totalRecords = 0;
		this.rightButton = false;
		this.type1 = '';
		this.value1 = '';
		this.type2 = '';
		this.value2 = '';
		this.showfilter = false;
		this.showInput = false;
		this.toogle = false;
	}

	dataSourceHeader() {
		this.showfilter = true;
		this.showInput = true;
		this.type1 = 'button';
	}

	setTopbar(path: string) {
		var pathArray = path.split('/')
		this.path = pathArray[pathArray.length - 1]
		if (this.path == 'scheme') {
			this.rightButton = true;
			this.value2 = 'Add New Scheme';
			this.type2 = 'button';
		}
		if (this.path == 'lead-management') {
			this.dataSourceHeader()
			this.value1 = 'Add New Lead';

		}
		if (this.path == 'partner') {
			this.dataSourceHeader()
			this.value1 = 'Add Partner';
		}
		if (this.path == 'logistic-partner') {
			this.showfilter = true;
			this.showInput = true;
			this.value1 = 'Add Logistic Partner';
			this.type1 = 'button';
		}
		if (this.path == 'karat-details') {
			this.rightButton = true;
			// this.showInput = true;
			this.value2 = 'Add Karat Details';
			this.type2 = 'button';
		}
		if (this.path == 'customer-list') {
			this.showfilter = true;
			this.showInput = true;
			this.toogle = true;
		}
		if (this.path == 'branch') {
			this.dataSourceHeader()
			this.value1 = 'Add New Branch';
		}
		if (this.path == 'assign-appraiser') {
			this.dataSourceHeader()
			this.value1 = 'Add Appraiser';
		}
		if (this.path == 'roles') {
			this.showInput = true;
			this.rightButton = true
			this.type2 = 'button';
			this.value2 = 'Add New Role';
		}
		if (this.path == 'broker') {
			this.dataSourceHeader()
			this.value1 = 'Add Broker';
		}
		if (this.path == 'merchant') {
			this.dataSourceHeader()
			this.value1 = 'Add Merchant';
		}
		if (this.path == 'wallet-price') {
			this.rightButton = true;
			this.type2 = 'button';
			this.value2 = 'Edit Wallet Price';
		}
		if (this.path == 'bulk-upload-report') {
			this.showfilter = true;
			this.showInput = true;
		}
		if (this.path == 'products') {
			this.showfilter = true;
			this.showInput = true;
		}
		if (this.path == 'category') {
			this.rightButton = true
			this.showfilter = true;
			this.showInput = true;
			this.value2 = 'Add Category';
			this.type2 = 'button';
		}
		if (this.path == 'sub-category') {
			this.rightButton = true
			this.showfilter = true;
			this.showInput = true;
			this.value2 = 'Add Sub Category';
			this.type2 = 'button';
		}
		if (this.path == 'internal-user') {
			this.dataSourceHeader()
			this.value1 = 'Add Internal User';
		}
		if (this.path == 'internal-user-branch') {
			this.dataSourceHeader()
			this.value1 = 'Add Internal Branch';
		}
		if (this.path == 'packet') {
			this.dataSourceHeader()
			this.value1 = 'Add Packets';
		}
		if (this.path == 'store') {
			this.dataSourceHeader()
			this.value1 = 'Create Stores';
		}
		if (this.path == 'bulk-upload-product') {
			this.rightButton = true;
			this.type2 = 'button';
			this.value2 = 'Show Report';
		}
		if (this.path == 'admin-log') {
			this.showfilter = true;
			this.showInput = true;
		}
	}

	action(event: Event) {

		if (this.path == 'lead-management') {
			this.customerManagementServiceCustomer.openModal.next(true);
		}
		if (this.path == 'scheme') {
			this.loanSettingService.openModal.next(true)
		}
		if (this.path == 'partner') {
			this.partnerService.openModal.next(true)
		}
		if (this.path == 'branch') {
			this.branchService.openModal.next(true)
		}
		if (this.path == 'roles') {
			this.rolesService.openModal.next(true)
		}
		if (this.path == 'broker') {
			this.brokerService.openModal.next(true)
		}
		if (this.path == 'internal-user') {
			this.internalUserService.openModal.next(true)
		}
		if (this.path == 'assign-appraiser') {
			this.appraiserService.openModal.next(true)
		}
		if (this.path == 'merchant') {
			this.router.navigate(['/user-management/add-merchant'])
		}
		if (this.path == 'wallet-price') {
			this.walletPriceService.openModal.next(true)
		}
		if (this.path == 'category') {
			this.categoryService.openModal.next(true)
		}
		if (this.path == 'sub-category') {
			this.subCategoryService.openModal.next(true)
		}
		if (this.path == 'internal-user-branch') {
			this.internalUserBranchService.openModal.next(true)
		}
		if (this.path == 'packet') {
			this.packetService.openModal.next(true)
		}
		if (this.path == 'store') {
			this.storeService.openModal.next(true)
		}
		if (this.path == 'bulk-upload-product') {
			this.router.navigate(['/emi-management/bulk-upload-report']);
		}
		if (this.path == 'logistic-partner') {
			this.logisticPartnerService.openModal.next(true)
		}
		if (this.path == 'karat-details') {
			this.karatDetailsService.openModal.next(true)
		}
	}

	check(val) {
		this.customerManagementServiceCustomer.toggle.next(val)
		console.log('hi1');
	}
}
