import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { GlobalSettingService } from '../../../../../core/global-setting/services/global-setting.service';
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
    this.getGlobalSetting()
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
    })

    // this.minimumLoanAmountForm = this.fb.group({
    //   minimumLoanAmount: []
    // })

    // this.gstForm = this.fb.group({
    //   gst: []
    // })

    // this.cashTransactionLimitForm = this.fb.group({
    //   cashTransactionLimit: []
    // })

    // this.minimumTopUpAmountForm = this.fb.group({
    //   minimumTopUpAmount: []
    // })

    // this.gracePeriodForm = this.fb.group({
    //   gracePeriod: []
    // })
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
      })).subscribe()
    }

  }

  submit() {
    // let formData = {};
    // switch (type) {
    //   case 'ltvGoldPercent':
    //     formData = { data: this.ltvGoldPercentForm.value, method: type }
    //     break;

    //   case 'minimumLoanAmount':
    //     formData = { data: this.minimumLoanAmountForm.value, method: type }
    //     break;

    //   case 'minimumTopUpAmount':
    //     formData = { data: this.minimumTopUpAmountForm.value, method: type }
    //     break;

    //   case 'gracePeriod':
    //     formData = { data: this.gracePeriodForm.value, method: type }
    //     break;

    //   case 'cashTransactionLimit':
    //     formData = { data: this.cashTransactionLimitForm.value, method: type }
    //     break;

    //   case 'gst':
    //     formData = { data: this.gstForm.value, method: type }
    //     break;

    //   default:
    //     break;
    // }
    if (this.globalSettingForm.invalid) {
      this.globalSettingForm.markAllAsTouched();
      return
    }

    const formData = this.globalSettingForm.value;

    this.globalSettingService.setGlobalSetting(formData).pipe(map(res => {
      if (res) {
        console.log(res);
        this.globalSettingService.globalSetting.next(formData)
        this.toastr.success('Successful!')
      }
    })).subscribe()

  }

  get controls() {
    return this.globalSettingForm.controls;
  }

}
