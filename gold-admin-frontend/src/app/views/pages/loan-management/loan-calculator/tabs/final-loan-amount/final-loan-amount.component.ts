import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';

@Component({
  selector: 'kt-final-loan-amount',
  templateUrl: './final-loan-amount.component.html',
  styleUrls: ['./final-loan-amount.component.scss']
})
export class FinalLoanAmountComponent implements OnInit {

  loanAmount: number = 0;
  karatArr = [{ value: 18, purity: '18K' }, { value: 19, name: '19K' }, { value: 20, name: '20K' }, { value: 21, name: '21K' }, { value: 22, name: '22K' }]
  purity = []

  finalLoanForm: FormGroup;

  constructor(private fb: FormBuilder) { }

  ngOnInit() {
    this.initForm();
    this.controls.goldNetWeight.valueChanges.subscribe(res => {
      // if (this.controls.goldNetWeight.touched) {
      if (this.controls.goldGrossWeight.valid && this.controls.goldNetWeight.valid) {
        this.calcGoldDeductionWeight();
      }
      // }
    });
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
        break;
      case '19':
        this.purity = [80, 81, 82, 83, 84];
        break;
      case '20':
        this.purity = [85, 86, 87, 88, 89];
        break;
      case '21':
        this.purity = [90, 91, 92, 93, 94];
        break;
      case '22':
        this.purity = [95, 96, 97, 98, 99, 100]
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
    let purity = +(this.controls.purity.value);
    purity = (purity / 100);

    let goldNetWeight = +(this.controls.goldNetWeight.value);
    console.log(goldNetWeight, purity);

    const currentNetWeight = goldNetWeight - purity;
    console.log(currentNetWeight);
  }

  get controls() {
    return this.finalLoanForm.controls;
  }

}
