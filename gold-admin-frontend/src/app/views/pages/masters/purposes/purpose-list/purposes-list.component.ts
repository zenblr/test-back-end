import { Component, OnInit, ViewChild } from '@angular/core';
import { Subject, Subscription, merge } from 'rxjs';
import { MatPaginator, MatDialog } from '@angular/material';
import { DataTableService } from '../../../../../core/shared/services/data-table.service';
import { map, takeUntil, tap, skip, distinctUntilChanged } from 'rxjs/operators';
import { PurposeDatasource } from '../../../../../core/masters/purposes/datasources/purpose.datasource';
import { PurposeService } from '../../../../../core/masters/purposes/service/purpose.service';
import { AddPurposeComponent } from '../add-purpose/add-purpose.component';

@Component({
  selector: 'kt-purposes-list',
  templateUrl: './purposes-list.component.html',
  styleUrls: ['./purposes-list.component.scss']
})
export class PurposesListComponent implements OnInit {
  
  dataSource;
  displayedColumns = ['purposeName', 'action'];
  result = []
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  unsubscribeSearch$ = new Subject();
  destroy$ = new Subject();
  searchValue = '';
  private subscriptions: Subscription[] = [];

  constructor(
    private dataTableService: DataTableService,
    private purposeService: PurposeService,
    public dialog: MatDialog,
  ) {
    this.purposeService.openModal$.pipe(
      map(res => {
        if (res) {
          this.addpurpose();
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

    this.dataSource = new PurposeDatasource(this.purposeService);
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

  addpurpose() {
    const dialogRef = this.dialog.open(AddPurposeComponent, {
      data: { action: 'add' },
      width: '400px',
    });
    dialogRef.afterClosed().subscribe(res => {
      if (res) {
        this.loadPage();
      }
      this.purposeService.openModal.next(false);
    });
  }

  editPurpose(purpose) {
    console.log(purpose)
    const dialogRef = this.dialog.open(AddPurposeComponent,
      {
        data: { purposeData: purpose, action: 'edit' },
        width: '400px'
      });
    dialogRef.afterClosed().subscribe(res => {
      if (res) {
        this.loadPage();
      }
    });
  }

}
