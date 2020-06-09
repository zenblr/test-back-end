import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { ShopService } from '../../../../core/merchant-broker/index';
import { PageEvent, MatPaginator } from '@angular/material';
import { DataTableService } from "../../../../core/shared/services/data-table.service";
import { skip, distinctUntilChanged, tap, takeUntil } from "rxjs/operators";
import { Subject } from 'rxjs';

@Component({
  selector: 'kt-shop',
  templateUrl: './shop.component.html',
  styleUrls: ['./shop.component.scss']
})
export class ShopComponent implements OnInit {
  toogler: string;
  subCategory: any;
  products: any;
  selectedSubCategoryId: any;
  count: number;
  productsData = {
    from: 1,
    to: 25,
    search: "",
    orderemistatus: "",
  };
  searchValue = "";

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild("searchInput", { static: true }) searchInput: ElementRef;
  private unsubscribeSearch$ = new Subject();

  constructor(
    private shopService: ShopService,
    private dataTableService: DataTableService,

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
        this.getProducts();
      });
  }

  getSubCategory() {
    this.shopService.getSubCategory().subscribe(res => {
      this.subCategory = res;
    })
  }

  getProducts() {
    this.shopService.getProduct(this.productsData).subscribe(res => {
      this.products = res.data;
      this.count = res.count;
    })
  }

  selectedSubCategory(id) {
    this.selectedSubCategoryId = id;
    this.getProducts();
  }

  getServerData(event?: PageEvent) {
    console.log(event);
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

  action(event) {

  }
}
