import { Component, OnInit, Inject, ViewChild, ChangeDetectorRef } from '@angular/core';
import { Validators, FormBuilder, FormGroup } from '@angular/forms';
import { BranchService } from '../../../../../../core/user-management/branch/services/branch.service';
import { SharedService } from '../../../../../../core/shared/services/shared.service';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
import { ToastrComponent } from '../../../../../partials/components/toastr/toastr.component';
import { PartnerService } from '../../../../../../core/user-management/partner/services/partner.service';
import { AppraiserService } from '../../../../../../core/user-management/appraiser';
import { NgxMaterialTimepickerTheme } from 'ngx-material-timepicker';
import { map, finalize } from 'rxjs/operators';

@Component({
  selector: 'kt-assign-appraiser',
  templateUrl: './assign-appraiser.component.html',
  styleUrls: ['./assign-appraiser.component.scss']
})
export class AssignAppraiserComponent implements OnInit {
  @ViewChild(ToastrComponent, { static: true }) toastr: ToastrComponent;
  appraiserForm: FormGroup;
  states: any;
  cities: any;
  appraisers = [];
  releasers = [];
  customers = [];
  editData = false;
  viewOnly = false;

  viewLoading: boolean = false;
  title: string;
  currentDate = new Date();
  darkTheme: NgxMaterialTimepickerTheme = {
    container: {
      bodyBackgroundColor: '#fff',
      buttonColor: '#454d67'
    },
    dial: {
      dialBackgroundColor: '#5d78ff',
    },
    clockFace: {
      clockFaceBackgroundColor: '#e7e9ec',
      clockHandColor: '#5d78ff',
      clockFaceTimeInactiveColor: '#454d67'
    }
  };
  startTime: string;
  endTime: string;
  addStartTime: string;
  internalBranchId: any;

  constructor(
    public dialogRef: MatDialogRef<AssignAppraiserComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private sharedService: SharedService,
    private fb: FormBuilder,
    private branchService: BranchService,
    private appraiserService: AppraiserService,
    private ref: ChangeDetectorRef
  ) { }

  ngOnInit() {
    // this.getCustomer()
    this.getUserDetails()
    // this.getAllAppraiser();
    this.formInitialize();
    this.setForm()
  }

  setForm() {

    if (this.data.action == 'add') {
      this.title = this.data.isReleaser ? 'Assign Releaser' : 'Assign Appraiser';
      if (this.data.customer) {
        this.appraiserForm.patchValue({ customerName: this.data.customer.firstName + ' ' + this.data.customer.lastName })
        this.appraiserForm.controls.customerUniqueId.patchValue(this.data.customer.customerUniqueId)
        this.appraiserForm.controls.customerId.patchValue(this.data.id)
        if (this.data.requestData) {
          this.appraiserForm.controls.id.patchValue(this.data.requestData.id)
        }
      }
      // if (this.data.partReleaseId) this.appraiserForm.controls.partReleaseId.patchValue(this.data.partReleaseId)

      // if (this.data.fullReleaseId) this.appraiserForm.controls.fullReleaseId.patchValue(this.data.fullReleaseId)

    }
    else if (this.data.action == 'edit') {
      this.title = this.data.isReleaser ? 'Update Releaser' : 'Update Appraiser'

      this.appraiserForm.patchValue(this.data.appraiser)
      this.startTime = this.convertTime24To12(this.data.appraiser.startTime);
      this.endTime = this.convertTime24To12(this.data.appraiser.endTime);
      this.appraiserForm.patchValue({ startTime: this.startTime, endTime: this.endTime })
      if (this.data.requestData) {
        this.appraiserForm.controls.id.patchValue(this.data.requestData.id)
      }


      if (this.data.customer) {
        this.appraiserForm.patchValue({ customerName: this.data.customer.firstName + ' ' + this.data.customer.lastName })
        if (this.data.customer.customerUniqueId) this.controls.customerUniqueId.patchValue(this.data.customer.customerUniqueId)
      }

      // if (this.data.partReleaseId)
      //   this.appraiserForm.controls.partReleaseId.patchValue(this.data.partReleaseId)

    } else {
      this.title = 'View Appraiser'
      this.appraiserForm.patchValue(this.data.appraiser)
      this.appraiserForm.disable();
    }

    if (this.data.partReleaseId) {
      this.appraiserForm.controls.partReleaseId.patchValue(this.data.partReleaseId)
    }

    if (this.data.fullReleaseId) {
      this.appraiserForm.controls.fullReleaseId.patchValue(this.data.fullReleaseId)
    }
  }

