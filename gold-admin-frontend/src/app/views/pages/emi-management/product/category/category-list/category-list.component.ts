import { ToastrService } from "ngx-toastr";

import { Component, OnInit, ViewChild, ElementRef, OnDestroy } from '@angular/core';
import { LayoutUtilsService, QueryParamsModel } from '../../../../../../core/_base/crud';
import { MatSnackBar, MatDialog, MatPaginator, MatSort } from '@angular/material';
import { Subscription, merge, fromEvent, Subject } from 'rxjs';
import { tap, debounceTime, distinctUntilChanged, skip, takeUntil } from 'rxjs/operators';
import { ToastrComponent } from '../../../../../../views/partials/components/toastr/toastr.component';
import { DataTableService } from '../../../../../../core/shared/services/data-table.service';
import { CategoryDatasource, CategoryService, CategoryModel } from '../../../../../../core/emi-management/product';
import { CategoryAddComponent } from '../category-add/category-add.component';

@Component({
  selector: 'kt-category-list',
  templateUrl: './category-list.component.html',
  styleUrls: ['./category-list.component.scss']
})
export class CategoryListComponent implements OnInit, OnDestroy {
  dataSource: CategoryDatasource;
  @ViewChild(ToastrComponent, { static: true }) toastr: ToastrComponent;
  displayedColumns = ["categoryName", "conversionFactor", "metalType", "action"];
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild('sort1', { static: true }) sort: MatSort;
  // Filter fields
  @ViewChild('searchInput', { static: true }) searchInput: ElementRef;
  categoryResult: CategoryModel[] = [];
  // Subscriptions
  private subscriptions: Subscription[] = [];
  private destroy$ = new Subject();
  private unsubscribeSearch$ = new Subject();
  searchValue = '';

  constructor(
    public dialog: MatDialog,
    public snackBar: MatSnackBar,
    private layoutUtilsService: LayoutUtilsService,
    private categoryService: CategoryService,
    private dataTableService: DataTableService,
    private toast: ToastrService,
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
        this.loadCategoryPage();
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
        this.loadCategoryPage();
      });

    // Init DataSource
    this.dataSource = new CategoryDatasource(this.categoryService);
    const entitiesSubscription = this.dataSource.entitySubject.pipe(
      skip(1),
      distinctUntilChanged()
    ).subscribe(res => {
      this.categoryResult = res;
    });
    this.subscriptions.push(entitiesSubscription);
    this.dataSource.loadCategories(1, 25, this.searchValue);
  }

  loadCategoryPage() {
    if (this.paginator.pageIndex < 0 || this.paginator.pageIndex > (this.paginator.length / this.paginator.pageSize))
      return;
    let from = ((this.paginator.pageIndex * this.paginator.pageSize) + 1);
    let to = ((this.paginator.pageIndex + 1) * this.paginator.pageSize);

    this.dataSource.loadCategories(from, to, this.searchValue);
  }

  addCategory() {
    const dialogRef = this.dialog.open(CategoryAddComponent, {
      data: { title: "AddCategoryComponent", action: "add" },
      width: "50vw"
    });
    dialogRef.afterClosed().subscribe(res => {
      this.loadCategoryPage();
    });
  }

  editCategory(id) {
    const categoryId = id;
    const dialogRef = this.dialog.open(CategoryAddComponent, {
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

  deleteCategory(id) {
    const _title = 'Delete Category';
    const _description = 'Are you sure to permanently delete this Category?';
    const _waitDesciption = 'Category is deleting...';
    const _deleteMessage = 'Category has been deleted';

    const dialogRef = this.layoutUtilsService.deleteElement(_title, _description, _waitDesciption);
    dialogRef.afterClosed().subscribe(res => {
      if (res) {
        this.categoryService.deleteCategory(id).subscribe(
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
            this.loadCategoryPage();
          }
        );

      }

    });
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
