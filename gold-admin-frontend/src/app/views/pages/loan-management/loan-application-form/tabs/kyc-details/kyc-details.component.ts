import { Component, OnInit, AfterViewInit, Output, EventEmitter, Input } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormArray } from '@angular/forms';

@Component({
  selector: 'kt-kyc-details',
  templateUrl: './kyc-details.component.html',
  styleUrls: ['./kyc-details.component.scss']
})
export class KycDetailsComponent implements OnInit, AfterViewInit {

  kycForm: FormGroup;
  @Output() kycEmit: EventEmitter<any> = new EventEmitter()
  @Input() disable
  @Input() details



  constructor(
    public fb: FormBuilder
  ) {
    this.initForm()
  }

  ngOnInit() {

  }

  ngOnChanges() {
    if (this.details) {
      // this.setValue()
    }
    if (this.disable) {
      this.kycForm.disable()
    }
  }

  ngAfterViewInit() {
    this.kycForm.valueChanges.subscribe(() => {
      this.kycEmit.emit(this.kycForm)
    })
  }

  initForm() {
    this.kycForm = this.fb.group({
      identityTypeId: [''],
      identityProof: [[]],
      identityProofNumber: [''],
      addressType: ['permanent'],
      addressProofTypeId: [''],
      addressProofNumber: [],
      address: [''],
      stateId: [],
      cityId: [],
      pinCode: [],
      addressProof: [[]]
    });
    this.kycForm.disable()

  }

  // setValue() {
  //   this.controls.identityProof.patchValue(this.details.customerKycPersonal.identityProof)
  //   this.controls.identityProofNumber.patchValue(this.details.customerKycPersonal.identityProofNumber)
  //   this.controls.identityTypeId.patchValue(this.details.customerKycPersonal.identityType.name)
  //   const add1 = this.addressControls.at(0) as FormGroup
  //   const add2 = this.addressControls.at(1) as FormGroup
  //   add1.patchValue(this.details.customerKycAddress[0])
  //   add1.controls.cityId.patchValue(this.details.customerKycAddress[0].city.name)
  //   add1.controls.stateId.patchValue(this.details.customerKycAddress[0].state.name)
  //   add1.controls.addressProofTypeId.patchValue(this.details.customerKycAddress[0].addressProofType.name)
  //   add2.patchValue(this.details.customerKycAddress[1])
  //   add2.controls.cityId.patchValue(this.details.customerKycAddress[1].city.name)
  //   add2.controls.stateId.patchValue(this.details.customerKycAddress[1].state.name)
  //   add2.controls.addressProofTypeId.patchValue(this.details.customerKycAddress[1].addressProofType.name)
  //   this.kycEmit.emit(this.kycForm)
  // }
  get controls() {
    return this.kycForm.controls
  }


  get addressControls() {
    return (<FormArray>this.kycForm.controls.address as FormArray);

    // console.log(control);
    // return control.at(0) as FormGroup;

  }

}
