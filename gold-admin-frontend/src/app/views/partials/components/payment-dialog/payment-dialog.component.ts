import { Component, OnInit, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { DepositService } from '../../../../core/funds-approvals/deposit/services/deposit.service'
import { map, catchError } from 'rxjs/operators';
import { ToastrService } from 'ngx-toastr';
import { DatePipe } from '@angular/common';
import { LayoutUtilsService } from "../../../../core/_base/crud";

@Component({
  selector: 'kt-payment-dialog',
  templateUrl: './payment-dialog.component.html',
  styleUrls: ['./payment-dialog.component.scss'],
  providers: [DatePipe]
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
    private dataPipe: DatePipe,
    private layoutUtilsService: LayoutUtilsService
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
        this.paymentForm.controls.paidAmount.patchValue(this.data.value.transactionAmont);
        this.paymentForm.controls.paymentReceivedDate.patchValue(this.data.value.depositDate)
        // this.paymentForm.controls.paymentReceivedDate.patchValue(this.getOffsetDateTime(this.data.value.depositDate))
        this.paymentForm.controls.depositStatus.patchValue('');
        this.paymentForm.disable();
        this.paymentForm.controls.depositStatus.enable();
        this.paymentForm.controls.paymentReceivedDate.enable();
      } else {
        this.minDate = this.data.date;
        this.paymentForm.patchValue(this.data.value)
        this.paymentForm.controls.depositStatus.disable();
        this.paymentForm.controls.paidAmount.disable();
        this.paymentForm.controls.depositTransactionId.disable();
        this.paymentForm.controls.paymentReceivedDate.disable();

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
        this.paymentForm.controls.paymentType.updateValueAndValidity()
        this.paymentForm.controls.paidAmount.setValidators([Validators.required])
        this.paymentForm.controls.paidAmount.updateValueAndValidity()
        this.paymentForm.controls.depositDate.setValidators([Validators.required])
        this.paymentForm.controls.depositDate.updateValueAndValidity()
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
        // this.controls.depositDate.patchValue(this.getOffsetDateTime(new Date()))
        this.controls.depositDate.patchValue(new Date())

      default:

        break;
    }
    this.controls.depositStatus.setValidators([Validators.required])
    this.controls.depositStatus.updateValueAndValidity()
  }

  get controls() {
    return this.paymentForm.controls
  }

  depositStatus(event) {
    const status = event.target.value
    if (status == 'Rejected') {
      this.controls.paymentReceivedDate.clearValidators()
      this.controls.paymentReceivedDate.updateValueAndValidity()
    } else {
      this.controls.paymentReceivedDate.setValidators([Validators.required])
      this.controls.paymentReceivedDate.updateValueAndValidity()
    }
  }

  action(event: Event) {
    if (event) {
      this.submit()
    } else if (!event) {
      this.dialogRef.close()
    }
  }

  submit() {
    if (this.paymentForm.invalid) {
      return this.paymentForm.markAllAsTouched()
    }
    // this.paymentForm.patchValue({ paymentReceivedDate : this.controls.paymentReceivedDate.value ? this.getOffsetDateTime(this.controls.paymentReceivedDate.value) : null })
    let paymentDate = this.dataPipe.transform(this.paymentForm.controls.paymentReceivedDate.value, 'yyyy-MM-dd')
    if (this.data.name == "deposit") {


      const _title = 'Update Deposit Status';
      const _description = 'Are you sure to update deposit status?';
      const _waitDesciption = 'Deposit Status Updating ...';
      const dialogRef = this.layoutUtilsService.deleteElement(_title, _description, _waitDesciption);
      dialogRef.afterClosed().subscribe(res => {
        if (res) {
          this.dialogRef.close({
            depositStatus: this.paymentForm.controls.depositStatus.value,
            paymentReceivedDate: paymentDate
          })
        }
      })

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
      this.dialogRef.close(this.paymentForm.value)
    }

  }

  getOffsetDateTime(originalDate) {
    const correctedDate = new Date(originalDate.getTime() - originalDate.getTimezoneOffset() * 60000)
    return correctedDate
  }
}
