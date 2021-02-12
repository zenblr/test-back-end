import { Component, OnInit, Inject, AfterViewInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { RolesService } from '../../../../../core/user-management/roles';
import { catchError, map } from 'rxjs/operators';
import { NewRequestService } from '../../../../../core/lead-management/services/new-request.service';
import { Router } from '@angular/router';
import { LeadService } from '../../../../../core/lead-management/services/lead.service';
import { SharedService } from '../../../../../core/shared/services/shared.service';

@Component({
  selector: 'kt-new-request-add',
  templateUrl: './new-request-add.component.html',
  styleUrls: ['./new-request-add.component.scss']
})
export class NewRequestAddComponent implements OnInit, AfterViewInit {

  requestForm: FormGroup;
  modules = [];
  title: string;
  branches = [];
  userDetails: any;

  constructor(
    private fb: FormBuilder,
    private toastr: ToastrService,
    private roleService: RolesService,
    public dialogRef: MatDialogRef<NewRequestAddComponent>,
    private newRequestService: NewRequestService,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private router: Router,
    private leadService: LeadService,
    private sharedService: SharedService
  ) { }

  ngOnInit() {
    this.getModules() // /api/modules
    this.getInternalBranhces();
    this.initForm()
    this.setForm();
    this.getUserDetailsFromStorage()
  }

  ngAfterViewInit() {
    if (this.userDetails.internalBranchId != 1) {
      this.controls.internalBranchId.disable()
    }
  }

  getUserDetailsFromStorage() {
    this.sharedService.getUserDetailsFromStorage().subscribe(res => {
      this.userDetails = res.userDetails;
    })
  }

  getModules() {
    const data = { isFor: 'request' }
    this.roleService.getAllModuleAppraiser(data).pipe(map(res => {
      this.modules = res;
      this.checkForInvalidProduct()
    })).subscribe()
  }

  initForm() {
    this.requestForm = this.fb.group({
      id: [],
      customerId: [],
      customerName: [],
      customerUniqueId: [],
      mobileNumber: [],
      moduleId: [, [Validators.required]],
      internalBranchId: [, [Validators.required]],
    })
    this.requestForm.controls.customerName.disable()
    this.requestForm.controls.customerUniqueId.disable()
    this.requestForm.controls.mobileNumber.disable()
  }

  setForm() {

    this.requestForm.patchValue(this.data.leadData)
    console.log(this.requestForm.value)
    if (this.data.action === 'edit') {
      this.requestForm.patchValue({
        customerId: this.data.leadData.customer.id,
        customerUniqueId: this.data.leadData.customer.customerUniqueId,
        mobileNumber: this.data.leadData.customer.mobileNumber,
        customerName: `${this.data.leadData.customer.firstName} ${this.data.leadData.customer.lastName}`,
      })
      this.title = 'Update Request'
    } else {
      this.requestForm.patchValue({
        customerId: this.data.leadData.id,
        customerName: `${this.data.leadData.firstName} ${this.data.leadData.lastName}`,
      })
      this.title = 'Create Request'
    }
  }

  get controls() {
    return this.requestForm.controls
  }

  closeModal() {
    this.dialogRef.close()
  }

  action(event) {
    if (event) {
      this.submit()
    } else if (!event) {
      this.closeModal()
    }
  }

  submit() {

    if (this.requestForm.invalid) return this.requestForm.markAllAsTouched()

    if (this.data.action == 'add') {
      this.newRequestService.newRequestAdd(this.requestForm.getRawValue()).pipe(
        map(res => {
          if (res) {
            this.toastr.success(res.message)
            this.dialogRef.close(true)
          }
        }),
        catchError(err => {
          const message = err.error.message
          if (message === 'Kindly complete your pending scrap KYC' || message === 'Kindly complete your pending loan KYC') {
            this.dialogRef.close(false)
            this.router.navigate(['/admin/lead-management/new-requests'])
          }
          throw err
        })
      ).subscribe()
    } else {
      this.newRequestService.newRequestUpdate(this.requestForm.getRawValue()).pipe(map(res => {
        if (res) {
          this.toastr.success(res.message)
          this.dialogRef.close(true)
        }
      })).subscribe()
    }
  }

  getInternalBranhces() {
    this.leadService.getInternalBranhces().subscribe(res => {
      this.branches = res.data;
    });
  }

  checkForInvalidProduct() {
    const doesModuleExists = this.modules.find(e => e.id == this.controls.moduleId.value)
    if (!doesModuleExists) {
      this.controls.moduleId.reset();
    }
  }

}
