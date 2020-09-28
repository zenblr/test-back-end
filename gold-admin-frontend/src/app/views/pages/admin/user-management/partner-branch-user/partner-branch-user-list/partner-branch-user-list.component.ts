import { Component, OnInit, ViewChild } from '@angular/core';
import { PartnerBranchUserDatasource, PartnerBranchUserService } from "../../../../../../core/user-management/partner-branch-user";
import { ToastrService } from 'ngx-toastr';
import { DataTableService } from '../../../../../../core/shared/services/data-table.service';
// RXJS
import { distinctUntilChanged, tap, skip, take, delay, takeUntil, catchError, map } from 'rxjs/operators';
import { Subject, Subscription, merge } from 'rxjs';
import { MatPaginator, MatDialog, MatSnackBar } from '@angular/material';

// Services
import { LayoutUtilsService, MessageType } from '../../../../../../core/_base/crud';
//Component
import { AddPartnerBranchUserComponent } from "../add-partner-branch-user/add-partner-branch-user.component";

@Component({
  selector: 'kt-partner-branch-user-list',
  templateUrl: './partner-branch-user-list.component.html',
  styleUrls: ['./partner-branch-user-list.component.scss']
})
export class PartnerBranchUserListComponent implements OnInit {
  searchValue = ''
  unsubscribeSearch$ = new Subject()
  displayedColumns = ['userId', 'userName', 'email', 'mobileNumber', 'partnerName', 'branchName', 'action'];
  dataSource: PartnerBranchUserDatasource;

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;

  userResult: any[] = [];



  // Subscriptions
  private subscriptions: Subscription[] = [];
  private destroy$: Subject<any> = new Subject()
  constructor(
    private userService: PartnerBranchUserService,
    public toast: ToastrService,
    private dataTableService: DataTableService,
    public dialog: MatDialog,
    public snackBar: MatSnackBar,
    private layoutUtilsService: LayoutUtilsService,

  ) {
    this.userService.openModal$.pipe(takeUntil(this.destroy$)).subscribe(res => {
      if (res)
        this.addUser("add")
    })
  }

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
    this.dataSource = new PartnerBranchUserDatasource(this.userService);
    const entitiesSubscription = this.dataSource.entitySubject.pipe(
      skip(1),
      distinctUntilChanged()
    ).subscribe(res => {
      this.userResult = res;
      // console.log(this.userResult)
    });
    this.subscriptions.push(entitiesSubscription);
    this.dataSource.loadUser(this.searchValue, 1, 25);


  }

  ngOnDestroy() {
    this.subscriptions.forEach(el => el.unsubscribe());
    this.destroy$.next()
    this.destroy$.complete()
  }

  loadUserList() {
    if (this.paginator.pageIndex < 0 || this.paginator.pageIndex > (this.paginator.length / this.paginator.pageSize))
      return;
    let from = ((this.paginator.pageIndex * this.paginator.pageSize) + 1);
    let to = ((this.paginator.pageIndex + 1) * this.paginator.pageSize);

    this.dataSource.loadUser(this.searchValue, from, to);
  }
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

      this.userService.deleteUser(user.id).pipe(
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
    const dialogRef = this.dialog.open(AddPartnerBranchUserComponent, {
      data: { action: action },
      width: '450px'
    });
    dialogRef.afterClosed().subscribe(res => {
      if (res) {
        this.loadUserList();
      }
      this.userService.openModal.next(false);
    })
  }

  editUser(user, action) {
    const dialogRef = this.dialog.open(AddPartnerBranchUserComponent, {
      data: {
        action: action,
        user: user
      },
      width: '450px'
    });
    dialogRef.afterClosed().subscribe(res => {
      if (res) {
        this.userService.openModal.next(false);
        this.loadUserList();

      }
    });
  }

  viewUser(user, action) {
    const dialogRef = this.dialog.open(AddPartnerBranchUserComponent, {
      data: {
        action: action,
        user: user
      },
      width: '450px'
    });
    dialogRef.afterClosed().subscribe(res => {
      if (res) {
        this.userService.openModal.next(false);
        this.loadUserList();
      }
    });
  }

}
