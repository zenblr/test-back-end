import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { MatDialog } from '@angular/material';
import { EmiLogsDialogComponent } from '../emi-logs-dialog/emi-logs-dialog.component';
import { QuickPayService } from '../../../../../core/repayment/quick-pay/quick-pay.service';
import { ActivatedRoute } from '@angular/router';
import { PaymentDialogComponent } from '../../../../../views/partials/components/payment-dialog/payment-dialog.component';
import { FormControl, Validators } from '@angular/forms';

@Component({
  selector: 'kt-quick-pay',
  templateUrl: './quick-pay.component.html',
  styleUrls: ['./quick-pay.component.scss']
})
export class QuickPayComponent implements OnInit {
  loanDetails: any;
  masterLoanId: any;
  payableAmount:any;
  paymentValue:any;
  payableAmt = new FormControl('',Validators.required);
  paymentDetails: any;
  currentDate = new Date()
  constructor(
    public dialog: MatDialog,
    private quickPayServie: QuickPayService,
    private rout: ActivatedRoute,
    private ref:ChangeDetectorRef
  ) { }

  ngOnInit() {
    this.masterLoanId= this.rout.snapshot.params.id
    this.getInterestInfo(this.masterLoanId)
  }

  getInterestInfo(id) {

    this.quickPayServie.interestInfo(id).subscribe(res => {
      this.loanDetails = res.data
    })
  }

  getPayableAmount(){
    this.quickPayServie.getPayableAmount(this.masterLoanId).subscribe(res => {
      this.payableAmount = res.data;
      this.ref.detectChanges()
    })
  }

  actionChange() {

  }

  viewEmiLogs() {
    const dialogRef = this.dialog.open(EmiLogsDialogComponent, {
      data: { id: this.loanDetails.id },
      width: '850px'
    })
  }

  payment(){
    if(this.payableAmt.invalid){
      this.payableAmt.markAsTouched()
      return 
    }
    this.quickPayServie.paymentConfirmation(this.masterLoanId,this.payableAmt.value).subscribe(res => {
      this.paymentDetails = res.data.loan;
      this.payableAmt.disable()
      this.ref.detectChanges()
    })
  }

  choosePaymentMethod() {
    const dialogRef = this.dialog.open(PaymentDialogComponent, {
      data: {
        value: this.paymentValue ? this.paymentValue : { paidAmount: this.payableAmt.value }
      },
      width: '500px'
    })

    dialogRef.afterClosed().subscribe(res => {
      if(res){
      console.log(res)
      this.paymentValue = res
      this.ref.detectChanges()
      }
    })
  }

  submit(){
    let data = { 
      masterLoanId :this.masterLoanId,
      payableAmount:this.payableAmt.value,
      paymentDetails:this.paymentValue,
    }
    this.quickPayServie.payment(data).subscribe(res => {
     
      this.ref.detectChanges()
    })
  }
}
