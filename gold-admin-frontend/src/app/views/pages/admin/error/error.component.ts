import { Component, OnInit, ViewChild } from '@angular/core';
import { Subject, Subscription, merge } from 'rxjs';
import { MatPaginator, MatDialog } from '@angular/material';
// import { DataTableService } from '../../../../../../core/shared/services/data-table.service';
import { map, takeUntil, tap, skip, distinctUntilChanged } from 'rxjs/operators';
import { ErrorDataSource } from '../../../../core/error/datasources/error.datasources';
import { ErrorService } from '../../../../core/error/services/error.service';
// import { LayoutUtilsService } from '../../../../../../core/_base/crud/utils/layout-utils.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'kt-error',
  templateUrl: './error.component.html',
  styleUrls: ['./error.component.scss']
})
export class ErrorComponent implements OnInit {

  dataSource;
  displayedColumns = ['message', 'url','method','host','body','createdAt'];
  result = []
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  unsubscribeSearch$ = new Subject();
  destroy$ = new Subject();
  searchValue = '';
  private subscriptions: Subscription[] = [];

  constructor(
    // private dataTableService: DataTableService,
    private errorService: ErrorService,
    public dialog: MatDialog,
    // private layoutUtilsService: LayoutUtilsService,
    private toastr: ToastrService
  ) {
    
  }

  ngOnInit() {
    const paginatorSubscriptions = merge(this.paginator.page).pipe(
      tap(() => this.loadPage())
    ).subscribe();
    this.subscriptions.push(paginatorSubscriptions);


    // const searchSubscription = this.dataTableService.searchInput$.pipe(takeUntil(this.unsubscribeSearch$))
    //   .subscribe(res => {
    //     this.searchValue = res;
    //     this.paginator.pageIndex = 0;
    //     this.loadPage();
    //   });

    this.dataSource = new ErrorDataSource(this.errorService);
    const entitiesSubscription = this.dataSource.entitySubject.pipe(
      skip(1),
      distinctUntilChanged()
    ).subscribe(res => {
      this.result = res;
    });
    this.subscriptions.push(entitiesSubscription);

    this.dataSource.getErrorList(this.searchValue,1, 25 );
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

    this.dataSource.getErrorList(this.searchValue,from, to);
  }

 
}
