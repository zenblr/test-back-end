import { Component, OnInit, Inject } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { EmailAlertService } from '../../../../../../core/notification-setting/services/email-alert.service';
import { map } from 'rxjs/operators';

@Component({
  selector: 'kt-email-alert-add',
  templateUrl: './email-alert-add.component.html',
  styleUrls: ['./email-alert-add.component.scss']
})
export class EmailAlertAddComponent implements OnInit {
  emailForm: FormGroup;
  modalTitle = 'Add New Email Alert';

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<EmailAlertAddComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private emailAlertService: EmailAlertService
  ) { }

  ngOnInit() {
    this.initForm();
  }

  initForm() {
    this.emailForm = this.fb.group({
      id: [],
      event: ['', [Validators.required]],
      variable: ['', [Validators.required]],
      subject: ['', [Validators.required]],
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
    const data = this.emailForm.value;
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
    return this.emailForm.controls;
  }

}
