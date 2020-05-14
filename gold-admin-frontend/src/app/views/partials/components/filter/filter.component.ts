
import { Component, EventEmitter, Output, Input, ChangeDetectorRef, ViewChild, ElementRef, OnInit, OnChanges, AfterViewInit, SimpleChanges, OnDestroy } from '@angular/core';
import { NgbDropdownConfig, NgbDropdown } from '@ng-bootstrap/ng-bootstrap';
import { FormGroup, Validators, FormBuilder, FormArray, FormControl } from '@angular/forms';
import { map, takeUntil, take } from 'rxjs/operators';
import { Subscription, ReplaySubject, Subject } from 'rxjs';
import { MatDatepickerInputEvent, MatSelect } from '@angular/material';
import { SharedService } from '../../../../core/shared/services/shared.service';

@Component({
  selector: 'kt-filter',
  templateUrl: './filter.component.html',
  styleUrls: ['./filter.component.scss']
})
export class FilterComponent implements OnInit, OnChanges {
  @ViewChild('filterDropdown', { static: true }) dropdown: NgbDropdown;
  @ViewChild('multiSelect', { static: true }) multiSelect: MatSelect;
  @ViewChild('customerMulti', { static: true }) customerMulti: MatSelect;
  @Output() filterApplyEvent = new EventEmitter();
  @Input() filterFormat = '';
  @Input() customerStatusList = [];
  @Input() customerStageList = [];
  @Input() customerTypeList = [];
  @Input() customerSourceList = [];
  @Input() customerTerritoryList = [];
  @Input() customerTagList = [];
  @Input() managerList = [];
  @Input() CategoryList = [];
  @Input() teamList = [];
  @Input() filterName = '';
  @Input() listType = '';
  @Input() tabIndex: number;
  @Input() SortList = [];
  @Input() clear: boolean;
  dummyCustomerArray: any = [];
  teamFilter: any = [];
  // teamList = [];
  current: Date = new Date();
  filterForm: FormGroup;
  Fromdate: Date;
  subscriptions: Subscription[] = [];
  countryList = []
  stateList = [];
  cityList = [];
  localityList = [];
  clearData: boolean = false;
  viewLoading: boolean = false;
  showError: boolean = false;
  filteredDataList = {
    LocationFilter: [
      {
        CountryFilter: [],
        StateFilter: [],
        CityFilter: [],
        LocalityFilter: [],
      }
    ],
    StatusFilter: [],
    leaveStatusFilter: [],
    StageFilter: [],
    SourceFilter: [],
    TypeFilter: [],
    TerritoryFilter: [],
    TagFilter: [],
    MemberFilter: [],
    CategoryFilter: [],
    FromDate: '',
    ToDate: '',
    MinValueFilter: '',
    MaxValueFilter: '',
    SortFilter: [],
  };
  filterData: any;
  // filterData = {
  //   categoryId: '',
  //   subCategoryId: '',
  //   priceFrom: '',
  //   priceTo: '',
  // };

  categoryList = [];
  subCategoryList = [];

  public memberMultiFilterCtrl: FormControl = new FormControl();
  public filteredMemberMulti: ReplaySubject<[]> = new ReplaySubject<[]>(1);
  protected _onDestroy = new Subject<void>();

  public customerMultiFilterCtrl: FormControl = new FormControl();
  public filteredCustomerMulti: ReplaySubject<[]> = new ReplaySubject<[]>(1);

  constructor(
    private fb: FormBuilder,
    private config: NgbDropdownConfig,
    // private addressService: AddressService,
    // private authService: AuthService,
    private sharedService: SharedService,
    private ref: ChangeDetectorRef

  ) {
    // customize default values of dropdowns used by this component tree
    config.autoClose = false;
  }

  ngOnInit() {
    this.initFilterForm();
    this.showError = false;
    if (this.clear == true) {
      this.closeDropdown();
    }
    // this.getCountryList();
    // let tempTeam = ['roster', 'from', 'leave', 'teamClaims', 'order', 'expense', 'mytask']
    // if (tempTeam.includes(this.filterName)) {
    // 	this.getMyTeam();
    // }

    this.memberMultiFilterCtrl.valueChanges
      .pipe(takeUntil(this._onDestroy))
      .subscribe(() => {
        this.filterMemberMulti();
      });

    this.customerMultiFilterCtrl.valueChanges
      .pipe(takeUntil(this._onDestroy))
      .subscribe(() => {
        this.filterCustomerMulti();
      });
  }

