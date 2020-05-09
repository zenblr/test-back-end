import { Component, OnInit, ViewChild } from '@angular/core';
import { AppliedKycDatasource } from '../../../core/applied-kyc/datasources/applied-kyc.datasource';
import { AppliedKycService } from '../../../core/applied-kyc/services/applied-kyc.service';
import { MatPaginator, MatSort, MatDialog } from '@angular/material';
import { Subject, Subscription, merge } from 'rxjs';
import { tap, takeUntil, skip, distinctUntilChanged } from 'rxjs/operators';
import { DataTableService } from '../../../core/shared/services/data-table.service';

@Component({
  selector: 'kt-applied-kyc',
  templateUrl: './applied-kyc.component.html',
  styleUrls: ['./applied-kyc.component.scss']
})
export class AppliedKycComponent implements OnInit {

  dataSource: AppliedKycDatasource;
  displayedColumns = ['fullName', 'mobile', 'pan', 'date', 'cceApprovalStatus', 'kycStatus', 'actions'];
  leadsResult = []
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild('sort1', { static: true }) sort: MatSort;
  searchValue = '';
  private subscriptions: Subscription[] = [];

  private unsubscribeSearch$ = new Subject();

  constructor(
    private appliedKycService: AppliedKycService,
    public dialog: MatDialog,
    private dataTableService: DataTableService
  ) { }

  ngOnInit() {
    // const sortSubscription = this.sort.sortChange.subscribe(() => (this.paginator.pageIndex = 0));
    // this.subscriptions.push(sortSubscription);

    // const paginatorSubscriptions = merge(this.sort.sortChange, this.paginator.page).pipe(
    //   tap(() => {
    //     this.loadPage();
    //   })
    // )
    //   .subscribe();
    // this.subscriptions.push(paginatorSubscriptions);

    // const searchSubscription = this.dataTableService.searchInput$.pipe(takeUntil(this.unsubscribeSearch$))
    //   .subscribe(res => {
    //     this.searchValue = res;
    //     this.paginator.pageIndex = 0;
    //     this.loadPage();
    //   });

    // Init DataSource
    this.dataSource = new AppliedKycDatasource(this.appliedKycService);
    const entitiesSubscription = this.dataSource.entitySubject.pipe(
      skip(1),
      distinctUntilChanged()
    ).subscribe(res => {
      console.log(res);
      this.leadsResult = res;
    });
    this.subscriptions.push(entitiesSubscription);

    // First load
    // this.loadLeadsPage();

    this.dataSource.loadKyc(1, 25, this.searchValue, '', '', '');
  }

  loadPage() {
    if (this.paginator.pageIndex < 0 || this.paginator.pageIndex > (this.paginator.length / this.paginator.pageSize))
      return;
    let from = ((this.paginator.pageIndex * this.paginator.pageSize) + 1);
    let to = ((this.paginator.pageIndex + 1) * this.paginator.pageSize);

    this.dataSource.loadKyc(from, to, this.searchValue, '', '', '');
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(el => el.unsubscribe());
    this.unsubscribeSearch$.next();
    this.unsubscribeSearch$.complete();
  }

  editKyc(data) {
    console.log(data)
  }
}
