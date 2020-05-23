import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router'
import { CustomerManagementService } from '../../../../core/customer-management';
import { tap } from 'rxjs/operators';

@Component({
  selector: 'kt-customer-details',
  templateUrl: './customer-details.component.html',
  styleUrls: ['./customer-details.component.scss']
})
export class CustomerDetailsComponent implements OnInit {

  loans: number[] = []
  customerId: number;
  cutomerDetails:any
  constructor(
    private customerService:CustomerManagementService,
    private rout: ActivatedRoute,
    private router: Router) { }

  ngOnInit() {
    this.loans = [1, 1, 1, 1];
    this.customerId = this.rout.snapshot.params.id
    this.customerService.getCustomerById(this.customerId).pipe(
      tap(res =>{
        this.cutomerDetails = res.data;
      })).subscribe()
  }

  viewLoan(loanId: number) {
    this.router.navigate(['/customer-management/customer-list/' + this.customerId + '/loan-details/' + loanId])
  }

}
