import { Component, OnInit, Inject } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { InternalUserBranchService } from "../../../../../core/user-management/internal-user-branch";
import { ToastrService } from 'ngx-toastr';
import { map, catchError } from 'rxjs/operators';
import { SharedService } from '../../../../../core/shared/services/shared.service';

@Component({
  selector: 'kt-add-internal-user-branch',
  templateUrl: './add-internal-user-branch.component.html',
  styleUrls: ['./add-internal-user-branch.component.scss']
})
export class AddInternalUserBranchComponent implements OnInit {
  
  title: string = ''
  addInternalBranchForm: FormGroup;
  states:any[]=[]
  cities:any[]=[]

  constructor(
    public dialogRef: MatDialogRef<AddInternalUserBranchComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private fb: FormBuilder,
    private internalUserBranchService:InternalUserBranchService,
    public toast:ToastrService,
    public sharedService:SharedService,
  ) { }

  ngOnInit() {
    console.log(this.data)
    this.getStates()
    this.initForm()
    this.setTitle()
  }

  setTitle() {
    if (this.data.action == 'add') {
      this.title = 'Add Internal User'
    } else if (this.data.action == 'edit') {
      this.title = 'Edit Internal User'
      this.addInternalBranchForm.patchValue(this.data.branch)
      this.getCites()
    } else {
      this.title = 'View Internal User'
      this.addInternalBranchForm.patchValue(this.data.branch)
      this.getCites()
      this.addInternalBranchForm.disable();
    }
  }

  initForm() {
    this.addInternalBranchForm = this.fb.group({
      name: ['', Validators.required],
      address: ['', Validators.required],
      stateId: ['', Validators.required],
      cityId: ['', Validators.required],
      pinCode: ['', Validators.required],
    })
  }

  getStates(){
    this.sharedService.getStates().pipe(
      map(res =>{
        this.states = res.message;
      })).subscribe()
  }

  getCites(){
    this.sharedService.getCities(this.controls.stateId.value).pipe(
      map(res =>{
        this.cities = res.message;
      })).subscribe()
  }

  get controls() {
    if (this.addInternalBranchForm) {
      return this.addInternalBranchForm.controls
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
    if (this.addInternalBranchForm.invalid) {
      this.addInternalBranchForm.markAllAsTouched()
      return
    }
    if(this.data.action == 'add'){
      this.internalUserBranchService.addInternalBranch(this.addInternalBranchForm.value).pipe(
        map(res => {
        this.toast.success(res['message'])
         this.dialogRef.close(res)
        }),
        catchError(err=>{
          this.toast.error(err.error.error)
          throw err
        })).subscribe()
    }else{
 
    this.internalUserBranchService.editInternalBranch(this.addInternalBranchForm.value,this.data.branch.userId).pipe(
      map(res => {
      this.toast.success(res['message'])
       this.dialogRef.close(res)
      }),
      catchError(err=>{
        this.toast.error(err.error.message)
        throw err
      })).subscribe()
  }}
}

