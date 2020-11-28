import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { GlobalSettingService } from '../../../../core/global-setting/services/global-setting.service';
import { map } from 'rxjs/operators';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';

@Component({
  selector: 'kt-global-settings-shared',
  templateUrl: './global-settings.component.html',
  styleUrls: ['./global-settings.component.scss']
})
export class GlobalSettingsComponent implements OnInit {
  globalSettingForm: FormGroup;
  url: any;
  scrapSettingFlag: boolean;
  digiGoldSettingFlag: boolean;
  loanSettingFlag: boolean;
  globalValue: any;
  

  constructor(
    private fb: FormBuilder,
    private globalSettingService: GlobalSettingService,
    private toastr: ToastrService,
    private router: Router
  ) {
    this.url = (this.router.url.split("/")[2]);
    if (this.url == 'scrap-management') {
      this.scrapSettingFlag = true;
    } else if(this.url == 'digi-gold') {
      this.digiGoldSettingFlag = true;
    }
    else {
      this.loanSettingFlag = true;
    }
  }

  ngOnInit() {
    this.initForm();
    if (this.scrapSettingFlag) {
      this.getScrapGlobalSetting();
    } else if (this.digiGoldSettingFlag){
      this.getDigiGoldSetting();
    }
    else {
      this.getGlobalSetting();
    }
  }

  initForm() {
    this.globalSettingForm = this.fb.group({
      ltvGoldValue: [, [Validators.required]],
      minimumLoanAmountAllowed: [],
      gst: [, [Validators.required]],
      standardDeductionMin: [],
      standardDeductionMax: [],
      cashTransactionLimit: [, [Validators.required]],
      minimumTopUpAmount: [],
      gracePeriodDays: [],
      processingChargesFixed: [],
      processingChargesInPercent: [],
      partPaymentPercent: [],
      digigoldsellable: []
    });
    this.validation();
  }

  validation() {
    if (this.url == 'scrap-management') {
      this.globalSettingForm.controls.processingChargesFixed.setValidators(Validators.required),
        this.globalSettingForm.controls.processingChargesFixed.updateValueAndValidity()
      this.globalSettingForm.controls.processingChargesInPercent.setValidators(Validators.required),
        this.globalSettingForm.controls.processingChargesInPercent.updateValueAndValidity()
        this.globalSettingForm.controls.standardDeductionMin.setValidators([Validators.required, Validators.pattern('(^100(\\.0{1,2})?$)|(^([1-9]([0-9])?|0)(\\.[0-9]{1,2})?$)')]),
        this.globalSettingForm.controls.standardDeductionMin.updateValueAndValidity()
        this.globalSettingForm.controls.standardDeductionMax.setValidators([Validators.required, Validators.pattern('(^100(\\.0{1,2})?$)|(^([1-9]([0-9])?|0)(\\.[0-9]{1,2})?$)')]),
        this.globalSettingForm.controls.standardDeductionMax.updateValueAndValidity()
    } else if (this.url == 'digi-gold'){
      this.globalSettingForm.controls.digigoldsellable.setValidators([Validators.required])
      this.globalSettingForm.controls.digigoldsellable.updateValueAndValidity()
    }
    else {
      this.globalSettingForm.controls.minimumLoanAmountAllowed.setValidators(Validators.required),
        this.globalSettingForm.controls.minimumLoanAmountAllowed.updateValueAndValidity()
      this.globalSettingForm.controls.minimumTopUpAmount.setValidators(Validators.required),
        this.globalSettingForm.controls.minimumTopUpAmount.updateValueAndValidity()
      this.globalSettingForm.controls.gracePeriodDays.setValidators(Validators.required),
        this.globalSettingForm.controls.gracePeriodDays.updateValueAndValidity()
      this.globalSettingForm.controls.partPaymentPercent.setValidators(Validators.required),
        this.globalSettingForm.controls.partPaymentPercent.updateValueAndValidity()
    }
  }

  getGlobalSetting() {
    if (this.globalSettingService.globalSetting.getValue() != null) {
      this.globalSettingService.globalSetting$.subscribe(res => {
        this.globalSettingForm.patchValue(res);
      })
    } else {
      this.globalSettingService.getGlobalSetting().pipe(map(res => {
        this.globalSettingService.globalSetting.next(res);
        this.globalSettingForm.patchValue(res);
      })).subscribe();
    }
  }

  getDigiGoldSetting() {
    if (this.globalSettingService.globalSetting.getValue() != null) {
      this.globalSettingService.globalSetting$.subscribe(res => {
        this.globalSettingForm.patchValue(res);
      })
    } else {
      this.globalSettingService.getDigiGoldSetting().pipe(map(res => {
        this.globalSettingService.globalSetting.next(res);
        this.globalSettingForm.patchValue(res);
      })).subscribe();
    }
  }

  getScrapGlobalSetting() {
    if (this.globalSettingService.globalSetting.getValue() != null) {
      this.globalSettingService.globalSetting$.subscribe(res => {
        console.log(res);
        this.globalSettingForm.patchValue(res);
      })
    } else {
      this.globalSettingService.getScrapGlobalSetting().pipe(map(res => {
        this.globalSettingService.globalSetting.next(res);
        this.globalSettingForm.patchValue(res);
      })).subscribe();
    }
  }

  submit() {
    if (this.globalSettingForm.invalid) {
      this.globalSettingForm.markAllAsTouched();
      return;
    }
    const formData = this.globalSettingForm.value;
    if (this.scrapSettingFlag) {
      this.globalSettingService.setScrapGlobalSetting(formData).pipe(map(res => {
        if (res) {
          console.log(res);
          this.globalSettingService.globalSetting.next(formData);
          this.toastr.success('Successful!');
        }
      })).subscribe();
    } else if (this.digiGoldSettingFlag) {
      this.globalSettingService.setDigiGoldSetting(formData).pipe(map(res => {
        if (res) {
          console.log(res);
          this.globalSettingService.globalSetting.next(formData);
          this.toastr.success('Successful!');
        }
      })).subscribe();
    }
    else {
      this.globalSettingService.setGlobalSetting(formData).pipe(map(res => {
        if (res) {
          console.log(res);
          this.globalSettingService.globalSetting.next(formData);
          this.toastr.success('Successful!');
        }
      })).subscribe();
    }
  }

  get controls() {
    return this.globalSettingForm.controls;
  }
}
