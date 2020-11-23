import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { GlobalSettingService } from '../../../../../core/global-setting/services/global-setting.service';
import { GoldRateService } from '../../../../../core/upload-data/gold-rate/gold-rate.service';

@Component({
  selector: 'kt-scrap-calculator',
  templateUrl: './scrap-calculator.component.html',
  styleUrls: ['./scrap-calculator.component.scss']
})
export class ScrapCalculatorComponent implements OnInit {
  roughScrapForm: FormGroup;
  scrapAmount: number = 0;

  constructor(
    private fb: FormBuilder,
    private globalSettingService: GlobalSettingService,
    private goldRateService: GoldRateService,
  ) { }

  ngOnInit() {
    this.initForm();
    this.globalSettingService.globalSetting$.subscribe(global => {
      if (global) {
        this.goldRateService.goldRate$.subscribe(res => {
          this.controls.ltvGoldValue.patchValue(res * (global.ltvGoldValue / 100));
        })
      }
    });
  }

  initForm() {
    this.roughScrapForm = this.fb.group({
      grossWeight: [, [Validators.required, Validators.pattern('^\\s*(?=.*[1-9])\\d*(?:\\.\\d{1,2})?\\s*$')]],
      deductionWeight: [, [Validators.required, Validators.pattern('^\\s*(?=.*[0-9])\\d*(?:\\.\\d{1,2})?\\s*$')]],
      netWeight: [, [Validators.required, Validators.pattern('^\\s*(?=.*[1-9])\\d*(?:\\.\\d{1,2})?\\s*$')]],
      purity: [, [Validators.required, Validators.pattern('^\\s*(?=.*[1-9])\\d*(?:\\.\\d{1,2})?\\s*$'), Validators.max(100)]],
      ltvGoldValue: []
    });
  }

  get controls() {
    if (this.roughScrapForm) {
      return this.roughScrapForm.controls
    }
  }

  weightCheck() {
    if (this.controls.grossWeight.valid) {
      if (Number(this.controls.grossWeight.value) < Number(this.controls.deductionWeight.value)) {
        this.controls.deductionWeight.setErrors({ weight: true })
      } else {
        this.controls.deductionWeight.setErrors(null)
        this.controls.deductionWeight.setValidators([Validators.required, Validators.pattern('^\\s*(?=.*[0-9])\\d*(?:\\.\\d{1,2})?\\s*$')])
        this.controls.deductionWeight.updateValueAndValidity()
      }
    }
  }

  calcGoldDeductionWeight() {
    if (this.controls.grossWeight.value && this.controls.grossWeight.valid && this.controls.deductionWeight.valid) {
      const netWeight = Number(this.controls.grossWeight.value) - Number(this.controls.deductionWeight.value);
      this.controls.netWeight.patchValue(netWeight.toFixed(2));
    }
  }

  calculate() {
    if (this.roughScrapForm.invalid) {
      this.roughScrapForm.markAllAsTouched();
      return
    }
    this.scrapAmount = this.controls.netWeight.value * (this.controls.purity.value / 100) * this.controls.ltvGoldValue.value;
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
