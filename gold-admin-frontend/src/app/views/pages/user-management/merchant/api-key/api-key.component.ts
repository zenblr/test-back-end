import { Component, OnInit, Inject, ChangeDetectorRef } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { MerchantService } from '../../../../../core/user-management/merchant';
import { ToastrService } from 'ngx-toastr';
import { catchError, map } from 'rxjs/operators';

@Component({
  selector: 'kt-api-key',
  templateUrl: './api-key.component.html',
  styleUrls: ['./api-key.component.scss']
})
export class ApiKeyComponent implements OnInit {

  apiDetails:any ={}
  constructor(
    public dialogRef: MatDialogRef<ApiKeyComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private merchatService: MerchantService,
    private toast: ToastrService,
    private ref:ChangeDetectorRef
  ) { }

  ngOnInit() {
    this.merchatService.getApiDetails(this.data.userId).pipe(
      map(res =>{
        this.apiDetails = res
        this.ref.detectChanges()
      }),catchError(err =>{
        this.toast.error(err.errror.error)
        throw err
      })).subscribe()
  }

  generateApi(){
    this.merchatService.generateApi(this.data.userId).pipe(
      map(res =>{
        this.apiDetails = res;
        this.ref.detectChanges()
      }),catchError(err =>{
        this.toast.error(err.errror.error)
        throw err
      })).subscribe()
  }

  reGenerateApi(){
    this.merchatService.reGenerateApi(this.data.userId).pipe(
      map(res =>{
        this.apiDetails = res;
        this.ref.detectChanges()
      }),catchError(err =>{
        this.toast.error(err.errror.error)
        throw err
      })).subscribe()
  }

  toogle(event){
    this.merchatService.status(event,this.data.userId).pipe(
      map(res =>{
        this.toast.success(res.message)
      }),catchError(err =>{
        this.toast.error(err.errror.error)
        throw err
      })).subscribe()
  }

  closeModal(){
    this.dialogRef.close()
  }
}
