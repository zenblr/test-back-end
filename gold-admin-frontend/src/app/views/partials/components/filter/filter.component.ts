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
	permissions: any;

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
		if (this.filterName == 'leads') {
			this.getStates();
		}
	}

	ngOnChanges(change: SimpleChanges) { }

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
			this.states = res.message;
		});
	}


	getCities($event) {
		if ($event) {
			const stateId = $event.id;
			this.sharedService.getCities(stateId).subscribe(res => {
				this.cities = res.message;
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

	ngOnDestroy() {
		this.subscriptions.forEach((s) => s.unsubscribe());
	}
}
