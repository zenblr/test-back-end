import { Component, OnInit, ChangeDetectorRef, Input, EventEmitter, Output, OnChanges, SimpleChanges } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';

@Component({
  selector: 'kt-bank-details',
  templateUrl: './bank-details.component.html',
  styleUrls: ['./bank-details.component.scss']
})
export class BankDetailsComponent implements OnInit, OnChanges {


  @Input() details;
  @Output() bankFormEmit: EventEmitter<any> = new EventEmitter();
  @Input() disable
  @Input() action
  bankForm: FormGroup;
  constructor(
    public ref: ChangeDetectorRef,
    public fb: FormBuilder,
  ) {
    this.initForm()
  }

  ngOnInit() {

  }



  ngOnChanges(changes:SimpleChanges) {
    if (changes.details) {
      if(changes.action.currentValue == 'add'){
        this.bankForm.patchValue(changes.details.currentValue.customerKycBank[0])
      }else if(changes.action.currentValue == 'edit'){
        this.bankForm.patchValue(changes.details.currentValue.loanBankDetail)
        this.ref.markForCheck()
      }
      
      this.bankFormEmit.emit(this.bankForm);
    }
    if(this.disable){
      this.bankForm.disable()
    }
  }

  initForm() {
    this.bankForm = this.fb.group({
      bankName: [],
      accountNumber: [],
      ifscCode: []
    })
    this.bankForm.disable()
  }

  get controls() {
    if (this.bankForm)
      return this.bankForm.controls
  }

}
