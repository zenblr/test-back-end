import { Component, OnInit, Inject } from '@angular/core';
import { QuickPayService } from '../../../../../core/repayment/quick-pay/quick-pay.service';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';

@Component({
  selector: 'kt-quick-pay-history',
  templateUrl: './quick-pay-history.component.html',
  styleUrls: ['./quick-pay-history.component.scss']
})
export class QuickPayHistoryComponent implements OnInit {

  details: any;

  constructor(
    private quickPayService: QuickPayService,
    public dialogRef: MatDialogRef<QuickPayHistoryComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
  ) { }

  ngOnInit() {
    this.quickPayService.getTranscationHistory(this.data.id).subscribe(res => {
      this.details = res.data
    })

  }

}
