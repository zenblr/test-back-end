// Angular
import { Component, OnInit, ElementRef, ViewChild, ChangeDetectionStrategy, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
// Material
import { SelectionModel } from '@angular/cdk/collections';
import { MatPaginator, MatSort, MatSnackBar, MatDialog } from '@angular/material';
// RXJS
import { distinctUntilChanged, tap, skip, take, delay, takeUntil, catchError, map } from 'rxjs/operators';
import { merge, of, Subscription, Subject } from 'rxjs';
// NGRX

// Services
import { LayoutUtilsService, MessageType } from '../../../../../../core/_base/crud';
// Models

import { InternalUserDatasource, InternalUserService } from '../../../../../../core/user-management/internal-user';

import { AddInternalUserComponent } from '../add-internal-user/add-internal-user.component'
import { ToastrService } from 'ngx-toastr';
import { DataTableService } from '../../../../../../core/shared/services/data-table.service';

@Component({
  selector: 'kt-internal-user-list',
  templateUrl: './internal-user-list.component.html',
  styleUrls: ['./internal-user-list.component.scss']
})
export class InternalUserListComponent implements OnInit {


  searchValue = ''
  unsubscribeSearch$ = new Subject()
  // Table fields
  dataSource: InternalUserDatasource;
  displayedColumns = ['userId', 'userName', 'role', 'email', 'mobileNumber', 'branchName', 'action'];
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;

  userResult: any[] = [];



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
    public toast: ToastrService,
    public dialog: MatDialog,
    public snackBar: MatSnackBar,
    private layoutUtilsService: LayoutUtilsService,
    private internalUserService: InternalUserService,
    private dataTableService: DataTableService,
    private router: Router) {
    this.internalUserService.openModal$.pipe(takeUntil(this.destroy$)).subscribe(res => {
      if (res) {
        this.addUser('add')
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

    const paginatorSubscriptions = merge(this.paginator.page).pipe(
      tap(() => this.loadUserList())
    ).subscribe();
    this.subscriptions.push(paginatorSubscriptions);

    const searchSubscription = this.dataTableService.searchInput$.pipe(
      takeUntil(this.unsubscribeSearch$))
      .subscribe(res => {
        this.searchValue = res;
        this.paginator.pageIndex = 0;
        this.loadUserList();
      });
    // Init DataSource
    this.dataSource = new InternalUserDatasource(this.internalUserService);
    const entitiesSubscription = this.dataSource.entitySubject.pipe(
      skip(1),
      distinctUntilChanged()
    ).subscribe(res => {
      this.userResult = res;
      
    });
    this.subscriptions.push(entitiesSubscription);

    // First load
    of(undefined).pipe(take(1), delay(1000)).subscribe(() => { // Remove this line, just loading imitation
      this.loadUserList();
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
  loadUserList() {
    if (this.paginator.pageIndex < 0 || this.paginator.pageIndex > (this.paginator.length / this.paginator.pageSize))
      return;
    let from = ((this.paginator.pageIndex * this.paginator.pageSize) + 1);
    let to = ((this.paginator.pageIndex + 1) * this.paginator.pageSize);

    this.dataSource.loadUser(this.searchValue, from, to);
  }

  /**
   * Returns object for filter
   */



  deleteUser(user) {
    const _title = 'User Role';
    const _description = 'Are you sure to permanently delete this user?';
    const _waitDesciption = 'User is deleting...';
    const _deleteMessage = `User has been deleted`;

    const dialogRef = this.layoutUtilsService.deleteElement(_title, _description, _waitDesciption);
    dialogRef.afterClosed().subscribe(res => {
      if (!res) {
        return;
      }

      this.internalUserService.deleteUser(user.id).pipe(
        map(res => {
          this.toast.success(_deleteMessage)
          this.loadUserList();

        }), catchError(err => {
          this.toast.error("Something Went Wrong")
          throw err
        })
      ).subscribe()
    });
  }


  addUser(action) {
    const dialogRef = this.dialog.open(AddInternalUserComponent, {
      data: { action: action },
      width: '450px'
    });
    dialogRef.afterClosed().subscribe(res => {
      if (res) {
        this.internalUserService.openModal.next(false);
        this.loadUserList();
      }
    })
  }

  editUser(user, action) {
    const dialogRef = this.dialog.open(AddInternalUserComponent, {
      data: {
        action: action,
        user: user
      },
      width: '450px'
    });
    dialogRef.afterClosed().subscribe(res => {
      if (res) {
        this.internalUserService.openModal.next(false);
        this.loadUserList();

      }
    });
  }


}
