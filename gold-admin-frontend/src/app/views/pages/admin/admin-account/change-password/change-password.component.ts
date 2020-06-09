import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ConfirmPasswordValidator } from './confirm-password-validator';
import { AuthService } from '../../../../../core/auth';
import { ToastrService } from 'ngx-toastr';
import { map, catchError } from 'rxjs/operators';
import { Router } from '@angular/router';

@Component({
  selector: 'kt-change-password',
  templateUrl: './change-password.component.html',
  styleUrls: ['./change-password.component.scss']
})
export class ChangePasswordComponent implements OnInit {
  @ViewChild('form', { static: false }) form;
  passwordForm: FormGroup

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private toast: ToastrService,
    public router: Router
  ) {
    this.startForm();
  }



  ngOnInit() {

  }
  startForm() {
    this.passwordForm = this.fb.group({
      oldPassword: ['', Validators.required],
      newPassword: ["", Validators.compose([
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
    this.authService.changePassword(this.passwordForm.value).pipe(
      map((res) => {
        this.toast.success("Password Changed Successfully");
        this.logout()
        this.form.resetForm()
      }), catchError(err => {
        this.toast.error(err.error.message)
        throw err
      })
    ).subscribe()

  }
  logout() {
    this.authService.logout().pipe(
      map(res => {
        localStorage.clear()
        this.router.navigate(['/auth/login'])
      }), catchError(err => {
        throw err
      })).subscribe()
  }

  get controls() {
    if (this.passwordForm)
      return this.passwordForm.controls;
  }
}
