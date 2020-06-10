import { Component, OnInit, ViewChild, ChangeDetectorRef } from '@angular/core';
import { ToastrComponent } from '../../../partials/components/toastr/toastr.component';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { SharedService } from '../../../../core/shared/services/shared.service';
import { ActivatedRoute, Router } from '@angular/router';
import { CheckoutCustomerService } from '../../../../core/merchant-broker';

@Component({
  selector: 'kt-shopping-cart',
  templateUrl: './shopping-cart.component.html',
  styleUrls: ['./shopping-cart.component.scss']
})
export class ShoppingCartComponent implements OnInit {
  @ViewChild(ToastrComponent, { static: true }) toastr: ToastrComponent;
  viewLoading = false;
  checkoutCustomerForm: FormGroup;
  stateList = [];
  cityList = [];

  constructor(
    private fb: FormBuilder,
    private sharedService: SharedService,
    private ref: ChangeDetectorRef,
    private route: ActivatedRoute,
    private router: Router,
    private checkoutCustomerService: CheckoutCustomerService
  ) { }

  ngOnInit() {
    this.formInitialize();
    this.getStates();
  }

  formInitialize() {
    this.checkoutCustomerForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      mobileNumber: ['', Validators.required],
      email: ['', Validators.required],
      address: ['', Validators.required],
      landMark: ['', Validators.required],
      postalCode: ['', Validators.required],
      countryName: [''],
      stateName: ['', Validators.required],
      cityName: ['', Validators.required],
      blockId: ['', Validators.required],
    });

    this.checkoutCustomerForm.valueChanges.subscribe((val) => {
      console.log(val);
    });
  }

  get controls() {
    return this.checkoutCustomerForm.controls;
  }

  checkCustomerType(type) {
    this.checkoutCustomerForm.reset();
  }

  getExistingCustomer() {
    if (this.controls.mobileNumber.value) {
      console.log(this.controls.mobileNumber.value)
      this.checkoutCustomerService.getExistingCustomer(this.controls.mobileNumber.value).subscribe(res => {
        if (res) {
          this.checkoutCustomerForm.patchValue({
            firstName: res.customerDetails.firstName,
            lastName: res.customerDetails.lastName,
            mobileNumber: res.customerDetails.mobileNumber,
            email: res.customerDetails.email,
            address: res.customerDetails.customeraddress[0].address,
            landMark: res.customerDetails.customeraddress[0].landMark,
            postalCode: res.customerDetails.pinCode,
            countryName: [''],
            stateName: res.customerDetails.customeraddress[0].stateId,
            cityName: res.customerDetails.customeraddress[0].cityId,
            blockId: [''],
          });
          this.getCities();
        }
      });
    }
  }

  getStates() {
    this.sharedService.getStates().subscribe(res => this.stateList = res.message);
  }

  getCities() {
    if (this.controls.stateName.value == '') {
      this.cityList = []
    } else {
      this.sharedService.getCities(this.controls.stateName.value).subscribe(res => this.cityList = res.message);
    }
  }
}
