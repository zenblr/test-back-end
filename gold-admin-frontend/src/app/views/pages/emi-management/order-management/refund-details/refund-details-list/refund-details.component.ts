import { Component, OnInit, ViewChild, ElementRef } from "@angular/core";
import {
	MatPaginator,
	MatDialog,
	MatSnackBar,
	MatSort,
} from "@angular/material";
import { Subscription, Subject, merge } from "rxjs";
import { LayoutUtilsService } from "../../../../../../core/_base/crud";
import { DataTableService } from "../../../../../../core/shared/services/data-table.service";
import {
	RefundDetailsDatasource,
	RefundDetailsModel,
	RefundDetailsService,
} from "../../../../../../core/emi-management/order-management";
import { skip, distinctUntilChanged, tap, takeUntil } from "rxjs/operators";
import { RefundDetailsViewComponent } from "../refund-details-view/refund-details-view.component";
import { Router } from "@angular/router";

@Component({
	selector: "kt-refund-details",
	templateUrl: "./refund-details.component.html",
	styleUrls: ["./refund-details.component.scss"],
})
export class RefundDetailsComponent implements OnInit {
	dataSource: RefundDetailsDatasource;
	displayedColumns = [
		"storeId",
		"userId",
		"customerName",
		"mobileNumber",
		"orderId",
		"bookingPrice",
		"totalAmt",
		"cancelPrice",
		"diffAmt",
		"cancelFees",
		"totalCancelCharge",
		"amtPayable",
		"cancelDate",
		"bankName",
		"acNumber",
		"ifscCode",
		// "passbookCopy",
		// "checkCopy",
		"cancelOrder",
		"utrNumber",
		"status",
		"action",
	];
	@ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
	@ViewChild("sort1", { static: true }) sort: MatSort;
	@ViewChild("searchInput", { static: true }) searchInput: ElementRef;
	bulkUploadReportResult: RefundDetailsModel[] = [];
	private subscriptions: Subscription[] = [];
	private destroy$ = new Subject();
	private unsubscribeSearch$ = new Subject();
	searchValue = "";

	constructor(
		public dialog: MatDialog,
		public snackBar: MatSnackBar,
		private layoutUtilsService: LayoutUtilsService,
		private refundDetailsService: RefundDetailsService,
		private dataTableService: DataTableService,
		private router: Router
	) {
		this.refundDetailsService.exportExcel$
			.pipe(takeUntil(this.destroy$))
			.subscribe((res) => {
				if (res) {
					this.downloadReport();
				}
			});
	}
	ngOnInit() {
		const sortSubscription = this.sort.sortChange.subscribe(
			() => (this.paginator.pageIndex = 0)
		);
		this.subscriptions.push(sortSubscription);

		const paginatorSubscriptions = merge(
			this.sort.sortChange,
			this.paginator.page
		)
			.pipe(
				tap(() => {
					this.loadRefundManagementPage();
				})
			)
			.subscribe();
		this.subscriptions.push(paginatorSubscriptions);

		const searchSubscription = this.dataTableService.searchInput$
			.pipe(takeUntil(this.unsubscribeSearch$))
			.subscribe((res) => {
				this.searchValue = res;
				this.paginator.pageIndex = 0;
				this.loadRefundManagementPage();
			});

		this.dataSource = new RefundDetailsDatasource(
			this.refundDetailsService
		);
		const entitiesSubscription = this.dataSource.entitySubject
			.pipe(skip(1), distinctUntilChanged())
			.subscribe((res) => {
				this.bulkUploadReportResult = res;
			});
		this.subscriptions.push(entitiesSubscription);
		this.dataSource.loadRefundManagement(1, 25, this.searchValue);
	}

	loadRefundManagementPage() {
		if (
			this.paginator.pageIndex < 0 ||
			this.paginator.pageIndex >
			this.paginator.length / this.paginator.pageSize
		)
			return;
		let from = this.paginator.pageIndex * this.paginator.pageSize + 1;
		let to = (this.paginator.pageIndex + 1) * this.paginator.pageSize;

		this.dataSource.loadRefundManagement(from, to, this.searchValue);
	}

	filterConfiguration(): any {
		const filter: any = {};
		const searchText: string = this.searchInput.nativeElement.value;
		filter.title = searchText;
		return filter;
	}

	viewRefund(refund) {
		const dialogRef = this.dialog.open(RefundDetailsViewComponent, {
			data: { refundId: refund.id, action: "view" },
			width: "700px",
		});
		dialogRef.afterClosed().subscribe((res) => {
			if (res) {
				console.log(res);
			}
		});
	}

	editRefund(refund) {
		this.router.navigate([
			"emi-management/refund-details/edit-refund-details/",
			refund.id,
		]);
	}

	printCancellationReceipt(order) { }

	downloadReport() {
		this.refundDetailsService.reportExport().subscribe();
		this.refundDetailsService.exportExcel.next(false);
	}

	/**
	 * On Destroy
	 */
	ngOnDestroy() {
		this.subscriptions.forEach((el) => el.unsubscribe());
		this.destroy$.next();
		this.destroy$.complete();
		this.unsubscribeSearch$.next();
		this.unsubscribeSearch$.complete();
	}
}
