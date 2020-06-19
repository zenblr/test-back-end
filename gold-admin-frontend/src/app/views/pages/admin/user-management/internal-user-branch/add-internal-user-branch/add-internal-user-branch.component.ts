import { Component, OnInit, Inject } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { InternalUserBranchService } from "../../../../../../core/user-management/internal-user-branch";
import { ToastrService } from 'ngx-toastr';
import { map, catchError } from 'rxjs/operators';
import { SharedService } from '../../../../../../core/shared/services/shared.service';
import { PartnerService } from '../../../../../../core/user-management/partner/services/partner.service';

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
  partners = [];
  button: string;

  constructor(
    public dialogRef: MatDialogRef<AddInternalUserBranchComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private fb: FormBuilder,
    private internalUserBranchService:InternalUserBranchService,
    public toast:ToastrService,
    public sharedService:SharedService,
    private partnerService: PartnerService

  ) { }

  ngOnInit() {
    console.log(this.data)
    this.getAllPartners()
    this.getStates()
    this.initForm()
    this.setTitle()

  }

  getAllPartners() {
    this.partnerService.getAllPartnerWithoutPagination().subscribe(res => {
      this.partners = res.data;
    })
  }

  setTitle() {
    if (this.data.action == 'add') {
      this.title = 'Add Internal User'
      this.button = 'add'
    } else if (this.data.action == 'edit') {
      this.title = 'Edit Internal User'
      this.button = 'update'
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
      multiselect:[''],
      partnerId:['']
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
    this.controls.partnerId.patchValue(this.controls.multiselect.value.multiSelect)
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

