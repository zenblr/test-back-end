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
} from "../../../../partials/content/crud/index";
import {LayoutUtilsService} from '../../../../../core/_base/crud/utils/layout-utils.service';
import {AddEditCategoryComponent} from './add-edit-category/add-edit-category.component';
import {AddCategoryDatasource , AddCategoryService,AddCategoryModel} from '../../../../../core/emi-management/product/index';



@Component({
  selector: 'kt-category',
  templateUrl: './category.component.html',
  styleUrls: ['./category.component.scss']
})
export class CategoryComponent implements OnInit, OnDestroy {
  dataSource: AddCategoryDatasource;
  displayedColumns: string[] = ["categoryName","conversionFactor", "action"];
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild("searchInput", { static: true }) searchInput: ElementRef;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  filterStatus: string = "";
  filterType: string = "";
  selection = new SelectionModel<AddCategoryModel>(true, []);
  positionResult: AddCategoryModel[] = [];
  private subscriptions: Subscription[] = [];
  selectedMemberData: AddCategoryModel[] = [];
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

    this.dataSource = new AddCategoryDatasource(this.AddCategoryService);
    const entitiesSubscription = this.dataSource.entitySubject
      .pipe(skip(1), distinctUntilChanged())
      .subscribe(res => {
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
    this.dataSource.getAllCategoryData(
      this.positionData.From,
      this.positionData.To,
      this.positionData.Text
    );
  }
  addCategory() {
    const dialogRef = this.dialog.open(AddEditCategoryComponent, {
      data: { title: "AddCategoryComponent", action: "add" },
      width: "50vw"
    });
    dialogRef.afterClosed().subscribe(res => {
      this.loadCategoryPage();
    });
  }

  editCategory(id) {
    const categoryId = id;
    const dialogRef = this.dialog.open(AddEditCategoryComponent, {
      data: {
        categoryId,
        title: "AddCategoryComponent",
        action: "edit"
      },
      width: "50vw"
    });
    dialogRef.afterClosed().subscribe(res => {
      this.loadCategoryPage();
    });
  }

  // deleteCategory(idd, categoryNamee) {
  //   let id = idd;
  //   let categoryName = categoryNamee;
  //   const dialogRef = this.dialog.open(DeleteEntityDialogComponent, {
  //     data: {
  //       id,
  //       title: "AddCategoryComponent",
  //       name: categoryName
  //     },
  //     width: "40vw"
  //   });
  //   dialogRef.afterClosed().subscribe(res => {
  //     let status = res;
  //     this.spinnerValue = true;
  //     this.ref.detectChanges();
  //     if (status == "delete") {
  //       this.AddCategoryService.deleteCategory(id).subscribe(
  //         res => {
  //           this.spinnerValue = false;
  //           this.ref.detectChanges();
  //           this.toast.success("Success", "Category Deleted Successfully", {
  //             timeOut: 3000
  //           });
  //           this.dataSource.getAllCategoryData(
  //             this.positionData.From,
  //             this.positionData.To,
  //             this.positionData.Text
  //           );
  //         },
  //         err => {
  //           this.spinnerValue = false;
  //           this.ref.detectChanges();
  //           this.toast.error("Sorry", err["error"]["message"], {
  //             timeOut: 3000
  //           });
  //         }
  //       );
  //     } else {
  //       this.spinnerValue = false;
  //       this.ref.detectChanges();
  //     }
  //   });
  // }

  deleteCategory(id) {

    const _title = 'Delete Category';
    const _description = 'Are you sure to permanently delete this Category?';
    const _waitDesciption = 'Category is deleting...';
    const _deleteMessage = 'Category has been deleted';

    const dialogRef = this.layoutUtilsService.deleteElement(_title, _description, _waitDesciption);
    dialogRef.afterClosed().subscribe(res => {
      if (res) {
        this.AddCategoryService.deleteCategory(id).subscribe(
                  res => {


                    this.toast.success("Success", "Category Deleted Successfully", {
                      timeOut: 3000
                    });
                    this.loadCategoryPage();
                  },
                  err => {


                    this.toast.error("Sorry", err["error"]["message"], {
                      timeOut: 3000
                    });
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
          this.loadCategoryPage();
        })
      )
      .subscribe();
    this.subscriptions.push(searchSubscription);

    const paginatorSubscriptions = merge(this.paginator.page)
      .pipe(tap(() => this.loadCategoryPage()))
      .subscribe();
    this.subscriptions.push(paginatorSubscriptions);
  }

  loadCategoryPage() {
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
    this.dataSource.getAllCategoryData(
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
    this.dataSource.getAllCategoryData(
      this.positionData.From,
      this.positionData.To,
      ""
    );
  }
}
