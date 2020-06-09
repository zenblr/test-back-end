import { Component, OnInit, Inject, ViewChild } from '@angular/core';
import { Validators, FormBuilder, FormGroup } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material";
import { ProfileService } from '../../../../../core/merchant-broker';
import { ToastrComponent } from '../../../../../views/partials/components/toastr/toastr.component';

@Component({
  selector: 'kt-profile-change-pan',
  templateUrl: './profile-change-pan.component.html',
  styleUrls: ['./profile-change-pan.component.scss']
})
export class ProfileChangePanComponent implements OnInit {
  @ViewChild(ToastrComponent, { static: true }) toastr: ToastrComponent;
  panForm: FormGroup;
  title: string = 'Pancard Update';
  isMandatory: boolean = true;
  constructor(
    public dialogRef: MatDialogRef<ProfileChangePanComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private profileService: ProfileService,
    private fb: FormBuilder,

  ) { }

  ngOnInit() {
    this.formInitialize();
  }

  formInitialize() {
    this.panForm = this.fb.group({
      panCardNumber: ['', Validators.required],
      nameOnPanCard: ['', Validators.required],
      pancard: ['', Validators.required],
    });
  }

  get controls() {
    return this.panForm.controls;
  }

  action(event: Event) {
    if (event) {
      this.onSubmit();
    } else if (!event) {
      this.dialogRef.close();
    }
  }

  uploadImage(data) {
    this.panForm.controls["pancard"].patchValue(
      data.uploadData.URL
    );
  }

  removeImage(data) {
    this.panForm.controls["pancard"].patchValue("");
  }

  onSubmit() {
    if (this.panForm.invalid) {
      this.panForm.markAllAsTouched();
      return;
    }

    const panData = this.panForm.value;

    this.profileService.updatePanDetails(panData).subscribe(res => {
      if (res) {
        this.toastr.successToastr(
          "Pancard Updated Sucessfully"
        );
        this.dialogRef.close('reload');
      }
    });
  }
}
