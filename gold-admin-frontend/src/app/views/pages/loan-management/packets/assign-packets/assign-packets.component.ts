import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';

@Component({
  selector: 'kt-assign-packets',
  templateUrl: './assign-packets.component.html',
  styleUrls: ['./assign-packets.component.scss']
})
export class AssignPacketsComponent implements OnInit {

  constructor(
    public dialogRef: MatDialogRef<AssignPacketsComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
  ) { }

  ngOnInit() {
  }

  action(event){
    if(event){

    }else if(!event){
      this.dialogRef.close()
    }
  }
}
