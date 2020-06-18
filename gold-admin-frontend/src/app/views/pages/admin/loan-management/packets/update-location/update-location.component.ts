import { Component, OnInit, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';

@Component({
  selector: 'kt-update-location',
  templateUrl: './update-location.component.html',
  styleUrls: ['./update-location.component.scss']
})
export class UpdateLocationComponent implements OnInit {

  locationForm:FormGroup
  constructor(
    public dialogRef: MatDialogRef<UpdateLocationComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private fb: FormBuilder,
    private toastr: ToastrService,

  ) { }

  ngOnInit() {
    this.locationForm = this.fb.group({
      location:['',Validators.required]
    })
  }

  action(event){
    if(event){

    }else if(!event){
      this.dialogRef.close()
    }
  }
}
