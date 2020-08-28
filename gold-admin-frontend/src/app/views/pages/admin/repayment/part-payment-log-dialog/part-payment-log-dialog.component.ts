import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { PartPaymentService } from '../../../../../core/repayment/part-payment/services/part-payment.service';

@Component({
  selector: 'kt-part-payment-log-dialog',
  templateUrl: './part-payment-log-dialog.component.html',
  styleUrls: ['./part-payment-log-dialog.component.scss']
})
export class PartPaymentLogDialogComponent implements OnInit {
  partPaymentHistory: any;

  constructor(
    public dialogRef: MatDialogRef<PartPaymentLogDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private partPaymentService: PartPaymentService
  ) { }

  ngOnInit() {
    this.partPaymentService.getPreviousPartPaymentLogs(this.data.id).subscribe(res => {
      this.partPaymentHistory = res.data
      // let payments = this.partPaymentHistory
      // payments.forEach(element => {
      //   element.transactionSplitUp.forEach(element => {

      //   });[0].payableOutstanding
      // });
    })
  }

  action(event) {
    if (!event) {
      this.dialogRef.close();
    }
  }

}
