import { Component, OnInit, ViewChild, Inject, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router } from "@angular/router";
import { ShopService } from '../../../../../core/broker/shop/shop.service';
import { ToastrComponent } from "../../../../partials/components";
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';


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
  imageArray = [];
  constructor(
    public dialogRef: MatDialogRef<ProductComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private route: ActivatedRoute,
    private shopService: ShopService,
    private router: Router,
    private ref: ChangeDetectorRef,
  ) { }

  ngOnInit() {
    this.ref.detectChanges();
    if (this.data.productId) {
      this.productId = this.data.productId;
    } else {
      this.productId = this.route.snapshot.params.id;
    }
    this.shopService.getSingleProduct(this.productId).subscribe(res => {
      this.product = res;
      if (this.product.productImage != 0) {
        const imageUrl = { URL: this.product.productImage }
        this.imageArray.push(imageUrl);
      }
      if (this.product.productImages.length) {
        for (let i = 0; i < this.product.productImages.length; i++) {
          this.imageArray.push(this.product.productImages[i])
        }
      }
      this.ref.detectChanges();
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
        if (this.data.productId) {
          this.dialogRef.close();
        }
        this.router.navigate(['/broker/cart']);
      });

    } else {
      this.toastr.errorToastr("Select a Payment Type");
      return;
    }
  }
}
