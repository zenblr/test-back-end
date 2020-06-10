import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from "@angular/router";
import { ShopService } from '../../../../../core/merchant-broker/shop/shop.service';

@Component({
  selector: 'kt-product',
  templateUrl: './product.component.html',
  styleUrls: ['./product.component.scss']
})
export class ProductComponent implements OnInit {
  productId: any;
  product: any;
  constructor(
    private route: ActivatedRoute,
    private shopService: ShopService,

  ) { }

  ngOnInit() {
    this.productId = this.route.snapshot.params.id;
    this.shopService.getSingleProduct(this.productId).subscribe(res => {
      this.product = res
    })
  }

  action() {
    return
  }
}
