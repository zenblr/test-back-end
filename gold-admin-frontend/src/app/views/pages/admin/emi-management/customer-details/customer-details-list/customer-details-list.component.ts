import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { LayoutUtilsService, QueryParamsModel } from '../../../../../../core/_base/crud';
import { MatSnackBar, MatDialog, MatPaginator, MatSort } from '@angular/material';
import { CustomerDetailsDatasource, CustomerDetailsService, CustomerDetailsModel } from '../../../../../../core/emi-management/customer-details';
import { Subscription, merge, fromEvent, Subject } from 'rxjs';
import { tap, debounceTime, distinctUntilChanged, skip, takeUntil } from 'rxjs/operators';
import { ToastrComponent } from '../../../../../partials/components/toastr/toastr.component';
import { DataTableService } from '../../../../../../core/shared/services/data-table.service';
import { ImagePreviewDialogComponent } from '../../../../../partials/components/image-preview-dialog/image-preview-dialog.component';
import { SharedService } from '../../../../../../core/shared/services/shared.service';
import { PdfViewerComponent } from '../../../../../../../app/views/partials/components/pdf-viewer/pdf-viewer.component';


@Component({
  selector: 'kt-customer-details-list',
  templateUrl: './customer-details-list.component.html',
  styleUrls: ['./customer-details-list.component.scss']
})
export class CustomerDetailsListComponent implements OnInit {
  // Table fields
  dataSource: CustomerDetailsDatasource;
  @ViewChild(ToastrComponent, { static: true }) toastr: ToastrComponent;
  displayedColumns = ['storeId', 'vkMobileNumber', 'centerState', 'centerCity', 'customerId', 'customerEmail',
    'fullName', 'mobileNumber', 'state', 'city', 'pincode', 'panCardName', 'panCardNumber', 'viewPanCard', 'merchant', 'createdDate'];
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild('sort1', { static: true }) sort: MatSort;
  // Filter fields
  @ViewChild('searchInput', { static: true }) searchInput: ElementRef;
  CustomersResult: CustomerDetailsModel[] = [];
  // Subscriptions
  private subscriptions: Subscription[] = [];
  private destroy$ = new Subject();
  private unsubscribeSearch$ = new Subject();
  searchValue = '';

  constructor(
    public dialog: MatDialog,
    public snackBar: MatSnackBar,
    private layoutUtilsService: LayoutUtilsService,
    private customerDetailsService: CustomerDetailsService,
    private dataTableService: DataTableService,
    private sharedService: SharedService

  ) {
    this.customerDetailsService.exportExcel$.pipe(takeUntil(this.destroy$)).subscribe(res => {
      if (res) {
        this.downloadReport();
      }
    });
  }

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
        this.loadCustomerDetailsPage();
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
    //     this.loadCustomerDetailsPage();
    //   })
    // )
    //   .subscribe();
    // this.subscriptions.push(searchSubscription);

    const searchSubscription = this.dataTableService.searchInput$.pipe(takeUntil(this.unsubscribeSearch$))
      .subscribe(res => {
        this.searchValue = res;
        this.paginator.pageIndex = 0;
        this.loadCustomerDetailsPage();
      });

    // Init DataSource
    this.dataSource = new CustomerDetailsDatasource(this.customerDetailsService);
    const entitiesSubscription = this.dataSource.entitySubject.pipe(
      skip(1),
      distinctUntilChanged()
    ).subscribe(res => {
      this.CustomersResult = res;
    });
    this.subscriptions.push(entitiesSubscription);
    this.dataSource.loadCustomerDetails(1, 25, this.searchValue);
  }

  loadCustomerDetailsPage() {
    if (this.paginator.pageIndex < 0 || this.paginator.pageIndex > (this.paginator.length / this.paginator.pageSize))
      return;
    let from = ((this.paginator.pageIndex * this.paginator.pageSize) + 1);
    let to = ((this.paginator.pageIndex + 1) * this.paginator.pageSize);

    this.dataSource.loadCustomerDetails(from, to, this.searchValue);
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

  downloadReport() {
    this.customerDetailsService.reportExport().subscribe();
    this.customerDetailsService.exportExcel.next(false);
  }

  open(image) {
    // let images = [];
    // images.push(image)

    const img = image
    const ext = this.sharedService.getExtension(img)
    if (ext == 'pdf') {
      this.dialog.open(PdfViewerComponent, {
        data: {
          pdfSrc: img,
          page: 1,
          showAll: true
        },
        width: "80%"
      })
    }else{
      this.dialog.open(ImagePreviewDialogComponent, {
        data: {
          images: [image],
          index: 0
        },
        width: "auto"
      })
    }
    
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
