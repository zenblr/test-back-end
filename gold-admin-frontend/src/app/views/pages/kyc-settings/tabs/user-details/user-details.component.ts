import { Component, OnInit, ViewChild, EventEmitter, Output, ChangeDetectorRef } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ToastrComponent } from '../../../../../views/partials/components';
import { UserDetailsService } from '../../../../../core/kyc-settings';
import { map, finalize, catchError } from 'rxjs/operators';
import { ToastrService } from 'ngx-toastr';
import { Router, ActivatedRoute } from '@angular/router';

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

  // @ViewChild(ToastrComponent, { static: true }) toastr: ToastrComponent;
  @Output() next: EventEmitter<any> = new EventEmitter<any>();
  showVerifyPAN = false;


  constructor(public fb: FormBuilder, private userDetailsService: UserDetailsService,
    private toastr: ToastrService, private ref: ChangeDetectorRef,
    private route: ActivatedRoute) { }

  ngOnInit() {
    this.initForm();
    this.route.queryParamMap.subscribe(params => {
      // if (params) {
      const MOB = params.get("mob");
      if (MOB) {
        this.controls.mobileNumber.patchValue(MOB);
        this.sendOTP();
      }

      // this.ref.detectChanges();
      // }
    })
    this.controls.mobileNumber.valueChanges.subscribe(res => {
      if (this.controls.mobileNumber.valid) {
        this.sendOTP();
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
      otp: [, [, Validators.pattern('^[0-9]{4}$')]],
      referenceCode: [],
      panCardNumber: ['', [Validators.required, Validators.pattern('^[A-Za-z]{5}[0-9]{4}[A-Za-z]{1}$')]],
    })
  }

  sendOTP() {
    const mobileNumber = this.controls.mobileNumber.value;
    this.userDetailsService.sendOtp({ mobileNumber }).subscribe(res => {
      if (res.message == 'Mobile number is already exist.') {
        this.toastr.error('Mobile Number already exists');
      } else {
        this.otpSent = true;
        this.refCode = res.referenceCode;
        this.controls.referenceCode.patchValue(this.refCode);
        this.userBasicForm.patchValue(res.customerInfo);
        if (res.customerInfo.panCardNumber !== null) {
          this.controls.panCardNumber.disable();
        } else {
          this.showVerifyPAN = true;
        }
        // const msg = 'Otp has been sent to the registered mobile number';
        // this.toastr.success(msg);
      }
    }, err => {
      // console.log(err.message);
    });
  }

  verifyOTP() {
    const params = {
      otp: this.controls.otp.value,
      referenceCode: this.controls.referenceCode.value,
    };
    this.userDetailsService.verifyOtp(params).subscribe(res => {
      if (res) {
        this.isMobileVerified = true;
      }
    });
  }

  resendOTP() {
    const mobileNumber = this.controls.mobileNumber.value;
    // use send function OTP for resend OTP
    this.userDetailsService.sendOtp({ mobileNumber }).subscribe(res => {
      if (res) {
        this.otpSent = true;
        this.refCode = res.referenceCode;
        this.controls.referenceCode.patchValue(this.refCode);
        const msg = 'Otp has been sent to the registered mobile number';
        this.toastr.success(msg);
      }
    });
  }

  verifyPAN() {
    // const panCardNumber = this.controls.panCardNumber.value;
    // this.userDetailsService.verifyPAN({ panCardNumber }).subscribe(res => {
    //   if (res) {
    //     this.isPanVerified = true;
    //   }
    // });

    this.isPanVerified = true;
  }

  submit() {
    if (this.userBasicForm.invalid) {
      this.userBasicForm.markAllAsTouched()
      return
    }
    this.userBasicForm.enable()
    const PAN = this.controls.panCardNumber.value.toUpperCase();
    this.userBasicForm.get('panCardNumber').patchValue(PAN)
    const basicForm = this.userBasicForm.value;
    this.userDetailsService.basicDetails(basicForm).pipe(
      map(res => {
        console.log(res);
        if (res) {
          // this.next.emit(true);
          this.next.emit(res.customerKycCurrentStage);
        }
      }),
      catchError(err => {
        console.log(err.error.message);
        if (err.error.message == 'This customer Kyc information is already created.' && err.status == 404) {
          //   const kycStage = 2;
          // this.next.emit(true);
        }
        throw (err);
      }),
      finalize(() => {
        this.userBasicForm.disable();
        this.userBasicForm.controls.mobileNumber.enable()
        this.userBasicForm.controls.panCardNumber.enable()
      })
    ).subscribe();



    // this.next.emit(true);  // delete this line    
  }

}
