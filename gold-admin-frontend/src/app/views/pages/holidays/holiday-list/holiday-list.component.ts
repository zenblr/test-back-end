import { Component, OnInit, ViewChild } from '@angular/core';
import { merge, Subject, Subscription } from 'rxjs';
import { tap, takeUntil, skip, distinctUntilChanged, map } from 'rxjs/operators';
import { MatDialog, MatPaginator } from '@angular/material';
import { DataTableService } from '../../../../core/shared/services/data-table.service';
import { HolidayAddComponent } from '../holiday-add/holiday-add.component';
import { HolidayDatasource } from '../../../../core/holidays/datasources/holiday.datasource';
import { HolidayService } from '../../../../core/holidays/services/holiday.service';

@Component({
  selector: 'kt-holiday-list',
  templateUrl: './holiday-list.component.html',
  styleUrls: ['./holiday-list.component.scss']
})
export class HolidayListComponent implements OnInit {

  dataSource;
  displayedColumns = ['holidayDate', 'description'];
  result = []
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  unsubscribeSearch$ = new Subject();
  destroy$ = new Subject();
  searchValue = '';
  private subscriptions: Subscription[] = [];

  constructor(
    private dataTableService: DataTableService,
    private holidayService: HolidayService,
    public dialog: MatDialog,
  ) {
    this.holidayService.openModal$.pipe(
      map(res => {
        if (res) {
          this.addHoliday();
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

    this.dataSource = new HolidayDatasource(this.holidayService);
    const entitiesSubscription = this.dataSource.entitySubject.pipe(
      skip(1),
      distinctUntilChanged()
    ).subscribe(res => {
      this.result = res;
    });
    this.subscriptions.push(entitiesSubscription);

    // this.dataSource.getHolidays(1, 25, this.searchValue);
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

    this.dataSource.getHolidays(from, to, this.searchValue);
  }

  addHoliday() {
    const dialogRef = this.dialog.open(HolidayAddComponent, {
      data: { action: 'add' },
      width: '600px',
    });
    dialogRef.afterClosed().subscribe(res => {
      if (res) {
        this.loadPage();
      }
      this.holidayService.openModal.next(false);
    });
  }

}
