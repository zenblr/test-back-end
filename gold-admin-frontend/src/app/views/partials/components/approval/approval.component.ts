import { Component, OnInit, Output, EventEmitter, Input, AfterViewInit, OnChanges, ChangeDetectorRef, SimpleChanges, ChangeDetectionStrategy } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormGroupDirective } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { SharedService } from '../../../../core/shared/services/shared.service';
import { Router } from '@angular/router';
import { LoanApplicationFormService } from '../../../../core/loan-management';
import { ScrapApplicationFormService } from '../../../../core/scrap-management';
import { map } from 'rxjs/operators';
import { Location } from '@angular/common'
import { CustomerClassificationService } from '../../../../core/kyc-settings/services/customer-classification.service';

@Component({
  selector: 'kt-approval',
  templateUrl: './approval.component.html',
  styleUrls: ['./approval.component.scss'],
})
export class ApprovalComponent implements OnInit, AfterViewInit, OnChanges {
  @Input() disable
  @Input() masterAndLoanIds
  @Input() scrapIds
  @Input() invalid;
  @Input() details;
  @Input() scrapDetails;
  @Input() loanStage
  @Input() scrapStage
  // @Output() approvalFormEmit: EventEmitter<any> = new EventEmitter<any>();
  // appraiser = [{ value: 'approved', name: 'approved' }, { value: 'pending', name: 'pending' }, { value: 'rejected', name: 'rejected' }];
  // branchManager = [{ value: 'approved', name: 'approved' }, { value: 'rejected', name: 'rejected' }, { value: 'incomplete', name: 'incomplete' }];
  appraiser: any;
  branchManager: any;
  userType: any = ''
  @Input() action;
  @Output() ornamentType: EventEmitter<any> = new EventEmitter<any>();
  @Output() disbursal: EventEmitter<any> = new EventEmitter<any>();

  // kycStatus = [];
  approvalForm: FormGroup;
  url: string;
  viewBMForm: boolean = true;
  reasons: any[] = [];
  viewOpertaionalForm: boolean = true;
  stage: any;
  constructor(
    private fb: FormBuilder,
    private toastr: ToastrService,
    private sharedSerive: SharedService,
    private ref: ChangeDetectorRef,
    public router: Router,
    public loanFormService: LoanApplicationFormService,
    public scrapApplicationFormService: ScrapApplicationFormService,
    public location: Location,
    private custClassificationService: CustomerClassificationService,

  ) {
    this.initForm();
    this.getReasonsList();
  }

  ngOnInit() {
    this.url = this.router.url.split('/')[3]
    this.sharedSerive.getStatus().subscribe(res => {
      this.appraiser = res.apprsiserOrCCE
      this.branchManager = res.bm
    })
  }

  disableForm(stage) {
    this.stage = stage
    if (stage == 6 || stage == 1) {
      this.controls.loanStatusForBM.disable()
      this.viewBMForm = false;
      this.viewOpertaionalForm = false;

    } else if (stage == 3) {
      this.controls.loanStatusForAppraiser.disable()
      this.viewBMForm = false;
      this.viewOpertaionalForm = false;

    } else if (stage == 2) {
      this.controls.loanStatusForAppraiser.disable()
      this.viewBMForm = true;
      this.viewOpertaionalForm = false;

    } else if (stage == 8) {
      this.controls.loanStatusForAppraiser.disable()
      this.controls.loanStatusForBM.disable()
      this.viewBMForm = true;

    } else if (stage == 7) {
      this.controls.loanStatusForAppraiser.disable()
      this.controls.loanStatusForBM.disable()
      this.viewOpertaionalForm = true;
      this.viewBMForm = true;

    } else {
      this.approvalForm.disable()
      this.viewOpertaionalForm = true;
      this.viewBMForm = true;
    }
  }

  disableScrapForm(stage) {
    this.stage = stage
    if (stage == 6 || stage == 1) {
      this.controls.scrapStatusForBM.disable()
      this.viewBMForm = false;
      this.viewOpertaionalForm = false;

    } else if (stage == 3) {
      this.controls.scrapStatusForAppraiser.disable()
      this.viewBMForm = false;
      this.viewOpertaionalForm = false;

    } else if (stage == 2) {
      this.controls.scrapStatusForAppraiser.disable()
      this.viewBMForm = true;
      this.viewOpertaionalForm = false;

    } else if (stage == 8) {
      this.controls.scrapStatusForAppraiser.disable()
      this.controls.scrapStatusForBM.disable()
      this.viewBMForm = true;

    } else if (stage == 7) {
      this.controls.scrapStatusForAppraiser.disable()
      this.controls.scrapStatusForBM.disable()
      this.viewOpertaionalForm = true;
      this.viewBMForm = true;

    } else {
      this.approvalForm.disable()
      this.viewOpertaionalForm = true;
      this.viewBMForm = true;
    }
  }

