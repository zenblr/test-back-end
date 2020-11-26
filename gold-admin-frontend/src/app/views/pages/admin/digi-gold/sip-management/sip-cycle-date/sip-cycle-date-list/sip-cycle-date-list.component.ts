import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator, MatDialog } from '@angular/material';
import { Subject, Subscription, merge, from } from 'rxjs';
import { DataTableService } from '../../../../../../../core/shared/services/data-table.service';
import { ToastrService } from 'ngx-toastr';
import { LayoutUtilsService } from '../../../../../../../core/_base/crud';
import { map, takeUntil, tap, skip, distinctUntilChanged } from 'rxjs/operators';
import { SipCycleDateAddComponent } from '../sip-cycle-date-add/sip-cycle-date-add.component';
import { SipCycleDateDatasource, SipCycleDateService } from '../../../../../../../core/sip-management/sip-cycle-date'

@Component({
  selector: 'kt-sip-cycle-date-list',
  templateUrl: './sip-cycle-date-list.component.html',
  styleUrls: ['./sip-cycle-date-list.component.scss']
})
export class SipCycleDateListComponent implements OnInit {

  dataSource: SipCycleDateDatasource;
  displayedColumns = ['sipCycleDate', 'sipCycleDateStatus', 'action'];
  result = []
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  unsubscribeSearch$ = new Subject();
  destroy$ = new Subject();
  searchValue = '';
  private subscriptions: Subscription[] = [];

  constructor(
    private dataTableService: DataTableService,
    private sipCycleDateService: SipCycleDateService,
    public dialog: MatDialog,
    private toastr: ToastrService,
    private layoutUtilsService: LayoutUtilsService,
  ) {
    this.sipCycleDateService.openModal$.pipe(
      map(res => {
        if (res) {
          this.addCycleDate();
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

    this.dataSource = new SipCycleDateDatasource(this.sipCycleDateService);
    const entitiesSubscription = this.dataSource.entitySubject.pipe(
      skip(1),
      distinctUntilChanged()
    ).subscribe(res => {
      this.result = res;
    });
    this.subscriptions.push(entitiesSubscription);

    this.dataSource.getCycleDate(1, 25, this.searchValue, '');
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

    this.dataSource.getCycleDate(from, to, this.searchValue, '');
  }

  addCycleDate() {
    const dialogRef = this.dialog.open(SipCycleDateAddComponent, {
      data: { action: 'add' },
      width: '550px',
    });
    dialogRef.afterClosed().subscribe(res => {
      if (res) {
        this.loadPage();
      }
      this.sipCycleDateService.openModal.next(false);
    });
  }

  editCycleDate(item) {
    const dialogRef = this.dialog.open(SipCycleDateAddComponent,
      {
        data: { sipCycleData: item, action: 'edit' },
        width: '550px'
      });
    dialogRef.afterClosed().subscribe(res => {
      if (res) {
        this.loadPage();
      }
    });
  }

  deleteCycleDate(_item) {
    const role = _item;
    const _title = 'Delete SIP Cycle Date';
    const _description = 'Are you sure you want to permanently delete this SIP Cycle Date?';
    const _waitDesciption = 'SIP Cycle Date is deleting...';
    const _deleteMessage = `SIP Cycle Date has been deleted`;
    const dialogRef = this.layoutUtilsService.deleteElement(_title, _description, _waitDesciption);
    dialogRef.afterClosed().subscribe(res => {
      if (res) {
        this.sipCycleDateService.deleteCycleDate(role.id).subscribe(successDelete => {
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
