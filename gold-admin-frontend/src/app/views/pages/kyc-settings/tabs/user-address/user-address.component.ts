import { Component, OnInit, EventEmitter, Output, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { UserAddressService } from '../../../../../core/kyc-settings';
import { ToastrComponent } from '../../../../partials/components';
import { SharedService } from '../../../../../core/shared/services/shared.service';

@Component({
  selector: 'kt-user-address',
  templateUrl: './user-address.component.html',
  styleUrls: ['./user-address.component.scss']
})
export class UserAddressComponent implements OnInit {

  identityForm: FormGroup;
  @Output() next: EventEmitter<any> = new EventEmitter<any>();
  file: any;

  @ViewChild(ToastrComponent, { static: true }) toastr: ToastrComponent
  states = [];
  cities0 = [];
  cities1 = [];
  addressProofs = [];
  identityProofs = [];

  constructor(
    private fb: FormBuilder,
    private userAddressService: UserAddressService,
    private sharedService: SharedService
  ) { }

  ngOnInit() {
    this.initForm();
    this.getStates();
    this.getIdentityType();
    this.getAddressProofType()
  }

  initForm() {
    this.identityForm = this.fb.group({
      customerId: [],
      customerKycId: [],
      identityTypeId: ['', [Validators.required]],
      identityProof: [],
      address: this.fb.array([
        this.fb.group({
          addressType: ['residential'],
          addressProofTypeId: ['', [Validators.required]],
          address: ['', [Validators.required]],
          stateId: ['', [Validators.required]],
          cityId: ['', [Validators.required]],
          pinCode: ['', [Validators.required, Validators.pattern('[1-9][0-9]{5}')]],
          addressProof: []
        }),
        this.fb.group({
          addressType: ['permanent'],
          addressProofTypeId: ['', [Validators.required]],
          address: ['', [Validators.required]],
          stateId: ['', [Validators.required]],
          cityId: ['', [Validators.required]],
          pinCode: ['', [Validators.required, Validators.pattern('[1-9][0-9]{5}')]],
          addressProof: []
        })
      ])
    });

  }

  getIdentityType() {
    this.userAddressService.getIdentityType().subscribe(res => {
      console.log(res);
      this.identityProofs = res;
    }, err => {
      console.log(err);
    })
  }

  getAddressProofType() {
    this.userAddressService.getAddressProofType().subscribe(res => {
      console.log(res);
      this.addressProofs = res;
    }, err => {
      console.log(err);
    })
  }

  getFileInfo(event) {
    this.file = event.target.files[0];
    console.log(this.file);
    // var ext = event.target.files[0].name.split('.');
    // if (ext[ext.length - 1] != 'csv') {
    //   this.toastr.errorToastr('Please upload csv file');
    //   this.identityForm.controls.identityProof.markAsTouched()
    //   return
    // }
    this.identityForm.get('identityProof').patchValue(event.target.files[0].name);
  }

  getStates() {
    this.sharedService.getStates().subscribe(res => {
      this.states = res.message;
    });
  }

  getCities(event, index) {
    console.log(index)
    const stateId = this.addressControls.controls[index]['controls'].stateId.value;
    // console.log(stateId)
    this.sharedService.getCities(stateId).subscribe(res => {
      if (index == 0) {
        this.cities0 = res.message;
      } else {
        this.cities1 = res.message;
      }
    });
  }

  submit() {
    // this.next.emit(true);
    console.log(this.identityForm.value);
  }

  get controls() {
    return this.identityForm.controls;
  }

  get addressControls() {
    return this.identityForm.controls.address as FormArray;

    // console.log(control);
    // return control.at(0) as FormGroup;

  }

}