  formInitialize() {
    this.appraiserForm = this.fb.group({
      id: [null],
      customerUniqueId: [''],
      customerId: [],
      customerName: [''],
      userType: [, [Validators.required]],
      appraiserId: [, [Validators.required]],
      releaserId: [, [Validators.required]],
      appoinmentDate: [],
      startTime: [this.addStartTime],
      endTime: [],
      partReleaseId: [],
      fullReleaseId: []
    });

    if (!this.data.isReleaser) {
      this.appraiserForm.controls.releaserId.disable()
      this.appraiserForm.controls.userType.disable()
    }
  }

  getUserDetails() {
    this.sharedService.getUserDetailsFromStorage().pipe(map(res => {

      this.internalBranchId = res.userDetails.internalBranchId
      if (this.data.isReleaser) {
        this.getAllReleaser()
        this.getAllAppraiser()
      } else {
        this.getAllAppraiser()
      }
    })).subscribe()
  }

  getAllAppraiser() {
    this.appraiserService.getAllAppraiser(this.internalBranchId).subscribe(res => {
      this.appraisers = res.data;
    })
  }

  getAllReleaser() {
    this.appraiserService.getAllReleaser(this.internalBranchId).subscribe(res => {
      this.releasers = res.data;
    })
  }

  getCustomer() {
    this.appraiserService.getCustomer().subscribe(res => {
      this.customers = res.data;
    })
  }


  // getter for controls

  get controls() {
    return this.appraiserForm.controls;
  }

  action(event: Event) {
    if (event) {
      this.onSubmit()
    } else if (!event) {
      this.dialogRef.close()
    }
  }

  bindCustomerName(event) {

    if (event) {
      this.controls.customerName.patchValue(event.firstName + " " + event.lastName);
    } else {
      this.controls.customerName.patchValue('');
    }
  }

