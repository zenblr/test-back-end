import { Component, OnInit, ViewChild } from '@angular/core';
import { merge, Subject, Subscription } from 'rxjs';
import { tap, takeUntil, skip, distinctUntilChanged } from 'rxjs/operators';
import { DataTableService } from '../../../../../../core/shared/services/data-table.service';
import { FullReleaseApprovalService } from '../../../../../../core/funds-approvals/jewellery-release-approval/full-release-approval/services/full-release-approval.service';
import { FullReleaseApprovalDatasource } from '../../../../../../core/funds-approvals/jewellery-release-approval/full-release-approval/datasources/full-release-approval.datasource';
import { MatPaginator, MatDialog } from '@angular/material';
import { ToastrService } from 'ngx-toastr';
import { LayoutUtilsService } from '../../../../../../core/_base/crud';
import { AssignAppraiserComponent } from '../../../user-management/assign-appraiser/assign-appraiser/assign-appraiser.component';
import { UpdateStatusComponent } from '../../update-status/update-status.component';
import { OrnamentsComponent } from '../../../../../partials/components/ornaments/ornaments.component';

@Component({
  selector: 'kt-full-release-approval',
  templateUrl: './full-release-approval.component.html',
  styleUrls: ['./full-release-approval.component.scss']
})
export class FullReleaseApprovalComponent implements OnInit {

  dataSource;
  displayedColumns = ['customerId', 'loanId', 'loanAmount', 'loanStartDate', 'loanEndDate', 'tenure', 'principalAmount', 'totalGrossWeight', 'totalDeductionWeight', 'netWeight', 'previousLTV', 'currentLTV', 'principalOutstandingAmountLTV', 'interestAmount', 'penalInterest', 'totalPayableAmount', 'partReleaseAmountStatus', 'ornaments', 'updateStatus'];
  result = []
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  unsubscribeSearch$ = new Subject();
  destroy$ = new Subject();
  searchValue = '';
  private subscriptions: Subscription[] = [];

  constructor(
    private dataTableService: DataTableService,
    private fullReleaseApprovalService: FullReleaseApprovalService,
    public dialog: MatDialog,
    private toastr: ToastrService,
    private layoutUtilsService: LayoutUtilsService,
  ) { }

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

    this.dataSource = new FullReleaseApprovalDatasource(this.fullReleaseApprovalService);
    const entitiesSubscription = this.dataSource.entitySubject.pipe(
      skip(1),
      distinctUntilChanged()
    ).subscribe(res => {
      this.result = res;
    });
    this.subscriptions.push(entitiesSubscription);

    this.dataSource.getFullReleaseList(1, 25, this.searchValue);
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

    this.dataSource.getFullReleaseList(from, to, this.searchValue);
  }

  // assign(item) {
  //   const dialogRef = this.dialog.open(AssignAppraiserComponent, { data: { action: 'add', customer: item.customer, id: item.customerId }, width: '500px' });
  //   dialogRef.afterClosed().subscribe(res => {
  //     if (res) {
  //       this.loadPage();
  //     }
  //   });
  // }

  // updateAppraiser(item) {

  // }

  assign(item) {
    const dialogRef = this.dialog.open(AssignAppraiserComponent,
      {
        data:
        {
          action: 'add',
          customer: item.masterLoan.customer,
          id: item.masterLoan.customerId,
          fullReleaseId: item.id,
          isReleaser: true
        },
        width: '500px'
      });
    dialogRef.afterClosed().subscribe(res => {
      if (res) {
        this.loadPage();
      }
    });
  }

  updateAppraiser(item) {
    const dialogRef = this.dialog.open(AssignAppraiserComponent, { data: { action: 'edit', appraiser: item.appraiserData, customer: item.masterLoan.customer, partReleaseId: item.id }, width: '500px' });
    dialogRef.afterClosed().subscribe(res => {
      if (res) {
        this.loadPage();
      }
    });
  }

  updateStatus(item) {
    const dialogRef = this.dialog.open(UpdateStatusComponent, {
      data: {
        action: 'edit',
        value: item,
        name: 'fullReleaseApproval'
      },
      width: 'auto'
    });
    dialogRef.afterClosed().subscribe(res => {
      if (res) {
        this.loadPage();
      }
    });
  }

  ornamentsDetails(item) {

    const packetArr = item.map(e => ({ ...e, packetId: e.packets[0].packetUniqueId }))

    this.dialog.open(OrnamentsComponent, {
      data: {
        modal: true,
        modalData: packetArr,
        packetView: false
      },
      width: '90%'
    })
  }

}
