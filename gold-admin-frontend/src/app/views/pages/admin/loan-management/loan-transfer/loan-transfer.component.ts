import { Component, OnInit } from '@angular/core';
import { SharedService } from '../../../../../core/shared/services/shared.service';
import { CustomerClassificationService } from '../../../../../core/kyc-settings/services/customer-classification.service';
import { map } from 'rxjs/operators';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { LoanTransferService } from '../../../../../core/loan-management/loan-transfer/services/loan-transfer.service';

@Component({
  selector: 'kt-loan-transfer',
  templateUrl: './loan-transfer.component.html',
  styleUrls: ['./loan-transfer.component.scss']
})
export class LoanTransferComponent implements OnInit {

  selected: number;
  approvalForm: FormGroup;
  disbursalForm: FormGroup;
  masterAndLoanIds: any;
  branchManager: { value: string; name: string; }[];
  reasons: any[] = [];
  constructor(
    private custClassificationService: CustomerClassificationService,
    private sharedService: SharedService,
    private fb: FormBuilder,
    private loanTransferService: LoanTransferService
  ) {
    this.sharedService.getStatus().subscribe(res => {
      this.branchManager = res.bm
    })
  }



  ngOnInit() {
    this.initForms()
    this.getReasonsList()
  }

  initForms() {
    this.approvalForm = this.fb.group({
      loanTransferStatusForBM: ['', Validators.required],
      reasonByBM: ['', Validators.required],
      reason: []
    })
    this.disbursalForm = this.fb.group({
      disbursedLoanAmount: [],
      loanUniqueId: [],
      transactionId: ['', Validators.required]
    })
  }

  getReasonsList() {
    this.custClassificationService.getReasonsList().pipe(
      map(res => {
        console.log(res)
        this.reasons = res.data;
      })
    ).subscribe()
  }

  loan(event) {
    this.masterAndLoanIds = event
  }

  patchValue() {
    if (this.approvalForm.controls.reason.value == "Other") {
      this.approvalForm.controls.reasonByBM.reset()
    } else {
      this.approvalForm.controls.reasonByBM.patchValue(this.approvalForm.controls.reason.value)
    }
  }

  approval() {
    if (this.approvalForm.invalid) {
      this.approvalForm.markAllAsTouched()
      return
    }

    this.loanTransferService.approval(this.approvalForm.value, this.masterAndLoanIds).subscribe(res => {
      if (res) {
        this.disbursalForm.patchValue(res)
      }
    }, err => {

    })
  }

  disbursal() {
    if (this.disbursalForm.invalid) {
      this.disbursalForm.markAllAsTouched()
      return
    }

    this.loanTransferService.disbursal(this.disbursalForm.value, this.masterAndLoanIds).subscribe(res => {
      if (res) {
        this.disbursalForm.patchValue(res)
      }
    }, err => {

    })
  }

  next(event) {
    this.selected = event
  }
}

