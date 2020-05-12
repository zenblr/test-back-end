import { Component, OnInit, ChangeDetectorRef, ElementRef } from '@angular/core';
import { Router } from '@angular/router';
import { LoanApplicationFormService } from "../../../../core/loan-management";
import { map, catchError } from 'rxjs/operators';

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
  disabledForm:boolean
  totalAmount: number = 0;
  basic: any;
  bank: any;
  bankDetails: any;
  disable: boolean;
  kyc: any;
  nominee: any;
  selected: number;
  intreset: any;
  approval: any;
  Ornaments: any;
  customerDetail: any;
  disabled = [false, true, true, true, false, false];
  constructor(
    public ref: ChangeDetectorRef,
    public router: Router,
    public loanApplicationForm: LoanApplicationFormService
  ) {

  }

  ngOnInit() {
    setTimeout(() => {
      if (this.router.url == "/loan-management/package-image-upload") {
        this.disabledForm = true;
        const test = document.getElementById('packets');
        test.scrollIntoView({ behavior: "smooth" });
      } else {
        this.disabledForm = false;
      }
    }, 500)
  }

  customerDetails(event) {
    this.basic = event
    this.loanApplicationForm.customerDetails(this.basic.controls.customerUniqueId.value).pipe(
      map(res => {
        this.customerDetail = res.customerData
        this.bankDetails = res.customerData.customerKycBank[0]
    for (let index = 0; index < this.disabled.length; index++) {
      if (index <= 3) {
        this.disabled[index] = false;
      }
    }
    this.selected = 3;
      }),
      catchError(err => {
        throw err;
      })
    ).subscribe()
  }

  basicForm(event) {
    this.basic = event
  }

  kycEmit(event) {
    this.kyc = event
  }

  nomineeEmit(event) {
    this.nominee = event.nominee
    if (event.scroll) {
      const test = document.getElementById('ornaments');
      test.scrollIntoView({ behavior: "smooth" });
    }
  }

  bankFormEmit(event) {
    this.bank = event
  }

  interestFormEmit(event) {
    this.intreset = event
  }

  approvalFormEmit(event) {
    this.approval = event
  }

  OrnamentsDataEmit(event) {
    this.Ornaments = event
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
    // this.checkForFormValidation();
    const arrObj = [];
    let Obj
    //  arrObj.push(this.Ornaments.value)
    arrObj.push(this.approval.value)
    arrObj.push(this.intreset.value)
    arrObj.push(this.basic.value)
    arrObj.push(this.bank.value)
    arrObj.push(this.kyc.value)
    Obj = arrObj.reduce(((r, c) => Object.assign(r, c)), {});
    Obj.nomineeData = [this.nominee.value]
    Obj.ornamentData = this.Ornaments.value;
    console.log(JSON.stringify(Obj))

  }
}
