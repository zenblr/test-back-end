import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';

@Component({
  selector: 'kt-user-details',
  templateUrl: './user-details.component.html',
  styleUrls: ['./user-details.component.scss']
})
export class UserDetailsComponent implements OnInit {

  userDetails: FormGroup

  constructor(
    private fb: FormBuilder
  ) { }

  ngOnInit() {
    this.initForm()
    this.userDetails.valueChanges.subscribe(res => {
      console.log(this.userDetails)
    })
  }

  initForm() {
    this.userDetails = this.fb.group({
      merchantName: ['', [Validators.required, Validators.pattern('^[a-zA-Z ]+$')]],
      fullName: ['', [Validators.required, Validators.pattern('^[a-zA-Z ]+$')]],
      email: ['', [Validators.required, Validators.email]],
      mobileNumber: ['', Validators.required],
      state: ['', Validators.required],
      city: ['', Validators.required],
      pincode: ['', Validators.required]
    })
  }


  get controls() {
    if (this.userDetails)
      return this.userDetails.controls
  }

  next() {
    if (this.userDetails.invalid) {
      this.userDetails.markAllAsTouched()
      return
    }
  }


}
