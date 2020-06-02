import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { UploadOfferService } from '../../../../../../../core/upload-data';
import { GoldRateService } from '../../../../../../../core/upload-data/gold-rate/gold-rate.service';

@Component({
  selector: 'kt-rough-loan-amount',
  templateUrl: './rough-loan-amount.component.html',
  styleUrls: ['./rough-loan-amount.component.scss']
})
export class RoughLoanAmountComponent implements OnInit {

  roughLoanForm: FormGroup;
  loanAmount: number = 0;

  constructor(public fb: FormBuilder, private goldRateService: GoldRateService) {

  }

  ngOnInit() {
    this.initForm();
    this.goldRateService.goldRate$.subscribe(res => {
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

  weightCheck() {
    if (this.controls.grossWeight.valid) {
      if (this.controls.grossWeight.value < this.controls.deductionWeight.value) {
        this.controls.deductionWeight.setErrors({ weight: true })
      } else {
        this.controls.deductionWeight.setErrors(null)
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

  calcGoldDeductionWeight() {
    if (this.controls.grossWeight.value && this.controls.deductionWeight.value) {
      const netWeight = this.controls.grossWeight.value - this.controls.deductionWeight.value;
      this.controls.netWeight.patchValue(netWeight.toFixed());
      // console.log(goldDeductionWeight)
    }
  }
}
