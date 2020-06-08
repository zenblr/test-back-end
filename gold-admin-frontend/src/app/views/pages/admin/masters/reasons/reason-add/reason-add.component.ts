import { Component, OnInit, Inject } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { ToastrService } from 'ngx-toastr';
import { ReasonsService } from '../../../../../../core/masters/reasons/services/reasons.service';

@Component({
  selector: 'kt-reason-add',
  templateUrl: './reason-add.component.html',
  styleUrls: ['./reason-add.component.scss']
})
export class ReasonAddComponent implements OnInit {

  reasonForm: FormGroup;
  title: string;
  constructor(
    public dialogRef: MatDialogRef<ReasonAddComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private fb: FormBuilder,
    private toastr: ToastrService,
    private reasonsService: ReasonsService
  ) { }

  ngOnInit() {
    this.initForm();
    this.setForm();
  }

  setForm() {
    if (this.data.action == 'add') {
      this.title = 'Add Reason'
    } else if (this.data.action == 'edit') {
      this.title = 'Edit Reason'
      this.reasonForm.patchValue(this.data.reason);
    }
  }

  initForm() {
    this.reasonForm = this.fb.group({
      id: [],
      reason: ['', [Validators.required]]
    })
  }

  action(event) {
    if (event) {
      this.onSubmit();
    } else if (!event) {
      this.dialogRef.close();
    }
  }

  onSubmit() {
    if (this.reasonForm.invalid) {
      this.reasonForm.markAllAsTouched()
      return
    }
    const data = this.reasonForm.value;
    const id = this.controls.id.value;

    if (this.data.action == 'edit') {
      this.reasonsService.updateReason(id, data).subscribe(res => {
        if (res) {
          const msg = 'Reason Updated Sucessfully';
          this.toastr.success(msg);
          this.dialogRef.close(true);
        }
      });

    } else {
      this.reasonsService.addReason(data).subscribe(res => {
        if (res) {
          const msg = 'Reason Added Successfully';
          this.toastr.success(msg);
          this.dialogRef.close(true);
        }
      });
    }
  }

  get controls() {
    return this.reasonForm.controls;
  }

}
