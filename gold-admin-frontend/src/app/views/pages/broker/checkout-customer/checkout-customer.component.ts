import { Component, OnInit, ViewChild, ChangeDetectorRef } from '@angular/core';
import { ToastrComponent } from '../../../partials/components/toastr/toastr.component';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
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
  otpForm: FormGroup;
  checkoutData: any;
  stateList = [];
  cityList = [];
  showformFlag = false;
  showPlaceOrder = false;
  existingCustomerData: any;
  finalOrderData: any;

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
      lastName: ['', Validators.required],
      mobileNumber: ['', Validators.required],
      email: ['', Validators.email],
      address: ['', Validators.required],
      landMark: ['', Validators.required],
      postalCode: ['', Validators.required],
      stateName: ['', Validators.required],
      cityName: ['', Validators.required],
    });

    this.otpForm = this.fb.group({
      otp: ['', Validators.required],
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
            stateName: res.customerDetails.customeraddress[0].state,
            cityName: res.customerDetails.customeraddress[0].city,
            blockId: [''],
          });
          this.getCities();
          this.showPlaceOrder = true
        }
      },
        error => {
          console.log(error.error.message);
          const msg = error.error.message;
          this.toastr.errorToastr(msg);
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
      if (res) {
        console.log(res);
        this.finalOrderData = res;
      }
    });
  }

  placeOrder() {
    if (this.otpForm.invalid) {
      this.otpForm.markAllAsTouched();
      return;
    }
    const placeOrderData = {
      customerId: this.finalOrderData.customerId,
      otp: this.otpForm.controls.otp.value,
      blockId: this.finalOrderData.blockId,
      transactionId: 'TRA' + Date.now(),
      totalInitialAmount: this.checkoutData.nowPayableAmount
    }
    this.checkoutCustomerService.placeOrder(placeOrderData).subscribe(res => {
      if (res) {
        console.log(res);
        const msg = 'Order successfully has been placed.';
        this.toastr.successToastr(msg);
        this.router.navigate(['/broker/order-received']);
      }
    });
  }
}
