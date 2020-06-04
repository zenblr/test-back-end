import { Component, OnInit, Inject, ViewChild } from '@angular/core';
import { Validators, FormBuilder, FormGroup } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material";
import { ProfileService } from '../../../../../core/merchant-broker';
import { ToastrComponent } from '../../../../../views/partials/components/toastr/toastr.component';
import { ConfirmPasswordValidator } from './confirm-password.validator';

@Component({
  selector: 'kt-profile-change-pass',
  templateUrl: './profile-change-pass.component.html',
  styleUrls: ['./profile-change-pass.component.scss']
})
export class ProfileChangePassComponent implements OnInit {
  @ViewChild(ToastrComponent, { static: true }) toastr: ToastrComponent;
  passwordForm: FormGroup;
  title: string = 'Change Password';
  constructor(
    public dialogRef: MatDialogRef<ProfileChangePassComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private profileService: ProfileService,
    private fb: FormBuilder,

  ) { }

  ngOnInit() {
    this.formInitialize();

  }
  formInitialize() {
    this.passwordForm = this.fb.group({
      oldPassword: ['', Validators.required],
      newPassword: ['', Validators.compose([
        Validators.required,
        Validators.minLength(8),
        Validators.maxLength(100)])],
      confirmPassword: ['', Validators.compose([
        Validators.required,
        Validators.minLength(8),
        Validators.maxLength(100)])],
    },
      {
        validator: ConfirmPasswordValidator.MatchPassword
      });
  }

  get controls() {
    return this.passwordForm.controls;
  }

  action(event: Event) {
    if (event) {
      this.onSubmit();
    } else if (!event) {
      this.dialogRef.close();
    }
  }

  onSubmit() {
    if (this.passwordForm.invalid) {
      this.passwordForm.markAllAsTouched();
      return;
    }

    const passwordData = this.passwordForm.value;

    this.profileService.changePassword(passwordData).subscribe();

  }
}
