import {
	Component,
	EventEmitter,
	Output,
	Input,
	ChangeDetectorRef,
	ViewChild,
	ElementRef,
	OnInit,
	OnChanges,
	AfterViewInit,
	SimpleChanges,
	OnDestroy,
} from '@angular/core';
import { NgbDropdownConfig, NgbDropdown } from '@ng-bootstrap/ng-bootstrap';
import {
	FormGroup,
	Validators,
	FormBuilder,
	FormArray,
	FormControl,
} from "@angular/forms";
import { map, takeUntil, take } from "rxjs/operators";
import { Subscription, ReplaySubject, Subject } from "rxjs";
import { MatDatepickerInputEvent, MatSelect } from "@angular/material";
import { SharedService } from "../../../../core/shared/services/shared.service";
import { NgxPermissionsService } from "ngx-permissions";
import { NgSelectComponent } from '@ng-select/ng-select';
import { DatePipe } from '@angular/common';

@Component({
	selector: 'kt-filter',
	templateUrl: './filter.component.html',
	styleUrls: ['./filter.component.scss'],
	providers: [DatePipe]
})
export class FilterComponent implements OnInit, OnChanges, OnDestroy {
	@ViewChild(NgSelectComponent, { static: true }) cityRef: NgSelectComponent;
	@ViewChild("filterDropdown", { static: true }) dropdown: NgbDropdown;
	@ViewChild("multiSelect", { static: true }) multiSelect: MatSelect;
	@ViewChild("customerMulti", { static: true }) customerMulti: MatSelect;
	@Output() filterApplyEvent = new EventEmitter();
	@Input() filterName = '';
	@Input() listType = '';
	@Input() tabIndex: number;
	@Input() clear: boolean;
	@Input() filterWidth: string;


	filterForm: FormGroup;
	subscriptions: Subscription[] = [];
	clearData: boolean = false;
	viewLoading: boolean = false;
	showError: boolean = false;
	filterObject: any = {};
	categoryList = [];
	subCategoryList = [];
	paymentTypeList = [];
	statusList = [];
	merchantList = [];
	states = [];
	cities = [];
	currentDate = new Date();
	approvalStatus: any = [];
	permissions: any;
	scrapStatusList = [];
	cronProductArray: { name: string; value: string; }[];
	cronStatusArray: { name: string; value: string; }[];
	cronTypeArray: { name: string; value: string; }[];

	constructor(
		private fb: FormBuilder,
		private config: NgbDropdownConfig,
		private sharedService: SharedService,
		private ref: ChangeDetectorRef,
		private ngxPermissionService: NgxPermissionsService,
		private datePipe: DatePipe,
	) {
		// customize default values of dropdowns used by this component tree
		config.autoClose = false;
		this.ngxPermissionService.permissions$.subscribe((res) => {
			if (res) {
				this.permissions = res;
			}
		});

		this.sharedService.closeFilter$.subscribe((res) => {
			if (res) {
				setTimeout(() => {
					this.clearFilterForm();
					this.dropdown.close();
				});
			}
		});

		this.sharedService.clearFilter$.subscribe(res => {
			if (Object.entries(res).length) {
				setTimeout(() => {
					this.clearFilter(res.name, res.index);
				});
			}
		});
	}

	ngOnInit() {
		this.initFilterForm();
		this.showError = false;
		if (this.clear == true) {
			this.closeDropdown();
		}
	}

	ngOnChanges(changes: SimpleChanges) {

	}

