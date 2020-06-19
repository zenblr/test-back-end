import { Component, OnInit, Inject } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { ToastrService } from 'ngx-toastr';
import { LeadSourceService } from '../../../../../../core/masters/lead-source/services/lead-source.service';

@Component({
  selector: 'kt-lead-source-add',
  templateUrl: './lead-source-add.component.html',
  styleUrls: ['./lead-source-add.component.scss']
})
export class LeadSourceAddComponent implements OnInit {

  leadSourceForm: FormGroup;
  title: string;
  constructor(
    public dialogRef: MatDialogRef<LeadSourceAddComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private fb: FormBuilder,
    private toastr: ToastrService,
    private leadSourceService: LeadSourceService
  ) { }

  ngOnInit() {
    this.initForm();
    this.setForm();
  }

  setForm() {
    console.log(this.data)
    if (this.data.action == 'add') {
      this.title = 'Add Lead Source'
    } else if (this.data.action == 'edit') {
      this.title = 'Edit Lead Source'
      this.leadSourceForm.patchValue(this.data.leadSourceData);
    }
  }

  initForm() {
    this.leadSourceForm = this.fb.group({
      id: [],
      leadName: ['', [Validators.required]],
      // source: ['', [Validators.required]],
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
    if (this.leadSourceForm.invalid) {
      this.leadSourceForm.markAllAsTouched()
      return
    }
    const data = this.leadSourceForm.value;
    const id = this.controls.id.value;

    if (this.data.action == 'edit') {
      this.leadSourceService.updateLeadSource(id, data.leadName).subscribe(res => {
        if (res) {
          const msg = 'Lead Updated Sucessfully';
          this.toastr.success(msg);
          this.dialogRef.close(true);
        }
      });

    } else {
      this.leadSourceService.addLeadSource(data.leadName).subscribe(res => {
        if (res) {
          const msg = 'Lead Added Successfully';
          this.toastr.success(msg);
          this.dialogRef.close(true);
        }
      });
    }
  }

  get controls() {
    return this.leadSourceForm.controls;
  }

}
