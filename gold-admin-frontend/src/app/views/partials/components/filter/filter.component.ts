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
} from '@angular/forms';
import { map, takeUntil, take } from 'rxjs/operators';
import { Subscription, ReplaySubject, Subject } from 'rxjs';
import { MatDatepickerInputEvent, MatSelect } from '@angular/material';
import { SharedService } from '../../../../core/shared/services/shared.service';

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
	// filteredDataList = {
	// 	LocationFilter: [
	// 		{
	// 			CountryFilter: [],
	// 			StateFilter: [],
	// 			CityFilter: [],
	// 			LocalityFilter: [],
	// 		},
	// 	],
	// 	categoryFilter: [],		
	// };
	filterData: any = {};
	filteredDataList: any = {};
	categoryList = [];
	subCategoryList = [];
	tenure = [];
	status = [];
	name = [];
	states = [];

	constructor(
		private fb: FormBuilder,
		private config: NgbDropdownConfig,
		private sharedService: SharedService,
		private ref: ChangeDetectorRef
	) {
		// customize default values of dropdowns used by this component tree
		config.autoClose = false;

		this.sharedService.closeFilter$.subscribe(res => {
			if (res) {
				setTimeout(() => {
					this.clearFilterForm();
					this.dropdown.close();
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
						case 'category':
							this.getCategory();
							break;
						case 'sub-category':
							this.getSubCategory();
							break;
						case 'tenure':
							this.getTenure();
							break;
						case 'orderStatus':
							this.getStatus();
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
		this.filterData = {};
		if (this.controls['category'].value.length) {
			this.filterData.category = this.controls['category'].value.map(e => e.id).toString();
		}
		if (this.controls['subCategory'].value.length) {
			this.filterData.subCategory = this.controls['subCategory'].value.map(e => e.id).toString();
		}
		if (this.controls['priceFrom'].value) {
			this.filterData.priceFrom = this.controls['priceFrom'].value;
		}
		if (this.controls['priceTo'].value) {
			this.filterData.priceTo = this.controls['priceTo'].value;
		}
		if (this.controls['startDate'].value) {
			this.filterData.startDate = this.controls['startDate'].value;
		}
		return this.filterData;
	}

	applyFilter() {
		this.clearData = false;
		if (this.filterForm.invalid) {
			return;
		}
		const filterData = this.prepareFilter();
		const filterList = this.generateFilteredList();
		if (filterData) {
			setTimeout(() => {
				this.filterApplyEvent.emit({ filterData, filterList });
				this.dropdown.close();
				this.viewLoading = false;
			});
		}
	}

	generateFilteredList() {
		this.filteredDataList = {};
		if (this.controls) {
			if (this.controls['category'].value.length) {
				this.filteredDataList.category = this.controls['category'].value;
			}
			if (this.controls['subCategory'].value.length) {
				this.filteredDataList.subCategory = this.controls['subCategory'].value;
			}
			if (this.controls['priceFrom'].value) {
				this.filteredDataList.priceFrom = this.controls['priceFrom'].value;
			}
			if (this.controls['priceTo'].value) {
				this.filteredDataList.priceTo = this.controls['priceTo'].value;
			}
			if (this.controls['startDate'].value) {
				this.filteredDataList.startDate = this.controls['startDate'].value;
			}
			return this.filteredDataList;
		}
	}

	clearFilter(Name, value, index) {
		switch (Name) {
			case 'Location':
				if (value == 'locality') {
					this.filterForm.patchValue({ LocalityId: '' });
				} else if (value == 'city') {
					this.filterForm.patchValue({ CityId: '', LocalityId: '' });
				} else if (value == 'state') {
					this.filterForm.patchValue({
						StateId: '',
						CityId: '',
						LocalityId: '',
					});
				} else {
					this.filterForm.patchValue({
						CountryId: '',
						StateId: '',
						CityId: '',
						LocalityId: '',
					});
				}
				break;
			case 'Status':
				if (value == 'multiple') {
					this.filterForm.patchValue({ StatusIds: '' });
				} else if (
					this.filterName == 'mytask' ||
					this.filterName == 'users'
				) {
					this.filterForm.patchValue({ StatusIds: '' });
				} else {
					this.filterForm.controls['StatusIds'].value.splice(
						index,
						1
					);
				}
				break;
			case 'Category':
				if (value == 'multiple') {
					this.filterForm.patchValue({ Category: '' });
				} else {
					this.filterForm.controls['Category'].value.splice(index, 1);
				}
				break;
			case 'leaveStatusIds':
				if (value == 'multiple') {
					this.filterForm.patchValue({ leaveStatusIds: '' });
				} else {
					this.filterForm.controls['leaveStatusIds'].value.splice(
						index,
						1
					);
				}
				break;
			case 'Stage':
				if (value == 'multiple') {
					this.filterForm.patchValue({ StageIds: '' });
				} else {
					this.filterForm.controls['StageIds'].value.splice(index, 1);
				}
				break;
			case 'Source':
				if (value == 'multiple') {
					this.filterForm.patchValue({ SourceIds: '' });
				} else {
					this.filterForm.controls['SourceIds'].value.splice(
						index,
						1
					);
				}
				break;
			case 'Type':
				if (value == 'multiple') {
					this.filterForm.patchValue({ TypeIds: '' });
				} else {
					this.filterForm.controls['TypeIds'].value.splice(index, 1);
				}
				break;
			case 'Territory':
				if (value == 'multiple') {
					this.filterForm.patchValue({ TerritoryIds: '' });
				} else {
					this.filterForm.controls['TerritoryIds'].value.splice(
						index,
						1
					);
				}
				break;
			case 'Date':
				this.filterForm.controls['ToDate'].clearValidators();
				this.filterForm.controls['ToDate'].updateValueAndValidity();
				this.filterForm.patchValue({ FromDate: '' });
				this.filterForm.patchValue({ ToDate: '' });
				break;
			case 'Amount':
				this.filterForm.patchValue({ MaxValue: '' });
				this.filterForm.patchValue({ MinValue: '' });
				break;
			case 'Sort':
				this.filterForm.patchValue({ Sort: '' });
				break;
		}
		this.filterForm.patchValue({
			StatusIds: this.filterForm.controls['StatusIds'].value,
			leaveStatusIds: this.filterForm.controls['leaveStatusIds'].value,
			StageIds: this.filterForm.controls['StageIds'].value,
			SourceIds: this.filterForm.controls['SourceIds'].value,
			TypeIds: this.filterForm.controls['TypeIds'].value,
			TerritoryIds: this.filterForm.controls['TerritoryIds'].value,
			Category: this.filterForm.controls['Category'].value,
			FromDate: this.filterForm.controls['FromDate'].value,
			ToDate: this.filterForm.controls['ToDate'].value,
			MaxValue: this.filterForm.controls['MaxValue'].value,
			MinValue: this.filterForm.controls['MinValue'].value,
			Sort: this.filterForm.controls['Sort'].value,
		});
		if (this.filterForm.controls['TagIds'].value) {
			if (this.filterForm.controls['TagIds'].value.Tags) {
				this.filterForm.patchValue({
					TagIds: this.filterForm.controls['TagIds'].value.Tags,
				});
			} else {
				this.filterForm.patchValue({
					TagIds: this.filterForm.controls['TagIds'].value,
				});
			}
		}
		if (this.filterForm.controls['UserIds'].value) {
			if (
				this.filterForm.controls['UserIds'].value
					.searchMultipleCheckValue
			) {
				this.filterForm.patchValue({
					UserIds: this.filterForm.controls['UserIds'].value
						.searchMultipleCheckValue,
				});
			} else {
				this.filterForm.patchValue({
					UserIds: this.filterForm.controls['UserIds'].value,
				});
			}
		}

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

	getTenure() {
		this.sharedService.getTenure().subscribe((res) => {
			this.tenure = res;
		});
	}

	getStatus() {
		this.sharedService.getStatus().subscribe((res) => {
			this.status = res;
		});
	}

	getEmiStatus() {
		this.sharedService.getEmiStatus().subscribe((res) => {
			this.status = res;
		});
	}

	getMerchant() {
		this.sharedService.getMerchant().subscribe((res) => {
			this.name = res;
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
