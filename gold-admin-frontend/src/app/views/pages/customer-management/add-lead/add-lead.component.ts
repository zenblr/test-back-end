import { Component, OnInit, Inject, ViewChild } from '@angular/core';
import { FormGroup, Validators, FormBuilder } from '@angular/forms';
// material
import { DialogData } from '../../material/popups-and-modals/dialog/dialog.component';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
// services
import { SharedService } from '../../../../core/shared/services/shared.service';
import { CustomerManagementService } from '../../../../core/customer-management/services/customer-management.service';
// components
import { ToastrComponent } from '../../../../views/partials/components/toastr/toastr.component';

@Component({
  selector: 'kt-add-lead',
  templateUrl: './add-lead.component.html',
  styleUrls: ['./add-lead.component.scss']
})
export class AddLeadComponent implements OnInit {

  @ViewChild(ToastrComponent, { static: true }) toastr: ToastrComponent;
  leadForm: FormGroup;
  states: any;
  cities: any;
  status = [
    { id: 1, status: 'Confirm' },
    { id: 2, status: 'Not Interested' },
    { id: 3, status: 'Future Perspective' }
  ];
  otpButton = true;
  panButton = true;
  isPanVerified = false;
  isMobileVerified = false;
  otpSent = false;
  isOpverified = true;
  currentDate = new Date();

  constructor(
    public dialogRef: MatDialogRef<AddLeadComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
    private sharedService: SharedService,
    private fb: FormBuilder,
    private customerManagementService: CustomerManagementService
  ) {
  }

  ngOnInit() {
    this.formInitialize();
    this.getStates();
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

  formInitialize() {
    this.leadForm = this.fb.group({
      name: ['', [Validators.required]],
      mobileNumber: [, [Validators.required, Validators.pattern('^[7-9][0-9]{9}$')]],
      otp: [, [Validators.required, Validators.pattern('^[0-9]{4}$')]],
      panCardNumber: ['', [Validators.required, Validators.pattern('^[A-Za-z]{5}[0-9]{4}[A-Za-z]{1}$')]],
      stateId: ['', [Validators.required]],
      cityId: ['', [Validators.required]],
      dateTime: [this.currentDate, [Validators.required]],
      statusId: ['', [Validators.required]],
    });
  }

  getStates() {
    this.sharedService.getStates().subscribe(res => {
      this.states = res.message;
    });
  }

  getCities(event) {
    const stateId = this.controls.stateId.value;
    this.sharedService.getCities(stateId).subscribe(res => {
      this.cities = res.message;
    });
  }

  sendOTP() {
    const mobileNumber = +(this.controls.mobileNumber.value);
    this.customerManagementService.sendOtp({ mobileNumber }).subscribe(res => {
      if (res) {
        this.otpSent = true;
        const msg = 'Otp has been sent to the registered mobile number';
        this.toastr.successToastr(msg);
      }
    }, error => {
      this.toastr.errorToastr(error.error.message);
    });
  }

  verifyOTP() {
    const params = {
      mobileNumber: this.controls.mobileNumber.value,
      otp: this.controls.otp.value,
    };
    this.customerManagementService.verifyOtp(params).subscribe(res => {
      if (res) {
        this.isMobileVerified = true;
      }
    });
  }

  verifyPAN() {
    const mobileNumber = this.controls.panCardNumber.value;
    setTimeout(() => {
      this.isPanVerified = true;
    }, 1000);
  }

  get controls() {
    return this.leadForm.controls;
  }

  onSubmit() {
    console.log(this.leadForm.value);
    const leadData = this.leadForm.value;

    // this.customerManagementService.addLead(leadData).subscribe(res => {
    //   // console.log(res);
    //   if (res) {
    //     const msg = 'Lead Added Successfully';
    //     this.toastr.successToastr(msg);
    //     this.dialogRef.close(true);
    //   }
    // },
    //   error => {
    //     console.log(error.error.message);
    //     const msg = error.error.message;
    //     this.toastr.errorToastr(msg);
    //   });
  }
}
