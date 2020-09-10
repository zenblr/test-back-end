import { Component, OnInit, Inject } from '@angular/core';
import { FormGroup, Validators, FormBuilder } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
import { LeadService } from '../../../../../../core/lead-management/services/lead.service';

@Component({
  selector: 'kt-checkout',
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.scss']
})
export class CheckoutComponent implements OnInit {

  checkoutForm: FormGroup
  otpVerfied: boolean
  otpSent: boolean

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<CheckoutComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private toastr: ToastrService,
    private leadService: LeadService
  ) { }

  ngOnInit() {
    this.initForm()
  }

  initForm() {
    this.checkoutForm = this.fb.group({
      mobileNumber: [, [Validators.required, Validators.pattern('^[6-9][0-9]{9}$')]],
      otp: [, [Validators.required]],
      loanId: [null],
      masterLoanId: [null],
    })
  }

  action(event) {
    if (event) {
      this.submit()
    } else {
      this.dialogRef.close()
    }
  }

  submit() {
    console.log(this.checkoutForm.value)

    const params = {
      otp: this.controls.otp.value,
      referenceCode: this.controls.referenceCode.value,
      type: 'lead'
    };

    this.leadService.verifyOtp(params).subscribe(res => {
      if (res) {
        this.otpSent = true;
        this.otpVerfied = true;
        const msg = 'Otp has been verified!'
        this.toastr.success(msg);
      }
    },
      err => {
        this.toastr.error(err.error.message)
      }
    );
  }

  get controls() {
    return this.checkoutForm.controls;
  }
}