  ngOnChanges(change: SimpleChanges) {
    if (change.teamList) {
      this.teamFilter = this.teamList;
      if (this.teamFilter.length > 0) {
        this.filteredMemberMulti.next(this.teamFilter.slice());
        this.setInitialValue();
      }
    }
    if (change.customerStatusList && this.filterName == 'opportunities') {
      this.dummyCustomerArray = this.customerStatusList;
      if (this.dummyCustomerArray.length > 0) {
        this.filteredCustomerMulti.next(this.dummyCustomerArray.slice());
        this.setInitialCustValue();
      }
    }
    if (change.managerList) {
      this.teamFilter = this.managerList;
      if (this.teamFilter.length > 0) {
        this.filteredMemberMulti.next(this.teamFilter.slice());
        this.setInitialValue();
      }
    }
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
            case 'category': this.getCategory();
              break;
            case 'sub-category': this.getSubCategory();
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
      categoryId: [''],
      subCategoryId: [''],
      priceFrom: [''],
      priceTo: [''],
    })

    if (this.filterName == 'leave' || this.filterName == 'teamClaims') {
      let statusIds = ['1'];
      this.filterForm.controls.leaveStatusIds.setValue(statusIds);
      this.applyFilter();
    }
  }

  get form() { return this.filterForm.controls; }

  setInitialValue() {
    this.filteredMemberMulti
      .pipe(take(1), takeUntil(this._onDestroy))
      .subscribe(() => {
        if (this.multiSelect) {
          this.multiSelect.compareWith = (a, b) => a && b && a.UserId === b.UserId;
        }
      });
  }

  setInitialCustValue() {
    this.filteredCustomerMulti
      .pipe(take(1), takeUntil(this._onDestroy))
      .subscribe(() => {
        if (this.customerMulti) {
          this.customerMulti.compareWith = (a, b) => a && b && a.Id === b.Id;
        }
      });
  }

  filterMemberMulti() {
    if (!this.teamFilter) {
      return;
    }
    // get the search keyword
    let search = this.memberMultiFilterCtrl.value;
    if (!search) {
      this.filteredMemberMulti.next(this.teamFilter.slice());
      return;
    } else {
      search = search.toLowerCase();
    }
    // filter the banks
    var x = Object.keys(this.teamFilter[0])
    if (x.includes('UserName')) {
      this.filteredMemberMulti.next(
        this.teamFilter.filter(bank => bank.UserName.toLowerCase().indexOf(search) > -1)
      );
    } else {
      this.filteredMemberMulti.next(
        this.teamFilter.filter(bank => bank.Name.toLowerCase().indexOf(search) > -1)
      );
    }

  }

  filterCustomerMulti() {
    if (!this.dummyCustomerArray) {
      return;
    }
    // get the search keyword
    let search = this.customerMultiFilterCtrl.value;
    if (!search) {
      this.filteredCustomerMulti.next(this.dummyCustomerArray.slice());
      return;
    } else {
      search = search.toLowerCase();
    }
    // filter the banks
    this.filteredCustomerMulti.next(
      this.dummyCustomerArray.filter(bank => bank.LeadName.toLowerCase().indexOf(search) > -1)
    );
  }

  prepareFilter() {
    this.filterData = {
      categoryId: '',
      subCategoryId: '',
      priceFrom: '',
      priceTo: '',

    };
    const controls = this.filterForm.controls;
    if (controls['categoryId'].value) {
      this.filterData.categoryId = controls['categoryId'].value;
    }
    if (controls['subCategoryId'].value) {
      this.filterData.subCategoryId = controls['subCategoryId'].value;
    }
    if (controls['priceFrom'].value) {
      this.filterData.priceFrom = controls['priceFrom'].value;
    }
    if (controls['priceTo'].value) {
      this.filterData.categoryId = controls['priceTo'].value;
    }

    // if (controls['CountryId'].value) {
    //   this.filterData.CountryId = controls['CountryId'].value.CountryId;
    // }
    // if (controls['StateId'].value) {
    //   this.filterData.StateId = controls['StateId'].value.StateId;
    // }
    // if (controls['CityId'].value) {
    //   this.filterData.CityId = controls['CityId'].value.CityId;
    // }
    // if (controls['LocalityId'].value) {
    //   this.filterData.LocalityId = controls['LocalityId'].value.LocalityId;
    // }
    // if (controls['StatusIds'].value) {
    //   if (this.filterName == 'order' || this.filterName == 'expense' || this.filterName == 'opportunities') {
    //     this.filterData.StatusIds = controls['StatusIds'].value.map(e => e.Id).join(', ');
    //   } else if (this.filterName == 'mytask' || this.filterName == 'users') {
    //     this.filterData.StatusIds = controls['StatusIds'].value['Id'];
    //   }
    //   else {
    //     this.filterData.StatusIds = controls['StatusIds'].value.map(e => e.StatusId).join(', ');
    //   }
    // }
    // if (controls['Category'].value) {
    //   if (this.filterName == 'mytask') {
    //     this.filterData.Category = controls['Category'].value['Id'];
    //   } else {
    //     this.filterData.Category = controls['Category'].value.map(e => e.Id).join(', ');
    //   }
    // }
    // if (controls['leaveStatusIds'].value) {
    //   this.filterData.leaveStatusIds = controls['leaveStatusIds'].value;
    // }
    // if (controls['StageIds'].value) {
    //   this.filterData.StageIds = controls['StageIds'].value.map(e => e.Id).join(', ');
    // }
    // if (controls['SourceIds'].value) {
    //   this.filterData.SourceIds = controls['SourceIds'].value.map(e => e.Id).join(', ');
    // }
    // if (controls['TypeIds'].value) {
    //   this.filterData.TypeIds = controls['TypeIds'].value.map(e => e.Id).join(', ');
    // }
    // if (controls['TerritoryIds'].value) {
    //   this.filterData.TerritoryIds = controls['TerritoryIds'].value.map(e => e.TerritoryId).join(', ');
    // }
    // if (controls['TagIds'].value) {
    //   if (controls['TagIds'].value.Tags) {
    //     this.filterData.TagIds = controls['TagIds'].value.Tags.map(e => e.Id).join(', ');
    //   }
    //   // else {
    //   // 	this.filterData.TagIds = controls['TagIds'].value.map(e => e.Id).join(', ');
    //   // }
    // }
    // if (controls['UserIds'].value) {
    //   if (controls['UserIds'].value.searchMultipleCheckValue) {
    //     this.filterData.UserIds = controls['UserIds'].value.searchMultipleCheckValue.map(e => e.UserId).join(', ');
    //   } else if (this.filterName == 'users') {
    //     this.filterData.UserIds = controls['UserIds'].value.UserId;
    //   } else {
    //     this.filterData.UserIds = controls['UserIds'].value.map(e => e.UserId).join(', ');
    //   }
    // }
    // if (controls['FromDate'].value) {
    //   this.filterData.FromDate = controls['FromDate'].value;
    // }
    // if (controls['ToDate'].value) {
    //   this.filterData.ToDate = controls['ToDate'].value;
    // }
    // if (controls['MinValue'].value) {
    //   this.filterData.MinValue = controls['MinValue'].value;
    // }
    // if (controls['MaxValue'].value) {
    //   this.filterData.MaxValue = controls['MaxValue'].value;
    // }
    // if (controls['Sort'].value) {
    //   this.filterData.Sort = controls['Sort'].value['Id'];
    // }
    return this.filterData;
  }

  applyFilter() {
    debugger;
    this.clearData = false;
    if (this.filterForm.invalid) {
      return;
    }
    const filterData = this.prepareFilter();
    if (filterData) {
      setTimeout(() => {
        this.filterApplyEvent.emit({ filterData });
        this.dropdown.close();
        this.viewLoading = false;
      });
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
          this.filterForm.patchValue({ StateId: '', CityId: '', LocalityId: '' });
        } else {
          this.filterForm.patchValue({ CountryId: '', StateId: '', CityId: '', LocalityId: '' });
        }
        break;
      case 'Status':
        if (value == 'multiple') {
          this.filterForm.patchValue({ StatusIds: '' });
        } else if (this.filterName == 'mytask' || this.filterName == 'users') {
          this.filterForm.patchValue({ StatusIds: '' });
        }
        else {
          this.filterForm.controls['StatusIds'].value.splice(index, 1);
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
          this.filterForm.controls['leaveStatusIds'].value.splice(index, 1);
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
          this.filterForm.controls['SourceIds'].value.splice(index, 1);
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
          this.filterForm.controls['TerritoryIds'].value.splice(index, 1);
        }
        break;
      case 'Tag':
        if (value == 'multiple') {
          if (this.filterForm.controls['TagIds'].value.Tags) {
            this.filterForm.controls['TagIds'].value.Tags.splice(0, this.filteredDataList.TagFilter.length);
          } else {
            this.filterForm.controls['TagIds'].value.splice(0, this.filteredDataList.TagFilter.length);
          }

        } else {
          if (this.filterForm.controls['TagIds'].value.Tags) {
            this.filterForm.controls['TagIds'].value.Tags.splice(index, 1);
          } else {
            this.filterForm.controls['TagIds'].value.splice(index, 1);
          }
        }
        break;
      case 'Member':
        if (value == 'multiple') {
          if (this.filterForm.controls['UserIds'].value.searchMultipleCheckValue) {
            this.filterForm.controls['UserIds'].value.searchMultipleCheckValue.splice(0, this.filteredDataList.MemberFilter.length);
          } else if (this.filterName == 'users') {
            this.filterForm.patchValue({ UserIds: '' })
          } else {
            this.filterForm.controls['UserIds'].value.splice(0, this.filteredDataList.MemberFilter.length);
          }

        } else {
          if (this.filterForm.controls['UserIds'].value.searchMultipleCheckValue) {
            this.filterForm.controls['UserIds'].value.searchMultipleCheckValue.splice(index, 1);
          } else if (this.filterName == 'users') {
            this.filterForm.patchValue({ UserIds: '' })
          } else {
            this.filterForm.controls['UserIds'].value.splice(index, 1);
          }
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
          TagIds: this.filterForm.controls['TagIds'].value.Tags
        })
      } else {
        this.filterForm.patchValue({
          TagIds: this.filterForm.controls['TagIds'].value
        })
      }
    }
    if (this.filterForm.controls['UserIds'].value) {
      if (this.filterForm.controls['UserIds'].value.searchMultipleCheckValue) {
        this.filterForm.patchValue({
          UserIds: this.filterForm.controls['UserIds'].value.searchMultipleCheckValue
        })
      } else {
        this.filterForm.patchValue({
          UserIds: this.filterForm.controls['UserIds'].value
        })
      }
    }

    setTimeout(() => {
      this.applyFilter();
    });
  }

  restrict(event: MatDatepickerInputEvent<Date>) {
    this.Fromdate = event.value;
    if (this.filterForm.controls['FromDate'].touched) {
      this.filterForm.controls['ToDate'].setValidators(Validators.required);
      this.filterForm.controls['ToDate'].updateValueAndValidity();
      this.showError = true;
    }
    if (this.filterForm.controls['ToDate'].value) {
      this.showError = false;
    }
  }

  // searchCustomers(searchText) {
  //   if (searchText != '') {
  //     this.customerStatusList = this.dummyCustomerArray.filter(item => {
  //       if (item.LeadName.toString().toLowerCase().indexOf(searchText.toLowerCase()) !== -1) {
  //         return true;
  //       }
  //       return false;
  //     }
  //     );
  //   }
  //   else {
  //     this.teamFilter = this.teamList;
  //   }
  // }

  // searchManager(searchText) {
  // 	if (searchText != '') {
  // 		this.teamFilter = this.teamList.filter(item => {
  // 			if (item.UserName.toString().toLowerCase().indexOf(searchText.toLowerCase()) !== -1) {
  // 				return true;
  // 			}
  // 			return false;
  // 		}
  // 		);
  // 	}
  // 	else {
  // 		this.teamFilter = this.teamList;
  // 	}
  // }

  closeDropdown() {
    this.clearData = true;
    this.filterForm.controls['ToDate'].clearValidators();
    this.filterForm.controls['ToDate'].updateValueAndValidity();
    this.filterForm.reset();
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
    setTimeout(() => {
      this.applyFilter();
    });
  }

  getCategory() {
    console.log('in category');
    this.sharedService.getAllCategory().subscribe(res => this.categoryList = res);
  }

  getSubCategory() {
    console.log('in sub-category');
    this.sharedService.getAllSubCategory().subscribe(res => this.subCategoryList = res.data);
  }

  ngOnDestroy() {
    this.subscriptions.forEach(s => s.unsubscribe());
    this._onDestroy.next();
    this._onDestroy.complete();
  }
}