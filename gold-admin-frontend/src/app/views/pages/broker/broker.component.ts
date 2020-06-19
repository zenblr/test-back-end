import { Component, OnInit, OnDestroy } from '@angular/core';
import { ShoppingCartService } from '../../../core/merchant-broker';

@Component({
  selector: 'kt-broker',
  templateUrl: './broker.component.html',
  styleUrls: ['./broker.component.scss']
})
export class BrokerComponent implements OnInit, OnDestroy {

  constructor(
    private shoppingCartService: ShoppingCartService
  ) { }

  ngOnInit() {
    this.shoppingCartService.getCartCount().subscribe(res => {
      if (res) {
        this.shoppingCartService.cartCount.next(res.cartLength);
      }
    });
  }

  ngOnDestroy() {
    this.shoppingCartService.cartCount.next(0);
  }
}
