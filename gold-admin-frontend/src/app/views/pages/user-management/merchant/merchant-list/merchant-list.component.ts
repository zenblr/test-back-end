// Angular
import { Component, OnInit, ElementRef, ViewChild, ChangeDetectionStrategy, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
// Material
import { SelectionModel } from '@angular/cdk/collections';
import { MatPaginator, MatSort, MatSnackBar, MatDialog } from '@angular/material';
// RXJS
import { distinctUntilChanged, tap, skip, take, delay, takeUntil } from 'rxjs/operators';
import {  merge,  of, Subscription, Subject } from 'rxjs';
// NGRX
import { Store } from '@ngrx/store';
// Services
import { LayoutUtilsService, MessageType } from '../../../../../core/_base/crud';
// Models
import { AppState } from '../../../../../core/reducers';
import { MerchantDatasource,MerchantService } from '../../../../../core/user-management/merchant';


@Component({
  selector: 'kt-merchant-list',
  templateUrl: './merchant-list.component.html',
  styleUrls: ['./merchant-list.component.scss']
})
export class MerchantListComponent implements OnInit {

  dataSource: MerchantDatasource;
displayedColumns = ['merchantName', 'fullName', 'mobileNumber', 'email', 'state','city','pincode','approvalStatus','action','apiKey'];
@ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
@ViewChild('sort1', { static: true }) sort: MatSort;

brokerResult:any [] =[];



// Subscriptions
private subscriptions: Subscription[] = [];
private destroy$: Subject<any> = new Subject()

/**
 * Component constructor
 *
 * @param store: Store<AppState>
 * @param dialog: MatDialog
 * @param snackBar: MatSnackBar
 * @param layoutUtilsService: LayoutUtilsService
 */
constructor(
  private store: Store<AppState>,
  public dialog: MatDialog,
  public snackBar: MatSnackBar,
  private layoutUtilsService: LayoutUtilsService,
  private merchantService: MerchantService,
  private router: Router) {
  // this.merchantService.openModal$.pipe(takeUntil(this.destroy$)).subscribe(res => {
  //   if (res) {
  //     this.addRole('add')
  //   }
  // })
}

/**
 * @ Lifecycle sequences => https://angular.io/guide/lifecycle-hooks
 */

/**
 * On init
 */
ngOnInit() {
  // If the user changes the sort order, reset back to the first page.
  const sortSubscription = this.sort.sortChange.subscribe(() => (this.paginator.pageIndex = 0));
  this.subscriptions.push(sortSubscription);

  /* Data load will be triggered in two cases:
  - when a pagination event occurs => this.paginator.page
  - when a sort event occurs => this.sort.sortChange
  **/
  const paginatorSubscriptions = merge(this.sort.sortChange, this.paginator.page).pipe(
    tap(() => {
      this.loadRolesList();
    })
  )
    .subscribe();
  this.subscriptions.push(paginatorSubscriptions);

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
    this.loadRolesList();
  });
}

/**
 * On Destroy
 */
ngOnDestroy() {
  this.subscriptions.forEach(el => el.unsubscribe());
  this.destroy$.next()
  this.destroy$.complete()
}

/**
 * Load Roles List
 */
loadRolesList() {
  if (this.paginator.pageIndex < 0 || this.paginator.pageIndex > (this.paginator.length / this.paginator.pageSize))
    return;
  let from = ((this.paginator.pageIndex * this.paginator.pageSize) + 1);
  let to = ((this.paginator.pageIndex + 1) * this.paginator.pageSize);

  this.dataSource.loadRoles('', from, to, '', '', '');
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
    this.loadRolesList();
  });
}

/** Fetch */
/**
 * Fetch selected rows
 */
fetchRoles() {
  // const messages = [];
  // this.selection.selected.forEach(elem => {
  // 	messages.push({
  // 		text: `${elem.title}`,
  // 		id: elem.id.toString(),
  // 		// status: elem.username
  // 	});
  // });
  // this.layoutUtilsService.fetchElements(messages);
}

/**
 * Add role
 */
// addRole(action) {
//   const dialogRef = this.dialog.open(AddBrokerComponent, {
//     data: { action: action },
//     width: '450px'
//   });
//   dialogRef.afterClosed().subscribe(res => {
//     if (res) {
//       this.loadRolesList();
//     }
//   })
//   this.merchantService.openModal.next(false);
// }






}
