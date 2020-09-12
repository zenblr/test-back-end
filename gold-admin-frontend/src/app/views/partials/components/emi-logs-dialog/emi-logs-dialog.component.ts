import { Component, OnInit, Inject } from '@angular/core';
import { QuickPayService } from '../../../../core/repayment/quick-pay/quick-pay.service';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';

@Component({
  selector: 'kt-emi-logs-dialog',
  templateUrl: './emi-logs-dialog.component.html',
  styleUrls: ['./emi-logs-dialog.component.scss']
})
export class EmiLogsDialogComponent implements OnInit {
  emiDetails: any;

  constructor(
    private quickPayService: QuickPayService,
    public dialogRef: MatDialogRef<EmiLogsDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
  ) { }

  ngOnInit() {
    this.quickPayService.emiInfo(this.data.id).subscribe(res => {
      this.emiDetails = res.data
    })
  }

  action(event) {
    if (!event) {
      this.dialogRef.close();
    }
  }
}
