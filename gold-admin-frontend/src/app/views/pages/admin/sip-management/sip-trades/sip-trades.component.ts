import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator, MatDialog } from '@angular/material';
import { Subject, Subscription, merge, from } from 'rxjs';
import { DataTableService } from '../../../../../core/shared/services/data-table.service';
import { ToastrService } from 'ngx-toastr';
import { LayoutUtilsService } from '../../../../../core/_base/crud';
import { map, takeUntil, tap, skip, distinctUntilChanged } from 'rxjs/operators';
import { SipTradesDatasource, SipTradesService } from '../../../../../core/sip-management';


@Component({
  selector: 'kt-sip-trades',
  templateUrl: './sip-trades.component.html',
  styleUrls: ['./sip-trades.component.scss']
})
export class SipTradesComponent implements OnInit {

  dataSource: SipTradesDatasource;
  displayedColumns = ['schemeApplicationId', 'customerId', 'metalType', 'schemeTradeAmount', 'schemeTradeDate','schemeTradeNoOfUnits', 'schemeTradeStatus'];
  result = []
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  unsubscribeSearch$ = new Subject();
  destroy$ = new Subject();
  searchValue = '';
  private subscriptions: Subscription[] = [];

  constructor(
    private dataTableService: DataTableService,
    private sipTradesService: SipTradesService,
    public dialog: MatDialog,
    private toastr: ToastrService,
    private layoutUtilsService: LayoutUtilsService,
  ) {
    this.sipTradesService.openModal$.pipe(
      map(res => {
        if (res) {
          // this.addLeadSource();
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

    this.dataSource = new SipTradesDatasource(this.sipTradesService);
    const entitiesSubscription = this.dataSource.entitySubject.pipe(
      skip(1),
      distinctUntilChanged()
    ).subscribe(res => {
      this.result = res;
    });
    this.subscriptions.push(entitiesSubscription);

    this.dataSource.getLeadSources(1, 25, this.searchValue);
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

    this.dataSource.getLeadSources(from, to, this.searchValue);
  }

  addLeadSource() {
    const dialogRef = this.dialog.open(SipTradesComponent, {
      data: { action: 'add' },
      width: '400px',
    });
    dialogRef.afterClosed().subscribe(res => {
      if (res) {
        this.loadPage();
      }
      this.sipTradesService.openModal.next(false);
    });
  }

  // editLeadSource(item) {
  //   const dialogRef = this.dialog.open(SipTradesComponent,
  //     {
  //       data: { leadSourceData: item, action: 'edit' },
  //       width: '400px'
  //     });
  //   dialogRef.afterClosed().subscribe(res => {
  //     if (res) {
  //       this.loadPage();
  //     }
  //   });
  // }

  // deleteLeadSource(_item) {
  //   const role = _item;
  //   const _title = 'Delete Lead Source';
  //   const _description = 'Are you sure you want to permanently delete this Lead Source?';
  //   const _waitDesciption = 'Lead Source is deleting...';
  //   const _deleteMessage = `Lead Source has been deleted`;
  //   const dialogRef = this.layoutUtilsService.deleteElement(_title, _description, _waitDesciption);
  //   dialogRef.afterClosed().subscribe(res => {
  //     if (res) {
  //       this.sipTradesService.deleteLeadSource(role.id).subscribe(successDelete => {
  //         this.toastr.success(_deleteMessage);
  //         this.loadPage();
  //       },
  //         errorDelete => {
  //           this.toastr.error(errorDelete.error.message);
  //         });
  //     }
  //   });
  // }



}
