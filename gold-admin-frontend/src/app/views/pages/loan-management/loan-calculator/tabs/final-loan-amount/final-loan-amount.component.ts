import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'kt-final-loan-amount',
  templateUrl: './final-loan-amount.component.html',
  styleUrls: ['./final-loan-amount.component.scss']
})
export class FinalLoanAmountComponent implements OnInit {

  loanAmount:number = 0;
  constructor() { }

  ngOnInit() {
  }

}
