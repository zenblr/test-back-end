// Angular
import { Component, OnInit, ElementRef, ViewChild, ChangeDetectionStrategy, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
// Material
import { SelectionModel } from '@angular/cdk/collections';
import { MatPaginator, MatSort, MatSnackBar, MatDialog } from '@angular/material';
// RXJS
import { distinctUntilChanged, tap, skip, take, delay, takeUntil, map, catchError } from 'rxjs/operators';
import { merge, of, Subscription, Subject } from 'rxjs';
// NGRX

// Services
import { LayoutUtilsService, MessageType } from '../../../../../../core/_base/crud';
// Models
import { MerchantDatasource, MerchantService } from '../../../../../../core/user-management/merchant';
import { ViewMerchantComponent } from '../view-merchant/view-merchant.component';
import { ApiKeyComponent } from '../api-key/api-key.component';
import { DataTableService } from '../../../../../../core/shared/services/data-table.service';
import { ToastrService } from 'ngx-toastr';
import { NgxPermissionsService } from 'ngx-permissions';


@Component({
  selector: 'kt-merchant-list',
  templateUrl: './merchant-list.component.html',
  styleUrls: ['./merchant-list.component.scss']
})
export class MerchantListComponent implements OnInit {

  dataSource: MerchantDatasource;
  displayedColumns = ['merchantName', 'initial', 'fullName', 'mobileNumber', 'email', 'state', 'city', 'pincode', 'approvalStatus', 'action', 'apiKey'];
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  searchValue = ''
  unsubscribeSearch$ = new Subject()
  brokerResult: any[] = [];



  // Subscriptions
  private subscriptions: Subscription[] = [];
  private destroy$: Subject<any> = new Subject()

  /**
   * Component constructor
   *
   * 
   * @param dialog: MatDialog
   * @param snackBar: MatSnackBar
   * @param layoutUtilsService: LayoutUtilsService
   */
  constructor(

    public dialog: MatDialog,
    public snackBar: MatSnackBar,
    private layoutUtilsService: LayoutUtilsService,
    private merchantService: MerchantService,
    private dataTableService: DataTableService,
    private router: Router,
    private toast: ToastrService,
    private ngxPermissionService: NgxPermissionsService) {
  }


  ngOnInit() {

    const permission = this.ngxPermissionService.permissions$.subscribe(res => {
      if (!(res.merchantEdit || res.merchantView)) {
        let index = this.displayedColumns.indexOf('action')
        this.displayedColumns.splice(index, 1)
      }
      if (!(res.merchantAdd)) {
        let index = this.displayedColumns.indexOf('apiKey')
        this.displayedColumns.splice(index, 1)
      }
      if (!(res.merchantEdit)) {
        let index = this.displayedColumns.indexOf('approvalStatus')
        this.displayedColumns.splice(index, 1)
      }
    })
    this.subscriptions.push(permission);

    const paginatorSubscriptions = merge(this.paginator.page).pipe(
      tap(() => this.loadMerchantList())
    ).subscribe();
    this.subscriptions.push(paginatorSubscriptions);
    const searchSubscription = this.dataTableService.searchInput$.pipe(
      takeUntil(this.unsubscribeSearch$))
      .subscribe(res => {
        this.searchValue = res;
        this.paginator.pageIndex = 0;
        this.loadMerchantList();
      });
    this.subscriptions.push(searchSubscription);
    // Init DataSource
    this.dataSource = new MerchantDatasource(this.merchantService);
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
      this.loadMerchantList();
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
  loadMerchantList() {
    if (this.paginator.pageIndex < 0 || this.paginator.pageIndex > (this.paginator.length / this.paginator.pageSize))
      return;
    let from = ((this.paginator.pageIndex * this.paginator.pageSize) + 1);
    let to = ((this.paginator.pageIndex + 1) * this.paginator.pageSize);

    this.dataSource.loadMerchant(this.searchValue, from, to);

  }

  editMerchant(merchant) {
    console.log(merchant)
    this.router.navigate(['/admin/user-management/edit-merchant/', merchant.userId])
  }

  viewMerchant(merchant) {
    const dialog = this.dialog.open(ViewMerchantComponent, {
      data: { userId: merchant.userId },
      width: '630px'
    })
  }

  apiKey(merchant) {
    const dialog = this.dialog.open(ApiKeyComponent, {
      data: { userId: merchant.userId },
      width: '420px'
    })
  }

  toogle(merchant, event) {
    this.merchantService.changeStatus(merchant.userId, event).pipe(
      map(res => {
        this.toast.success(res.message)
      }), catchError(err => {
        this.toast.error(err.error.message)
        throw err;
      })).subscribe()
  }
}
