import { Component, OnInit, ViewChild, ElementRef } from "@angular/core";
import {
	LayoutUtilsService,
	QueryParamsModel,
} from "../../../../../../core/_base/crud";
import {
	MatSnackBar,
	MatDialog,
	MatPaginator,
	MatSort,
} from "@angular/material";
import {
	CancelOrderDetailsDatasource,
	CancelOrderDetailsService,
	CancelOrderDetailsModel,
} from "../../../../../../core/emi-management/order-management";
import { Subscription, merge, fromEvent, Subject } from "rxjs";
import {
	tap,
	debounceTime,
	distinctUntilChanged,
	skip,
	takeUntil,
} from "rxjs/operators";
import { ToastrComponent } from "../../../../../../views/partials/components/toastr/toastr.component";
import { DataTableService } from "../../../../../../core/shared/services/data-table.service";
import { SharedService } from "../../../../../../core/shared/services/shared.service";

@Component({
	selector: "kt-cancel-order-details-list",
	templateUrl: "./cancel-order-details-list.component.html",
	styleUrls: ["./cancel-order-details-list.component.scss"],
})
export class CancelOrderDetailsListComponent implements OnInit {
	// Table fields
	dataSource: CancelOrderDetailsDatasource;
	@ViewChild(ToastrComponent, { static: true }) toastr: ToastrComponent;
	displayedColumns = [
		"storeId",
		"userId",
		"mobileNumber",
		"orderId",
		"overdueDate",
		"totalPrice",
		"cancellationCharges",
		"differenceAmount",
		"emiAmount",
		"tenure",
		"lastEmiNumber",
		"cancellationDate",
		"cancelOrderFrom",
		"action",
	];
	@ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
	@ViewChild("sort1", { static: true }) sort: MatSort;
	// Filter fields
	@ViewChild("searchInput", { static: true }) searchInput: ElementRef;
	cancelOrderDetailsResult: CancelOrderDetailsModel[] = [];
	// Subscriptions
	private subscriptions: Subscription[] = [];
	private destroy$ = new Subject();
	private unsubscribeSearch$ = new Subject();
	searchValue = "";
	cancelData = {
		from: 1,
		to: 25,
		search: "",
		cancelDate: "",
		merchantName: "",
	};
	filteredDataList = {};

	constructor(
		public dialog: MatDialog,
		public snackBar: MatSnackBar,
		private layoutUtilsService: LayoutUtilsService,
		private cancelOrderDetailsService: CancelOrderDetailsService,
		private dataTableService: DataTableService,
		private sharedService: SharedService
	) {
		this.cancelOrderDetailsService.exportExcel$
			.pipe(takeUntil(this.destroy$))
			.subscribe((res) => {
				if (res) {
					this.downloadReport();
				}
			});

		this.cancelOrderDetailsService.applyFilter$
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
					this.loadCancelOrderDetailsPage();
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
		//     this.loadCancelOrderDetailsPage();
		//   })
		// )
		//   .subscribe();
		// this.subscriptions.push(searchSubscription);

		const searchSubscription = this.dataTableService.searchInput$
			.pipe(takeUntil(this.unsubscribeSearch$))
			.subscribe((res) => {
				this.searchValue = res;
				this.paginator.pageIndex = 0;
				this.loadCancelOrderDetailsPage();
			});

		// Init DataSource
		this.dataSource = new CancelOrderDetailsDatasource(
			this.cancelOrderDetailsService
		);
		const entitiesSubscription = this.dataSource.entitySubject
			.pipe(skip(1), distinctUntilChanged())
			.subscribe((res) => {
				this.cancelOrderDetailsResult = res;
			});
		this.subscriptions.push(entitiesSubscription);
		this.dataSource.loadCancelOrderDetails(this.cancelData);
	}

	loadCancelOrderDetailsPage() {
		if (
			this.paginator.pageIndex < 0 ||
			this.paginator.pageIndex >
				this.paginator.length / this.paginator.pageSize
		)
			return;
		let from = this.paginator.pageIndex * this.paginator.pageSize + 1;
		let to = (this.paginator.pageIndex + 1) * this.paginator.pageSize;
		this.cancelData.from = from;
		this.cancelData.to = to;
		this.cancelData.search = this.searchValue;
		this.dataSource.loadCancelOrderDetails(this.cancelData);
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

	printCancellationReceipt(order) {
		this.cancelOrderDetailsService.getReceipt(order.id).subscribe();
	}

	downloadReport() {
		this.cancelOrderDetailsService.reportExport().subscribe();
		this.cancelOrderDetailsService.exportExcel.next(false);
	}

	applyFilter(data) {
		console.log(data);
		this.cancelData.merchantName = data.data.merchant;
		if (data.data.startDate) {
			let d = new Date(data.data.startDate);
			let n = d.toISOString();
			this.cancelData.cancelDate = n;
		} else {
			this.cancelData.cancelDate = "";
		}
		this.dataSource.loadCancelOrderDetails(this.cancelData);
		this.filteredDataList = data.list;
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
		this.cancelOrderDetailsService.applyFilter.next({});
		this.sharedService.closeFilter.next(true);
	}
}
