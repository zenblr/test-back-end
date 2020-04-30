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
import { InternalUserBranchDatasource,InternalUserBranchService } from '../../../../../core/user-management/internal-user-branch';

import {AddInternalUserBranchComponent } from '../add-internal-user-branch/add-internal-user-branch.component'

@Component({
  selector: 'kt-internal-user-branch-list',
  templateUrl: './internal-user-branch-list.component.html',
  styleUrls: ['./internal-user-branch-list.component.scss']
})
export class InternalUserBranchListComponent implements OnInit {

 // Table fields
dataSource: InternalUserBranchDatasource;
displayedColumns = ['branchId','branchName','address','state','city', 'pincode', 'action'];
@ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;

internalBranchResult:any [] =[];



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
  private internalUserBranchService: InternalUserBranchService,
  private router: Router) {
  this.internalUserBranchService.openModal$.pipe(takeUntil(this.destroy$)).subscribe(res => {
    if (res) {
      this.addInternalBranch('add')
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
    // Init DataSource
  this.dataSource = new InternalUserBranchDatasource(this.internalUserBranchService);
  const entitiesSubscription = this.dataSource.entitySubject.pipe(
    skip(1),
    distinctUntilChanged()
  ).subscribe(res => {
    this.internalBranchResult = res;
    console.log(this.internalBranchResult)
  });
  this.subscriptions.push(entitiesSubscription);

  // First load
  of(undefined).pipe(take(1), delay(1000)).subscribe(() => { // Remove this line, just loading imitation
    this.loadInternalBranchList();
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
loadInternalBranchList() {
  if (this.paginator.pageIndex < 0 || this.paginator.pageIndex > (this.paginator.length / this.paginator.pageSize))
    return;
  let from = ((this.paginator.pageIndex * this.paginator.pageSize) + 1);
  let to = ((this.paginator.pageIndex + 1) * this.paginator.pageSize);

  this.dataSource.loadInternalBranch('', from, to, '', '', '');
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
    this.loadInternalBranchList();
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
addInternalBranch(action) {
  const dialogRef = this.dialog.open(AddInternalUserBranchComponent, {
    data: { action: action },
    width: '450px'
  });
  dialogRef.afterClosed().subscribe(res => {
    if (res) {
      this.loadInternalBranchList();
    }
  })
  this.internalUserBranchService.openModal.next(false);
}




/**
 * Edit role
 *
 * @param role: Role
 */
editBroker(role, action) {
  const _saveMessage = `Role successfully has been saved.`;
  const _messageType = role.id ? MessageType.Update : MessageType.Create;
  const dialogRef = this.dialog.open(AddInternalUserBranchComponent, {
    data: {
      action: action,
      role: role
    },
    width: '450px'
  });
  dialogRef.afterClosed().subscribe(res => {
    if (!res) {
      return;
    }

    this.layoutUtilsService.showActionNotification(_saveMessage, _messageType, 10000, true, true);
    this.loadInternalBranchList();
  });
}


}
