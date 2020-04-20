import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router'

@Component({
  selector: 'kt-customer-details',
  templateUrl: './customer-details.component.html',
  styleUrls: ['./customer-details.component.scss']
})
export class CustomerDetailsComponent implements OnInit {

  loans: number[] = []
  customerId: number;
  constructor(private rout: ActivatedRoute,
    private router: Router) { }

  ngOnInit() {
    this.loans = [1, 1, 1, 1];
    this.customerId = this.rout.snapshot.params.id
    console.log(this.customerId)
  }

  viewLoan(loanId: number) {
    this.router.navigate(['/customer-management/customer-list/' + this.customerId + '/loan-details/' + loanId])
  }

}
