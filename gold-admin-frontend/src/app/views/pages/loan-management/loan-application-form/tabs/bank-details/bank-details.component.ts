import { Component, OnInit, ChangeDetectorRef, Input, EventEmitter, Output, OnChanges } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';

@Component({
  selector: 'kt-bank-details',
  templateUrl: './bank-details.component.html',
  styleUrls: ['./bank-details.component.scss']
})
export class BankDetailsComponent implements OnInit, OnChanges {


  @Input() details;
  @Output() bankFormEmit: EventEmitter<any> = new EventEmitter();
  @Input() disable

  bankForm: FormGroup;
  constructor(
    public ref: ChangeDetectorRef,
    public fb: FormBuilder,
  ) {
    this.initForm()
  }

  ngOnInit() {

  }



  ngOnChanges() {
    if (this.details) {
      this.bankForm.patchValue(this.details)
      this.bankFormEmit.emit(this.bankForm);
    }
    if(this.disable){
      this.bankForm.disable()
    }
  }

  initForm() {
    this.bankForm = this.fb.group({
      bankName: [],
      accountNumber: [],
      ifscCode: []
    })
    this.bankForm.disable()
  }

  get controls() {
    if (this.bankForm)
      return this.bankForm.controls
  }

}
