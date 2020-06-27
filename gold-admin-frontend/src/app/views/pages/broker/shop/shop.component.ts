import { Component, OnInit, ViewChild, ElementRef, ViewEncapsulation } from '@angular/core';
import { ShopService } from '../../../../core/broker/shop/shop.service';
import { PageEvent, MatPaginator, MatDialog } from '@angular/material';
import { DataTableService } from "../../../../core/shared/services/data-table.service";
import { skip, distinctUntilChanged, tap, takeUntil } from "rxjs/operators";
import { Subject } from 'rxjs';
import { Router } from "@angular/router";
import { ProductComponent } from './product/product.component'

@Component({
  selector: 'kt-shop',
  templateUrl: './shop.component.html',
  styleUrls: ['./shop.component.scss'],
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
  };
  searchValue = "";

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild("searchInput", { static: true }) searchInput: ElementRef;
  private unsubscribeSearch$ = new Subject();
  subCategoryCount: any;

  constructor(
    private shopService: ShopService,
    private dataTableService: DataTableService,
    private router: Router,
    public dialog: MatDialog,
  ) {
    this.shopService.toggle$.subscribe(res => {
      this.toogler = res;
    })
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
      this.subCategory = res;
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

  ngOnDestroy() {
    this.shopService.toggle.next('list');
    this.unsubscribeSearch$.next();
    this.unsubscribeSearch$.complete();
  }
}
