import { Component, OnInit, EventEmitter, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UserAddressService } from '../../../../../core/kyc-settings';

@Component({
  selector: 'kt-user-address',
  templateUrl: './user-address.component.html',
  styleUrls: ['./user-address.component.scss']
})
export class UserAddressComponent implements OnInit {

  identityForm: FormGroup;
  @Output() next: EventEmitter<any> = new EventEmitter<any>();

  constructor(private fb: FormBuilder, private userAddressService: UserAddressService) { }

  ngOnInit() {
    this.initForm();
    this.getIdentityType();
  }

  initForm() {
    this.identityForm = this.fb.group({
      identityProof: [],
      proofImage: [],
      resdential: this.fb.group({
        proofType: [],
        address: [],
        stateId: [''],
        cityId: [''],
        pincode: ['', [Validators.required, Validators.pattern('[1-9][0-9]{5}')]],
        proofImage: []
      }),
      permanent: this.fb.group({
        proofType: [],
        address: [],
        stateId: [''],
        cityId: [''],
        pincode: ['', [Validators.required, Validators.pattern('[1-9][0-9]{5}')]],
        proofImage: []
      })
    });
  }

  getIdentityType() {
    this.userAddressService.getIdentityType().subscribe(res => {
      console.log(res);
    }, err => {
      console.log(err);
    })
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

  submit() {
    this.next.emit(true);
  }

}
