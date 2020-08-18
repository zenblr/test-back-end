import { Component, OnInit, ChangeDetectorRef, ElementRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { PartPaymentService } from '../../../../../core/repayment/part-payment/services/part-payment.service';
import { FormControl, Validators } from '@angular/forms';
import { map } from 'rxjs/operators';
import { MatDialog } from '@angular/material';
import { PaymentDialogComponent } from '../../../../partials/components/payment-dialog/payment-dialog.component';

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

  constructor(
    private route: ActivatedRoute,
    private partPaymentService: PartPaymentService,
    private dialog: MatDialog,
    private ref: ChangeDetectorRef,
    private ele: ElementRef
  ) { }

  ngOnInit() {
    this.masterLoanId = this.route.snapshot.params.id
    // this.getPreviousPartPaymentInfo(this.masterLoanId)
  }

  getPreviousPartPaymentInfo(id) {
    this.partPaymentService.getPreviousPartPaymentInfo(id).subscribe(res => {
      this.loanDetails = res.data
    })
  }

  partPayment() {
    this.showPartAmountInput = true
  }

  partAmountContinue() {
    console.log(this.partAmount)
    const queryParams = {
      amount: this.partAmount.value,
      masterLoanId: this.masterLoanId
    }
    this.partPaymentService.getPayableAmount(queryParams).pipe(map(res => {
      console.log(res)
      this.payableAmountSummary = res
    })).subscribe()
    this.payableAmountSummary = { test: 'ok' }
    this.scrollToBottom()

  }

  proceed() {
    this.paymentDetails = { tested: 'ok' }
    this.scrollToBottom()
  }

  cancelPayableAmountSummary() {
    this.payableAmountSummary = {}
    this.scrollToBottom()
  }

  choosePaymentMethod() {
    const dialogRef = this.dialog.open(PaymentDialogComponent, {
      data: {
        value: this.paymentValue ? this.paymentValue : { paidAmount: this.partAmount.value }
      },
      width: '500px'
    })

    dialogRef.afterClosed().subscribe(res => {
      if (res) {
        console.log(res)
        this.paymentValue = res
        this.ref.detectChanges()
      }
    })
  }

  submitPaymentConfirmation() { }

  cancelPaymentConfirmation() {
    this.paymentDetails = {}
  }

  scrollToBottom() {
    setTimeout(() => {
      let view = this.ele.nativeElement.querySelector('#container') as HTMLElement
      view.scrollIntoView({ behavior: "smooth", block: "end" })
    }, 500)
  }
}
