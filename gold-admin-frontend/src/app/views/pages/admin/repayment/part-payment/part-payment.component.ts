import { Component, OnInit, ChangeDetectorRef, ElementRef, NgZone } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { PartPaymentService } from '../../../../../core/repayment/part-payment/services/part-payment.service';
import { FormControl, Validators } from '@angular/forms';
import { map } from 'rxjs/operators';
import { MatDialog } from '@angular/material';
import { PaymentDialogComponent } from '../../../../partials/components/payment-dialog/payment-dialog.component';
import { Router } from '@angular/router';
import { PartPaymentLogDialogComponent } from '../../../../partials/components/part-payment-log-dialog/part-payment-log-dialog.component';
import { ToastrService } from 'ngx-toastr';
import { RazorpayPaymentService } from '../../../../../core/shared/services/razorpay-payment.service';
import { SharedService } from '../../../../../core/shared/services/shared.service';
import { QuickPayService } from '../../../../../core/repayment/quick-pay/quick-pay.service';

@Component({
  selector: 'kt-part-payment',
  templateUrl: './part-payment.component.html',
  styleUrls: ['./part-payment.component.scss']
})
export class PartPaymentComponent implements OnInit {
  loanDetails: any;
  masterLoanId: any;
  showPartAmountInput: boolean
  partAmount = new FormControl(null, Validators.required);
  payableAmountSummary: any;
  paymentDetails: any;
  paymentValue: any;
  payableAmount: any;
  sum: number;

  constructor(
    private route: ActivatedRoute,
    private partPaymentService: PartPaymentService,
    private dialog: MatDialog,
    private ref: ChangeDetectorRef,
    private ele: ElementRef,
    private router: Router,
    private toastr: ToastrService,
    private razorpayPaymentService: RazorpayPaymentService,
    private zone: NgZone,
    private quickPayServie: QuickPayService,
    private sharedService: SharedService
  ) { }

  ngOnInit() {
    this.masterLoanId = this.route.snapshot.params.id
    this.getPreviousPartPaymentInfo(this.masterLoanId)
    this.partPayment()
    this.getPayableAmount()
  }

  getPreviousPartPaymentInfo(id) {
    this.partPaymentService.getPreviousPartPaymentInfo(id).subscribe(res => {
      this.loanDetails = res.data
      this.ref.detectChanges();
    })
  }

  getPayableAmount() {
    this.quickPayServie.getPayableAmount(this.masterLoanId).subscribe(res => {
      this.payableAmount = res.data;
      this.sum = 0;
      this.sum = Number((Number(this.payableAmount.securedPenalInterest) + Number(this.payableAmount.unsecuredPenalInterest) + Number(this.payableAmount.unsecuredTotalInterest) + Number(this.payableAmount.securedTotalInterest)).toFixed(2))
      this.partAmount.patchValue(this.sum)
      this.ref.detectChanges()
    })
  }

  partPayment() {
    this.showPartAmountInput = true
  }

  partAmountContinue() {
    // console.log(this.partAmount)
    if (this.partAmount.invalid || this.partAmount.value <= 0) {
      if (this.partAmount.value <= 0) {
        this.partAmount.setErrors({ valueZero: true })
      }
      this.partAmount.markAllAsTouched()
      return
    }
    const data = {
      paidAmount: this.partAmount.value,
      masterLoanId: this.masterLoanId
    }
    this.partPaymentService.getPayableAmount(data).pipe(map(res => {
      this.payableAmountSummary = res.data
      // console.log(this.payableAmountSummary)
      this.ref.detectChanges()
      this.scrollToBottom()
    })).subscribe()

  }

  proceed() {
    this.partPaymentService.getPaymentConfirm(this.masterLoanId, Number(this.partAmount.value)).pipe(map(res => {
      // console.log(res)
      this.paymentDetails = res.data
      this.scrollToBottom()
      this.ref.detectChanges()
    })).subscribe()
  }

  cancelPayableAmountSummary() {
    this.payableAmountSummary = null
    this.paymentValue = {}
    this.scrollToBottom()
  }

  choosePaymentMethod() {
    if (this.paymentValue && this.paymentValue.paidAmount) {
      this.paymentValue.paidAmount = this.partAmount.value
    }
    const dialogRef = this.dialog.open(PaymentDialogComponent, {
      data: {
        value: this.paymentValue ? this.paymentValue : { paidAmount: this.partAmount.value },
        date: this.loanDetails.loan.loanStartDate
      },
      width: '500px'
    })

    dialogRef.afterClosed().subscribe(res => {
      if (res) {
        this.paymentValue = res;
        this.ref.detectChanges()
      }
    })
  }


  paymentData(event) {
    this.paymentValue = event
  }

  submitPaymentConfirmation() {
    if (!(this.paymentValue && this.paymentValue.paymentType)) {
      return this.toastr.error('Please select a payment method')
    }

    if (this.paymentValue.paymentType == 'upi' || this.paymentValue.paymentType == 'netbanking' || this.paymentValue.paymentType == 'wallet' || this.paymentValue.paymentType == 'card') {
      let data = {
        masterLoanId: this.masterLoanId,
        amount: this.partAmount.value,
        paymentDetails: this.paymentValue,
        paymentType: this.paymentValue.paymentType,
        paymentFor: 'partPayment'
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
        },
        err => {
          if (err.error.message)
            this.toastr.error(err.error.message)
          throw err
        }
      )
      return
    }
    let data = {
      masterLoanId: this.masterLoanId,
      paidAmount: Number(this.partAmount.value),
      paymentDetails: this.paymentValue,
    }
    this.partPaymentService.confirmPayment(data).subscribe(res => {
      if (res) {
        this.toastr.success('Payment done Successfully')
        this.router.navigate(['/admin/loan-management/all-loan'])
      }
    });
  }

  razorPayResponsehandler(response) {
    console.log(response)
    this.zone.run(() => {
      let data = {
        masterLoanId: this.masterLoanId,
        paidAmount: Number(this.partAmount.value),
        paymentDetails: this.paymentValue,
        transactionDetails: response
      }
      this.partPaymentService.confirmPayment(data).subscribe(res => {
        this.toastr.success('Payment done Successfully')
        this.router.navigate(['/admin/loan-management/all-loan'])
        this.ref.detectChanges()
      })
    })
  }

  cancelPaymentConfirmation() {
    this.paymentDetails = null
    this.ref.detectChanges()
  }

  scrollToBottom() {
    setTimeout(() => {
      let view = this.ele.nativeElement.querySelector('#container') as HTMLElement
      view.scrollIntoView({ behavior: "smooth", block: "end" })
    }, 500)
  }

  viewEmiLogs() {
    const dialogRef = this.dialog.open(PartPaymentLogDialogComponent, {
      data: { id: this.masterLoanId },
      width: 'auto'
    })
  }
}
