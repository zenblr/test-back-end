import { Component, OnInit, AfterViewInit, Output, EventEmitter, Input } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';

@Component({
  selector: 'kt-kyc-details',
  templateUrl: './kyc-details.component.html',
  styleUrls: ['./kyc-details.component.scss']
})
export class KycDetailsComponent implements OnInit, AfterViewInit {

  kycForm: FormGroup;
  @Output() kycEmit: EventEmitter<any> = new EventEmitter()
  @Input() invalid


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
      aadharNumber: [, [Validators.required, Validators.minLength(12)]],
      permanentAddress: [, Validators.required],
      pincode: [, [Validators.required, Validators.minLength(6)]],
      officeAddress: [, Validators.required]
    })
    this.kycEmit.emit(this.kycForm)
  }

  get controls() {
    return this.kycForm.controls
  }

}
