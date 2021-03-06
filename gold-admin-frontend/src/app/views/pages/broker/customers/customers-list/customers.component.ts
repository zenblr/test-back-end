import { Component, OnInit, ViewChild, ElementRef } from "@angular/core";
import {
  MatPaginator,
  MatDialog,
  MatSnackBar,
  MatSort,
} from "@angular/material";
import { Subscription, Subject, merge } from "rxjs";
import { LayoutUtilsService } from "../../../../../core/_base/crud";
import { DataTableService } from "../../../../../core/shared/services/data-table.service";
import {
  CustomersDatasource,
  CustomersModel,
  CustomersService
} from "../../../../../core/broker";
import { skip, distinctUntilChanged, tap, takeUntil } from "rxjs/operators";
import { SharedService } from "../../../../../core/shared/services/shared.service";
import { ImagePreviewDialogComponent } from '../../../../partials/components/image-preview-dialog/image-preview-dialog.component';
import { PdfViewerComponent } from '../../../../../../app/views/partials/components/pdf-viewer/pdf-viewer.component';


@Component({
  selector: 'kt-customers',
  templateUrl: './customers.component.html',
  styleUrls: ['./customers.component.scss']
})
export class CustomersComponent implements OnInit {
  dataSource: CustomersDatasource;
  displayedColumns = ['customerId', 'customerEmail',
    'fullName', 'mobileNumber', 'state', 'city', 'pincode', 'panCardName', 'panCardNumber', 'viewPanCard'];
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild("sort1", { static: true }) sort: MatSort;
  // Filter fields
  @ViewChild("searchInput", { static: true }) searchInput: ElementRef;
  customersResult: CustomersModel[] = [];
  // Subscriptions
  private subscriptions: Subscription[] = [];
  private destroy$ = new Subject();
  private unsubscribeSearch$ = new Subject();
  searchValue = "";
  customersData = {
    from: 1,
    to: 25,
    search: "",
  };
  filteredDataList = {};

  constructor(
    public dialog: MatDialog,
    public snackBar: MatSnackBar,
    private layoutUtilsService: LayoutUtilsService,
    private customersService: CustomersService,
    private dataTableService: DataTableService,
    private sharedService: SharedService
  ) { }

  ngOnInit() {
    const sortSubscription = this.sort.sortChange.subscribe(
      () => (this.paginator.pageIndex = 0)
    );
    this.subscriptions.push(sortSubscription);

    const paginatorSubscriptions = merge(
      this.sort.sortChange,
      this.paginator.page
    )
      .pipe(
        tap(() => {
          this.loadCustomersDetailsPage();
        })
      )
      .subscribe();
    this.subscriptions.push(paginatorSubscriptions);

    const searchSubscription = this.dataTableService.searchInput$
      .pipe(takeUntil(this.unsubscribeSearch$))
      .subscribe((res) => {
        this.searchValue = res;
        this.paginator.pageIndex = 0;
        this.loadCustomersDetailsPage();
      });

    // Init DataSource
    this.dataSource = new CustomersDatasource(this.customersService);
    const entitiesSubscription = this.dataSource.entitySubject
      .pipe(skip(1), distinctUntilChanged())
      .subscribe((res) => {
        this.customersResult = res;
      });
    this.subscriptions.push(entitiesSubscription);
    this.dataSource.loadCustomersDetails(this.customersData);
  }

  loadCustomersDetailsPage() {
    if (
      this.paginator.pageIndex < 0 ||
      this.paginator.pageIndex >
      this.paginator.length / this.paginator.pageSize
    )
      return;
    let from = this.paginator.pageIndex * this.paginator.pageSize + 1;
    let to = (this.paginator.pageIndex + 1) * this.paginator.pageSize;
    this.customersData.from = from;
    this.customersData.to = to;
    this.customersData.search = this.searchValue;
    this.dataSource.loadCustomersDetails(this.customersData);
  }

  // open(image) {
  //   let images = [];
  //   images.push(image)
  //   this.dialog.open(ImagePreviewDialogComponent, {
  //     data: {
  //       images: images,
  //       index: 0
  //     },
  //     width: "auto"
  //   })
  // }
  previewImage(value) {
    const img = value
    let images = []
    // images = [this.controls.profileImg.value, this.controls.signatureProofImg.value]

    // images = images.filter(e => {
    //   let ext = this.sharedService.getExtension(e)
    //   return ext !== 'pdf' && e != ''
    // })
    // const index = images.indexOf(img)

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
    } else {
      this.dialog.open(ImagePreviewDialogComponent, {
        data: {
          images: [img],
          index: 0,
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
