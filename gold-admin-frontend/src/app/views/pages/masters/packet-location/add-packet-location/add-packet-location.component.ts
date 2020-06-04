import { Component, OnInit, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';

@Component({
  selector: 'kt-add-packet-location',
  templateUrl: './add-packet-location.component.html',
  styleUrls: ['./add-packet-location.component.scss']
})
export class AddPacketLocationComponent implements OnInit {

  packetLocation:FormGroup

  constructor(
    private fb:FormBuilder,
    public dialogRef: MatDialogRef<AddPacketLocationComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
  ) { }

  ngOnInit() {
    this.initForm()
  }

  initForm(){
    this.packetLocation = this.fb.group({
      location:['',Validators.required]
    })
  }

}
