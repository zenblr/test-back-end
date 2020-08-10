import { Component, OnInit, Inject } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { SharedService } from '../../../../../core/shared/services/shared.service';
import { AppraiserService } from '../../../../../core/user-management/appraiser';
import { map } from 'rxjs/operators';
import { NewRequestService } from '../../../../../core/lead-management/services/new-request.service';

@Component({
  selector: 'kt-new-request-assign-appraiser',
  templateUrl: './new-request-assign-appraiser.component.html',
  styleUrls: ['./new-request-assign-appraiser.component.scss']
})
export class NewRequestAssignAppraiserComponent implements OnInit {

  appraiserForm: FormGroup;
  title: string;
  internalBranchId: any;
  appraisers: any;

  constructor(
    private sharedService: SharedService,
    private appraiserService: AppraiserService,
    private newRequestService: NewRequestService,
    private fb: FormBuilder,
    private toastr: ToastrService,
    public dialogRef: MatDialogRef<NewRequestAssignAppraiserComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
  ) { }

  ngOnInit() {
    this.getUserDetails()
    this.initForm()
    this.setForm()
  }

  initForm() {
    this.appraiserForm = this.fb.group({
      id: [],
      customerName: [],
      customerUniqueId: [],
      module: [],
      appraiserId: ['', [Validators.required]]
    })
    this.appraiserForm.disable()
    this.appraiserForm.controls.appraiserId.enable()
    this.appraiserForm.controls.id.enable()
  }

  setForm() {
    console.log(this.data.requestData)
    this.appraiserForm.patchValue(this.data.requestData)
    if (this.data.action === 'edit') {
      this.appraiserForm.patchValue({
        customerUniqueId: this.data.requestData.customer.customerUniqueId,
        customerName: `${this.data.requestData.customer.firstName} ${this.data.requestData.customer.lastName}`,
        module: this.data.requestData.module.moduleName
      })
      this.title = 'Update Appraiser'
    } else {
      this.appraiserForm.patchValue({
        customerUniqueId: this.data.requestData.customer.customerUniqueId,
        customerName: `${this.data.requestData.customer.firstName} ${this.data.requestData.customer.lastName}`,
        module: this.data.requestData.module.moduleName
      })
      this.title = 'Assign Appraiser'
    }
  }

  getUserDetails() {
    this.sharedService.getUserDetailsFromStorage().pipe(map(res => {
      this.internalBranchId = res.userDetails.internalBranchId
      this.getAllAppraiser()
    })).subscribe()
  }

  getAllAppraiser() {
    this.appraiserService.getAllAppraiser(this.internalBranchId).subscribe(res => {
      this.appraisers = res.data;
    })
  }

  get controls() {
    return this.appraiserForm.controls
  }

  closeModal() {
    this.dialogRef.close()
  }

  action(event) {
    event ? this.submit() : this.closeModal()
  }

  submit() {
    console.log(this.appraiserForm.value)
    if (this.appraiserForm.invalid) return this.appraiserForm.markAllAsTouched()

    this.newRequestService.newRequestAssignAppraiser(this.appraiserForm.value).pipe(map(res => {
      if (res) {
        this.toastr.success(res)
        this.dialogRef.close(true)
      }
    })).subscribe()
  }

}
