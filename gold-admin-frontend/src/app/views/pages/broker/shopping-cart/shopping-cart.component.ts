import { Component, OnInit, ViewChild, ChangeDetectorRef } from '@angular/core';
import { ToastrComponent } from '../../../partials/components/toastr/toastr.component';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { SharedService } from '../../../../core/shared/services/shared.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ShoppingCartService } from '../../../../core/merchant-broker';
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
    this.shoppingCartService.getCart().subscribe(res => this.cartData = res);
  }

  removeCartItem(cartId) {
    const _title = 'Delete Cart Item';
    const _description = 'Are you sure you want to delete this cart item?';
    const _waitDesciption = 'Cart Item is deleting...';
    const _deleteMessage = `Cart Item has been deleted`;

    const dialogRef = this.layoutUtilsService.deleteElement(_title, _description, _waitDesciption);
    dialogRef.afterClosed().subscribe(res => {
      if (res) {
        console.log(res);
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
        if (res) {
          this.getCart();
        }
      });
    }
  }

  checkoutCart() {
    // this.shoppingCartService.getCheckoutCart().subscribe(res => {
    //   if (res && res.blockId) {
    //     const blockData = {
    //       blockId: res.blockId
    //     }
    //     this.shoppingCartService.orderVerifyBlock(blockData).subscribe(res => {
    //       if (res) {
    //         this.router.navigate(['/broker/checkout-customer-address']);
    //       }
    //     });
    //   }
    // });
    this.router.navigate(['/broker/checkout-customer-address']);
  }

  redirectToShop() {
    this.router.navigate(['/broker/shop']);
  }

  updateInput(event) {
    console.log(event);

  }
}
