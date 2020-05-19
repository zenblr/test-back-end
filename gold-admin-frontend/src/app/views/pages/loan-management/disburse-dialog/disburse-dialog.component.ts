import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';

@Component({
  selector: 'kt-disburse-dialog',
  templateUrl: './disburse-dialog.component.html',
  styleUrls: ['./disburse-dialog.component.scss']
})
export class DisburseDialogComponent implements OnInit {

  disburseForm:FormGroup
  constructor(
    private fb:FormBuilder
  ) { }

  ngOnInit() {
    this.disburseForm = this.fb.group({
      id: [],
      packetUniqueId: ['', [Validators.required]],
      dateTime:['',Validators.required]
    })
  }

get controls(){
  return this.disburseForm.controls
}
action(event){
  if(event){

  }else if(!event){
    
  }
}

}
