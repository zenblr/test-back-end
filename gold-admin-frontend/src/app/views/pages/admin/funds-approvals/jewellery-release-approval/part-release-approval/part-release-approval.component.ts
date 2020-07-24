import { Component, OnInit, ViewChild } from '@angular/core';
import { DataTableService } from '../../../../../../core/shared/services/data-table.service';
import { tap, takeUntil, skip, distinctUntilChanged } from 'rxjs/operators';
import { PartReleaseApprovalDatasource } from '../../../../../../core/funds-approvals/jewellery-release-approval/part-release-approval/datasources/part-release-approval.datasource';
import { MatPaginator, MatDialog } from '@angular/material';
import { Subject, Subscription, merge } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { LayoutUtilsService } from '../../../../../../core/_base/crud';
import { AssignAppraiserComponent } from '../../../user-management/assign-appraiser/assign-appraiser/assign-appraiser.component';
import { PartReleaseApprovalService } from '../../../../../../core/funds-approvals/jewellery-release-approval/part-release-approval/services/part-release-approval.service';
import { OrnamentsComponent } from '../../../loan-management/loan-application-form/tabs/ornaments/ornaments.component';
import { UpdateStatusComponent } from '../../update-status/update-status.component';

@Component({
  selector: 'kt-part-release-approval',
  templateUrl: './part-release-approval.component.html',
  styleUrls: ['./part-release-approval.component.scss']
})
export class PartReleaseApprovalComponent implements OnInit {

  dataSource;
  displayedColumns = ['customerId', 'loanId', 'loanAmount', 'loanStartDate', 'loanEndDate', 'tenure', 'principalAmount', 'releaseDate', 'totalGrossWeight', 'totalDeductionWeight', 'netWeightReleaseOrnament', 'netWeightRemainingOrnament', 'ornamentReleaseAmount', 'interestAmount', 'penalInterest', 'totalPayableAmount', 'partReleaseAmountStatus', 'ornaments', 'updateStatus'];
  result = []
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  unsubscribeSearch$ = new Subject();
  destroy$ = new Subject();
  searchValue = '';
  private subscriptions: Subscription[] = [];

  constructor(
    private dataTableService: DataTableService,
    private partReleaseApprovalService: PartReleaseApprovalService,
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

    this.dataSource = new PartReleaseApprovalDatasource(this.partReleaseApprovalService);
    const entitiesSubscription = this.dataSource.entitySubject.pipe(
      skip(1),
      distinctUntilChanged()
    ).subscribe(res => {
      this.result = res;
    });
    this.subscriptions.push(entitiesSubscription);

    this.dataSource.getPartReleaseList(1, 25, this.searchValue);
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

    this.dataSource.getPartReleaseList(from, to, this.searchValue);
  }

  ornamentsDetails(item) {
    this.dialog.open(OrnamentsComponent, {
      data: {
        modal: true,
        modalData: item
      },
      width: '90%'
    })
  }

  assign(item) {
    const dialogRef = this.dialog.open(AssignAppraiserComponent, { data: { action: 'add', customer: item.customer, id: item.customerId }, width: '500px' });
    dialogRef.afterClosed().subscribe(res => {
      if (res) {
        this.loadPage();
      }
    });
  }

  updateAppraiser(item) {

  }

  updateStatus(item) {
    const dialogRef = this.dialog.open(UpdateStatusComponent, { data: { action: 'edit', value: item }, width: 'auto' });
    dialogRef.afterClosed().subscribe(res => {
      if (res) {
        this.loadPage();
      }
    });
  }

}
