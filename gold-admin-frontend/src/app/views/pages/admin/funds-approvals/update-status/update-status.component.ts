import { Component, OnInit, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';

@Component({
  selector: 'kt-update-status',
  templateUrl: './update-status.component.html',
  styleUrls: ['./update-status.component.scss']
})
export class UpdateStatusComponent implements OnInit {

  updateStatusForm: FormGroup
  status = [{ id: 1, name: 'pending' }, { id: 2, name: 'complete' }, { id: 3, name: 'rejected' }]

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<UpdateStatusComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
  ) { }

  ngOnInit() {
    this.initForm()
    this.patchForm(this.data.value)
  }

  initForm() {
    this.updateStatusForm = this.fb.group({
      customerId: ['', [Validators.required]],
      loanId: ['', [Validators.required]],
      loanAmount: ['', [Validators.required]],
      principalOutStandingAmount: ['', [Validators.required]],
      ornamentReleaseAmount: ['', [Validators.required]],
      interestAmount: ['', [Validators.required]],
      penalInterest: ['', [Validators.required]],
      totalPayableAmount: ['', [Validators.required]],
      partReleaseAmountStatus: ['', [Validators.required]],
    })
  }

  patchForm(data) {
    this.updateStatusForm.patchValue(data)
  }

  get controls() {
    return this.updateStatusForm.controls
  }

  closeModal() {
    this.dialogRef.close()
  }

  action(event) {
    if (event) {
      this.submit()
    } else if (!event) {
      this.closeModal()
    }
  }

  submit() {
    if (this.updateStatusForm.invalid) {
      this.updateStatusForm.markAllAsTouched()
      return
    }


  }
}
