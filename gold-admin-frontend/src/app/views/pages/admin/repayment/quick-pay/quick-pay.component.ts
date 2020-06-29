import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material';
import { EmiLogsDialogComponent } from '../emi-logs-dialog/emi-logs-dialog.component';

@Component({
  selector: 'kt-quick-pay',
  templateUrl: './quick-pay.component.html',
  styleUrls: ['./quick-pay.component.scss']
})
export class QuickPayComponent implements OnInit {

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
