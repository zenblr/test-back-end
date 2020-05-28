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
	EmiDetailsService,
	EmiDetailsDatasource,
	EmiDetailsModel,
} from "../../../../../../core/emi-management/order-management";
import { skip, distinctUntilChanged, tap, takeUntil } from "rxjs/operators";
import { EmiDetailsViewComponent } from "../emi-details-view/emi-details-view.component";
import { SharedService } from "../../../../../../core/shared/services/shared.service";

@Component({
	selector: "kt-emi-details-list",
	templateUrl: "./emi-details-list.component.html",
	styleUrls: ["./emi-details-list.component.scss"],
})
export class EmiDetailsListComponent implements OnInit {
	dataSource: EmiDetailsDatasource;
	displayedColumns = [
		"storeId",
		"userId",
		"mobileNumber",
		"orderId",
		"emiDate",
		"emiAmount",
		"emiPaidDate",
		"status",
		"emiFrom",
		"action",
	];
	@ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
	@ViewChild("sort1", { static: true }) sort: MatSort;
	// Filter fields
	@ViewChild("searchInput", { static: true }) searchInput: ElementRef;
	emiDetailsResult: EmiDetailsModel[] = [];
	// Subscriptions
	private subscriptions: Subscription[] = [];
	private destroy$ = new Subject();
	private unsubscribeSearch$ = new Subject();
	searchValue = "";
	emiData = {
		from: 1,
		to: 25,
		search: "",
		orderemistatus: "",
	};

	constructor(
		public dialog: MatDialog,
		public snackBar: MatSnackBar,
		private layoutUtilsService: LayoutUtilsService,
		private emiDetailsService: EmiDetailsService,
		private dataTableService: DataTableService,
		private sharedService: SharedService
	) {
		this.emiDetailsService.exportExcel$
			.pipe(takeUntil(this.destroy$))
			.subscribe((res) => {
				if (res) {
					this.downloadReport();
				}
			});

		this.emiDetailsService.applyFilter$
			.pipe(takeUntil(this.destroy$))
			.subscribe((res) => {
				if (Object.entries(res).length) {
					this.applyFilter(res);
				}
			});
	}

	ngOnInit() {
		// If the user changes the sort order, reset back to the first page.
		const sortSubscription = this.sort.sortChange.subscribe(
			() => (this.paginator.pageIndex = 0)
		);
		this.subscriptions.push(sortSubscription);

		/* Data load will be triggered in two cases:
		- when a pagination event occurs => this.paginator.page
		- when a sort event occurs => this.sort.sortChange
		**/
		const paginatorSubscriptions = merge(
			this.sort.sortChange,
			this.paginator.page
		)
			.pipe(
				tap(() => {
					this.loadEmiDetailsPage();
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
		//     this.loadOrderDetailsPage();
		//   })
		// )
		//   .subscribe();
		// this.subscriptions.push(searchSubscription);

		const searchSubscription = this.dataTableService.searchInput$
			.pipe(takeUntil(this.unsubscribeSearch$))
			.subscribe((res) => {
				this.searchValue = res;
				this.paginator.pageIndex = 0;
				this.loadEmiDetailsPage();
			});

		// Init DataSource
		this.dataSource = new EmiDetailsDatasource(this.emiDetailsService);
		const entitiesSubscription = this.dataSource.entitySubject
			.pipe(skip(1), distinctUntilChanged())
			.subscribe((res) => {
				this.emiDetailsResult = res;
			});
		this.subscriptions.push(entitiesSubscription);
		this.dataSource.loadEmiDetails(this.emiData);
	}

	loadEmiDetailsPage() {
		if (
			this.paginator.pageIndex < 0 ||
			this.paginator.pageIndex >
				this.paginator.length / this.paginator.pageSize
		)
			return;
		let from = this.paginator.pageIndex * this.paginator.pageSize + 1;
		let to = (this.paginator.pageIndex + 1) * this.paginator.pageSize;
		this.emiData.from = from;
		this.emiData.to = to;
		this.emiData.search = this.searchValue;
		this.dataSource.loadEmiDetails(this.emiData);
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

	viewOrder(order) {
		const dialogRef = this.dialog.open(EmiDetailsViewComponent, {
			data: { order: order, action: "view" },
			width: "500px",
		});
		dialogRef.afterClosed().subscribe((res) => {
			if (res) {
				console.log(res);
			}
		});
	}

	printCancellationReceipt(emi) {
		this.emiDetailsService.emiReceipt(emi.id).subscribe();
	}

	downloadReport() {
		this.emiDetailsService.reportExport().subscribe();
		this.emiDetailsService.exportExcel.next(false);
	}

	applyFilter(data) {
		console.log(data);
		this.emiData.orderemistatus = data.filterData.multiSelect1;
		this.dataSource.loadEmiDetails(this.emiData);
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
		this.emiDetailsService.applyFilter.next({});
		this.sharedService.closeFilter.next(true);
	}
}