	toggleDropdown(event) {
		if (event) {
			console.log('is open ' + event);
			if (this.listType) {
				const listTypeList = this.listType.split(',');
				for (const listType of listTypeList) {
					switch (listType) {
						case "category":
							if (this.permissions.categoryView) {
								this.getCategory();
							}
							break;
						case "sub-category":
							if (this.permissions.subCategoryView) {
								this.getSubCategory();
							}
							break;
						case 'tenure':
							this.getPaymentType();
							break;
						case "orderStatus":
							this.getOrderStatus();
							break;
						case 'emiStatus':
							this.getEmiStatus();
							break;
						case 'merchantName':
							this.getMerchant();
							break;
						case 'state':
							this.getStates();
							break;
						case 'approval':
							this.status();
							break;
						case 'leadStatus':
							this.getLeadStatus();
							break;
						case 'scrapStatus':
							this.scrapStatus();
							break
						case 'cron':
							this.cronProduct();
							this.cronStatus();
							this.cronType()
							break
					}
				}
			}
		} else {
			console.log('is closed ' + event);
		}
	}

	initFilterForm() {
		this.filterForm = this.fb.group({
			category: [''],
			subCategory: [''],
			priceFrom: [''],
			priceTo: [''],
			startDate: [''],
			status: [''],
			weight: [''],
			paymentType: [''],
			merchant: [''],
			states: [],
			cities: [''],
			appraiserStatus: [''],
			loanStatus: [''],
			kycStatus: [''],
			cceStatus: [''],
			packets: [''],
			scheme: [],
			leadStatus: [''],
			scrapStatus: [''],
			packetTracking: [''],
			packetTrackingLocation: [''],
			cronStatus: [''],
			product: [''],
			scrapKycStatusFromCce: [''],
			scrapKycStatus: [''],
			endDate: [''],
			cronType: [''],
			bmStatus: [''],
			otStatus: [''],
		});

		this.filterForm.valueChanges.subscribe((val) => {
			if (val && parseFloat(val.priceFrom) > parseFloat(val.priceTo)) {
				this.controls.priceTo.setErrors({ priceRange: true });
			} else {
				this.controls.priceTo.setErrors(null);
			}
		});
	}
	get controls() {
		return this.filterForm.controls;
	}

