import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { LayoutUtilsService, QueryParamsModel } from '../../../../../../core/_base/crud';
import { MatSnackBar, MatDialog, MatPaginator, MatSort } from '@angular/material';
import { BulkUploadReportDatasource, BulkUploadReportService, BulkUploadReportModel } from '../../../../../../core/emi-management/bulk-upload-report';
import { Subscription, merge, fromEvent, Subject } from 'rxjs';
import { tap, debounceTime, distinctUntilChanged, skip, takeUntil } from 'rxjs/operators';
import { ToastrComponent } from '../../../../../partials/components/toastr/toastr.component';
import { DataTableService } from '../../../../../../core/shared/services/data-table.service';

@Component({
  selector: 'kt-bulk-upload-report-list',
  templateUrl: './bulk-upload-report-list.component.html',
  styleUrls: ['./bulk-upload-report-list.component.scss']
})
export class BulkUploadReportListComponent implements OnInit {
  // Table fields
  dataSource: BulkUploadReportDatasource;
  @ViewChild(ToastrComponent, { static: true }) toastr: ToastrComponent;
  displayedColumns = ['fileName', 'userName', 'time', 'status', 'action'];
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild('sort1', { static: true }) sort: MatSort;
  // Filter fields
  @ViewChild('searchInput', { static: true }) searchInput: ElementRef;
  bulkUploadReportResult: BulkUploadReportModel[] = [];
  // Subscriptions
  private subscriptions: Subscription[] = [];
  private destroy$ = new Subject();
  private unsubscribeSearch$ = new Subject();
  searchValue = '';

  constructor(
    public dialog: MatDialog,
    public snackBar: MatSnackBar,
    private layoutUtilsService: LayoutUtilsService,
    private bulkUploadReportService: BulkUploadReportService,
    private dataTableService: DataTableService
  ) { }

  ngOnInit() {
    // If the user changes the sort order, reset back to the first page.
    const sortSubscription = this.sort.sortChange.subscribe(() => (this.paginator.pageIndex = 0));
    this.subscriptions.push(sortSubscription);

		/* Data load will be triggered in two cases:
		- when a pagination event occurs => this.paginator.page
		- when a sort event occurs => this.sort.sortChange
		**/
    const paginatorSubscriptions = merge(this.sort.sortChange, this.paginator.page).pipe(
      tap(() => {
        this.loadBulkUploadReportPage();
      })
    )
      .subscribe();
    this.subscriptions.push(paginatorSubscriptions);

    // Filtration, bind to searchInput
    // const searchSubscription = fromEvent(this.searchInput.nativeElement, 'keyup').pipe(
    //   // tslint:disable-next-line:max-line-length
    //   debounceTime(150), // The user can type quite quickly in the input box, and that could trigger a lot of server requests. With this operator, we are limiting the amount of server requests emitted to a maximum of one every 150ms
    //   distinctUntilChanged(), // This operator will eliminate duplicate values
    //   tap(() => {
    //     this.paginator.pageIndex = 0;
    //     this.loadBulkUploadReportPage();
    //   })
    // )
    //   .subscribe();
    // this.subscriptions.push(searchSubscription);

    const searchSubscription = this.dataTableService.searchInput$.pipe(takeUntil(this.unsubscribeSearch$))
      .subscribe(res => {
        this.searchValue = res;
        this.paginator.pageIndex = 0;
        this.loadBulkUploadReportPage();
      });

    // Init DataSource
    this.dataSource = new BulkUploadReportDatasource(this.bulkUploadReportService);
    const entitiesSubscription = this.dataSource.entitySubject.pipe(
      skip(1),
      distinctUntilChanged()
    ).subscribe(res => {
      this.bulkUploadReportResult = res;
    });
    this.subscriptions.push(entitiesSubscription);
    this.dataSource.loadBulkUploadReports(1, 25, this.searchValue);
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

  loadBulkUploadReportPage() {
    if (this.paginator.pageIndex < 0 || this.paginator.pageIndex > (this.paginator.length / this.paginator.pageSize))
      return;
    let from = ((this.paginator.pageIndex * this.paginator.pageSize) + 1);
    let to = ((this.paginator.pageIndex + 1) * this.paginator.pageSize);

    this.dataSource.loadBulkUploadReports(from, to, this.searchValue);
  }

	/**
	 * Returns object for filter
	 */
  filterConfiguration(): any {
    const filter: any = {};
    const searchText: string = this.searchInput.nativeElement.value;
    filter.title = searchText;
    return filter;
  }

  // downloadFile(report) {
  //   window.open(report.URL, '_blank');
  // }

  downloadReport(report) {
    this.bulkUploadReportService.reportExport(report).subscribe();
  }
}
