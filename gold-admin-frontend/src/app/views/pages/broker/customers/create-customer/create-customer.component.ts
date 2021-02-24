import { ChangeDetectorRef, Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { ToastrService } from 'ngx-toastr';
import { map } from 'rxjs/operators';
import { LeadService } from '../../../../../core/lead-management/services/lead.service';
import { SharedService } from '../../../../../core/shared/services/shared.service';

@Component({
  selector: 'kt-create-customer',
  templateUrl: './create-customer.component.html',
  styleUrls: ['./create-customer.component.scss']
})
export class CreateCustomerComponent implements OnInit {

  createCustomerForm: FormGroup
  otpSent: boolean = false;
  isMobileVerified: boolean = false;
  isOtpverified: boolean = true;
  refCode: any;
  cities: any;
  states: any;
  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<CreateCustomerComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private leadService: LeadService,
    private toastr: ToastrService,
    private sharedService: SharedService,
    private ref: ChangeDetectorRef) { dialogRef.disableClose = true }

  ngOnInit() {

    this.initForm()
    this.getStates()
    this.controls.otp.valueChanges.subscribe(res => {
      if (this.controls.otp.valid) {
        this.isOtpverified = false;
      } else {
        this.isOtpverified = true;
      }
    });
  }

  initForm() {
    this.createCustomerForm = this.fb.group({
      firstName: [, Validators.required],
      lastName: [, Validators.required],
      mobileNumber: [this.data.mobileNumber],
      otp: [, Validators.required],
      referenceCode: [],
      stateId: ['', Validators.required],
      cityId: ['', Validators.required]
    })
  }

  get controls() {
    return this.createCustomerForm.controls
  }

  action(event) {
    if (event) {
      this.submit()
    } else {
      this.dialogRef.close()
    }
  }

  submit() {
    if(!this.isMobileVerified){
      this.checkforVerfication()
      // this.toastr.error("")
      return
    }
    
    if (this.createCustomerForm.invalid) {
      this.createCustomerForm.markAllAsTouched()
      return
    }

   
    this.sharedService.createEmiCustomer(this.createCustomerForm.getRawValue()).pipe(
      map(res =>
        this.dialogRef.close(res.data)
      )).subscribe()
  }

  sendOTP() {
    const mobileNumber = this.controls.mobileNumber.value;
    const firstName = this.controls.firstName.value;
    const lastName = this.controls.lastName.value;

    if (this.controls.firstName.invalid || this.controls.lastName.invalid) {
      this.controls.firstName.markAsTouched()
      this.controls.lastName.markAsTouched()
      return
    }

    this.leadService.sendOtp({ mobileNumber, firstName, lastName, type: 'lead' }).subscribe(res => {
      if (res.message == 'Mobile number is already exist.') {
        this.toastr.error('Mobile Number already exists');
        // this.mobileAlreadyExists = true;
      } else {
        this.otpSent = true;
        this.refCode = res.referenceCode;
        this.controls.referenceCode.patchValue(this.refCode);
        const msg = 'Otp has been sent to the registered mobile number';
        this.toastr.success(msg);
      }
    }, error => {
      this.toastr.error(error.error.message);
    });
  }

  verifyOTP() {
    const params = {
      otp: this.controls.otp.value,
      referenceCode: this.controls.referenceCode.value,
      type: 'lead'
    };
    this.leadService.verifyOtp(params).subscribe(res => {
      if (res) {
        this.isMobileVerified = true;
        this.checkforVerfication()

      }
    });
  }

  checkforVerfication() {
    if (this.isMobileVerified) {
      this.controls.otp.setErrors(null)
    } else if (!this.isMobileVerified) {
      this.controls.otp.setErrors({ verifyOTP: true })
      return this.toastr.error('Mobile number not verified!')
    }
  }

  getStates() {
    this.sharedService.getStates().subscribe(res => {
      this.states = res.data;
      this.ref.detectChanges()
    });
  }

  async getCities() {
    const stateId = this.controls.stateId.value;
    let res = await this.sharedService.getCities(stateId)
    this.cities = res['data'];
    this.ref.detectChanges()
    const cityExists = this.cities.find(e => e.id === this.controls.cityId.value)
    if (!cityExists) {
      this.controls.cityId.reset();
      this.controls.cityId.patchValue('');
    }

  }

  resendOTP() {
    const firstName = this.controls.firstName.value;
    const lastName = this.controls.lastName.value;
    const mobileNumber = this.controls.mobileNumber.value;
    // use send function OTP for resend OTP
    this.leadService.sendOtp({ mobileNumber, firstName, lastName, type: 'lead' }).subscribe(res => {
      if (res) {
        this.otpSent = true;
        this.refCode = res.referenceCode;
        this.controls.referenceCode.patchValue(this.refCode);
        const msg = 'Otp has been sent to the registered mobile number';
        this.toastr.success(msg);
      }
    }, error => {
      this.toastr.error(error.error.message);
    });
  }
}
