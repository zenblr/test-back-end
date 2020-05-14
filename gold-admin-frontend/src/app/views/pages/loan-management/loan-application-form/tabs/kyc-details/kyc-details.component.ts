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
      this.setValue()
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
      identityTypeName: [''],
      identityProof: [[]],
      idCardNumber: [''],
      permanentAddProofTypeId: [''], 
      permanentAddProofTypeName: [''],
      permanentAddCardNumber: [],
      permanentAddress: [''],
      permanentAddStateId: [],
      permanentAddCityId: [],
      permanentAddStateName: [],
      permanentAddCityName: [],
      permanentAddPin: [],
      permanentAddProof: [[]],
      residentialAddProofTypeId: [''],
      residentialAddProofTypeName: [''],
      residentialAddCardNumber: [],
      residentialAddress: [''],
      residentialAddStateId: [],
      residentialAddCityId: [],
      residentialAddStateName: [],
      residentialAddCityName: [],
      residentialAddPin: [],
      residentialAddProof: [[]]
    });
    this.kycForm.disable()

  }

  setValue() {
    this.controls.identityProof.patchValue(this.details.customerKycPersonal.identityProof)
    this.controls.idCardNumber.patchValue(this.details.customerKycPersonal.identityProofNumber)
    this.controls.identityTypeName.patchValue(this.details.customerKycPersonal.identityType.name)
    this.controls.identityTypeId.patchValue(this.details.customerKycPersonal.identityType.id)
    // per
    this.controls.permanentAddress.patchValue(this.details.customerKycAddress[0].address)
    this.controls.permanentAddCityId.patchValue(this.details.customerKycAddress[0].city.id)
    this.controls.permanentAddStateId.patchValue(this.details.customerKycAddress[0].state.id)
    this.controls.permanentAddCityName.patchValue(this.details.customerKycAddress[0].city.name)
    this.controls.permanentAddStateName.patchValue(this.details.customerKycAddress[0].state.name)
    this.controls.permanentAddPin.patchValue(this.details.customerKycAddress[0].pinCode)
    this.controls.permanentAddProofTypeId.patchValue(this.details.customerKycAddress[0].addressProofType.id)
    this.controls.permanentAddProofTypeName.patchValue(this.details.customerKycAddress[0].addressProofType.name)
    this.controls.permanentAddCardNumber.patchValue(this.details.customerKycAddress[0].addressProofNumber)
    this.controls.permanentAddProof.patchValue(this.details.customerKycAddress[0].addressProof)
  //  res
    this.controls.residentialAddress.patchValue(this.details.customerKycAddress[1].address)
    this.controls.residentialAddPin.patchValue(this.details.customerKycAddress[1].pinCode)
    this.controls.residentialAddCityId.patchValue(this.details.customerKycAddress[1].city.id)
    this.controls.residentialAddCityName.patchValue(this.details.customerKycAddress[1].city.name)
    this.controls.residentialAddStateId.patchValue(this.details.customerKycAddress[1].state.id)  
    this.controls.residentialAddStateName.patchValue(this.details.customerKycAddress[1].state.name)
    this.controls.residentialAddProofTypeId.patchValue(this.details.customerKycAddress[1].addressProofType.id)
    this.controls.residentialAddProofTypeName.patchValue(this.details.customerKycAddress[1].addressProofType.name)
    this.controls.residentialAddCardNumber.patchValue(this.details.customerKycAddress[1].addressProofNumber)
    this.controls.residentialAddProof.patchValue(this.details.customerKycAddress[1].addressProof)
    this.kycEmit.emit(this.kycForm)
  }
  get controls() {
    return this.kycForm.controls
  }




}
