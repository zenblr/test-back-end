import { Component, OnInit, Input, EventEmitter, Output, AfterViewInit, ViewChild, ElementRef, OnChanges, ChangeDetectorRef, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PartnerService } from '../../../../../../core/user-management/partner/services/partner.service';
import { map, last, takeLast, switchMap } from 'rxjs/operators';
import { DatePipe } from '@angular/common';
import { interval } from 'rxjs';

@Component({
  selector: 'kt-interest-calculator',
  templateUrl: './interest-calculator.component.html',
  styleUrls: ['./interest-calculator.component.scss'],
  providers: [DatePipe]
})
export class InterestCalculatorComponent implements OnInit {

  @Input() details;
  @Input() disable
  currentDate = new Date()
  colJoin: any;
  intrestAmount: any = 0;
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
  @Input() totalAmt=0;
  @Output() interestFormEmit: EventEmitter<any> = new EventEmitter<any>();
  @Output() nextEmit: EventEmitter<any> = new EventEmitter<any>();
  @Input() action;

  @ViewChild('print', { static: false }) print: ElementRef
  editedDate: any;

  constructor(
    private fb: FormBuilder,
    private partnerService: PartnerService,
    public eleRef: ElementRef,
    public datePipe: DatePipe,
    public ref: ChangeDetectorRef
  ) { }

  ngOnInit() {
    this.initForm();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.totalAmt) {
      if (changes.totalAmt.currentValue != changes.totalAmt.previousValue && changes.totalAmt.currentValue != 0) {
        this.partner()
      }
    }
    if (changes.details) {
      if (changes.action.currentValue == 'edit') {
        this.finalInterestForm.patchValue(changes.details.currentValue.finalLoan)
        // this.finalInterestForm.controls.loanStartDate.patchValue(new Date(changes.details.currentValue.finalLoan.loanStartDate))
        this.editedDate = changes.details.currentValue.finalLoan.loanStartDate;
        this.currentDate = new Date(changes.details.currentValue.finalLoan.loanStartDate)
        this.finalInterestForm.controls.loanStartDate.patchValue(this.datePipe.transform(this.currentDate, 'mediumDate'));
        this.finalInterestForm.controls.schemeId.patchValue(changes.details.currentValue.finalLoan.schemeId)
        this.finalInterestForm.controls.interestRate.patchValue(changes.details.currentValue.finalLoan.interestRate)
        this.calcInterestAmount()
        this.ref.markForCheck()
      }
    }
    if (this.disable) {
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
          this.returnScheme()
        }
      })
  }

  getSchemes() {
    this.dateOfPayment = []
    this.schemesList = []
    this.controls.schemeId.reset()
    this.controls.interestRate.reset()
    this.controls.intresetAmt.reset()
    this.controls.paymentFrequency.reset()
    this.controls.schemeId.patchValue('')
    this.controls.paymentFrequency.patchValue('')
    this.returnScheme()

  }
  returnScheme() {
    let temp = this.partnerList.filter(part => {
      return part.id == this.controls.partnerId.value
    })
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
      intresetAmt: [],
      interestRate: [, [Validators.required, Validators.pattern('(^100(\\.0{1,2})?$)|(^([1-9]([0-9])?|0)(\\.[0-9]{1,2})?$)')]], processingCharge: [],
      processingChargeFixed: [, [Validators.required, Validators.pattern('^\\s*(?=.*[1-9])\\d*(?:\\.\\d{1,2})?\\s*$')]],
      processingChargePercent: [, [Validators.required, Validators.pattern('(^100(\\.0{1,2})?$)|(^([1-9]([0-9])?|0)(\\.[0-9]{1,2})?$)')]]
    })
    this.interestFormEmit.emit(this.finalInterestForm)
  }

  ngAfterViewInit() {
    this.finalInterestForm.valueChanges.subscribe(() => {
      this.interestFormEmit.emit(this.finalInterestForm)
    })
  }

  setEndDate() {
    this.dateOfPayment = []
    if (this.controls.loanStartDate.valid && this.controls.tenure.valid) {
      let startDate = this.controls.loanStartDate.value;
      let date = new Date(startDate)
      this.controls.loanEndDate.patchValue(new Date(date.setDate(startDate.getDate() + (Number(this.controls.tenure.value)) * 30)))
    } else {
      this.controls.loanStartDate.markAsTouched()
    }
  }

  scheme() {
    this.selectedScheme = this.schemesList.filter(scheme => {
      return scheme.id == this.controls.schemeId.value
    })
  }
  amountValidation() {
    this.scheme()
    this.dateOfPayment = []
    if (this.controls.partnerId.valid) {
      let amt = this.controls.finalLoanAmount.value;
      if (amt <= this.selectedScheme[0].schemeAmountEnd && amt >= this.selectedScheme[0].schemeAmountStart) {
        this.controls.finalLoanAmount.setErrors(null)
      } else {
        this.controls.finalLoanAmount.setErrors({ schemeAmt: true })
        return
      }
      if (amt > this.totalAmt) {
        this.controls.finalLoanAmount.setErrors({ eligibleAmt: true })
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

          this.colJoin = null

          break;
        case "90":
          if (this.schemesList.length > 0)
            this.controls.interestRate.patchValue(this.selectedScheme[0].interestRateNinetyDaysMonthly)

          this.colJoin = 3

          break;
        case "180":
          if (this.schemesList.length > 0)
            this.controls.interestRate.patchValue(this.selectedScheme[0].interestRateOneHundredEightyDaysMonthly)

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
    let intrest = (this.controls.finalLoanAmount.value *
      (this.controls.interestRate.value * 12 / 100)) * this.controls.paymentFrequency.value
      / 360
    this.intrestAmount = intrest.toFixed(2);
    this.controls.intresetAmt.patchValue(this.intrestAmount)
    this.CheckProcessingCharge()
    this.generateTable()
  }

  CheckProcessingCharge() {
    let processingChargePercent = (this.controls.finalLoanAmount.value * this.controls.processingChargePercent.value) / 100
    if (processingChargePercent > parseFloat(this.controls.processingChargeFixed.value)) {
      this.controls.processingCharge.patchValue(processingChargePercent)
    } else {
      this.controls.processingCharge.patchValue(this.controls.processingChargeFixed.value)
    }
  }

  generateTable() {
    this.dateOfPayment = []
    let length = Number(this.controls.tenure.value)
    for (let index = 0; index < length; index++) {
      let startDate = this.controls.loanStartDate.value;
      let date = new Date(startDate)
      var data = { key: new Date(date.setDate(date.getDate() + (30 * index))) }
      this.dateOfPayment.push(data)
    }
    console.log(this.dateOfPayment)
  }

  get controls() {
    return this.finalInterestForm.controls;
  }


  next() {
    this.nextEmit.emit(true)
  }

}

