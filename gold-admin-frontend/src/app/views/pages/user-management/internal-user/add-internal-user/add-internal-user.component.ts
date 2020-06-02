import { Component, OnInit, Inject } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { InternalUserService } from '../../../../../core/user-management/internal-user';
import { catchError, map } from 'rxjs/operators';
import { InternalUserBranchService } from '../../../../../core/user-management/internal-user-branch'
import { RolesService} from '../../../../../core/user-management/roles'
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'kt-add-internal-user',
  templateUrl: './add-internal-user.component.html',
  styleUrls: ['./add-internal-user.component.scss']
})
export class AddInternalUserComponent implements OnInit {

  title: string = ''
  addUserForm: FormGroup
  branch: unknown;
  roles: any;
  userType:any;
  constructor(
    public dialogRef: MatDialogRef<AddInternalUserComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private fb: FormBuilder,
    private internalUser: InternalUserService,
    private internalUserBranchService: InternalUserBranchService,
    private rolesService:RolesService,
    private toast:ToastrService
  ) { }

  ngOnInit() {
    this.getUserType()
    this.getBranch()
    this.getRoles()
    this.initForm()
    this.setTitle()

  }

  setTitle() {
    if (this.data.action == 'add') {
      this.title = 'Add Internal User'
    } else if (this.data.action == 'edit') {
      this.title = 'Edit Internal User'
      this.addUserForm.patchValue(this.data.user)
      this.addUserForm.patchValue({roleId:this.data.user.roles[0].id})
      this.addUserForm.patchValue({internalBranchId:this.data.user.internalBranches[0].id})
    } else {
      this.title = 'View Internal User'
      this.addUserForm.disable();
    }
  }

  getUserType(){
    this.internalUserBranchService.getUserType().subscribe(res=>{
      this.userType = res.data
    })
  }

  getBranch() {
    this.internalUserBranchService.getInternalBranch('',1,50).pipe(
      map(res =>{
        this.branch = res['data']
      })
    ).subscribe()
  }

  getRoles() {
    this.rolesService.getRoles('',1,50).pipe(
      map(res =>{
        this.roles = res.data;
      })
      ).subscribe()
  }

  initForm() {
    this.addUserForm = this.fb.group({
      internalBranchId: ['', Validators.required],
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      userUniqueId: ['', Validators.required],
      email: ['', [Validators.email,Validators.required]],
      mobileNumber: ['', [Validators.required,Validators.minLength(10)]],
      roleId: ['', Validators.required],
      userTypeId:['',Validators.required],
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
      this.internalUser.addUser(this.addUserForm.value).pipe(
        map(res => {
          this.toast.success(res.message)
          this.dialogRef.close(res)
        }), catchError(err => {
          this.toast.error(err.error.message)
          throw err
        })).subscribe()
    } else {
      this.internalUser.editUser(this.addUserForm.value, this.data.user.id).pipe(
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
