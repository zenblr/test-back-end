import { Component, OnInit } from '@angular/core';
import { ShopService } from '../../../../core/merchant-broker/index';
@Component({
  selector: 'kt-shop',
  templateUrl: './shop.component.html',
  styleUrls: ['./shop.component.scss']
})
export class ShopComponent implements OnInit {
  toogler: string;
  subCategory: any;
  constructor(
    private shopService: ShopService
  ) {
    this.shopService.toggle$.subscribe(res => {
      this.toogler = res;
    })
  }

  ngOnInit() {
    this.getSubCategory();
    this.getProducts();

  }

  getSubCategory() {
    this.shopService.getSubCategory().subscribe(res => {
      this.subCategory = res;
    })
  }

  getProducts() {
    let subCategoryId = '';
    this.shopService.getProduct(subCategoryId).subscribe()
  }
}
