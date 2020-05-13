import { Component, OnInit, ChangeDetectorRef, ElementRef } from '@angular/core';
import { Router } from '@angular/router';
import { LoanApplicationFormService } from "../../../../core/loan-management";
import { map, catchError } from 'rxjs/operators';
import { ToastrService } from 'ngx-toastr';

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
  disabledForm: boolean
  totalAmount: number = 0;
  basic: any;
  bank: any;
  bankDetails: any;
  kyc: any;
  nominee: any;
  selected: number;
  intreset: any;
  approval: any;
  Ornaments: any;
  customerDetail: any;
  disabled = [false, true, true, true, false, true];
  constructor(
    public ref: ChangeDetectorRef,
    public router: Router,
    public loanApplicationFormService: LoanApplicationFormService,
    public toast:ToastrService,
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
    this.loanApplicationFormService.customerDetails(event.controls.customerUniqueId.value).pipe(
      map(res => {
    this.customerDetail = res.customerData
    this.bankDetails = this.customerDetail.customerKycBank[0]
    for (let index = 0; index < this.disabled.length; index++) {
      if (index <= 3) {
        this.disabled[index] = false;
      }
    }
    this.selected = 3;
      }),
      catchError(err => {
        this.toast.error(err.error.message)
        throw err;
      })
    ).subscribe()
  }

  basicForm(event) {
    this.basic = event
    this.invalid.basic = false
  }

  kycEmit(event) {
    this.kyc = event
    this.invalid.kyc = false

  }

  nomineeEmit(event) {
    this.nominee = event.nominee
    this.invalid.nominee = false

    if (event.scroll) {
      const test = document.getElementById('ornaments');
      test.scrollIntoView({ behavior: "smooth" });
    }
  }

  bankFormEmit(event) {
    this.bank = event
    this.invalid.bank = false
  }

  interestFormEmit(event) {
    this.intreset = event
    this.invalid.intreset = false
    if (this.intreset.valid) {
      this.disabled[5] = false
    } else {
      this.disabled[5] = true;
    }
  }

  approvalFormEmit(event) {
    this.approval = event
    this.invalid.approval = false

  }

  OrnamentsDataEmit(event) {
    this.Ornaments = event
    this.invalid.ornaments = false
    if (this.Ornaments.valid) {
      // this.disabled[4] = false
    this.calculateTotalEligibleAmount()

    } else {
      // this.disabled[4] = true;
    }

  }

  calculateTotalEligibleAmount() {
    this.totalAmount = 0;
    this.Ornaments.value.forEach(element => {
      this.totalAmount += element.ltvAmount
    });
  
    console.log(this.Ornaments.value)
  }

  cancel() {
    this.ngOnInit()
  }

  checkForFormValidation() {
    if (this.basic.invalid) {
      this.selected = 0;
      this.invalid.basic = true;
      window.scrollTo(0, 0)
      return true
    }

    if (this.nominee.invalid) {
      this.selected = 3;
      this.invalid.nominee = true;
      window.scrollTo(0, 0)
      return true
    }
    if (this.Ornaments.invalid) {
      this.invalid.ornaments = true;
      const test = document.getElementById('ornaments');
      test.scrollIntoView({ behavior: "smooth" });
      return true
    }
    if (this.intreset.invalid) {
      this.selected = 4;
      this.invalid.intreset = true;
      window.scrollTo(0, 0)
      return true
    }

    if (this.approval.invalid) {
      this.selected = 5;
      this.invalid.approval = true;
      window.scrollTo(0, 0)
      return true
    }





  }
  createData() {
    let Obj = {
      loanOrnmanets: this.Ornaments.value,
      loanApproval: this.approval.value,
      loanFinalCalculator: this.intreset.value,
      loanPersonal: this.basic.value,
      loanBank: this.bank.value,
      loanKyc: this.kyc.value,
      loanNominee: this.nominee.value,
      customerId: this.basic.controls.customerId.value,
      totalEligibleAmt: this.totalAmount,
      totalFinalInterestAmt: (this.intreset.controls.intresetAmt.value)
    }
    return Obj
  }

  apply() {
   let valid =  this.checkForFormValidation();
   if(valid){
     return 
   }
   let data = this.createData()
   this.loanApplicationFormService.applyForLoan(data).pipe(
     map(res =>{
       this.toast.success(res.message)
       this.router.navigate(['/loan-management/applied-loan'])
     }),
     catchError(err =>{
      this.toast.error(err.error.message)
       throw err
     })
   ).subscribe()
  }

}
