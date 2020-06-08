import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator, MatDialog } from '@angular/material';
import { Subject, Subscription, merge } from 'rxjs';
import { DataTableService } from '../../../../core/shared/services/data-table.service';
import { map, tap, takeUntil, distinctUntilChanged, skip } from 'rxjs/operators';
import { AssignedCustomersDatasource } from '../../../../core/assigned-customers/datasources/assigned-customers.datasource';
import { AssignedCustomersService } from '../../../../core/assigned-customers/services/assigned-customers.service';
import { Router } from '@angular/router';

@Component({
  selector: 'kt-assigned-customers',
  templateUrl: './assigned-customers.component.html',
  styleUrls: ['./assigned-customers.component.scss']
})
export class AssignedCustomersComponent implements OnInit {

  dataSource: AssignedCustomersDatasource;
  displayedColumns = ['customerId', 'customerName', 'newLoan'];
  result = []
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  unsubscribeSearch$ = new Subject();
  destroy$ = new Subject();
  searchValue = '';
  private subscriptions: Subscription[] = [];

  constructor(
    private dataTableService: DataTableService,
    private assignedCustomersService: AssignedCustomersService,
    public dialog: MatDialog,
    private router: Router
  ) { }

  ngOnInit() {
    const paginatorSubscriptions = merge(this.paginator.page).pipe(
      tap(() => this.loadPage())
    ).subscribe();
    this.subscriptions.push(paginatorSubscriptions);


    const searchSubscription = this.dataTableService.searchInput$.pipe(takeUntil(this.unsubscribeSearch$))
      .subscribe(res => {
        this.searchValue = res;
        this.paginator.pageIndex = 0;
        this.loadPage();
      });

    this.dataSource = new AssignedCustomersDatasource(this.assignedCustomersService);
    const entitiesSubscription = this.dataSource.entitySubject.pipe(
      skip(1),
      distinctUntilChanged()
    ).subscribe(res => {
      this.result = res;
    });
    this.subscriptions.push(entitiesSubscription);

    this.dataSource.getCustomerList(1, 25, this.searchValue);
  }

  ngOnDestroy() {
    this.subscriptions.forEach(el => el.unsubscribe());
    this.unsubscribeSearch$.next();
    this.unsubscribeSearch$.complete();
    this.destroy$.next();
    this.destroy$.complete();
  }


  loadPage() {
    if (this.paginator.pageIndex < 0 || this.paginator.pageIndex > (this.paginator.length / this.paginator.pageSize))
      return;
    let from = ((this.paginator.pageIndex * this.paginator.pageSize) + 1);
    let to = ((this.paginator.pageIndex + 1) * this.paginator.pageSize);

    this.dataSource.getCustomerList(from, to, this.searchValue);
  }

  applyLoan(loan) {
    this.router.navigate(['/loan-management/loan-application-form/'], { queryParams: { customerID: loan.customerUniqueId } })
  }

}
