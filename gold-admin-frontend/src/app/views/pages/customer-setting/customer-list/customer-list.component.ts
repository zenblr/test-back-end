import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator, MatSort, MatDialog } from '@angular/material';
import { ToastrComponent } from '../../../partials/components/toastr/toastr.component';
import { CustomerManagementDatasource } from '../../../../core/customer-management/datasources/customer-management.datasource';
import { Subscription, merge } from 'rxjs';
import { CustomerManagementService } from '../../../../core/customer-management/services/customer-management.service';
import { tap, distinctUntilChanged, skip } from 'rxjs/operators';
import { LayoutUtilsService } from '../../../../core/_base/crud';

@Component({
  selector: 'kt-customer-list',
  templateUrl: './customer-list.component.html',
  styleUrls: ['./customer-list.component.scss']
})
export class CustomerListComponent implements OnInit {

  toogler:string;
  dataSource: CustomerManagementDatasource;
  displayedColumns = ['fullName', 'customerId', 'mobile', 'pan', 'state', 'city', 'actions'];
  leadsResult = [];
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild('sort1', { static: true }) sort: MatSort;
  // Filter fields
  // @ViewChild('searchInput', { static: true }) searchInput: ElementRef;
  @ViewChild(ToastrComponent, { static: true }) toastr: ToastrComponent;
  // Subscriptions
  private subscriptions: Subscription[] = [];

  constructor(
    private customerManagementService: CustomerManagementService,
    private layoutUtilsService: LayoutUtilsService,
  ) { 
    
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

}
