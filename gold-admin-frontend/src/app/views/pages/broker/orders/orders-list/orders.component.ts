import { Component, OnInit, ViewChild, ElementRef } from "@angular/core";
import {
  MatPaginator,
  MatDialog,
  MatSnackBar,
  MatSort,
} from "@angular/material";
import { Subscription, Subject, merge } from "rxjs";
import { LayoutUtilsService } from "../../../../../core/_base/crud";
import { DataTableService } from "../../../../../core/shared/services/data-table.service";
import {
  OrdersDatasource,
  OrdersModel,
  OrdersService
} from "../../../../../core/broker";
import { skip, distinctUntilChanged, tap, takeUntil } from "rxjs/operators";
import { SharedService } from "../../../../../core/shared/services/shared.service";
import { OrderDetailsService } from "../../../../../core/emi-management/order-management/order-details/services/order-details.service";
import { CancelOrderDetailsService } from "../../../../../core/emi-management/order-management";
import { Router } from "@angular/router";

@Component({
  selector: 'kt-orders',
  templateUrl: './orders.component.html',
  styleUrls: ['./orders.component.scss']
})
export class OrdersComponent implements OnInit {
  dataSource: OrdersDatasource;
  displayedColumns = [
    "storeId",
    "customerName",
    "userId",
    "mobileNumber",
    "orderId",
    "emiDate",
    "emiAmount",
    "emiPaidDate",
    "quantity",
    "emiStart",
    "emiEnd",
    "status",
    "performa",
    "contract",
    "cancelReceipt",
    "orderPayment",
    "cancelOrder"
  ];
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild("sort1", { static: true }) sort: MatSort;
  // Filter fields
  @ViewChild("searchInput", { static: true }) searchInput: ElementRef;
  ordersResult: OrdersModel[] = [];
  // Subscriptions
  private subscriptions: Subscription[] = [];
  private destroy$ = new Subject();
  private unsubscribeSearch$ = new Subject();
  searchValue = "";
  ordersData = {
    from: 1,
    to: 25,
    search: "",
    paymentType: 0,
    orderCurrentStatus: 0,
  };

  filteredDataList = {};

  constructor(
    public dialog: MatDialog,
    public snackBar: MatSnackBar,
    private layoutUtilsService: LayoutUtilsService,
    private ordersService: OrdersService,
    private dataTableService: DataTableService,
    private sharedService: SharedService,
    private orderDetailsService: OrderDetailsService,
    private cancelOrderDetailsService: CancelOrderDetailsService,
    private router: Router,
  ) {
    this.ordersService.applyFilter$
      .pipe(takeUntil(this.destroy$))
      .subscribe((res) => {
        if (Object.entries(res).length) {
          this.applyFilter(res);
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
          this.loadOrdersDetailsPage();
        })
      )
      .subscribe();
    this.subscriptions.push(paginatorSubscriptions);

    const searchSubscription = this.dataTableService.searchInput$
      .pipe(takeUntil(this.unsubscribeSearch$))
      .subscribe((res) => {
        this.searchValue = res;
        this.paginator.pageIndex = 0;
        this.loadOrdersDetailsPage();
      });

    // Init DataSource
    this.dataSource = new OrdersDatasource(this.ordersService);
    const entitiesSubscription = this.dataSource.entitySubject
      .pipe(skip(1), distinctUntilChanged())
      .subscribe((res) => {
        this.ordersResult = res;
      });
    this.subscriptions.push(entitiesSubscription);
    this.dataSource.loadOrdersDetails(this.ordersData);
  }

  loadOrdersDetailsPage() {
    if (
      this.paginator.pageIndex < 0 ||
      this.paginator.pageIndex >
      this.paginator.length / this.paginator.pageSize
    )
      return;
    let from = this.paginator.pageIndex * this.paginator.pageSize + 1;
    let to = (this.paginator.pageIndex + 1) * this.paginator.pageSize;
    this.ordersData.from = from;
    this.ordersData.to = to;
    this.ordersData.search = this.searchValue;
    this.dataSource.loadOrdersDetails(this.ordersData);
  }

  performa(element) {
    this.orderDetailsService.getProforma(element.id).subscribe();
  }

  contract(element) {
    this.orderDetailsService.getContract(element.id).subscribe();
  }

  cancelReceipt(element) {
    this.cancelOrderDetailsService.getReceipt(element.id).subscribe();
  }

  viewOrPay(element) {
    this.router.navigate(["/broker/orders/view-pay/", element.id]);
  }

  cancelOrder(element) {
    this.router.navigate(["/broker/orders/cancel-order/", element.id]);
  }

  applyFilter(data) {
    this.ordersData.paymentType = data.data.paymentType;
    this.ordersData.orderCurrentStatus = data.data.status;
    this.dataSource.loadOrdersDetails(this.ordersData);
    this.filteredDataList = data.list;
  }

  ngOnDestroy() {
    this.subscriptions.forEach(el => el.unsubscribe());
    this.destroy$.next();
    this.destroy$.complete();
    this.unsubscribeSearch$.next();
    this.unsubscribeSearch$.complete();
    this.ordersService.applyFilter.next({});
    this.sharedService.closeFilter.next(true);
  }
}
