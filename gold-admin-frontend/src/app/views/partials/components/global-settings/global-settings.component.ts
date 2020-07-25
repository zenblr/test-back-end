import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { GlobalSettingService } from '../../../../core/global-setting/services/global-setting.service';
import { map } from 'rxjs/operators';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'kt-global-settings',
  templateUrl: './global-settings.component.html',
  styleUrls: ['./global-settings.component.scss']
})
export class GlobalSettingsComponent implements OnInit {
  ltvGoldPercentForm: FormGroup;
  minimumLoanAmountForm: FormGroup;
  gstForm: FormGroup;
  minimumTopUpAmountForm: FormGroup;
  gracePeriodForm: FormGroup;
  cashTransactionLimitForm: FormGroup;
  globalSettingForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private globalSettingService: GlobalSettingService,
    private toastr: ToastrService
  ) { }

  ngOnInit() {
    this.initForm();
    this.getGlobalSetting();
  }

  initForm() {
    this.globalSettingForm = this.fb.group({
      ltvGoldValue: [, [Validators.required]],
      scrapLtvGoldValue: [, [Validators.required]],
      minimumLoanAmountAllowed: [, [Validators.required]],
      gst: [, [Validators.required]],
      cashTransactionLimit: [, [Validators.required]],
      minimumTopUpAmount: [, [Validators.required]],
      gracePeriodDays: [, [Validators.required]]
    });
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

  submit() {
    if (this.globalSettingForm.invalid) {
      this.globalSettingForm.markAllAsTouched();
      return;
    }

    const formData = this.globalSettingForm.value;

    this.globalSettingService.setGlobalSetting(formData).pipe(map(res => {
      if (res) {
        console.log(res);
        this.globalSettingService.globalSetting.next(formData);
        this.toastr.success('Successful!');
      }
    })).subscribe();
  }

  get controls() {
    return this.globalSettingForm.controls;
  }

}
