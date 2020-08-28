import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';

@Component({
  selector: 'kt-part-payment-log-dialog',
  templateUrl: './part-payment-log-dialog.component.html',
  styleUrls: ['./part-payment-log-dialog.component.scss']
})
export class PartPaymentLogDialogComponent implements OnInit {

  constructor(
    public dialogRef: MatDialogRef<PartPaymentLogDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
  ) { }

  ngOnInit() {

  }

  action(event) {
    if (!event) {
      this.dialogRef.close();
    }
  }

}
