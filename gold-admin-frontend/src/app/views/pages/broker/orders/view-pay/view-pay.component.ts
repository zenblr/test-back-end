import { Component, OnInit } from '@angular/core';
import { ShopService } from '../../../../../core/merchant-broker';
import { ActivatedRoute, Router } from "@angular/router";
import { EmiDetailsService } from "../../../../../core/emi-management/order-management";
@Component({
  selector: 'kt-view-pay',
  templateUrl: './view-pay.component.html',
  styleUrls: ['./view-pay.component.scss']
})
export class ViewPayComponent implements OnInit {
  orderId: any;
  orderData: any;
  constructor(
    private shopService: ShopService,
    private route: ActivatedRoute,
    private emiDetailsService: EmiDetailsService,
  ) { }

  ngOnInit() {
    this.orderId = this.route.snapshot.params.id;
    this.shopService.getDetails(this.orderId).subscribe(res => this.orderData = res.orderData)
  }

  getEmiAmount(id) {
    let params = {
      emiId: [id]
    }
    this.shopService.getEmiAmount(params).subscribe(res => this.payEmi(res.amount, id))
  }

  payEmi(amount, id) {
    let params = {
      transactionId: 'TRA' + Date.now(),
      transactionAmount: Number(amount),
      emiId: [id]
    }
    this.shopService.emiTransaction(params).subscribe(res => {
      this.ngOnInit()
    })
  }

  printEmiReceipt(id) {
    this.emiDetailsService.emiReceipt(id).subscribe();
  }
}
