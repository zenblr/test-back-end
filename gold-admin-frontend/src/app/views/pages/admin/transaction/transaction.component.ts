import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator, MatSort, MatDialog } from '@angular/material';
import { ToastrComponent } from '../../../partials/components/toastr/toastr.component';
import { Subscription, merge, Subject } from 'rxjs';
import { tap, distinctUntilChanged, skip, takeUntil, map } from 'rxjs/operators';
import { DataTableService } from '../../../../core/shared/services/data-table.service';
import { ActivatedRoute } from '@angular/router';
import { Router } from '@angular/router';
import { TransactionDatasource } from '../../../../core/transaction/datasources/transaction.datasources';
import { TransactionService } from '../../../../core/transaction/services/transaction.service';
import { SharedService } from '../../../../core/shared/services/shared.service';


@Component({
  selector: 'kt-transaction',
  templateUrl: './transaction.component.html',
  styleUrls: ['./transaction.component.scss']
})
export class TransactionComponent implements OnInit {
 customerId:any
  dataSource: TransactionDatasource;
  displayedColumns = ['custName', 'custId', 'mobileNumber', 'date', 'transactionId', 'narration', 'amount', 'updatedBalance'];
  transactionResult = []
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  queryParamsData = {
    from: 1,
    to: 25,
    search: '',
    scheme: '',
    customerId :'this.customerId'
  }
  @ViewChild(ToastrComponent, { static: true }) toastr: ToastrComponent;
  destroy$ = new Subject();
  filter$ = new Subject();

  // Subscriptions
  private subscriptions: Subscription[] = [];
  private unsubscribeSearch$ = new Subject();
  searchValue = '';
  filteredDataList = {};

  constructor(
    private route: ActivatedRoute,
    public dialog: MatDialog,
    private transactionService: TransactionService,
    private dataTableService: DataTableService,
    private router: Router,
    private sharedService: SharedService,
  ) {
    this.transactionService.applyFilter$
      .pipe(takeUntil(this.filter$))
      .subscribe((res) => {
        if (Object.entries(res).length) {
          this.applyFilter(res);
        }
      });
   }

  ngOnInit() {
    this.customerId= this.route.snapshot.params.id
    const paginatorSubscriptions = merge(this.paginator.page).pipe(
      tap(() => this.loadTransactionPage())
    ).subscribe();
    this.subscriptions.push(paginatorSubscriptions);


    const searchSubscription = this.dataTableService.searchInput$.pipe(takeUntil(this.unsubscribeSearch$))
      .subscribe(res => {
        this.queryParamsData.search = res;
        this.paginator.pageIndex = 0;
        this.loadTransactionPage();
      });

    // Init DataSource
    this.dataSource = new TransactionDatasource(this.transactionService);
    const entitiesSubscription = this.dataSource.entitySubject.pipe(
      skip(1),
      distinctUntilChanged()
    ).subscribe(res => {
      this.transactionResult = res;
    });
    this.subscriptions.push(entitiesSubscription);

    this.dataSource.loadTransactions(this.queryParamsData);
  }

  ngOnDestroy() {
    this.subscriptions.forEach(el => el.unsubscribe());
    this.unsubscribeSearch$.next();
    this.unsubscribeSearch$.complete();
    this.destroy$.next();
    this.destroy$.complete();
    this.filter$.next();
    this.filter$.complete();
    this.transactionService.applyFilter.next({});
    this.sharedService.closeFilter.next(true);
  }

  loadTransactionPage() {
    if (this.paginator.pageIndex < 0 || this.paginator.pageIndex > (this.paginator.length / this.paginator.pageSize))
      return;
    this.queryParamsData.from = ((this.paginator.pageIndex * this.paginator.pageSize) + 1);
    this.queryParamsData.to = ((this.paginator.pageIndex + 1) * this.paginator.pageSize);

    this.dataSource.loadTransactions(this.queryParamsData);
  }

  applyFilter(data) {
    this.queryParamsData.scheme = data.data.scheme;
    this.dataSource.loadTransactions(this.queryParamsData);
    this.filteredDataList = data.list;
  }

  }


