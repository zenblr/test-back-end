import { Component, OnInit, ViewChild, ElementRef } from "@angular/core";
import {
	LayoutUtilsService,
	QueryParamsModel,
} from "../../../../../../../core/_base/crud";
import {
	MatSnackBar,
	MatDialog,
	MatPaginator,
	MatSort,
} from "@angular/material";
import {
	OrderDetailsDatasource,
	OrderDetailsService,
	OrderDetailsModel,
} from "../../../../../../../core/emi-management/order-management";
import { Subscription, merge, fromEvent, Subject } from "rxjs";
import {
	tap,
	debounceTime,
	distinctUntilChanged,
	skip,
	takeUntil,
} from "rxjs/operators";
import { SelectionModel } from "@angular/cdk/collections";
import { ToastrComponent } from "../../../../../../partials/components/toastr/toastr.component";
import { DataTableService } from "../../../../../../../core/shared/services/data-table.service";
import { OrderDetailsViewComponent } from "../order-details-view/order-details-view.component";
import { Router } from "@angular/router";
import { SharedService } from "../../../../../../../core/shared/services/shared.service";

@Component({
	selector: "kt-order-details-list",
	templateUrl: "./order-details-list.component.html",
	styleUrls: ["./order-details-list.component.scss"],
})
export class OrderDetailsListComponent implements OnInit {
	// Table fields
	dataSource: OrderDetailsDatasource;
	@ViewChild(ToastrComponent, { static: true }) toastr: ToastrComponent;
	displayedColumns = [
		"select",
		"storeId",
		"brokerInfo",
		"centerCity",
		"shippingAddress",
		"memberId",
		"customerName",
		"mobileNumber",
		"orderId",
		"productName",
		"weight",
		"orderTotalAmount",
		"orderInitialAmount",
		"orderDate",
		"emiTenure",
		"orderQty",
		"invoiceNo",
		"invoiceDate",
		"orderStatus",
		"trackingId",
		"cancelOrder",
		"merchant",
		"action",
	];
	selection = new SelectionModel<OrderDetailsModel>(true, []);
	@ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
	@ViewChild("sort1", { static: true }) sort: MatSort;
	// Filter fields
	@ViewChild("searchInput", { static: true }) searchInput: ElementRef;
	orderDetailsResult: OrderDetailsModel[] = [];
	// Subscriptions
	private subscriptions: Subscription[] = [];
	private destroy$ = new Subject();
	private unsubscribeSearch$ = new Subject();
	searchValue = "";
	orderData = {
		from: 1,
		to: 25,
		search: "",
		weight: 0,
		paymentType: 0,
		orderCurrentStatus: 0,
	};
	filteredDataList = {};

	constructor(
		public dialog: MatDialog,
		public snackBar: MatSnackBar,
		private layoutUtilsService: LayoutUtilsService,
		private orderDetailsService: OrderDetailsService,
		private dataTableService: DataTableService,
		private router: Router,
		private sharedService: SharedService
	) {
		this.orderDetailsService.exportExcel$
			.pipe(takeUntil(this.destroy$))
			.subscribe((res) => {
				if (res) {
					this.downloadReport();
				}
			});

		this.orderDetailsService.applyFilter$
			.pipe(takeUntil(this.destroy$))
			.subscribe((res) => {
				if (Object.entries(res).length) {
					this.applyFilter(res);
				}
			});

		this.orderDetailsService.dropdownValue$
			.pipe(takeUntil(this.destroy$))
			.subscribe((res) => {
				if (Object.entries(res).length) {
					this.selectedDropdown(res);
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
					this.loadOrderDetailsPage();
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
				this.loadOrderDetailsPage();
			});

		// Init DataSource
		this.dataSource = new OrderDetailsDatasource(this.orderDetailsService);
		const entitiesSubscription = this.dataSource.entitySubject
			.pipe(skip(1), distinctUntilChanged())
			.subscribe((res) => {
				this.orderDetailsResult = res;
			});
		this.subscriptions.push(entitiesSubscription);
		this.dataSource.loadOrderDetails(this.orderData);
	}

	/**
	 * Check all rows are selected
	 */
	isAllSelected(): boolean {
		const numSelected = this.selection.selected.length;
		const numRows = this.orderDetailsResult.length;
		return numSelected === numRows;
		console.log("isallselected");
	}

	/**
	 * Toggle all selections
	 */
	masterToggle() {
		if (this.selection.selected.length === this.orderDetailsResult.length) {
			this.selection.clear();
		} else {
			this.orderDetailsResult.forEach((row) =>
				this.selection.select(row)
			);
		}
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
		this.orderData.search = this.searchValue;
		this.dataSource.loadOrderDetails(this.orderData);
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
		const dialogRef = this.dialog.open(OrderDetailsViewComponent, {
			data: { orderId: order.id, action: "view" },
			width: "80vw",
		});
		dialogRef.afterClosed().subscribe((res) => {
			if (res) {
				// console.log(res);
			}
		});
	}

	editOrder(order) {
		this.router.navigate([
			"/admin/emi-management/order-details/edit-order-details/",
			order.id,
		]);
	}

	cancelOrder(order) {
		this.router.navigate([
			"/admin/emi-management/order-details/cancel-order/",
			order.id,
		]);
	}

	downloadReport() {
		this.orderDetailsService.reportExport(this.orderData).subscribe();
		this.orderDetailsService.exportExcel.next(false);
	}

	selectedDropdown(value) {
		if (this.selection.selected.length) {
			let selectedIds = [];
			for (let i = 0; i < this.selection.selected.length; i++) {
				selectedIds.push(this.selection.selected[i].id);
			}

			let params = {
				orderId: selectedIds,
			};

			if (value == "label") {
				this.orderDetailsService.getLabel(params).subscribe();
			} else if (value == "mainfest") {
				this.orderDetailsService.getMainfest(params).subscribe();
			} else if (value == "deliMainfest") {
				this.orderDetailsService.getDeliMainfest(params).subscribe();
			} else if (value == "uninsuredMainfest") {
				this.orderDetailsService
					.getUninsuredMainfest(params)
					.subscribe();
			} else {
				this.toastr.errorToastr("Something went Wrong");
			}
		} else {
			this.toastr.errorToastr("Select atleast 1 Order");
		}
	}

	applyFilter(data) {
		this.orderData.paymentType = data.data.paymentType;
		this.orderData.orderCurrentStatus = data.data.status;
		this.orderData.weight = data.data.weight;
		this.dataSource.loadOrderDetails(this.orderData);
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
		this.orderDetailsService.applyFilter.next({});
		this.orderDetailsService.dropdownValue.next({});
		this.sharedService.closeFilter.next(true);
	}
}
