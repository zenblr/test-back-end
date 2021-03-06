import { Component, OnInit, ChangeDetectorRef, ElementRef, NgZone } from '@angular/core';
import { MatDialog } from '@angular/material';
import { EmiLogsDialogComponent } from '../../../../partials/components/emi-logs-dialog/emi-logs-dialog.component';
import { QuickPayService } from '../../../../../core/repayment/quick-pay/quick-pay.service';
import { ActivatedRoute, Router } from '@angular/router';
import { PaymentDialogComponent } from '../../../../../views/partials/components/payment-dialog/payment-dialog.component';
import { FormControl, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { RazorpayPaymentService } from '../../../../../core/shared/services/razorpay-payment.service';
import { SharedService } from '../../../../../core/shared/services/shared.service';
import { QuickPayHistoryComponent } from '../quick-pay-history/quick-pay-history.component';

@Component({
  selector: 'kt-quick-pay',
  templateUrl: './quick-pay.component.html',
  styleUrls: ['./quick-pay.component.scss']
})
export class QuickPayComponent implements OnInit {
  loanDetails: any;
  masterLoanId: any;
  payableAmount: any;
  paymentValue: any;
  payableAmt = new FormControl('', Validators.required);
  paymentDetails: any;
  currentDate = new Date()
  sum: number;
  constructor(
    public dialog: MatDialog,
    private quickPayServie: QuickPayService,
    private rout: ActivatedRoute,
    private ref: ChangeDetectorRef,
    private toastr: ToastrService,
    private router: Router,
    private ele: ElementRef,
    private razorpayPaymentService: RazorpayPaymentService,
    private zone: NgZone,
    private sharedService: SharedService
  ) { }

  ngOnInit() {
    this.masterLoanId = this.rout.snapshot.params.id
    this.getInterestInfo(this.masterLoanId)
    this.getPayableAmount()
  }

  getInterestInfo(id) {

    this.quickPayServie.interestInfo(id).subscribe(res => {
      this.loanDetails = res.data
    })
  }

  getPayableAmount() {
    this.quickPayServie.getPayableAmount(this.masterLoanId).subscribe(res => {
      this.payableAmount = res.data;
      this.sum = 0;
      this.sum = Number((Number(this.payableAmount.securedPenalInterest) + Number(this.payableAmount.unsecuredPenalInterest) + Number(this.payableAmount.unsecuredTotalInterest) + Number(this.payableAmount.securedTotalInterest)).toFixed(2))
      this.payableAmt.patchValue(this.sum)
      this.ref.detectChanges()
    })
  }

  actionChange() {

  }

  checkPayableAmount() {

    this.payableAmt.setErrors({ value: true })

  }

  transcationHistory() {
    const dialogRef = this.dialog.open(QuickPayHistoryComponent, {
      data: { id: this.masterLoanId },
      width: '850px'
    })
  }

  viewEmiLogs() {
    const dialogRef = this.dialog.open(EmiLogsDialogComponent, {
      data: { id: this.loanDetails.id },
      width: '850px'
    })
  }

  payment() {
    if (this.payableAmt.invalid || this.payableAmt.value < 1) {
      if (this.payableAmt.value < 1) {
        this.payableAmt.setErrors({ valueZero: true })
      }
      this.payableAmt.markAllAsTouched()
      return
    }
    this.quickPayServie.paymentConfirmation(this.masterLoanId, this.payableAmt.value).subscribe(res => {
      this.paymentDetails = res.data.loan;
      this.payableAmt.disable()
      this.ref.detectChanges()
      this.scrollToBottom()
    }, err => {
      if (err.error.message) {
        this.checkPayableAmount()
      }
    })
  }

  choosePaymentMethod() {
    if (this.paymentValue && this.paymentValue.paidAmount) {
      this.paymentValue.paidAmount = this.payableAmt.value
    }
    const dialogRef = this.dialog.open(PaymentDialogComponent, {
      data: {
        value: this.paymentValue ? this.paymentValue : { paidAmount: this.payableAmt.value },
        date: this.loanDetails.loanStartDate
      },
      width: '500px'
    })

    dialogRef.afterClosed().subscribe(res => {
      if (res) {
        // console.log(res)
        this.paymentValue = res
        this.ref.detectChanges()
      }
    })
  }

  paymentData(event) {
    this.paymentValue = event
  }
  submit() {
    if (!(this.paymentValue && this.paymentValue.paymentType)) {
      return this.toastr.error('Please select a payment method')
    }

    if (this.paymentValue.paymentType == 'upi' || this.paymentValue.paymentType == 'netbanking' || this.paymentValue.paymentType == 'wallet' || this.paymentValue.paymentType == 'card') {
      let data ={
        masterLoanId: this.masterLoanId,
      amount: this.payableAmt.value,
      paymentDetails: this.paymentValue,
      paymentType: this.paymentValue.paymentType,
      paymentFor: 'quickPay'
      }
      this.sharedService.paymentGateWay(data).subscribe(
        res => {
          this.razorpayPaymentService.razorpayOptions.key = res.razerPayConfig;
          this.razorpayPaymentService.razorpayOptions.amount = res.razorPayOrder.amount;
          this.razorpayPaymentService.razorpayOptions.order_id = res.razorPayOrder.id;
          this.razorpayPaymentService.razorpayOptions.paymentMode = res.paymentMode;
          this.razorpayPaymentService.razorpayOptions.description = "Loan payment";
          this.razorpayPaymentService.razorpayOptions.prefill.contact = '9892545454';
          this.razorpayPaymentService.razorpayOptions.prefill.email = 'info@augmont.in';
          this.razorpayPaymentService.razorpayOptions.handler = this.razorPayResponsehandler.bind(this);
          this.razorpayPaymentService.razorpayOptions.prefill.method = this.paymentValue.paymentType;
          this.razorpayPaymentService.initPay(this.razorpayPaymentService.razorpayOptions);
        }
      )
      return
    }

    let data = {
      masterLoanId: this.masterLoanId,
      payableAmount: this.payableAmt.value,
      paymentDetails: this.paymentValue,
    }
    this.quickPayServie.payment(data).subscribe(res => {
      this.toastr.success('Payment done Successfully')
      this.router.navigate(['/admin/loan-management/all-loan'])
      this.ref.detectChanges()
    })
  }

  razorPayResponsehandler(response) {
    console.log(response)
    this.zone.run(() => {
      let data = {
        masterLoanId: this.masterLoanId,
        payableAmount: this.payableAmt.value,
        paymentDetails: this.paymentValue,
        transactionDetails: response
      }
      this.quickPayServie.payment(data).subscribe(res => {
        this.toastr.success('Payment done Successfully')
        this.router.navigate(['/admin/loan-management/all-loan'])
        this.ref.detectChanges()
      })
    })
  }

  scrollToBottom() {
    setTimeout(() => {
      let view = this.ele.nativeElement.querySelector('#container') as HTMLElement
      view.scrollIntoView({ behavior: "smooth", block: "end" })
    }, 500)
  }
}
