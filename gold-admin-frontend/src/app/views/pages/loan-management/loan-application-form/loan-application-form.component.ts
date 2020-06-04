import { Component, OnInit, ChangeDetectorRef, ElementRef } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
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
  url: string
  id: number;
  disabledForm: boolean;
  totalAmount: number = 0;
  basic: any;
  bank: any;
  kyc: any;
  nominee: any;
  selected: number;
  intreset: any;
  approval: any;
  Ornaments: any;
  action: any;
  customerDetail: any;
  disabled = [false, true, true, true, true, true];
  loanId: any;
  finalLoanAmt: any;
  constructor(
    public ref: ChangeDetectorRef,
    public router: Router,
    public loanApplicationFormService: LoanApplicationFormService,
    public toast: ToastrService,
    public rout: ActivatedRoute
  ) {
    this.url = this.router.url.split('/')[2]
    this.id = this.rout.snapshot.params.id
    if (this.id) {
      // for (let index = 0; index < this.disabled.length; index++) {
      //   this.disabled[index] = false;
      // }
      this.editApi()

    }
  }

  editId(event) {
    this.id = event
    this.editApi()
    setTimeout(() => {
      this.action = 'add'
    }, 5000)
  }



  editApi() {
    this.loanApplicationFormService.getLoanDataById(this.id).subscribe(res => {
      this.loanId = res.data.id
      this.action = 'edit'
      this.customerDetail = res.data
      // this.totalAmount = res.data.totalEligibleAmt
      if (this.url == "package-image-upload") {
        this.selected = 6;
        this.disabledForm = true;
      } else if (this.url == "view-loan") {
        this.disabledForm = true;
      } else {
        this.disabledForm = false;
        if (res.data.customerLoanCurrentStage) {
          let stage = res.data.customerLoanCurrentStage
          this.selected = Number(stage) - 1;
        } else {
          this.selected = 5;
        }
      }
    })
  }

  ngOnInit() {
    setTimeout(() => {

      if (this.url == "package-image-upload") {
        this.selected = 6;
        this.disabledForm = true;
      } else if (this.url == "view-loan") {
        this.next(0)
        this.disabledForm = true;
      } else {
        this.disabledForm = false;
      }
    }, 1000)
  }


  loan(event) {
    this.loanId = event
  }

  totalEligibleAmt(event) {
    this.totalAmount = event
  }

  finalLoanAmount(event) {
    this.finalLoanAmt = event
  }

  customerDetails(event) {
    this.loanApplicationFormService.customerDetails(event.controls.customerUniqueId.value).pipe(
      map(res => {
        this.action = 'add'
        this.customerDetail = res.customerData
        for (let index = 0; index < this.disabled.length; index++) {
          if (index <= 2) {
            this.disabled[index] = false;
          }
        }
        this.selected = 2;
      }),
      catchError(err => {
        this.toast.error(err.error.message)
        throw err;
      })
    ).subscribe()
  }

  // basicForm(event) {
  //   this.basic = event
  //   this.invalid.basic = false
  // }

  // kycEmit(event) {
  //   this.kyc = event
  //   this.invalid.kyc = false

  // }

  // nomineeEmit(event) {
  //   this.nominee = event.nominee
  //   this.invalid.nominee = false

  //   // if (event.scroll) {
  //   //   const test = document.getElementById('ornaments');
  //   //   test.scrollIntoView({ behavior: "smooth" });
  //   // }
  // }

  // bankFormEmit(event) {
  //   this.bank = event
  //   this.invalid.bank = false
  // }

  // interestFormEmit(event) {
  //   this.intreset = event
  //   this.invalid.intreset = false
  //   if (this.intreset.valid || this.intreset.status == "DISABLED") {
  //     this.disabled[4] = false
  //   } else {
  //     this.disabled[4] = true;
  //   }
  // }

  // approvalFormEmit(event ) {
  //   this.approval = event
  //   this.invalid.approval = false

  // }

  // OrnamentsDataEmit(event) {
  //   this.Ornaments = event
  //   this.invalid.ornaments = false
  //   if (this.Ornaments.valid || this.Ornaments.status == "DISABLED") {
  //     this.disabled[3] = false
  //     this.calculateTotalEligibleAmount()

  //   } else {
  //     this.disabled[3] = true;
  //   }
  //   this.ref.detectChanges()
  // }

  // calculateTotalEligibleAmount() {
  //   this.totalAmount = 0;
  //   this.Ornaments.value.forEach(element => {
  //     this.totalAmount += Number(element.loanAmount)
  //   });
  //   this.totalAmount = Math.round(this.totalAmount)
  // }

  // cancel() {
  //   // this.router.navigate(['/'])
  // }

  // checkForFormValidation() {
  //   if (this.basic.invalid) {
  //     this.selected = 0;
  //     this.invalid.basic = true;
  //     window.scrollTo(0, 0)
  //     return true
  //   }

  //   if (this.nominee.invalid) {
  //     this.selected = 2;
  //     this.invalid.nominee = true;
  //     window.scrollTo(0, 0)
  //     return true
  //   }
  //   if (this.Ornaments.invalid) {
  //     this.invalid.ornaments = true;
  //     // const test = document.getElementById('ornaments');
  //     // test.scrollIntoView({ behavior: "smooth" });
  //     return true
  //   }
  //   if (this.intreset.invalid) {
  //     this.selected = 3;
  //     this.invalid.intreset = true;
  //     window.scrollTo(0, 0)
  //     return true
  //   }

  //   if (this.approval.invalid) {
  //     this.selected = 4;
  //     this.invalid.approval = true;
  //     window.scrollTo(0, 0)
  //     return true
  //   }

  // }

  total(event) {
    this.totalAmount = event
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
    // let valid = this.checkForFormValidation();
    // if (valid) {
    //   return
    // }
    // let data = this.createData()
    // if (this.action == 'add') {
    //   this.loanApplicationFormService.applyForLoan(data).pipe(
    //     map(res => {
    //       this.toast.success(res.message)
    //       this.router.navigate(['/loan-management/applied-loan'])
    //     }),
    //     catchError(err => {
    //       this.toast.error(err.error.message)
    //       throw err
    //     })
    //   ).subscribe()
    // }
    // if (this.action == 'edit') {
    //   data.loanFinalCalculator.loanStartDate = new Date(data.loanFinalCalculator.loanStartDate).toISOString();

    //   this.loanApplicationFormService.updateLoan(this.customerDetail.id, data).pipe(
    //     map(res => {
    //       this.toast.success(res.message)
    //       this.router.navigate(['/loan-management/applied-loan'])
    //     }),
    //     catchError(err => {
    //       this.toast.error(err.error.message)
    //       throw err
    //     })
    //   ).subscribe()
    // }
  }


  next(event) {
    // if (event.index != undefined) {
    //   this.selected = event.index;
    // } else {
    //   this.selected = event;
    // }
    // for (let index = 0; index < this.disabled.length; index++) {
    //   if (this.url != "view-loan") {
    //     if (this.selected >= index) {
    //       this.disabled[index] = false
    //     } else {
    //       this.disabled[index] = true
    //     }
    //   } else {
    //     this.disabled[index] = false
    //   }
    // }
    // window.scrollTo(0, 0)
    // this.disabled[5] = false;
  }

}
