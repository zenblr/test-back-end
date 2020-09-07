import { Component, OnInit, Inject } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { CheckoutCustomerService, ShoppingCartService } from '../../../../core/broker';
import { ShopService } from '../../../../core/broker';
import { values } from 'lodash';

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
  minDate: Date;
  // currentDate = new Date();

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<PaymentDialogComponent>,
    private fb: FormBuilder,
    private toastr: ToastrService,
    private checkoutCustomerService: CheckoutCustomerService,
    private shopService: ShopService,
  ) { }

  ngOnInit() {
    this.initForm();
    this.title = 'Payment Mode';
    if (this.data.paymentData) {
      this.paymentForm.patchValue(this.data.paymentData)
      
      if(this.data.paymentData.amount){
        this.paymentForm.controls['transactionAmount'].patchValue(this.data.paymentData.amount)
      }
      if(this.data.paymentData.totalInitialAmount){
        this.paymentForm.controls['transactionAmount'].patchValue(this.data.paymentData.totalInitialAmount)
      }
      this.setValidation(this.paymentForm.controls.paymentMode.value)
    }
    if(this.data.orderId) {
      this.paymentForm.controls['orderId'].patchValue(this.data.orderId)
    }
    if(this.data.paymentMode) {
      this.paymentForm.controls['paymentMode'].patchValue(this.data.paymentMode)
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
      depositDate: [, [Validators.required]],
      customerId: [],
      blockId: [],
      orderId: [],
      totalInitialAmount: [],
      transactionAmount: []  
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
        this.paymentForm.controls.depositDate.setValidators([Validators.required])
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
    if(this.data.isEMI){
      this.paymentForm.controls.transactionAmount.setValidators(Validators.required),
      this.paymentForm.controls.transactionAmount.updateValueAndValidity()
      this.paymentForm.controls.orderId.setValidators(Validators.required),
      this.paymentForm.controls.orderId.updateValueAndValidity()
     
    }
    else{
      this.paymentForm.controls.totalInitialAmount.setValidators(Validators.required),
      this.paymentForm.controls.totalInitialAmount.updateValueAndValidity()
      this.paymentForm.controls.customerId.setValidators(Validators.required),
      this.paymentForm.controls.customerId.updateValueAndValidity()
      this.paymentForm.controls.blockId.setValidators(Validators.required),
      this.paymentForm.controls.blockId.updateValueAndValidity()
    }
  }

  get controls() {
    return this.paymentForm.controls;
  }

  action(event) {
    if (event) {
      this.submit()
      console.log(this.submit)
    } else if (!event) {
      this.dialogRef.close()
    }
  }

  submit() {
    if (this.paymentForm.invalid) {
     console.log(this.paymentForm.invalid)
      return this.paymentForm.markAllAsTouched();
    }
    if (this.data.isEMI) {
      console.log(this.paymentForm.value)
      this.shopService.payEMI(this.paymentForm.value).subscribe(res => {
        if (res) {
          this.dialogRef.close(true);
        }
      });
    }
    else {
          this.checkoutCustomerService.placeOrder(this.paymentForm.value).subscribe(res => {
            if (res) {
              this.dialogRef.close(true);
            }
          });
        }
      }
}