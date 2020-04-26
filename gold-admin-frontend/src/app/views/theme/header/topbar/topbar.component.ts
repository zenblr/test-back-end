// Angular
import { Component, OnInit, Input } from '@angular/core';
import { Router } from '@angular/router';
import { Location } from "@angular/common";
import { CustomerManagementService } from '../../../../core/customer-management/services/customer-management.service';
import { LoanSettingsService } from '../.././../../core/loan-setting'
import { PartnerService } from '../.././../../core/user-management/partner/services/partner.service';
import { BranchService } from '../.././../../core/user-management/branch/services/branch.service';
import { RolesService } from '../.././../../core/user-management/roles';
import { BrokerService } from '../../../../core/user-management/broker';
import { SubheaderService } from '../../../../core/_base/layout';
import { Breadcrumb } from '../../../../core/_base/layout/services/subheader.service';
import { Subscription, Subject } from 'rxjs';
import { SharedService } from '../../../../core/shared/services/shared.service';
import { takeUntil } from 'rxjs/operators';

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
		public sharedService:SharedService,
		public subheaderService: SubheaderService,
		private router: Router,
		private location: Location,
		private customerManagementServiceCustomer: CustomerManagementService,
		private loanSettingService: LoanSettingsService,
		private partnerService: PartnerService,
		private branchService: BranchService,
		private rolesService: RolesService,
		private brokerService: BrokerService) {

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
					console.log(this.title)
				});
			}
		}));

		this.subscriptions.push(this.subheaderService.breadcrumbs$.subscribe(bc => {
			Promise.resolve(null).then(() => {
				this.breadcrumbs = bc;
				console.log(this.breadcrumbs)
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
		this.destroy$.next()
		this.destroy$.complete()
		this.rightButton = false;
		this.type1 = '';
		this.value1 = '';
		this.type2 = '';
		this.value2 = '';
		this.showfilter = false;
		this.showInput = false;
		this.toogle = false;
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
			this.showfilter = true;
			this.showInput = true;
			this.value1 = 'Add New Lead';
			this.type1 = 'button';
		}
		if (this.path == 'partner') {
			this.showfilter = true;
			this.showInput = true;
			this.value1 = 'Add Partner';
			this.type1 = 'button';
		}
		if (this.path == 'customer-list') {
			this.showfilter = true;
			this.showInput = true;
			this.toogle = true;
		}
		if (this.path == 'branch') {
			this.showfilter = true;
			this.showInput = true;
			this.value1 = 'Add New Branch';
			this.type1 = 'button';
		}
		if (this.path == 'roles') {
			this.showInput = true;
			this.rightButton = true
			this.type2 = 'button';
			this.value2 = 'Add New Role';
		}
		if (this.path == 'broker') {
			this.showInput = true;
			this.rightButton = true
			this.type1 = 'button';
			this.value1 = 'Add Broker';
		}
		if (this.path == 'merchant') {
			this.showInput = true;
			this.rightButton = true
			this.type1 = 'button';
			this.value1 = 'Add Merchant';
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
		if (this.path == 'merchant') {
			this.router.navigate(['/user-management/add-merchant'])
		}
	}

	check(val) {
		this.customerManagementServiceCustomer.toggle.next(val)
		console.log('hi1');
	}
}
