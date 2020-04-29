import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { BranchService } from '../../../../../core/user-management/branch/services/branch.service';
import { LayoutUtilsService, } from '../../../../../core/_base/crud';
import { MatSnackBar, MatDialog, MatPaginator, MatSort } from '@angular/material';
import { BranchDatasource } from '../../../../../core/user-management/branch/datasources/branch.datasource';
import { Subscription, merge, Subject } from 'rxjs';
import { tap, distinctUntilChanged, skip, takeUntil } from 'rxjs/operators';
import { BranchAddComponent } from '../branch-add/branch-add.component';
import { BranchModel } from '../../../../../core/user-management/branch/models/branch.model';
import { ToastrComponent } from '../../../../../views/partials/components/toastr/toastr.component';
import { DataTableService } from '../../../../../core/shared/services/data-table.service';

@Component({
  selector: 'kt-branch-list',
  templateUrl: './branch-list.component.html',
  styleUrls: ['./branch-list.component.scss']
})
export class BranchListComponent implements OnInit {

  // Table fields
  dataSource: BranchDatasource;
  @ViewChild(ToastrComponent, { static: true }) toastr: ToastrComponent;
  displayedColumns = ['branchId', 'name', 'partner', 'state', 'city', 'actions'];
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild('sort1', { static: true }) sort: MatSort;
  // Filter fields
  @ViewChild('searchInput', { static: true }) searchInput: ElementRef;
  branchResult: BranchModel[] = [];


  // Subscriptions
  private subscriptions: Subscription[] = [];
  private destroy$ = new Subject();
  private unsubscribeSearch$ = new Subject();
  searchValue = '';


  constructor(
    public dialog: MatDialog,
    public snackBar: MatSnackBar,
    private layoutUtilsService: LayoutUtilsService,
    private branchService: BranchService,
    private dataTableService: DataTableService
  ) {
    this.branchService.openModal$.pipe(takeUntil(this.destroy$)).subscribe(res => {
      if (res) {
        this.addRole();
      }
    })
  }

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
        this.loadBranchPage();
      })
    )
      .subscribe();
    this.subscriptions.push(paginatorSubscriptions);

    // Filtration, bind to searchInput
    // const searchSubscription = fromEvent(this.searchInput.nativeElement, 'keyup').pipe(
    //   // tslint:disable-next-line:max-line-length
    //   debounceTime(150), // The user can type quite quickly in the input box, and that could trigger a lot of server requests. With this operator, we are limiting the amount of server requests emitted to a maximum of one every 150ms
    //   distinctUntilChanged(), // This operator will eliminate duplicate values
    //   tap(() => {
    //     this.paginator.pageIndex = 0;
    //     this.loadBranchPage();
    //   })
    // )
    //   .subscribe();
    // this.subscriptions.push(searchSubscription);

    const searchSubscription = this.dataTableService.searchInput$.pipe(takeUntil(this.unsubscribeSearch$))
      .subscribe(res => {
        this.searchValue = res;
        this.paginator.pageIndex = 0;
        this.loadBranchPage();
      });

    // Init DataSource
    this.dataSource = new BranchDatasource(this.branchService);
    const entitiesSubscription = this.dataSource.entitySubject.pipe(
      skip(1),
      distinctUntilChanged()
    ).subscribe(res => {
      this.branchResult = res;
    });
    this.subscriptions.push(entitiesSubscription);

    // First load
    // this.loadBranchPage();

    this.dataSource.loadBranches(1, 25, this.searchValue, '', '', '');
  }

	/**
	 * On Destroy
	 */
  ngOnDestroy() {
    this.subscriptions.forEach(el => el.unsubscribe());
    this.destroy$.next();
    this.destroy$.complete();
    this.unsubscribeSearch$.next();
    this.unsubscribeSearch$.complete();
  }


  loadBranchPage() {
    if (this.paginator.pageIndex < 0 || this.paginator.pageIndex > (this.paginator.length / this.paginator.pageSize))
      return;
    let from = ((this.paginator.pageIndex * this.paginator.pageSize) + 1);
    let to = ((this.paginator.pageIndex + 1) * this.paginator.pageSize);

    this.dataSource.loadBranches(from, to, this.searchValue, '', '', '');
  }

	/**
	 * Returns object for filter
	 */
  filterConfiguration(): any {
    const filter: any = {};
    const searchText: string = this.searchInput.nativeElement.value;
    filter.title = searchText;
    return filter;
  }

  /** ACTIONS */
	/**
	 * Delete role
	 *
	 * @param _item: Role
	 */
  deleteRole(_item) {
    const role = _item;
    const _title = 'Delete Branch';
    const _description = 'Are you sure to permanently delete this branch?';
    const _waitDesciption = 'Branch is deleting...';
    const _deleteMessage = `Branch has been deleted`;

    const dialogRef = this.layoutUtilsService.deleteElement(_title, _description, _waitDesciption);
    dialogRef.afterClosed().subscribe(res => {
      if (res) {
        console.log(res);
        this.branchService.deleteBranch(role.id).subscribe(successDelete => {
          this.toastr.successToastr(_deleteMessage);
          this.loadBranchPage();
        },
          errorDelete => {
            this.toastr.errorToastr(errorDelete.error.message);
          });
      }
      // this.store.dispatch(new RoleDeleted({ id: _item.id }));
      // this.layoutUtilsService.showActionNotification(_deleteMessage, MessageType.Delete);
    });
  }

  addRole() {
    const dialogRef = this.dialog.open(BranchAddComponent, {
      data: { action: 'add' },
      width: '450px'
    });
    dialogRef.afterClosed().subscribe(res => {
      if (res) {
        this.loadBranchPage();
      }
    });
    this.branchService.openModal.next(false)
  }

	/**
	 * Edit role
	 *
	 * @param role: Role
	 */
  editRole(role) {
    console.log(role);
    // const _saveMessage = `Role successfully has been saved.`;
    // const _messageType = role.id ? MessageType.Update : MessageType.Create;
    const dialogRef = this.dialog.open(BranchAddComponent,
      {
        data: { partnerId: role.id, action: 'edit' },
        width: '450px'
      });
    dialogRef.afterClosed().subscribe(res => {
      if (res) {
        this.loadBranchPage();
      }
    });
  }

  viewRole(role) {
    const dialogRef = this.dialog.open(BranchAddComponent, {
      data: { partnerId: role.id, action: 'view' },
      width: '450px'
    });

    dialogRef.afterClosed().subscribe(res => {
      if (!res) {
        return;
      }
    });
  }




}
