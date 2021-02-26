import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material';
import { DataTableService } from '../../../../../core/shared/services/data-table.service';
import { CampaignDatasource } from "../../../../../core/lead-management/datasources/campaign-list.datasource ";
import { CampaignListService } from "../../../../../core/lead-management/services/campaign-list.service";
import { merge, Subject, Subscription } from 'rxjs';
import { takeUntil, tap } from 'rxjs/operators';

@Component({
  selector: 'kt-campaign-list',
  templateUrl: './campaign-list.component.html',
  styleUrls: ['./campaign-list.component.scss']
})
export class CampaignListComponent implements OnInit {
  dataSource: CampaignDatasource  ;
  displayedColumns = ['fullName', 'customerUniqueId', 'pan', 'internalBranch', 'module', 'state', 'city', 'pincode', 'date'];
  results = []

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;

  queryParamsData = {
    from: 1,
    to: 25,
    search: '',
    isCampaign: true
  };
  // Subscriptions
  private subscriptions: Subscription[] = [];

  private unsubscribeSearch$ = new Subject();

  constructor(
    private campaignService: CampaignListService,
    private dataTableService: DataTableService,
  ) { }

  ngOnInit() {
    const paginatorSubscriptions = merge(this.paginator.page).pipe(
      tap(() => this.loadRequestPage())
    ).subscribe()
    this.subscriptions.push(paginatorSubscriptions);

    const searchSubscription = this.dataTableService.searchInput$.pipe(takeUntil(this.unsubscribeSearch$))
      .subscribe(res => {
        // console.log(res)
        this.queryParamsData.search = res;
        this.paginator.pageIndex = 0;
        this.loadRequestPage();
      });
    this.dataSource = new CampaignDatasource(this.campaignService)
    this.dataSource.getCampaignList(this.queryParamsData)
  }

  ngOnDestroy() {
    this.subscriptions.forEach(el => el.unsubscribe());
    this.unsubscribeSearch$.next();
    this.unsubscribeSearch$.complete();
  }

  loadRequestPage() {
    if (this.paginator.pageIndex < 0 || this.paginator.pageIndex > (this.paginator.length / this.paginator.pageSize))
      return;
    this.queryParamsData.from = ((this.paginator.pageIndex * this.paginator.pageSize) + 1);
    this.queryParamsData.to = ((this.paginator.pageIndex + 1) * this.paginator.pageSize);

    this.dataSource.getCampaignList(this.queryParamsData)
  }

}
