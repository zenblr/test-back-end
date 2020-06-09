import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MonthlyService } from '../../../../../core/repayment/services/monthly.service';

@Component({
  selector: 'kt-monthly-payment-add',
  templateUrl: './monthly-payment-add.component.html',
  styleUrls: ['./monthly-payment-add.component.scss']
})
export class MonthlyPaymentAddComponent implements OnInit {

  modalTitle = 'Add Payment';
  paymentForm: FormGroup;

  constructor(
    public dialogRef: MatDialogRef<MonthlyPaymentAddComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private fb: FormBuilder,
    private monthlyService: MonthlyService
  ) { }

  ngOnInit() {
    this.initForm();
  }

  initForm() {
    this.paymentForm = this.fb.group({
      loanId: ['', [Validators.required]],
      loanAmount: ['', [Validators.required]],
      startDate: ['', [Validators.required]],
      endDate: ['', [Validators.required]],
      tenure: ['', [Validators.required]],
      interest: ['', [Validators.required]],
    })
  }

  get controls() {
    return this.paymentForm.controls;
  }

  onSubmit() {
    console.log('form submitted')
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

}
