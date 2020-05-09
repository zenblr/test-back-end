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
  @Input() invalid
  @Input() disable;



  constructor(
    public fb: FormBuilder
  ) { }

  ngOnInit() {
    this.initForm()
  }

  ngOnChanges() {
    if (this.invalid) {
      this.kycForm.markAllAsTouched()
      this.invalid = false
    }
  }

  ngAfterViewInit() {
    this.kycForm.valueChanges.subscribe(() => {
      this.kycEmit.emit(this.kycForm)
    })
  }

  initForm() {
    this.kycForm = this.fb.group({
        customerId: [],
        customerKycId: [],
        identityTypeId: [''],
        identityProof: [''],
        identityProofNumber: [''],
        address: this.fb.array([
          this.fb.group({
            addressType: ['permanent'],
            addressProofTypeId: [''],
            addressProofNumber: [],
            address: [''],
            stateId: [],
            cityId: [],
            pinCode: [],
            addressProof: ['']
          }),
          this.fb.group({
            addressType: ['residential'],
            addressProofTypeId: [''],
            addressProofNumber: [],
            address: [''],
            stateId: [''],
            cityId: [''],
            pinCode: [''],
            addressProof: ['']
          })
        ])
      });
    this.kycEmit.emit(this.kycForm)
  }

  get controls() {
    return this.kycForm.controls
  }
 

  get addressControls() {
    return (<FormArray>this.kycForm.controls.address as FormArray);

    // console.log(control);
    // return control.at(0) as FormGroup;

  }

}
