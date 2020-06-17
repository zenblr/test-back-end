import { Component, OnInit, ViewChild, ChangeDetectorRef } from '@angular/core';
import { ToastrComponent } from '../../../partials/components/toastr/toastr.component';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { SharedService } from '../../../../core/shared/services/shared.service';
import { ActivatedRoute, Router } from '@angular/router';
import { OrderReceivedService } from '../../../../core/merchant-broker';
import { OrderDetailsService } from "../../../../core/emi-management/order-management/order-details/services/order-details.service";

@Component({
  selector: 'kt-order-received',
  templateUrl: './order-received.component.html',
  styleUrls: ['./order-received.component.scss']
})
export class OrderReceivedComponent implements OnInit {
  @ViewChild(ToastrComponent, { static: true }) toastr: ToastrComponent;
  blockId: any;
  orderDetail: any;

  constructor(
    private ref: ChangeDetectorRef,
    private route: ActivatedRoute,
    private router: Router,
    private orderReceivedService: OrderReceivedService,
    private orderDetailsService: OrderDetailsService,

  ) { }

  ngOnInit() {
    this.blockId = this.route.snapshot.params.id;
    this.getOrderDetailByBlockid();
  }

  getOrderDetailByBlockid() {
    this.orderReceivedService.getOrderDetailByBlockid(this.blockId).subscribe(res => this.orderDetail = res);
  }

  printProforma() {
    for (let i = 0; i < this.orderDetail.orderData.length; i++) {
      this.orderDetailsService.getProforma(this.orderDetail.orderData[i].id).subscribe();
    }
  }

  printContract() {
    for (let i = 0; i < this.orderDetail.orderData.length; i++) {
      this.orderDetailsService.getContract(this.orderDetail.orderData[i].id).subscribe();
    }
  }
}
