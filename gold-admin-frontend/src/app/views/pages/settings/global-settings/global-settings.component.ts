import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';

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
    private fb: FormBuilder
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

  submit() {
    
  }

}
