import { Component, OnInit, Output, EventEmitter, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MerchantService } from '../../../../../../../core/user-management/merchant';
import { map, catchError } from 'rxjs/operators';
import { ToastrComponent } from '../../../../../../../views/partials/components';

@Component({
  selector: 'kt-commission-details',
  templateUrl: './commission-details.component.html',
  styleUrls: ['./commission-details.component.scss']
})
export class CommissionDetailsComponent implements OnInit {

  categoryCommission:any[] = []
  category: FormGroup;
  userId:number;
  @Output() next: EventEmitter<any> = new EventEmitter<any>();
  @ViewChild(ToastrComponent, { static: true }) toastr: ToastrComponent;


  constructor(
    public fb: FormBuilder,
    private merchantSercvice:MerchantService
  ) {
    this.merchantSercvice.userId$.subscribe(res =>{
      this.userId = res
    })
   }

  ngOnInit() {
    this.initForm()
  }

  initForm() {
    this.category = this.fb.group({
      category1: ['', [Validators.required]],
      category2: ['', [Validators.required]],
      category3: ['', [Validators.required]]
    })
  }

  get controls() {
    if (this.category)
      return this.category.controls
  }

  prepareCategoryCommissionArray(){
    this.categoryCommission = []
    var commission = Object.values(this.category.value)
    let data:any = { }
    for (let index = 0; index < commission.length; index++) {
       data ={
        categoryId:index,
        commission:Number(commission[index])
      }
      this.categoryCommission.push(data)
    }
  }

  submit() {
    if (this.category.invalid) {
      this.category.markAllAsTouched()
      return
    }
    this.prepareCategoryCommissionArray()
    console.log(this.userId)
    console.log(this.categoryCommission)
    this.merchantSercvice.merchantCommission(this.categoryCommission,this.userId).pipe(
      map(res=>{
        this.next.emit(true);
      }
    ),catchError(err=>{
      this.toastr.errorToastr(err.error.message)
      throw err
    })).subscribe()
   

  }

}
