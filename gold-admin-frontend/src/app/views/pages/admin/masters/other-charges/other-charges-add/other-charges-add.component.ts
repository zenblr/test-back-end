import { Component, OnInit, Inject } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { ToastrService } from 'ngx-toastr';
import { OtherChargesService } from "../../../../../../core/masters/other-charges/service/other-charges.service";

@Component({
  selector: 'kt-other-charges-add',
  templateUrl: './other-charges-add.component.html',
  styleUrls: ['./other-charges-add.component.scss']
})
export class OtherChargesAddComponent implements OnInit {
  otherChargesForm: FormGroup
  title: string;
  button: string;
  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<OtherChargesAddComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private toastr: ToastrService,
    private otherChargesService: OtherChargesService
  ) { }

  ngOnInit() {
    this.initForm();
    this.setTitle();
  }

  initForm() {
    this.otherChargesForm = this.fb.group({
      description: ['', Validators.required],
    })
  }

  setTitle() {
    if (this.data.action == 'add') {
      this.title = "Add Description";
      this.button = "Add";
    } else {
      this.button = "Update";
      this.title = "Edit Description";
      this.controls.description.patchValue(this.data.descriptionData.description);
      console.log(this.data);
    }
  }

  get controls() {
    return this.otherChargesForm.controls;
  }

  action(event) {
    if (event) {
      this.onSubmit();
    } else if (!event) {
      this.dialogRef.close();
    }
  }

  onSubmit() {
    if (this.otherChargesForm.invalid) {
      this.otherChargesForm.markAllAsTouched();
      return;
    }
    if (this.data.action == 'edit') {
      this.otherChargesService.updateOtherCharges(this.data.descriptionData.id, this.controls.description.value).subscribe(res => {
        if (res) {
          const msg = 'Description Updated Sucessfully';
          this.toastr.success(msg);
          this.dialogRef.close(true);
        }
      });
    } else {
      this.otherChargesService.addOtherCharges(this.controls.description.value).subscribe(res => {
        if (res) {
          const msg = 'Description Added Successfully';
          this.toastr.success(msg);
          this.dialogRef.close(true);
        }
      });
    }
  }
}
