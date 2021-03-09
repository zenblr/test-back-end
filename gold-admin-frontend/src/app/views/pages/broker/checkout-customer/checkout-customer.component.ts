import { Component, OnInit, ViewChild, ChangeDetectorRef, NgZone, ChangeDetectionStrategy } from '@angular/core';
import { ToastrComponent } from '../../../partials/components/toastr/toastr.component';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { SharedService } from '../../../../core/shared/services/shared.service';
import { ActivatedRoute, Router } from '@angular/router';
import { CheckoutCustomerService, ShoppingCartService } from '../../../../core/broker';
import { RazorpayPaymentService } from '../../../../core/shared/services/razorpay-payment.service';
import { MatCheckbox, MatDialog } from '@angular/material';
import { PaymentDialogComponent } from '../payment-dialog/payment-dialog.component';
import { element } from 'protractor';
import { PdfViewerComponent } from 'ng2-pdf-viewer';
import { ImagePreviewDialogComponent } from '../../../../views/partials/components/image-preview-dialog/image-preview-dialog.component';

@Component({
  selector: 'kt-checkout-customer',
  templateUrl: './checkout-customer.component.html',
  styleUrls: ['./checkout-customer.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CheckoutCustomerComponent implements OnInit {
  @ViewChild(ToastrComponent, { static: true }) toastr: ToastrComponent;
  numberSearchForm: FormGroup;
  checkoutCustomerForm: FormGroup;
  otpForm: FormGroup;
  stateList = [];
  cityList = [];
  shippingCityList = [];
  customerKyc: any;
  showformFlag = false;
  showPlaceOrderFlag = false;
  showNumberSearchFlag = true;
  showCustomerFlag = false;
  showShippingCustomerFlag = false;
  showShippingFlag = false;
  isMandatory = true;
  showPrefilledDataFlag = false;
  checkoutData: any;
  existingCustomerData: any;
  finalOrderData: any;
  finalOrderOld: any;
  finalOrderNew: any;
  shippingCityCounter = 1;
  isSameAddress: boolean = false;
  formData: any;

  constructor(
    private fb: FormBuilder,
    private sharedService: SharedService,
    private ref: ChangeDetectorRef,
    private router: Router,
    private checkoutCustomerService: CheckoutCustomerService,
    private shoppingCartService: ShoppingCartService,
    private zone: NgZone,
    private razorpayPaymentService: RazorpayPaymentService,
    public dialog: MatDialog,
  ) { }

  ngOnInit() {
    this.formInitialize();
    this.getCheckoutCart();
    this.getStates();
  }

  formInitialize() {
    this.numberSearchForm = this.fb.group({
      mobileNo: ['', [Validators.required, Validators.pattern('^[7-9][0-9]{9}$')]],
    });

    this.checkoutCustomerForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      mobileNumber: ['', [Validators.required, Validators.pattern('^[7-9][0-9]{9}$')]],
      email: [''],
      address: ['', Validators.required],
      landMark: ['', Validators.required],
      postalCode: ['', [Validators.required, Validators.pattern('[1-9][0-9]{5}')]],
      stateName: ['', Validators.required],
      cityName: ['', Validators.required],
      shippingAddress: ['', Validators.required],
      shippingLandMark: ['', Validators.required],
      shippingStateName: ['', Validators.required],
      shippingCityName: ['', Validators.required],
      shippingPostalCode: ['', [Validators.required, Validators.pattern('[1-9][0-9]{5}')]],
      panCardNumber: ['', Validators.compose([Validators.required, Validators.pattern('^[A-Za-z]{5}[0-9]{4}[A-Za-z]{1}$')])],
      nameOnPanCard: ['', Validators.compose([Validators.required, Validators.pattern("^[a-zA-Z ]*$")])],
      panCardFileId: [''],
      panImg: [],
      kycRequired: [false],
    });
    this.setPanDetailsValidators();

    this.otpForm = this.fb.group({
      otp: ['', [Validators.required, Validators.pattern('^[0-9]{4}$')]],
      paymentMode: ['', [Validators.required]],
    });

    this.controls.mobileNumber.valueChanges.subscribe(res => {
      // if (this.controls.mobileNumber.valid) {
      //   this.showPrefilledDataFlag = true;
      //   this.getExistingCustomer(this.controls.mobileNumber.value);
      // }
    });

    this.checkoutCustomerForm.valueChanges.subscribe(val => console.log(val))
    this.otpForm.valueChanges.subscribe(val => console.log(val))
  }

  get controls() {
    return this.checkoutCustomerForm.controls;
  }

  setPanDetailsValidators() {
    const panCardNumberControl = this.checkoutCustomerForm.get('panCardNumber');
    const nameOnPanCardControl = this.checkoutCustomerForm.get('nameOnPanCard');
    const panCardFileIdControl = this.checkoutCustomerForm.get('panCardFileId');

    this.checkoutCustomerForm.get('kycRequired').valueChanges.subscribe((val) => {
      if (val) {
        panCardNumberControl.setValidators([Validators.required, Validators.pattern('^[A-Za-z]{5}[0-9]{4}[A-Za-z]{1}$')]);
        nameOnPanCardControl.setValidators([Validators.required]);
        panCardFileIdControl.setValidators([Validators.required]);

      } else {
        panCardNumberControl.setValidators([]);
        nameOnPanCardControl.setValidators([]);
        panCardFileIdControl.setValidators([]);
      }
      panCardNumberControl.updateValueAndValidity();
      nameOnPanCardControl.updateValueAndValidity();
      panCardFileIdControl.updateValueAndValidity();
    });
  }

  getCheckoutCart() {
    this.shoppingCartService.getCheckoutCart().subscribe(res => {
      if (res && res.blockId) {
        const blockData = {
          blockId: res.blockId
        }
        this.checkoutData = res;
        this.shoppingCartService.orderVerifyBlock(blockData).subscribe();
        this.controls['kycRequired'].patchValue(this.checkoutData.kycRequired);
        this.customerKyc = this.checkoutData.kycRequired;
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
    this.checkoutCustomerForm.reset();
    this.otpForm.reset();
    this.otpForm.controls['paymentMode'].patchValue('');
    this.controls['stateName'].patchValue('');
    this.controls['cityName'].patchValue('');
    this.controls['shippingStateName'].patchValue('');
    this.controls['shippingCityName'].patchValue('');
    this.controls['kycRequired'].patchValue(this.customerKyc);

    if (type == 'new') {
      this.showformFlag = true;
      this.showPlaceOrderFlag = true;
      // this.showNumberSearchFlag = false;
      this.showCustomerFlag = false;
      this.showShippingCustomerFlag = false;
      this.checkoutCustomerForm.enable();
    } else {
      this.showformFlag = false;
      this.showPlaceOrderFlag = false;
      // this.showNumberSearchFlag = true;
      this.showCustomerFlag = true;
      this.showShippingCustomerFlag = true;
      this.checkoutCustomerForm.disable();
    }
  }

  checkCustomerExist() {
    if (this.numberSearchForm.invalid) {
      this.numberSearchForm.markAllAsTouched();
      return;
    }
    this.getExistingCustomer(this.numberSearchForm.controls.mobileNo.value);
  }

  getExistingCustomer(mobileNo) {
    const existingCustomerData = {
      mobileNo: mobileNo,
      invoiceAmount: this.checkoutData.invoiceAmount
    }
    this.checkoutCustomerService.findExistingCustomer(existingCustomerData).subscribe(res => {
      this.existingCustomerData = { ...res };
      setTimeout(() => {
        this.checkoutCustomerForm.patchValue({
          firstName: res.customerDetails.firstName,
          lastName: res.customerDetails.lastName,
          mobileNumber: res.customerDetails.mobileNumber,
          email: res.customerDetails.email,
          kycRequired: res.kycRequired,
        });
        if (res.customerDetails.customeraddress.length) {
          this.checkoutCustomerForm.patchValue({
            address: res.customerDetails.customeraddress[0].address,
            landMark: res.customerDetails.customeraddress[0].landMark,
            stateName: res.customerDetails.customeraddress[0].stateId,
            cityName: res.customerDetails.customeraddress[0].cityId,
            postalCode: res.customerDetails.customeraddress[0].postalCode,
          });
          this.showCustomerFlag = true;
        } else {
          this.controls['address'].enable();
          this.controls['landMark'].enable();
          this.controls['stateName'].enable();
          this.controls['cityName'].enable();
          this.controls['postalCode'].enable();
          this.showCustomerFlag = false;
        }
        this.getCities();
        if (res.customerDetails.customerOrderAddress.length) {
          this.checkoutCustomerForm.patchValue({
            shippingAddress: res.customerDetails.customerOrderAddress[0].shippingAddress,
            shippingLandMark: res.customerDetails.customerOrderAddress[0].shippingLandMark,
            shippingStateName: res.customerDetails.customerOrderAddress[0].shippingStateId,
            shippingCityName: res.customerDetails.customerOrderAddress[0].shippingCityId,
            shippingPostalCode: res.customerDetails.customerOrderAddress[0].shippingPostalCode,
          });
          this.showShippingCustomerFlag = true;

          this.checkIfbillingandShippingSameOnLoad();

        } else {
          if (!res.customerDetails.customeraddress.length) {
            this.showShippingCustomerFlag = false;
          }
        }
        this.controls['shippingAddress'].enable();
        this.controls['shippingLandMark'].enable();
        this.controls['shippingStateName'].enable();
        this.controls['shippingCityName'].enable();
        this.controls['shippingPostalCode'].enable();
        this.getShippingCities();
        // if (res.customerDetails.kycDetails) {
        //   this.checkoutCustomerForm.patchValue({
        //     panCardNumber: res.customerDetails.kycDetails.panCardNumber,
        //     nameOnPanCard: res.customerDetails.kycDetails.nameOnPanCard,
        //     panCardFileId: res.customerDetails.kycDetails.panCardFileId
        //   });
        // } else {
        //   this.controls['nameOnPanCard'].patchValue(res.customerDetails.firstName + ' ' + res.customerDetails.lastName);
        //   this.controls['panCardNumber'].enable();
        //   this.controls['panCardFileId'].enable();
        // }
        // if (this.showPrefilledDataFlag) {
        //   const msg = 'Customer already exist. The Details will be automatically pre-filled';
        //   this.toastr.successToastr(msg);
        //   this.showPrefilledDataFlag = false;
        // }
      });
      this.checkoutCustomerForm.disable();

      if (res.customerDetails.digiKycApplied && res.kycRequired) {
        switch (res.customerDetails.digiKycApplied.status) {
          case 'rejected':
            this.toastr.errorToastr("Your can't proceed futher,Since your KYC as been rejected")
            this.router.navigate(['/broker/shop'])
            break;
          case 'waiting':
            this.toastr.errorToastr("Your can't proceed futher,Since your KYC as not been approved")
            this.router.navigate(['/broker/shop'])
            break;
          case 'approved':
            this.checkoutCustomerForm.patchValue({
              panCardFileId: res.customerDetails.kycDetails ? res.customerDetails.kycDetails.panCardFileId : null,
              panCardNumber: res.customerDetails.panCardNumber,
              nameOnPanCard: res.customerDetails.firstName + ' ' + res.customerDetails.lastName,
              panImg: res.customerDetails.panImg
            });
            break;
          case 'pending':
            this.checkoutCustomerForm.patchValue({
              panCardFileId: res.customerDetails.kycDetails ? res.customerDetails.kycDetails.panCardFileId : null,
              panCardNumber: res.customerDetails.panCardNumber,
              nameOnPanCard: res.customerDetails.firstName + ' ' + res.customerDetails.lastName,
              panImg: res.customerDetails.panImg
            });
            this.controls['panCardNumber'].enable();
            break;
          default:
            break;
        }
      } else if (res.customerDetails.panCardNumber) {
        this.existingCustomerData.customerDetails['digiKycApplied'] = {}
        this.existingCustomerData.customerDetails['digiKycApplied']['status'] = 'approved'
        this.checkoutCustomerForm.patchValue({
          panCardFileId: res.customerDetails.kycDetails ? res.customerDetails.kycDetails.panCardFileId : null,
          panCardNumber: res.customerDetails.panCardNumber,
          nameOnPanCard: res.customerDetails.firstName + ' ' + res.customerDetails.lastName,
          panImg: res.customerDetails.panImg
        });
      }
      this.showformFlag = true;
      this.showPlaceOrderFlag = true;
      this.showCustomerFlag = true;
      this.showShippingCustomerFlag = true;
      this.finalOrderData = null;
      this.ref.detectChanges();
    },
      error => {
        console.log(error.error.message);
        if (!this.showPrefilledDataFlag) {
          const msg = error.error.message;
          this.toastr.errorToastr(msg);
        }
        this.checkCustomerType('new');
        setTimeout(() => {
          this.checkoutCustomerForm.controls['mobileNumber'].patchValue(this.numberSearchForm.controls.mobileNo.value);
          this.checkoutCustomerForm.controls['mobileNumber'].disable();
        });
      });
  }

  getStates() {
    this.sharedService.getStates().subscribe(res => this.stateList = res.data);
  }

  async getCities() {
    if (this.controls.stateName.value == '') {
      this.cityList = [];
    } else {
      let stateData;
      if (this.showCustomerFlag) {
        stateData = this.controls.stateName.value;
      } else {
        stateData = this.controls.stateName.value.id;
      }
      let res = await this.sharedService.getCities(stateData)
      this.cityList = res['data'];
      this.ref.detectChanges();
    }
  }

  async getShippingCities() {
    if (this.controls.shippingStateName.value == '') {
      this.shippingCityList = [];
    } else {
      let stateData;
      if (this.showShippingCustomerFlag) {
        stateData = this.controls.shippingStateName.value;
      } else {
        stateData = this.controls.shippingStateName.value.id;
      }
      let res = await this.sharedService.getCities(stateData)

      if (this.shippingCityCounter > 1) {
        this.controls.shippingCityName.patchValue('');
      }
      this.shippingCityCounter++

      this.shippingCityList = res['data'];
      this.ref.detectChanges();
    }
  }

  sameAddress(event: MatCheckbox) {
    if (event) {
      this.isSameAddress = true;
      this.shippingCityList = this.cityList;
      this.checkoutCustomerForm.patchValue({
        shippingAddress: this.controls.address.value,
        shippingLandMark: this.controls.landMark.value,
        shippingStateName: this.controls.stateName.value,
        shippingCityName: this.controls.cityName.value,
        shippingPostalCode: this.controls.postalCode.value,
      });
    } else {
      this.isSameAddress = false;
      this.checkoutCustomerForm.patchValue({
        shippingAddress: null,
        shippingLandMark: null,
        shippingStateName: '',
        shippingCityName: '',
        shippingPostalCode: null,
      });
    }
    this.ref.detectChanges();
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
      shippingAddress: this.controls.shippingAddress.value,
      shippingLandMark: this.controls.shippingLandMark.value,
      shippingStateName: this.controls.shippingStateName.value.name,
      shippingCityName: this.controls.shippingCityName.value.name,
      shippingPostalCode: this.controls.shippingPostalCode.value,
      panCardNumber: this.controls.panCardNumber.value,
      nameOnPanCard: this.controls.nameOnPanCard.value,
      panCardFileId: this.controls.panCardFileId.value,
      panImg: this.controls.panImg.value,
      blockId: this.checkoutData.blockId
    }
    if (this.showCustomerFlag && this.existingCustomerData.customerDetails.customeraddress.length) {
      generateOTPData.stateName = this.existingCustomerData.customerDetails.customeraddress[0].state.name;
      generateOTPData.cityName = this.existingCustomerData.customerDetails.customeraddress[0].city.name;
    }
    if (this.showShippingCustomerFlag && this.existingCustomerData.customerDetails.customerOrderAddress.length) {
      if (this.checkCityStateIfSame()) {
        if (this.isSameAddress) {
          generateOTPData.shippingStateName = this.existingCustomerData.customerDetails.customeraddress[0].state.name;
          generateOTPData.shippingCityName = this.existingCustomerData.customerDetails.customeraddress[0].city.name;
        } else {
          generateOTPData.shippingStateName = this.existingCustomerData.customerDetails.customerOrderAddress[0].shippingState.name;
          generateOTPData.shippingCityName = this.existingCustomerData.customerDetails.customerOrderAddress[0].shippingCity.name;
        }

      } else {
        let stateData = this.stateList.find(ele => (ele.id == this.controls.shippingStateName.value));
        let cityData = this.shippingCityList.find(data => (data.id == this.controls.shippingCityName.value));
        console.log(stateData, cityData);
        generateOTPData.shippingStateName = stateData.name;
        generateOTPData.shippingCityName = cityData.name;
      }

    } else {
      let stateData, cityData;
      if (this.controls.shippingStateName.value && this.controls.shippingStateName.value.id) {
        stateData = this.stateList.find(ele => (ele.id == this.controls.shippingStateName.value.id));
      } else {
        stateData = this.stateList.find(ele => (ele.id == this.controls.shippingStateName.value));
      }
      if (this.controls.shippingCityName.value && this.controls.shippingCityName.value.id) {
        cityData = this.shippingCityList.find(data => (data.id == this.controls.shippingCityName.value.id));
      } else {
        cityData = this.shippingCityList.find(data => (data.id == this.controls.shippingCityName.value));
      }
      console.log(stateData, cityData);
      generateOTPData.shippingStateName = stateData.name;
      generateOTPData.shippingCityName = cityData.name;
    }

    console.log(generateOTPData)
    this.checkoutCustomerService.generateOTPAdmin(generateOTPData).subscribe(res => {
      console.log(res);
      this.finalOrderData = res;
      // const msg = 'OTP has been sent successfully.';
      this.toastr.successToastr(res.message);
    },
      error => {
        console.log(error.error.message);
        const msg = error.error.message;
        this.toastr.errorToastr(msg);
      });
  }

  verifyOTP() {
    if (this.otpForm.invalid) {
      this.otpForm.markAllAsTouched();
      return;
    }
    const verifyOTPData = {
      customerId: this.finalOrderData.customerId,
      otp: this.otpForm.controls.otp.value,
      blockId: this.finalOrderData.blockId,
      totalInitialAmount: this.checkoutData.nowPayableAmount,
      paymentMode: this.otpForm.controls.paymentMode.value
    }
    this.checkoutCustomerService.verifyOTP(verifyOTPData).subscribe(res => {
      console.log(res);
      if (res.paymentMode == 'paymentGateway') {
        this.razorpayPaymentService.razorpayOptions.key = res.razerPayConfig;
        this.razorpayPaymentService.razorpayOptions.amount = res.totalInitialAmount;
        this.razorpayPaymentService.razorpayOptions.order_id = res.razorPayOrder.id;
        this.razorpayPaymentService.razorpayOptions.description = "EMI order payment";
        this.razorpayPaymentService.razorpayOptions.paymentMode = res.paymentMode;
        this.razorpayPaymentService.razorpayOptions.prefill.contact = this.controls.mobileNumber.value;
        this.razorpayPaymentService.razorpayOptions.prefill.email = this.controls.email.value || 'info@augmont.in';
        this.razorpayPaymentService.razorpayOptions.handler = this.razorPayResponsehandler.bind(this);
        this.razorpayPaymentService.initPay(this.razorpayPaymentService.razorpayOptions);
      } else {
        const dialogRef = this.dialog.open(PaymentDialogComponent, {
          data: { paymentData: res },
          width: '70vw'
        });
        dialogRef.afterClosed().subscribe(res => {
          if (res) {
            console.log(res)
            const msg = 'Order has been placed successfully.';
            this.toastr.successToastr(msg);
            this.shoppingCartService.cartCount.next(0);
            this.router.navigate(['/broker/order-received/'], { queryParams: { id: this.finalOrderData.blockId } });
          }
        });
      }
    },
      error => {
        console.log(error.error.message);
        const msg = error.error.message;
        this.toastr.errorToastr(msg);
      });
  }

  validateImage(event) {
    // if (this.validate) {
    const file = event.target.files[0];
    const reader = new FileReader();
    const img = new Image();
    img.src = window.URL.createObjectURL(file);
    reader.readAsDataURL(file);
    reader.onload = (_event) => {
      setTimeout(() => {
        const width = img.naturalWidth;
        const height = img.naturalHeight;
        window.URL.revokeObjectURL(img.src);
        if ((width > 1500 || height > 1500) || (file.size > 200000)) {
          this.toastr.errorToastr('Please Upload Image of Valid Size');
          event.target.value = '';
        } else {
          this.uploadFile(event);
        }
        this.ref.detectChanges();
      }, 2000);
    }
    // } else {
    //   this.uploadFile(event);
    // }
  }

  uploadFile(event) {
    this.formData = new FormData();
    for (const file of event.target.files) {
      this.formData.append("avatar", file);
    }
    this.sharedService.fileUpload(this.formData, 'broker').subscribe(
      res => {
        this.checkoutCustomerForm.patchValue({
          panCardFileId: res.uploadFile.id,
          panImg: res.uploadFile.URL
        })
        // event.nativeElement.value = '';
        this.ref.detectChanges();
      },
      err => {
        event.nativeElement.value = '';
        this.toastr.errorToastr(err['error']['message']);
        this.ref.detectChanges();
      }
    );
  }

  preview(value) {
    const img = value
    const ext = this.sharedService.getExtension(img)
    if (ext == 'pdf') {
      this.dialog.open(PdfViewerComponent, {
        data: {
          pdfSrc: img,
          page: 1,
          showAll: true
        },
        width: "80%"
      })
    } else {
      this.dialog.open(ImagePreviewDialogComponent, {
        data: {
          images: [img],
          index: 0,
        },
        width: "auto"
      })
    }
  }

  isPdf(image: string): boolean {
    const ext = this.sharedService.getExtension(image)
    const isPdf = ext == 'pdf' ? true : false
    return isPdf
  }

  uploadImage(data) {
    this.checkoutCustomerForm.controls['panCardFileId'].patchValue(
      data.uploadData.id
    );
  }

  removeImage(data) {
    this.checkoutCustomerForm.controls['panCardFileId'].patchValue('');
  }

  razorPayResponsehandler(response) {
    console.log(response)
    this.zone.run(() => {
      const placeOrderData = {
        customerId: this.finalOrderData.customerId,
        blockId: this.finalOrderData.blockId,
        transactionDetails: response,
        totalInitialAmount: this.checkoutData.nowPayableAmount,
        paymentMode: this.razorpayPaymentService.razorpayOptions.paymentMode
      }
      this.checkoutCustomerService.placeOrder(placeOrderData).subscribe(res => {
        console.log(res);
        const msg = 'Order has been placed successfully.';
        this.toastr.successToastr(msg);
        this.shoppingCartService.cartCount.next(0);
        this.router.navigate(['/broker/order-received/'], { queryParams: { id: this.finalOrderData.blockId } });
      },
        error => {
          console.log(error.error.message);
          const msg = error.error.message;
          this.toastr.errorToastr(msg);
        });
    });
  }

  checkCityStateIfSame() {
    const stateName = this.controls.stateName.value;
    const cityName = this.controls.cityName.value;
    const shippingStateName = this.controls.shippingStateName.value;
    const shippingCityName = this.controls.shippingCityName.value;
    if (stateName == shippingStateName && cityName == shippingCityName) {
      return true

    } else {
      return false
    }
  }

  checkIfbillingandShippingSameOnLoad() {

    const stateName = this.controls.stateName.value == this.controls.shippingStateName.value ? true : false;
    const cityName = this.controls.cityName.value == this.controls.shippingCityName.value ? true : false;
    const address = this.controls.address.value == this.controls.shippingAddress.value ? true : false;
    const landMark = this.controls.landMark.value == this.controls.shippingLandMark.value ? true : false;
    const postalCode = this.controls.postalCode.value == this.controls.shippingPostalCode.value ? true : false;

    if (stateName && cityName && address && landMark && postalCode) {
      this.isSameAddress = true;
    } else {
      this.isSameAddress = false;
    }
  }
}
