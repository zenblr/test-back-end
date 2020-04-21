import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';

@Component({
  selector: 'kt-user-address',
  templateUrl: './user-address.component.html',
  styleUrls: ['./user-address.component.scss']
})
export class UserAddressComponent implements OnInit {

  identityForm: FormGroup;
  constructor(private fb: FormBuilder) { }

  ngOnInit() {
    this.initForm();
  }

  initForm() {
    // this.identityForm = this.fb.group({
    //   proofType: []
    // });
  }

  getFileInfo(event) {
    // this.file = event.target.files[0];
    // var ext = event.target.files[0].name.split('.');
    // if(ext[ext.length - 1] != 'csv' ){
    //   this._toastr.error('Please upload csv file');
    //   this.csvForm.controls.csv.markAsTouched()
    //   return
    // }
    // this.csvForm.get('csv').patchValue(event.target.files[0].name);

  }

}
