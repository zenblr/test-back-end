import { Component, OnInit, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { DepositService } from '../../../../core/funds-approvals/deposit/services/deposit.service'
import { map, catchError } from 'rxjs/operators';
import { ToastrService } from 'ngx-toastr';
@Component({
  selector: 'kt-payment-dialog',
  templateUrl: './payment-dialog.component.html',
  styleUrls: ['./payment-dialog.component.scss']
})
export class PaymentDialogComponent implements OnInit {
  paymentTypeList = [{ value: 'cash', name: 'cash' }, { value: 'IMPS', name: 'IMPS' }, { value: 'NEFT', name: 'NEFT' }, { value: 'RTGS', name: 'RTGS' }, { value: 'cheque', name: 'cheque' }, { value: 'UPI', name: 'UPI' }, { value: 'gateway', name: 'payment gateway' }]
  paymentForm: FormGroup;
  title: string = ''
  minDate: Date;
  maxDate = new Date()
  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<PaymentDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private depositService: DepositService,
    private toast: ToastrService,
  ) {
  }

  ngOnInit() {

    this.initForm()
    this.setForm()
  }

  initForm() {
    this.paymentForm = this.fb.group({
      paymentType: ['', [Validators.required]],
      bankName: [],
      branchName: [],
      transactionId: [],
      depositDate: [, [Validators.required]],
      paidAmount: [, [Validators.required]],
      chequeNumber: [],
      depositTransactionId: [],
      paymentReceivedDate: [, [Validators.required]],
      depositStatus: ['', [Validators.required]]
    })
  }

  setForm() {
    if (this.data.value) {
      if (this.data.name == "deposit") {
        this.title = 'Edit Deposit Status'
        this.paymentForm.patchValue(this.data.value)
        this.paymentForm.controls.depositTransactionId.patchValue(this.data.value.transactionUniqueId);
        this.paymentForm.controls.transactionId.patchValue(this.data.value.bankTransactionUniqueId);
        this.paymentForm.controls.depositDate.patchValue(this.data.value.depositDate);
        this.paymentForm.controls.paidAmount.patchValue(this.data.value.transactionAmont);
        this.paymentForm.controls.paymentType.patchValue(this.data.value.paymentType);
        this.paymentForm.controls.depositStatus.patchValue(this.data.value.depositStatus);
        this.paymentForm.disable();
        this.paymentForm.controls.depositStatus.enable();
        this.paymentForm.controls.paymentReceivedInBank.enable();
      } else {
        this.minDate = this.data.date;
        this.paymentForm.patchValue(this.data.value)
        this.paymentForm.controls.depositStatus.disable();
        this.paymentForm.controls.paidAmount.disable();
        this.paymentForm.controls.depositTransactionId.disable();
      }
    }
  }

  setValidation(event) {
    // console.log(event.target.value)
    const paymentMode = event.target.value
    switch (paymentMode) {
      case 'cash':
        for (const key in this.paymentForm.controls) {
          this.paymentForm.controls[key].setValidators([])
          this.paymentForm.controls[key].updateValueAndValidity()
        }
        this.paymentForm.controls.paymentType.setValidators([Validators.required])
        this.paymentForm.controls.paidAmount.setValidators([Validators.required])
        this.paymentForm.controls.depositDate.setValidators([Validators.required])
        this.paymentForm.updateValueAndValidity()
        break;

      case 'IMPS':
      case 'NEFT':
      case 'RTGS':
      case 'UPI':
        this.paymentForm.clearValidators();
        this.paymentForm.updateValueAndValidity()

        for (const key in this.paymentForm.controls) {
          if (key !== 'chequeNumber') {
            this.paymentForm.controls[key].setValidators([Validators.required])
            this.paymentForm.controls[key].updateValueAndValidity()
          } else {
            this.paymentForm.controls[key].patchValue(null)
          }
        }
        break;

      case 'cheque':
        this.paymentForm.clearValidators();
        this.paymentForm.updateValueAndValidity()

        for (const key in this.paymentForm.controls) {
          if (key != 'transactionId') {
            this.paymentForm.controls[key].setValidators([Validators.required])
            this.paymentForm.controls[key].updateValueAndValidity()
            if (key === 'chequeNumber') {
              this.paymentForm.controls[key].setValidators([Validators.required, Validators.pattern('[0-9]{6}')]);
              this.paymentForm.controls[key].updateValueAndValidity()
            }
          } else {
            this.paymentForm.controls[key].patchValue(null)
          }
        }
        break;

      case 'gateway':
        for (const key in this.paymentForm.controls) {
          this.paymentForm.controls[key].setValidators([])
          this.paymentForm.controls[key].updateValueAndValidity()
        }
        this.controls.depositDate.patchValue(new Date())

      default:
        break;
    }
  }

  get controls() {
    return this.paymentForm.controls
  }

  action(event: Event) {
    if (event) {
      this.submit()
    } else if (!event) {
      this.dialogRef.close()
    }
  }

  submit() {
    if (this.paymentForm.invalid)
      return this.paymentForm.markAllAsTouched()
    if (this.data.name == "deposit") {
      this.dialogRef.close(this.paymentForm.controls.depositStatus.value)
    } else {
      this.paymentForm.controls.paidAmount.enable();
      this.paymentForm.patchValue({ paidAmount: Number(this.controls.paidAmount.value) })
      if (this.controls.paymentType.value === 'cash') {
        this.paymentForm.patchValue({
          branchName: null,
          bankName: null,
          transactionId: null,
          chequeNumber: null
        })
      }
    }
    this.dialogRef.close(this.paymentForm.value)
  }
}
