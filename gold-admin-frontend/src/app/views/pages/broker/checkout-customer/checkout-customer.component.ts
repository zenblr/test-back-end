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
  numberSearchForm: FormGroup;
  checkoutCustomerForm: FormGroup;
  otpForm: FormGroup;
  stateList = [];
  cityList = [];
  showformFlag = false;
  showPlaceOrderFlag = false;
  showNumberSearchFlag = true;
  showCustomerFlag = false;
  isMandatory = true;
  showPrefilledDataFlag = false;
  checkoutData: any;
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
    this.getStates();
  }

  formInitialize() {
    this.numberSearchForm = this.fb.group({
      mobNo: ['', Validators.required],
    });

    this.checkoutCustomerForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      mobileNumber: ['', [Validators.required, Validators.pattern('^[7-9][0-9]{9}$')]],
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

    this.controls.mobileNumber.valueChanges.subscribe(res => {
      if (this.controls.mobileNumber.valid) {
        this.showPrefilledDataFlag = true;
        this.getExistingCustomer(this.controls.mobileNumber.value);
      }
    });

    this.checkoutCustomerForm.valueChanges.subscribe(val => console.log(val))
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
    },
      error => {
        console.log(error.error.message);
        const msg = error.error.message;
        this.toastr.errorToastr(msg);
      });
  }

  checkCustomerType(type) {
    this.existingCustomerData = null;
    this.finalOrderData = null;
    this.numberSearchForm.reset();
    this.checkoutCustomerForm.reset();
    this.otpForm.reset();
    this.controls['stateName'].patchValue('');
    this.controls['cityName'].patchValue('');

    if (type == 'new') {
      this.showformFlag = true;
      this.showPlaceOrderFlag = true;
      this.showNumberSearchFlag = false;
      this.showCustomerFlag = false;
      this.checkoutCustomerForm.enable();
    } else {
      this.showformFlag = false;
      this.showPlaceOrderFlag = false;
      this.showNumberSearchFlag = true;
      this.showCustomerFlag = true;
      this.checkoutCustomerForm.disable();
    }
  }

  checkCustomerExist() {
    if (this.numberSearchForm.invalid) {
      this.numberSearchForm.markAllAsTouched();
      return;
    }
    this.getExistingCustomer(this.numberSearchForm.controls.mobNo.value);
  }

  getExistingCustomer(mobNo) {
    this.checkoutCustomerService.getExistingCustomer(mobNo).subscribe(res => {
      if (res) {
        this.existingCustomerData = res;
        setTimeout(() => {
          this.checkoutCustomerForm.patchValue({
            firstName: res.customerDetails.firstName,
            lastName: res.customerDetails.lastName,
            mobileNumber: res.customerDetails.mobileNumber,
            email: res.customerDetails.email,
            address: res.customerDetails.customeraddress[0].address,
            landMark: res.customerDetails.customeraddress[0].landMark,
            postalCode: res.customerDetails.pinCode,
            stateName: res.customerDetails.customeraddress[0].stateId,
            cityName: res.customerDetails.customeraddress[0].cityId,
          });
          this.getCities();
          if (this.showPrefilledDataFlag) {
            const msg = 'Customer is already exist. The Details will be automatically pre-filled';
            this.toastr.successToastr(msg);
            this.showPrefilledDataFlag = false;
          }
        });
        this.showformFlag = true;
        this.showPlaceOrderFlag = true;
        this.showCustomerFlag = true;
        this.finalOrderData = null;
        this.checkoutCustomerForm.disable();
        this.ref.detectChanges();
      }
    },
      error => {
        console.log(error.error.message);
        if (!this.showPrefilledDataFlag) {
          const msg = error.error.message;
          this.toastr.errorToastr(msg);
        }
      });
  }

  getStates() {
    this.sharedService.getStates().subscribe(res => this.stateList = res.message);
  }

  getCities() {
    if (this.controls.stateName.value == '') {
      this.cityList = [];
    } else {
      let stateData;
      if (this.showCustomerFlag) {
        stateData = this.controls.stateName.value;
      } else {
        stateData = this.controls.stateName.value.id;
      }
      this.sharedService.getCities(stateData).subscribe(res => {
        this.cityList = res.message;
        this.ref.detectChanges();
      });
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
    if (this.showCustomerFlag) {
      generateOTPData.stateName = this.existingCustomerData.customerDetails.customeraddress[0].state.name;
      generateOTPData.cityName = this.existingCustomerData.customerDetails.customeraddress[0].city.name;
    }
    console.log(generateOTPData)
    this.checkoutCustomerService.generateOTP(generateOTPData).subscribe(res => {
      if (res) {
        console.log(res);
        this.finalOrderData = res;
        const msg = 'OTP has been sent successfully.';
        this.toastr.successToastr(msg);
      }
    },
      error => {
        console.log(error.error.message);
        const msg = error.error.message;
        this.toastr.errorToastr(msg);
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
        const msg = 'Order has been placed successfully.';
        this.toastr.successToastr(msg);
        this.router.navigate(['/broker/order-received/' + this.finalOrderData.blockId]);
        this.shoppingCartService.cartCount.next(0);
      }
    },
      error => {
        console.log(error.error.message);
        const msg = error.error.message;
        this.toastr.errorToastr(msg);
      });
  }
}
