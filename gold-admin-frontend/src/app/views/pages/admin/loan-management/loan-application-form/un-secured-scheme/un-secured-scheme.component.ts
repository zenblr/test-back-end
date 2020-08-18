import { Component, OnInit, Inject, ElementRef, ChangeDetectorRef } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
import { LoanApplicationFormService } from '../../../../../../core/loan-management';


@Component({
  selector: 'kt-un-secured-scheme',
  templateUrl: './un-secured-scheme.component.html',
  styleUrls: ['./un-secured-scheme.component.scss'],
})
export class UnSecuredSchemeComponent implements OnInit {
  unsecuredSchemeForm: FormGroup;
  unsecuredSchemes = []
  details: any;
  paymentType: string;
  colJoin: number;
  unSecuredInterestAmount: number;
  seletedScheme = []
  isUnsecuredSchemeChanged: boolean = false;

  constructor(
    public fb: FormBuilder,
    public dialogRef: MatDialogRef<UnSecuredSchemeComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    public loanService: LoanApplicationFormService
  ) { }

  ngOnInit() {
    this.initForm()
    this.unsecuredSchemeForm.patchValue(this.data.unsecuredSchemeForm)
    this.details = this.data.unsecuredSchemeForm
    this.unsecuredSchemes = this.details.unsecuredScheme.schemes
    this.seletedScheme = this.unsecuredSchemes.filter(scheme => { return scheme.id == this.controls.unsecuredSchemeName.value })
    console.log(this.data)
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
    this.isUnsecuredSchemeChanged = true;
    this.seletedScheme = []

    let scheme = this.unsecuredSchemes.filter(res => { return this.controls.unsecuredSchemeName.value == res.id })

    if (scheme && scheme.length > 0) {
      Array.prototype.push.apply(this.seletedScheme, scheme)
    }
    let paymetFrequency = this.seletedScheme[0].schemeInterest.filter(res => { 
      return this.details.paymentType == res.days 
    })
    // this.controls.unsecuredSchemeInterest.patchValue(scheme[0].schemeInterest)
    this.details.paymentType
    this.controls.unsecuredSchemeInterest.patchValue(paymetFrequency[0].interestRate)

    
  }

  calculate() {
    if (this.isUnsecuredSchemeChanged) {
    // this.unSecuredInterestAmount = (this.details.unsecuredSchemeAmount *
    //   (this.controls.unsecuredSchemeInterest.value * 12 / 100)) * this.details.paymentType
    //   / 360
    this.isUnsecuredSchemeChanged = false;
    this.genrateTable()
    }
  }

  genrateTable() {

    this.loanService.unsecuredTableGenration(this.unsecuredSchemeForm.value, this.details.paymentType, this.details.tenure).subscribe(
      res=>{
        this.details.calculation = res.data.interestTable
      }
    )
  
  }

  onSubmit() {
    if (!this.isUnsecuredSchemeChanged)
      this.dialogRef.close(this.seletedScheme)
  }
}
