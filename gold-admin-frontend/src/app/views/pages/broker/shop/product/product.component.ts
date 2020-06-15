import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from "@angular/router";
import { ShopService } from '../../../../../core/merchant-broker/shop/shop.service';
import { ToastrComponent } from "../../../../partials/components";

@Component({
  selector: 'kt-product',
  templateUrl: './product.component.html',
  styleUrls: ['./product.component.scss']
})
export class ProductComponent implements OnInit {
  @ViewChild(ToastrComponent, { static: true }) toastr: ToastrComponent;
  productId: any;
  product: any;
  selectedValue: number;
  constructor(
    private route: ActivatedRoute,
    private shopService: ShopService,

  ) { }

  ngOnInit() {
    this.productId = this.route.snapshot.params.id;
    this.shopService.getSingleProduct(this.productId).subscribe(res => {
      this.product = res;
    })
  }

  selectedPayment(event) {
    this.selectedValue = event.srcElement.value;
  }

  action() {
    if (this.selectedValue) {
      let params = {
        productId: this.productId,
        paymentTypeId: this.selectedValue,
      }

      this.shopService.addToCart(params).subscribe(res => {
        this.toastr.successToastr("Added to Cart");
      })

    } else {
      this.toastr.errorToastr("Select 1 Payment Type");
      return;
    }
  }
}
