import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ConfirmPasswordValidator } from './confirm-password-validator';

@Component({
  selector: 'kt-change-password',
  templateUrl: './change-password.component.html',
  styleUrls: ['./change-password.component.scss']
})
export class ChangePasswordComponent implements OnInit {
  @ViewChild('form', { static: false }) form;
  passwordForm: FormGroup

  constructor(private fb: FormBuilder) {
    this.startForm();
  }



  ngOnInit() {

  }
  startForm() {
    this.passwordForm = this.fb.group({
      oldPassword: ['', Validators.required],
      password: ["", Validators.compose([
        Validators.required,
        Validators.minLength(8),
        Validators.maxLength(100)
      ])
      ],
      confirmPassword: ["", Validators.compose([
        Validators.required,
        Validators.minLength(8),
        Validators.maxLength(100)
      ])
      ]
    },
      {
        validator: ConfirmPasswordValidator.MatchPassword
      });
  }

  isControlHasError(controlName: string, validationType: string): boolean {
    const control = this.passwordForm.controls[controlName];
    if (!control) {
      return false;
    }
    const result = control.hasError(validationType) && (control.dirty || control.touched);
    return result;
  }

  submitForm() {
    if (this.passwordForm.invalid) {
      this.passwordForm.markAllAsTouched()
      return
    }
    this.form.resetForm()
  }
  action(event) {
    if (event == 'submit') {
      this.submitForm()
    }
  }
}
