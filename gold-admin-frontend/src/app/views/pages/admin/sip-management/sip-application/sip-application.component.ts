import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator, MatDialog } from '@angular/material';
import { Subject, Subscription, merge, from } from 'rxjs';
import { DataTableService } from '../../../../../core/shared/services/data-table.service';
import { ToastrService } from 'ngx-toastr';
import { LayoutUtilsService } from '../../../../../core/_base/crud';
import { map, takeUntil, tap, skip, distinctUntilChanged } from 'rxjs/operators';
import { SipApplicationDatasource, SipApplicationService } from '../../../../../core/sip-management/sip-application'
import { NavigationEnd, Router } from '@angular/router';
@Component({
  selector: 'kt-sip-application',
  templateUrl: './sip-application.component.html',
  styleUrls: ['./sip-application.component.scss']
})
export class SipApplicationComponent implements OnInit {

  dataSource: SipApplicationDatasource;
  displayedColumns = ['sipapplicationdate', 'customerId', 'sipApplicationnumber', 'metalType', 'sipInvestmentAmount', 'sipInvestmentTenure', 'sipStartDate', 'sipEndDate', 'status', 'depositType', 'source', 'editSip', 'renewSip'];
  result = []
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  unsubscribeSearch$ = new Subject();
  destroy$ = new Subject();
  searchValue = '';
  private subscriptions: Subscription[] = [];

  constructor(
    private dataTableService: DataTableService,
    private sipApplicationService: SipApplicationService,
    public dialog: MatDialog,
    private router: Router,
    private toastr: ToastrService,
    private layoutUtilsService: LayoutUtilsService,
  ) {
    
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

    this.dataSource = new SipApplicationDatasource(this.sipApplicationService);
    const entitiesSubscription = this.dataSource.entitySubject.pipe(
      skip(1),
      distinctUntilChanged()
    ).subscribe(res => {
      this.result = res;
    });
    this.subscriptions.push(entitiesSubscription);

    this.dataSource.getCycleDate(1, 25, this.searchValue);
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

    this.dataSource.getCycleDate(from, to, this.searchValue);
  }





}
