import { Component, OnInit, Inject } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { CheckoutCustomerService, ShoppingCartService } from '../../../../core/broker';

@Component({
  selector: 'kt-payment-dialog',
  templateUrl: './payment-dialog.component.html',
  styleUrls: ['./payment-dialog.component.scss']
})
export class PaymentDialogComponent implements OnInit {
  paymentForm: FormGroup;
  title: string;
  branches = [];
  details: any;
  file: any;
  currentDate = new Date();

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<PaymentDialogComponent>,
    private fb: FormBuilder,
    private toastr: ToastrService,
    private checkoutCustomerService: CheckoutCustomerService,
  ) { }

  ngOnInit() {
    this.initForm();
    this.title = 'Payment Mode';
    if (this.data.paymentData) {
      this.paymentForm.patchValue(this.data.paymentData)
      this.setValidation(this.paymentForm.controls.paymentMode.value)
    }
    console.log(this.data.paymentData);
    console.log(this.paymentForm.value);
  }

  initForm() {
    this.paymentForm = this.fb.group({
      paymentMode: ['', Validators.required],
      bankName: [, [Validators.required, Validators.pattern('^[a-zA-Z][a-zA-Z\-\\s]*$')]],
      bankBranch: [, [Validators.required, Validators.pattern('^[a-zA-Z][a-zA-Z\-\\s]*$')]],
      transactionId: [],
      chequeNumber: [],
      depositDate: [this.currentDate, Validators.required],
      customerId: [, [Validators.required]],
      blockId: [, [Validators.required]],
      totalInitialAmount: [, [Validators.required]],
    })
    this.paymentForm.valueChanges.subscribe(val => console.log(val))
  }

  setValidation(paymentMode) {
    // console.log(event.target.value)
    // const paymentMode = event.target.value
    switch (paymentMode) {
      case 'cash':
        this.paymentForm.controls.bankName.setValidators([]),
          this.paymentForm.controls.bankName.updateValueAndValidity()
        this.paymentForm.controls.bankBranch.setValidators([]),
          this.paymentForm.controls.bankBranch.updateValueAndValidity()
        this.paymentForm.controls.transactionId.setValidators([]),
          this.paymentForm.controls.transactionId.updateValueAndValidity()
        this.paymentForm.controls.chequeNumber.setValidators([]),
          this.paymentForm.controls.chequeNumber.updateValueAndValidity()
        break;
      case 'imps': case 'neft': case 'rtgs':
        this.paymentForm.controls.chequeNumber.setValidators([]),
          this.paymentForm.controls.chequeNumber.updateValueAndValidity()
        this.paymentForm.controls.transactionId.setValidators(Validators.required),
          this.paymentForm.controls.transactionId.updateValueAndValidity()
        break;
      case 'upi':
        this.paymentForm.controls.chequeNumber.setValidators([]),
          this.paymentForm.controls.chequeNumber.updateValueAndValidity()
        this.paymentForm.controls.bankBranch.setValidators([]),
          this.paymentForm.controls.bankBranch.updateValueAndValidity()
        this.paymentForm.controls.transactionId.setValidators(Validators.required),
          this.paymentForm.controls.transactionId.updateValueAndValidity()
        break;
      case 'cheque':
        this.paymentForm.controls.transactionId.setValidators([]),
          this.paymentForm.controls.transactionId.updateValueAndValidity()
        this.paymentForm.controls.chequeNumber.setValidators(Validators.required),
          this.paymentForm.controls.chequeNumber.updateValueAndValidity()
        break;
      default:
        break;
    }
  }

  get controls() {
    return this.paymentForm.controls;
  }

  action(event) {
    if (event) {
      this.submit()
    } else if (!event) {
      this.dialogRef.close()
    }
  }

  submit() {
    if (this.paymentForm.invalid) {
      return this.paymentForm.markAllAsTouched();
    }
    this.checkoutCustomerService.placeOrder(this.paymentForm.value).subscribe(res => {
      if (res) {
        this.dialogRef.close(true);
      }
    });
  }
}