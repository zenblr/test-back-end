import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { GoldRateService } from '../../../../../../../core/upload-data/gold-rate/gold-rate.service';
import { KaratDetailsService } from '../../../../../../../core/loan-setting/karat-details/services/karat-details.service';
import { map } from 'rxjs/operators';
import { GlobalSettingService } from '../../../../../../../core/global-setting/services/global-setting.service';

@Component({
  selector: 'kt-final-loan-amount',
  templateUrl: './final-loan-amount.component.html',
  styleUrls: ['./final-loan-amount.component.scss']
})
export class FinalLoanAmountComponent implements OnInit {

  loanAmount: number = 0;
  // karatArr = [{ value: 18, name: '18 K' }, { value: 19, name: '19 K' }, { value: 20, name: '20 K' }, { value: 21, name: '21 K' }, { value: 22, name: '22 K' }]
  purity = [];
  purityBasedDeduction: number;
  currentLtvAmount: any;

  finalLoanForm: FormGroup;
  karatArr: any;

  constructor(private fb: FormBuilder,
    private goldRateService: GoldRateService,
    public karatService: KaratDetailsService,
    private globalSettingService: GlobalSettingService
  ) { }

  ngOnInit() {
    this.getKarat()
    this.initForm();
    // this.controls.goldNetWeight.valueChanges.subscribe(res => {
    //   // if (this.controls.goldNetWeight.touched) {
    //   if (this.controls.goldGrossWeight.valid && this.controls.goldNetWeight.valid) {
    //     this.calcGoldDeductionWeight();
    //   }
    // });
    this.globalSettingService.globalSetting$.subscribe(global => {
      if (global) {
        this.goldRateService.goldRate$.subscribe(res => {
          if (res) {
            this.controls.currentLtvAmount.patchValue(res * (global.ltvGoldValue / 100));
          }
        })
      }
    })

  }

  initForm() {
    this.finalLoanForm = this.fb.group({
      goldGrossWeight: [, [Validators.required, Validators.pattern('^\\s*(?=.*[1-9])\\d*(?:\\.\\d{1,2})?\\s*$')]],
      goldNetWeight: [, [Validators.required, Validators.pattern('^\\s*(?=.*[1-9])\\d*(?:\\.\\d{1,2})?\\s*$')]],
      goldDeductionWeight: [, [Validators.required, Validators.pattern('^\\s*(?=.*[0-9])\\d*(?:\\.\\d{1,2})?\\s*$')]],
      karat: ['', [Validators.required]],
      purity: [],
      finalNetWeight: [],
      ltvAmount: [, [Validators.required]],
      ltvPercent: ['', [Validators.required]],
      currentLtvAmount: [],
      loanAmount: []
    })
  }

  calcGoldDeductionWeight() {
    if (this.controls.goldGrossWeight.value && this.controls.goldDeductionWeight.value) {
      const goldDeductionWeight = this.controls.goldGrossWeight.value - this.controls.goldDeductionWeight.value;
      this.controls.goldNetWeight.patchValue(goldDeductionWeight.toFixed(2));
      // console.log(goldDeductionWeight)
    }
  }

  selectKarat() {
    const karat = this.controls.karat.value;
    console.log(typeof (karat));
    let filteredKarat = this.karatArr.filter(kart => {
      return kart.karat == karat;
    })
    console.log(filteredKarat)
    this.purity = filteredKarat[0].range;
    // this.controls.ltvPercent.patchValue(filteredKarat[0].range);
    // switch (karat) {
    //   case '18':
    //     this.purity = [75, 76, 77, 78, 79];
    //     // this.purityBasedDeduction = 7.5;
    //     // this.controls.purity.patchValue(this.purityBasedDeduction);
    //     break;
    //   case '19':
    //     this.purity = [80, 81, 82, 83, 84];
    //     this.purityBasedDeduction = 5;
    //     this.controls.purity.patchValue(this.purityBasedDeduction);
    //     break;
    //   case '20':
    //     this.purity = [85, 86, 87, 88, 89];
    //     this.purityBasedDeduction = 2;
    //     this.controls.purity.patchValue(this.purityBasedDeduction);
    //     break;
    //   case '21':
    //     this.purity = [90, 91, 92, 93, 94];
    //     this.purityBasedDeduction = 1.5;
    //     this.controls.purity.patchValue(this.purityBasedDeduction);
    //     break;
    //   case '22':
    //     this.purity = [95, 96, 97, 98, 99, 100];
    //     this.purityBasedDeduction = 1;
    //     this.controls.purity.patchValue(this.purityBasedDeduction);
    //     break;
    //   default:
    //     break;
    // }

  }

  weightCheck() {
    if (this.controls.goldGrossWeight.valid && this.controls.goldDeductionWeight.valid) {
      if (Number(this.controls.goldGrossWeight.value) < Number(this.controls.goldDeductionWeight.value)) {
        this.controls.goldDeductionWeight.setErrors({ weight: true })
        this.controls.goldNetWeight.reset()
      }
    }
  }
  // calFinalNetWeight() {
  // Current Net Weight = Net Weight - Purity %
  //                        = 10 - 1 / 100
  //                        = 0.099
  // Current Net Wt = Previous net weight - Current Net Weight
  //   = 10 - 0.99
  // Final Net Weight = 9.90




  // let purity = this.controls.purity.value;
  // purity = (purity / 100);

  // current weight
  // let goldNetWeight = +(this.controls.goldNetWeight.value);

  // const currentNetWeight = goldNetWeight - Number(this.controls.ltvPercent.value / 100);
  // console.log(currentNetWeight);

  // final weight
  // const finalNetWeight = goldNetWeight - currentNetWeight;
  // console.log(finalNetWeight);

  // this.controls.finalNetWeight.patchValue(currentNetWeight);

  // current LTV amount
  // this.controls.ltvPercent.patchValue(+(this.controls.purity.value));

  // let purity = +(this.controls.ltvPercent.value);

  // const ltvAmount = this.currentLtvAmount * purity / 100;
  // console.log(currentLtvAmount)
  // this.controls.ltvAmount.patchValue(ltvAmount);
  // }

  calcLoanAmount() {
    // Loan Amount = Final Net Weight *  Ltv
    //   = 9.90 * 1270
    if (this.finalLoanForm.invalid) {
      this.finalLoanForm.markAllAsTouched();
      return
    }

    const loanAmount = (+(this.controls.goldNetWeight.value) * +(this.controls.ltvAmount.value)).toFixed(2);
    // console.log('final: ', loanAmount);
    this.loanAmount = Number(loanAmount);
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

  getKarat() {
    this.karatService.getAllKaratDetails().pipe(
      map(res => {
        this.karatArr = res.data;
        console.log(res)
      })
    ).subscribe()
  }

  rejectNegativeNumber(val) {
    let keyCode = val.keyCode;
    if (!((keyCode > 95 && keyCode < 106)
      || (keyCode > 47 && keyCode < 58)
      || keyCode == 8)) {
      return false;
    }
  }

}
