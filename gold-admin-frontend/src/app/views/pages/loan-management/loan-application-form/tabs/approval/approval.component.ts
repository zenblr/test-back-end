import { Component, OnInit, Output, EventEmitter, Input, AfterViewInit, OnChanges, ChangeDetectorRef, SimpleChanges } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormGroupDirective } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { SharedService } from '../../../../../../core/shared/services/shared.service';
import { Router } from '@angular/router';
import { LoanApplicationFormService } from '../../../../../../core/loan-management';
import { map } from 'rxjs/operators';
import { Location } from '@angular/common'

@Component({
  selector: 'kt-approval',
  templateUrl: './approval.component.html',
  styleUrls: ['./approval.component.scss']
})
export class ApprovalComponent implements OnInit, AfterViewInit, OnChanges {
  @Input() disable
  @Input() loanId
  @Input() invalid;
  @Input() details;
  // @Output() approvalFormEmit: EventEmitter<any> = new EventEmitter<any>();
  appraiser = [{ value: 'approved', name: 'approved' }, { value: 'pending', name: 'pending' }, { value: 'rejected', name: 'rejected' }];
  branchManager = [{ value: 'approved', name: 'approved' }, { value: 'rejected', name: 'rejected' }, { value: 'incomplete', name: 'incomplete' }];
  userType: any = ''
  @Input() action;
  // @Output() apply: EventEmitter<any> = new EventEmitter<any>();

  // kycStatus = [];
  approvalForm: FormGroup;
  url: string;
  viewBMForm = true;
  constructor(
    private fb: FormBuilder,
    private toastr: ToastrService,
    private sharedSerive: SharedService,
    private ref: ChangeDetectorRef,
    public router: Router,
    public loanFormService: LoanApplicationFormService,
    public location: Location,
  ) { }

  ngOnInit() {
    this.url = this.router.url.split('/')[2]
    this.initForm();
    this.getRoles()
  }
  getRoles() {
    let res = this.sharedSerive.getDataFromStorage()
    this.userType = res.userDetails.userTypeId
    if (this.userType == 7) {
      this.controls.loanStatusForBM.disable()
      this.viewBMForm = false;
    } else if (this.userType == 5) {
      this.controls.loanStatusForAppraiser.disable()
    } else {
      this.approvalForm.disable()
    }
  }

  initForm() {
    this.approvalForm = this.fb.group({
      applicationFormForAppraiser: [false],
      goldValuationForAppraiser: [false],
      loanStatusForAppraiser: ['', Validators.required],
      commentByAppraiser: [''],
      applicationFormForBM: [false],
      goldValuationForBM: [false],
      loanStatusForBM: ['pending'],
      commentByBM: [''],
    })
    // this.approvalFormEmit.emit(this.approvalForm)

  }
  get controls() {
    return this.approvalForm.controls
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.details) {
      if (changes.action.currentValue == 'edit') {
        this.approvalForm.patchValue(changes.details.currentValue)
        this.statusAppraiser()
        this.statusBM()
        this.ref.markForCheck()
      }
    }
    if (this.invalid) {
      this.approvalForm.markAllAsTouched()
    }
    if (this.disable) {
      this.approvalForm.disable()
    }
  }

  ngAfterViewInit() {
    let user = this.sharedSerive.getDataFromStorage()
    if(user.userDetails.userTypeId == 7){
      this.controls.commentByBM.disable()
    }
    // this.approvalForm.valueChanges.subscribe(() => {
    //   this.approvalFormEmit.emit(this.approvalForm)
    // })
  }

  approvalOfAppraiser(value: boolean, type: string) {
    if (this.userType == 7 && !this.disable) {
      if (type == 'gold') {
        this.controls.goldValuationForAppraiser.patchValue(value)
      } else {
        this.controls.applicationFormForAppraiser.patchValue(value)
      }
    }
  }
  approvalOfBM(value: boolean, type: string) {
    if (this.userType == 5 && !this.disable) {
      if (type == 'gold') {
        this.controls.goldValuationForBM.patchValue(value)
      } else {
        this.controls.applicationFormForBM.patchValue(value)
      }
    }
  }
  statusAppraiser() {
    if (this.controls.loanStatusForAppraiser.value != 'approved') {
      this.controls.commentByAppraiser.setValidators(Validators.required);
      this.controls.commentByAppraiser.updateValueAndValidity()
    } else {
      this.controls.commentByAppraiser.reset()
      this.controls.commentByAppraiser.clearValidators();
      this.controls.commentByAppraiser.updateValueAndValidity();
      this.controls.commentByAppraiser.markAsUntouched()
    }
  }
  statusBM() {
    if (this.controls.loanStatusForBM.value != 'approved') {
      this.controls.commentByBM.setValidators(Validators.required);
      this.controls.commentByBM.updateValueAndValidity()
    } else {
      this.controls.commentByBM.reset();
      this.controls.commentByBM.clearValidators();
      this.controls.commentByBM.updateValueAndValidity();
      this.controls.commentByBM.markAsUntouched()
    }
  }

  applyForm() {
    this.loanFormService.applyForLoan(this.approvalForm.value, this.loanId).pipe(
      map(res => {
        this.router.navigate(['/loan-management/applied-loan'])
      })).subscribe()
  }
  cancel() {
    this.location.back()
  }

}
