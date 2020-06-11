import { Component, OnInit, Input, EventEmitter, Output, AfterViewInit, ViewChild, ElementRef, OnChanges, ChangeDetectorRef, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PartnerService } from '../../../../../../../core/user-management/partner/services/partner.service';
import { DatePipe } from '@angular/common';
import { LoanApplicationFormService } from '../../../../../../../core/loan-management';
import { catchError, map } from 'rxjs/operators';

@Component({
  selector: 'kt-interest-calculator',
  templateUrl: './interest-calculator.component.html',
  styleUrls: ['./interest-calculator.component.scss'],
  providers: [DatePipe]
})
export class InterestCalculatorComponent implements OnInit {

  @Input() details;
  @Input() disable
  currentDate = new Date();
  isUnSecuredSchemeApplied: boolean = false;
  colJoin: any;
  securedInterestAmount: any = 0;
  unSecuredInterestAmount: any = 0;
  totalinterestAmount: any = 0;
  dateOfPayment: any[] = []
  partnerList: any[] = [];
  schemesList: any = [];
  tenure = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
  repayType = [{ name: "monthly", value: 30 },
  { name: "quarterly", value: 90 },
  { name: "half Yearly", value: 180 }]
  selectedScheme: any = []
  finalInterestForm: FormGroup;
  @Input() invalid;
  @Input() totalAmt = 0;
  // @Output() interestFormEmit: EventEmitter<any> = new EventEmitter<any>();
  @Output() next: EventEmitter<any> = new EventEmitter<any>();
  @Input() action;
  @Input() loanId
  @Output() finalLoanAmount: EventEmitter<any> = new EventEmitter();

  @ViewChild('print', { static: false }) print: ElementRef
  editedDate: any;
  paymentType: string;
  approved: boolean = false
  constructor(
    private fb: FormBuilder,
    private partnerService: PartnerService,
    public eleRef: ElementRef,
    public datePipe: DatePipe,
    public ref: ChangeDetectorRef,
    public loanFormService: LoanApplicationFormService
  ) {
    this.initForm();
  }

