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
import { 
WithdrawalRequestsDatasource
 } from '../../../../../../../core/wallet/withdrawal-requests/withdrawal-requests.datasource'
 import { 
  WithdrawalRequestsService
   } from '../../../../../../../core/wallet/withdrawal-requests/withdrawal-requests.service'

@Component({
  selector: 'kt-withdrawal-requests',
  templateUrl: './withdrawal-requests.component.html',
  styleUrls: ['./withdrawal-requests.component.scss']
})
export class WithdrawalRequestsComponent implements OnInit {

  dataSource: WithdrawalRequestsDatasource;
  @ViewChild(ToastrComponent, { static: true }) toastr: ToastrComponent;
  displayedColumns = [
    "customerId",
    "customerFullName",
    "mobileNumber",
    "withdrawalTransactionID",
    "withdrawalInitiatedDate",
    "withdrawalAmount",
    "bankName",
    "branchName",
    "accountNumber",
    "accountHolderName",
    "ifscCode",
    "withdrawalPaymentDate",
    "bankTransactionID",
    "depositmodeofpayment",
    "withdrawalStatus",
    "action",
  ];
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild("sort1", { static: true }) sort: MatSort;
  // // Filter fields
  @ViewChild("searchInput", { static: true }) searchInput: ElementRef;
  withdrawalRequestsResult= [];
  // Subscriptions
  private subscriptions: Subscription[] = [];
  private destroy$ = new Subject();
  private unsubscribeSearch$ = new Subject();
  searchValue = "";
  withdrawRequestsData = {
    from: 1,
    to: 25,
    search: "",
    // paymentRecievedDate: "",
    // paymentType: "",
    // orderCurrentStatus: "",
    paymentFor: "withdraw"
  };
  filteredDataList = {};

  constructor(
    public dialog: MatDialog,
    public snackBar: MatSnackBar,
    private layoutUtilsService: LayoutUtilsService,
    private  withdrawalRequestsService:  WithdrawalRequestsService,
    private dataTableService: DataTableService,
    private sharedService: SharedService,
    private router: Router,
  ) {
    // this.withdrawalRequestsService.exportExcel$
    //   .pipe(takeUntil(this.destroy$))
    //   .subscribe((res) => {
    //     if (res) {
    //       this.downloadReport();
    //     }
    //   });

    this.withdrawalRequestsService.applyFilter$
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
    this.dataSource = new WithdrawalRequestsDatasource(
      this.withdrawalRequestsService
    );
    const entitiesSubscription = this.dataSource.entitySubject
      .pipe(skip(1), distinctUntilChanged())
      .subscribe((res) => {
        this.withdrawalRequestsResult = res;
      });
    this.subscriptions.push(entitiesSubscription);
    this.dataSource.loadWithdrawalRequests(this.withdrawRequestsData);
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
    this.withdrawRequestsData.from = from;
    this.withdrawRequestsData.to = to;
    this.withdrawRequestsData.search = this.searchValue;
    this.dataSource.loadWithdrawalRequests(this.withdrawRequestsData);
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
  //   this.depositDetailsService.reportExport(this.withdrawRequestsData).subscribe();
  //   this.depositDetailsService.exportExcel.next(false);
  // }

  applyFilter(data) {
    // this.withdrawRequestsData.paymentType = data.data.paymentType;
    // this.withdrawRequestsData.paymentRecievedDate = data.data.startDate;
    // this.withdrawRequestsData.orderCurrentStatus = data.data.status;
    this.dataSource.loadWithdrawalRequests(this.withdrawRequestsData);
    this.filteredDataList = data.list;
  }

  editWithdrawal(id) {
		this.router.navigate(['admin/digi-gold/wallet/withdrawal-requests/', id]);
	}

  // updateStatus(details) {
  //   const dialogRef = this.dialog.open(DepositDetailsEditComponent, {
  //     data: {
  //       depositDetailsData: details
  //     },
  //     width: '60vw'
  //   })
  //   dialogRef.afterClosed().subscribe(res => {
  //     if (res) {
  //       this.toastr.successToastr('Transaction Status Updated Successfully');
  //       this.loadDepositDetailsPage();
  //     }
  //   })
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
    this.withdrawalRequestsService.applyFilter.next({});
    this.sharedService.closeFilter.next(true);
  }


}
