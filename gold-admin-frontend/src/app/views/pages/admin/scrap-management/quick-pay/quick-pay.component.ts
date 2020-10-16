import { Component, OnInit, Inject } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { ScrapApplicationFormService } from '../../../../../core/scrap-management';

@Component({
  selector: 'kt-quick-pay',
  templateUrl: './quick-pay.component.html',
  styleUrls: ['./quick-pay.component.scss']
})
export class QuickPayComponent implements OnInit {
  quickPayForm: FormGroup;
  title: string;
  branches = [];
  details: any;
  file: any;
  currentDate = new Date();

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<QuickPayComponent>,
    private fb: FormBuilder,
    private toastr: ToastrService,
    private scrapApplicationFormService: ScrapApplicationFormService
  ) { }

  ngOnInit() {
    this.initForm();
    this.title = 'Quick Pay (Processing Charges)';
    if (this.data.quickPayData) {
      this.controls['depositAmount'].patchValue(this.data.quickPayData.processingCharges)
    }
    if (this.data.scrapIds) {
      this.controls['scrapId'].patchValue(this.data.scrapIds.scrapId)
    }
    console.log(this.data.quickPayData);
    console.log(this.quickPayForm.value);
  }

  initForm() {
    this.quickPayForm = this.fb.group({
      scrapId: [],
      paymentMode: ['', Validators.required],
      bankName: [, [Validators.required, Validators.pattern('^[a-zA-Z][a-zA-Z\-\\s]*$')]],
      bankBranch: [, [Validators.required, Validators.pattern('^[a-zA-Z][a-zA-Z\-\\s]*$')]],
      transactionId: [],
      chequeNumber: [],
      depositAmount: [, [Validators.required]],
      depositDate: [this.currentDate, Validators.required],
    })
  }

  setValidation(event) {
    // console.log(event.target.value)
    const paymentMode = event.target.value
    switch (paymentMode) {
      case 'cash':
        this.quickPayForm.controls.bankName.setValidators([]),
          this.quickPayForm.controls.bankName.updateValueAndValidity()
        this.quickPayForm.controls.bankBranch.setValidators([]),
          this.quickPayForm.controls.bankBranch.updateValueAndValidity()
        this.quickPayForm.controls.transactionId.setValidators([]),
          this.quickPayForm.controls.transactionId.updateValueAndValidity()
        this.quickPayForm.controls.chequeNumber.setValidators([]),
          this.quickPayForm.controls.chequeNumber.updateValueAndValidity()
        break;
      case 'bankTransfer':
        this.quickPayForm.controls.chequeNumber.setValidators([]),
          this.quickPayForm.controls.chequeNumber.updateValueAndValidity()
        this.quickPayForm.controls.bankName.setValidators([Validators.required, Validators.pattern('^[a-zA-Z][a-zA-Z\-\\s]*$')]),
          this.quickPayForm.controls.bankName.updateValueAndValidity()
        this.quickPayForm.controls.bankBranch.setValidators([Validators.required, Validators.pattern('^[a-zA-Z][a-zA-Z\-\\s]*$')]),
          this.quickPayForm.controls.bankBranch.updateValueAndValidity()
        this.quickPayForm.controls.transactionId.setValidators(Validators.required),
          this.quickPayForm.controls.transactionId.updateValueAndValidity()
        break;
      case 'cheque':
        this.quickPayForm.controls.transactionId.setValidators([]),
          this.quickPayForm.controls.transactionId.updateValueAndValidity()
        this.quickPayForm.controls.bankName.setValidators([Validators.required, Validators.pattern('^[a-zA-Z][a-zA-Z\-\\s]*$')]),
          this.quickPayForm.controls.bankName.updateValueAndValidity()
        this.quickPayForm.controls.bankBranch.setValidators([Validators.required, Validators.pattern('^[a-zA-Z][a-zA-Z\-\\s]*$')]),
          this.quickPayForm.controls.bankBranch.updateValueAndValidity()
        this.quickPayForm.controls.chequeNumber.setValidators([Validators.required, Validators.pattern('[0-9]{6}')]),
          this.quickPayForm.controls.chequeNumber.updateValueAndValidity()
        break;
      default:
        break;
    }
  }

  get controls() {
    return this.quickPayForm.controls;
  }

  action(event) {
    if (event) {
      this.submit()
    } else if (!event) {
      this.dialogRef.close()
    }
  }

  submit() {
    if (!this.quickPayForm.controls.paymentMode.value) {
      this.quickPayForm.controls.transactionId.setValidators(Validators.required),
        this.quickPayForm.controls.transactionId.updateValueAndValidity()
    }
    if (this.quickPayForm.invalid) {
      return this.quickPayForm.markAllAsTouched();
    }
    this.scrapApplicationFormService.quickPay(this.quickPayForm.value, this.data.quickPayData).subscribe(res => {
      if (res) {
        // const msg = 'Packet Updated Sucessfully';
        this.toastr.success(res.message);
        this.dialogRef.close(true);
      }
    });
  }
}