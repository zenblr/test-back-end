import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';

@Component({
  selector: 'kt-final-interest-amount',
  templateUrl: './final-interest-amount.component.html',
  styleUrls: ['./final-interest-amount.component.scss']
})
export class FinalInterestAmountComponent implements OnInit {
  finalInterestForm: FormGroup;

  constructor(private fb: FormBuilder) { }

  ngOnInit() {
    this.initForm();
  }

  initForm() {
    this.finalInterestForm = this.fb.group({

    })
  }

}
