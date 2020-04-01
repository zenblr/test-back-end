import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { BranchService } from '../../../../../core/user-management/branch/services/branch.service';
import { LayoutUtilsService, QueryParamsModel } from '../../../../../core/_base/crud';
import { MatSnackBar, MatDialog, MatPaginator, MatSort } from '@angular/material';
import { BranchDatasource } from '../../../../../core/user-management/branch/datasources/branch.datasource';
import { Subscription, merge, fromEvent } from 'rxjs';
import { tap, debounceTime, distinctUntilChanged, skip } from 'rxjs/operators';
import { RolesPageRequested, Role } from '../../../../../core/auth';
import { BranchAddComponent } from '../branch-add/branch-add.component';
import { SelectionModel } from '@angular/cdk/collections';

@Component({
  selector: 'kt-branch-list',
  templateUrl: './branch-list.component.html',
  styleUrls: ['./branch-list.component.scss']
})
export class BranchListComponent implements OnInit {

  // Table fields
  dataSource: BranchDatasource;
  displayedColumns = ['select', 'id', 'name', 'commission', 'actions'];
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild('sort1', { static: true }) sort: MatSort;
  // Filter fields
  @ViewChild('searchInput', { static: true }) searchInput: ElementRef;
  Selection
  selection = new SelectionModel<Role>(true, []);
  rolesResult: Role[] = [];

  // Subscriptions
  private subscriptions: Subscription[] = [];
  // rolesResult: any[];

  constructor(
    public dialog: MatDialog,
    public snackBar: MatSnackBar,
    private layoutUtilsService: LayoutUtilsService,
    private branchService: BranchService
  ) { }

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

    // Filtration, bind to searchInput
    const searchSubscription = fromEvent(this.searchInput.nativeElement, 'keyup').pipe(
      // tslint:disable-next-line:max-line-length
      debounceTime(150), // The user can type quite quickly in the input box, and that could trigger a lot of server requests. With this operator, we are limiting the amount of server requests emitted to a maximum of one every 150ms
      distinctUntilChanged(), // This operator will eliminate duplicate values
      tap(() => {
        this.paginator.pageIndex = 0;
        this.loadRolesList();
      })
    )
      .subscribe();
    this.subscriptions.push(searchSubscription);

    // Init DataSource
    this.dataSource = new BranchDatasource(this.branchService);
    const entitiesSubscription = this.dataSource.entitySubject.pipe(
      skip(1),
      distinctUntilChanged()
    ).subscribe(res => {
      this.rolesResult = res;
    });
    this.subscriptions.push(entitiesSubscription);

    // First load
    // this.loadRolesList();

    // this.dataSource.loadPartners(1, 10, '', '', '', '');
  }

	/**
	 * On Destroy
	 */
  ngOnDestroy() {
    this.subscriptions.forEach(el => el.unsubscribe());
  }


  loadPartnersPage() {
    if (this.paginator.pageIndex < 0 || this.paginator.pageIndex > (this.paginator.length / this.paginator.pageSize))
      return;
    let from = ((this.paginator.pageIndex * this.paginator.pageSize) + 1);
    let to = ((this.paginator.pageIndex + 1) * this.paginator.pageSize);

    this.dataSource.loadBranches(from, to, '', this.searchInput.nativeElement.value, '', '');
  }

	/**
	 * Load Roles List
	 */
  loadRolesList() {
    // this.selection.clear();
    const queryParams = new QueryParamsModel(
      this.filterConfiguration(),
      this.sort.direction,
      this.sort.active,
      this.paginator.pageIndex,
      this.paginator.pageSize
    );
    // Call request from server
    // this.store.dispatch(new RolesPageRequested({ page: queryParams }));
    // this.selection.clear();
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
    const _title = 'Delete Partner';
    const _description = 'Are you sure to permanently delete this partner?';
    const _waitDesciption = 'Partner is deleting...';
    const _deleteMessage = `Partner has been deleted`;

    const dialogRef = this.layoutUtilsService.deleteElement(_title, _description, _waitDesciption);
    dialogRef.afterClosed().subscribe(res => {
      if (!res) {
        return;
      }

      // this.store.dispatch(new RoleDeleted({ id: _item.id }));
      // this.layoutUtilsService.showActionNotification(_deleteMessage, MessageType.Delete);
      // this.loadRolesList();
    });
  }

  addRole() {
    const dialogRef = this.dialog.open(BranchAddComponent, { data: { action: 'add' } });
  }

	/**
	 * Edit role
	 *
	 * @param role: Role
	 */
  editRole(role) {
    // const _saveMessage = `Role successfully has been saved.`;
    // const _messageType = role.id ? MessageType.Update : MessageType.Create;
    const dialogRef = this.dialog.open(BranchAddComponent, { data: { partnerId: role.id, action: 'edit' } });
    dialogRef.afterClosed().subscribe(res => {
      if (!res) {
        return;
      }

      // this.loadRolesList();
      // this.loadPartnersPage();
    });
  }

  viewRole(role) {
    const dialogRef = this.dialog.open(BranchAddComponent, { data: { partnerId: role.id, action: 'view' } });

    dialogRef.afterClosed().subscribe(res => {
      if (!res) {
        return;
      }

      // this.loadRolesList();
      // this.loadPartnersPage();
    });
  }

  /**
	 * Check all rows are selected
	 */
  // isAllSelected(): boolean {
  //   const numSelected = this.selection.selected.length;
  //   const numRows = this.rolesResult.length;
  //   return numSelected === numRows;
  // }

  // /**
  //  * Toggle selection
  //  */
  // masterToggle() {
  //   if (this.selection.selected.length === this.rolesResult.length) {
  //     this.selection.clear();
  //   } else {
  //     this.rolesResult.forEach(row => this.selection.select(row));
  //   }
  // }

}
