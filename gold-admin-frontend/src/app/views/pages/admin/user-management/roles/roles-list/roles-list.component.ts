// Angular
import { Component, OnInit, ElementRef, ViewChild, ChangeDetectionStrategy, OnDestroy } from '@angular/core';
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
import { RolesDatasource, RolesModel, RolesService } from '../../../../../../core/user-management/roles'


// Components
import { RoleAddDialogComponent } from '../role-add/role-add.dialog.component';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { DataTableService } from '../../../../../../core/shared/services/data-table.service';

@Component({
	selector: 'kt-roles-list',
	templateUrl: './roles-list.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class RolesListComponent implements OnInit, OnDestroy {
	// Table fields
	dataSource: RolesDatasource;
	displayedColumns = ['roleName', 'createdBy', 'modifiedBy', 'modifiedDate', 'modifiedTime', 'action'];
	@ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
	// Selection
	selection = new SelectionModel<RolesModel>(true, []);
	rolesResult: RolesModel[] = [];

	// Subscriptions
	private subscriptions: Subscription[] = [];
	private destroy$: Subject<any> = new Subject()
	private unsubscribeSearch$ = new Subject();
	searchValue = '';

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
		private rolesService: RolesService,
		private router: Router,
		private toast: ToastrService,
		private dataTableService: DataTableService,
	) {
		this.rolesService.openModal$.pipe(takeUntil(this.destroy$)).subscribe(res => {
			if (res) {
				this.addRole('add')
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
			tap(() => this.loadRolesList())
		).subscribe();
		this.subscriptions.push(paginatorSubscriptions);

		const searchSubscription = this.dataTableService.searchInput$.pipe(takeUntil(this.unsubscribeSearch$))
			.subscribe(res => {
				this.searchValue = res;
				this.paginator.pageIndex = 0;
				this.loadRolesList();
			});

		// Init DataSource
		this.dataSource = new RolesDatasource(this.rolesService);
		const entitiesSubscription = this.dataSource.entitySubject.pipe(
			skip(1),
			distinctUntilChanged()
		).subscribe(res => {
			this.rolesResult = res;
			console.log(this.rolesResult)
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
		this.unsubscribeSearch$.next();
		this.unsubscribeSearch$.complete();
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

		this.dataSource.loadRoles(this.searchValue, from, to);
		this.selection.clear();
	}

	deleteRole(id) {
		const _title = 'User Role';
		const _description = 'Are you sure to permanently delete this role?';
		const _waitDesciption = 'Role is deleting...';
		const _deleteMessage = `Role has been deleted`;

		const dialogRef = this.layoutUtilsService.deleteElement(_title, _description, _waitDesciption);
		dialogRef.afterClosed().subscribe(res => {
			if (!res) {
				return;
			}
			this.rolesService.deleteRole(id).pipe(
				map(res => {
					this.toast.success(res.message)
					this.loadRolesList();

				}),
				catchError(err => {
					this.toast.error(err.error.message)
					throw err
				})).subscribe()
		});
	}


	addRole(action) {
		const dialogRef = this.dialog.open(RoleAddDialogComponent, {
			data: { action: action },
			width: '450px'
		});
		dialogRef.afterClosed().subscribe(res => {
			if (res) {
				this.loadRolesList();
			}
		})
		this.rolesService.openModal.next(false);
	}


	permissions(role) {
		this.router.navigate(['/admin/roles/' + role.id])
	}

	editRole(role: RolesModel, action) {
		const dialogRef = this.dialog.open(RoleAddDialogComponent, {
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

			// this.layoutUtilsService.showActionNotification(_saveMessage, _messageType, 10000, true, true);
			this.loadRolesList();
		});
	}


}
