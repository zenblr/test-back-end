import { Component, OnInit, Output, EventEmitter, ViewChild, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { MerchantService } from '../../../../../../../../core/user-management/merchant';
import { map, catchError } from 'rxjs/operators';
import { ToastrComponent } from '../../../../../../../partials/components';
import {  ActivatedRoute } from '@angular/router';

@Component({
  selector: 'kt-commission-details',
  templateUrl: './commission-details.component.html',
  styleUrls: ['./commission-details.component.scss']
})
export class CommissionDetailsComponent implements OnInit {

  categoryCommission:any[] = []
  commissionForm: FormGroup;
  userId:number;
  commission:[]
  @Output() next: EventEmitter<any> = new EventEmitter<any>();
  @ViewChild(ToastrComponent, { static: true }) toastr: ToastrComponent;


  constructor(
    public fb: FormBuilder,
    private merchantSercvice:MerchantService,
    private ref:ChangeDetectorRef,
    private rout: ActivatedRoute
  ) {
    this.merchantSercvice.userId$.subscribe(res =>{
      this.userId = res
    })
   }

  ngOnInit() {
    var id = this.rout.snapshot.params.id;
    if (id) {
      this.userId = id;
    }
    this.initForm()
    this.merchantSercvice.getMerchantCommssion(this.userId).pipe(
      map(res =>{
        this.commission = res;
        console.log(this.commission)
        this.createFormArray()
      }),
      catchError(err =>{
        // this.toastr.errorToastr(err.error.message)
        throw err
      })).subscribe()
    
  }

  initForm() {
    this.commissionForm = this.fb.group({
      category:this.fb.array([])
    })
  }

  get categoryArray() {
    if (this.commissionForm)
      return this.commissionForm.controls.category as FormArray
  }

  createFormArray(){
    this.commission.forEach(com=>{
      this.categoryArray.push(
        this.fb.group({
          category:[com['category'],Validators.required],
          categoryId:[com['categoryId'],Validators.required],
          commission:[com['commission'],[Validators.required,Validators.pattern('(^100(\\.0{1,2})?$)|(^([1-9]([0-9])?|0)(\\.[0-9]{1,2})?$)')]],
        })
      )
    })
    console.log(this.categoryArray.controls)
    this.ref.detectChanges()
  }



  submit() {
    if (this.commissionForm.invalid) {
      this.commissionForm.markAllAsTouched()
      return
    }
    console.log(this.userId)
    console.log(this.categoryCommission)
    this.merchantSercvice.merchantCommission(this.categoryArray.value,this.userId).pipe(
      map(res=>{
        this.next.emit(true);
      }
    ),catchError(err=>{
      this.toastr.errorToastr(err.error.message)
      throw err
    })).subscribe()
   

  }

}
