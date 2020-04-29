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
import { map } from 'rxjs/operators';

@Component({
  selector: 'kt-add-lead',
  templateUrl: './add-lead.component.html',
  styleUrls: ['./add-lead.component.scss']
})
export class AddLeadComponent implements OnInit {

  modalTitle = 'Add New Lead';
  @ViewChild(ToastrComponent, { static: true }) toastr: ToastrComponent;
  leadForm: FormGroup;
  states: any;
  cities: any;
  status = [];
  otpButton = true;
  panButton = true;
  isPanVerified = false;
  isMobileVerified = false;
  otpSent = false;
  isOpverified = true;
  currentDate = new Date();

  viewOnly = false;

  refCode: number; //reference code
  mobileAlreadyExists = false;
  title: string;
  branches = []

  constructor(
    public dialogRef: MatDialogRef<AddLeadComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private sharedService: SharedService,
    private fb: FormBuilder,
    private customerManagementService: CustomerManagementService
  ) {
  }

  ngOnInit() {
    this.formInitialize();
    this.setForm();
    this.getInternalBranhces();
    this.getStates();
    this.getStatus();

    this.controls.mobileNumber.valueChanges.subscribe(res => {
      if (this.controls.mobileNumber.valid) {
        this.otpButton = false;
      } else {
        this.otpButton = true;
        this.isMobileVerified = false;
        this.otpSent = false;
      }
      this.mobileAlreadyExists = false;
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
      firstName: ['', [Validators.required]],
      lastName: ['', [Validators.required]],
      internalBranchId: [1],
      mobileNumber: ['', [Validators.required, Validators.pattern('^[7-9][0-9]{9}$')]],
      otp: [, [Validators.required, Validators.pattern('^[0-9]{4}$')]],
      referenceCode: [this.refCode],
      panCardNumber: ['', [Validators.pattern('^[A-Za-z]{5}[0-9]{4}[A-Za-z]{1}$')]],
      stateId: ['', [Validators.required]],
      cityId: ['', [Validators.required]],
      pinCode: ['', [Validators.required]],
      dateTime: [this.currentDate, [Validators.required]],
      statusId: ['', [Validators.required]],
      address: this.fb.array([])
    });
  }

  setForm() {
    if (this.data.action !== 'add') {
      this.getLeadById(this.data['id']);
      this.modalTitle = 'Edit Lead'
      this.viewOnly = true;
    } else {
      this.modalTitle = 'Add New Lead'
    }
  }

  getInternalBranhces() {
    this.customerManagementService.getInternalBranhces().subscribe(res => {
      this.branches = res;
    });
  }

  getStates() {
    this.sharedService.getStates().subscribe(res => {
      this.states = res.message;
    });
  }

  getCities() {
    const stateId = this.controls.stateId.value;
    this.sharedService.getCities(stateId).subscribe(res => {
      this.cities = res.message;
    });
  }

  getStatus() {
    this.customerManagementService.getStatus().pipe(
      map(res => {
        this.status = res;
      })
    ).subscribe();
  }

  getLeadById(id) {
    this.customerManagementService.getLeadById(id).subscribe(res => {
      // console.log(res);
      this.leadForm.patchValue(res.singleCustomer);
      this.getCities();
    },
      error => {
        this.toastr.errorToastr(error.error.message);
      });
  }

  sendOTP() {
    const mobileNumber = this.controls.mobileNumber.value;
    this.customerManagementService.sendOtp({ mobileNumber }).subscribe(res => {
      if (res.message == 'Mobile number is already exist.') {
        this.toastr.errorToastr('Mobile Number already exists');
        this.mobileAlreadyExists = true;
      } else {
        this.otpSent = true;
        this.refCode = res.referenceCode;
        this.controls.referenceCode.patchValue(this.refCode);
        const msg = 'Otp has been sent to the registered mobile number';
        this.toastr.successToastr(msg);
      }
    }, error => {
      this.toastr.errorToastr(error.error.message);
    });
  }

  verifyOTP() {
    const params = {
      otp: this.controls.otp.value,
      referenceCode: this.controls.referenceCode.value,
    };
    this.customerManagementService.verifyOtp(params).subscribe(res => {
      if (res) {
        this.isMobileVerified = true;
      }
    });
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

  resendOTP() {
    const mobileNumber = this.controls.mobileNumber.value;
    // use send function OTP for resend OTP
    this.customerManagementService.sendOtp({ mobileNumber }).subscribe(res => {
      if (res) {
        this.otpSent = true;
        this.refCode = res.referenceCode;
        this.controls.referenceCode.patchValue(this.refCode);
        const msg = 'Otp has been sent to the registered mobile number';
        this.toastr.successToastr(msg);
      }
    }, error => {
      this.toastr.errorToastr(error.error.message);
    });
  }

  get controls() {
    return this.leadForm.controls;
  }

  onSubmit() {
    if (this.data.action == 'add') {
      if (this.leadForm.invalid || !this.isMobileVerified || this.mobileAlreadyExists) {
        this.leadForm.markAllAsTouched()
        console.log(this.leadForm.value)

        return
      }


      if (this.controls.panCardNumber.value == '') {
        this.leadForm.get('panCardNumber').patchValue(null);
      }
      const leadData = this.leadForm.value;

      this.customerManagementService.addLead(leadData).subscribe(res => {
        // console.log(res);
        if (res) {
          const msg = 'Lead Added Successfully';
          this.toastr.successToastr(msg);
          this.dialogRef.close(true);
        }
      },
        error => {
          console.log(error.error.message);
          const msg = error.error.message;
          this.toastr.errorToastr(msg);
        });
    } else if (this.data.action == 'edit') {
      const leadData = this.leadForm.value;
      console.log('edit')
      this.customerManagementService.editLead(this.data.id, leadData).subscribe(res => {
        // console.log(res);
        if (res) {
          const msg = 'Lead Edited Successfully';
          this.toastr.successToastr(msg);
          this.dialogRef.close(true);
        }
      });
    }

  }

  closeModal() {
    this.dialogRef.close();
  }

  action(event) {
    if (event) {
      this.onSubmit();
    } else if (!event) {
      this.closeModal();
    }
  }
}
