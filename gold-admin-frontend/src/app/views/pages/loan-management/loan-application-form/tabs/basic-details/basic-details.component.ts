import { Component, OnInit, EventEmitter, Output, OnChanges, Input, ChangeDetectionStrategy, ChangeDetectorRef, SimpleChanges, AfterViewInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'kt-basic-details',
  templateUrl: './basic-details.component.html',
  styleUrls: ['./basic-details.component.scss'],
  providers: [DatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BasicDetailsComponent implements OnInit, OnChanges,AfterViewInit {

  basicForm: FormGroup;
  @Output() basicFormEmit: EventEmitter<any> = new EventEmitter();
  @Input() disable
  @Input() details;
  @Input() invalid
  @Input() action;
  @Output() apiHit: EventEmitter<any> = new EventEmitter();
  currentDate:any = new Date();

  constructor(
    private fb: FormBuilder,
    private datePipe: DatePipe,
    private ref: ChangeDetectorRef,
    private rout:ActivatedRoute
  ) {
    this.initForm()
    
  }

ngAfterViewInit(){
  this.rout.queryParams.subscribe(res=>{
    console.log(res)
    if(res.customerID){
    this.controls.customerUniqueId.patchValue(res.customerID)
    this.apiHit.emit(this.basicForm)
    }
  })

}

  ngOnInit() {
    this.basicFormEmit.emit(this.basicForm)
    this.controls.customerUniqueId.valueChanges.subscribe(() => {
      if (this.controls.customerUniqueId.valid) {
        this.basicFormEmit.emit(this.basicForm)
      }
    })
  }

  ngOnChanges(changes:SimpleChanges) {
    if (changes.details) {
      if(changes.action.currentValue == 'add'){
      this.basicForm.controls.mobileNumber.patchValue(this.details.mobileNumber)
      this.basicForm.controls.panCardNumber.patchValue(this.details.panCardNumber) 
      this.basicForm.controls.customerId.patchValue(this.details.id)
      }else if(changes.action.currentValue == 'edit'){
        
        this.controls.customerId.patchValue(changes.details.currentValue.customerId)
        this.basicForm.patchValue(changes.details.currentValue.loanPersonalDetail)
        this.currentDate = new Date(changes.details.currentValue.loanPersonalDetail.startDate)
        this.basicForm.controls.startDate.patchValue(this.datePipe.transform(this.currentDate,'mediumDate'));
        this.basicFormEmit.emit(this.basicForm)
        this.basicForm.disable()
        this.ref.detectChanges()
      }
    }
    if (this.disable) {
      this.basicForm.disable()
    }
    if(this.invalid){
      this.basicForm.markAllAsTouched()
    }
    this.ref.detectChanges()
  }


  getCustomerDetails() {
    if (this.controls.customerUniqueId.valid) {
      this.apiHit.emit(this.basicForm)
    }
  }

  initForm() {
    this.basicForm = this.fb.group({
      customerUniqueId: [, [Validators.required, Validators.minLength(8)]],
      mobileNumber: [''],
      panCardNumber: [''],
      startDate: [this.currentDate],
      customerId:[],
      kycStatus:[],
      paymentType:['',Validators.required]
    })
  }

  get controls() {
    return this.basicForm.controls
  }



}
