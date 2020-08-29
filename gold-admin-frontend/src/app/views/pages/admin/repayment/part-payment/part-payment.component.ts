import { Component, OnInit, ChangeDetectorRef, ElementRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { PartPaymentService } from '../../../../../core/repayment/part-payment/services/part-payment.service';
import { FormControl, Validators } from '@angular/forms';
import { map } from 'rxjs/operators';
import { MatDialog } from '@angular/material';
import { PaymentDialogComponent } from '../../../../partials/components/payment-dialog/payment-dialog.component';
import { Router } from '@angular/router';
import { PartPaymentLogDialogComponent } from '../part-payment-log-dialog/part-payment-log-dialog.component';
import { ToastrService } from 'ngx-toastr';

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
    private ele: ElementRef,
    private router: Router,
    private toastr: ToastrService
  ) { }

  ngOnInit() {
    this.masterLoanId = this.route.snapshot.params.id
    this.getPreviousPartPaymentInfo(this.masterLoanId)
  }

  getPreviousPartPaymentInfo(id) {
    this.partPaymentService.getPreviousPartPaymentInfo(id).subscribe(res => {
      this.loanDetails = res.data

      this.ref.detectChanges();
    })
  }

  partPayment() {
    this.showPartAmountInput = true
  }

  partAmountContinue() {
    // console.log(this.partAmount)
    if (this.partAmount.invalid) return this.partAmount.markAsTouched()
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
    })).subscribe()
  }

  cancelPayableAmountSummary() {
    this.payableAmountSummary = null
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
        this.paymentValue = res
        this.ref.detectChanges()
      }
    })
  }

  submitPaymentConfirmation() {
    if (!(this.paymentValue && this.paymentValue.paymentType)) {
      return this.toastr.error('Please select a payment method')
    }

    this.partPaymentService.confirmPayment(this.masterLoanId, Number(this.partAmount.value), this.paymentValue).subscribe(res => {
      if (res) {
        this.toastr.success('Payment done Successfully')
        this.router.navigate(['/admin/loan-management/all-loan'])
      }
    });
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
