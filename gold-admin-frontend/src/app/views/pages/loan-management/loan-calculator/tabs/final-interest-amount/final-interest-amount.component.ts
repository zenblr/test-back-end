import { Component, OnInit, Input, EventEmitter, Output, AfterViewInit, ViewChild, ElementRef, OnChanges } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PartnerService } from '../../../../../../core/user-management/partner/services/partner.service';
import { map } from 'rxjs/operators';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'kt-final-interest-amount',
  templateUrl: './final-interest-amount.component.html',
  styleUrls: ['./final-interest-amount.component.scss'],
  providers: [DatePipe]
})
export class FinalInterestAmountComponent implements OnInit, AfterViewInit,OnChanges {

  colJoin:any;
  intrestAmount:any = 0;
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

  @Output() interestFormEmit: EventEmitter<any> = new EventEmitter<any>();
  @ViewChild('print',{static:false}) print :ElementRef

  constructor(
    private fb: FormBuilder,
    private partnerService: PartnerService,
    public datePipe: DatePipe,
    public eleRef:ElementRef
  ) { }

  ngOnInit() {
    this.initForm();
    this.partner()
  }

  ngOnChanges(){
    if(this.disable){
      this.finalInterestForm.disable()
    }
  }

  partner() {
    this.partnerService.getAllPartnerWithoutPagination().pipe(
      map(res => {
        this.partnerList = res.data;
        console.log(this.partnerList)
      })).subscribe()
  }

  getSchemes() {
    this.partnerService.getSchemesByParnter(Number(this.controls.partnerName.value)).pipe(
      map(res => {
        this.schemesList = res.data.schemes;
        console.log(this.schemesList)
      })).subscribe()
  }

  initForm() {
    this.finalInterestForm = this.fb.group({
      partnerName: [, [Validators.required]],
      schemeName: [, [Validators.required]],
      finalLoanAmount: [, [Validators.required,Validators.pattern('^\\s*(?=.*[1-9])\\d*(?:\\.\\d{1,2})?\\s*$')]],
      tenure: [, [Validators.required]],
      loanStartDate: [, [Validators.required]],
      loanEndDate: [, [Validators.required]],
      goldGrossWeight: [, [Validators.required]],
      paymentType: [, [Validators.required]],
      goldNetWeight: [, [Validators.required]],
      finalNetWeight: [, [Validators.required]],
      interestRate: [, [Validators.required,Validators.pattern('(?<![\\d.])(\\d{1,2}|\\d{0,2}\\.\\d{1,2})?(?![\\d.])|(100)')]],
      currentLtvAmount: [, [Validators.required]],
      processingCharge:[,[Validators.pattern('^\\s*(?=.*[1-9])\\d*(?:\\.\\d{1,2})?\\s*$')]]
    })
    this.interestFormEmit.emit(this.finalInterestForm)
    this.controls.loanEndDate.disable()
  }

  ngAfterViewInit() {
    this.finalInterestForm.valueChanges.subscribe(() => {
      this.interestFormEmit.emit(this.finalInterestForm)
    })
  }

  setEndDate() {
    if (this.controls.loanStartDate.valid && this.controls.tenure.valid) {
      let startDate = this.controls.loanStartDate.value;
      let date =  new Date(startDate.toLocaleDateString())
      this.controls.loanEndDate.patchValue(new Date(date.setMonth(date.getMonth() + this.controls.tenure.value)))
    } else {
      this.controls.loanStartDate.markAsTouched()
    }
  }

  amountValidation() {
    if (this.controls.partnerName.valid) {
      let amt = this.controls.finalLoanAmount.value;
      this.schemesList.schemes.forEach(scheme => {
        if (amt <= scheme.schemeAmountEnd && amt >= scheme.schemeAmountStart) {
          this.controls.finalLoanAmount.setErrors(null)
          this.selectedScheme = scheme;
          return
        } else {
          this.controls.finalLoanAmount.setErrors({ invalidAmt: true })
        }
      });
    } else {
      this.controls.schemeName.markAsTouched()
      this.controls.partnerName.markAsTouched()
    }
    this.getIntrest()
  }

  getIntrest() {
    if (this.controls.finalLoanAmount.valid) {
      switch (this.controls.paymentType.value) {
        case "30":
          this.controls.interestRate.patchValue(this.selectedScheme.interestRateThirtyDaysMonthly)
           this.colJoin = null
          break;
        case "90":
          this.controls.interestRate.patchValue(this.selectedScheme.interestRateNinetyDaysMonthly)
           this.colJoin = 3

          break;
        case "180":
          this.controls.interestRate.patchValue(this.selectedScheme.interestRateOneHundredEightyDaysMonthly)
          this.colJoin = 6

          break;
      }
    }
  }

  calcInterestAmount() {
    // if (this.finalInterestForm.invalid) {
    //   this.finalInterestForm.markAllAsTouched();
    //   return;
    // }
    let intrest = (this.controls.finalLoanAmount.value *
      this.controls.interestRate.value) * this.controls.tenure.value
      / 360
    this.intrestAmount = intrest.toFixed(2);
    this.generateTable()
  }

  generateTable() {
    this.dateOfPayment = []
    let length = Number(this.controls.tenure.value)
    for (let index = 0; index < length; index++) {
      let startDate = this.controls.loanStartDate.value;
      let date =  new Date(startDate.toLocaleDateString())
      this.dateOfPayment.push((new Date(date.setMonth(date.getMonth() + index))).toLocaleDateString())
    }
  }

  get controls() {
    return this.finalInterestForm.controls;
  }


  printNow(){
    const printTable =document.getElementById("print").innerHTML;
    // // window.print(printTable)
    var a = window.open('', '', 'height=500, width=500'); 
    a.document.write(printTable)
    a.print()
    console.log(printTable)
  }

}
