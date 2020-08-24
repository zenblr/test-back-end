import { Component, OnInit, ViewChild } from '@angular/core';
import { DataTableService } from '../../../../../../core/shared/services/data-table.service';
import { merge, Subject, Subscription } from 'rxjs';
import { tap, takeUntil, skip, distinctUntilChanged } from 'rxjs/operators';
import { FullReleaseApprovalDatasource } from '../../../../../../core/funds-approvals/jewellery-release-approval/full-release-approval/datasources/full-release-approval.datasource';
import { MatPaginator, MatDialog } from '@angular/material';
import { FullReleaseApprovalService } from '../../../../../../core/funds-approvals/jewellery-release-approval/full-release-approval/services/full-release-approval.service';
import { ToastrService } from 'ngx-toastr';
import { LayoutUtilsService } from '../../../../../../core/_base/crud';
import { AssignAppraiserComponent } from '../../../user-management/assign-appraiser/assign-appraiser/assign-appraiser.component';
import { FullReleaseFinalDatasource } from '../../../../../../core/funds-approvals/jewellery-release-final/full-release-final/datasources/full-release-final.datasource';
import { FullReleaseFinalService } from '../../../../../../core/funds-approvals/jewellery-release-final/full-release-final/services/full-release-final.service';
import { UpdateStatusComponent } from '../../update-status/update-status.component';
import { Router } from '@angular/router';

@Component({
  selector: 'kt-full-release-final',
  templateUrl: './full-release-final.component.html',
  styleUrls: ['./full-release-final.component.scss']
})
export class FullReleaseFinalComponent implements OnInit {

  dataSource;
  displayedColumns = ['customerId', 'loanId', 'appointmentDate', 'appointmentTime', 'loanAmount', 'loanStartDate', 'loanEndDate', 'tenure', 'principalAmount', 'totalGrossWeight', 'totalDeductionWeight', 'netWeight', 'previousLTV', 'currentLTV', 'principalOutstandingAmountLTV', 'interestAmount', 'penalInterest', 'totalPayableAmount', 'partReleaseAmountStatus', 'updateStatus'];
  result = []
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  unsubscribeSearch$ = new Subject();
  destroy$ = new Subject();
  searchValue = '';
  private subscriptions: Subscription[] = [];

  constructor(
    private dataTableService: DataTableService,
    private fullReleaseFinalService: FullReleaseFinalService,
    public dialog: MatDialog,
    private toastr: ToastrService,
    private layoutUtilsService: LayoutUtilsService,
    private router: Router
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

    this.dataSource = new FullReleaseFinalDatasource(this.fullReleaseFinalService);
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

  updateStatus(item) {
    const dialogRef = this.dialog.open(UpdateStatusComponent,
      {
        data: {
          action: 'edit',
          value: item,
          name: 'fullReleaseFinal'
        },
        width: 'auto'
      });
    dialogRef.afterClosed().subscribe(res => {
      if (res) {
        this.loadPage();
      }
    });
  }

  updateDocument(item) {
    this.router.navigate([`admin/funds-approvals/upload-document/fullRelease/${item.id}`])
  }

}
