import { Component, OnInit, Inject } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
@Component({
  selector: 'kt-add-internal-user-branch',
  templateUrl: './add-internal-user-branch.component.html',
  styleUrls: ['./add-internal-user-branch.component.scss']
})
export class AddInternalUserBranchComponent implements OnInit {
  title: string = ''
  addUserForm: FormGroup
  constructor(
    public dialogRef: MatDialogRef<AddInternalUserBranchComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private fb: FormBuilder
  ) { }

  ngOnInit() {
    this.initForm()
    this.setTitle()

  }

  setTitle() {
    if (this.data.action == 'add') {
      this.title = 'Add Internal User'
    } else if (this.data.action == 'edit') {
      this.title = 'Edit Internal User'
    } else {
      this.title = 'View Internal User'
      this.addUserForm.disable();
    }
  }

  initForm() {
    this.addUserForm = this.fb.group({
      branchName: ['', Validators.required],
      address: ['', Validators.required],
      stateId: ['', Validators.required],
      cityId: ['', Validators.required],
      pinCode: ['', Validators.required],
    })
  }

  get controls() {
    if (this.addUserForm) {
      return this.addUserForm.controls
    }
  }

  action(event: Event) {
    if (event) {
      this.submit()
    } else if (!event) {
      this.dialogRef.close()
    }
  }

  submit() {
    if (this.addUserForm.invalid) {
      this.addUserForm.markAllAsTouched()
      return
    }
  }

}
