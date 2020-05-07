import { Component, OnInit, Input, EventEmitter, Output,AfterViewInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'kt-final-interest-amount',
  templateUrl: './final-interest-amount.component.html',
  styleUrls: ['./final-interest-amount.component.scss']
})
export class FinalInterestAmountComponent implements OnInit,AfterViewInit {
  
  finalInterestForm: FormGroup;
  @Input() invalid;
  @Input() disable;
  @Output() interestFormEmit: EventEmitter<any> = new EventEmitter<any>();

  constructor(private fb: FormBuilder) { }

  ngOnInit() {
    this.initForm();
  }

  initForm() {
    this.finalInterestForm = this.fb.group({
      customerId: [, [Validators.required]],
      loanId: [, [Validators.required]],
      loanAmount: [, [Validators.required]],
      tenure: [, [Validators.required]],
      startDate: [, [Validators.required]],
      loanRepayDate: [, [Validators.required]],
      goldGrossWeight: [, [Validators.required]],
      repayDateType: [, [Validators.required]],
      goldNetWeight: [, [Validators.required]],
      finalNetWeight: [, [Validators.required]],
      interestRate: [, [Validators.required]],
      currentLtvAmount: [, [Validators.required]],
    })
    this.interestFormEmit.emit(this.finalInterestForm)
  }

  ngAfterViewInit(){
    this.finalInterestForm.valueChanges.subscribe(()=>{
      this.interestFormEmit.emit(this.finalInterestForm)
    })
  }

  calcInterestAmount() {
    if (this.finalInterestForm.invalid) {
      this.finalInterestForm.markAllAsTouched();
      return;
    }

    console.log(this.finalInterestForm.value);
  }

  get controls() {
    return this.finalInterestForm.controls;
  }

}
