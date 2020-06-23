import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup } from '@angular/forms';

@Component({
  selector: 'kt-top-up',
  templateUrl: './top-up.component.html',
  styleUrls: ['./top-up.component.scss']
})
export class TopUpComponent implements OnInit {

  inputEligibleAmount: boolean;
  showPaymentConfirmation: boolean;
  topUpForm: FormGroup;
  constructor(
    private router: Router,
    private fb: FormBuilder
  ) { }

  ngOnInit() {
    this.initForm()
  }

  initForm() {
    this.topUpForm = this.fb.group({
      eligbileTopUp: [],
      processingCharge: [],
      topUp: [],
    })
  }

  eligibleTopUp() {
    this.inputEligibleAmount = !this.inputEligibleAmount;
  }

  viewOrnaments() {
    // this.router.navigate([])
  }

  enterTopUp() {
    this.showPaymentConfirmation = !this.showPaymentConfirmation;
  }

  pay() {

  }

}
