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
  masterLoanId: any;
  payableAmount:any;
  constructor(
    public dialog: MatDialog,
    private quickPayServie: QuickPayService,
    private rout: ActivatedRoute,
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
      this.payableAmount = res.data.payableAmount
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
