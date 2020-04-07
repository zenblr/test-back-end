// Angular
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Location } from "@angular/common";
import { CustomerManagementService } from '../../../../core/customer-management/services/customer-management.service';
import { LoanSettingsService } from '../.././../../core/loan-setting'
import { PartnerService } from '../.././../../core/user-management/partner/services/partner.service';
import { BranchService } from '../.././../../core/user-management/branch/services/branch.service';

@Component({
	selector: 'kt-topbar',
	templateUrl: './topbar.component.html',
	styleUrls: ['./topbar.component.scss'],
})
export class TopbarComponent implements OnInit {


	rightButton: boolean = false;
	showfilter: boolean = false
	type1: string;
	value1: string;
	type2: string;
	value2: string;
	type3: string;
	value3: string;
	showInput: boolean
	path: string;
	constructor(private router: Router,
		private location: Location,
		private customerManagementServiceCustomer: CustomerManagementService,
		private loanSettingService:LoanSettingsService,
		private partnerService :PartnerService,
		private branchService:BranchService) {

		this.router.events.subscribe(val => {
			this.reset()
			this.setTopbar(location.path())
		})
	}

	ngOnInit() {
		this.setTopbar(this.router.url)
	}
	reset() {
		this.rightButton = false;
		this.type1 = '';
		this.value1 = '';
		this.type2 = '';
		this.value2 = '';
		this.type3 = '';
		this.value3 = '';
		this.showfilter = false
		this.showInput = false
	}

	setTopbar(path: string) {
		var pathArray = path.split('/')
		this.path = pathArray[pathArray.length - 1]
		if (this.path == 'scheme') {
			this.rightButton = true;
			this.value3 = 'Add New Scheme';
			this.type3 = 'button';
		}
		if (this.path == 'customer-management') {
			this.showfilter = true;
			this.showInput = true;
			this.value1 = 'Search';
			this.type1 = 'button';
			this.value2 = 'Add New Lead';
			this.type2 = 'button';
		}
		if (this.path == 'partner') {
			this.showfilter = true;
			this.showInput = true;
			this.value1 = 'Search';
			this.type1 = 'button';
			this.value2 = 'Add Partner';
			this.type2 = 'button';
		}
		if (this.path == 'branch') {
			this.showfilter = true;
			this.showInput = true;
			this.value1 = 'Search';
			this.type1 = 'button';
			this.value2 = 'Add New Branch';
			this.type2 = 'button';
		}
	}

	action(event: Event) {

		if (this.path == 'customer-management') {
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
	}
}
