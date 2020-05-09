import { Component, OnInit, ChangeDetectorRef, Input, EventEmitter, Output, OnChanges, AfterViewInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';

@Component({
  selector: 'kt-bank-details',
  templateUrl: './bank-details.component.html',
  styleUrls: ['./bank-details.component.scss']
})
export class BankDetailsComponent implements OnInit,AfterViewInit,OnChanges {

  
  @Input() invalid;
  @Output() bankFormEmit: EventEmitter<any> = new EventEmitter();

  bankForm: FormGroup;
  constructor(
    public ref: ChangeDetectorRef,
    public fb: FormBuilder,
  ) { }

  ngOnInit() {
    this.initForm()
  }

  ngAfterViewInit() {
    this.bankForm.valueChanges.subscribe(() => {
      this.bankFormEmit.emit(this.bankForm);
    })
  }

  ngOnChanges() {
    if (this.invalid) {
      this.bankForm.markAllAsTouched()
      this.invalid = false
    }
  }

  initForm() {
    this.bankForm = this.fb.group({
      name: [, [Validators.required, Validators.pattern('^[a-zA-Z ]*$')]],
      accountNumber: [, Validators.required],
      ifscCode: [, [
        Validators.required,
        Validators.pattern('[A-Za-z]{4}[a-zA-Z0-9]{7}')]]
    })
    this.bankFormEmit.emit(this.bankForm);
  }

  get controls() {
    if (this.bankForm)
      return this.bankForm.controls
  }

}
