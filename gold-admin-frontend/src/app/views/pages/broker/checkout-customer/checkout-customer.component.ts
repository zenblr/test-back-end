import { Component, OnInit, ViewChild, ChangeDetectorRef } from '@angular/core';
import { ToastrComponent } from '../../../partials/components/toastr/toastr.component';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { SharedService } from '../../../../core/shared/services/shared.service';
import { ActivatedRoute, Router } from '@angular/router';
import { CheckoutCustomerService, ShoppingCartService } from '../../../../core/merchant-broker';

@Component({
  selector: 'kt-checkout-customer',
  templateUrl: './checkout-customer.component.html',
  styleUrls: ['./checkout-customer.component.scss']
})
export class CheckoutCustomerComponent implements OnInit {
  @ViewChild(ToastrComponent, { static: true }) toastr: ToastrComponent;
  viewLoading = false;
  checkoutCustomerForm: FormGroup;
  checkoutData: any;
  stateList = [];
  cityList = [];
  showformFlag = false;
  showPlaceOrder = false;
  existingCustomerData: any;

  constructor(
    private fb: FormBuilder,
    private sharedService: SharedService,
    private ref: ChangeDetectorRef,
    private route: ActivatedRoute,
    private router: Router,
    private checkoutCustomerService: CheckoutCustomerService,
    private shoppingCartService: ShoppingCartService
  ) { }

  ngOnInit() {
    this.formInitialize();
    this.getCheckoutCart();
  }

  formInitialize() {
    this.checkoutCustomerForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: [''],
      mobileNumber: ['', Validators.required],
      email: [''],
      address: ['', Validators.required],
      landMark: ['', Validators.required],
      postalCode: ['', Validators.required],
      stateName: ['', Validators.required],
      cityName: ['', Validators.required],
    });

    this.checkoutCustomerForm.valueChanges.subscribe((val) => {
      console.log(val);
    });
  }

  get controls() {
    return this.checkoutCustomerForm.controls;
  }

  getCheckoutCart() {
    this.shoppingCartService.getCheckoutCart().subscribe(res => {
      if (res && res.blockId) {
        const blockData = {
          blockId: res.blockId
        }
        this.checkoutData = res
        this.shoppingCartService.orderVerifyBlock(blockData).subscribe();
      }
    });
  }

  checkCustomerType(type) {
    if (type == 'new') {
      this.showformFlag = true;
      this.showPlaceOrder = true;
      this.getStates();
    } else {
      this.showformFlag = false;
      this.showPlaceOrder = false
    }
    this.existingCustomerData = null;
    this.checkoutCustomerForm.reset();
  }

  getExistingCustomer() {
    if (this.controls.mobileNumber.value) {
      console.log(this.controls.mobileNumber.value)
      this.checkoutCustomerService.getExistingCustomer(this.controls.mobileNumber.value).subscribe(res => {
        if (res) {
          this.existingCustomerData = res;
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
          this.showPlaceOrder = true
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
      this.sharedService.getCities(this.controls.stateName.value.id).subscribe(res => this.cityList = res.message);
    }
  }

  generateOTP() {
    if (this.checkoutCustomerForm.invalid) {
      this.checkoutCustomerForm.markAllAsTouched();
      return;
    }
    const generateOTPData = {
      firstName: this.controls.firstName.value,
      lastName: this.controls.lastName.value,
      mobileNumber: this.controls.mobileNumber.value,
      email: this.controls.email.value,
      address: this.controls.address.value,
      landMark: this.controls.landMark.value,
      postalCode: this.controls.postalCode.value,
      stateName: this.controls.stateName.value.name,
      cityName: this.controls.cityName.value.name,
      blockId: this.checkoutData.blockId
    }
    console.log(generateOTPData)
    this.checkoutCustomerService.generateOTP(generateOTPData).subscribe(res => {
      if(res) {
        console.log(res);
      }
    });
  }
}
