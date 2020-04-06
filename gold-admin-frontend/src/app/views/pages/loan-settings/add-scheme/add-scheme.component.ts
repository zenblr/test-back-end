import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'kt-add-scheme',
  templateUrl: './add-scheme.component.html',
  styleUrls: ['./add-scheme.component.scss']
})
export class AddSchemeComponent implements OnInit {

  csvForm: FormGroup;
  billingForm: FormGroup;
  constructor(private fb: FormBuilder) { }

  ngOnInit() {
    this.initForm()
  }

  initForm() {
    this.billingForm = this.fb.group({
      test: ['', Validators.required]
    })

    this.csvForm = this.fb.group({

    })
  }

}
