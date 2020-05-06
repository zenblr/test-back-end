import { Component, OnInit, Input } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'kt-final-interest-amount',
  templateUrl: './final-interest-amount.component.html',
  styleUrls: ['./final-interest-amount.component.scss']
})
export class FinalInterestAmountComponent implements OnInit {
  
  finalInterestForm: FormGroup;
  @Input() invalid;
  @Input() disable;
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
