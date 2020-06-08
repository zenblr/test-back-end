import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { GlobalSettingService } from '../../../../../core/global-setting/services/global-setting.service';
import { map } from 'rxjs/operators';

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

  constructor(
    private fb: FormBuilder,
    private globalSettingService: GlobalSettingService
  ) { }

  ngOnInit() {
    this.initForm();
  }

  initForm() {
    this.ltvGoldPercentForm = this.fb.group({
      ltvGoldPercent: []
    })

    this.minimumLoanAmountForm = this.fb.group({
      minimumLoanAmount: []
    })

    this.gstForm = this.fb.group({
      gst: []
    })

    this.minimumTopUpAmountForm = this.fb.group({
      minimumTopUpAmount: []
    })

    this.gracePeriodForm = this.fb.group({
      gracePeriod: []
    })
  }

  submit(type) {
    let formData = {};
    switch (type) {
      case 'ltvGoldPercent':
        formData = { data: this.ltvGoldPercentForm.value, method: type }
        break;

      case 'minimumLoanAmount':
        formData = { data: this.minimumLoanAmountForm.value, method: type }
        break;

      case 'minimumTopUpAmount':
        formData = { data: this.minimumTopUpAmountForm.value, method: type }
        break;

      case 'gracePeriod':
        formData = { data: this.gracePeriodForm.value, method: type }
        break;

      case 'gst':
        formData = { data: this.gstForm.value, method: type }
        break;

      default:
        break;
    }

    this.globalSettingService.setGlobalSetting(formData).pipe(map(res => {
      console.log(res);
    })).subscribe()

  }

}
