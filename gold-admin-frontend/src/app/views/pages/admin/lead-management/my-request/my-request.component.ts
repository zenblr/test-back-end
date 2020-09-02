import { Component, OnInit, ViewChild } from '@angular/core';
import { DataTableService } from '../../../../../core/shared/services/data-table.service';
import { merge, Subject, Subscription } from 'rxjs';
import { tap, takeUntil, skip, distinctUntilChanged } from 'rxjs/operators';
import { MyRequestDatasource } from '../../../../../core/lead-management/datasources/my-request.datasource';
import { MatPaginator, MatDialog } from '@angular/material';
import { LeadService } from '../../../../../core/lead-management/services/lead.service';
import { Router } from '@angular/router';
import { NewRequestService } from '../../../../../core/lead-management/services/new-request.service';

@Component({
  selector: 'kt-my-request',
  templateUrl: './my-request.component.html',
  styleUrls: ['./my-request.component.scss']
})
export class MyRequestComponent implements OnInit {

  dataSource: MyRequestDatasource;
  displayedColumns = ['customerId', 'fullName', 'mobileNumber', 'product', 'apply'];
  results = []
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  queryParamsData = {
    from: 1,
    to: 25,
    search: '',
  }
  destroy$ = new Subject();
  filter$ = new Subject();

  // Subscriptions
  private subscriptions: Subscription[] = [];
  private unsubscribeSearch$ = new Subject();
  searchValue = '';
  filteredDataList = {};

  constructor(
    public dialog: MatDialog,
    private newRequestService: NewRequestService,
    private dataTableService: DataTableService,
    private router: Router,
  ) {
  }

  ngOnInit() {

    const paginatorSubscriptions = merge(this.paginator.page).pipe(
      tap(() => this.loadPage())
    ).subscribe();
    this.subscriptions.push(paginatorSubscriptions);


    const searchSubscription = this.dataTableService.searchInput$.pipe(takeUntil(this.unsubscribeSearch$))
      .subscribe(res => {
        this.queryParamsData.search = res;
        this.paginator.pageIndex = 0;
        this.loadPage();
      });

    // Init DataSource
    this.dataSource = new MyRequestDatasource(this.newRequestService);
    const entitiesSubscription = this.dataSource.entitySubject.pipe(
      skip(1),
      distinctUntilChanged()
    ).subscribe(res => {
      this.results = res;
    });
    this.subscriptions.push(entitiesSubscription);

    this.dataSource.getMyRequests(this.queryParamsData);
  }

  ngOnDestroy() {
    this.subscriptions.forEach(el => el.unsubscribe());
    this.unsubscribeSearch$.next();
    this.unsubscribeSearch$.complete();
  }


  loadPage() {
    if (this.paginator.pageIndex < 0 || this.paginator.pageIndex > (this.paginator.length / this.paginator.pageSize))
      return;
    this.queryParamsData.from = ((this.paginator.pageIndex * this.paginator.pageSize) + 1);
    this.queryParamsData.to = ((this.paginator.pageIndex + 1) * this.paginator.pageSize);

    this.dataSource.getMyRequests(this.queryParamsData);
  }

  apply(item) {
   
    if (item.customer.kycStatus === 'approved') {
      switch (item.module.id) {
        case 1:
          this.applyLoan(item)
          break;

        case 3:
          this.applyScrapBuy(item)
          break;

        default:
          break;
      }
    } else if (item.customer.kycStatus === 'pending') {
      this.goToKyc(item)
    }
  }

  applyLoan(loan) {
    this.router.navigate(['/admin/loan-management/loan-application-form/'], { queryParams: { customerID: loan.id } })
  }

  applyScrapBuy(item) {
    this.router.navigate(['/admin/scrap-management/scrap-buying-application-form/'], { queryParams: { customerID: item.customer.customerUniqueId } })
  }

  goToKyc(data) {
    let mobile = data.customer.mobileNumber ? data.customer.mobileNumber : ''
    this.router.navigate(['/admin/kyc-setting'], { queryParams: { mob: mobile } });
  }
}
