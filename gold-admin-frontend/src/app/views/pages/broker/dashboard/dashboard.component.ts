import { Component, OnInit, ViewChild } from '@angular/core';
import { DashboardService, DashboardDatasource } from '../../../../core/broker';
import { merge, Observable, Subject, Subscription } from 'rxjs';
import { MatPaginator, MatDialog, MatSnackBar, MatSort, } from "@angular/material";
import { skip, distinctUntilChanged, tap, takeUntil } from "rxjs/operators";

@Component({
	selector: 'kt-dashboard',
	templateUrl: './dashboard.component.html',
	styleUrls: ['dashboard.component.scss'],
})
export class DashboardComponent implements OnInit {
	dataSource: DashboardDatasource;
	displayedColumns = ['memberId', 'name', 'mobileNumber', 'orderId', 'productName', 'weight', 'emiTenure'];
	@ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
	dashboardDetails$: Observable<any>;
	orderList: any;
	private subscriptions: Subscription[] = [];
	private destroy$ = new Subject();
	orderData = {
		from: 1,
		to: 25,
	};
	
	constructor(
		private dashboardService: DashboardService,
		public dialog: MatDialog,
		public snackBar: MatSnackBar,
	) { }

	ngOnInit() {
		this.getBrokerDashboard();
		const paginatorSubscriptions = merge(
			this.paginator.page
		  )
			.pipe(
			  tap(() => {
				this.loadOrderDetailsPage();
			  })
			)
			.subscribe();
		  this.subscriptions.push(paginatorSubscriptions);
		// Init DataSource
		this.dataSource = new DashboardDatasource(this.dashboardService);
		const entitiesSubscription = this.dataSource.entitySubject
			.pipe(skip(1), distinctUntilChanged())
			.subscribe((res) => {
				this.orderList = res;
			});
		this.subscriptions.push(entitiesSubscription);
		this.dataSource.loadOrderDetails(this.orderData);
	}

	getBrokerDashboard() {
		this.dashboardDetails$ = this.dashboardService.getBrokerDashboard();
	}

	loadOrderDetailsPage() {
		if (
			this.paginator.pageIndex < 0 ||
			this.paginator.pageIndex >
			this.paginator.length / this.paginator.pageSize
		)
			return;
		let from = this.paginator.pageIndex * this.paginator.pageSize + 1;
		let to = (this.paginator.pageIndex + 1) * this.paginator.pageSize;
		this.orderData.from = from;
		this.orderData.to = to;
		this.dataSource.loadOrderDetails(this.orderData);
	}
}
