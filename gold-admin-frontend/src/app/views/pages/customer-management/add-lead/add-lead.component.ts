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
  currentDate = new Date();

  constructor(
    public dialogRef: MatDialogRef<AddLeadComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
    private sharedService: SharedService,
    private fb: FormBuilder,
    private customerManagementService: CustomerManagementService
  ) { }

  ngOnInit() {
    this.formInitialize();
    this.controls.mobile.valueChanges.subscribe(res => {
      if (this.controls.mobile.valid) {
        this.otpButton = false;
      } else {
        this.otpButton = true;
      }
    });

    this.controls.pan.valueChanges.subscribe(res => {
      if (this.controls.pan.valid) {
        this.panButton = false;
      } else {
        this.panButton = true;
      }
    });
  }

  formInitialize() {
    this.leadForm = this.fb.group({
      name: ['', [Validators.required]],
      mobile: [, [Validators.required, Validators.pattern('^[7-9][0-9]{9}$')]],
      pan: ['', [Validators.required, Validators.pattern('^[A-Za-z]{5}[0-9]{4}[A-Za-z]{1}$')]],
      stateId: ['', [Validators.required]],
      cityId: ['', [Validators.required]],
      dateTime: [this.currentDate, [Validators.required]],
      status: ['', [Validators.required]],
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
    const mobile = this.controls.mobile.value;
    console.log(mobile);
  }

  verifyPAN() {
    const mobile = this.controls.mobile.value;
    console.log(mobile);
  }

  get controls() {
    return this.leadForm.controls;
  }

  onSubmit() {
    // console.log(this.branchForm.value);
    const partnerData = this.leadForm.value;

    this.customerManagementService.addLead(partnerData).subscribe(res => {
      // console.log(res);
      if (res) {
        const msg = 'Partner Added Successfully';
        this.toastr.successToastr(msg);
        this.dialogRef.close(true);
      }
    },
      error => {
        console.log(error.error.message);
        const msg = error.error.message;
        this.toastr.errorToastr(msg);
      });
  }
}
