import { Component, OnInit, Inject } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import {  AppliedLoanService } from '../../../../../core/loan-management';
import { map, catchError } from 'rxjs/operators';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'kt-disburse-dialog',
  templateUrl: './disburse-dialog.component.html',
  styleUrls: ['./disburse-dialog.component.scss']
})
export class DisburseDialogComponent implements OnInit {

  currentDate = new Date()
  disburseForm:FormGroup
  constructor(
    public dialogRef: MatDialogRef<DisburseDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private fb:FormBuilder,
    public loanService:AppliedLoanService,
    public toast:ToastrService
  ) { }

  ngOnInit() {
    this.disburseForm = this.fb.group({
      loanId: [this.data.id],
      transactionId: ['', [Validators.required]],
      date:[this.currentDate,Validators.required]
    })
  }

get controls(){
  return this.disburseForm.controls
}
action(event){
  if(event){
    this.submit()
  }else if(!event){
    this.dialogRef.close()
  }
}

submit(){
  if(this.disburseForm.invalid){
    this.disburseForm.markAllAsTouched()
    return 
  }
  this.loanService.disburse(this.disburseForm.value).pipe(
    map(res =>{
      this.dialogRef.close(res);
      this.toast.success(res.message)
    }),
    catchError(err =>{
      this.toast.error(err.error.message);
      throw err
    })).subscribe()
}

}
