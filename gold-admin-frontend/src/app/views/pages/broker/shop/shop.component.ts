import { Component, OnInit, ViewChild, ElementRef, ViewEncapsulation } from '@angular/core';
import { ShopService } from '../../../../core/broker/shop/shop.service';
import { PageEvent, MatPaginator, MatDialog } from '@angular/material';
import { DataTableService } from "../../../../core/shared/services/data-table.service";
import { skip, distinctUntilChanged, tap, takeUntil } from "rxjs/operators";
import { Subject } from 'rxjs';
import { Router } from "@angular/router";
import { ProductComponent } from './product/product.component';
import { TitleCasePipe } from '@angular/common';

@Component({
  selector: 'kt-shop',
  templateUrl: './shop.component.html',
  styleUrls: ['./shop.component.scss'],
  providers: [TitleCasePipe],
  encapsulation: ViewEncapsulation.None
})
export class ShopComponent implements OnInit {
  toogler: string;
  subCategory: any;
  products: any;
  count: number;
  productsData = {
    from: 1,
    to: 25,
    search: "",
    subCategoryId: "",
    sort: "productPriceDesc",
  };
  searchValue = "";
  sortType: string;
  sortValue: string;
  private destroy$ = new Subject();
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild("searchInput", { static: true }) searchInput: ElementRef;
  private unsubscribeSearch$ = new Subject();
  subCategoryCount: any;

  constructor(
    private shopService: ShopService,
    private dataTableService: DataTableService,
    private router: Router,
    public dialog: MatDialog,
    private titlecasePipe: TitleCasePipe
  ) {
    this.shopService.toggle$.subscribe(res => {
      this.toogler = res;
    })

    this.shopService.sortType$.pipe(takeUntil(this.destroy$)).subscribe((res) => {
      if (res) {
        this.sortType = res;
        this.sort();
      }
    });

    this.shopService.sortValue$.pipe(takeUntil(this.destroy$)).subscribe((res) => {
      if (res) {
        this.sortValue = res;
        this.sort();
      }
    });
  }

  ngOnInit() {
    this.getSubCategory();
    this.getProducts();
    const searchSubscription = this.dataTableService.searchInput$
      .pipe(takeUntil(this.unsubscribeSearch$))
      .subscribe((res) => {
        this.searchValue = res;
        this.paginator.pageIndex = 0;
        this.getServerData();
      });
  }

  getSubCategory() {
    this.shopService.getSubCategory().subscribe(res => {
      this.subCategory = res.data;
      this.totalCount()
    })
  }

  totalCount() {
    let count = 0;
    for (let i = 0; i < this.subCategory.length; i++) {
      count = count + Number(this.subCategory[i].count);
    }
    this.subCategoryCount = count;
  }

  getProducts() {
    this.shopService.getProduct(this.productsData).subscribe(res => {
      this.products = res.data;
      this.count = res.count;
    })
  }

  selectedSubCategory(id) {
    this.productsData.subCategoryId = id;
    this.paginator.pageIndex = 0;
    this.getServerData();
  }

  getServerData(event?: PageEvent) {
    if (
      this.paginator.pageIndex < 0 ||
      this.paginator.pageIndex >
      this.paginator.length / this.paginator.pageSize
    )
      return;
    let from = this.paginator.pageIndex * this.paginator.pageSize + 1;
    let to = (this.paginator.pageIndex + 1) * this.paginator.pageSize;
    this.productsData.from = from;
    this.productsData.to = to;
    this.productsData.search = this.searchValue;
    this.getProducts();
  }

  action(id) {
    this.router.navigate(["/broker/shop/product/", id]);
  }

  view(id) {
    const dialogRef = this.dialog.open(ProductComponent, {
      data: { productId: id, action: "view" },
      width: "80%",
    });
    dialogRef.afterClosed().subscribe((res) => {
      if (res) {
        console.log(res);
      }
    });
  }

  sort() {
    if (this.sortValue && this.sortType) {
      this.productsData.sort = 'product' + this.titlecasePipe.transform(this.sortValue) + this.titlecasePipe.transform(this.sortType);
    } else if ((this.sortValue == '' || this.sortValue == undefined) && this.sortType) {
      this.productsData.sort = 'productPrice' + this.titlecasePipe.transform(this.sortType);
    } else if (this.sortValue && (this.sortType == '' || this.sortType == undefined)) {
      this.productsData.sort = 'product' + this.titlecasePipe.transform(this.sortValue) + 'Desc';
    }
    this.getProducts();
  }

  ngOnDestroy() {
    this.shopService.toggle.next('list');
    this.destroy$.next();
    this.destroy$.complete();
    this.unsubscribeSearch$.next();
    this.unsubscribeSearch$.complete();
    this.shopService.sortType.next('');
    this.shopService.sortValue.next('');
  }
}
