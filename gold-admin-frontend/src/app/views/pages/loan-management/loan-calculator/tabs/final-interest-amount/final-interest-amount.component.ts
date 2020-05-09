import { Component, OnInit, Input, EventEmitter, Output, AfterViewInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PartnerService } from '../../../../../../core/user-management/partner/services/partner.service';
import { map } from 'rxjs/operators';

@Component({
  selector: 'kt-final-interest-amount',
  templateUrl: './final-interest-amount.component.html',
  styleUrls: ['./final-interest-amount.component.scss']
})
export class FinalInterestAmountComponent implements OnInit, AfterViewInit {

  partnerList: any[] = [];
  schemesList: any[] = [];
  tenure = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
  repayType = [{ name: "monthly" }, { name: "quarterly" }, { name: "half Yearly" }]
  finalInterestForm: FormGroup;
  @Input() invalid;

  @Output() interestFormEmit: EventEmitter<any> = new EventEmitter<any>();

  constructor(
    private fb: FormBuilder,
    private partnerService: PartnerService
  ) { }

  ngOnInit() {
    this.initForm();
    this.partner()
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
      finalLoanAmount: [, [Validators.required]],
      tenure: [, [Validators.required]],
      loanStartDate: [, [Validators.required]],
      loanEndDate: [, [Validators.required]],
      goldGrossWeight: [, [Validators.required]],
      paymentType: [, [Validators.required]],
      goldNetWeight: [, [Validators.required]],
      finalNetWeight: [, [Validators.required]],
      interestRate: [, [Validators.required]],
      currentLtvAmount: [, [Validators.required]],
    })
    this.interestFormEmit.emit(this.finalInterestForm)
  }

  ngAfterViewInit() {
    this.finalInterestForm.valueChanges.subscribe(() => {
      this.interestFormEmit.emit(this.finalInterestForm)
    })
  }

  calcInterestAmount() {
    // if (this.finalInterestForm.invalid) {
    //   this.finalInterestForm.markAllAsTouched();
    //   return;
    // }
    let intrestAmount = ((this.controls.finalLoanAmount.value * this.controls.interestRate.value)
      / this.controls.tenure.value)
      / 100
    console.log(intrestAmount);
  }

  get controls() {
    return this.finalInterestForm.controls;
  }

}
