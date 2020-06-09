import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator, MatDialog } from '@angular/material';
import { Subject, Subscription, merge } from 'rxjs';
import { DataTableService } from '../../../../../core/shared/services/data-table.service';
import { ToastrService } from 'ngx-toastr';
import { LayoutUtilsService } from '../../../../../core/_base/crud';
import { map, takeUntil, tap, skip, distinctUntilChanged } from 'rxjs/operators';
import { ReasonAddComponent } from '../reason-add/reason-add.component';
import { ReasonsService } from '../../../../../core/masters/reasons/services/reasons.service';
import { ReasonsDatasource } from '../../../../../core/masters/reasons/datasources/reasons.datasource';

@Component({
  selector: 'kt-reason-list',
  templateUrl: './reason-list.component.html',
  styleUrls: ['./reason-list.component.scss']
})
export class ReasonListComponent implements OnInit {

  dataSource;
  displayedColumns = ['reason', 'action'];
  result = []
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  unsubscribeSearch$ = new Subject();
  destroy$ = new Subject();
  searchValue = '';
  private subscriptions: Subscription[] = [];

  constructor(
    private dataTableService: DataTableService,
    private reasonsService: ReasonsService,
    public dialog: MatDialog,
    private toastr: ToastrService,
    private layoutUtilsService: LayoutUtilsService,
  ) {
    this.reasonsService.openModal$.pipe(
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

    this.dataSource = new ReasonsDatasource(this.reasonsService);
    const entitiesSubscription = this.dataSource.entitySubject.pipe(
      skip(1),
      distinctUntilChanged()
    ).subscribe(res => {
      this.result = res;
    });
    this.subscriptions.push(entitiesSubscription);

    this.dataSource.getReasons(1, 25, this.searchValue);
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

    this.dataSource.getReasons(from, to, this.searchValue);
  }

  addReason() {
    const dialogRef = this.dialog.open(ReasonAddComponent, {
      data: { action: 'add' },
      width: '500px',
    });
    dialogRef.afterClosed().subscribe(res => {
      if (res) {
        this.loadPage();
      }
      this.reasonsService.openModal.next(false);
    });
  }

  editReason(role) {
    console.log(role)
    const dialogRef = this.dialog.open(ReasonAddComponent,
      {
        data: { reason: role, action: 'edit' },
        width: '500px'
      });
    dialogRef.afterClosed().subscribe(res => {
      if (res) {
        this.loadPage();
      }
    });
  }

  deleteReason(_item) {
    const role = _item;
    const _title = 'Delete Reason';
    const _description = 'Are you sure to permanently delete this reason?';
    const _waitDesciption = 'Reason is deleting...';
    const _deleteMessage = `Reason has been deleted`;
    const dialogRef = this.layoutUtilsService.deleteElement(_title, _description, _waitDesciption);
    dialogRef.afterClosed().subscribe(res => {
      if (res) {
        this.reasonsService.deleteReason(role.id).subscribe(successDelete => {
          this.toastr.success(_deleteMessage);
          this.loadPage();
        },
          errorDelete => {
            this.toastr.error(errorDelete.error.message);
          });
      }
    });
  }
}
