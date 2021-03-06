import { Component, OnInit, ViewChild, ChangeDetectorRef } from '@angular/core';
import { ToastrComponent } from '../../../partials/components/toastr/toastr.component';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { SharedService } from '../../../../core/shared/services/shared.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ShoppingCartService } from '../../../../core/broker';
import { LayoutUtilsService } from '../../../../core/_base/crud';

@Component({
  selector: 'kt-shopping-cart',
  templateUrl: './shopping-cart.component.html',
  styleUrls: ['./shopping-cart.component.scss']
})
export class ShoppingCartComponent implements OnInit {
  @ViewChild(ToastrComponent, { static: true }) toastr: ToastrComponent;
  cartData: any;

  constructor(
    private fb: FormBuilder,
    private sharedService: SharedService,
    private ref: ChangeDetectorRef,
    private route: ActivatedRoute,
    private router: Router,
    private shoppingCartService: ShoppingCartService,
    private layoutUtilsService: LayoutUtilsService,
  ) { }

  ngOnInit() {
    this.getCart();
  }

  getCart() {
    this.shoppingCartService.getCart().subscribe(res => {
      this.cartData = res;
      if (this.cartData.allCartData.length) {
        for (const iterator of this.cartData.allCartData) {
          iterator.showUpdateQuantity = false;
        }
      }
      this.shoppingCartService.cartCount.next(res.allCartData.length);
    });
  }

  removeCartItem(cartId) {
    const _title = 'Remove Cart Item';
    const _description = 'Are you sure you want to remove this cart item?';
    const _waitDesciption = 'Cart Item is removing...';
    const _deleteMessage = `Cart Item has been removed`;

    const dialogRef = this.layoutUtilsService.deleteElement(_title, _description, _waitDesciption);
    dialogRef.afterClosed().subscribe(res => {
      console.log(res);
      if (res) {
        this.shoppingCartService.deleteCartItem(cartId).subscribe(successDelete => {
          this.toastr.successToastr(_deleteMessage);
          this.getCart();
        },
          errorDelete => {
            this.toastr.errorToastr(errorDelete.error.message);
          });
      }
    });
  }

  updateQuantity(cartItem) {
    if (cartItem.quantity) {
      const qtydata = {
        quantity: parseInt(cartItem.quantity)
      }
      this.shoppingCartService.updateCartItemQuantity(cartItem.cartId, qtydata).subscribe(res => {
        this.getCart();
      });
    }
  }

  checkoutCart() {
    this.router.navigate(['/broker/checkout-customer-address']);
  }

  redirectToShop() {
    this.router.navigate(['/broker/shop']);
  }

  updateInput(event, cartItem) {
    console.log(event);
    cartItem.showUpdateQuantity = true;
  }
}
