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
  showScrapFlag: boolean;

  constructor(
    private fb: FormBuilder,
    private globalSettingService: GlobalSettingService,
    private toastr: ToastrService,
    private router: Router
  ) {
    this.url = (this.router.url.split("/")[2]);
    if (this.url == 'scrap-management') {
      this.showScrapFlag = true;
    } else {
      this.showScrapFlag = false;
    }
  }

  ngOnInit() {
    this.initForm();
    if (this.showScrapFlag) {
      this.getScrapGlobalSetting();
    } else {
      this.getGlobalSetting();
    }
  }

  initForm() {
    this.globalSettingForm = this.fb.group({
      ltvGoldValue: [, [Validators.required]],
      minimumLoanAmountAllowed: [],
      gst: [, [Validators.required]],
      beforeStandardDeduction: [],
      afterStandardDeduction: [],
      cashTransactionLimit: [, [Validators.required]],
      minimumTopUpAmount: [],
      gracePeriodDays: [],
      processingChargesFixed: [],
      processingChargesInPercent: [],
      partPaymentPercent: [],
    });
    this.validation();
  }

  validation() {
    if (this.url == 'scrap-management') {
      this.globalSettingForm.controls.processingChargesFixed.setValidators(Validators.required),
        this.globalSettingForm.controls.processingChargesFixed.updateValueAndValidity()
      this.globalSettingForm.controls.processingChargesInPercent.setValidators(Validators.required),
        this.globalSettingForm.controls.processingChargesInPercent.updateValueAndValidity()
    } else {
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

  getScrapGlobalSetting() {
    if (this.globalSettingService.globalSetting.getValue() != null) {
      this.globalSettingService.globalSetting$.subscribe(res => {
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
    if (this.showScrapFlag) {
      this.globalSettingService.setScrapGlobalSetting(formData).pipe(map(res => {
        if (res) {
          console.log(res);
          this.globalSettingService.globalSetting.next(formData);
          this.toastr.success('Successful!');
        }
      })).subscribe();
    } else {
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
