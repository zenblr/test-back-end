import { Component, OnInit, Inject, Input, SimpleChanges } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { AppliedLoanService } from '../../../../core/loan-management';
import { AppliedScrapService } from '../../../../core/scrap-management';
import { map, catchError, finalize } from 'rxjs/operators';
import { ToastrService } from 'ngx-toastr';
import { GlobalSettingService } from '../../../../core/global-setting/services/global-setting.service';
import { Router } from '@angular/router';
import { Location } from '@angular/common';

@Component({
  selector: 'kt-disburse',
  templateUrl: './disburse.component.html',
  styleUrls: ['./disburse.component.scss']
})
export class DisburseComponent implements OnInit {
  @Input() masterAndLoanIds
  @Input() scrapIds
  @Input() disbursementDetails;
  @Input() showButton;
  @Input() loanDetials;
  @Input() disable;
  currentDate = new Date()
  disburseForm: FormGroup
  details: any;
  globalValue: any;

  constructor(
    public dialogRef: MatDialogRef<DisburseComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private fb: FormBuilder,
    public loanService: AppliedLoanService,
    public appliedScrapService: AppliedScrapService,
    public toast: ToastrService,
    public globalSettingService: GlobalSettingService,
    public router: Router,
    public location: Location,
  ) {
    this.globalSettingService.globalSetting$.subscribe(res => {
      // console.log(res)
      this.globalValue = res;
    })
    this.initForm()
  }