	prepareFilter() {
		this.filterObject = {
			data: {},
			list: {}
		};
		if (this.controls) {
			const controls = this.controls;
			if (controls['category'].value && (controls['category'].value.multiSelect && controls['category'].value.multiSelect.length)) {
				this.filterObject.data.category = controls['category'].value.multiSelect.map(e => e.id).toString();
				this.filterObject.list.category = controls['category'].value.multiSelect;
			}
			if (controls['subCategory'].value && (controls['subCategory'].value.multiSelect && controls['subCategory'].value.multiSelect.length)) {
				this.filterObject.data.subCategory = controls['subCategory'].value.multiSelect.map(e => e.id).toString();
				this.filterObject.list.subCategory = controls['subCategory'].value.multiSelect;
			}
			if (controls['priceFrom'].value) {
				this.filterObject.data.priceFrom = controls['priceFrom'].value;
				this.filterObject.list.priceFrom = controls['priceFrom'].value;
			}
			if (controls['priceTo'].value) {
				this.filterObject.data.priceTo = controls['priceTo'].value;
				this.filterObject.list.priceTo = controls['priceTo'].value;
			}
			if (controls["startDate"].value) {
				let startDate = controls["startDate"].value;
				let date = new Date(startDate.getTime() - startDate.getTimezoneOffset() * 60000).toISOString();
				this.filterObject.data.startDate = date;
				this.filterObject.list.startDate = this.datePipe.transform(date, 'mediumDate');
			}

			if (controls["endDate"].value) {
				let endDate = controls["endDate"].value;
				let date = new Date(endDate.getTime() - endDate.getTimezoneOffset() * 60000).toISOString();
				this.filterObject.data.endDate = date;
				this.filterObject.list.endDate = this.datePipe.transform(date, 'mediumDate');
			}

			if (controls['status'].value && (controls['status'].value.multiSelect && controls['status'].value.multiSelect.length)) {
				this.filterObject.data.status = controls['status'].value.multiSelect.map(e => e.statusId).toString();
				this.filterObject.list.status = controls['status'].value.multiSelect;
			}
			if (controls['paymentType'].value && (controls['paymentType'].value.multiSelect && controls['paymentType'].value.multiSelect.length)) {
				this.filterObject.data.paymentType = controls['paymentType'].value.multiSelect.map(e => e.paymentTypeId).toString();
				this.filterObject.list.paymentType = controls['paymentType'].value.multiSelect;
			}
			if (controls['weight'].value) {
				this.filterObject.data.weight = controls['weight'].value;
				this.filterObject.list.weight = controls['weight'].value;
			}
			if (controls['merchant'].value && (controls['merchant'].value.multiSelect && controls['merchant'].value.multiSelect.length)) {
				this.filterObject.data.merchant = controls['merchant'].value.multiSelect.map(e => e.id).toString();
				this.filterObject.list.merchant = controls['merchant'].value.multiSelect;
			}
			if (controls['states'].value) {
				this.filterObject.data.states = controls['states'].value.id;
				this.filterObject.list.states = controls['states'].value;
			}
			if (controls['cities'].value && (controls['cities'].value.multiSelect && controls['cities'].value.multiSelect.length)) {
				this.filterObject.data.cities = controls['cities'].value.multiSelect.map(e => e.id).toString();
				this.filterObject.list.cities = controls['cities'].value.multiSelect;
			}
			if (controls['status'].value && (controls['status'].value.multiSelect && controls['status'].value.multiSelect.length)) {
				this.filterObject.data.status = controls['status'].value.multiSelect.map(e => e.statusId).toString();
				this.filterObject.list.status = controls['status'].value.multiSelect;
			}
			if (controls['appraiserStatus'].value && (controls['appraiserStatus'].value.multiSelect && controls['appraiserStatus'].value.multiSelect.length)) {
				this.filterObject.data.appraiserStatus = controls['appraiserStatus'].value.multiSelect.map(e => e.id).toString();
				this.filterObject.list.appraiserStatus = controls['appraiserStatus'].value.multiSelect;
			}
			if (controls['leadStatus'].value && (controls['leadStatus'].value.multiSelect && controls['leadStatus'].value.multiSelect.length)) {
				this.filterObject.data.leadStatus = controls['leadStatus'].value.multiSelect.map(e => e.id).toString();
				this.filterObject.list.leadStatus = controls['leadStatus'].value.multiSelect;
			}
			if (controls['scrapStatus'].value && (controls['scrapStatus'].value.multiSelect && controls['scrapStatus'].value.multiSelect.length)) {
				this.filterObject.data.scrapStatus = controls['scrapStatus'].value.multiSelect.map(e => e.id).toString();
				this.filterObject.list.scrapStatus = controls['scrapStatus'].value.multiSelect;
			}
			if (controls['cceStatus'].value && (controls['cceStatus'].value.multiSelect && controls['cceStatus'].value.multiSelect.length)) {
				this.filterObject.data.cceStatus = controls['cceStatus'].value.multiSelect.map(e => e.value).toString();
				this.filterObject.list.cceStatus = controls['cceStatus'].value.multiSelect;
			}
			if (controls['kycStatus'].value && (controls['kycStatus'].value.multiSelect && controls['kycStatus'].value.multiSelect.length)) {
				this.filterObject.data.kycStatus = controls['kycStatus'].value.multiSelect.map(e => e.value).toString();
				this.filterObject.list.kycStatus = controls['kycStatus'].value.multiSelect;
			}
			if (controls['scrapKycStatusFromCce'].value && (controls['scrapKycStatusFromCce'].value.multiSelect && controls['scrapKycStatusFromCce'].value.multiSelect.length)) {
				this.filterObject.data.scrapKycStatusFromCce = controls['scrapKycStatusFromCce'].value.multiSelect.map(e => e.value).toString();
				this.filterObject.list.scrapKycStatusFromCce = controls['scrapKycStatusFromCce'].value.multiSelect;
			}
			if (controls['scrapKycStatus'].value && (controls['scrapKycStatus'].value.multiSelect && controls['scrapKycStatus'].value.multiSelect.length)) {
				this.filterObject.data.scrapKycStatus = controls['scrapKycStatus'].value.multiSelect.map(e => e.value).toString();
				this.filterObject.list.scrapKycStatus = controls['scrapKycStatus'].value.multiSelect;
			}
			if (controls['appraiserStatus'].value && (controls['appraiserStatus'].value.multiSelect && controls['appraiserStatus'].value.multiSelect.length)) {
				this.filterObject.data.appraiserStatus = controls['appraiserStatus'].value.multiSelect.map(e => e.value).toString();
				this.filterObject.list.appraiserStatus = controls['appraiserStatus'].value.multiSelect;
			}
			if (controls['loanStatus'].value && (controls['loanStatus'].value.multiSelect && controls['loanStatus'].value.multiSelect.length)) {
				this.filterObject.data.loanStatus = controls['loanStatus'].value.multiSelect.map(e => e.id).toString();
				this.filterObject.list.loanStatus = controls['loanStatus'].value.multiSelect;
			}

			if (controls['product'].value && (controls['product'].value.multiSelect && controls['product'].value.multiSelect.length)) {
				this.filterObject.data.product = controls['product'].value.multiSelect.map(e => e.value);
				this.filterObject.list.product = controls['product'].value.multiSelect;
			}

			if (controls['cronStatus'].value && (controls['cronStatus'].value.multiSelect && controls['cronStatus'].value.multiSelect.length)) {
				this.filterObject.data.cronStatus = controls['cronStatus'].value.multiSelect.map(e => e.value);
				this.filterObject.list.cronStatus = controls['cronStatus'].value.multiSelect;
			}
			if (controls['cronType'].value && (controls['cronType'].value.multiSelect && controls['cronType'].value.multiSelect.length)) {
				this.filterObject.data.cronType = controls['cronType'].value.multiSelect.map(e => e.value);
				this.filterObject.list.cronType = controls['cronType'].value.multiSelect;
			}

			if (controls['bmStatus'].value && (controls['bmStatus'].value.multiSelect && controls['bmStatus'].value.multiSelect.length)) {
				this.filterObject.data.bmStatus = controls['bmStatus'].value.multiSelect.map(e => e.value).toString();
				this.filterObject.list.bmStatus = controls['bmStatus'].value.multiSelect;
			}
			if (controls['otStatus'].value && (controls['otStatus'].value.multiSelect && controls['otStatus'].value.multiSelect.length)) {
				this.filterObject.data.otStatus = controls['otStatus'].value.multiSelect.map(e => e.value).toString();
				this.filterObject.list.otStatus = controls['otStatus'].value.multiSelect;
			}
			// if (controls['date'].value) {
			// 	this.filterObject.data.date = controls['date'].value;
			// 	this.filterObject.list.date = controls['date'].value;
			// }
			if (controls['scheme'].value) {
				console.log(controls['scheme'].value)
				if (controls['scheme'].value == "All") {
					this.filterObject.data.scheme = ''
				} else {
					this.filterObject.data.scheme = controls['scheme'].value
					this.filterObject.list.scheme = controls['scheme'].value;
				}
			}
			if (controls['packetTracking'].value) {
				this.filterObject.data.packetTracking = controls['packetTracking'].value;
				this.filterObject.list.packetTracking = controls['packetTracking'].value;
			}
			if (controls['packetTrackingLocation'].value) {
				this.filterObject.data.packetTrackingLocation = controls['packetTrackingLocation'].value;
				this.filterObject.list.packetTrackingLocation = controls['packetTrackingLocation'].value;
			}
			if (controls['packets'].value) {
				if (controls['packets'].value == "All") {
					this.filterObject.data.packets = ''
				} else {
					this.filterObject.data.packets = controls['packets'].value
					this.filterObject.list.packets = controls['packets'].value;
				}
			}
			return this.filterObject;
		}
	}