  onSubmit() {
    if (this.appraiserForm.invalid) {
      this.appraiserForm.markAllAsTouched()
      for (const key in this.appraiserForm.controls) {
        const element = this.appraiserForm.controls[key];

        if (element.invalid) console.log({ key, element })
      }
      return
    }

    const appoinmentDate = new Date(this.controls.appoinmentDate.value)
    const correctedDate = new Date(appoinmentDate.getTime() - appoinmentDate.getTimezoneOffset() * 60000)
    this.appraiserForm.patchValue({ appoinmentDate: correctedDate })
    const appraiserData = this.appraiserForm.value;
    this.customers.filter(cust => {
      if (appraiserData.customerId == cust.id) {
        appraiserData.customerUniqueId = cust.customerUniqueId
      }
    })
    if (this.data.action == 'edit') {
      if (this.data.partReleaseId) {
        this.appraiserService.updateAppraiserPartRelease(appraiserData).subscribe(res => {
          if (res) {
            const msg = 'Appraiser Updated Sucessfully';
            this.toastr.successToastr(msg);
            this.dialogRef.close(true);
          }
        });
      }
      else if (this.data.fullReleaseId) {
        if (this.controls.userType.value == 'appraiser') {
          this.changeAppraiserToReleaser()
        }
        this.appraiserService.updateReleaserFullRelease(this.appraiserForm.value).pipe(
          map(res => {
            if (res) {
              const msg = 'Releaser Updated Sucessfully';
              this.toastr.successToastr(msg);
              this.dialogRef.close(true);
            }
          }),
          finalize(() => this.changeReleaserToAppraiser()))
          .subscribe();
      }
      else {
        this.appraiserService.updateAppraiser(appraiserData).subscribe(res => {
          if (res) {
            const msg = 'Appraiser Updated Sucessfully';
            this.toastr.successToastr(msg);
            this.dialogRef.close(true);
          }
        });
      }

    } else {
      if (this.data.partReleaseId) {
        this.appraiserService.assignAppraiserPartRelease(appraiserData).subscribe(res => {
          if (res) {
            const msg = 'Appraiser Assigned Successfully';
            this.toastr.successToastr(msg);
            this.dialogRef.close(true);
          }
        });
      }
      else if (this.data.fullReleaseId) {
        if (this.controls.userType.value == 'appraiser') {
          this.changeAppraiserToReleaser()
        }
        this.appraiserService.assignReleaserFullRelease(this.appraiserForm.value).pipe(
          map(res => {
            if (res) {
              const msg = 'Releaser Assigned Successfully';
              this.toastr.successToastr(msg);
              this.dialogRef.close(true);
            }
          }),
          finalize(() => this.changeReleaserToAppraiser()))
          .subscribe();
      }
      else {
        this.appraiserService.assignAppraiser(appraiserData).subscribe(res => {
          if (res) {
            const msg = 'Appraiser Assigned Successfully';
            this.toastr.successToastr(msg);
            this.dialogRef.close(true);
          }
        });
      }
    }

  }

  setStartTime(event) {
    this.startTime = event;
    this.ref.detectChanges()
  }

  convertTime24To12(timeString) {
    return (new Date("1955-11-05T" + timeString + "Z")).toLocaleTimeString("bestfit", {
      timeZone: "UTC",
      hour12: !0,
      hour: "numeric",
      minute: "numeric"
    });
  };

  minStartTime() {
    let currentDate = new Date(new Date().getTime() - new Date().getTimezoneOffset() * 60000);
    this.addStartTime = currentDate.toLocaleTimeString("bestfit", {
      timeZone: "UTC",
      hour12: !0,
      hour: "numeric",
      minute: "numeric"
    });
  }

  setMinimumStartTime(event) {
    const selectedDate = event.value;
    const currentDate = new Date();
    let timeDifference = selectedDate.getTime() - currentDate.getTime();
    var daysDifference = Math.ceil(timeDifference / (1000 * 3600 * 24));
    if (daysDifference > 0) {
      this.addStartTime = null
      this.controls.startTime.reset()
      this.controls.endTime.reset()
    } else {
      this.minStartTime()

    }

  }

  selectUsertype(value) {
    if (value === 'appraiser') {
      this.controls.appraiserId.enable()
      this.controls.releaserId.disable()
      this.controls.appraiserId.setValidators([Validators.required])
      this.controls.releaserId.setValidators([])
      this.controls.appraiserId.updateValueAndValidity()
      this.controls.appraiserId.reset()
    } else {
      this.controls.releaserId.enable()
      this.controls.appraiserId.disable()
      this.controls.releaserId.setValidators([Validators.required])
      this.controls.appraiserId.setValidators([])
      this.controls.releaserId.updateValueAndValidity()
      this.controls.releaserId.reset()
    }
  }

  changeAppraiserToReleaser() {
    this.controls.releaserId.enable()
    this.controls.releaserId.patchValue(this.controls.appraiserId.value)
    this.controls.appraiserId.disable()
  }

  changeReleaserToAppraiser() {
    this.controls.appraiserId.patchValue(this.controls.releaserId.value)
    this.controls.releaserId.reset()
    this.controls.appraiserId.enable()
    this.controls.releaserId.disable()
  }


}