  ngOnInit() { }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.masterAndLoanIds && changes.masterAndLoanIds.currentValue) {
      this.disburseForm.patchValue(this.masterAndLoanIds)
      this.getBankDetails()
    }
    if (changes.loanDetials && changes.loanDetials.currentValue) {
      this.disburseForm.patchValue({
        securedTransactionId: changes.loanDetials.currentValue.customerLoanDisbursement[0].transactionId,
      })
      if (changes.loanDetials.currentValue.customerLoanDisbursement.length > 1) {
        console.log(changes.loanDetials.currentValue.customerLoanDisbursement)
        this.disburseForm.patchValue({
          unsecuredTransactionId: changes.loanDetials.currentValue.customerLoanDisbursement[1].transactionId
        })
      }

      // if (this.disable) {
      //   this.disburseForm.disable()
      // }
    }
    if (this.disable) {
      this.disburseForm.disable()
    }
    if (changes.scrapIds && changes.scrapIds.currentValue) {
      this.disburseForm.patchValue(this.scrapIds)
      this.getScrapBankDetails()
      this.validation()
    }
    if (changes.disbursementDetails.currentValue && changes.disbursementDetails.currentValue.scrapDisbursement) {
      this.disburseForm.patchValue(changes.disbursementDetails.currentValue.scrapDisbursement);
      this.disburseForm.disable()
    }
  }

  initForm() {
    this.disburseForm = this.fb.group({
      loanId: [],
      securedTransactionId: ['', [Validators.required]],
      unsecuredTransactionId: ['', Validators.required],
      date: [this.currentDate, Validators.required],
      paymentMode: [''],
      loanAmount: [],
      disbursementStatus: [''],
      otp: [],
      ifscCode: ['', [Validators.required, Validators.pattern('[A-Za-z]{4}[a-zA-Z0-9]{7}')]],
      bankName: ['', [Validators.required, Validators.pattern('^[a-zA-Z][a-zA-Z\-\\s]*$')]],
      bankBranch: ['', [Validators.required, Validators.pattern('^[a-zA-Z][a-zA-Z\-\\s]*$')]],
      accountHolderName: ['', [Validators.required, Validators.pattern('^[a-zA-Z][a-zA-Z\-\\s]*$')]],
      accountNumber: ['', Validators.required],
      passbookStatementChequeId: [],
      passbookImg: [],
      passbookImgName: [],
      masterLoanId: [],
      securedSchemeName: [],
      unsecuredLoanAmount: [],
      unsecuredSchemeName: [],
      securedLoanAmount: [],
      securedLoanId: [],
      unsecuredLoanId: [],
      scrapId: [],
      scrapAmount: [],
      transactionId: [],
      fullSecuredAmount: [],
      fullUnsecuredAmount: [],
      processingCharge: [],
      isUnsecuredSchemeApplied: [],
      securedLoanUniqueId: [],
      unsecuredLoanUniqueId: []
    })
    this.disableSchemeRelatedField()
  }

  validation() {
    if (this.scrapIds) {
      this.disburseForm.controls.securedTransactionId.setValidators([]),
        this.disburseForm.controls.securedTransactionId.updateValueAndValidity()
      this.disburseForm.controls.unsecuredTransactionId.setValidators([]),
        this.disburseForm.controls.unsecuredTransactionId.updateValueAndValidity()
      this.disburseForm.controls.transactionId.setValidators(Validators.required),
        this.disburseForm.controls.transactionId.updateValueAndValidity()
    }
  }

  disableSchemeRelatedField() {
    this.controls.securedSchemeName.disable()
    this.controls.unsecuredLoanAmount.disable()
    this.controls.unsecuredSchemeName.disable()
    this.controls.securedLoanAmount.disable()
    this.controls.processingCharge.disable()
    this.controls.fullUnsecuredAmount.disable()
  }

  enableSchemeRelatedField() {
    this.controls.securedSchemeName.enable()
    this.controls.unsecuredLoanAmount.enable()
    this.controls.unsecuredSchemeName.enable()
    this.controls.securedLoanAmount.enable()
    this.controls.processingCharge.disable()
    this.controls.fullUnsecuredAmount.disable()
  }

  getBankDetails() {
    console.log(this.masterAndLoanIds)
    this.loanService.getBankDetails(this.masterAndLoanIds.loanId, this.masterAndLoanIds.masterLoanId).subscribe(res => {
      if (Object.keys(res.data).length) {
        this.details = res.data
        this.patchValue(res.data.paymentType)
        this.disburseForm.patchValue(res.data)
        if (!this.details.isUnsecuredSchemeApplied) {
          this.controls.unsecuredTransactionId.clearValidators()
          this.controls.unsecuredTransactionId.updateValueAndValidity()
        }
        this.disburseForm.patchValue({ loanAmount: res.data.finalLoanAmount })
        if (Number(this.globalValue.cashTransactionLimit) < Number(this.disburseForm.controls.loanAmount.value)) {
          this.disburseForm.controls.paymentMode.patchValue('bank')
          this.disburseForm.controls.paymentMode.disable()
          return
        }
        this.disburseForm.controls.paymentMode.patchValue(res.data.paymentType)

      }
    })
  }

  getScrapBankDetails() {
    console.log(this.scrapIds)
    this.appliedScrapService.getScrapBankDetails(this.scrapIds.scrapId).subscribe(res => {
      if (Object.keys(res.data).length) {
        this.details = res.data
        this.patchValue(res.data.paymentType)
        this.disburseForm.patchValue(res.data)
        this.disburseForm.patchValue({ scrapAmount: res.data.finalScrapAmount })
        if (Number(this.globalValue.cashTransactionLimit) < Number(this.disburseForm.controls.scrapAmount.value)) {
          this.disburseForm.controls.paymentMode.patchValue('bank')
          this.disburseForm.controls.paymentMode.disable()
          return
        }
        this.disburseForm.controls.paymentMode.patchValue(res.data.paymentType)
      }
    })
  }

  formDisable() {
    this.controls.loanAmount.disable();
    this.controls.ifscCode.disable()
    this.controls.bankName.disable()
    this.controls.bankBranch.disable()
    this.controls.accountHolderName.disable()
    this.controls.accountNumber.disable()
    this.controls.passbookStatementChequeId.disable()
    this.controls.passbookImgName.disable()
  }

  conditionalDisable() {
    this.controls.loanAmount.disable();
    if (this.details.userBankDetail.ifscCode) {
      this.controls.ifscCode.disable()
    } else {
      this.controls.ifscCode.enable()
    }
    if (this.details.userBankDetail.bankName) {
      this.controls.bankName.disable()
    } else {
      this.controls.bankName.enable()
    }
    if (this.details.userBankDetail.bankBranchName) {
      this.controls.bankBranch.disable()
    } else {
      this.controls.bankBranch.enable()
    }
    if (this.details.userBankDetail.accountHolderName) {
      this.controls.accountHolderName.disable()
    } else {
      this.controls.accountHolderName.enable()
    }
    if (this.details.userBankDetail.accountNumber) {
      this.controls.accountNumber.disable()
    } else {
      this.controls.accountNumber.enable()
    }
    this.controls.passbookStatementChequeId.disable()
    this.controls.passbookImgName.disable()
  }

  formEnable() {
    this.controls.loanAmount.enable()
    this.controls.ifscCode.enable()
    this.controls.bankName.enable()
    this.controls.bankBranch.enable()
    this.controls.accountHolderName.enable()
    this.controls.accountNumber.enable()
    this.controls.passbookStatementChequeId.enable()
    this.controls.passbookImgName.enable()
  }

  get controls() {
    return this.disburseForm.controls
  }

  action(event) {
    if (event) {
      this.submit()
    } else if (!event) {
      this.location.back();
    }
  }

  submit() {
    if (this.disburseForm.invalid) {
      this.disburseForm.markAllAsTouched()
      return
    }
    this.formEnable()
    this.enableSchemeRelatedField()
    if (this.scrapIds) {
      this.appliedScrapService.disburse(this.disburseForm.value).pipe(
        map(res => {
          this.toast.success(res.message)
          this.router.navigate(['/admin/scrap-management/applied-scrap'])
        }),
        catchError(err => {
          if (err.error.message)
            this.toast.error(err.error.message);
          throw err
        }), finalize(() => {
          this.formDisable()
          this.disableSchemeRelatedField()
        })).subscribe()
    } else {
      this.loanService.disburse(this.disburseForm.value).pipe(
        map(res => {
          this.toast.success(res.message)
          this.router.navigate(['/admin/loan-management/applied-loan'])
        }),
        catchError(err => {
          if (err.error.message)
            this.toast.error(err.error.message);
          throw err
        }), finalize(() => {
          this.formDisable()
          this.disableSchemeRelatedField()
        })).subscribe()
    }
  }

  generateOTP() {
    this.loanService.generateOTP('id').pipe(
      map(res => {
        // console.log(res);
      })).subscribe()
  }

  setConditionalValidation(event) {
    // console.log(event.target.value)
    let selectedType = event.target.value;
    this.patchValue(selectedType)
    // if (selectedType == 'bank') {
    //   this.controls.otp.setValidators(Validators.required);
    // } else {
    //   this.controls.otp.clearAsyncValidators();
    // }
    // this.disburseForm.updateValueAndValidity();

  }

  patchValue(value) {
    if (value == "bank") {
      this.disburseForm.patchValue(this.details.userBankDetail)
      this.disburseForm.patchValue({ bankBranch: this.details.userBankDetail.bankBranchName })
      this.controls.disbursementStatus.patchValue('Disbursed to Customer')
      this.conditionalDisable()
    } else if (value == "cash") {
      if (this.details.branchBankDetail) {
        this.disburseForm.patchValue(this.details.branchBankDetail)
        this.controls.disbursementStatus.patchValue('Disbursed to Bank')
        this.formDisable()
      }
    }
  }

}
