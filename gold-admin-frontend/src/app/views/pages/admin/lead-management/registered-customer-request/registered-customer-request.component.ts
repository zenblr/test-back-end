import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material';
import { DataTableService } from '../../../../../core/shared/services/data-table.service';
import { RegisteredCustomerRequestDatasource } from "../../../../../core/lead-management/datasources/registered-customer-request.datasource";
import { RegisteredCustomerRequestService } from "../../../../../core/lead-management/services/registered-customer-request.service";
import { merge, Subject, Subscription } from 'rxjs';
import { takeUntil, tap } from 'rxjs/operators';

@Component({
  selector: 'kt-registered-customer-request',
  templateUrl: './registered-customer-request.component.html',
  styleUrls: ['./registered-customer-request.component.scss']
})
export class RegisteredCustomerRequestComponent implements OnInit {

  dataSource: RegisteredCustomerRequestDatasource;
  displayedColumns = ['fullName', 'mobileNumber', 'email', 'city', 'source'];
  results = []

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;

  queryParamsData = {
    from: 1,
    to: 25,
    search: '',
  };
  // Subscriptions
  private subscriptions: Subscription[] = [];

  private unsubscribeSearch$ = new Subject();

  constructor(
    private registeredCustomerRequestService: RegisteredCustomerRequestService,
    private dataTableService: DataTableService,
  ) { }

  ngOnInit() {
    const paginatorSubscriptions = merge(this.paginator.page).pipe(
      tap(() => this.loadRequestPage())
    ).subscribe()
    this.subscriptions.push(paginatorSubscriptions);

    const searchSubscription = this.dataTableService.searchInput$.pipe(takeUntil(this.unsubscribeSearch$))
      .subscribe(res => {
        // console.log(res)
        this.queryParamsData.search = res;
        this.paginator.pageIndex = 0;
        this.loadRequestPage();
      });
    this.dataSource = new RegisteredCustomerRequestDatasource(this.registeredCustomerRequestService)
    this.dataSource.getAllRegisteredCustomerRequests(this.queryParamsData)
  }

  ngOnDestroy() {
    this.subscriptions.forEach(el => el.unsubscribe());
    this.unsubscribeSearch$.next();
    this.unsubscribeSearch$.complete();
  }

  loadRequestPage() {
    if (this.paginator.pageIndex < 0 || this.paginator.pageIndex > (this.paginator.length / this.paginator.pageSize))
      return;
    this.queryParamsData.from = ((this.paginator.pageIndex * this.paginator.pageSize) + 1);
    this.queryParamsData.to = ((this.paginator.pageIndex + 1) * this.paginator.pageSize);

    this.dataSource.getAllRegisteredCustomerRequests(this.queryParamsData)
  }

}
