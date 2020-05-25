import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { UploadOfferService } from '../../../../../../core/upload-data';

@Component({
  selector: 'kt-rough-loan-amount',
  templateUrl: './rough-loan-amount.component.html',
  styleUrls: ['./rough-loan-amount.component.scss']
})
export class RoughLoanAmountComponent implements OnInit {

  roughLoanForm: FormGroup;
  loanAmount: number = 0;

  constructor(public fb: FormBuilder, private uploadOfferService: UploadOfferService) {

  }

  ngOnInit() {
    this.initForm();
    this.uploadOfferService.goldRate$.subscribe(res => {
      this.controls.currentLTV.patchValue(res * 0.75);
    })
  }

  initForm() {
    this.roughLoanForm = this.fb.group({
      grossWeight: [, [Validators.required]],
      netWeight: [, [Validators.required]],
      deductionWeight: [, Validators.required],
      currentLTV: [, Validators.required]
    })

  }

  get controls() {
    if (this.roughLoanForm) {
      return this.roughLoanForm.controls
    }
  }

  weightCheck(){
    if(this.controls.grossWeight.valid){
      if(this.controls.grossWeight.value < this.controls.netWeight.value){
        this.controls.netWeight.setErrors({weight:true})
      }else{
        this.controls.netWeight.setErrors(null)
      }
    }
  }

  calculate() {
    if (this.roughLoanForm.invalid) {
      this.roughLoanForm.markAllAsTouched();
      return
    }
    this.loanAmount = this.controls.netWeight.value * this.controls.currentLTV.value;

  }
}
