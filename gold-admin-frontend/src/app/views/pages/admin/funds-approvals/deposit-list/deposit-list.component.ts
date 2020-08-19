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
import { UpdateStatusComponent } from '../update-status/update-status.component';

@Component({
  selector: 'kt-deposit-list',
  templateUrl: './deposit-list.component.html',
  styleUrls: ['./deposit-list.component.scss']
})
export class DepositListComponent implements OnInit {

  dataSource;
  displayedColumns = ['transactionId', 'bankTransactionId', 'customerId', 'loanId', 'depositDate', 'fullName', 'mobileNumber', 'modeOfPayment', 'depositBankName', 'depositBranchName', 'depositAmount', 'depositStatus', 'update'];
  result = []
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  unsubscribeSearch$ = new Subject();
  destroy$ = new Subject();
  searchValue = '';
  private subscriptions: Subscription[] = [];

  constructor(
    private dataTableService: DataTableService,
    private depositService: DepositService,
    public dialog: MatDialog,
    private toastr: ToastrService,
    private layoutUtilsService: LayoutUtilsService,
  ) { }

  ngOnInit() {
    const paginatorSubscriptions = merge(this.paginator.page).pipe(
      tap(() => this.loadPage())
    ).subscribe();
    this.subscriptions.push(paginatorSubscriptions);


    const searchSubscription = this.dataTableService.searchInput$.pipe(takeUntil(this.unsubscribeSearch$))
      .subscribe(res => {
        this.searchValue = res;
        this.paginator.pageIndex = 0;
        this.loadPage();
      });

    this.dataSource = new DepositDatasource(this.depositService);
    const entitiesSubscription = this.dataSource.entitySubject.pipe(
      skip(1),
      distinctUntilChanged()
    ).subscribe(res => {
      this.result = res;
    });
    this.subscriptions.push(entitiesSubscription);

    // this.dataSource.getDepositList(1, 25, this.searchValue);
  }

  ngOnDestroy() {
    this.subscriptions.forEach(el => el.unsubscribe());
    this.unsubscribeSearch$.next();
    this.unsubscribeSearch$.complete();
    this.destroy$.next();
    this.destroy$.complete();
  }


  loadPage() {
    if (this.paginator.pageIndex < 0 || this.paginator.pageIndex > (this.paginator.length / this.paginator.pageSize))
      return;
    let from = ((this.paginator.pageIndex * this.paginator.pageSize) + 1);
    let to = ((this.paginator.pageIndex + 1) * this.paginator.pageSize);

    this.dataSource.getDepositList(from, to, this.searchValue);
  }

  updateStatus(item) {
    const dialogRef = this.dialog.open(UpdateStatusComponent, { data: { action: 'edit', value: item }, width: 'auto' });
    dialogRef.afterClosed().subscribe(res => {
      if (res) {
        this.loadPage();
      }
    });
  }

}