	applyFilter() {
		this.clearData = false;

		if (this.filterForm.invalid) {
			return;
		}
		const filterObj = this.prepareFilter();
		if (filterObj) {
			setTimeout(() => {
				this.filterApplyEvent.emit(filterObj);
				this.dropdown.close();
				this.viewLoading = false;
			});
		}
	}

	clearFilter(name, index) {
		switch (name) {
			case 'category':
				this.controls['category'].value.multiSelect.splice(index, 1);
				break;
			case 'subCategory':
				this.controls['subCategory'].value.multiSelect.splice(index, 1);
				break;
			case 'priceFrom':
				this.controls['priceFrom'].patchValue('');
				break;
			case 'priceTo':
				this.controls['priceTo'].patchValue('');
				break;
			case 'startDate':
				this.controls['startDate'].patchValue('');
				break;
			case 'status':
				this.controls['status'].value.multiSelect.splice(index, 1);
				break;
			case 'paymentType':
				this.controls['paymentType'].value.multiSelect.splice(index, 1);
				break;
			case 'weight':
				this.controls['weight'].patchValue('');
				break;
			case 'merchant':
				this.controls['merchant'].value.multiSelect.splice(index, 1);
				break;
			case 'states':
				this.controls['states'].patchValue(null);
				break;
			case 'cities':
				this.controls['cities'].value.multiSelect.splice(index, 1);
				break;
			case 'cceStatus':
				this.controls['cceStatus'].value.multiSelect.splice(index, 1);
				break;
			case 'kycStatus':
				this.controls['kycStatus'].value.multiSelect.splice(index, 1);
				break;
			case 'scrapKycStatusFromCce':
				this.controls['scrapKycStatusFromCce'].value.multiSelect.splice(index, 1);
				break;
			case 'scrapKycStatus':
				this.controls['scrapKycStatus'].value.multiSelect.splice(index, 1);
				break;
			case 'appraiserStatus':
				this.controls['appraiserStatus'].value.multiSelect.splice(index, 1);
				break;
			case 'loanStatus':
				this.controls['loanStatus'].value.multiSelect.splice(index, 1);
				break;
			case 'leadStatus':
				this.controls['leadStatus'].value.multiSelect.splice(index, 1);
				break;
			case 'scrapStatus':
				this.controls['scrapStatus'].value.multiSelect.splice(index, 1);
				break;
			case 'packets':
				this.controls['packets'].patchValue('');
				break;
			case 'deposit':
				this.controls['scheme'].patchValue('');
				break;
			case 'product':
				this.controls['product'].value.multiSelect.splice(index, 1);
				break;
			case 'cronStatus':
				this.controls['cronStatus'].value.multiSelect.splice(index, 1);
				break;
			case 'cronType':
				this.controls['cronType'].value.multiSelect.splice(index, 1);
				break;
			case 'endDate':
				this.controls['endDate'].patchValue('');
				break;
			case 'packetTracking':
				this.controls['packetTracking'].patchValue('');
				break;
			case 'packetTrackingLocation':
				this.controls['packetTrackingLocation'].patchValue('');
				break;
			case 'bmStatus':
				this.controls['bmStatus'].value.multiSelect.splice(index, 1);
				break;
			case 'otStatus':
				this.controls['otStatus'].value.multiSelect.splice(index, 1);
				break;
			default:
				break;
		}
		this.filterForm.patchValue({
			category: this.filterForm.controls['category'].value,
			subCategory: this.filterForm.controls['subCategory'].value,
			status: this.filterForm.controls['status'].value,
			paymentType: this.filterForm.controls['paymentType'].value,
			merchant: this.filterForm.controls['merchant'].value,
			cities: this.filterForm.controls['cities'].value,
			appraiserStatus: this.filterForm.controls['appraiserStatus'].value,
			loanStatus: this.filterForm.controls['loanStatus'].value,
			kycStatus: this.filterForm.controls['kycStatus'].value,
			cceStatus: this.filterForm.controls['cceStatus'].value,
			leadStatus: this.filterForm.controls['leadStatus'].value,
			scrapStatus: this.filterForm.controls['scrapStatus'].value,
			scrapKycStatus: this.filterForm.controls['scrapKycStatus'].value,
			scrapKycStatusFromCce: this.filterForm.controls['scrapKycStatusFromCce'].value,
			packetTrackingLocation: this.filterForm.controls['packetTrackingLocation'].value,
			bmStatus: this.filterForm.controls['bmStatus'].value,
			otStatus: this.filterForm.controls['otStatus'].value,
			packets: this.filterForm.controls['packets'].value,
		});
		setTimeout(() => {
			this.applyFilter();
		});
	}

