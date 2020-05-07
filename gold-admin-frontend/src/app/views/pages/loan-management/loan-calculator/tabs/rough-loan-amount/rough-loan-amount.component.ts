import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';

@Component({
  selector: 'kt-rough-loan-amount',
  templateUrl: './rough-loan-amount.component.html',
  styleUrls: ['./rough-loan-amount.component.scss']
})
export class RoughLoanAmountComponent implements OnInit {

  roughLoanForm: FormGroup;
  loanAmount:number = 0;

  constructor(public fb: FormBuilder) { }

  ngOnInit() {
    this.initForm()
  }

  initForm() {
    this.roughLoanForm = this.fb.group({
      grossWeight:[],
      netWeight:[,Validators.required],
      currentLTV:[,Validators.required]
    })

  }

  get controls(){
    if(this.roughLoanForm){
      return this.roughLoanForm.controls
    }
  }

  calculate() {
    if(this.roughLoanForm.invalid){
      this.roughLoanForm.markAllAsTouched();
      return
    }
    this.loanAmount = this.controls.netWeight.value * this.controls.currentLTV.value;

  }
}
