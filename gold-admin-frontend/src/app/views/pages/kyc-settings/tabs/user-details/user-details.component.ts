import { Component, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ToastrComponent } from '../../../../../views/partials/components';

@Component({
  selector: 'kt-user-details',
  templateUrl: './user-details.component.html',
  styleUrls: ['./user-details.component.scss']
})
export class UserDetailsComponent implements OnInit {
  userBasicForm: FormGroup;
  refCode: number; //reference code
  otpButton = true;
  panButton = true;
  isPanVerified = false;
  isMobileVerified = false;
  otpSent = false;
  isOpverified = true;

  @ViewChild(ToastrComponent, { static: true }) toastr: ToastrComponent;


  constructor(public fb: FormBuilder) { }

  ngOnInit() {
    this.initForm();
    this.controls.mobileNumber.valueChanges.subscribe(res => {
      if (this.controls.mobileNumber.valid) {
        this.otpButton = false;
      } else {
        this.otpButton = true;
        this.isMobileVerified = false;
        this.otpSent = false;
      }
    });

    this.controls.panCardNumber.valueChanges.subscribe(res => {
      if (this.controls.panCardNumber.valid) {
        this.panButton = false;
      } else {
        this.panButton = true;
        this.isPanVerified = false;
      }
    });

    this.controls.otp.valueChanges.subscribe(res => {
      if (this.controls.otp.valid) {
        this.isOpverified = false;
      } else {
        this.isOpverified = true;
      }
    });
  }

  get controls() {
    if (this.userBasicForm) {
      return this.userBasicForm.controls
    }
  }

  initForm() {
    this.userBasicForm = this.fb.group({
      firstName: ['', [Validators.required]],
      lastName: ['', [Validators.required]],
      mobileNumber: [, [Validators.required, Validators.pattern('^[7-9][0-9]{9}$')]],
      otp: [, [Validators.required, Validators.pattern('^[0-9]{4}$')]],
      referenceCode: [this.refCode],
      panCardNumber: ['', [Validators.required, Validators.pattern('^[A-Za-z]{5}[0-9]{4}[A-Za-z]{1}$')]],
    })
  }

  sendOTP() {
    const mobileNumber = +(this.controls.mobileNumber.value);
    // this.customerManagementService.sendOtp({ mobileNumber }).subscribe(res => {
    //   if (res.message == 'Mobile number is already exist.') {
    //     this.toastr.errorToastr('Mobile Number already exists');
    //   } else {
    //     this.otpSent = true;
    //     this.refCode = res.referenceCode;
    //     this.controls.referenceCode.patchValue(this.refCode);
    //     const msg = 'Otp has been sent to the registered mobile number';
    //     this.toastr.successToastr(msg);
    //   }
    // }, error => {
    //   this.toastr.errorToastr(error.error.message);
    // });
  }

  verifyOTP() {
    const params = {
      otp: this.controls.otp.value,
      referenceCode: this.controls.referenceCode.value,
    };
    // this.customerManagementService.verifyOtp(params).subscribe(res => {
    //   if (res) {
    //     this.isMobileVerified = true;
    //   }
    // });
  }

  verifyPAN() {
    const panCardNumber = this.controls.panCardNumber.value;
    // this.customerManagementService.verifyPAN({ panCardNumber }).subscribe(res => {
    //   if (res) {
    //     this.isPanVerified = true;
    //   }
    // });
    setTimeout(() => {
      this.isPanVerified = true;
    }, 1000);
  }

}
