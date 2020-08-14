import { Component, OnInit, ViewChild, Input, EventEmitter, Output, SimpleChanges } from '@angular/core';
import { MatPaginator, MatSort, MatDialog } from '@angular/material';
import { Subscription, merge, Subject, from } from 'rxjs';
import { tap, distinctUntilChanged, skip, takeUntil, map } from 'rxjs/operators';
import { DataTableService } from '../../../../../../core/shared/services/data-table.service';
import { CustomerManagementDatasource, ScrapCustomerManagementService } from '../../../../../../core/scrap-management';
import { LayoutUtilsService } from '../../../../../../core/_base/crud';
import { ToastrService } from 'ngx-toastr';
import { NgxPermissionsService } from 'ngx-permissions';
import { Router } from '@angular/router';
import { ToastrComponent } from '../../../../../partials/components/toastr/toastr.component';

@Component({
  selector: 'kt-customer-list',
  templateUrl: './customer-list.component.html',
  styleUrls: ['./customer-list.component.scss']
})
export class CustomerListComponent implements OnInit {
  toogler: string;
  @Input() data;
  @Input() hasItems
  @Input() isPreloadTextViewed
  @Output() pagination = new EventEmitter
  @Input() paginatorTotal;
  dataSource: CustomerManagementDatasource;
  displayedColumns = ['fullName', 'customerId', 'pan', 'state', 'city', 'actions'];
  customerResult = [];
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;

  @ViewChild(ToastrComponent, { static: true }) toastr: ToastrComponent;
  // Subscriptions
  private subscriptions: Subscription[] = [];
  searchValue = '';
  unsubscribeSearch$: any = new Subject();
  constructor(
    public dialog: MatDialog,
    private customerManagementService: ScrapCustomerManagementService,
    private dataTableService: DataTableService,
    private layoutUtilsService: LayoutUtilsService,
    private ngxPermissionService: NgxPermissionsService,
    private router: Router,
  ) { }

  ngOnChanges(changes: SimpleChanges) {
    // console.log(changes)
    if (changes.data)
      this.customerResult = changes.data.currentValue
    // this.dataSource.isPreloadTextViewedSubject.
  }

  ngOnInit() {

    const paginatorSubscriptions = merge(this.paginator.page).pipe(
      tap(() => this.loadLeadsPage())
    ).subscribe()
    this.subscriptions.push(paginatorSubscriptions);

    const searchSubscription = this.dataTableService.searchInput$.pipe(takeUntil(this.unsubscribeSearch$))
      .subscribe(res => {
        // console.log(res)
        this.searchValue = res;
        this.paginator.pageIndex = 0;
        this.loadLeadsPage();
      });

    // Init DataSource
    this.dataSource = new CustomerManagementDatasource(this.customerManagementService);
  }

  ngOnDestroy() {
    this.subscriptions.forEach(el => el.unsubscribe());
  }


  loadLeadsPage() {
    if (this.paginator.pageIndex < 0 || this.paginator.pageIndex > (this.paginator.length / this.paginator.pageSize))
      return;
    let from = ((this.paginator.pageIndex * this.paginator.pageSize) + 1);
    let to = ((this.paginator.pageIndex + 1) * this.paginator.pageSize);
    let search = this.searchValue;
    this.pagination.emit({ from: from, to: to, search: search })
  }

  newScrap(item) {
    this.router.navigate(['/admin/scrap-management/scrap-buying-application-form/'], { queryParams: { customerID: item.customerUniqueId } })
  }

  viewDetails(id: number) {
    this.router.navigate(['/admin/scrap-management/customer-list/' + id])
  }
}
