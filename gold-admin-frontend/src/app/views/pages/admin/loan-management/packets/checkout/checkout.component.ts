import { Component, OnInit, Inject } from '@angular/core';
import { FormGroup, Validators, FormBuilder } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
import { LeadService } from '../../../../../../core/lead-management/services/lead.service';
import { AppliedLoanService } from '../../../../../../core/loan-management';
import { map } from 'rxjs/operators';

@Component({
  selector: 'kt-checkout',
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.scss']
})
export class CheckoutComponent implements OnInit {

  checkoutForm: FormGroup
  otpVerfied: boolean
  otpSent: boolean
  refCode: string

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<CheckoutComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private toastr: ToastrService,
    private appliedLoanService: AppliedLoanService
  ) { }

  ngOnInit() {
    this.initForm()
  }

  initForm() {
    this.checkoutForm = this.fb.group({
      customerId: [],
      // mobileNumber: [, [Validators.required, Validators.pattern('^[6-9][0-9]{9}$')]],
      otp: [, [Validators.required]],
      loanId: [null],
      masterLoanId: [null],
      referenceCode: [this.refCode]
    })

    this.checkoutForm.patchValue(this.data.loanData)
    // console.log(this.checkoutForm.value)
  }

  action(event) {
    if (event) {
      this.submit()
    } else {
      this.dialogRef.close()
    }
  }

  submit() {
    // console.log(this.checkoutForm.value)

    if (this.checkoutForm.invalid) return this.checkoutForm.markAllAsTouched()

    let params = this.checkoutForm.value
    params.type = 'lead'

    this.appliedLoanService.verifyOtp(params).subscribe(res => {
      if (res) {
        // this.otpSent = true;
        // this.otpVerfied = true;
        const msg = 'Otp has been verified!'
        this.toastr.success(msg);
        this.dialogRef.close(true);
      }
    },
      err => {
        if (err.error.message == 'INVALID OTP.') {
          this.controls.otp.setErrors({ invalidOTP: true })
        }
      }
    );
  }

  get controls() {
    return this.checkoutForm.controls;
  }

  resendOTP() {
    this.appliedLoanService.checkout(this.controls.customerId.value).pipe(map(res => {
      if (res) {
        this.toastr.success('OTP has been sent sucessfully')
        this.controls.referenceCode.patchValue(res.referenceCode)
      }
    })).subscribe()
  }
}
