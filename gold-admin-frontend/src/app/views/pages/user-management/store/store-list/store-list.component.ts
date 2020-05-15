// Angular
import { Component, OnInit, ElementRef, ViewChild, ChangeDetectionStrategy, OnDestroy } from '@angular/core';
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
import { StoreDatasource, StoreService } from '../../../../../core/user-management/store'

// Components
import { CreateStoreComponent } from '../create-store/create-store.component';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

@Component({
	selector: 'kt-store-list',
	templateUrl: './store-list.component.html',
	styleUrls: ['./store-list.component.scss']
})
export class StoreListComponent implements OnInit {
	// Table fields
	dataSource: StoreDatasource;
	displayedColumns = ['storeId', 'merchantName', 'action'];
	@ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;


	// Subscriptions
	private subscriptions: Subscription[] = [];
	private destroy$: Subject<any> = new Subject()
	storeResult: any;

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
		private toast: ToastrService) {
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
		of(undefined).pipe(take(1), delay(1000)).subscribe(() => { // Remove this line, just loading imitation
			this.loadStoreListStore();
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
	loadStoreListStore() {
		if (this.paginator.pageIndex < 0 || this.paginator.pageIndex > (this.paginator.length / this.paginator.pageSize))
			return;
		let from = ((this.paginator.pageIndex * this.paginator.pageSize) + 1);
		let to = ((this.paginator.pageIndex + 1) * this.paginator.pageSize);

		this.dataSource.loadRoles('', from, to);
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
