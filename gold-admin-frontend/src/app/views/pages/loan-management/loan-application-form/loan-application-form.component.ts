import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';

@Component({
  selector: 'kt-loan-application-form',
  templateUrl: './loan-application-form.component.html',
  styleUrls: ['./loan-application-form.component.scss']
})
export class LoanApplicationFormComponent implements OnInit {

  basicInvalid: boolean = false;
  kycInvalid: boolean = false;
  nomineeInvalid: boolean = false;
  totalAmount: number = 0;
  basic: any;
  kyc: any;
  nominee: any;
  selected: number;
  bankForm: FormGroup;
  constructor(
    public ref: ChangeDetectorRef,
    public fb: FormBuilder,
  ) { }

  ngOnInit() {
    this.initForm()
  }

  initForm() {
    this.bankForm = this.fb.group({
      name: [, [Validators.required, Validators.pattern('^[a-zA-Z ]*$')]],
      accountNumber: [, Validators.required],
      ifscCode: [, [
        Validators.required,
        Validators.pattern('[A-Za-z]{4}[a-zA-Z0-9]{7}')]]
    })
  }

  get controls() {
    if (this.bankForm)
      return this.bankForm.controls
  }

  basicForm(event) {
    this.basic = event
  }

  kycEmit(event) {
    this.kyc = event
  }

  nomineeEmit(event) {
    this.nominee = event
  }

  cancel() {
    this.ngOnInit()
  }

  checkForFormValidation() {
    if (this.basic)
      if (this.basic.invalid) {
        this.selected = 0;
        this.basicInvalid = true;
        return
      }

    if (this.kyc)
      if (this.kyc.invalid) {
        this.selected = 1;
        this.kycInvalid = true;
        return
      }

    if (this.nominee)
      if (this.nominee.invalid) {
        this.selected = 2;
        this.nominee = true;
        return
      }

    if (this.bankForm.invalid) {
      this.bankForm.markAllAsTouched()
    }
  }

  apply() {
    this.checkForFormValidation()
  }
}
