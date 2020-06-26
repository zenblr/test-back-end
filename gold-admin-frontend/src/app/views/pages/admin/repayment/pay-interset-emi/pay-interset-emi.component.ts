import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material';
import { EmiLogsDialogComponent } from '../emi-logs-dialog/emi-logs-dialog.component';

@Component({
  selector: 'kt-pay-interset-emi',
  templateUrl: './pay-interset-emi.component.html',
  styleUrls: ['./pay-interset-emi.component.scss']
})
export class PayIntersetEmiComponent implements OnInit {

  constructor(
    public dialog: MatDialog
  ) { }

  ngOnInit() {
  }

  actionChange() {

  }

  viewEmiLogs() {
    const dialogRef = this.dialog.open(EmiLogsDialogComponent, {
      data: {},
      width: '850px'
    })
  }

}
