import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { UploadOfferService } from '../../../../../../core/upload-data';

@Component({
  selector: 'kt-final-loan-amount',
  templateUrl: './final-loan-amount.component.html',
  styleUrls: ['./final-loan-amount.component.scss']
})
export class FinalLoanAmountComponent implements OnInit {

  loanAmount: number = 0;
  karatArr = [{ value: 18, name: '18 K' }, { value: 19, name: '19 K' }, { value: 20, name: '20 K' }, { value: 21, name: '21 K' }, { value: 22, name: '22 K' }]
  purity = [];
  purityBasedDeduction: number;
  currentLtvAmount: any;

  finalLoanForm: FormGroup;

  constructor(private fb: FormBuilder, private uploadOfferService: UploadOfferService) { }

  ngOnInit() {
    this.initForm();
    this.controls.goldNetWeight.valueChanges.subscribe(res => {
      // if (this.controls.goldNetWeight.touched) {
      if (this.controls.goldGrossWeight.valid && this.controls.goldNetWeight.valid) {
        this.calcGoldDeductionWeight();
      }
    });

    this.uploadOfferService.goldRate$.subscribe(res => {
      this.currentLtvAmount = res;
      this.controls.currentLtvAmount.patchValue(this.currentLtvAmount);
    })
  }

  initForm() {
    this.finalLoanForm = this.fb.group({
      goldGrossWeight: [],
      goldNetWeight: [],
      goldDeductionWeight: [],
      karat: [],
      purity: [],
      finalNetWeight: [],
      ltvAmount: [],
      ltvPercent: [],
      currentLtvAmount: [],
      loanAmount: []
    })
  }

  calcGoldDeductionWeight() {
    const goldDeductionWeight = this.controls.goldGrossWeight.value - this.controls.goldNetWeight.value;
    this.controls.goldDeductionWeight.patchValue(goldDeductionWeight);
    // console.log(goldDeductionWeight)
  }

  selectKarat() {
    const karat = this.controls.karat.value;
    console.log(typeof (karat));
    switch (karat) {
      case '18':
        this.purity = [75, 76, 77, 78, 79];
        this.purityBasedDeduction = 7.5;
        this.controls.purity.patchValue(this.purityBasedDeduction);
        break;
      case '19':
        this.purity = [80, 81, 82, 83, 84];
        this.purityBasedDeduction = 5;
        this.controls.purity.patchValue(this.purityBasedDeduction);
        break;
      case '20':
        this.purity = [85, 86, 87, 88, 89];
        this.purityBasedDeduction = 2;
        this.controls.purity.patchValue(this.purityBasedDeduction);
        break;
      case '21':
        this.purity = [90, 91, 92, 93, 94];
        this.purityBasedDeduction = 1.5;
        this.controls.purity.patchValue(this.purityBasedDeduction);
        break;
      case '22':
        this.purity = [95, 96, 97, 98, 99, 100];
        this.purityBasedDeduction = 1;
        this.controls.purity.patchValue(this.purityBasedDeduction);
        break;
      default:
        break;
    }

  }

  calFinalNetWeight() {
    // Current Net Weight = Net Weight - Purity %
    //                        = 10 - 1 / 100
    //                        = 0.099
    // Current Net Wt = Previous net weight - Current Net Weight
    //   = 10 - 0.99
    // Final Net Weight = 9.90




    // let purity = this.controls.purity.value;
    // purity = (purity / 100);

    // current weight
    let goldNetWeight = +(this.controls.goldNetWeight.value);

    const currentNetWeight = (goldNetWeight - this.purityBasedDeduction) / 100;
    // console.log(currentNetWeight);

    // final weight
    const finalNetWeight = goldNetWeight - currentNetWeight;
    // console.log(finalNetWeight);

    this.controls.finalNetWeight.patchValue(finalNetWeight);

    // current LTV amount
    this.controls.ltvPercent.patchValue(+(this.controls.purity.value));

    let purity = +(this.controls.purity.value);

    const ltvAmount = this.currentLtvAmount * purity / 100;
    // console.log(currentLtvAmount)
    this.controls.ltvAmount.patchValue(ltvAmount);
  }

  calcLoanAmount() {
    // Loan Amount = Final Net Weight *  Ltv
    //   = 9.90 * 1270

    const loanAmount = (+(this.controls.finalNetWeight.value) * +(this.controls.ltvAmount.value));
    // console.log('final: ', loanAmount);
    this.loanAmount = loanAmount;
    this.controls.loanAmount.patchValue(this.loanAmount);
  }

  get controls() {
    return this.finalLoanForm.controls;
  }

  chnageLtvPercent() {
    const ltvPercent = +(this.controls.ltvPercent.value);
    const currentLtvAmount = +(this.controls.currentLtvAmount.value);

    const ltvAmount = currentLtvAmount * ltvPercent / 100;
    console.log(ltvAmount);

    this.controls.ltvAmount.patchValue(ltvAmount);

  }

}
