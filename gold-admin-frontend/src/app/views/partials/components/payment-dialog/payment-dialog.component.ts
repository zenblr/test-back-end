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

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<PaymentDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private depositService: DepositService,
    private toast: ToastrService,
  ) { }

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
        this.paymentForm.controls.depositDate.patchValue(this.data.value.paymentReceivedDate);
        this.paymentForm.controls.paidAmount.patchValue(this.data.value.transactionAmont);
        this.paymentForm.controls.paymentType.patchValue(this.data.value.paymentType);
        this.paymentForm.controls.depositStatus.patchValue(this.data.value.depositStatus);
        this.disableForm();
      } else {
        this.paymentForm.patchValue(this.data.value)
        this.paymentForm.controls.depositStatus.disable()
      }
    }
  }
  disableForm() {
    this.paymentForm.controls.depositTransactionId.disable()
    this.paymentForm.controls.transactionId.disable()
    this.paymentForm.controls.depositDate.disable()
    this.paymentForm.controls.paidAmount.disable()
    this.paymentForm.controls.bankName.disable()
    this.paymentForm.controls.branchName.disable()
    this.paymentForm.controls.chequeNumber.disable()
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
      case 'NEFT':
      case 'RTGS':
      case 'UPI':
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

  action(event: Event) {
    if (event) {
      this.submit()
    } else if (!event) {
      this.dialogRef.close()
    }
  }

  submit() {
    if (this.paymentForm.invalid) return this.paymentForm.markAllAsTouched()
    if (this.data.name == "deposit") {
      console.log(this.paymentForm.controls.depositStatus.value)
      this.depositService.editStatus(this.paymentForm.controls.depositStatus.value, this.data.value.id).pipe(
        map(res => {
          this.toast.success(res.message)
          this.dialogRef.close(res)
        }), catchError(err => {
          this.toast.error(err.error.message)
          throw err
        })).subscribe()
    } else {
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
