import { Component, OnInit, ViewChild } from '@angular/core';
import { DataTableService } from '../../../../../core/shared/services/data-table.service';
import { MatPaginator, MatDialog } from '@angular/material';
import { Subject, Subscription, merge } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { LayoutUtilsService } from '../../../../../core/_base/crud';
import { map, tap } from 'rxjs/operators';
import { takeUntil, skip, distinctUntilChanged } from 'rxjs/operators';
import { DepositDatasource } from '../../../../../core/funds-approvals/deposit/datasources/deposit.datasource';
import { DepositService } from '../../../../../core/funds-approvals/deposit/services/deposit.service';
import { PaymentDialogComponent } from '../../../../partials/components/payment-dialog/payment-dialog.component';
import { QuickPayService } from '../../../../../core/repayment/quick-pay/quick-pay.service';
import { PartPaymentService } from '../../../../../core/repayment/part-payment/services/part-payment.service';


@Component({
  selector: 'kt-deposit-list',
  templateUrl: './deposit-list.component.html',
  styleUrls: ['./deposit-list.component.scss']
})
export class DepositListComponent implements OnInit {

  dataSource: DepositDatasource;
  displayedColumns = ['transactionId', 'bankTransactionId', 'customerId', 'fullName', 'loanId', 'modeOfPayment', 'paymentFor', 'depositDate', 'depositBankName', 'depositBranchName', 'depositAmount', 'depositStatus', 'update'];
  result = []
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  unsubscribeSearch$ = new Subject();
  destroy$ = new Subject();
  searchValue = '';
  private filter$ = new Subject();
  private subscriptions: Subscription[] = [];
  queryParamsData = {
    from: 1,
    to: 25,
    search: '',
    depositStatus: ''
  }


  constructor(
    private dataTableService: DataTableService,
    private depositService: DepositService,
    public dialog: MatDialog,
    private toastr: ToastrService,
    private layoutUtilsService: LayoutUtilsService,
    private quickPayService: QuickPayService,
    private partPaymentService: PartPaymentService
  ) {

    this.depositService.applyFilter$
      .pipe(takeUntil(this.filter$))
      .subscribe((res) => {
        if (Object.entries(res).length) {
          this.applyFilter(res);
        }
      });
  }

  ngOnInit() {
    const paginatorSubscriptions = merge(this.paginator.page).pipe(
      tap(() => this.loadPage())
    ).subscribe();
    this.subscriptions.push(paginatorSubscriptions);


    const searchSubscription = this.dataTableService.searchInput$.pipe(takeUntil(this.unsubscribeSearch$))
      .subscribe(res => {
        this.searchValue = res;
        this.queryParamsData.search = res;
        this.paginator.pageIndex = 0;
        this.loadPage();
      });

    this.dataSource = new DepositDatasource(this.depositService);
    const entitiesSubscription = this.dataSource.entitySubject.pipe(
      skip(1),
      distinctUntilChanged()
    ).subscribe(res => {
      // console.log(res)
      this.result = res;

    });
    this.subscriptions.push(entitiesSubscription);

    this.dataSource.getDepositList(this.queryParamsData);
  }

  ngOnDestroy() {
    this.subscriptions.forEach(el => el.unsubscribe());
    this.unsubscribeSearch$.next();
    this.unsubscribeSearch$.complete();
    this.destroy$.next();
    this.destroy$.complete();
    this.filter$.next();
    this.filter$.complete();
    this.depositService.applyFilter.next({});
  }


  loadPage() {
    if (this.paginator.pageIndex < 0 || this.paginator.pageIndex > (this.paginator.length / this.paginator.pageSize))
      return;
    this.queryParamsData.from = ((this.paginator.pageIndex * this.paginator.pageSize) + 1);
    this.queryParamsData.to = ((this.paginator.pageIndex + 1) * this.paginator.pageSize);

    this.dataSource.getDepositList(this.queryParamsData);
  }

  applyFilter(data) {
    // console.log(data);
    this.queryParamsData.depositStatus = data.data.scheme;
    this.dataSource.getDepositList(this.queryParamsData);
  }

  toaster(depositStatus) {
    if (depositStatus == 'Completed') {
      this.toastr.success('Payment Confirm')
    } else {
      this.toastr.error('Payment Rejected')
    }
  }
  updateStatus(deposit) {

    const dialogRef = this.dialog.open(PaymentDialogComponent, {
      data: { value: deposit, name: 'deposit' },
      width: '500px'
    });
    dialogRef.afterClosed().subscribe(res => {
      if (res) {
        if (res.depositStatus == 'Pending') {
          return
        }
        let data = {
          transactionId: deposit.id,
          status: res.depositStatus,
          paymentReceivedDate: res.paymentReceivedDate,
          masterLoanId: deposit.masterLoanId,
          depositAmount: deposit.transactionAmont
        }
        
        if (deposit.paymentFor == "partPayment") {
          this.partPaymentService.finalPaymentConfirm(data).subscribe(result => {
            this.toaster(res.depositStatus)
            this.loadPage();
          })
        } else {

          this.quickPayService.confirmPayment(data).subscribe(result => {
            this.toaster(res.depositStatus)
            this.loadPage();
          })
        }
      }
    });
  }

}
