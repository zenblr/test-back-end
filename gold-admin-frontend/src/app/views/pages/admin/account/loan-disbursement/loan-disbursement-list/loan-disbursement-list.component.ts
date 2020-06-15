import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator, MatDialog } from '@angular/material';
import { merge, Subject, Subscription } from 'rxjs';
import { tap, takeUntil, skip, distinctUntilChanged, map } from 'rxjs/operators';
import { DataTableService } from '../../../../../../core/shared/services/data-table.service';
import { ToastrService } from 'ngx-toastr';
import { LayoutUtilsService } from '../../../../../../core/_base/crud';
import { LoanDisbursementAddComponent } from '../loan-disbursement-add/loan-disbursement-add.component';
import { LoanDisbursementService } from '../../../../../../core/account/loan-disbursement/services/loan-disbursement.service';
import { LoanDisbursementDatasource } from '../../../../../../core/account/loan-disbursement/datasources/loan-disbursement.datasource';

@Component({
  selector: 'kt-loan-disbursement-list',
  templateUrl: './loan-disbursement-list.component.html',
  styleUrls: ['./loan-disbursement-list.component.scss']
})
export class LoanDisbursementListComponent implements OnInit {

  dataSource;
  displayedColumns = ['partnerId', 'branchId', 'accountNumber', 'ifsc', 'transactionId', 'totalBalance', 'reduceAmount', 'remainingAmount', 'removeDate', 'removeBy', 'loanId', 'loanAmount'];
  result = []
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  unsubscribeSearch$ = new Subject();
  destroy$ = new Subject();
  searchValue = '';
  private subscriptions: Subscription[] = [];

  constructor(
    private dataTableService: DataTableService,
    private loanDisbursementService: LoanDisbursementService,
    public dialog: MatDialog,
    private toastr: ToastrService,
    private layoutUtilsService: LayoutUtilsService,
  ) {
    this.loanDisbursementService.openModal$.pipe(
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

    this.dataSource = new LoanDisbursementDatasource(this.loanDisbursementService);
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
    const dialogRef = this.dialog.open(LoanDisbursementAddComponent, {
      data: { action: 'add' },
      width: '500px',
    });
    dialogRef.afterClosed().subscribe(res => {
      if (res) {
        this.loadPage();
      }
      this.loanDisbursementService.openModal.next(false);
    });
  }

}
