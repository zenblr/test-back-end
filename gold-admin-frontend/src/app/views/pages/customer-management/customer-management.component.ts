import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator, MatSort, MatDialog } from '@angular/material';
import { ToastrComponent } from '../../partials/components/toastr/toastr.component';
import { CustomerManagementDatasource } from '../../../core/customer-management/datasources/customer-management.datasource';
import { Subscription, merge, Subject } from 'rxjs';
import { CustomerManagementService } from '../../../core/customer-management/services/customer-management.service';
import { tap, distinctUntilChanged, skip, takeUntil, map } from 'rxjs/operators';
import { AddLeadComponent } from './add-lead/add-lead.component';
import { DataTableService } from '../../../core/shared/services/data-table.service';

@Component({
  selector: 'kt-customer-management',
  templateUrl: './customer-management.component.html',
  styleUrls: ['./customer-management.component.scss']
})
export class CustomerManagementComponent implements OnInit {

  dataSource: CustomerManagementDatasource;
  displayedColumns = ['fullName', 'mobile', 'pan', 'state', 'city', 'date', 'status'];
  leadsResult = []
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild('sort1', { static: true }) sort: MatSort;
  // Filter fields
  // @ViewChild('searchInput', { static: true }) searchInput: ElementRef;
  @ViewChild(ToastrComponent, { static: true }) toastr: ToastrComponent;
  destroy$ = new Subject();

  // Subscriptions
  private subscriptions: Subscription[] = [];

  stageName = 'lead'
  private unsubscribeSearch$ = new Subject();
  searchValue = '';

  constructor(
    public dialog: MatDialog,
    private customerManagementService: CustomerManagementService,
    private dataTableService: DataTableService
  ) {
    this.customerManagementService.openModal$.pipe(
      map(res => {
        if (res) {
          this.addLead();
        }
      }),
      takeUntil(this.destroy$)).subscribe();
  }

  ngOnInit() {
    const sortSubscription = this.sort.sortChange.subscribe(() => (this.paginator.pageIndex = 0));
    this.subscriptions.push(sortSubscription);

    const paginatorSubscriptions = merge(this.sort.sortChange, this.paginator.page).pipe(
      tap(() => {
        this.loadLeadsPage();
      })
    )
      .subscribe();
    this.subscriptions.push(paginatorSubscriptions);

    const searchSubscription = this.dataTableService.searchInput$.pipe(takeUntil(this.unsubscribeSearch$))
      .subscribe(res => {
        this.searchValue = res;
        this.paginator.pageIndex = 0;
        this.loadLeadsPage();
      });

    // Init DataSource
    this.dataSource = new CustomerManagementDatasource(this.customerManagementService);
    const entitiesSubscription = this.dataSource.entitySubject.pipe(
      skip(1),
      distinctUntilChanged()
    ).subscribe(res => {
      this.leadsResult = res;
    });
    this.subscriptions.push(entitiesSubscription);

    // First load
    // this.loadLeadsPage();

    this.dataSource.loadLeads(1, 25, this.searchValue, this.stageName);
  }

  ngOnDestroy() {
    this.subscriptions.forEach(el => el.unsubscribe());
    this.unsubscribeSearch$.next();
    this.unsubscribeSearch$.complete();
    this.destroy$.next();
    this.destroy$.complete();
  }


  loadLeadsPage() {
    if (this.paginator.pageIndex < 0 || this.paginator.pageIndex > (this.paginator.length / this.paginator.pageSize))
      return;
    let from = ((this.paginator.pageIndex * this.paginator.pageSize) + 1);
    let to = ((this.paginator.pageIndex + 1) * this.paginator.pageSize);

    this.dataSource.loadLeads(from, to, this.searchValue, this.stageName);
  }

  addLead() {
    // console.log(event);
    const dialogRef = this.dialog.open(AddLeadComponent, {
      data: { action: 'add' }
    });
    dialogRef.afterClosed().subscribe(res => {
      if (res) {
        this.loadLeadsPage();
      }
      this.customerManagementService.openModal.next(false);
    });
  }
}
