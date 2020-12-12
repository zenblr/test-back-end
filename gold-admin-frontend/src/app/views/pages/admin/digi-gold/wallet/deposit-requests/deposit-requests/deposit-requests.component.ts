import { Component, OnInit, ViewChild, ElementRef } from "@angular/core";
import {
	LayoutUtilsService,
	QueryParamsModel,
} from "../../../../../../../core/_base/crud";
import { Router } from "@angular/router";
import {
	MatSnackBar,
	MatDialog,
	MatPaginator,
	MatSort,
} from "@angular/material";
import { DepositRequestsDatasource } from '../../../../../../../core/wallet/deposit-requests/deposit-requests.datasource';
import { DepositRequestsService } from '../../../../../../../core/wallet/deposit-requests/deposit-requests.service';

import { Subscription, merge, fromEvent, Subject, from } from "rxjs";
import {
	tap,
	debounceTime,
	distinctUntilChanged,
	skip,
	takeUntil,
} from "rxjs/operators";
import { ToastrComponent } from "../../../../../../partials/components/toastr/toastr.component";
import { DataTableService } from "../../../../../../../core/shared/services/data-table.service";
import { SharedService } from "../../../../../../../core/shared/services/shared.service";
// import { DepositDetailsEditComponent } from '../deposit-details-edit/deposit-details-edit.component';


@Component({
  selector: 'kt-deposit-requests',
  templateUrl: './deposit-requests.component.html',
  styleUrls: ['./deposit-requests.component.scss']
})
export class DepositRequestsComponent implements OnInit {

  dataSource: DepositRequestsDatasource;
	@ViewChild(ToastrComponent, { static: true }) toastr: ToastrComponent;
	displayedColumns = [
		"transactionID",
		"bankTransactionID",
		"customerID",
		"depositDate",
		"fullName",
		"mobileNumber",
		"depositmodeofpayment",
		"depositBankName",
		"depositBranchName",
		"depositAmount",
		"depositStatus",
		"action",
	];
	@ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
	@ViewChild("sort1", { static: true }) sort: MatSort;
	// Filter fields
	@ViewChild("searchInput", { static: true }) searchInput: ElementRef;
	depositDetailsResult = [];
	// Subscriptions
	private subscriptions: Subscription[] = [];
	private destroy$ = new Subject();
	private unsubscribeSearch$ = new Subject();
	searchValue = "";
	depositData = {
		from: 1,
		to: 25,
		search: "",
		// paymentRecievedDate: "",
		// paymentType: "",
		// orderCurrentStatus: "",
		paymentFor: "deposit"
	};
	filteredDataList = {};

	constructor(
		public dialog: MatDialog,
		public snackBar: MatSnackBar,
		private layoutUtilsService: LayoutUtilsService,
		private depositRequestsService: DepositRequestsService,
		private dataTableService: DataTableService,
		private sharedService: SharedService,
		private router: Router,
	) {


		this.depositRequestsService.applyFilter$
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
					this.loadDepositDetailsPage();
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
		//     this.loadDepositDetailsPage();
		//   })
		// )
		//   .subscribe();
		// this.subscriptions.push(searchSubscription);

		const searchSubscription = this.dataTableService.searchInput$
			.pipe(takeUntil(this.unsubscribeSearch$))
			.subscribe((res) => {
				this.searchValue = res;
				this.paginator.pageIndex = 0;
				this.loadDepositDetailsPage();
			});

		// Init DataSource
		this.dataSource = new DepositRequestsDatasource(
			this.depositRequestsService
		);
		const entitiesSubscription = this.dataSource.entitySubject
			.pipe(skip(1), distinctUntilChanged())
			.subscribe((res) => {
				this.depositDetailsResult = res;
			});
		this.subscriptions.push(entitiesSubscription);
		this.dataSource.loadDepositRequests(this.depositData);
	}

	loadDepositDetailsPage() {
		if (
			this.paginator.pageIndex < 0 ||
			this.paginator.pageIndex >
			this.paginator.length / this.paginator.pageSize
		)
			return;
		let from = this.paginator.pageIndex * this.paginator.pageSize + 1;
		let to = (this.paginator.pageIndex + 1) * this.paginator.pageSize;
		this.depositData.from = from;
		this.depositData.to = to;
		this.depositData.search = this.searchValue;
		this.dataSource.loadDepositRequests(this.depositData);
	}

	editDeposit(id) {
		this.router.navigate(['admin/digi-gold/wallet/deposit-requests/', id]);
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

	// downloadReport() {
	// 	this.depositDetailsService.reportExport(this.depositData).subscribe();
	// 	this.depositDetailsService.exportExcel.next(false);
	// }

	applyFilter(data) {
		// this.depositData.paymentType = data.data.paymentType;
		// this.depositData.paymentRecievedDate = data.data.startDate;
		// this.depositData.orderCurrentStatus = data.data.status;
		// this.dataSource.loadDepositRequests(this.depositData);
		this.filteredDataList = data.list;
	}

	// updateStatus(details) {
	// 	const dialogRef = this.dialog.open(DepositDetailsEditComponent, {
	// 		data: {
	// 			depositDetailsData: details
	// 		},
	// 		width: '60vw'
	// 	})
	// 	dialogRef.afterClosed().subscribe(res => {
	// 		if (res) {
	// 			this.toastr.successToastr('Transaction Status Updated Successfully');
	// 			this.loadDepositDetailsPage();
	// 		}
	// 	})
	// }

	/**
	 * On Destroy
	 */
	ngOnDestroy() {
		this.subscriptions.forEach((el) => el.unsubscribe());
		this.destroy$.next();
		this.destroy$.complete();
		this.unsubscribeSearch$.next();
		this.unsubscribeSearch$.complete();
		this.depositRequestsService.applyFilter.next({});
		this.sharedService.closeFilter.next(true);
	}


}
