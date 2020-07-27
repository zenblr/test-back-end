import { Component, OnInit, ViewChild } from '@angular/core';
import { DataTableService } from '../../../../../../core/shared/services/data-table.service';
import { merge, Subject, Subscription } from 'rxjs';
import { tap, takeUntil, skip, distinctUntilChanged } from 'rxjs/operators';
import { PartReleaseFinalService } from '../../../../../../core/funds-approvals/jewellery-release-final/part-release-final/services/part-release-final.service';
import { MatPaginator, MatDialog } from '@angular/material';
import { ToastrService } from 'ngx-toastr';
import { LayoutUtilsService } from '../../../../../../core/_base/crud';
import { OrnamentsComponent } from '../../../../../partials/components/ornaments/ornaments.component';
import { AssignAppraiserComponent } from '../../../user-management/assign-appraiser/assign-appraiser/assign-appraiser.component';
import { PartReleaseFinalDatasource } from '../../../../../../core/funds-approvals/jewellery-release-final/part-release-final/datasources/part-release-final.datasource';
import { UpdateStatusComponent } from '../../update-status/update-status.component';

@Component({
  selector: 'kt-part-release-final',
  templateUrl: './part-release-final.component.html',
  styleUrls: ['./part-release-final.component.scss']
})
export class PartReleaseFinalComponent implements OnInit {

  dataSource;
  displayedColumns = ['customerId', 'loanId', 'loanAmount', 'loanStartDate', 'loanEndDate', 'tenure', 'principalAmount', 'releaseDate', 'totalGrossWeight', 'totalDeductionWeight', 'netWeightReleaseOrnament', 'netWeightRemainingOrnament', 'ornamentReleaseAmount', 'interestAmount', 'penalInterest', 'totalPayableAmount', 'partReleaseAmountStatus', 'ornaments', 'updateStatus', 'assignAppraiser'];
  result = []
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  unsubscribeSearch$ = new Subject();
  destroy$ = new Subject();
  searchValue = '';
  private subscriptions: Subscription[] = [];

  constructor(
    private dataTableService: DataTableService,
    private partReleaseFinalService: PartReleaseFinalService,
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

    this.dataSource = new PartReleaseFinalDatasource(this.partReleaseFinalService);
    const entitiesSubscription = this.dataSource.entitySubject.pipe(
      skip(1),
      distinctUntilChanged()
    ).subscribe(res => {
      this.result = res;
    });
    this.subscriptions.push(entitiesSubscription);

    // this.dataSource.getPartReleaseList(1, 25, this.searchValue);
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

    this.dataSource.getDepositList(from, to, this.searchValue);
  }

  ornamentsDetails() {
    this.dialog.open(OrnamentsComponent, {
      data: {
        modal: true
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
        // this.loadPage();
      }
    });
  }

}
