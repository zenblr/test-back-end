import { Component, OnInit, Inject, ViewChild, ChangeDetectorRef } from '@angular/core';
import { Validators, FormBuilder, FormGroup } from '@angular/forms';
import { BranchService } from '../../../../../../core/user-management/branch/services/branch.service';
import { SharedService } from '../../../../../../core/shared/services/shared.service';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
import { ToastrComponent } from '../../../../../partials/components/toastr/toastr.component';
import { PartnerService } from '../../../../../../core/user-management/partner/services/partner.service';
import { AppraiserService } from '../../../../../../core/user-management/appraiser';
import { NgxMaterialTimepickerTheme } from 'ngx-material-timepicker';

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
  customers = [];
  editData = false;
  viewOnly = false;

  viewLoading: boolean = false;
  title: string;
  currentDate = new Date(new Date().getTime() - new Date().getTimezoneOffset() * 60000);
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
    this.getCustomer()
    this.getAllAppraiser();
    this.formInitialize();
    this.setForm()
  }

  setForm() {
    console.log(this.data)
    if (this.data.action == 'add') {
      this.title = 'Assign Appraiser'
      if (this.data.customer) {
        this.appraiserForm.patchValue({ customerName: this.data.customer.firstName + ' ' + this.data.customer.lastName })
        this.appraiserForm.controls.customerUniqueId.patchValue(this.data.customer.customerUniqueId)
        this.appraiserForm.controls.customerId.patchValue(this.data.id)
        this.minStartTime()
      }
    } else if (this.data.action == 'edit') {
      this.title = 'Edit Appraiser'

      this.appraiserForm.patchValue(this.data.appraiser)
      this.startTime = this.convertTime24To12(this.data.appraiser.startTime);
      this.endTime = this.convertTime24To12(this.data.appraiser.endTime);
      this.appraiserForm.patchValue({ startTime: this.startTime, endTime: this.endTime })

      if (this.data.customer) {
        this.appraiserForm.patchValue({ customerName: this.data.customer.firstName + ' ' + this.data.customer.lastName })
      }
    } else {
      this.title = 'View Appraiser'
      this.appraiserForm.patchValue(this.data.appraiser)
      this.appraiserForm.disable();
    }
  }

  formInitialize() {
    this.appraiserForm = this.fb.group({
      id: [null],
      customerUniqueId: [''],
      customerId: [, [Validators.required]],
      customerName: [''],
      appraiserId: ['', [Validators.required]],
      appoinmentDate: [],
      startTime: [],
      endTime: []
    });
  }

  getAllAppraiser() {
    this.appraiserService.getAllAppraiser().subscribe(res => {
      this.appraisers = res.data;
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
    console.log(event)
    if (event) {
      this.controls.customerName.patchValue(event.firstName + " " + event.lastName);
    } else {
      this.controls.customerName.patchValue('');
    }
  }

  onSubmit() {
    if (this.appraiserForm.invalid) {
      this.appraiserForm.markAllAsTouched()
      return
    }
    // console.log(this.appraiserForm.value);
    const appraiserData = this.appraiserForm.value;
    this.customers.filter(cust => {
      if (appraiserData.customerId == cust.id) {
        appraiserData.customerUniqueId = cust.customerUniqueId
      }
    })
    if (this.data.action == 'edit') {
      this.appraiserService.updateAppraiser(appraiserData.id, appraiserData).subscribe(res => {
        // console.log(res);
        if (res) {
          const msg = 'Appraiser Updated Sucessfully';
          this.toastr.successToastr(msg);
          this.dialogRef.close(true);
        }
      },
        error => {
          console.log(error.error.message);
          const msg = error.error.message;
          this.toastr.errorToastr(msg);
        });

    } else {
      this.appraiserService.assignAppraiser(appraiserData).subscribe(res => {
        // console.log(res);
        if (res) {
          const msg = 'Appraiser Assigned Successfully';
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

  setStartTime() {
    typeof (this.controls.startTime.value)
    this.startTime = this.controls.startTime.value
    console.log(this.startTime)
    this.ref.detectChanges
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
    this.addStartTime = this.currentDate.toLocaleTimeString("bestfit", {
      timeZone: "UTC",
      hour12: !0,
      hour: "numeric",
      minute: "numeric"
    });
  }



}
