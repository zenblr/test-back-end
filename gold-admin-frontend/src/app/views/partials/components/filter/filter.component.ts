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
import { NgxPermissionsService } from 'ngx-permissions';

@Component({
	selector: 'kt-filter',
	templateUrl: './filter.component.html',
	styleUrls: ['./filter.component.scss'],
})
export class FilterComponent implements OnInit, OnChanges, OnDestroy {
	@ViewChild('filterDropdown', { static: true }) dropdown: NgbDropdown;
	@ViewChild('multiSelect', { static: true }) multiSelect: MatSelect;
	@ViewChild('customerMulti', { static: true }) customerMulti: MatSelect;
	@Output() filterApplyEvent = new EventEmitter();
	@Input() filterName = '';
	@Input() listType = '';
	@Input() tabIndex: number;
	@Input() clear: boolean;
	@Input() filterWidth: string;

	current: Date = new Date();
	filterForm: FormGroup;
	Fromdate: Date;
	subscriptions: Subscription[] = [];
	countryList = [];
	stateList = [];
	cityList = [];
	localityList = [];
	clearData: boolean = false;
	viewLoading: boolean = false;
	showError: boolean = false;
	filterObject: any = {};
	filterData: any = {};
	filteredDataList: any = {};
	categoryList = [];
	subCategoryList = [];
	paymentTypeList = [];
	statusList = [];
	merchantList = [];
	states = [];
	permissions: any;

	constructor(
		private fb: FormBuilder,
		private config: NgbDropdownConfig,
		private sharedService: SharedService,
		private ref: ChangeDetectorRef,
		private ngxPermissionService: NgxPermissionsService,
	) {
		// customize default values of dropdowns used by this component tree
		config.autoClose = false;
		this.ngxPermissionService.permissions$.subscribe(res => {
			if (res) {
				this.permissions = res;
			}
		});

		this.sharedService.closeFilter$.subscribe(res => {
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
		if (this.filterName == 'leads') {
			this.getStates();
		}
	}

	ngOnChanges(change: SimpleChanges) {
		if (change.tabIndex) {
			this.clearData = true;
			if (this.filterForm) {
				this.filterForm.controls['ToDate'].clearValidators();
				this.filterForm.controls['ToDate'].updateValueAndValidity();
				this.filterForm.reset();
			}
			this.showError = false;
			this.viewLoading = false;
			this.dropdown.close();
			this.filterData = {
				CountryId: '',
				StateId: '',
				CityId: '',
				LocalityId: '',
				StatusIds: '',
				leaveStatusIds: '',
				SourceIds: '',
				StageIds: '',
				TypeIds: '',
				TerritoryIds: '',
				TagIds: '',
				UserIds: '',
				Category: '',
				FromDate: '',
				ToDate: '',
				MaxValue: '',
				MinValue: '',
				Sort: '',
			};
			this.stateList = [];
			this.cityList = [];
			this.localityList = [];
		}
	}

	toggleDropdown(event) {
		if (event) {
			console.log('is open ' + event);
			if (this.listType) {
				const listTypeList = this.listType.split(',');
				for (const listType of listTypeList) {
					switch (listType) {
						case "category": if (this.permissions.categoryView) {
							this.getCategory();
						}
							break;
						case "sub-category": if (this.permissions.subCategoryView) {
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
			merchant: ['']
		});

		this.filterForm.valueChanges.subscribe(val => {
			if (val && (parseFloat(val.priceFrom) > parseFloat(val.priceTo))) {
				this.controls.priceTo.setErrors({ priceRange: true });
			} else {
				this.controls.priceTo.setErrors(null);
			}
		})
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
			if (controls['category'].value && controls['category'].value.multiSelect.length) {
				this.filterObject.data.category = controls['category'].value.multiSelect.map(e => e.id).toString();
				this.filterObject.list.category = controls['category'].value.multiSelect;
			}
			if (controls['subCategory'].value && controls['subCategory'].value.multiSelect.length) {
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
			if (controls['startDate'].value) {
				this.filterObject.data.startDate = controls['startDate'].value;
				this.filterObject.list.startDate = controls['startDate'].value;
			}
			if (controls['status'].value && controls['status'].value.multiSelect.length) {
				this.filterObject.data.status = controls['status'].value.multiSelect.map(e => e.statusId).toString();
				this.filterObject.list.status = controls['status'].value.multiSelect;
			}
			if (controls['paymentType'].value && controls['paymentType'].value.multiSelect.length) {
				this.filterObject.data.paymentType = controls['paymentType'].value.multiSelect.map(e => e.paymentTypeId).toString();
				this.filterObject.list.paymentType = controls['paymentType'].value.multiSelect;
			}
			if (controls['weight'].value) {
				this.filterObject.data.weight = controls['weight'].value;
				this.filterObject.list.weight = controls['weight'].value;
			}
			if (controls['merchant'].value && controls['merchant'].value.multiSelect.length) {
				this.filterObject.data.merchant = controls['merchant'].value.multiSelect.map(e => e.id).toString();
				this.filterObject.list.merchant = controls['merchant'].value.multiSelect;
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
			default:
				break;
		}
		this.filterForm.patchValue({
			category: this.filterForm.controls['category'].value,
			subCategory: this.filterForm.controls['subCategory'].value,
			status: this.filterForm.controls['status'].value,
			paymentType: this.filterForm.controls['paymentType'].value,
			merchant: this.filterForm.controls['merchant'].value,
		});
		setTimeout(() => {
			this.applyFilter();
		});
	}

	restrict(event: MatDatepickerInputEvent<Date>) {
		this.Fromdate = event.value;
		if (this.filterForm.controls['FromDate'].touched) {
			this.filterForm.controls['ToDate'].setValidators(
				Validators.required
			);
			this.filterForm.controls['ToDate'].updateValueAndValidity();
			this.showError = true;
		}
		if (this.filterForm.controls['ToDate'].value) {
			this.showError = false;
		}
	}

	closeDropdown() {
		this.clearData = true;
		this.filterForm.reset();
		this.showError = false;
		this.viewLoading = false;
		this.dropdown.close();
		this.filterData = {
			category: '',
			subCategory: '',
			priceFrom: '',
			priceTo: '',
			startDate: '',
		};
		this.stateList = [];
		this.cityList = [];
		this.localityList = [];
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
			.subscribe((res) => (this.subCategoryList = res.data));
	}

	getStates() {
		this.sharedService.getStates().subscribe((res) => {
			this.states = res.message;
		});
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

	// getCities() {
	//   const stateId = this.controls.stateId.value;
	//   this.sharedService.getCities(stateId).subscribe(res => {
	//     this.cities = res.message;
	//   });
	// }

	clearFilterForm() {
		if (this.filterForm) {
			this.filterForm.reset();
		}
	}

	ngOnDestroy() {
		this.subscriptions.forEach((s) => s.unsubscribe());
	}
}
