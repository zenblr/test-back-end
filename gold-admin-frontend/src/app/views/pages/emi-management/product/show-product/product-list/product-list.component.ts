import {
  Component,
  OnInit,
  ElementRef,
  ViewChild,
  OnDestroy,
  ChangeDetectorRef
} from "@angular/core";
import { SelectionModel } from "@angular/cdk/collections";
import {
  MatPaginator,
  MatSort,
  MatSnackBar,
  MatDialog
} from "@angular/material";
import { debounceTime, distinctUntilChanged, tap, skip } from "rxjs/operators";
import { fromEvent, merge, Subscription } from "rxjs";
import { ToastrService } from "ngx-toastr";
import {
  DeleteEntityDialogComponent,
} from "../../../../../partials/content/crud/index";
import {LayoutUtilsService} from '../../../../../../core/_base/crud/utils/layout-utils.service';
import {ProductEditComponent} from '../product-edit/product-edit.component';
import {ProductDatasource , AddCategoryService,ProductModel} from '../../../../../../core/emi-management/product/index';



@Component({
  selector: 'kt-product-list',
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.scss']
})
export class ProductListComponent implements OnInit, OnDestroy{
  dataSource: ProductDatasource;
  displayedColumns: string[] = ["productImage","sku","productName", "category" ,"subCategory","weight","price","manufacturingCostPerGram","shipping",'hallmarkingPackaging',"action" ];
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild("searchInput", { static: true }) searchInput: ElementRef;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  filterStatus: string = "";
  filterType: string = "";
  selection = new SelectionModel<ProductModel>(true, []);
  positionResult: ProductModel[] = [];
  private subscriptions: Subscription[] = [];
  selectedMemberData: ProductModel[] = [];
  positionData = {
    From: 1,
    To: 50,
    Text: ""
  };
  public spinnerValue: boolean = false;
  public noRecords: boolean;


  constructor(
    public dialog: MatDialog,
    public snackBar: MatSnackBar,
    private AddCategoryService: AddCategoryService,
    private toast: ToastrService,
    private ref: ChangeDetectorRef,
    public layoutUtilsService :LayoutUtilsService,

  ) {}

  ngOnInit() {

    this.dataSource = new ProductDatasource(this.AddCategoryService);
    const entitiesSubscription = this.dataSource.entitySubject
      .pipe(skip(1), distinctUntilChanged())
      .subscribe(res => {
        console.log(res);
        this.positionResult = res;
        if (res.length) {
          this.noRecords = false;
          this.ref.detectChanges();
        } else {
          this.noRecords = true;
          this.ref.detectChanges();
        }
      });
    this.subscriptions.push(entitiesSubscription);
    this.dataSource.getAllProductListData(
      this.positionData.From,
      this.positionData.To,
      this.positionData.Text
    );
  }
  
  
  editCategory(id) {
    const productId = id;
    const dialogRef = this.dialog.open(ProductEditComponent, {
      data: {
        productId,
        title: "editCategoryComponent",
        action: "edit"
      },
      width: "50vw"
    });
    dialogRef.afterClosed().subscribe(res => {
      this.loadProductsPage();
    });
  }


  deleteProduct(id) {

    const _title = 'Delete Product';
    const _description = 'Are you sure to permanently delete this Product?';
    const _waitDesciption = 'Product is deleting...';
    const _deleteMessage = 'Product has been deleted';
    const dialogRef = this.layoutUtilsService.deleteElement(_title, _description, _waitDesciption);
    dialogRef.afterClosed().subscribe(res => {
      if (res) {
        this.AddCategoryService.deleteProduct(id).subscribe(
                  res => {
                    this.toast.success("Success", "Category Deleted Successfully", {
                      timeOut: 3000
                    });
                    this.loadProductsPage();
                  },
                  err => {
                    this.toast.error("Sorry", err["error"]["message"], {
                      timeOut: 3000
                    });
                    this.loadProductsPage();
                  }
                );
      }
    });
  }

  ngAfterViewInit() {
    const searchSubscription = fromEvent(
      this.searchInput.nativeElement,
      "keyup"
    )
      .pipe(
        debounceTime(900),
        distinctUntilChanged(),
        tap(() => {
          this.paginator.pageIndex = 0;
          this.loadProductsPage();
        })
      )
      .subscribe();
    this.subscriptions.push(searchSubscription);

    const paginatorSubscriptions = merge(this.paginator.page)
      .pipe(tap(() => this.loadProductsPage()))
      .subscribe();
    this.subscriptions.push(paginatorSubscriptions);
  }

  loadProductsPage() {
    this.selection.clear();
    if (
      this.paginator.pageIndex < 0 ||
      this.paginator.pageIndex > this.paginator.length / this.paginator.pageSize
    )
      return;
    let from = this.paginator.pageIndex * this.paginator.pageSize + 1;
    let to = (this.paginator.pageIndex + 1) * this.paginator.pageSize;

    this.positionData.From = from;
    this.positionData.To = to;
    this.positionData.Text = this.searchInput.nativeElement.value;
    this.dataSource.getAllProductListData(
      this.positionData.From,
      this.positionData.To,
      this.positionData.Text
    );
    // Send positiondata to getAllCategoryData
    this.selection.clear();
  }
  /*** On Destroy ***/
  ngOnDestroy() {
    this.subscriptions.forEach(el => el.unsubscribe());
  }

  /*** Load Customers List from service through data-source ***/

  clearSearch() {
    this.dataSource.getAllProductListData(
      this.positionData.From,
      this.positionData.To,
      ""
    );
  }
}
