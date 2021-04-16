import { Component, OnInit, ViewChild } from '@angular/core';
import { DashboardService, DashboardDatasource, DashboardOverDueDatasource } from '../../../../core/broker';
import { merge, Observable, Subject, Subscription } from 'rxjs';
import { MatPaginator, MatDialog, MatSnackBar, MatSort, } from "@angular/material";
import { skip, distinctUntilChanged, tap, takeUntil } from "rxjs/operators";

@Component({
	selector: 'kt-dashboard',
	templateUrl: './dashboard.component.html',
	styleUrls: ['dashboard.component.scss'],
})
export class DashboardComponent implements OnInit {
	todaysOrderDataSource: DashboardDatasource;
	overDueOrderataSource: DashboardOverDueDatasource;
	displayedTodayOrderColumns = ['brokerName','brokerId','storeId','customerId', 'customerName', 'mobileNumber', 'orderId', 'productName', 'weight', 'emiTenure'];
	displayedOverDueColumns = ['brokerName','brokerId','storeId','customerId', 'customerName', 'mobileNumber', 'orderId', 'productName', 'emiAmmount', 'emiTenure'];

	@ViewChild(MatPaginator, { static: true }) paginator1: MatPaginator;
	@ViewChild(MatPaginator, { static: true }) paginator2: MatPaginator;

	dashboardDetails$: Observable<any>;
	orderList: any;
	overDueOrderList: any;
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
		//first table
		const paginatorSubscriptions = merge(
			this.paginator1.page
		  )
			.pipe(
			  tap(() => {
				this.loadOrderDetails();
			  })
			)
			.subscribe();
		  this.subscriptions.push(paginatorSubscriptions);
		// Init DataSource
		this.todaysOrderDataSource = new DashboardDatasource(this.dashboardService);
		const entitiesSubscription = this.todaysOrderDataSource.entitySubject
			.pipe(skip(1), distinctUntilChanged())
			.subscribe((res) => {
				this.orderList = res;
			});
		this.subscriptions.push(entitiesSubscription);
		this.todaysOrderDataSource.loadOrderDetails(this.orderData);

		//second table 
		const paginatorSubscription = merge(
			this.paginator2.page
		  )
			.pipe(
			  tap(() => {
				this.loadOverDueOrder();
			  })
			)
			.subscribe();
		  this.subscriptions.push(paginatorSubscription);
		// Init DataSource
		this.overDueOrderataSource = new DashboardOverDueDatasource(this.dashboardService);
		const entitiesSubscriptions = this.overDueOrderataSource.entitySubject
			.pipe(skip(1), distinctUntilChanged())
			.subscribe((res) => {
				this.overDueOrderList = res;
			});
		this.subscriptions.push(entitiesSubscriptions);
		this.overDueOrderataSource.loadOverDueOrder(this.orderData);
	}

	getBrokerDashboard() {
		this.dashboardDetails$ = this.dashboardService.getBrokerDashboard();
	}

	loadOrderDetails() {
		if (
			this.paginator1.pageIndex < 0 ||
			this.paginator1.pageIndex >
			this.paginator1.length / this.paginator1.pageSize
		)
			return;
		let from = this.paginator1.pageIndex * this.paginator1.pageSize + 1;
		let to = (this.paginator1.pageIndex + 1) * this.paginator1.pageSize;
		this.orderData.from = from;
		this.orderData.to = to;
		this.todaysOrderDataSource.loadOrderDetails(this.orderData);
	}

	loadOverDueOrder() {
		if (
			this.paginator2.pageIndex < 0 ||
			this.paginator2.pageIndex >
			this.paginator2.length / this.paginator2.pageSize
		)
			return;
		let from = this.paginator2.pageIndex * this.paginator2.pageSize + 1;
		let to = (this.paginator2.pageIndex + 1) * this.paginator2.pageSize;
		this.orderData.from = from;
		this.orderData.to = to;
		this.overDueOrderataSource.loadOverDueOrder(this.orderData);
	}
}
