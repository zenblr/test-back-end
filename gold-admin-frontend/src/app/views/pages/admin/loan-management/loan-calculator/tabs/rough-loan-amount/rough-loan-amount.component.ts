import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { UploadOfferService } from '../../../../../../../core/upload-data';
import { GoldRateService } from '../../../../../../../core/upload-data/gold-rate/gold-rate.service';
import { GlobalSettingService } from '../../../../../../../core/global-setting/services/global-setting.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
@Component({
  selector: 'kt-rough-loan-amount',
  templateUrl: './rough-loan-amount.component.html',
  styleUrls: ['./rough-loan-amount.component.scss']
})
export class RoughLoanAmountComponent implements OnInit {

  roughLoanForm: FormGroup;
  loanAmount: number = 0;
  private unsubscribe$ = new Subject();
  constructor(public fb: FormBuilder,
    private globalSettingService: GlobalSettingService,
    private goldRateService: GoldRateService) {

  }

  ngOnInit() {
    this.initForm();
    this.globalSettingService.globalSetting$.pipe(takeUntil(this.unsubscribe$)).subscribe(global => {
      if (global) {
        this.goldRateService.goldRate$.subscribe(res => {
          this.controls.currentLTV.patchValue(res * (global.ltvGoldValue / 100));
        })
      }
    })
  }
  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  initForm() {
    this.roughLoanForm = this.fb.group({
      grossWeight: [, [Validators.required, Validators.pattern('^\\s*(?=.*[1-9])\\d*(?:\\.\\d{1,2})?\\s*$')]],
      netWeight: [, [Validators.required, Validators.pattern('^\\s*(?=.*[1-9])\\d*(?:\\.\\d{1,2})?\\s*$')]],
      deductionWeight: [, [Validators.required, Validators.pattern('^\\s*(?=.*[0-9])\\d*(?:\\.\\d{1,2})?\\s*$')]],
      currentLTV: [, Validators.required]
    })

  }

  get controls() {
    if (this.roughLoanForm) {
      return this.roughLoanForm.controls
    }
  }

  weightCheck() {
    if (this.controls.grossWeight.valid && this.controls.deductionWeight.valid) {
      if (Number(this.controls.grossWeight.value) < Number(this.controls.deductionWeight.value)) {
        this.controls.deductionWeight.setErrors({ weight: true })
      }
    }
  }

  calculate() {
    if (this.roughLoanForm.invalid) {
      this.roughLoanForm.markAllAsTouched();
      return
    }
    this.loanAmount = Number(this.controls.netWeight.value) * this.controls.currentLTV.value;

  }

  calcGoldDeductionWeight() {
    if (this.controls.grossWeight.value && this.controls.deductionWeight.value &&
      this.controls.grossWeight.valid && this.controls.deductionWeight.valid) {
      const netWeight = (this.controls.grossWeight.value) - this.controls.deductionWeight.value;
      this.controls.netWeight.patchValue(netWeight.toFixed(2));
      // console.log(goldDeductionWeight)
    }
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
