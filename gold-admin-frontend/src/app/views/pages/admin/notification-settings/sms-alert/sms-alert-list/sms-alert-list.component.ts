import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator, MatDialog } from '@angular/material';
import { Subject, Subscription, merge } from 'rxjs';
import { DataTableService } from '../../../../../../core/shared/services/data-table.service';
import { SmsAlertService } from '../../../../../../core/notification-setting/services/sms-alert.service';
import { map, takeUntil, tap, skip, distinctUntilChanged } from 'rxjs/operators';
import { SmsAlertDatasource } from '../../../../../../core/notification-setting/datasources/sms-alert.datasource';
import { SmsAlertAddComponent } from '../sms-alert-add/sms-alert-add.component';

@Component({
  selector: 'kt-sms-alert-list',
  templateUrl: './sms-alert-list.component.html',
  styleUrls: ['./sms-alert-list.component.scss']
})
export class SmsAlertListComponent implements OnInit {

  dataSource;
  displayedColumns = ['alertId', 'subject', 'content', 'actions'];
  result = []
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  unsubscribeSearch$ = new Subject();
  destroy$ = new Subject();
  searchValue = '';
  private subscriptions: Subscription[] = [];

  constructor(
    private dataTableService: DataTableService,
    private smsAlertService: SmsAlertService,
    public dialog: MatDialog,

  ) {
    this.smsAlertService.openDialog$.pipe(
      map(res => {
        if (res) {
          this.addAlert();
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

    this.dataSource = new SmsAlertDatasource(this.smsAlertService);
    const entitiesSubscription = this.dataSource.entitySubject.pipe(
      skip(1),
      distinctUntilChanged()
    ).subscribe(res => {
      this.result = res;
    });
    this.subscriptions.push(entitiesSubscription);

    this.dataSource.loadLeads(1, 25, this.searchValue);
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

    this.dataSource.loadLeads(from, to, this.searchValue);
  }

  addAlert() {
    const dialogRef = this.dialog.open(SmsAlertAddComponent, {
      data: { action: 'add' },
      width: '500px'
    });
    dialogRef.afterClosed().subscribe(res => {
      if (res) {
        this.loadPage();
      }
      this.smsAlertService.openDialog.next(false);
    });
  }

  viewAlert(data) {

  }

  editAlert(data) {

  }

  deleteAlert(data) {

  }
}
