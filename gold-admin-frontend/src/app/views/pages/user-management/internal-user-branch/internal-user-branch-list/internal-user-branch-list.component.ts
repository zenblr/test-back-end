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
import { Store } from '@ngrx/store';
// Services
import { LayoutUtilsService, MessageType } from '../../../../../core/_base/crud';
// Models
import { AppState } from '../../../../../core/reducers';
import { InternalUserBranchDatasource, InternalUserBranchService } from '../../../../../core/user-management/internal-user-branch';

import { AddInternalUserBranchComponent } from '../add-internal-user-branch/add-internal-user-branch.component'
import { DataTableService } from '../../../../../core/shared/services/data-table.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'kt-internal-user-branch-list',
  templateUrl: './internal-user-branch-list.component.html',
  styleUrls: ['./internal-user-branch-list.component.scss']
})
export class InternalUserBranchListComponent implements OnInit {

  searchValue: string = ''
  // Table fields
  dataSource: InternalUserBranchDatasource;
  displayedColumns = ['branchId', 'branchName', 'address', 'state', 'city', 'pincode', 'action'];
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;

  internalBranchResult: any[] = [];



  // Subscriptions
  private subscriptions: Subscription[] = [];
  private destroy$: Subject<any> = new Subject()
  private unsubscribeSearch$ = new Subject();
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
    private toast: ToastrService,
    private dataTableService: DataTableService
  ) {
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
    const searchSubscription = this.dataTableService.searchInput$.pipe(takeUntil(this.unsubscribeSearch$))
      .subscribe(res => {
        this.searchValue = res;
        this.paginator.pageIndex = 0;
        this.loadInternalBranchList();
      });
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
    this.unsubscribeSearch$.next()
    this.unsubscribeSearch$.complete()
  }

  /**
   * Load Roles List
   */
  loadInternalBranchList() {
    if (this.paginator.pageIndex < 0 || this.paginator.pageIndex > (this.paginator.length / this.paginator.pageSize))
      return;
    let from = ((this.paginator.pageIndex * this.paginator.pageSize) + 1);
    let to = ((this.paginator.pageIndex + 1) * this.paginator.pageSize);

    this.dataSource.loadInternalBranch(this.searchValue, from, to);
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
  deleteInternalBranch(branch) {
    const _title = 'User Role';
    const _description = 'Are you sure to permanently delete this role?';
    const _waitDesciption = 'Role is deleting...';
    const _deleteMessage = `Role has been deleted`;

    const dialogRef = this.layoutUtilsService.deleteElement(_title, _description, _waitDesciption);
    dialogRef.afterClosed().subscribe(res => {
      if (!res) {
        return;
      }
      this.internalUserBranchService.delete(false,branch.id).pipe(
        map(res =>{
          this.toast.success(res.message)
        }),catchError(err=>{
          this.toast.error(err.error.message)
          console.log(err.error)
          throw err
        })).subscribe()
      this.loadInternalBranchList();
      this.internalUserBranchService.openModal.next(false);

    });
  }


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


  editInternalBranch(internalBranch, action) {
   var branch = this.createData(internalBranch)
    const _saveMessage = `Role successfully has been saved.`;
    const dialogRef = this.dialog.open(AddInternalUserBranchComponent, {
      data: {
        action: action,
        branch: branch
      },
      width: '450px'
    });
    dialogRef.afterClosed().subscribe(res => {
      if (!res) {
        return;
      }

      this.loadInternalBranchList();
      this.internalUserBranchService.openModal.next(false);
    });
  }

  createData(internalBranch){
    var  data = {
      name:internalBranch.name,
      cityId:internalBranch.city.id,
      stateId:internalBranch.state.id,
      address:internalBranch.address,
      pinCode:internalBranch.pinCode,
      userId:internalBranch.id
    }
    return data
  }

}
