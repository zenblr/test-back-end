import { Component, OnInit, ChangeDetectorRef, ElementRef } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { LoanApplicationFormService } from "../../../../../core/loan-management";
import { map, catchError } from 'rxjs/operators';
import { ToastrService } from 'ngx-toastr';
import { OrnamentsService } from '../../../../../core/masters/ornaments/services/ornaments.service';

@Component({
  selector: 'kt-loan-application-form',
  templateUrl: './loan-application-form.component.html',
  styleUrls: ['./loan-application-form.component.scss']
})
export class LoanApplicationFormComponent implements OnInit {

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
  masterAndLoanIds: any;
  ornamentType = [];
  finalLoanAmt: any;
  constructor(
    public ref: ChangeDetectorRef,
    public router: Router,
    public loanApplicationFormService: LoanApplicationFormService,
    public toast: ToastrService,
    public rout: ActivatedRoute,
    public ornamentTypeService: OrnamentsService,

  ) {
    this.url = this.router.url.split('/')[3]
    this.id = this.rout.snapshot.params.id
    if (this.id) {
      for (let index = 0; index < this.disabled.length; index++) {
        this.disabled[index] = false;
      }
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
      this.masterAndLoanIds = { loanId: res.data.id, masterLoanId: res.data.masterLoanId }
      this.action = 'edit'
      this.customerDetail = res.data
      // this.totalAmount = res.data.totalEligibleAmt
      if (this.url == "packet-image-upload") {
        if (this.customerDetail.loanPacketDetails.length) {
          this.selected = 7;
        } else {
          this.selected = 6;
        }
        this.disabledForm = true;
      } else if (this.url == "view-loan") {
        this.disabledForm = true;
      } else {
        this.disabledForm = false;
        if (res.data.masterLoan.customerLoanCurrentStage) {
          let stage = res.data.masterLoan.customerLoanCurrentStage
          this.selected = Number(stage) - 1;
        } else {
          this.selected = 5;
        }
      }
    })
  }

  ngOnInit() {

    this.getOrnamentType()
    // setTimeout(() => {

    //   if (this.url == "packet-image-upload") {
    //     if (this.customerDetail.loanPacketDetails.length) {
    //       this.selected = 7;
    //     } else {
    //       this.selected = 6;
    //     }
    //     this.disabledForm = true;
    //   } else if (this.url == "view-loan") {
    //     this.next(0)
    //     this.disabledForm = true;
    //   } else {
    //     this.disabledForm = false;
    //   }
    // }, 1000)
  }

  getOrnamentType() {
    this.ornamentTypeService.getOrnamentType(1, -1, '').pipe(
      map(res => {
        console.log(res);
        this.ornamentType = res.data;
      })
    ).subscribe();
  }

  loan(event) {
    this.masterAndLoanIds = event
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


  total(event) {
    this.totalAmount = event
  }



  next(event) {
    if (event.index != undefined) {
      this.selected = event.index;
    } else {
      this.selected = event;
    }
    if (this.selected < 7) {
      for (let index = 0; index < this.disabled.length; index++) {
        if (this.url != "view-loan" && this.url != 'packet-image-upload') {
          if (this.selected >= index) {
            this.disabled[index] = false
          } else {
            this.disabled[index] = true
          }
        } else {
          this.disabled[index] = false
        }
      }
    }
    this.ref.detectChanges();
  }
}
