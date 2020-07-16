import { Component, OnInit } from '@angular/core';
import { SharedService } from '../../../../../core/shared/services/shared.service';
import { CustomerClassificationService } from '../../../../../core/kyc-settings/services/customer-classification.service';
import { map } from 'rxjs/operators';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { LoanTransferService } from '../../../../../core/loan-management/loan-transfer/services/loan-transfer.service';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'kt-loan-transfer',
  templateUrl: './loan-transfer.component.html',
  styleUrls: ['./loan-transfer.component.scss']
})
export class LoanTransferComponent implements OnInit {

  customerDetail: any
  selected: number;
  approvalForm: FormGroup;
  disbursalForm: FormGroup;
  masterAndLoanIds: any;
  branchManager: { value: string; name: string; }[];
  reasons: any[] = [];
  id: any;
  laonTransferDetails: any
  disabled = [false, true, true, true]
  constructor(
    private custClassificationService: CustomerClassificationService,
    private sharedService: SharedService,
    private fb: FormBuilder,
    private loanTransferService: LoanTransferService,
    private rout: ActivatedRoute,
    private router:Router
  ) {
    this.getReasonsList()
    this.id = this.rout.snapshot.params.id;;
    if (this.id) {
      this.getSingleDetails(this.id)
    }
    this.sharedService.getStatus().subscribe(res => {
      this.branchManager = res.bm
    })
    
  }


  getSingleDetails(event) {
    this.loanTransferService.getSingleUserData(event).subscribe(res => {
      if (res.data) {
        this.laonTransferDetails = res.data
        if (res.data.masterLoan.loanTransfer.loanTransferCurrentStage) {
          let stage = res.data.masterLoan.loanTransfer.loanTransferCurrentStage;
          this.selected = Number(stage) - 1;

          this.approvalForm.patchValue(res.data.masterLoan.loanTransfer)
          console.log(this.approvalForm.value)
          if (res.data.masterLoan.loanTransfer.reasonByBM) {
            this.approvalForm.patchValue({ reason: res.data.masterLoan.loanTransfer.reasonByBM })
            let temp = this.reasons.filter(reason => {
              return reason.description == res.data.masterLoan.loanTransfer.reasonByBM
            })
            
            if (!temp.length) {
              this.approvalForm.patchValue({ reason: "Other" })
            }else{
            this.approvalForm.patchValue({ reason: res.data.masterLoan.loanTransfer.reasonByBM })
            }
          }

          this.disbursalForm.patchValue(res.data.masterLoan.loanTransfer)
          this.disbursalForm.patchValue(res.data)
        }
        this.masterAndLoanIds = { loanId: res.data.masterLoan.id, masterLoanId: res.data.masterLoanId }
      }
    })
  }

  ngOnInit() {
    this.initForms()
    this.approvalForm.controls.loanTransferStatusForBM.valueChanges.subscribe((res)=>{
      if(res == 'approved'){
        this.approvalForm.controls.reasonByBM.reset()
        this.approvalForm.controls.reasonByBM.clearValidators()
        this.approvalForm.controls.reasonByBM.updateValueAndValidity()
        this.approvalForm.controls.reason.reset()
        this.approvalForm.controls.reason.clearValidators()
        this.approvalForm.controls.reason.updateValueAndValidity()
      }else{
        this.approvalForm.controls.reasonByBM.setValidators(Validators.required)
        this.approvalForm.controls.reasonByBM.updateValueAndValidity()
      }
    })
  }

  

  initForms() {
    this.approvalForm = this.fb.group({
      loanTransferStatusForBM: ['pending', Validators.required],
      reasonByBM: ['', Validators.required],
      reason: ['',Validators.required]
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
    if (this.approvalForm.invalid || this.approvalForm.controls.loanTransferStatusForBM.value =='pending') {
      this.approvalForm.markAllAsTouched()
      return
    }

    this.loanTransferService.approval(this.approvalForm.value, this.masterAndLoanIds).subscribe(res => {
      if (res) {
        if(this.approvalForm.controls.loanTransferStatusForBM.value =='approved'){
        this.disbursalForm.patchValue(res)
        if(res.loanCurrentStage){
          let stage = Number(res.loanCurrentStage) - 1
          this.next(stage)
        }
      }
      else{
        this.router.navigate(['/admin/loan-management/transfer-loan-list'])
      }
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
        this.router.navigate(['/admin/loan-management/transfer-loan-list'])
      }
    }, err => {

    })
  }

  next(event) {
    if (event.index != undefined) {
      this.selected = event.index;
    } else {
      this.selected = event;
    }
    for (let index = 0; index < this.disabled.length; index++) {
      if (this.selected >= index) {
        this.disabled[index] = false
      } else {
        this.disabled[index] = true
      }
    }
  }
}

