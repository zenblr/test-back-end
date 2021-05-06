import { Component, OnInit, ViewChild } from '@angular/core';
import { ShopService } from '../../../../../core/broker';
import { ActivatedRoute, Router } from '@angular/router';
import { Validators, FormBuilder, FormGroup } from '@angular/forms';
import { ToastrComponent } from '../../../../partials/components/toastr/toastr.component';
import { SharedService } from '../../../../../core/shared/services/shared.service';

@Component({
  selector: 'kt-cancel-order',
  templateUrl: './cancel-order.component.html',
  styleUrls: ['./cancel-order.component.scss']
})
export class CancelOrderComponent implements OnInit {
  @ViewChild(ToastrComponent, { static: true }) toastr: ToastrComponent;
  orderId: any;
  orderData: any;
  value: string = 'Cancel Order';
  otpFlag: boolean = false;
  confirmFlag: boolean = false;
  cancelForm: FormGroup;
  isMandatory: boolean = true;
  referenceCode: any;
  selectedPayment: any;

  constructor(
    private shopService: ShopService,
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private router: Router,
    public sharedService: SharedService
  ) { }

  ngOnInit() {
    this.orderId = this.route.snapshot.params.id;
    this.shopService.getCancelDetails(this.orderId).subscribe(res => {
      this.orderData = res;
      this.formInitialize();
      if (this.orderData.merchantPaymentConfig.paymentGateway == 'edwaar' || this.orderData.merchantDetail.id != 1) {
        this.selectPaymentOption((this.sharedService.sellPaymentOptionList.filter(e => e.value == 'bankAccount')[0]));
      }
    })
  }

  formInitialize() {
    this.cancelForm = this.fb.group({
      customerBankName: [''],
      customerAccountNo: [''],
      ifscCode: [''],
      passbookId: [null],
      checkCopyId: [null],
      otp: [null],
      referenceCode: ['']
    });
  }

  get controls() {
    if (this.cancelForm) {
      return this.cancelForm.controls;
    }
  }

  selectPaymentOption(item) {
    this.otpFlag = true;
    this.confirmFlag = false;
    this.value = 'Cancel Order';
    this.selectedPayment = item;
    this.controls.otp.setValidators([]);
    this.controls.otp.updateValueAndValidity();
    this.cancelForm.reset();
  }

  isActive(item) {
    return this.selectedPayment === item;
  }

  proceed() {
    if (!this.selectedPayment) {
      this.toastr.errorToastr('Please Select Transfer Option');
      return;
    }
  }

  setValidation() {
    if (this.selectedPayment.value == 'bankAccount') {
      this.controls.customerBankName.setValidators([Validators.required, Validators.pattern('^[a-zA-Z \-\']+')]),
        this.controls.customerBankName.updateValueAndValidity()
      this.controls.customerAccountNo.setValidators([Validators.required, Validators.pattern('^[0-9]*[1-9][0-9]*$')]),
        this.controls.customerAccountNo.updateValueAndValidity()
      this.controls.ifscCode.setValidators([Validators.required, Validators.pattern('^[A-Za-z]{4}[a-zA-Z0-9]{7}')]),
        this.controls.ifscCode.updateValueAndValidity()
    } else {
      this.controls.customerBankName.setValidators([]),
        this.controls.customerBankName.updateValueAndValidity()
      this.controls.customerAccountNo.setValidators([]),
        this.controls.customerAccountNo.updateValueAndValidity()
      this.controls.ifscCode.setValidators([]),
        this.controls.ifscCode.updateValueAndValidity()
    }
  }

  uploadImage(data) {
    if (data.fieldName == 'passbookCopy') {
      this.cancelForm.controls['passbookId'].patchValue(
        data.uploadData.id
      );
    } else if (data.fieldName == 'checkCopy') {
      this.cancelForm.controls['checkCopyId'].patchValue(
        data.uploadData.id
      );
    }
  }

  removeImage(data) {
    if (data.fieldName == 'passbookCopy') {
      this.cancelForm.controls['passbookId'].patchValue('');
    } else if (data.fieldName == 'checkCopy') {
      this.cancelForm.controls['checkCopyId'].patchValue('');
    }
  }

  getOtp() {
    this.setValidation();
    if (this.cancelForm.invalid) {
      this.cancelForm.markAllAsTouched();
      return;
    }

    let params = {
      orderId: this.orderId
    }

    this.shopService.getOtp(params).subscribe(res => {
      this.otpFlag = false;
      this.confirmFlag = true;
      this.value = 'Confirm OTP';
      this.controls.referenceCode.patchValue(res.referenceCode);
    })
  }

  confirmOtp() {
    this.controls.otp.setValidators([Validators.required]);
    this.controls.otp.updateValueAndValidity();
    if (this.cancelForm.invalid) {
      this.cancelForm.markAllAsTouched();
      return;
    }
    let data = {
      ...this.cancelForm.value,
      amountTransferTo: '',
      vleId: '',
    }

    if (this.selectedPayment.value == 'bankAccount') {
      data.amountTransferTo = 'bankAccount';
    } else {
      data.amountTransferTo = 'augmontWallet';
    }

    let edwaarSessionData = JSON.parse(sessionStorage.getItem('edwaar-session'));
    if (edwaarSessionData) {
      data.vleId = edwaarSessionData.vleId;
      data.vleSession = edwaarSessionData.vleSession;
      data.amountTransferTo = 'partnerWallet';
    }

    this.shopService.updateCancelOrder(this.orderId, data).subscribe(
      res => {
        this.toastr.successToastr('Order Cancelled Successfully');
        this.router.navigate(['/broker/orders']);
      },
      error => {
        this.toastr.errorToastr(error.error);
      })
  }
}