  initForm() {
    this.approvalForm = this.fb.group({
      applicationFormForAppraiser: [false],
      goldValuationForAppraiser: [false],
      loanStatusForAppraiser: [, Validators.required],
      commentByAppraiser: [''],
      applicationFormForBM: [false],
      goldValuationForBM: [false],
      loanStatusForBM: [],
      commentByBM: [''],
      reasons: [''],
      applicationFormForOperatinalTeam: [false],
      goldValuationForOperatinalTeam: [false],
      loanStatusForOperatinalTeam: ['pending'],
      commentByOperatinalTeam: [''],
      scrapStatusForAppraiser: [],
      scrapStatusForBM: [],
      scrapStatusForOperatinalTeam: ['pending'],
    })
    this.validation();
  }

  validation() {
    if (this.scrapIds) {
      this.approvalForm.controls.scrapStatusForAppraiser.setValidators(Validators.required),
        this.approvalForm.controls.scrapStatusForAppraiser.updateValueAndValidity()
      this.approvalForm.controls.loanStatusForAppraiser.setValidators([]),
        this.approvalForm.controls.loanStatusForAppraiser.updateValueAndValidity()
    }
  }

  get controls() {
    return this.approvalForm.controls
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.details && changes.details.currentValue) {
      if (changes.action.currentValue == 'edit') {

        this.approvalForm.patchValue(changes.details.currentValue.masterLoan)
        this.approvalForm.patchValue({ commentByAppraiser: changes.details.currentValue.masterLoan.commentByAppraiser })
        if (changes.details.currentValue.masterLoan.commentByAppraiser) {
          this.approvalForm.patchValue({ reasons: changes.details.currentValue.masterLoan.commentByAppraiser })
          let temp = this.reasons.filter(reason => {
            return reason.description == changes.details.currentValue.masterLoan.commentByAppraiser
          })

          if (!temp.length) {
            this.approvalForm.patchValue({ reasons: "Other" })
          } else {
            this.approvalForm.patchValue({ reasons: changes.details.currentValue.masterLoan.commentByAppraiser })
          }
        }
        this.approvalForm.controls.loanStatusForBM.patchValue(changes.details.currentValue.masterLoan.loanStatusForBM)
        this.approvalForm.controls.loanStatusForBM.patchValue(changes.details.currentValue.masterLoan.loanStatusForBM)
        console.log(this.approvalForm.value)
        // this.statusAppraiser()
        // this.statusBM()
        this.ref.detectChanges()

      }
    }

    if (changes.scrapDetails && changes.scrapDetails.currentValue) {
      if (changes.action.currentValue == 'edit') {

        this.approvalForm.patchValue(changes.scrapDetails.currentValue)
        this.approvalForm.patchValue({ commentByAppraiser: changes.scrapDetails.currentValue.commentByAppraiser })
        if (changes.scrapDetails.currentValue.commentByAppraiser) {
          this.approvalForm.patchValue({ reasons: changes.scrapDetails.currentValue.commentByAppraiser })
          let temp = this.reasons.filter(reason => {
            return reason.description == changes.scrapDetails.currentValue.commentByAppraiser
          })

          if (!temp.length) {
            this.approvalForm.patchValue({ reasons: "Other" })
          } else {
            this.approvalForm.patchValue({ reasons: changes.scrapDetails.currentValue.commentByAppraiser })
          }
        }
        this.approvalForm.controls.scrapStatusForBM.patchValue(changes.scrapDetails.currentValue.scrapStatusForBM)
        this.approvalForm.controls.scrapStatusForBM.patchValue(changes.scrapDetails.currentValue.scrapStatusForBM)
        console.log(this.approvalForm.value)
        this.ref.detectChanges()

      }
    }

    if (changes.loanStage && changes.loanStage.currentValue) {
      this.disableForm(changes.loanStage.currentValue.id)
    }

    if (changes.scrapStage && changes.scrapStage.currentValue) {
      this.disableScrapForm(changes.scrapStage.currentValue.id)
    }

    if (changes.disable && changes.disable.currentValue) {
      this.approvalForm.disable()
    }

