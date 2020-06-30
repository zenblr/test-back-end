// Angular
import { Component, OnInit, ViewChild, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { MatPaginator, MatSort, MatSnackBar, MatDialog } from '@angular/material';
// RXJS
import { distinctUntilChanged, tap, skip, take, delay, takeUntil, map, catchError } from 'rxjs/operators';
import { merge, of, Subscription, Subject } from 'rxjs';
// NGRX
// Services
import { LayoutUtilsService, MessageType } from '../../../../../../core/_base/crud';
// Models
import { BrokerDatasource, BrokerService } from '../../../../../../core/user-management/broker';

import { AddBrokerComponent } from '../add-broker/add-broker.component'
import { ToastrService } from 'ngx-toastr';
import { DataTableService } from '../../../../../../core/shared/services/data-table.service';


@Component({
  selector: 'kt-broker-list',
  templateUrl: './broker-list.component.html',
  styleUrls: ['./broker-list.component.scss']
})
export class BrokerListComponent implements OnInit, OnDestroy {

  searchValue = ''
  unsubscribeSearch$ = new Subject()
  // Table fields
  dataSource: BrokerDatasource;
  displayedColumns = ['merchantName','brokerId', 'storeId', 'email', 'mobileNumber', 'address', 'state', 'city', 'pincode', 'approvalStatus', 'status', 'action'];
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;


  brokerResult: any[] = [];



  // Subscriptions
  private subscriptions: Subscription[] = [];
  private destroy$: Subject<any> = new Subject()
  status: any[] = [];

  /**
   * Component constructor
   *
   * 
   * @param dialog: MatDialog
   * @param snackBar: MatSnackBar
   * @param layoutUtilsService: LayoutUtilsService
   */
  constructor(
    public ref: ChangeDetectorRef,
    public dialog: MatDialog,
    public snackBar: MatSnackBar,
    private layoutUtilsService: LayoutUtilsService,
    private brokerService: BrokerService,
    private router: Router,
    private dataTableService: DataTableService,
    private toast: ToastrService
  ) {
    this.brokerService.openModal$.pipe(takeUntil(this.destroy$)).subscribe(res => {
      if (res) {
        this.addBroker('add')
      }
    })
  }

  /**
   * @ Lifecycle sequences => https://angular.io/guide/lifecycle-hooks
   */

  /**
   * On init
   */
  ngOnInit() {
    this.getStatus()
    const paginatorSubscriptions = merge(this.paginator.page).pipe(
      tap(() => this.loadBrokerList())
    )
      .subscribe();
    this.subscriptions.push(paginatorSubscriptions);

    const searchSubscription = this.dataTableService.searchInput$.pipe(
      takeUntil(this.unsubscribeSearch$))
      .subscribe(res => {
        this.searchValue = res;
        this.paginator.pageIndex = 0;
        this.loadBrokerList();
      });
    this.subscriptions.push(searchSubscription);
    // Init DataSource
    this.dataSource = new BrokerDatasource(this.brokerService);
    const entitiesSubscription = this.dataSource.entitySubject.pipe(
      skip(1),
      distinctUntilChanged()
    ).subscribe(res => {
      this.brokerResult = res;
      console.log(this.brokerResult)
    });
    this.subscriptions.push(entitiesSubscription);

    // First load
    of(undefined).pipe(take(1), delay(1000)).subscribe(() => { // Remove this line, just loading imitation
      this.loadBrokerList();
    });
  }

  /**
   * On Destroy
   */
  ngOnDestroy() {
    this.subscriptions.forEach(el => el.unsubscribe());
    this.destroy$.next()
    this.destroy$.complete()
    this.unsubscribeSearch$.next();
    this.unsubscribeSearch$.complete();
  }



  /**
   * Load Roles List
   */
  loadBrokerList() {
    if (this.paginator.pageIndex < 0 || this.paginator.pageIndex > (this.paginator.length / this.paginator.pageSize))
      return;
    let from = ((this.paginator.pageIndex * this.paginator.pageSize) + 1);
    let to = ((this.paginator.pageIndex + 1) * this.paginator.pageSize);

    this.dataSource.loadBrokers(this.searchValue, from, to);
    // this.selection.clear();
    // const queryParams = new QueryParamsModel(
    // 	this.filterConfiguration(),
    // 	this.sort.direction,
    // 	this.sort.active,
    // 	this.paginator.pageIndex,
    // 	this.paginator.pageSize
    // );
    // Call request from server
    // this.store.dispatch(new RolesPageRequested({ page: queryParams }));
    // this.selection.clear();
  }

  /**
   * Returns object for filter
   */


  /** ACTIONS */
  /**
   * Delete role
   *
   * @param _item: Role
   */
  deleteRole(_item) {
    const _title = 'User Role';
    const _description = 'Are you sure to permanently delete this role?';
    const _waitDesciption = 'Role is deleting...';
    const _deleteMessage = `Role has been deleted`;

    const dialogRef = this.layoutUtilsService.deleteElement(_title, _description, _waitDesciption);
    dialogRef.afterClosed().subscribe(res => {
      if (!res) {
        return;
      }

      // this.store.dispatch(new RoleDeleted({ id: _item.id }));
      this.layoutUtilsService.showActionNotification(_deleteMessage, MessageType.Delete);
      this.loadBrokerList();
    });
  }

  getStatus() {

    this.brokerService.getStatus().pipe(
      map(res => {
        this.status = res
      }),
      catchError(err => {
        this.toast.error('Error', err.error.message)
        throw err
      })).subscribe()

  }

  addBroker(action) {
    const dialogRef = this.dialog.open(AddBrokerComponent, {
      data: { action: action, status: this.status },
      width: '450px'
    });
    dialogRef.afterClosed().subscribe(res => {
      if (res) {
        this.loadBrokerList();
      }
    })
    this.brokerService.openModal.next(false);
  }


  editBroker(broker, action) {
    // let data = this.createData(broker)
    // console.log(data)
    const _saveMessage = `Updated successfully has been saved.`;
    const dialogRef = this.dialog.open(AddBrokerComponent, {
      data: {
        action: action,
        broker: broker.id,
        status: this.status
      },
      width: '450px'
    });
    dialogRef.afterClosed().subscribe(res => {
      if (res) {
        this.loadBrokerList();
      }
      this.brokerService.openModal.next(false);
    });
  }

  toogle(broker, event) {
    this.brokerService.bokerStatus(broker.id, event.checked).pipe(
      map(res => {
        this.toast.success(res.message, 'Status Changed Successfully')
      }),
      catchError(err => {
        this.toast.error(err.error.message)
        throw err
      })).subscribe()
  }

  createData(broker) {
    var data = {
      merchantId: broker.merchant.id,
      firstName: broker.user.firstName,
      lastName: broker.user.lastName,
      mobileNumber: broker.user.mobileNumber,
      email: broker.user.email,
      stateId: broker.user.address[0].state.id,
      pinCode: broker.user.address[0].postalCode,
      cityId: broker.user.address[0].city.id,
      storeId: broker.storeId,
      address: broker.user.address[0].address,
      approvalStatusId: broker.approvalStatus.id,
      userId: broker.userId,
      nameOnPanCard: broker.nameOnPanCard,
      panCard: broker.panCard,
      panCardNumber: broker.user.panCardNumber,
      ifscCode: broker.ifscCode,
      bankName: broker.bankName,
      bankBranch: broker.bankBranch,
      accountHolderName: broker.accountHolderName,
      accountNumber: broker.accountNumber,
      passbookStatementChequeId:broker.passbookStatementCheque,
      passbookImg:broker.passbookStatementChequeDetails.url,
      passbookImgName:broker.passbookStatementChequeDetails.originalname
    }
    if(broker.panCardDetails){
      data['imgName'] = broker.panCardDetails.originalname
      data['panCardImg'] = broker.panCardDetails.url
    }
    return data
  }


}
