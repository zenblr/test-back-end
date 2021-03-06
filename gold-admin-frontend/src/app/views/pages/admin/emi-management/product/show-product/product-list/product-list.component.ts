import {
	Component,
	OnInit,
	ViewChild,
	ElementRef,
	OnDestroy,
	ChangeDetectorRef,
} from "@angular/core";
import {
	LayoutUtilsService,
	QueryParamsModel,
} from "../../../../../../../core/_base/crud";
import {
	MatSnackBar,
	MatDialog,
	MatPaginator,
	MatSort,
} from "@angular/material";
import {
	ProductDatasource,
	ProductService,
	ProductModel,
} from "../../../../../../../core/emi-management/product";
import { Subscription, merge, fromEvent, Subject, Observable } from "rxjs";
import {
	tap,
	debounceTime,
	distinctUntilChanged,
	skip,
	takeUntil,
} from "rxjs/operators";
import { ProductEditComponent } from "../product-edit/product-edit.component";
import { ToastrComponent } from "../../../../../../partials/components/toastr/toastr.component";
import { DataTableService } from "../../../../../../../core/shared/services/data-table.service";
import { SharedService } from '../../../../../../../core/shared/services/shared.service';
@Component({
	selector: "kt-product-list",
	templateUrl: "./product-list.component.html",
	styleUrls: ["./product-list.component.scss"],
})
export class ProductListComponent implements OnInit, OnDestroy {
	dataSource: ProductDatasource;
	@ViewChild(ToastrComponent, { static: true }) toastr: ToastrComponent;
	displayedColumns = [
		"productImage",
		"sku",
		"productName",
		"category",
		"subCategory",
		"weight",
		"price",
		"manufacturingCostPerGram",
		"shipping",
		"hallmarkingPackaging",
		"action",
	];
	@ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
	@ViewChild("sort1", { static: true }) sort: MatSort;
	// Filter fields
	@ViewChild("searchInput", { static: true }) searchInput: ElementRef;
	productResult: ProductModel[] = [];
	// Subscriptions
	private subscriptions: Subscription[] = [];
	private destroy$ = new Subject();
	private unsubscribeSearch$ = new Subject();
	searchValue = "";
	productData = {
		from: 0,
		to: 0,
		search: "",
		categoryId: 0,
		subCategoryId: 0,
		priceFrom: 0,
		priceTo: 0,
		order: false,
	};
	filteredDataList = {};
	sortImg = "../../../../../../../../assets/media/icons/sort.svg";
	sortType: number = 1;
	constructor(
		public dialog: MatDialog,
		public snackBar: MatSnackBar,
		private productService: ProductService,
		private ref: ChangeDetectorRef,
		public layoutUtilsService: LayoutUtilsService,
		private dataTableService: DataTableService,
		private sharedService: SharedService,
	) {
		this.productService.applyFilter$
			.pipe(takeUntil(this.destroy$))
			.subscribe((res) => {
				if (Object.entries(res).length) {
					this.applyFilter(res);
				}
			});
	}

	ngOnInit() {
		// If the user changes the sort order, reset back to the first page.
		const sortSubscription = this.sort.sortChange.subscribe(
			() => (this.paginator.pageIndex = 0)
		);
		this.subscriptions.push(sortSubscription);

		/* Data load will be triggered in two cases:
		- when a pagination event occurs => this.paginator.page
		- when a sort event occurs => this.sort.sortChange
		**/
		const paginatorSubscriptions = merge(
			this.sort.sortChange,
			this.paginator.page
		)
			.pipe(
				tap(() => {
					this.loadProductsPage();
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
		//     this.loadProductsPage();
		//   })
		// )
		//   .subscribe();
		// this.subscriptions.push(searchSubscription);

		const searchSubscription = this.dataTableService.searchInput$
			.pipe(takeUntil(this.unsubscribeSearch$))
			.subscribe((res) => {
				this.searchValue = res;
				this.paginator.pageIndex = 0;
				this.loadProductsPage();
			});

		// Init DataSource
		this.dataSource = new ProductDatasource(this.productService);
		const entitiesSubscription = this.dataSource.entitySubject
			.pipe(skip(1), distinctUntilChanged())
			.subscribe((res) => {
				this.productResult = res;
			});
		this.subscriptions.push(entitiesSubscription);
		this.dataSource.loadProducts(this.productData);
	}

	editCategory(id) {
		const productId = id;
		const dialogRef = this.dialog.open(ProductEditComponent, {
			data: {
				productId,
				title: "editCategoryComponent",
				action: "edit",
			},
			width: "50vw",
		});
		dialogRef.afterClosed().subscribe((res) => {
			this.loadProductsPage();
		});
	}

	editProduct(product) {
		// console.log(product);
		const dialogRef = this.dialog.open(ProductEditComponent, {
			data: { productId: product.id, action: "edit" },
			width: "550px",
		});
		dialogRef.afterClosed().subscribe((res) => {
			if (res) {
				this.loadProductsPage();
			}
		});
	}

	deleteProduct(product) {
		const _title = "Delete Product";
		const _description = "Are you sure to permanently delete this product?";
		const _waitDesciption = "Product is deleting...";
		const _deleteMessage = `Product has been deleted`;

		const dialogRef = this.layoutUtilsService.deleteElement(
			_title,
			_description,
			_waitDesciption
		);
		dialogRef.afterClosed().subscribe((res) => {
			if (res) {
				// console.log(res);
				this.productService.deleteProduct(product.id).subscribe(
					(successDelete) => {
						this.toastr.successToastr(_deleteMessage);
						this.loadProductsPage();
					},
					(errorDelete) => {
						this.toastr.errorToastr(errorDelete.error.message);
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

	loadProductsPage() {
		if (
			this.paginator.pageIndex < 0 ||
			this.paginator.pageIndex >
			this.paginator.length / this.paginator.pageSize
		)
			return;
		let from = this.paginator.pageIndex * this.paginator.pageSize + 1;
		let to = (this.paginator.pageIndex + 1) * this.paginator.pageSize;
		this.productData.from = from;
		this.productData.to = to;
		this.productData.search = this.searchValue;
		this.dataSource.loadProducts(this.productData);
	}

	viewProduct(product) {
		const dialogRef = this.dialog.open(ProductEditComponent, {
			data: { productId: product.id, action: "view" },
			width: "550px",
		});
		dialogRef.afterClosed().subscribe((res) => {
			if (res) {
				// console.log(res);
			}
		});
	}

	sortSku() {
		this.sortType += 1;
		if (this.sortType % 2 == 0) {
			this.sortImg = "../../../../../../../../assets/media/icons/sort (1).svg";
			this.productData.order = true;
			this.dataSource.loadProducts(this.productData);

		} else {
			this.sortImg = "../../../../../../../../assets/media/icons/sort.svg";
			this.productData.order = false;
			this.dataSource.loadProducts(this.productData);

		}
	}

	applyFilter(data) {
		// console.log(data);
		this.productData.categoryId = data.data.category;
		this.productData.subCategoryId = data.data.subCategory;
		this.productData.priceFrom = data.data.priceFrom;
		this.productData.priceTo = data.data.priceTo;
		this.dataSource.loadProducts(this.productData);
		this.filteredDataList = data.list;
	}

	/*** On Destroy ***/
	ngOnDestroy() {
		this.subscriptions.forEach((el) => el.unsubscribe());
		this.destroy$.next();
		this.destroy$.complete();
		this.unsubscribeSearch$.next();
		this.unsubscribeSearch$.complete();
		this.productService.applyFilter.next({});
		this.sharedService.closeFilter.next(true);
	}
}
