import { Component, OnInit, ViewChild } from '@angular/core';
import { NewRequestDatasource } from '../../../../../core/lead-management/datasources/new-request.datasource';
import { map, takeUntil, tap, skip, distinctUntilChanged } from 'rxjs/operators';
import { NewRequestAddComponent } from '../new-request-add/new-request-add.component';
import { DataTableService } from '../../../../../core/shared/services/data-table.service';
import { MatDialog, MatPaginator } from '@angular/material';
import { LeadService } from '../../../../../core/lead-management/services/lead.service';
import { SharedService } from '../../../../../core/shared/services/shared.service';
import { Router } from '@angular/router';
import { Subscription, Subject, merge } from 'rxjs';
import { AssignAppraiserComponent } from '../../user-management/assign-appraiser/assign-appraiser/assign-appraiser.component';
import { NewRequestAssignAppraiserComponent } from '../new-request-assign-appraiser/new-request-assign-appraiser.component';
import { NewRequestService } from '../../../../../core/lead-management/services/new-request.service';
import { NgxPermissionsService } from 'ngx-permissions';

@Component({
  selector: 'kt-new-request-list',
  templateUrl: './new-request-list.component.html',
  styleUrls: ['./new-request-list.component.scss']
})
export class NewRequestListComponent implements OnInit {

  dataSource: NewRequestDatasource;
  displayedColumns = ['customerId', 'fullName', 'product', 'apprasierName', 'appointmentDate', 'appointmentTime', 'status', 'update', 'appraiser', 'apply'];
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
  permission: any;

  constructor(
    public dialog: MatDialog,
    private newRequestService: NewRequestService,
    private dataTableService: DataTableService,
    private router: Router,
    private ngxPermissionsService: NgxPermissionsService
  ) { }

  ngOnInit() {

    this.ngxPermissionsService.permissions$.subscribe(res => {
      this.permission = res;
    })

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
    this.dataSource = new NewRequestDatasource(this.newRequestService);
    const entitiesSubscription = this.dataSource.entitySubject.pipe(
      skip(1),
      distinctUntilChanged()
    ).subscribe(res => {
      this.results = res;
    });
    this.subscriptions.push(entitiesSubscription);

    this.dataSource.getNewRequests(this.queryParamsData);
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

    this.dataSource.getNewRequests(this.queryParamsData);
  }

  editProduct(item) {
    const dialogRef = this.dialog.open(NewRequestAddComponent,
      {
        data: { action: 'edit', leadData: item },
        width: '500px'
      });
    dialogRef.afterClosed().subscribe(res => {
      if (res) {
        this.loadPage();
      }
    });
  }

  assignAppraiser(item) {
    // item.customer = { firstName: item.firstName, lastName: item.lastName }
    const dialogRef = this.dialog.open(AssignAppraiserComponent, { data: { action: 'add', requestData: item, customer: item.customer, id: item.customerId, internalBranchId: item.customer.internalBranchId }, width: '500px' });
    dialogRef.afterClosed().subscribe(res => {
      if (res) {
        this.loadPage();
      }
    });
  }

  updateAppraiser(item) {
    // item.customer = { firstName: item.firstName, lastName: item.lastName }
    // item.customer.customerUniqueId = item.customerUniqueId
    item.appraiser.startTime = item.startTime;
    item.appraiser.endTime = item.endTime;
    item.appraiser.appoinmentDate = item.appoinmentDate;
    item.appraiser.appraiserId = item.appraiserId;

    const dialogRef = this.dialog.open(AssignAppraiserComponent, { data: { action: 'edit', requestData: item, appraiser: item.appraiser, customer: item.customer, internalBranchId: item.customer.internalBranchId }, width: '500px' });
    dialogRef.afterClosed().subscribe(res => {
      if (res) {
        this.loadPage();
      }
    });
  }

  applyKyc(data) {
    let mobile = data.customer.mobileNumber ? data.customer.mobileNumber : ''
    this.router.navigate(['/admin/kyc-setting'], { queryParams: { mob: mobile } });
  }

  applyLoan(loan) {
    this.router.navigate(['/admin/loan-management/loan-application-form/'], { queryParams: { customerID: loan.id } })
  }

  applyScrapBuy(item) {
    this.router.navigate(['/admin/scrap-management/scrap-buying-application-form/'], { queryParams: { customerID: item.id } })
  }

  applyLoanTransfer(loan) {
    this.router.navigate(['/admin/loan-management/loan-transfer'], { queryParams: { customerID: loan.id } })
  }

}
