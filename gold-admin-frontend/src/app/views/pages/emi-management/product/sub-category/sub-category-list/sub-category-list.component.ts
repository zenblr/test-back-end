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
import {SubCategoryAddEditComponent} from '../sub-category-add-edit/sub-category-add-edit.component';
import {SubCategoryDatasource , SubCategoryService,SubCategoryModel} from '../../../../../../core/emi-management/product/index';



@Component({
  selector: 'kt-sub-category-list',
  templateUrl: './sub-category-list.component.html',
  styleUrls: ['./sub-category-list.component.scss']
})
export class SubCategoryListComponent implements OnInit, OnDestroy {
  dataSource: SubCategoryDatasource;
  displayedColumns: string[] = ["subCategoryName","categoryName", "action"];
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild("searchInput", { static: true }) searchInput: ElementRef;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  filterStatus: string = "";
  filterType: string = "";
  selection = new SelectionModel<SubCategoryModel>(true, []);
  positionResult: SubCategoryModel[] = [];
  private subscriptions: Subscription[] = [];
  selectedMemberData: SubCategoryModel[] = [];
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
    private SubCategoryService: SubCategoryService,
    private toast: ToastrService,
    private ref: ChangeDetectorRef,
    public layoutUtilsService :LayoutUtilsService,

  ) {}

  ngOnInit() {
  
    this.dataSource = new SubCategoryDatasource(this.SubCategoryService);
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
    this.dataSource.getAllSubCategoryData(
      this.positionData.From,
      this.positionData.To,
      this.positionData.Text
    );
  }
  addSubCategory() {
    const dialogRef = this.dialog.open(SubCategoryAddEditComponent, {
      data: { title: "SubCategoryListComponent", action: "add" },
      width: "50vw"
    });
    dialogRef.afterClosed().subscribe(res => {
      this.loadSubCategoryPage();
    });
  }

  editSubCategory(id) {
    const subCategoryId = id;
    const dialogRef = this.dialog.open(SubCategoryAddEditComponent, {
      data: {
        subCategoryId,
        title: "SubCategoryListComponent",
        action: "edit"
      },
      width: "50vw"
    });
    dialogRef.afterClosed().subscribe(res => {
      this.loadSubCategoryPage();
    });
  }


  deleteSubCategory(id) {

    const _title = 'Delete Sub-Category';
    const _description = 'Are you sure to permanently delete this Sub-Category?';
    const _waitDesciption = 'Sub-Category is deleting...';
    const _deleteMessage = 'Sub-Category has been deleted';

    const dialogRef = this.layoutUtilsService.deleteElement(_title, _description, _waitDesciption);
    dialogRef.afterClosed().subscribe(res => {
      if (res) {
        this.SubCategoryService.deleteSubCategory(id).subscribe(
                  res => {
                    this.toast.success("Success", "Sub-Category Deleted Successfully", {
                      timeOut: 3000
                    });
                    this.loadSubCategoryPage();
                  },
                  err => {
                    this.toast.error("Sorry", err["error"]["message"], {
                      timeOut: 3000
                    });
                    this.loadSubCategoryPage();
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
          this.loadSubCategoryPage();
        })
      )
      .subscribe();
    this.subscriptions.push(searchSubscription);

    const paginatorSubscriptions = merge(this.paginator.page)
      .pipe(tap(() => this.loadSubCategoryPage()))
      .subscribe();
    this.subscriptions.push(paginatorSubscriptions);
  }

  loadSubCategoryPage() {
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
    this.dataSource.getAllSubCategoryData(
      this.positionData.From,
      this.positionData.To,
      this.positionData.Text
    );
    // Send positiondata to getAllSubCategoryData
    this.selection.clear();
  }
  /*** On Destroy ***/
  ngOnDestroy() {
    this.subscriptions.forEach(el => el.unsubscribe());
  }

  /*** Load Customers List from service through data-source ***/

  clearSearch() {
    this.dataSource.getAllSubCategoryData(
      this.positionData.From,
      this.positionData.To,
      ""
    );
  }
}

