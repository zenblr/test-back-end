import { Component, OnInit, ViewChild } from '@angular/core';
import { DataTableService } from '../../../../../../core/shared/services/data-table.service';
import { merge, Subject, Subscription } from 'rxjs';
import { tap, takeUntil, skip, distinctUntilChanged, map } from 'rxjs/operators';
import { PartReleaseFinalService } from '../../../../../../core/funds-approvals/jewellery-release-final/part-release-final/services/part-release-final.service';
import { MatPaginator, MatDialog } from '@angular/material';
import { ToastrService } from 'ngx-toastr';
import { LayoutUtilsService } from '../../../../../../core/_base/crud';
import { OrnamentsComponent } from '../../../loan-management/loan-application-form/tabs/ornaments/ornaments.component';
import { AssignAppraiserComponent } from '../../../user-management/assign-appraiser/assign-appraiser/assign-appraiser.component';
import { PartReleaseFinalDatasource } from '../../../../../../core/funds-approvals/jewellery-release-final/part-release-final/datasources/part-release-final.datasource';
import { UpdateStatusComponent } from '../../update-status/update-status.component';
import { Router } from '@angular/router';

@Component({
  selector: 'kt-part-release-final',
  templateUrl: './part-release-final.component.html',
  styleUrls: ['./part-release-final.component.scss']
})
export class PartReleaseFinalComponent implements OnInit {

  dataSource;
  displayedColumns = ['customerId', 'loanId', 'appointmentDate', 'appointmentTime', 'loanAmount', 'loanStartDate', 'loanEndDate', 'tenure', 'principalAmount', 'releaseDate', 'totalGrossWeight', 'totalDeductionWeight', 'netWeightReleaseOrnament', 'netWeightRemainingOrnament', 'ornamentReleaseAmount', 'interestAmount', 'penalInterest', 'totalPaidAmount', 'status', 'ornaments', 'updateStatus',];
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
    private router: Router,
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

  updateStatus(item?) {
    const dialogRef = this.dialog.open(UpdateStatusComponent, { data: { action: 'edit', value: item, name: 'jewelleryReleaseFinal' }, width: 'auto' });
    dialogRef.afterClosed().subscribe(res => {
      if (res) {
        this.loadPage();
      }
    });
  }

  updateDocument(item) {
    this.router.navigate([`admin/funds-approvals/upload-document/${item.id}`])
  }

  newLoan(item) {
    const params = {
      customerUniqueId: item.masterLoan.customer.customerUniqueId,
      partReleaseId: item.id
    }
    // this.partReleaseFinalService.applyLoan(params).pipe(map(res => {
    //   if (res) {
    this.router.navigate(['/admin/loan-management/loan-application-form/'], { queryParams: { customerUniqueId: params.customerUniqueId, partReleaseId: params.partReleaseId } })
    //   }
    // })).subscribe()
  }

}