	closeDropdown() {
		this.clearData = true;
		this.filterForm.reset();
		this.showError = false;
		this.viewLoading = false;
		this.dropdown.close();
		setTimeout(() => {
			this.applyFilter();
		});
	}

	getCategory() {
		this.sharedService
			.getAllCategory()
			.subscribe((res) => (this.categoryList = res));
	}

	getSubCategory() {
		this.sharedService
			.getAllSubCategory()
			.subscribe((res) => (this.subCategoryList = res));
	}

	getStates() {
		this.sharedService.getStates().subscribe((res) => {
			this.states = res.data;
		});
	}

	getLeadStatus() {
		this.sharedService.getLeadStatus().subscribe((res) => {
			this.statusList = res.data;
		})
	}

	status() {
		this.sharedService.getStatus().subscribe((res) => {
			this.approvalStatus = res;
		});
	}

	cronStatus() {
		this.cronStatusArray = this.sharedService.getCronStatus()

	}

	cronType() {
		this.cronTypeArray = this.sharedService.getCronType()
		console.log(this.cronTypeArray)

	}

	cronProduct() {
		this.cronProductArray = this.sharedService.getCronProduct()

	}

	scrapStatus() {
		this.sharedService.getScrapStatus().subscribe((res) => {
			this.scrapStatusList = res.scrapStatus;
			if (this.scrapStatusList.length) {
				for (const status of this.scrapStatusList) {
					if (status.id == 9) {
						status.stageName = 'processing charges paid';
					}
					if (status.id == 10) {
						status.stageName = 'customer disagreed';
					}
				}
			}
		});
	}

