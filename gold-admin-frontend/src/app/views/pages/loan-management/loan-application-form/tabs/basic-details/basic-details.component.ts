import { Component, OnInit, EventEmitter, Output, AfterViewInit, OnChanges, Input } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'kt-basic-details',
  templateUrl: './basic-details.component.html',
  styleUrls: ['./basic-details.component.scss'],
  providers: [DatePipe]
})
export class BasicDetailsComponent implements OnInit, AfterViewInit, OnChanges {

  basicForm: FormGroup;
  @Output() basicFormEmit: EventEmitter<any> = new EventEmitter();
  @Input() invalid;
  


  constructor(
    private fb: FormBuilder,
    private datePipe: DatePipe
  ) {
  }


  ngOnInit() {
    this.initForm()
  }

  ngOnChanges() {
    if (this.invalid) {
      this.basicForm.markAllAsTouched()
      this.invalid = false
    }
  }

  ngAfterViewInit() {
    this.basicForm.valueChanges.subscribe(() => {
      this.basicFormEmit.emit(this.basicForm);
    })
  }

  initForm() {
    this.basicForm = this.fb.group({
      customerId: [, Validators.required],
      mobile: [, [Validators.required, Validators.minLength(10)]],
      panCardNumber: [, [Validators.required, Validators.pattern('^[A-Za-z]{5}[0-9]{4}[A-Za-z]{1}$')]],
      startDate: [, Validators.required]
    })
    this.basicFormEmit.emit(this.basicForm);
  }

  get controls() {
    return this.basicForm.controls
  }

  transform() {
    console.log(this.controls.startDate.value)
    // console.log(this.datePipe.transform(this.controls.startDate.value, 'MMM d, y'))
    // this.controls.startDate.patchValue(this.datePipe.transform(this.controls.startDate.value, 'MMM d, y'))
    // console.log(this.controls.startDate.value)
  
  }

}
