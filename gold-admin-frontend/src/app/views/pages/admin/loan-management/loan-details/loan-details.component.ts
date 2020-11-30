import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator, MatSort, MatDialog } from '@angular/material';
import { Subscription, merge, Subject, from } from 'rxjs';
import { tap, distinctUntilChanged, skip, takeUntil, map } from 'rxjs/operators';
import { DataTableService } from '../../../../../core/shared/services/data-table.service';
import { LoanDetailsDatasource, LoanDetailsService } from '../../../../../core/loan-management'
import { Router } from '@angular/router';
import { SharedService } from '../../../../../core/shared/services/shared.service';
@Component({
  selector: 'kt-loan-details',
  templateUrl: './loan-details.component.html',
  styleUrls: ['./loan-details.component.scss']
})
export class LoanDetailsComponent implements OnInit {

  roles: any
  dataSource: LoanDetailsDatasource;
  displayedColumns = ['customerID', 'customerName', 'branchName','loanId', 'schemeName', 'amount', 'interestRate', 'tenure', 'interestRestDays', 'applicationDate','startDate', 'endDate', 'partRelease', 'fullRelease', 'actions'];
  leadsResult = []
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  // Filter fields
  // @ViewChild('searchInput', { static: true }) searchInput: ElementRef;
  // @ViewChild(ToastrComponent, { static: true }) toastr: ToastrComponent;
  destroy$ = new Subject();

  // Subscriptions
  private subscriptions: Subscription[] = [];
  private unsubscribeSearch$ = new Subject();
  searchValue = '';

  constructor(
    public dialog: MatDialog,
    private loanDetailsService: LoanDetailsService,
    private dataTableService: DataTableService,
    private router: Router,
    private sharedService: SharedService
  ) {

  }

  ngOnInit() {
    this.sharedService.getRole().subscribe(res => {
      this.roles = res
    })

    const paginatorSubscriptions = merge(this.paginator.page).pipe(
      tap(() => {
        this.loadAppliedLoansPage();
      })
    )
      .subscribe();
    this.subscriptions.push(paginatorSubscriptions);

    const searchSubscription = this.dataTableService.searchInput$.pipe(takeUntil(this.unsubscribeSearch$))
      .subscribe(res => {
        this.searchValue = res;
        this.paginator.pageIndex = 0;
        this.loadAppliedLoansPage();
      });

    // Init DataSource
    this.dataSource = new LoanDetailsDatasource(this.loanDetailsService);
    const entitiesSubscription = this.dataSource.entitySubject.pipe(
      skip(1),
      distinctUntilChanged()
    ).subscribe(res => {
      this.leadsResult = res;
    });
    this.subscriptions.push(entitiesSubscription);

    // First load
    // this.loadLeadsPage();

    this.dataSource.loadDetailsLoans(1, 25, this.searchValue);

  }

  ngOnDestroy() {
    this.subscriptions.forEach(el => el.unsubscribe());
    this.unsubscribeSearch$.next();
    this.unsubscribeSearch$.complete();
    this.destroy$.next();
    this.destroy$.complete();
  }



  loadAppliedLoansPage() {
    if (this.paginator.pageIndex < 0 || this.paginator.pageIndex > (this.paginator.length / this.paginator.pageSize))
      return;
    let from = ((this.paginator.pageIndex * this.paginator.pageSize) + 1);
    let to = ((this.paginator.pageIndex + 1) * this.paginator.pageSize);

    this.dataSource.loadDetailsLoans(from, to, this.searchValue);
  }

  viewLoan(loan) {
    this.router.navigate(['/admin/customer-management/loan-details', loan.id])
  }

  newLoan(loan) {
    this.router.navigate(['/admin/loan-management/loan-application-form/'], { queryParams: { customerID: loan.customer.customerUniqueId } })
  }

  packetImageUpload(loan) {
    this.router.navigate(['/admin/loan-management/packet-image-upload', loan.id])
  }

  topUp(loan) {
    this.router.navigate(['/admin/loan-management/topup'])
  }

  interestEmi(loan) {
    this.router.navigate(['/admin/repayment/interest-emi', loan.id])
  }

  jewelleryRelease(loan) {
    console.log(loan)
    this.router.navigate([`/admin/repayment/part-release/${loan.customerLoan[0].masterLoanId}`])
  }

  partPayment(loan) {
    this.router.navigate(['/admin/repayment/part-payment', loan.id])
  }

  show(loan){
    if(new Date() > new Date(loan.loanEndDate)){
      return false
    }else{
      return true
    }
    
  }

}
