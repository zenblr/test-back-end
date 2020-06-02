import { Component, OnInit, Inject } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { SmsAlertService } from '../../../../../core/notification-setting/services/sms-alert.service';
import { map } from 'rxjs/operators';

@Component({
  selector: 'kt-sms-alert-add',
  templateUrl: './sms-alert-add.component.html',
  styleUrls: ['./sms-alert-add.component.scss']
})
export class SmsAlertAddComponent implements OnInit {

  smsForm: FormGroup;
  modalTitle = 'Add New Email Alert';

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<SmsAlertAddComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private emailAlertService: SmsAlertService
  ) { }

  ngOnInit() {
    this.initForm();
  }

  initForm() {
    this.smsForm = this.fb.group({
      id: [],
      event: ['', [Validators.required]],
      content: ['', [Validators.required]],
    })
  }

  setForm() {
    if (this.data.action == 'edit') {
      // this.getLeadById(this.data['id']);
      this.modalTitle = 'Edit Email Alert'
      // this.viewOnly = true;
    } else if (this.data.action == 'view') {
      // this.getLeadById(this.data['id']);
      this.modalTitle = 'View Lead'
      // this.leadForm.disable()
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
    const data = this.smsForm.value;
    if (this.data.action == 'add') {
      this.emailAlertService.addAlert(data).pipe(map(res => {
        console.log(res);
      })).subscribe();
    } else if (this.data.action == 'edit') {

      this.emailAlertService.updateAlert(this.controls.id.value, data).pipe(map(res => {
        console.log(res);
      })).subscribe();
    }
  }

  get controls() {
    return this.smsForm.controls;
  }
}
