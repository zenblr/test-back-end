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
import { OrnamentsComponent } from '../../../../../partials/components/ornaments/ornaments.component';
import { UpdateStatusComponent } from '../../update-status/update-status.component';
import { Router } from '@angular/router';
import { ImagePreviewDialogComponent } from '../../../../../partials/components/image-preview-dialog/image-preview-dialog.component';
import { PdfViewerComponent } from '../../../../../partials/components/pdf-viewer/pdf-viewer.component';

@Component({
  selector: 'kt-part-release-approval',
  templateUrl: './part-release-approval.component.html',
  styleUrls: ['./part-release-approval.component.scss']
})
export class PartReleaseApprovalComponent implements OnInit {

  dataSource;
  displayedColumns = ['customerName', 'customerId', 'loanId', 'loanAmount', 'transactionId', 'bankTransactionId', 'appraiserName', 'loanStartDate', 'loanEndDate', 'tenure', 'principalAmount', 'totalGrossWeight', 'totalDeductionWeight', 'netWeightReleaseOrnament', 'netWeightRemainingOrnament', 'ornamentReleaseAmount', 'interestAmount', 'penalInterest', 'totalPayableAmount', 'partReleaseAmountStatus', 'ornaments', 'view', 'updateStatus'];
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

  viewLoan(loan) {
    this.router.navigate(['/admin/customer-management/loan-details', loan.masterLoanId])
  }

  assign(item) {
    const dialogRef = this.dialog.open(AssignAppraiserComponent,
      {
        data:
        {
          action: 'add',
          customer: item.masterLoan.customer,
          id: item.masterLoan.customerId,
          partReleaseId: item.id,
          customerId: item.masterLoan.customerId
        }, width: '500px'
      });
    dialogRef.afterClosed().subscribe(res => {
      if (res) {
        this.loadPage();
      }
    });
  }

  updateAppraiser(item) {
    const dialogRef = this.dialog.open(AssignAppraiserComponent,
      {
        data:
        {
          action: 'edit',
          appraiser: item.appraiserData,
          customer: item.masterLoan.customer,
          partReleaseId: item.id,
          customerId: item.masterLoan.customerId
        },
        width: '500px'
      });
    dialogRef.afterClosed().subscribe(res => {
      if (res) {
        this.loadPage();
      }
    });
  }

  updateStatus(item) {
    const dialogRef = this.dialog.open(UpdateStatusComponent,
      {
        data: {
          action: 'edit',
          value: item,
          name: 'jewelleryReleaseApproval'
        },
        width: 'auto'
      });
    dialogRef.afterClosed().subscribe(res => {
      if (res) {
        this.loadPage();
      }
    });
  }

  // updateDocument(item) {
  //   const params = {
  //     customerUniqueId: item.masterLoan.customer.customerUniqueId,
  //     partReleaseId: item.id
  //   }
  //   this.router.navigate([`admin/funds-approvals/upload-document/partRelease/${item.id}`],
  //     { queryParams: { customerUniqueId: params.customerUniqueId, partReleaseId: params.partReleaseId } })
  // }

  view(value) {
    var ext = value.split('.')
    if (ext[ext.length - 1] == 'pdf') {

      this.dialog.open(PdfViewerComponent, {
        data: {
          pdfSrc: value,
          page: 1,
          showAll: true
        },
        width: "80%"
      })

    } else {
      this.dialog.open(ImagePreviewDialogComponent, {
        data: {
          images: [value],
          index: 0,
          modal: false
        },
        width: "auto",
      })
    }
  }
}
