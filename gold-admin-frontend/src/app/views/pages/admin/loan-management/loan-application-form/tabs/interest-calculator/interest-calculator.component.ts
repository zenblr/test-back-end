import { Component, OnInit, Input, EventEmitter, Output, AfterViewInit, ViewChild, ElementRef, OnChanges, ChangeDetectorRef, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PartnerService } from '../../../../../../../core/user-management/partner/services/partner.service';
import { DatePipe } from '@angular/common';
import { LoanApplicationFormService } from '../../../../../../../core/loan-management';
import { catchError, map, finalize, takeUntil, debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { MatDialog } from '@angular/material';
import { UnSecuredSchemeComponent } from '../../un-secured-scheme/un-secured-scheme.component';
import { GlobalSettingService } from '../../../../../../../core/global-setting/services/global-setting.service';
import { Subject, Subscription, Observable } from 'rxjs';
import { threadId } from 'worker_threads';
import { async } from 'rxjs/internal/scheduler/async';

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
  @Input() disbursed: boolean = false
  // @Output() interestFormEmit: EventEmitter<any> = new EventEmitter<any>();
  @Input() ornamentRate;
  @Output() next: EventEmitter<any> = new EventEmitter<any>();
  @Input() action;
  @Input() masterAndLoanIds
  @Input() fullAmount
  @Input() showButton
  @Input() loanTransfer
  @Input() ornamentDetails
  @Input() partPaymentdata
  @Output() finalLoanAmount: EventEmitter<any> = new EventEmitter();
  @Output() accountHolderName: EventEmitter<any> = new EventEmitter()
  @ViewChild('calculation', { static: false }) calculation: ElementRef
  @ViewChild('print', { static: false }) print: ElementRef
  editedDate: any;
  paymentType: string;
  approved: boolean = false
  unSecuredAmount: number;
  unSecuredScheme: any;
  selectedUnsecuredscheme: any;
  globalValue: any;
  transferLoan: boolean = false;
  destroy$ = new Subject()
  partnerName: any;
  paymentFrequency: any;
  private unsubscribe$ = new Subject();
  subscription: Subscription[] = []
  isNewLoanFromPartRelease: boolean = false;
  tempPaymentFrequency: any[];

  constructor(
    public fb: FormBuilder,
    public partnerService: PartnerService,
    public eleRef: ElementRef,
    public datePipe: DatePipe,
    public ref: ChangeDetectorRef,
    public loanFormService: LoanApplicationFormService,
    private dialog: MatDialog,
    private globalSettingService: GlobalSettingService
  ) {
    this.initForm();
  }

  ngOnInit() {
    this.globalSettingService.globalSetting$.pipe(takeUntil(this.unsubscribe$)).subscribe(res => {
      this.globalValue = res;
    })





    // this.controls.finalLoanAmount.valueChanges.pipe(
    //   debounceTime(500),
    //   distinctUntilChanged()
    // ).subscribe(res => {
    //   if (!this.transferLoan && !this.isNewLoanFromPartRelease) {
    //     this.partner();
    //   }
    // })

  }

  ngOnChanges(changes: SimpleChanges) {

    if (changes.partPaymentdata && changes.partPaymentdata.currentValue) {
      this.controls.finalLoanAmount.patchValue(changes.partPaymentdata.currentValue)
      this.controls.finalLoanAmount.disable()
      this.isNewLoanFromPartRelease = true;
      console.log(this.isNewLoanFromPartRelease)
      this.partner()
    }

    if (changes.loanTransfer && changes.loanTransfer.currentValue) {
      this.controls.finalLoanAmount.patchValue(changes.loanTransfer.currentValue)
      this.controls.finalLoanAmount.disable()
      this.transferLoan = true;
      this.partner()
    }

    if (changes.ornamentDetails && changes.ornamentDetails.currentValue) {
      this.partner()
    }

    if (changes.totalAmt) {
      if (changes.totalAmt.currentValue != changes.totalAmt.previousValue && changes.totalAmt.currentValue != 0) {
        if(!this.transferLoan && !this.isNewLoanFromPartRelease){
          this.controls.finalLoanAmount.reset()
        }
      }
    }

    if (changes.details) {
      if (changes.action.currentValue == 'edit') {
        if (changes.details.currentValue && changes.details.currentValue) {

          const finalLoan = changes.details.currentValue
          this.totalAmt = finalLoan.masterLoan.totalEligibleAmt
          if (finalLoan.masterLoan.loanStartDate) {
            this.finalInterestForm.patchValue(finalLoan.masterLoan)
            this.finalInterestForm.patchValue(finalLoan)
            this.currentDate = new Date(finalLoan.masterLoan.loanStartDate)
            this.finalInterestForm.controls.loanStartDate.patchValue(this.datePipe.transform(this.currentDate, 'mediumDate'));
          }
          if (finalLoan.masterLoan.isLoanTransfer) {
            this.controls.finalLoanAmount.disable()
            this.controls.finalLoanAmount.patchValue(finalLoan.masterLoan.loanTransfer.disbursedLoanAmount)
            this.transferLoan = true;
            this.partner()

          }
          if (finalLoan.masterLoan.isNewLoanFromPartRelease) {
            this.controls.finalLoanAmount.patchValue(finalLoan.newLoanAmount)
            this.controls.finalLoanAmount.disable()
            this.isNewLoanFromPartRelease = true;
            this.partner()
          }

          if (changes.disbursed && changes.disbursed.currentValue)
            this.approved = true;

          // this.finalInterestForm.controls.loanStartDate.patchValue(new Date(finalLoan.loanStartDate))


          if (finalLoan.scheme) {
            this.selectedScheme = finalLoan.scheme
            this.paymentFrequency = finalLoan.scheme.schemeInterest
            this.tempPaymentFrequency = this.paymentFrequency;
            this.checkForPaymentFrequency()
          }

          let temp = []
          // this.getIntrest()

          finalLoan.customerLoanInterest.forEach(interset => {
            var data = {
              month: interset.month,
              emiDueDate: interset.emiDueDate,
              paymentType: this.paymentType,
              securedInterestAmount: interset.interestAmount,
              unsecuredInterestAmount: 0,
              totalAmount: Number(interset.interestAmount)
            }
            temp.push(data)
          });
          if (finalLoan.masterLoan.isUnsecuredSchemeApplied) {
            this.selectedUnsecuredscheme = finalLoan.unsecuredLoan.scheme
            this.finalInterestForm.patchValue({
              unsecuredSchemeId: finalLoan.unsecuredLoan.scheme.id,
              unsecuredInterestRate: finalLoan.unsecuredLoan.interestRate
            })
            this.getUnsecuredScheme()
            for (let index = 0; index < temp.length; index++) {
              temp[index].unsecuredInterestAmount = finalLoan.unsecuredLoan.customerLoanInterest[index].interestAmount
              temp[index].totalAmount = Number(temp[index].securedInterestAmount) +
                Number(temp[index].unsecuredInterestAmount)
            }
            // this.getIntrest()

          }

          this.dateOfPayment = temp
          this.finalLoanAmount.emit(this.controls.finalLoanAmount.value)
          this.returnScheme()
          this.ref.detectChanges()

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
    // if (this.controls.finalLoanAmount.valid || this.controls.finalLoanAmount.status == 'DISABLED') {
    this.partnerService.getPartnerBySchemeAmount(this.masterAndLoanIds.masterLoanId).subscribe(res => {
      this.partnerList = res.data;
      this.returnScheme()
      if(this.controls.partnerId.valid){
        this.calcualteLoanAmount()
      }
      this.ref.detectChanges()

    })
    // }
  }

  getUnsecuredScheme() {
    this.loanFormService.getUnsecuredScheme(
      this.controls.partnerId.value,
      Number(this.controls.unsecuredLoanAmount.value),
      this.controls.schemeId.value
    ).subscribe(res => {
      this.unSecuredScheme = res.data
    })
  }

  reset() {
    this.dateOfPayment = []
    this.paymentFrequency = []
    this.controls.interestRate.reset()
    this.controls.totalFinalInterestAmt.reset()
    this.controls.paymentFrequency.reset()
    this.controls.processingCharge.reset()
  }
  
  partnerReset() {
    this.controls.partnerId.reset();
    this.schemesList = []
    this.selectedScheme = ''
    this.controls.schemeId.reset()
    this.reset()
  }

  returnScheme() {
    let temp = this.partnerList.filter(part => {
      return part.id == this.controls.partnerId.value
    })
    if (temp.length) {
      let partner = temp[0]
      this.partnerName = partner.name
      this.schemesList = partner.schemes;

    }
  }

  initForm() {
    this.finalInterestForm = this.fb.group({
      partnerId: [null, [Validators.required]],
      schemeId: [null, [Validators.required]],
      finalLoanAmount: [, [Validators.required, Validators.pattern('^\\s*(?=.*[1-9])\\d*(?:\\.\\d{1,2})?\\s*$')]],
      tenure: [null, [Validators.required]],
      loanStartDate: [this.currentDate],
      loanEndDate: [, [Validators.required]],
      paymentFrequency: [null, [Validators.required]],
      totalFinalInterestAmt: [],
      unsecuredInterestRate: [],
      interestRate: [, [Validators.required, Validators.pattern('(^100(\\.0{1,2})?$)|(^([1-9]([0-9])?|0)(\\.[0-9]{1,2})?$)')]],
      processingCharge: [, Validators.required],
      unsecuredSchemeId: [],
      securedLoanAmount: [],
      unsecuredLoanAmount: [],
      isUnsecuredSchemeApplied: [false]
    })


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
    this.controls.interestRate.reset()
    this.controls.paymentFrequency.reset()
  }

  filterScheme() {

    let temp = this.schemesList.filter(scheme => {
      return scheme.id == this.controls.schemeId.value
    })
    this.selectedScheme = temp[0]
    this.selectedUnsecuredscheme = this.selectedScheme.unsecuredScheme
    this.calcualteLoanAmount()
    this.ref.detectChanges()
  }

  calcualteLoanAmount(){
    this.totalAmt = 0;
    this.ornamentDetails.forEach(element => {
      let rpg = 0
      if(this.selectedUnsecuredscheme){
        rpg = this.selectedUnsecuredscheme.rpg
      }
      element.loanAmount = (Number(this.selectedScheme.rpg) + Number(rpg))* element.ornamentsCal
      element.rpg = Number(this.selectedScheme.rpg) + Number(rpg)
      this.totalAmt += element.loanAmount
    });
    console.log(this.totalAmt)
  }

  scheme() {
    this.filterScheme()
    this.reset()
    this.amountValidation()
    // this.getIntrest()
  }

  amountValidation() {
    let amt = this.controls.finalLoanAmount.value;
    let unsecuredSchemeId = null
    this.controls.isUnsecuredSchemeApplied.patchValue(false)
    if(this.selectedUnsecuredscheme){
      unsecuredSchemeId = this.selectedUnsecuredscheme.id
      this.controls.isUnsecuredSchemeApplied.patchValue(true)
    }
    this.dateOfPayment = []
    const scheme = this.selectedScheme
   

    let data = {
      loanAmount: amt,
      securedSchemeId: this.controls.schemeId.value,
      fullAmount: this.fullAmount,
      partnerId: this.controls.partnerId.value,
      isLoanTransfer: this.transferLoan,
      isNewLoanFromPartRelease: this.isNewLoanFromPartRelease,
      unsecuredSchemeId:unsecuredSchemeId,
      isUnsecuredSchemeApplied:this.controls.isUnsecuredSchemeApplied.value
    }

    let check = this.eligibleCheck(amt, data)
    if (check) {
      return
    }

    if (this.controls.partnerId.valid && this.controls.finalLoanAmount.value && this.selectedScheme) {

      //minimum loan amount check
      if (Number(amt) >= Number(this.globalValue.minimumLoanAmountAllowed)) {
        this.controls.finalLoanAmount.setErrors(null)
      } else {
        this.controls.finalLoanAmount.setErrors({ mimimumAmt: true })
        return
      }

      //rbi guidelines check
      // let rbiLoanPercent = (this.globalValue.ltvGoldValue / 100)
      // if (amt > Math.round(this.fullAmount * rbiLoanPercent)) {
      //   this.controls.finalLoanAmount.setErrors({ rbi: true })
      //   return
      // } else {
      //   this.controls.finalLoanAmount.setErrors(null)
      // }

      //secure or unsecure loan check
      this.checkForLoanType(data, amt)

    }

  }

  eligibleCheck(amt, data) {
    if (amt > this.totalAmt) {
      if (this.transferLoan || this.isNewLoanFromPartRelease) {
        this.checkForLoanType(data, amt)
      } else
        this.controls.finalLoanAmount.setErrors({ eligible: true })
      return true
    } else {
      this.controls.finalLoanAmount.setErrors(null)
    }
  }

  checkForLoanType(data, amt) {
    this.loanFormService.checkForLoanType(data).subscribe(res => {
      if (res.data) {
        this.controls.finalLoanAmount.setErrors(null)
        if (res.data.isUnsecuredSchemeApplied) {
          this.controls.isUnsecuredSchemeApplied.patchValue(true);
          this.controls.unsecuredSchemeId.patchValue(this.selectedUnsecuredscheme.id)
          this.controls.unsecuredLoanAmount.patchValue(res.data.unsecuredAmount)
          this.controls.securedLoanAmount.patchValue(res.data.securedLoanAmount)
          this.unSecuredScheme = res.data.newUnsecuredScheme
        } else {
          this.controls.securedLoanAmount.patchValue(Number(amt))
        }
        this.controls.processingCharge.patchValue(res.data.processingCharge)
        this.paymentFrequency = res.data.securedScheme.schemeInterest;
        this.checkForPaymentFrequency()
        this.controls.paymentFrequency.reset()
        console.log(this.controls.paymentFrequency.value);
      }


    }, err => {
      if (err.error.message == "No Unsecured Scheme Availabe") {
        this.controls.finalLoanAmount.setErrors({ noDefaultScheme: true })
      }
    })
  }

  checkForPaymentFrequency() {
    if (this.controls.tenure.valid && this.paymentFrequency.length) {
      this.tempPaymentFrequency = []
      this.paymentFrequency.forEach(month => {
        let tenure = this.controls.tenure.value
        if (month.days <= tenure * 30) {
          this.tempPaymentFrequency.push(month)
        }
      })
    }
  }

  getIntrest(event = null) {
    if (this.controls.paymentFrequency.valid && (this.controls.finalLoanAmount.valid || this.controls.finalLoanAmount.status == 'DISABLED') && this.controls.partnerId.valid && this.controls.schemeId.valid) {
      let data = {
        securedSchemeId: this.controls.schemeId.value,
        unsecuredSchemeId: this.controls.unsecuredSchemeId.value,
        paymentFrequency: this.controls.paymentFrequency.value
      }

      this.loanFormService.getInterest(data).subscribe(res => {
        if (res.data) {
          this.paymentType = this.controls.paymentFrequency.value
          this.controls.interestRate.patchValue(res.data.securedinterestRate.interestRate)
          this.controls.unsecuredInterestRate.patchValue(res.data.unsecuredinterestRate.interestRate)
          if (!event)
            this.calcInterestAmount()
        }
        this.dateOfPayment = [];
        this.ref.detectChanges()
      })

    }
  }

  calcInterestAmount() {
    if (this.finalInterestForm.invalid) {
      this.finalInterestForm.markAllAsTouched();
      return;
    }

    this.loanFormService.calculateFinalInterestTable(this.finalInterestForm.value).subscribe(res => {
      this.dateOfPayment = res.data.interestTable;
      this.controls.totalFinalInterestAmt.patchValue(res.data.totalInterestAmount)
      this.ref.markForCheck()
      setTimeout(() => {
        const dom = this.eleRef.nativeElement.querySelector('#calculation') as HTMLElement
        dom.scrollIntoView({ behavior: "smooth", block: "end" })
      }, 500)
    })
  }


  calculateTotainterestAmount() {
    this.totalinterestAmount = 0;
    this.dateOfPayment.forEach(amt => {

      this.totalinterestAmount += Number(amt.securedInterestAmount)

      if (this.controls.isUnsecuredSchemeApplied.value)
        this.totalinterestAmount += Number(amt.unsecuredInterestAmount)
    })

    this.controls.totalFinalInterestAmt.patchValue(this.totalinterestAmount.toFixed(2))


  }

  get controls() {
    return this.finalInterestForm.controls;
  }


  nextAction() {

    if (this.disable) {
      this.next.emit(4)
      return
    }


    if (this.finalInterestForm.invalid) {
      this.finalInterestForm.markAllAsTouched()
      return
    }
    if (!this.dateOfPayment.length) {
      return
    }
    this.controls.finalLoanAmount.enable()
    this.loanFormService.submitFinalIntrest(this.finalInterestForm.value, this.masterAndLoanIds, this.dateOfPayment,this.ornamentDetails,this.totalAmt).pipe(
      map(res => {
        if (res.finalLoanAmount)
          this.finalLoanAmount.emit(res.finalLoanAmount)
        this.accountHolderName.emit(`${res.firstName} ${res.lastName}`)
        this.next.emit(4)
      }), catchError(err => {
        throw err;

      }), finalize(() => {
        if (this.transferLoan || this.isNewLoanFromPartRelease)
          this.controls.finalLoanAmount.disable()
      })).subscribe()
  }

  changeUnSecuredScheme() {
    var unSecuredData = {
      unsecuredSchemeAmount: this.controls.unsecuredLoanAmount.value,
      unsecuredSchemeInterest: this.controls.unsecuredInterestRate.value,
      unsecuredSchemeName: this.controls.unsecuredSchemeId.value,
      calculation: this.dateOfPayment,
      unsecuredScheme: this.unSecuredScheme,
      paymentType: this.controls.paymentFrequency.value,
      tenure: this.controls.tenure.value
    }
    const dialogRef = this.dialog.open(UnSecuredSchemeComponent, {
      data: { unsecuredSchemeForm: unSecuredData },
      width: '500px'
    });

    dialogRef.afterClosed().subscribe((res) => {
      if (res) {
        this.selectedUnsecuredscheme = res[0];
        this.controls.unsecuredSchemeId.patchValue(res[0].id)
        this.getIntrest()
        // setTimeout(() => { this.calcInterestAmount() }, 1000)
        this.calcInterestAmount()
        // this.CheckProcessingCharge();
        // this.generateTable();
        // this.ref.detectChanges()
      }
    });

  }

  ngOnDestroy() {
    // this.loanFormService.finalLoanAmount.next(0)
    // this.loanFormService.finalLoanAmount.unsubscribe()
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
    this.destroy$.next()
    this.destroy$.complete()
    //this.subscription.forEach(el=>el.unsubscribe)
  }

}

