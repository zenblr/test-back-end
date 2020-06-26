import { Component, OnInit, ViewChild, ChangeDetectorRef } from '@angular/core';
import { DashboardService } from '../../../../../core/emi-management/dashboard/dashboard.service';
import { MatPaginator, PageEvent } from '@angular/material';

@Component({
	selector: 'kt-dashboard',
	templateUrl: './dashboard.component.html',
	styleUrls: ['dashboard.component.scss'],
})
export class DashboardComponent implements OnInit {
	@ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
	dashboardDetails: any;
	totalRecords: number;
	productsData = {
		from: 1,
		to: 25
	};

	constructor(
		private dashboardService: DashboardService,
		private ref: ChangeDetectorRef
	) { }

	ngOnInit() {
		this.getDashboard();
	}

	getDashboard() {
		this.dashboardService.getDashboard(this.productsData).subscribe(res => {
			this.dashboardDetails = res;
			if (res.topSellingSkus) {
				this.totalRecords = res.topSellingSkus.count;
			}
			this.ref.detectChanges();
		});
	}

	getPagination(event?: PageEvent) {
		if (this.paginator.pageIndex < 0 || this.paginator.pageIndex > (this.paginator.length / this.paginator.pageSize))
			return;
		let from = this.paginator.pageIndex * this.paginator.pageSize + 1;
		let to = (this.paginator.pageIndex + 1) * this.paginator.pageSize;
		this.productsData.from = from;
		this.productsData.to = to;
		this.getDashboard();
	}
}
