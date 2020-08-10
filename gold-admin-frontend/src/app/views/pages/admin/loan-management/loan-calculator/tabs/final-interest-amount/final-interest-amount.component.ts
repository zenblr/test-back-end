import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PartnerService } from '../../../../../../../core/user-management/partner/services/partner.service';
import { UploadOfferService } from '../../../../../../../core/upload-data';


@Component({
  selector: 'kt-final-interest-amount',
  templateUrl: './final-interest-amount.component.html',
  styleUrls: ['./final-interest-amount.component.scss'],
})
export class FinalInterestAmountComponent implements OnInit {

  currentDate = new Date()
  colJoin: number;
  intrestAmount: any = 0;
  dateOfPayment: any[] = []
  partnerList: any[] = [];
  schemesList: any = [];
  tenure = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
  repayType = [
    { name: "30 days", value: 30 },
    { name: "60 days", value: 60 },
    { name: "90 days", value: 90 },
    { name: "120 days", value: 120 },
    { name: "150 days", value: 150 },
    { name: "180 days", value: 180 }
  ]
  selectedScheme: any = []
  finalInterestForm: FormGroup;
  @ViewChild('print', { static: false }) print: ElementRef
  goldRate: any;
  colJoin1: any;

  constructor(
    private fb: FormBuilder,
    private partnerService: PartnerService,
    public eleRef: ElementRef,
    private uploadOfferService: UploadOfferService
  ) { }

  ngOnInit() {
    this.initForm();
    // this.uploadOfferService.goldRate$.subscribe(res => {
    //   this.finalInterestForm.controls.currentLtvAmount.patchValue(res * 0.75);
    // })
  }




  initForm() {
    this.finalInterestForm = this.fb.group({
      finalLoanAmount: [, [Validators.required, Validators.pattern('^\\s*(?=.*[1-9])\\d*(?:\\.\\d{1,2})?\\s*$')]],
      tenure: [, [Validators.required]],
      loanStartDate: [this.currentDate, [Validators.required]],
      loanEndDate: [, [Validators.required]],
      paymentFrequency: [, [Validators.required]],
      intresetAmt: [],
      interestRate: [, [Validators.required, Validators.pattern('(^100(\\.0{1,2})?$)|(^([1-9]([0-9])?|0)(\\.[0-9]{1,2})?$)')]],
      // processingCharge: [],
      // processingChargeFixed: [, [Validators.pattern('^\\s*(?=.*[1-9])\\d*(?:\\.\\d{1,2})?\\s*$')]],
      // processingChargePercent: [, [Validators.pattern('(^100(\\.0{1,2})?$)|(^([1-9]([0-9])?|0)(\\.[0-9]{1,2})?$)')]]
    })

  }


  setEndDate() {
    this.dateOfPayment = []
    if (this.controls.loanStartDate.valid && this.controls.tenure.valid) {
      let startDate = this.controls.loanStartDate.value;
      let date = new Date(startDate)
      this.controls.loanEndDate.patchValue(new Date(date.setDate(startDate.getDate() + (Number(this.controls.tenure.value)) * 30)))
      console.log(this.controls.loanEndDate.value)
    } else {
      this.controls.loanStartDate.markAsTouched()
    }

    this.getIntrest();
  }





  calcInterestAmount() {
    if (this.finalInterestForm.invalid) {
      this.finalInterestForm.markAllAsTouched();
      return;
    }
    let intrest = (this.controls.finalLoanAmount.value *
      (this.controls.interestRate.value * 12 / 100)) * this.controls.paymentFrequency.value
      / 360
    console.log(intrest)
    // var multiplier;
    // if (this.colJoin == null) {
    //   multiplier = 1
    // } else {
    //   multiplier = this.colJoin
    // }
    this.intrestAmount = (intrest).toFixed(2);
    this.controls.intresetAmt.patchValue(this.intrestAmount)
    // this.CheckProcessingCharge()
    this.generateTable()
  }

  CheckProcessingCharge() {
    let processingChargePercent = (this.controls.finalLoanAmount.value * this.controls.processingChargePercent.value) / 100
    if (processingChargePercent > parseFloat(this.controls.processingChargeFixed.value)) {
      this.controls.processingCharge.patchValue(processingChargePercent)
    } else {
      this.controls.processingCharge.patchValue(this.controls.processingChargeFixed.value)

    }
  }

  generateTable() {
    console.log(this.colJoin, this.colJoin % Number(this.controls.tenure.value) == 0)
    this.dateOfPayment = []
    let length = Number(this.controls.tenure.value)
    for (let index = 0; index < length; index++) {
      let startDate = this.controls.loanStartDate.value;
      let date = new Date(startDate)
      var data = { key: new Date(date.setDate(date.getDate() + (30 * index))) }
      this.dateOfPayment.push((data))
    }
    console.log(this.dateOfPayment)
  }

  getIntrest() {
    if (this.controls.finalLoanAmount.valid) {
      this.dateOfPayment = [];
      switch (this.controls.paymentFrequency.value) {
        case "30":
          // this.controls.interestRate.patchValue(this.selectedScheme[0].interestRateThirtyDaysMonthly)
          this.colJoin = null
          break;
        case "90":
          // this.controls.interestRate.patchValue(this.selectedScheme[0].interestRateNinetyDaysMonthly)
          this.colJoin = 3

          break;
        case "180":
          // this.controls.interestRate.patchValue(this.selectedScheme[0].interestRateOneHundredEightyDaysMonthly)
          this.colJoin = 6

          break;
      }
    }
  }

  get controls() {
    return this.finalInterestForm.controls;
  }


  printNow() {
    // const printTable =document.getElementById("print").innerHTML;
    // // // window.print(printTable)
    // var a = window.open('', '', 'height=500, width=500'); 
    // a.document.write(printTable)
    // a.print()
    // console.log(printTable)
  }

}
