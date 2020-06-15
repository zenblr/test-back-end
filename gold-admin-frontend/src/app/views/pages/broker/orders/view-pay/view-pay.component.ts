import { Component, OnInit, ViewChild } from '@angular/core';
import { ShopService } from '../../../../../core/merchant-broker';
import { ActivatedRoute, Router } from "@angular/router";
import { EmiDetailsService } from "../../../../../core/emi-management/order-management";
import { ToastrComponent } from '../../../../partials/components/toastr/toastr.component';

@Component({
  selector: 'kt-view-pay',
  templateUrl: './view-pay.component.html',
  styleUrls: ['./view-pay.component.scss']
})
export class ViewPayComponent implements OnInit {
  @ViewChild(ToastrComponent, { static: true }) toastr: ToastrComponent;

  orderId: any;
  orderData: any;
  emi = [];
  constructor(
    private shopService: ShopService,
    private route: ActivatedRoute,
    private emiDetailsService: EmiDetailsService,
  ) { }

  ngOnInit() {
    this.orderId = this.route.snapshot.params.id;
    this.shopService.getDetails(this.orderId).subscribe(res => this.orderData = res.orderData)
  }

  selectedEmi(event, id) {
    if (event.checked) {
      this.emi.push(id);
    } else {
      if (this.emi.length > 0) {
        const index = this.emi.indexOf(id);
        if (index > -1) {
          this.emi.splice(index, 1);
        }
      }
    }
  }

  getEmiAmount() {
    let params = {
      emiId: this.emi,
    }
    this.shopService.getEmiAmount(params).subscribe(res => this.payEmi(res.amount))
  }

  payEmi(amount) {
    let params = {
      transactionId: 'TRA' + Date.now(),
      transactionAmount: Number(amount),
      emiId: this.emi,
    }
    this.shopService.emiTransaction(params).subscribe(res => {
      this.ngOnInit();
      this.toastr.successToastr("EMI Paid Successfully");
    },
      error => {
        this.toastr.errorToastr(error.error);
      })
  }

  printEmiReceipt(id) {
    this.emiDetailsService.emiReceipt(id).subscribe();
  }
}
