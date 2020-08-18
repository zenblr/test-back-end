import { Component, OnInit, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';

@Component({
  selector: 'kt-payment-dialog',
  templateUrl: './payment-dialog.component.html',
  styleUrls: ['./payment-dialog.component.scss']
})
export class PaymentDialogComponent implements OnInit {
  paymentForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<PaymentDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
  ) { }

  ngOnInit() {
    this.initForm()
    if (this.data.value) this.paymentForm.patchValue(this.data.value)
  }

  initForm() {
    this.paymentForm = this.fb.group({
      paymentType: ['', [Validators.required]],
      bankName: [],
      branchName: [],
      transactionId: [],
      depositDate: [, [Validators.required]],
      paidAmount: [, [Validators.required]],
      chequeNumber: []
    })
  }

  setValidation(event) {
    // console.log(event.target.value)
    const paymentMode = event.target.value
    switch (paymentMode) {
      case 'cash':
        this.paymentForm.clearValidators();
        this.paymentForm.controls.paymentType.setValidators([Validators.required])
        this.paymentForm.controls.paidAmount.setValidators([Validators.required])
        this.paymentForm.controls.depositDate.setValidators([Validators.required])
        this.paymentForm.updateValueAndValidity()
        break;

      case 'IMPS':
        this.paymentForm.clearValidators();

        for (const key in this.paymentForm.controls) {
          if (key !== 'chequeNumber') {
            this.paymentForm.controls[key].setValidators([Validators.required])
          } else {
            this.paymentForm.controls[key].patchValue(null)
          }
        }
        this.paymentForm.updateValueAndValidity()
        // console.log(this.paymentForm)


        // this.paymentForm.controls.paymentMode.setValidators([Validators.required])
        // this.paymentForm.controls.transactionId.setValidators([Validators.required])
        // this.paymentForm.controls.depositBankName.setValidators([Validators.required])
        // this.paymentForm.controls.depositAmount.setValidators([Validators.required])
        // this.paymentForm.controls.depositDate.setValidators([Validators.required])
        // this.paymentForm.updateValueAndValidity()
        break;

      case 'cheque':
        this.paymentForm.clearValidators();

        for (const key in this.paymentForm.controls) {
          if (key != 'transactionId') {
            this.paymentForm.controls[key].setValidators([Validators.required])
            if (key === 'chequeNumber') this.paymentForm.controls[key].setValidators([Validators.required, Validators.pattern('[0-9]{6}')])
          } else {
            this.paymentForm.controls[key].patchValue(null)
          }
        }
        this.paymentForm.updateValueAndValidity()
        // console.log(this.paymentForm)

        // this.paymentForm.controls.paymentMode.setValidators([Validators.required])
        // this.paymentForm.controls.chequeNumber.setValidators([Validators.required])
        // this.paymentForm.controls.depositBankName.setValidators([Validators.required])
        // this.paymentForm.controls.depositAmount.setValidators([Validators.required])
        // this.paymentForm.controls.depositDate.setValidators([Validators.required])
        // this.paymentForm.updateValueAndValidity()
        break;

      default:
        break;
    }
  }

  get controls() {
    return this.paymentForm.controls
  }

  // closeModal() {
  //   if (this.data.value) {
  //     this.dialogRef.close()
  //   } else {
  //     this.dialogRef.close()
  //   }
  // }

  action(event) {
    if (event) {
      this.submit()
    } else if (!event) {
      this.dialogRef.close()
    }
  }

  submit() {
    if (this.paymentForm.invalid) return this.paymentForm.markAllAsTouched()
    this.paymentForm.patchValue({ paidAmount: Number(this.controls.paidAmount.value) })
    if (this.controls.paymentType.value === 'cash') {
      this.paymentForm.patchValue({
        branchName: null,
        bankName: null,
        transactionId: null,
        chequeNumber: null
      })
    }
    this.dialogRef.close(this.paymentForm.value)
  }
}