    if (changes.scrapIds) {
      this.validation();
    }
  }

  ngAfterViewInit() {
    let user = this.sharedSerive.getDataFromStorage()
    if (user.userDetails.userTypeId == 7) {
      this.controls.commentByBM.disable()
    }
    // this.approvalForm.valueChanges.subscribe(() => {
    //   this.approvalFormEmit.emit(this.approvalForm)
    // })
  }

  approvalOfAppraiser(value: boolean, type: string) {
    if ((this.stage == 6 || this.stage == 1) && !this.disable) {
      if (type == 'gold') {
        this.controls.goldValuationForAppraiser.patchValue(value)
      } else {
        this.controls.applicationFormForAppraiser.patchValue(value)
      }
      this.checkforApprovalAppraiser('approved');
    }
  }

  approvalOfBM(value: boolean, type: string) {
    if (this.stage == 2 && !this.disable) {
      if (type == 'gold') {
        this.controls.goldValuationForBM.patchValue(value)
      } else {
        this.controls.applicationFormForBM.patchValue(value)
      }
      this.checkforApprovalBM('approved')
    }
  }

  approvalOfOperational(value: boolean, type: string) {
    if (this.stage == 7 && !this.disable) {
      if (type == 'gold') {
        this.controls.goldValuationForOperatinalTeam.patchValue(value)
      } else {
        this.controls.applicationFormForOperatinalTeam.patchValue(value)
      }
      this.checkforApprovalOT('approved')
    }
  }

  getReasonsList() {
    this.custClassificationService.getReasonsList().pipe(
      map(res => {
        console.log(res)
        this.reasons = res.data;
      })
    ).subscribe()
  }

  statusAppraiser() {
    if (this.scrapIds) {
      if (this.controls.scrapStatusForAppraiser.value != 'approved') {
        this.controls.reasons.setValidators(Validators.required);
        this.controls.reasons.updateValueAndValidity()
      } else {
        this.controls.reasons.clearValidators();
        this.controls.reasons.updateValueAndValidity();
        this.controls.reasons.markAsUntouched()
        this.resetAppraiser()
      }
    } else {
      if (this.controls.loanStatusForAppraiser.value != 'approved') {
        this.controls.reasons.setValidators(Validators.required);
        this.controls.reasons.updateValueAndValidity()
      } else {
        this.controls.reasons.clearValidators();
        this.controls.reasons.updateValueAndValidity();
        this.controls.reasons.markAsUntouched()
        this.resetAppraiser()
      }
    }
  }

  resetAppraiser() {
    this.controls.commentByAppraiser.reset()
  }

  resetBM() {
    this.controls.commentByBM.reset()

  }

  resetOT() {
    this.controls.commentByBM.reset()
  }

  clearAppraiser() {
    this.controls.commentByAppraiser.clearValidators()
    this.controls.commentByAppraiser.updateValueAndValidity()
  }

  patchReason() {
    this.resetAppraiser()
    if (this.controls.reasons.value == 'Other') {
      this.controls.commentByAppraiser.setValidators(Validators.required);
      this.controls.commentByAppraiser.updateValueAndValidity()
    } else {
      this.controls.commentByAppraiser.clearValidators();
      this.controls.commentByAppraiser.updateValueAndValidity();
      this.controls.commentByAppraiser.markAsUntouched()
      this.approvalForm.controls.commentByAppraiser.patchValue(this.controls.reasons.value)
    }
  }

  statusBM() {
    if (this.scrapIds) {
      if (this.controls.scrapStatusForBM.value != 'approved' && this.controls.scrapStatusForBM.value != 'pending') {
        this.controls.commentByBM.setValidators(Validators.required);
        this.controls.commentByBM.updateValueAndValidity()
      } else {
        this.controls.commentByBM.reset();
        this.controls.commentByBM.clearValidators();
        this.controls.commentByBM.updateValueAndValidity();
        this.controls.commentByBM.markAsUntouched()
        this.resetBM()
      }
    } else {
      if (this.controls.loanStatusForBM.value != 'approved' && this.controls.loanStatusForBM.value != 'pending') {
        this.controls.commentByBM.setValidators(Validators.required);
        this.controls.commentByBM.updateValueAndValidity()
      } else {
        this.controls.commentByBM.reset();
        this.controls.commentByBM.clearValidators();
        this.controls.commentByBM.updateValueAndValidity();
        this.controls.commentByBM.markAsUntouched()
        this.resetBM()
      }
    }
    this.ref.markForCheck()
  }

  statusOT() {
    if (this.scrapIds) {
      if (this.controls.scrapStatusForOperatinalTeam.value != 'approved' && this.controls.scrapStatusForOperatinalTeam.value != 'pending') {
        this.controls.commentByOperatinalTeam.setValidators(Validators.required);
        this.controls.commentByOperatinalTeam.updateValueAndValidity()
      } else {
        this.controls.commentByOperatinalTeam.reset();
        this.controls.commentByOperatinalTeam.clearValidators();
        this.controls.commentByOperatinalTeam.updateValueAndValidity();
        this.controls.commentByOperatinalTeam.markAsUntouched()
        this.resetOT()
      }
    } else {
      if (this.controls.loanStatusForOperatinalTeam.value != 'approved' && this.controls.loanStatusForOperatinalTeam.value != 'pending') {
        this.controls.commentByOperatinalTeam.setValidators(Validators.required);
        this.controls.commentByOperatinalTeam.updateValueAndValidity()
      } else {
        this.controls.commentByOperatinalTeam.reset();
        this.controls.commentByOperatinalTeam.clearValidators();
        this.controls.commentByOperatinalTeam.updateValueAndValidity();
        this.controls.commentByOperatinalTeam.markAsUntouched()
        this.resetOT()
      }
    }
  }

  applyForm() {
    if (this.approvalForm.invalid) {
      this.approvalForm.markAllAsTouched()
      return
    }
    if (this.scrapIds) {
      if (this.stage == 2) {
        this.scrapApplicationFormService.bmRating(this.approvalForm.value, this.scrapIds).pipe(
          map(res => {
            this.router.navigate(['/admin/scrap-management/applied-scrap'])
          })).subscribe()
      } else if (this.stage == 7) {
        this.scrapApplicationFormService.opsRating(this.approvalForm.value, this.scrapIds).pipe(
          map(res => {
            if (this.approvalForm.controls.scrapStatusForOperatinalTeam.value == 'approved') {
              this.disableScrapForm(4)
              this.stage = 4
              this.disbursal.emit(4)
            }
            this.router.navigate(['/admin/scrap-management/applied-scrap'])
          })).subscribe()
      } else if (this.stage == 1 || this.stage == 6) {
        this.scrapApplicationFormService.appraiserRating(this.approvalForm.value, this.scrapIds).pipe(
          map(res => {
            if (this.approvalForm.controls.scrapStatusForAppraiser.value == 'approved') {
              this.disableScrapForm(3)
              this.stage = 3
              this.ornamentType.emit(res.ornamentType)
            } else {
              this.router.navigate(['/admin/scrap-management/applied-scrap'])
            }
          })).subscribe();
      }
    } else {
      if (this.stage == 2) {
        this.loanFormService.bmRating(this.approvalForm.value, this.masterAndLoanIds).pipe(
          map(res => {
            this.router.navigate(['/admin/loan-management/applied-loan'])
          })).subscribe()
      } else if (this.stage == 7) {
        this.loanFormService.opsRating(this.approvalForm.value, this.masterAndLoanIds).pipe(
          map(res => {
            if (this.approvalForm.controls.loanStatusForOperatinalTeam.value == 'approved') {
              this.disableForm(4)
              this.stage = 4
              this.disbursal.emit(4)
            }else{
            this.router.navigate(['/admin/loan-management/applied-loan'])
            }
          })).subscribe()
      } else if (this.stage == 1 || this.stage == 6) {
        // this.approvalForm.controls.commentByAppraiser.patchValue(this.controls.reasons.value)
        this.loanFormService.applyForLoan(this.approvalForm.value, this.masterAndLoanIds).pipe(
          map(res => {
            if (this.approvalForm.controls.loanStatusForAppraiser.value == 'approved') {
              this.disableForm(3)
              this.stage = 3
              this.ornamentType.emit(res.ornamentType)
            } else {
              this.router.navigate(['/admin/loan-management/applied-loan'])
            }
          })).subscribe()
      }
    }
  }

  cancel() {
    this.location.back()
  }

  checkforApprovalAppraiser(status) {
    if (status.name == 'approved') {
      if (this.controls.goldValuationForAppraiser.value && this.controls.applicationFormForAppraiser.value) {
        return false
      } else {
        return true
      }
    } else {
      return false
    }
  }

  checkforApprovalBM(status) {
    if (status.name == 'approved') {
      if (this.controls.goldValuationForBM.value && this.controls.applicationFormForBM.value) {
        return false
      } else {
        return true
      }
    } else {
      return false
    }
  }

  checkforApprovalOT(status) {
    if (status.name == 'approved') {
      if (this.controls.goldValuationForOperatinalTeam.value && this.controls.applicationFormForOperatinalTeam.value) {
        return false
      } else {
        return true
      }
    } else {
      return false
    }
  }
}
