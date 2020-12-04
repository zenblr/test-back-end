import { Component, OnInit, Inject } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { RolesService } from '../../../../../core/user-management/roles';
import { catchError, map } from 'rxjs/operators';
import { NewRequestService } from '../../../../../core/lead-management/services/new-request.service';
import { Router } from '@angular/router';

@Component({
  selector: 'kt-new-request-add',
  templateUrl: './new-request-add.component.html',
  styleUrls: ['./new-request-add.component.scss']
})
export class NewRequestAddComponent implements OnInit {

  requestForm: FormGroup;
  modules: [any];
  title: string;

  constructor(
    private fb: FormBuilder,
    private toastr: ToastrService,
    private roleService: RolesService,
    public dialogRef: MatDialogRef<NewRequestAddComponent>,
    private newRequestService: NewRequestService,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private router: Router
  ) { }

  ngOnInit() {
    this.getModules() // /api/modules
    this.initForm()
    this.setForm();
  }

  getModules() {
    this.roleService.getAllModuleAppraiser().pipe(map(res => {
      this.modules = res;
    })).subscribe()
  }

  initForm() {
    this.requestForm = this.fb.group({
      id: [],
      customerId: [],
      customerName: [],
      customerUniqueId: [],
      mobileNumber: [],
      moduleId: [, [Validators.required]]
    })
    this.requestForm.controls.customerName.disable()
    this.requestForm.controls.customerUniqueId.disable()
    this.requestForm.controls.mobileNumber.disable()
  }

  setForm() {

    this.requestForm.patchValue(this.data.leadData)
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
      this.newRequestService.newRequestAdd(this.requestForm.value).pipe(
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
      this.newRequestService.newRequestUpdate(this.requestForm.value).pipe(map(res => {
        if (res) {
          this.toastr.success(res.message)
          this.dialogRef.close(true)
        }
      })).subscribe()
    }
  }

}
