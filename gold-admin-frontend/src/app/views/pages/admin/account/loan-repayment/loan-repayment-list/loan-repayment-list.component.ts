import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator, MatDialog } from '@angular/material';
import { Subject, Subscription, merge } from 'rxjs';
import { DataTableService } from '../../../../../../core/shared/services/data-table.service';
import { LoanRepaymentService } from '../../../../../../core/account/loan-repayment/services/loan-repayment.service';
import { ToastrService } from 'ngx-toastr';
import { LayoutUtilsService } from '../../../../../../core/_base/crud';
import { map, takeUntil, tap, skip, distinctUntilChanged } from 'rxjs/operators';
import { LoanRepaymentDatasource } from '../../../../../../core/account/loan-repayment/datasources/loan-repayment.datasource';
import { LoanRepaymentAddComponent } from '../loan-repayment-add/loan-repayment-add.component';

@Component({
  selector: 'kt-loan-repayment-list',
  templateUrl: './loan-repayment-list.component.html',
  styleUrls: ['./loan-repayment-list.component.scss']
})
export class LoanRepaymentListComponent implements OnInit {

  dataSource;
  displayedColumns = ['accountNumber', 'ifsc', 'loanId', 'loanAmount', 'paymentMode', 'paymentDate', 'paymentAmount', 'totalBalance'];
  result = []
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  unsubscribeSearch$ = new Subject();
  destroy$ = new Subject();
  searchValue = '';
  private subscriptions: Subscription[] = [];

  constructor(
    private dataTableService: DataTableService,
    private loanRepaymentService: LoanRepaymentService,
    public dialog: MatDialog,
    private toastr: ToastrService,
    private layoutUtilsService: LayoutUtilsService,
  ) {
    this.loanRepaymentService.openModal$.pipe(
      map(res => {
        if (res) {
          this.addReason();
        }
      }),
      takeUntil(this.destroy$)).subscribe();
  }

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

    this.dataSource = new LoanRepaymentDatasource(this.loanRepaymentService);
    const entitiesSubscription = this.dataSource.entitySubject.pipe(
      skip(1),
      distinctUntilChanged()
    ).subscribe(res => {
      this.result = res;
    });
    this.subscriptions.push(entitiesSubscription);

    // this.dataSource.getDisbursement(1, 25, this.searchValue);
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

    this.dataSource.getDisbursement(from, to, this.searchValue);
  }

  addReason() {
    const dialogRef = this.dialog.open(LoanRepaymentAddComponent, {
      data: { action: 'add' },
      width: '500px',
    });
    dialogRef.afterClosed().subscribe(res => {
      if (res) {
        this.loadPage();
      }
      this.loanRepaymentService.openModal.next(false);
    });
  }
}
