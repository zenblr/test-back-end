import { Component, OnInit, ViewChild, ChangeDetectorRef } from '@angular/core';
import { ToastrComponent } from '../../../partials/components/toastr/toastr.component';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { SharedService } from '../../../../core/shared/services/shared.service';
import { ActivatedRoute, Router } from '@angular/router';
import { OrderReceivedService } from '../../../../core/merchant-broker';

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
    private orderReceivedService: OrderReceivedService
  ) { }

  ngOnInit() {
    this.blockId = this.route.snapshot.params.id;
    this.getOrderDetailByBlockid();
  }

  getOrderDetailByBlockid() {
    this.orderReceivedService.getOrderDetailByBlockid(this.blockId).subscribe(res => this.orderDetail = res);
  }

  printProforma() {

  }

  printContract() {

  }
}
