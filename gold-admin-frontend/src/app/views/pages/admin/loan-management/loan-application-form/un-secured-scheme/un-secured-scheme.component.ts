import { Component, OnInit, Inject } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';

@Component({
  selector: 'kt-un-secured-scheme',
  templateUrl: './un-secured-scheme.component.html',
  styleUrls: ['./un-secured-scheme.component.scss']
})
export class UnSecuredSchemeComponent implements OnInit {
  unsecuredSchemeForm: FormGroup;
  unsecuredSchemes = []
  details: any;
  paymentType: string;
  colJoin: number;
  unSecuredInterestAmount: number;
  seletedScheme = []

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<UnSecuredSchemeComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
  ) { }

  ngOnInit() {
    this.initForm()
    this.unsecuredSchemeForm.patchValue(this.data.unsecuredSchemeForm)
    this.details = this.data.unsecuredSchemeForm
    this.unsecuredSchemes = this.details.unsecuredScheme.schemes
    console.log(this.details)
  }

  initForm() {
    this.unsecuredSchemeForm = this.fb.group({
      unsecuredSchemeName: [''],
      unsecuredSchemeAmount: [''],
      unsecuredSchemeInterest: [''],
    });
  }

  get controls() {
    return this.unsecuredSchemeForm.controls;
  }

  closeModal() {
    this.dialogRef.close();
  }

  action(event) {
    if (event) {
      this.onSubmit();
    } else if (!event) {
      this.closeModal();
    }
  }

  unsecuredSchemeChange() {
    this.seletedScheme = []
    let scheme = this.unsecuredSchemes.filter(res => { return this.controls.unsecuredSchemeName.value == res.id })
    if(scheme && scheme.length > 0){
      Array.prototype.push.apply(this.seletedScheme,scheme)
    }
    switch (this.details.paymentType) {
      case "30":
        if (scheme.length > 0)
          this.controls.unsecuredSchemeInterest.patchValue(scheme[0].interestRateThirtyDaysMonthly)

        this.paymentType = "Month"
        this.colJoin = 1

        break;
      case "90":
        if (scheme.length > 0)
          this.controls.unsecuredSchemeInterest.patchValue(scheme[0].interestRateNinetyDaysMonthly)

        this.paymentType = "Quater"
        this.colJoin = 3

        break;
      case "180":
        if (scheme.length > 0)
          this.controls.unsecuredSchemeInterest.patchValue(scheme[0].interestRateOneHundredEightyDaysMonthly)

        this.paymentType = "Half Yearly"
        this.colJoin = 6

        break;
    }
  }

  calculate() {
    this.unSecuredInterestAmount = (this.details.unsecuredSchemeAmount *
      (this.controls.unsecuredSchemeInterest.value * 12 / 100)) * this.details.paymentType
      / 360
  }

  onSubmit() {
    this.dialogRef.close(this.seletedScheme)
  }
}
