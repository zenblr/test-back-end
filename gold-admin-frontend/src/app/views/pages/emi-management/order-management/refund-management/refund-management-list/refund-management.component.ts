import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { MatPaginator, MatDialog, MatSnackBar, MatSort } from '@angular/material';
import { Subscription, Subject, merge } from 'rxjs';
import { LayoutUtilsService } from '../../../../../../core/_base/crud';
import { DataTableService } from '../../../../../../core/shared/services/data-table.service';
import { EmiDetailsService, EmiDetailsDatasource, EmiDetailsModel } from '../../../../../../core/emi-management/order-management';
import { skip, distinctUntilChanged, tap, takeUntil } from 'rxjs/operators';
import { RefundManagementEditComponent } from '../refund-management-edit/refund-management-edit.component'
@Component({
  selector: 'kt-refund-management',
  templateUrl: './refund-management.component.html',
  styleUrls: ['./refund-management.component.scss']
})
export class RefundManagementComponent implements OnInit {
  dataSource: EmiDetailsDatasource;
  displayedColumns = ['storeId', 'userId', 'mobileNumber', 'orderId', 'emiDate', 'emiAmount',
    'emiPaidDate', 'status', 'emiFrom', 'action'];
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild('sort1', { static: true }) sort: MatSort;
  @ViewChild('searchInput', { static: true }) searchInput: ElementRef;
  bulkUploadReportResult: EmiDetailsModel[] = [];
  private subscriptions: Subscription[] = [];
  private destroy$ = new Subject();
  private unsubscribeSearch$ = new Subject();
  searchValue = '';

  constructor(
    public dialog: MatDialog,
    public snackBar: MatSnackBar,
    private layoutUtilsService: LayoutUtilsService,
    private emiDetailsService: EmiDetailsService,
    private dataTableService: DataTableService,
  ) {
    this.emiDetailsService.exportExcel$.pipe(takeUntil(this.destroy$)).subscribe(res => {
      if (res) {
        this.downloadReport();
      }
    });
  }
  ngOnInit() {
    const sortSubscription = this.sort.sortChange.subscribe(() => (this.paginator.pageIndex = 0));
    this.subscriptions.push(sortSubscription);

    const paginatorSubscriptions = merge(this.sort.sortChange, this.paginator.page).pipe(
      tap(() => {
        this.loadEmiDetailsPage();
      })
    )
      .subscribe();
    this.subscriptions.push(paginatorSubscriptions);

    const searchSubscription = this.dataTableService.searchInput$.pipe(takeUntil(this.unsubscribeSearch$))
      .subscribe(res => {
        this.searchValue = res;
        this.paginator.pageIndex = 0;
        this.loadEmiDetailsPage();
      });

    this.dataSource = new EmiDetailsDatasource(this.emiDetailsService);
    const entitiesSubscription = this.dataSource.entitySubject.pipe(
      skip(1),
      distinctUntilChanged()
    ).subscribe(res => {
      this.bulkUploadReportResult = res;
    });
    this.subscriptions.push(entitiesSubscription);
    this.dataSource.loadEmiDetails(1, 25, this.searchValue);
  }

  loadEmiDetailsPage() {
    if (this.paginator.pageIndex < 0 || this.paginator.pageIndex > (this.paginator.length / this.paginator.pageSize))
      return;
    let from = ((this.paginator.pageIndex * this.paginator.pageSize) + 1);
    let to = ((this.paginator.pageIndex + 1) * this.paginator.pageSize);

    this.dataSource.loadEmiDetails(from, to, this.searchValue);
  }


  filterConfiguration(): any {
    const filter: any = {};
    const searchText: string = this.searchInput.nativeElement.value;
    filter.title = searchText;
    return filter;
  }

  viewProduct(product) {
    console.log(product);
    const dialogRef = this.dialog.open(RefundManagementEditComponent,
      {
        data: { productId: product.id, action: 'view' },
        width: '550px'
      });
    dialogRef.afterClosed().subscribe(res => {
      if (res) {
        console.log(res);
      }
    });
  }

  editProduct(product) {
    console.log(product);
    const dialogRef = this.dialog.open(RefundManagementEditComponent,
      {
        data: { productId: product.id, action: 'edit' },
        width: '550px'
      });
    dialogRef.afterClosed().subscribe(res => {
      if (res) {
        this.loadEmiDetailsPage();
      }
    });
  }

  printCancellationReceipt(order) { }

  downloadReport() {
    this.emiDetailsService.reportExport().subscribe();
    this.emiDetailsService.exportExcel.next(false);
  }

	/**
	 * On Destroy
	 */
  ngOnDestroy() {
    this.subscriptions.forEach(el => el.unsubscribe());
    this.destroy$.next();
    this.destroy$.complete();
    this.unsubscribeSearch$.next();
    this.unsubscribeSearch$.complete();
  }
}