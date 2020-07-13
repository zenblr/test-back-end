import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator, MatDialog } from '@angular/material';
import { DataTableService } from '../../../../../core/shared/services/data-table.service';
import { Router } from '@angular/router';
import { merge, Subject, Subscription } from 'rxjs';
import { tap, skip, distinctUntilChanged, takeUntil } from 'rxjs/operators';
import { LoanTransferService } from '../../../../../core/loan-management/loan-transfer/services/loan-transfer.service';
import { LoanTranferDatasource } from '../../../../../core/loan-management/loan-transfer/datasources/loan-transfer.datasource';

@Component({
  selector: 'kt-loan-transfer-list',
  templateUrl: './loan-transfer-list.component.html',
  styleUrls: ['./loan-transfer-list.component.scss']
})
export class LoanTransferListComponent implements OnInit {

  dataSource: LoanTranferDatasource;
  displayedColumns = ['fullName', 'customerID', 'loanId', 'mobile', 'date', 'amount', 'status'];
  leadsResult = []
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  destroy$ = new Subject();
  private subscriptions: Subscription[] = [];
  private unsubscribeSearch$ = new Subject();
  searchValue = '';

  constructor(
    public dialog: MatDialog,
    private loanTransferService: LoanTransferService,
    private dataTableService: DataTableService,
    private router: Router,
    // private sharedService: SharedService
  ) { }

  ngOnInit() {
    const paginatorSubscriptions = merge(this.paginator.page).pipe(
      tap(() => {
        this.loadPage();
      })
    )
      .subscribe();
    this.subscriptions.push(paginatorSubscriptions);

    const searchSubscription = this.dataTableService.searchInput$.pipe(takeUntil(this.unsubscribeSearch$))
      .subscribe(res => {
        this.searchValue = res;
        this.paginator.pageIndex = 0;
        this.loadPage();
      });

    // Init DataSource
    this.dataSource = new LoanTranferDatasource(this.loanTransferService);
    const entitiesSubscription = this.dataSource.entitySubject.pipe(
      skip(1),
      distinctUntilChanged()
    ).subscribe(res => {
      this.leadsResult = res;
    });
    this.subscriptions.push(entitiesSubscription);

    this.dataSource.loadLoanTransferList(1, 25, this.searchValue);
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

    this.dataSource.loadLoanTransferList(from, to, this.searchValue);
  }

  navigate(loan) {
    this.router.navigate(['/admin/loan-management/loan-transfer/', loan.customerLoan[0].id])
  }

}
