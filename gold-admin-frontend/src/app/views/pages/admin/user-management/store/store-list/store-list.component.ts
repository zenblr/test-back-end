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
import { StoreDatasource, StoreService } from '../../../../../../core/user-management/store'

// Components
import { CreateStoreComponent } from '../create-store/create-store.component';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { DataTableService } from '../../../../../../core/shared/services/data-table.service';

@Component({
	selector: 'kt-store-list',
	templateUrl: './store-list.component.html',
	styleUrls: ['./store-list.component.scss']
})
export class StoreListComponent implements OnInit {
	// Table fields
	dataSource: StoreDatasource;
	displayedColumns = ['storeId', 'merchantName'];
	@ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;


	// Subscriptions
	private subscriptions: Subscription[] = [];
	private destroy$: Subject<any> = new Subject()
	storeResult: any;
	searchValue = '';
	unsubscribeSearch$: Subject<any> = new Subject()

	/**
	 * Component constructor
	 *
	 * @param store: Store<AppState>
	 * @param dialog: MatDialog
	 * @param snackBar: MatSnackBar
	 * @param layoutUtilsService: LayoutUtilsService
	 */
	constructor(
		public dialog: MatDialog,
		public snackBar: MatSnackBar,
		private layoutUtilsService: LayoutUtilsService,
		private storeService: StoreService,
		private router: Router,
		private toast: ToastrService,
		private dataTableService: DataTableService) {
		this.storeService.openModal$.pipe(takeUntil(this.destroy$)).subscribe(res => {
			if (res) {
				this.createStore('add')
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
			tap(() => this.loadStoreListStore())
		).subscribe();
		this.subscriptions.push(paginatorSubscriptions);

		const searchSubscription = this.dataTableService.searchInput$.pipe(takeUntil(this.unsubscribeSearch$))
			.subscribe(res => {
				this.searchValue = res;
				this.paginator.pageIndex = 0;
				this.loadStoreListStore();
			});


		// Init DataSource
		this.dataSource = new StoreDatasource(this.storeService);
		const entitiesSubscription = this.dataSource.entitySubject.pipe(
			skip(1),
			distinctUntilChanged()
		).subscribe(res => {
			this.storeResult = res;
			console.log(this.storeResult)
		});
		this.subscriptions.push(entitiesSubscription);

		// First load
		// this.loadStoreListStore();
		this.dataSource.loadStores('', 1, 25);

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
	loadStoreListStore() {
		if (this.paginator.pageIndex < 0 || this.paginator.pageIndex > (this.paginator.length / this.paginator.pageSize))
			return;
		let from = ((this.paginator.pageIndex * this.paginator.pageSize) + 1);
		let to = ((this.paginator.pageIndex + 1) * this.paginator.pageSize);

		this.dataSource.loadStores(this.searchValue, from, to);
	}




	createStore(action) {
		const dialogRef = this.dialog.open(CreateStoreComponent, {
			data: { action: action },
			width: '450px'
		});
		dialogRef.afterClosed().subscribe(res => {
			if (res) {
				this.loadStoreListStore();
			}
		})
		this.storeService.openModal.next(false);
	}






}