  ngOnInit() {

  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.totalAmt) {
      if (changes.totalAmt.currentValue != changes.totalAmt.previousValue && changes.totalAmt.currentValue != 0) {
        this.partner()
      }
    }
    if (changes.details) {
      if (changes.action.currentValue == 'edit') {
        if (changes.details.currentValue && changes.details.currentValue.finalLoan) {

          this.finalInterestForm.patchValue(changes.details.currentValue.finalLoan)

          if (changes.details.currentValue.loanStatusForBM == "approved")
            this.approved = true;

          // this.finalInterestForm.controls.loanStartDate.patchValue(new Date(changes.details.currentValue.finalLoan.loanStartDate))
          this.editedDate = changes.details.currentValue.finalLoan.loanStartDate;
          this.currentDate = new Date(changes.details.currentValue.finalLoan.loanStartDate)
          this.finalInterestForm.controls.loanStartDate.patchValue(this.datePipe.transform(this.currentDate, 'mediumDate'));
          this.finalInterestForm.controls.schemeId.patchValue(changes.details.currentValue.finalLoan.schemeId)
          this.finalInterestForm.controls.interestRate.patchValue(changes.details.currentValue.finalLoan.interestRate)

          this.returnScheme()
          this.scheme()
          this.calcInterestAmount()
          this.ref.markForCheck()

        }
      }
    }
    if (changes.disable && changes.disable.currentValue) {
      this.finalInterestForm.disable()
    }
    if (this.invalid) {
      this.finalInterestForm.markAllAsTouched()
    }
  }

  partner() {
    this.partnerService.getPartnerBySchemeAmount(Math.floor(this.totalAmt)).subscribe(res => {
      this.partnerList = res['data'];
      if (this.controls.schemeId.value) {
        this.amountValidation()
        this.returnScheme()
        this.scheme()
        this.calcInterestAmount()
      }
    })
  }

  getSchemes() {
    this.dateOfPayment = []
    this.schemesList = []
    this.controls.schemeId.reset()
    this.controls.interestRate.reset()
    this.controls.totalFinalInterestAmt.reset()
    this.controls.paymentFrequency.reset()
    this.controls.schemeId.patchValue('')
    this.controls.paymentFrequency.patchValue('')
    this.returnScheme()
  }

  returnScheme() {
    let temp = this.partnerList.filter(part => {
      return part.id == this.controls.partnerId.value
    })
    if (temp.length)
      this.schemesList = temp[0].schemes;
  }

  initForm() {
    this.finalInterestForm = this.fb.group({
      partnerId: ['', [Validators.required]],
      schemeId: ['', [Validators.required]],
      finalLoanAmount: [, [Validators.required, Validators.pattern('^\\s*(?=.*[1-9])\\d*(?:\\.\\d{1,2})?\\s*$')]],
      tenure: [, [Validators.required]],
      loanStartDate: [this.currentDate],
      loanEndDate: [, [Validators.required]],
      paymentFrequency: [, [Validators.required]],
      totalFinalInterestAmt: [],
      interestRate: [, [Validators.required, Validators.pattern('(^100(\\.0{1,2})?$)|(^([1-9]([0-9])?|0)(\\.[0-9]{1,2})?$)')]], processingCharge: [],
      processingChargeFixed: [, [Validators.required, Validators.pattern('^\\s*(?=.*[1-9])\\d*(?:\\.\\d{1,2})?\\s*$')]],
    })

    // this.interestFormEmit.emit(this.finalInterestForm)
  }

  ngAfterViewInit() {
    // this.finalInterestForm.valueChanges.subscribe(() => {
    //   this.interestFormEmit.emit(this.finalInterestForm)
    // })
  }

  setEndDate() {
    this.dateOfPayment = []
    if (this.controls.loanStartDate.valid && this.controls.tenure.valid) {
      let startDate = this.controls.loanStartDate.value;
      let date = new Date(startDate)
      this.controls.loanEndDate.patchValue(new Date(date.setDate(date.getDate() + (Number(this.controls.tenure.value)) * 30)))
    } else {
      this.controls.loanStartDate.markAsTouched()
    }
  }

  scheme() {
    this.selectedScheme = this.schemesList.filter(scheme => {
      return scheme.id == this.controls.schemeId.value
    })
    this.selectedScheme[0].maximumPercentageAllowed = 67 // remove
    this.amountValidation()
    this.getIntrest()
  }

  amountValidation() {
    this.dateOfPayment = []
    const scheme = this.selectedScheme[0]

    if (this.controls.partnerId.valid && this.controls.finalLoanAmount.value && this.selectedScheme.length) {
      let amt = this.controls.finalLoanAmount.value;

      if (amt <= scheme.schemeAmountEnd && amt >= scheme.schemeAmountStart) {
        this.controls.finalLoanAmount.setErrors(null)
      } else {
        this.controls.finalLoanAmount.setErrors({ schemeAmt: true })
        return
      }

      let maximumAmtAllowed = (scheme.maximumPercentageAllowed / 100)
      console.log(this.totalAmt * maximumAmtAllowed)
      if (amt > this.totalAmt * maximumAmtAllowed) {
        scheme.unSecured = true // remove
        if (scheme.unSecured) {
          this.isUnSecuredSchemeApplied = true
        } else {
          this.controls.finalLoanAmount.setErrors({ maximunAllowed: true })
          
          return
        }
      } else {
        this.isUnSecuredSchemeApplied = false
        this.controls.finalLoanAmount.setErrors(null)
      }

      let rbiLoanPercent = (scheme.rbiLoanPercent / 100)
      if (amt > this.totalAmt * rbiLoanPercent) {
        this.controls.finalLoanAmount.setErrors({ rbi: true })
      } else {
        this.controls.finalLoanAmount.setErrors(null)

        return
      }



    } else {
      this.controls.schemeId.markAsTouched()
      this.controls.partnerId.markAsTouched()
    }
    this.getIntrest()
  }

  getIntrest() {
    if (this.controls.finalLoanAmount.valid || this.controls.finalLoanAmount.status == "DISABLED") {
      this.dateOfPayment = [];
      switch (this.controls.paymentFrequency.value) {
        case "30":
          if (this.schemesList.length > 0)
            this.controls.interestRate.patchValue(this.selectedScheme[0].interestRateThirtyDaysMonthly)
          this.paymentType = "Month"
          this.colJoin = 1

          break;
        case "90":
          if (this.schemesList.length > 0)
            this.controls.interestRate.patchValue(this.selectedScheme[0].interestRateNinetyDaysMonthly)
          this.paymentType = "Quater"
          this.colJoin = 3

          break;
        case "180":
          if (this.schemesList.length > 0)
            this.controls.interestRate.patchValue(this.selectedScheme[0].interestRateOneHundredEightyDaysMonthly)
          this.paymentType = "Half Yearly"
          this.colJoin = 6

          break;
      }
    }
  }

  calcInterestAmount() {
    if (this.finalInterestForm.invalid) {
      this.finalInterestForm.markAllAsTouched();
      return;
    }

    if (this.isUnSecuredSchemeApplied) {

      let maximumAmtAllowed = (this.totalAmt * (this.selectedScheme[0].maximumPercentageAllowed / 100))

      this.securedInterestAmount = (maximumAmtAllowed *
        (this.controls.interestRate.value * 12 / 100)) * this.controls.paymentFrequency.value
        / 360

      let amt = Number(this.controls.finalLoanAmount.value) - maximumAmtAllowed

      this.unSecuredInterestAmount = (amt *
        (this.controls.interestRate.value * 12 / 100)) * this.controls.paymentFrequency.value
        / 360

      this.unSecuredInterestAmount = this.unSecuredInterestAmount.toFixed(2)

    } else {

      this.securedInterestAmount = (this.controls.finalLoanAmount.value *
        (this.controls.interestRate.value * 12 / 100)) * this.controls.paymentFrequency.value
        / 360

    }

    this.securedInterestAmount = this.securedInterestAmount.toFixed(2);
    this.controls.totalFinalInterestAmt.patchValue(this.securedInterestAmount)
    this.CheckProcessingCharge()
    this.generateTable()
  }

  CheckProcessingCharge() {
    // let processingChargePercent = (this.controls.finalLoanAmount.value * this.controls.processingChargePercent.value) / 100
    // if (processingChargePercent > parseFloat(this.controls.processingChargeFixed.value)) {
    //   this.controls.processingCharge.patchValue(processingChargePercent)
    // } else {
    //   this.controls.processingCharge.patchValue(this.controls.processingChargeFixed.value)
    // }
  }

  generateTable() {
    this.dateOfPayment = []
    let length = Number(this.controls.tenure.value)
    for (let index = 0; index < length; index++) {

      let startDate = this.controls.loanStartDate.value;
      if (typeof startDate == "string")
        startDate = new Date(startDate)
      let date = new Date()

      var data = {
        date: new Date(date.setDate(startDate.getDate() + (30 * (index + 1)))),
        paymentType: this.paymentType,
        securedInterestAmount: this.securedInterestAmount,
        unSecuredInterestAmount: this.unSecuredInterestAmount,
        totalAmt: Number(this.securedInterestAmount) + Number(this.unSecuredInterestAmount)
      }

      if ((index + 1) % this.colJoin == 0) {
        this.dateOfPayment.push(data)
      }
      else if (index + 1 == length) {
        data.securedInterestAmount = ((this.securedInterestAmount / this.colJoin) * (length % this.colJoin)).toFixed(2)
        data.unSecuredInterestAmount = ((this.unSecuredInterestAmount / this.colJoin) * (length % this.colJoin)).toFixed(2)
        this.dateOfPayment.push(data)
      }
    }
    this.calculateTotainterestAmount()
    console.log(this.dateOfPayment)
  }

  calculateTotainterestAmount() {
    this.totalinterestAmount = 0;
    this.dateOfPayment.forEach(amt => {

      this.totalinterestAmount += Number(amt.securedInterestAmount)

      if (amt.unSecuredInterestAmount)
        this.totalinterestAmount += Number(amt.unSecuredInterestAmount)
    })
  }

  get controls() {
    return this.finalInterestForm.controls;
  }


  nextAction() {
    if (this.finalInterestForm.invalid) {
      this.finalInterestForm.markAllAsTouched()
      return
    }
    if (!this.dateOfPayment.length) {
      return
    }
    this.loanFormService.submitFinalIntrest(this.finalInterestForm.value, this.loanId).pipe(
      map(res => {
        if (res.finalLoanAmount)
          this.finalLoanAmount.emit(res.finalLoanAmount)
        this.next.emit(4)
      }), catchError(err => {
        throw err;

      })).subscribe()
  }

  changeUnSecuredScheme() {

  }

}

