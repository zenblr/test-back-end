import { Component, OnInit, ChangeDetectorRef, Input } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';

@Component({
  selector: 'kt-bank-details',
  templateUrl: './bank-details.component.html',
  styleUrls: ['./bank-details.component.scss']
})
export class BankDetailsComponent implements OnInit {

  @Input() disable;
  @Input() invalid;
  bankForm: FormGroup;
  constructor(
    public ref: ChangeDetectorRef,
    public fb: FormBuilder,
  ) { }

  ngOnInit() {
    this.initForm()
  }

  initForm() {
    this.bankForm = this.fb.group({
      name: [, [Validators.required, Validators.pattern('^[a-zA-Z ]*$')]],
      accountNumber: [, Validators.required],
      ifscCode: [, [
        Validators.required,
        Validators.pattern('[A-Za-z]{4}[a-zA-Z0-9]{7}')]]
    })
  }

  get controls() {
    if (this.bankForm)
      return this.bankForm.controls
  }

}
