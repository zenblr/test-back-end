import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator, MatSort, MatDialog } from '@angular/material';
import { Subscription, merge, Subject, from } from 'rxjs';
import { tap, distinctUntilChanged, skip, takeUntil, map } from 'rxjs/operators';
import { DataTableService } from '../../../../../core/shared/services/data-table.service';
import { BuyingListDatasource, BuyingListService } from '../../../../../core/scrap-management';
import { LayoutUtilsService } from '../../../../../core/_base/crud';
import { ToastrService } from 'ngx-toastr';
import { NgxPermissionsService } from 'ngx-permissions';
import { Router } from '@angular/router';

@Component({
  selector: 'kt-buying-list',
  templateUrl: './buying-list.component.html',
  styleUrls: ['./buying-list.component.scss']
})
export class BuyingListComponent implements OnInit {
  dataSource: BuyingListDatasource;
  displayedColumns = ['customerUniqueId', 'scrapId', 'customerName', 'scrapDate', 'actions'];
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  destroy$ = new Subject();
  private subscriptions: Subscription[] = [];
  private unsubscribeSearch$ = new Subject();
  searchValue = '';
  buyingResult = [];
  constructor(
    public dialog: MatDialog,
    private buyingListService: BuyingListService,
    private dataTableService: DataTableService,
    private layoutUtilsService: LayoutUtilsService,
    private toastr: ToastrService,
    private ngxPermissionService: NgxPermissionsService,
    private router: Router,
  ) { }

  ngOnInit() {
    const paginatorSubscriptions = merge(this.paginator.page).pipe(
      tap(() => {
        this.loadList();
      })
    )
      .subscribe();
    this.subscriptions.push(paginatorSubscriptions);

    const searchSubscription = this.dataTableService.searchInput$.pipe(takeUntil(this.unsubscribeSearch$))
      .subscribe(res => {
        this.searchValue = res;
        this.paginator.pageIndex = 0;
        this.loadList();
      });

    this.dataSource = new BuyingListDatasource(this.buyingListService);
    const entitiesSubscription = this.dataSource.entitySubject.pipe(
      skip(1),
      distinctUntilChanged()
    ).subscribe(res => {
      this.buyingResult = res;
    });
    this.subscriptions.push(entitiesSubscription);
    this.dataSource.loadList(this.searchValue, 1, 25);
  }

  ngOnDestroy() {
    this.subscriptions.forEach(el => el.unsubscribe());
    this.unsubscribeSearch$.next();
    this.unsubscribeSearch$.complete();
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadList() {
    if (this.paginator.pageIndex < 0 || this.paginator.pageIndex > (this.paginator.length / this.paginator.pageSize))
      return;
    let from = ((this.paginator.pageIndex * this.paginator.pageSize) + 1);
    let to = ((this.paginator.pageIndex + 1) * this.paginator.pageSize);
    this.dataSource.loadList(this.searchValue, from, to);
  }

  newScrap(item) {
    this.router.navigate(['/admin/scrap-management/scrap-buying-application-form/'], { queryParams: { customerID: item.customer.customerUniqueId } })
  }

  viewScrap(item) {
    this.router.navigate(['/admin/scrap-management/view-scrap', item.id])
  }
}
