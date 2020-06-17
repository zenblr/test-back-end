import { Component, OnInit, EventEmitter, Output, OnChanges, Input, ChangeDetectionStrategy, ChangeDetectorRef, SimpleChanges, AfterViewInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { LoanApplicationFormService } from '../../../../../../../core/loan-management';
import { catchError, map, finalize } from 'rxjs/operators';
import { ToastrService } from 'ngx-toastr';
import { PurposeService } from '../../../../../../../core/masters/purposes/service/purpose.service';

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
  @Input() invalid
  @Input() action;
  @Output() next: EventEmitter<any> = new EventEmitter();
  @Output() laonId: EventEmitter<any> = new EventEmitter();
  @Output() totalEligibleAmt: EventEmitter<any> = new EventEmitter();
  @Output() apiHit: EventEmitter<any> = new EventEmitter();
  @Output() finalLoanAmount: EventEmitter<any> = new EventEmitter();

  currentDate: any = new Date();

  constructor(
    private fb: FormBuilder,
    private datePipe: DatePipe,
    private ref: ChangeDetectorRef,
    private rout: ActivatedRoute,
    public loanApplicationFormService: LoanApplicationFormService,
    public toast: ToastrService,
    public purposeService: PurposeService,
  ) {
    this.initForm()
    this.getPurposeInfo()
  }

  ngAfterViewInit() {
    this.rout.queryParams.subscribe(res => {
      console.log(res)
      if (res.customerID) {
        this.controls.customerUniqueId.patchValue(res.customerID)
        this.getCustomerDetails()
      }
    })

  }

  ngOnInit() {
    // this.basicFormEmit.emit(this.basicForm)
    // this.controls.customerUniqueId.valueChanges.subscribe(() => {
    //   if (this.controls.customerUniqueId.valid) {
    //     this.basicFormEmit.emit(this.basicForm)
    //   }
    // })
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.details) {
      if (changes.action.currentValue == 'add') {
        this.basicForm.controls.mobileNumber.patchValue(this.details.mobileNumber)
        this.basicForm.controls.panCardNumber.patchValue(this.details.panCardNumber)
        this.basicForm.controls.customerId.patchValue(this.details.id)
        this.basicForm.controls.customerUniqueId.enable()
      } else if (changes.action.currentValue == 'edit') {

        this.controls.customerId.patchValue(changes.details.currentValue.customerId)
        this.basicForm.patchValue(changes.details.currentValue.loanPersonalDetail)
        this.currentDate = new Date(changes.details.currentValue.loanPersonalDetail.startDate)
        this.basicForm.controls.startDate.patchValue(this.datePipe.transform(this.currentDate, 'mediumDate'));
        // this.basicFormEmit.emit(this.basicForm)
        this.basicForm.controls.loanId.patchValue(changes.details.currentValue.id)
        this.basicForm.disable()
        this.basicForm.controls.purpose.enable()

        this.ref.detectChanges()
      }
    }
    if (changes.disable && changes.disable.currentValue) {
      this.basicForm.disable()
      this.ref.detectChanges()
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


  getCustomerDetails() {
    if (this.controls.customerUniqueId.valid) {
      this.loanApplicationFormService.customerDetails(this.controls.customerUniqueId.value).pipe(
        map(res => {
          if (res.loanCurrentStage) {
            let stage = res.loanCurrentStage

            stage = Number(stage) - 1;
            this.next.emit(stage)
            this.laonId.emit(res.loanId)
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


  initForm() {
    this.basicForm = this.fb.group({
      customerUniqueId: [, [Validators.required, Validators.minLength(8)]],
      mobileNumber: ['', Validators.required],
      panCardNumber: ['', Validators.required],
      startDate: [this.currentDate],
      customerId: [, Validators.required],
      kycStatus: [, Validators.required],
      purpose: ["", Validators.required],
      loanId: []
    })
  }

  get controls() {
    return this.basicForm.controls
  }

  nextAction() {
    if (this.basicForm.invalid) {
      this.basicForm.markAllAsTouched();
      return
    }
    this.basicForm.enable()
    this.loanApplicationFormService.basicSubmit(this.basicForm.value).pipe(
      map(res => {
        let stage = res.loanCurrentStage
        stage = Number(stage) - 1;
        this.next.emit(stage)
        this.laonId.emit(res.loanId)
      }), catchError(err => {
        this.toast.error(err.error.message)
        throw err
      }), finalize(() => {
        if (this.action == 'edit') {
          this.basicForm.disable()
          this.basicForm.controls.purpose.enable()
        }
      })).subscribe()
  }


}