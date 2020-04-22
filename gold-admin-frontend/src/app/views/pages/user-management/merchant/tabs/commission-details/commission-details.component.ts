import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'kt-commission-details',
  templateUrl: './commission-details.component.html',
  styleUrls: ['./commission-details.component.scss']
})
export class CommissionDetailsComponent implements OnInit {

  category: FormGroup;
  constructor(
    public fb: FormBuilder
  ) { }

  ngOnInit() {
    this.initForm()
  }

  initForm() {
    this.category = this.fb.group({
      category1: ['', [Validators.required]],
      category2: ['', [Validators.required]],
      category3: ['', [Validators.required]]
    })
  }

  get controls() {
    if (this.category)
      return this.category.controls
  }

  next() {
    if (this.category.invalid) {
      this.category.markAllAsTouched()
      return
    }
  }

}
