import { Component, OnInit, EventEmitter, Output, OnChanges, Input, ChangeDetectionStrategy, ChangeDetectorRef, SimpleChanges, AfterViewInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { LoanApplicationFormService } from '../../../../core/loan-management';
import { catchError, map, finalize } from 'rxjs/operators';
import { ToastrService } from 'ngx-toastr';
import { PurposeService } from '../../../../core/masters/purposes/service/purpose.service';
import { ImagePreviewDialogComponent } from '../image-preview-dialog/image-preview-dialog.component';
import { MatDialog } from '@angular/material';
import { AppliedKycService } from '../../../../core/applied-kyc/services/applied-kyc.service';
import { UserReviewComponent } from '../../../pages/admin/kyc-settings/tabs/user-review/user-review.component';
import { LoanTransferService } from '../../../../core/loan-management/loan-transfer/services/loan-transfer.service';
import { ScrapApplicationFormService } from '../../../../core/scrap-management';

@Component({
  selector: 'kt-basic-details',
  templateUrl: './basic-details.component.html',
  styleUrls: ['./basic-details.component.scss'],
  providers: [DatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BasicDetailsComponent implements OnInit, OnChanges, AfterViewInit {
  customerDetail;
  basicForm: FormGroup;
  purpose: any[] = []
  // @Output() basicFormEmit: EventEmitter<any> = new EventEmitter();
  @Input() disable
  @Input() details;
  @Input() scrapDetails;
  @Input() scrapIds
  @Input() invalid
  @Input() action;
  @Output() next: EventEmitter<any> = new EventEmitter();
  @Output() id: EventEmitter<any> = new EventEmitter();
  @Output() totalEligibleAmt: EventEmitter<any> = new EventEmitter();
  @Output() loanStage: EventEmitter<any> = new EventEmitter();
  @Output() scrapStage: EventEmitter<any> = new EventEmitter();
  @Output() apiHit: EventEmitter<any> = new EventEmitter();
  @Output() finalLoanAmount: EventEmitter<any> = new EventEmitter();
  @Output() finalScrapAmount: EventEmitter<any> = new EventEmitter();
  @Output() isPartRelease: EventEmitter<any> = new EventEmitter();
  @Input() loanTransfer
  @Input() showButton

  currentDate: any = new Date();
  url: string;
  scrapUrl: string;

  constructor(
    private fb: FormBuilder,
    private datePipe: DatePipe,
    private ref: ChangeDetectorRef,
    private rout: ActivatedRoute,
    public loanApplicationFormService: LoanApplicationFormService,
    public toast: ToastrService,
    public purposeService: PurposeService,
    private dilaog: MatDialog,
    private appliedKycService: AppliedKycService,
    private dialog: MatDialog,
    private router: Router,
    private loanTransferFormService: LoanTransferService,
    public scrapApplicationFormService: ScrapApplicationFormService,
  ) {
    this.initForm()
    this.url = (this.router.url.split("/")[3]).split("?")[0]
    this.scrapUrl = (this.router.url.split("/")[2]).split("?")[0];
  }

  ngAfterViewInit() {
    this.rout.queryParams.subscribe(res => {
      if (res.customerID) {
        this.controls.requestId.patchValue(res.customerID)
        if (res.customerID && this.url == 'loan-application-form') {
          this.getCustomerDetails();
        } else {
          if (res.customerID && this.url == 'scrap-buying-application-form') {
            this.getScrapCustomerDetails();
          } else {
            this.getCustomerDetailsForTransfer();
          }
          this.basicForm.controls.purpose.clearValidators();
          this.basicForm.controls.purpose.updateValueAndValidity();
        }
      } else {
        if (this.url == 'scrap-buying-application-form') {
          this.basicForm.controls.purpose.clearValidators();
          this.basicForm.controls.purpose.updateValueAndValidity();
        } else {
          this.controls.requestId.patchValue(res.transferLoanCustomerID)
          this.getTransferLoanDetailsToApplyLoan()
        }
      }

      if (res.partReleaseId && res.customerUniqueId) {
        this.controls.customerUniqueId.patchValue(res.customerUniqueId)
        this.getPartReleaseCustomerDetails(res.partReleaseId)
      }

    })
  }

  ngOnInit() {
    if (!(this.url == 'scrap-buying-application-form' || this.scrapIds)) {
      this.getPurposeInfo();
    }
  }

  initForm() {
    this.basicForm = this.fb.group({
      customerUniqueId: [, [Validators.required, Validators.minLength(8)]],
      mobileNumber: ['', Validators.required],
      panCardNumber: [''],
      startDate: [this.currentDate],
      customerId: [, Validators.required],
      kycStatus: [],
      purpose: ['', Validators.required],
      panType: [],
      loanId: [],
      scrapId: [],
      masterLoanId: [],
      panImage: [],
      partReleaseId: [],
      requestId: []
    })
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.details && changes.details.currentValue) {
      if (changes.action.currentValue == 'add') {
        this.basicForm.controls.mobileNumber.patchValue(changes.details.currentValue.mobileNumber)
        this.basicForm.controls.customerId.patchValue(changes.details.currentValue.id)
        this.basicForm.controls.customerUniqueId.enable()
        this.ref.detectChanges()
      } else if (changes.action.currentValue == 'edit') {
        this.controls.customerId.patchValue(changes.details.currentValue.customerId)
        this.basicForm.patchValue(changes.details.currentValue.loanPersonalDetail)
        this.currentDate = new Date(changes.details.currentValue.loanPersonalDetail.startDate)
        this.basicForm.controls.startDate.patchValue(this.datePipe.transform(this.currentDate, 'mediumDate'));
        this.basicForm.patchValue(changes.details.currentValue.customer)
        this.basicForm.controls.loanId.patchValue(changes.details.currentValue.id)
        this.basicForm.controls.requestId.patchValue(changes.details.currentValue.masterLoan.appraiserRequestId)
        this.ref.detectChanges()
      }
    }
    if (changes.scrapDetails && changes.scrapDetails.currentValue) {
      if (changes.action.currentValue == 'add') {
        this.basicForm.controls.mobileNumber.patchValue(changes.details.currentValue.mobileNumber)
        this.basicForm.controls.customerId.patchValue(changes.details.currentValue.id)
        this.basicForm.controls.customerUniqueId.enable()
        this.ref.detectChanges()
      } else if (changes.action.currentValue == 'edit') {
        this.controls.customerId.patchValue(changes.scrapDetails.currentValue.customerId)
        this.basicForm.patchValue(changes.scrapDetails.currentValue.scrapPersonalDetail)
        this.currentDate = new Date(changes.scrapDetails.currentValue.scrapPersonalDetail.startDate)
        this.basicForm.controls.startDate.patchValue(this.datePipe.transform(this.currentDate, 'mediumDate'));
        this.basicForm.patchValue(changes.scrapDetails.currentValue.customer)
        this.basicForm.controls.scrapId.patchValue(changes.scrapDetails.currentValue.id)
        this.basicForm.controls.kycStatus.patchValue(changes.scrapDetails.currentValue.customer.scrapKycStatus);
        this.ref.detectChanges()
      }
    }
    if (changes.disable && changes.disable.currentValue) {
      this.basicForm.disable()
      this.ref.detectChanges()
    }
    if (changes.loanTransfer && changes.loanTransfer.currentValue) {
      this.basicForm.controls.purpose.disable()
      this.basicForm.controls.requestId.patchValue(changes.loanTransfer.currentValue.masterLoan.appraiserRequestId)
      this.controls.customerId.patchValue(changes.loanTransfer.currentValue.customer.id)
      this.basicForm.patchValue(changes.loanTransfer.currentValue.customer)
      this.basicForm.patchValue(changes.loanTransfer.currentValue.loanPersonalDetail)
      this.currentDate = new Date(changes.loanTransfer.currentValue.loanPersonalDetail.startDate)
      this.basicForm.controls.startDate.patchValue(this.datePipe.transform(this.currentDate, 'mediumDate'));

      if (changes.loanTransfer.currentValue.masterLoan.loanTransfer.loanTransferStatusForBM == 'approved') {
        this.disable = true
      }

    }
  }

  getPurposeInfo() {
    this.purposeService.getAllPurpose(1, -1, '').subscribe(
      res => {
        this.purpose = res.data;
        this.ref.detectChanges()
      }
    )
  }

  getPartReleaseCustomerDetails(partReleaseId) {
    const params = {
      partReleaseId: partReleaseId,
      customerUniqueId: this.controls.customerUniqueId.value
    }
    if (this.controls.customerUniqueId.valid) {
      this.loanApplicationFormService.applyLoanFromPartRelease(params).pipe(map(res => {
        console.log(res)
        if (res.loanCurrentStage) {
          this.isPartRelease.emit(true)
          let stage = res.loanCurrentStage

          stage = Number(stage) - 1;
          this.next.emit(stage)
          this.id.emit({ loanId: res.loanId, masterLoanId: res.masterLoanId })
          if (stage >= 1) {
            this.apiHit.emit(res.loanId)
          }
          if (res.totalEligibleAmt)
            this.totalEligibleAmt.emit(res.totalEligibleAmt)
          if (res.finalLoanAmount)
            this.finalLoanAmount.emit(res.finalLoanAmount)
        } else {
          this.customerDetail = res.customerData
          this.basicForm.patchValue(this.customerDetail)
          this.basicForm.patchValue({ customerId: this.customerDetail.id, partReleaseId: res.partReleaseId })
        }
      })).subscribe()
    }
  }

  getTransferLoanDetailsToApplyLoan() {
    if (this.controls.requestId.value) {
      this.loanTransferFormService.getTransferLoanDetailsToApplyLoan(this.controls.requestId.value).pipe(
        map(res => {
          if (res.loanCurrentStage) {
            let stage = res.loanCurrentStage
            stage = Number(stage) - 1;
            this.next.emit(stage)
            this.id.emit({ loanId: res.loanId, masterLoanId: res.masterLoanId })
            this.basicForm.patchValue({ loanId: res.loanId, masterLoanId: res.masterLoanId })
            if (stage >= 1) {
              this.apiHit.emit(res.loanId)
            } else {
              this.customerDetail = res.customerData
              this.basicForm.patchValue(this.customerDetail)
              this.basicForm.controls.customerId.patchValue(this.customerDetail.id)
            }
          }
        }),
        catchError(err => {
          if (err.error.message)
            this.toast.error(err.error.message)
          throw err;
        })
      ).subscribe()
    }
  }

  getCustomerDetailsForTransfer() {

    if (this.controls.requestId.value) {
      this.loanTransferFormService.getCustomerDetailsForTransfer(this.controls.requestId.value).pipe(
        map(res => {
          this.action = "add"
          if (res.loanCurrentStage) {
            let stage = res.loanCurrentStage
            stage = Number(stage) - 1;

            this.next.emit(stage)
            this.id.emit({ loanId: res.loanId, masterLoanId: res.masterLoanId })
            if (stage >= 1) {
              this.apiHit.emit(res.loanId)
            } else {
              this.customerDetail = res.customerData
              this.basicForm.patchValue(this.customerDetail)
              this.basicForm.controls.customerId.patchValue(this.customerDetail.id)
            }
          }
        })
      ).subscribe()
    }
  }

  getCustomerDetails() {
    if (this.controls.requestId.value) {
      this.loanApplicationFormService.customerDetails(this.controls.requestId.value).pipe(
        map(res => {
          if (res.loanCurrentStage) {
            let stage = res.loanCurrentStage
            stage = Number(stage) - 1;
            this.next.emit(stage)
            this.id.emit({ loanId: res.loanId, masterLoanId: res.masterLoanId })
            if (stage >= 1) {
              this.apiHit.emit(res.loanId)
            }
            if (res.totalEligibleAmt)
              this.totalEligibleAmt.emit(res.totalEligibleAmt)
            if (res.finalLoanAmount)
              this.finalLoanAmount.emit(res.finalLoanAmount)
          } else {
            this.customerDetail = res.customerData
            this.basicForm.patchValue(this.customerDetail)
            this.basicForm.controls.customerId.patchValue(this.customerDetail.id)
          }
        }),
        catchError(err => {
          this.toast.error(err.error.message)
          throw err;
        })
      ).subscribe()
    }
  }

  getScrapCustomerDetails() {
    if (this.controls.requestId.value) {
      this.scrapApplicationFormService.customerDetails(this.controls.requestId.value).pipe(
        map(res => {
          if (res.scrapCurrentStage) {
            let stage = res.scrapCurrentStage;
            stage = Number(stage) - 1;
            this.next.emit(stage);
            this.id.emit({ scrapId: res.scrapId });
            if (stage >= 1) {
              this.apiHit.emit(res.scrapId);
            }
            if (res.totalEligibleAmt) {
              this.totalEligibleAmt.emit(res.totalEligibleAmt);
            }
            if (res.finalScrapAmount) {
              this.finalScrapAmount.emit(res.finalScrapAmount);
            }
          } else {
            this.customerDetail = res.customerData;
            this.basicForm.patchValue(this.customerDetail);
            this.basicForm.controls.kycStatus.patchValue(this.customerDetail.scrapKycStatus);
            this.basicForm.controls.customerId.patchValue(this.customerDetail.id);
          }
          this.basicForm.disable()
        }),
        catchError(err => {
          this.toast.error(err.error.message)
          throw err;
        })
      ).subscribe();
    }
  }

  get controls() {
    return this.basicForm.controls
  }

  nextAction() {

    if (this.disable) {
      this.next.emit(1)
      return
    }

    if (this.basicForm.invalid) {
      this.basicForm.markAllAsTouched();
      return
    }
    this.basicForm.enable()
    if (this.url == "loan-application-form") {
      this.loanApplicationFormService.basicSubmit(this.basicForm.value).pipe(
        map(res => {
          let stage = res.loanCurrentStage
          stage = Number(stage) - 1;
          this.next.emit(stage)
          this.id.emit({ loanId: res.loanId, masterLoanId: res.masterLoanId })
          this.loanStage.emit(res.loanstage)
        }), catchError(err => {
          this.toast.error(err.error.message)
          throw err
        }), finalize(() => {
          if (this.action == 'edit') {
            this.basicForm.disable()
            this.basicForm.controls.purpose.enable()
          }
        })).subscribe();
    } else if (this.url == 'scrap-buying-application-form') {
      this.scrapApplicationFormService.basicSubmit(this.basicForm.value).pipe(
        map(res => {
          let stage = res.scrapCurrentStage
          stage = Number(stage) - 1;
          this.next.emit(stage)
          this.id.emit({ scrapId: res.scrapId })
          this.scrapStage.emit(res.scrapStage)
        }), catchError(err => {
          this.toast.error(err.error.message)
          throw err
        }), finalize(() => {
          if (this.action == 'edit') {
            this.basicForm.disable();
            this.basicForm.controls.purpose.enable();
          }
        })).subscribe();
    } else {
      this.loanTransferFormService.basicSubmit(this.basicForm.value).pipe(
        map(res => {
          let stage = res.loanCurrentStage
          stage = Number(stage) - 1;
          this.next.emit(stage)
          this.id.emit({ loanId: res.loanId, masterLoanId: res.masterLoanId })
        }), catchError(err => {
          this.toast.error(err.error.message)
          throw err
        })).subscribe()
    }
  }

  preview(images) {
    this.dilaog.open(ImagePreviewDialogComponent, {
      data: {
        images: [images],
        index: 0
      },
      width: "auto"
    })
  }

  viewKYC() {
    // this.dialog.open(UserReviewComponent)
    const params = { customerId: this.controls.customerId.value };
    this.appliedKycService.editKycDetails(params).subscribe(res => {
      const dialogRef = this.dialog.open(UserReviewComponent, { data: { action: 'view' }, width: '900px' });
    })
  }

}
