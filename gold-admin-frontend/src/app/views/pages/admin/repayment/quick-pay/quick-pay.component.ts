import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material';
import { EmiLogsDialogComponent } from '../emi-logs-dialog/emi-logs-dialog.component';
import { QuickPayService } from '../../../../../core/repayment/quick-pay/quick-pay.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'kt-quick-pay',
  templateUrl: './quick-pay.component.html',
  styleUrls: ['./quick-pay.component.scss']
})
export class QuickPayComponent implements OnInit {
  loanDetails: any;

  constructor(
    public dialog: MatDialog,
    private quickPayServie: QuickPayService,
    private rout: ActivatedRoute,
  ) { }

  ngOnInit() {
    this.getInterestInfo(this.rout.snapshot.params.id)
  }

  getInterestInfo(id) {

    this.quickPayServie.interestInfo(id).subscribe(res => {
      this.loanDetails = res.data
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

}
