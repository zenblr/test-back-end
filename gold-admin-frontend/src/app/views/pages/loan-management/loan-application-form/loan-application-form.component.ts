import { Component, OnInit, ChangeDetectorRef, ElementRef } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'kt-loan-application-form',
  templateUrl: './loan-application-form.component.html',
  styleUrls: ['./loan-application-form.component.scss']
})
export class LoanApplicationFormComponent implements OnInit {

  invalid = {
    basic: false,
    kyc: false,
    nominee: false,
    bank: false,
    approval: false,
    ornaments: false,
    intreset: false,
  }
  totalAmount: number = 0;
  basic: any;
  bank: any;
  disable: boolean = false;
  kyc: any;
  nominee: any;
  selected: number;
  intreset: any;
  approval: any;
  constructor(
    public ref: ChangeDetectorRef,
    public router: Router,
  ) {

  }

  ngOnInit() {
    setTimeout(() => {
      if (this.router.url == "/loan-management/package-image-upload") {
        this.disable = false;
        const test = document.getElementById('packets');
        test.scrollIntoView({ behavior: "smooth" });
      } else {
        this.disable = true;
      }
    }, 500)
  }


  basicForm(event) {
    this.basic = event
  }

  kycEmit(event) {
    this.kyc = event
  }

  nomineeEmit(event) {
    this.nominee = event
  }

  bankFormEmit(event) {
    this.bank = event
  }

  interestFormEmit(event) {
    this.intreset = event
  }

  approvalFormEmit() {
    this.approval = event
  }

  cancel() {
    this.ngOnInit()
  }

  checkForFormValidation() {
    if (this.basic.invalid) {
      this.selected = 0;
      this.invalid.basic = true;
      return
    }
    if (this.kyc.invalid) {
      this.selected = 1;
      this.invalid.kyc = true;
      return
    }
    if (this.bank.invalid) {
      this.selected = 2;
      this.invalid.bank = true;
      return
    }
    if (this.nominee.invalid) {
      this.selected = 3;
      this.invalid.nominee = true;
      return
    }
    if (this.intreset.invalid) {
      this.selected = 4;
      this.invalid.intreset = true;
      return
    }
    if (this.approval.invalid) {
      this.selected = 5;
      this.invalid.approval = true;
      return
    }

  }

  apply() {
    this.checkForFormValidation()
  }
}