	getCities(event) {
		if (event) {
			const stateId = event.id;
			this.sharedService.getCities(stateId).subscribe(res => {
				this.cities = res.data;
			});
		} else {
			this.cities = [];
		}
	}

	getPaymentType() {
		this.sharedService.getPaymentType().subscribe((res) => {
			this.paymentTypeList = res;
		});
	}

	getOrderStatus() {
		this.sharedService.getOrderStatus().subscribe((res) => {
			this.statusList = res;
		});
	}

	getEmiStatus() {
		this.sharedService.getEmiStatus().subscribe((res) => {
			this.statusList = res;
		});
	}

	getMerchant() {
		this.sharedService.getMerchant().subscribe((res) => {
			this.merchantList = res;
		});
	}

	clearFilterForm() {
		if (this.filterForm) {
			this.clearData = true;
			this.filterForm.reset();
		}
	}

	validations() {
		if (this.filterForm.controls.startDate.value) {
			this.filterForm.controls.endDate.setValidators(Validators.required)
		} else if (this.filterForm.controls.endDate.value) {
			this.filterForm.controls.startDate.setValidators(Validators.required)
		} else {
			this.filterForm.controls.startDate.clearValidators()
			this.filterForm.controls.endDate.clearValidators()
		}
		this.filterForm.controls.startDate.updateValueAndValidity()
		this.filterForm.controls.endDate.updateValueAndValidity()
	}

	ngOnDestroy() {
		this.subscriptions.forEach((s) => s.unsubscribe());
	}
}
