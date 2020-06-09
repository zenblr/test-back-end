import { Component, OnInit, ViewChild, Output, EventEmitter, Input, OnChanges, SimpleChanges } from '@angular/core';
import { MatPaginator, MatSort, MatDialog } from '@angular/material';
import { ToastrComponent } from '../../../../partials/components/toastr/toastr.component';
import { CustomerManagementDatasource } from '../../../../../core/customer-management/datasources/customer-management.datasource';
import { Subscription, merge, Subject } from 'rxjs';
import { CustomerManagementService } from '../../../../../core/customer-management/services/customer-management.service';
import { tap, distinctUntilChanged, skip, takeUntil } from 'rxjs/operators';
import { LayoutUtilsService } from '../../../../../core/_base/crud';
import { Router } from '@angular/router';
import { DataTableService } from '../../../../../core/shared/services/data-table.service';

@Component({
  selector: 'kt-customer-list',
  templateUrl: './customer-list.component.html',
  styleUrls: ['./customer-list.component.scss']
})
export class CustomerListComponent implements OnInit, OnChanges {

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

  // Filter fields
  // @ViewChild('searchInput', { static: true }) searchInput: ElementRef;
  @ViewChild(ToastrComponent, { static: true }) toastr: ToastrComponent;
  // Subscriptions
  private subscriptions: Subscription[] = [];
  searchValue = '';
  unsubscribeSearch$: any = new Subject();

  constructor(
    private customerManagementService: CustomerManagementService,
    private layoutUtilsService: LayoutUtilsService,
    private router: Router,
    private dataTableService: DataTableService
  ) {
    window.scrollTo(0, 0);
  }

  ngOnChanges(changes: SimpleChanges) {
    console.log(changes)
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
        console.log(res)
        this.searchValue = res;
        this.paginator.pageIndex = 0;
        this.loadLeadsPage();
      });

    // Init DataSource
    this.dataSource = new CustomerManagementDatasource(this.customerManagementService);
    // const entitiesSubscription = this.dataSource.entitySubject.pipe(
    //   skip(1),
    //   distinctUntilChanged()
    // ).subscribe(res => {
    //   this.customerResult = res;
    //   console.log(this.customerResult)
    // });
    // this.subscriptions.push(entitiesSubscription);

    // // First load
    // this.loadLeadsPage();

    // this.dataSource.getCustomers(1, 25, '');
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
    // this.dataSource.getCustomers(from, to, '');
  }

  editCustomer(role) {
    console.log(role);
  }

  deleteCustomer(customerData) {
    console.log(customerData);
    const customer = customerData;
    const _title = 'Delete Customer';
    const _description = 'Are you sure to permanently delete this customer?';
    const _waitDesciption = 'Customer is deleting...';
    const _deleteMessage = `Customer has been deleted`;

    const dialogRef = this.layoutUtilsService.deleteElement(_title, _description, _waitDesciption);
    dialogRef.afterClosed().subscribe(res => {
      if (res) {
        console.log(res);
        // this.customerManagementService.deleteCustomer(customer.id).subscribe(successDelete => {
        //   this.toastr.successToastr(_deleteMessage);
        //   // this.loadLeadsPage();
        // },
        //   errorDelete => {
        //     this.toastr.errorToastr(errorDelete.error.message);
        //   });
      }
    });
  }

  viewDetails(id: number) {
    this.router.navigate(['/admin/customer-management/customer-list/' + id])
  }

  newLoan(customer) {
    this.router.navigate(['/admin/loan-management/loan-application-form/'], { queryParams: { customerID: customer.customerUniqueId } })
  }

}
