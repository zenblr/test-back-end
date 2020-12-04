import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';

@Component({
  selector: 'kt-view-packet-dialog',
  templateUrl: './view-packet-dialog.component.html',
  styleUrls: ['./view-packet-dialog.component.scss']
})
export class ViewPacketDialogComponent implements OnInit {

  constructor(
    public dialogRef: MatDialogRef<ViewPacketDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
  ) { }

  ngOnInit() {
  }

  action(event) {
    if (!event)
      this.dialogRef.close()
  }

}
