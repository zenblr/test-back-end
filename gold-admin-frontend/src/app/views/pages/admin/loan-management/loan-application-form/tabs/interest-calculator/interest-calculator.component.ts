import { Component, OnInit, Input, EventEmitter, Output, AfterViewInit, ViewChild, ElementRef, OnChanges, ChangeDetectorRef, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PartnerService } from '../../../../../../../core/user-management/partner/services/partner.service';
import { DatePipe } from '@angular/common';
import { LoanApplicationFormService } from '../../../../../../../core/loan-management';
import { catchError, map, finalize, takeUntil, debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { MatDialog } from '@angular/material';
import { UnSecuredSchemeComponent } from '../../un-secured-scheme/un-secured-scheme.component';
import { GlobalSettingService } from '../../../../../../../core/global-setting/services/global-setting.service';
import { Subject, Subscription } from 'rxjs';
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
  // @Output() interestFormEmit: EventEmitter<any> = new EventEmitter<any>();
  @Output() next: EventEmitter<any> = new EventEmitter<any>();
  @Input() action;
  @Input() masterAndLoanIds
  @Input() fullAmount
  @Input() showButton
  @Input() loanTransfer
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
  subscription:Subscription[] = []

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
    this.globalSettingService.globalSetting$.subscribe(res => {
      this.globalValue = res;
    })

    



    this.controls.finalLoanAmount.valueChanges.pipe(
      debounceTime(1000),
      distinctUntilChanged()
    ).subscribe(res => {
      if (!this.transferLoan){
        this.partner();
      }
    })

  }

  ngOnChanges(changes: SimpleChanges) {

    if(changes.loanTransfer && changes.loanTransfer.currentValue){
      this.controls.finalLoanAmount.patchValue(changes.loanTransfer.currentValue)
        this.controls.finalLoanAmount.disable()
        this.transferLoan = true;
        this.partner()
    }

    if (changes.totalAmt) {
      if (changes.totalAmt.currentValue != changes.totalAmt.previousValue && changes.totalAmt.currentValue != 0) {
        // this.partner()
      }
    }

    if (changes.details) {
      if (changes.action.currentValue == 'edit') {
        if (changes.details.currentValue && changes.details.currentValue) {

          const finalLoan = changes.details.currentValue

          if (finalLoan.masterLoan.loanTransfer && finalLoan.masterLoan.loanTransfer.disbursedLoanAmount) {
            this.loanFormService.finalLoanAmount.next(finalLoan.masterLoan.loanTransfer.disbursedLoanAmount)
          }

          if (changes.details.currentValue.disbursed)
            this.approved = true;

          // this.finalInterestForm.controls.loanStartDate.patchValue(new Date(finalLoan.loanStartDate))
          if (finalLoan.masterLoan.loanStartDate) {
            this.finalInterestForm.patchValue(finalLoan.masterLoan)
            this.finalInterestForm.patchValue(finalLoan)
            this.currentDate = new Date(finalLoan.masterLoan.loanStartDate)
            this.finalInterestForm.controls.loanStartDate.patchValue(this.datePipe.transform(this.currentDate, 'mediumDate'));
          }

          if (finalLoan.scheme) {
            this.selectedScheme = finalLoan.scheme
            this.paymentFrequency = finalLoan.scheme.schemeInterest
          }

          let temp = []
          // this.getIntrest()

          finalLoan.customerLoanInterest.forEach(interset => {
            var data = {
              emiDueDate: interset.emiDueDate,
              paymentType: this.paymentType,
              securedInterestAmount: interset.interestAmount,
              unsecuredInterestAmount: 0,
              totalAmount: Number(interset.interestAmount)
            }
            temp.push(data)
          });
          if (finalLoan.masterLoan.isUnsecuredSchemeApplied) {
            // this.unSecuredSchemeCheck(finalLoan.masterLoan.unsecuredLoanAmount, (finalLoan.scheme.maximumPercentageAllowed / 100), 'edit')
            this.selectedUnsecuredscheme = finalLoan.unsecuredLoan.scheme
            this.finalInterestForm.patchValue({ unsecuredSchemeId: finalLoan.unsecuredLoan.scheme.id })
            for (let index = 0; index < temp.length; index++) {
              temp[index].unsecuredInterestAmount = finalLoan.unsecuredLoan.customerLoanInterest[index].interestAmount
              temp[index].totalAmount = Number(temp[index].securedInterestAmount) +
                Number(temp[index].unsecuredInterestAmount)
            }
            // this.getIntrest()

          }

          this.dateOfPayment = temp
          console.log(this.dateOfPayment)
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
    if (this.controls.finalLoanAmount.valid || this.controls.finalLoanAmount.status == 'DISABLED') {
      this.partnerService.getPartnerBySchemeAmount(Math.floor(this.controls.finalLoanAmount.value)).subscribe(res => {
        this.partnerList = res.data;
        this.returnScheme()
        this.ref.detectChanges()
      })
    }
  }

  reset() {
    this.dateOfPayment = []
    this.schemesList = []
    this.controls.schemeId.reset()
    this.controls.interestRate.reset()
    this.controls.totalFinalInterestAmt.reset()
    this.controls.paymentFrequency.reset()
    this.controls.processingCharge.reset()
    this.selectedScheme = ''
  }

  partnerReset() {
    this.controls.partnerId.reset();
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
  }

  filterScheme() {

    let temp = this.schemesList.filter(scheme => {
      return scheme.id == this.controls.schemeId.value
    })

    this.selectedScheme = temp[0]
  }

  scheme() {
    this.filterScheme()
    this.amountValidation()
    // this.getIntrest()
  }

  amountValidation() {
    let amt = this.controls.finalLoanAmount.value;
    this.controls.isUnsecuredSchemeApplied.patchValue(false)
    this.dateOfPayment = []
    const scheme = this.selectedScheme


    let data = {
      loanAmount: amt,
      securedSchemeId: this.controls.schemeId.value,
      fullAmount: this.fullAmount,
      partnerId: this.controls.partnerId.value,
      isLoanTransfer: this.transferLoan
    }

    let check = this.eligibleCheck(amt, data)
    if (check) {
      return
    }

    if (this.controls.partnerId.valid && this.controls.finalLoanAmount.value && this.selectedScheme) {



      // if (Number(amt) <= Number(scheme.schemeAmountEnd) &&
      //   Number(amt) >= Number(scheme.schemeAmountStart)) {
      //   this.controls.finalLoanAmount.setErrors(null)
      // } else {
      //   this.controls.finalLoanAmount.setErrors({ schemeAmt: true })
      //   return
      // }



      //minimum loan amount check
      if (Number(amt) >= Number(this.globalValue.minimumLoanAmountAllowed)) {
        this.controls.finalLoanAmount.setErrors(null)
      } else {
        this.controls.finalLoanAmount.setErrors({ mimimumAmt: true })
        return
      }

      //rbi guidelines check
      let rbiLoanPercent = (this.globalValue.ltvGoldValue / 100)
      if (amt > Math.round(this.fullAmount * rbiLoanPercent)) {
        this.controls.finalLoanAmount.setErrors({ rbi: true })
        return
      } else {
        this.controls.finalLoanAmount.setErrors(null)
      }




      // let maximumAmtAllowed = (scheme.maximumPercentageAllowed / 100)
      // console.log(this.fullAmount * maximumAmtAllowed)
      // let eligibleForLoan = Math.round(this.fullAmount * maximumAmtAllowed)
      // if (amt > eligibleForLoan) {

      //   let unsecureAmt = amt - eligibleForLoan
      //   this.unSecuredSchemeCheck(Math.round(unsecureAmt), maximumAmtAllowed)

      // }

      //secure or unsecure loan check
      this.checkForLoanType(data, amt)



    }
    // this.getIntrest()
    // this.CheckProcessingCharge()
  }

  eligibleCheck(amt, data) {
    if (amt > this.totalAmt) {
      if (this.transferLoan) {
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
        if (res.data.unsecuredSchemeApplied) {
          this.controls.isUnsecuredSchemeApplied.patchValue(true);
          this.controls.unsecuredSchemeId.patchValue(res.data.unsecuredSchemeApplied.id)
          this.controls.unsecuredLoanAmount.patchValue(res.data.unsecuredAmount)
          this.selectedUnsecuredscheme = res.data.unsecuredSchemeApplied
          this.controls.securedLoanAmount.patchValue(res.data.securedLoanAmount)
          this.unSecuredScheme = res.data.unsecuredScheme
        } else {
          this.controls.securedLoanAmount.patchValue(Number(amt))
        }
        this.controls.processingCharge.patchValue(res.data.processingCharge)
        this.paymentFrequency = res.data.securedScheme.schemeInterest;
        this.controls.paymentFrequency.reset()
      }


    }, err => {
      if (err.error.message == "No Unsecured Scheme Availabe") {
        this.controls.finalLoanAmount.setErrors({ noDefaultScheme: true })
      }
    })
  }

  // unSecuredSchemeCheck(amt, securedPercentage, action?) {
  //   if (this.controls.finalLoanAmount.valid) {
  //     let enterAmount = this.controls.finalLoanAmount.value;
  //     this.partnerService.getUnsecuredSchemeByParnter(this.controls.partnerId.value, Math.round(amt)).subscribe(
  //       res => {
  //         this.unSecuredScheme = res.data
  //         if (!action) {
  //           if (Object.values(res.data).length) {

  //             this.selectedUnsecuredscheme = this.unSecuredScheme.schemes.filter(scheme => { return scheme.default })
  //             const scheme = this.selectedUnsecuredscheme[0]
  //             if (scheme) {
  //               if (Number(amt) <= Number(scheme.schemeAmountEnd) &&
  //                 Number(amt) >= Number(scheme.schemeAmountStart)
  //                 && Number(enterAmount) <= Math.round((this.fullAmount * (securedPercentage + (scheme.maximumPercentageAllowed / 100))))
  //               ) {

  //                 this.controls.isUnsecuredSchemeApplied.patchValue(true);
  //                 this.controls.unsecuredSchemeId.patchValue(scheme.id)
  //                 this.controls.unsecuredLoanAmount.patchValue(Math.round(amt))

  //                 this.getIntrest();
  //                 this.CheckProcessingCharge()
  //               }

  //               else {
  //                 this.controls.finalLoanAmount.setErrors({ defalutNotRange: true })
  //                 return
  //               }
  //             }
  //             else {
  //               this.controls.finalLoanAmount.setErrors({ noDefaultScheme: true })
  //               return
  //             }
  //           }
  //           else {
  //             this.controls.finalLoanAmount.setErrors({ noDefaultScheme: true })
  //             return
  //           }
  //         }
  //       }
  //     )
  //   }
  // }

  async getIntrest() {
    if (this.controls.paymentFrequency.valid && (this.controls.finalLoanAmount.valid || this.controls.finalLoanAmount.status == 'DISABLED') && this.controls.partnerId.valid && this.controls.schemeId.valid) {

      let data = {
        securedSchemeId: this.controls.schemeId.value,
        unsecuredSchemeId: this.controls.unsecuredSchemeId.value,
        paymentFrequency: this.controls.paymentFrequency.value
      }

      await this.loanFormService.getInterest(data).subscribe(res => {
        if (res.data) {
          this.paymentType = this.controls.paymentFrequency.value
          this.dateOfPayment = [];
          this.controls.interestRate.patchValue(res.data.securedinterestRate.interestRate)
          this.controls.unsecuredInterestRate.patchValue(res.data.unsecuredinterestRate.interestRate)
        }
      })

      // switch (this.controls.paymentFrequency.value) {
      //   case "30":

      //     if (this.selectedScheme)
      //       this.controls.interestRate.patchValue(this.selectedScheme.interestRateThirtyDaysMonthly)

      //     if (this.selectedUnsecuredscheme.length && this.selectedUnsecuredscheme[0])
      //       this.controls.unsecuredInterestRate.patchValue(this.selectedUnsecuredscheme[0].interestRateThirtyDaysMonthly)
      //     this.paymentType = "Month"
      //     this.colJoin = 1

      //     break;
      //   case "90":

      //     if (this.selectedScheme)
      //       this.controls.interestRate.patchValue(this.selectedScheme.interestRateNinetyDaysMonthly)

      //     if (this.selectedUnsecuredscheme.length && this.selectedUnsecuredscheme[0])
      //       this.controls.unsecuredInterestRate.patchValue(this.selectedUnsecuredscheme[0].interestRateNinetyDaysMonthly)
      //     this.paymentType = "Quarter"
      //     this.colJoin = 3

      //     break;
      //   case "180":

      //     if (this.selectedScheme)
      //       this.controls.interestRate.patchValue(this.selectedScheme.interestRateOneHundredEightyDaysMonthly)

      //     if (this.selectedUnsecuredscheme.length && this.selectedUnsecuredscheme[0])
      //       this.controls.unsecuredInterestRate.patchValue(this.selectedUnsecuredscheme[0].interestRateOneHundredEightyDaysMonthly)
      //     this.paymentType = "Half Yearly"
      //     this.colJoin = 6

      //     break;
      // }
    }
  }

  async calcInterestAmount() {
    if (this.finalInterestForm.invalid) {
      this.finalInterestForm.markAllAsTouched();
      return;
    }

    await this.loanFormService.calculateFinalInterestTable(this.finalInterestForm.value).subscribe(res => {
      this.dateOfPayment = res.data.interestTable;
      this.controls.totalFinalInterestAmt.patchValue(res.data.totalInterestAmount)
      this.ref.detectChanges()
      setTimeout(() => {
        const dom = this.eleRef.nativeElement.querySelector('#calculation') as HTMLElement
        dom.scrollIntoView({ behavior: "smooth", block: "end" })
      }, 500)
    })
    return
    // if (this.controls.isUnsecuredSchemeApplied.value) {

    //   let maximumAmtAllowed = (this.fullAmount * (this.selectedScheme.maximumPercentageAllowed / 100))
    //   console.log(maximumAmtAllowed)
    //   this.securedInterestAmount = (maximumAmtAllowed *
    //     (this.controls.interestRate.value * 12 / 100)) * this.controls.paymentFrequency.value
    //     / 360

    //   this.unSecuredAmount = Number(this.controls.finalLoanAmount.value) - maximumAmtAllowed

    //   this.unSecuredInterestAmount = (this.unSecuredAmount *
    //     (this.controls.unsecuredInterestRate.value * 12 / 100)) * this.controls.paymentFrequency.value
    //     / 360

    //   this.unSecuredInterestAmount = this.unSecuredInterestAmount.toFixed(2)
    //   // this.controls.unsecuredLoanAmount.patchValue(this.securedInterestAmount)
    //   this.controls.securedLoanAmount.patchValue(maximumAmtAllowed.toFixed(2))
    // } else {

    //   this.securedInterestAmount = (this.controls.finalLoanAmount.value *
    //     (this.controls.interestRate.value * 12 / 100)) * this.controls.paymentFrequency.value
    //     / 360
    //   this.controls.securedLoanAmount.patchValue(this.controls.finalLoanAmount.value)
    // }

    this.securedInterestAmount = this.securedInterestAmount.toFixed(2);
    // this.CheckProcessingCharge()
    // this.generateTable()

    setTimeout(() => {
      const dom = this.eleRef.nativeElement.querySelector('#calculation') as HTMLElement
      dom.scrollIntoView({ behavior: "smooth", block: "end" })
    }, 500)
  }

  // CheckProcessingCharge() {
  //   let secure = this.selectedScheme;
  //   let unsecure = this.selectedUnsecuredscheme[0];
  //   let processingCharge = 0;

  //   if (secure) {
  //     let processingChargePercent = (this.controls.finalLoanAmount.value * secure.processingChargePercent) / 100
  //     if (processingChargePercent > parseFloat(secure.processingChargeFixed)) {
  //       processingCharge += processingChargePercent
  //     } else {
  //       processingCharge += secure.processingChargeFixed
  //     }
  //   }

  //   if (this.controls.isUnsecuredSchemeApplied.value && unsecure) {
  //     let processingChargePercentUnsecure = (this.controls.finalLoanAmount.value * unsecure.processingChargePercent) / 100
  //     if (processingChargePercentUnsecure > parseFloat(unsecure.processingChargeFixed)) {
  //       processingCharge += processingChargePercentUnsecure
  //     } else {
  //       processingCharge += unsecure.processingChargeFixed
  //     }
  //   }

  //   this.controls.processingCharge.patchValue(processingCharge.toFixed(2))
  // }

  // generateTable(unSecuredInterestAmount?) {
  //   if (this.controls.isUnsecuredSchemeApplied.value && unSecuredInterestAmount) {
  //     this.unSecuredInterestAmount = unSecuredInterestAmount;
  //   }

  //   this.dateOfPayment = []
  //   let length = Number(this.controls.tenure.value)
  //   for (let index = 0; index < length; index++) {

  //     let startDate = this.controls.loanStartDate.value;
  //     if (typeof startDate == "string")
  //       startDate = new Date(startDate)
  //     let date = new Date()

  //     var data = {
  //       emiDueDate: new Date(date.setDate(startDate.getDate() + (30 * (index + 1)))),
  //       paymentType: this.paymentType,
  //       securedInterestAmount: this.securedInterestAmount,
  //       unsecuredInterestAmount: this.unSecuredInterestAmount,
  //       totalAmount: Number(this.securedInterestAmount) + Number(this.unSecuredInterestAmount)
  //     }

  //     if ((index + 1) % this.colJoin == 0) {
  //       this.dateOfPayment.push(data)
  //     }
  //     else if (index + 1 == length) {
  //       data.securedInterestAmount = ((this.securedInterestAmount / this.colJoin) * (length % this.colJoin)).toFixed(2)

  //       if (this.controls.isUnsecuredSchemeApplied.value)
  //         data.unsecuredInterestAmount = ((this.unSecuredInterestAmount / this.colJoin) * (length % this.colJoin)).toFixed(2)
  //       else {
  //         data.unsecuredInterestAmount = 0;
  //       }
  //       data.totalAmount = Number(data.securedInterestAmount) + Number(data.unsecuredInterestAmount)
  //       this.dateOfPayment.push(data)
  //     }
  //   }

  //   this.calculateTotainterestAmount()
  //   console.log(this.dateOfPayment)
  //   return this.dateOfPayment
  // }

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
    this.loanFormService.submitFinalIntrest(this.finalInterestForm.value, this.masterAndLoanIds, this.dateOfPayment).pipe(
      map(res => {
        if (res.finalLoanAmount)
          this.finalLoanAmount.emit(res.finalLoanAmount)
        this.accountHolderName.emit(`${res.firstName} ${res.lastName}`)
        this.next.emit(4)
      }), catchError(err => {
        throw err;

      }), finalize(() => {
        if (this.transferLoan)
          this.controls.finalLoanAmount.disable()
      })).subscribe()
  }

  changeUnSecuredScheme() {
    var data = {
      unsecuredSchemeAmount: this.controls.unsecuredLoanAmount.value,
      unsecuredSchemeInterest: this.controls.unsecuredInterestRate.value,
      unsecuredSchemeName: this.selectedUnsecuredscheme.id,
      calculation: this.dateOfPayment,
      unsecuredScheme: this.unSecuredScheme,
      paymentType: this.controls.paymentFrequency.value,
      tenure: this.controls.tenure.value
    }
    console.log(data)
    const dialogRef = this.dialog.open(UnSecuredSchemeComponent, {
      data: { unsecuredSchemeForm: data },
      width: '500px'
    });

    dialogRef.afterClosed().subscribe(res => {
      if (res) {
        this.selectedUnsecuredscheme = res;
        this.controls.unsecuredSchemeId.patchValue(res[0].id)
        this.getIntrest()
        this.calcInterestAmount()
        // this.CheckProcessingCharge();
        // this.generateTable();
        this.ref.detectChanges()
      }
    });

  }

  ngOnDestroy() {
    // this.loanFormService.finalLoanAmount.next(0)
    // this.loanFormService.finalLoanAmount.unsubscribe()
    this.destroy$.next()
    this.destroy$.complete()
    this.subscription.forEach(el=>el.unsubscribe)
  }

}

