import { Component, OnInit, Inject, ChangeDetectorRef } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { ToastrService } from 'ngx-toastr';
import { PartnerBranchUserService } from "../../../../../../core/user-management/partner-branch-user/services/partner-branch-user.service";
import { PartnerService } from "../../../../../../core/user-management/partner/services/partner.service";
import { map, catchError } from 'rxjs/operators';
import { SharedService } from '../../../../../../core/shared/services/shared.service';

@Component({
  selector: 'kt-add-partner-branch-user',
  templateUrl: './add-partner-branch-user.component.html',
  styleUrls: ['./add-partner-branch-user.component.scss']
})
export class AddPartnerBranchUserComponent implements OnInit {

  title: string = ''
  addUserForm: FormGroup
  branch: unknown;
  partner: unknown;
  states: any;
  cities: any;
  constructor(
    public dialogRef: MatDialogRef<AddPartnerBranchUserComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private fb: FormBuilder,
    private toast: ToastrService,
    private userService: PartnerBranchUserService,
    private partnerservice: PartnerService,
    private ref: ChangeDetectorRef,
    private sharedService: SharedService
  ) { }

  ngOnInit() {
    this.getStates()
    this.getPartner()
    this.initForm()
    this.setTitle()
  }
  getPartner() {
    this.partnerservice.getAllPartner('', 1, 50).subscribe(res => {
      this.partner = res.data
    })
  }
  getBranch() {
    const partnerId = this.controls.partnerId.value;
    this.userService.getAllBranch(partnerId).subscribe(res => {
      this.branch = res.data
    })
  }

  getStates() {
    this.sharedService.getStates().subscribe(res => {
      this.states = res.data;
    })
  }
  async getCities() {
    const stateId =  this.controls.stateId.value;
    let res = await this.sharedService.getCities(stateId)
    this.cities = res['data'];
  }

  setTitle() {
    if (this.data.action == 'add') {
      this.title = 'Add User'
    } else if (this.data.action == 'edit') {
      this.title = 'Edit  User'
      this.addUserForm.patchValue(this.data.user)
      this.getBranch();
      this.getCities();
    } else {
      this.title = 'View User'
      this.addUserForm.patchValue(this.data.user)
      this.getBranch();
      this.getCities();
      console.log(this.addUserForm.value)
      this.addUserForm.disable();
    }
  }

  initForm() {
    this.addUserForm = this.fb.group({
      branchId: ['', Validators.required],
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      partnerBranchUserUniqueId: [''],
      email: ['', [Validators.email, Validators.required]],
      mobileNumber: ['', [Validators.required, Validators.minLength(10)]],
      partnerId: ['', Validators.required],
      stateId: ['', Validators.required],
      cityId: ['', Validators.required],
      pinCode: ['', [Validators.required, Validators.pattern('[1-9][0-9]{5}')]]
    })
  }
  get controls() {
    if (this.addUserForm) {
      return this.addUserForm.controls
    }
  }
  action(event: Event) {
    if (event) {
      this.submit()
    } else if (!event) {
      this.dialogRef.close()
    }
  }

  submit() {
    if (this.addUserForm.invalid) {
      this.addUserForm.markAllAsTouched()
      return
    }
    if (this.data.action == 'add') {
      this.userService.addUser(this.addUserForm.value).pipe(
        map(res => {
          this.toast.success(res.message)
          this.dialogRef.close(res)
        }), catchError(err => {
          this.toast.error(err.error.message)
          throw err
        })).subscribe()
    } else {
      this.userService.editUser(this.addUserForm.value, this.data.user.id).pipe(
        map(res => {
          this.toast.success(res.message)
          this.dialogRef.close(res)
        }), catchError(err => {
          this.toast.error(err.error.message)
          throw err
        })).subscribe()
    }
  }

}
