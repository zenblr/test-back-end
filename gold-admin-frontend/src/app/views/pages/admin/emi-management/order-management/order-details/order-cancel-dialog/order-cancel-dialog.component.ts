import { Component, OnInit, Inject, ViewChild, ChangeDetectorRef } from '@angular/core';
import { Validators, FormBuilder, FormGroup } from '@angular/forms';
import { ToastrComponent } from '../../../../../../partials/components/toastr/toastr.component';
import { ActivatedRoute, Router } from "@angular/router";
import { OrderDetailsService } from '../../../../../../../core/emi-management/order-management';
import { SharedService } from '../../../../../../../core/shared/services/shared.service';

@Component({
  selector: 'kt-order-cancel-dialog',
  templateUrl: './order-cancel-dialog.component.html',
  styleUrls: ['./order-cancel-dialog.component.scss']
})
export class OrderCancelDialogComponent implements OnInit {
  @ViewChild(ToastrComponent, { static: true }) toastr: ToastrComponent;
  cancelForm: FormGroup;
  title: string = 'Cancel Order';
  orderId: number;
  cancelData: any;
  isMandatory = true;
  transferOptionList = [
    { value: 'bankAccount', name: 'Customer Bank' },
    { value: 'augmontWallet', name: 'Augmont Wallet' }
  ];
  bankFields = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder,
    private orderService: OrderDetailsService,
    private chRef: ChangeDetectorRef,
  ) { }

  ngOnInit() {
    this.orderId = this.route.snapshot.params.id;
    this.formInitialize();
    this.orderService.getCancelOrderPrice(this.orderId).subscribe(res => {
      this.bindValue(res);
    });
  }

  formInitialize() {
    this.cancelForm = this.fb.group({
      storeId: [''],
      orderId: [''],
      userId: [''],
      customerName: [''],
      mobileNumber: [''],
      bookingPrice: [''],
      totalAmt: [''],
      cancellationPrice: [''],
      differenceAmt: [''],
      totalCancellationCharges: [''],
      amtPayable: [''],
      customerBankName: [''],
      customerAccountNo: [''],
      ifscCode: [''],
      cancellationCharges: ['', Validators.required],
      passbookId: [null],
      checkCopyId: [null],
      nextStatus: ['', Validators.required],
      amountTransferTo: ['', Validators.required],
    });
    // this.cancelForm.valueChanges.subscribe(val => console.log(val));
  }

  get controls() {
    return this.cancelForm.controls;
  }

  bindValue(value) {
    const data = {
      storeId: value.storeID,
      userId: value.customer.customerUniqueId,
      customerName: value.customer.firstName,
      mobileNumber: value.customer.mobileNumber,
      orderId: value.orderId,
      bookingPrice: value.totalPrice,
      totalAmt: value.totalAmountPaid,
      cancellationPrice: value.cancelationPriceOfOrder,
      differenceAmt: value.diffrenceAmount,
      totalCancellationCharges: value.totalCancelationCharges,
      cancellationCharges: value.cancellationCharges,
      amtPayable: value.payableToCustomer,
      customerBankName: value.customerBankName,
      customerAccountNo: value.customerAccountNo,
      ifscCode: value.ifscCode,
    }
    this.cancelForm.patchValue(data);
    this.cancelData = value;
    if (this.cancelData.merchantPaymentConfig.paymentGateway == 'edwaar' || this.cancelData.merchantDetail.id != 1) {
      this.cancelForm.controls.amountTransferTo.patchValue('bankAccount');
      this.tranferValue('bankAccount');
    }
    this.chRef.detectChanges();
  }

  setValidation(type) {
    if (type == 'bankAccount') {
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
    if (data.fieldName == "passbookCopy") {
      this.cancelForm.controls["passbookId"].patchValue(
        data.uploadData.id
      );
    } else if (data.fieldName == "checkCopy") {
      this.cancelForm.controls["checkCopyId"].patchValue(
        data.uploadData.id
      );
    }
  }

  removeImage(data) {
    if (data.fieldName == "passbookCopy") {
      this.cancelForm.controls["passbookId"].patchValue("");
    } else if (data.fieldName == "checkCopy") {
      this.cancelForm.controls["checkCopyId"].patchValue("");
    }
  }

  tranferValue(value) {
    this.cancelForm.patchValue({
      customerBankName: '',
      ifscCode: '',
      customerAccountNo: '',
      passbookId: null,
      checkCopyId: null
    });
    if (value == 'bankAccount') {
      this.bankFields = true;
    } else {
      this.bankFields = false;
    }
    this.setValidation(value);
  }

  onSubmit() {
    if (this.cancelForm.invalid) {
      this.cancelForm.markAllAsTouched();
      return;
    }
    let data = {
      ...this.cancelForm.value,
      cancellationCharges: Number(this.controls.cancellationCharges.value),
    }

    if (this.cancelData.merchantPaymentConfig.paymentGateway == 'edwaar') {
      data.amountTransferTo = 'partnerWallet';
    }

    this.orderService.updateCancelOrder(this.orderId, data).subscribe(
      res => {
        this.toastr.successToastr("Order Cancelled Successfully");
        this.router.navigate(["/admin/emi-management/order-details"]);
      },
      error => {
        this.toastr.errorToastr(error.error);
      });
  }
}
