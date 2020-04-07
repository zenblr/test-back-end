// Angular
import { Component, OnInit, ElementRef, ViewChild, ChangeDetectionStrategy, OnDestroy } from '@angular/core';
// Material
import { SelectionModel } from '@angular/cdk/collections';
import { MatPaginator, MatSort, MatSnackBar, MatDialog } from '@angular/material';
// RXJS
import { debounceTime, distinctUntilChanged, tap, skip, take, delay } from 'rxjs/operators';
import { fromEvent, merge, Observable, of, Subscription } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
// NGRX
import { Store } from '@ngrx/store';
// Services
import { LayoutUtilsService, MessageType } from '../../../../../core/_base/crud';
// Models
import { Role, RolesDataSource, RoleDeleted, RolesPageRequested } from '../../../../../core/auth';
import { AppState } from '../../../../../core/reducers';
import { QueryParamsModel } from '../../../../../core/_base/crud';
import { PartnerAddComponent } from '../partner-add/partner-add.component';
import { PartnerDatasource } from '../../../../../core/user-management/partner/datasources/partner.datasource';
import { PartnerService } from '../../../../../core/user-management/partner/services/partner.service';
import { PartnerModel } from '../../../../../core/user-management/partner/models/partner.model';
import { ToastrComponent } from '../../../../../views/partials/components/toastr/toastr.component';

// Components
// import { RoleEditDialogComponent } from '../role-edit/role-edit.dialog.component';

@Component({
  selector: 'kt-partner-list',
  templateUrl: './partner-list.component.html',
  styleUrls: ['./partner-list.component.scss']
})
export class PartnerListComponent implements OnInit {

  // Table fields
  dataSource: PartnerDatasource;
  displayedColumns = ['partnerId', 'name', 'commission', 'actions'];
  @ViewChild(ToastrComponent, { static: true }) toastr: ToastrComponent;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild('sort1', { static: true }) sort: MatSort;
  // Filter fields
  @ViewChild('searchInput', { static: true }) searchInput: ElementRef;
  // Selection
  selection = new SelectionModel<Role>(true, []);
  // rolesResult: Role[] = [];

  // Subscriptions
  private subscriptions: Subscription[] = [];
  partnerResult: PartnerModel[] = [];

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
    private partnerService: PartnerService) {
    this.partnerService.openModal$.subscribe(res => {
      if (res) {
        this.addRole()
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
    // If the user changes the sort order, reset back to the first page.
    const sortSubscription = this.sort.sortChange.subscribe(() => (this.paginator.pageIndex = 0));
    this.subscriptions.push(sortSubscription);

		/* Data load will be triggered in two cases:
		- when a pagination event occurs => this.paginator.page
		- when a sort event occurs => this.sort.sortChange
		**/
    const paginatorSubscriptions = merge(this.sort.sortChange, this.paginator.page).pipe(
      tap(() => {
        // this.loadRolesList();
        this.loadPartnersPage();
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
    //     // this.loadRolesList();
    //     this.loadPartnersPage();
    //   })
    // )
    //   .subscribe();
    // this.subscriptions.push(searchSubscription);

    // Init DataSource
    this.dataSource = new PartnerDatasource(this.partnerService);
    // console.log(this.dataSource);
    const entitiesSubscription = this.dataSource.entitySubject.pipe(
      skip(1),
      distinctUntilChanged()
    ).subscribe(res => {
      this.partnerResult = res;
    });
    this.subscriptions.push(entitiesSubscription);

    this.dataSource.loadPartners(1, 10, '', '', '', '');
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

    this.dataSource.loadPartners(from, to, '', this.searchInput.nativeElement.value, '', '');
  }

	/**
	 * Load Roles List
	 */
  loadRolesList() {
    this.selection.clear();
    const queryParams = new QueryParamsModel(
      this.filterConfiguration(),
      this.sort.direction,
      this.sort.active,
      this.paginator.pageIndex,
      this.paginator.pageSize
    );
    // Call request from server
    this.store.dispatch(new RolesPageRequested({ page: queryParams }));
    this.selection.clear();
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
  deleteRole(_item: Role) {
    const role = _item;
    const _title = 'Delete Partner';
    const _description = 'Are you sure to permanently delete this partner?';
    const _waitDesciption = 'Partner is deleting...';
    const _deleteMessage = `Partner has been deleted`;

    const dialogRef = this.layoutUtilsService.deleteElement(_title, _description, _waitDesciption);
    dialogRef.afterClosed().subscribe(res => {
      if (res) {
        console.log(res);
        this.partnerService.deletePartner(role.id).subscribe(successDelete => {
          this.toastr.successToastr(_deleteMessage);
          this.loadPartnersPage();
        },
          errorDelete => {
            this.toastr.errorToastr(errorDelete.error.message);
          });
      }
    });
  }

  /** Fetch */
	/**
	 * Fetch selected rows
	 */
  fetchRoles() {
    const messages = [];
    this.selection.selected.forEach(elem => {
      messages.push({
        text: `${elem.title}`,
        id: elem.id.toString(),
        // status: elem.username
      });
    });
    this.layoutUtilsService.fetchElements(messages);
  }

	/**
	 * Add role
	 */
  addRole() {
    const dialogRef = this.dialog.open(PartnerAddComponent, { data: { action: 'add' },width:'450px' });
    dialogRef.afterClosed().subscribe(res => {
      if (res) {
        this.loadPartnersPage();
      }
    })
    this.partnerService.openModal.next(false);
  }

	/**
	 * Edit role
	 *
	 * @param role: Role
	 */
  editRole(role: Role) {
    const _saveMessage = `Role successfully has been saved.`;
    const _messageType = role.id ? MessageType.Update : MessageType.Create;
    const dialogRef = this.dialog.open(PartnerAddComponent, { data: { partnerId: role.id, action: 'edit' } });
    dialogRef.afterClosed().subscribe(res => {
      if (res) {
        this.loadPartnersPage();
      }
    });
  }

  viewRole(role) {
    const dialogRef = this.dialog.open(PartnerAddComponent, { data: { partnerId: role.id, action: 'view' } });

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
  //   const numRows = this.partnerResult.length;
  //   return numSelected === numRows;
  // }

	/**
	 * Toggle selection
	 */
  // masterToggle() {
  //   if (this.selection.selected.length === this.partnerResult.length) {
  //     this.selection.clear();
  //   } else {
  //     this.partnerResult.forEach(row => this.selection.select(row));
  //   }
  // }

}
