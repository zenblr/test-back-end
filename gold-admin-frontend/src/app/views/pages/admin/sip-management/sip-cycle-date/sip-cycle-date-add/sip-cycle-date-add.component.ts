import { Component, OnInit, Inject } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { ToastrService } from 'ngx-toastr';
import { SipCycleDateDatasource, SipCycleDateService } from '../../../../../../core/sip-management/sip-cycle-date';

@Component({
  selector: 'kt-sip-cycle-date-add',
  templateUrl: './sip-cycle-date-add.component.html',
  styleUrls: ['./sip-cycle-date-add.component.scss']
})
export class SipCycleDateAddComponent implements OnInit {

  SipCycleDateForm: FormGroup;
  title: string;
  constructor(
    public dialogRef: MatDialogRef<SipCycleDateAddComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private fb: FormBuilder,
    private toastr: ToastrService,
    private sipCycleDateService: SipCycleDateService
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
      this.title = 'Edit SIP'
      this.SipCycleDateForm.patchValue(this.data.leadSourceData);
    }
  }

  initForm() {
    this.SipCycleDateForm = this.fb.group({
      id: [],
      sipCycleDate: ['', [Validators.required]],
      sipCycleDateStatus: ['', [Validators.required]],
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
    if (this.SipCycleDateForm.invalid) {
      this.SipCycleDateForm.markAllAsTouched()
      return
    }
    const data = this.SipCycleDateForm.value;
    const id = this.controls.id.value;

    if (this.data.action == 'edit') {
      this.sipCycleDateService.updateLeadSource(id, data.leadName).subscribe(res => {
        if (res) {
          const msg = 'Lead Updated Sucessfully';
          this.toastr.success(msg);
          this.dialogRef.close(true);
        }
      });

    } else {
      this.sipCycleDateService.addLeadSource(data.leadName).subscribe(res => {
        if (res) {
          const msg = 'Lead Added Successfully';
          this.toastr.success(msg);
          this.dialogRef.close(true);
        }
      });
    }
  }

  get controls() {
    return this.SipCycleDateForm.controls;
  }


}
