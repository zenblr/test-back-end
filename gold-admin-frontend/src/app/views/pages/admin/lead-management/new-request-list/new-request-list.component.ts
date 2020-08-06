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

@Component({
  selector: 'kt-new-request-list',
  templateUrl: './new-request-list.component.html',
  styleUrls: ['./new-request-list.component.scss']
})
export class NewRequestListComponent implements OnInit {

  dataSource: NewRequestDatasource;
  displayedColumns = ['customerId', 'fullName', 'mobileNumber', 'product', 'update', 'appraiser'];
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
    private leadService: LeadService,
    private dataTableService: DataTableService,
    private router: Router,
    private sharedService: SharedService
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
    this.dataSource = new NewRequestDatasource(this.leadService);
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
    item.customer = { firstName: item.firstName, lastName: item.lastName }
    const dialogRef = this.dialog.open(AssignAppraiserComponent, { data: { action: 'add', from: 'lead', customer: item.customer, id: item.id }, width: '500px' });
    dialogRef.afterClosed().subscribe(res => {
      if (res) {
        this.loadPage();
      }
    });
  }

  updateAppraiser(item) {
    item.customer = { firstName: item.firstName, lastName: item.lastName }
    item.customer.customerUniqueId = item.customerUniqueId
    const dialogRef = this.dialog.open(AssignAppraiserComponent, { data: { action: 'edit', from: 'lead', appraiser: item.customerAssignAppraiser, customer: item.customer, id: item.id }, width: '500px' });
    dialogRef.afterClosed().subscribe(res => {
      if (res) {
        this.loadPage();
      }
    });
  }

}
