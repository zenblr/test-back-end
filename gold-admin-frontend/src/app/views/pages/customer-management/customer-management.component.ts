import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { MatPaginator, MatSort, MatDialog } from '@angular/material';
import { ToastrComponent } from '../../partials/components/toastr/toastr.component';
import { CustomerManagementDatasource } from '../../../core/customer-management/datasources/customer-management.datasource';
import { Subscription, merge, fromEvent } from 'rxjs';
import { LayoutUtilsService } from '../../../core/_base/crud';
import { CustomerManagementService } from '../../../core/customer-management/services/customer-management.service';
import { tap, debounceTime, distinctUntilChanged, skip } from 'rxjs/operators';
import { AddLeadComponent } from './add-lead/add-lead.component';

@Component({
  selector: 'kt-customer-management',
  templateUrl: './customer-management.component.html',
  styleUrls: ['./customer-management.component.scss']
})
export class CustomerManagementComponent implements OnInit {

  dataSource: CustomerManagementDatasource;
  displayedColumns = ['fullName', 'mobile', 'pan', 'state', 'city', 'date', 'time', 'status'];
  leadsResult = []
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild('sort1', { static: true }) sort: MatSort;
  // Filter fields
  // @ViewChild('searchInput', { static: true }) searchInput: ElementRef;
  @ViewChild(ToastrComponent, { static: true }) toastr: ToastrComponent;
  // Subscriptions
  private subscriptions: Subscription[] = [];

  constructor(
    public dialog: MatDialog,
    private layoutUtilsService: LayoutUtilsService,
    private customerManagementService: CustomerManagementService
  ) { }

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
    this.loadLeadsPage();

    this.dataSource.loadLeads(1, 10, '', '', '', '');
  }

  ngOnDestroy() {
    this.subscriptions.forEach(el => el.unsubscribe());
  }


  loadLeadsPage() {
    if (this.paginator.pageIndex < 0 || this.paginator.pageIndex > (this.paginator.length / this.paginator.pageSize))
      return;
    let from = ((this.paginator.pageIndex * this.paginator.pageSize) + 1);
    let to = ((this.paginator.pageIndex + 1) * this.paginator.pageSize);

    this.dataSource.loadLeads(from, to, '', '', '', '');
  }

  addLead(event) {
    console.log(event);
    const dialogRef = this.dialog.open(AddLeadComponent);
    dialogRef.afterClosed().subscribe(res => {
      if (res) {
        this.loadLeadsPage();
      }
    });
  }
}
