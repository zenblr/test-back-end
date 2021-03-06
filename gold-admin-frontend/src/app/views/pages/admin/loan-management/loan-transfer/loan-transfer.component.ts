import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { SharedService } from '../../../../../core/shared/services/shared.service';
import { CustomerClassificationService } from '../../../../../core/kyc-settings/services/customer-classification.service';
import { map } from 'rxjs/operators';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { LoanTransferService } from '../../../../../core/loan-management/loan-transfer/services/loan-transfer.service';
import { Router, ActivatedRoute } from '@angular/router';
import { NgxPermissionsService } from 'ngx-permissions';
import { ToastrService } from 'ngx-toastr';
import { Location } from "@angular/common";

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
  showButton: boolean = true;
  loanTransferStage: any;
  appraiserOrCCE: { value: string; name: string; }[];
  disabledForm: boolean;
  permission: any;
  action: any;
  amount: any = 0;

  constructor(
    private custClassificationService: CustomerClassificationService,
    private sharedService: SharedService,
    private fb: FormBuilder,
    private loanTransferService: LoanTransferService,
    private rout: ActivatedRoute,
    private router: Router,
    private ref: ChangeDetectorRef,
    private ngxPermission: NgxPermissionsService,
    private toast: ToastrService,
    private location: Location
  ) {
    this.ngxPermission.permissions$.subscribe(res => {
      this.permission = res
    })
    this.getReasonsList()
    this.id = this.rout.snapshot.params.id;
    if (this.id) {
      this.getSingleDetails(this.id)
    }
    this.sharedService.getStatus().subscribe(res => {
      this.branchManager = res.bm
      this.appraiserOrCCE = res.apprsiserOrCCE

    })

    this.rout.queryParams.subscribe(res => {
      this.action = res.action
      if (this.action === 'view') this.showButton = false
    })



  }


  getSingleDetails(event) {
    this.loanTransferService.getSingleUserData(event).subscribe(res => {
      if (res.data) {
        this.laonTransferDetails = res.data
        if (res.data.masterLoan.loanTransfer.loanTransferCurrentStage) {
          let stage = res.data.masterLoan.loanTransfer.loanTransferCurrentStage;
          // this.next(Number(stage) - 1);
          this.selected = 0;
          if (this.action == 'view') this.loanTransferStage = stage - 1
          if (stage == '4') {
            if (!this.permission.loanTransferRating) {
              this.toast.error('Access Denied')
              this.location.back()
            }
            this.selected = 0
            this.approvalForm.controls.loanTransferStatusForAppraiser.disable()
            this.approvalForm.controls.reasonByAppraiser.disable()
          }

          this.approvalForm.patchValue(res.data.masterLoan.loanTransfer)
          console.log(this.approvalForm.value)
          if (res.data.masterLoan.loanTransfer.reasonByBM && res.data.masterLoan.loanTransfer.loanTransferCurrentStage == '4') {
            setTimeout(() => {
              this.approvalForm.patchValue({ reason: res.data.masterLoan.loanTransfer.reasonByBM })
              let temp = this.reasons.filter(reason => {
                return reason.description == res.data.masterLoan.loanTransfer.reasonByBM
              })

              if (!temp.length) {
                this.approvalForm.patchValue({ reason: "Other" })
              } else {
                this.approvalForm.patchValue({ reason: res.data.masterLoan.loanTransfer.reasonByBM })
              }
            })
          }

          if (res.data.masterLoan.loanTransfer.reasonByAppraiser && res.data.masterLoan.loanTransfer.loanTransferCurrentStage == '3') {
            setTimeout(() => {
              this.approvalForm.patchValue({ reason: res.data.masterLoan.loanTransfer.reasonByAppraiser })
              let temp = this.reasons.filter(reason => {
                return reason.description == res.data.masterLoan.loanTransfer.reasonByAppraiser
              })

              if (!temp.length) {
                this.approvalForm.patchValue({ reason: "Other" })
              } else {
                this.approvalForm.patchValue({ reason: res.data.masterLoan.loanTransfer.reasonByAppraiser })
              }
            })
          }

          if (res.data.masterLoan.loanTransfer.reasonByAppraiser === null && res.data.masterLoan.loanTransfer.loanTransferCurrentStage == '3') {
            this.approvalForm.patchValue({ loanTransferStatusForAppraiser: '' })
          }

          this.ref.detectChanges()
          if (this.approvalForm.controls.loanTransferStatusForAppraiser.value == 'approved') {
            this.disabled = [false, false, false, true]
            this.disabledForm = true
          }

          if (this.approvalForm.controls.loanTransferStatusForBM.value == 'approved') {
            this.disabled = [false, false, false, false]
            this.approvalForm.disable()
          }

          this.amount = res.data.masterLoan.loanTransfer.disbursedLoanAmount
          this.disbursalForm.patchValue(res.data.masterLoan.loanTransfer)
          this.disbursalForm.patchValue({loanUniqueId:res.data.loanUniqueId})
          this.ref.detectChanges()
        }
        this.masterAndLoanIds = { loanId: res.data.masterLoan.id, masterLoanId: res.data.masterLoanId }
      } 
    })
  }

  ngOnInit() {
    this.initForms()
    this.approvalForm.controls.loanTransferStatusForBM.valueChanges.subscribe((res) => {
      if (res == 'approved') {
        this.approvalForm.controls.reasonByBM.reset()
        this.approvalForm.controls.reasonByBM.clearValidators()
        this.approvalForm.controls.reasonByBM.updateValueAndValidity()
        this.approvalForm.controls.reason.reset()
        this.approvalForm.controls.reason.clearValidators()
        this.approvalForm.controls.reason.updateValueAndValidity()
      } else {
        this.approvalForm.controls.reasonByBM.setValidators(Validators.required)
        this.approvalForm.controls.reasonByBM.updateValueAndValidity()
      }
    })

    this.disbursalForm.controls.processingCharge.valueChanges.subscribe(res => {
      if (Number(this.disbursalForm.controls.processingCharge.value)) {

        if (Number(this.amount) < Number(this.disbursalForm.controls.processingCharge.value)) {
          this.disbursalForm.controls.processingCharge.setErrors({ lessThan: true })
          return
        }

        let amt = this.amount - this.disbursalForm.controls.processingCharge.value
        this.disbursalForm.controls.disbursedLoanAmount.patchValue(amt)
      } else {
        this.disbursalForm.controls.disbursedLoanAmount.patchValue(this.amount)
      }
    })
  }

  stage(event) {
    this.loanTransferStage = event
    if (this.loanTransferStage == '3') {
      // this.approvalForm.disable()
      this.approvalForm.controls.reasonByBM.disable()
      this.approvalForm.controls.loanTransferStatusForBM.disable()
    }
  }


  initForms() {
    this.approvalForm = this.fb.group({
      loanTransferStatusForBM: ['pending', Validators.required],
      loanTransferStatusForAppraiser: ['', Validators.required],
      reasonByBM: ['', Validators.required],
      reasonByAppraiser: ['', Validators.required],
      reason: ['', Validators.required],
    })
    this.disbursalForm = this.fb.group({
      processingCharge: ['', Validators.required],
      disbursedLoanAmount: [],
      loanUniqueId: [],
      transactionId: ['', Validators.required],
      bankTransferType:[null,Validators.required]
    })
  }

  getReasonsList() {
    this.custClassificationService.getReasonsList().pipe(
      map(res => {
        // console.log(res)
        this.reasons = res.data;
      })
    ).subscribe()
  }

  loan(event) {
    this.masterAndLoanIds = event
  }

  patchValue(formControl) {
    // if (this.approvalForm.controls.reason.value == "Other") {
    //   this.approvalForm.controls.reasonByBM.reset()
    // } else {
    //   this.approvalForm.controls.reasonByBM.patchValue(this.approvalForm.controls.reason.value)
    // }

    if (this.approvalForm.controls.reason.value == "Other") {
      this.approvalForm.controls[formControl].reset()
      this.approvalForm.controls[formControl].setValidators([Validators.required])
      this.approvalForm.controls[formControl].updateValueAndValidity()
    } else {
      this.approvalForm.controls[formControl].patchValue(this.approvalForm.controls.reason.value)
      this.approvalForm.controls[formControl].setValidators([])
      this.approvalForm.controls[formControl].updateValueAndValidity()
    }
  }

  approval() {
    if (this.approvalForm.status == 'DISABLED' || this.loanTransferStage == '5') {
      this.next(4)
      return
    }

    if (this.approvalForm.invalid || (this.approvalForm.controls.loanTransferStatusForBM.value == 'pending' && this.loanTransferStage != '3')) {
      this.approvalForm.markAllAsTouched()
      return
    }

    if (this.loanTransferStage == '3') {
      this.loanTransferService.appraiserApproval(this.approvalForm.value, this.masterAndLoanIds).subscribe(res => {
        this.router.navigate(['/admin/loan-management/transfer-loan-list'])
      })
    } else if (this.loanTransferStage == '4') {
      this.loanTransferService.approval(this.approvalForm.value, this.masterAndLoanIds).subscribe(res => {
        if (res) {
          if (this.approvalForm.controls.loanTransferStatusForBM.value == 'approved') {
            this.approvalForm.disable()
            this.amount = res.disbursedLoanAmount
            this.disbursalForm.patchValue(res)
            if (res.loanCurrentStage && this.permission.loanTransferDisbursal) {
              let stage = Number(res.loanCurrentStage) - 1
              this.next(stage)
            } else {
              this.router.navigate(['/admin/loan-management/transfer-loan-list'])
            }
          }
          else {
            this.router.navigate(['/admin/loan-management/transfer-loan-list'])
          }
        }
      }, err => {
      })
    }
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
      // this.selected = 0;
    } else {
      if (event == 3) {
        this.selected = 2
      } else if (event == 4) {
        this.selected = 3
      } else {
        this.selected = event;
      }
      this.stage((event + 1).toString())
    }
    if (this.approvalForm.controls.loanTransferStatusForBM.value != 'approved') {
      for (let index = 0; index < this.disabled.length; index++) {
        if (this.selected >= index) {
          this.disabled[index] = false
        } else {
          this.disabled[index] = true
        }
      }
    }
  }

  statusAppraiser() {

    if (this.approvalForm.controls.loanTransferStatusForAppraiser.value != 'approved') {
      this.approvalForm.controls.reason.setValidators(Validators.required);
      this.approvalForm.controls.reason.updateValueAndValidity()
    } else {
      this.approvalForm.controls.reason.clearValidators();
      this.approvalForm.controls.reason.updateValueAndValidity();
      this.approvalForm.controls.reason.markAsUntouched()
      this.resetAppraiser()
      this.clearAppraiser()
    }
  }

  resetAppraiser() {
    this.approvalForm.controls.reason.patchValue('')
    this.approvalForm.controls.reasonByAppraiser.reset()
  }

  clearAppraiser() {
    this.approvalForm.controls.reasonByAppraiser.clearValidators()
    this.approvalForm.controls.reasonByAppraiser.updateValueAndValidity()
  }

  statusBM() {

    if (this.approvalForm.controls.loanTransferStatusForBM.value != 'approved') {
      this.approvalForm.controls.reason.setValidators(Validators.required);
      this.approvalForm.controls.reason.updateValueAndValidity()
    } else {
      this.approvalForm.controls.reason.clearValidators();
      this.approvalForm.controls.reason.updateValueAndValidity();
      this.approvalForm.controls.reason.markAsUntouched()
      this.resetBM()
      this.clearBM()
    }
  }

  resetBM() {
    this.approvalForm.controls.reason.patchValue('')
    this.approvalForm.controls.reasonByBM.reset()
  }

  clearBM() {
    this.approvalForm.controls.reasonByBM.clearValidators()
    this.approvalForm.controls.reasonByBM.updateValueAndValidity()
  }
}

