import { Component, OnInit, Inject, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { SMSAlertService } from '../../../../../../core/notification-setting/services/sms-alert.service';
import { ToastrComponent } from '../../../../../partials/components/toastr/toastr.component';

@Component({
  selector: 'kt-sms-alert-add',
  templateUrl: './sms-alert-add.component.html',
  styleUrls: ['./sms-alert-add.component.scss']
})
export class SmsAlertAddComponent implements OnInit {
  @ViewChild(ToastrComponent, { static: true }) toastr: ToastrComponent;
  smsForm: FormGroup;
  modalTitle = 'Add SMS Alert';

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<SmsAlertAddComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private smsAlertService: SMSAlertService
  ) { }

  ngOnInit() {
    this.initForm();
    this.setForm();
  }

  initForm() {
    this.smsForm = this.fb.group({
      id: [''],
      alertFor: ['', [Validators.required]],
      content: ['', [Validators.required]],
    })
  }

  get controls() {
    return this.smsForm.controls;
  }

  setForm() {
    if (this.data.action == 'edit') {
      this.modalTitle = 'Edit SMS Alert';
      this.smsForm.patchValue(this.data.data);
      this.controls.alertFor.disable();
    } else if (this.data.action == 'view') {
      this.modalTitle = 'View SMS Alert';
      this.smsForm.disable();
    }
  }

  closeModal() {
    this.dialogRef.close();
  }

  action(event) {
    if (event) {
      this.onSubmit();
    } else if (!event) {
      this.closeModal();
    }
  }

  onSubmit() {
    if (this.smsForm.invalid) {
      this.smsForm.markAllAsTouched();
      return;
    }
    const data = this.smsForm.value;
    if (this.data.action == 'add') {
      this.smsAlertService.addSMSAlert(data).subscribe(res => {
        console.log(res);
        const msg = 'SMS Alert Added Sucessfully';
        this.toastr.successToastr(msg);
        this.dialogRef.close(true);
      });
    } else if (this.data.action == 'edit') {
      this.smsAlertService.updateSMSAlert(this.controls.id.value, data).subscribe(res => {
        console.log(res);
        const msg = 'SMS Alert Updated Sucessfully';
        this.toastr.successToastr(msg);
        this.dialogRef.close(true);
      });
    }
  }
}
